import mongoose from 'mongoose';
import { UTApi } from 'uploadthing/server';
import { connectToDatabase } from '../lib/database';
import FormModel from '../models/form.model';
import FormResponseModel from '../models/response.model';
import EventModel from '../models/event.model';
import type { FileAnswer } from '../types';

function getUTApi() {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) return null;
  return new UTApi({ token });
}

function extractFileKey(fileAns: FileAnswer): string | null {
  if (fileAns.key) return fileAns.key;
  if (!fileAns.url) return null;
  try {
    const urlObj = new URL(fileAns.url);
    const parts = urlObj.pathname.split('/f/');
    if (parts[1]) return parts[1];
  } catch {
    // Ignore URL parse error
  }
  return null;
}

async function main() {
  console.log('--- Starting Storage Retention & Cleanup Routine (UploadThing) ---');
  await connectToDatabase();

  const utapi = getUTApi();
  const now = Date.now();
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // ==========================================
  // PART 1: 90-DAY RESPONSE PURGE + AUTO-CLOSE
  // ==========================================
  console.log(`Checking responses older than 90 days (submitted before ${ninetyDaysAgo.toISOString()})...`);
  const expiredResponses = await FormResponseModel.find({
    submittedAt: { $lt: ninetyDaysAgo },
  }).lean();

  if (expiredResponses.length > 0) {
    console.log(`Found ${expiredResponses.length} expired response(s).`);

    // Group expired responses by formId
    const formGroups: Record<string, typeof expiredResponses> = {};
    for (const r of expiredResponses) {
      if (!formGroups[r.formId]) formGroups[r.formId] = [];
      formGroups[r.formId].push(r);
    }

    // Collect UploadThing file keys to delete
    const fileKeysToDelete: string[] = [];
    for (const r of expiredResponses) {
      for (const a of r.answers || []) {
        if (a.answer && typeof a.answer === 'object' && 'url' in a.answer) {
          const key = extractFileKey(a.answer as FileAnswer);
          if (key) fileKeysToDelete.push(key);
        }
      }
    }

    // Delete files from UploadThing
    if (utapi && fileKeysToDelete.length > 0) {
      console.log(`Deleting ${fileKeysToDelete.length} orphan file(s) from UploadThing...`);
      try {
        await utapi.deleteFiles(fileKeysToDelete);
        console.log('Orphan files deleted from UploadThing.');
      } catch (err) {
        console.error('Failed to delete some files from UploadThing:', err);
      }
    }

    // Process each affected form
    for (const [formId, resps] of Object.entries(formGroups)) {
      const form = await FormModel.findOne({ id: formId });
      if (!form) continue;

      // Delete expired responses for this form
      await FormResponseModel.deleteMany({
        formId,
        submittedAt: { $lt: ninetyDaysAgo },
      });

      // Recalculate remaining count and auto-close the form
      const remainingCount = await FormResponseModel.countDocuments({ formId });
      form.responsesCount = remainingCount;
      form.status = 'archived'; // Auto-close to notify creator
      await form.save();

      // Emit audit event
      await EventModel.create({
        type: 'responses_purged',
        formId: form.id,
        formTitle: form.title,
        userId: form.creatorId,
        metadata: {
          purgedCount: resps.length,
          remainingCount,
          autoClosed: true,
          reason: '90-day retention policy',
        },
        timestamp: new Date(),
      });

      console.log(`Purged ${resps.length} responses for form "${form.title}" (${formId}) and archived it.`);
    }
  } else {
    console.log('No responses older than 90 days found.');
  }

  // ==========================================
  // PART 2: 30-DAY DORMANT / CLOSED FORM PURGE
  // ==========================================
  console.log(`Checking dormant closed/archived forms with no responses in the last 30 days...`);
  const inactiveForms = await FormModel.find({
    $or: [
      { status: 'archived' },
      { closeDate: { $ne: null, $lt: thirtyDaysAgo } },
    ],
  }).lean();

  let purgedDormantFormsCount = 0;

  for (const form of inactiveForms) {
    // Check if any response was submitted in the last 30 days
    const recentResponsesCount = await FormResponseModel.countDocuments({
      formId: form.id,
      submittedAt: { $gte: thirtyDaysAgo },
    });

    if (recentResponsesCount === 0) {
      console.log(`Form "${form.title}" (${form.id}) has been closed with no activity for 30+ days. Purging...`);

      // Find any remaining responses to clean up files
      const remainingResponses = await FormResponseModel.find({ formId: form.id }).lean();
      const filesToRemove: string[] = [];
      for (const r of remainingResponses) {
        for (const a of r.answers || []) {
          if (a.answer && typeof a.answer === 'object' && 'url' in a.answer) {
            const key = extractFileKey(a.answer as FileAnswer);
            if (key) filesToRemove.push(key);
          }
        }
      }

      if (utapi && filesToRemove.length > 0) {
        try {
          await utapi.deleteFiles(filesToRemove);
        } catch (err) {
          console.error('UploadThing delete error on dormant form cleanup:', err);
        }
      }

      // Delete responses, events, and form document
      await FormResponseModel.deleteMany({ formId: form.id });
      await EventModel.deleteMany({ formId: form.id });
      await FormModel.deleteOne({ id: form.id });

      purgedDormantFormsCount++;
    }
  }

  console.log(`Purged ${purgedDormantFormsCount} dormant closed form(s).`);
  console.log('--- Retention & Cleanup routine completed successfully ---');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Retention cleanup failed:', err);
  process.exit(1);
});

import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/database';
import FormModel from '../models/form.model';
import FormResponseModel from '../models/response.model';

async function main() {
  console.log('Connecting to database for legacy forms cleanup...');
  await connectToDatabase();

  console.log('Purging legacy form documents and collections...');
  const deletedResponses = await FormResponseModel.deleteMany({});
  console.log(`Deleted ${deletedResponses.deletedCount} existing response documents.`);

  const deletedForms = await FormModel.deleteMany({});
  console.log(`Deleted ${deletedForms.deletedCount} legacy form documents.`);

  console.log('Re-syncing indexes...');
  await FormModel.syncIndexes();
  await FormResponseModel.syncIndexes();

  console.log('Legacy cleanup completed successfully. Fresh schema initialized.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});

'use server';

import { UTApi } from 'uploadthing/server';
import type { ActionResult, FileAnswer } from '@/types';

export async function uploadFormFile(formData: FormData): Promise<ActionResult<FileAnswer>> {
  try {
    const file = formData.get('file') as File | null;
    const maxSizeBytes = Number(formData.get('maxSizeBytes')) || 10 * 1024 * 1024; // 10MB default

    if (!file) {
      return { success: false, error: 'No file provided', code: 'VALIDATION' };
    }

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      return {
        success: false,
        error: `File size exceeds maximum allowed limit of ${maxMb}MB`,
        code: 'VALIDATION',
      };
    }

    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      return {
        success: false,
        error: 'UploadThing token is not configured in .env',
        code: 'INTERNAL',
      };
    }

    const utapi = new UTApi({ token });
    const response = await utapi.uploadFiles(file);

    if (response.error || !response.data) {
      console.error('UploadThing upload error:', response.error);
      return {
        success: false,
        error: response.error?.message || 'Failed to upload file to storage',
        code: 'INTERNAL',
      };
    }

    const uploaded = response.data;
    const fileUrl = uploaded.ufsUrl || uploaded.url;

    return {
      success: true,
      data: {
        url: fileUrl,
        name: uploaded.name || file.name,
        size: uploaded.size || file.size,
        type: uploaded.type || file.type,
        key: uploaded.key,
      },
      message: 'File uploaded successfully',
    };
  } catch (error) {
    console.error('uploadFormFile error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during file upload',
      code: 'INTERNAL',
    };
  }
}

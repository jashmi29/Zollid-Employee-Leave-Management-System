import path from 'path';
import { getSupabaseClient } from './supabase.js';

export async function uploadAttachmentToSupabase(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const supabase = getSupabaseClient();
  const bucketName = 'leave-documents';

  // Ensure storage bucket exists
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
    }
  } catch (err) {
    console.warn('Note on Supabase storage bucket check:', err);
  }

  const ext = path.extname(originalName);
  const cleanBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
  const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  const filePath = `attachments/${cleanBaseName}_${uniqueSuffix}${ext}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error(`Failed to upload document to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

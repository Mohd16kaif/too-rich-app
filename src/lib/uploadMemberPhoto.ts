import { supabase } from '../supabase';

export const MEMBER_PHOTOS_BUCKET = 'member-photos';

export async function uploadMemberPhoto(
  userId: string,
  base64: string,
  mimeType: string
): Promise<string> {
  const extension =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/gif' ? 'gif' : 'jpg';
  const path = `${userId}/photo.${extension}`;

  const atobFn = (globalThis as { atob?: (input: string) => string }).atob;
  if (!atobFn) {
    throw new Error('Base64 decoding is not supported on this device.');
  }

  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const { error } = await supabase.storage.from(MEMBER_PHOTOS_BUCKET).upload(
    path,
    bytes.buffer as ArrayBuffer,
    { contentType: mimeType, upsert: true }
  );

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  const { data } = supabase.storage.from(MEMBER_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
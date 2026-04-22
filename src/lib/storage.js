import { createClient } from "@/lib/supabase/client";

export const BUCKETS = {
  COMPANY_LOGOS: "company-logos",
  USER_AVATARS: "user-avatars",
  INCIDENT_EVIDENCE: "incident-evidence",
  SYSTEM_ASSETS: "system-assets",
};

/**
 * Upload a file to a Supabase Storage bucket.
 * Returns the public URL or throws on error.
 */
export async function uploadFile(bucket, path, file) {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from a Supabase Storage bucket.
 */
export async function deleteFile(bucket, path) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Build a storage path for an incident evidence file.
 * company_id/incident_id/filename
 */
export function evidencePath(companyId, incidentId, fileName) {
  const ext = fileName.split(".").pop();
  const ts = Date.now();
  return `${companyId}/${incidentId}/${ts}.${ext}`;
}

/**
 * Build a storage path for a company logo.
 */
export function logoPath(companyId, fileName) {
  const ext = fileName.split(".").pop();
  return `${companyId}/logo.${ext}`;
}

/**
 * Build a storage path for a user avatar.
 */
export function avatarPath(userId, fileName) {
  const ext = fileName.split(".").pop();
  return `${userId}/avatar.${ext}`;
}

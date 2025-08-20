// src/services/dufa.ts
import { supabase } from "@/integrations/supabase/client";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";

export type PresignResponse = {
  uploadUrl: string;             // for raw file
  key: string;                   // s3 object key
  sheetUploadUrls?: { name: string; url: string; key: string }[]; // optional if we pre-ask for sheets
};

export const presignForUpload = async (file: File, userEmail: string, datasetName?: string) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const dataset = sanitizeName(datasetName || file.name.replace(/\.[^.]+$/, ''));
  const owner = `dufa_${sanitizeEmail(userEmail)}`;

  const { data, error } = await supabase.functions.invoke<PresignResponse>(
    "dufa-presign",
    { body: { filename: file.name, ext, owner, dataset } }
  );

  if (error) throw error;
  if (!data?.uploadUrl) throw new Error("Could not get an upload URL");
  return data;
};

export const putToPresignedUrl = async (url: string, fileOrBlob: Blob) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: fileOrBlob,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
};

export const triggerAthenaSync = async (owner: string, dataset: string, prefix: string) => {
  // optional (no-op if IAM is not ready)
  await supabase.functions.invoke("dufa-athena-sync", { body: { owner, dataset, prefix } });
};

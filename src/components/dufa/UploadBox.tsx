import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";
import { presignForUpload, putToPresignedUrl, triggerAthenaSync } from "@/services/dufa";

type Props = { onDone?: (info: { owner: string; dataset: string; prefix: string }) => void };

const friendlyError = (e: unknown) =>
  e instanceof Error ? e.message : "No result generated (something went wrong).";

export default function UploadBox({ onDone }: Props) {
  const { user } = useAuth();
  const [isUploading, setUploading] = useState(false);
  const [dataset, setDataset] = useState("");

  const onFile = async (file: File) => {
    if (!user?.email) return alert("Not logged in");
    setUploading(true);
    try {
      const owner = `dufa_${sanitizeEmail(user.email)}`;
      const datasetName = dataset || file.name.replace(/\.[^.]+$/, "");
      const datasetSan = sanitizeName(datasetName);

      // 1) get presigned URL for the raw file
      const presign = await presignForUpload(file, user.email, datasetSan);

      // 2) upload the raw file
      await putToPresignedUrl(presign.uploadUrl, file);

      // 3) If XLSX → split to CSV and upload each sheet
      if (/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        // Upload each sheet as CSV
        for (const sheetName of wb.SheetNames) {
          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
          const blob = new Blob([csv], { type: "text/csv" });

          // ask backend for a presigned URL for this sheet (gives us proper S3 key naming)
          const { data, error } = await window.supabase.functions.invoke<{
            uploadUrl: string; key: string;
          }>("dufa-presign", {
            body: {
              filename: `${datasetSan}__${sanitizeName(sheetName)}.csv`,
              ext: "csv",
              owner,
              dataset: datasetSan,
              kind: "sheet"
            }
          } as any);

          if (error || !data?.uploadUrl) throw new Error(error?.message || "Sheet presign failed");
          await putToPresignedUrl(data.uploadUrl, blob);
        }
      }

      const prefix = `${owner}/${datasetSan}/`; // s3 key prefix (folder)
      // 4) (optional) trigger athena glue sync
      triggerAthenaSync(owner, datasetSan, prefix).catch(() => {});

      onDone?.({ owner, dataset: datasetSan, prefix });
      alert("Upload complete ✅");
    } catch (e) {
      alert(friendlyError(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-viz-light/20 p-4">
      <label className="block text-sm mb-2">Dataset name</label>
      <input
        className="w-full mb-4 rounded-lg px-3 py-2 bg-white/70 dark:bg-viz-medium"
        placeholder="e.g., q2_sales"
        value={dataset}
        onChange={(e) => setDataset(e.target.value)}
      />
      <input
        type="file"
        accept=".csv,.xlsx,.xlsm,.xls"
        onChange={(e) => e.target.files && onFile(e.target.files[0])}
        disabled={isUploading}
      />
      <p className="text-xs text-viz-text-secondary mt-2">
        CSV/XLSX supported. XLSX sheets will be uploaded as separate CSVs.
      </p>
    </div>
  );
}

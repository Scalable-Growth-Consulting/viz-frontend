import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type CsvXlsxUploaderProps = {
  onFileUpload?: (file: File, bucketMessage?: string) => void;
};

const CsvXlsxUploader: React.FC<CsvXlsxUploaderProps> = ({ onFileUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleUpload = async (file: File) => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user.email);

    try {
      setUploading(true);
      const res = await fetch("https://viz-file-upload-286070583332.us-central1.run.app", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("✅ Uploaded to GCS successfully");
        console.log("Upload response:", json);
        onFileUpload?.(file, json.message); // call the callback
      } else {
        toast.error(json.error || "❌ Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className="border-2 border-dashed border-viz-accent rounded-lg p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium cursor-pointer hover:bg-viz-light/10 transition"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
      }}
      style={{ minHeight: "140px", width: "100%" }}
    >
      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        ref={inputRef}
        onChange={onFileChange}
      />
      <div className="text-viz-accent font-semibold mb-2">
        {uploading ? "Uploading..." : "Upload CSV / XLSX"}
      </div>
      <div className="text-viz-text-secondary text-sm">
        Click or drag & drop your file
      </div>
    </div>
  );
};

export default CsvXlsxUploader;


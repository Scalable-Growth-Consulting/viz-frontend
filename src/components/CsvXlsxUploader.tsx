import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type CsvXlsxUploaderProps = {
  onFileUpload?: (file: File, bucketMessage?: string) => void;
  onError?: (error: Error) => void;
};

const CsvXlsxUploader: React.FC<CsvXlsxUploaderProps> = ({ onFileUpload, onError }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleUpload = async (file: File) => {
    if (!user?.email) {
      const error = new Error("User email not found");
      toast.error(error.message);
      onError?.(error);
      return;
    }

    // Validate file type
    const validTypes = ['.csv', '.xlsx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !validTypes.includes(`.${fileExt}`)) {
      const error = new Error("Invalid file type. Please upload a CSV or XLSX file.");
      toast.error(error.message);
      onError?.(error);
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(errorData.error || "Upload failed");
        toast.error(`❌ ${error.message}`);
        onError?.(error);
        return;
      }

      const json = await res.json();
      toast.success("✅ Uploaded to GCS successfully");
      onFileUpload?.(file, json.message);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred");
      console.error("Upload error:", error);
      toast.error(`❌ ${error.message}`);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset input value to allow re-uploading the same file
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    handleUpload(file);
  };

  return (
    <div
      className="border-2 border-dashed border-viz-accent rounded-lg p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium cursor-pointer hover:bg-viz-light/10 transition"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        
        // Reset input value to allow re-uploading the same file
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        
        handleUpload(file);
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


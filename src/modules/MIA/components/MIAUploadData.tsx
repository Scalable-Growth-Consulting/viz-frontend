import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface MIAUploadDataProps {
  onFileUpload?: (file: File, bucketMessage?: string) => void;
}

const MIAUploadData: React.FC<MIAUploadDataProps> = ({ onFileUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      const res = await fetch('https://viz-file-upload-286070583332.us-central1.run.app', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('✅ Uploaded to GCS successfully');
        onFileUpload?.(file, json.message);
      } else {
        toast.error(json.error || '❌ Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="mb-4">
      <Button
        variant="default"
        className="px-6"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Data'}
      </Button>
      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        ref={inputRef}
        onChange={onFileChange}
      />
    </div>
  );
};

export default MIAUploadData;

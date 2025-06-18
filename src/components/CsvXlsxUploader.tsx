import React, { useRef } from 'react';

interface CsvXlsxUploaderProps {
  onFileUpload: (file: File) => void;
}

const CsvXlsxUploader: React.FC<CsvXlsxUploaderProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-viz-accent rounded-lg p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium cursor-pointer hover:bg-viz-light/10 transition"
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{ minHeight: 140 }}
    >
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-viz-accent font-semibold mb-2">Upload CSV or XLSX</div>
      <div className="text-viz-text-secondary text-sm">Click or drag & drop your file here</div>
    </div>
  );
};

export default CsvXlsxUploader; 
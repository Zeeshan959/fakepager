
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:shadow-indigo-200 transition-all duration-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none uppercase tracking-widest"
      >
        <UploadIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Upload Book</span>
        <span className="sm:hidden">Upload</span>
      </button>
    </>
  );
};

export default FileUpload;

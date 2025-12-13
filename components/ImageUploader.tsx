import React, { useCallback, useState } from 'react';
import { UploadIcon, PhotoIcon, CloseIcon } from './ui/Icons';

interface ImageUploaderProps {
  label: string;
  onImageSelected: (base64: string | null) => void;
  selectedImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageSelected, selectedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
            ${isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full mb-3">
            <UploadIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or WEBP</p>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
           <img 
            src={selectedImage} 
            alt="Uploaded preview" 
            className="w-full h-64 object-contain mx-auto"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button
              onClick={clearImage}
              className="bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-lg transform transition hover:scale-105"
             >
                <CloseIcon className="w-5 h-5" />
             </button>
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">Source Image</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

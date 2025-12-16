import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './ui/Icons';

interface ResultCardProps {
  image: GeneratedImage;
}

const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Mobile browsers often struggle with large Data URIs in anchor tags.
      // Converting to a Blob and using createObjectURL is much more reliable.
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nano-banana-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Blob download failed, attempting fallback:", err);
      // Fallback: Try direct Data URI download (works on desktop, might fail on some mobile)
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `nano-banana-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <div className="aspect-square w-full relative bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-white text-sm line-clamp-2 mb-3">{image.prompt}</p>
          <button
            onClick={handleDownload}
            type="button"
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/50 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <DownloadIcon className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
import React from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  Edit3, 
  UploadCloud, 
  Download, 
  Trash2, 
  Loader2,
  Menu,
  X,
  Sparkles,
  BookOpen,
  ChevronRight
} from 'lucide-react';

export const MagicIcon = ({ className }: { className?: string }) => <Wand2 className={className} />;
export const PhotoIcon = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const EditIcon = ({ className }: { className?: string }) => <Edit3 className={className} />;
export const UploadIcon = ({ className }: { className?: string }) => <UploadCloud className={className} />;
export const DownloadIcon = ({ className }: { className?: string }) => <Download className={className} />;
export const DeleteIcon = ({ className }: { className?: string }) => <Trash2 className={className} />;
export const SpinnerIcon = ({ className }: { className?: string }) => <Loader2 className={`animate-spin ${className}`} />;
export const MenuIcon = ({ className }: { className?: string }) => <Menu className={className} />;
export const CloseIcon = ({ className }: { className?: string }) => <X className={className} />;
export const SparklesIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;
export const BookOpenIcon = ({ className }: { className?: string }) => <BookOpen className={className} />;
export const ChevronRightIcon = ({ className }: { className?: string }) => <ChevronRight className={className} />;

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Button from './Button';

interface ImageUploaderProps {
  currentImage: string | null;
  onImageSelect: (file: File) => Promise<void>;
  isUploading: boolean;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}

export default function ImageUploader({
  currentImage,
  onImageSelect,
  isUploading,
  size = 'md',
  shape = 'circle'
}: ImageUploaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Size mapping
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-60 h-60'
  };
  
  // Shape mapping
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Call the parent handler
    await onImageSelect(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const displayImage = previewImage || currentImage;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeMap[size]} ${shapeClass} overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-4`}>
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {displayImage ? (
          <Image 
            src={displayImage}
            alt="Profile" 
            fill
            style={{ objectFit: 'cover' }}
            sizes={size === 'sm' ? '96px' : size === 'md' ? '160px' : '240px'}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-purple-50">
            <svg 
              className={`text-purple-300 ${size === 'sm' ? 'h-12 w-12' : size === 'md' ? 'h-20 w-20' : 'h-28 w-28'}`}
              fill="currentColor" 
              viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />
      
      <Button
        onClick={triggerFileInput}
        variant="secondary"
        disabled={isUploading}
        className="mt-2"
      >
        {currentImage ? 'Change Photo' : 'Upload Photo'}
      </Button>
      
      {previewImage && !isUploading && (
        <p className="text-xs text-gray-500 mt-2">
          Click "Save Changes" to confirm your new profile picture
        </p>
      )}
    </div>
  );
} 
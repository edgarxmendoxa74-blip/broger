import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | undefined) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  className = '' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, uploading, uploadProgress } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      onImageChange(imageUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      try {
        await deleteImage(currentImage);
        onImageChange(undefined);
      } catch (error) {
        console.error('Error removing image:', error);
        // Still remove from UI even if deletion fails
        onImageChange(undefined);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-broger-cream mb-2">Menu Item Image</label>
      
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Menu item preview"
            className="w-full h-48 object-cover rounded-lg border border-broger-line transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            style={{ opacity: 0 }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileSelect}
          className="w-full h-48 border-2 border-dashed border-broger-line rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-broger-orange/60 hover:bg-broger-ash transition-all duration-200"
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-broger-orange mx-auto mb-2"></div>
              <p className="text-sm text-stone-400">Uploading... {uploadProgress}%</p>
              <div className="w-32 bg-broger-line rounded-full h-2 mt-2">
                <div 
                  className="bg-broger-orange h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 text-stone-500 mb-2" />
              <p className="text-sm text-stone-400 mb-1">Click to upload image</p>
              <p className="text-xs text-stone-400">JPEG, PNG, WebP, GIF (max 5MB)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!currentImage && (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-broger-orange text-broger-ink font-semibold rounded-lg hover:bg-broger-glow transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Image</span>
          </button>
          <span className="text-sm text-stone-400">or enter URL below</span>
        </div>
      )}

      {/* URL Input as fallback */}
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">Or enter image URL</label>
        <input
          type="url"
          value={currentImage || ''}
          onChange={(e) => onImageChange(e.target.value || undefined)}
          className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
          placeholder="https://example.com/image.jpg"
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
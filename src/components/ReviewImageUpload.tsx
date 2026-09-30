import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useReviewImageUpload } from '../hooks/useReviewImageUpload';

interface ReviewImageUploadProps {
  currentImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ReviewImageUpload: React.FC<ReviewImageUploadProps> = ({ 
  currentImages, 
  onImagesChange, 
  maxImages = 5 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, uploadProgress } = useReviewImageUpload();
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Limit total images
    const remainingSlots = maxImages - currentImages.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      alert(`You can only upload up to ${maxImages} images total.`);
    }

    // Upload each file
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadingImageIndex(i);
      
      try {
        const imageUrl = await uploadImage(file);
        onImagesChange([...currentImages, imageUrl]);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to upload image');
      }
    }

    setUploadingImageIndex(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const triggerFileSelect = () => {
    if (currentImages.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const remainingSlots = maxImages - currentImages.length;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-broger-cream mb-2">
        Photos (Optional)
      </label>
      
      {/* Existing Images Grid */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Review photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-broger-line"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {currentImages.length < maxImages && (
        <div
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            uploading
              ? 'border-broger-orange bg-broger-orange/10'
              : 'border-broger-line hover:border-broger-orange/60 hover:bg-broger-ash'
          }`}
        >
          {uploading && uploadingImageIndex !== null ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-broger-orange mx-auto mb-2"></div>
              <p className="text-sm text-stone-400">Uploading... {uploadProgress}%</p>
              <div className="w-32 bg-broger-line rounded-full h-2 mt-2 mx-auto">
                <div 
                  className="bg-broger-orange h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-stone-500 mx-auto mb-2" />
              <p className="text-sm text-stone-400 mb-1">
                Click to upload photos
              </p>
              <p className="text-xs text-stone-400">
                JPEG, PNG, WebP, GIF (max 5MB each)
              </p>
              {remainingSlots > 1 && (
                <p className="text-xs text-stone-500 mt-1">
                  {remainingSlots} slots remaining
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || currentImages.length >= maxImages}
      />

      {currentImages.length > 0 && (
        <p className="text-xs text-stone-400">
          {currentImages.length} of {maxImages} photos uploaded
        </p>
      )}
    </div>
  );
};

export default ReviewImageUpload;

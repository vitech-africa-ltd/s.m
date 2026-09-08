import { useState, useRef } from 'react';
import { uploadProfilePhoto, deleteProfilePhoto, getProfilePhoto, validateImageFile, getDefaultAvatar } from '../utils/profilePhoto';
import { toast } from './ui';

interface ProfilePhotoManagerProps {
  userId: string;
  userName: string;
  userHue: number;
  size?: number;
  onPhotoChange?: (photoUrl: string | null) => void;
}

export function ProfilePhotoManager({ 
  userId, 
  userName, 
  userHue, 
  size = 120,
  onPhotoChange 
}: ProfilePhotoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const photo = getProfilePhoto(userId);
  const currentPhotoUrl = photo?.thumbnailUrl || getDefaultAvatar(userName, userHue);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast(validation.error || 'Invalid file', 'err');
      return;
    }

    setIsUploading(true);
    setShowMenu(false);

    try {
      const uploadedPhoto = await uploadProfilePhoto(userId, file);
      if (uploadedPhoto && onPhotoChange) {
        onPhotoChange(uploadedPhoto.thumbnailUrl);
      }
      toast('Profile photo updated successfully');
    } catch (error) {
      toast('Failed to upload photo', 'err');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    deleteProfilePhoto(userId);
    if (onPhotoChange) {
      onPhotoChange(null);
    }
    setShowMenu(false);
    toast('Profile photo removed');
  };

  return (
    <div className="relative inline-block">
      {/* Photo Container */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img
          src={currentPhotoUrl}
          alt={userName}
          className="rounded-full object-cover border-4 border-ink-100 dark:border-ink-800 group-hover:border-cobalt-400 transition-colors"
          style={{ width: size, height: size }}
        />
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 rounded-full bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <span className="text-white text-2xl animate-spin">⚙️</span>
          ) : (
            <span className="text-white text-2xl">📷</span>
          )}
        </div>

        {/* Status Indicator */}
        {photo && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-ink-900"></div>
        )}
      </div>

      {/* Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-800 flex items-center gap-2"
            >
              <span>📷</span>
              <span>Upload Photo</span>
            </button>
            {photo && (
              <button
                onClick={handleRemovePhoto}
                className="w-full px-4 py-2 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-800 flex items-center gap-2 text-rose-600"
              >
                <span>🗑️</span>
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

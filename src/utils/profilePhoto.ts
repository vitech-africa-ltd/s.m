/**
 * Profile Photo Management System
 * Handles photo upload, storage, and display
 */

export interface ProfilePhoto {
  id: string;
  userId: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
}

const PROFILE_PHOTOS_KEY = 'vitech_profile_photos';

/**
 * Get all profile photos
 */
export function getProfilePhotos(): Record<string, ProfilePhoto> {
  try {
    const data = localStorage.getItem(PROFILE_PHOTOS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading profile photos:', error);
    return {};
  }
}

/**
 * Get profile photo for a user
 */
export function getProfilePhoto(userId: string): ProfilePhoto | null {
  const photos = getProfilePhotos();
  return photos[userId] || null;
}

/**
 * Save profile photo
 */
export function saveProfilePhoto(userId: string, photo: ProfilePhoto): void {
  try {
    const photos = getProfilePhotos();
    photos[userId] = photo;
    localStorage.setItem(PROFILE_PHOTOS_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Error saving profile photo:', error);
  }
}

/**
 * Delete profile photo
 */
export function deleteProfilePhoto(userId: string): void {
  try {
    const photos = getProfilePhotos();
    delete photos[userId];
    localStorage.setItem(PROFILE_PHOTOS_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Error deleting profile photo:', error);
  }
}

/**
 * Upload profile photo from file
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  maxSizeMB: number = 5
): Promise<ProfilePhoto | null> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  try {
    // Convert to base64
    const base64 = await fileToBase64(file);
    
    // Create thumbnail
    const thumbnail = await createThumbnail(base64, 150, 150);
    
    // Create photo object
    const photo: ProfilePhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      url: base64,
      thumbnailUrl: thumbnail,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      mimeType: file.type
    };

    // Save photo
    saveProfilePhoto(userId, photo);
    
    return photo;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Create thumbnail from base64 image
 */
function createThumbnail(
  base64: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate crop dimensions (center crop)
      const aspectRatio = img.width / img.height;
      let cropWidth, cropHeight, cropX, cropY;

      if (aspectRatio > 1) {
        // Image is wider than tall
        cropHeight = img.height;
        cropWidth = img.height;
        cropX = (img.width - cropWidth) / 2;
        cropY = 0;
      } else {
        // Image is taller than wide
        cropWidth = img.width;
        cropHeight = img.width;
        cropX = 0;
        cropY = (img.height - cropHeight) / 2;
      }

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, width, height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeMB = 5;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP'
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Get default avatar URL based on user info
 */
export function getDefaultAvatar(name: string, hue: number): string {
  // Generate initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Create SVG avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 55%, 46%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360}, 60%, 34%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#grad)"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * React hook for profile photo management
 */
export function useProfilePhoto(userId: string) {
  const photo = getProfilePhoto(userId);
  
  const upload = async (file: File) => {
    return await uploadProfilePhoto(userId, file);
  };
  
  const remove = () => {
    deleteProfilePhoto(userId);
  };
  
  return {
    photo,
    upload,
    remove
  };
}

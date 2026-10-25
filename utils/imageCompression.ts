/**
 * Client-side high-performance image compression utility
 * Enforces max 1600px on the longest dimension and ~0.8 JPEG quality
 */

export interface CompressionOptions {
  maxDimension?: number; // Default: 1600
  quality?: number; // Default: 0.8
  mimeType?: string; // Default: 'image/jpeg'
}

export async function compressImageClientSide(
  input: File | Blob | string,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  const maxDimension = options.maxDimension || 1600;
  const quality = options.quality ?? 0.8;
  const mimeType = options.mimeType || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context is not available');
        }

        // Draw image with image smoothing for high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Approximate byte size from base64
        const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const sizeBytes = Math.ceil((stringLength * 3) / 4);

        resolve({
          dataUrl,
          width,
          height,
          sizeBytes,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for compression: ' + String(err)));
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}

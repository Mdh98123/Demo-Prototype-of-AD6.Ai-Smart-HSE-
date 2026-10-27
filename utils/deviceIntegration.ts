import imageCompression from 'browser-image-compression';
import { offlineStorage, InspectionRecord } from '../services/offlineStorage';

export class DeviceIntegration {
  
  // ============================
  // GPS TAGGING
  // ============================
  public static async getCurrentLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
      } else {
        // High accuracy takes longer, but is preferred for enterprise apps
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy, // In meters
            });
          },
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }

  // ============================
  // CAMERA & COMPRESSION
  // ============================
  public static async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 0.5, // Target <500KB
      maxWidthOrHeight: 1280, // Prevent massive resolutions
      useWebWorker: true,
      initialQuality: 0.8
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`[Camera] Original: ${file.size/1024} KB -> Compressed: ${compressedFile.size/1024} KB`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  public static dataUrlToFile(dataUrl: string, filename = `evidence-${Date.now()}.jpg`): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Compresses an inspection evidence photo (from camera stream canvas, blob, or file)
   * and directly stores it in the offline IndexedDB database.
   */
  public static async compressAndStoreInspectionPhoto(
    inspectionId: string,
    imageSource: File | Blob | string,
    metadata?: {
      caption?: string;
      location?: { lat: number; lng: number };
      uploader?: string;
    }
  ): Promise<{
    updatedRecord: InspectionRecord;
    compressedBase64: string;
    originalSizeKb: number;
    compressedSizeKb: number;
    savingsPct: number;
  }> {
    let file: File;
    let originalSize = 0;

    if (typeof imageSource === 'string') {
      const stringLength = imageSource.length - (imageSource.indexOf(',') + 1);
      originalSize = Math.ceil((stringLength * 3) / 4);
      file = DeviceIntegration.dataUrlToFile(imageSource, `evidence-${Date.now()}.jpg`);
    } else if (imageSource instanceof File) {
      file = imageSource;
      originalSize = file.size;
    } else {
      originalSize = imageSource.size;
      file = new File([imageSource], `evidence-${Date.now()}.jpg`, { type: imageSource.type || 'image/jpeg' });
    }

    // 1. Compress image via browser-image-compression with enterprise constraints
    const compressedFile = await DeviceIntegration.compressImage(file);
    const compressedSize = compressedFile.size;

    // 2. Read compressed file as Base64 data URL
    const compressedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });

    // 3. Fetch or instantiate the target inspection record from the offline database
    let record = await offlineStorage.getInspection(inspectionId);
    if (!record) {
      record = {
        id: inspectionId,
        templateId: 'Field Inspection Evidence',
        status: 'DRAFT',
        data: {
          answers: {},
          photos: []
        },
        location: metadata?.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const currentPhotos = Array.isArray(record.data?.photos) ? [...record.data.photos] : [];
    currentPhotos.push(compressedBase64);

    const updatedRecord: InspectionRecord = {
      ...record,
      data: {
        ...record.data,
        photos: currentPhotos,
        ...(metadata?.caption ? { lastEvidenceCaption: metadata.caption } : {})
      },
      ...(metadata?.location ? { location: metadata.location } : {}),
      updatedAt: new Date().toISOString()
    };

    // 4. Store updated record in the offline database
    await offlineStorage.saveInspection(updatedRecord);

    const originalSizeKb = Math.round(originalSize / 1024);
    const compressedSizeKb = Math.round(compressedSize / 1024);
    const savingsPct = originalSizeKb > 0 
      ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
      : 0;

    return {
      updatedRecord,
      compressedBase64,
      originalSizeKb,
      compressedSizeKb,
      savingsPct
    };
  }

  // Helper inside UI:
  // <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} />
  
  // ============================
  // VOICE INPUT (Web Speech API)
  // ============================
  public static startSpeechRecognition(
    lang: 'en-US' | 'ar-AE',
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError(new Error("Speech Recognition not supported in this browser."));
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      onError(event.error);
    };

    recognition.onend = () => {
       onEnd();
    };

    recognition.start();
    return recognition;
  }
}

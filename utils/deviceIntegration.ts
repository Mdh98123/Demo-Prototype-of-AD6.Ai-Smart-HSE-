import imageCompression from 'browser-image-compression';

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

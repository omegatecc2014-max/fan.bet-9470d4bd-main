import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Permissão ou recurso de câmera não disponível (requer HTTPS/localhost).");
      }
      
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      } catch (e) {
        // Fallback to any available camera if 'environment' fails (e.g. on desktop)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error accessing camera';
      setError(msg);
      setIsCameraActive(false);
      toast.error("Câmera indisponível", { description: msg });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      // Compress the image aggressively to save space in IndexedDB (quality 0.6)
      return canvas.toDataURL('image/jpeg', 0.6);
    }
    return null;
  }, []);

  return {
    stream,
    error,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto
  };
}

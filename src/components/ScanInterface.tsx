import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface ScanInterfaceProps {
  onScanComplete: (imageData: string) => void;
  onClose: () => void;
}

export default function ScanInterface({ onScanComplete, onClose }: ScanInterfaceProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().then(() => {
          console.log('Video playing successfully');
          setCameraReady(true);
        }).catch((err) => {
          console.error('Error playing video:', err);
        });
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraReady(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log('Camera stream obtained:', mediaStream.active);
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error('Camera error:', err);
      alert('Unable to access camera. Please check permissions or try uploading an image.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        setIsProcessing(true);
        setTimeout(() => {
          onScanComplete(imageData);
        }, 500);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setIsProcessing(true);
        setTimeout(() => {
          onScanComplete(imageData);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Scan Your Face</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-8">
                Choose how you'd like to scan your face
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <h3 className="font-semibold text-gray-900 mb-2">Use Camera</h3>
                  <p className="text-sm text-gray-600">Take a live photo</p>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <h3 className="font-semibold text-gray-900 mb-2">Upload Image</h3>
                  <p className="text-sm text-gray-600">Choose from gallery</p>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {mode === 'camera' && !isProcessing && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                  style={{ minHeight: '300px' }}
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-2xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-orange-400 rounded-full"></div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Capture Photo
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    setMode('select');
                  }}
                  className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="py-16 text-center">
              <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Analyzing your skin...</p>
              <p className="text-sm text-gray-600 mt-2">This will only take a moment</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

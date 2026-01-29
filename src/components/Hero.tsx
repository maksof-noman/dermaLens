import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface HeroProps {
  onStartScan: () => void;
}

export default function Hero({ onStartScan }: HeroProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleButtonClick = () => {
    setShowMenu(true);
  };

  const handleCameraClick = () => {
    setShowMenu(false);
    onStartScan();
  };

  const handleUploadClick = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onStartScan();
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4">
      <div className="relative w-[390px] max-w-full h-[844px] rounded-[36px] overflow-hidden bg-black shadow-2xl">
        <img
          src="/image.png"
          alt="Dermalens hero"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute top-10 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <div className="absolute left-1 top-0 h-7 w-2.5 rotate-[28deg] rounded-full bg-white/95" />
              <div className="absolute left-4 top-1 h-7 w-2.5 rotate-[28deg] rounded-full bg-white/75" />
            </div>
            <div className="text-white text-[30px] font-semibold tracking-tight">
              Dermalens
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-20 bg-gradient-to-b from-white/0 via-white/40 to-white/85" />
          <div className="relative bg-white/90 backdrop-blur-md px-6 pb-10 pt-6">
            <h1 className="text-[30px] leading-tight font-semibold text-neutral-900">
              Discover Your
              <br />
              True Skin with AI
              <br />
              Precision
            </h1>

            <p className="mt-4 text-[16px] leading-relaxed text-neutral-600 max-w-[290px]">
              Get quick, smart beauty insights <br />
              with Dermalens.
            </p>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleButtonClick}
              className="absolute right-6 bottom-8 h-16 w-16 rounded-full bg-[#F28C2A] shadow-lg grid place-items-center active:scale-[0.98] transition"
              aria-label="Continue"
            >
              <span className="text-white text-2xl leading-none">›</span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute bottom-28 right-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[200px]">
                  <button
                    onClick={handleCameraClick}
                    className="w-full px-6 py-4 flex items-center gap-3 hover:bg-neutral-50 transition active:bg-neutral-100"
                  >
                    <Camera className="w-5 h-5 text-[#F28C2A]" />
                    <span className="text-neutral-800 font-medium">Take Photo</span>
                  </button>
                  <div className="h-px bg-neutral-200" />
                  <button
                    onClick={handleUploadClick}
                    className="w-full px-6 py-4 flex items-center gap-3 hover:bg-neutral-50 transition active:bg-neutral-100"
                  >
                    <Upload className="w-5 h-5 text-[#F28C2A]" />
                    <span className="text-neutral-800 font-medium">Upload Image</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
      </div>
    </div>
  );
}

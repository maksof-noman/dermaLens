import { useEffect, useState, useRef } from 'react';

interface LiveProcessingProps {
  imageData: string;
  isAnalyzing: boolean;
  onComplete: () => void;
}

const stages = [
  { label: 'Initializing AI Models', duration: 2000 },
  { label: 'Detecting Facial Features', duration: 2500 },
  { label: 'Analyzing Skin Parameters', duration: 15500 },
  { label: 'Generating Recommendations', duration: 1000 }
];

const skinParameters = [
  { name: 'Wrinkles', icon: '≋', position: { top: '20%', left: '50%' } },
  { name: 'Dark Circles', icon: '◐', position: { top: '30%', left: '30%' } },
  { name: 'Eye Bags', icon: '◑', position: { top: '30%', right: '30%' } },
  { name: 'Upper Eyelid', icon: '⌢', position: { top: '28%', left: '15%' } },
  { name: 'Lower Eyelid', icon: '⌣', position: { top: '28%', right: '15%' } },
  { name: 'Spots', icon: '•', position: { top: '38%', left: '25%' } },
  { name: 'Texture', icon: '⊞', position: { top: '38%', right: '25%' } },
  { name: 'Acne', icon: '○', position: { top: '42%', left: '12%' } },
  { name: 'Redness', icon: '●', position: { top: '42%', right: '12%' } },
  { name: 'Pores', icon: '⊙', position: { top: '48%', left: '50%' } },
  { name: 'Oiliness', icon: '◊', position: { top: '52%', left: '30%' } },
  { name: 'Moisture', icon: '💧', position: { top: '52%', right: '30%' } },
  { name: 'Radiance', icon: '✦', position: { top: '60%', left: '50%' } },
  { name: 'Firmness', icon: '◈', position: { top: '68%', left: '50%' } }
];

export default function LiveProcessing({ imageData, isAnalyzing, onComplete }: LiveProcessingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [scanLineY, setScanLineY] = useState(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [currentParameter, setCurrentParameter] = useState(-1);
  const [parameterValues, setParameterValues] = useState<Record<string, number>>({});
  const animationRef = useRef<number>();
  const completedRef = useRef(false);
  const shownParametersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    const parameterAnalysisStart = stages[0].duration + stages[1].duration;
    const parameterAnalysisDuration = stages[2].duration;
    const timePerParameter = parameterAnalysisDuration / skinParameters.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      let cumulativeDuration = 0;
      let newStage = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration;
        if (elapsed < cumulativeDuration) {
          newStage = i;
          break;
        }
        newStage = stages.length - 1;
      }
      setCurrentStage(newStage);

      if (newStage === 2) {
        const timeInParameterStage = elapsed - parameterAnalysisStart;
        const newParameterIndex = Math.min(
          Math.floor(timeInParameterStage / timePerParameter),
          skinParameters.length - 1
        );

        if (newParameterIndex !== currentParameter &&
            newParameterIndex >= 0 &&
            !shownParametersRef.current.has(newParameterIndex)) {
          shownParametersRef.current.add(newParameterIndex);
          setCurrentParameter(newParameterIndex);
          setParameterValues(prev => ({
            ...prev,
            [skinParameters[newParameterIndex].name]: Math.floor(Math.random() * 30 + 20)
          }));
        }
      }

      setScanLineY((elapsed % 3000) / 3000);

      if (Math.random() > 0.7) {
        setParticles(prev => {
          const newParticles = [...prev, {
            x: Math.random() * 390,
            y: Math.random() * 844,
            id: Date.now() + Math.random()
          }];
          return newParticles.slice(-20);
        });
      }

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete]);

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  console.log('LiveProcessing rendering with imageData:', imageData ? `${imageData.substring(0, 50)}...` : 'NO IMAGE');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="relative w-[390px] max-w-full h-[844px] rounded-[36px] overflow-hidden bg-black shadow-2xl ring-2 ring-orange-500/30">
        {imageData && (
          <img
            src={imageData}
            alt="User photo"
            className="absolute inset-0 h-full w-full object-cover z-0"
            onError={(e) => {
              console.error('Failed to load image in LiveProcessing', e);
              console.error('Image src:', imageData?.substring(0, 100));
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image loaded successfully in LiveProcessing');
            }}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/20 to-transparent z-10"
            style={{
              transform: `translateY(${scanLineY * 100}%)`,
              transition: 'transform 0.1s linear'
            }}
          >
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_20px_rgba(251,146,60,0.8)]"></div>
          </div>


          {currentStage === 2 && currentParameter >= 0 && skinParameters[currentParameter] && (
            <div
              key={`param-${currentParameter}-${skinParameters[currentParameter].name}`}
              className="absolute transition-all duration-300 ease-out z-30 animate-in fade-in slide-in-from-bottom-4 zoom-in-90"
              style={skinParameters[currentParameter].position}
            >
              <div className="relative">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-2xl border-2 border-orange-500 flex items-center gap-3 min-w-[140px]">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {skinParameters[currentParameter].icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-orange-600 tabular-nums">
                      {parameterValues[skinParameters[currentParameter].name]}%
                    </div>
                    <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                      {skinParameters[currentParameter].name}
                    </div>
                  </div>
                </div>
                <div className="absolute -z-10 inset-0 bg-orange-400 rounded-2xl blur-xl opacity-30"></div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[85%] z-40">
          <div className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-orange-500/30 shadow-[0_0_30px_rgba(251,146,60,0.3)]">
            <p className="text-orange-400 text-sm font-semibold text-center mb-2">
              {progress >= 100 && isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">Finalizing Results</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </span>
              ) : (
                <>
                  {stages[currentStage].label}
                  {currentStage === 2 && currentParameter >= 0 && (
                    <span className="ml-2 text-orange-300">
                      ({currentParameter + 1}/{skinParameters.length})
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(251,146,60,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {currentStage === 2 && (
          <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-[85%] z-40">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-orange-500/20">
              <div className="grid grid-cols-7 gap-2">
                {skinParameters.map((param, index) => (
                  <div
                    key={param.name}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      index <= currentParameter
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white scale-110 shadow-lg'
                        : 'bg-gray-800 text-gray-600'
                    }`}
                  >
                    {index <= currentParameter ? '✓' : param.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
          <div className="relative w-44 h-44">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-full shadow-[0_0_50px_rgba(251,146,60,0.4)] border-2 border-orange-500/40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </div>
                <div className="text-xs text-orange-400/80 mt-1 font-medium tracking-wider">AI ANALYZING</div>
              </div>
            </div>

            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="#1f2937"
                strokeWidth="8"
              />
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

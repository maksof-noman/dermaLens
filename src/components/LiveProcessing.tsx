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

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="meshGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g transform="translate(195, 280)" filter="url(#glow)">
              <line x1="0" y1="-120" x2="0" y2="155" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -90 -95 Q 0 -120 90 -95" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.7" />
              <line x1="-90" y1="-95" x2="-100" y2="-65" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <line x1="90" y1="-95" x2="100" y2="-65" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -85 -60 Q -40 -70 0 -70 Q 40 -70 85 -60" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />

              <path d="M -100 -65 L -105 -30" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 100 -65 L 105 -30" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -82 -52 Q -60 -55 -50 -48" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M 82 -52 Q 60 -55 50 -48" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />

              <ellipse cx="-65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#meshGradient)" strokeWidth="1.8" opacity="0.7" />
              <ellipse cx="65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#meshGradient)" strokeWidth="1.8" opacity="0.7" />

              <ellipse cx="-65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />
              <ellipse cx="65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />

              <path d="M -48 -35 Q -40 -38 -32 -35" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />
              <path d="M 48 -35 Q 40 -38 32 -35" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />

              <line x1="-85" y1="-30" x2="-48" y2="-30" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />
              <line x1="85" y1="-30" x2="48" y2="-30" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />

              <line x1="-65" y1="-44" x2="-65" y2="-16" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.55" />
              <line x1="65" y1="-44" x2="65" y2="-16" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.55" />

              <path d="M -105 -30 Q -90 -10 -90 15" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 105 -30 Q 90 -10 90 15" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <line x1="0" y1="-10" x2="0" y2="45" stroke="url(#meshGradient)" strokeWidth="1.8" opacity="0.8" />
              <line x1="0" y1="45" x2="-12" y2="48" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <line x1="0" y1="45" x2="12" y2="48" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />

              <line x1="-15" y1="-5" x2="15" y2="-5" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />
              <line x1="-18" y1="10" x2="18" y2="10" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />
              <line x1="-20" y1="25" x2="20" y2="25" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />

              <path d="M -20 45 Q -10 50 0 52 Q 10 50 20 45" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />

              <path d="M -90 15 Q -75 35 -65 55" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 90 15 Q 75 35 65 55" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -40 25 Q -45 40 -50 55" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />
              <path d="M 40 25 Q 45 40 50 55" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />

              <path d="M -65 55 L -60 80" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 65 55 L 60 80" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -105 -30 L -110 10" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M 105 -30 L 110 10" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M -110 10 L -105 50" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M 110 10 L 105 50" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />

              <path d="M -50 55 Q -35 60 -28 70" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />
              <path d="M 50 55 Q 35 60 28 70" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />

              <path d="M -60 80 Q -45 85 -35 88" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 60 80 Q 45 85 35 88" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -35 88 Q -20 93 0 95" fill="none" stroke="url(#meshGradient)" strokeWidth="1.8" opacity="0.7" />
              <path d="M 35 88 Q 20 93 0 95" fill="none" stroke="url(#meshGradient)" strokeWidth="1.8" opacity="0.7" />

              <ellipse cx="0" cy="78" rx="32" ry="15" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.65" />

              <path d="M -28 72 Q -18 75 -8 76" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />
              <path d="M 28 72 Q 18 75 8 76" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />
              <path d="M -8 76 Q 0 77 8 76" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />

              <path d="M -28 84 Q -18 82 -8 82" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />
              <path d="M 28 84 Q 18 82 8 82" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />
              <path d="M -8 82 Q 0 81 8 82" fill="none" stroke="url(#meshGradient)" strokeWidth="1.2" opacity="0.6" />

              <path d="M -28 70 Q 0 73 28 70" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M -30 86 Q 0 92 30 86" fill="none" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />

              <path d="M -60 80 Q -50 100 -40 115" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 60 80 Q 50 100 40 115" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -40 115 Q -30 130 -18 140" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />
              <path d="M 40 115 Q 30 130 18 140" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M -18 140 Q 0 148 18 140" fill="none" stroke="url(#meshGradient)" strokeWidth="2" opacity="0.75" />

              <path d="M 0 95 L 0 120" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.7" />
              <path d="M -10 115 L 10 115" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />
              <path d="M -12 130 L 12 130" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.6" />

              <line x1="-90" y1="-95" x2="90" y2="-95" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-100" y1="-65" x2="100" y2="-65" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-105" y1="-30" x2="105" y2="-30" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-110" y1="10" x2="110" y2="10" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-105" y1="50" x2="105" y2="50" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-60" y1="80" x2="60" y2="80" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="-40" y1="115" x2="40" y2="115" stroke="url(#meshGradient)" strokeWidth="1.5" opacity="0.6" />

              <line x1="-50" y1="-10" x2="-30" y2="-10" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.5" />
              <line x1="50" y1="-10" x2="30" y2="-10" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.5" />

              <line x1="-55" y1="30" x2="-35" y2="30" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.5" />
              <line x1="55" y1="30" x2="35" y2="30" stroke="url(#meshGradient)" strokeWidth="1" opacity="0.5" />

              {[
                [0, -120], [-90, -95], [90, -95], [-100, -65], [100, -65],
                [-105, -30], [105, -30], [-110, 10], [110, 10], [-105, 50], [105, 50],
                [-65, -30], [65, -30], [-85, -30], [85, -30], [-48, -30], [48, -30],
                [-82, -52], [82, -52], [-50, -48], [50, -48],
                [0, -10], [0, 10], [0, 25], [0, 45], [0, 52],
                [-20, 45], [20, 45], [-12, 48], [12, 48],
                [-90, 15], [90, 15], [-65, 55], [65, 55], [-60, 80], [60, 80],
                [-50, 55], [50, 55], [-40, 25], [40, 25],
                [-35, 88], [35, 88], [-28, 70], [28, 70], [-28, 84], [28, 84],
                [0, 78], [0, 95], [0, 120],
                [-40, 115], [40, 115], [-18, 140], [18, 140], [0, 148],
                [-30, 130], [30, 130], [0, -70]
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill="#fb923c"
                  opacity="0.9"
                >
                  <animate
                    attributeName="r"
                    values="2;3.5;2"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.06}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;1;0.7"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.06}s`}
                  />
                </circle>
              ))}
            </g>

            {particles.map(particle => (
              <circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r="2"
                fill="#fb923c"
                opacity="0.6"
              >
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="1s"
                  repeatCount="1"
                />
                <animate
                  attributeName="r"
                  values="2;4"
                  dur="1s"
                  repeatCount="1"
                />
              </circle>
            ))}
          </svg>

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

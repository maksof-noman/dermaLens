interface FaceMeshOverlayProps {
  imageData: string;
  className?: string;
}

export default function FaceMeshOverlay({ imageData, className = '' }: FaceMeshOverlayProps) {
  console.log('FaceMeshOverlay rendering with imageData:', imageData ? `${imageData.substring(0, 50)}...` : 'NO IMAGE');

  return (
    <div className={`relative ${className}`}>
      {imageData && (
        <img
          src={imageData}
          alt="Analyzed face"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load image in FaceMeshOverlay', e);
            console.error('Image src:', imageData?.substring(0, 100));
          }}
          onLoad={() => {
            console.log('Image loaded successfully in FaceMeshOverlay');
          }}
        />
      )}

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="faceMeshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9" />
          </linearGradient>

          <filter id="meshGlow">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(50, 50) scale(0.165)" filter="url(#meshGlow)">
          <line x1="0" y1="-120" x2="0" y2="155" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -90 -95 Q 0 -120 90 -95" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.8" />
          <line x1="-90" y1="-95" x2="-100" y2="-65" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <line x1="90" y1="-95" x2="100" y2="-65" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -85 -60 Q -40 -70 0 -70 Q 40 -70 85 -60" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />

          <path d="M -100 -65 L -105 -30" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 100 -65 L 105 -30" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -82 -52 Q -60 -55 -50 -48" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M 82 -52 Q 60 -55 50 -48" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <ellipse cx="-65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2.5" opacity="0.8" />
          <ellipse cx="65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2.5" opacity="0.8" />

          <ellipse cx="-65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <ellipse cx="65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <path d="M -48 -35 Q -40 -38 -32 -35" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <path d="M 48 -35 Q 40 -38 32 -35" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />

          <line x1="-85" y1="-30" x2="-48" y2="-30" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <line x1="85" y1="-30" x2="48" y2="-30" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <line x1="-65" y1="-44" x2="-65" y2="-16" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="65" y1="-44" x2="65" y2="-16" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.6" />

          <path d="M -105 -30 Q -90 -10 -90 15" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 105 -30 Q 90 -10 90 15" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <line x1="0" y1="-10" x2="0" y2="45" stroke="url(#faceMeshGradient)" strokeWidth="2.5" opacity="0.9" />
          <line x1="0" y1="45" x2="-12" y2="48" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <line x1="0" y1="45" x2="12" y2="48" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <line x1="-15" y1="-5" x2="15" y2="-5" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <line x1="-18" y1="10" x2="18" y2="10" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <line x1="-20" y1="25" x2="20" y2="25" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <path d="M -20 45 Q -10 50 0 52 Q 10 50 20 45" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <path d="M -90 15 Q -75 35 -65 55" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 90 15 Q 75 35 65 55" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -40 25 Q -45 40 -50 55" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M 40 25 Q 45 40 50 55" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <path d="M -65 55 L -60 80" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 65 55 L 60 80" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -105 -30 L -110 10" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M 105 -30 L 110 10" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M -110 10 L -105 50" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M 110 10 L 105 50" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <path d="M -50 55 Q -35 60 -28 70" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <path d="M 50 55 Q 35 60 28 70" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />

          <path d="M -60 80 Q -45 85 -35 88" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 60 80 Q 45 85 35 88" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -35 88 Q -20 93 0 95" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2.5" opacity="0.8" />
          <path d="M 35 88 Q 20 93 0 95" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2.5" opacity="0.8" />

          <ellipse cx="0" cy="78" rx="32" ry="15" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <path d="M -28 72 Q -18 75 -8 76" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <path d="M 28 72 Q 18 75 8 76" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <path d="M -8 76 Q 0 77 8 76" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <path d="M -28 84 Q -18 82 -8 82" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <path d="M 28 84 Q 18 82 8 82" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <path d="M -8 82 Q 0 81 8 82" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <path d="M -28 70 Q 0 73 28 70" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M -30 86 Q 0 92 30 86" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />

          <path d="M -60 80 Q -50 100 -40 115" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 60 80 Q 50 100 40 115" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -40 115 Q -30 130 -18 140" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />
          <path d="M 40 115 Q 30 130 18 140" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M -18 140 Q 0 148 18 140" fill="none" stroke="url(#faceMeshGradient)" strokeWidth="3" opacity="0.85" />

          <path d="M 0 95 L 0 120" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.75" />
          <path d="M -10 115 L 10 115" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />
          <path d="M -12 130 L 12 130" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.65" />

          <line x1="-90" y1="-95" x2="90" y2="-95" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-100" y1="-65" x2="100" y2="-65" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-105" y1="-30" x2="105" y2="-30" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-110" y1="10" x2="110" y2="10" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-105" y1="50" x2="105" y2="50" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-60" y1="80" x2="60" y2="80" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />
          <line x1="-40" y1="115" x2="40" y2="115" stroke="url(#faceMeshGradient)" strokeWidth="2" opacity="0.7" />

          <line x1="-50" y1="-10" x2="-30" y2="-10" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.55" />
          <line x1="50" y1="-10" x2="30" y2="-10" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.55" />

          <line x1="-55" y1="30" x2="-35" y2="30" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.55" />
          <line x1="55" y1="30" x2="35" y2="30" stroke="url(#faceMeshGradient)" strokeWidth="1.5" opacity="0.55" />

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
              r="3.5"
              fill="#fb923c"
              opacity="0.95"
            >
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.06}s`}
              />
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.06}s`}
              />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}

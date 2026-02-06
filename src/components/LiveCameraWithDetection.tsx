import { useRef, useEffect, useState } from 'react';
import { X, Zap, Eye, Circle, CheckCircle, Glasses } from 'lucide-react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

interface LiveCameraWithDetectionProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ValidationState {
  faceDetected: boolean;
  centered: boolean;
  lighting: boolean;
  distance: boolean;
  lookingStraight: boolean;
  noGlasses: boolean;
}

export default function LiveCameraWithDetection({ onCapture, onClose }: LiveCameraWithDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [facePosition, setFacePosition] = useState<FacePosition>({ x: 195, y: 300, width: 200, height: 250 });
  const [validation, setValidation] = useState<ValidationState>({
    faceDetected: false,
    centered: false,
    lighting: false,
    distance: false,
    lookingStraight: false,
    noGlasses: true
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [avgBrightness, setAvgBrightness] = useState(0);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const detectionIntervalRef = useRef<number>();
  const countdownIntervalRef = useRef<number>();
  const validationHistoryRef = useRef<boolean[]>([]);
  const currentValidationRef = useRef<ValidationState>(validation);
  const glassesDetectionHistoryRef = useRef<boolean[]>([]);

  useEffect(() => {
    initializeFaceLandmarker();
    return () => {
      stopCamera();
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const initializeFaceLandmarker = async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });

      console.log('✅ MediaPipe FaceLandmarker initialized');
      setIsModelLoading(false);
      startCamera();
    } catch (error) {
      console.error('❌ Error initializing FaceLandmarker:', error);
      setIsModelLoading(false);
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 390 },
          height: { ideal: 844 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startFaceDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const startFaceDetection = () => {
    detectionIntervalRef.current = window.setInterval(() => {
      detectFace();
    }, 100);
  };

  const detectFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    if (!video || !canvas || !faceLandmarker || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        const faceBox = getFaceBoundingBox(landmarks, canvas.width, canvas.height);
        const brightness = calculateBrightness(video, faceBox);
        setAvgBrightness(brightness);

        const isCentered = checkCentered(faceBox, canvas.width, canvas.height);
        const isGoodLighting = brightness > 60 && brightness < 220;
        const isGoodDistance = faceBox.width > 150 && faceBox.width < 450;
        const isLookingStraight = checkFacingForward(landmarks);

        const glassesDetectedThisFrame = detectGlassesFromLandmarks(landmarks, canvas);
        glassesDetectionHistoryRef.current.push(glassesDetectedThisFrame);

        if (glassesDetectionHistoryRef.current.length > 10) {
          glassesDetectionHistoryRef.current.shift();
        }

        const historyLength = glassesDetectionHistoryRef.current.length;
        let weightedGlassesScore = 0;
        let totalWeight = 0;

        glassesDetectionHistoryRef.current.forEach((detected, index) => {
          const recency = index / Math.max(1, historyLength - 1);
          const weight = 0.5 + (recency * 1.5);
          totalWeight += weight;
          if (detected) {
            weightedGlassesScore += weight;
          }
        });

        const weightedRatio = totalWeight > 0 ? weightedGlassesScore / totalWeight : 0;

        let noGlassesDetected: boolean;
        if (historyLength >= 10) {
          noGlassesDetected = weightedRatio < 0.40;
        } else if (historyLength >= 5) {
          noGlassesDetected = weightedRatio < 0.35;
        } else {
          const glassesCount = glassesDetectionHistoryRef.current.filter(g => g).length;
          const noGlassesCount = glassesDetectionHistoryRef.current.filter(g => !g).length;
          noGlassesDetected = noGlassesCount > glassesCount;
        }

        console.log(`MediaPipe Validations: centered=${isCentered}, lighting=${isGoodLighting}(${brightness.toFixed(0)}), distance=${isGoodDistance}(${faceBox.width.toFixed(0)}), straight=${isLookingStraight}, noGlasses=${noGlassesDetected} (weighted: ${(weightedRatio * 100).toFixed(1)}%, history: ${historyLength})`);

        const newValidation = {
          faceDetected: true,
          centered: isCentered,
          lighting: isGoodLighting,
          distance: isGoodDistance,
          lookingStraight: isLookingStraight,
          noGlasses: noGlassesDetected
        };

        setValidation(newValidation);
        currentValidationRef.current = newValidation;
        setFacePosition(faceBox);

        const allValid = Object.values(newValidation).every(v => v === true);

        if (allValid) {
          validationHistoryRef.current.push(true);
        } else {
          validationHistoryRef.current = [];
        }

        if (validationHistoryRef.current.length > 2) {
          validationHistoryRef.current.shift();
        }

        const progress = Math.min((validationHistoryRef.current.length / 2) * 100, 100);
        setStabilityProgress(progress);

        const shouldStartCountdown = validationHistoryRef.current.length >= 2;

        if (shouldStartCountdown && countdown === null) {
          console.log('✅ Starting countdown - all validations passed for 2 frames');
          startCountdown();
        } else if (!allValid && countdown !== null) {
          console.log('❌ Stopping countdown - validation failed');
          stopCountdown();
        }
      } else {
        const noFaceValidation = {
          faceDetected: false,
          centered: false,
          lighting: false,
          distance: false,
          lookingStraight: false,
          noGlasses: true
        };
        setValidation(noFaceValidation);
        currentValidationRef.current = noFaceValidation;
        validationHistoryRef.current = [];
        glassesDetectionHistoryRef.current = [];
        setStabilityProgress(0);
        if (countdown !== null) {
          stopCountdown();
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  const getFaceBoundingBox = (landmarks: any[], width: number, height: number): FacePosition => {
    let minX = 1, maxX = 0, minY = 1, maxY = 0;

    landmarks.forEach((landmark) => {
      if (landmark.x < minX) minX = landmark.x;
      if (landmark.x > maxX) maxX = landmark.x;
      if (landmark.y < minY) minY = landmark.y;
      if (landmark.y > maxY) maxY = landmark.y;
    });

    const faceWidth = (maxX - minX) * width;
    const faceHeight = (maxY - minY) * height;
    const centerX = ((minX + maxX) / 2) * width;
    const centerY = ((minY + maxY) / 2) * height;

    return {
      x: centerX,
      y: centerY,
      width: faceWidth,
      height: faceHeight
    };
  };

  const checkFacingForward = (landmarks: any[]): boolean => {
    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];
    const noseTip = landmarks[4];

    const eyeDistanceX = Math.abs(rightEyeOuter.x - leftEyeOuter.x);
    const noseToCenterX = Math.abs(noseTip.x - (leftEyeOuter.x + rightEyeOuter.x) / 2);
    const asymmetryRatio = noseToCenterX / eyeDistanceX;

    console.log(`Facing forward check: asymmetry ratio = ${asymmetryRatio.toFixed(3)}`);
    return asymmetryRatio < 0.15;
  };

  const detectGlassesFromLandmarks = (landmarks: any[], canvas: HTMLCanvasElement): boolean => {
    const video = videoRef.current;
    if (!video) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const leftEyeOuter = landmarks[33];
    const leftEyeInner = landmarks[133];
    const rightEyeOuter = landmarks[263];
    const rightEyeInner = landmarks[362];
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386];
    const rightEyeBottom = landmarks[374];
    const noseBridge = landmarks[6];
    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];
    const foreheadLeft = landmarks[151];
    const foreheadRight = landmarks[377];

    const eyeRegions = [
      {
        left: leftEyeOuter,
        right: leftEyeInner,
        top: leftEyeTop,
        bottom: leftEyeBottom,
        name: 'left'
      },
      {
        left: rightEyeInner,
        right: rightEyeOuter,
        top: rightEyeTop,
        bottom: rightEyeBottom,
        name: 'right'
      }
    ];

    let totalReflectivePixels = 0;
    let totalBrightPixels = 0;
    let totalMediumBrightPixels = 0;
    let totalEdgePixels = 0;
    let totalDarkEdges = 0;
    let totalSharpEdges = 0;
    let totalSmoothPixels = 0;
    let totalPixels = 0;
    let textureVariance = 0;

    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = canvas.width;
    debugCanvas.height = canvas.height;
    const debugCtx = debugCanvas.getContext('2d');
    if (debugCtx) {
      debugCtx.drawImage(canvas, 0, 0);
    }

    eyeRegions.forEach(region => {
      const leftX = Math.floor(region.left.x * canvas.width);
      const rightX = Math.floor(region.right.x * canvas.width);
      const topY = Math.floor(region.top.y * canvas.height);
      const bottomY = Math.floor(region.bottom.y * canvas.height);

      const width = Math.abs(rightX - leftX);
      const height = Math.abs(bottomY - topY);

      const expandX = Math.floor(width * 1.5);
      const expandY = Math.floor(height * 2.0);

      const startX = Math.max(0, Math.min(leftX, rightX) - expandX);
      const endX = Math.min(canvas.width, Math.max(leftX, rightX) + expandX);
      const startY = Math.max(0, Math.min(topY, bottomY) - expandY);
      const endY = Math.min(canvas.height, Math.max(topY, bottomY) + expandY);

      if (debugCtx) {
        debugCtx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        debugCtx.lineWidth = 2;
        debugCtx.strokeRect(startX, startY, endX - startX, endY - startY);
      }

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

            totalPixels++;
            textureVariance += variance;

            if (brightness > 140 && variance < 60) {
              totalReflectivePixels++;
            }

            if (brightness > 160) {
              totalBrightPixels++;
            }

            if (brightness > 120 && brightness < 180) {
              totalMediumBrightPixels++;
            }

            if (variance < 20) {
              totalSmoothPixels++;
            }

            if (x + 1 < canvas.width && y + 1 < canvas.height) {
              const nextI = (y * canvas.width + (x + 1)) * 4;
              const belowI = ((y + 1) * canvas.width + x) * 4;
              const diagI = ((y + 1) * canvas.width + (x + 1)) * 4;

              const nextBrightness = (data[nextI] + data[nextI + 1] + data[nextI + 2]) / 3;
              const belowBrightness = (data[belowI] + data[belowI + 1] + data[belowI + 2]) / 3;
              const diagBrightness = (data[diagI] + data[diagI + 1] + data[diagI + 2]) / 3;

              const horizontalEdge = Math.abs(brightness - nextBrightness);
              const verticalEdge = Math.abs(brightness - belowBrightness);
              const diagonalEdge = Math.abs(brightness - diagBrightness);
              const maxEdge = Math.max(horizontalEdge, verticalEdge, diagonalEdge);

              if (maxEdge > 25) {
                totalEdgePixels++;
              }

              if (maxEdge > 50) {
                totalSharpEdges++;
              }

              if (maxEdge > 20 && brightness < 120) {
                totalDarkEdges++;
              }
            }
          }
        }
      }
    });

    const bridgeX = Math.floor(noseBridge.x * canvas.width);
    const bridgeY = Math.floor(noseBridge.y * canvas.height);
    const bridgeRegionSize = 40;
    let bridgeReflections = 0;
    let bridgeBright = 0;
    let bridgeEdges = 0;
    let bridgePixels = 0;

    if (debugCtx) {
      debugCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      debugCtx.lineWidth = 2;
      debugCtx.strokeRect(bridgeX - bridgeRegionSize, bridgeY - bridgeRegionSize, bridgeRegionSize * 2, bridgeRegionSize * 2);
    }

    for (let y = bridgeY - bridgeRegionSize; y < bridgeY + bridgeRegionSize; y += 1) {
      for (let x = bridgeX - bridgeRegionSize; x < bridgeX + bridgeRegionSize; x += 1) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

          bridgePixels++;
          if (brightness > 140 && variance < 60) {
            bridgeReflections++;
          }
          if (brightness > 160) {
            bridgeBright++;
          }

          if (x + 1 < canvas.width && y + 1 < canvas.height) {
            const nextI = (y * canvas.width + (x + 1)) * 4;
            const nextBrightness = (data[nextI] + data[nextI + 1] + data[nextI + 2]) / 3;
            if (Math.abs(brightness - nextBrightness) > 25) {
              bridgeEdges++;
            }
          }
        }
      }
    }

    const templeLeftX = Math.floor(leftTemple.x * canvas.width);
    const templeLeftY = Math.floor(leftTemple.y * canvas.height);
    const templeRightX = Math.floor(rightTemple.x * canvas.width);
    const templeRightY = Math.floor(rightTemple.y * canvas.height);
    const templeRegionSize = 25;
    let templeEdges = 0;
    let templePixels = 0;

    const templeRegions = [
      { x: templeLeftX, y: templeLeftY },
      { x: templeRightX, y: templeRightY }
    ];

    templeRegions.forEach(temple => {
      if (debugCtx) {
        debugCtx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        debugCtx.lineWidth = 2;
        debugCtx.strokeRect(temple.x - templeRegionSize, temple.y - templeRegionSize, templeRegionSize * 2, templeRegionSize * 2);
      }

      for (let y = temple.y - templeRegionSize; y < temple.y + templeRegionSize; y += 2) {
        for (let x = temple.x - templeRegionSize; x < temple.x + templeRegionSize; x += 2) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height && x + 1 < canvas.width) {
            templePixels++;
            const i = (y * canvas.width + x) * 4;
            const nextI = (y * canvas.width + (x + 1)) * 4;
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const nextBrightness = (data[nextI] + data[nextI + 1] + data[nextI + 2]) / 3;
            if (Math.abs(brightness - nextBrightness) > 20) {
              templeEdges++;
            }
          }
        }
      }
    });

    const reflectionRatio = totalPixels > 0 ? totalReflectivePixels / totalPixels : 0;
    const brightRatio = totalPixels > 0 ? totalBrightPixels / totalPixels : 0;
    const mediumBrightRatio = totalPixels > 0 ? totalMediumBrightPixels / totalPixels : 0;
    const edgeRatio = totalPixels > 0 ? totalEdgePixels / totalPixels : 0;
    const sharpEdgeRatio = totalPixels > 0 ? totalSharpEdges / totalPixels : 0;
    const darkEdgeRatio = totalPixels > 0 ? totalDarkEdges / totalPixels : 0;
    const smoothRatio = totalPixels > 0 ? totalSmoothPixels / totalPixels : 0;
    const avgTextureVariance = totalPixels > 0 ? textureVariance / totalPixels : 0;
    const bridgeRatio = bridgePixels > 0 ? bridgeReflections / bridgePixels : 0;
    const bridgeBrightRatio = bridgePixels > 0 ? bridgeBright / bridgePixels : 0;
    const bridgeEdgeRatio = bridgePixels > 0 ? bridgeEdges / bridgePixels : 0;
    const templeEdgeRatio = templePixels > 0 ? templeEdges / templePixels : 0;

    const glassesScore =
      (reflectionRatio * 0.25) +
      (brightRatio * 0.15) +
      (edgeRatio * 0.15) +
      (sharpEdgeRatio * 0.1) +
      (darkEdgeRatio * 0.1) +
      (bridgeRatio * 0.1) +
      (bridgeEdgeRatio * 0.08) +
      (templeEdgeRatio * 0.07);

    let signalCount = 0;
    let strongSignalCount = 0;
    const signals: string[] = [];

    if (reflectionRatio > 0.12) {
      signalCount++;
      signals.push('reflection');
      if (reflectionRatio > 0.18) strongSignalCount++;
    }
    if (brightRatio > 0.10) {
      signalCount++;
      signals.push('bright');
      if (brightRatio > 0.15) strongSignalCount++;
    }
    if (edgeRatio > 0.12) {
      signalCount++;
      signals.push('edges');
      if (edgeRatio > 0.17) strongSignalCount++;
    }
    if (sharpEdgeRatio > 0.05) {
      signalCount++;
      signals.push('sharp-edges');
      if (sharpEdgeRatio > 0.08) strongSignalCount++;
    }
    if (bridgeRatio > 0.22) {
      signalCount++;
      signals.push('bridge-reflection');
      if (bridgeRatio > 0.30) strongSignalCount++;
    }
    if (bridgeBrightRatio > 0.27) {
      signalCount++;
      signals.push('bridge-bright');
      if (bridgeBrightRatio > 0.35) strongSignalCount++;
    }
    if (bridgeEdgeRatio > 0.16) {
      signalCount++;
      signals.push('bridge-edges');
      if (bridgeEdgeRatio > 0.22) strongSignalCount++;
    }
    if (templeEdgeRatio > 0.25) {
      signalCount++;
      signals.push('temple');
      if (templeEdgeRatio > 0.32) strongSignalCount++;
    }
    if (smoothRatio > 0.32 && brightRatio > 0.16) {
      signalCount++;
      signals.push('smooth+bright');
    }
    if (darkEdgeRatio > 0.10 && edgeRatio > 0.12) {
      signalCount++;
      signals.push('dark-frames');
    }

    const hasStrongScore = glassesScore > 0.07;
    const hasMultipleSignals = signalCount >= 2;
    const hasVeryStrongSignal =
      reflectionRatio > 0.20 ||
      bridgeRatio > 0.32 ||
      (bridgeBrightRatio > 0.35 && bridgeEdgeRatio > 0.20) ||
      templeEdgeRatio > 0.33 ||
      strongSignalCount >= 1;

    const hasGlasses = hasStrongScore && (hasMultipleSignals || hasVeryStrongSignal);

    console.log(`👓 GLASSES DETECTION:
  Reflections: ${(reflectionRatio * 100).toFixed(1)}% | Bright: ${(brightRatio * 100).toFixed(1)}%
  Edges: ${(edgeRatio * 100).toFixed(1)}% | Sharp: ${(sharpEdgeRatio * 100).toFixed(1)}% | Dark: ${(darkEdgeRatio * 100).toFixed(1)}%
  Smooth: ${(smoothRatio * 100).toFixed(1)}% | Texture: ${avgTextureVariance.toFixed(1)}
  Bridge: ${(bridgeRatio * 100).toFixed(1)}% | BridgeBright: ${(bridgeBrightRatio * 100).toFixed(1)}% | BridgeEdge: ${(bridgeEdgeRatio * 100).toFixed(1)}%
  Temple: ${(templeEdgeRatio * 100).toFixed(1)}%
  SCORE: ${(glassesScore * 100).toFixed(1)}% | Signals: ${signalCount} [${signals.join(', ')}]
  DETECTED: ${hasGlasses ? '✅ YES' : '❌ NO'}`);

    return hasGlasses;
  };

  const calculateBrightness = (video: HTMLVideoElement, face: FacePosition): number => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const faceLeft = Math.floor(face.x - face.width / 2);
    const faceRight = Math.floor(face.x + face.width / 2);
    const faceTop = Math.floor(face.y - face.height / 2);
    const faceBottom = Math.floor(face.y + face.height / 2);

    const imageData = ctx.getImageData(
      Math.max(0, faceLeft),
      Math.max(0, faceTop),
      Math.min(canvas.width - faceLeft, faceRight - faceLeft),
      Math.min(canvas.height - faceTop, faceBottom - faceTop)
    );

    const data = imageData.data;
    let totalBrightness = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 20) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      count++;
    }

    return count > 0 ? totalBrightness / count : 0;
  };

  const checkCentered = (face: FacePosition, width: number, height: number): boolean => {
    const centerX = width / 2;
    const centerY = height / 2;
    const normalizedCenterX = (centerX / width) * 390;
    const normalizedCenterY = (centerY / height) * 844;

    const xDiff = Math.abs(face.x - normalizedCenterX);
    const yDiff = Math.abs(face.y - normalizedCenterY);

    console.log(`Center check: xDiff=${xDiff.toFixed(0)}, yDiff=${yDiff.toFixed(0)}`);

    return xDiff < 60 && yDiff < 100;
  };

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = undefined;
    }
    setCountdown(null);
    validationHistoryRef.current = [];
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    console.log(`⏱️ Countdown started: ${count}`);

    countdownIntervalRef.current = window.setInterval(() => {
      const allStillValid = Object.values(currentValidationRef.current).every(v => v === true);

      if (!allStillValid) {
        console.log('⚠️ Validation lost during countdown');
        stopCountdown();
        return;
      }

      count--;
      console.log(`⏱️ Countdown: ${count}`);

      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(0);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = undefined;
        }
        console.log('📸 Capturing photo now!');
        setTimeout(() => capturePhoto(), 100);
      }
    }, 1000);
  };



  const capturePhoto = async () => {


    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {

      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;
    }

    // 1️⃣ canvas size = video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 2️⃣ draw mirrored video frame
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 3️⃣ draw SVG overlay on canvas
    const svg = document.querySelector('#faceMeshSvg') as SVGSVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    }

    // 4️⃣ export final image
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageData);
  };

  const allValidationsPass = Object.values(validation).every(v => v === true);

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4">
      <div className="relative w-[390px] max-w-full h-[844px] rounded-[36px] overflow-hidden bg-black shadow-2xl">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />

        <canvas ref={canvasRef} className="hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#F28C2A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">Loading AI Model...</p>
            </div>
          </div>
        )}

        <div className="absolute top-10 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <div className="absolute left-1 top-0 h-7 w-2.5 rotate-[28deg] rounded-full bg-white/95" />
              <div className="absolute left-4 top-1 h-7 w-2.5 rotate-[28deg] rounded-full bg-white/75" />
            </div>
            <div className="text-white text-[30px] font-semibold tracking-tight drop-shadow-lg">
              Dermalens
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="280" height="380" viewBox="0 0 280 380" className="opacity-80">
            <ellipse
              cx="140"
              cy="190"
              rx="130"
              ry="170"
              fill="none"
              stroke={allValidationsPass ? "#F28C2A" : "white"}
              strokeWidth="3"
              strokeDasharray="8 4"
              className="transition-all duration-300"
            />
          </svg>
        </div>

        {validation.faceDetected && (() => {
          const meshWidth = 220;
          const meshHeight = 275;
          const centerX = facePosition.x;
          const centerY = facePosition.y;
          const scale = Math.min(
            facePosition.width / meshWidth,
            facePosition.height / meshHeight
          ) * 1.1;
          return (
            <svg
              id="faceMeshSvg"
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
              viewBox="0 0 390 844"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="meshGradientCam" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={allValidationsPass ? "#fb923c" : "#ffffff"} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={allValidationsPass ? "#f97316" : "#ffffff"} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={allValidationsPass ? "#ea580c" : "#ffffff"} stopOpacity="0.9" />
                </linearGradient>
                <filter id="glowCam">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${centerX}, ${centerY}) scale(${scale})`} filter="url(#glowCam)" className="transition-transform duration-75 ease-out">
                <line x1="0" y1="-120" x2="0" y2="155" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -90 -95 Q 0 -120 90 -95" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.8" />
                <line x1="-90" y1="-95" x2="-100" y2="-65" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <line x1="90" y1="-95" x2="100" y2="-65" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -85 -60 Q -40 -70 0 -70 Q 40 -70 85 -60" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.65" />

                <path d="M -100 -65 L -105 -30" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 100 -65 L 105 -30" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -82 -52 Q -60 -55 -50 -48" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2" opacity="0.75" />
                <path d="M 82 -52 Q 60 -55 50 -48" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2" opacity="0.75" />

                <ellipse cx="-65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2.5" opacity="0.8" />
                <ellipse cx="65" cy="-30" rx="20" ry="14" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2.5" opacity="0.8" />

                <ellipse cx="-65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />
                <ellipse cx="65" cy="-30" rx="15" ry="10" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />

                <path d="M -48 -35 Q -40 -38 -32 -35" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.65" />
                <path d="M 48 -35 Q 40 -38 32 -35" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.65" />

                <line x1="-85" y1="-30" x2="-48" y2="-30" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />
                <line x1="85" y1="-30" x2="48" y2="-30" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />

                <line x1="-65" y1="-44" x2="-65" y2="-16" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.55" />
                <line x1="65" y1="-44" x2="65" y2="-16" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.55" />

                <path d="M -105 -30 Q -90 -10 -90 15" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 105 -30 Q 90 -10 90 15" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <line x1="0" y1="-10" x2="0" y2="45" stroke="url(#meshGradientCam)" strokeWidth="2.5" opacity="0.9" />
                <line x1="0" y1="45" x2="-12" y2="48" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <line x1="0" y1="45" x2="12" y2="48" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />

                <line x1="-15" y1="-5" x2="15" y2="-5" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />
                <line x1="-18" y1="10" x2="18" y2="10" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />
                <line x1="-20" y1="25" x2="20" y2="25" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />

                <path d="M -20 45 Q -10 50 0 52 Q 10 50 20 45" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />

                <path d="M -90 15 Q -75 35 -65 55" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 90 15 Q 75 35 65 55" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -40 25 Q -45 40 -50 55" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2" opacity="0.75" />
                <path d="M 40 25 Q 45 40 50 55" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2" opacity="0.75" />

                <path d="M -65 55 L -60 80" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 65 55 L 60 80" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -105 -30 L -110 10" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <path d="M 105 -30 L 110 10" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <path d="M -110 10 L -105 50" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <path d="M 110 10 L 105 50" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />

                <path d="M -50 55 Q -35 60 -28 70" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.65" />
                <path d="M 50 55 Q 35 60 28 70" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.65" />

                <path d="M -60 80 Q -45 85 -35 88" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 60 80 Q 45 85 35 88" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -35 88 Q -20 93 0 95" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2.5" opacity="0.8" />
                <path d="M 35 88 Q 20 93 0 95" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2.5" opacity="0.8" />

                <ellipse cx="0" cy="78" rx="32" ry="15" fill="none" stroke="url(#meshGradientCam)" strokeWidth="2" opacity="0.75" />

                <path d="M -28 72 Q -18 75 -8 76" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />
                <path d="M 28 72 Q 18 75 8 76" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />
                <path d="M -8 76 Q 0 77 8 76" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />

                <path d="M -28 84 Q -18 82 -8 82" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />
                <path d="M 28 84 Q 18 82 8 82" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />
                <path d="M -8 82 Q 0 81 8 82" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.2" opacity="0.6" />

                <path d="M -28 70 Q 0 73 28 70" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <path d="M -30 86 Q 0 92 30 86" fill="none" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />

                <path d="M -60 80 Q -50 100 -40 115" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 60 80 Q 50 100 40 115" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -40 115 Q -30 130 -18 140" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />
                <path d="M 40 115 Q 30 130 18 140" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M -18 140 Q 0 148 18 140" fill="none" stroke="url(#meshGradientCam)" strokeWidth="3" opacity="0.85" />

                <path d="M 0 95 L 0 120" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.7" />
                <path d="M -10 115 L 10 115" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />
                <path d="M -12 130 L 12 130" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.6" />

                <line x1="-90" y1="-95" x2="90" y2="-95" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-100" y1="-65" x2="100" y2="-65" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-105" y1="-30" x2="105" y2="-30" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-110" y1="10" x2="110" y2="10" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-105" y1="50" x2="105" y2="50" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-60" y1="80" x2="60" y2="80" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />
                <line x1="-40" y1="115" x2="40" y2="115" stroke="url(#meshGradientCam)" strokeWidth="1.5" opacity="0.6" />

                <line x1="-50" y1="-10" x2="-30" y2="-10" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.5" />
                <line x1="50" y1="-10" x2="30" y2="-10" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.5" />

                <line x1="-55" y1="30" x2="-35" y2="30" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.5" />
                <line x1="55" y1="30" x2="35" y2="30" stroke="url(#meshGradientCam)" strokeWidth="1" opacity="0.5" />

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
                    fill={allValidationsPass ? "#fb923c" : "#ffffff"}
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
          );
        })()}

        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-32 h-32 rounded-full bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center animate-pulse">
              <span className="text-6xl font-bold text-[#F28C2A]">{countdown}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-4 right-4 space-y-2">
          {allValidationsPass && stabilityProgress < 100 && (
            <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/90">Hold steady...</span>
                <span className="text-sm font-bold text-[#F28C2A]">{Math.round(stabilityProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F28C2A] transition-all duration-200"
                  style={{ width: `${stabilityProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.faceDetected ? 'bg-green-500/20 border border-green-500/40' : ''}`}>
            {validation.faceDetected ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-white/60 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.faceDetected ? 'text-green-100' : 'text-white/80'}`}>
              Face detected
            </span>
          </div>

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.centered ? 'bg-green-500/20 border border-green-500/40' : ''}`}>
            {validation.centered ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-white/60 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.centered ? 'text-green-100' : 'text-white/80'}`}>
              Center your face
            </span>
          </div>

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.lighting ? 'bg-green-500/20 border border-green-500/40' : ''}`}>
            {validation.lighting ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Zap className="w-5 h-5 text-white/60 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.lighting ? 'text-green-100' : 'text-white/80'}`}>
              {avgBrightness < 60 ? 'More light needed' : avgBrightness > 220 ? 'Too bright' : 'Good lighting'}
            </span>
          </div>

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.lookingStraight ? 'bg-green-500/20 border border-green-500/40' : ''}`}>
            {validation.lookingStraight ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Eye className="w-5 h-5 text-white/60 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.lookingStraight ? 'text-green-100' : 'text-white/80'}`}>
              Look straight ahead
            </span>
          </div>

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.noGlasses ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/30 border border-red-500/50'}`}>
            {validation.noGlasses ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Glasses className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.noGlasses ? 'text-green-100' : 'text-red-100'}`}>
              {validation.noGlasses ? 'No glasses detected' : 'Please remove glasses'}
            </span>
          </div>

          <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl transition-all ${validation.distance ? 'bg-green-500/20 border border-green-500/40' : ''}`}>
            {validation.distance ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-white/60 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${validation.distance ? 'text-green-100' : 'text-white/80'}`}>
              {facePosition.width < 100 ? 'Move closer' : facePosition.width > 320 ? 'Move back' : 'Perfect distance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

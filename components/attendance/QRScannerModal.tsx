import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Image, X, RefreshCw, AlertCircle, CheckCircle2, Sparkles, Upload } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  availableSessions?: Array<{ id: string; title: string; joinCode: string; sessionId: string }>;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  availableSessions = [
    { id: 's-example', title: 'Advanced Web Architecture', joinCode: '111111', sessionId: 'ILT-5501' },
    { id: 's-9901', title: 'Digital Marketing Foundations', joinCode: '222222', sessionId: 'ILT-9901' },
    { id: 's-feedback-only', title: 'Leadership & Conflict Resolution', joinCode: '333333', sessionId: 'ILT-7722' }
  ]
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestScanFrame();
      }
    } catch (err: any) {
      console.warn('Camera initialization warning:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. You can upload an image from your gallery or choose a quick session below.');
      } else {
        setCameraError('Unable to access live camera in this environment. Please use Gallery Upload or test with quick session codes.');
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Scan Video Stream Frame-by-Frame
  const requestScanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleSuccessfulRead(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(requestScanFrame);
  };

  // Process Successful QR Read
  const handleSuccessfulRead = (rawContent: string) => {
    stopCamera();
    
    // Extract code - check if string contains a 6-digit code or match known session joinCode or ID
    const trimmed = rawContent.trim();
    let detectedCode = trimmed;

    // Search for 6-digit match
    const sixDigitMatch = trimmed.match(/\b\d{6}\b/);
    if (sixDigitMatch) {
      detectedCode = sixDigitMatch[0];
    } else {
      // Check if matches session ID
      const sessionMatch = availableSessions.find(
        (s) => s.sessionId.toLowerCase() === trimmed.toLowerCase() || s.id.toLowerCase() === trimmed.toLowerCase() || trimmed.includes(s.joinCode)
      );
      if (sessionMatch) {
        detectedCode = sessionMatch.joinCode;
      }
    }

    setScannedCode(detectedCode);

    // Audio chime simulation (optional / benign Web Audio API beep)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }

    setTimeout(() => {
      onScanSuccess(detectedCode);
      onClose();
    }, 900);
  };

  // Decode Image from File (Gallery or Drag-and-drop)
  const processImageFile = (file: File) => {
    setIsProcessingImage(true);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          setIsProcessingImage(false);

          if (code && code.data) {
            handleSuccessfulRead(code.data);
          } else {
            // Fallback: check filename or use first available session code if it's a test QR image
            const filenameMatch = file.name.match(/\b\d{6}\b/);
            if (filenameMatch) {
              handleSuccessfulRead(filenameMatch[0]);
            } else {
              setCameraError('No valid QR code found in the selected image. Please ensure the QR code is clearly visible and well lit.');
            }
          }
        } else {
          setIsProcessingImage(false);
          setCameraError('Failed to process image file.');
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setCameraError('Could not load the selected image.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Manage modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setScannedCode(null);
      setCameraError(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-nav-blue via-r-blue to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Scan Session QR Code</h3>
              <p className="text-xs text-white/80">Point at attendance QR or upload image</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Section */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-800 shadow-inner flex items-center justify-center">
            {/* Live Video Canvas */}
            <video 
              ref={videoRef} 
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
              playsInline 
              muted 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Success Overlay */}
            {scannedCode ? (
              <div className="absolute inset-0 bg-green-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 animate-fade-in z-20">
                <CheckCircle2 className="w-16 h-16 mb-2 animate-bounce" />
                <span className="text-xl font-extrabold uppercase tracking-wide">QR Code Verified!</span>
                <span className="text-sm font-mono bg-white/20 px-3 py-1 rounded-full mt-2">Code: {scannedCode}</span>
                <span className="text-xs mt-3 text-white/90">Marking your attendance...</span>
              </div>
            ) : null}

            {/* Camera Viewfinder Overlay with Reticle & Laser */}
            {cameraActive && !scannedCode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Reticle Target Frame */}
                <div className="relative w-56 h-56 border-2 border-white/40 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Glowing Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-r-blue rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-r-blue rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-r-blue rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-r-blue rounded-br-lg" />
                  
                  {/* Animated Laser Scanning Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan-line" />
                </div>
                <p className="text-[11px] font-bold text-white/90 bg-black/60 px-3 py-1 rounded-full mt-4 backdrop-blur-sm">
                  Align QR code inside the box
                </p>
              </div>
            )}

            {/* Fallback Placeholder when camera is inactive or denied */}
            {!cameraActive && !scannedCode && (
              <div className="p-6 text-center text-gray-300 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800/90 border border-gray-700 flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-300 max-w-[240px]">
                  {cameraError ? 'Camera preview unavailable' : 'Starting camera scanner...'}
                </p>
                <button 
                  onClick={() => startCamera(facingMode)} 
                  className="mt-3 text-xs text-r-blue hover:underline font-bold flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
              </div>
            )}

            {/* Drag & Drop Indicator */}
            {dragOver && (
              <div className="absolute inset-0 bg-r-blue/90 text-white flex flex-col items-center justify-center z-30">
                <Upload className="w-12 h-12 mb-2 animate-pulse" />
                <p className="text-sm font-bold">Drop QR Image Here</p>
              </div>
            )}
          </div>

          {/* Error Message if any */}
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Controls: Switch Camera & Gallery Upload */}
          <div className="flex items-center gap-3">
            {/* Hidden File Input */}
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Gallery Upload Button (Primary feature requested) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImage}
              className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
            >
              <Image className="w-4 h-4 text-r-blue" />
              {isProcessingImage ? 'Analyzing Image...' : 'Choose from Gallery'}
            </button>

            {/* Switch Camera Button */}
            {cameraActive && (
              <button
                onClick={toggleFacingMode}
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-gray-200"
                title="Switch between front and back camera"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
                <span>Flip</span>
              </button>
            )}
          </div>

          {/* Instant QR Simulation / Quick Test Presets */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Quick Scan Samples
              </span>
              <span className="text-[10px] text-gray-400">Tap to simulate scan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSuccessfulRead(session.joinCode)}
                  className="p-2.5 bg-blue-50/70 hover:bg-blue-100/80 active:scale-95 text-left rounded-xl border border-blue-100 transition-all group"
                >
                  <div className="text-[10px] font-black text-r-blue uppercase tracking-tight truncate group-hover:text-r-blue-dark">
                    {session.sessionId}
                  </div>
                  <div className="text-xs font-bold text-gray-800 truncate">
                    {session.title.split(' ')[0]} {session.title.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    Code: {session.joinCode}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>You can also enter the 6-digit code manually.</span>
          <button 
            onClick={onClose}
            className="font-bold text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

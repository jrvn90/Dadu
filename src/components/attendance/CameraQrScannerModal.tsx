import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  SwitchCamera,
  Zap,
  Volume2,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (tokenOrNis: string) => void;
  targetClassName?: string;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  targetClassName = 'Kelas',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Stop camera stream cleanly
  const stopCameraStream = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.warn('Error stopping media track:', err);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Frame processing loop for QR decoding
  const processVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && code.data.trim()) {
            const scannedData = code.data.trim();
            if (scannedData !== lastScanned) {
              setLastScanned(scannedData);
              onScanSuccess(scannedData);

              // Draw scan highlight box
              ctx.beginPath();
              ctx.lineWidth = 4;
              ctx.strokeStyle = '#10b981';
              ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
              ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
              ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
              ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
              ctx.closePath();
              ctx.stroke();

              // Prevent instant re-scanning of the same card in < 1.5s
              setTimeout(() => {
                setLastScanned(null);
              }, 1500);
            }
          }
        } catch (e) {
          console.warn('QR decode loop exception:', e);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
  }, [lastScanned, onScanSuccess]);

  // Start camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();

    // Check browser support
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraState('unsupported');
      setErrorMessage(
        'Peramban Anda atau mode sandbox iframe tidak mengizinkan akses kamera langsung. Silakan gunakan input manual / USB barcode scanner di bawah.'
      );
      return;
    }

    setCameraState('requesting');
    setErrorMessage('');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS/Safari
        await videoRef.current.play();
        setCameraState('active');
        animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      }
    } catch (err: any) {
      console.error('Camera getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage(
          'Izin akses kamera tidak diberikan oleh peramban. Klik ikon gembok di bilah alamat browser untuk mengizinkan kamera, atau gunakan input kode di bawah.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('error');
        setErrorMessage('Perangkat kamera tidak ditemukan pada perangkat ini.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraState('error');
        setErrorMessage('Kamera sedang digunakan oleh aplikasi lain.');
      } else {
        setCameraState('error');
        setErrorMessage(
          err.message || 'Gagal memulai kamera. Anda tetap dapat menggunakan input manual / USB barcode scanner.'
        );
      }
    }
  }, [facingMode, processVideoFrame, stopCameraStream]);

  // Mount/unmount lifecycle
  useEffect(() => {
    if (isOpen) {
      startCameraStream();
    } else {
      stopCameraStream();
      setCameraState('idle');
      setErrorMessage('');
      setLastScanned(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCameraStream, stopCameraStream]);

  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onScanSuccess(manualInput.trim());
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Kamera Pemindai Kartu QR Siswa</h2>
              <p className="text-[11px] text-slate-400">Target Rombel: {targetClassName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport Area */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {/* Hidden Canvas for QR Analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* HTML5 Video Stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
            muted
            playsInline
          />

          {/* Scan Target Overlay Box */}
          {cameraState === 'active' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center shadow-2xl">
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Scan Line */}
                <div className="w-full h-0.5 bg-emerald-400/80 shadow-lg shadow-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] font-medium text-slate-200 mt-4 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 backdrop-blur-xs">
                Arahkan QR Code Kartu Siswa ke dalam kotak
              </p>
            </div>
          )}

          {/* Loading / Permission requesting state */}
          {cameraState === 'requesting' && (
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-200">Meminta izin dan mengaktifkan kamera...</p>
              <p className="text-[11px] text-slate-400">Pastikan Anda memilih "Allow" pada dialog izin peramban.</p>
            </div>
          )}

          {/* Camera Denied / Error / Unsupported state */}
          {(cameraState === 'denied' || cameraState === 'unsupported' || cameraState === 'error') && (
            <div className="p-6 text-center max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <CameraOff className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">
                {cameraState === 'denied'
                  ? 'Izin Kamera Belum Diberikan'
                  : cameraState === 'unsupported'
                  ? 'Kamera Tidak Didukung'
                  : 'Kamera Tidak Tersedia'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={startCameraStream}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera Controls Bar (Over Video) */}
          {cameraState === 'active' && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-xs transition-colors"
                title="Ganti Kamera Depan / Belakang"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Fallback & USB Scanner Support */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Input Alternatif (Scanner USB / Manual NIS):</span>
            <span className="text-[10px] text-emerald-400 font-mono">Real-time Ready</span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Ketik NIS siswa atau scan barcode USB di sini..."
              className="grow px-3.5 py-2.5 rounded-xl bg-slate-900 text-white placeholder-slate-500 border border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Catat Hadir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

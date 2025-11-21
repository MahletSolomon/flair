"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import { Button } from "@/components/ui/button";

type Props = {
  onDetected: (value: string) => void;
  onClose: () => void;
};

export function CameraBarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Basic browser support check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not supported in this browser.");
      setIsStarting(false);
      return;
    }

    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(
        undefined, // let library pick the default camera
        videoEl,
        (result, err, controls) => {
          if (!controlsRef.current && controls) {
            controlsRef.current = controls;
          }

          if (result) {
            const text = result.getText();
            // Stop scanning as soon as we get a barcode
            controlsRef.current?.stop();
            onDetected(text);
            onClose();
          }
        }
      )
      .then(() => {
        setIsStarting(false);
      })
      .catch((e) => {
        console.error(e);
        setError(
          e?.message ||
            "Could not start camera. Check permissions and try again."
        );
        setIsStarting(false);
      });

    return () => {
      try {
        controlsRef.current?.stop();
        // codeReader.reset();
      } catch {
        // ignore cleanup errors
      }

      // Also stop the media stream tracks if any
      const stream = videoEl.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
          <p className="text-sm font-medium text-slate-100">
            Scan barcode with camera
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            Close
          </Button>
        </div>

        <div className="relative aspect-[3/4] bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {/* Overlay frame */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1/3 border-2 border-emerald-400/80 rounded-lg" />
          </div>
        </div>

        <div className="px-4 py-3 text-xs text-slate-300 space-y-1">
          {isStarting && !error && <p>Starting camera…</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!error && (
            <p>Align the barcode inside the box. It will scan automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}

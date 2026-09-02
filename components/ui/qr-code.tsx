'use client';

import React, { useMemo, useRef } from 'react';
import { generateQRCode, toStyledSVG, toStyledCanvas, type ErrorCorrectionLevel } from '@/lib/qr-generator';
import { DownloadIcon } from '@/components/ui/svgs/icons';
import { toast } from 'sonner';

export interface QRCodeProps {
  value: string;
  size?: number; // visual display width/height in px
  scale?: number;
  margin?: number;
  dotScale?: number;
  darkColor?: string;
  lightColor?: string;
  eyeColor?: string;
  eyeInnerColor?: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  className?: string;
  fileName?: string;
}

export function downloadQRCode({
  value,
  fileName = 'qr-code',
  errorCorrectionLevel = 'M',
  dotScale = 0.42,
  darkColor = '#0B132B',
  lightColor = '#FFFFFF',
  eyeColor,
  eyeInnerColor,
}: {
  value: string;
  fileName?: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  dotScale?: number;
  darkColor?: string;
  lightColor?: string;
  eyeColor?: string;
  eyeInnerColor?: string;
}) {
  if (!value) return;
  try {
    const qr = generateQRCode(value, { errorCorrectionLevel });
    const canvas = document.createElement('canvas');
    toStyledCanvas(qr, canvas, {
      scale: 24, // High-res export
      margin: 4,
      dotScale,
      darkColor,
      lightColor,
      eyeColor: eyeColor ?? darkColor,
      eyeInnerColor: eyeInnerColor ?? eyeColor ?? darkColor,
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code downloaded as PNG');
  } catch {
    toast.error('Failed to download QR code');
  }
}

export function QRCode({
  value,
  size = 200,
  scale = 10,
  margin = 3,
  dotScale = 0.42,
  darkColor = '#0B132B',
  lightColor = '#FFFFFF',
  eyeColor,
  eyeInnerColor,
  errorCorrectionLevel = 'M',
  className = '',
}: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate QR Matrix & styled SVG string
  const svgMarkup = useMemo(() => {
    if (!value) return '';
    try {
      const qr = generateQRCode(value, { errorCorrectionLevel });
      return toStyledSVG(qr, {
        scale,
        margin,
        dotScale,
        darkColor,
        lightColor,
        eyeColor: eyeColor ?? darkColor,
        eyeInnerColor: eyeInnerColor ?? eyeColor ?? darkColor,
      });
    } catch {
      return '';
    }
  }, [value, scale, margin, dotScale, darkColor, lightColor, eyeColor, eyeInnerColor, errorCorrectionLevel]);

  return (
    <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
      {/* QR Code Container with sleek surface frame */}
      <div
        className="flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:ring-white/10"
        style={{ width: size, height: size }}
      >
        {svgMarkup ? (
          <div
            className="h-full w-full select-none [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Generating QR...
          </div>
        )}
      </div>
    </div>
  );
}

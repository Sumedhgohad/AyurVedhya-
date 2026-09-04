import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw } from 'lucide-react';

interface Props {
  onSignatureCapture: (base64Png: string) => void;
}

export const SignaturePad: React.FC<Props> = ({ onSignatureCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    rect: DOMRect
  ) => {
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getCoords(e, rect);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getCoords(e, rect);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSigned) {
      onSignatureCapture(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setHasSigned(false);
    onSignatureCapture('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#7a7a7a',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <PenTool size={12} color="#0066cc" />
          Participant Digital e-Signature (NDCT 2019)
        </label>

        {hasSigned && (
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 400,
              color: '#7a7a7a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.08px',
              padding: 0,
              transition: 'color 0.12s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff453a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7a7a7a')}
          >
            <RotateCcw size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Canvas area */}
      <div
        style={{
          position: 'relative',
          border: `1px solid ${hasSigned ? 'rgba(0,102,204,0.4)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 11,
          background: '#000000',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={96}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSigned && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '-0.12px',
            }}
          >
            Sign here with mouse or touch
          </div>
        )}
      </div>
    </div>
  );
};

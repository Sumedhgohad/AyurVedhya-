import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, PRIMARY, PRIMARY_FOCUS, DANGER, R_MD, TYPE } from '../design';

interface Props { onSignatureCapture: (base64Png: string) => void; }

export const SignaturePad: React.FC<Props> = ({ onSignatureCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [signed,  setSigned]  = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = PRIMARY; ctx.lineWidth = 1.8;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, []);

  const coords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, rect: DOMRect) =>
    'touches' in e
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: e.clientX - rect.left, y: e.clientY - rect.top };

  const start = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = coords(e, canvas.getBoundingClientRect());
    ctx.beginPath(); ctx.moveTo(x, y); setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = coords(e, canvas.getBoundingClientRect());
    ctx.lineTo(x, y); ctx.stroke(); setSigned(true);
  };

  const stop = () => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && signed) onSignatureCapture(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.beginPath();
    setSigned(false); onSignatureCapture('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <PenTool size={12} color={PRIMARY} />
          Participant Digital e-Signature (NDCT 2019)
        </label>
        {signed && (
          <button type="button" onClick={clear}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 400, color: INK_48, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.color = DANGER)}
            onMouseLeave={e => (e.currentTarget.style.color = INK_48)}
          >
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>

      <div style={{ position: 'relative', border: `1px solid ${signed ? PRIMARY_FOCUS : HAIRLINE}`, borderRadius: R_MD, background: CANVAS, overflow: 'hidden', transition: 'border-color 0.15s' }}>
        <canvas
          ref={canvasRef} width={400} height={88}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
        {!signed && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: INK_48, letterSpacing: '-0.12px' }}>
            Sign here with mouse or touch
          </div>
        )}
      </div>
    </div>
  );
};

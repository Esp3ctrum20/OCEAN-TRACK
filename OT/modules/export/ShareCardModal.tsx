
import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Camera, Loader2, QrCode, Check, Copy, ShieldCheck } from 'lucide-react';
import { DercEntry } from '../../types';
import { generateFichaCanvas } from './ficha/FichaGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  derc?: DercEntry;
  dercs?: DercEntry[];
  totalKg: number;
  yieldPct: number;
  title?: string;
}

const ShareCardModal: React.FC<Props> = ({ isOpen, onClose, derc, dercs, totalKg, yieldPct, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const label = derc ? `Lote: ${derc.lote}` : `Reporte: ${title || 'Consolidado'}`;
  const subLabel = derc ? `DERC: ${derc.dercId}` : `Lotes: ${dercs?.length || 0} unidades`;

  const qrText = encodeURIComponent(
    `*OCEANTRACK REPORT*\n` +
    `${label}\n` +
    `${subLabel}\n` +
    `Rendimiento: ${yieldPct.toFixed(2)}%\n` +
    `Total: ${totalKg.toLocaleString()} KG`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/?text=${qrText}`;

  useEffect(() => {
    if (isOpen) {
      const renderFicha = async () => {
        if (!canvasRef.current) return;
        setIsGenerating(true);
        try {
          const target = derc || dercs || [];
          const url = await generateFichaCanvas(canvasRef.current, target, totalKg, yieldPct, qrUrl);
          setPreviewUrl(url);
        } catch (err) {
          console.error("Error drawing ficha:", err);
        } finally {
          setIsGenerating(false);
        }
      };
      
      const timer = setTimeout(renderFicha, 100);
      return () => clearTimeout(timer);
    } else {
      setPreviewUrl(null);
      setCopyState('idle');
    }
  }, [isOpen, derc, dercs, totalKg, yieldPct]);

  // Auto-copy al estar lista la imagen
  useEffect(() => {
    if (previewUrl && copyState === 'idle') {
      handleCopyToClipboard();
    }
  }, [previewUrl]);

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current || copyState === 'copying') return;
    setCopyState('copying');
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob error');
        const data = [new ClipboardItem({ 'image/png': blob })];
        await navigator.clipboard.write(data);
        setCopyState('success');
        setTimeout(() => setCopyState('idle'), 5000);
      }, 'image/png');
    } catch (err) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/5 w-full max-w-5xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300 relative">
        
        <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/2" />
          <div className="relative shadow-2xl rounded-[2rem] overflow-hidden border border-white/5 max-h-full">
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Generando Reporte Industrial...</span>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && (
              <img src={previewUrl} alt="Report Preview" className="max-h-[78vh] w-auto block object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-500" />
            )}
          </div>
        </div>

        <div className="w-full md:w-[380px] p-10 flex flex-col justify-between bg-zinc-900 border-l border-white/5 relative">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">Ficha Digital</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{derc ? 'Individual' : 'Reporte Global'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-zinc-800 rounded-full text-zinc-600 hover:text-white transition-all group">
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center gap-5 text-center shadow-inner group">
              <div className="flex items-center gap-2 mb-1">
                 <QrCode className="w-3 h-3 text-indigo-500" />
                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Smart QR Share</p>
              </div>
              <div className="w-40 h-40 bg-white p-3.5 rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                 <img src={qrUrl} alt="QR" className="w-full h-full" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed px-2">
                Escanee el código para validar este reporte en el sistema digital.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <button 
              onClick={handleCopyToClipboard}
              disabled={isGenerating || copyState === 'copying'}
              className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group ${
                copyState === 'success' 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-indigo-600/40 hover:shadow-indigo-600/60'
              }`}
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              {copyState === 'success' ? (
                <><Check className="w-5 h-5" /> ¡Copiado!</>
              ) : (
                <><Copy className="w-5 h-5" /> Copiar para WhatsApp</>
              )}
            </button>
            
            <button 
              onClick={() => {
                if (!previewUrl) return;
                const a = document.createElement('a');
                a.download = derc ? `LOTE_${derc.lote}_FICHA.png` : `REPORTE_GLOBAL_${new Date().toISOString().slice(0,10)}.png`;
                a.href = previewUrl;
                a.click();
              }}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-[1.8rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <Download className="w-4 h-4" /> Guardar en Galería
            </button>

            <div className="flex items-center justify-center gap-3 mt-8 opacity-20 group">
               <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-indigo-500 transition-colors" />
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.5em]">OceanTrack Industrial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCardModal;

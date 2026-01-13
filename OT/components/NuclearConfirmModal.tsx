
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Timer, Lock, Unlock, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const NuclearConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, description }) => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  const HOLD_DURATION = 5000; // 5 segundos

  useEffect(() => {
    if (isPressing) {
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          handleSuccess();
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPressing]);

  const handleSuccess = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPressing(false);
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-[#0c0c0e] border border-rose-500/30 w-full max-w-md rounded-[3rem] shadow-[0_0_100px_rgba(244,63,94,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-10 flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-rose-600/10 rounded-3xl flex items-center justify-center border border-rose-500/20 shadow-inner">
            <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{title}</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
              {description}
            </p>
          </div>

          <div className="w-full bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
             <Timer className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] text-zinc-400 font-bold text-left uppercase leading-relaxed">
               Requiere autorización nuclear: <span className="text-white">Mantenga presionado el botón de abajo por 5 segundos</span> para autorizar la sincronización histórica.
             </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              className={`w-full relative h-20 rounded-[2rem] overflow-hidden transition-all active:scale-95 group ${isPressing ? 'bg-rose-600 shadow-2xl' : 'bg-zinc-900 border border-white/10 hover:border-rose-500/30'}`}
            >
               {/* BARRA DE PROGRESO INTERNA */}
               <div 
                 className="absolute inset-y-0 left-0 bg-rose-500 transition-all duration-75 pointer-events-none" 
                 style={{ width: `${progress}%`, opacity: isPressing ? 1 : 0 }} 
               />
               
               <div className="absolute inset-0 flex items-center justify-center gap-4 z-10 pointer-events-none">
                  {progress >= 100 ? <Unlock className="w-6 h-6 text-white" /> : <Lock className={`w-6 h-6 ${isPressing ? 'text-white' : 'text-zinc-700 group-hover:text-rose-400'}`} />}
                  <span className={`text-xs font-black uppercase tracking-[0.3em] ${isPressing ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                    {isPressing ? `Autorizando ${progress.toFixed(0)}%` : 'Presión Sostenida'}
                  </span>
               </div>
            </button>

            <button onClick={onClose} className="text-[9px] font-black text-zinc-700 hover:text-zinc-500 uppercase tracking-widest transition-all">Abordar Protocolo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuclearConfirmModal;


import React from 'react';
import { Trash2, RefreshCcw, AlertTriangle, Clock } from 'lucide-react';
import { AppTheme } from '../../types';

interface Deletable {
  id: string;
  lote: string;
  dercId: string;
  deletedAt?: string;
}

interface Props {
  items: Deletable[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  // Added theme to Props to resolve TS error in App.tsx
  theme?: AppTheme;
}

const TrashView: React.FC<Props> = ({ items, onRestore, onPermanentDelete, theme }) => {
  const getRemainingTime = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt);
    const expiryDate = new Date(deleteDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) return "Expirado";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h restantes`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
        <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-600/40">
          <Trash2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestión de Residuos</h2>
          <p className="text-sm text-rose-400/70 font-medium uppercase tracking-widest mt-1">
            Ventana de seguridad de 72 horas • Purga Automática
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="h-80 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-600">
          <Trash2 className="w-12 h-12 mb-4 opacity-10" />
          <p className="font-black uppercase tracking-[0.3em] text-[10px]">El archivo de residuos está limpio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] hover:border-rose-500/30 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">{item.dercId}</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Lote: {item.lote}</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black text-amber-500 uppercase tabular-nums">
                    {item.deletedAt ? getRemainingTime(item.deletedAt) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => onRestore(item.id)}
                  className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Recuperar
                </button>
                <button 
                  onClick={() => onPermanentDelete(item.id)}
                  className="flex-1 py-3.5 bg-rose-600/10 border border-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Purga Final
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-600/5 blur-3xl rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashView;

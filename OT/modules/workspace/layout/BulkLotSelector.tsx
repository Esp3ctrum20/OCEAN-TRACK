import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckSquare, Square, Zap, ChevronRight, Activity, History, ShieldAlert, Archive, Search, Target, Box, PlaneTakeoff, PlaneLanding, Trash2 } from 'lucide-react';
import { DercEntry, AppTheme } from '../../../types';

interface BulkLotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableLots: Array<DercEntry & { isDocked?: boolean }>;
  operationalDate: string;
  onConfirm: (ids: string[]) => void;
  onPermanentDelete?: (id: string) => void;
  theme?: AppTheme;
}

export const BulkLotSelector: React.FC<BulkLotSelectorProps> = ({ 
  isOpen, onClose, availableLots, operationalDate, onConfirm, onPermanentDelete, theme
}) => {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const isLight = theme === 'pearl';

  useEffect(() => {
    if (!isOpen) {
      setPendingIds(new Set());
      setShowHistory(false);
      setSearchQuery('');
      setDeleteIdConfirm(null);
    }
  }, [isOpen]);

  const { todayLots, pastLots } = useMemo(() => {
    const today = availableLots.filter(l => l.date === operationalDate);
    const past = availableLots.filter(l => l.date !== operationalDate);
    return { todayLots: today, pastLots: past };
  }, [availableLots, operationalDate]);

  const displayedLots = useMemo(() => {
    const base = showHistory ? availableLots : todayLots;
    const filtered = !searchQuery ? base : base.filter(l => 
      l.lote.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.dercId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [...filtered].sort((a, b) => (a.isDocked === b.isDocked) ? 0 : a.isDocked ? 1 : -1);
  }, [showHistory, availableLots, todayLots, searchQuery]);

  if (!isOpen) return null;

  const togglePending = (id: string, isDocked?: boolean) => {
    if (isDocked) return;
    const newSet = new Set(pendingIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setPendingIds(newSet);
  };

  const handleDeleteLot = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteIdConfirm === id) {
      onPermanentDelete?.(id);
      setDeleteIdConfirm(null);
    } else {
      setDeleteIdConfirm(id);
      setTimeout(() => setDeleteIdConfirm(null), 3000);
    }
  };

  return (
    <div className={`absolute top-24 right-8 w-[460px] border rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] z-[120] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh] ring-1 transition-all ${
      isLight ? 'bg-white/95 backdrop-blur-xl border-zinc-200 ring-zinc-950/5' : 'bg-[#0c0c0e]/98 backdrop-blur-3xl border-zinc-800 ring-white/5 shadow-[0_50px_150px_rgba(0,0,0,1)]'
    }`}>
      
      <div className={`px-8 py-7 border-b transition-colors ${isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-950/60 border-zinc-800/60'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showHistory ? (isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-800 text-zinc-400') : 'bg-indigo-600/20 text-indigo-400 shadow-lg shadow-indigo-500/10'}`}>
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`text-[13px] font-black uppercase tracking-[0.2em] leading-none ${isLight ? 'text-zinc-950' : 'text-white'}`}>Hangar Industrial</h4>
              <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1.5 tracking-widest">
                {showHistory ? 'Explorando Almacén Maestro' : 'Lotes en Preparación / Reserva'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900' : 'text-zinc-600 hover:bg-zinc-800 hover:text-white'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3">
           <div className="flex-1 relative group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isLight ? 'text-zinc-300 group-focus-within:text-indigo-600' : 'text-zinc-700 group-focus-within:text-indigo-500'}`} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="IDENTIFICAR ADN..."
                className={`w-full border rounded-2xl pl-12 pr-4 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${
                  isLight ? 'bg-white border-zinc-200 text-zinc-950 focus:border-indigo-400' : 'bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-indigo-500/30'
                }`}
              />
           </div>
           <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <button onClick={() => setShowHistory(false)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${!showHistory ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white') : 'text-zinc-500'}`}>Hoy</button>
             <button onClick={() => setShowHistory(true)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${showHistory ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white') : 'text-zinc-500'}`}>Histórico</button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
        {displayedLots.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <PlaneLanding className={`w-12 h-12 mb-4 ${isLight ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <p className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Hangar Vacío</p>
          </div>
        ) : (
          displayedLots.map(l => {
            const isPending = pendingIds.has(l.id);
            const isToday = l.date === operationalDate;
            const isDocked = l.isDocked;
            const isDeleting = deleteIdConfirm === l.id;

            return (
              <div 
                key={l.id} 
                onClick={() => togglePending(l.id, isDocked)}
                className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all border relative overflow-hidden cursor-pointer ${
                  isDeleting ? 'bg-rose-50 border-rose-500 animate-pulse' :
                  isPending ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 
                  isDocked ? (isLight ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-emerald-500/5 border-emerald-500/20 opacity-50 grayscale') :
                  isToday ? (isLight ? 'bg-white border-zinc-100 hover:border-indigo-200' : 'bg-zinc-950 border-zinc-800 hover:border-indigo-500/50') : 
                  (isLight ? 'bg-zinc-50/50 border-transparent opacity-60 hover:opacity-100' : 'bg-zinc-950/40 border-zinc-900 opacity-60 hover:opacity-100')
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isPending ? 'bg-white border-white text-indigo-600' : 
                    isDocked ? 'bg-emerald-600 border-emerald-500 text-white' :
                    (isLight ? 'bg-white border-zinc-100 text-zinc-300' : 'bg-zinc-900 border-zinc-800 text-zinc-700 group-hover:border-zinc-700')
                  }`}>
                    {isDocked ? <PlaneTakeoff className="w-5 h-5" /> : 
                     isPending ? <CheckSquare className="w-5 h-5" /> : 
                     <Square className="w-5 h-5 opacity-40" />}
                  </div>
                  <div className="text-left">
                    <p className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isPending ? 'text-white' : isDocked ? 'text-emerald-600' : (isLight ? 'text-zinc-900' : 'text-zinc-200')}`}>{l.lote}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isPending ? 'text-indigo-200' : 'text-zinc-500'}`}>{l.dercId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  {isDocked ? (
                    <span className={`text-[7px] font-black px-2 py-1 rounded uppercase ${isLight ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-500/10 text-emerald-500'}`}>En Pista</span>
                  ) : isToday ? (
                    <span className={`text-[7px] font-black px-2 py-1 rounded uppercase animate-pulse ${isLight ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-500'}`}>Reserva</span>
                  ) : null}

                  {!isDocked && (
                    <button 
                      onClick={(e) => handleDeleteLot(e, l.id)}
                      className={`p-2 rounded-lg transition-all ${isDeleting ? 'bg-rose-600 text-white' : (isLight ? 'bg-zinc-100 text-zinc-400 hover:text-rose-600 hover:bg-rose-50' : 'bg-zinc-900 text-zinc-700 hover:text-rose-500')}`}
                      title={isDeleting ? "CONFIRMAR PURGA" : "Eliminar Permanentemente"}
                    >
                      {isDeleting ? <Zap className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`p-8 border-t transition-colors ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-950/80 border-zinc-800'}`}>
        <button 
          onClick={() => onConfirm(Array.from(pendingIds))}
          disabled={pendingIds.size === 0}
          className={`w-full py-5 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.8rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-20 disabled:grayscale ${isLight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40'}`}
        >
          {pendingIds.size === 0 ? "Seleccione Lotes" : `Lanzar Unidades a Pista (${pendingIds.size})`}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
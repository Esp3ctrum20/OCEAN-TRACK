
import React from 'react';
import { X, Zap, Box, Camera, Calendar, Pencil, Scale } from 'lucide-react';
import { AppTheme } from '../../../types';
import { GhostHint } from '../../../core/zero-mouse/ui/GhostHint';

interface Props {
  lote: string;
  dercId: string;
  productionDate: string; // Nueva propiedad
  index: number;
  yieldPct: number;
  weightFactor?: number;
  onRemove: () => void;
  onSnap: () => void;
  onEdit?: () => void;
  radarStats: { totalKgMatch: number; countMatch: number; pendingBoxes: number } | null;
  theme?: AppTheme;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const WorkspaceLotHeader: React.FC<Props> = ({
  lote, dercId, productionDate, index, yieldPct, weightFactor, onRemove, onSnap, onEdit, radarStats, theme, showHints, shortcuts
}) => {
  const isLight = theme === 'pearl';
  const isOptimal = yieldPct >= 98.5;

  return (
    <div className={`px-4 py-3 border-b flex flex-col gap-2 sticky top-0 z-30 transition-all duration-500 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#080809] border-zinc-900'
      } ${radarStats && radarStats.pendingBoxes > 0 ? (isLight ? 'ring-2 ring-emerald-500/20 bg-emerald-50/50' : 'ring-2 ring-emerald-500/40 bg-[#0c140c]') : radarStats ? 'opacity-40' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black tabular-nums transition-all ${radarStats && radarStats.pendingBoxes > 0
            ? (isLight ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]')
            : isOptimal
              ? (isLight ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5')
              : (isLight ? 'border-zinc-200 text-zinc-400 bg-zinc-50' : 'border-zinc-800 text-zinc-600')
            }`}>
            {(index + 1).toString().padStart(2, '0')}
          </div>
          <div>
            <h4 className={`text-sm font-black uppercase tracking-tight leading-none flex items-center gap-2 transition-colors ${isLight ? 'text-zinc-950' : 'text-white'}`}>
              {lote}
              {isOptimal && <Zap className="w-2.5 h-2.5 text-emerald-500" />}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-[7px] font-black uppercase tracking-[0.25em] transition-colors ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>{dercId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!radarStats && (
            <div className="flex flex-col items-end gap-1 mr-2 min-w-[70px]">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-900/50 border-white/5 text-zinc-500'
                }`}>
                <Calendar className="w-2.5 h-2.5" />
                <span className="text-[8px] font-black">{productionDate}</span>
              </div>
              <span className={`text-sm font-black tabular-nums leading-none ${isOptimal ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-amber-600' : 'text-amber-500')}`}>
                {yieldPct.toFixed(1)}%
              </span>
            </div>
          )}



          <button
            onClick={onEdit}
            data-lot={index}
            data-type="edit"
            data-header-btn="true"
            title="Editar Información de Lote"
            className={`relative p-1.5 border transition-all rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 focus:bg-amber-50 focus:text-amber-600' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-400'}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <GhostHint action="EDIT_LOT" shortcuts={shortcuts} visible={showHints} />
          </button>
          <button
            onClick={onSnap}
            data-lot={index}
            data-type="camera"
            data-header-btn="true"
            title="Capturar Ficha Digital"
            className={`relative p-1.5 border transition-all rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 focus:bg-indigo-50 focus:text-indigo-600' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 focus:bg-indigo-500/10 focus:text-indigo-400'}`}
          >
            <Camera className="w-3.5 h-3.5" />
            <GhostHint action="SNAP_LOT" shortcuts={shortcuts} visible={showHints} />
          </button>
          <button
            onClick={onRemove}
            data-lot={index}
            data-type="remove"
            data-header-btn="true"
            title="Cerrar Lote en Mesa"
            className={`relative p-1.5 border transition-all rounded-lg outline-none focus:ring-2 focus:ring-rose-500/50 ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-rose-50 hover:text-rose-600 hover:border-rose-200 focus:bg-rose-50 focus:text-rose-600' : 'bg-zinc-950 border-zinc-900 text-zinc-800 hover:bg-rose-600/20 hover:text-rose-500 focus:bg-rose-600/20 focus:text-rose-500'}`}
          >
            <X className="w-3.5 h-3.5" />
            <GhostHint action="REMOVE_LOT" shortcuts={shortcuts} visible={showHints} />
          </button>
        </div>
      </div>

      {radarStats && (
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border animate-in slide-in-from-top-1 duration-300 ${radarStats.pendingBoxes > 0 ? (isLight ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-emerald-500/10 border-emerald-500/30') : (isLight ? 'bg-zinc-100 border-zinc-200 opacity-60' : 'bg-zinc-900/50 border-zinc-800 opacity-60')}`}>
          <div className="flex items-center gap-2">
            <Box className={`w-3 h-3 ${radarStats.pendingBoxes > 0 ? (isLight ? 'text-white' : 'text-emerald-400 animate-bounce') : 'text-zinc-400'}`} />
            <span className={`text-[8px] font-black uppercase tracking-widest ${radarStats.pendingBoxes > 0 ? (isLight ? 'text-white' : 'text-emerald-300') : 'text-zinc-500'}`}>
              {radarStats.pendingBoxes > 0 ? `Stock: ${radarStats.pendingBoxes} Cajas` : 'Sin Disponibilidad'}
            </span>
          </div>
          {radarStats.pendingBoxes > 0 && (
            <span className={`text-[9px] font-black tabular-nums ${isLight ? 'text-white/90' : 'text-white'}`}>
              {radarStats.totalKgMatch.toLocaleString()} <span className={`text-[7px] ${isLight ? 'text-emerald-100' : 'text-emerald-500'}`}>M.P.</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

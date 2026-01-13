
import React from 'react';
import { TallaRecord, PresentationType, AppTheme } from '../../../types';
import { Box, Truck, Trash } from 'lucide-react';
import { GhostHint } from '../../../core/zero-mouse/ui/GhostHint';

interface Props {
  row: TallaRecord;
  presentationType: PresentationType;
  isTargetMatch: boolean;
  isTargetWithStock: boolean;
  isTargetWithoutStock: boolean;
  lotIdx: number;
  rowIdx: number;
  onUpdate: (field: keyof TallaRecord, val: any) => void;
  onDelete: () => void;
  theme?: AppTheme;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const TallaRow: React.FC<Props> = ({
  row, presentationType, isTargetMatch, isTargetWithStock, isTargetWithoutStock, lotIdx, rowIdx, onUpdate, onDelete, theme, showHints, shortcuts
}) => {
  const isLight = theme === 'pearl';

  const isFilteringTalla = isTargetMatch || isTargetWithStock || isTargetWithoutStock;
  if (isFilteringTalla && !isTargetMatch) {
    return null;
  }

  const isFinished = row.cajasP === 0 && row.cant > 0;
  const isOver = row.cajasP < 0;

  return (
    <div className={`grid grid-cols-12 items-stretch transition-all duration-300 group/row ${isTargetWithStock
      ? (isLight ? 'bg-emerald-100 ring-1 ring-inset ring-emerald-300' : 'bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40')
      : isTargetWithoutStock ? (isLight ? 'bg-zinc-100 opacity-30' : 'bg-zinc-900/50 opacity-30') : ''
      }`}>
      {/* TALLA */}
      <div className={`col-span-2 flex items-center justify-center border-r ${isLight ? 'border-zinc-200' : 'border-zinc-900/50'} ${isTargetWithStock ? (isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-600/30') : (isLight ? 'bg-zinc-50' : 'bg-black/20')}`}>
        <input
          type="text" value={row.talla}
          tabIndex={-1}
          onChange={(e) => onUpdate('talla', e.target.value.replace(/[^0-9\-]/g, ''))}
          className={`w-full bg-transparent text-[10px] font-black text-center outline-none transition-colors ${isTargetWithStock ? (isLight ? 'text-white' : 'text-white') : (isLight ? 'text-zinc-600 group-hover/row:text-zinc-950' : 'text-zinc-500 group-hover/row:text-white')}`}
        />
      </div>

      {/* ENTRADA (Materia Prima) */}
      <div className={`col-span-3 flex flex-col justify-center items-end pr-4 border-r py-1 ${isLight ? 'border-zinc-200' : 'border-zinc-900/50'}`}>
        <input
          type="number"
          min="0"
          data-lot={lotIdx}
          data-row={rowIdx}
          data-cell={0}
          data-p-type={presentationType}
          value={row.cant === 0 ? '' : row.cant}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            onUpdate('cant', Math.max(0, val));
          }}
          className={`w-full bg-transparent text-[10px] font-mono font-black text-right outline-none transition-colors ${isLight ? 'text-zinc-950 focus:text-indigo-600' : 'text-zinc-100 focus:text-indigo-400'}`}
        />
        <div className={`text-[6px] font-black uppercase tabular-nums ${isLight ? 'text-zinc-400' : 'text-zinc-800'}`}>{row.cajasT} <span className="opacity-40">EST.</span></div>
      </div>

      {/* PROCESADO (CAJAS) */}
      <div className={`col-span-2 flex items-center justify-end pr-4 border-r ${isLight ? 'border-zinc-200' : 'border-zinc-900/50'} ${isLight ? 'bg-indigo-50/30' : 'bg-indigo-500/[0.02]'}`}>
        <input
          type="number"
          min="0"
          data-lot={lotIdx}
          data-row={rowIdx}
          data-cell={1}
          data-p-type={presentationType}
          value={row.entreg === 0 ? '' : row.entreg}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            onUpdate('entreg', Math.max(0, val));
          }}
          className={`w-full bg-transparent text-sm font-mono font-black text-right outline-none transition-colors ${isLight ? 'text-indigo-700 focus:text-indigo-900' : 'text-indigo-400 focus:text-white'}`}
        />
      </div>

      {/* STOCK (CAJAS) */}
      <div className={`col-span-2 flex flex-col items-center justify-center border-r transition-all ${isLight ? 'border-zinc-200' : 'border-zinc-900/50'} ${isTargetWithStock ? (isLight ? 'bg-emerald-200' : 'bg-emerald-600/20') : (row.cajasP > 0 ? (isLight ? 'bg-emerald-50' : 'bg-emerald-500/5') : isFinished ? (isLight ? 'bg-indigo-50' : 'bg-indigo-500/10') : (isLight ? 'bg-zinc-100' : 'bg-black/20'))}`}>
        {isFinished ? (
          <Truck className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
        ) : isOver ? (
          <div className="flex items-center gap-1 animate-in zoom-in duration-300">
            <Box className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`} />
            <span className={`text-[10px] font-black tabular-nums ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {Math.abs(row.cajasP)}
            </span>
          </div>
        ) : (
          <span className={`text-base font-mono font-black tabular-nums leading-none ${isTargetWithStock ? (isLight ? 'text-emerald-800 animate-pulse' : 'text-emerald-400 animate-pulse') : (row.cajasP > 0 ? (isLight ? 'text-emerald-700' : 'text-emerald-400/80') : (isLight ? 'text-zinc-300' : 'text-zinc-800 opacity-30'))}`}>
            {row.cajasP}
          </span>
        )}
      </div>

      {/* SALDO (KG) */}
      <div className="col-span-3 flex items-center pl-2">
        <div className="flex-1 flex flex-col items-end pr-3">
          <input
            type="number"
            min="0"
            data-lot={lotIdx}
            data-row={rowIdx}
            data-cell={2}
            data-p-type={presentationType}
            value={row.saldo === 0 ? '' : row.saldo}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              onUpdate('saldo', Math.max(0, val));
            }}
            className={`w-full bg-transparent text-[10px] font-mono font-black text-right outline-none transition-colors ${isLight ? 'text-zinc-400 focus:text-amber-600' : 'text-zinc-800 focus:text-amber-400'}`}
            placeholder="0.0"
          />
        </div>
        <button
          onClick={onDelete}
          data-lot={lotIdx}
          data-row={rowIdx}
          data-p-type={presentationType}
          data-type="trash"
          className={`relative pr-2 transition-all opacity-0 group-hover/row:opacity-100 focus:opacity-100 outline-none focus:ring-2 focus:ring-rose-500 rounded-md py-1 px-1.5 ${isLight ? 'text-zinc-300 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50' : 'text-zinc-900 hover:text-rose-500 focus:text-rose-500 focus:bg-rose-500/10'}`}
        >
          <Trash className="w-3 h-3" />
          <GhostHint action="DELETE_ROW" shortcuts={shortcuts} visible={showHints} />
        </button>
      </div>
    </div>
  );
};

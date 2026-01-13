
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Trash2, Plus, Check, Scale } from 'lucide-react';
import { Presentation, TallaRecord, PresentationType, AppTheme } from '../../../types';
import { TallaRow } from './TallaRow';

interface Props {
  presentation: Presentation;
  radarFilter: { type: PresentationType | 'ALL'; talla: string };
  lotIdx: number;
  startRowIdx: number;
  onUpdateRecord: (rowId: string, field: keyof TallaRecord, val: any) => void;
  onTypeChange: (newType: PresentationType) => void;
  onDeleteBlock: () => void;
  onAddTalla: () => void;
  onDeleteTalla: (rowId: string) => void;
  theme?: AppTheme;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const BlockEditor: React.FC<Props> = ({
  presentation, radarFilter, lotIdx, startRowIdx, onUpdateRecord, onTypeChange, onDeleteBlock, onAddTalla, onDeleteTalla, theme, showHints, shortcuts
}) => {
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'pearl';
  const isPrincipal = presentation.type === 'Tallo Coral' || presentation.type === 'Media Valva';
  const isFiltering = radarFilter.type !== 'ALL' || radarFilter.talla !== 'ALL';
  const isTypeMatch = radarFilter.type === 'ALL' || radarFilter.type === presentation.type;

  const hasMatchingRows = useMemo(() => {
    if (radarFilter.talla === 'ALL') return true;
    return presentation.records.some(r => r.talla === radarFilter.talla);
  }, [presentation.records, radarFilter.talla]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foco automático en la opción actual al abrir
  useEffect(() => {
    if (isTypeMenuOpen) {
      setTimeout(() => {
        const activeOpt = document.querySelector(`button[data-lot="${lotIdx}"][data-type="block-type-option"][data-is-current="true"]`) as HTMLElement;
        activeOpt?.focus();
      }, 0);
    }
  }, [isTypeMenuOpen, lotIdx]);

  if (isFiltering && (!isTypeMatch || !hasMatchingRows)) {
    return null;
  }

  const accentColor = isPrincipal ? (presentation.type === 'Tallo Coral' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-indigo-500';

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-500 shadow-xl ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#080809] border-zinc-800'
      } ${isFiltering && isTypeMatch ? (isLight ? 'ring-2 ring-indigo-400 border-indigo-400 shadow-2xl' : 'ring-2 ring-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)] border-indigo-500/30') : ''}`}>
      {/* HEADER */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isFiltering ? (isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-950/30 border-indigo-500/20') : (isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800')
        }`}>
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <div className={`w-1 h-3 rounded-full ${accentColor}`} />
          <button
            id={`block-type-trigger-${lotIdx}-principal`}
            onClick={() => isPrincipal && setIsTypeMenuOpen(!isTypeMenuOpen)}
            data-lot={lotIdx}
            aria-expanded={isTypeMenuOpen}
            {...(isPrincipal ? { 'data-type': 'block-type', 'data-is-principal': 'true' } : {})}
            className={`text-[10px] font-black uppercase flex items-center gap-2 transition-colors ${isLight ? 'text-zinc-950 hover:text-indigo-600' : 'text-white hover:text-indigo-400'}`}
          >
            {presentation.type}
            {isPrincipal && <ChevronDown className={`w-3 h-3 transition-transform ${isTypeMenuOpen ? 'rotate-180' : ''}`} />}
          </button>
          {isTypeMenuOpen && (
            <div className={`absolute top-full left-0 mt-2 w-48 border rounded-xl z-50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
              {['Tallo Coral', 'Media Valva'].map((t: any) => (
                <button
                  key={t}
                  data-lot={lotIdx}
                  data-type="block-type-option"
                  data-is-current={presentation.type === t}
                  onClick={() => {
                    onTypeChange(t);
                    setIsTypeMenuOpen(false);
                    // Retornar foco al trigger estable
                    setTimeout(() => {
                      document.getElementById(`block-type-trigger-${lotIdx}-principal`)?.focus();
                    }, 0);
                  }}
                  className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all duration-200 outline-none relative group/opt ${presentation.type === t
                    ? 'bg-indigo-600 text-white shadow-lg z-10'
                    : (isLight
                      ? 'text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600 focus:bg-indigo-50 focus:text-indigo-600'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white focus:bg-white/10 focus:text-white')
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {presentation.type === t && <div className="w-1 h-3 bg-white rounded-full animate-pulse" />}
                    <span className={presentation.type === t ? 'translate-x-1' : 'group-hover/opt:translate-x-1 transition-transform'}>
                      {t}
                    </span>
                  </div>
                  {presentation.type === t ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-current opacity-20 group-hover/opt:opacity-100 group-focus/opt:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`} title="Factor de Balanza Configurado">
            <Scale className="w-3 h-3" />
            <span className="text-[9px] font-black tabular-nums">{presentation.factor || (presentation.type === 'Tallo Solo' ? 5 : 10)}</span>
          </div>
          <button onClick={onDeleteBlock} className={`p-1 transition-colors ${isLight ? 'text-zinc-400 hover:text-rose-600' : 'text-zinc-700 hover:text-rose-500'}`}>
            <Trash2 className="w-3 h-3" />
          </button>
          <div className={`px-2 py-0.5 rounded border shadow-inner ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-white/5'}`}>
            <span className={`text-[10px] font-mono font-black ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>{presentation.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* DATA */}
      <div className={`divide-y ${isLight ? 'divide-zinc-200' : 'divide-zinc-900/50'}`}>
        <div className={`grid grid-cols-12 text-[7px] font-black uppercase tracking-widest py-1.5 ${isLight ? 'bg-zinc-50 text-zinc-400' : 'bg-black/40 text-zinc-600'}`}>
          <div className="col-span-2 text-center">Talla</div>
          <div className="col-span-3 text-right pr-4">Entrada</div>
          <div className="col-span-2 text-right pr-4">Proc.</div>
          <div className="col-span-2 text-center text-emerald-500">Stock</div>
          <div className="col-span-3 text-right pr-4 text-amber-500">Saldo</div>
        </div>
        {presentation.records.map((row, idx) => {
          const isTallaMatch = radarFilter.talla === 'ALL' || radarFilter.talla === row.talla;
          return (
            <TallaRow
              key={row.id}
              row={row}
              presentationType={presentation.type}
              isTargetMatch={isFiltering && isTypeMatch && isTallaMatch}
              isTargetWithStock={isFiltering && isTypeMatch && isTallaMatch && row.cajasP > 0}
              isTargetWithoutStock={isFiltering && isTypeMatch && isTallaMatch && row.cajasP <= 0}
              lotIdx={lotIdx}
              rowIdx={startRowIdx + idx}
              onUpdate={(f, v) => onUpdateRecord(row.id, f, v)}
              onDelete={() => onDeleteTalla(row.id)}
              theme={theme}
              showHints={showHints}
              shortcuts={shortcuts}
            />
          );
        })}
        {!isFiltering && <button
          onClick={onAddTalla}
          data-lot={lotIdx}
          data-p-type={presentation.type}
          data-type="add-talla"
          className={`w-full py-2 flex items-center justify-center gap-2 text-[7px] font-black uppercase tracking-[0.25em] transition-all outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl ${isLight ? 'text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50' : 'text-zinc-700 hover:text-indigo-400 hover:bg-white/[0.01] focus:text-indigo-400 focus:bg-indigo-500/10'}`}
        > <Plus className="w-3 h-3" /> Nuevo Calibre </button>}
      </div>
    </div>
  );
};

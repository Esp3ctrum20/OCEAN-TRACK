import React, { useRef, useMemo, useEffect } from 'react';
import { DercEntry, PresentationType, TallaRecord, EventSeverity, AppTheme } from '../../../types';
import { WorkspaceLotColumn } from './WorkspaceLotColumn';
import { Plus, RotateCcw, FilterX, Layers, Zap } from 'lucide-react';
import { useZeroMouse } from '../../../core/zero-mouse/hooks/useZeroMouse';
import { GhostHint } from '../../../core/zero-mouse/ui/GhostHint';

interface Props {
  dockedLotes: DercEntry[];
  radarType: PresentationType | 'ALL';
  radarTalla: string;
  onUpdateDerc: (d: DercEntry) => void;
  onRemoveFromDock: (id: string) => void;
  onRecordChange: (dercId: string, pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => void;
  onLogEvent: (message: string, severity?: EventSeverity, type?: string, lotName?: string) => void;
  onOpenSelector: () => void;
  onOpenNew: () => void;
  onRestoreSession: () => void;
  onShowSnap: (id: string) => void;
  onManualSave: () => void;
  onViewChange: (viewId: string) => void; // Prop añadida para navegación Alt+X
  onEditLot: (id: string) => void;
  canRestore: boolean;
  theme?: AppTheme;
  shortcuts?: Record<string, string>;
  onOpenConfig?: () => void;
  onOpenImport?: () => void;
  onOpenIntelligence?: () => void;
  onClearMesa?: () => void;
  onToggleHeader?: () => void;
  showHints?: boolean;
  pendingTodayLotsCount?: number;
  onDockTodayLots?: () => void;
}

export const WorkspaceGrid: React.FC<Props> = ({
  dockedLotes, radarType, radarTalla, onUpdateDerc, onRemoveFromDock, onRecordChange, onLogEvent, onOpenSelector, onOpenNew, onRestoreSession, onShowSnap, onManualSave, onViewChange, canRestore, theme,
  onEditLot, shortcuts, onOpenConfig, onOpenImport, onOpenIntelligence, onClearMesa, onToggleHeader, showHints, pendingTodayLotsCount = 0, onDockTodayLots
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'pearl';

  // Activación del Protocolo Zero-Mouse Hangar 1 (Elevado a TacticalWorkspace)

  // Foco inicial en pista
  useEffect(() => {
    if (dockedLotes.length > 0) {
      const timer = setTimeout(() => {
        const activeEl = document.activeElement;
        const isAlreadyInInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isAlreadyInInput) {
          const firstCell = document.querySelector('input[data-lot="0"][data-row="0"][data-cell="0"]') as HTMLInputElement;
          if (firstCell) {
            firstCell.focus();
            firstCell.select();
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dockedLotes.length]);

  const filteredLotes = useMemo(() => {
    if (radarType === 'ALL' && radarTalla === 'ALL') return dockedLotes;
    return dockedLotes.filter(l => {
      return l.presentations.some(p => {
        const typeMatch = radarType === 'ALL' || p.type === radarType;
        if (!typeMatch) return false;
        if (radarTalla === 'ALL') return true;
        return p.records.some(r => r.talla === radarTalla);
      });
    });
  }, [dockedLotes, radarType, radarTalla]);

  if (dockedLotes.length === 0) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${isLight ? 'bg-zinc-100' : 'bg-[#050506]'}`}>
        <div className={`absolute inset-0 pointer-events-none ${isLight ? 'opacity-[0.05]' : 'opacity-[0.03]'}`}
          style={{ backgroundImage: `radial-gradient(${isLight ? '#4f46e5' : '#4f46e5'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
          <div className={`w-80 h-80 rounded-full border flex items-center justify-center relative ${isLight ? 'border-indigo-200' : 'border-white/5'}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-[spin_20s_linear_infinite] ${isLight ? 'border-indigo-300/30' : 'border-indigo-500/10'}`} />
            <button
              onClick={onOpenNew}
              className={`w-48 h-48 rounded-full shadow-2xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group z-10 ${isLight ? 'bg-indigo-600 text-white shadow-indigo-400/40' : 'bg-indigo-600 text-white shadow-[0_0_80px_rgba(79,70,229,0.3)]'
                }`}
            >
              <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white group-hover:text-indigo-600 transition-all">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Nuevo Lote</span>
            </button>
          </div>
          <div className="mt-12 text-center space-y-6">
            {pendingTodayLotsCount > 0 ? (
              <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-700">
                <p className={`text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Se detectan <span className="text-emerald-500 font-black">{pendingTodayLotsCount} lotes activos</span> de la jornada actual en espera.
                </p>
                <button
                  onClick={onDockTodayLots}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl group ${isLight ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-indigo-600 text-white shadow-indigo-900/40 hover:bg-indigo-500'}`}
                >
                  <Zap className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
                  Desplegar Lotes de Hoy
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className={`font-black uppercase tracking-[0.5em] text-xs ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Mesa de Trabajo Libre</h3>
                <div className="flex flex-col items-center gap-4">
                  <p className={`text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed ${isLight ? 'text-zinc-50' : 'text-zinc-800'}`}>
                    Inicie el <span className="text-indigo-500">Escaneo Industrial</span> abriendo una unidad de ADN o acoplando lotes previos.
                  </p>
                  <button
                    onClick={onOpenSelector}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
                  >
                    <Layers className="w-3 h-3" /> Acoplar Lotes Existentes
                  </button>
                </div>
              </div>
            )}

            {canRestore && !pendingTodayLotsCount && (
              <button
                onClick={onRestoreSession}
                className={`flex items-center gap-3 px-8 py-4 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all animate-in slide-in-from-bottom-2 ${isLight ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
              >
                <RotateCcw className="w-4 h-4 text-emerald-500" /> Restaurar Sesión Anterior
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-hidden relative transition-colors duration-500 ${isLight ? 'bg-zinc-100' : 'bg-[#050506]'}`}>
      <div ref={scrollContainerRef} className="h-full flex overflow-x-auto no-scrollbar scroll-smooth snap-x select-none">
        <div className="flex px-4 items-stretch">
          {filteredLotes.length === 0 ? (
            <div className="w-[calc(100vw-88px)] flex flex-col items-center justify-center gap-4 opacity-40">
              <FilterX className={`w-16 h-16 ${isLight ? 'text-zinc-300' : 'text-zinc-800'}`} />
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Ningún lote coincide con el radar actual</p>
            </div>
          ) : (
            <>
              {filteredLotes.map((derc, idx) => (
                <div key={derc.id} data-lot-container="true">
                  <WorkspaceLotColumn
                    derc={derc}
                    index={idx}
                    radarFilter={{ type: radarType, talla: radarTalla }}
                    onRemove={() => onRemoveFromDock(derc.id)}
                    onUpdate={onUpdateDerc}
                    onLogEvent={onLogEvent}
                    onRecordChange={onRecordChange}
                    onShowSnap={onShowSnap}
                    onEditLot={onEditLot}
                    theme={theme}
                    showHints={showHints}
                    shortcuts={shortcuts}
                  />
                </div>
              ))}
              <div className="w-32 flex flex-col items-center justify-center px-6">
                <button
                  onClick={onOpenNew}
                  className={`w-full h-full max-h-[80%] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500 group/ghost ${isLight
                    ? 'bg-zinc-200/20 border-zinc-300 text-zinc-400 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600'
                    : 'bg-zinc-900/10 border-zinc-800 text-zinc-700 hover:bg-indigo-600/5 hover:border-indigo-500/40 hover:text-indigo-400'
                    }`}
                  title="Apertura Rápida LOTE"
                >
                  <div className="p-3 rounded-2xl bg-current opacity-10 group-hover/ghost:opacity-100 group-hover/ghost:bg-indigo-600 group-hover/ghost:text-white transition-all shadow-lg">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-40 group-hover/ghost:opacity-100">
                    <Zap className="w-3 h-3 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap">LOTE</span>
                  </div>
                  <GhostHint action="OPEN_NEW_LOT" shortcuts={shortcuts} visible={showHints} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
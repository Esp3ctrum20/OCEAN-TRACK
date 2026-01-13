import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Target, Cpu, Scale, Box, Save, Check, RefreshCw, Eraser, Zap, Settings2, Pin, PinOff, Command } from 'lucide-react';
import { PresentationType, AppTheme } from '../../../types';
import { GhostHint } from '../../../core/zero-mouse/ui/GhostHint';

interface Props {
  dockedCount: number;
  radarType: PresentationType | 'ALL';
  setRadarType: (t: PresentationType | 'ALL') => void;
  radarTalla: string;
  setRadarTalla: (t: string) => void;
  availableTallas: string[];
  isFilterActive: boolean;
  factors: Record<PresentationType, number>;
  onUpdateFactor: (type: PresentationType, val: number) => void;
  onOpenIntelligence: () => void;
  onOpenSelector: () => void;
  onOpenConfig: () => void;
  onOpenImport: () => void;
  onClearMesa: () => void;
  onManualSave: () => void;
  onOpenCommandPalette: () => void;
  hasUnsavedChanges: boolean;
  saveStatus: 'synced' | 'syncing' | 'error';
  totalPendingInRadar?: number;
  theme?: AppTheme;
  isPinned?: boolean;
  onTogglePin?: () => void;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
  pendingTodayLotsCount?: number;
  onDockTodayLots?: () => void;
}

export const WorkspaceControlCenter: React.FC<Props> = ({
  dockedCount, radarType, setRadarType, radarTalla, setRadarTalla, availableTallas,
  isFilterActive, factors, onUpdateFactor, onOpenIntelligence, onOpenSelector, onOpenConfig, onOpenImport, onClearMesa,
  onManualSave, onOpenCommandPalette, hasUnsavedChanges, saveStatus, totalPendingInRadar = 0, theme,
  isPinned, onTogglePin, showHints, shortcuts, pendingTodayLotsCount = 0, onDockTodayLots
}) => {
  const [showFactorMenu, setShowFactorMenu] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const factorMenuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'pearl';

  useEffect(() => {
    if (saveStatus === 'synced' && !hasUnsavedChanges) {
      setShowSaveSuccess(true);
      const timer = setTimeout(() => setShowSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, hasUnsavedChanges]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (factorMenuRef.current && !factorMenuRef.current.contains(e.target as Node)) {
        setShowFactorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-8 py-4 gap-4" data-control-center="true">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-500'}`}>
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div className="hidden xl:block">
          <h2 className={`text-sm font-black uppercase tracking-[0.2em] leading-none ${isLight ? 'text-zinc-950' : 'text-white'}`}>Mesa</h2>
        </div>
      </div>

      {dockedCount > 0 && (
        <div className={`flex-1 flex items-center gap-4 border p-1 rounded-2xl max-w-2xl shadow-inner relative overflow-hidden ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-zinc-800'}`}>
          <div className={`flex items-center gap-2 flex-1 z-10 transition-all rounded-xl px-2 ${isLight ? 'focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20' : 'focus-within:bg-indigo-500/5 focus-within:ring-1 focus-within:ring-indigo-500/30'}`}>
            <div className={`p-2 rounded-xl transition-all ${isFilterActive ? 'bg-indigo-600 text-white shadow-lg' : (isLight ? 'bg-white border border-zinc-200 text-zinc-300' : 'bg-zinc-900 text-zinc-700')}`}>
              <Target className="w-4 h-4" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <select
                value={radarType}
                data-toolbar-btn="true"
                onChange={(e) => { setRadarType(e.target.value as any); setRadarTalla('ALL'); }}
                className={`bg-transparent text-[9px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer px-2 transition-all rounded-md focus:ring-2 focus:ring-indigo-500/50 focus:bg-indigo-500/10 ${isLight ? 'text-zinc-900' : 'text-zinc-300 focus:text-white'}`}
              >
                <option value="ALL">PRODUCTO...</option>
                <option value="Tallo Coral">TALLO CORAL</option>
                <option value="Tallo Solo">TALLO SOLO</option>
                <option value="Media Valva">MEDIA VALVA</option>
              </select>
              <select
                value={radarTalla}
                data-toolbar-btn="true"
                onChange={(e) => setRadarTalla(e.target.value)}
                className={`bg-transparent text-[9px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer px-2 border-l transition-all rounded-md focus:ring-2 focus:ring-indigo-500/50 focus:bg-indigo-500/10 ${isLight ? 'text-zinc-900 border-zinc-200' : 'text-zinc-300 border-zinc-800 focus:text-white'}`}
              >
                <option value="ALL">CALIBRE...</option>
                {availableTallas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenImport}
          data-toolbar-btn="true"
          className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group focus:ring-2 focus:ring-emerald-500/50 outline-none ${isLight ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 focus:bg-zinc-200' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white focus:text-white focus:border-emerald-500/50'}`}
          title="Importación Inteligente IA"
        >
          <Zap className="w-4 h-4 text-emerald-500" />
          <span className="hidden lg:block">Importar</span>
          <GhostHint action="OPEN_IMPORT" shortcuts={shortcuts} visible={showHints} />
        </button>

        {pendingTodayLotsCount > 0 && dockedCount === 0 && (
          <button
            onClick={onDockTodayLots}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-4"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            Traer {pendingTodayLotsCount} Lotes de Hoy
          </button>
        )}

        <button
          onClick={onOpenSelector}
          data-toolbar-btn="true"
          className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group shadow-xl outline-none focus:ring-2 focus:ring-indigo-400 ${isLight ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}`}
        >
          <Box className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden md:block">Hangar</span>
          {pendingTodayLotsCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[9px] font-black animate-bounce">
              {pendingTodayLotsCount}
            </span>
          )}
          <GhostHint action="OPEN_HANGAR" shortcuts={shortcuts} visible={showHints} />
        </button>

        {dockedCount > 0 && (
          <>
            <div className="relative" ref={factorMenuRef}>
              <button
                onClick={() => setShowFactorMenu(!showFactorMenu)}
                data-toolbar-btn="true"
                data-type="scale"
                className={`p-3.5 rounded-2xl border transition-all ${showFactorMenu ? 'bg-indigo-600 text-white' : (isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-white')}`}
                title="Ajustar Balanza"
              >
                <Scale className="w-4 h-4" />
                <GhostHint action="OPEN_SCALE" shortcuts={shortcuts} visible={showHints} />
              </button>
              {showFactorMenu && (
                <div className={`absolute top-full right-0 mt-2 w-64 border rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl overflow-hidden ${isLight ? 'bg-white/90 border-zinc-200' : 'bg-[#0c0c0e]/90 border-zinc-800'
                  }`}>
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/5 border-zinc-800'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Factores de Balanza</span>
                    <Scale className="w-3 h-3 opacity-40" />
                  </div>
                  <div className="p-2 space-y-1">
                    {(['Tallo Coral', 'Tallo Solo', 'Media Valva'] as PresentationType[]).map(type => (
                      <div key={type} className={`flex items-center justify-between p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-100' : 'hover:bg-white/5'}`}>
                        <label className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{type}</label>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-black/40 border-zinc-800'}`}>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={factors[type] || 0}
                            onChange={(e) => onUpdateFactor(type, parseFloat(e.target.value))}
                            className={`w-12 bg-transparent text-right font-mono text-xs font-black outline-none ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}
                          />
                          <span className="text-[8px] font-black text-zinc-500 select-none">kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`px-4 py-2 text-[7px] font-black uppercase tracking-widest opacity-40 italic ${isLight ? 'bg-zinc-50' : 'bg-black/20'}`}>
                    * Estos factores modifican el cálculo de cajas est.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onOpenIntelligence}
              data-toolbar-btn="true"
              className={`relative p-3.5 rounded-2xl border transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-indigo-400'}`}
              title="Audit Intelligence IQ"
            >
              <Cpu className="w-4 h-4" />
              <GhostHint action="OPEN_INTEL" shortcuts={shortcuts} visible={showHints} />
            </button>

            <button
              onClick={onOpenConfig}
              data-toolbar-btn="true"
              className={`relative p-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-indigo-400 focus:text-indigo-400'}`}
              title="Configuración de Sistema"
            >
              <Settings2 className="w-4 h-4" />
              <GhostHint action="OPEN_CONFIG" shortcuts={shortcuts} visible={showHints} />
            </button>

            <button
              onClick={onOpenCommandPalette}
              data-toolbar-btn="true"
              className={`relative p-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-indigo-400 focus:text-indigo-400'}`}
              title="Buscador Táctico (Alt+K)"
            >
              <Command className="w-4 h-4" />
              <GhostHint action="OPEN_COMMAND_PALETTE" shortcuts={shortcuts} visible={showHints} />
            </button>

            <div className="w-px h-8 bg-zinc-800/40 mx-1" />

            <button
              onClick={onManualSave}
              data-toolbar-btn="true"
              className={`relative p-3.5 rounded-2xl border transition-all duration-500 group flex items-center gap-2 ${saveStatus === 'syncing' ? 'bg-amber-600/20 border-amber-500/50 text-amber-500 animate-pulse' :
                showSaveSuccess ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                  hasUnsavedChanges ? 'bg-amber-600/10 border-amber-500/40 text-amber-500' :
                    (isLight ? 'bg-white border-zinc-200 text-zinc-300 hover:border-indigo-300 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:text-indigo-400')
                }`}
              title="Persistir Cambios (Alt+G)"
            >
              {saveStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                showSaveSuccess ? <Check className="w-4 h-4 animate-in zoom-in" /> :
                  <Save className="w-4 h-4" />}

              {hasUnsavedChanges && !showSaveSuccess && saveStatus !== 'syncing' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#050506]" />
              )}
              <GhostHint action="SAVE_ALL" shortcuts={shortcuts} visible={showHints} />
            </button>

            <button
              onClick={onClearMesa}
              data-toolbar-btn="true"
              className={`relative p-3.5 border rounded-2xl transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-300' : 'bg-rose-600/10 border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white'}`}
              title="Limpiar Mesa"
            >
              <Eraser className="w-4 h-4" />
              <GhostHint action="CLEAR_MESA" shortcuts={shortcuts} visible={showHints} />
            </button>

            <div className="w-px h-8 bg-zinc-800/40 mx-1" />

            <button
              onClick={onTogglePin}
              data-toolbar-btn="true"
              className={`relative p-3.5 rounded-2xl border transition-all ${isPinned ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : (isLight ? 'bg-white border-zinc-200 text-zinc-300 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:text-white')}`}
              title={isPinned ? "Desanclar Cabecera (Ocultar)" : "Anclar Cabecera (Fijar)"}
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              <GhostHint action="TOGGLE_HEADER" shortcuts={shortcuts} visible={showHints} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
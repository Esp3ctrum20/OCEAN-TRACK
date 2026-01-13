import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Plus, Settings2, Zap, ShieldAlert, RotateCcw, X, ChevronLeft, LayoutGrid, ChevronDown, Package, Activity, Columns } from 'lucide-react';
import { AppMode, DercEntry, AppTheme } from '../types';
import { StorageStatus } from '../components/StorageStatus';
import { StorageService } from '../core/storage';

interface HeaderProps {
  appMode: AppMode;
  selectedViewId: string;
  setSelectedViewId: (id: string) => void;
  selectedDerc?: DercEntry;
  isUnknownIdentity: boolean;
  onRename: () => void;
  saveStatus: 'synced' | 'syncing' | 'error';
  lastSaveTime: Date | null;
  dercs: DercEntry[];
  hasEmergencySnapshot: boolean;
  onRestoreEmergency: () => void;
  onOpenImport: () => void;
  onOpenNew: () => void;
  onOpenConfig: () => void;
  theme?: AppTheme;
}

export const Header: React.FC<HeaderProps> = ({
  appMode, selectedViewId, setSelectedViewId, selectedDerc, isUnknownIdentity, 
  onRename, saveStatus, lastSaveTime, dercs, 
  hasEmergencySnapshot, onRestoreEmergency,
  onOpenImport, onOpenNew, onOpenConfig,
  theme
}) => {
  const [showRescuePanel, setShowRescuePanel] = useState(false);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const jumpMenuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'pearl';
  const emergencySnapshot = StorageService.getEmergencySnapshot();

  const isDetailView = selectedDerc && !['summary', 'workspace', 'vault', 'trash', 'fulfillment'].includes(selectedViewId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (jumpMenuRef.current && !jumpMenuRef.current.contains(e.target as Node)) {
        setShowJumpMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherLots = dercs.filter(d => !d.deletedAt && d.date === selectedDerc?.date && d.id !== selectedDerc?.id);

  return (
    <header className={`h-24 flex items-center justify-between px-10 border-b z-40 backdrop-blur-3xl transition-colors duration-300 ${isLight ? 'bg-white/80 border-zinc-200' : 'bg-[#0c0c0e]/95 border-zinc-800/40'}`}>
      <div className="flex items-center gap-6">
        {isDetailView && (
          <button 
            onClick={() => setSelectedViewId('workspace')}
            className={`group flex items-center gap-3 pr-6 border-r transition-all ${isLight ? 'border-zinc-200 text-zinc-400 hover:text-indigo-600' : 'border-zinc-800/50 text-zinc-500 hover:text-indigo-400'}`}
            title="Volver a la Mesa de Operaciones"
          >
            <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${isLight ? 'bg-zinc-50 border-zinc-100 group-hover:border-indigo-200 group-hover:bg-indigo-50' : 'bg-zinc-900 border-zinc-800 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10'}`}>
              <Columns className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block">Mesa</span>
          </button>
        )}

        <div className="flex flex-col relative" ref={jumpMenuRef}>
           <h1 className={`text-[9px] font-black uppercase tracking-[0.4em] mb-1 ${appMode === 'scallop' ? 'text-indigo-600' : 'text-emerald-600'}`}>
             {isDetailView ? 'Editor de Lote' : 'Entorno de Producción'}
           </h1>
           <div className="flex items-center gap-3 group">
             <button 
              onClick={() => isDetailView && otherLots.length > 0 && setShowJumpMenu(!showJumpMenu)}
              className={`flex items-center gap-2 text-xl font-black uppercase tracking-tight transition-all ${isLight ? 'text-zinc-950' : 'text-white'} ${isDetailView && otherLots.length > 0 ? 'hover:text-indigo-600 cursor-pointer' : 'cursor-default'}`}
             >
               {appMode === 'shrimp' ? 'Laboratorio de Pelado' : 
                selectedViewId === 'summary' ? 'Panel de Inteligencia' : 
                selectedViewId === 'workspace' ? 'Mesa de Operaciones' :
                selectedViewId === 'fulfillment' ? 'Radar Stock' :
                selectedViewId === 'vault' ? 'Bóveda Maestra' : 
                selectedViewId === 'trash' ? 'Papelera de Residuos' : (selectedDerc?.lote || 'Editar')}
               
               {isDetailView && otherLots.length > 0 && (
                 <ChevronDown className={`w-4 h-4 transition-all ${isLight ? 'text-zinc-200' : 'text-zinc-700'} group-hover:text-indigo-500 ${showJumpMenu ? 'rotate-180' : ''}`} />
               )}
             </button>

             {showJumpMenu && (
               <div className={`absolute top-full left-0 mt-4 w-72 border rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 backdrop-blur-xl ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800'}`}>
                  <div className={`px-4 py-3 border-b mb-2 ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'}`}>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Conmutación Rápida (Misma Jornada)</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {otherLots.map(lot => (
                      <button 
                        key={lot.id}
                        onClick={() => { setSelectedViewId(lot.id); setShowJumpMenu(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group/item ${isLight ? 'hover:bg-zinc-50' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-all ${isLight ? 'bg-white border-zinc-100 text-zinc-400 group-hover/item:border-indigo-400 group-hover/item:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-600 group-hover/item:border-indigo-500/50 group-hover/item:text-indigo-400'}`}>
                             <Package className="w-4 h-4" />
                           </div>
                           <div>
                             <p className={`text-[11px] font-black uppercase leading-none ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>{lot.lote}</p>
                             <p className="text-[8px] font-bold text-zinc-500 uppercase mt-1">{lot.dercId}</p>
                           </div>
                        </div>
                        <Activity className={`w-3.5 h-3.5 transition-colors ${isLight ? 'text-zinc-100 group-hover/item:text-emerald-500' : 'text-zinc-800 group-hover/item:text-emerald-500'}`} />
                      </button>
                    ))}
                  </div>
               </div>
             )}

             {selectedDerc && isDetailView && (
               <button 
                onClick={onRename} 
                className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                  isUnknownIdentity 
                    ? 'bg-amber-500/20 text-amber-500 opacity-100 animate-pulse border border-amber-500/30' 
                    : `opacity-0 group-hover:opacity-100 ${isLight ? 'bg-zinc-100 text-zinc-400 hover:text-indigo-600' : 'bg-zinc-800/50 text-zinc-600 hover:text-indigo-400'}`
                }`}
               >
                <Edit3 className="w-4 h-4" />
               </button>
             )}
           </div>
        </div>
        <div className={`flex items-center gap-8 border-l pl-10 h-10 ${isLight ? 'border-zinc-100' : 'border-zinc-800/40'}`}>
          <StorageStatus status={saveStatus} lastSave={lastSaveTime} currentData={dercs} />

          {hasEmergencySnapshot && (
            <div className="relative">
              <button 
                onClick={() => setShowRescuePanel(!showRescuePanel)}
                className={`flex items-center gap-2 px-4 py-1.5 border rounded-full animate-pulse shadow-lg transition-all ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Snapshot Activo</span>
              </button>

              {showRescuePanel && emergencySnapshot && (
                <div className={`absolute top-full left-0 mt-4 w-72 border rounded-2xl shadow-2xl p-6 z-[100] animate-in fade-in slide-in-from-top-4 backdrop-blur-xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-amber-500/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Rescate de Emergencia</h4>
                    <button onClick={() => setShowRescuePanel(false)}><X className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-900" /></button>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed mb-6">
                    Se detectó una acción crítica. Respaldo disponible con <span className={`font-black ${isLight ? 'text-zinc-950' : 'text-white'}`}>{emergencySnapshot.count} lotes</span>.
                  </p>
                  <button 
                    onClick={() => { onRestoreEmergency(); setShowRescuePanel(false); }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Deshacer Acción
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {appMode === 'scallop' && (
          <>
            <button onClick={onOpenImport} className={`flex items-center gap-3 px-6 py-3.5 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${isLight ? 'bg-zinc-950 text-white border-zinc-900 hover:bg-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
              <Zap className="w-4 h-4 text-emerald-500 group-hover:animate-pulse" /> Importar
            </button>
            <button 
              onClick={onOpenConfig}
              className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-50 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-indigo-400'}`}
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
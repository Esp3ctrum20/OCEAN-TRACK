
import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronUp, FileSpreadsheet, FileJson } from 'lucide-react';
import { DercEntry, AppTheme } from '../../../types';
import { exportProductionReport } from '../../../core/exporter';
import { StorageService } from '../../../core/storage';

interface Props {
  selectedIds: Set<string>;
  dercs: DercEntry[];
  onClear: () => void;
  theme?: AppTheme;
}

export const SelectionBar: React.FC<Props> = ({ selectedIds, dercs, onClear, theme }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'pearl';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedIds.size === 0) return null;

  const selectedDercs = dercs.filter(d => selectedIds.has(d.id));

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 duration-500">
       <div className={`border rounded-[3.5rem] px-12 py-7 shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex items-center gap-16 backdrop-blur-3xl ring-8 ${isLight ? 'bg-white border-zinc-200 ring-zinc-950/5' : 'bg-[#0c0c0e]/95 border-indigo-500/50 ring-indigo-500/5'}`}>
          <div className={`flex items-center gap-8 border-r pr-16 ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'}`}>
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg animate-pulse ${isLight ? 'bg-zinc-950 text-white' : 'bg-indigo-600 text-white shadow-indigo-600/40'}`}>
                {selectedIds.size}
             </div>
             <div className="flex flex-col text-left">
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-950' : 'text-white'}`}>Auditoría Quirúrgica</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Lotes en selección crítica</span>
             </div>
          </div>

          <div className="flex items-center gap-6 relative" ref={exportMenuRef}>
             <button onClick={() => setShowExportMenu(!showExportMenu)} className={`flex items-center gap-4 px-10 py-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 group ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'}`}>
               <Download className="w-5 h-5 group-hover:scale-110 transition-transform" /> Exportar <ChevronUp className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
             </button>

             {showExportMenu && (
               <div className={`absolute bottom-full left-0 right-0 mb-6 border rounded-3xl shadow-[0_-30px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 backdrop-blur-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e]/98 border-zinc-800'}`}>
                  <button onClick={() => { exportProductionReport(selectedDercs, `Auditoría Selectiva`); setShowExportMenu(false); }} className={`w-full flex items-center gap-5 px-8 py-5 transition-all text-left group ${isLight ? 'hover:bg-emerald-50' : 'hover:bg-emerald-600/10'}`}>
                    <div className={`p-2.5 rounded-xl transition-all ${isLight ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'}`}><FileSpreadsheet className="w-5 h-5" /></div>
                    <div className="flex flex-col"><span className={`text-[11px] font-black uppercase tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Reporte Industrial</span><span className="text-[9px] font-bold text-zinc-500 uppercase">Excel Consolidado</span></div>
                  </button>
                  <button onClick={() => { StorageService.exportData(selectedDercs); setShowExportMenu(false); }} className={`w-full flex items-center gap-5 px-8 py-5 transition-all text-left group ${isLight ? 'hover:bg-indigo-50' : 'hover:bg-indigo-600/10'}`}>
                    <div className={`p-2.5 rounded-xl transition-all ${isLight ? 'bg-zinc-100 text-zinc-600 border border-zinc-200 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white'}`}><FileJson className="w-5 h-5" /></div>
                    <div className="flex flex-col"><span className={`text-[11px] font-black uppercase tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Snapshot ADN</span><span className="text-[9px] font-bold text-zinc-500 uppercase">Respaldo Técnico</span></div>
                  </button>
               </div>
             )}

             <button onClick={onClear} className={`px-8 py-5 border rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-rose-50 hover:text-rose-600' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-rose-500'}`}>Cerrar</button>
          </div>
       </div>
    </div>
  );
};


import React, { useState } from 'react';
import { ShieldCheck, LayoutGrid, Rows, Calendar as CalendarIcon, Box, Award, ShieldAlert, Sprout, X, Database, Trash2 } from 'lucide-react';
import { VaultOrbitalSelect } from './VaultOrbitalSelect';
import { AppTheme } from '../../../types';

interface Props {
  dercsCount: number;
  filterYear: string;
  setFilterYear: (v: string) => void;
  availableYears: { value: string; label: string }[];
  filterMonth: string;
  setFilterMonth: (v: string) => void;
  availableMonths: { value: string; label: string }[];
  qualityFilter: 'all' | 'top' | 'quarantine';
  setQualityFilter: (v: 'all' | 'top' | 'quarantine') => void;
  viewMode: 'tree' | 'virtual';
  setViewMode: (v: 'tree' | 'virtual') => void;
  onSeedData?: () => void;
  onClearAll: () => void;
  onReset: () => void;
  theme?: AppTheme;
}

export const VaultControls: React.FC<Props> = ({
  dercsCount, filterYear, setFilterYear, availableYears, filterMonth, setFilterMonth, availableMonths,
  qualityFilter, setQualityFilter, viewMode, setViewMode, onSeedData, onClearAll, onReset, theme
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const isLight = theme === 'pearl';

  const handlePurge = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className={`p-8 rounded-[3rem] border relative group shadow-2xl overflow-hidden transition-colors duration-500 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/50'}`}>
      <div className={`absolute top-0 right-0 p-8 transition-opacity pointer-events-none ${isLight ? 'opacity-[0.02]' : 'opacity-[0.03]'} group-hover:opacity-[0.08]`}>
        <ShieldCheck className={`w-64 h-64 ${isLight ? 'text-indigo-600' : 'text-indigo-500'}`} />
      </div>
      
      <div className="flex items-center justify-between relative z-10 mb-10">
        <div className="flex items-center gap-6 text-left">
          <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-2xl border ${isLight ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-600 border-indigo-400/30'} shadow-indigo-600/20`}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>Bóveda Maestra</h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${isLight ? 'text-indigo-600' : 'text-indigo-500'}`}>Archivo Táctico • {dercsCount} Registros</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={handlePurge}
             className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border group relative overflow-hidden ${
               confirmClear 
                 ? 'bg-rose-600 text-white border-rose-500 shadow-lg animate-pulse' 
                 : (isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-300' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30')
             }`}
           >
             {confirmClear ? <Trash2 className="w-4 h-4" /> : <Database className="w-4 h-4" />}
             {confirmClear ? '¿Confirmar Purga?' : 'Vaciar Bóveda'}
           </button>

           <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200 shadow-inner' : 'bg-zinc-900 border-zinc-800'}`}>
              <button onClick={() => setViewMode('tree')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'tree' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-700'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('virtual')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'virtual' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-700'}`}><Rows className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 relative z-10">
         <div className={`flex items-center gap-2 p-1.5 rounded-2xl border shadow-inner ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
            <VaultOrbitalSelect label="Año" value={filterYear} options={[{ value: 'all', label: 'Todos' }, ...availableYears]} onChange={setFilterYear} icon={<CalendarIcon className="w-3.5 h-3.5" />} theme={theme} />
            <div className={`w-px h-8 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
            <VaultOrbitalSelect label="Mes" value={filterMonth} options={[{ value: 'all', label: 'Todos' }, ...availableMonths]} onChange={setFilterMonth} icon={<Box className="w-3.5 h-3.5" />} theme={theme} />
         </div>

         <div className={`flex items-center gap-2 p-1.5 rounded-2xl border shadow-inner ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
            <button onClick={() => setQualityFilter(qualityFilter === 'top' ? 'all' : 'top')} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${qualityFilter === 'top' ? (isLight ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-600 text-white') : 'text-zinc-500 hover:text-emerald-500'}`}><Award className="w-4 h-4" /> Top Tier</button>
            <div className={`w-px h-8 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
            <button onClick={() => setQualityFilter(qualityFilter === 'quarantine' ? 'all' : 'quarantine')} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${qualityFilter === 'quarantine' ? (isLight ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-600 text-white') : 'text-zinc-500 hover:text-amber-500'}`}><ShieldAlert className="w-4 h-4" /> Cuarentena</button>
         </div>

         <div className="flex items-center gap-3 ml-auto">
           {onSeedData && <button onClick={onSeedData} className={`p-4 rounded-2xl transition-all border group active:scale-90 ${isLight ? 'bg-zinc-50 border-zinc-200 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border-emerald-500/20'}`}><Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform" /></button>}
           <button onClick={onReset} className={`p-4 rounded-2xl border transition-all active:scale-90 ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-rose-50 hover:text-rose-600' : 'bg-zinc-800 hover:bg-rose-600 text-zinc-500 hover:text-white border-zinc-700'}`}><X className="w-5 h-5" /></button>
         </div>
      </div>
    </div>
  );
};

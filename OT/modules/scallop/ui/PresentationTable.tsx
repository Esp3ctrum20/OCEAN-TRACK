
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash, Plus, Zap, Hash, ArrowDownToLine, Package, Truck, AlertCircle, Scale, Check, X, Trash2, Box } from 'lucide-react';
import { Presentation, TallaRecord, PresentationType } from '../../../types';
import { lotEngine } from '../../../core/lotEngine';
import MassImportModal from '../../../components/MassImportModal';

interface Props {
  presentation: Presentation; 
  ghostRecords: TallaRecord[];
  isWorkspaceMode?: boolean;
  radarFilter?: { type: PresentationType | 'ALL'; talla: string };
  onRecordChange: (pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => void;
  onTypeChange: (oldType: PresentationType, newType: PresentationType) => void;
  onFactorChange: (pType: PresentationType, newFactor: number) => void;
  onMassImport: (text: string, resetProduction: boolean) => void;
  onDeletePresentation: (pType: PresentationType) => void;
  onAddTalla: (pType: PresentationType) => void;
  onDeleteTalla: (pType: PresentationType, rowId: string) => void;
  onRestoreRecord: (pType: PresentationType, tallaName: string) => void;
}

export const PresentationTable: React.FC<Props> = ({ 
  presentation, isWorkspaceMode = false, radarFilter = { type: 'ALL', talla: 'ALL' }, onRecordChange, onTypeChange, 
  onMassImport, onAddTalla, onDeleteTalla, onDeletePresentation
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isPrincipal = presentation.type === 'Tallo Coral' || presentation.type === 'Media Valva';
  const accentColor = isPrincipal ? (presentation.type === 'Tallo Coral' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-indigo-500';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const principalTypes: PresentationType[] = ['Tallo Coral', 'Media Valva'];

  if (isWorkspaceMode) {
    const isFiltering = radarFilter.type !== 'ALL' || radarFilter.talla !== 'ALL';
    const isTypeMatch = radarFilter.type === 'ALL' || radarFilter.type === presentation.type;

    return (
      <div className={`bg-[#080809] border rounded-2xl overflow-hidden transition-all duration-500 ${
        isFiltering && !isTypeMatch 
          ? 'opacity-10 grayscale blur-[4px] scale-95 -translate-y-4 pointer-events-none' 
          : 'shadow-2xl border-zinc-800'
      } ${isFiltering && isTypeMatch ? 'ring-2 ring-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)] border-indigo-500/30' : ''}`}>
        
        <div className={`flex items-center justify-between px-4 py-2.5 border-b transition-colors duration-500 ${isFiltering && isTypeMatch ? 'bg-indigo-950/30 border-indigo-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center gap-3" ref={menuRef}>
             <div className={`w-1.5 h-3.5 ${isFiltering && isTypeMatch ? 'bg-white animate-pulse' : accentColor} rounded-full`} />
             <button 
              onClick={() => isPrincipal && setIsTypeMenuOpen(!isTypeMenuOpen)}
              className={`text-[10px] font-black uppercase flex items-center gap-2 transition-colors ${isFiltering && isTypeMatch ? 'text-white' : 'text-zinc-100 hover:text-white'}`}
             >
               {presentation.type}
               {isPrincipal && <ChevronDown className={`w-3 h-3 opacity-40 transition-transform ${isTypeMenuOpen ? 'rotate-180' : ''}`} />}
             </button>

             {isTypeMenuOpen && isPrincipal && (
               <div className="absolute top-full left-4 mt-1 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  {principalTypes.map(t => (
                    <button 
                      key={t}
                      onClick={() => { onTypeChange(presentation.type, t); setIsTypeMenuOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${presentation.type === t ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      {t}
                      {presentation.type === t && <Check className="w-3 h-3" />}
                    </button>
                  ))}
               </div>
             )}
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => onDeletePresentation(presentation.type)} 
                className={`p-1.5 transition-all ${isFiltering && isTypeMatch ? 'text-white/20 hover:text-rose-500' : 'text-zinc-700 hover:text-rose-500'}`} 
                title="Borrar Producto Completo"
             >
                <Trash2 className="w-3.5 h-3.5" />
             </button>
             <div className="bg-zinc-950 px-2 py-0.5 rounded border border-white/5 shadow-inner">
                <span className={`text-[10px] font-mono font-black ${isFiltering && isTypeMatch ? 'text-white' : 'text-indigo-400'}`}>{presentation.total.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="divide-y divide-zinc-900/50">
          <div className="grid grid-cols-12 bg-black/40 text-[7px] font-black text-zinc-600 uppercase tracking-widest py-1.5 border-b border-zinc-800">
             <div className="col-span-2 text-center border-r border-zinc-900/50">Talla</div>
             <div className="col-span-3 text-right pr-4 border-r border-zinc-900/50">Entrada</div>
             <div className="col-span-2 text-right pr-4 border-r border-zinc-900/50">Proc.</div>
             <div className="col-span-2 text-center text-emerald-400 border-r border-zinc-900/50">Stock</div>
             <div className="col-span-3 text-right pr-4 text-amber-500">Saldo</div>
          </div>
          
          {presentation.records.map((row) => {
            const isTallaMatch = radarFilter.talla === 'ALL' || radarFilter.talla === row.talla;
            const hasStock = row.cajasP > 0;
            const isTargetMatch = isFiltering && isTypeMatch && isTallaMatch;
            const isTargetWithStock = isTargetMatch && hasStock;
            const isTargetWithoutStock = isTargetMatch && !hasStock;

            const isFinished = row.cajasP === 0 && row.cant > 0;
            const isOver = row.cajasP < 0;

            return (
              <div 
                key={row.id} 
                className={`grid grid-cols-12 items-stretch transition-all duration-300 group/row ${
                  isFiltering && !isTargetMatch ? 'opacity-10 blur-md pointer-events-none' : 'hover:bg-white/[0.03]'
                } ${isTargetWithStock ? 'bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40' : isTargetWithoutStock ? 'bg-zinc-900/50 opacity-30' : ''}`}
              >
                <div className={`col-span-2 flex items-center justify-center border-r border-zinc-900/50 ${isTargetWithStock ? 'bg-emerald-600/30' : 'bg-black/20'}`}>
                  <input 
                    type="text" value={row.talla} 
                    onChange={(e) => onRecordChange(presentation.type, row.id, 'talla', e.target.value.replace(/[^0-9\-]/g, ''))} 
                    className={`w-full bg-transparent text-[10px] font-black text-center outline-none transition-colors ${isTargetWithStock ? 'text-white' : 'text-zinc-500 group-hover/row:text-white'}`} 
                  />
                </div>

                <div className="col-span-3 flex flex-col justify-center items-end pr-4 border-r border-zinc-900/50 py-1.5">
                  <input 
                    type="number" value={row.cant === 0 ? '' : row.cant} 
                    onChange={(e) => onRecordChange(presentation.type, row.id, 'cant', parseFloat(e.target.value) || 0)} 
                    className="w-full bg-transparent text-xs font-mono font-black text-right outline-none text-zinc-100 focus:text-indigo-400" 
                  />
                  <div className="text-[6px] font-black text-zinc-800 uppercase tabular-nums">{row.cajasT} <span className="opacity-40">EST.</span></div>
                </div>

                <div className="col-span-2 flex items-center justify-end pr-4 border-r border-zinc-900/50 bg-indigo-500/[0.02]">
                   <input 
                    type="number" value={row.entreg === 0 ? '' : row.entreg} 
                    onChange={(e) => onRecordChange(presentation.type, row.id, 'entreg', parseFloat(e.target.value) || 0)} 
                    className="w-full bg-transparent text-sm font-mono font-black text-right outline-none text-indigo-400 focus:text-white" 
                   />
                </div>

                <div className={`col-span-2 flex flex-col items-center justify-center border-r border-zinc-900/50 transition-all ${isTargetWithStock ? 'bg-emerald-600/20' : hasStock ? 'bg-emerald-500/5' : isFinished ? 'bg-indigo-50/10' : 'bg-black/20'}`}>
                   {isFinished ? (
                     <Truck className="w-3.5 h-3.5 text-indigo-400" />
                   ) : isOver ? (
                     <div className="flex items-center gap-1">
                       <Box className="w-3 h-3 text-emerald-500" />
                       <span className="text-[9px] font-black text-emerald-400">{Math.abs(row.cajasP)}</span>
                     </div>
                   ) : (
                     <span className={`text-base font-mono font-black tabular-nums leading-none ${isTargetWithStock ? 'text-emerald-400 animate-pulse' : hasStock ? 'text-emerald-400/80' : 'text-zinc-800 opacity-30'}`}>
                       {row.cajasP}
                     </span>
                   )}
                </div>

                <div className="col-span-3 flex items-center pl-2">
                   <div className="flex-1 flex flex-col items-end pr-3">
                      <input 
                        type="number" value={row.saldo === 0 ? '' : row.saldo} 
                        onChange={(e) => onRecordChange(presentation.type, row.id, 'saldo', parseFloat(e.target.value) || 0)} 
                        className="w-full bg-transparent text-xs font-mono font-black text-right outline-none text-zinc-800 focus:text-amber-400" 
                        placeholder="0.0"
                      />
                   </div>
                   <button 
                     onClick={() => onDeleteTalla(presentation.type, row.id)} 
                     className="pr-2 text-zinc-900 hover:text-rose-500 opacity-0 group-hover/row:opacity-100 transition-all"
                   >
                     <Trash className="w-3 h-3" />
                   </button>
                </div>
              </div>
            );
          })}
          
          {!isFiltering && (
            <button 
              onClick={() => onAddTalla(presentation.type)} 
              className="w-full py-2 flex items-center justify-center gap-2 text-[7px] font-black text-zinc-700 hover:text-indigo-400 hover:bg-white/[0.01] uppercase tracking-[0.25em] transition-all"
            >
              <Plus className="w-3 h-3" /> Nuevo Calibre
            </button>
          )}
        </div>
        <MassImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onMassImport} title={presentation.type} />
      </div>
    );
  }

  return (
    <div className={`rounded-[2.5rem] border overflow-hidden backdrop-blur-sm transition-all duration-500 shadow-xl ${isPrincipal ? (presentation.type === 'Tallo Coral' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5') : 'border-indigo-500/20 bg-indigo-500/5'}`}>
      <div className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/20">
        <div className="flex items-center gap-6">
          <div className={`w-1.5 h-8 ${accentColor} rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
          <div className="flex flex-col relative" ref={menuRef}>
            <div className={`flex items-center gap-3 group ${isPrincipal ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => isPrincipal && setIsTypeMenuOpen(!isTypeMenuOpen)}>
              <h3 className="font-black text-2xl uppercase tracking-tighter text-white italic">{presentation.type}</h3>
              {isPrincipal && <ChevronDown className={`w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-all ${isTypeMenuOpen ? 'rotate-180' : ''}`} />}
            </div>
            {isTypeMenuOpen && isPrincipal && (
               <div className="absolute top-full left-0 mt-2 w-64 bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {principalTypes.map(t => (
                    <button 
                      key={t}
                      onClick={() => { onTypeChange(presentation.type, t); setIsTypeMenuOpen(false); }}
                      className={`w-full px-6 py-4 text-left text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all ${presentation.type === t ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      {t}
                      {presentation.type === t && <Check className="w-4 h-4" />}
                    </button>
                  ))}
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-12">
           <div className="text-right">
              <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1 block">Masa Acumulada</span>
              <div className="flex items-baseline justify-end gap-2">
                <span className={`text-4xl font-black tabular-nums ${isPrincipal ? (presentation.type === 'Tallo Coral' ? 'text-emerald-400' : 'text-amber-400') : 'text-indigo-400'}`}>{presentation.total.toLocaleString()}</span>
                <span className="text-xs font-black text-zinc-800">KG</span>
              </div>
           </div>
           <button 
             onClick={() => onDeletePresentation(presentation.type)}
             className="p-4 bg-zinc-900/50 hover:bg-rose-600/20 text-zinc-800 hover:text-rose-500 rounded-2xl transition-all border border-zinc-800"
             title="Remover Bloque"
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-950/40">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] text-center">Calibre</th>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-center">Entrada M.P.</th>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center">Estándar CJ</th>
              <th className="px-10 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] text-center">Producción</th>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center">Pendiente</th>
              <th className="px-10 py-5 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] text-center">Saldo KG</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/20">
            {presentation.records.map((row) => {
              const isOverDetail = row.cajasP < 0;
              return (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4"><input type="text" value={row.talla} onChange={(e) => onRecordChange(presentation.type, row.id, 'talla', e.target.value)} className="w-full bg-transparent text-xl font-black text-center uppercase outline-none text-zinc-400 group-hover:text-white" /></td>
                  <td className="px-6 py-4"><input type="number" value={row.cant || ''} onChange={(e) => onRecordChange(presentation.type, row.id, 'cant', parseFloat(e.target.value) || 0)} className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-6 py-3.5 text-2xl font-black text-center text-white tabular-nums shadow-inner" /></td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-700 font-black text-lg">{row.cajasT}</td>
                  <td className="px-6 py-4"><input type="number" value={row.entreg || ''} onChange={(e) => onRecordChange(presentation.type, row.id, 'entreg', parseFloat(e.target.value) || 0)} className="w-full bg-indigo-500/[0.05] border border-indigo-500/20 rounded-2xl px-6 py-3.5 text-2xl font-black text-center text-indigo-400 tabular-nums" /></td>
                  <td className={`px-6 py-4 text-center font-mono font-black text-lg ${isOverDetail ? 'text-emerald-500' : 'text-zinc-700'}`}>
                    {isOverDetail ? (
                      <div className="flex items-center justify-center gap-2">
                        <Box className="w-5 h-5 text-emerald-500" />
                        <span>{Math.abs(row.cajasP)}</span>
                      </div>
                    ) : row.cajasP}
                  </td>
                  <td className="px-6 py-4"><input type="number" value={row.saldo || ''} onChange={(e) => onRecordChange(presentation.type, row.id, 'saldo', parseFloat(e.target.value) || 0)} className="w-full bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl px-6 py-3.5 text-2xl font-black text-center text-amber-500 tabular-nums" /></td>
                  <td className="pr-10 text-right"><button onClick={() => onDeleteTalla(presentation.type, row.id)} className="p-3 text-zinc-900 hover:text-rose-500 transition-all"><Trash className="w-5 h-5" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <MassImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onMassImport} title={presentation.type} />
    </div>
  );
};

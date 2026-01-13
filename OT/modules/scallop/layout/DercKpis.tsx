
import React, { useMemo } from 'react';
import { Scale, ShoppingBag, BarChart3, FileSpreadsheet, Camera, Trash2 } from 'lucide-react';
import { DercEntry } from '../../../types';
import { exportDercToExcel } from '../../../core/exporter';
import { PredictiveShadow } from './PredictiveShadow';
import { predictiveEngine } from '../../../core/predictiveEngine';

interface Props {
  recepcionFinal: number;
  totalEntregado: number;
  yieldPercent: number;
  isPulsing: boolean;
  derc: DercEntry;
  history: DercEntry[]; // Añadimos historial para la predicción
  onShowShare: () => void;
  onDeleteRequest: () => void;
  showConfirmDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export const DercKpis: React.FC<Props> = ({ 
  recepcionFinal, totalEntregado, yieldPercent, isPulsing, derc, history,
  onShowShare, onDeleteRequest, showConfirmDelete, onConfirmDelete, onCancelDelete 
}) => {
  const prediction = useMemo(() => predictiveEngine.analyzeLot(derc, history), [derc, history]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`bg-zinc-900 border border-white/5 p-6 rounded-[2rem] shadow-xl flex flex-col items-center justify-center transition-all duration-700 ${isPulsing ? 'border-emerald-500/50 scale-[1.02] ring-2 ring-emerald-500/5' : ''}`}>
          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Recepción Final</span>
          <div className="flex items-center gap-3">
            <Scale className={`w-5 h-5 transition-colors duration-500 ${isPulsing ? 'text-emerald-400' : 'text-zinc-700'}`} />
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl font-black tabular-nums transition-colors duration-500 ${isPulsing ? 'text-emerald-400' : 'text-white'}`}>
                {recepcionFinal.toLocaleString(undefined, { minimumFractionDigits: 1 })}
              </span>
              <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">KG</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-white/5 p-6 rounded-[2rem] shadow-md text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Entregado</span>
          <div className="flex items-center gap-3">
             <ShoppingBag className="w-5 h-5 text-indigo-400" />
             <div className="flex items-baseline gap-1.5">
               <p className="text-4xl font-black text-white tabular-nums">
                 {totalEntregado.toLocaleString(undefined, { minimumFractionDigits: 1 })} 
               </p>
               <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">KG</span>
             </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-white/5 p-6 rounded-[2rem] shadow-md text-center flex flex-col items-center justify-center relative overflow-hidden group">
          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Rendimiento Real</span>
          <div className="flex items-center gap-3">
             <BarChart3 className={`w-5 h-5 ${yieldPercent >= 100 ? 'text-cyan-400' : 'text-emerald-400'}`} />
             <p className={`text-4xl font-black tabular-nums ${yieldPercent >= 100 ? 'text-cyan-400' : yieldPercent >= 97 ? 'text-emerald-400' : 'text-amber-400'}`}>
               {yieldPercent.toFixed(2)}%
             </p>
          </div>
        </div>

        {/* REEMPLAZO DE BOTONES POR DIGITAL TWIN STATUS */}
        <PredictiveShadow prediction={prediction} actualYield={yieldPercent} />
      </div>

      {/* Botonera de Acciones Movida a una fila sutil debajo */}
      <div className="flex gap-4 justify-end">
          <div className="flex gap-2">
            <button onClick={() => exportDercToExcel(derc)} className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white border border-zinc-800 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar .XLS
            </button>
            <button onClick={onShowShare} className="px-6 py-3 bg-zinc-900 hover:bg-white text-zinc-500 hover:text-black border border-zinc-800 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl group">
              <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Dossier Foto
            </button>
          </div>
          
          <div className="w-px h-10 bg-zinc-800 mx-2" />

          {!showConfirmDelete ? (
            <button onClick={onDeleteRequest} className="px-6 py-3 bg-rose-600/5 hover:bg-rose-600/10 text-rose-900 hover:text-rose-500 border border-rose-500/10 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Registro
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-right-2">
                <button onClick={onConfirmDelete} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Confirmar Purga</button>
                <button onClick={onCancelDelete} className="px-6 py-3 bg-zinc-800 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancelar</button>
            </div>
          )}
      </div>
    </div>
  );
};

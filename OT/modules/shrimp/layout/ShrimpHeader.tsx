
import React from 'react';
import { Scale } from 'lucide-react';

interface Props {
  lote: string;
  setLote: (val: string) => void;
  mp: number;
  setMp: (val: number) => void;
  yieldPct: number;
}

export const ShrimpHeader: React.FC<Props> = ({ lote, setLote, mp, setMp, yieldPct }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="col-span-1 md:col-span-2 bg-zinc-900/40 border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl">
      <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
        <Scale className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Lote de Langostino</label>
          <input 
            type="text" 
            value={lote} 
            onChange={e => setLote(e.target.value)} 
            placeholder="Ej: OV-5457"
            className="w-full bg-zinc-950 border border-emerald-500/10 rounded-xl px-4 py-3 text-white font-black uppercase outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Materia Prima (MP)</label>
          <input 
            type="number" 
            value={mp || ''} 
            onChange={e => setMp(parseFloat(e.target.value) || 0)} 
            placeholder="0.00"
            className="w-full bg-zinc-950 border border-emerald-500/10 rounded-xl px-4 py-3 text-white font-black outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
          />
        </div>
      </div>
    </div>

    <div className="bg-emerald-600 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-600/20">
      <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-2">Rendimiento Real</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums">{yieldPct.toFixed(1)}</h3>
        <span className="text-2xl font-black text-white/50">%</span>
      </div>
    </div>
  </div>
);

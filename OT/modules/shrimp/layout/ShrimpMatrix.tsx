
import React from 'react';
import { ShrimpRecord } from '../../../types';

interface Props {
  records: ShrimpRecord[];
  onUpdate: (talla: string, field: keyof ShrimpRecord, val: string) => void;
}

export const ShrimpMatrix: React.FC<Props> = ({ records, onUpdate }) => (
  <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-zinc-950/60 border-b border-zinc-800">
          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">Tallas</th>
          <th className="px-8 py-5 text-[10px] font-black text-amber-500 uppercase tracking-widest text-center bg-amber-500/5">Tail Off (KG)</th>
          <th className="px-8 py-5 text-[10px] font-black text-cyan-500 uppercase tracking-widest text-center bg-cyan-500/5">EZ Peel (KG)</th>
          <th className="px-8 py-5 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center bg-emerald-500/5">Tail On (KG)</th>
          <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/20">
        {records.map((r) => (
          <tr key={r.talla} className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-8 py-4 font-black text-zinc-400 uppercase text-sm tracking-tighter">{r.talla}</td>
            <td className="px-4 py-2 bg-amber-500/5">
              <input 
                type="number" 
                value={r.tailOff || ''} 
                onChange={e => onUpdate(r.talla, 'tailOff', e.target.value)}
                className="w-full bg-transparent text-center font-black text-amber-400 outline-none focus:text-white transition-colors placeholder:text-zinc-800"
              />
            </td>
            <td className="px-4 py-2 bg-cyan-500/5">
              <input 
                type="number" 
                value={r.ezPeel || ''} 
                onChange={e => onUpdate(r.talla, 'ezPeel', e.target.value)}
                className="w-full bg-transparent text-center font-black text-cyan-400 outline-none focus:text-white transition-colors placeholder:text-zinc-800"
              />
            </td>
            <td className="px-4 py-2 bg-emerald-500/5">
              <input 
                type="number" 
                value={r.tailOn || ''} 
                onChange={e => onUpdate(r.talla, 'tailOn', e.target.value)}
                className="w-full bg-transparent text-center font-black text-emerald-400 outline-none focus:text-white transition-colors placeholder:text-zinc-800"
              />
            </td>
            <td className="px-8 py-4 text-right font-black text-zinc-600 tabular-nums">
              {(r.tailOff + r.ezPeel + r.tailOn).toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

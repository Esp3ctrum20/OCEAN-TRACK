
import React from 'react';

interface Props {
  totals: {
    tOff: number;
    ezP: number;
    tOn: number;
    final: number;
  };
}

export const ShrimpSummary: React.FC<Props> = ({ totals }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[
      { label: 'Total Tail Off', val: totals.tOff, color: 'text-amber-400', bg: 'bg-amber-400/10' },
      { label: 'Total EZ Peel', val: totals.ezP, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
      { label: 'Total Tail On', val: totals.tOn, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { label: 'Salida Neta', val: totals.final, color: 'text-white', bg: 'bg-zinc-800' }
    ].map((item, i) => (
      <div key={i} className={`p-8 rounded-[2rem] border border-white/5 ${item.bg} shadow-xl`}>
         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{item.label}</p>
         <h4 className={`text-3xl font-black tabular-nums ${item.color}`}>
           {item.val.toLocaleString(undefined, { minimumFractionDigits: 1 })}
           <span className="text-xs ml-2 opacity-30">KG</span>
         </h4>
      </div>
    ))}
  </div>
);

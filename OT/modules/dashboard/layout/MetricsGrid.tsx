
import React from 'react';
import { Scale, ShoppingBag, BarChart3, TrendingUp } from 'lucide-react';

interface Props {
  totals: { entrada: number; salida: number };
  theme?: string;
}

export const MetricsGrid: React.FC<Props> = ({ totals, theme }) => {
  const isLight = theme === 'pearl';
  const yieldPct = totals.entrada > 0 ? (totals.salida / totals.entrada) * 100 : 0;
  
  const yieldColor = yieldPct >= 100 
    ? (isLight ? 'text-cyan-600' : 'text-cyan-400') 
    : yieldPct >= 97 
      ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
      : (isLight ? 'text-amber-600' : 'text-amber-400');

  const cardBase = isLight 
    ? "bg-white border-zinc-200 hover:border-indigo-200 shadow-sm" 
    : "bg-zinc-900 border-white/5 hover:border-zinc-700 shadow-2xl";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Bloque 1: Entrada Total */}
      <div className={`${cardBase} p-8 rounded-[2.5rem] relative overflow-hidden transition-all group`}>
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Entrada Total</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className={`text-5xl font-black tracking-tighter tabular-nums ${isLight ? 'text-zinc-950' : 'text-white'}`}>
              {totals.entrada.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </h3>
            <span className="text-xs font-black text-zinc-400 uppercase">KG</span>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest border-t pt-4 w-full ${isLight ? 'border-zinc-100 text-zinc-400' : 'border-white/5 text-zinc-700'}`}>Valor Bruto</p>
        </div>
      </div>

      {/* Bloque 2: Salida Neta */}
      <div className={`${cardBase} p-8 rounded-[2.5rem] relative overflow-hidden transition-all group hover:border-indigo-500/30`}>
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Salida Neta</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className={`text-5xl font-black tracking-tighter tabular-nums ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
              {totals.salida.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </h3>
            <span className="text-xs font-black text-indigo-400/50 uppercase">KG</span>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest border-t pt-4 w-full ${isLight ? 'border-zinc-100 text-indigo-200' : 'border-white/5 text-indigo-900/50'}`}>Producto Final</p>
        </div>
      </div>

      {/* Bloque 3: Rendimiento */}
      <div className={`${cardBase} p-8 rounded-[2.5rem] relative overflow-hidden transition-all group`}>
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Rendimiento</p>
          <div className="flex items-baseline gap-1 mb-4">
            <h3 className={`text-5xl font-black tracking-tighter tabular-nums ${yieldColor}`}>
              {yieldPct.toFixed(2)}
            </h3>
            <span className={`text-2xl font-black ${yieldColor}`}>%</span>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest border-t pt-4 w-full opacity-40 ${yieldColor} ${isLight ? 'border-zinc-100' : 'border-white/5'}`}>Eficiencia</p>
        </div>
      </div>
    </div>
  );
};

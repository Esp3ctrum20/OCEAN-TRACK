
import React from 'react';
import { DercEntry, PresentationType, AppTheme } from '../../../types';

interface Props {
  dercs: DercEntry[];
  theme?: AppTheme;
}

export const ProductionSummaryTables: React.FC<Props> = ({ dercs, theme }) => {
  const isLight = theme === 'pearl';

  const getAggregatedData = (types: PresentationType[]) => {
    const tallas: Record<string, { entrada: number; salida: number; saldo: number }> = {};
    
    dercs.forEach(derc => {
      derc.presentations
        .filter(p => types.includes(p.type))
        .forEach(p => {
          p.records.forEach(r => {
            if (!tallas[r.talla]) {
              tallas[r.talla] = { entrada: 0, salida: 0, saldo: 0 };
            }
            tallas[r.talla].entrada += r.cant;
            tallas[r.talla].salida += r.kilosT;
            tallas[r.talla].saldo += r.saldo || 0;
          });
        });
    });

    const getPriority = (t: string): [number, number] => {
      const matches = t.match(/\d+/g);
      if (!matches) return [999, 999];
      const f = parseInt(matches[0], 10);
      const s = matches[1] ? parseInt(matches[1], 10) : f;
      return [f, s];
    };

    return Object.entries(tallas)
      .sort((a, b) => {
        const [a1, a2] = getPriority(a[0]);
        const [b1, b2] = getPriority(b[0]);
        if (a1 !== b1) return a1 - b1;
        return a2 - b2;
      })
      .map(([talla, data]) => ({
        talla,
        ...data,
        rend: data.entrada > 0 ? (data.salida / data.entrada) * 100 : 0
      }));
  };

  const coralData = getAggregatedData(['Tallo Coral', 'Media Valva']);
  const soloData = getAggregatedData(['Tallo Solo']);

  const renderTable = (title: string, data: any[], isSolo: boolean = false) => {
    const totalEntrada = data.reduce((acc, d) => acc + d.entrada, 0);
    const totalSalida = data.reduce((acc, d) => acc + d.salida, 0);
    const avgRend = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;

    const tableBg = isLight ? "bg-white border-zinc-200 shadow-sm" : "bg-zinc-900/50 border-zinc-800 shadow-2xl";
    const headerBg = isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950/40 border-zinc-800";
    const rowBorder = isLight ? "divide-zinc-100" : "divide-zinc-800/30";

    return (
      <div className={`border rounded-3xl overflow-hidden flex flex-col ${tableBg}`}>
        <div className={`px-5 py-3 border-b flex justify-between items-center ${headerBg}`}>
           <h3 className={`text-[8px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-900' : 'text-zinc-400'}`}>{title}</h3>
           <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-800 text-zinc-600'}`}>Consolidado</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={isLight ? "bg-zinc-50/30" : "bg-zinc-950/10"}>
                <th className={`px-5 py-2 text-[7px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Talla</th>
                {isSolo && <th className="px-5 py-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest text-center">Saldo</th>}
                <th className={`px-5 py-2 text-[7px] font-black uppercase tracking-widest text-right ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Salida (KG)</th>
                <th className={`px-5 py-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest text-right`}>M.P. (KG)</th>
                <th className={`px-5 py-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest text-center`}>Rend.</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${rowBorder}`}>
              {data.map((row, i) => (
                <tr key={i} className={`transition-colors group ${isLight ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.01]'}`}>
                  <td className={`px-5 py-2 text-[10px] font-black uppercase ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{row.talla}</td>
                  {isSolo && (
                    <td className={`px-5 py-2 text-[10px] text-center font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      {row.saldo.toLocaleString()}
                    </td>
                  )}
                  <td className={`px-5 py-2 text-[11px] font-black text-right tabular-nums transition-colors ${isLight ? 'text-zinc-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'}`}>
                    {row.salida.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </td>
                  <td className={`px-5 py-2 text-[10px] text-right tabular-nums ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {row.entrada.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </td>
                  <td className="px-5 py-2 text-center">
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                       row.rend >= 98 
                        ? (isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20') 
                        : row.rend >= 94 
                          ? (isLight ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-amber-500/10 text-amber-400 border-amber-500/20') 
                          : (isLight ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')
                     }`}>
                       {row.rend.toFixed(1)}%
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={`border-t ${isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'}`}>
                <td className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">TOTAL</td>
                {isSolo && <td className="px-5 py-3"></td>}
                <td className={`px-5 py-3 text-[12px] font-black text-right tabular-nums ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  {totalSalida.toLocaleString()}
                </td>
                <td className={`px-5 py-3 text-[12px] font-black text-right tabular-nums ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>
                  {totalEntrada.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-center">
                   <span className={`text-[9px] font-black px-2 py-1 rounded shadow-sm ${isLight ? 'bg-zinc-900 text-white border-zinc-950' : 'bg-zinc-800 text-white border-zinc-700'}`}>
                     {avgRend.toFixed(1)}%
                   </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      {renderTable("Principal: Coral / Media Valva", coralData)}
      {renderTable("Agregado: Tallo Solo", soloData, true)}
    </div>
  );
};

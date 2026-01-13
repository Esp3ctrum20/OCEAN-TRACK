
import React, { useMemo } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus, Zap, Target, Package, BarChart3, Scale, Info, Layers, AlertCircle, Weight } from 'lucide-react';
import { DercEntry } from '../../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, ComposedChart, Line
} from 'recharts';

interface Props {
  dercs: DercEntry[];
  loteAId: string;
  setLoteAId: (id: string) => void;
  loteBId: string;
  setLoteBId: (id: string) => void;
}

const ComparisonCard: React.FC<{ title: string; valA: number; valB: number; unit: string; inverse?: boolean }> = ({ title, valA, valB, unit, inverse = false }) => {
  const diff = valB - valA;
  const diffPct = valA > 0 ? (diff / valA) * 100 : 0;
  const isBetter = inverse ? diff <= 0 : diff >= 0;
  
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 group hover:border-indigo-500/30 transition-all shadow-lg">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="space-y-1 border-r border-zinc-800 pr-4">
          <p className="text-[8px] font-bold text-zinc-700 uppercase">Referencia</p>
          <p className="text-xl font-black text-white tabular-nums">{valA.toLocaleString()} <span className="text-[9px] opacity-30">{unit}</span></p>
        </div>
        <div className="space-y-1 pl-4">
          <p className="text-[8px] font-bold text-zinc-700 uppercase">Objetivo</p>
          <p className="text-xl font-black text-indigo-400 tabular-nums">{valB.toLocaleString()} <span className="text-[9px] opacity-30">{unit}</span></p>
        </div>
      </div>
      <div className={`mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between ${diff === 0 ? 'text-zinc-700' : isBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
        <div className="flex items-center gap-2">
           {diff === 0 ? <Minus className="w-3.5 h-3.5" /> : isBetter ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
           <span className="text-[10px] font-black uppercase tracking-widest">{diff === 0 ? 'Sin Variación' : isBetter ? 'SUPERÁVIT' : 'DÉFICIT'}</span>
        </div>
        <span className="text-xs font-black tabular-nums">{diff > 0 ? '+' : ''}{diff.toFixed(1)} {unit} ({diffPct.toFixed(1)}%)</span>
      </div>
    </div>
  );
};

export const BenchmarkSection: React.FC<Props> = ({ dercs, loteAId, setLoteAId, loteBId, setLoteBId }) => {
  const dercA = useMemo(() => dercs.find(d => d.id === loteAId), [dercs, loteAId]);
  const dercB = useMemo(() => dercs.find(d => d.id === loteBId), [dercs, loteBId]);

  const getStats = (derc: DercEntry | undefined) => {
    if (!derc) return { entrada: 0, salida: 0, yield: 0, tallas: {} as Record<string, number>, entTallas: {} as Record<string, number> };
    const ent = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const sal = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    
    const tallas: Record<string, number> = {};
    const entTallas: Record<string, number> = {};
    derc.presentations.forEach(p => {
      p.records.forEach(r => {
        tallas[r.talla] = (tallas[r.talla] || 0) + r.kilosT;
        entTallas[r.talla] = (entTallas[r.talla] || 0) + r.cant;
      });
    });

    return { entrada: ent, salida: sal, yield: ent > 0 ? (sal / ent) * 100 : 0, tallas, entTallas };
  };

  const statsA = useMemo(() => getStats(dercA), [dercA]);
  const statsB = useMemo(() => getStats(dercB), [dercB]);

  const comparisonData = useMemo(() => {
    if (!dercA || !dercB) return [];
    const allTallas = Array.from(new Set([...Object.keys(statsA.tallas), ...Object.keys(statsB.tallas)]))
      .sort((a, b) => {
        const getP = (t: string) => parseInt(t.match(/\d+/)?.[0] || '999');
        return getP(a) - getP(b);
      });

    return allTallas.map(talla => {
      const valA = statsA.tallas[talla] || 0;
      const valB = statsB.tallas[talla] || 0;
      const entA = statsA.entTallas[talla] || 0;
      const entB = statsB.entTallas[talla] || 0;
      const rendA = entA > 0 ? (valA / entA) * 100 : 0;
      const rendB = entB > 0 ? (valB / entB) * 100 : 0;

      return {
        name: talla,
        valA,
        valB,
        diff: valB - valA,
        rendA: parseFloat(rendA.toFixed(2)),
        rendB: parseFloat(rendB.toFixed(2)),
        rendDiff: rendB - rendA
      };
    });
  }, [statsA, statsB, dercA, dercB]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* SELECCIÓN TÁCTICA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/30 p-10 rounded-[3.5rem] border border-zinc-800/50 shadow-2xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-full hidden md:flex items-center justify-center z-10 shadow-xl">
          <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-700" /> Lote de Referencia (Base)
          </label>
          <select 
            value={loteAId} 
            onChange={(e) => setLoteAId(e.target.value)}
            className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-[2rem] px-8 py-5 text-sm font-black text-white uppercase outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner appearance-none"
          >
            <option value="">SELECCIONE LOTE...</option>
            {dercs.map(d => <option key={d.id} value={d.id}>{d.lote} • {d.dercId}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" /> Lote Objetivo (Target)
          </label>
          <select 
            value={loteBId} 
            onChange={(e) => setLoteBId(e.target.value)}
            className="w-full bg-zinc-950 border-2 border-indigo-500/20 rounded-[2rem] px-8 py-5 text-sm font-black text-white uppercase outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner appearance-none"
          >
            <option value="">SELECCIONE LOTE...</option>
            {dercs.map(d => <option key={d.id} value={d.id}>{d.lote} • {d.dercId}</option>)}
          </select>
        </div>
      </div>

      {!loteAId || !loteBId ? (
        <div className="h-96 border-2 border-dashed border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center text-zinc-800 gap-6">
          <div className="p-8 bg-zinc-900/20 rounded-full animate-pulse">
            <ArrowRightLeft className="w-20 h-20 opacity-10" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] max-w-xs text-center leading-relaxed">
            Seleccione dos unidades de ADN industrial para iniciar la auditoría comparativa.
          </p>
        </div>
      ) : (
        <>
          {/* BLOQUE DE IMPACTO IA */}
          <div className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-8 shadow-inner relative overflow-hidden group">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all" />
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 flex-shrink-0">
                <Zap className="w-10 h-10 text-white animate-pulse" />
             </div>
             <div className="space-y-3 flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                   Análisis Comparativo de Masa
                   <span className="text-[8px] bg-indigo-500 text-white px-2 py-0.5 rounded shadow-lg">TARGET VS BASE</span>
                </h4>
                <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                  El lote objetivo <span className="text-indigo-400 font-black">{dercB?.lote}</span> presenta un diferencial de rendimiento de <span className={`font-black ${statsB.yield >= statsA.yield ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {statsB.yield >= statsA.yield ? '+' : ''}{(statsB.yield - statsA.yield).toFixed(2)}%
                  </span> comparado con la referencia. Esto representa un cambio de <span className="text-white font-black">{Math.abs(statsB.salida - statsA.salida).toFixed(1)} KG</span> netos en producto terminado.
                </p>
             </div>
          </div>

          {/* KPIs DE ALTO NIVEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <ComparisonCard title="Carga Materia Prima" valA={statsA.entrada} valB={statsB.entrada} unit="KG" />
             <ComparisonCard title="Producto Terminado" valA={statsA.salida} valB={statsB.salida} unit="KG" />
             <ComparisonCard title="Eficiencia de Planta" valA={statsA.yield} valB={statsB.yield} unit="%" />
          </div>

          {/* MATRIZ DE DIFERENCIALES TÉCNICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-[3rem] shadow-2xl space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-white uppercase text-xs tracking-[0.3em]">Cromatografía de Calibres</h4>
                    <p className="text-[10px] text-zinc-600 mt-1 font-bold uppercase tracking-widest">DIFERENCIAL DE RENDIMIENTO POR TALLA (%)</p>
                  </div>
                </div>

                <div className="h-[350px] w-full min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={comparisonData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 900 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', borderRadius: '16px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="rendA" name="Rend. Base" fill="#18181b" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar dataKey="rendB" name="Rend. Target" radius={[4, 4, 0, 0]} barSize={40}>
                         {comparisonData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.rendDiff >= 0 ? '#10b981' : '#f43f5e'} />
                         ))}
                      </Bar>
                      <Line type="monotone" dataKey="rendB" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 flex flex-col justify-between">
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 rounded-xl"><AlertCircle className="w-5 h-5 text-rose-500" /></div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Mayores Desvíos</h4>
                   </div>
                   
                   <div className="space-y-4">
                      {comparisonData.sort((a, b) => a.rendDiff - b.rendDiff).slice(0, 4).map((item, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${item.rendDiff < 0 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-zinc-900 border-zinc-800 opacity-40'}`}>
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-black text-zinc-300 uppercase">{item.name}</span>
                              <span className={`text-[11px] font-black ${item.rendDiff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                 {item.rendDiff >= 0 ? '+' : ''}{item.rendDiff.toFixed(2)}%
                              </span>
                           </div>
                           <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.rendDiff < 0 ? 'bg-rose-600' : 'bg-emerald-600'}`} 
                                style={{ width: `${Math.min(100, Math.abs(item.rendDiff) * 10)}%` }} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-8 mt-8 border-t border-zinc-800 space-y-4">
                   <div className="flex items-center gap-3">
                      <Weight className="w-4 h-4 text-zinc-600" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance de Masa Final</span>
                   </div>
                   <p className="text-4xl font-black text-white tabular-nums">
                     {Math.abs(statsB.salida - statsA.salida).toFixed(1)} <span className="text-sm text-zinc-600 font-bold">KG</span>
                   </p>
                   <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">DIFERENCIAL DE DESPACHO ACUMULADO</p>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

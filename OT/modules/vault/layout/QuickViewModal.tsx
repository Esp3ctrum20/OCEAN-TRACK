
import React, { useMemo } from 'react';
import { X, Package, BarChart3, Layers2, ShieldCheck, Scale, ShoppingBag, Target, TrendingUp, TrendingDown, ShieldAlert, Zap, Edit3, Columns } from 'lucide-react';
import { DercEntry, AppTheme } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  derc: DercEntry | null;
  referenceDerc?: DercEntry | null;
  onEditInMesa?: (id: string) => void; // Nueva acción
  theme?: AppTheme;
}

const NuclearVerdict: React.FC<{ delta: number, isLight?: boolean }> = ({ delta, isLight }) => {
  const isPositive = delta >= 0;
  const absDelta = Math.abs(delta);
  
  let label = "Estándar Óptimo";
  let color = isLight ? "text-emerald-700" : "text-emerald-400";
  let bg = isLight ? "bg-emerald-50" : "bg-emerald-500/10";
  let border = isLight ? "border-emerald-200" : "border-emerald-500/30";

  if (absDelta > 5) {
    label = isPositive ? "Eficiencia Excepcional" : "Desviación Crítica";
    color = isPositive ? (isLight ? "text-cyan-700" : "text-cyan-400") : (isLight ? "text-rose-700" : "text-rose-500");
    bg = isPositive ? (isLight ? "bg-cyan-50" : "bg-cyan-500/10") : (isLight ? "bg-rose-50" : "bg-rose-500/10");
    border = isPositive ? (isLight ? "border-cyan-200" : "border-cyan-500/30") : (isLight ? "border-rose-200" : "border-rose-500/30");
  }

  return (
    <div className={`px-8 py-3 rounded-2xl border ${bg} ${border} ${color} flex items-center gap-4 animate-in zoom-in-95 duration-500 shadow-sm`}>
      <Zap className="w-4 h-4" />
      <span className="text-[11px] font-black uppercase tracking-[0.3em]">{label}</span>
    </div>
  );
};

export const QuickViewModal: React.FC<Props> = ({ isOpen, onClose, derc, referenceDerc, onEditInMesa, theme }) => {
  const isLight = theme === 'pearl';

  const stats = useMemo(() => {
    if (!derc) return { totalSalida: 0, totalEntrada: 0, yieldPct: 0, refStats: null };

    const totalSalida = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    const totalEntrada = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const yieldPct = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;

    let refStats = null;
    if (referenceDerc && referenceDerc.id !== derc.id) {
      const refSalida = referenceDerc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
      const refEntrada = referenceDerc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
      const refYield = refEntrada > 0 ? (refSalida / refEntrada) * 100 : 0;
      
      refStats = {
        yield: refYield,
        entrada: refEntrada,
        salida: refSalida,
        deltaYield: yieldPct - refYield,
        deltaEntrada: totalEntrada - refEntrada,
        deltaSalida: totalSalida - refSalida
      };
    }

    return { totalSalida, totalEntrada, yieldPct, refStats };
  }, [derc, referenceDerc]);

  if (!isOpen || !derc) return null;

  const { totalSalida, totalEntrada, yieldPct, refStats } = stats;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 backdrop-blur-3xl animate-in fade-in duration-500 ${isLight ? 'bg-black/30' : 'bg-black/98'}`}>
      <button 
        onClick={onClose} 
        className={`fixed top-8 right-8 p-5 border rounded-full shadow-2xl transition-all active:scale-90 group z-[10000] ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-rose-600 hover:text-white' : 'bg-zinc-900/80 hover:bg-rose-600 border-white/10 text-white'}`}
      >
        <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className={`border w-full max-w-6xl rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#09090b] border-white/10'}`}>
        
        <div className={`px-12 py-10 border-b flex items-center justify-between transition-colors ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-950/60 border-white/5'}`}>
          <div className="flex items-center gap-8">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-xl ${isLight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 shadow-indigo-500/10'}`}>
              <BarChart3 className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-6">
                <h2 className={`text-4xl font-black uppercase tracking-tighter tabular-nums ${isLight ? 'text-zinc-950' : 'text-white'}`}>{derc.dercId}</h2>
                <span className={`text-[11px] px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border ${isLight ? 'bg-white border-zinc-200 text-zinc-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{derc.date}</span>
              </div>
              <p className={`text-[11px] font-black uppercase tracking-[0.4em] mt-2 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Dossier de Inspección Táctica • Lote {derc.lote}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {onEditInMesa && (
               <button 
                onClick={() => { onEditInMesa(derc.id); onClose(); }}
                className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
               >
                 <Columns className="w-4 h-4" /> Editar en Mesa
               </button>
             )}
             {refStats && <NuclearVerdict delta={refStats.deltaYield} isLight={isLight} />}
          </div>
        </div>

        <div className={`flex divide-x border-b transition-colors ${isLight ? 'bg-white border-zinc-100 divide-zinc-100' : 'bg-zinc-950/30 border-white/5 divide-white/5'}`}>
          {[
            { label: 'Entrada M.P.', val: totalEntrada.toLocaleString(), unit: 'KG', color: isLight ? 'text-zinc-900' : 'text-zinc-200', icon: <Scale className="w-5 h-5" />, delta: refStats?.deltaEntrada },
            { label: 'Salida Neta', val: totalSalida.toLocaleString(), unit: 'KG', color: isLight ? 'text-indigo-600' : 'text-indigo-400', icon: <ShoppingBag className="w-5 h-5" />, delta: refStats?.deltaSalida },
            { label: 'Eficiencia', val: yieldPct.toFixed(2), unit: '%', color: yieldPct >= 98 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-amber-600' : 'text-amber-400'), icon: <Target className="w-5 h-5" />, delta: refStats?.deltaYield },
            { label: 'Presentaciones', val: derc.presentations.length.toString(), unit: 'TIPO', color: isLight ? 'text-zinc-400' : 'text-zinc-600', icon: <Layers2 className="w-5 h-5" /> }
          ].map((kpi, i) => (
            <div key={i} className={`flex-1 px-12 py-10 flex flex-col gap-3 group transition-colors relative ${isLight ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isLight ? 'text-zinc-300 group-hover:text-indigo-600' : 'text-zinc-700 group-hover:text-indigo-500'}`}>{kpi.icon}</span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{kpi.label}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black tabular-nums tracking-tighter ${kpi.color}`}>{kpi.val}</span>
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{kpi.unit}</span>
                </div>
                {kpi.delta !== undefined && (
                  <div className={`flex items-center gap-2 text-[12px] font-black mt-3 ${kpi.delta >= 0 ? (isLight ? 'text-emerald-600' : 'text-cyan-400') : 'text-rose-600'}`}>
                    {kpi.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(kpi.delta).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    <span className="text-[8px] opacity-40 uppercase tracking-[0.2em] ml-1">Delta Ref</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-12 grid grid-cols-1 md:grid-cols-2 gap-12 overflow-y-auto max-h-[50vh] custom-scrollbar transition-colors ${isLight ? 'bg-zinc-50' : 'bg-black/20'}`}>
          {derc.presentations.map((p, pIdx) => {
            const refP = referenceDerc?.presentations.find(rp => rp.type === p.type);
            const refTotal = refP?.total || 0;
            const deltaP = refTotal > 0 ? p.total - refTotal : 0;
            
            const pRatio = totalEntrada > 0 ? (p.total / totalEntrada) * 100 : 0;
            const refPRatio = refStats && refP ? (refP.total / refStats.entrada) * 100 : 0;

            return (
              <div key={pIdx} className="space-y-6">
                <div className={`flex items-center justify-between border-b pb-5 ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${p.type.includes('Solo') ? (isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20') : (isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}`}>
                        {p.type.includes('Solo') ? <Layers2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <h3 className={`text-base font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-950' : 'text-white'}`}>{p.type}</h3>
                    </div>
                    {refStats && (
                       <div className={`mt-3 w-56 h-1.5 rounded-full overflow-hidden relative ${isLight ? 'bg-zinc-200' : 'bg-zinc-950'}`}>
                          <div className={`absolute inset-0 opacity-40 z-0 ${isLight ? 'bg-indigo-400' : 'bg-white/10'}`} style={{ width: `${refPRatio}%` }} />
                          <div className={`absolute inset-0 z-10 transition-all duration-1000 ${p.type.includes('Solo') ? (isLight ? 'bg-indigo-600' : 'bg-indigo-500') : (isLight ? 'bg-emerald-600' : 'bg-emerald-500')}`} style={{ width: `${pRatio}%` }} />
                       </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3">
                      {refTotal > 0 && (
                        <span className={`text-[11px] font-black ${deltaP >= 0 ? (isLight ? 'text-cyan-600' : 'text-cyan-400') : 'text-rose-600'}`}>
                          {deltaP >= 0 ? '+' : ''}{deltaP.toLocaleString()}
                        </span>
                      )}
                      <span className={`text-xl font-black tracking-tight tabular-nums ${isLight ? 'text-zinc-950' : 'text-zinc-200'}`}>{p.total.toLocaleString()} <span className="text-[11px] text-zinc-500 font-bold ml-1">KG</span></span>
                    </div>
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Subtotal Línea</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {p.records.slice(0, 10).map((r, rIdx) => {
                    const refRec = refP?.records.find(rr => rr.talla === r.talla);
                    return (
                      <div key={rIdx} className={`px-8 py-5 rounded-[2rem] border flex items-center justify-between group transition-all duration-300 ${isLight ? 'bg-white border-zinc-100 hover:border-indigo-200 hover:shadow-md' : 'bg-zinc-900/40 border-white/5 hover:border-indigo-500/20 hover:bg-zinc-900'}`}>
                        <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-950 group-hover:bg-zinc-950 group-hover:text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:text-white'}`}>
                            <span className="text-xs font-black tracking-tighter">{r.talla}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Materia Prima</span>
                            <div className="flex items-center gap-4">
                              <span className={`text-2xl font-black tabular-nums ${isLight ? 'text-zinc-950' : 'text-zinc-200'}`}>{r.cant.toLocaleString()}</span>
                              {refRec && (
                                <span className={`text-[10px] font-black ${r.cant - refRec.cant >= 0 ? (isLight ? 'text-cyan-600/60' : 'text-cyan-500/50') : 'text-rose-600/60'}`}>
                                  {r.cant - refRec.cant > 0 ? '+' : ''}{(r.cant - refRec.cant).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-14 pr-4">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Empaque</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-2xl font-black tabular-nums ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{r.entreg}</span>
                              <span className="text-[9px] font-black text-zinc-400 uppercase">CJ</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end min-w-[70px]">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Cámara</span>
                            <span className={`text-2xl font-black tabular-nums ${r.cajasP > 0 ? (isLight ? 'text-rose-600/90' : 'text-rose-500/80') : (isLight ? 'text-emerald-600/90' : 'text-emerald-500/80')}`}>{r.cajasP}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`px-12 py-10 border-t flex items-center justify-between transition-colors ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-950/60 border-white/5'}`}>
          <div className={`flex items-center gap-4 ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>
            <ShieldCheck className={`w-7 h-7 ${isLight ? 'text-indigo-600/40' : 'text-indigo-500/40'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Cloud Protocol • Validación Digital de Planta</span>
          </div>
          <div className="flex items-center gap-5">
             <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-950' : 'text-zinc-800'}`}>Inspección Final de Dossier</p>
             <div className={`w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] ${isLight ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

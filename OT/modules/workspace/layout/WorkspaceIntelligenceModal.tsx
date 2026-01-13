
import React, { useMemo, useState } from 'react';
import { X, Cpu, CheckCircle2, Info, ShieldAlert, Zap, Layers, HelpCircle, Lightbulb, Activity, Target, AlertCircle, ArrowRight, ShieldCheck, ActivitySquare, Waves, Microscope, Database, Scale, Thermometer, MessageSquare } from 'lucide-react';
import { DercEntry, PresentationType, AppTheme } from '../../../types';
import { lotEngine } from '../../../core/lotEngine';
import { predictiveEngine } from '../../../core/predictiveEngine';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   Cell, ReferenceLine, ComposedChart, Line, AreaChart, Area, LabelList
} from 'recharts';

interface Props {
   isOpen: boolean;
   onClose: () => void;
   dockedLotes: DercEntry[];
   theme?: AppTheme;
}

interface AggregateRow {
   talla: string;
   salida: number;
   entrada: number;
   rend: number;
   perdidakg: number;
   riskLevel: 'LOW' | 'MED' | 'HIGH';
}

export const WorkspaceIntelligenceModal: React.FC<Props> = ({ isOpen, onClose, dockedLotes, theme }) => {
   const [activeTab, setActiveTab] = useState<'FLASH' | 'AUDIT' | 'SYSTEMIC'>('FLASH');
   const [selectedChartType, setSelectedChartType] = useState<PresentationType | 'OVERALL'>('OVERALL');
   const isLight = theme === 'pearl';

   const auditCore = useMemo(() => {
      if (!dockedLotes || dockedLotes.length === 0) return null;

      const map: Record<string, Record<string, { salida: number; entrada: number }>> = { 'OVERALL': {} };
      const typesFound = new Set<string>();

      dockedLotes.forEach(l => {
         l.presentations.forEach(p => {
            typesFound.add(p.type);
            if (!map[p.type]) map[p.type] = {};
            p.records.forEach(r => {
               if (!map['OVERALL'][r.talla]) map['OVERALL'][r.talla] = { salida: 0, entrada: 0 };
               map['OVERALL'][r.talla].salida += r.kilosT;
               map['OVERALL'][r.talla].entrada += r.cant;
               if (!map[p.type][r.talla]) map[p.type][r.talla] = { salida: 0, entrada: 0 };
               map[p.type][r.talla].salida += r.kilosT;
               map[p.type][r.talla].entrada += r.cant;
            });
         });
      });

      const finalMap: Record<string, AggregateRow[]> = {};
      Object.entries(map).forEach(([type, tallasObj]) => {
         finalMap[type] = Object.entries(tallasObj)
            .sort((a, b) => {
               const [a1, a2] = lotEngine.getTallaPriority(a[0]);
               const [b1, b2] = lotEngine.getTallaPriority(b[0]);
               return a1 !== b1 ? a1 - b1 : a2 - b2;
            })
            .map(([talla, data]) => {
               const rawRend = data.entrada > 0 ? (data.salida / data.entrada) * 100 : 0;
               const rend = parseFloat(rawRend.toFixed(2));
               return {
                  talla,
                  salida: data.salida,
                  entrada: data.entrada,
                  rend,
                  perdidakg: parseFloat((data.entrada - data.salida).toFixed(2)),
                  riskLevel: rend < 94 ? 'HIGH' : rend < 97 ? 'MED' : 'LOW'
               };
            });
      });

      const systemicRisks = predictiveEngine.analyzeSystemicRisk(dockedLotes);
      const totalEntrada = finalMap['OVERALL'].reduce((acc, r) => acc + r.entrada, 0);
      const totalSalida = finalMap['OVERALL'].reduce((acc, r) => acc + r.salida, 0);
      const stressLevel = Math.min(100, ((totalEntrada - totalSalida) / (totalEntrada || 1)) * 500);

      return {
         finalMap,
         systemicRisks,
         stressLevel,
         activeTypes: Array.from(typesFound) as PresentationType[],
         totalEntrada,
         totalSalida,
         globalRend: totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0
      };
   }, [dockedLotes]);

   if (!isOpen || !auditCore) return null;

   const currentChartData = auditCore.finalMap[selectedChartType] || auditCore.finalMap['OVERALL'];

   const renderCustomLabel = (props: any) => {
      const { x, y, width, value } = props;
      if (value === 0) return null;
      return (
         <text
            x={x + width / 2}
            y={y - 12}
            fill={isLight ? "#09090b" : "#ffffff"}
            textAnchor="middle"
            fontSize={11}
            fontWeight="900"
         >
            {value}%
         </text>
      );
   };

   const renderChart = (data: AggregateRow[]) => (
      <ResponsiveContainer width="100%" height="100%">
         <ComposedChart data={data} margin={{ top: 40, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#f3f4f6" : "#18181b"} />
            <XAxis dataKey="talla" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#9ca3af' : '#3f3f46', fontSize: 10, fontWeight: 900 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#9ca3af' : '#3f3f46', fontSize: 10, fontWeight: 900 }} domain={[85, 115]} tickFormatter={(val) => `${val}%`} />
            <Tooltip
               cursor={{ fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}
               contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#09090b', border: isLight ? '1px solid #e5e7eb' : '1px solid #18181b', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
               itemStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: isLight ? '#09090b' : '#ffffff' }}
            />
            <Bar dataKey="rend" radius={[10, 10, 0, 0]} barSize={55}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.riskLevel === 'LOW' ? '#10b981' : entry.riskLevel === 'MED' ? '#f59e0b' : '#f43f5e'} />
               ))}
               <LabelList dataKey="rend" content={renderCustomLabel} />
            </Bar>
            <Line type="monotone" dataKey="rend" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: isLight ? '#fff' : '#000' }} />
         </ComposedChart>
      </ResponsiveContainer>
   );

   return (
      <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl animate-in fade-in duration-300 ${isLight ? 'bg-black/20' : 'bg-black/98'}`}>
         <div className={`border w-full max-w-[1400px] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-zinc-200 shadow-zinc-400/30' : 'bg-[#09090b] border-white/10'}`}>

            {/* HEADER TÁCTICO */}
            <div className={`px-10 py-6 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-white/5'}`}>
               <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border ${isLight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-400/30 text-white'}`}>
                     <Microscope className="w-8 h-8" />
                  </div>
                  <div>
                     <h2 className={`text-2xl font-black uppercase tracking-tighter italic leading-none ${isLight ? 'text-zinc-900' : 'text-white'}`}>Audit IQ Matrix</h2>
                     <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                        <Database className="w-3 h-3" /> {dockedLotes.length} Bloques de Producción Activos
                     </p>
                  </div>
               </div>

               <div className={`flex p-1.5 rounded-2xl border w-full max-w-md shadow-inner ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-black/60 border-zinc-800'}`}>
                  <button onClick={() => setActiveTab('FLASH')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FLASH' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-700'}`}><Zap className="w-3.5 h-3.5" /> Panorama</button>
                  <button onClick={() => setActiveTab('AUDIT')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AUDIT' ? (isLight ? 'bg-white text-emerald-600 shadow-sm' : 'bg-emerald-600 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-700'}`}><Microscope className="w-3.5 h-3.5" /> Hard Audit</button>
                  <button onClick={() => setActiveTab('SYSTEMIC')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SYSTEMIC' ? (isLight ? 'bg-white text-rose-600 shadow-sm' : 'bg-rose-600 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-700'}`}>
                     <Thermometer className="w-3.5 h-3.5" /> Diagnóstico
                  </button>
               </div>

               <button onClick={onClose} className={`p-3.5 rounded-2xl transition-all group border active:scale-90 ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:bg-rose-600'}`}>
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
               </button>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar pb-10 ${isLight ? 'bg-zinc-100' : 'bg-[#050506]'}`}>
               {activeTab === 'FLASH' ? (
                  <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* HUD DE STRESS Y RENDIMIENTO */}
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className={`border p-8 rounded-[2.5rem] relative overflow-hidden group ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-white/5'}`}>
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-4">Stress de Masa</span>
                           <div className="flex items-baseline gap-2">
                              <span className={`text-5xl font-black tabular-nums tracking-tighter ${auditCore.stressLevel > 60 ? (isLight ? 'text-rose-600' : 'text-rose-500') : (isLight ? 'text-emerald-600' : 'text-emerald-500')}`}>
                                 {auditCore.stressLevel.toFixed(1)}%
                              </span>
                           </div>
                           <div className={`mt-4 h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-zinc-100' : 'bg-zinc-900'}`}>
                              <div className={`h-full transition-all duration-1000 ${auditCore.stressLevel > 60 ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${auditCore.stressLevel}%` }} />
                           </div>
                        </div>

                        <div className={`md:col-span-2 border p-8 rounded-[2.5rem] flex items-center justify-between gap-10 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-white/5'}`}>
                           <div className="space-y-4">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Eficiencia Global Mesa</span>
                              <div className="flex items-baseline gap-3">
                                 <span className={`text-6xl font-black tabular-nums tracking-tighter ${auditCore.globalRend >= 98.2 ? (isLight ? 'text-indigo-600' : 'text-white') : (isLight ? 'text-amber-600' : 'text-amber-400')}`}>
                                    {auditCore.globalRend.toFixed(2)}%
                                 </span>
                                 <span className="text-xs font-black text-zinc-300">REND.</span>
                              </div>
                           </div>
                           <div className={`h-full w-px ${isLight ? 'bg-zinc-100' : 'bg-zinc-900'}`} />
                           <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-black text-zinc-400 uppercase">Carga M.P.</span>
                                 <span className={`text-sm font-black ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{auditCore.totalEntrada.toLocaleString()} KG</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className={`text-[9px] font-black uppercase ${isLight ? 'text-indigo-600' : 'text-indigo-500'}`}>Despacho Real</span>
                                 <span className={`text-sm font-black ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{auditCore.totalSalida.toLocaleString()} KG</span>
                              </div>
                           </div>
                        </div>

                        <div className={`p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between ${isLight ? 'bg-zinc-900 text-white' : 'bg-indigo-600 shadow-indigo-600/30'}`}>
                           <div className="flex justify-between items-start">
                              <Zap className={`w-8 h-8 ${isLight ? 'text-indigo-400' : 'text-white/50'}`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-white/40'}`}>Digital Twin Active</span>
                           </div>
                           <div>
                              <p className={`text-xs font-bold uppercase tracking-wide leading-tight ${isLight ? 'text-zinc-300' : 'text-indigo-100'}`}>La mesa opera a un {auditCore.globalRend > 98 ? 'ritmo óptimo' : 'ritmo con deriva'} de empaque.</p>
                           </div>
                        </div>
                     </div>

                     {/* GRID TÉRMICO DE TALLAS */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Target className="w-5 h-5 text-zinc-400" />
                              <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-900' : 'text-white'}`}>Mapa de Intervención por Calibre</h3>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           {auditCore.finalMap['OVERALL'].map((row, i) => (
                              <div key={i} className={`p-6 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden ${row.riskLevel === 'HIGH' ? (isLight ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-rose-600/10 border-rose-500/40') :
                                 row.riskLevel === 'MED' ? (isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-600/5 border-amber-500/30') :
                                    (isLight ? 'bg-white border-zinc-200 hover:border-indigo-300' : 'bg-zinc-950 border-zinc-900')
                                 }`}>
                                 <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{row.talla}</span>
                                    <div className="flex items-baseline gap-1">
                                       <span className={`text-2xl font-black tabular-nums ${row.riskLevel === 'HIGH' ? 'text-rose-600' : row.riskLevel === 'MED' ? 'text-amber-600' : 'text-zinc-900'}`}>
                                          {row.rend.toFixed(1)}%
                                       </span>
                                    </div>
                                    {row.perdidakg > 1.5 && (
                                       <span className={`text-[10px] font-black mt-2 ${row.riskLevel === 'HIGH' ? 'text-rose-700' : 'text-zinc-500'}`}>
                                          -{row.perdidakg.toFixed(1)} KG Faltantes
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               ) : activeTab === 'AUDIT' ? (
                  <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full min-h-[500px]">
                        {/* COLUMNA IZQUIERDA: PANORAMA GLOBAL (FIJO) */}
                        <div className={`border rounded-[2.5rem] p-8 flex flex-col space-y-6 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-white/5'}`}>
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                 <Activity className="w-5 h-5" />
                              </div>
                              <div>
                                 <h4 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Panorama Global</h4>
                                 <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Rendimiento Consolidado de Mesa</p>
                              </div>
                           </div>
                           <div className="flex-1 w-full min-h-[300px]">
                              {renderChart(auditCore.finalMap['OVERALL'])}
                           </div>
                        </div>

                        {/* COLUMNA DERECHA: MICROSCOPÍA (DINÁMICO) */}
                        <div className={`border rounded-[2.5rem] p-8 flex flex-col space-y-6 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-white/5'}`}>
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    <Microscope className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <h4 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Microscopía</h4>
                                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Análisis Específico por Bloque</p>
                                 </div>
                              </div>

                              <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-zinc-800'}`}>
                                 {auditCore.activeTypes.map(type => (
                                    <button
                                       key={type}
                                       onClick={() => setSelectedChartType(type)}
                                       className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedChartType === type
                                          ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-zinc-800 text-white shadow-lg')
                                          : 'text-zinc-500 hover:text-zinc-700 hover:bg-black/5'}`}
                                    >
                                       {type}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div className="flex-1 w-full min-h-[300px]">
                              {renderChart(auditCore.finalMap[selectedChartType === 'OVERALL' ? auditCore.activeTypes[0] : selectedChartType] || auditCore.finalMap['OVERALL'])}
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className={`flex items-center gap-6 border-b pb-8 ${isLight ? 'border-zinc-200' : 'border-white/5'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-600/10 border-rose-500/20 text-rose-500'}`}>
                           <Thermometer className="w-8 h-8" />
                        </div>
                        <div>
                           <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${isLight ? 'text-zinc-900' : 'text-white'}`}>Detección Sistémica de Fugas</h3>
                           <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Análisis por Tipo de Proceso y Calibre Específico</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           {auditCore.systemicRisks.length === 0 ? (
                              <div className={`h-64 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 ${isLight ? 'border-zinc-200 text-zinc-300' : 'border-zinc-900 text-zinc-800'}`}>
                                 <ShieldCheck className="w-12 h-12 opacity-10" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">No se detectan errores sistémicos.</p>
                              </div>
                           ) : (
                              auditCore.systemicRisks.map((risk, i) => (
                                 <div key={i} className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${risk.severity === 'HIGH' ? (isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-600/10 border-rose-500/30') : (isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-600/10 border-amber-500/30')}`}>
                                    <div className="flex items-start gap-6 relative z-10">
                                       <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${risk.severity === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'}`}>
                                          <Scale className="w-7 h-7" />
                                       </div>
                                       <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-3">
                                             <span className={`text-[10px] font-black uppercase tracking-widest ${risk.severity === 'HIGH' ? (isLight ? 'text-rose-700' : 'text-rose-500') : (isLight ? 'text-amber-700' : 'text-amber-500')}`}>Talla: {risk.talla}</span>
                                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isLight ? 'bg-white/50 text-zinc-500' : 'bg-black/40 text-zinc-500'}`}>{risk.pType}</span>
                                          </div>
                                          <p className={`text-sm font-bold uppercase leading-relaxed italic tracking-wide ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>"{risk.message}"</p>
                                       </div>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

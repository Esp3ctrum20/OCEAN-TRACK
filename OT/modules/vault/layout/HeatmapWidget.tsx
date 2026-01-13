import React, { useState, useMemo } from 'react';
import { Activity, Maximize2, Star, X, Target, Zap, ShieldCheck, ExternalLink, Info, TrendingUp, TrendingDown, Minus, Calendar, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { DercEntry, AppTheme } from '../../../types';
import { calculateHeatmap, DayData } from '../core/vaultLogic';

interface Props {
  dercs: DercEntry[];
  onOpenDossier: (id: string) => void;
  theme?: AppTheme;
}

export const HeatmapWidget: React.FC<Props> = ({ dercs, onOpenDossier, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const isLight = theme === 'pearl';

  const { heatmapData, monthLabels, stats } = useMemo(() => calculateHeatmap(dercs), [dercs]);

  const renderGrid = (size: number, isInteractive: boolean) => (
    <div className={`flex gap-1 overflow-x-auto no-scrollbar pt-2 ${isExpanded ? 'h-32' : 'h-24'}`}>
      {heatmapData.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
          {week.map((day, di) => {
            let colorClass = isLight ? "bg-zinc-100/60 border border-zinc-200/50" : "bg-zinc-900/30 border border-zinc-900/40 border-dashed";
            let glowStyle = {};

            if (day.yield > 0) {
              if (day.yield >= 98) {
                // Verde Neón (Excelente)
                colorClass = isLight
                  ? "bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                  : "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
              }
              else if (day.yield >= 95) {
                // Verde Apagado (Normal)
                colorClass = isLight
                  ? "bg-emerald-600/80 border-emerald-500 text-white"
                  : "bg-emerald-800/80 border-emerald-700";
              }
              else if (day.yield >= 90) {
                // Amarillo (Alerta)
                colorClass = isLight
                  ? "bg-amber-400 border-amber-300"
                  : "bg-amber-600/80 border-amber-500";
              }
              else {
                // Rojo (Crítico)
                colorClass = isLight
                  ? "bg-rose-500 border-rose-400 text-white"
                  : "bg-rose-900/80 border-rose-800";
              }
            }

            return (
              <button
                key={di}
                disabled={!isInteractive || !day.lotId}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => isInteractive && day.lotId && onOpenDossier(day.lotId)}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  ...glowStyle
                }}
                className={`rounded-[3px] transition-all duration-300 relative ${colorClass} ${day.isPeak ? 'ring-1 ring-white/50 z-10' : ''} ${isInteractive && day.lotId ? 'hover:scale-150 hover:z-20 cursor-pointer shadow-xl' : 'cursor-default'}`}
              >
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mini Widget Pearl */}
      <div className={`p-8 rounded-[3rem] border relative group/heatmap shadow-2xl overflow-hidden transition-all duration-500 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800/60'}`}>
        <div className={`absolute -top-20 -right-20 w-48 h-48 blur-3xl rounded-full ${isLight ? 'bg-indigo-500/[0.04]' : 'bg-indigo-500/5'}`} />

        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-[0.3em] leading-none ${isLight ? 'text-zinc-950' : 'text-white'}`}>Salud Operativa</span>
              <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Radar Industrial 52S</span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2.5 px-4 py-2 border rounded-2xl text-[9px] font-black uppercase transition-all shadow-sm ${isLight ? 'bg-zinc-900 text-white hover:bg-indigo-600 border-zinc-950' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:bg-indigo-600'}`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Dossier
          </button>
        </div>

        <div className="relative">
          {renderGrid(10, false)}
        </div>

        <div className={`flex items-center justify-between pt-6 mt-6 border-t relative z-10 ${isLight ? 'border-zinc-100' : 'border-white/5'}`}>
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1.5">Eficiencia</span>
              <span className={`text-sm font-black ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>{stats.avgYield.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1.5">Consistencia</span>
              <span className={`text-sm font-black ${stats.consistency > 95 ? (isLight ? 'text-emerald-600' : 'text-emerald-500') : 'text-amber-500'}`}>
                {stats.consistency > 0 ? stats.consistency.toFixed(1) : '--'}%
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[7px] font-black text-zinc-500 uppercase mr-1">Rank</span>
            <div className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-rose-500' : 'bg-rose-900/80 border border-rose-800'}`} title="<90%" />
            <div className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-amber-400' : 'bg-amber-600/80 border border-amber-500'}`} title="90-95%" />
            <div className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-emerald-600' : 'bg-emerald-800/80 border border-emerald-700'}`} title="95-98%" />
            <div className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.4)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.4)]'}`} title=">98%" />
          </div>
        </div>
      </div>

      {/* Full Console */}
      {isExpanded && (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-400 ${isLight ? 'bg-black/20' : 'bg-black/95'}`}>
          <div className={`border w-full max-w-4xl rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-300 relative overflow-hidden ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-white/10'}`}>

            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent" />

            {/* Header Pearl */}
            <div className={`px-12 py-10 border-b flex items-center justify-between relative z-10 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl border ${isLight ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-600 border-white/10'}`}>
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>Consola Táctica de Archivo</h2>
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Analítica Industrial v2.8</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-4 rounded-full transition-all active:scale-90 group border ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:bg-rose-600'}`}
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Grid KPIs & Chart Area */}
            <div className="px-12 pt-8 pb-4 space-y-6 relative z-10">
              {/* Mini KPIs Row */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Eficiencia', val: stats.avgYield.toFixed(2) + '%', icon: Target, col: 'text-indigo-500' },
                  { label: 'Consistencia', val: stats.consistency.toFixed(1) + '%', icon: ShieldCheck, col: 'text-emerald-500' },
                  { label: 'Mejor Mes', val: stats.bestMonth, icon: Award, col: isLight ? 'text-zinc-900' : 'text-zinc-100' },
                  { label: 'Tendencia', val: stats.trend === 'up' ? 'Alza' : 'Estable', icon: TrendingUp, col: 'text-zinc-400' }
                ].map((k, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/30 border-white/5'}`}>
                    <div className={`p-2 rounded-lg ${isLight ? 'bg-white shadow-sm' : 'bg-white/5'}`}>
                      <k.icon className={`w-3.5 h-3.5 ${k.col}`} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">{k.label}</p>
                      <p className={`text-sm font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{k.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scatter / Area Chart */}
              <div className={`h-64 w-full rounded-[2.5rem] border p-6 relative overflow-hidden ${isLight ? 'bg-white border-zinc-200' : 'bg-black/20 border-white/5'}`}>
                <h3 className="absolute top-6 left-8 text-[10px] font-black uppercase tracking-widest opacity-40 z-10">Curva de Rendimiento Anual</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(stats as any).monthlyStats || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isLight ? '#4f46e5' : '#6366f1'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isLight ? '#4f46e5' : '#6366f1'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: isLight ? '#a1a1aa' : '#52525b', fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis
                      hide={false}
                      axisLine={false}
                      tickLine={false}
                      domain={[80, 'auto']}
                      tick={{ fontSize: 10, fill: isLight ? '#a1a1aa' : '#52525b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLight ? '#ffffff' : '#09090b',
                        border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: isLight ? '#18181b' : '#f4f4f5' }}
                      labelStyle={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}
                      formatter={(val: number) => [val.toFixed(2) + '%', 'Rendimiento']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isLight ? '#4f46e5' : '#818cf8'}
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorYield)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-2.5 mb-10 ml-1 h-8 items-end">
                {heatmapData.map((_, wi) => {
                  const label = monthLabels.find(l => l.weekIndex === wi);
                  return (
                    <div key={wi} className="w-4 flex justify-center relative">
                      {label && (
                        <span className={`text-[9px] font-black uppercase absolute -bottom-4 whitespace-nowrap -rotate-45 origin-bottom-left transition-colors ${isLight ? 'text-zinc-950' : 'text-zinc-700'}`}>
                          {label.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={`p-10 rounded-[3.5rem] shadow-inner relative transition-colors ${isLight ? 'bg-zinc-100 border border-zinc-200/50' : 'bg-zinc-950/40 border border-white/5'}`}>
                {renderGrid(15, true)}
              </div>

              {/* Tooltip HUD Pearl */}
              {hoveredDay && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 translate-y-full pt-4 z-[1100] w-full max-w-sm animate-in fade-in slide-in-from-top-4">
                  <div className={`border p-5 rounded-[2rem] shadow-2xl flex items-center justify-between gap-6 ring-1 transition-colors ${isLight ? 'bg-white border-indigo-200 ring-indigo-500/5' : 'bg-[#09090b] border-indigo-500/30 ring-white/5'}`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-white/10 text-zinc-300'}`}>
                          {hoveredDay.date}
                        </span>
                        {hoveredDay.isPeak && <span className="text-[8px] text-amber-500 font-black">★ RÉCORD</span>}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black tabular-nums ${hoveredDay.yield > 0 ? (hoveredDay.yield >= 98 ? 'text-emerald-500' : hoveredDay.yield < 90 ? 'text-rose-500' : hoveredDay.yield < 95 ? 'text-amber-500' : (isLight ? 'text-zinc-900' : 'text-white')) : 'text-zinc-300'}`}>
                          {hoveredDay.yield > 0 ? hoveredDay.yield.toFixed(1) : '--.-'}%
                        </span>
                      </div>
                    </div>

                    <div className={`flex-1 border-l pl-6 flex justify-between items-center ${isLight ? 'border-zinc-100' : 'border-white/5'}`}>
                      <div>
                        <span className="text-[7px] text-zinc-400 font-black uppercase tracking-widest block mb-0.5">Volumen</span>
                        <span className={`text-sm font-black ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{hoveredDay.kg.toLocaleString()} <span className="text-[9px]">KG</span></span>
                      </div>
                      {hoveredDay.lotId && (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-pulse ${isLight ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`}>
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Pearl */}
          <div className={`px-12 py-8 border-t flex items-center justify-between relative z-10 mt-auto ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
            <div className="flex items-center gap-4">
              <Info className={`w-5 h-5 ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`} />
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>OceanTrack Tactical Radar Core</p>
            </div>

            <div className={`flex items-center gap-6 px-6 py-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-black/40 border-white/5'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] ${isLight ? 'bg-zinc-200' : 'bg-indigo-950'}`} />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] bg-indigo-600 shadow-lg shadow-indigo-600/20`} />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Óptimo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};


import React, { useState, useMemo } from 'react';
import { DercEntry, AppTheme } from '../../../types';
import { lotEngine } from '../../../core/lotEngine';
import { exportProductionReport } from '../../../core/exporter';
import { 
  Calendar, ChevronRight, CheckSquare, Square, 
  ChevronDown, Package, TrendingUp, DownloadCloud, CheckCircle,
  BarChart3, ExternalLink, ArrowRightLeft, TrendingDown, Trash2, Target
} from 'lucide-react';

interface Props {
  dercs: DercEntry[];
  onSelectDate: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onDeleteDerc?: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onQuickView?: (id: string) => void;
  referenceId?: string | null;
  setReferenceId?: (id: string) => void;
  isVirtual?: boolean;
  theme?: AppTheme;
}

export const HistoricalTimeline: React.FC<Props> = ({ 
  dercs, onSelectDate, selectionMode = false, selectedIds = new Set(), onToggleSelect, 
  onDeleteDerc, onDeleteMultiple, onQuickView,
  referenceId, setReferenceId, isVirtual = false, theme
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['2026']));
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const isLight = theme === 'pearl';

  const toggleExpand = (key: string) => {
    const newSet = new Set(expandedKeys);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedKeys(newSet);
  };

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(flippedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setFlippedIds(newSet);
  };

  const handleSetReference = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReferenceId?.(id);
  };

  const handleDeleteLot = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Enviar este lote a la papelera?')) {
      onDeleteDerc?.(id);
    }
  };

  const handleDeleteGroup = (e: React.MouseEvent, items: DercEntry[], label: string) => {
    e.stopPropagation();
    if (window.confirm(`¿Enviar todos los lotes de ${label} a la papelera? (${items.length} unidades)`)) {
      onDeleteMultiple?.(items.map(i => i.id));
    }
  };

  const referenceYield = useMemo(() => {
    const ref = dercs.find(d => d.id === referenceId);
    if (!ref) return null;
    const ent = ref.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const sal = ref.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    return ent > 0 ? (sal / ent) * 100 : 0;
  }, [dercs, referenceId]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const hierarchy = useMemo(() => {
    const tree: any = {};
    dercs.forEach(derc => {
      const parts = derc.date.split('/');
      if (parts.length < 3) return;
      const [d, m, y] = parts;
      const year = `20${y}`;
      const monthIdx = parseInt(m, 10) - 1;
      const monthLabel = monthNames[monthIdx];
      const dateObj = new Date(parseInt(year), monthIdx, parseInt(d));
      const week = lotEngine.getISOWeek(dateObj);
      const weekLabel = `Semana ${week.toString().padStart(2, '0')}`;

      if (!tree[year]) tree[year] = { months: {}, totalKg: 0, lots: 0, items: [] };
      if (!tree[year].months[monthLabel]) tree[year].months[monthLabel] = { weeks: {}, totalKg: 0, lots: 0, items: [] };
      if (!tree[year].months[monthLabel].weeks[weekLabel]) tree[year].months[monthLabel].weeks[weekLabel] = { days: {}, totalKg: 0, lots: 0, items: [] };
      if (!tree[year].months[monthLabel].weeks[weekLabel].days[derc.date]) tree[year].months[monthLabel].weeks[weekLabel].days[derc.date] = [];

      const totalSalida = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rAcc, r) => rAcc + r.kilosT, 0), 0);
      
      tree[year].months[monthLabel].weeks[weekLabel].days[derc.date].push(derc);
      tree[year].items.push(derc);
      tree[year].totalKg += totalSalida;
      tree[year].lots += 1;
      
      tree[year].months[monthLabel].items.push(derc);
      tree[year].months[monthLabel].totalKg += totalSalida;
      tree[year].months[monthLabel].lots += 1;
      
      tree[year].months[monthLabel].weeks[weekLabel].items.push(derc);
      tree[year].months[monthLabel].weeks[weekLabel].totalKg += totalSalida;
      tree[year].months[monthLabel].weeks[weekLabel].lots += 1;
    });
    return tree;
  }, [dercs]);

  const sortedYears = Object.keys(hierarchy).sort((a, b) => b.localeCompare(a));

  const handleSelectBulk = (e: React.MouseEvent, items: DercEntry[]) => {
    e.stopPropagation();
    if (!onToggleSelect) return;
    const ids = items.map(i => i.id);
    const allSelected = ids.every(id => selectedIds.has(id));
    ids.forEach(id => {
      if (allSelected) { if (selectedIds.has(id)) onToggleSelect(id); }
      else { if (!selectedIds.has(id)) onToggleSelect(id); }
    });
  };

  const handleExportBulk = (e: React.MouseEvent, items: DercEntry[], title: string) => {
    e.stopPropagation();
    exportProductionReport(items, title);
  };

  const renderCard = (derc: DercEntry) => {
    const isSelected = selectedIds.has(derc.id);
    const isFlipped = flippedIds.has(derc.id);
    const isReference = referenceId === derc.id;
    
    const totalSalida = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    const totalEntrada = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const yieldPct = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;
    
    const delta = referenceYield !== null && !isReference ? yieldPct - referenceYield : null;

    return (
      <div key={derc.id} className="perspective-1000 h-52 group">
        <div 
          onClick={(e) => toggleFlip(e, derc.id)}
          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          <div className={`absolute inset-0 backface-hidden rounded-[2.5rem] p-6 flex flex-col justify-between border transition-all ${isLight ? (isReference ? 'bg-indigo-50 border-indigo-400 ring-4 ring-indigo-500/10' : isSelected ? 'bg-zinc-50 border-zinc-300 ring-4 ring-zinc-500/5' : 'bg-white border-zinc-200 group-hover:border-indigo-200 shadow-sm') : (isReference ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.2)]' : isSelected ? 'bg-[#0c0c0e] border-zinc-500 ring-4 ring-zinc-500/10' : 'bg-[#0c0c0e] border-zinc-800 group-hover:border-zinc-700 shadow-xl')}`}>
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <p className={`text-sm font-black uppercase tracking-tight ${isReference ? 'text-indigo-500' : isSelected ? 'text-indigo-600' : (isLight ? 'text-zinc-950' : 'text-white')}`}>{derc.dercId}</p>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>LOTE: {derc.lote}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDeleteLot(e, derc.id)}
                  className={`p-2 rounded-xl transition-all border ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-300 hover:text-rose-600 hover:bg-rose-50' : 'bg-zinc-950 border-zinc-800 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30'}`}
                  title="Borrar Lote"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSelect?.(derc.id); }}
                  className={`p-2.5 rounded-xl transition-all border ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : (isLight ? 'bg-white border-zinc-200 text-zinc-300 hover:text-indigo-600' : 'bg-zinc-950 border-zinc-800 text-zinc-700 hover:text-zinc-400')}`}
                >
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-40" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                {delta !== null && (
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest mb-2 animate-in slide-in-from-left-2 ${delta >= 0 ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400') : (isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-400')}`}>
                    {delta >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                    {delta >= 0 ? '+' : ''}{delta.toFixed(2)}% vs Standard
                  </div>
                )}
                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Salida Neta</span>
                <p className={`text-2xl font-black tabular-nums tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>{totalSalida.toLocaleString()} <span className="text-xs text-zinc-500">KG</span></p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 ${isReference ? 'bg-indigo-600 text-white' : yieldPct >= 98 ? (isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20') : (isLight ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')}`}>
                {isReference && <Target className="w-3 h-3 animate-pulse" />}
                {yieldPct.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800 shadow-2xl'}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <BarChart3 className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-950' : 'text-white'}`}>Diagnóstico</span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={(e) => handleSetReference(e, derc.id)} 
                  className={`p-2.5 rounded-xl border transition-all ${isReference ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : (isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-indigo-400')}`} 
                  title={isReference ? "Desmarcar Estándar" : "Pin como Estándar (Referencia)"}
                 >
                   <ArrowRightLeft className={`w-4 h-4 ${isReference ? 'animate-pulse' : ''}`} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); onQuickView?.(derc.id); }} className={`p-2.5 rounded-xl transition-all border ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-indigo-400'}`} title="Dossier Detallado">
                   <ExternalLink className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div className="flex-1 py-4 flex flex-col justify-center space-y-4 relative">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className={`text-[7px] font-black uppercase tracking-[0.3em] mb-1 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Eficiencia Operativa</span>
                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>{yieldPct.toFixed(2)}%</span>
                 </div>
                 <div className="text-right">
                    <span className={`text-[7px] font-black uppercase tracking-[0.3em] mb-1 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Carga Bruta</span>
                    <span className={`text-xl font-black tabular-nums tracking-tight ${isLight ? 'text-zinc-700' : 'text-white'}`}>{totalEntrada.toLocaleString()} <span className="text-[9px] text-zinc-500 font-black">KG</span></span>
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Composición del Lote</p>
                 <div className="relative w-full h-2 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex z-10">
                      {derc.presentations.map((p, idx) => {
                        const ratio = totalEntrada > 0 ? (p.total / totalEntrada) * 100 : 0;
                        const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500'];
                        return <div key={idx} style={{ width: `${ratio}%` }} className={`h-full ${colors[idx % colors.length]} border-r border-black/10`} />;
                      })}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isVirtual) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {dercs.map(derc => renderCard(derc))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {sortedYears.map(year => {
        const yearData = hierarchy[year];
        const isYearExpanded = expandedKeys.has(year);
        const allYearSelected = yearData.items.every((i: DercEntry) => selectedIds.has(i.id));
        return (
          <div key={year} className="space-y-2">
            <div className={`group flex items-center gap-3 p-2 rounded-[2.5rem] border transition-all ${isYearExpanded ? (isLight ? 'bg-white border-indigo-400 shadow-md' : 'bg-zinc-900 border-indigo-500/30 shadow-xl') : (isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800')}`}>
              <button onClick={() => toggleExpand(year)} className="flex-1 flex items-center justify-between p-4 rounded-[2rem] hover:bg-black/5 transition-all text-left">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isYearExpanded ? 'bg-indigo-600 text-white shadow-lg' : (isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-600')}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{year}</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{yearData.lots} Lotes • {(yearData.totalKg/1000).toFixed(2)} TN</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isYearExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-2 pr-4">
                <button onClick={(e) => handleDeleteGroup(e, yearData.items, `el año ${year}`)} className={`p-3 rounded-2xl border transition-all shadow-sm ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-300 hover:text-rose-600' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-rose-50'}`}><Trash2 className="w-5 h-5" /></button>
                <button onClick={(e) => handleSelectBulk(e, yearData.items)} className={`p-3 rounded-2xl border transition-all ${allYearSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : (isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-300 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:text-white')}`}><CheckSquare className="w-5 h-5" /></button>
                <button onClick={(e) => handleExportBulk(e, yearData.items, `Reporte Anual ${year}`)} className={`p-3 rounded-2xl transition-all border ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}><DownloadCloud className="w-5 h-5" /></button>
              </div>
            </div>
            {isYearExpanded && (
              <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-2">
                {Object.keys(yearData.months).sort((a, b) => monthNames.indexOf(b) - monthNames.indexOf(a)).map(month => {
                  const monthData = yearData.months[month];
                  const mKey = `${year}-${month}`;
                  const isMonthExpanded = expandedKeys.has(mKey);
                  return (
                    <div key={month} className="space-y-2">
                      <div className={`flex items-center gap-2 p-1.5 rounded-[1.8rem] border transition-all ${isMonthExpanded ? (isLight ? 'bg-white border-emerald-400 shadow-sm' : 'bg-zinc-900/50 border-emerald-500/30') : (isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950/40 border-zinc-800')}`}>
                        <button onClick={() => toggleExpand(mKey)} className="flex-1 flex items-center justify-between p-3.5 rounded-[1.4rem] hover:bg-black/5 transition-all text-left">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMonthExpanded ? 'bg-emerald-600 text-white shadow-md' : (isLight ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-900 text-zinc-600')}`}><Package className="w-5 h-5" /></div>
                            <div>
                              <h4 className={`text-sm font-black uppercase ${isLight ? 'text-zinc-900' : 'text-white'}`}>{month}</h4>
                              <p className="text-[8px] text-zinc-500 font-bold uppercase">{monthData.lots} Lotes • {monthData.totalKg.toLocaleString()} KG</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isMonthExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      {isMonthExpanded && (
                        <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-2">
                          {Object.keys(monthData.weeks).sort((a, b) => b.localeCompare(a)).map(week => {
                            const weekData = monthData.weeks[week];
                            const wKey = `${year}-${month}-${week}`;
                            const isWeekExpanded = expandedKeys.has(wKey);
                            return (
                              <div key={week} className="space-y-3">
                                <div className={`flex items-center gap-2 p-1 rounded-2xl border transition-all ${isWeekExpanded ? (isLight ? 'bg-white border-indigo-200 shadow-sm' : 'bg-indigo-600/5 border-indigo-500/20') : (isLight ? 'bg-white border-zinc-100' : 'bg-zinc-950/20 border-zinc-900')}`}>
                                  <button onClick={() => toggleExpand(wKey)} className="flex-1 flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-all text-left">
                                    <div className="flex items-center gap-4">
                                      <TrendingUp className={`w-4 h-4 ${isWeekExpanded ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : (isLight ? 'text-zinc-300' : 'text-zinc-800')}`} />
                                      <span className={`text-[11px] font-black uppercase tracking-widest ${isWeekExpanded ? (isLight ? 'text-zinc-900' : 'text-white') : (isLight ? 'text-zinc-400' : 'text-zinc-600')}`}>{week}</span>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isWeekExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                                  </button>
                                </div>
                                {isWeekExpanded && (
                                  <div className="pl-6 space-y-4 animate-in fade-in slide-in-from-left-2 pb-6">
                                    {Object.keys(weekData.days).map(date => {
                                      const dKey = `${wKey}-${date}`;
                                      const isDayExpanded = expandedKeys.has(dKey);
                                      const dayLots = weekData.days[date];
                                      return (
                                        <div key={date} className="space-y-2">
                                          <button onClick={() => toggleExpand(dKey)} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all border ${isDayExpanded ? (isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-900/50 border-zinc-700') : (isLight ? 'bg-white border-zinc-100' : 'bg-zinc-950/20 border-zinc-900')}`}>
                                            <Calendar className={`w-3.5 h-3.5 ${isDayExpanded ? 'text-indigo-500' : 'text-zinc-600'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-950' : 'text-white'}`}>Jornada {date}</span>
                                            <span className="text-[9px] text-zinc-500 font-bold">({dayLots.length} lotes)</span>
                                          </button>
                                          {isDayExpanded && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 animate-in fade-in">
                                              {dayLots.map((derc: DercEntry) => renderCard(derc))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

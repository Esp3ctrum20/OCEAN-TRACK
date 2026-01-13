
import React, { useState, useMemo } from 'react';
import { DercEntry, AppTheme } from '../../../types';
import { lotEngine } from '../../../core/lotEngine';
import { exportProductionReport } from '../../../core/exporter';
import { 
  Calendar, ChevronRight, CheckSquare, Square, 
  ChevronDown, Package, TrendingUp, DownloadCloud, CheckCircle,
  BarChart3, ExternalLink, Target, ArrowRightLeft, TrendingDown, Trash2
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
  referenceYield?: number;
  isVirtual?: boolean;
  theme?: AppTheme;
}

export const HistoricalTimeline: React.FC<Props> = ({ 
  dercs, selectionMode = false, selectedIds = new Set(), onToggleSelect, 
  onDeleteDerc, onDeleteMultiple, onQuickView,
  referenceId, setReferenceId, referenceYield, isVirtual = false, theme
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
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

  const renderCard = (derc: DercEntry) => {
    const isSelected = selectedIds.has(derc.id);
    const isFlipped = flippedIds.has(derc.id);
    const isReference = referenceId === derc.id;
    
    const totalSalida = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    const totalEntrada = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const yieldPct = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;

    return (
      <div key={derc.id} className="perspective-1000 h-52 group">
        <div 
          onClick={(e) => toggleFlip(e, derc.id)}
          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          <div className={`absolute inset-0 backface-hidden rounded-[2.5rem] p-6 flex flex-col justify-between border transition-all ${isLight ? (isReference ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10' : isSelected ? 'bg-zinc-50 border-zinc-300 ring-4 ring-zinc-500/5' : 'bg-white border-zinc-200 shadow-sm') : (isReference ? 'bg-[#0c0c0e] border-indigo-500 ring-4 ring-indigo-500/20' : isSelected ? 'bg-[#0c0c0e] border-zinc-500 ring-4 ring-zinc-500/10' : 'bg-[#0c0c0e] border-zinc-800 shadow-xl')}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-black uppercase ${isSelected ? 'text-indigo-600' : (isLight ? 'text-zinc-950' : 'text-white')}`}>{derc.dercId}</p>
                <span className={`text-[8px] font-black uppercase opacity-60`}>LOTE: {derc.lote}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onDeleteDerc?.(derc.id); }} className="p-2 rounded-lg border hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onToggleSelect?.(derc.id); }} className={`p-2.5 rounded-xl border ${isSelected ? 'bg-indigo-600 text-white' : ''}`}>
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[8px] font-black uppercase text-zinc-500">Salida Neta</span>
                <p className="text-2xl font-black">{totalSalida.toLocaleString()} KG</p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-black ${yieldPct >= 98 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {yieldPct.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-[2.5rem] p-6 flex flex-col justify-between border ${isLight ? 'bg-zinc-50' : 'bg-[#0c0c0e]'}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <div className="flex items-center gap-2">
                 <button onClick={(e) => { e.stopPropagation(); setReferenceId?.(derc.id); }} className={`p-2.5 rounded-xl border ${isReference ? 'bg-indigo-600 text-white' : ''}`}><ArrowRightLeft className="w-4 h-4" /></button>
                 <button onClick={(e) => { e.stopPropagation(); onQuickView?.(derc.id); }} className="p-2.5 rounded-xl border"><ExternalLink className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[7px] font-black uppercase text-zinc-500">Eficiencia Operativa</span>
              <span className="text-3xl font-black">{yieldPct.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isVirtual) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
        {dercs.map(derc => renderCard(derc))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {sortedYears.map(year => {
        const yearData = hierarchy[year];
        const isYearExpanded = expandedKeys.has(year);
        return (
          <div key={year} className="space-y-2">
            <button onClick={() => toggleExpand(year)} className={`w-full group flex items-center justify-between p-4 rounded-[2.5rem] border transition-all ${isYearExpanded ? 'bg-indigo-600/10 border-indigo-500' : 'bg-zinc-950 border-zinc-800'}`}>
              <div className="flex items-center gap-6">
                <Calendar className="w-6 h-6 text-zinc-500" />
                <div className="text-left">
                  <h3 className="text-xl font-black">{year}</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">{yearData.lots} Lotes • {(yearData.totalKg/1000).toFixed(2)} TN</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isYearExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isYearExpanded && (
              <div className="pl-8 space-y-4 animate-in fade-in">
                {Object.keys(yearData.months).sort((a, b) => monthNames.indexOf(b) - monthNames.indexOf(a)).map(month => {
                  const monthData = yearData.months[month];
                  const mKey = `${year}-${month}`;
                  const isMonthExpanded = expandedKeys.has(mKey);
                  return (
                    <div key={month} className="space-y-2">
                      <button onClick={() => toggleExpand(mKey)} className="w-full flex items-center justify-between p-4 rounded-[1.8rem] border border-zinc-800 bg-zinc-900/40">
                        <div className="flex items-center gap-4">
                          <Package className="w-5 h-5 text-emerald-500" />
                          <h4 className="text-sm font-black uppercase">{month}</h4>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isMonthExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isMonthExpanded && (
                        <div className="pl-8 space-y-4 animate-in fade-in">
                          {Object.keys(monthData.weeks).sort().map(week => {
                            const weekData = monthData.weeks[week];
                            const wKey = `${year}-${month}-${week}`;
                            const isWeekExpanded = expandedKeys.has(wKey);
                            return (
                              <div key={week} className="space-y-3">
                                <button onClick={() => toggleExpand(wKey)} className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-900">
                                  <span className="text-[11px] font-black uppercase tracking-widest">{week}</span>
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isWeekExpanded ? 'rotate-90' : ''}`} />
                                </button>
                                {isWeekExpanded && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                    {monthData.items.map((derc: DercEntry) => renderCard(derc))}
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

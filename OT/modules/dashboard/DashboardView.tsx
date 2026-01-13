
import React, { useState, useMemo } from 'react';
import { DercEntry, AppTheme } from '../../types';
import { calculateDercTotals, formatChartData } from '../../core/calculations';
import { MonitorSection } from './layout/MonitorSection';
import { BenchmarkSection } from './layout/BenchmarkSection';
import { Activity, ArrowRightLeft, Calendar, FileSpreadsheet, Camera, Zap, Filter, ShieldCheck, Timer } from 'lucide-react';
import { exportProductionReport } from '../../core/exporter';
import ShareCardModal from '../export/ShareCardModal';

interface Props {
  dercs: DercEntry[];
  operationalDate: string;
  theme?: AppTheme;
}

const DashboardView: React.FC<Props> = ({ dercs, operationalDate, theme }) => {
  const [mode, setMode] = useState<'MONITOR' | 'BENCHMARK'>('MONITOR');
  const [temporalContext, setTemporalContext] = useState<'CURRENT' | 'ARCHIVE'>('CURRENT');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [loteAId, setLoteAId] = useState('');
  const [loteBId, setLoteBId] = useState('');
  
  const isLight = theme === 'pearl';

  const filteredDercs = useMemo(() => {
    if (temporalContext === 'ARCHIVE') return dercs;
    return dercs.filter(d => d.date === operationalDate);
  }, [dercs, temporalContext, operationalDate]);

  const totals = useMemo(() => calculateDercTotals(filteredDercs), [filteredDercs]);
  
  // Decisión de agrupación: Si es ARCHIVE, agrupamos por DÍA
  const chartData = useMemo(() => 
    formatChartData(filteredDercs, temporalContext === 'ARCHIVE'), 
  [filteredDercs, temporalContext]);

  const yieldPercent = totals.entrada > 0 ? (totals.salida / totals.entrada) * 100 : 0;

  const mixData = useMemo(() => {
    const coral = filteredDercs.reduce((acc, d) => 
      acc + (d.presentations.find(p => p.type === 'Tallo Coral' || p.type === 'Media Valva')?.records.reduce((rA, r) => rA + r.cant, 0) || 0)
    , 0);
    const solo = filteredDercs.reduce((acc, d) => 
      acc + (d.presentations.find(p => p.type === 'Tallo Solo')?.records.reduce((rA, r) => rA + r.cant, 0) || 0)
    , 0);
    return [
      { name: 'Principal', value: coral, color: isLight ? '#059669' : '#10b981' },
      { name: 'Tallo Solo', value: solo, color: isLight ? '#2563eb' : '#3b82f6' },
    ];
  }, [filteredDercs, isLight]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-700 max-w-7xl mx-auto pb-20">
      <ShareCardModal 
        isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} 
        dercs={filteredDercs} totalKg={totals.salida} yieldPct={yieldPercent} 
        title={temporalContext === 'CURRENT' ? `Jornada ${operationalDate}` : "Consolidado Maestro"}
      />

      {/* HEADER TÁCTICO PEARL READY */}
      <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b pb-6 transition-colors ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-2 py-0.5 border rounded flex items-center gap-2 ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
              <Zap className="w-2.5 h-2.5 text-indigo-500" />
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>TAC-HUB v3.1</span>
            </div>
            <div className={`px-2 py-0.5 border rounded flex items-center gap-2 transition-all ${
              temporalContext === 'CURRENT' 
                ? (isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-500')
                : (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500')
            }`}>
              <Timer className="w-2.5 h-2.5" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                {temporalContext === 'CURRENT' ? `ACTIVO: ${operationalDate}` : 'MODO: HISTÓRICO TOTAL'}
              </span>
            </div>
          </div>
          
          <h1 className={`text-4xl font-black tracking-tighter uppercase leading-none transition-colors ${isLight ? 'text-zinc-950' : 'text-white'}`}>
            {mode === 'MONITOR' ? 'Telemetría Real-Time' : 'Auditoría Benchmark'}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex p-1 rounded-xl border transition-all ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-zinc-800 shadow-2xl'}`}>
            <button 
              onClick={() => setMode('MONITOR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                mode === 'MONITOR' ? (isLight ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-400')
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Monitor
            </button>
            <button 
              onClick={() => setMode('BENCHMARK')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                mode === 'BENCHMARK' ? 'bg-indigo-600 text-white shadow-lg' : (isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-400')
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Versus
            </button>
          </div>

          <div className={`flex p-1 rounded-xl border transition-all ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/50 border-white/5'}`}>
            <button 
              onClick={() => setTemporalContext('CURRENT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                temporalContext === 'CURRENT' ? (isLight ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm' : 'bg-zinc-800 text-white border border-white/10 shadow-lg') : (isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-400')
              }`}
            >
              <Calendar className="w-3 h-3" /> Hoy
            </button>
            <button 
              onClick={() => setTemporalContext('ARCHIVE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                temporalContext === 'ARCHIVE' ? (isLight ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm' : 'bg-zinc-800 text-white border border-white/10 shadow-lg') : (isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-400')
              }`}
            >
              <Filter className="w-3 h-3" /> Todo
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        {mode === 'MONITOR' ? (
          <MonitorSection dercs={filteredDercs} totals={totals} chartData={chartData} pieData={mixData} theme={theme} isArchive={temporalContext === 'ARCHIVE'} />
        ) : (
          <BenchmarkSection dercs={dercs} loteAId={loteAId} setLoteAId={setLoteAId} loteBId={loteBId} setLoteBId={setLoteBId} />
        )}
      </div>

      {mode === 'MONITOR' && filteredDercs.length > 0 && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 animate-in slide-in-from-right-10 z-[60]">
           <button 
            onClick={() => setIsShareModalOpen(true)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group shadow-2xl ${isLight ? 'bg-white text-zinc-900 border border-zinc-200' : 'bg-white text-black'}`}
          >
            <Camera className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          </button>
          <button 
            onClick={() => exportProductionReport(filteredDercs, temporalContext === 'CURRENT' ? `Jornada ${operationalDate}` : "Reporte Maestro Consolidado")}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group shadow-2xl ${isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white shadow-[0_20px_60px_rgba(79,70,229,0.3)]'}`}
          >
            <FileSpreadsheet className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

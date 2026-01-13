
import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { AnalyticsSection } from './AnalyticsSection';
import { ProductionSummaryTables } from './ProductionSummaryTables';
import { DercEntry, AppTheme } from '../../../types';
import { BarChart3 } from 'lucide-react';

interface Props {
  dercs: DercEntry[];
  totals: { entrada: number; salida: number };
  chartData: any[];
  pieData: any[];
  theme?: AppTheme;
  isArchive?: boolean;
}

export const MonitorSection: React.FC<Props> = ({ dercs, totals, chartData, pieData, theme, isArchive = false }) => {
  const isLight = theme === 'pearl';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* CAPA 1: KPIs NUCLEARES */}
      <MetricsGrid totals={totals} theme={theme} />
      
      {/* CAPA 2: TELEMETRÍA GRÁFICA */}
      <AnalyticsSection 
        chartData={chartData} 
        pieData={pieData} 
        theme={theme} 
        chartLabel={isArchive ? "FECHA CALENDARIO" : "VOLUMEN POR LOTE"} 
      />
      
      {/* CAPA 3: AUDITORÍA DE TALLAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isLight ? 'bg-white border-zinc-200 text-zinc-400 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
              <BarChart3 className="w-5 h-5" />
           </div>
           <div className="flex-1">
             <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
               Balance Técnico de Calibres
             </h2>
           </div>
           <div className={`h-px flex-[2] ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
        </div>
        
        {dercs.length > 0 ? (
          <ProductionSummaryTables dercs={dercs} theme={theme} />
        ) : (
          <div className={`h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center ${isLight ? 'border-zinc-300 text-zinc-300' : 'border-zinc-900 text-zinc-800'}`}>
             <p className="text-[10px] font-black uppercase tracking-widest">Esperando flujo de datos operativa...</p>
          </div>
        )}
      </div>
    </div>
  );
};

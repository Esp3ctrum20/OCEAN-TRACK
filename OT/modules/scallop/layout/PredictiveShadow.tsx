
import React from 'react';
import { Zap, ShieldAlert, Cpu, TrendingUp, TrendingDown, Ghost, PackageSearch, AlertTriangle } from 'lucide-react';
import { PredictionResult } from '../../../core/predictiveEngine';

interface Props {
  prediction: PredictionResult;
  actualYield: number;
}

export const PredictiveShadow: React.FC<Props> = ({ prediction, actualYield }) => {
  const isNeutral = actualYield === 0;
  
  return (
    <div className={`p-5 rounded-[2rem] border transition-all duration-700 relative overflow-hidden group ${
      prediction.isAlert 
        ? 'bg-rose-600/10 border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.1)]' 
        : 'bg-cyan-500/5 border-cyan-500/20'
    }`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Ghost className={`w-16 h-16 ${prediction.isAlert ? 'text-rose-500' : 'text-cyan-400'}`} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${prediction.isAlert ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${prediction.isAlert ? 'text-rose-400' : 'text-cyan-400'}`}>Digital Twin ADN</h4>
            <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">{prediction.dnaProfile} • Confianza {prediction.confidence}%</p>
          </div>
        </div>
        {prediction.isAlert && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-600 text-white rounded-lg animate-bounce shadow-lg shadow-rose-600/20">
            <ShieldAlert className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase">Fuga Detectada</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block">Sombra Teórica</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black tabular-nums ${prediction.isAlert ? 'text-rose-300' : 'text-cyan-300'}`}>{prediction.expectedYield.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-zinc-700">%</span>
          </div>
        </div>
        
        <div className="text-right space-y-1 border-l border-white/5 pl-4">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block">Varianza</span>
          <div className="flex items-center justify-end gap-1.5">
            {isNeutral ? (
              <span className="text-sm font-black text-zinc-800">--.--</span>
            ) : (
              <>
                {prediction.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                <span className={`text-xl font-black tabular-nums ${prediction.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {prediction.delta > 0 ? '+' : ''}{prediction.delta.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- RADAR DE BRECHAS DE MASA (AUDITORÍA DE AVANCE) --- */}
      {prediction.gaps.length > 0 && !isNeutral && (
        <div className="mt-5 space-y-2 border-t border-white/5 pt-4 relative z-10">
          <div className="flex items-center gap-2 mb-1">
             <PackageSearch className="w-3 h-3 text-amber-500" />
             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Pendiente por Empacar</span>
          </div>
          {prediction.gaps.map((gap, i) => (
            <div key={i} className={`flex items-center justify-between p-2 rounded-xl transition-all ${gap.status === 'CRITICAL_LOSS' ? 'bg-rose-600/10 border border-rose-500/20' : 'bg-zinc-950/40'}`}>
               <div className="flex items-center gap-2">
                 {gap.status === 'CRITICAL_LOSS' && <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />}
                 <span className="text-[9px] font-black text-zinc-300">{gap.talla}</span>
               </div>
               <div className="text-right">
                  <span className={`text-[10px] font-black tabular-nums ${gap.status === 'CRITICAL_LOSS' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {gap.missingKg.toFixed(1)} <span className="text-[7px] text-zinc-600">KG</span>
                  </span>
                  {gap.expectedBoxes > 0 && (
                    <span className="text-[7px] text-zinc-500 block">≈ {gap.expectedBoxes} Cajas</span>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}

      {!isNeutral && (
        <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden relative">
          <div 
            className="absolute inset-y-0 left-0 bg-white/20 z-0" 
            style={{ width: `${prediction.expectedYield}%` }} 
          />
          <div 
            className={`absolute inset-y-0 left-0 z-10 transition-all duration-1000 ${prediction.delta >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${actualYield}%` }}
          />
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Calculator, Target, AlertCircle } from 'lucide-react';
import { FulfillmentResult } from '../core/fulfillmentLogic';

interface Props {
  results: FulfillmentResult[];
  selectedTalla: string;
}

export const FulfillmentStats: React.FC<Props> = ({ results, selectedTalla }) => {
  const totalCajas = results.reduce((acc, r) => acc + r.cajasP, 0);
  const totalKilos = results.reduce((acc, r) => acc + r.kilosPendientes, 0);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-4 h-4 text-amber-500" />
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Consolidado</h4>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Stock Total {selectedTalla}</p>
              <p className="text-5xl font-black text-white tabular-nums">{totalCajas}</p>
              <p className="text-[10px] text-zinc-500 font-bold mt-1">Cajas listas para entrega</p>
            </div>
            <div className="pt-6 border-t border-zinc-800/50">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-zinc-500 font-medium">Equivalente aprox:</span>
                <span className="text-amber-500 font-black uppercase tracking-widest">
                  {totalKilos.toLocaleString()} KG
                </span>
              </div>
            </div>
          </div>
        </div>
        <Target className="absolute -bottom-10 -right-10 w-40 h-40 text-amber-500/5 rotate-12" />
      </div>

      <div className="p-6 bg-amber-600/5 border border-amber-500/10 rounded-2xl shadow-inner">
        <div className="flex gap-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-200/60 leading-relaxed font-bold uppercase tracking-tight">
            Utiliza este panel para cumplir ordenes de despacho rápidas. Los resultados solo incluyen DERCs con saldo (Cajas P.) mayor a cero.
          </p>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Package, Search, ChevronRight } from 'lucide-react';
import { FulfillmentResult } from '../core/fulfillmentLogic';

interface Props {
  results: FulfillmentResult[];
  onGoToDerc: (id: string) => void;
}

export const FulfillmentResults: React.FC<Props> = ({ results, onGoToDerc }) => (
  <div className="lg:col-span-2 space-y-4">
    <div className="flex items-center justify-between px-2">
      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Resultados Encontrados ({results.length})</h3>
    </div>

    {results.length === 0 ? (
      <div className="h-64 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
         <Search className="w-10 h-10 mb-4 opacity-10" />
         <p className="text-[10px] font-black uppercase tracking-widest">No hay stock disponible para esta selección</p>
      </div>
    ) : (
      <div className="space-y-3">
        {results.map((res) => (
          <div key={res.id} className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 p-5 rounded-2xl flex items-center justify-between group transition-all">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:bg-amber-600/10 transition-all">
                 <Package className="w-5 h-5 text-zinc-700 group-hover:text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-white uppercase">{res.dercId}</p>
                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 rounded text-zinc-500 font-bold">{res.date}</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">LOTE: {res.lote}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">Equiv. {res.kilosPendientes.toLocaleString()} KG</p>
                  <p className="text-xl font-black text-amber-500 tabular-nums">{res.cajasP} <span className="text-[10px] text-zinc-600">CAJAS</span></p>
               </div>
               <button 
                 onClick={() => onGoToDerc(res.id)}
                 className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

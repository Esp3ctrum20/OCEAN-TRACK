
import React, { useMemo, useState } from 'react';
import { DercEntry } from '../../types';
import { lotEngine } from '../../core/lotEngine';
import { 
  Activity, Search, ShieldAlert, Target, ChevronRight, Columns, Box, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

interface Props {
  dercs: DercEntry[];
  operationalDate: string;
  onGoToDerc: (id: string) => void;
  dockedIds: string[];
  onDockLot: (id: string) => void;
}

export const ProductionView: React.FC<Props> = ({ dercs, operationalDate, onGoToDerc, dockedIds, onDockLot }) => {
  const [query, setQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | '1' | '2'>('ALL');

  const activeLots = useMemo(() => {
    return dercs.filter(d => {
      const isCurrent = lotEngine.isCurrentJornada(d.lote, operationalDate) || d.date === operationalDate;
      const matchesQuery = d.lote.toLowerCase().includes(query.toLowerCase()) || d.dercId.toLowerCase().includes(query.toLowerCase());
      const adn = lotEngine.decodeADN(d.lote);
      const matchesShift = shiftFilter === 'ALL' || adn.turno.val === shiftFilter;
      return isCurrent && matchesQuery && matchesShift;
    });
  }, [dercs, operationalDate, query, shiftFilter]);

  const shiftStats = useMemo(() => {
    const calc = (s: string) => {
      const lots = activeLots.filter(l => lotEngine.decodeADN(l.lote).turno.val === s);
      const ent = lots.reduce((acc, l) => acc + l.presentations.reduce((pA, p) => pA + p.records.reduce((rA, r) => rA + r.cant, 0), 0), 0);
      return { ent, count: lots.length };
    };
    return { t1: calc('1'), t2: calc('2') };
  }, [activeLots]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto pb-32">
      {/* HUD TORRE DE CONTROL */}
      <div className="bg-zinc-900/40 border border-emerald-500/20 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl border border-emerald-400/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Torre de Control</h2>
            <p className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.4em] mt-1">Radar de Planta • Jornada {operationalDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-10 relative z-10 border-l border-zinc-800/50 pl-10 h-16">
           <div className="text-center group">
             <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center"><Clock className="w-2.5 h-2.5" /> Turno Día</p>
             <p className="text-2xl font-black text-white tabular-nums group-hover:text-amber-400 transition-colors">{shiftStats.t1.ent.toLocaleString()} <span className="text-[10px] text-zinc-700">KG</span></p>
             <p className="text-[7px] font-bold text-zinc-600 uppercase mt-1">{shiftStats.t1.count} UNIDADES</p>
           </div>
           <div className="text-center group">
             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center"><Clock className="w-2.5 h-2.5" /> Turno Noche</p>
             <p className="text-2xl font-black text-white tabular-nums group-hover:text-indigo-400 transition-colors">{shiftStats.t2.ent.toLocaleString()} <span className="text-[10px] text-zinc-700">KG</span></p>
             <p className="text-[7px] font-bold text-zinc-600 uppercase mt-1">{shiftStats.t2.count} UNIDADES</p>
           </div>
        </div>
      </div>

      {/* FILTROS TÁCTICOS */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="BUSCAR ADN O DERC ID..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-emerald-500/30 rounded-[1.8rem] pl-16 pr-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-200 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-[1.8rem] border border-zinc-900 shadow-xl">
           {[
             { id: 'ALL', label: 'Todos' },
             { id: '1', label: 'Día' },
             { id: '2', label: 'Noche' }
           ].map(f => (
             <button 
              key={f.id}
              onClick={() => setShiftFilter(f.id as any)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${shiftFilter === f.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
               {f.label}
             </button>
           ))}
        </div>
      </div>

      {/* LISTADO DE RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeLots.length === 0 ? (
          <div className="col-span-full h-96 border-2 border-dashed border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-50">
             <Box className="w-16 h-16" />
             <p className="text-xs font-black uppercase tracking-[0.4em]">Sin lotes en radar</p>
          </div>
        ) : (
          activeLots.map((derc) => {
            const adn = lotEngine.decodeADN(derc.lote);
            const isDocked = dockedIds.includes(derc.id);
            const totalBoxes = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cajasT, 0), 0);
            const deliveredBoxes = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.entreg, 0), 0);
            const progress = totalBoxes > 0 ? (deliveredBoxes / totalBoxes) * 100 : 0;
            const isComplete = progress >= 100 && totalBoxes > 0;

            return (
              <div 
                key={derc.id} 
                className={`bg-zinc-950 border group hover:border-emerald-500/50 p-7 rounded-[2.5rem] transition-all relative overflow-hidden shadow-xl ${adn.isValid ? 'border-zinc-900' : 'border-amber-500/30'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className={`text-xl font-black tracking-tight mb-1 transition-colors uppercase ${isComplete ? 'text-emerald-500' : 'text-white'}`}>{derc.lote}</h4>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{derc.dercId}</p>
                  </div>
                  <div className="flex gap-2">
                    {isDocked && (
                       <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 animate-pulse" title="Acoplado en Mesa">
                         <Columns className="w-4 h-4" />
                       </div>
                    )}
                    {isComplete ? (
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /></div>
                    ) : (
                      <div className={`p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-700 transition-all ${progress > 0 ? 'border-amber-500/20 text-amber-500' : ''}`}><Target className="w-4 h-4" /></div>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Despacho Logístico</span>
                      <span className={`text-[10px] font-black tabular-nums ${isComplete ? 'text-emerald-400' : 'text-zinc-400'}`}>{progress.toFixed(0)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-600'}`} 
                        style={{ width: `${progress}%` }} 
                      />
                   </div>
                   <div className="flex justify-between px-1">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase">{deliveredBoxes} / {totalBoxes} Cajas</p>
                      {!adn.isValid && <p className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> ADN NO VÁLIDO</p>}
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-5 gap-3">
                   <button 
                    onClick={() => onGoToDerc(derc.id)}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                     Inspeccionar <ChevronRight className="w-3 h-3" />
                   </button>
                   {!isDocked && (
                     <button 
                      onClick={() => onDockLot(derc.id)}
                      className="px-5 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                     >
                       <Columns className="w-3.5 h-3.5" /> Mesa
                     </button>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

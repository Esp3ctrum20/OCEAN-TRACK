import React, { useState, useEffect, useMemo } from 'react';
import { X, Hash, Package, Check, Zap, ShieldAlert, Calendar, Archive, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { DercEntry, AppTheme } from '../types';
import { lotEngine } from '../core/lotEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lote: string, fullDercId: string, productionDate: string, shouldDock: boolean) => void;
  existingDercs: DercEntry[];
  theme?: AppTheme;
}

const NewDercModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, existingDercs, theme }) => {
  const [lote, setLote] = useState('');
  const [sequence, setSequence] = useState('');
  const [shake, setShake] = useState(false);
  const isLight = theme === 'pearl';
  
  const operationalDate = useMemo(() => lotEngine.getOperationalDate(), []);
  const [manualDate, setManualDate] = useState(operationalDate);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear().toString());
  const [month, setMonth] = useState((now.getMonth() + 1).toString().padStart(2, '0'));
  
  const fullDercId = useMemo(() => `DERC-${sequence || '00000'}-${year}-${month}/SEC`, [sequence, year, month]);
  const adn = useMemo(() => lotEngine.decodeADN(lote, existingDercs), [lote, existingDercs]);

  const inferredDate = adn.adnDate || operationalDate;
  
  const dateStatus = useMemo(() => {
    if (!adn.isValid || !adn.adnDate) return 'current';
    const [d, m, y] = adn.adnDate.split('/').map(Number);
    const [od, om, oy] = operationalDate.split('/').map(Number);
    const inferred = new Date(2000 + y, m - 1, d).getTime();
    const current = new Date(2000 + oy, om - 1, od).getTime();
    
    if (inferred < current) return 'past';
    if (inferred > current) return 'future';
    return 'current';
  }, [adn, operationalDate]);

  const isPastLot = dateStatus === 'past';
  const isFutureLot = dateStatus === 'future';

  const isDuplicateDerc = useMemo(() => {
    return existingDercs.some(d => !d.deletedAt && d.dercId === fullDercId);
  }, [fullDercId, existingDercs]);

  useEffect(() => {
    if (isOpen) {
      setLote('');
      setSequence('');
      setIsManualOverride(false);
      const current = new Date();
      setYear(current.getFullYear().toString());
      setMonth((current.getMonth() + 1).toString().padStart(2, '0'));
    }
  }, [isOpen]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adn.isValid || isDuplicateDerc || adn.isOrderConflict || !sequence) {
      triggerShake();
      return;
    }
    onConfirm(lote, fullDercId, isManualOverride ? manualDate : inferredDate, dateStatus === 'current');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300 ${isLight ? 'bg-black/20' : 'bg-black/90'}`}>
      <div className={`border w-full max-w-md rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-200 ${shake ? 'animate-shake' : ''} ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800'}`}>
        
        <div className={`px-8 py-6 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50/50' : 'bg-zinc-950/40'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${isFutureLot ? 'bg-cyan-600 shadow-cyan-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-widest leading-none ${isLight ? 'text-zinc-900' : 'text-white'}`}>Apertura ADN</h2>
              <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1 tracking-[0.3em]">Protocolo Inteligente</p>
            </div>
          </div>
          <button onClick={onClose} className={`transition-all p-2 rounded-full ${isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200' : 'text-zinc-600 hover:text-white hover:bg-zinc-800'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-indigo-500" /> Código Lote (ADN)
              </label>
              {adn.isValid && <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1.5"><Check className="w-3 h-3" /> ADN Sincronizado</span>}
            </div>
            
            <input
              autoFocus
              required
              type="text"
              placeholder="1302CA101"
              maxLength={9}
              value={lote}
              onChange={(e) => setLote(e.target.value.toUpperCase().replace(/\s/g, ''))}
              className={`w-full border-2 rounded-[2rem] px-6 py-5 text-3xl font-black uppercase outline-none transition-all placeholder:text-zinc-200 tracking-[0.2em] text-center ${
                isLight ? (lote.length === 0 ? 'bg-zinc-50 border-zinc-100' : adn.isValid ? 'bg-white border-indigo-500 text-indigo-600' : 'bg-rose-50 border-rose-200 text-rose-500') :
                (lote.length === 0 ? 'bg-zinc-950 border-zinc-800' : adn.isValid ? 'bg-zinc-950 border-indigo-500/50 text-indigo-400' : 'bg-zinc-950 border-rose-500/50 text-rose-500')
              }`}
            />

            {adn.isValid && (
              <div className={`p-5 rounded-[2rem] border animate-in slide-in-from-top-2 duration-300 flex flex-col gap-4 ${
                isPastLot ? (isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/5 border-amber-500/20') : 
                isFutureLot ? (isLight ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-500/5 border-cyan-200/20') : 
                (isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/5 border-emerald-500/20')
              }`}>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white ${isPastLot ? 'bg-amber-600' : isFutureLot ? 'bg-cyan-600 shadow-lg shadow-cyan-600/20' : 'bg-emerald-600'}`}>
                        {isPastLot ? <Archive className="w-4 h-4" /> : isFutureLot ? <TrendingUp className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isPastLot ? 'text-amber-600' : isFutureLot ? 'text-cyan-600' : 'text-emerald-600'}`}>
                          {isPastLot ? 'Lote de Archivo' : isFutureLot ? 'Lote de Proyección' : 'Jornada Activa'}
                        </p>
                        <p className={`text-[8px] font-bold uppercase mt-0.5 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Identidad: {inferredDate}</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Turno', txt: adn.turno.label, ok: adn.turno.ok },
                { label: 'Día ADN', txt: adn.dia.label, ok: adn.dia.ok },
                { label: 'Semana', txt: adn.semana.label, ok: adn.semana.ok },
                { label: 'Año', txt: adn.año.label, ok: adn.año.ok },
                { label: 'Orden', txt: adn.orden.label, ok: adn.orden.ok, err: adn.isOrderConflict },
                { label: 'Secuencia', txt: adn.secuencia.label, ok: adn.secuencia.ok }
              ].map((f, i) => (
                <div key={i} className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                  lote.length === 0 ? 'opacity-20 grayscale' :
                  f.err ? (isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-500/10 border-rose-500/40 text-rose-400') :
                  f.ok ? (isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100') : (isLight ? 'bg-rose-50 border-rose-100 text-rose-300' : 'bg-rose-900/10 border-rose-900/40 text-rose-300')
                }`}>
                  <span className={`text-[6px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-zinc-400' : 'opacity-40'}`}>{f.label}</span>
                  <span className="text-[8px] font-black uppercase whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    {lote.length === 0 ? '---' : f.txt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`h-px ${isLight ? 'bg-zinc-100' : 'bg-zinc-900'}`} />

          <div className="space-y-4">
            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> Correlativo DERC Industrial
            </label>
            <div className="flex gap-3">
              <input
                required
                type="text"
                placeholder="00000"
                value={sequence}
                onChange={(e) => setSequence(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className={`flex-1 border-2 rounded-2xl px-5 py-4 font-black text-lg focus:outline-none transition-all ${
                  isLight ? 
                  (isDuplicateDerc ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:bg-white focus:border-indigo-400') :
                  (isDuplicateDerc ? 'bg-zinc-950 border-rose-500/50 text-white' : 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500/40')
                }`}
              />
              <div className={`w-20 border rounded-2xl flex flex-col items-center justify-center ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/50 border-zinc-800'}`}>
                <span className="text-[7px] font-black text-zinc-500 uppercase mb-0.5">Periodo</span>
                <span className={`text-[10px] font-black ${isLight ? 'text-zinc-900' : 'text-zinc-500'}`}>{year.slice(2)}/{month}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!adn.isValid || isDuplicateDerc || adn.isOrderConflict || !sequence}
            className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-10 disabled:grayscale ${
              isPastLot ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' : 
              isFutureLot ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20' : 
              'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {dateStatus === 'current' ? (
              <>Apertura Jornada <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Archivar en Bóveda <Archive className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewDercModal;
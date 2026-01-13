import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldAlert, Check, Zap, Hash, Package, ArrowRight } from 'lucide-react';
import { DercEntry, AppTheme } from '../types';
import { lotEngine } from '../core/lotEngine';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    derc: DercEntry;
    onConfirm: (updatedLote: string, updatedDercId: string, updatedDate: string) => void;
    existingDercs: DercEntry[];
    theme?: AppTheme;
}

export const QuickEditLotModal: React.FC<Props> = ({ isOpen, onClose, derc, onConfirm, existingDercs, theme }) => {
    const [lote, setLote] = useState(derc.lote);
    const [sequence, setSequence] = useState(derc.dercId.split('-')[1] || '');
    const [shake, setShake] = useState(false);
    const isLight = theme === 'pearl';

    // Extraer año y mes del dercId original
    const dercParts = derc.dercId.split('-');
    const year = dercParts[2] || new Date().getFullYear().toString();
    const month = (dercParts[3] || '').split('/')[0] || (new Date().getMonth() + 1).toString().padStart(2, '0');

    const adn = useMemo(() => lotEngine.decodeADN(lote, existingDercs, derc.id), [lote, existingDercs, derc.id]);
    const fullDercId = useMemo(() => `DERC-${sequence || '00000'}-${year}-${month}/SEC`, [sequence, year, month]);

    const hasChanged = lote !== derc.lote || sequence !== (derc.dercId.split('-')[1] || '');
    const isDateChanged = adn.isValid && adn.adnDate !== derc.date;

    useEffect(() => {
        if (isOpen) {
            setLote(derc.lote);
            setSequence(derc.dercId.split('-')[1] || '');
        }
    }, [isOpen, derc]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adn.isValid || !sequence) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        onConfirm(lote, fullDercId, adn.adnDate || derc.date);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300 ${isLight ? 'bg-black/20' : 'bg-black/90'}`}>
            <div className={`border w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${shake ? 'animate-shake' : ''} ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800'}`}>

                <div className={`px-8 py-5 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50' : 'bg-zinc-950/40'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center bg-amber-500 shadow-lg shadow-amber-500/20`}>
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className={`text-[10px] font-black uppercase tracking-widest leading-none ${isLight ? 'text-zinc-900' : 'text-white'}`}>Sincronización ADN</h2>
                            <p className="text-[6px] text-zinc-500 font-bold uppercase mt-1 tracking-[0.2em]">Edición Táctica de Lote</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`transition-all p-1.5 rounded-full hover:bg-zinc-800/10 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[7px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3 text-amber-500" /> Código ADN
                            </label>
                            {adn.isValid && <span className="text-[6px] font-black text-emerald-500 uppercase">ADN Válido</span>}
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={lote}
                            onChange={(e) => setLote(e.target.value.toUpperCase().replace(/\s/g, ''))}
                            className={`w-full border-2 rounded-2xl px-6 py-4 text-2xl font-black uppercase outline-none transition-all text-center tracking-widest ${isLight ? (adn.isValid ? 'border-amber-500 text-amber-600' : 'border-rose-200 text-rose-500 bg-rose-50') :
                                    (adn.isValid ? 'bg-zinc-950 border-amber-500/50 text-amber-400' : 'bg-zinc-950 border-rose-500/50 text-rose-500')
                                }`}
                        />

                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { label: 'Turno', txt: adn.turno.label, ok: adn.turno.ok },
                                { label: 'Día', txt: adn.dia.label, ok: adn.dia.ok },
                                { label: 'Sem', txt: adn.semana.label, ok: adn.semana.ok },
                                { label: 'Año', txt: adn.año.label, ok: adn.año.ok },
                                { label: 'Orden', txt: adn.orden.label, ok: adn.orden.ok && !adn.isOrderConflict, err: adn.isOrderConflict },
                                { label: 'Sec', txt: adn.secuencia.label, ok: adn.secuencia.ok }
                            ].map((f, i) => (
                                <div key={i} className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${f.err ? (isLight ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-rose-500/10 border-rose-500/40 text-rose-400') :
                                        f.ok ? (isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100') : (isLight ? 'bg-rose-50 border-rose-50 text-rose-300' : 'bg-rose-950/20 border-rose-900/40 text-rose-400')
                                    }`}>
                                    <span className={`text-[5px] font-black uppercase tracking-widest mb-0.5 ${isLight ? 'text-zinc-400' : 'opacity-40'}`}>{f.label}</span>
                                    <span className="text-[7px] font-black uppercase truncate w-full text-center">{f.txt}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[7px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                            <Hash className="w-3 h-3 text-amber-500" /> Correlativo Industrial
                        </label>
                        <input
                            type="text"
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value.replace(/\D/g, '').slice(0, 5))}
                            className={`w-full border-2 rounded-xl px-4 py-2.5 font-black text-sm outline-none transition-all ${isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-amber-400 focus:bg-white' : 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500/40'
                                }`}
                        />
                    </div>

                    {isDateChanged && (
                        <div className={`p-4 rounded-[2rem] border animate-in slide-in-from-top-2 flex flex-col gap-2 ${isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-500/20'}`}>
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-rose-500">Advertencia de Reubicación</span>
                            </div>
                            <p className={`text-[6px] font-bold uppercase leading-relaxed ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                                Estás cambiando la identidad cronológica del lote. Esto puede generar conflictos en el orden y origen del archivo histórico.
                            </p>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex flex-col">
                                    <span className="text-[5px] font-black uppercase text-zinc-500">Anterior</span>
                                    <span className="text-[7px] font-black text-zinc-700">{derc.date}</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-zinc-400" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[5px] font-black uppercase text-rose-500">Nuevo</span>
                                    <span className="text-[7px] font-black text-rose-500">{adn.adnDate}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!adn.isValid || !sequence || !hasChanged}
                        className={`w-full py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-20 ${isDateChanged ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                            } text-white`}
                    >
                        Guardar Cambios <Check className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

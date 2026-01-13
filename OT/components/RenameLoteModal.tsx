import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Check, ShieldAlert, Loader2, Database, Hash, Calendar, Info, ChevronDown } from 'lucide-react';
import { lotEngine } from '../core/lotEngine';
import { DercEntry, AppTheme } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newLote: string, newDercId: string) => void;
  currentName: string;
  existingDercs: DercEntry[];
  currentDercId: string;
  theme?: AppTheme;
}

const CustomSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  isLight?: boolean;
}> = ({ label, value, options, onChange, icon, isLight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5 block ml-1">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border p-4 rounded-2xl flex items-center justify-between transition-all group ${
          isOpen 
            ? (isLight ? 'bg-white border-indigo-400 ring-2 ring-indigo-50' : 'border-[#7dd3fc]/50 ring-2 ring-[#7dd3fc]/10 bg-[#18181b]') 
            : (isLight ? 'bg-zinc-50 border-zinc-100 hover:bg-white' : 'bg-[#18181b] border-zinc-800')
        }`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className={`transition-colors ${isOpen ? (isLight ? 'text-indigo-600' : 'text-[#7dd3fc]') : 'text-zinc-500'}`}>{icon}</div>}
          <span className={`text-sm font-black ${isLight ? 'text-zinc-950' : 'text-white'}`}>{value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e]/95 border-zinc-800'}`}>
          <div className="max-h-48 overflow-y-auto py-2 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full px-5 py-3 text-left text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                  value === opt ? (isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-[#7dd3fc]/10 text-[#7dd3fc]') : (isLight ? 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900' : 'text-zinc-500 hover:bg-white/5 hover:text-white')
                }`}
              >
                {opt}
                {value === opt && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RenameLoteModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, currentName, existingDercs, currentDercId, theme }) => {
  const [activeTab, setActiveTab] = useState<'lote' | 'derc'>('lote');
  const [newLote, setNewLote] = useState(currentName);
  const isLight = theme === 'pearl';
  
  const currentDercObj = useMemo(() => existingDercs.find(d => d.id === currentDercId), [existingDercs, currentDercId]);
  const dercParts = useMemo(() => {
    if (!currentDercObj) return { seq: '00000', year: '2025', month: '12' };
    const match = currentDercObj.dercId.match(/DERC-(\d+)-(\d+)-(\d+)/);
    return match ? { seq: match[1], year: match[2], month: match[3] } : { seq: '00000', year: '2025', month: '12' };
  }, [currentDercObj]);

  const [newSeq, setNewSeq] = useState(dercParts.seq);
  const [newYear, setNewYear] = useState(dercParts.year);
  const [newMonth, setNewMonth] = useState(dercParts.month);

  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const adn = useMemo(() => lotEngine.decodeADN(newLote, existingDercs, currentDercId), [newLote, existingDercs, currentDercId]);
  const fullDercId = useMemo(() => `DERC-${newSeq}-${newYear}-${newMonth}/SEC`, [newSeq, newYear, newMonth]);
  const isDercDuplicate = useMemo(() => existingDercs.some(d => d.id !== currentDercId && !d.deletedAt && d.dercId === fullDercId), [fullDercId, existingDercs, currentDercId]);

  useEffect(() => {
    if (isOpen) {
      setNewLote(currentName);
      setNewSeq(dercParts.seq);
      setNewYear(dercParts.year);
      setNewMonth(dercParts.month);
      setIsApplying(false);
      setShowSuccess(false);
      setActiveTab('lote');
    }
  }, [isOpen, currentName, dercParts]);

  const handleApply = async () => {
    if (!adn.isValid || isDercDuplicate || isApplying) return;
    setIsApplying(true);
    await new Promise(r => setTimeout(r, 600));
    setShowSuccess(true);
    await new Promise(r => setTimeout(r, 400));
    onConfirm(newLote, fullDercId);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300 ${isLight ? 'bg-black/30' : 'bg-black/90'}`}>
      <div className={`border w-full max-w-[440px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${isLight ? 'bg-white border-zinc-200 shadow-zinc-400/20' : 'bg-[#121214] border-zinc-800/60 shadow-black/80'}`}>
        
        <div className={`px-8 py-6 flex items-center justify-between border-b ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-transparent border-transparent'}`}>
          <h2 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-900' : 'text-white'}`}>Gestión de Identidad</h2>
          <button onClick={onClose} className={`transition-all p-2 rounded-full ${isLight ? 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pt-6 pb-4">
          <div className={`flex p-1.5 rounded-2xl border shadow-inner ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#0d0d0f] border-zinc-800'}`}>
            <button onClick={() => setActiveTab('lote')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'lote' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white') : 'text-zinc-500'}`}><Database className="w-3.5 h-3.5" /> Lote ADN</button>
            <button onClick={() => setActiveTab('derc')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'derc' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-[#7dd3fc] text-black') : 'text-zinc-500'}`}><Hash className="w-3.5 h-3.5" /> DERC ID</button>
          </div>
        </div>

        <div className="px-8 pb-10 space-y-6">
          {activeTab === 'lote' ? (
            <div className="space-y-6">
              <div className={`relative border-2 rounded-[1.8rem] px-6 py-7 transition-all duration-300 flex items-center justify-center ${isLight ? (!adn.isValid ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-100') : (!adn.isValid ? 'bg-rose-500/5 border-rose-500/40' : 'bg-indigo-500/5 border-indigo-500/40')}`}>
                <input autoFocus type="text" maxLength={9} value={newLote} onChange={(e) => setNewLote(e.target.value.toUpperCase().replace(/\s/g, ''))} className={`w-full bg-transparent text-3xl font-black uppercase outline-none text-center tracking-[0.25em] ${!adn.isValid ? 'text-rose-500' : (isLight ? 'text-zinc-950' : 'text-indigo-400')}`} />
                {adn.isValid && <div className="absolute right-6"><Check className="w-6 h-6 text-emerald-500" /></div>}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Turno', val: adn.turno.label, ok: adn.turno.ok },
                  { label: 'Día', val: adn.dia.label === '---' ? '---' : adn.dia.label.slice(0, 3).toUpperCase(), ok: adn.dia.ok },
                  { label: 'Semana', val: adn.semana.label === '---' ? '---' : 'S-' + adn.semana.val, ok: adn.semana.ok },
                  { label: 'Año (MAP)', val: adn.año.label === '---' ? '---' : (adn.año.val.charCodeAt(0) - 65 + 2024).toString(), ok: adn.año.ok },
                  { label: 'Orden Desc.', val: adn.orden.label === '---' ? 'ORD' : 'ORD ' + adn.orden.val, ok: adn.orden.ok, err: adn.isOrderConflict },
                  { label: 'Secuencia', val: adn.secuencia.label === '---' ? 'SEQ' : 'SEQ ' + adn.secuencia.val, ok: adn.secuencia.ok }
                ].map((f, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center py-3.5 rounded-2xl border transition-all ${isLight ? (f.err ? 'bg-rose-50 border-rose-100' : 'bg-zinc-50 border-zinc-100') : (f.err ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#18181b] border-zinc-800')}`}>
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">{f.label}</span>
                    <span className={`text-[10px] font-black uppercase ${f.err ? 'text-rose-600' : (isLight ? 'text-zinc-900' : 'text-white')}`}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`relative border-2 rounded-[1.8rem] px-6 py-7 transition-all duration-300 flex items-center justify-center ${isLight ? (isDercDuplicate ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-100') : (isDercDuplicate ? 'bg-rose-500/5 border-rose-500/40' : 'bg-[#7dd3fc]/5 border-[#7dd3fc]/40')}`}>
                <input type="text" maxLength={5} value={newSeq} onChange={(e) => setNewSeq(e.target.value.replace(/\D/g, ''))} className={`w-full bg-transparent text-3xl font-black uppercase outline-none text-center tracking-[0.25em] ${isDercDuplicate ? 'text-rose-500' : (isLight ? 'text-indigo-600' : 'text-[#7dd3fc]')}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomSelect label="Año Operativo" value={newYear} options={['2024', '2025', '2026', '2027']} onChange={setNewYear} icon={<Calendar className="w-4 h-4" />} isLight={isLight} />
                <CustomSelect label="Mes Operativo" value={newMonth} options={Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, '0'))} onChange={setNewMonth} icon={<Database className="w-4 h-4" />} isLight={isLight} />
              </div>
            </div>
          )}

          <div className={`p-5 border rounded-[1.5rem] flex items-start gap-4 ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-950/50 border-zinc-800'}`}>
             <Info className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
             <p className={`text-[9px] font-bold uppercase leading-relaxed tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>La alteración de la identidad afectará la trazabilidad histórica. Proceda solo si hay un error material.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-white'}`}>Cancelar</button>
            <button onClick={handleApply} disabled={!adn.isValid || isDercDuplicate || isApplying} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${showSuccess ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : showSuccess ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4" />} {showSuccess ? 'Ejecutado' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameLoteModal;
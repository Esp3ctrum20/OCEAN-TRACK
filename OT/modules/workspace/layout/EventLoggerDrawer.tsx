import React, { useEffect, useRef, useState } from 'react';
import { X, History, Zap, AlertCircle, CheckCircle2, Info, Clock, Trash2, Activity, ShieldAlert, ShieldCheck, Copy, Check, MousePointer2 } from 'lucide-react';
import { WorkspaceEvent, AppTheme } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  events: WorkspaceEvent[];
  onClear: () => void;
  theme?: AppTheme;
}

export const EventLoggerDrawer: React.FC<Props> = ({ isOpen, onClose, events, onClear, theme }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const isLight = theme === 'pearl';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isOpen]);

  const handleCopyToClipboard = () => {
    if (events.length === 0) return;
    const header = "ACCIÓN\tCAMBIO REALIZADO\tLOTE\tHORA\n";
    const rows = events.map(e => `${e.type}\t${e.message}\t${e.lotName || 'N/A'}\t${e.timestamp}`).join("\n");
    navigator.clipboard.writeText(header + rows).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-600/10 border-rose-500/20 text-rose-400';
      case 'SUCCESS': return isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'WARNING': return isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-600/5 border-amber-500/20 text-amber-400';
      default: return isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-3 h-3" />;
      case 'SUCCESS': return <CheckCircle2 className="w-3 h-3" />;
      case 'WARNING': return <Zap className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] transition-all animate-in fade-in duration-500" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-[420px] z-[160] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isLight ? 'bg-white border-l border-zinc-200 shadow-2xl' : 'bg-[#050506]/98 backdrop-blur-3xl border-l border-zinc-900 shadow-[-20px_0_80px_rgba(0,0,0,0.8)]'}`}>
        <div className="flex flex-col h-full relative overflow-hidden">

          {/* Header Consola */}
          <div className={`p-8 border-b relative z-10 flex items-center justify-between ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-900'}`}>
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'}`}>
                <Activity className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>Caja Negra</h3>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-0.5">Audit Feed v9.5 • Alpha-1</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyToClipboard}
                disabled={events.length === 0}
                className={`p-3 rounded-xl transition-all border ${isLight ? 'bg-white border-zinc-200 text-zinc-400 hover:text-indigo-600' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white'} disabled:opacity-20`}
                title="Copiar Feed de Auditoría"
              >
                {copyStatus ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
              <button onClick={onClear} className={`p-3 rounded-xl transition-all ${isLight ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50' : 'text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10'}`} title="Purgar Auditoría">
                <Trash2 className="w-4.5 h-4.5" />
              </button>
              <button onClick={onClose} className={`p-3 border rounded-xl transition-all active:scale-90 ${isLight ? 'bg-zinc-900 text-white border-zinc-950 shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Feed de Sucesos */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10 bg-transparent">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-10 px-10 space-y-6">
                <History className="w-20 h-20 text-zinc-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">Registro de Auditoría Libre de Incidencias.</p>
              </div>
            ) : (
              [...events].reverse().map((event, idx) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-xl border transition-all animate-in slide-in-from-right-4 duration-500 group/entry ${getSeverityStyles(event.severity)} ${idx === 0 ? 'ring-2 ring-indigo-500/20 shadow-2xl' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-black/10 border border-white/5">{getIcon(event.severity)}</div>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-80 italic">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-40">
                      <Clock className="w-2 h-2" />
                      <span className="text-[8px] font-mono tabular-nums">{event.timestamp}</span>
                    </div>
                  </div>
                  <p className={`text-[10px] font-bold uppercase leading-tight tracking-wide ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {event.message}
                  </p>
                  {event.lotName && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black flex items-center gap-1 ${isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/10'}`}>
                        <MousePointer2 className="w-1.5 h-1.5" />
                        {event.lotName}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Status Footer Industrial */}
          <div className={`p-8 border-t relative z-10 transition-colors ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/80 border-zinc-900'}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em]">Custodia Industrial Prot.</span>
                <span className={`text-[10px] font-black ${isLight ? 'text-zinc-950' : 'text-zinc-100'}`}>{events.length} EVENTOS EN MEMORIA FEED</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-0.5">Status Audit</span>
                  <span className="text-[11px] font-black text-emerald-500 tabular-nums uppercase flex items-center gap-2 shadow-sm">
                    AUDIT OK <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
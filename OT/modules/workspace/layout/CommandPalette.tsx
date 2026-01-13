import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Box, Command, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';
import { DercEntry, AppTheme } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    dockedLotes: DercEntry[];
    onSelectLot: (id: string) => void;
    theme?: AppTheme;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, dockedLotes, onSelectLot, theme }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const isLight = theme === 'pearl';

    const filteredItems = useMemo(() => {
        if (!query) return dockedLotes;
        const lowerQuery = query.toLowerCase();
        return dockedLotes.filter(l =>
            l.lote.toLowerCase().includes(lowerQuery) ||
            l.dercId.toLowerCase().includes(lowerQuery)
        );
    }, [dockedLotes, query]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        }
        if (e.key === 'Enter' && filteredItems.length > 0) {
            e.preventDefault();
            onSelectLot(filteredItems[selectedIndex].id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
            <div
                className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border animate-in slide-in-from-top-4 duration-500 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800'
                    }`}
                onKeyDown={handleKeyDown}
            >
                <div className="relative flex items-center px-6 py-5 border-b border-zinc-800/20">
                    <Search className={`w-5 h-5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar Lote o DERC ID..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        className={`flex-1 bg-transparent px-4 outline-none text-base font-bold ${isLight ? 'text-zinc-900 placeholder-zinc-400' : 'text-white placeholder-zinc-700'
                            }`}
                    />
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-black uppercase ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-black/40 border-white/5 text-zinc-600'
                        }`}>
                        <Command className="w-3 h-3" />
                        <span>Tactical Search</span>
                    </div>
                </div>

                <div className="max-h-[45vh] overflow-y-auto p-3 no-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center opacity-40">
                            <Zap className="w-8 h-8 mb-2" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-center">Sin resultados para "{query}"</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredItems.map((item, index) => {
                                const isActive = index === selectedIndex;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { onSelectLot(item.id); onClose(); }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${isActive
                                                ? (isLight ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'bg-indigo-600/10 text-white ring-1 ring-inset ring-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)]')
                                                : (isLight ? 'text-zinc-500 hover:bg-zinc-50' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300')
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isActive
                                                    ? (isLight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-400 text-white shadow-lg')
                                                    : (isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800')
                                                }`}>
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className={`text-sm font-black uppercase tracking-tight ${isActive && !isLight ? 'text-white' : ''}`}>{item.lote}</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'opacity-70' : 'opacity-40'}`}>{item.dercId}</span>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                                                <span className="text-[8px] font-black uppercase opacity-60">Seleccionar</span>
                                                <div className={`px-1.5 py-1 rounded border flex items-center gap-1 ${isLight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-500/20 border-indigo-400/30'}`}>
                                                    <CornerDownLeft className="w-3 h-3" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={`px-6 py-4 flex items-center justify-between border-t text-[8px] font-black uppercase tracking-[0.2em] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400' : 'bg-black/60 border-zinc-800 text-zinc-700'
                    }`}>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><ArrowRight className="w-2.5 h-2.5" /> Mover: ↑↓</span>
                        <span className="flex items-center gap-2"><ArrowRight className="w-2.5 h-2.5" /> Seleccionar: Enter</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Esc para Cerrar</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

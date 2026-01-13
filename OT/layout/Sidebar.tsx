
import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard, Database, RefreshCw, ChevronLeft, ChevronRight, Trash2, ShieldCheck, Columns
} from 'lucide-react';
import { AppMode, DercEntry, AppTheme } from '../types';
import { GhostHint } from '../core/zero-mouse/ui/GhostHint';
import { ZeroMouseAction } from '../core/zero-mouse/core/types';

interface SidebarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode | ((prev: AppMode) => AppMode)) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedViewId: string;
  setSelectedViewId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  todayGroup: DercEntry[];
  onOpenBackup: () => void;
  theme?: AppTheme;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appMode, setAppMode, isSidebarOpen, setSidebarOpen,
  selectedViewId, setSelectedViewId,
  onOpenBackup, theme, showHints, shortcuts
}) => {

  const isLight = theme === 'pearl';
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'summary', icon: LayoutDashboard, label: 'Panel', color: 'indigo', shortcut: 'Alt+1' },
    { id: 'workspace', icon: Columns, label: 'Mesa de Trabajo', color: 'indigo', shortcut: 'Alt+2' },
    { id: 'vault', icon: ShieldCheck, label: 'Bóveda', color: 'indigo', shortcut: 'Alt+3' },
    { id: 'trash', icon: Trash2, label: 'Papelera', color: 'rose', shortcut: 'Alt+4' }
  ];

  // PROTOCOLO ZERO-MOUSE: Gestión de Foco y Navegación
  useEffect(() => {
    if (isSidebarOpen) {
      // Al abrir, enfocamos el item actualmente seleccionado para navegación inmediata
      const activeBtn = navRef.current?.querySelector(`[data-id="${selectedViewId}"]`) as HTMLElement;
      activeBtn?.focus();
    }
  }, [isSidebarOpen, selectedViewId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(navRef.current?.querySelectorAll('button[data-nav-item="true"]') || []) as HTMLElement[];
    const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Selección y auto-ocultamiento para priorizar el espacio de trabajo
      const targetId = buttons[currentIndex]?.getAttribute('data-id');
      if (targetId) {
        e.preventDefault();
        setSelectedViewId(targetId);
        setSidebarOpen(false);
      }
    }
  };

  return (
    <aside
      className={`relative group ${isSidebarOpen ? 'w-72' : 'w-[88px]'} transition-all duration-300 border-r flex flex-col z-50 shadow-2xl ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800/40 shadow-[20px_0_50px_rgba(0,0,0,0.3)]'}`}
      role="navigation"
      aria-label="Menú Principal"
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={`absolute -right-3 top-28 w-6 h-6 rounded-full flex items-center justify-center text-white border shadow-lg z-[60] hover:scale-110 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${appMode === 'scallop' ? 'bg-indigo-600 border-indigo-400' : 'bg-emerald-600 border-emerald-400'}`}
        aria-label={isSidebarOpen ? "Colapsar menú (Tab)" : "Expandir menú (Tab)"}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className={`h-24 flex items-center justify-center border-b relative ${isLight ? 'border-zinc-200' : 'border-zinc-800/40'}`}>
        <button
          onClick={() => { setAppMode(prev => prev === 'scallop' ? 'shrimp' : 'scallop'); setSelectedViewId('summary'); }}
          className={`flex items-center gap-3 transition-all p-2 rounded-3xl hover:bg-zinc-400/5 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSidebarOpen ? 'px-6' : 'px-0'}`}
          aria-label="Cambiar modo de aplicación (Scallop/Shrimp)"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 ${appMode === 'scallop' ? 'bg-indigo-600' : 'bg-emerald-600 rotate-[360deg]'}`}>
            {appMode === 'scallop' ? <Database className="w-6 h-6 text-white" /> : <RefreshCw className="w-6 h-6 text-white" />}
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col items-start animate-in fade-in duration-500">
              <span className={`font-black text-lg tracking-tighter uppercase ${isLight ? 'text-zinc-900' : 'text-white'}`}>OCEAN<span className={appMode === 'scallop' ? 'text-indigo-600' : 'text-emerald-600'}>TRACK</span></span>
              <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{appMode === 'scallop' ? 'Management' : 'Shrimp Lab'}</span>
            </div>
          )}
        </button>
      </div>

      <div ref={navRef} className="flex-1 overflow-y-auto overflow-x-hidden py-8 space-y-8 no-scrollbar">
        <nav className="px-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = selectedViewId === item.id;
            const isRose = item.color === 'rose';
            const actionId = {
              'summary': 'GOTO_DASHBOARD',
              'workspace': 'GOTO_WORKSPACE',
              'vault': 'GOTO_VAULT',
              'trash': 'GOTO_TRASH'
            }[item.id] as ZeroMouseAction;

            return (
              <button
                key={item.id}
                data-id={item.id}
                data-nav-item="true"
                data-sidebar-nav={index === 0 ? "first" : undefined}
                onClick={() => { setSelectedViewId(item.id); setSidebarOpen(false); }}
                className={`w-full relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 outline-none group/btn ${isActive
                  ? (isRose ? 'bg-rose-600 text-white shadow-xl ring-2 ring-rose-500/50' : 'bg-indigo-600 text-white shadow-xl ring-2 ring-indigo-500/50')
                  : (isLight ? 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 focus-visible:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-indigo-400' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 focus-visible:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500')
                  }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label} (${item.shortcut})`}
              >
                <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                {isSidebarOpen && (
                  <div className="flex flex-col items-start animate-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                    <span className="text-[7px] font-bold text-zinc-500 group-hover/btn:text-zinc-400">{item.shortcut}</span>
                  </div>
                )}
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                <GhostHint action={actionId} shortcuts={shortcuts} visible={showHints} />
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`p-4 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-800/40'}`}>
        {appMode === 'scallop' && (
          <button
            onClick={onOpenBackup}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isLight ? 'text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-zinc-700 hover:text-indigo-400 hover:bg-indigo-600/5'}`}
            aria-label="Configuración de Seguridad de Sistema"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-[10px] uppercase font-black tracking-widest animate-in fade-in duration-500">Seguridad</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

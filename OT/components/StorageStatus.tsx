
import React from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, DownloadCloud } from 'lucide-react';
import { StorageService } from '../core/storage';
import { DercEntry } from '../types';

interface Props {
  status: 'synced' | 'syncing' | 'error';
  lastSave: Date | null;
  currentData: DercEntry[];
}

export const StorageStatus: React.FC<Props> = ({ status, lastSave, currentData }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          text: 'Datos Protegidos',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          text: 'Sincronizando...',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20'
        };
      case 'error':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          text: 'Error de Guardado',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20'
        };
    }
  };

  const config = getStatusConfig();

  const handleManualBackup = (e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.exportData(currentData);
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} transition-all duration-300`}>
        <span className={config.color}>{config.icon}</span>
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
            {config.text}
          </span>
          {lastSave && (
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-tighter">
              Last: {lastSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={handleManualBackup}
        title="Descargar archivo de recuperación (.otrk)"
        className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group"
      >
        <DownloadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

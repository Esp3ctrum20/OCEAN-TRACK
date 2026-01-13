import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { DercEntry, AppTheme } from '../../../types';

interface WorkspaceJumpBarProps {
  dockedLotes: DercEntry[];
  onJump: (id: string) => void;
  theme?: AppTheme;
}

export const WorkspaceJumpBar: React.FC<WorkspaceJumpBarProps> = ({ dockedLotes, onJump, theme }) => {
  const isLight = theme === 'pearl';

  if (dockedLotes.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 px-8 pb-3 overflow-x-auto no-scrollbar scroll-smooth ${isLight ? 'bg-zinc-50/50' : ''}`}>
      <div className={`flex-shrink-0 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest mr-2 border-r pr-4 ${isLight ? 'text-zinc-400 border-zinc-200' : 'text-zinc-700 border-zinc-800/60'}`}>
        <MousePointer2 className="w-3 h-3" /> Jump Bar
      </div>
      {dockedLotes.map((l, idx) => {
        const input = l.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
        const output = l.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
        const yld = input > 0 ? (output / input) * 100 : 0;
        const isExcellent = yld >= 100;

        return (
          <button
            key={l.id}
            onClick={() => onJump(l.id)}
            data-jump-btn="true"
            data-lot={idx}
            data-index={idx}
            className={`flex-shrink-0 group flex items-center gap-3 px-4 py-2 border rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isLight
              ? 'bg-white border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm'
              : 'bg-zinc-900/50 border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-600/5'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${isExcellent ? (isLight ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]' : 'bg-emerald-500 animate-pulse') : (isLight ? 'bg-indigo-600' : 'bg-indigo-500')}`} />
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase leading-none transition-colors ${isLight ? 'text-zinc-800 group-hover:text-indigo-900' : 'text-zinc-300 group-hover:text-white'}`}>{l.lote}</p>
              <p className={`text-[7px] font-bold uppercase mt-1 tabular-nums ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>{yld.toFixed(1)}%</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
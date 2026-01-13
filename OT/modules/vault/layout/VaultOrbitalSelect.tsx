
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AppTheme } from '../../../types';

interface Props {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  theme?: AppTheme;
}

export const VaultOrbitalSelect: React.FC<Props> = ({ label, value, options, onChange, icon, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'pearl';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative min-w-[140px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
          isOpen 
            ? (isLight ? 'bg-white shadow-md' : 'bg-zinc-900 border-indigo-500 ring-2 ring-indigo-500/10') 
            : (isLight ? 'hover:bg-white' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700')
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && <div className={`flex-shrink-0 transition-colors ${isOpen ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : 'text-zinc-500'}`}>{icon}</div>}
          <div className="flex flex-col items-start truncate">
            <span className={`text-[7px] font-black uppercase tracking-widest leading-none mb-1 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>{label}</span>
            <span className={`text-[10px] font-black uppercase tracking-tight truncate ${value === 'all' ? (isLight ? 'text-zinc-400' : 'text-zinc-500') : (isLight ? 'text-zinc-900' : 'text-zinc-200')}`}>
              {selectedLabel}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-zinc-400'}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+8px)] left-0 right-0 border rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800'}`}>
          <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                  value === opt.value 
                    ? 'bg-indigo-600 text-white' 
                    : (isLight ? 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900' : 'text-zinc-500 hover:bg-white/5 hover:text-white')
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

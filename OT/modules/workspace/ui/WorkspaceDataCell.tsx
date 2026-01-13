
import React from 'react';

interface Props {
  value: number;
  onChange: (val: number) => void;
  type: 'INPUT' | 'OUTPUT' | 'BALANCE';
  isMatch?: boolean;
}

export const WorkspaceDataCell: React.FC<Props> = ({ value, onChange, type, isMatch }) => {
  const baseStyles = "w-full h-11 bg-transparent text-sm font-black outline-none transition-all tabular-nums text-right px-4 focus:bg-white/5";
  
  const colors = {
    INPUT: isMatch ? "text-white" : "text-zinc-300",
    OUTPUT: "text-indigo-400 focus:text-white",
    BALANCE: value < 0 ? "text-emerald-400" : value > 0 ? "text-rose-500" : "text-zinc-800"
  };

  if (type === 'BALANCE') {
    return (
      <div className={`${baseStyles} flex items-center justify-end font-mono text-lg ${colors.BALANCE}`}>
        {value === 0 ? '—' : value}
      </div>
    );
  }

  return (
    <input 
      type="number" 
      value={value === 0 ? '' : value} 
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`${baseStyles} ${colors[type as 'INPUT' | 'OUTPUT']} ${isMatch ? 'bg-indigo-500/20' : ''}`}
      placeholder="0"
    />
  );
};

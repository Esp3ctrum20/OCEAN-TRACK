
import React from 'react';
import { Target } from 'lucide-react';
import { PresentationType } from '../../../types';

interface Props {
  selectedType: PresentationType;
  setSelectedType: (type: PresentationType) => void;
  selectedTalla: string;
  setSelectedTalla: (talla: string) => void;
  availableTallas: string[];
}

export const FulfillmentHeader: React.FC<Props> = ({ 
  selectedType, setSelectedType, selectedTalla, setSelectedTalla, availableTallas 
}) => (
  <div className="bg-gradient-to-br from-amber-600/10 via-zinc-900 to-zinc-900 border border-amber-500/20 p-8 rounded-[2.5rem] shadow-2xl">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-600/40">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Radar de Existencias</h2>
          <p className="text-xs text-amber-500 font-black uppercase tracking-[0.2em] mt-1">Localización de Stock por Talla</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-zinc-950/50 p-3 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-zinc-600 uppercase ml-2">Presentación</span>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as PresentationType)}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs font-black uppercase px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
          >
            <option value="Tallo Coral">Tallo Coral</option>
            <option value="Tallo Solo">Tallo Solo</option>
            <option value="Media Valva">Media Valva</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-zinc-600 uppercase ml-2">Talla Objetivo</span>
          <select 
            value={selectedTalla}
            onChange={(e) => setSelectedTalla(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs font-black uppercase px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
          >
            {availableTallas.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>
);

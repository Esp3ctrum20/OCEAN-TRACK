
import React, { useState, useMemo } from 'react';
import { ShrimpRecord } from '../../types';
import { Camera, Trash2 } from 'lucide-react';
import { ShrimpHeader } from './layout/ShrimpHeader';
import { ShrimpMatrix } from './layout/ShrimpMatrix';
import { ShrimpSummary } from './layout/ShrimpSummary';
import { SHRIMP_TALLAS_DEFAULT, calculateShrimpTotals } from './core/shrimpLogic';

export const ShrimpView: React.FC = () => {
  const [lote, setLote] = useState('');
  const [mp, setMp] = useState<number>(0);
  const [records, setRecords] = useState<ShrimpRecord[]>(
    SHRIMP_TALLAS_DEFAULT.map(t => ({ talla: t, tailOff: 0, ezPeel: 0, tailOn: 0 }))
  );

  const totals = useMemo(() => calculateShrimpTotals(records, mp), [records, mp]);

  const handleUpdate = (talla: string, field: keyof ShrimpRecord, val: string) => {
    const n = parseFloat(val) || 0;
    setRecords(prev => prev.map(r => r.talla === talla ? { ...r, [field]: n } : r));
  };

  const handleClear = () => {
    if (confirm('¿Desea limpiar todos los datos de la tabla actual?')) {
      setRecords(SHRIMP_TALLAS_DEFAULT.map(t => ({ talla: t, tailOff: 0, ezPeel: 0, tailOn: 0 })));
      setMp(0);
      setLote('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <ShrimpHeader 
        lote={lote} 
        setLote={setLote} 
        mp={mp} 
        setMp={setMp} 
        yieldPct={totals.yieldPct} 
      />

      <ShrimpMatrix 
        records={records} 
        onUpdate={handleUpdate} 
      />

      <ShrimpSummary totals={totals} />

      <div className="flex justify-end gap-4 pt-4">
        <button 
          onClick={handleClear}
          className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 group"
        >
          <Trash2 className="w-4 h-4" /> Limpiar Tabla
        </button>
        <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 group">
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" /> Guardar y Foto
        </button>
      </div>
    </div>
  );
};

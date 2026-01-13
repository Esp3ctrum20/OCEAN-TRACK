
import { DercEntry, PresentationType } from '../types';

export const calculateDercTotals = (dercs: DercEntry[]) => {
  return dercs.reduce((acc, d) => {
    const entrada = d.presentations.reduce((pA, p) => 
      pA + p.records.reduce((rA, r) => rA + (Number(r.cant) || 0), 0)
    , 0);

    const salida = d.presentations.reduce((pA, p) => 
      pA + p.records.reduce((rA, r) => rA + (Number(r.kilosT) || 0), 0)
    , 0);
    
    return {
      entrada: acc.entrada + entrada,
      salida: acc.salida + salida,
    };
  }, { entrada: 0, salida: 0 });
};

export const formatChartData = (dercs: DercEntry[], groupByDay: boolean = false) => {
  if (!groupByDay) {
    return dercs.map(d => ({
      name: d.lote,
      total: d.presentations.reduce((acc, p) => acc + p.total, 0),
      coral: d.presentations.find(p => p.type === 'Tallo Coral' || p.type === 'Media Valva')
              ?.records.reduce((acc, r) => acc + r.cant, 0) || 0,
      solo: d.presentations.find(p => p.type === 'Tallo Solo')
              ?.records.reduce((acc, r) => acc + r.cant, 0) || 0,
    }));
  }

  // Agrupación por Día para el histórico
  const dayGroups: Record<string, { name: string; coral: number; solo: number }> = {};

  dercs.forEach(d => {
    if (!dayGroups[d.date]) {
      dayGroups[d.date] = { name: d.date, coral: 0, solo: 0 };
    }
    const coral = d.presentations.find(p => p.type === 'Tallo Coral' || p.type === 'Media Valva')
              ?.records.reduce((acc, r) => acc + r.cant, 0) || 0;
    const solo = d.presentations.find(p => p.type === 'Tallo Solo')
              ?.records.reduce((acc, r) => acc + r.cant, 0) || 0;
    
    dayGroups[d.date].coral += coral;
    dayGroups[d.date].solo += solo;
  });

  return Object.values(dayGroups).sort((a, b) => {
    const [da, ma, ya] = a.name.split('/').map(Number);
    const [db, mb, yb] = b.name.split('/').map(Number);
    return new Date(2000+ya, ma-1, da).getTime() - new Date(2000+yb, mb-1, db).getTime();
  });
};

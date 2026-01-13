
import { DercEntry, PresentationType } from '../../../types';

export const normalizeStr = (s: string) => {
  if (!s) return '';
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const getAvailableTallas = (dercs: DercEntry[], selectedType: PresentationType): string[] => {
  const tallasSet = new Set<string>();
  dercs.forEach(d => {
    d.presentations
      .filter(p => normalizeStr(p.type) === normalizeStr(selectedType))
      .forEach(p => {
        p.records.forEach(r => tallasSet.add(r.talla));
      });
  });
  return Array.from(tallasSet).sort((a, b) => a.localeCompare(b));
};

export interface FulfillmentResult {
  id: string;
  dercId: string;
  lote: string;
  date: string;
  cajasP: number;
  kilosPendientes: number;
}

export const getFulfillmentResults = (
  dercs: DercEntry[], 
  selectedType: PresentationType, 
  selectedTalla: string
): FulfillmentResult[] => {
  const list: FulfillmentResult[] = [];
  dercs.forEach(d => {
    const presentation = d.presentations.find(p => normalizeStr(p.type) === normalizeStr(selectedType));
    if (presentation) {
      const record = presentation.records.find(r => normalizeStr(r.talla) === normalizeStr(selectedTalla));
      if (record && record.cajasP > 0) {
        list.push({
          id: d.id,
          dercId: d.dercId,
          lote: d.lote,
          date: d.date,
          cajasP: record.cajasP,
          kilosPendientes: record.cajasP * presentation.factor
        });
      }
    }
  });
  return list.sort((a, b) => b.cajasP - a.cajasP);
};

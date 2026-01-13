
import { DercEntry, TallaRecord, Presentation, PresentationType } from '../types';

/**
 * lotEngine V12.0: Inteligencia Cronológica y Trazabilidad ADN.
 */
export const lotEngine = {
  
  getISOWeek: (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  },

  /**
   * Deduce la fecha calendario real a partir de los componentes del ADN.
   * Algoritmo: Año (Char) -> Semana ISO -> Día de la semana.
   */
  getDateFromADNParts: (dia: string, semana: string, añoChar: string): string | null => {
    if (!/^[1-7]$/.test(dia) || !/^\d{2}$/.test(semana) || !/^[A-Z]$/.test(añoChar)) return null;
    
    const year = añoChar.charCodeAt(0) - 65 + 2024;
    const week = parseInt(semana, 10);
    const dayOfWeek = parseInt(dia, 10);

    // Encontrar el 4 de enero (que siempre está en la semana 1 ISO)
    const jan4 = new Date(year, 0, 4);
    const dayOfJan4 = jan4.getDay() || 7;
    const mondayWeek1 = new Date(jan4);
    mondayWeek1.setDate(jan4.getDate() - dayOfJan4 + 1);

    // Sumar semanas y días
    const targetDate = new Date(mondayWeek1);
    targetDate.setDate(mondayWeek1.getDate() + (week - 1) * 7 + (dayOfWeek - 1));

    return targetDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  },

  // Fix: Added isCurrentJornada method required by ProductionView to verify if a lot belongs to the operational date based on its DNA.
  isCurrentJornada: (lote: string, operationalDate: string): boolean => {
    const adn = lotEngine.decodeADN(lote);
    return adn.isValid && adn.adnDate === operationalDate;
  },

  decodeADN: (lote: string, existingDercs: DercEntry[] = [], currentId?: string) => {
    const s = lote.toUpperCase().trim();
    const diaMap: Record<string, string> = { '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves', '5': 'Viernes', '6': 'Sábado', '7': 'Domingo' };
    const getYearFromChar = (char: string) => { if (!/^[A-Z]$/.test(char)) return null; return char.charCodeAt(0) - 65 + 2024; };
    const prefix = s.slice(0, 5);
    const orderChar = s[5] || '';
    
    const isOrderConflict = s.length >= 6 && existingDercs.some(d => !d.deletedAt && d.id !== currentId && d.lote.toUpperCase().startsWith(prefix) && d.lote.toUpperCase()[5] === orderChar);

    const parts = {
      turno: { val: s[0] || '', ok: ['1', '2'].includes(s[0]), label: s[0] === '1' ? 'Día' : s[0] === '2' ? 'Noche' : '---' },
      dia: { val: s[1] || '', ok: /^[1-7]$/.test(s[1]), label: diaMap[s[1]] || '---' },
      semana: { val: s.slice(2, 4) || '', ok: /^(0[1-9]|[1-4][0-9]|5[0-2])$/.test(s.slice(2, 4)), label: s.slice(2, 4) ? `Sem ${s.slice(2, 4)}` : '---' },
      año: { val: s[4] || '', ok: /^[A-Z]$/.test(s[4]), label: getYearFromChar(s[4]) ? `'${getYearFromChar(s[4])?.toString().slice(-2)}` : '---' },
      orden: { val: orderChar, ok: /^[A-Z]$/.test(orderChar) && !isOrderConflict, label: isOrderConflict ? 'CONFLICTO' : (orderChar ? `Descarga ${orderChar}` : '---'), conflict: isOrderConflict },
      secuencia: { val: s.slice(6, 9) || '', ok: /^\d{3}$/.test(s.slice(6, 9)), label: s.slice(6, 9) ? `Sec ${s.slice(6, 9)}` : '---' }
    };

    const adnDate = lotEngine.getDateFromADNParts(parts.dia.val, parts.semana.val, parts.año.val);
    const isValid = parts.turno.ok && parts.dia.ok && parts.semana.ok && parts.año.ok && parts.orden.ok && parts.secuencia.ok && s.length === 9;
    
    return { ...parts, isValid, isOrderConflict, raw: s, prefix, adnDate };
  },

  getOperationalDate: (cutoffTime: string = "07:30"): string => {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(':').map(Number);
    const cutoffDate = new Date(now);
    cutoffDate.setHours(hours, minutes, 0, 0);
    let operationalDate = new Date(now);
    if (now < cutoffDate) operationalDate.setDate(now.getDate() - 1);
    return operationalDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  },

  getTallaPriority: (talla: string): [number, number] => {
    const t = talla.trim().toUpperCase();
    if (t === 'NUEVA') return [999999, 999999];
    if (t === 'BROKEN') return [1000000, 1000000];
    const matches = t.match(/\d+/g);
    if (!matches) return [999998, 999998];
    const first = parseInt(matches[0], 10);
    const second = matches[1] ? parseInt(matches[1], 10) : first;
    return [first, second];
  },

  predictNextTalla: (currentRecords: TallaRecord[]): string => {
    if (currentRecords.length === 0) return "10-20";
    const sorted = [...currentRecords].sort((a, b) => {
      const [a1, a2] = lotEngine.getTallaPriority(a.talla);
      const [b1, b2] = lotEngine.getTallaPriority(b.talla);
      return a1 - b1 || a2 - b2;
    });
    const lastTalla = sorted[sorted.length - 1].talla;
    const matches = lastTalla.match(/(\d+)-(\d+)/);
    if (matches) {
      const high = parseInt(matches[2], 10);
      let step = 10;
      if (high >= 40) step = 20;
      return `${high}-${high + step}`;
    }
    return "NUEVA";
  },

  isValidTallaFormat: (talla: string): boolean => {
    if (!talla || talla === 'NUEVA') return true;
    return /^(\d+)(-\d+)?$/.test(talla.trim());
  },

  hasDataFootprint: (record: TallaRecord): boolean => (Number(record.cant) || 0) > 0 || (Number(record.entreg) || 0) > 0 || (Number(record.saldo) || 0) > 0,

  calculateRecord: (record: TallaRecord, factor: number): TallaRecord => {
    const updated = { ...record };
    const cant = Math.max(0, Number(updated.cant) || 0);
    const entreg = Math.max(0, Number(updated.entreg) || 0);
    const saldo = Math.max(0, Number(updated.saldo) || 0);
    const f = Math.max(0.1, factor || 1);
    updated.cant = cant;
    updated.entreg = entreg;
    updated.saldo = saldo;
    updated.cajasT = Math.round(cant / f);
    updated.cajasP = updated.cajasT - entreg;
    updated.kilosT = entreg * f;
    return updated;
  },

  syncLote: (derc: DercEntry): DercEntry => {
    const getPriority = (type: PresentationType) => {
      if (type === 'Tallo Coral' || type === 'Media Valva') return 0;
      return 1;
    };
    const updatedPresentations = [...derc.presentations]
      .sort((a, b) => getPriority(a.type) - getPriority(b.type))
      .map(p => {
        let records = p.records.map(r => lotEngine.calculateRecord(r, p.factor));
        records.sort((a, b) => {
          const [a1, a2] = lotEngine.getTallaPriority(a.talla);
          const [b1, b2] = lotEngine.getTallaPriority(b.talla);
          return a1 - b1 || a2 - b2;
        });
        return { ...p, records, total: records.reduce((acc, r) => acc + r.cant, 0) };
      });
    return { ...derc, presentations: updatedPresentations, totalConcha: updatedPresentations.reduce((acc, p) => acc + p.total, 0) };
  }
};

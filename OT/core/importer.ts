
import { TallaRecord, DercEntry, Presentation, PresentationType } from '../types';

/**
 * Procesa una línea de texto respetando las columnas de Excel (tabulaciones).
 */
const parseRowRobust = (line: string, factor: number, resetProduction: boolean = true): TallaRecord | null => {
  const cleanLine = line.trim();
  if (!cleanLine || 
      cleanLine.toUpperCase().includes('TALLA') || 
      cleanLine.toUpperCase().includes('TOTAL') ||
      cleanLine.toUpperCase().includes('LOTE') ||
      cleanLine.toUpperCase().includes('DERC')) return null;

  const columns = line.split('\t');
  
  if (columns.length < 2) {
    const tallaMatch = cleanLine.match(/^(\d+-\d+|\d+)/);
    if (!tallaMatch) return null;
    const talla = tallaMatch[0];
    const numbers = cleanLine.slice(talla.length).match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
    if (numbers.length === 0) return null;

    const cant = numbers[0] || 0;
    const entreg = resetProduction ? 0 : (numbers[2] || 0);
    const saldo = resetProduction ? 0 : (numbers[5] || 0);

    const calculatedCajasT = Math.round(cant / (factor || 1));
    const calculatedCajasP = calculatedCajasT - entreg;
    const calculatedKilosT = entreg * (factor || 1);

    return {
      id: Math.random().toString(36).substr(2, 9),
      talla,
      cant,
      cajasT: calculatedCajasT,
      entreg,
      cajasP: calculatedCajasP,
      kilosT: calculatedKilosT,
      saldo
    };
  }

  const talla = columns[0].trim();
  if (!talla.match(/^(\d+-\d+|\d+)/)) return null;

  const cant = parseFloat(columns[1]) || 0;
  const entreg = resetProduction ? 0 : (parseFloat(columns[3]) || 0);
  const saldo = resetProduction ? 0 : (parseFloat(columns[6]) || 0);

  const calculatedCajasT = Math.round(cant / (factor || 1));
  const calculatedCajasP = calculatedCajasT - entreg;
  const calculatedKilosT = entreg * (factor || 1);

  return {
    id: Math.random().toString(36).substr(2, 9),
    talla,
    cant,
    cajasT: calculatedCajasT,
    entreg,
    cajasP: calculatedCajasP,
    kilosT: calculatedKilosT,
    saldo
  };
};

export const parseMassInput = (text: string, factor: number, resetProduction: boolean = true): TallaRecord[] => {
  return text.split(/\r?\n/)
    .map(line => parseRowRobust(line, factor, resetProduction))
    .filter((r): r is TallaRecord => r !== null);
};

export const parseMultiExcelPaste = (text: string, defaultFactors: Record<PresentationType, number>, resetProduction: boolean = true): Partial<DercEntry>[] => {
  const dercMap = new Map<string, Partial<DercEntry>>();
  
  // Regex elástico para soportar múltiples espacios o variaciones como "TALLO Y CORAL"
  const sectionSplitRegex = /(?=TALLO\s+(?:Y\s+)?CORAL|TALLO\s+SOLO|MEDIA\s+VALVA)/i;
  const sections = text.split(sectionSplitRegex).filter(s => s.trim().length > 5);

  sections.forEach(sectionText => {
    const lines = sectionText.split(/\r?\n/);
    let sectionLote = '';
    let sectionDercId = '';
    let currentType: PresentationType | null = null;
    let dataLines: string[] = [];

    lines.forEach(line => {
      const upper = line.toUpperCase();
      if (upper.includes('TOTAL DERC')) return;

      // Detección elástica de tipo
      if (/TALLO\s+(?:Y\s+)?CORAL/i.test(upper)) currentType = 'Tallo Coral';
      else if (/TALLO\s+SOLO/i.test(upper)) currentType = 'Tallo Solo';
      else if (/MEDIA\s+VALVA/i.test(upper)) currentType = 'Media Valva';

      const loteMatch = line.match(/LOTE\s+([A-Z0-9]+)/i);
      if (loteMatch) sectionLote = loteMatch[1];
      const dercMatch = line.match(/DERC\s+([A-Z0-9\-\/]+)/i);
      if (dercMatch) sectionDercId = dercMatch[1];

      if (line.trim().match(/^\d/) && !upper.includes('TOTAL')) {
        dataLines.push(line);
      }
    });

    if (!currentType || dataLines.length === 0) return;
    const key = sectionDercId || sectionLote || 'TEMP_ENTRY';
    
    if (!dercMap.has(key)) {
      dercMap.set(key, {
        lote: sectionLote || 'SIN LOTE',
        dercId: sectionDercId || 'SIN DERC',
        date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        presentations: [],
        totalConcha: 0
      });
    }

    const entry = dercMap.get(key)!;
    const factor = defaultFactors[currentType] || 10;
    const records = parseMassInput(dataLines.join('\n'), factor, resetProduction);

    const existingPres = entry.presentations?.find(p => p.type === currentType);
    if (existingPres) {
      existingPres.records = records;
      existingPres.total = records.reduce((acc, r) => acc + r.cant, 0);
    } else {
      entry.presentations?.push({
        type: currentType,
        factor,
        records,
        total: records.reduce((acc, r) => acc + r.cant, 0)
      });
    }
  });

  return Array.from(dercMap.values()).filter(entry => entry.presentations && entry.presentations.length > 0);
};

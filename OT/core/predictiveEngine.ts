
import { DercEntry, PresentationType, TallaRecord } from '../types';
import { lotEngine } from './lotEngine';

export interface TallaGap {
  talla: string;
  pType: PresentationType;
  missingKg: number;
  expectedBoxes: number;
  status: 'INCOMPLETE' | 'CRITICAL_LOSS' | 'BALANCED' | 'SURPLUS';
  isSystemic?: boolean;
}

export interface PredictionResult {
  expectedYield: number;
  confidence: number;
  riskThreshold: number;
  dnaProfile: string;
  isAlert: boolean;
  delta: number;
  gaps: TallaGap[];
}

/**
 * Motor Predictivo OCEANTRACK v1.6
 * Analiza brechas de masa y detecta errores sistémicos segregados por presentación.
 */
export const predictiveEngine = {
  
  analyzeLot: (derc: DercEntry, history: DercEntry[]): PredictionResult => {
    const adn = lotEngine.decodeADN(derc.lote);
    const recentLots = history.filter(d => !d.deletedAt).slice(-50);
    
    let baseYield = 98.2;
    let weight = 0;

    if (adn.turno.val === '2') baseYield -= 0.3;
    
    const sameWeekLots = recentLots.filter(l => {
      const lAdn = lotEngine.decodeADN(l.lote);
      return lAdn.semana.val === adn.semana.val;
    });

    if (sameWeekLots.length > 0) {
      const avgWeekYield = sameWeekLots.reduce((acc, l) => {
        const ent = l.presentations.reduce((pa, p) => pa + p.records.reduce((ra, r) => ra + r.cant, 0), 0);
        const sal = l.presentations.reduce((pa, p) => pa + p.records.reduce((ra, r) => ra + r.kilosT, 0), 0);
        return acc + (ent > 0 ? (sal / ent) * 100 : 98);
      }, 0) / sameWeekLots.length;
      
      baseYield = (baseYield * 0.3) + (avgWeekYield * 0.7);
      weight = sameWeekLots.length;
    }

    const currentEnt = derc.presentations.reduce((pa, p) => pa + p.records.reduce((ra, r) => ra + r.cant, 0), 0);
    const currentSal = derc.presentations.reduce((pa, p) => pa + p.records.reduce((ra, r) => ra + r.kilosT, 0), 0);
    const actualYield = currentEnt > 0 ? (currentSal / currentEnt) * 100 : 0;

    const delta = actualYield > 0 ? actualYield - baseYield : 0;
    const riskThreshold = baseYield - 1.8;

    const gaps: TallaGap[] = [];
    derc.presentations.forEach(p => {
      p.records.forEach(r => {
        if (r.cant > 0) {
          const expectedOutput = r.cant * (baseYield / 100);
          const currentOutput = r.kilosT;
          const diff = expectedOutput - currentOutput;

          // Sensibilidad especial para Tallo Solo 30-40
          const isTargetSolo = p.type === 'Tallo Solo' && r.talla === '30-40';
          const threshold = isTargetSolo ? 0.8 : 1.2;

          if (diff > threshold) { 
            gaps.push({
              talla: r.talla,
              pType: p.type,
              missingKg: diff,
              expectedBoxes: Math.round(diff / p.factor),
              status: r.cajasP === 0 ? 'CRITICAL_LOSS' : 'INCOMPLETE'
            });
          } else if (diff < -1.5) {
            gaps.push({
              talla: r.talla,
              pType: p.type,
              missingKg: diff,
              expectedBoxes: 0,
              status: 'SURPLUS'
            });
          }
        }
      });
    });

    return {
      expectedYield: baseYield,
      confidence: Math.min(95, 60 + (weight * 5)),
      riskThreshold,
      dnaProfile: adn.isValid ? `PERFIL ${adn.turno.val}${adn.semana.val}` : 'PERFIL GENÉRICO',
      isAlert: actualYield > 0 && actualYield < riskThreshold,
      delta,
      gaps: gaps.sort((a, b) => b.missingKg - a.missingKg).slice(0, 6)
    };
  },

  analyzeSystemicRisk: (dockedLotes: DercEntry[]) => {
    const riskReport: Array<{ talla: string, pType: string, severity: 'HIGH' | 'MEDIUM', message: string }> = [];
    const presentationRisks: Record<string, { totalMissing: number, occurrences: number }> = {};
    
    dockedLotes.forEach(lot => {
      const pred = predictiveEngine.analyzeLot(lot, []);
      pred.gaps.forEach(gap => {
        const key = `${gap.pType}_${gap.talla}`;
        if (!presentationRisks[key]) presentationRisks[key] = { totalMissing: 0, occurrences: 0 };
        presentationRisks[key].totalMissing += gap.missingKg;
        presentationRisks[key].occurrences += 1;
      });
    });

    Object.entries(presentationRisks).forEach(([key, data]) => {
      const [pType, talla] = key.split('_');
      const isCriticalOccurrence = data.occurrences >= dockedLotes.length * 0.4;
      
      if (isCriticalOccurrence) {
        const isTargetSolo = pType === 'Tallo Solo' && talla === '30-40';
        riskReport.push({
          talla,
          pType,
          severity: (data.totalMissing > 8 || isTargetSolo) ? 'HIGH' : 'MEDIUM',
          message: isTargetSolo 
            ? `OBSERVACIÓN CRÍTICA: Desviación recurrente en ${pType} ${talla}. Se detecta una fuga acumulada de ${data.totalMissing.toFixed(1)} KG en la mesa actual. Revisar proceso de pelado.`
            : `PATRÓN DETECTADO: El calibre ${talla} (${pType}) presenta fugas en el ${Math.round((data.occurrences/dockedLotes.length)*100)}% de los lotes. Posible descalibración.`
        });
      }
    });

    return riskReport.sort((a, b) => a.severity === 'HIGH' ? -1 : 1);
  }
};


import { DercEntry } from '../../../types';

export interface DayData {
  date: string;
  yield: number;
  kg: number;
  isPeak: boolean;
  lotId?: string;
  lotName?: string;
  hasMultiple: boolean;
}

export interface HeatmapStats {
  avgYield: number;
  consistency: number;
  bestMonth: string;
  trend: 'up' | 'down' | 'stable';
}

export const calculateHeatmap = (dercs: DercEntry[]) => {
  const daysMap: Record<string, { totalYield: number; totalKg: number; count: number; lotIds: string[] }> = {};
  const today = new Date();
  const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const monthPerformance: Record<string, { yield: number; count: number }> = {};

  dercs.forEach(d => {
    const [day, month, yearShort] = d.date.split('/');
    const dateKey = `20${yearShort}-${month}-${day}`;
    const mLabel = monthNames[parseInt(month, 10) - 1];

    const totalSalida = d.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    const totalEntrada = d.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const yieldVal = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;

    if (!daysMap[dateKey]) daysMap[dateKey] = { totalYield: 0, totalKg: 0, count: 0, lotIds: [] };
    daysMap[dateKey].totalYield += yieldVal;
    daysMap[dateKey].totalKg += totalSalida;
    daysMap[dateKey].count += 1;
    daysMap[dateKey].lotIds.push(d.id);

    if (!monthPerformance[mLabel]) monthPerformance[mLabel] = { yield: 0, count: 0 };
    monthPerformance[mLabel].yield += yieldVal;
    monthPerformance[mLabel].count += 1;
  });

  let maxYield = 0;
  const weeks: DayData[][] = [];
  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < 52; w++) {
    const week: DayData[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (51 - w) * 7 - (6 - d));
      const key = date.toISOString().split('T')[0];
      const data = daysMap[key];

      const currentYield = data ? data.totalYield / data.count : 0;
      if (currentYield > maxYield) maxYield = currentYield;

      if (d === 0) {
        const currentMonth = date.getMonth();
        if (currentMonth !== lastMonth) {
          labels.push({ label: monthNames[currentMonth], weekIndex: w });
          lastMonth = currentMonth;
        }
      }

      week.push({
        date: date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        yield: currentYield,
        kg: data ? data.totalKg : 0,
        isPeak: false,
        lotId: data?.lotIds[0],
        hasMultiple: (data?.lotIds.length || 0) > 1
      });
    }
    weeks.push(week);
  }

  weeks.forEach(w => w.forEach(d => { if (d.yield === maxYield && maxYield > 0) d.isPeak = true; }));

  const activeDays = weeks.flat().filter(d => d.yield > 0);
  const avgYield = activeDays.length > 0 ? activeDays.reduce((acc, d) => acc + d.yield, 0) / activeDays.length : 0;
  const consistency = activeDays.length > 0 ? 100 - (activeDays.reduce((acc, d) => acc + Math.abs(d.yield - avgYield), 0) / activeDays.length) : 0;

  let bestMonth = 'N/A';
  let bestMonthYield = 0;
  Object.entries(monthPerformance).forEach(([m, data]) => {
    const mYield = data.yield / data.count;
    if (mYield > bestMonthYield) {
      bestMonthYield = mYield;
      bestMonth = m;
    }
  });

  const monthlyStats = Object.entries(monthPerformance).map(([label, data]) => ({
    label,
    value: data.count > 0 ? (data.yield / data.count) : 0,
    count: data.count
  })).sort((a, b) => monthNames.indexOf(a.label) - monthNames.indexOf(b.label));

  return {
    heatmapData: weeks,
    monthLabels: labels,
    monthlyStats,
    stats: {
      avgYield,
      consistency,
      bestMonth,
      trend: consistency > 98 ? 'stable' : 'up' // Simple logic for mock
    }
  };
};

export const filterDercs = (
  dercs: DercEntry[],
  year: string,
  month: string,
  quality: 'all' | 'top' | 'quarantine',
  decodeADN: (lote: string) => any
) => {
  return dercs.filter(d => {
    const parts = d.date.split('/');
    if (parts.length < 3) return true;
    const m = parts[1];
    const fullYear = '20' + parts[2];

    const yearMatch = year === 'all' || fullYear === year;
    const monthMatch = month === 'all' || m === month;

    let qualityMatch = true;
    if (quality === 'top') {
      const totalSalida = d.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
      const totalEntrada = d.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
      const yieldVal = totalEntrada > 0 ? (totalSalida / totalEntrada) * 100 : 0;
      qualityMatch = yieldVal >= 99;
    } else if (quality === 'quarantine') {
      qualityMatch = !decodeADN(d.lote).isValid;
    }

    return yearMatch && monthMatch && qualityMatch;
  });
};


import { ShrimpRecord } from '../../../types';

export const SHRIMP_TALLAS_DEFAULT = ['8-12', '13-15', '16-20', '21-25', '26-30', '31-40', '41-60', 'BROKEN'];

export const calculateShrimpTotals = (records: ShrimpRecord[], mp: number) => {
  const tOff = records.reduce((acc, r) => acc + (Number(r.tailOff) || 0), 0);
  const ezP = records.reduce((acc, r) => acc + (Number(r.ezPeel) || 0), 0);
  const tOn = records.reduce((acc, r) => acc + (Number(r.tailOn) || 0), 0);
  const final = tOff + ezP + tOn;
  const yieldPct = mp > 0 ? (final / mp) * 100 : 0;

  return { tOff, ezP, tOn, final, yieldPct };
};

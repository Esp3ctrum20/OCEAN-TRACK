
import { useState, useMemo, useEffect, useRef } from 'react';
import { DercEntry, PresentationType, TallaRecord } from '../../../types';
import { lotEngine } from '../../../core/lotEngine';

export const useWorkspaceState = (
  dercs: DercEntry[],
  dockedIds: string[],
  setDockedIds: (ids: string[] | ((prev: string[]) => string[])) => void,
  operationalDate: string
) => {
  const [radarType, setRadarType] = useState<PresentationType | 'ALL'>('ALL');
  const [radarTalla, setRadarTalla] = useState<string>('ALL');
  const [lastClearedIds, setLastClearedIds] = useState<string[]>([]);
  const hasAutoDocked = useRef(false);

  // CÁLCULO DE LOTES PENDIENTES DE HOY
  const pendingTodayLots = useMemo(() => {
    return dercs.filter(d =>
      d.date === operationalDate &&
      !d.deletedAt &&
      !dockedIds.includes(d.id)
    );
  }, [dercs, operationalDate, dockedIds]);

  const handleDockToday = () => {
    const idsToDock = pendingTodayLots.map(d => d.id);
    if (idsToDock.length > 0) {
      setDockedIds(prev => [...prev, ...idsToDock]);
    }
  };

  const dockedLotes = useMemo(() => {
    const unsorted = dockedIds.map(id => dercs.find(d => d.id === id)).filter((d): d is DercEntry => !!d);
    return unsorted.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      const seqA = parseInt(a.dercId.match(/\d+/)?.[0] || '0');
      const seqB = parseInt(b.dercId.match(/\d+/)?.[0] || '0');
      return seqA !== seqB ? seqA - seqB : a.lote.localeCompare(b.lote);
    });
  }, [dockedIds, dercs]);

  const totalPendingInRadar = useMemo(() => {
    if (radarTalla === 'ALL' && radarType === 'ALL') return 0;
    return dockedLotes.reduce((acc, lot) => {
      return acc + lot.presentations.reduce((pAcc, p) => {
        if (radarType !== 'ALL' && p.type !== radarType) return pAcc;
        return pAcc + p.records.reduce((rAcc, r) => {
          if (radarTalla !== 'ALL' && r.talla !== radarTalla) return rAcc;
          return rAcc + (r.cajasP > 0 ? r.cajasP : 0);
        }, 0);
      }, 0);
    }, 0);
  }, [dockedLotes, radarType, radarTalla]);

  const availableTallas = useMemo(() => {
    const tallas = new Set<string>();
    dockedLotes.forEach(l => {
      l.presentations.forEach(p => {
        if (radarType === 'ALL' || p.type === radarType) {
          p.records.forEach(r => tallas.add(r.talla));
        }
      });
    });
    return Array.from(tallas).sort((a, b) => {
      const [a1, a2] = lotEngine.getTallaPriority(a);
      const [b1, b2] = lotEngine.getTallaPriority(b);
      return a1 !== b1 ? a1 - b1 : a2 - b2;
    });
  }, [dockedLotes, radarType]);

  const handleClearMesa = () => {
    setLastClearedIds([...dockedIds]);
    setDockedIds([]);
  };

  const handleRestoreSession = () => {
    if (lastClearedIds.length > 0) {
      setDockedIds(lastClearedIds);
      setLastClearedIds([]);
    }
  };

  return {
    radarType, setRadarType,
    radarTalla, setRadarTalla,
    dockedLotes,
    totalPendingInRadar,
    availableTallas,
    isFilterActive: radarType !== 'ALL' || radarTalla !== 'ALL',
    handleClearMesa,
    handleRestoreSession,
    canRestore: lastClearedIds.length > 0,
    pendingTodayLots,
    handleDockToday
  };
};

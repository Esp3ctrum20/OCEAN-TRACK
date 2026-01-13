
import React, { useMemo } from 'react';
import { DercEntry, PresentationType, TallaRecord, EventSeverity, AppTheme } from '../../../types';
import { BlockEditor } from '../editor/BlockEditor';
import { lotEngine } from '../../../core/lotEngine';
import { WorkspaceLotHeader } from './WorkspaceLotHeader';
import { LayoutPanelTop, Layers } from 'lucide-react';

interface WorkspaceLotColumnProps {
  derc: DercEntry;
  index: number;
  radarFilter?: { type: PresentationType | 'ALL'; talla: string };
  onRemove: (id: string) => void;
  onUpdate: (updated: DercEntry) => void;
  onRecordChange: (dercId: string, pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => void;
  onLogEvent: (message: string, severity?: EventSeverity, type?: string, lotName?: string) => void;
  onShowSnap: (id: string) => void;
  onEditLot: (id: string) => void;
  theme?: AppTheme;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const WorkspaceLotColumn: React.FC<WorkspaceLotColumnProps> = ({
  derc, index, radarFilter = { type: 'ALL', talla: 'ALL' }, onRemove, onUpdate, onRecordChange, onLogEvent, onShowSnap, theme, onEditLot, showHints, shortcuts
}) => {
  const isLight = theme === 'pearl';

  const yieldPct = useMemo(() => {
    const input = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    const output = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    return input > 0 ? (output / input) * 100 : 0;
  }, [derc]);

  const radarMatchStats = useMemo(() => {
    if (radarFilter.type === 'ALL' && radarFilter.talla === 'ALL') return null;
    let totalKgMatch = 0, pendingBoxes = 0;
    derc.presentations.forEach(p => {
      if (radarFilter.type === 'ALL' || p.type === radarFilter.type) {
        p.records.forEach(r => {
          if (radarFilter.talla === 'ALL' || r.talla === radarFilter.talla) {
            totalKgMatch += r.cant;
            if (r.cajasP > 0) pendingBoxes += r.cajasP;
          }
        });
      }
    });
    return { totalKgMatch, pendingBoxes, countMatch: 0 };
  }, [derc, radarFilter]);

  const prioritizedPresentations = useMemo(() => {
    const list = [...derc.presentations];
    if (radarFilter.type !== 'ALL') return list.sort((a, b) => a.type === radarFilter.type ? -1 : 1);
    return list.sort((a, b) => {
      const getP = (t: string) => (t === 'Tallo Coral' || t === 'Media Valva') ? 0 : 1;
      return getP(a.type) - getP(b.type);
    });
  }, [derc.presentations, radarFilter.type]);

  const addBlock = (type: PresentationType) => {
    const newDerc = JSON.parse(JSON.stringify(derc));
    const ghost = derc.ghostPresentations?.find(p => p.type === type);
    if (ghost) {
      newDerc.presentations.push(ghost);
      newDerc.ghostPresentations = newDerc.ghostPresentations.filter((p: any) => p.type !== type);
    } else {
      newDerc.presentations.push({
        type,
        total: 0,
        factor: type === 'Tallo Solo' ? 5 : 10,
        records: []
      });
    }
    onUpdate(lotEngine.syncLote(newDerc));
    onLogEvent(`Bloque ${type} re-inyectado.`, 'SUCCESS', 'ALTA', derc.lote);
  };

  const hasPrincipal = derc.presentations.some(p => p.type === 'Tallo Coral' || p.type === 'Media Valva');
  const hasSolo = derc.presentations.some(p => p.type === 'Tallo Solo');

  const activeWeightFactor = useMemo(() => {
    const p = derc.presentations.find(p => p.type === 'Tallo Coral') || derc.presentations.find(p => p.type === 'Media Valva') || derc.presentations[0];
    return p?.factor;
  }, [derc.presentations]);

  let currentRowOffset = 0;

  return (
    <div id={`lot-column-${derc.id}`} className={`flex-shrink-0 w-[360px] flex flex-col border-r snap-start transition-all duration-700 relative ${isLight ? 'border-zinc-200' : 'border-zinc-900/80'} ${radarFilter.type !== 'ALL' && radarMatchStats?.pendingBoxes === 0 ? 'opacity-20 blur-[2px] grayscale scale-[0.98]' : ''}`}>
      <WorkspaceLotHeader
        lote={derc.lote}
        dercId={derc.dercId}
        productionDate={derc.date} // Pasamos la fecha real del lote
        index={index}
        yieldPct={yieldPct}
        weightFactor={activeWeightFactor}
        onRemove={() => onRemove(derc.id)}
        onSnap={() => onShowSnap(derc.id)}
        onEdit={() => onEditLot(derc.id)}
        radarStats={radarMatchStats}
        theme={theme}
        showHints={showHints}
        shortcuts={shortcuts}
      />

      <div className={`flex-1 overflow-y-auto custom-scrollbar transition-colors ${isLight ? 'bg-white' : 'bg-[#050506]/60'}`}>
        <div className={`p-3 flex flex-col ${radarFilter.type !== 'ALL' ? 'gap-2 pt-1' : 'gap-4 pt-3'} pb-40`}>

          {prioritizedPresentations.map((p) => {
            const startIdx = currentRowOffset;
            currentRowOffset += p.records.length;

            return (
              <BlockEditor
                key={p.type}
                presentation={p}
                radarFilter={radarFilter}
                lotIdx={index}
                startRowIdx={startIdx}
                onUpdateRecord={(rid, f, v) => onRecordChange(derc.id, p.type, rid, f, v)}
                onTypeChange={(newType) => {
                  const newDerc = JSON.parse(JSON.stringify(derc));
                  const pIdx = newDerc.presentations.findIndex((p: any) => p.type === p.type);
                  if (pIdx !== -1) { newDerc.presentations[pIdx].type = newType; onUpdate(lotEngine.syncLote(newDerc)); }
                }}
                onDeleteBlock={() => {
                  const newDerc = JSON.parse(JSON.stringify(derc));
                  if (!newDerc.ghostPresentations) newDerc.ghostPresentations = [];
                  newDerc.ghostPresentations.push(p);
                  newDerc.presentations = newDerc.presentations.filter((px: any) => px.type !== p.type);
                  onUpdate(lotEngine.syncLote(newDerc));
                }}
                onAddTalla={() => {
                  const newDerc = JSON.parse(JSON.stringify(derc));
                  const pIdx = newDerc.presentations.findIndex((px: any) => px.type === p.type);
                  if (pIdx !== -1) {
                    newDerc.presentations[pIdx].records.push({ id: Math.random().toString(36).substr(2, 9), talla: lotEngine.predictNextTalla(p.records), cant: 0, cajasT: 0, entreg: 0, cajasP: 0, kilosT: 0, saldo: 0 });
                    onUpdate(lotEngine.syncLote(newDerc));
                  }
                }}
                onDeleteTalla={(rid) => {
                  const newDerc = JSON.parse(JSON.stringify(derc));
                  const pIdx = newDerc.presentations.findIndex((px: any) => px.type === p.type);
                  if (pIdx !== -1) {
                    newDerc.presentations[pIdx].records = newDerc.presentations[pIdx].records.filter((r: any) => r.id !== rid);
                    onUpdate(lotEngine.syncLote(newDerc));
                  }
                }}
                theme={theme}
              />
            );
          })}

          {!radarFilter.type || radarFilter.type === 'ALL' ? (
            <div className="flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {!hasPrincipal && (
                <button
                  onClick={() => addBlock('Tallo Coral')}
                  className={`w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-all group ${isLight ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400' : 'bg-emerald-500/[0.03] border-emerald-500/20 hover:bg-emerald-500/[0.06] hover:border-emerald-500/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutPanelTop className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-500'} group-hover:scale-110 transition-transform`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Añadir Bloque Principal</span>
                  </div>
                  <p className={`text-[7px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Tallo Coral / Media Valva</p>
                </button>
              )}
              {!hasSolo && (
                <button
                  onClick={() => addBlock('Tallo Solo')}
                  className={`w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-all group ${isLight ? 'bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400' : 'bg-indigo-500/[0.03] border-indigo-500/20 hover:bg-indigo-500/[0.06] hover:border-indigo-500/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-500'} group-hover:scale-110 transition-transform`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>Añadir Bloque Solo</span>
                  </div>
                  <p className={`text-[7px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Sub-producto</p>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo, useEffect } from 'react';
import { DercEntry, TallaRecord, PresentationType, AppTheme } from '../../types';
import { HelpCircle, Plus } from 'lucide-react';
import { parseMassInput } from '../../core/importer';
import { lotEngine } from '../../core/lotEngine';
import ShareCardModal from '../export/ShareCardModal';
import { PresentationTable } from './ui/PresentationTable';
import { DercKpis } from './layout/DercKpis';

interface Props {
  derc: DercEntry;
  history: DercEntry[]; 
  globalFactors: Record<PresentationType, number>;
  onUpdate: (updatedDerc: DercEntry) => void;
  onDelete: (id: string) => void;
  // Added theme property to Props to resolve TS error in App.tsx
  theme?: AppTheme;
}

const DercDetailView: React.FC<Props> = ({ derc, history, globalFactors, onUpdate, onDelete, theme }) => {
  const [showConfirmDeleteDerc, setShowConfirmDeleteDerc] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 800);
    return () => clearTimeout(timer);
  }, [derc.totalConcha]);

  const handleRecordChange = (pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => {
    const newDerc = JSON.parse(JSON.stringify(derc));
    const pIdx = newDerc.presentations.findIndex((p: any) => p.type === pType);
    if (pIdx === -1) return;
    const rIdx = newDerc.presentations[pIdx].records.findIndex((r: any) => r.id === rowId);
    if (rIdx === -1) return;

    newDerc.presentations[pIdx].records[rIdx][field] = value;
    onUpdate(lotEngine.syncLote(newDerc));
  };

  const handleFactorChange = (type: PresentationType, val: number) => {
    const newDerc = JSON.parse(JSON.stringify(derc));
    const pIdx = newDerc.presentations.findIndex((px: any) => px.type === type);
    if (pIdx === -1) return;
    newDerc.presentations[pIdx].factor = Math.max(0.1, val);
    onUpdate(lotEngine.syncLote(newDerc));
  };

  const handleTypeChange = (oldType: PresentationType, newType: PresentationType) => {
    const newDerc = JSON.parse(JSON.stringify(derc));
    const pIdx = newDerc.presentations.findIndex((px: any) => px.type === oldType);
    if (pIdx === -1) return;
    
    newDerc.presentations[pIdx].type = newType;
    newDerc.presentations[pIdx].factor = globalFactors[newType] || 10;
    
    onUpdate(lotEngine.syncLote(newDerc));
  };

  const adnInfo = useMemo(() => lotEngine.decodeADN(derc.lote), [derc.lote]);
  const recepcionFinal = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rAcc, r) => rAcc + r.cant, 0), 0);
  const totalEntregado = derc.presentations.reduce((acc, p) => acc + p.records.reduce((rAcc, r) => rAcc + r.kilosT, 0), 0);
  const yieldPercent = recepcionFinal > 0 ? (totalEntregado / recepcionFinal) * 100 : 0;

  // Ordenamos presentaciones: Principal primero, Solo después.
  const sortedPresentations = useMemo(() => {
    return [...derc.presentations].sort((a, b) => {
      const isAPrincipal = a.type === 'Tallo Coral' || a.type === 'Media Valva';
      const isBPrincipal = b.type === 'Tallo Coral' || b.type === 'Media Valva';
      if (isAPrincipal && !isBPrincipal) return -1;
      if (!isAPrincipal && isBPrincipal) return 1;
      return 0;
    });
  }, [derc.presentations]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto pb-16">
      <ShareCardModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} derc={derc} totalKg={totalEntregado} yieldPct={yieldPercent} />

      {!adnInfo.isValid && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-[2rem] flex items-center gap-5 animate-in slide-in-from-top-4 duration-500">
           <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
             <HelpCircle className="w-6 h-6 text-amber-500" />
           </div>
           <div className="flex-1">
             <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Identidad Desconocida</h4>
             <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">Este lote tiene un formato desconocido. Los datos se procesarán de forma estandarizada.</p>
           </div>
        </div>
      )}

      <DercKpis 
        recepcionFinal={recepcionFinal} totalEntregado={totalEntregado} yieldPercent={yieldPercent} 
        isPulsing={isPulsing} derc={derc} history={history} onShowShare={() => setIsShareModalOpen(true)}
        onDeleteRequest={() => setShowConfirmDeleteDerc(true)} showConfirmDelete={showConfirmDeleteDerc}
        onConfirmDelete={() => onDelete(derc.id)} onCancelDelete={() => setShowConfirmDeleteDerc(false)}
      />

      <div className="space-y-12">
        {sortedPresentations.map((p) => (
          <PresentationTable 
            key={p.type} presentation={p} ghostRecords={derc.ghostRecords?.[p.type] || []}
            onRecordChange={handleRecordChange} onTypeChange={handleTypeChange} onFactorChange={handleFactorChange}
            onMassImport={(text, resetProduction) => {
               const newDerc = JSON.parse(JSON.stringify(derc));
               const pIdx = newDerc.presentations.findIndex((px: any) => px.type === p.type);
               newDerc.presentations[pIdx].records = parseMassInput(text, p.factor, resetProduction).map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9) }));
               onUpdate(lotEngine.syncLote(newDerc));
            }}
            onDeletePresentation={(type) => {
               const newDerc = JSON.parse(JSON.stringify(derc));
               const pres = newDerc.presentations.find((px: any) => px.type === type);
               if (!pres) return;
               
               if (pres.records.some(r => lotEngine.hasDataFootprint(r))) {
                 if (!newDerc.ghostPresentations) newDerc.ghostPresentations = [];
                 newDerc.ghostPresentations.push(pres);
               }
               
               newDerc.presentations = newDerc.presentations.filter((px: any) => px.type !== type);
               onUpdate(lotEngine.syncLote(newDerc));
            }}
            onAddTalla={(type) => {
               const newDerc = JSON.parse(JSON.stringify(derc));
               const pIdx = newDerc.presentations.findIndex((px: any) => px.type === type);
               newDerc.presentations[pIdx].records.push({ id: Math.random().toString(36).substr(2, 9), talla: 'NUEVA', cant: 0, cajasT: 0, entreg: 0, cajasP: 0, kilosT: 0, saldo: 0 });
               onUpdate(lotEngine.syncLote(newDerc));
            }}
            onDeleteTalla={(type, rowId) => {
               const newDerc = JSON.parse(JSON.stringify(derc));
               const pIdx = newDerc.presentations.findIndex((px: any) => px.type === type);
               if (pIdx === -1) return;
               const rIdx = newDerc.presentations[pIdx].records.findIndex((r: any) => r.id === rowId);
               if (rIdx === -1) return;
               const record = newDerc.presentations[pIdx].records[rIdx];
               if (lotEngine.hasDataFootprint(record)) {
                 if (!newDerc.ghostRecords) newDerc.ghostRecords = {};
                 if (!newDerc.ghostRecords[type]) newDerc.ghostRecords[type] = [];
                 newDerc.ghostRecords[type].push(record);
               }
               newDerc.presentations[pIdx].records.splice(rIdx, 1);
               onUpdate(lotEngine.syncLote(newDerc));
            }}
            onRestoreRecord={(type, tallaName) => {
               const newDerc = JSON.parse(JSON.stringify(derc));
               const ghosts = newDerc.ghostRecords?.[type] || [];
               const gIdx = ghosts.findIndex((g: any) => g.talla.trim().toUpperCase() === tallaName.trim().toUpperCase());
               if (gIdx === -1) return;
               const pIdx = newDerc.presentations.findIndex((px: any) => px.type === type);
               const rIdx = newDerc.presentations[pIdx].records.findIndex((r: any) => r.talla.trim().toUpperCase() === tallaName.trim().toUpperCase());
               if (rIdx !== -1) {
                 newDerc.presentations[pIdx].records[rIdx] = { ...ghosts[gIdx], id: newDerc.presentations[pIdx].records[rIdx].id };
                 newDerc.ghostRecords[type].splice(gIdx, 1);
                 onUpdate(lotEngine.syncLote(newDerc));
               }
            }}
          />
        ))}

        <div className="flex gap-8">
          {!derc.presentations.some(p => p.type === 'Tallo Coral' || p.type === 'Media Valva') && (
            <button 
              onClick={() => {
                const ghost = derc.ghostPresentations?.find(p => p.type === 'Tallo Coral' || p.type === 'Media Valva');
                const newDerc = JSON.parse(JSON.stringify(derc));
                if (ghost) { newDerc.presentations.push(ghost); newDerc.ghostPresentations = newDerc.ghostPresentations.filter((p: any) => p.type !== ghost.type); }
                else { newDerc.presentations.push({ type: 'Tallo Coral', factor: globalFactors['Tallo Coral'], total: 0, records: [] }); }
                onUpdate(lotEngine.syncLote(newDerc));
              }}
              className="flex-1 py-12 bg-emerald-600/5 border-2 border-dashed border-emerald-500/10 rounded-[2.5rem] text-[12px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-600/10 transition-all flex flex-col items-center gap-4 group"
            >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform" /> Añadir Bloque Principal
            </button>
          )}
          {!derc.presentations.some(p => p.type === 'Tallo Solo') && (
            <button 
              onClick={() => {
                const ghost = derc.ghostPresentations?.find(p => p.type === 'Tallo Solo');
                const newDerc = JSON.parse(JSON.stringify(derc));
                if (ghost) { newDerc.presentations.push(ghost); newDerc.ghostPresentations = newDerc.ghostPresentations.filter((p: any) => p.type !== 'Tallo Solo'); }
                else { newDerc.presentations.push({ type: 'Tallo Solo', factor: globalFactors['Tallo Solo'], total: 0, records: [] }); }
                onUpdate(lotEngine.syncLote(newDerc));
              }}
              className="flex-1 py-12 bg-blue-600/5 border-2 border-dashed border-blue-500/10 rounded-[2.5rem] text-[12px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600/10 transition-all flex flex-col items-center gap-4 group"
            >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform" /> Añadir Bloque Solo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DercDetailView;

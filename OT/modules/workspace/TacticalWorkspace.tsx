import React, { useState, useCallback } from 'react';
import { DercEntry, PresentationType, TallaRecord, EventSeverity, AppTheme } from '../../types';
import { BulkLotSelector } from './layout/BulkLotSelector';
import { WorkspaceToolbar } from './layout/WorkspaceToolbar';
import { WorkspaceGrid } from './layout/WorkspaceGrid';
import { WorkspaceIntelligenceModal } from './layout/WorkspaceIntelligenceModal';
import { useWorkspaceState } from './core/useWorkspaceState';
import { lotEngine } from '../../core/lotEngine';
import ShareCardModal from '../export/ShareCardModal';
import { QuickEditLotModal } from '../../components/QuickEditLotModal';
import { useZeroMouse } from '../../core/zero-mouse/hooks/useZeroMouse';
import { CommandPalette } from './layout/CommandPalette';

interface Props {
  dercs: DercEntry[];
  onUpdateDerc: (updatedDerc: DercEntry) => void;
  onDeleteDerc: (id: string) => void;
  globalFactors: Record<PresentationType, number>;
  onUpdateGlobalConfig: (newFactors: Record<PresentationType, number>) => void;
  operationalDate: string;
  dockedIds: string[];
  setDockedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  onLogEvent: (message: string, severity?: EventSeverity, type?: string, lotName?: string) => void;
  onOpenNew: () => void;
  onOpenConfig: () => void; // Prop para compensar el Header oculto
  onOpenImport: () => void; // Prop para compensar el Header oculto
  onManualSave: () => void;
  onViewChange: (id: string) => void;
  hasUnsavedChanges: boolean;
  saveStatus: 'synced' | 'syncing' | 'error';
  theme?: AppTheme;
  onRecordChange: (dercId: string, pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => void;
  shortcuts?: Record<string, string>;
  isHeaderPinned?: boolean;
  onToggleHeader?: (val: boolean) => void;
  showHints?: boolean;
}

export const TacticalWorkspace: React.FC<Props> = ({
  dercs, onUpdateDerc, onDeleteDerc, globalFactors, onUpdateGlobalConfig, operationalDate, dockedIds, setDockedIds, onLogEvent, onOpenNew, onOpenConfig, onOpenImport, onManualSave, onViewChange, hasUnsavedChanges, saveStatus, theme,
  onRecordChange, shortcuts, isHeaderPinned = true, onToggleHeader, showHints
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [snapLotId, setSnapLotId] = useState<string | null>(null);
  const [editLotId, setEditLotId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const workspace = useWorkspaceState(dercs, dockedIds, setDockedIds, operationalDate);

  useZeroMouse({
    dockedLotes: workspace.dockedLotes,
    onManualSave,
    onViewChange,
    onLogEvent,
    shortcuts,
    onOpenImport,
    onOpenConfig,
    onOpenIntelligence: () => setIsIntelligenceOpen(true),
    onOpenSelector: () => setShowSelector(true),
    onClearMesa: () => { workspace.handleClearMesa(); onLogEvent('Mesa liberada. Unidades devueltas al Hangar.', 'WARNING', 'CLEAN'); },
    onOpenNew,
    onToggleHeader: () => onToggleHeader?.(!isHeaderPinned),
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true)
  });

  const handleDocking = (ids: string[]) => {
    setDockedIds(prev => {
      const uniqueNewIds = ids.filter(id => !prev.includes(id));
      return [...prev, ...uniqueNewIds];
    });
    setShowSelector(false);
    onLogEvent(`${ids.length} bloques lanzados a pista.`, 'SUCCESS', 'ALTA');
  };

  const handleUpdateFactor = useCallback((type: PresentationType, newValue: number) => {
    const updatedFactors = { ...globalFactors, [type]: newValue };
    onUpdateGlobalConfig(updatedFactors);

    // Registro en Caja Fuerte
    onLogEvent(`Calibración Balanza: ${type} ajustado a ${newValue}kg.`, 'INFO', 'SISTEMA');

    dockedIds.forEach(id => {
      const target = dercs.find(d => d.id === id);
      if (target) {
        const updatedDerc = JSON.parse(JSON.stringify(target));
        const presentation = updatedDerc.presentations.find((p: any) => p.type === type);
        if (presentation) {
          presentation.factor = newValue;
          onUpdateDerc(lotEngine.syncLote(updatedDerc));
        }
      }
    });
  }, [dockedIds, dercs, globalFactors, onUpdateGlobalConfig, onUpdateDerc, onLogEvent]);

  const handleConfirmQuickEdit = (updatedLote: string, updatedDercId: string, updatedDate: string) => {
    if (!editLotId) return;
    const target = dercs.find(d => d.id === editLotId);
    if (target) {
      const updatedDerc = { ...target, lote: updatedLote, dercId: updatedDercId, date: updatedDate };
      onUpdateDerc(lotEngine.syncLote(updatedDerc));

      const identityChanged = target.lote !== updatedLote;
      const identityDercChanged = target.dercId !== updatedDercId;
      const dateChanged = target.date !== updatedDate;

      if (dateChanged) {
        onLogEvent(`Alteración Cronológica: Lote ${target.lote} reubicado a ${updatedDate}.`, 'WARNING', 'ESTRUCTURA', updatedLote);
      } else if (identityChanged || identityDercChanged) {
        onLogEvent(`Identidad Actualizada: ${target.lote} → ${updatedLote}`, 'INFO', 'ESTRUCTURA', updatedLote);
      }
    }
    setEditLotId(null);
  };

  const handleManualSave = useCallback(() => {
    onManualSave();
  }, [onManualSave]);

  return (
    <div className={`h-full flex flex-col animate-in fade-in duration-300 overflow-hidden ${theme === 'pearl' ? 'bg-zinc-100' : 'bg-[#050506]'}`}>
      <div
        className={`relative transition-all duration-500 ease-in-out z-50 ${isHeaderPinned ? 'max-h-[500px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden hover:max-h-[500px] hover:opacity-100 hover:overflow-visible'}`}
      >
        {!isHeaderPinned && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-indigo-600/20 rounded-b-full cursor-pointer hover:bg-indigo-600/40 transition-colors z-50 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-white/20 rounded-full" />
          </div>
        )}
        <WorkspaceToolbar
          dockedLotes={workspace.dockedLotes}
          radarType={workspace.radarType} setRadarType={workspace.setRadarType}
          radarTalla={workspace.radarTalla} setRadarTalla={workspace.setRadarTalla}
          availableTallas={workspace.availableTallas}
          totalPendingInRadar={workspace.totalPendingInRadar}
          globalFactors={globalFactors}
          onUpdateFactor={handleUpdateFactor}
          onOpenIntelligence={() => setIsIntelligenceOpen(true)}
          onOpenSelector={() => setShowSelector(true)}
          onOpenConfig={onOpenConfig}
          onOpenImport={onOpenImport}
          onClearMesa={() => { workspace.handleClearMesa(); onLogEvent('Mesa liberada. Unidades devueltas al Hangar.', 'WARNING', 'CLEAN'); }}
          onManualSave={onManualSave}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          hasUnsavedChanges={hasUnsavedChanges}
          saveStatus={saveStatus}
          onJump={(id) => document.getElementById(`lot-column-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
          onLogEvent={onLogEvent}
          theme={theme}
          isPinned={isHeaderPinned}
          onTogglePin={() => onToggleHeader?.(!isHeaderPinned)}
          showHints={showHints}
          shortcuts={shortcuts}
          pendingTodayLotsCount={workspace.pendingTodayLots.length}
          onDockTodayLots={workspace.handleDockToday}
        />
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        dockedLotes={workspace.dockedLotes}
        onSelectLot={(id) => document.getElementById(`lot-column-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
        theme={theme}
      />

      <WorkspaceGrid
        dockedLotes={workspace.dockedLotes}
        radarType={workspace.radarType} radarTalla={workspace.radarTalla}
        onUpdateDerc={onUpdateDerc}
        onRemoveFromDock={(id) => setDockedIds(prev => prev.filter(i => i !== id))}
        onLogEvent={onLogEvent} onOpenSelector={() => setShowSelector(true)} onOpenNew={onOpenNew}
        onRestoreSession={workspace.handleRestoreSession} onShowSnap={(id) => setSnapLotId(id)}
        onManualSave={onManualSave}
        onViewChange={onViewChange}
        canRestore={workspace.canRestore} theme={theme}
        onRecordChange={(did, pt, rid, f, v) => onRecordChange(did, pt, rid, f, v)}
        onEditLot={(id) => setEditLotId(id)}
        shortcuts={shortcuts}
        onOpenConfig={onOpenConfig}
        onOpenImport={onOpenImport}
        onOpenIntelligence={() => setIsIntelligenceOpen(true)}
        onClearMesa={() => { workspace.handleClearMesa(); onLogEvent('Mesa liberada. Unidades devueltas al Hangar.', 'WARNING', 'CLEAN'); }}
        onToggleHeader={() => onToggleHeader?.(!isHeaderPinned)}
        showHints={showHints}
      />

      <BulkLotSelector isOpen={showSelector} onClose={() => setShowSelector(false)} availableLots={dercs.filter(d => !d.deletedAt).map(d => ({ ...d, isDocked: dockedIds.includes(d.id) }))} operationalDate={operationalDate} onConfirm={handleDocking} onPermanentDelete={onDeleteDerc} theme={theme} />
      <WorkspaceIntelligenceModal isOpen={isIntelligenceOpen} onClose={() => setIsIntelligenceOpen(false)} dockedLotes={workspace.dockedLotes} theme={theme} />
      {snapLotId && <ShareCardModal isOpen={!!snapLotId} onClose={() => setSnapLotId(null)} derc={dercs.find(d => d.id === snapLotId)} totalKg={0} yieldPct={0} />}

      {editLotId && (
        <QuickEditLotModal
          isOpen={!!editLotId}
          onClose={() => setEditLotId(null)}
          derc={dercs.find(d => d.id === editLotId)!}
          onConfirm={handleConfirmQuickEdit}
          existingDercs={dercs}
          theme={theme}
        />
      )}
    </div>
  );
};
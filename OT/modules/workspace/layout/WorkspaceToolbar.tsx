import React, { useMemo } from 'react';
import { WorkspaceControlCenter } from './WorkspaceControlCenter';
import { WorkspaceJumpBar } from './WorkspaceJumpBar';
import { DercEntry, PresentationType, EventSeverity, AppTheme } from '../../../types';

interface Props {
  dockedLotes: DercEntry[];
  radarType: PresentationType | 'ALL';
  setRadarType: (t: PresentationType | 'ALL') => void;
  radarTalla: string;
  setRadarTalla: (t: string) => void;
  availableTallas: string[];
  totalPendingInRadar: number;
  globalFactors: Record<PresentationType, number>;
  onUpdateFactor: (type: PresentationType, val: number) => void;
  onOpenIntelligence: () => void;
  onOpenSelector: () => void;
  onOpenConfig: () => void;
  onOpenImport: () => void;
  onClearMesa: () => void;
  onManualSave: () => void;
  onOpenCommandPalette: () => void;
  hasUnsavedChanges: boolean;
  saveStatus: 'synced' | 'syncing' | 'error';
  onJump: (id: string) => void;
  onLogEvent: (message: string, severity?: EventSeverity, type?: string, lotName?: string) => void;
  theme?: AppTheme;
  isPinned?: boolean;
  onTogglePin?: () => void;
  showHints?: boolean;
  shortcuts?: Record<string, string>;
}

export const WorkspaceToolbar: React.FC<Props> = ({
  dockedLotes, radarType, setRadarType, radarTalla, setRadarTalla, availableTallas,
  totalPendingInRadar, globalFactors, onUpdateFactor, onOpenIntelligence, onOpenSelector, onOpenConfig, onOpenImport, onClearMesa,
  onManualSave, onOpenCommandPalette, hasUnsavedChanges, saveStatus, onJump, onLogEvent, theme,
  isPinned, onTogglePin, showHints, shortcuts
}) => {
  const isLight = theme === 'pearl';

  const filteredDockedLotes = useMemo(() => {
    if (radarType === 'ALL' && radarTalla === 'ALL') return dockedLotes;
    return dockedLotes.filter(l => {
      return l.presentations.some(p => {
        const typeMatch = radarType === 'ALL' || p.type === radarType;
        if (!typeMatch) return false;
        if (radarTalla === 'ALL') return true;
        return p.records.some(r => r.talla === radarTalla);
      });
    });
  }, [dockedLotes, radarType, radarTalla]);

  return (
    <div className={`flex flex-col border-b z-50 transition-colors duration-300 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950/40 border-zinc-800/60'}`}>
      <WorkspaceControlCenter
        dockedCount={dockedLotes.length}
        radarType={radarType} setRadarType={setRadarType}
        radarTalla={radarTalla} setRadarTalla={setRadarTalla}
        availableTallas={availableTallas}
        isFilterActive={radarType !== 'ALL' || radarTalla !== 'ALL'}
        factors={globalFactors}
        onUpdateFactor={onUpdateFactor}
        onOpenIntelligence={onOpenIntelligence}
        onOpenSelector={onOpenSelector}
        onOpenConfig={onOpenConfig}
        onOpenImport={onOpenImport}
        onClearMesa={onClearMesa}
        onManualSave={onManualSave}
        onOpenCommandPalette={onOpenCommandPalette}
        hasUnsavedChanges={hasUnsavedChanges}
        saveStatus={saveStatus}
        totalPendingInRadar={totalPendingInRadar}
        theme={theme}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        showHints={showHints}
        shortcuts={shortcuts}
      />
      <div data-nav-region="jump-bar">
        <WorkspaceJumpBar dockedLotes={filteredDockedLotes} onJump={onJump} theme={theme} />
      </div>
    </div>
  );
};
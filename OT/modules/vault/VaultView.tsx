
import React, { useState, useMemo } from 'react';
import { DercEntry, AppTheme } from '../../types';
import { HistoricalTimeline } from './layout/HistoricalTimeline';
import { lotEngine } from '../../core/lotEngine';
import { QuickViewModal } from './layout/QuickViewModal';

// Modulos Nucleares
import { filterDercs } from './core/vaultLogic';
import { HeatmapWidget } from './layout/HeatmapWidget';
import { VaultControls } from './layout/VaultControls';
import { SelectionBar } from './layout/SelectionBar';

interface Props {
  dercs: DercEntry[];
  onGoToDerc: (id: string) => void;
  onDeleteDerc: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onClearAll: () => void;
  onSeedData?: () => void;
  onDockLot?: (id: string) => void; // Nueva prop
  theme?: AppTheme;
}

const VaultView: React.FC<Props> = ({ dercs, onGoToDerc, onDeleteDerc, onDeleteMultiple, onClearAll, onSeedData, onDockLot, theme }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'top' | 'quarantine'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'virtual'>('tree');
  const [inspectingDercId, setInspectingDercId] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const isLight = theme === 'pearl';

  const monthNames: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril', '05': 'Mayo', '06': 'Junio',
    '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    dercs.forEach(d => {
      const parts = d.date.split('/');
      if (parts.length === 3) {
        years.add('20' + parts[2]);
        months.add(parts[1]);
      }
    });
    return {
      availableYears: Array.from(years).sort((a, b) => b.localeCompare(a)).map(y => ({ value: y, label: y })),
      availableMonths: Array.from(months).sort((a, b) => a.localeCompare(b)).map(m => ({ value: m, label: monthNames[m] || m }))
    };
  }, [dercs]);

  const filteredDercs = useMemo(() => 
    filterDercs(dercs, filterYear, filterMonth, qualityFilter, lotEngine.decodeADN), 
  [dercs, filterYear, filterMonth, qualityFilter]);

  const inspectingDerc = useMemo(() => dercs.find(d => d.id === inspectingDercId) || null, [dercs, inspectingDercId]);
  const referenceDerc = useMemo(() => dercs.find(d => d.id === referenceId) || null, [dercs, referenceId]);
  const referenceYield = useMemo(() => {
    if (!referenceDerc) return undefined;
    const salida = referenceDerc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0);
    const entrada = referenceDerc.presentations.reduce((acc, p) => acc + p.records.reduce((rA, r) => rA + r.cant, 0), 0);
    return entrada > 0 ? (salida / entrada) * 100 : 0;
  }, [referenceDerc]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-32">
      <QuickViewModal 
        isOpen={!!inspectingDercId} 
        onClose={() => setInspectingDercId(null)} 
        derc={inspectingDerc} 
        referenceDerc={referenceDerc} 
        onEditInMesa={onDockLot} // Inyectamos la acción de acople
        theme={theme} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VaultControls 
            dercsCount={filteredDercs.length}
            filterYear={filterYear} setFilterYear={setFilterYear} availableYears={availableYears}
            filterMonth={filterMonth} setFilterMonth={setFilterMonth} availableMonths={availableMonths}
            qualityFilter={qualityFilter} setQualityFilter={setQualityFilter}
            viewMode={viewMode} setViewMode={setViewMode}
            onSeedData={onSeedData}
            onClearAll={onClearAll}
            onReset={() => { setSelectedIds(new Set()); setFilterYear('all'); setFilterMonth('all'); setQualityFilter('all'); setReferenceId(null); }}
            theme={theme}
          />
        </div>
        <HeatmapWidget dercs={dercs} onOpenDossier={setInspectingDercId} theme={theme} />
      </div>

      <div className="px-4">
        <HistoricalTimeline 
          dercs={filteredDercs} 
          onSelectDate={() => {}} 
          selectionMode={true}
          selectedIds={selectedIds}
          onToggleSelect={(id) => {
            const newSelection = new Set(selectedIds);
            if (newSelection.has(id)) newSelection.delete(id);
            else newSelection.add(id);
            setSelectedIds(newSelection);
          }}
          onDeleteDerc={onDeleteDerc}
          onDeleteMultiple={onDeleteMultiple}
          onQuickView={(id) => setInspectingDercId(id)}
          referenceId={referenceId}
          setReferenceId={setReferenceId}
          referenceYield={referenceYield}
          isVirtual={viewMode === 'virtual'}
          theme={theme}
        />
      </div>

      <SelectionBar selectedIds={selectedIds} dercs={dercs} onClear={() => setSelectedIds(new Set())} theme={theme} />
    </div>
  );
};

export default VaultView;

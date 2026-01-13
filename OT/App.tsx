import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Zap, History, Activity } from 'lucide-react';
import { MOCK_DERCS } from './constants';
import { DercEntry, AppMode, GlobalConfig, WorkspaceEvent, EventSeverity, AppTheme, PresentationType, TallaRecord } from './types';
import DercDetailView from './modules/scallop/DercDetailView';
import DashboardView from './modules/dashboard/DashboardView';
import { TacticalWorkspace } from './modules/workspace/TacticalWorkspace';
import VaultView from './modules/vault/VaultView';
import TrashView from './modules/trash/TrashView';
import FulfillmentView from './modules/fulfillment/FulfillmentView';
import NewDercModal from './components/NewDercModal';
import RenameLoteModal from './components/RenameLoteModal';
import SmartImportModal from './components/SmartImportModal';
import BackupModal from './components/BackupModal';
import ConfigModal from './modules/config/ConfigModal';
import NuclearConfirmModal from './components/NuclearConfirmModal';
import { StorageService } from './core/storage';
import { ShrimpView } from './modules/shrimp/ShrimpView';
import { lotEngine } from './core/lotEngine';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { useGhostHints } from './core/zero-mouse/hooks/useGhostHints';

// ... (config initialization)
import { EventLoggerDrawer } from './modules/workspace/layout/EventLoggerDrawer';

type ViewMode = 'summary' | 'workspace' | 'vault' | 'trash' | 'fulfillment' | string;

const STORAGE_KEY = 'oceantrack_v5_data';
const CONFIG_KEY = 'oceantrack_v5_config';
const EVENTS_KEY = 'oceantrack_v5_events';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('scallop');
  const [dercs, setDercs] = useState<DercEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasEmergencySnapshot, setHasEmergencySnapshot] = useState(false);

  const [selectedViewId, setSelectedViewId] = useState<ViewMode>('summary');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isNuclearOpen, setIsNuclearOpen] = useState(false);

  const [events, setEvents] = useState<WorkspaceEvent[]>([]);
  const [unreadEvents, setUnreadEvents] = useState(0);
  const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const { showHints } = useGhostHints();

  const [dockedIds, setDockedIds] = useState<string[]>([]);
  const saveEventCounter = useRef(0);

  const [config, setConfig] = useState<GlobalConfig>({
    factors: { 'Tallo Coral': 10, 'Tallo Solo': 5, 'Media Valva': 10 },
    shiftCutoffTime: '07:30',
    theme: 'obsidian',
    shortcuts: {
      OPEN_SCALE: 'B',
      OPEN_IMPORT: 'I',
      OPEN_HANGAR: 'H',
      OPEN_CONFIG: 'C',
      OPEN_INTEL: 'J',
      CLEAR_MESA: 'L',
      SAVE_ALL: 'G',
      OPEN_NEW_LOT: 'N'
    },
    isHeaderPinned: true
  });

  const operationalDateStr = useMemo(() => lotEngine.getOperationalDate(config.shiftCutoffTime), [config.shiftCutoffTime]);

  const logEvent = useCallback((message: string, severity: EventSeverity = 'INFO', type: string = 'SISTEMA', lotName?: string) => {
    setEvents(prev => {
      // Evitar spam de guardado duplicado
      const lastEvent = prev[prev.length - 1];
      if (type === 'GUARDADO' && lastEvent?.type === 'GUARDADO') {
        return prev;
      }

      const newEvent: WorkspaceEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        message,
        severity,
        type: type.toUpperCase(),
        lotName
      };
      return [...prev, newEvent].slice(-100);
    });
    setUnreadEvents(prev => prev + 1);
  }, []);

  const handleDockLot = useCallback((id: string) => {
    setDockedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setSelectedViewId('workspace');
    const lot = dercs.find(d => d.id === id);
    logEvent(`Bloque acoplado en Pista de Operaciones.`, 'SUCCESS', 'ALTA', lot?.lote);
  }, [dercs, logEvent]);

  useEffect(() => {
    const initData = async () => {
      try {
        await StorageService.init();
        const persistentData = await StorageService.load();
        const savedConfig = localStorage.getItem(CONFIG_KEY);
        if (savedConfig) setConfig(JSON.parse(savedConfig));
        if (persistentData && persistentData.length > 0) setDercs(persistentData);
        else { const saved = localStorage.getItem(STORAGE_KEY); setDercs(saved ? JSON.parse(saved) : MOCK_DERCS); }

        const savedEvents = localStorage.getItem(EVENTS_KEY);
        if (savedEvents) setEvents(JSON.parse(savedEvents));

        setHasEmergencySnapshot(!!StorageService.getEmergencySnapshot());
      } catch (e) { const saved = localStorage.getItem(STORAGE_KEY); setDercs(saved ? JSON.parse(saved) : MOCK_DERCS); }
      finally { setIsLoaded(true); }
    };
    initData();
  }, []);

  useEffect(() => { if (isLoaded) localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }, [config, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }, [events, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(async () => {
      setSaveStatus('syncing');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dercs));
        await StorageService.save(dercs);
        setSaveStatus('synced');
        setLastSaveTime(new Date());
      }
      catch (e) { setSaveStatus('error'); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [dercs, isLoaded]);

  const handleUpdateDerc = useCallback((updatedDerc: DercEntry) => {
    setDercs(prev => prev.map(d => d.id === updatedDerc.id ? updatedDerc : d));
  }, []);

  const handleConfirmNewDerc = (lote: string, fullDercId: string, productionDate: string, shouldDock: boolean) => {
    const newId = Date.now().toString();
    const defaultTallas = ['10-20', '20-30', '30-40'];
    const createRecords = () => defaultTallas.map(t => ({
      id: Math.random().toString(36).substr(2, 9),
      talla: t, cant: 0, cajasT: 0, entreg: 0, cajasP: 0, kilosT: 0, saldo: 0
    }));

    const newEntry: DercEntry = {
      id: newId, lote, dercId: fullDercId, date: productionDate, totalConcha: 0,
      presentations: [
        { type: 'Tallo Coral', factor: config.factors['Tallo Coral'], total: 0, records: createRecords() },
        { type: 'Tallo Solo', factor: config.factors['Tallo Solo'], total: 0, records: createRecords() }
      ]
    };

    const synced = lotEngine.syncLote(newEntry);
    setDercs(prev => [...prev, synced]);
    logEvent(`Nueva unidad de ADN creada: ${lote}.`, 'SUCCESS', 'ALTA', lote);

    if (shouldDock) handleDockLot(newId);
    else setSelectedViewId('vault');
    setIsModalOpen(false);
  };

  const handleManualSave = useCallback(() => {
    if (unsavedIds.size > 0) {
      setIsNuclearOpen(true);
    } else {
      setSaveStatus('syncing');
      setTimeout(() => {
        setSaveStatus('synced');
        setLastSaveTime(new Date());
        logEvent('Sincronización de jornada completada.', 'SUCCESS', 'GUARDADO');
      }, 300);
    }
  }, [unsavedIds.size, logEvent]);

  const handleRecordChangeInApp = (dercId: string, pType: PresentationType, rowId: string, field: keyof TallaRecord, value: any) => {
    const oldDerc = dercs.find(d => d.id === dercId);
    if (!oldDerc) return;

    const isOldLot = oldDerc.date !== operationalDateStr;
    const newDerc = JSON.parse(JSON.stringify(oldDerc));
    const pIdx = newDerc.presentations.findIndex((p: any) => p.type === pType);
    const rIdx = newDerc.presentations[pIdx].records.findIndex((r: any) => r.id === rowId);

    const row = newDerc.presentations[pIdx].records[rIdx];
    const oldValue = row[field];

    if (oldValue === value) return;

    // Auditoría de cambio para la Caja Negra
    const fieldLabel = field === 'cant' ? 'Entrada' : field === 'entreg' ? 'Proc.' : field === 'saldo' ? 'Saldo' : field;
    const changeMsg = `Talla ${row.talla}: ${fieldLabel} modificado (${oldValue} → ${value})`;

    row[field] = value;
    const synced = lotEngine.syncLote(newDerc);
    handleUpdateDerc(synced);

    logEvent(changeMsg, 'INFO', 'EDICIÓN', oldDerc.lote);

    if (isOldLot) setUnsavedIds(prev => new Set(prev).add(dercId));
  };

  const activeDercs = useMemo(() => dercs.filter(d => !d.deletedAt), [dercs]);
  const currentTheme = {
    obsidian: { bg: 'bg-[#09090b]', text: 'text-zinc-100' },
    pearl: { bg: 'bg-[#f3f4f6] pearl-theme', text: 'text-zinc-950' }
  }[config.theme || 'obsidian'];

  const isWorkspace = selectedViewId === 'workspace';

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${currentTheme.bg} ${currentTheme.text}`}>
      <Sidebar appMode={appMode} setAppMode={setAppMode} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} selectedViewId={selectedViewId} setSelectedViewId={setSelectedViewId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} todayGroup={[]} onOpenBackup={() => setIsBackupOpen(true)} theme={config.theme} showHints={showHints} shortcuts={config.shortcuts} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!isWorkspace && (
          <Header appMode={appMode} selectedViewId={selectedViewId} setSelectedViewId={setSelectedViewId} selectedDerc={activeDercs.find(d => d.id === selectedViewId)} isUnknownIdentity={false} onRename={() => setIsRenameOpen(true)} saveStatus={saveStatus} lastSaveTime={lastSaveTime} dercs={dercs} hasEmergencySnapshot={hasEmergencySnapshot} onRestoreEmergency={() => { }} onOpenImport={() => setIsSmartImportOpen(true)} onOpenNew={() => setIsModalOpen(true)} onOpenConfig={() => setIsConfigOpen(true)} theme={config.theme} />
        )}

        {/* Trigger de Caja Negra Reubicado */}
        <div
          className={`fixed right-0 top-1/2 -translate-y-1/2 h-48 w-1.5 hover:w-10 bg-indigo-600/30 hover:bg-indigo-600/60 rounded-l-3xl z-[140] cursor-pointer transition-all group flex flex-col items-center justify-center border-l border-indigo-500/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]`}
          onClick={() => { setIsBlackBoxOpen(true); setUnreadEvents(0); }}
        >
          <History className={`w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all ${config.theme === 'pearl' ? 'text-indigo-600' : 'text-indigo-400'}`} />
          {unreadEvents > 0 && (
            <div className="absolute -top-2 left-0 right-0 flex justify-center">
              <div className="px-1.5 py-0.5 bg-rose-600 rounded-full text-[8px] text-white font-black animate-bounce ring-2 ring-zinc-950">{unreadEvents}</div>
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto custom-scrollbar relative ${selectedViewId === 'workspace' ? 'p-0' : 'p-10'}`}>
          {selectedViewId === 'summary' ? <DashboardView dercs={activeDercs} operationalDate={operationalDateStr} theme={config.theme} /> :
            selectedViewId === 'workspace' ? (
              <TacticalWorkspace
                dercs={activeDercs}
                onUpdateDerc={handleUpdateDerc}
                onDeleteDerc={(id) => setDercs(prev => prev.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d))}
                globalFactors={config.factors}
                onUpdateGlobalConfig={(f) => setConfig(prev => ({ ...prev, factors: f }))}
                operationalDate={operationalDateStr}
                dockedIds={dockedIds}
                setDockedIds={setDockedIds}
                onLogEvent={logEvent}
                onOpenNew={() => setIsModalOpen(true)}
                onOpenConfig={() => setIsConfigOpen(true)}
                onOpenImport={() => setIsSmartImportOpen(true)}
                theme={config.theme}
                onRecordChange={handleRecordChangeInApp}
                onManualSave={handleManualSave}
                hasUnsavedChanges={unsavedIds.size > 0}
                saveStatus={saveStatus}
                onViewChange={setSelectedViewId}
                shortcuts={config.shortcuts}
                isHeaderPinned={config.isHeaderPinned}
                onToggleHeader={(val) => setConfig(prev => ({ ...prev, isHeaderPinned: val }))}
                showHints={showHints}
              />
            ) :
              selectedViewId === 'fulfillment' ? <FulfillmentView dercs={activeDercs} onGoToDerc={setSelectedViewId} /> :
                selectedViewId === 'vault' ? <VaultView dercs={activeDercs} onGoToDerc={setSelectedViewId} onDeleteDerc={() => { }} onDeleteMultiple={() => { }} onClearAll={() => { }} onDockLot={handleDockLot} theme={config.theme} /> :
                  selectedViewId === 'trash' ? <TrashView items={dercs.filter(d => !!d.deletedAt)} onRestore={(id) => setDercs(prev => prev.map(d => d.id === id ? { ...d, deletedAt: undefined } : d))} onPermanentDelete={(id) => setDercs(prev => prev.filter(d => d.id !== id))} theme={config.theme} /> : null}
        </div>

        <EventLoggerDrawer isOpen={isBlackBoxOpen} onClose={() => setIsBlackBoxOpen(false)} events={events} onClear={() => setEvents([])} theme={config.theme} />
      </main>

      <NuclearConfirmModal isOpen={isNuclearOpen} onClose={() => setIsNuclearOpen(false)} onConfirm={async () => { setSaveStatus('syncing'); await StorageService.save(dercs); setUnsavedIds(new Set()); setSaveStatus('synced'); setIsNuclearOpen(false); logEvent('Autorización nuclear concedida. Base histórica actualizada.', 'CRITICAL', 'SISTEMA'); }} title="Protocolo de Alteración Histórica" description={`Se han detectado ediciones en ${unsavedIds.size} lotes de jornadas previas.`} />
      <NewDercModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmNewDerc} existingDercs={dercs} theme={config.theme} />
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} config={config} onUpdate={(c) => setConfig(c)} />
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} currentData={dercs} onImport={(data) => { setDercs(data); logEvent(`Restauración masiva completada (${data.length} lotes).`, 'SUCCESS', 'BÓVEDA'); }} />
      <SmartImportModal isOpen={isSmartImportOpen} onClose={() => setIsSmartImportOpen(false)} onImport={(data) => { setDercs(prev => [...prev, ...data]); logEvent(`Importación inteligente completada: +${data.length} lotes detectados.`, 'SUCCESS', 'IMPORT'); }} factors={config.factors} existingDercs={dercs} theme={config.theme} />
      <RenameLoteModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} onConfirm={(nl, nid) => { const target = activeDercs.find(d => d.id === selectedViewId); if (target) { handleUpdateDerc({ ...target, lote: nl, dercId: nid }); setIsRenameOpen(false); logEvent(`Identidad actualizada: ${nl}`, 'WARNING', 'ESTRUCTURA'); } }} currentName={activeDercs.find(d => d.id === selectedViewId)?.lote || ''} existingDercs={dercs} currentDercId={selectedViewId as string} theme={config.theme} />
    </div>
  );
};

export default App;
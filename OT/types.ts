
export type AppMode = 'scallop' | 'shrimp';
export type AppTheme = 'obsidian' | 'pearl';

export interface TallaRecord {
  id: string;
  talla: string;
  cant: number;
  cajasT: number;
  entreg: number;
  cajasP: number;
  kilosT: number;
  saldo: number;
}

export type PresentationType = 'Tallo Coral' | 'Tallo Solo' | 'Media Valva';

export interface Presentation {
  type: PresentationType;
  total: number;
  factor: number;
  records: TallaRecord[];
}

export interface DercEntry {
  id: string;
  lote: string;
  dercId: string;
  date: string;
  presentations: Presentation[];
  totalConcha: number;
  deletedAt?: string;
  ghostRecords?: Record<string, TallaRecord[]>;
  ghostPresentations?: Presentation[];
}

// --- Sistema de Bitácora ---
export type EventSeverity = 'INFO' | 'CRITICAL' | 'SUCCESS' | 'WARNING';

export interface WorkspaceEvent {
  id: string;
  timestamp: string;
  message: string;
  type: string;
  severity: EventSeverity;
  lotName?: string;
}

// --- Dimensión Langostino ---
export interface ShrimpRecord {
  talla: string;
  tailOff: number;
  ezPeel: number;
  tailOn: number;
}

export interface ShrimpLot {
  id: string;
  lote: string;
  mp: number; // Materia Prima inicial
  date: string;
  records: ShrimpRecord[];
}

export interface GlobalConfig {
  factors: Record<PresentationType, number>;
  shiftCutoffTime: string; // Formato HH:mm
  theme: AppTheme;
  shortcuts?: Record<string, string>;
  isHeaderPinned?: boolean;
}

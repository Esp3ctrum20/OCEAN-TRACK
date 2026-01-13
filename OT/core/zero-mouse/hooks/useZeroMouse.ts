import { useEffect, useState, useRef } from 'react';
import { useTabHandler } from '../handlers/useTabHandler';
import { useArrowHandler } from '../handlers/useArrowHandler';
import { useShortcutHandler } from '../handlers/useShortcutHandler';

interface ZeroMouseOptions {
  dockedLotes: any[];
  onManualSave?: () => void;
  onViewChange?: (viewId: string) => void;
  onLogEvent?: (message: string, severity?: any) => void;
  shortcuts?: Record<string, string>;
  onOpenImport?: () => void;
  onOpenConfig?: () => void;
  onOpenIntelligence?: () => void;
  onOpenSelector?: () => void;
  onClearMesa?: () => void;
  onOpenNew?: () => void;
  onToggleHeader?: () => void;
  onOpenCommandPalette?: () => void;
}

/**
 * useZeroMouse: Orchestrator Hook
 * Gestiona la navegación por regiones, el foco espacial y los atajos globales.
 */
export const useZeroMouse = ({
  dockedLotes, onManualSave, onViewChange, onLogEvent, shortcuts,
  onOpenImport, onOpenConfig, onOpenIntelligence, onOpenSelector, onClearMesa, onOpenNew, onToggleHeader, onOpenCommandPalette
}: ZeroMouseOptions) => {
  const { handleTab } = useTabHandler();
  const { handleArrows } = useArrowHandler(dockedLotes);
  const { handleShortcuts } = useShortcutHandler(
    onViewChange, onManualSave, shortcuts,
    onOpenImport, onOpenConfig, onOpenIntelligence, onOpenSelector, onClearMesa, onOpenNew, onToggleHeader,
    onOpenCommandPalette
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (!active) return;

      // 1. Prioridad: Shortcuts Globales
      if (handleShortcuts(e, active)) return;

      // 2. Prioridad: Protocolo de Regiones (Tab)
      if (e.key === 'Tab') {
        if (handleTab(e, active)) return;
      }

      // 3. Prioridad: Navegación Espacial (Flechas / Enter)
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (arrowKeys.includes(e.key)) {
        if (handleArrows(e, active)) return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [dockedLotes, onManualSave, onViewChange, onLogEvent, handleTab, handleArrows, handleShortcuts]);

  return {};
};

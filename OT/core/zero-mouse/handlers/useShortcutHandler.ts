import { shortcutManager } from '../shortcuts/shortcutManager';

/**
 * ROC-Surgery: Shortcut Handler
 * Despacha acciones globales y el protocolo de escape.
 */
export const useShortcutHandler = (
    onViewChange?: (view: any) => void,
    onManualSave?: () => void,
    shortcuts?: Record<string, string>,
    onOpenImport?: () => void,
    onOpenConfig?: () => void,
    onOpenIntelligence?: () => void,
    onOpenSelector?: () => void,
    onClearMesa?: () => void,
    onOpenNew?: () => void,
    onToggleHeader?: () => void,
    onOpenCommandPalette?: () => void
) => {
    const handleShortcuts = (e: KeyboardEvent, active: HTMLElement) => {
        // 1. ESCAPE Protocol (Reset foco a la grilla)
        if (e.key === 'Escape') {
            const isTactical = active.hasAttribute('data-header-btn') ||
                active.hasAttribute('data-jump-btn') ||
                active.getAttribute('data-type') === 'add-talla';

            if (isTactical) {
                e.preventDefault();
                const lotIdx = active.getAttribute('data-lot') || '0';
                const targetInput = document.querySelector(`input[data-lot="${lotIdx}"][data-row="0"][data-cell="0"]`) as HTMLElement;
                if (targetInput) {
                    targetInput.focus();
                    return true;
                }
            }
        }

        // 2. Global Shortcuts (Alt + K)
        const action = shortcutManager.getAction(e, shortcuts);
        if (action) {
            e.preventDefault();
            switch (action) {
                case 'SAVE_ALL':
                    onManualSave?.();
                    break;
                case 'GOTO_DASHBOARD':
                    onViewChange?.('dashboard');
                    break;
                case 'GOTO_WORKSPACE':
                    onViewChange?.('workspace');
                    break;
                case 'OPEN_SCALE':
                    (document.querySelector('button[data-type="scale"]') as HTMLElement)?.click();
                    break;
                case 'OPEN_IMPORT':
                    onOpenImport?.();
                    break;
                case 'OPEN_CONFIG':
                    onOpenConfig?.();
                    break;
                case 'OPEN_INTEL':
                    onOpenIntelligence?.();
                    break;
                case 'OPEN_HANGAR':
                    onOpenSelector?.();
                    break;
                case 'CLEAR_MESA':
                    onClearMesa?.();
                    break;
                case 'OPEN_NEW_LOT':
                    onOpenNew?.();
                    break;
                case 'TOGGLE_HEADER':
                    onToggleHeader?.();
                    break;
                case 'EDIT_LOT':
                case 'SNAP_LOT':
                case 'REMOVE_LOT':
                    const lotContainer = active.closest('[data-lot-container="true"]');
                    if (lotContainer) {
                        const btnMap = { 'EDIT_LOT': 'edit', 'SNAP_LOT': 'camera', 'REMOVE_LOT': 'remove' };
                        const lotBtn = lotContainer.querySelector(`button[data-type="${btnMap[action]}"]`) as HTMLElement;
                        lotBtn?.click();
                    }
                    break;
                case 'DELETE_ROW':
                    const rowContainer = active.closest('.group\\/row');
                    if (rowContainer) {
                        const trashBtn = rowContainer.querySelector('button[data-type="trash"]') as HTMLElement;
                        trashBtn?.click();
                    }
                    break;
                case 'OPEN_COMMAND_PALETTE':
                    onOpenCommandPalette?.();
                    break;
                // ... resto de acciones
            }
            return true;
        }

        return false;
    };

    return { handleShortcuts };
};

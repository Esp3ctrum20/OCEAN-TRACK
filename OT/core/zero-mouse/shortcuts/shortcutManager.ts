import { ZeroMouseAction } from '../core/types';

/**
 * ROC-Surgery: ShortcutManager
 * Centraliza la detección de intenciones globales.
 */
export const shortcutManager = {
    getAction: (e: KeyboardEvent, shortcuts?: Record<string, string>): ZeroMouseAction | null => {
        if (!e.altKey) return null;

        const key = e.key.toLowerCase();

        // 1. Verificar atajos personalizados primero (Mapeo reactivo)
        if (shortcuts) {
            if (key === (shortcuts.OPEN_NEW_LOT || 'n').toLowerCase()) return 'OPEN_NEW_LOT';
            if (key === (shortcuts.OPEN_SCALE || 'b').toLowerCase()) return 'OPEN_SCALE';
            if (key === (shortcuts.OPEN_IMPORT || 'i').toLowerCase()) return 'OPEN_IMPORT';
            if (key === (shortcuts.OPEN_HANGAR || 'h').toLowerCase()) return 'OPEN_HANGAR';
            if (key === (shortcuts.OPEN_CONFIG || 'c').toLowerCase()) return 'OPEN_CONFIG';
            if (key === (shortcuts.OPEN_INTEL || 'j').toLowerCase()) return 'OPEN_INTEL';
            if (key === (shortcuts.CLEAR_MESA || 'l').toLowerCase()) return 'CLEAR_MESA';
            if (key === (shortcuts.SAVE_ALL || 'g').toLowerCase()) return 'SAVE_ALL';
            if (key === (shortcuts.TOGGLE_HEADER || 'p').toLowerCase()) return 'TOGGLE_HEADER';
            if (key === (shortcuts.EDIT_LOT || 'e').toLowerCase()) return 'EDIT_LOT';
            if (key === (shortcuts.SNAP_LOT || 'v').toLowerCase()) return 'SNAP_LOT';
            if (key === (shortcuts.REMOVE_LOT || 'x').toLowerCase()) return 'REMOVE_LOT';
            if (key === (shortcuts.DELETE_ROW || 'd').toLowerCase()) return 'DELETE_ROW';
            if (key === (shortcuts.OPEN_COMMAND_PALETTE || 'k').toLowerCase()) return 'OPEN_COMMAND_PALETTE';
        }

        // 2. Atajos por defecto (Fallback)
        switch (key) {
            case 'g': return 'SAVE_ALL';
            case '1': return 'GOTO_DASHBOARD';
            case '2': return 'GOTO_WORKSPACE';
            case '3': return 'GOTO_VAULT';
            case '4': return 'GOTO_TRASH';
            case 'n': return 'OPEN_NEW_LOT';
            case 'b': return 'OPEN_SCALE';
            case 'i': return 'OPEN_IMPORT';
            case 'h': return 'OPEN_HANGAR';
            case 'c': return 'OPEN_CONFIG';
            case 'j': return 'OPEN_INTEL';
            case 'l': return 'CLEAR_MESA';
            case 'p': return 'TOGGLE_HEADER';
            case 'e': return 'EDIT_LOT';
            case 'v': return 'SNAP_LOT';
            case 'x': return 'REMOVE_LOT';
            case 'd': return 'DELETE_ROW';
            case 'k': return 'OPEN_COMMAND_PALETTE';
            default: return null;
        }
    },
    getLabel: (action: ZeroMouseAction, shortcuts?: Record<string, string>): string => {
        if (shortcuts && shortcuts[action]) return shortcuts[action].toUpperCase();

        switch (action) {
            case 'SAVE_ALL': return 'G';
            case 'GOTO_DASHBOARD': return '1';
            case 'GOTO_WORKSPACE': return '2';
            case 'GOTO_VAULT': return '3';
            case 'GOTO_TRASH': return '4';
            case 'OPEN_NEW_LOT': return 'N';
            case 'OPEN_SCALE': return 'B';
            case 'OPEN_IMPORT': return 'I';
            case 'OPEN_HANGAR': return 'H';
            case 'OPEN_CONFIG': return 'C';
            case 'OPEN_INTEL': return 'J';
            case 'CLEAR_MESA': return 'L';
            case 'TOGGLE_HEADER': return 'P';
            case 'EDIT_LOT': return 'E';
            case 'SNAP_LOT': return 'V';
            case 'REMOVE_LOT': return 'X';
            case 'DELETE_ROW': return 'D';
            case 'OPEN_COMMAND_PALETTE': return 'K';
            default: return '';
        }
    }
};

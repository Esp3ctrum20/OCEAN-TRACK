export interface ZeroMouseCoords {
    lotIdx: number;
    rowIdx: number;
    cellIdx: number;
}

export type ZeroMouseAction =
    | 'SAVE_ALL'
    | 'GOTO_DASHBOARD'
    | 'GOTO_WORKSPACE'
    | 'GOTO_VAULT'
    | 'GOTO_TRASH'
    | 'OPEN_NEW_LOT'
    | 'OPEN_SCALE'
    | 'TOGGLE_HEADER'
    | 'OPEN_IMPORT'
    | 'OPEN_HANGAR'
    | 'OPEN_CONFIG'
    | 'OPEN_INTEL'
    | 'CLEAR_MESA'
    | 'EDIT_LOT'
    | 'SNAP_LOT'
    | 'REMOVE_LOT'
    | 'DELETE_ROW'
    | 'OPEN_COMMAND_PALETTE';

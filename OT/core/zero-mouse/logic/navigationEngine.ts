import { PresentationType } from '../../../types';

export interface ZeroMouseCoords {
  lotIdx: number;
  rowIdx: number;
  cellIdx: number;
}

export const navigationEngine = {
  /**
   * Calcula la siguiente coordenada basándose en la tecla presionada
   */
  calculateNextCoords: (
    current: ZeroMouseCoords, 
    key: string, 
    isShift: boolean,
    limits: { totalLots: number }
  ): ZeroMouseCoords | null => {
    let { lotIdx, rowIdx, cellIdx } = current;

    if (key === 'ArrowDown' || (key === 'Enter' && !isShift)) {
      rowIdx++;
    } else if (key === 'ArrowUp' || (key === 'Enter' && isShift)) {
      rowIdx--;
      if (rowIdx < 0) return null; // No retroceder fuera de la tabla
    } else if (key === 'ArrowRight') {
      cellIdx++;
      if (cellIdx > 2) {
        cellIdx = 0;
        lotIdx++;
      }
    } else if (key === 'ArrowLeft') {
      cellIdx--;
      if (cellIdx < 0) {
        cellIdx = 2;
        lotIdx--;
      }
    } else {
      return null;
    }

    // Validar límites de lotes
    if (lotIdx < 0 || lotIdx >= limits.totalLots) return null;

    return { lotIdx, rowIdx, cellIdx };
  },

  /**
   * Genera el selector CSS para encontrar el elemento en el DOM
   */
  getSelector: (coords: ZeroMouseCoords) => {
    return `input[data-lot="${coords.lotIdx}"][data-row="${coords.rowIdx}"][data-cell="${coords.cellIdx}"]`;
  }
};
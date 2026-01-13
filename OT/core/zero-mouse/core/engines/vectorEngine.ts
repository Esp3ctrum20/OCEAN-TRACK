import { ZeroMouseCoords } from '../types';

/**
 * Motor Vectorial: Calcula la trayectoria del foco en la grilla industrial.
 */
export const vectorEngine = {
  calculateNext: (
    current: ZeroMouseCoords,
    key: string,
    isShift: boolean,
    limits: { totalLots: number; rowsInLot: number }
  ): ZeroMouseCoords | null => {
    let { lotIdx, rowIdx, cellIdx } = current;

    switch (key) {
      case 'ArrowDown':
      case 'Enter':
        if (key === 'Enter' && isShift) {
          rowIdx--;
        } else {
          rowIdx++;
        }
        break;
      case 'ArrowUp':
        rowIdx--;
        break;
      case 'ArrowRight':
        cellIdx++;
        if (cellIdx > 2) {
          cellIdx = 0;
          lotIdx++;
        }
        break;
      case 'ArrowLeft':
        cellIdx--;
        if (cellIdx < 0) {
          cellIdx = 2;
          lotIdx--;
        }
        break;
      case 'Tab':
        // El Tab se reserva para saltar entre regiones (Sidebar -> Mesa)
        return null;
      default:
        return null;
    }

    // Validaciones Nucleares (No salirse de la planta)
    if (lotIdx < 0 || lotIdx >= limits.totalLots) return null;
    if (rowIdx < 0) return null;

    return { lotIdx, rowIdx, cellIdx };
  },

  getDomSelector: (coords: ZeroMouseCoords) => {
    return `input[data-lot="${coords.lotIdx}"][data-row="${coords.rowIdx}"][data-cell="${coords.cellIdx}"]`;
  }
};
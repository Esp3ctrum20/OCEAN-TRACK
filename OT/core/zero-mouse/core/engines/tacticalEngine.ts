/**
 * Motor Táctico: Gestiona el salto entre botones y controles fuera de la matriz de inputs.
 */
export const tacticalEngine = {
  /**
   * Encuentra todos los elementos tácticos visibles y ordenados por su posición en el DOM.
   */
  getTacticalElements: (): HTMLElement[] => {
    // Buscamos: Botones de JumpBar, Botones de Barra de Herramientas (Mesa), Botones de Cabecera de Lote, Botones de Bloque, Botones de Fila
    const selector = '[data-nav-region="jump-bar"] button, [data-toolbar-btn="true"], [data-header-btn="true"], [data-type="block-type"], [data-type="add-talla"], [data-type="trash"]';
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  },

  /**
   * Calcula el siguiente elemento táctico a enfocar basado en el orden visual del DOM.
   */
  getNextTactical: (current: HTMLElement, isShift: boolean): HTMLElement | null => {
    const elements = tacticalEngine.getTacticalElements();
    if (elements.length === 0) return null;

    const currentIndex = elements.indexOf(current);

    if (isShift) {
      // Navegación reversa (Shift + Tab)
      if (currentIndex <= 0) return elements[elements.length - 1];
      return elements[currentIndex - 1];
    } else {
      // Navegación hacia adelante (Tab)
      if (currentIndex === -1 || currentIndex === elements.length - 1) return elements[0];
      return elements[currentIndex + 1];
    }
  }
};

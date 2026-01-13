import { tacticalEngine } from '../core/engines/tacticalEngine';

/**
 * ROC-Surgery: Tab Handler
 * Gestiona el Protocolo Liberador y el Ciclo Cerrado del Lote.
 */
export const useTabHandler = () => {
    const handleTab = (e: KeyboardEvent, active: HTMLElement) => {
        // 1. Identificar si estamos en región táctica
        const isTacticalActive = active.hasAttribute('data-header-btn') ||
            active.hasAttribute('data-jump-btn') ||
            active.hasAttribute('data-toolbar-btn') ||
            active.getAttribute('data-type') === 'block-type' ||
            active.getAttribute('data-type') === 'add-talla' ||
            active.getAttribute('data-type') === 'trash';

        if (isTacticalActive) {
            const lotIdx = active.getAttribute('data-lot');

            if (lotIdx !== null) {
                if (!e.shiftKey) {
                    // NAVEGACIÓN ADELANTE

                    // 1. Tab desde último "add-talla" -> Ir al Product Type (Principal) si existe, sino al Header
                    if (active.getAttribute('data-type') === 'add-talla') {
                        const addBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-type="add-talla"]`);
                        if (active === addBtns[addBtns.length - 1]) {
                            const blockTypeBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-type="block-type"][data-is-principal="true"]`) as HTMLElement;
                            if (blockTypeBtn) {
                                e.preventDefault();
                                blockTypeBtn.focus();
                                blockTypeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                return true;
                            }
                            const firstHeaderBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-header-btn="true"]`) as HTMLElement;
                            if (firstHeaderBtn) {
                                e.preventDefault();
                                firstHeaderBtn.focus();
                                firstHeaderBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                return true;
                            }
                        }
                    }

                    // 1b. Tab desde "block-type" -> Ir al Primer Header
                    if (active.getAttribute('data-type') === 'block-type') {
                        const firstHeaderBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-header-btn="true"]`) as HTMLElement;
                        if (firstHeaderBtn) {
                            e.preventDefault();
                            firstHeaderBtn.focus();
                            firstHeaderBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            return true;
                        }
                    }

                    // 2. Tab desde último "Header Button" -> Ir al Jump Bar del lote correspondiente
                    if (active.hasAttribute('data-header-btn')) {
                        const headerBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-header-btn="true"]`);
                        if (active === headerBtns[headerBtns.length - 1]) {
                            const jumpBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-jump-btn="true"]`) as HTMLElement;
                            if (jumpBtn) {
                                e.preventDefault();
                                jumpBtn.focus();
                                jumpBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                return true;
                            }
                        }
                    }

                    // 3. Tab desde Jump Bar -> Ir al Primer botón de la Toolbar Global
                    if (active.hasAttribute('data-jump-btn')) {
                        const firstToolbarBtn = document.querySelector('[data-toolbar-btn="true"]') as HTMLElement;
                        if (firstToolbarBtn) {
                            e.preventDefault();
                            firstToolbarBtn.focus();
                            return true;
                        }
                    }

                    // 4. Tab desde último botón de la Toolbar -> Reiniciar al primer "add-talla" del primer lote
                    if (active.hasAttribute('data-toolbar-btn')) {
                        const toolbarBtns = document.querySelectorAll('[data-toolbar-btn="true"]');
                        if (active === toolbarBtns[toolbarBtns.length - 1]) {
                            const firstAddBtn = document.querySelector('button[data-type="add-talla"]') as HTMLElement;
                            if (firstAddBtn) {
                                e.preventDefault();
                                firstAddBtn.focus();
                                firstAddBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                return true;
                            }
                        }
                    }
                } else {
                    // NAVEGACIÓN REVERSA (Shift + Tab)

                    // 0. Shift+Tab desde la Toolbar (primer botón) -> Ir al último Jump Bar encontrado
                    if (active.hasAttribute('data-toolbar-btn')) {
                        const toolbarBtns = document.querySelectorAll('[data-toolbar-btn="true"]');
                        if (active === toolbarBtns[0]) {
                            const jumpBtns = document.querySelectorAll('button[data-jump-btn="true"]');
                            if (jumpBtns.length > 0) {
                                e.preventDefault();
                                (jumpBtns[jumpBtns.length - 1] as HTMLElement).focus();
                                return true;
                            }
                        }
                    }

                    // 1. Shift+Tab desde primer Header -> "block-type" o último "add-talla"
                    if (active.hasAttribute('data-header-btn')) {
                        const headerBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-header-btn="true"]`);
                        if (active === headerBtns[0]) {
                            const blockTypeBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-type="block-type"][data-is-principal="true"]`) as HTMLElement;
                            if (blockTypeBtn) {
                                e.preventDefault();
                                blockTypeBtn.focus();
                                return true;
                            }
                            const addBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-type="add-talla"]`);
                            if (addBtns.length > 0) {
                                e.preventDefault();
                                (addBtns[addBtns.length - 1] as HTMLElement).focus();
                                return true;
                            }
                        }
                    }

                    // 2. Shift+Tab desde "block-type" -> Ir al último "add-talla"
                    if (active.getAttribute('data-type') === 'block-type') {
                        const addBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-type="add-talla"]`);
                        if (addBtns.length > 0) {
                            e.preventDefault();
                            (addBtns[addBtns.length - 1] as HTMLElement).focus();
                            return true;
                        }
                    }

                    // 3. Shift+Tab desde primer "add-talla" -> Ir al último botón de la Toolbar si es el lote 0, sino al Jump Bar anterior
                    if (active.getAttribute('data-type') === 'add-talla') {
                        const addBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-type="add-talla"]`);
                        if (active === addBtns[0]) {
                            if (lotIdx === '0') {
                                const toolbarBtns = document.querySelectorAll('[data-toolbar-btn="true"]');
                                if (toolbarBtns.length > 0) {
                                    e.preventDefault();
                                    (toolbarBtns[toolbarBtns.length - 1] as HTMLElement).focus();
                                    return true;
                                }
                            } else {
                                const jumpBtn = document.querySelector(`button[data-lot="${lotIdx}"][data-jump-btn="true"]`) as HTMLElement;
                                if (jumpBtn) {
                                    e.preventDefault();
                                    jumpBtn.focus();
                                    return true;
                                }
                            }
                        }
                    }

                    // 4. Shift+Tab desde Jump Bar -> Ir al último Header
                    if (active.hasAttribute('data-jump-btn')) {
                        const headerBtns = document.querySelectorAll(`button[data-lot="${lotIdx}"][data-header-btn="true"]`);
                        if (headerBtns.length > 0) {
                            e.preventDefault();
                            (headerBtns[headerBtns.length - 1] as HTMLElement).focus();
                            return true;
                        }
                    }
                }
            }

            // Caer en el motor táctico general si no hay ciclo cerrado específico
            const next = tacticalEngine.getNextTactical(active, e.shiftKey);
            if (next) {
                e.preventDefault();
                next.focus();
                next.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                return true;
            }
        }
        return false;
    };

    return { handleTab };
};

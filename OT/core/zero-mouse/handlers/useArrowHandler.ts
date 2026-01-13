import { vectorEngine } from '../core/engines/vectorEngine';
import { ZeroMouseCoords } from '../core/types';

/**
 * ROC-Surgery: Arrow Handler
 * Gestiona la navegación espacial (Casos A-F) y la grilla de datos.
 */
export const useArrowHandler = (dockedLotes: any[]) => {
    const handleArrows = (e: KeyboardEvent, active: HTMLElement) => {
        // CASO A: Botones de Borrado (Turbo-Trash Mode)
        if (active.getAttribute('data-type') === 'trash') {
            const lot = active.getAttribute('data-lot');
            const row = parseInt(active.getAttribute('data-row') || '0');
            const pType = active.getAttribute('data-p-type');

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const nextRow = e.key === 'ArrowDown' ? row + 1 : row - 1;
                const nextTrash = document.querySelector(`button[data-lot="${lot}"][data-row="${nextRow}"][data-type="trash"]`) as HTMLElement;

                if (nextTrash) {
                    nextTrash.focus();
                    nextTrash.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (e.key === 'ArrowDown') {
                    const addBtn = document.querySelector(`button[data-lot="${lot}"][data-p-type="${pType}"][data-type="add-talla"]`) as HTMLElement;
                    if (addBtn) {
                        addBtn.focus();
                        addBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const targetInput = document.querySelector(`input[data-lot="${lot}"][data-row="${row}"][data-cell="2"]`) as HTMLInputElement;
                if (targetInput) {
                    targetInput.focus();
                    targetInput.select();
                }
            }
            return true;
        }

        // CASO B: Botones del Cabezal (Header Mode)
        if (active.hasAttribute('data-header-btn')) {
            const lot = active.getAttribute('data-lot');
            const allHeaderBtns = Array.from(document.querySelectorAll(`button[data-lot="${lot}"][data-header-btn="true"]`)) as HTMLElement[];
            const currentIndex = allHeaderBtns.indexOf(active);

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const nextBtn = e.key === 'ArrowRight' ? allHeaderBtns[currentIndex + 1] : allHeaderBtns[currentIndex - 1];

                if (nextBtn) {
                    nextBtn.focus();
                } else {
                    const nextLotIdx = e.key === 'ArrowRight' ? parseInt(lot || '0') + 1 : parseInt(lot || '0') - 1;
                    const targetHeaderBtn = document.querySelector(`button[data-lot="${nextLotIdx}"][data-header-btn="true"]`) as HTMLElement;
                    if (targetHeaderBtn) {
                        targetHeaderBtn.focus();
                        targetHeaderBtn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    } else if (e.key === 'ArrowRight') {
                        const toolbarBtn = document.querySelector('[data-toolbar-btn="true"]') as HTMLElement;
                        if (toolbarBtn) {
                            toolbarBtn.focus();
                            toolbarBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const firstInput = document.querySelector(`input[data-lot="${lot}"][data-row="0"][data-cell="0"]`) as HTMLInputElement;
                if (firstInput) {
                    firstInput.focus();
                    firstInput.select();
                    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const blockTypeBtn = document.querySelector(`button[data-lot="${lot}"][data-type="block-type"][data-is-principal="true"]`) as HTMLElement;
                if (blockTypeBtn) {
                    blockTypeBtn.focus();
                    blockTypeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const addBtns = document.querySelectorAll(`button[data-lot="${lot}"][data-type="add-talla"]`);
                    const lastAddBtn = addBtns[addBtns.length - 1] as HTMLElement;
                    if (lastAddBtn) {
                        lastAddBtn.focus();
                        lastAddBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
            return true;
        }

        // CASO C: Botones "Nuevo Calibre" (Carriles Estancos)
        if (active.getAttribute('data-type') === 'add-talla') {
            const lot = active.getAttribute('data-lot');
            const pType = active.getAttribute('data-p-type');
            const allAddBtns = Array.from(document.querySelectorAll(`button[data-lot="${lot}"][data-type="add-talla"]`)) as HTMLElement[];
            const currentIndex = allAddBtns.indexOf(active);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextBtn = allAddBtns[currentIndex + 1];
                if (nextBtn) {
                    nextBtn.focus();
                    nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const blockTypeBtn = document.querySelector(`button[data-lot="${lot}"][data-type="block-type"][data-is-principal="true"]`) as HTMLElement;
                    if (blockTypeBtn) {
                        blockTypeBtn.focus();
                        blockTypeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        const headerBtn = document.querySelector(`button[data-lot="${lot}"][data-header-btn="true"]`) as HTMLElement;
                        if (headerBtn) {
                            headerBtn.focus();
                            headerBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevBtn = allAddBtns[currentIndex - 1];
                if (prevBtn) {
                    prevBtn.focus();
                    prevBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const trashBtns = document.querySelectorAll(`button[data-lot="${lot}"][data-p-type="${pType}"][data-type="trash"]`);
                    const lastTrash = trashBtns[trashBtns.length - 1] as HTMLElement;
                    if (lastTrash) {
                        lastTrash.focus();
                        lastTrash.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const nextLotIdx = e.key === 'ArrowRight' ? parseInt(lot || '0') + 1 : parseInt(lot || '0') - 1;
                const targetAddBtn = document.querySelector(`button[data-lot="${nextLotIdx}"][data-type="add-talla"][data-p-type="${pType}"]`) as HTMLElement;
                if (targetAddBtn) {
                    targetAddBtn.focus();
                    targetAddBtn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
            return true;
        }

        // CASO D: Botón de Tipo de Producto (Block Type)
        if (active.getAttribute('data-type') === 'block-type') {
            const lot = active.getAttribute('data-lot');
            const isExpanded = active.getAttribute('aria-expanded') === 'true';

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (isExpanded) {
                    const firstOption = document.querySelector(`button[data-lot="${lot}"][data-type="block-type-option"]`) as HTMLElement;
                    if (firstOption) firstOption.focus();
                } else {
                    const headerBtn = document.querySelector(`button[data-lot="${lot}"][data-header-btn="true"]`) as HTMLElement;
                    if (headerBtn) {
                        headerBtn.focus();
                        headerBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const addBtns = document.querySelectorAll(`button[data-lot="${lot}"][data-type="add-talla"]`);
                const lastAddBtn = addBtns[addBtns.length - 1] as HTMLElement;
                if (lastAddBtn) {
                    lastAddBtn.focus();
                    lastAddBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !isExpanded) {
                e.preventDefault();
                const nextLotIdx = e.key === 'ArrowRight' ? parseInt(lot || '0') + 1 : parseInt(lot || '0') - 1;
                const targetBlockBtn = document.querySelector(`button[data-lot="${nextLotIdx}"][data-type="block-type"][data-is-principal="true"]`) as HTMLElement;
                if (targetBlockBtn) {
                    targetBlockBtn.focus();
                    targetBlockBtn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
            return true;
        }

        // CASO F: Opciones del Menú (Loop Navigation)
        if (active.getAttribute('data-type') === 'block-type-option') {
            const lot = active.getAttribute('data-lot');
            const allOptions = Array.from(document.querySelectorAll(`button[data-lot="${lot}"][data-type="block-type-option"]`)) as HTMLElement[];
            const currentIndex = allOptions.indexOf(active);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextOpt = allOptions[currentIndex + 1] || allOptions[0];
                nextOpt.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevOpt = allOptions[currentIndex - 1] || allOptions[allOptions.length - 1];
                prevOpt.focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                const trigger = document.querySelector(`button[data-lot="${lot}"][data-type="block-type"]`) as HTMLElement;
                if (trigger) {
                    trigger.click(); // Cerrar
                    setTimeout(() => trigger.focus(), 0);
                }
            }
            return true;
        }

        // CASO E: Jump Bar
        if (active.hasAttribute('data-jump-btn')) {
            const index = parseInt(active.getAttribute('data-index') || '0');
            const lot = active.getAttribute('data-lot');

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowRight' ? index + 1 : index - 1;
                const nextBtn = document.querySelector(`button[data-jump-btn="true"][data-index="${nextIndex}"]`) as HTMLElement;
                if (nextBtn) {
                    nextBtn.focus();
                    nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const firstHeaderBtn = document.querySelector(`button[data-lot="${lot}"][data-header-btn="true"]`) as HTMLElement;
                if (firstHeaderBtn) {
                    firstHeaderBtn.focus();
                    firstHeaderBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const toolbarBtn = document.querySelector('[data-toolbar-btn="true"]') as HTMLElement;
                if (toolbarBtn) toolbarBtn.focus();
            }
            return true;
        }

        // CASO G: Toolbar Global (Mesa, Radar, Importar...)
        if (active.hasAttribute('data-toolbar-btn')) {
            const allToolbarBtns = Array.from(document.querySelectorAll('[data-toolbar-btn="true"]')) as HTMLElement[];
            const currentIndex = allToolbarBtns.indexOf(active);

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const nextBtn = e.key === 'ArrowRight' ? allToolbarBtns[currentIndex + 1] : allToolbarBtns[currentIndex - 1];
                if (nextBtn) {
                    nextBtn.focus();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                // Bajar a la Jump Bar del primer lote
                const firstJumpBtn = document.querySelector('button[data-jump-btn="true"]') as HTMLElement;
                if (firstJumpBtn) {
                    firstJumpBtn.focus();
                } else {
                    const firstHeaderBtn = document.querySelector('button[data-header-btn="true"]') as HTMLElement;
                    if (firstHeaderBtn) firstHeaderBtn.focus();
                }
            }
            return true;
        }

        // CASE GRID: Grilla Industrial
        if (active.tagName === 'INPUT' && active.hasAttribute('data-lot')) {
            const current: ZeroMouseCoords = {
                lotIdx: parseInt(active.getAttribute('data-lot') || '0'),
                rowIdx: parseInt(active.getAttribute('data-row') || '0'),
                cellIdx: parseInt(active.getAttribute('data-cell') || '0')
            };

            const next = vectorEngine.calculateNext(current, e.key, e.shiftKey, {
                totalLots: dockedLotes.length,
                rowsInLot: 100
            });

            if (next) {
                const selector = vectorEngine.getDomSelector(next);
                const nextEl = document.querySelector(selector) as HTMLInputElement;

                if (nextEl) {
                    e.preventDefault();
                    nextEl.focus();
                    nextEl.select();

                    if (next.lotIdx !== current.lotIdx) {
                        const lotCol = document.getElementById(`lot-column-${dockedLotes[next.lotIdx]?.id}`);
                        lotCol?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                }
            }
            return true;
        }

        return false;
    };

    return { handleArrows };
};

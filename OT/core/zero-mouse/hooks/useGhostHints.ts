import { useState, useEffect, useRef } from 'react';

/**
 * useGhostHints: Monitoriza el estado de la tecla Alt para activar 
 * las sugerencias visuales de atajos.
 */
export const useGhostHints = () => {
    const [showHints, setShowHints] = useState(false);
    const altTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt' && !e.repeat) {
                if (!altTimer.current && !showHints) {
                    altTimer.current = setTimeout(() => {
                        setShowHints(true);
                    }, 500);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt') {
                if (altTimer.current) {
                    clearTimeout(altTimer.current);
                    altTimer.current = null;
                }
                setShowHints(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('keyup', handleKeyUp, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('keyup', handleKeyUp, true);
            if (altTimer.current) clearTimeout(altTimer.current);
        };
    }, [showHints]);

    return { showHints };
};

import React from 'react';
import { shortcutManager } from '../shortcuts/shortcutManager';
import { ZeroMouseAction } from '../core/types';

interface GhostHintProps {
    action: ZeroMouseAction;
    shortcuts?: Record<string, string>;
    visible?: boolean;
    className?: string;
}

/**
 * GhostHint: Etiqueta visual que muestra el atajo teclado.
 * Se activa mediante la retención de la tecla Alt.
 */
export const GhostHint: React.FC<GhostHintProps> = ({ action, shortcuts, visible, className = "" }) => {
    if (!visible) return null;

    const label = shortcutManager.getLabel(action, shortcuts);
    if (!label) return null;

    return (
        <div className={`absolute -top-2 -right-2 z-[100] animate-in zoom-in-50 fade-in duration-300 pointer-events-none ${className}`}>
            <div className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(79,70,229,0.5)] border border-indigo-400/50 flex items-center justify-center min-w-[16px]">
                {label}
            </div>
        </div>
    );
};

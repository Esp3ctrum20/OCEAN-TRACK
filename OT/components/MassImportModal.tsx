
import React, { useState } from 'react';
import { X, ClipboardPaste, Check, Trash2, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, resetProduction: boolean) => void;
  title: string;
}

const MassImportModal: React.FC<Props> = ({ isOpen, onClose, onImport, title }) => {
  const [text, setText] = useState('');
  const [resetProduction, setResetProduction] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${resetProduction ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
              <ClipboardPaste className={`w-5 h-5 ${resetProduction ? 'text-indigo-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Ingreso Masivo</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Sección: {title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 w-full mb-2">
            <button 
              onClick={() => setResetProduction(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                resetProduction ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Importar Solo Materia Prima (0)
            </button>
            <button 
              onClick={() => setResetProduction(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                !resetProduction ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <Database className="w-3.5 h-3.5" /> Importar Registro Completo
            </button>
          </div>

          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega las filas de Excel aquí..."
            className="w-full h-72 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-zinc-800"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onImport(text, resetProduction); onClose(); setText(''); }}
              disabled={!text.trim()}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                resetProduction ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              } text-white disabled:opacity-50`}
            >
              <Check className="w-4 h-4" /> {resetProduction ? 'Procesar Inicio' : 'Importar Todo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassImportModal;

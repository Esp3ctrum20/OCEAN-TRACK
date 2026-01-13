
import React, { useRef, useState } from 'react';
import { X, ShieldCheck, DownloadCloud, UploadCloud, FileJson, Check, AlertCircle, Loader2, Database } from 'lucide-react';
import { StorageService } from '../core/storage';
import { DercEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentData: DercEntry[];
  onImport: (data: DercEntry[]) => void;
}

const BackupModal: React.FC<Props> = ({ isOpen, onClose, currentData, onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    StorageService.exportData(currentData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    try {
      const importedData = await StorageService.importData(file);
      onImport(importedData);
      onClose();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/5 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Backup & Recuperación</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Protección contra pérdida de datos del navegador</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-black uppercase">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={handleExport}
              className="flex flex-col items-center gap-4 p-8 bg-zinc-950/50 border border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <DownloadCloud className="w-7 h-7 text-indigo-500 group-hover:text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white uppercase tracking-widest">Crear Respaldo</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Descarga .OTRK Local</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex flex-col items-center gap-4 p-8 bg-zinc-950/50 border border-white/5 rounded-[2rem] hover:border-emerald-500/30 transition-all group disabled:opacity-50"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".otrk,.json" className="hidden" />
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                {isImporting ? <Loader2 className="w-7 h-7 text-emerald-500 animate-spin group-hover:text-white" /> : <UploadCloud className="w-7 h-7 text-emerald-500 group-hover:text-white" />}
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white uppercase tracking-widest">Importar Datos</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Restaurar de un archivo</p>
              </div>
            </button>
          </div>

          <div className="bg-zinc-950 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                <Database className="w-5 h-5 text-zinc-600" />
             </div>
             <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Estado de la Base de Datos</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">{currentData.length} Registros Activos / Inactivos</p>
             </div>
          </div>

          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center leading-relaxed italic">
            Importante: Al importar un archivo, los datos actuales serán REEMPLAZADOS por el contenido del respaldo. Asegúrese de guardar una copia antes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;

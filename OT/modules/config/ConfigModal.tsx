
import React from 'react';
import { X, Settings2, Clock, Zap, Info, Palette, ShieldCheck, Monitor, Check, Keyboard, ArrowLeft } from 'lucide-react';
import { PresentationType, GlobalConfig, AppTheme } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: GlobalConfig;
  onUpdate: (newConfig: GlobalConfig) => void;
}

const ConfigModal: React.FC<Props> = ({ isOpen, onClose, config, onUpdate }) => {
  const [activeTab, setActiveTab] = React.useState<'main' | 'shortcuts'>('main');

  if (!isOpen) return null;

  const handleTimeChange = (val: string) => {
    onUpdate({ ...config, shiftCutoffTime: val });
  };

  const setTheme = (theme: AppTheme) => {
    onUpdate({ ...config, theme });
  };

  const THEMES: { id: AppTheme; name: string; color: string; desc: string; isLight?: boolean }[] = [
    { id: 'obsidian', name: 'Obsidian', color: 'bg-indigo-600', desc: 'Índigo Profundo', isLight: false },
    { id: 'pearl', name: 'Pearl', color: 'bg-white border-zinc-200', desc: 'Alta Claridad', isLight: true },
  ];

  const isLight = config.theme === 'pearl';

  return (
    <div className={`fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300 ${isLight ? 'bg-black/40' : 'bg-black/90'}`}>
      <div className={`border w-full max-w-3xl rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-white/5'}`}>

        {/* HEADER COMPACTO */}
        <div className={`px-8 py-5 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-600/20 border-indigo-500/20'}`}>
              <Settings2 className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            </div>
            <div>
              <h2 className={`text-base font-black uppercase tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Cámara de Control</h2>
              <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Planta Industrial v2.1</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-all ${isLight ? 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900' : 'text-zinc-600 hover:text-white hover:bg-zinc-800'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DINÁMICO */}
        {activeTab === 'main' ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 divide-x ${isLight ? 'divide-zinc-200' : 'divide-white/5'}`}>
            {/* COLUMNA IZQUIERDA: GESTIÓN TEMPORAL */}
            <div className="p-6 space-y-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Cronología de Jornada</h3>
                </div>
                <div className={`p-6 border rounded-[2rem] flex flex-col gap-6 ${isLight ? 'bg-zinc-50 border-zinc-200 shadow-inner' : 'bg-zinc-950 border-zinc-800 shadow-inner'}`}>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-zinc-950' : 'text-white'}`}>Corte de Turno</p>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase mt-1">El sistema reiniciará la Mesa automáticamente a esta hora.</p>
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="time" value={config.shiftCutoffTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className={`border rounded-2xl px-6 py-4 text-2xl font-black text-amber-600 outline-none transition-all focus:ring-4 focus:ring-amber-500/10 ${isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-800'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
                <Info className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                  Los pesos estándar por presentación se configuran dinámicamente desde el menú <span className="text-indigo-400">Balanza</span> en la Mesa de Trabajo.
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA: ESTÉTICA Y DIAGNÓSTICO */}
            <div className={`p-6 space-y-8 ${isLight ? 'bg-white' : 'bg-zinc-950/20'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Atmósfera</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${config.theme === theme.id
                        ? (isLight && theme.id === 'pearl' ? 'bg-zinc-100 border-indigo-400 shadow-inner' : 'bg-zinc-900 border-indigo-500/40')
                        : (isLight ? 'bg-white border-zinc-200 hover:border-zinc-300' : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700')
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${theme.color} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                        {config.theme === theme.id ? (
                          <Check className={`w-4 h-4 ${theme.isLight ? 'text-indigo-600' : 'text-white'}`} />
                        ) : (
                          <Monitor className={`w-4 h-4 ${isLight ? 'text-zinc-300' : 'text-white/20'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${config.theme === theme.id ? (isLight ? 'text-zinc-900' : 'text-white') : 'text-zinc-500'}`}>{theme.name}</p>
                        <p className="text-[7px] font-bold uppercase text-zinc-600 leading-none">{theme.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Personalización</h3>
                </div>
                <button
                  onClick={() => setActiveTab('shortcuts')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Accesos Rápidos</p>
                      <p className="text-[7px] font-bold uppercase text-zinc-500">Configurar Alt + Keys</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>
                    Editar
                  </div>
                </button>
              </div>

              <div className={`border p-4 rounded-2xl space-y-4 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  <span className="text-[8px] font-black text-zinc-500 uppercase">Diagnóstico Core</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-black/40 border-white/5'}`}>
                    <p className="text-[6px] text-zinc-400 font-black uppercase mb-0.5">Persistent Cache</p>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Activo</p>
                  </div>
                  <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-black/40 border-white/5'}`}>
                    <p className="text-[6px] text-zinc-400 font-black uppercase mb-0.5">Analytic Engine</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">V1.6 IQ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('main')} className={`p-2 rounded-full transition-all ${isLight ? 'hover:bg-zinc-100 text-zinc-400' : 'hover:bg-white/5 text-zinc-500'}`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Configuración de Radar Táctico</h3>
                <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">Personalizar combinaciones de Alt + Tecla</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'OPEN_NEW_LOT', label: 'Nuevo Lote', desc: 'Crear', default: 'N' },
                { id: 'OPEN_SCALE', label: 'Balanza', desc: 'Calibrar', default: 'B' },
                { id: 'OPEN_IMPORT', label: 'Importar', desc: 'Escanear', default: 'I' },
                { id: 'OPEN_HANGAR', label: 'Hangar', desc: 'Seleccionar', default: 'H' },
                { id: 'OPEN_CONFIG', label: 'Settings', desc: 'Config', default: 'C' },
                { id: 'OPEN_INTEL', label: 'Audit IQ', desc: 'Analizar', default: 'J' },
                { id: 'CLEAR_MESA', label: 'Limpiar', desc: 'Vaciar', default: 'L' },
                { id: 'SAVE_ALL', label: 'Guardar', desc: 'Sync', default: 'G' },
                { id: 'TOGGLE_HEADER', label: 'Cabecera', desc: 'Anclar', default: 'P' },
              ].map((item) => (
                <div key={item.id} className={`p-3 border rounded-2xl flex items-center justify-between gap-3 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-white/5 text-white'}`}>
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-[5px] font-black opacity-40 mb-0.5">ALT</span>
                        <span className="text-[10px] font-black">{(config.shortcuts?.[item.id] || item.default).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[9px] font-black uppercase tracking-tight truncate ${isLight ? 'text-zinc-950' : 'text-white'}`}>{item.label}</p>
                      <p className="text-[7px] font-bold text-zinc-500 uppercase truncate">{item.desc}</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    maxLength={1}
                    value={config.shortcuts?.[item.id] || item.default}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (val) onUpdate({ ...config, shortcuts: { ...config.shortcuts, [item.id]: val } });
                    }}
                    className={`w-8 h-8 rounded-lg border text-center font-black text-indigo-500 text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-800'}`}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                Solo se permite una letra para la combinación <span className="text-amber-500">Alt + [Tecla]</span>. Los atajos globales de sistema tienen prioridad.
              </p>
            </div>
          </div>
        )}

        {/* ACCIÓN FINAL */}
        <div className={`px-8 py-6 border-t flex gap-4 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-white/5'}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 ${isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_15px_40px_rgba(79,70,229,0.3)]'}`}
          >
            <Zap className="w-4 h-4" /> {activeTab === 'shortcuts' ? 'Guardar Atajos' : 'Sincronizar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;

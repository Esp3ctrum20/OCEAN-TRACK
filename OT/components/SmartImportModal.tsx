import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Zap, Check, AlertCircle, Sparkles, Layers, ArrowRight, Eye, ShieldAlert, Image as ImageIcon, Camera, Loader2, UploadCloud, Edit3, Trash2, Database, FileText, Image } from 'lucide-react';
import { PresentationType, DercEntry, AppTheme } from '../types';
import { parseMultiExcelPaste } from '../core/importer';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  factors: Record<PresentationType, number>;
  existingDercs: DercEntry[];
  theme?: AppTheme;
}

const SmartImportModal: React.FC<Props> = ({ isOpen, onClose, onImport, factors, existingDercs, theme }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'paste' | 'validate'>('paste');
  const [importMode, setImportMode] = useState<'text' | 'image'>('text');
  const [resetProduction, setResetProduction] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'pearl';

  const normalizeTalla = (t: string) => {
    if (!t) return 'N/A';
    return String(t).replace('#', '').trim();
  };
  
  const getNumericSequence = (dercId: string) => {
    if (!dercId || typeof dercId !== 'string') return 0;
    const match = dercId.match(/DERC-(\d+)/i) || dercId.match(/(\d{5})/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const normalizeType = (t: string): PresentationType => {
    if (!t) return 'Tallo Coral';
    const val = String(t).toLowerCase();
    if (val.includes('coral') || val.includes('tallo y') || val.match(/tallo\s+coral/)) return 'Tallo Coral';
    if (val.includes('solo') || val.match(/tallo\s+solo/)) return 'Tallo Solo';
    if (val.includes('valva') || val.match(/media\s+valva/)) return 'Media Valva';
    return 'Tallo Coral';
  };

  const detectedData = useMemo(() => {
    let data: any[] = [];
    if (importMode === 'image') {
      data = scannedData;
    } else {
      if (!text.trim()) return [];
      try {
        const parsed = parseMultiExcelPaste(text, factors, resetProduction);
        data = parsed.map(p => ({
          ...p,
          presentations: p.presentations?.map(pres => ({
            ...pres,
            type: normalizeType(pres.type),
            records: (pres.records || []).map(r => ({ ...r, talla: normalizeTalla(r.talla) }))
          }))
        }));
      } catch (e) {
        return [];
      }
    }
    return [...data].sort((a, b) => getNumericSequence(a.dercId) - getNumericSequence(b.dercId));
  }, [text, factors, scannedData, importMode, resetProduction]);

  const duplicatesCount = useMemo(() => {
    return detectedData.filter(p => existingDercs.some(e => e.dercId === p.dercId)).length;
  }, [detectedData, existingDercs]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await processImageWithGemini(base64Data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error al procesar la imagen.");
      setIsScanning(false);
    }
  };

  const processImageWithGemini = async (base64Image: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentYear = new Date().getFullYear();
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

      const prompt = `Analiza detalladamente esta imagen que contiene uno o más bloques de producción de Scallops...`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dercId: { type: Type.STRING },
                lote: { type: Type.STRING },
                date: { type: Type.STRING },
                totalConcha: { type: Type.NUMBER },
                presentations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      records: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            talla: { type: Type.STRING },
                            cant: { type: Type.NUMBER },
                            entreg: { type: Type.NUMBER },
                            saldo: { type: Type.NUMBER }
                          }
                        }
                      }
                    }
                  }
                }
              },
              required: ["dercId", "lote", "presentations"]
            }
          }
        }
      });

      if (!response.text) throw new Error("Respuesta vacía del modelo");
      const parsed = JSON.parse(response.text);
      const finalData = (Array.isArray(parsed) ? parsed : [parsed]).map((entry: any) => {
        const rawId = String(entry.dercId || '00000').toUpperCase();
        const fullDercId = rawId.includes('DERC') ? rawId : `DERC-${rawId}-${currentYear}-${currentMonth}/SEC`;
        return {
          ...entry,
          dercId: fullDercId,
          lote: String(entry.lote || (rawId.length === 5 ? rawId : `LOTE-${rawId}`)),
          date: entry.date || new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          totalConcha: Number(entry.totalConcha) || 0,
          presentations: (entry.presentations || []).map((p: any) => {
            const type = normalizeType(p.type);
            const factor = factors[type] || 10;
            const records = (p.records || []).map((r: any) => {
              const boxes = Math.round((Number(r.cant) || 0) / factor);
              return {
                id: Math.random().toString(36).substr(2, 9),
                talla: normalizeTalla(r.talla || 'N/A'),
                cant: Number(r.cant) || 0,
                cajasT: boxes,
                entreg: 0,
                cajasP: boxes,
                kilosT: 0,
                saldo: 0
              };
            });
            return { type, factor, records, total: records.reduce((acc: number, r: any) => acc + r.cant, 0) };
          })
        };
      });
      finalData.sort((a: any, b: any) => getNumericSequence(a.dercId) - getNumericSequence(b.dercId));
      setScannedData(finalData);
      setStep('validate');
    } catch (err) {
      setError("Error en el escaneo IA. Por favor intenta con una imagen más clara o usa el modo texto.");
    } finally {
      setIsScanning(false);
    }
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newData = [...detectedData];
    newData[index] = { ...newData[index], [field]: value };
    setScannedData(newData);
  };

  const removeEntry = (index: number) => {
    setScannedData(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setText('');
    setScannedData([]);
    setStep('paste');
    setError(null);
  };

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-lg animate-in fade-in duration-300 ${isLight ? 'bg-black/30' : 'bg-black/80'}`}>
      <div className={`border w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden transition-all ${isLight ? 'bg-white border-zinc-200 shadow-zinc-400/20' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className={`px-8 py-6 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-950/50 border-zinc-800'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600'}`}>
              {isScanning ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Zap className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight uppercase ${isLight ? 'text-zinc-950' : 'text-white'}`}>Importación Inteligente</h2>
              <p className="text-xs text-zinc-500 font-medium">Extrae datos de Excel o capturas de pantalla.</p>
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} className={`transition-colors p-2 rounded-full ${isLight ? 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-black uppercase">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {step === 'paste' && !isScanning ? (
            <div className="space-y-6">
              <div className={`flex p-1.5 rounded-2xl border w-full max-w-md mx-auto ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <button onClick={() => setImportMode('text')} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'text' ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-zinc-800 text-white shadow-lg') : 'text-zinc-500'}`}><FileText className="w-4 h-4" /> Texto</button>
                <button onClick={() => setImportMode('image')} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'image' ? (isLight ? 'bg-white text-amber-600 shadow-sm' : 'bg-amber-600 text-white shadow-lg') : 'text-zinc-500'}`}><ImageIcon className="w-4 h-4" /> Imagen (IA)</button>
              </div>

              {importMode === 'text' ? (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <button onClick={() => setResetProduction(true)} className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${resetProduction ? (isLight ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm' : 'bg-indigo-600 border-indigo-400 text-white') : (isLight ? 'bg-white border-zinc-100 text-zinc-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500')}`}><Trash2 className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Importar como Lote Nuevo</span></button>
                    <button onClick={() => setResetProduction(false)} className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${!resetProduction ? (isLight ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm' : 'bg-emerald-600 border-emerald-400 text-white') : (isLight ? 'bg-white border-zinc-100 text-zinc-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500')}`}><Database className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Importar con Avance Actual</span></button>
                  </div>
                  <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Pega aquí el contenido copiado de Excel..." className={`w-full h-56 border-2 border-dashed rounded-2xl p-6 text-xs font-mono outline-none resize-none transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:border-indigo-400' : 'bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-indigo-500/50'}`} />
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className={`w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer group transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 hover:border-amber-400' : 'bg-zinc-950 border-zinc-800 hover:border-amber-500/50'}`}>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <UploadCloud className="w-16 h-16 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                  <p className={`text-base font-black uppercase tracking-widest ${isLight ? 'text-zinc-950' : 'text-white'}`}>Subir Captura de Producción</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-2 font-bold tracking-widest">Formatos soportados: JPG, PNG • Detección automática de bloques</p>
                </div>
              )}
            </div>
          ) : isScanning ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-8">
               <div className="relative">
                 <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                 <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-pulse" />
               </div>
               <p className={`text-sm font-black uppercase tracking-widest animate-pulse ${isLight ? 'text-zinc-950' : 'text-white'}`}>Analizando estructura de bloques DERC...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <p className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-amber-800' : 'text-amber-100/70'}`}>Validación de Registros (Orden Jerárquico)</p>
                </div>
                {duplicatesCount > 0 && <span className="text-[10px] bg-rose-600 text-white px-3 py-1 rounded-full font-black uppercase">{duplicatesCount} Duplicados</span>}
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {detectedData.map((d, i) => (
                  <div key={i} className={`border p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center transition-all ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div className="space-y-1"><label className="text-[9px] font-black text-zinc-500 uppercase">DERC ID</label><input value={d.dercId} onChange={(e) => updateEntry(i, 'dercId', e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-sm font-black uppercase outline-none focus:border-indigo-400 ${isLight ? 'bg-white border-zinc-200 text-indigo-700' : 'bg-zinc-900 border-zinc-800 text-indigo-400'}`} /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-zinc-500 uppercase">Lote</label><input value={d.lote} onChange={(e) => updateEntry(i, 'lote', e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-sm font-black uppercase outline-none focus:border-indigo-400 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`} /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-zinc-500 uppercase">Estado</label><div className="flex items-center gap-2"><span className="text-[11px] font-black px-4 py-2 rounded-lg bg-emerald-600 text-white">{d.presentations?.reduce((acc: number, p: any) => acc + (p.total || 0), 0).toLocaleString()} KG</span></div></div>
                    </div>
                    <button onClick={() => removeEntry(i)} className={`p-3 rounded-xl transition-all ${isLight ? 'text-zinc-300 hover:bg-rose-50 hover:text-rose-600' : 'text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10'}`}><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isScanning && (
            <div className={`flex gap-4 pt-8 border-t mt-8 ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'}`}>
              <button onClick={() => step === 'paste' ? onClose() : setStep('paste')} className={`flex-1 px-6 py-4 rounded-2xl border text-zinc-500 font-bold text-[10px] uppercase tracking-widest transition-all ${isLight ? 'bg-white border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}>Regresar</button>
              <button
                onClick={step === 'paste' ? () => { if (detectedData.length > 0) { setScannedData(detectedData); setStep('validate'); } else setError("No se detectaron datos."); } : () => { onImport(detectedData); reset(); onClose(); }}
                disabled={detectedData.length === 0}
                className={`flex-1 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-white shadow-xl disabled:opacity-30 ${resetProduction ? 'bg-indigo-600' : 'bg-emerald-600'}`}
              >
                {step === 'paste' ? <>Siguiente Paso <ArrowRight className="w-4 h-4" /></> : <>Finalizar Importación <Check className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartImportModal;
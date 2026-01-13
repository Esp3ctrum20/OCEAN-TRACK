
import { DercEntry, PresentationType, TallaRecord } from '../../../types';

export const generateFichaCanvas = async (
  canvas: HTMLCanvasElement,
  target: DercEntry | DercEntry[],
  totalKg: number,
  yieldPct: number,
  qrUrl: string
): Promise<string> => {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get canvas context');

  const isConsolidated = Array.isArray(target);
  const dercs = isConsolidated ? target : [target];

  // Resolución Master 4K (9:16)
  const W = 1440;
  const H = 2560;
  canvas.width = W;
  canvas.height = H;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // --- Cálculos Globales para el Cuadro de Referencia ---
  const globalTotalConcha = dercs.reduce((acc, d) => 
    acc + d.presentations.reduce((pA, p) => pA + p.records.reduce((rA, r) => rA + r.cant, 0), 0)
  , 0);

  const globalTotalCoral = dercs.reduce((acc, d) => 
    acc + d.presentations.filter(p => p.type === 'Tallo Coral' || p.type === 'Media Valva')
      .reduce((pA, p) => pA + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0)
  , 0);

  const globalTotalSolo = dercs.reduce((acc, d) => 
    acc + d.presentations.filter(p => p.type === 'Tallo Solo')
      .reduce((pA, p) => pA + p.records.reduce((rA, r) => rA + r.kilosT, 0), 0)
  , 0);

  // --- 1. FONDO ---
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0a0a0c');
  bgGrad.addColorStop(1, '#020203');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Textura
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.012)';
  ctx.lineWidth = 2;
  for(let i=0; i<H; i+=8) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
  }

  // --- 2. HEADER ---
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 0, W, 12);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '900 20px Inter, sans-serif';
  ctx.letterSpacing = '16px';
  ctx.fillText(`OCEANTRACK ${isConsolidated ? 'CONSOLIDATED v7.5' : 'BI-ANALYSIS v6.0'}`, 100, 100);

  // --- 3. IDENTIFICADORES ---
  ctx.save();
  ctx.letterSpacing = isConsolidated ? '-5px' : '-10px';
  ctx.fillStyle = '#ffffff';
  
  // Si es consolidado, quitamos el título gigante y dejamos espacio
  if (!isConsolidated) {
    ctx.font = '900 220px Inter, sans-serif';
    ctx.fillText(dercs[0].lote.toUpperCase(), 90, 320);
    ctx.letterSpacing = '2px';
    ctx.fillStyle = '#6366f1';
    ctx.font = '900 42px Inter, sans-serif';
    ctx.fillText(`DERC ID: ${dercs[0].dercId} • REGISTRO DE PLANTA`, 100, 410);
  } else {
    // Para consolidado, el título es más sobrio y se desplaza el contenido
    ctx.letterSpacing = '2px';
    ctx.fillStyle = '#6366f1';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.fillText(`JORNADA DE PRODUCCIÓN • ${dercs.length} LOTES PROCESADOS`, 100, 220);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillText(`BALANCE MAESTRO • PERIODO ACTUAL`, 100, 280);
  }
  ctx.restore();

  // --- 4. CUADRO DE RESUMEN EJECUTIVO (BASADO EN REFERENCIA) ---
  let currentY = isConsolidated ? 380 : 520;
  
  if (isConsolidated) {
    const tableW = 800;
    const tableX = 100;
    const rowH = 75;
    
    // Fondo del cuadro
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.beginPath(); ctx.roundRect(tableX, currentY, tableW, rowH * 4, 30); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 2; ctx.stroke();

    const drawRow = (y: number, label: string, value: string, isLast = false, isHighlight = false) => {
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'left';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillStyle = isHighlight ? '#6366f1' : '#52525b';
      ctx.fillText(label.toUpperCase(), tableX + 40, y + 48);
      
      ctx.textAlign = 'right';
      ctx.font = '900 32px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(value, tableX + tableW - 40, y + 48);
      
      if (!isLast) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath(); ctx.moveTo(tableX + 20, y + rowH); ctx.lineTo(tableX + tableW - 20, y + rowH); ctx.stroke();
      }
    };

    drawRow(currentY, 'FECHA JORNADA', dercs[0].date);
    drawRow(currentY + rowH, 'TOTAL CONCHA (M.P.)', `${globalTotalConcha.toLocaleString()} KG`, false, true);
    drawRow(currentY + rowH * 2, 'TOTAL TALLO CORAL', `${globalTotalCoral.toLocaleString()} KG`);
    drawRow(currentY + rowH * 3, 'TOTAL TALLO SOLO', `${globalTotalSolo.toLocaleString()} KG`, true);
    
    currentY += (rowH * 4) + 80;
  }

  // --- 5. KPIs PRINCIPALES (BLOQUES DINÁMICOS) ---
  const MARGIN_X = 100;
  const perfColor = yieldPct >= 100 ? '#22d3ee' : yieldPct >= 97 ? '#10b981' : '#f59e0b';
  
  const drawKPIs = (y: number) => {
    const blockH = 340; 
    const gap = 30;
    const blockW = (W - (MARGIN_X * 2) - (gap * 2)) / 3;

    const drawBox = (x: number, label: string, val: string, unit: string, sub: string, color: string, isSpecial: boolean = false) => {
      ctx.fillStyle = isSpecial ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)';
      ctx.beginPath(); ctx.roundRect(x, y, blockW, blockH, 50); ctx.fill();
      const cx = x + (blockW/2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#52525b';
      ctx.font = '900 20px Inter, sans-serif'; ctx.letterSpacing = '4px';
      ctx.fillText(label.toUpperCase(), cx, y + 80);
      ctx.fillStyle = color;
      ctx.font = '900 86px Inter, sans-serif'; ctx.letterSpacing = '-4px';
      const vW = ctx.measureText(val).width;
      const uW = unit ? ctx.measureText(unit).width * 0.4 + 10 : 0;
      const startX = cx - (vW + uW)/2;
      ctx.textAlign = 'left';
      ctx.fillText(val, startX, y + 190);
      if(unit) {
        ctx.fillStyle = isSpecial ? color : 'rgba(255,255,255,0.3)';
        ctx.font = '900 32px Inter, sans-serif';
        ctx.fillText(unit, startX + vW + 10, y + 190);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = isSpecial ? color : 'rgba(255,255,255,0.1)';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillText(sub, cx, y + 270);
    };

    // Bloques solicitados: Entrada Total (Concha), Salida Neta (Entregado), Rendimiento General
    drawBox(MARGIN_X, 'Entrada Total', globalTotalConcha.toLocaleString(), 'KG', 'VALOR BRUTO', '#ffffff');
    drawBox(MARGIN_X + blockW + gap, 'Salida Neta', totalKg.toLocaleString(), 'KG', 'PRODUCTO FINAL', '#6366f1');
    drawBox(MARGIN_X + (blockW + gap) * 2, 'Rendimiento', `${yieldPct.toFixed(2)}`, '%', 'EFICIENCIA', perfColor, true);
    return y + blockH + 60; 
  };

  currentY = drawKPIs(currentY);

  // Tablas Agregadas
  const drawAggregatedTable = (y: number, title: string, types: PresentationType[], accent: string) => {
    const tallas: Record<string, { cant: number; kilosT: number; saldo: number }> = {};
    dercs.forEach(d => {
      d.presentations.filter(p => types.includes(p.type)).forEach(p => {
        p.records.forEach(r => {
          if(!tallas[r.talla]) tallas[r.talla] = { cant: 0, kilosT: 0, saldo: 0 };
          tallas[r.talla].cant += r.cant;
          tallas[r.talla].kilosT += r.kilosT;
          tallas[r.talla].saldo += (r.saldo || 0);
        });
      });
    });

    const rows = Object.entries(tallas)
      .filter(([_, data]) => data.cant > 0 || data.kilosT > 0)
      .sort((a, b) => {
        const getP = (t: string) => parseInt(t.match(/\d+/)?.[0] || '999');
        return getP(a[0]) - getP(b[0]);
      });

    if (rows.length === 0) return y;

    const rowHeight = 85; const headerHeight = 160; const footerHeight = 110;
    const tableH = headerHeight + (rows.length * rowHeight) + footerHeight;
    ctx.fillStyle = 'rgba(255,255,255,0.01)';
    ctx.beginPath(); ctx.roundRect(MARGIN_X, y, W - 200, tableH, 50); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = accent;
    ctx.font = '900 30px Inter, sans-serif'; ctx.letterSpacing = '8px';
    ctx.fillText(title.toUpperCase(), W/2, y + 75);
    
    const cols = ['TALLA', 'SALIDA (KG)', 'ENTRADA (KG)', 'SALDO (KG)', 'REND. %'];
    const colXs = [160, 390, 660, 930, 1180];
    ctx.fillStyle = '#52525b'; ctx.font = '900 20px Inter, sans-serif'; ctx.textAlign = 'left'; ctx.letterSpacing = '2px';
    cols.forEach((col, i) => ctx.fillText(col, colXs[i], y + 135));
    ctx.letterSpacing = '0px';
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(MARGIN_X + 40, y + 160); ctx.lineTo(W - MARGIN_X - 40, y + 160); ctx.stroke();
    
    let rY = y + 220;
    rows.forEach(([talla, data]) => {
      ctx.fillStyle = '#ffffff'; ctx.font = '900 32px Inter, sans-serif'; ctx.fillText(talla, colXs[0], rY);
      ctx.font = '900 30px Inter, sans-serif'; ctx.fillText(data.kilosT.toLocaleString(), colXs[1], rY);
      ctx.fillText(data.cant.toLocaleString(), colXs[2], rY);
      ctx.fillStyle = data.saldo > 0 ? '#f59e0b' : '#3f3f46';
      ctx.fillText(data.saldo.toLocaleString(), colXs[3], rY);
      const rP = data.cant > 0 ? (data.kilosT / data.cant) * 100 : 0;
      ctx.fillStyle = rP >= 100 ? '#22d3ee' : rP >= 97 ? '#10b981' : '#f59e0b';
      ctx.fillText(`${rP.toFixed(2)}%`, colXs[4], rY);
      rY += rowHeight;
    });

    const totalEnt = rows.reduce((a, b) => a + b[1].cant, 0);
    const totalSal = rows.reduce((a, b) => a + b[1].kilosT, 0);
    const totalSald = rows.reduce((a, b) => a + b[1].saldo, 0);

    ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(MARGIN_X + 40, rY - 40); ctx.lineTo(W - MARGIN_X - 40, rY - 40); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = '900 32px Inter, sans-serif'; 
    ctx.fillText('TOTAL', colXs[0], rY + 15);
    ctx.fillText(totalSal.toLocaleString(), colXs[1], rY + 15);
    ctx.fillText(totalEnt.toLocaleString(), colXs[2], rY + 15);
    ctx.fillStyle = totalSald > 0 ? '#f59e0b' : '#ffffff';
    ctx.fillText(totalSald.toLocaleString(), colXs[3], rY + 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${(totalEnt > 0 ? (totalSal/totalEnt)*100 : 0).toFixed(2)}%`, colXs[4], rY + 15);
    return y + tableH + 40;
  };

  currentY = drawAggregatedTable(currentY, 'Principal: Coral / Valva', ['Tallo Coral', 'Media Valva'], '#10b981');
  currentY = drawAggregatedTable(currentY, 'Agregado: Tallo Solo', ['Tallo Solo'], '#3b82f6');

  // --- 6. SELLO DE CERTIFICACIÓN ---
  const sealY = Math.max(currentY + 60, H - 450); 
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.beginPath(); ctx.roundRect(MARGIN_X, sealY, W - (MARGIN_X * 2), 340, 70); ctx.fill();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0px';

  const centerX = W / 2;
  const sealTop = sealY + 100;
  ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(centerX, sealTop, 65, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'; ctx.beginPath(); ctx.arc(centerX, sealTop, 55, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(centerX - 25, sealTop); ctx.lineTo(centerX - 5, sealTop + 20); ctx.lineTo(centerX + 30, sealTop - 25); ctx.stroke();

  ctx.fillStyle = '#ffffff'; ctx.font = '900 44px Inter, sans-serif'; ctx.letterSpacing = '1px';
  ctx.fillText('CERTIFICADO DE CONFORMIDAD', centerX, sealY + 220);
  
  ctx.font = 'italic 500 40px Inter, sans-serif'; ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.fillText(`OceanTrack Intelligence • Consolidated Batch (${dercs.length} Units)`, centerX, sealY + 275);

  ctx.fillStyle = '#3f3f46'; ctx.font = '700 20px Inter, sans-serif'; ctx.letterSpacing = '1px';
  const authCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  ctx.fillText(`ID: ${authCode} • ${new Date().toLocaleDateString('es-PE')} • REPORTE MAESTRO`, centerX, sealY + 315);
  ctx.restore();

  // --- 7. CIERRE ---
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.font = '900 18px Inter, sans-serif'; ctx.letterSpacing = '20px';
  ctx.fillText('OCEANTRACK BI-ANALYSIS INDUSTRIAL RECORD', W/2, H - 40);
  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
};


import { DercEntry, PresentationType } from '../types';

/**
 * Genera un Reporte Consolidado Profesional para múltiples lotes.
 */
export const exportProductionReport = (dercs: DercEntry[], reportTitle: string = "Reporte de Producción") => {
  if (dercs.length === 0) return;

  // Cálculos consolidados para el Resumen Maestro
  const masterTallas: Record<string, { entrada: number; salida: number }> = {};
  let globalTotalConcha = 0;
  let globalTotalProcesado = 0;

  dercs.forEach(d => {
    globalTotalConcha += d.totalConcha;
    d.presentations.forEach(p => {
      p.records.forEach(r => {
        const key = `${p.type}_${r.talla}`;
        if (!masterTallas[key]) masterTallas[key] = { entrada: 0, salida: 0 };
        masterTallas[key].entrada += r.cant;
        masterTallas[key].salida += r.kilosT;
        globalTotalProcesado += r.kilosT;
      });
    });
  });

  const excelStyles = `
    <style>
      body { font-family: 'Segoe UI', sans-serif; }
      table { border-collapse: collapse; width: 100%; }
      td { border: 0.5pt solid #e4e4e7; padding: 6px 10px; font-size: 9pt; }
      .header-master { background-color: #0c0c0e; color: #ffffff; font-weight: bold; text-align: center; font-size: 14pt; height: 40pt; }
      .header-section { background-color: #f4f4f5; color: #18181b; font-weight: bold; text-transform: uppercase; font-size: 10pt; height: 25pt; }
      .header-coral { background-color: #10b981; color: #ffffff; font-weight: bold; text-align: center; }
      .header-solo { background-color: #3b82f6; color: #ffffff; font-weight: bold; text-align: center; }
      .header-valva { background-color: #f59e0b; color: #ffffff; font-weight: bold; text-align: center; }
      .sub-header { background-color: #fafafa; color: #71717a; font-weight: bold; text-align: center; font-size: 8pt; }
      .num { mso-number-format: "#,##0.00"; text-align: right; }
      .num-pct { mso-number-format: "0.00%"; text-align: center; font-weight: bold; }
      .total-row { background-color: #f8fafc; font-weight: bold; }
      .highlight { color: #4f46e5; font-weight: bold; }
      .yield-good { color: #059669; }
      .yield-bad { color: #dc2626; }
    </style>
  `;

  let htmlContent = "";

  // SECCIÓN 1: RESUMEN MAESTRO CONSOLIDADO
  htmlContent += `
    <tr><td colspan="6" class="header-master">${reportTitle.toUpperCase()}</td></tr>
    <tr><td colspan="6" style="text-align: center; color: #71717a;">Generado el ${new Date().toLocaleString()} • ${dercs.length} Lotes Procesados</td></tr>
    <tr><td colspan="6" class="header-section">RESUMEN MAESTRO DE RENDIMIENTOS</td></tr>
    <tr class="sub-header">
      <td colspan="2">PRESENTACIÓN / TALLA</td>
      <td>ENTRADA (KG)</td>
      <td>SALIDA (KG)</td>
      <td>RENDIMIENTO %</td>
      <td>PART. %</td>
    </tr>
  `;

  Object.entries(masterTallas).sort().forEach(([key, data]) => {
    const [type, talla] = key.split('_');
    const rend = data.entrada > 0 ? (data.salida / data.entrada) : 0;
    const part = globalTotalProcesado > 0 ? (data.salida / globalTotalProcesado) : 0;
    
    htmlContent += `
      <tr>
        <td style="color: #71717a;">${type}</td>
        <td style="font-weight: bold;">${talla}</td>
        <td class="num">${data.entrada.toFixed(2)}</td>
        <td class="num">${data.salida.toFixed(2)}</td>
        <td class="num-pct ${rend >= 0.98 ? 'yield-good' : 'yield-bad'}">${(rend * 100).toFixed(2)}%</td>
        <td class="num-pct" style="color: #a1a1aa;">${(part * 100).toFixed(1)}%</td>
      </tr>
    `;
  });

  htmlContent += `
    <tr class="total-row">
      <td colspan="2">TOTAL GENERAL CONSOLIDADO</td>
      <td class="num">${Object.values(masterTallas).reduce((a, b) => a + b.entrada, 0).toFixed(2)}</td>
      <td class="num">${globalTotalProcesado.toFixed(2)}</td>
      <td class="num-pct">${((globalTotalProcesado / Object.values(masterTallas).reduce((a, b) => a + b.entrada, 0)) * 100).toFixed(2)}%</td>
      <td>100%</td>
    </tr>
    <tr><td colspan="6" style="height: 30pt; border: none;"></td></tr>
  `;

  // SECCIÓN 2: DETALLE INDIVIDUAL POR LOTE
  htmlContent += `<tr><td colspan="6" class="header-section">DETALLE DESGLOSADO POR LOTE</td></tr>`;

  dercs.forEach(derc => {
    htmlContent += `
      <tr>
        <td colspan="2" class="highlight" style="background-color: #f1f5f9;">LOTE: ${derc.lote}</td>
        <td colspan="2" class="highlight" style="background-color: #f1f5f9;">DERC: ${derc.dercId}</td>
        <td colspan="2" class="highlight" style="background-color: #f1f5f9;">FECHA: ${derc.date}</td>
      </tr>
    `;

    derc.presentations.forEach(p => {
      const isCoral = p.type === 'Tallo Coral';
      const isSolo = p.type === 'Tallo Solo';
      const headerClass = isCoral ? 'header-coral' : isSolo ? 'header-solo' : 'header-valva';

      htmlContent += `
        <tr>
          <td colspan="4" class="${headerClass}">${p.type.toUpperCase()}</td>
          <td class="${headerClass}">SUBTOTAL</td>
          <td class="${headerClass} num">${p.total.toFixed(2)}</td>
        </tr>
        <tr class="sub-header">
          <td>TALLA</td>
          <td>SALIDA (ENTRADA)</td>
          <td>ENTRADA (KG)</td>
          <td>CAJAS T.</td>
          <td>CAJAS P.</td>
          <td>REND. %</td>
        </tr>
      `;

      p.records.forEach(r => {
        const rend = r.cant > 0 ? (r.kilosT / r.cant) * 100 : 0;
        htmlContent += `
          <tr>
            <td style="text-align: center; font-weight: bold;">${r.talla}</td>
            <td class="num" style="color: #4f46e5;">${r.kilosT.toFixed(2)}</td>
            <td class="num">${r.cant.toFixed(2)}</td>
            <td style="text-align: center;">${r.cajasT}</td>
            <td style="text-align: center; color: ${r.cajasP > 0 ? '#dc2626' : '#059669'};">${r.cajasP}</td>
            <td class="num-pct">${rend.toFixed(2)}%</td>
          </tr>
        `;
      });
    });
    htmlContent += `<tr><td colspan="6" style="height: 15pt; border: none; border-bottom: 1pt solid #e4e4e7;"></td></tr>`;
  });

  const fullHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">${excelStyles}</head>
    <body><table>${htmlContent}</table></body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `REPORTE_CONSOLIDADO_${new Date().toISOString().slice(0,10)}.xls`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};

// Mantener compatibilidad con exportación individual usando el nuevo motor
export const exportDercToExcel = (derc: DercEntry) => {
  exportProductionReport([derc], `Reporte Individual: ${derc.lote}`);
};

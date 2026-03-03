import { useState, useRef } from "react";
import { CATEGORIES, scoreColor, scoreHex } from "../data/scoring";
import { getGHSPictograms, getHPhraseDescription } from "../data/ghsData";
import GHSPictogramRow from "./GHSPictograms";
import RadarChart from "./RadarChart";

function fixSubscripts(str) {
  if (!str) return str;
  const map = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
  return str.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ch => map[ch] || ch);
}

async function renderSvgToDataUrl(svgEl, size = 100) {
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.width = size;
  img.height = size;
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function exportPDF(chemical, cardRef) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const pdf = new jsPDF("p", "mm", "a4");
  const w = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text(chemical.name, margin, y);
  if (chemical.fromSds || chemical.fromSDS || (chemical.concentrations && chemical.concentrations.length > 0)) {
    const nameW = pdf.getTextWidth(chemical.name);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 0, 255);
    pdf.text("[FROM SDS]", margin + nameW + 4, y);
    pdf.setTextColor(0);
  }
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");
  pdf.setTextColor(100);
  pdf.text(`CAS: ${chemical.cas}  |  Formula: ${fixSubscripts(chemical.formula)}  |  MW: ${chemical.molecularWeight}`, margin, y);
  y += 5;
  pdf.text(`State: ${chemical.physicalState}  |  BP: ${chemical.boilingPoint}  |  Flash: ${chemical.flashPoint}`, margin, y);
  y += 5;
  if (chemical.manufacturer) {
    pdf.text(`Manufacturer: ${chemical.manufacturer}`, margin, y);
    y += 5;
  }
  y += 3;

  // Overall score
  pdf.setTextColor(0);
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text(`Overall SSbD Score: ${chemical.overall}/5`, margin, y);
  y += 10;

  // Category scores as image
  try {
    const catEl = cardRef.current?.querySelector(".category-scores-section");
    if (catEl) {
      const catCanvas = await html2canvas(catEl, { backgroundColor: "#ffffff", scale: 2 });
      const catImg = catCanvas.toDataURL("image/png");
      const catW = Math.min(w - margin * 2, 160);
      const catH = (catCanvas.height / catCanvas.width) * catW;
      if (y + catH > 270) { pdf.addPage(); y = 15; }
      pdf.addImage(catImg, "PNG", margin, y, catW, catH);
      y += catH + 4;
    }
  } catch (e) {
    // fallback to text
    pdf.setFontSize(11);
    pdf.text("Category Scores", margin, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    CATEGORIES.forEach(({ key, label }) => {
      const s = chemical.scores[key];
      pdf.text(`${label}: ${s}/5`, margin + 2, y);
      y += 5;
    });
    y += 4;
  }

  // H-phrases
  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  pdf.text("H-Phrases", margin, y);
  y += 6;
  pdf.setFontSize(9);
  pdf.setFont(undefined, "normal");
  chemical.hPhrases.forEach((h) => {
    const desc = getHPhraseDescription(h) || "";
    const line = `${h}: ${desc}`;
    const lines = pdf.splitTextToSize(line, w - margin * 2);
    lines.forEach((l) => {
      if (y > 270) { pdf.addPage(); y = 15; }
      pdf.text(l, margin + 2, y);
      y += 4.5;
    });
  });
  y += 4;

  // Mixture components table
  if (chemical.concentrations && chemical.concentrations.length > 0) {
    if (y > 220) { pdf.addPage(); y = 15; }
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(0);
    pdf.text("Mixture Components", margin, y);
    y += 6;

    pdf.setFontSize(8);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(100);
    const colX = [margin, margin + 55, margin + 85, margin + 110];
    pdf.text("Component", colX[0], y);
    pdf.text("CAS", colX[1], y);
    pdf.text("Conc.", colX[2], y);
    pdf.text("H-Phrases", colX[3], y);
    y += 1;
    pdf.setDrawColor(180);
    pdf.line(margin, y, w - margin, y);
    y += 3;

    pdf.setFont(undefined, "normal");
    pdf.setTextColor(0);
    chemical.concentrations.forEach((c) => {
      if (y > 270) { pdf.addPage(); y = 15; }
      const nameLines = pdf.splitTextToSize(c.name || "", 50);
      const hStr = (c.hPhrases || []).join(", ");
      const hLines = pdf.splitTextToSize(hStr, w - margin - colX[3]);
      const rowLines = Math.max(nameLines.length, hLines.length, 1);
      nameLines.forEach((l, i) => pdf.text(l, colX[0], y + i * 4));
      pdf.text(c.cas || "", colX[1], y);
      pdf.text(c.concentration || "", colX[2], y);
      hLines.forEach((l, i) => pdf.text(l, colX[3], y + i * 4));
      y += rowLines * 4 + 2;
    });
    y += 4;
  }

  // GHS pictograms as images
  const ghsIds = getGHSPictograms(chemical.hPhrases);
  if (ghsIds.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.text("GHS Pictograms", margin, y);
    y += 4;
    const pictoSize = 15; // mm
    const pictoGap = 3;   // mm
    const svgEls = cardRef.current?.querySelectorAll(".ghs-pictogram-row svg") || [];
    const dataUrls = await Promise.all(
      Array.from(svgEls).map((svg) => renderSvgToDataUrl(svg, 100))
    );
    let px = margin;
    if (y + pictoSize + 6 > 270) { pdf.addPage(); y = 15; }
    dataUrls.forEach((dataUrl, i) => {
      if (dataUrl) {
        pdf.addImage(dataUrl, "PNG", px, y, pictoSize, pictoSize);
      }
      // label underneath
      pdf.setFontSize(6);
      pdf.setFont(undefined, "normal");
      const label = ghsIds[i] || "";
      const labelW = pdf.getTextWidth(label);
      pdf.text(label, px + (pictoSize - labelW) / 2, y + pictoSize + 3);
      px += pictoSize + pictoGap;
    });
    y += pictoSize + 8;
  }

  // Radar chart as image
  try {
    const radarEl = cardRef.current?.querySelector(".radar-chart-container");
    if (radarEl) {
      const canvas = await html2canvas(radarEl, { backgroundColor: "#0f172a", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      if (y > 180) { pdf.addPage(); y = 15; }
      const imgW = 100;
      const imgH = (canvas.height / canvas.width) * imgW;
      pdf.addImage(imgData, "PNG", (w - imgW) / 2, y, imgW, imgH);
      y += imgH + 8;
    }
  } catch (e) {
    // skip radar if capture fails
  }

  // Footer
  if (y > 270) { pdf.addPage(); y = 15; }
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(`ChemScreen — Built by EM Safety & Environment | Erik Mattsson — EHS Consulting & Digital Tools | em.safety.environment@gmail.com`, margin, 285);

  pdf.save(`ChemScreen_${chemical.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export default function ChemicalCard({ chemical }) {
  const { name, cas, formula, hPhrases, scores, overall, physicalState, boilingPoint, flashPoint, molecularWeight } = chemical;
  const oc = scoreColor(overall);
  const ghsPictograms = getGHSPictograms(hPhrases);
  const [hPhrasesExpanded, setHPhrasesExpanded] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  async function handleExportPDF() {
    setExporting(true);
    try {
      await exportPDF(chemical, cardRef);
    } catch (e) {
      console.error("PDF export failed:", e);
    }
    setExporting(false);
  }

  return (
    <div className="mt-6 animate-fadeIn" ref={cardRef}>
      {/* Header card */}
      <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{name}</h2>
              {(chemical.fromSds || chemical.fromSDS || (chemical.concentrations && chemical.concentrations.length > 0)) && (
                <span className="px-2 py-0.5 text-[10px] bg-purple-700/50 border border-purple-500 rounded-full uppercase tracking-wider">From SDS</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-navy-300">
              <span>CAS: <span className="text-cyan-400 font-mono font-semibold">{cas}</span></span>
              <span>Formula: <span className="text-navy-100">{formula}</span></span>
              <span>MW: <span className="text-navy-100">{molecularWeight}</span></span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-navy-400">
              <span>State: {physicalState}</span>
              <span>BP: {boilingPoint}</span>
              {flashPoint !== "N/A" && <span>Flash: {flashPoint}</span>}
            </div>
            {chemical.manufacturer && (
              <div className="mt-1 text-xs text-navy-400">Manufacturer: <span className="text-navy-200">{chemical.manufacturer}</span></div>
            )}
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <button
              onClick={() => {
                const url = new URL(window.location.origin);
                url.searchParams.set("q", chemical.cas || chemical.name);
                navigator.clipboard.writeText(url.toString());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-2 bg-navy-700 hover:bg-navy-600 border border-navy-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Copy shareable link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-3 py-2 bg-navy-700 hover:bg-navy-600 border border-navy-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Export as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? "Exporting..." : "PDF"}
            </button>
            <div className={`px-4 py-2 rounded-xl text-center ${oc.bg} ${oc.text}`}>
              <div className="text-2xl font-bold">{overall}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider">Overall</div>
            </div>
          </div>
        </div>

        {/* GHS Pictograms */}
        {ghsPictograms.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium">GHS Pictograms</div>
            <GHSPictogramRow pictogramIds={ghsPictograms} />
          </div>
        )}

        {/* H-phrases with descriptions */}
        <div className="mt-4">
          <button
            onClick={() => setHPhrasesExpanded(!hPhrasesExpanded)}
            className="flex items-center gap-1.5 text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium hover:text-navy-200 transition-colors cursor-pointer"
          >
            <span className={`transition-transform inline-block ${hPhrasesExpanded ? 'rotate-90' : ''}`}>▶</span>
            H-Phrases ({hPhrases.length})
          </button>
          <div className="flex flex-wrap gap-1.5">
            {hPhrases.map((h) => {
              const desc = getHPhraseDescription(h);
              return (
                <span
                  key={h}
                  className="px-2 py-0.5 bg-navy-700 border border-navy-600 rounded text-xs font-mono relative group cursor-pointer"
                  onClick={() => setActiveTooltip(activeTooltip === h ? null : h)}
                >
                  {h}
                  {desc && (
                    <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy-900 border border-navy-500 rounded text-xs text-navy-100 whitespace-nowrap transition-opacity z-10 font-sans ${activeTooltip === h ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none'}`}>
                      {desc}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          {hPhrasesExpanded && (
            <div className="mt-2 space-y-1 bg-navy-900/50 rounded-lg p-3 border border-navy-700">
              {hPhrases.map((h) => {
                const desc = getHPhraseDescription(h);
                return (
                  <div key={h} className="flex gap-2 text-xs">
                    <span className="font-mono text-navy-300 shrink-0 w-14">{h}</span>
                    <span className="text-navy-200">{desc || "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mixture components */}
        {chemical.concentrations && chemical.concentrations.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium">Mixture Components</div>
            <div className="bg-navy-900/50 rounded-lg border border-navy-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-navy-400 border-b border-navy-700">
                    <th className="text-left p-2 font-medium">Component</th>
                    <th className="text-left p-2 font-medium">CAS</th>
                    <th className="text-left p-2 font-medium">Conc.</th>
                    <th className="text-left p-2 font-medium">H-Phrases</th>
                  </tr>
                </thead>
                <tbody>
                  {chemical.concentrations.map((c, i) => (
                    <tr key={i} className="border-b border-navy-800 last:border-0">
                      <td className="p-2 text-navy-200">{c.name}</td>
                      <td className="p-2 font-mono text-cyan-400">{c.cas}</td>
                      <td className="p-2 text-navy-200">{c.concentration}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {(c.hPhrases || []).map((h) => (
                            <span key={h} className="px-1.5 py-0.5 bg-navy-700 rounded text-[10px] font-mono">{h}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Scores grid + radar */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category scores */}
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 category-scores-section">
          <h3 className="text-sm font-semibold text-navy-200 mb-3 uppercase tracking-wider">SSbD Category Scores</h3>
          <div className="space-y-2">
            {CATEGORIES.map(({ key, label, icon }) => {
              const s = scores[key];
              const c = scoreColor(s);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{icon}</span>
                  <span className="flex-1 text-sm text-navy-200 truncate">{label}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div
                        key={v}
                        className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-all ${
                          v <= s
                            ? `${c.bg} ${c.text}`
                            : "bg-navy-700 text-navy-500"
                        }`}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 flex items-center justify-center radar-chart-container">
          <RadarChart chemicals={[chemical]} />
        </div>
      </div>
    </div>
  );
}

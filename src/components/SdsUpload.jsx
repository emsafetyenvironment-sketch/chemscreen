import { useState, useRef, useMemo } from "react";
import { scoreChemical, overallScore, CATEGORIES, scoreColor, scoreHex } from "../data/scoring";
import { getGHSPictograms, getHPhraseDescription } from "../data/ghsData";
import GHSPictogramRow from "./GHSPictograms";
import RadarChart from "./RadarChart";

function fixSubscripts(str) {
  if (!str) return str;
  const map = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
  return str.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ch => map[ch] || ch);
}

async function exportSdsPDF(result, containerRef) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const pdf = new jsPDF("p", "mm", "a4");
  const w = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Title + FROM SDS badge
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text(result.name, margin, y);
  const nameW = pdf.getTextWidth(result.name);
  pdf.setFontSize(8);
  pdf.setTextColor(128, 0, 255);
  pdf.text("[FROM SDS]", margin + nameW + 4, y);
  pdf.setTextColor(0);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");
  pdf.setTextColor(100);
  const meta = [`CAS: ${result.cas || "N/A"}`];
  if (result.formula) meta.push(`Formula: ${fixSubscripts(result.formula)}`);
  if (result.molecularWeight) meta.push(`MW: ${result.molecularWeight}`);
  pdf.text(meta.join("  |  "), margin, y);
  y += 5;
  const meta2 = [`State: ${result.physicalState}`];
  if (result.boilingPoint !== "N/A") meta2.push(`BP: ${result.boilingPoint}`);
  if (result.flashPoint !== "N/A") meta2.push(`Flash: ${result.flashPoint}`);
  pdf.text(meta2.join("  |  "), margin, y);
  y += 5;
  if (result.manufacturer) {
    pdf.text(`Manufacturer: ${result.manufacturer}`, margin, y);
    y += 5;
  }
  y += 3;

  // Overall score
  pdf.setTextColor(0);
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text(`Overall SSbD Score: ${result.overall}/5`, margin, y);
  y += 10;

  // Category scores as image
  try {
    const catEl = containerRef.current?.querySelector(".category-scores-section");
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
      const s = result.scores[key];
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
  (result.hPhrases || []).forEach((h) => {
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
  if (result.concentrations && result.concentrations.length > 0) {
    if (y > 220) { pdf.addPage(); y = 15; }
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.text("Mixture Components", margin, y);
    y += 6;

    // Table header
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

    // Table rows
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(0);
    result.concentrations.forEach((c) => {
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
  const ghsIds = getGHSPictograms(result.hPhrases);
  if (ghsIds.length > 0) {
    if (y > 270) { pdf.addPage(); y = 15; }
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(0);
    pdf.text("GHS Pictograms", margin, y);
    y += 6;
    try {
      const ghsEl = containerRef.current?.querySelector(".ghs-pictogram-row");
      if (ghsEl) {
        const ghsCanvas = await html2canvas(ghsEl, { backgroundColor: "#ffffff", scale: 2 });
        const ghsImg = ghsCanvas.toDataURL("image/png");
        const ghsW = Math.min(w - margin * 2, 140);
        const ghsH = (ghsCanvas.height / ghsCanvas.width) * ghsW;
        if (y + ghsH > 270) { pdf.addPage(); y = 15; }
        pdf.addImage(ghsImg, "PNG", margin, y, ghsW, ghsH);
        y += ghsH + 4;
      }
    } catch (e) {
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text(ghsIds.join(", "), margin + 2, y);
      y += 6;
    }
  }

  // Radar chart
  try {
    const radarEl = containerRef.current?.querySelector(".radar-chart-container");
    if (radarEl) {
      const canvas = await html2canvas(radarEl, { backgroundColor: "#0f172a", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      if (y > 180) { pdf.addPage(); y = 15; }
      const imgW = 100;
      const imgH = (canvas.height / canvas.width) * imgW;
      pdf.addImage(imgData, "PNG", (w - imgW) / 2, y, imgW, imgH);
      y += imgH + 8;
    }
  } catch (e) { /* skip */ }

  // Footer
  if (y > 270) { pdf.addPage(); y = 15; }
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(`Generated by ChemScreen (SDS Upload) — ${new Date().toLocaleDateString("sv-SE")}`, margin, 285);

  pdf.save(`ChemScreen_SDS_${(result.name || "unknown").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export default function SdsUpload({ bank, onAddToBank }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [hPhrasesExpanded, setHPhrasesExpanded] = useState(false);
  const [compareWith, setCompareWith] = useState(null);
  const fileRef = useRef(null);
  const containerRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  async function processFile(file) {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File too large (max 20 MB).");
      return;
    }

    setError("");
    setResult(null);
    setFileName(file.name);
    setLoading(true);
    setCompareWith(null);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiUrl = import.meta.env.DEV ? "/api/analyze-sds" : "/api/analyze-sds";
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${resp.status}`);
      }

      const data = await resp.json();
      const scores = scoreChemical(data);
      const overall = overallScore(scores);
      const enriched = {
        ...data,
        hPhrases: data.hPhrases || [],
        scores,
        overall,
        molecularWeight: data.molecularWeight || 0,
        physicalState: data.physicalState || "Unknown",
        boilingPoint: data.boilingPoint || "N/A",
        flashPoint: data.flashPoint || "N/A",
        formula: data.formula || "",
        fromSDS: true,
        searchedAt: new Date().toISOString(),
      };
      setResult(enriched);
    } catch (e) {
      setError(e.message || "Failed to analyze SDS.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }

  function handleAddToBank() {
    if (result && onAddToBank) {
      onAddToBank(result);
    }
  }

  const compareChemical = useMemo(
    () => (compareWith ? bank.find((b) => b.cas === compareWith) : null),
    [compareWith, bank]
  );

  const oc = result ? scoreColor(result.overall) : null;
  const ghsPictograms = result ? getGHSPictograms(result.hPhrases) : [];

  return (
    <div className="mt-6">
      {/* Upload area */}
      {!result && !loading && (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            dragging
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-navy-600 hover:border-navy-400 bg-navy-800/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => processFile(e.target.files?.[0])}
          />
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-navy-200 mb-2">Upload Safety Data Sheet</h3>
          <p className="text-sm text-navy-400 max-w-md mx-auto">
            Drag & drop a PDF here, or click to browse. The AI will extract chemical data and calculate SSbD scores automatically.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose PDF
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⚗️</div>
          <h3 className="text-lg font-semibold text-navy-200 mb-2">Analyzing SDS...</h3>
          <p className="text-sm text-navy-400">Extracting chemical data from <span className="text-cyan-400">{fileName}</span></p>
          <div className="mt-4 w-48 h-1 bg-navy-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(""); setResult(null); }} className="text-red-300 hover:text-white text-xs underline">Try again</button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fadeIn" ref={containerRef}>
          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => { setResult(null); setError(""); setFileName(""); }}
              className="px-3 py-1.5 text-xs bg-navy-700 hover:bg-navy-600 border border-navy-500 rounded-lg transition-colors"
            >
              ← Upload another
            </button>
            <button
              onClick={handleAddToBank}
              className="px-3 py-1.5 text-xs bg-cyan-700 hover:bg-cyan-600 border border-cyan-500 rounded-lg transition-colors"
            >
              + Add to Chemical Bank
            </button>
            <button
              onClick={async () => { setExporting(true); try { await exportSdsPDF(result, containerRef); } catch (e) { console.error("PDF export failed:", e); } setExporting(false); }}
              disabled={exporting}
              className="px-3 py-1.5 text-xs bg-navy-700 hover:bg-navy-600 border border-navy-500 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? "Exporting..." : "PDF"}
            </button>
            {bank.length > 0 && (
              <select
                value={compareWith || ""}
                onChange={(e) => setCompareWith(e.target.value || null)}
                className="px-3 py-1.5 text-xs bg-navy-700 border border-navy-500 rounded-lg text-white"
              >
                <option value="">Compare with...</option>
                {bank.filter(b => b.cas !== result.cas).map((b) => (
                  <option key={b.cas} value={b.cas}>{b.name} ({b.cas})</option>
                ))}
              </select>
            )}
            <span className="text-xs text-navy-500 ml-auto">Source: {fileName}</span>
          </div>

          {/* Header card */}
          <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{result.name}</h2>
                  <span className="px-2 py-0.5 text-[10px] bg-purple-700/50 border border-purple-500 rounded-full uppercase tracking-wider">From SDS</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-navy-300">
                  {result.cas && <span>CAS: <span className="text-cyan-400 font-mono font-semibold">{result.cas}</span></span>}
                  {result.formula && <span>Formula: <span className="text-navy-100">{result.formula}</span></span>}
                  {result.molecularWeight > 0 && <span>MW: <span className="text-navy-100">{result.molecularWeight}</span></span>}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-navy-400">
                  <span>State: {result.physicalState}</span>
                  {result.boilingPoint !== "N/A" && <span>BP: {result.boilingPoint}</span>}
                  {result.flashPoint !== "N/A" && <span>Flash: {result.flashPoint}</span>}
                </div>
                {result.manufacturer && (
                  <div className="mt-1 text-xs text-navy-400">Manufacturer: <span className="text-navy-200">{result.manufacturer}</span></div>
                )}
              </div>
              <div className={`px-4 py-2 rounded-xl text-center shrink-0 ${oc.bg} ${oc.text}`}>
                <div className="text-2xl font-bold">{result.overall}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider">Overall</div>
              </div>
            </div>

            {/* GHS Pictograms */}
            {ghsPictograms.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium">GHS Pictograms</div>
                <GHSPictogramRow pictogramIds={ghsPictograms} />
              </div>
            )}

            {/* H-phrases */}
            <div className="mt-4">
              <button
                onClick={() => setHPhrasesExpanded(!hPhrasesExpanded)}
                className="flex items-center gap-1.5 text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium hover:text-navy-200 transition-colors cursor-pointer"
              >
                <span className={`transition-transform inline-block ${hPhrasesExpanded ? "rotate-90" : ""}`}>▶</span>
                H-Phrases ({result.hPhrases.length})
              </button>
              <div className="flex flex-wrap gap-1.5">
                {result.hPhrases.map((h) => {
                  const desc = getHPhraseDescription(h);
                  return (
                    <span key={h} className="px-2 py-0.5 bg-navy-700 border border-navy-600 rounded text-xs font-mono relative group cursor-pointer">
                      {h}
                      {desc && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy-900 border border-navy-500 rounded text-xs text-navy-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-sans">
                          {desc}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              {hPhrasesExpanded && (
                <div className="mt-2 space-y-1 bg-navy-900/50 rounded-lg p-3 border border-navy-700">
                  {result.hPhrases.map((h) => (
                    <div key={h} className="flex gap-2 text-xs">
                      <span className="font-mono text-navy-300 shrink-0 w-14">{h}</span>
                      <span className="text-navy-200">{getHPhraseDescription(h) || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Concentrations (mixture) */}
            {result.concentrations && result.concentrations.length > 0 && (
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
                      {result.concentrations.map((c, i) => (
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

          {/* Scores + Radar */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 category-scores-section">
              <h3 className="text-sm font-semibold text-navy-200 mb-3 uppercase tracking-wider">SSbD Category Scores</h3>
              <div className="space-y-2">
                {CATEGORIES.map(({ key, label, icon }) => {
                  const s = result.scores[key];
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
                              v <= s ? `${c.bg} ${c.text}` : "bg-navy-700 text-navy-500"
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

            <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 flex items-center justify-center radar-chart-container">
              <RadarChart chemicals={compareChemical ? [result, compareChemical] : [result]} />
            </div>
          </div>

          {/* Comparison */}
          {compareChemical && (
            <div className="mt-4 bg-navy-800 border border-navy-600 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-navy-200 mb-3 uppercase tracking-wider">
                Comparison: {result.name} vs {compareChemical.name}
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(({ key, label, icon }) => {
                  const s1 = result.scores[key];
                  const s2 = compareChemical.scores[key];
                  const diff = s1 - s2;
                  return (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-center">{icon}</span>
                      <span className="flex-1 text-navy-200 truncate">{label}</span>
                      <span className={`font-mono font-bold ${scoreColor(s1).text}`}>{s1}</span>
                      <span className="text-navy-500">vs</span>
                      <span className={`font-mono font-bold ${scoreColor(s2).text}`}>{s2}</span>
                      <span className={`text-xs font-medium w-12 text-right ${
                        diff > 0 ? "text-red-400" : diff < 0 ? "text-emerald-400" : "text-navy-500"
                      }`}>
                        {diff > 0 ? `+${diff} ↑` : diff < 0 ? `${diff} ↓` : "="}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useMemo } from "react";
import { scoreChemical, overallScore, CATEGORIES, scoreColor, scoreHex } from "../data/scoring";
import { getGHSPictograms, getHPhraseDescription } from "../data/ghsData";
import GHSPictogramRow from "./GHSPictograms";
import RadarChart from "./RadarChart";

export default function SdsUpload({ bank, onAddToBank }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [hPhrasesExpanded, setHPhrasesExpanded] = useState(false);
  const [compareWith, setCompareWith] = useState(null);
  const fileRef = useRef(null);

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
        <div className="animate-fadeIn">
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
            <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5">
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

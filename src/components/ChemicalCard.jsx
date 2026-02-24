import { useState } from "react";
import { CATEGORIES, scoreColor, scoreHex } from "../data/scoring";
import { getGHSPictograms, getHPhraseDescription } from "../data/ghsData";
import GHSPictogramRow from "./GHSPictograms";
import RadarChart from "./RadarChart";

export default function ChemicalCard({ chemical }) {
  const { name, cas, formula, hPhrases, scores, overall, physicalState, boilingPoint, flashPoint, molecularWeight } = chemical;
  const oc = scoreColor(overall);
  const ghsPictograms = getGHSPictograms(hPhrases);
  const [hPhrasesExpanded, setHPhrasesExpanded] = useState(false);

  return (
    <div className="mt-6 animate-fadeIn">
      {/* Header card */}
      <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-navy-300">
              <span>CAS: <span className="text-navy-100 font-mono">{cas}</span></span>
              <span>Formula: <span className="text-navy-100">{formula}</span></span>
              <span>MW: <span className="text-navy-100">{molecularWeight}</span></span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-navy-400">
              <span>State: {physicalState}</span>
              <span>BP: {boilingPoint}</span>
              {flashPoint !== "N/A" && <span>Flash: {flashPoint}</span>}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-center ${oc.bg} ${oc.text} shrink-0`}>
            <div className="text-2xl font-bold">{overall}</div>
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
                  className="px-2 py-0.5 bg-navy-700 border border-navy-600 rounded text-xs font-mono relative group cursor-default"
                >
                  {h}
                  {desc && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy-900 border border-navy-500 rounded text-xs text-navy-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans">
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
      </div>

      {/* Scores grid + radar */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category scores */}
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5">
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
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 flex items-center justify-center">
          <RadarChart chemicals={[chemical]} />
        </div>
      </div>
    </div>
  );
}

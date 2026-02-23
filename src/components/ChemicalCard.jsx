import { CATEGORIES, scoreColor, scoreHex } from "../data/scoring";
import RadarChart from "./RadarChart";

export default function ChemicalCard({ chemical }) {
  const { name, cas, formula, hPhrases, scores, overall, physicalState, boilingPoint, flashPoint, molecularWeight } = chemical;
  const oc = scoreColor(overall);

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

        {/* H-phrases */}
        <div className="mt-4">
          <div className="text-xs text-navy-400 mb-1.5 uppercase tracking-wider font-medium">H-Phrases</div>
          <div className="flex flex-wrap gap-1.5">
            {hPhrases.map((h) => (
              <span key={h} className="px-2 py-0.5 bg-navy-700 border border-navy-600 rounded text-xs font-mono">
                {h}
              </span>
            ))}
          </div>
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

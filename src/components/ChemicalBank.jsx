import { scoreColor } from "../data/scoring";

export default function ChemicalBank({ bank, selected, onSelect, onRemove, compareMode, compareList, onToggleCompare, onToggleCompareMode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-navy-200 uppercase tracking-wider">Chemical Bank</h2>
        {bank.length >= 2 && (
          <button
            onClick={onToggleCompareMode}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
              compareMode
                ? "bg-cyan-600 text-white"
                : "bg-navy-700 text-navy-300 hover:bg-navy-600"
            }`}
          >
            {compareMode ? "Cancel" : "Compare"}
          </button>
        )}
      </div>

      {bank.length === 0 ? (
        <p className="text-xs text-navy-500">Searched chemicals will appear here.</p>
      ) : (
        <div className="space-y-1.5">
          {bank.map((chem) => {
            const oc = scoreColor(chem.overall);
            const isSelected = selected?.cas === chem.cas && !compareMode;
            const isInCompare = compareList.includes(chem.cas);
            return (
              <div
                key={chem.cas}
                className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-navy-700 border border-cyan-600"
                    : isInCompare
                    ? "bg-navy-700 border border-purple-500"
                    : "bg-navy-800 border border-transparent hover:border-navy-600"
                }`}
                onClick={() => compareMode ? onToggleCompare(chem.cas) : onSelect(chem)}
              >
                {compareMode && (
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    isInCompare ? "border-purple-400 bg-purple-500" : "border-navy-500"
                  }`}>
                    {isInCompare && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{chem.name}</div>
                  <div className="text-[11px] text-navy-400 font-mono">{chem.cas}</div>
                </div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded ${oc.bg} ${oc.text}`}>
                  {chem.overall}
                </div>
                {!compareMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(chem.cas); }}
                    className="opacity-0 group-hover:opacity-100 text-navy-500 hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {compareMode && compareList.length >= 2 && (
        <div className="mt-3 text-xs text-navy-300 text-center">
          {compareList.length} selected — view comparison in main panel
        </div>
      )}
    </div>
  );
}

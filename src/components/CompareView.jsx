import { CATEGORIES, scoreColor } from "../data/scoring";
import RadarChart from "./RadarChart";

export default function CompareView({ chemicals }) {
  return (
    <div className="mt-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-4">Comparison — {chemicals.map((c) => c.name).join(" vs ")}</h2>

      {/* Radar */}
      <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6 flex justify-center mb-4">
        <div className="w-full max-w-md">
          <RadarChart chemicals={chemicals} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-800 border border-navy-600 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600">
              <th className="text-left p-3 text-navy-400 font-medium">Category</th>
              {chemicals.map((c) => (
                <th key={c.cas} className="p-3 text-center font-medium">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(({ key, label, icon }) => (
              <tr key={key} className="border-b border-navy-700/50">
                <td className="p-3 text-navy-200">
                  <span className="mr-2">{icon}</span>{label}
                </td>
                {chemicals.map((c) => {
                  const s = c.scores[key];
                  const sc = scoreColor(s);
                  return (
                    <td key={c.cas} className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-sm ${sc.bg} ${sc.text}`}>
                        {s}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-navy-700/30">
              <td className="p-3 font-semibold">Overall</td>
              {chemicals.map((c) => {
                const sc = scoreColor(c.overall);
                return (
                  <td key={c.cas} className="p-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg font-bold ${sc.bg} ${sc.text}`}>
                      {c.overall}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

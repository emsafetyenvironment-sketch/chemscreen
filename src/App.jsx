import { useState, useEffect, useMemo } from "react";
import { chemicals } from "./data/chemicals";
import { scoreChemical, overallScore, CATEGORIES } from "./data/scoring";
import SearchBar from "./components/SearchBar";
import ChemicalCard from "./components/ChemicalCard";
import ChemicalBank from "./components/ChemicalBank";
import CompareView from "./components/CompareView";
import SdsUpload from "./components/SdsUpload";
import HeroSection from "./components/HeroSection";

function lookupChemical(query) {
  const q = query.trim().toLowerCase();
  return chemicals.find(
    (c) => c.cas === q || c.name.toLowerCase() === q || c.name.toLowerCase().includes(q)
  );
}

function loadBank() {
  try {
    return JSON.parse(localStorage.getItem("chemscreen_bank") || "[]");
  } catch { return []; }
}

function saveBank(bank) {
  localStorage.setItem("chemscreen_bank", JSON.stringify(bank));
}

export default function App() {
  const [bank, setBank] = useState(loadBank);
  const [selected, setSelected] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // "search" | "sds"

  useEffect(() => { saveBank(bank); }, [bank]);

  function handleSearch(query) {
    setError("");
    const chem = lookupChemical(query);
    if (!chem) {
      setError(`Chemical "${query}" not found in database. Try a CAS number or common name.`);
      return;
    }
    const scores = scoreChemical(chem);
    const overall = overallScore(scores);
    const result = { ...chem, scores, overall, searchedAt: new Date().toISOString() };
    setSelected(result);
    setCompareMode(false);
    // Add to bank if not already there
    setBank((prev) => {
      if (prev.some((b) => b.cas === chem.cas)) return prev;
      return [result, ...prev];
    });
  }

  function handleRemoveFromBank(cas) {
    setBank((prev) => prev.filter((b) => b.cas !== cas));
    setCompareList((prev) => prev.filter((c) => c !== cas));
    if (selected?.cas === cas) setSelected(null);
  }

  function toggleCompare(cas) {
    setCompareList((prev) => {
      if (prev.includes(cas)) return prev.filter((c) => c !== cas);
      if (prev.length >= 3) return prev;
      return [...prev, cas];
    });
  }

  const compareChemicals = useMemo(
    () => bank.filter((b) => compareList.includes(b.cas)),
    [bank, compareList]
  );

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-sm">CS</div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">ChemScreen</h1>
              <p className="text-[11px] text-navy-300 leading-tight">SSbD Chemical Screening Tool</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeTab === "search" ? "bg-cyan-600 text-white" : "text-navy-300 hover:text-white hover:bg-navy-700"}`}
            >
              🔬 Search
            </button>
            <button
              onClick={() => setActiveTab("sds")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeTab === "sds" ? "bg-cyan-600 text-white" : "text-navy-300 hover:text-white hover:bg-navy-700"}`}
            >
              📄 Upload SDS
            </button>
          </div>
          <button
            className="md:hidden p-2 text-navy-300 hover:text-white"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <HeroSection />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0">
        {/* Sidebar */}
        <aside className={`${mobileMenu ? 'block' : 'hidden'} md:block w-full md:w-72 lg:w-80 bg-navy-900 border-r border-navy-700 md:min-h-[calc(100vh-56px)] p-4 shrink-0`}>
          <ChemicalBank
            bank={bank}
            selected={selected}
            onSelect={(chem) => { setSelected(chem); setCompareMode(false); setMobileMenu(false); }}
            onRemove={handleRemoveFromBank}
            compareMode={compareMode}
            compareList={compareList}
            onToggleCompare={toggleCompare}
            onToggleCompareMode={() => { setCompareMode(!compareMode); setCompareList([]); }}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-56px)]">
          <div id="search-area" className="max-w-3xl mx-auto">
            {/* Mobile tabs */}
            <div className="flex md:hidden gap-2 mb-4">
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${activeTab === "search" ? "bg-cyan-600 text-white" : "bg-navy-800 text-navy-300 border border-navy-600"}`}
              >
                🔬 Search
              </button>
              <button
                onClick={() => setActiveTab("sds")}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${activeTab === "sds" ? "bg-cyan-600 text-white" : "bg-navy-800 text-navy-300 border border-navy-600"}`}
              >
                📄 Upload SDS
              </button>
            </div>

            {activeTab === "sds" ? (
              <SdsUpload
                bank={bank}
                onAddToBank={(chem) => {
                  setBank((prev) => {
                    if (prev.some((b) => b.cas === chem.cas)) return prev;
                    return [chem, ...prev];
                  });
                }}
              />
            ) : (
            <>
            <SearchBar onSearch={handleSearch} />
            {error && (
              <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {compareMode && compareList.length >= 2 ? (
              <CompareView chemicals={compareChemicals} />
            ) : selected ? (
              <ChemicalCard chemical={selected} />
            ) : (
              <div className="mt-16 text-center text-navy-400">
                <div className="text-5xl mb-4">🔬</div>
                <h2 className="text-xl font-semibold text-navy-200 mb-2">Search for a chemical</h2>
                <p className="text-sm max-w-md mx-auto">
                  Enter a CAS number or chemical name to get an automated SSbD screening result.
                  Try "benzene", "67-64-1", or "formaldehyde".
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {["Acetone", "Benzene", "Lead", "Ethanol", "Chromium(VI) trioxide"].map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSearch(name)}
                      className="px-3 py-1.5 text-xs bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded-full transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            </>
            )}

            {/* Disclaimer */}
            <div className="mt-12 text-center text-[11px] text-navy-500 border-t border-navy-800 pt-4">
              Prototype — for demonstration purposes. Verify results against official sources (ECHA, REACH).
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

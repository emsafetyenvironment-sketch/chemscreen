import { useState, useRef, useEffect } from "react";
import { chemicals } from "../data/chemicals";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setSelectedIdx(-1);
    if (val.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matches = chemicals
      .filter((c) => c.name.toLowerCase().includes(q) || c.cas.includes(q))
      .slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }

  function handleSelect(chem) {
    setQuery(chem.name);
    setShowSuggestions(false);
    onSearch(chem.name);
  }

  function handleKeyDown(e) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIdx]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative" ref={wrapperRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Enter CAS number or chemical name..."
            className="w-full pl-10 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {showSuggestions && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-600 rounded-xl overflow-hidden shadow-xl max-h-72 overflow-y-auto">
              {suggestions.map((chem, i) => (
                <button
                  key={chem.cas}
                  type="button"
                  onClick={() => handleSelect(chem)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-navy-700 transition-colors ${i === selectedIdx ? "bg-navy-700" : ""}`}
                >
                  <span className="text-sm text-white truncate">{chem.name}</span>
                  <span className="text-xs text-navy-400 font-mono ml-3 shrink-0">{chem.cas}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          Screen
        </button>
      </div>
    </form>
  );
}

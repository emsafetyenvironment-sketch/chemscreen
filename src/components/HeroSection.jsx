import { useState } from "react";

export default function HeroSection() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("hero_dismissed") === "1"; } catch { return false; }
  });

  if (dismissed) {
    return (
      <div className="max-w-3xl mx-auto mb-2 flex justify-center">
        <button
          onClick={() => { setDismissed(false); sessionStorage.removeItem("hero_dismissed"); }}
          className="text-xs text-navy-400 hover:text-cyan-400 transition-colors"
        >
          ℹ️ Show intro
        </button>
      </div>
    );
  }

  function scrollToSearch() {
    document.getElementById("search-area")?.scrollIntoView({ behavior: "smooth" });
    setDismissed(true);
    sessionStorage.setItem("hero_dismissed", "1");
  }

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="relative rounded-2xl border border-navy-700 bg-gradient-to-b from-navy-900 via-navy-900/95 to-navy-950 p-6 md:p-10">
        {/* Dismiss */}
        <button
          onClick={() => { setDismissed(true); sessionStorage.setItem("hero_dismissed", "1"); }}
          className="absolute top-3 right-3 text-navy-500 hover:text-navy-300 text-lg leading-none"
          title="Hide intro"
        >×</button>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
          ChemScreen — SSbD Chemical Screening Tool
        </h2>
        <p className="text-navy-300 text-sm md:text-base mb-6">
          AI-powered chemical screening based on the EU Safe and Sustainable by Design framework
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: "🔍", title: "Search", desc: "Screen 105+ chemicals instantly against SSbD criteria" },
            { icon: "📄", title: "Upload SDS", desc: "Upload a Safety Data Sheet (PDF) and let AI extract components, H-phrases and calculate scores automatically" },
            { icon: "📊", title: "Compare", desc: "Side-by-side comparison with radar charts to find safer alternatives" },
          ].map((f) => (
            <div key={f.title} className="bg-navy-800/50 rounded-xl p-4 border border-navy-700/50">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-navy-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How to use */}
        <div className="bg-navy-800/30 rounded-xl p-4 border border-navy-700/30 mb-6">
          <h3 className="text-sm font-semibold text-navy-200 mb-3">How to use</h3>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            {[
              { step: "1", text: "Search by name or CAS number" },
              { step: "2", text: "Upload an SDS for automatic analysis" },
              { step: "3", text: "Add to bank and compare alternatives" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-2 flex-1">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                <span className="text-navy-300 text-xs leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About toggle */}
        <div className="mb-4">
          <button
            onClick={() => setAboutOpen(!aboutOpen)}
            className="text-xs text-navy-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>ℹ️</span>
            <span>About SSbD &amp; ChemScreen</span>
            <span className={`transition-transform ${aboutOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {aboutOpen && (
            <div className="mt-3 p-4 bg-navy-800/40 rounded-xl border border-navy-700/30 text-xs text-navy-300 leading-relaxed space-y-3">
              <p>
                The EU's Safe and Sustainable by Design (SSbD) framework provides criteria for assessing chemicals across seven categories: acute toxicity, chronic/CMR effects, aquatic toxicity, persistence, bioaccumulation, physical hazards, and endocrine disruption.
              </p>
              <p>
                ChemScreen automates this screening process. Instead of manually looking up H-phrases, matching them against scoring rules, and building comparison spreadsheets, ChemScreen does it in seconds — either from its built-in database of 105+ chemicals or by extracting data directly from Safety Data Sheets using AI.
              </p>
              <p>
                Scoring is based on GHS hazard classifications (H-phrases) mapped to the seven SSbD categories on a 1-5 scale, supplemented with known PBT and endocrine disruption data.
              </p>
            </div>
          )}
        </div>

        {/* About the Creator toggle */}
        <div className="mb-4">
          <button
            onClick={() => setCreatorOpen(!creatorOpen)}
            className="text-xs text-navy-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>👤</span>
            <span>About the Creator</span>
            <span className={`transition-transform ${creatorOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {creatorOpen && (
            <div className="mt-3 p-4 bg-navy-800/40 rounded-xl border border-navy-700/30 text-xs text-navy-300 leading-relaxed space-y-3">
              <p>
                Erik Mattsson — EHS consultant with 15+ years of experience helping companies navigate safety, environmental and occupational health requirements — from medtech to manufacturing. Building AI-powered tools for EHS professionals.
              </p>
              <p className="flex gap-3">
                <a href="https://www.linkedin.com/in/erik-mattsson-ehs/" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">LinkedIn</a>
                <a href="mailto:em.safety.environment@gmail.com" className="underline hover:text-cyan-400">em.safety.environment@gmail.com</a>
              </p>
            </div>
          )}
        </div>

        {/* Cross-link */}
        <div className="mb-4 text-xs text-navy-400">
          Also by EM Safety &amp; Environment — <a href="https://gembascan.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">GembaScan → AI-powered workplace risk assessment</a>
        </div>

        {/* Branding */}
        <div className="text-center text-xs text-navy-400 mb-4">
          ChemScreen — Built by EM Safety &amp; Environment | Erik Mattsson — EHS Consulting &amp; Digital Tools | <a href="mailto:em.safety.environment@gmail.com" className="underline hover:text-cyan-400">em.safety.environment@gmail.com</a>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={scrollToSearch}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Get Started ↓
          </button>
        </div>
      </div>
    </div>
  );
}

// H-phrase to SSbD category scoring mappings
// Score 1 = low concern (green), 5 = high concern (red)

const hPhraseScores = {
  // === ACUTE TOXICITY ===
  // Cat 1-2 (fatal)
  H300: { acuteTox: 5 }, H310: { acuteTox: 5 }, H330: { acuteTox: 5 },
  // Cat 3 (toxic)
  H301: { acuteTox: 4 }, H311: { acuteTox: 4 }, H331: { acuteTox: 4 },
  // Cat 4 (harmful)
  H302: { acuteTox: 3 }, H312: { acuteTox: 3 }, H332: { acuteTox: 3 },

  // === CHRONIC / CMR ===
  // Carcinogenic
  H350: { chronicCMR: 5 }, // Cat 1A/1B
  H351: { chronicCMR: 4 }, // Cat 2
  // Mutagenic
  H340: { chronicCMR: 5 }, // Cat 1A/1B
  H341: { chronicCMR: 4 }, // Cat 2
  // Reproductive
  H360: { chronicCMR: 5 }, H360D: { chronicCMR: 5 }, H360Df: { chronicCMR: 5 },
  H360F: { chronicCMR: 5 }, H360FD: { chronicCMR: 5 }, H360Fd: { chronicCMR: 5 },
  H361: { chronicCMR: 4 }, H361d: { chronicCMR: 4 }, H361f: { chronicCMR: 4 },
  H361fd: { chronicCMR: 4 },
  H362: { chronicCMR: 3 },
  // STOT-RE
  H370: { chronicCMR: 4, acuteTox: 4 },
  H371: { chronicCMR: 3 },
  H372: { chronicCMR: 5 },
  H373: { chronicCMR: 3 },
  // Aspiration
  H304: { acuteTox: 3 },

  // === SKIN/EYE (contributes minor to acute) ===
  H314: { acuteTox: 3 }, // Severe burns
  H315: { acuteTox: 1 },
  H317: { chronicCMR: 2 }, // Sensitiser
  H318: { acuteTox: 2 },
  H319: { acuteTox: 1 },
  H334: { chronicCMR: 3 }, // Resp sensitiser
  H335: { acuteTox: 1 },
  H336: { acuteTox: 2 },

  // === AQUATIC TOXICITY ===
  H400: { aquaticTox: 5 },        // Very toxic acute
  H410: { aquaticTox: 5, persistence: 4, bioaccumulation: 4 }, // Very toxic chronic
  H411: { aquaticTox: 4, persistence: 3, bioaccumulation: 3 },
  H412: { aquaticTox: 3, persistence: 2 },
  H413: { aquaticTox: 2, persistence: 2 },

  // === PHYSICAL HAZARDS ===
  H200: { physicalHaz: 5 }, H201: { physicalHaz: 5 }, H202: { physicalHaz: 5 },
  H203: { physicalHaz: 4 },
  H220: { physicalHaz: 5 }, H221: { physicalHaz: 4 },
  H222: { physicalHaz: 4 }, H223: { physicalHaz: 3 },
  H224: { physicalHaz: 5 }, H225: { physicalHaz: 4 }, H226: { physicalHaz: 3 },
  H228: { physicalHaz: 3 },
  H240: { physicalHaz: 5 }, H241: { physicalHaz: 5 },
  H242: { physicalHaz: 4 },
  H250: { physicalHaz: 4 }, H251: { physicalHaz: 3 },
  H260: { physicalHaz: 5 }, H261: { physicalHaz: 4 },
  H270: { physicalHaz: 4 }, H271: { physicalHaz: 5 },
  H280: { physicalHaz: 3 }, H281: { physicalHaz: 3 },
  H290: { physicalHaz: 2 }, // Corrosive to metals
};

// Known endocrine disruptors (SVHC / EU ED lists)
const knownEndocrineDisruptors = {
  "71-43-2": 3,    // Benzene - some evidence
  "50-00-0": 2,    // Formaldehyde - limited evidence
  "79-01-6": 3,    // Trichloroethylene
  "7439-92-1": 4,  // Lead - well-known ED
  "7439-97-6": 4,  // Mercury - well-known ED
  "7440-43-9": 4,  // Cadmium - well-known ED
  "1333-82-0": 4,  // Chromium VI
  "108-88-3": 2,   // Toluene - some evidence
  "75-09-2": 2,    // DCM
};

// Known persistent/bioaccumulative substances beyond H-phrases
const knownPBT = {
  "7439-92-1": { persistence: 5, bioaccumulation: 4 },  // Lead
  "7439-97-6": { persistence: 5, bioaccumulation: 5 },  // Mercury
  "7440-43-9": { persistence: 5, bioaccumulation: 4 },  // Cadmium
  "1333-82-0": { persistence: 4, bioaccumulation: 3 },  // Chromium VI
  "71-43-2": { persistence: 2, bioaccumulation: 2 },    // Benzene
  "79-01-6": { persistence: 3, bioaccumulation: 2 },    // Trichloroethylene
  "75-09-2": { persistence: 3, bioaccumulation: 2 },    // DCM
};

export const CATEGORIES = [
  { key: "acuteTox", label: "Human Toxicity (Acute)", icon: "☠️" },
  { key: "chronicCMR", label: "Human Toxicity (Chronic/CMR)", icon: "🧬" },
  { key: "aquaticTox", label: "Aquatic Toxicity", icon: "🐟" },
  { key: "persistence", label: "Persistence", icon: "♻️" },
  { key: "bioaccumulation", label: "Bioaccumulation", icon: "📈" },
  { key: "physicalHaz", label: "Physical Hazards", icon: "🔥" },
  { key: "endocrine", label: "Endocrine Disruption", icon: "⚠️" },
];

export function scoreChemical(chemical) {
  const scores = {
    acuteTox: 1,
    chronicCMR: 1,
    aquaticTox: 1,
    persistence: 1,
    bioaccumulation: 1,
    physicalHaz: 1,
    endocrine: 1,
  };

  // Score from H-phrases
  for (const hp of chemical.hPhrases) {
    const mapping = hPhraseScores[hp];
    if (mapping) {
      for (const [cat, score] of Object.entries(mapping)) {
        if (score > scores[cat]) scores[cat] = score;
      }
    }
  }

  // Apply known PBT data
  const pbt = knownPBT[chemical.cas];
  if (pbt) {
    for (const [cat, score] of Object.entries(pbt)) {
      if (score > scores[cat]) scores[cat] = score;
    }
  }

  // Apply known ED data
  const ed = knownEndocrineDisruptors[chemical.cas];
  if (ed && ed > scores.endocrine) {
    scores.endocrine = ed;
  }

  return scores;
}

export function overallScore(scores) {
  const vals = Object.values(scores);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export function scoreColor(score) {
  if (score <= 1.5) return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" };
  if (score <= 2.5) return { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" };
  if (score <= 3.5) return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" };
  if (score <= 4.5) return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" };
  return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
}

export function scoreHex(score) {
  if (score <= 1) return "#10b981";
  if (score <= 2) return "#84cc16";
  if (score <= 3) return "#f59e0b";
  if (score <= 4) return "#f97316";
  return "#ef4444";
}

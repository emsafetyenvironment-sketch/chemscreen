// GHS pictogram mappings and H-phrase descriptions

// Map H-phrase base number to GHS pictogram(s)
const hPhraseToGHS = {
  H200: ['GHS01'], H201: ['GHS01'], H202: ['GHS01'], H203: ['GHS01'], H204: ['GHS01'], H205: ['GHS01'],
  H220: ['GHS02'], H221: ['GHS02'], H222: ['GHS02'], H223: ['GHS02'], H224: ['GHS02'], H225: ['GHS02'], H226: ['GHS02'], H228: ['GHS02'],
  H241: ['GHS02'], H242: ['GHS02'], H250: ['GHS02'], H251: ['GHS02'], H252: ['GHS02'], H260: ['GHS02'], H261: ['GHS02'],
  H270: ['GHS03'], H271: ['GHS03'], H272: ['GHS03'],
  H280: ['GHS04'], H281: ['GHS04'],
  H290: ['GHS05'], H314: ['GHS05'], H318: ['GHS05'],
  H300: ['GHS06'], H301: ['GHS06'], H310: ['GHS06'], H311: ['GHS06'], H330: ['GHS06'], H331: ['GHS06'],
  H302: ['GHS07'], H312: ['GHS07'], H315: ['GHS07'], H317: ['GHS07'], H319: ['GHS07'], H332: ['GHS07'], H335: ['GHS07'], H336: ['GHS07'],
  H304: ['GHS08'], H334: ['GHS08'], H340: ['GHS08'], H341: ['GHS08'], H350: ['GHS08'], H351: ['GHS08'],
  H360: ['GHS08'], H361: ['GHS08'], H362: ['GHS08'], H370: ['GHS08'], H371: ['GHS08'], H372: ['GHS08'], H373: ['GHS08'],
  H400: ['GHS09'], H410: ['GHS09'], H411: ['GHS09'], H412: ['GHS09'], H413: ['GHS09'],
};

// H-phrase descriptions
export const hPhraseDescriptions = {
  H200: "Unstable explosive",
  H201: "Explosive; mass explosion hazard",
  H202: "Explosive; severe projection hazard",
  H203: "Explosive; fire, blast or projection hazard",
  H204: "Fire or projection hazard",
  H205: "May mass explode in fire",
  H220: "Extremely flammable gas",
  H221: "Flammable gas",
  H222: "Extremely flammable aerosol",
  H223: "Flammable aerosol",
  H224: "Extremely flammable liquid and vapour",
  H225: "Highly flammable liquid and vapour",
  H226: "Flammable liquid and vapour",
  H228: "Flammable solid",
  H241: "Heating may cause a fire or explosion",
  H242: "Heating may cause a fire",
  H250: "Catches fire spontaneously if exposed to air",
  H251: "Self-heating; may catch fire",
  H252: "Self-heating in large quantities; may catch fire",
  H260: "In contact with water releases flammable gases which may ignite spontaneously",
  H261: "In contact with water releases flammable gas",
  H270: "May cause or intensify fire; oxidiser",
  H271: "May cause fire or explosion; strong oxidiser",
  H272: "May intensify fire; oxidiser",
  H280: "Contains gas under pressure; may explode if heated",
  H281: "Contains refrigerated gas; may cause cryogenic burns or injury",
  H290: "May be corrosive to metals",
  H300: "Fatal if swallowed",
  H301: "Toxic if swallowed",
  H302: "Harmful if swallowed",
  H304: "May be fatal if swallowed and enters airways",
  H310: "Fatal in contact with skin",
  H311: "Toxic in contact with skin",
  H312: "Harmful in contact with skin",
  H314: "Causes severe skin burns and eye damage",
  H315: "Causes skin irritation",
  H317: "May cause an allergic skin reaction",
  H318: "Causes serious eye damage",
  H319: "Causes serious eye irritation",
  H330: "Fatal if inhaled",
  H331: "Toxic if inhaled",
  H332: "Harmful if inhaled",
  H334: "May cause allergy or asthma symptoms or breathing difficulties if inhaled",
  H335: "May cause respiratory irritation",
  H336: "May cause drowsiness or dizziness",
  H340: "May cause genetic defects",
  H341: "Suspected of causing genetic defects",
  H350: "May cause cancer",
  H351: "Suspected of causing cancer",
  H360: "May damage fertility or the unborn child",
  H361: "Suspected of damaging fertility or the unborn child",
  H362: "May cause harm to breast-fed children",
  H370: "Causes damage to organs",
  H371: "May cause damage to organs",
  H372: "Causes damage to organs through prolonged or repeated exposure",
  H373: "May cause damage to organs through prolonged or repeated exposure",
  H400: "Very toxic to aquatic life",
  H410: "Very toxic to aquatic life with long lasting effects",
  H411: "Toxic to aquatic life with long lasting effects",
  H412: "Harmful to aquatic life with long lasting effects",
  H413: "May cause long lasting harmful effects to aquatic life",
};

// Get the base H-number (strip suffix letters like D, F, d, f, fd, Df, etc.)
function getBaseHPhrase(h) {
  return h.match(/^H\d+/)?.[0] || h;
}

// Get unique GHS pictograms for a list of H-phrases
export function getGHSPictograms(hPhrases) {
  const set = new Set();
  for (const h of hPhrases) {
    const base = getBaseHPhrase(h);
    const ghs = hPhraseToGHS[base];
    if (ghs) ghs.forEach((g) => set.add(g));
  }
  return [...set].sort();
}

// Get description for an H-phrase (handles suffixed variants)
export function getHPhraseDescription(h) {
  if (hPhraseDescriptions[h]) return hPhraseDescriptions[h];
  const base = getBaseHPhrase(h);
  return hPhraseDescriptions[base] || null;
}

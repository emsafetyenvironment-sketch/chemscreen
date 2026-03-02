// Inline SVG GHS pictograms - red diamond border with black symbol
const size = 48;
const Diamond = ({ children, title }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title}>
    <title>{title}</title>
    {/* Red diamond border */}
    <polygon points="50,2 98,50 50,98 2,50" fill="white" stroke="#cc0000" strokeWidth="4" />
    {children}
  </svg>
);

// GHS01 - Exploding bomb
const GHS01 = () => (
  <Diamond title="GHS01 – Exploding bomb">
    <g transform="translate(50,50) scale(0.55)" fill="black">
      {/* Explosion burst */}
      <polygon points="0,-30 8,-10 28,-18 15,-2 30,10 10,8 8,28 0,12 -8,28 -10,8 -30,10 -15,-2 -28,-18 -8,-10" />
      <circle cx="0" cy="2" r="8" />
    </g>
  </Diamond>
);

// GHS02 - Flame
const GHS02 = () => (
  <Diamond title="GHS02 – Flame">
    <g transform="translate(50,48) scale(0.6)" fill="black">
      <path d="M0,-28 C5,-20 18,-10 18,5 C18,16 10,24 0,24 C-10,24 -18,16 -18,5 C-18,-10 -5,-20 0,-28Z M0,4 C-4,4 -7,8 -7,12 C-7,16 -4,20 0,20 C4,20 7,16 7,12 C7,8 4,4 0,4Z" fillRule="evenodd" />
    </g>
  </Diamond>
);

// GHS03 - Flame over circle (Oxidizer)
const GHS03 = () => (
  <Diamond title="GHS03 – Oxidizer">
    <g transform="translate(50,50) scale(0.55)" fill="black">
      <circle cx="0" cy="10" r="12" />
      <path d="M0,-8 C4,-16 14,-20 14,-8 C14,0 8,4 4,0 C8,-4 10,-12 6,-12 C2,-12 -2,-4 0,-8Z M-4,0 C-8,4 -14,0 -14,-8 C-14,-20 -4,-16 0,-8 C-2,-4 -6,-12 -10,-12 C-6,-12 -8,-4 -4,0Z" />
      <path d="M-6,-6 C-2,-18 2,-18 6,-6 C10,-14 8,-22 0,-26 C-8,-22 -10,-14 -6,-6Z" />
    </g>
  </Diamond>
);

// GHS04 - Gas cylinder
const GHS04 = () => (
  <Diamond title="GHS04 – Gas cylinder">
    <g transform="translate(50,50) scale(0.55)" fill="black">
      <rect x="-12" y="-20" width="24" height="36" rx="6" />
      <rect x="-4" y="-26" width="8" height="8" rx="2" />
      <rect x="-14" y="14" width="28" height="4" rx="1" />
    </g>
  </Diamond>
);

// GHS05 - Corrosion
const GHS05 = () => (
  <Diamond title="GHS05 – Corrosion">
    <g transform="translate(50,46) scale(0.5)" fill="black">
      {/* Two drops */}
      <path d="M-14,-28 C-14,-28 -22,-12 -22,-4 C-22,2 -18,6 -14,6 C-10,6 -6,2 -6,-4 C-6,-12 -14,-28 -14,-28Z" />
      <path d="M10,-28 C10,-28 2,-12 2,-4 C2,2 6,6 10,6 C14,6 18,2 18,-4 C18,-12 10,-28 10,-28Z" />
      {/* Corroded surface/hand */}
      <rect x="-24" y="8" width="48" height="4" rx="1" />
      <path d="M-20,12 L-16,26 L-8,26 L-4,16 L4,16 L8,26 L16,26 L20,12Z" fill="black" />
    </g>
  </Diamond>
);

// GHS06 - Skull and crossbones
const GHS06 = () => (
  <Diamond title="GHS06 – Skull and crossbones">
    <g transform="translate(50,46) scale(0.55)" fill="black">
      {/* Skull */}
      <ellipse cx="0" cy="-10" rx="16" ry="14" />
      <ellipse cx="-6" cy="-12" rx="4" ry="3.5" fill="white" />
      <ellipse cx="6" cy="-12" rx="4" ry="3.5" fill="white" />
      <path d="M-3,-4 L-1,-2 L0,-4 L1,-2 L3,-4" stroke="white" strokeWidth="1.5" fill="none" />
      <rect x="-8" y="2" width="4" height="4" fill="white" />
      <rect x="-2" y="2" width="4" height="4" fill="white" />
      <rect x="4" y="2" width="4" height="4" fill="white" />
      {/* Crossbones */}
      <line x1="-20" y1="12" x2="20" y2="26" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="20" y1="12" x2="-20" y2="26" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </g>
  </Diamond>
);

// GHS07 - Exclamation mark
const GHS07 = () => (
  <Diamond title="GHS07 – Exclamation mark">
    <g transform="translate(50,50)" fill="black">
      <rect x="-4" y="-24" width="8" height="30" rx="3" />
      <circle cx="0" cy="16" r="5" />
    </g>
  </Diamond>
);

// GHS08 - Health hazard (silhouette)
const GHS08 = () => (
  <Diamond title="GHS08 – Health hazard">
    <g transform="translate(50,50) scale(0.55)" fill="black">
      {/* Person silhouette with star/damage on chest */}
      <circle cx="0" cy="-22" r="7" />
      <path d="M-14,-12 L-10,20 L-4,20 L-2,4 L2,4 L4,20 L10,20 L14,-12 C14,-12 8,-16 0,-16 C-8,-16 -14,-12 -14,-12Z" />
      {/* Star on chest indicating health hazard */}
      <polygon points="0,-8 2,-3 7,-3 3,0 5,5 0,2 -5,5 -3,0 -7,-3 -2,-3" fill="white" />
    </g>
  </Diamond>
);

// GHS09 - Environment
const GHS09 = () => (
  <Diamond title="GHS09 – Environment">
    <g transform="translate(50,50) scale(0.5)" fill="black">
      {/* Dead tree */}
      <rect x="-2" y="-24" width="4" height="20" />
      <line x1="0" y1="-20" x2="-10" y2="-28" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="-14" x2="10" y2="-22" stroke="black" strokeWidth="3" strokeLinecap="round" />
      {/* Dead fish */}
      <ellipse cx="0" cy="14" rx="18" ry="8" />
      <circle cx="10" cy="12" r="2" fill="white" />
      <path d="M-18,14 L-26,6 L-26,22Z" />
      {/* Ground/water line */}
      <path d="M-26,0 C-18,4 -10,-2 0,2 C10,6 18,0 26,4" stroke="black" strokeWidth="2" fill="none" />
    </g>
  </Diamond>
);

export const ghsPictogramComponents = {
  GHS01, GHS02, GHS03, GHS04, GHS05, GHS06, GHS07, GHS08, GHS09,
};

export default function GHSPictogramRow({ pictogramIds }) {
  if (!pictogramIds || pictogramIds.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 ghs-pictogram-row">
      {pictogramIds.map((id) => {
        const Component = ghsPictogramComponents[id];
        return Component ? (
          <div key={id} className="flex flex-col items-center gap-0.5">
            <Component />
            <span className="text-[10px] font-mono text-navy-400">{id}</span>
          </div>
        ) : null;
      })}
    </div>
  );
}

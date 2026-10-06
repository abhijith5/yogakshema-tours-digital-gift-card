import React from 'react';

// Official Yogakshema Logo SVG
export const YogakshemaLogo = ({ className = "h-16" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 200 160" className="h-full w-auto filter drop-shadow-sm">
        <defs>
          {/* Sun Gradient */}
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3A0" />
            <stop offset="40%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>
          
          {/* Teal Fort Gradient */}
          <linearGradient id="fortGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B4B6E" />
            <stop offset="100%" stopColor="#042036" />
          </linearGradient>

          {/* Green Wave Gradient */}
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C853" />
            <stop offset="50%" stopColor="#26A69A" />
            <stop offset="100%" stopColor="#00897B" />
          </linearGradient>
        </defs>

        {/* Golden Sun */}
        <circle cx="100" cy="75" r="48" fill="url(#sunGrad)" />

        {/* Flying Bird */}
        <path d="M 145 28 C 148 24 153 23 158 26 C 153 28 150 31 146 32 C 143 31 139 27 135 27 C 139 25 142 26 145 28 Z" fill="#0B4B6E" />
        <path d="M 135 27 C 130 23 124 22 119 25 C 124 27 128 30 132 31 C 133 30 134 28 135 27 Z" fill="#0B4B6E" />

        {/* Palm Trees Left */}
        {/* Palm Tree 1 (Tall) */}
        <path d="M 45 110 Q 42 75 35 45 L 39 45 Q 46 75 48 110 Z" fill="#032030" />
        {/* Leaves */}
        <path d="M 35 45 Q 15 35 10 45 Q 22 47 35 48 Z" fill="#083E58" />
        <path d="M 35 45 Q 20 20 30 15 Q 35 30 36 45 Z" fill="#083E58" />
        <path d="M 35 45 Q 50 15 58 25 Q 48 35 37 45 Z" fill="#083E58" />
        <path d="M 35 45 Q 58 38 65 48 Q 50 52 36 47 Z" fill="#083E58" />

        {/* Palm Tree 2 (Short) */}
        <path d="M 62 110 Q 58 85 52 62 L 55 62 Q 62 85 65 110 Z" fill="#032030" />
        <path d="M 52 62 Q 35 55 30 62 Q 42 63 52 64 Z" fill="#0A4D6D" />
        <path d="M 52 62 Q 40 42 48 38 Q 52 50 53 62 Z" fill="#0A4D6D" />
        <path d="M 52 62 Q 65 40 72 48 Q 63 55 54 62 Z" fill="#0A4D6D" />

        {/* Fort Silhouette Center */}
        <path d="M 70 115 L 70 78 L 78 78 L 78 85 L 86 85 L 86 78 L 94 78 L 94 85 L 102 85 L 102 75 L 115 75 L 115 82 L 122 82 L 122 75 L 130 75 L 130 82 L 138 82 L 138 72 L 155 72 L 155 115 Z" fill="url(#fortGrad)" />
        <rect x="105" y="88" width="10" height="15" rx="5" fill="#FFAA00" opacity="0.8" />
        <rect x="140" y="85" width="8" height="12" rx="4" fill="#FFAA00" opacity="0.8" />

        {/* Bottom Swoosh / Ocean Wave */}
        <path d="M 15 118 Q 60 140 105 125 T 185 115 Q 160 145 100 145 Q 40 145 15 118 Z" fill="url(#waveGrad)" />
        <path d="M 20 126 Q 65 145 110 132 T 180 122 Q 155 150 95 150 Q 35 150 20 126 Z" fill="#00796B" opacity="0.6" />
      </svg>
    </div>
  );
};

// Golden Bow & Ribbon Header SVG
export const GoldenRibbonBow = () => {
  return (
    <svg viewBox="0 0 240 100" className="w-28 h-12 filter drop-shadow-md">
      <defs>
        <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCE881" />
          <stop offset="30%" stopColor="#CBA135" />
          <stop offset="60%" stopColor="#F3E59A" />
          <stop offset="100%" stopColor="#9B7114" />
        </linearGradient>
        <linearGradient id="goldRibbonDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B88A22" />
          <stop offset="100%" stopColor="#6C4E07" />
        </linearGradient>
      </defs>

      {/* Left Ribbon Tail */}
      <path d="M 105 48 C 80 65 50 85 20 95 C 40 80 50 70 65 60 C 55 58 80 50 105 48 Z" fill="url(#goldRibbonDark)" />
      <path d="M 108 50 Q 75 75 25 95 Q 55 78 75 62 Z" fill="url(#goldRibbon)" />

      {/* Right Ribbon Tail */}
      <path d="M 135 48 C 160 65 190 85 220 95 C 200 80 190 70 175 60 C 185 58 160 50 135 48 Z" fill="url(#goldRibbonDark)" />
      <path d="M 132 50 Q 165 75 215 95 Q 185 78 165 62 Z" fill="url(#goldRibbon)" />

      {/* Left Loop */}
      <path d="M 115 45 C 80 15 30 10 35 40 C 40 60 90 52 115 45 Z" fill="url(#goldRibbon)" stroke="#89610B" strokeWidth="1" />
      <path d="M 110 43 C 85 22 50 20 52 38 C 55 48 90 46 110 43 Z" fill="url(#goldRibbonDark)" opacity="0.4" />

      {/* Right Loop */}
      <path d="M 125 45 C 160 15 210 10 205 40 C 200 60 150 52 125 45 Z" fill="url(#goldRibbon)" stroke="#89610B" strokeWidth="1" />
      <path d="M 130 43 C 155 22 190 20 188 38 C 185 48 150 46 130 43 Z" fill="url(#goldRibbonDark)" opacity="0.4" />

      {/* Center Knot */}
      <ellipse cx="120" cy="45" rx="14" ry="12" fill="url(#goldRibbon)" stroke="#745005" strokeWidth="1.5" />
      <path d="M 112 40 C 118 36 122 36 128 40 C 126 50 114 50 112 40 Z" fill="#FFF4B8" opacity="0.6" />
    </svg>
  );
};

// Airplane SVG Illustration
export const JetAirplane = ({ className = "w-32" }) => {
  return (
    <svg viewBox="0 0 300 120" className={className}>
      <defs>
        <linearGradient id="planeBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="planeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0B2545" />
        </linearGradient>
      </defs>

      {/* Main Fuselage */}
      <path d="M 280 40 Q 220 25 120 35 L 40 48 Q 20 52 15 60 Q 20 68 50 65 L 200 58 Q 260 52 280 40 Z" fill="url(#planeBody)" stroke="#64748B" strokeWidth="0.5" />
      
      {/* Nose Cone */}
      <path d="M 280 40 Q 260 38 240 41 L 245 48 Q 265 47 280 40 Z" fill="#1E3A8A" />

      {/* Cockpit Window */}
      <path d="M 245 37 Q 235 37 230 40 L 235 44 L 247 41 Z" fill="#0F172A" />

      {/* Tail Fin */}
      <path d="M 60 46 L 25 10 L 45 10 L 85 43 Z" fill="url(#planeBlue)" />
      <path d="M 28 13 L 42 13 L 75 42 L 55 42 Z" fill="#3B82F6" opacity="0.8" />

      {/* Main Wing (Front) */}
      <path d="M 180 50 L 120 98 Q 110 102 125 100 L 195 53 Z" fill="url(#planeBody)" stroke="#94A3B8" strokeWidth="0.8" />
      <path d="M 125 98 L 120 102 L 115 101 Z" fill="#DC2626" /> {/* Wingtip red light */}

      {/* Jet Engine under Wing */}
      <rect x="145" y="70" width="30" height="12" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="1" />
      <ellipse cx="175" cy="76" rx="3" ry="6" fill="#0284C7" />

      {/* Passenger Windows */}
      <g fill="#1E3A8A" opacity="0.8">
        <circle cx="215" cy="46" r="1.8" />
        <circle cx="205" cy="47" r="1.8" />
        <circle cx="195" cy="48" r="1.8" />
        <circle cx="185" cy="49" r="1.8" />
        <circle cx="175" cy="50" r="1.8" />
        <circle cx="165" cy="51" r="1.8" />
        <circle cx="155" cy="52" r="1.8" />
        <circle cx="145" cy="53" r="1.8" />
        <circle cx="135" cy="54" r="1.8" />
      </g>
    </svg>
  );
};

// Kerala Kettuvallam Houseboat SVG
export const KeralaHouseboat = ({ className = "w-36" }) => {
  return (
    <svg viewBox="0 0 260 110" className={className}>
      <defs>
        <linearGradient id="boatHull" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3E2723" />
          <stop offset="50%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#271C19" />
        </linearGradient>
        <linearGradient id="roofThatch" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D7CCC8" />
          <stop offset="50%" stopColor="#A1887F" />
          <stop offset="100%" stopColor="#6D4C41" />
        </linearGradient>
      </defs>

      {/* Water Ripple Shadow */}
      <ellipse cx="130" cy="92" rx="110" ry="8" fill="#0284C7" opacity="0.3" />

      {/* Curved Wooden Hull */}
      <path d="M 15 75 Q 40 92 130 92 Q 220 92 245 68 Q 230 85 130 85 Q 30 85 15 75 Z" fill="url(#boatHull)" stroke="#1C0D02" strokeWidth="1" />
      
      {/* Arching Thatch Roof Structure */}
      <path d="M 35 72 Q 40 30 70 28 L 190 28 Q 220 30 225 68 L 220 72 Q 130 78 35 72 Z" fill="url(#roofThatch)" stroke="#3E2723" strokeWidth="1.5" />
      
      {/* Roof Thatch Lines */}
      <path d="M 50 45 Q 130 40 210 45" stroke="#4E342E" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 45 58 Q 130 52 215 58" stroke="#4E342E" strokeWidth="1" fill="none" opacity="0.7" />

      {/* Windows & Cabin Posts */}
      <g fill="#FFF8E1" stroke="#3E2723" strokeWidth="1">
        <rect x="75" y="42" width="22" height="22" rx="3" fill="#FFE082" />
        <rect x="105" y="42" width="22" height="22" rx="3" fill="#FFE082" />
        <rect x="135" y="42" width="22" height="22" rx="3" fill="#FFE082" />
        <rect x="165" y="42" width="22" height="22" rx="3" fill="#FFE082" />
      </g>

      {/* Front Curved Prow (Coir Rope Tied Bow) */}
      <path d="M 15 75 C 5 65 10 50 25 45 C 20 58 20 70 35 72 Z" fill="#5D4037" />
      <circle cx="20" cy="50" r="4" fill="#D7CCC8" />
    </svg>
  );
};

// South Indian Gopuram Temple & Shoreline Landscape SVG
export const SouthIndianTempleScene = ({ className = "w-48" }) => {
  return (
    <svg viewBox="0 0 280 160" className={className}>
      <defs>
        <linearGradient id="templeGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF6F00" />
        </linearGradient>
        <linearGradient id="mountainBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
      </defs>

      {/* Background Hills */}
      <path d="M 10 140 Q 60 50 140 70 Q 200 30 270 120 L 280 160 L 0 160 Z" fill="#2E7D32" opacity="0.8" />
      <path d="M 120 140 Q 180 40 270 90 L 280 160 L 100 160 Z" fill="#1B5E20" opacity="0.9" />

      {/* Gopuram Temple Tower 1 (Tall Main Tower) */}
      <g fill="url(#templeGold)" stroke="#B71C1C" strokeWidth="0.5">
        {/* Kalasam Top Pinacles */}
        <polygon points="210,35 208,42 212,42" fill="#FFE082" />
        <polygon points="215,32 213,42 217,42" fill="#FFE082" />
        <polygon points="220,35 218,42 222,42" fill="#FFE082" />

        {/* Tier 1 (Top) */}
        <rect x="205" y="42" width="20" height="10" rx="1" />
        {/* Tier 2 */}
        <rect x="202" y="52" width="26" height="12" rx="1" />
        {/* Tier 3 */}
        <rect x="198" y="64" width="34" height="14" rx="1" />
        {/* Tier 4 */}
        <rect x="194" y="78" width="42" height="16" rx="1" />
        {/* Tier 5 */}
        <rect x="190" y="94" width="50" height="18" rx="1" />
        {/* Base Sanctuary */}
        <rect x="185" y="112" width="60" height="38" />
        {/* Main Arch Door */}
        <path d="M 205 150 L 205 130 A 10 10 0 0 1 225 130 L 225 150 Z" fill="#3E2723" />
      </g>

      {/* Gopuram Temple Tower 2 (Secondary Tower) */}
      <g fill="url(#templeGold)" stroke="#B71C1C" strokeWidth="0.5" transform="translate(-60, 20)">
        <polygon points="215,35 213,42 217,42" fill="#FFE082" />
        <rect x="205" y="42" width="20" height="10" />
        <rect x="201" y="52" width="28" height="12" />
        <rect x="196" y="64" width="38" height="15" />
        <rect x="191" y="79" width="48" height="20" />
        <rect x="185" y="99" width="60" height="31" />
        <path d="M 207 130 L 207 115 A 8 8 0 0 1 223 115 L 223 130 Z" fill="#3E2723" />
      </g>

      {/* Palm Trees along Shoreline */}
      <path d="M 120 150 Q 115 120 110 100" stroke="#3E2723" strokeWidth="3" fill="none" />
      <path d="M 110 100 Q 90 90 85 95" stroke="#2E7D32" strokeWidth="2" fill="none" />
      <path d="M 110 100 Q 100 80 105 75" stroke="#2E7D32" strokeWidth="2" fill="none" />
      <path d="M 110 100 Q 125 80 130 85" stroke="#2E7D32" strokeWidth="2" fill="none" />
      <path d="M 110 100 Q 130 100 135 105" stroke="#2E7D32" strokeWidth="2" fill="none" />
    </svg>
  );
};

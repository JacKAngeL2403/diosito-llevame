import React from 'react';

interface SpriteProps {
  id: string;
  size?: number;
  className?: string;
  isAttacking?: boolean;
  isHit?: boolean;
  isDead?: boolean;
  isCasting?: boolean;
  isDefending?: boolean;
}

export const PixelSprite: React.FC<SpriteProps> = ({
  id,
  size = 72,
  className = '',
  isAttacking = false,
  isHit = false,
  isDead = false,
  isCasting = false,
  isDefending = false,
}) => {
  // Dynamic combat reaction classes
  const animClasses = [
    'transition-all duration-200 select-none pointer-events-none drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)]',
    isAttacking ? '-translate-x-8 scale-110' : '',
    isHit ? 'translate-x-6 brightness-150 saturate-200 animate-pulse' : '',
    isDead ? 'opacity-25 grayscale rotate-90 translate-y-6' : '',
    isCasting ? 'animate-bounce drop-shadow-[0_0_16px_rgba(59,130,246,0.9)]' : '',
    isDefending ? 'scale-95 brightness-90 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]' : '',
    className,
  ].filter(Boolean).join(' ');

  // Rich pixel art models with 48x48 resolution grid, shadows, highlights, and gear
  const renderContent = () => {
    switch (id) {
      // ==========================================
      // HERO / MAGO ELEMENTAL (ARIA)
      // ==========================================
      case 'aria':
      case 'mage':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <defs>
              <radialGradient id="mageAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Ground magical shadow rune */}
            <ellipse cx="24" cy="43" rx="14" ry="4" fill="rgba(0,0,0,0.4)" />
            <ellipse cx="24" cy="43" rx="10" ry="2.5" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />

            {/* Cape flowing behind */}
            <path d="M14 22 L11 41 L19 41 L18 24 Z" fill="#1e1b4b" />
            <path d="M12 25 L10 42 L14 42 Z" fill="#312e81" />

            {/* Robe Body */}
            <path d="M16 22 L13 41 L33 41 L30 22 Z" fill="#2563eb" />
            <path d="M18 23 L16 41 L30 41 L28 23 Z" fill="#1d4ed8" />
            <path d="M22 23 L20 41 L26 41 L24 23 Z" fill="#3b82f6" />
            {/* Golden Star Trim */}
            <rect x="14" y="39" width="18" height="2" fill="#fbbf24" />
            <rect x="22" y="24" width="2" height="15" fill="#f59e0b" />
            <circle cx="23" cy="27" r="1.5" fill="#fde047" />

            {/* Belt & Pouch */}
            <rect x="17" y="27" width="12" height="2" fill="#78350f" />
            <rect x="21" y="26.5" width="4" height="3" fill="#f59e0b" />
            <rect x="27" y="28" width="3" height="4" fill="#92400e" />

            {/* Neck / Scarf */}
            <path d="M18 19 L28 19 L26 23 L20 23 Z" fill="#c084fc" />

            {/* Face & Hair */}
            <path d="M17 13 L29 13 L28 20 L18 20 Z" fill="#fde68a" />
            <path d="M16 14 L18 21 L16 21 Z" fill="#d97706" /> {/* Brown hair strand */}
            <path d="M28 14 L30 21 L28 21 Z" fill="#d97706" />
            {/* Arcane Eyes */}
            <rect x="19" y="16" width="2" height="2.5" fill="#0284c7" />
            <rect x="19" y="16" width="1" height="1" fill="#ffffff" />
            <rect x="25" y="16" width="2" height="2.5" fill="#0284c7" />
            <rect x="25" y="16" width="1" height="1" fill="#ffffff" />

            {/* Wizard Hat with Star Buckle */}
            <path d="M12 13 L34 13 L33 11 L13 11 Z" fill="#312e81" />
            <path d="M14 11 L32 11 L29 7 L17 7 Z" fill="#4338ca" />
            <path d="M17 7 L29 7 L27 3 L19 3 Z" fill="#4f46e5" />
            <path d="M19 3 L27 3 L25 1 L21 1 Z" fill="#6366f1" />
            {/* Hat Band & Moon Crescent */}
            <rect x="14" y="10" width="18" height="2" fill="#eab308" />
            <circle cx="23" cy="9" r="1.5" fill="#fef08a" />

            {/* Arcane Staff in Hand */}
            <rect x="7" y="8" width="2.5" height="34" fill="#5c290a" rx="1" />
            <rect x="6.5" y="18" width="3.5" height="4" fill="#b45309" />
            {/* Staff Orb & Floating Arcane Ring */}
            <circle cx="8" cy="8" r="4.5" fill="url(#mageAura)" />
            <circle cx="8" cy="8" r="3.2" fill="#38bdf8" />
            <circle cx="7.5" cy="7.5" r="1.5" fill="#ffffff" />
            <circle cx="5" cy="5" r="1" fill="#a5f3fc" />
            <circle cx="11" cy="9" r="1" fill="#67e8f9" />
          </svg>
        );

      // ==========================================
      // CABALLERO / GUERRERO (BRONN)
      // ==========================================
      case 'bronn':
      case 'warrior':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            {/* Shadow */}
            <ellipse cx="24" cy="44" rx="15" ry="4" fill="rgba(0,0,0,0.45)" />

            {/* Crimson Cape Flowing */}
            <path d="M12 18 L7 42 L16 42 L16 22 Z" fill="#991b1b" />
            <path d="M9 22 L8 42 L13 42 Z" fill="#b91c1c" />

            {/* Iron Plate Armor - Legs */}
            <rect x="18" y="34" width="4.5" height="8" fill="#475569" />
            <rect x="23.5" y="34" width="4.5" height="8" fill="#475569" />
            <rect x="17" y="40" width="6" height="3" fill="#1e293b" />
            <rect x="23" y="40" width="6" height="3" fill="#1e293b" />

            {/* Torso Armor */}
            <path d="M16 18 L30 18 L28 34 L18 34 Z" fill="#64748b" />
            <path d="M18 20 L28 20 L26 32 L20 32 Z" fill="#94a3b8" />
            {/* Golden Lion Crest */}
            <rect x="21" y="22" width="4" height="6" fill="#f59e0b" />
            <rect x="19" y="24" width="8" height="2" fill="#f59e0b" />
            <circle cx="23" cy="24" r="1" fill="#fde047" />

            {/* Armored Pauldrons (Shoulders) */}
            <rect x="13" y="17" width="4" height="6" fill="#cbd5e1" rx="1" />
            <rect x="12" y="18" width="5" height="2" fill="#f59e0b" />
            <rect x="29" y="17" width="4" height="6" fill="#cbd5e1" rx="1" />
            <rect x="29" y="18" width="5" height="2" fill="#f59e0b" />

            {/* Knight Great Helm */}
            <path d="M17 7 L29 7 L29 18 L17 18 Z" fill="#94a3b8" />
            <path d="M19 8 L27 8 L27 17 L19 17 Z" fill="#cbd5e1" />
            {/* Visor Slit */}
            <rect x="18" y="12" width="10" height="2.5" fill="#0f172a" />
            <rect x="22" y="10" width="2" height="7" fill="#0f172a" />
            {/* Red Feathered Plume */}
            <path d="M22 1 C19 1 20 6 22 7 Z" fill="#ef4444" />
            <path d="M23 1 C26 1 25 6 23 7 Z" fill="#dc2626" />
            <circle cx="22.5" cy="7" r="1.5" fill="#f59e0b" />

            {/* Broadsword in Hand */}
            <rect x="33" y="5" width="2.5" height="27" fill="#f1f5f9" />
            <rect x="32" y="5" width="1" height="27" fill="#94a3b8" />
            <rect x="30" y="27" width="8" height="2.5" fill="#d97706" rx="0.5" />
            <rect x="33" y="29.5" width="2.5" height="5" fill="#78350f" />
            <circle cx="34" cy="35" r="1.8" fill="#f59e0b" />

            {/* Tower Kite Shield */}
            <path d="M7 18 L15 18 L14 36 L11 40 L8 36 Z" fill="#1e3a8a" />
            <path d="M8 19 L14 19 L13 35 L11 38 L9 35 Z" fill="#2563eb" />
            <rect x="9.5" y="22" width="3" height="12" fill="#fbbf24" />
            <rect x="8" y="26" width="6" height="3" fill="#fbbf24" />
            <circle cx="11" cy="27.5" r="1.5" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // SACERDOTISA / CLÉRIGA (LYRIA)
      // ==========================================
      case 'lyria':
      case 'cleric':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="14" ry="4" fill="rgba(0,0,0,0.35)" />
            {/* Holy Radiant Halo */}
            <circle cx="24" cy="13" r="11" fill="none" stroke="#fde047" strokeWidth="1.5" opacity="0.75" />
            <circle cx="24" cy="13" r="11" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3 3" />

            {/* White & Gold Saintly Robes */}
            <path d="M15 20 L11 41 L35 41 L31 20 Z" fill="#f8fafc" />
            <path d="M18 21 L15 41 L31 41 L28 21 Z" fill="#f1f5f9" />
            {/* Golden Stole & Sun Pendant */}
            <rect x="21" y="20" width="4" height="21" fill="#f59e0b" />
            <rect x="22" y="21" width="2" height="20" fill="#fde047" />
            <circle cx="23" cy="25" r="2.5" fill="#d97706" />
            <circle cx="23" cy="25" r="1.5" fill="#fef08a" />

            {/* Gold Sleeves */}
            <rect x="13" y="22" width="4" height="12" fill="#e2e8f0" rx="1" />
            <rect x="29" y="22" width="4" height="12" fill="#e2e8f0" rx="1" />
            <rect x="13" y="32" width="4" height="2" fill="#f59e0b" />
            <rect x="29" y="32" width="4" height="2" fill="#f59e0b" />

            {/* Head & Mitre */}
            <path d="M18 12 L28 12 L27 19 L19 19 Z" fill="#fde68a" />
            {/* Kind Blue Eyes */}
            <rect x="20" y="15" width="2" height="2" fill="#0284c7" />
            <rect x="24" y="15" width="2" height="2" fill="#0284c7" />
            {/* White Cleric Mitre / Hood with Cross */}
            <path d="M17 5 L29 5 L31 12 L15 12 Z" fill="#f8fafc" />
            <path d="M21 2 L25 2 L29 5 L17 5 Z" fill="#f1f5f9" />
            <rect x="22" y="4" width="2" height="6" fill="#dc2626" />
            <rect x="20" y="6" width="6" height="2" fill="#dc2626" />

            {/* Golden Sun Scepter */}
            <rect x="8" y="10" width="2.5" height="32" fill="#d97706" rx="0.5" />
            <circle cx="9" cy="10" r="5" fill="#fde047" />
            <circle cx="9" cy="10" r="3.2" fill="#f59e0b" />
            <circle cx="9" cy="10" r="1.5" fill="#ffffff" />
            {/* Sun Rays */}
            <rect x="8" y="3" width="2" height="3" fill="#fde047" />
            <rect x="8" y="14" width="2" height="3" fill="#fde047" />
            <rect x="2" y="9" width="3" height="2" fill="#fde047" />
            <rect x="13" y="9" width="3" height="2" fill="#fde047" />
          </svg>
        );

      // ==========================================
      // ACECHADOR / PÍCARO (KAEL)
      // ==========================================
      case 'kael':
      case 'rogue':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="14" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Dark Shadow Cloak */}
            <path d="M14 18 L8 41 L17 41 L17 22 Z" fill="#064e3b" />
            <path d="M30 18 L37 41 L29 41 L29 22 Z" fill="#064e3b" />

            {/* Leather Tunic & Belt */}
            <rect x="18" y="20" width="10" height="15" fill="#14532d" />
            <rect x="19" y="21" width="8" height="13" fill="#166534" />
            {/* Crossed Leather Straps */}
            <line x1="18" y1="20" x2="28" y2="30" stroke="#78350f" strokeWidth="1.5" />
            <line x1="28" y1="20" x2="18" y2="30" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="23" cy="25" r="1.5" fill="#ca8a04" />
            {/* Boots */}
            <rect x="18" y="35" width="4" height="7" fill="#1e293b" />
            <rect x="24" y="35" width="4" height="7" fill="#1e293b" />

            {/* Face in Hood Shadow */}
            <path d="M18 10 L28 10 L27 18 L19 18 Z" fill="#fde68a" />
            {/* Dark Assassin Mask */}
            <rect x="18" y="14" width="10" height="6" fill="#064e3b" />
            {/* Sharp Piercing Eyes */}
            <rect x="19" y="12" width="2.5" height="1.5" fill="#22c55e" />
            <rect x="24.5" y="12" width="2.5" height="1.5" fill="#22c55e" />
            {/* Shadow Hood */}
            <path d="M15 7 L31 7 L30 14 L16 14 Z" fill="#064e3b" />
            <path d="M19 3 L27 3 L31 7 L15 7 Z" fill="#047857" />

            {/* Twin Venom Daggers */}
            {/* Left Dagger */}
            <rect x="8" y="19" width="2" height="13" fill="#e2e8f0" />
            <rect x="7" y="19" width="1" height="13" fill="#a7f3d0" /> {/* Poison sheen */}
            <rect x="6.5" y="28" width="5" height="1.5" fill="#78350f" />
            <rect x="8" y="29.5" width="2" height="4" fill="#0f172a" />
            {/* Right Dagger */}
            <rect x="36" y="17" width="2" height="13" fill="#e2e8f0" />
            <rect x="37" y="17" width="1" height="13" fill="#a7f3d0" />
            <rect x="34.5" y="26" width="5" height="1.5" fill="#78350f" />
            <rect x="36" y="27.5" width="2" height="4" fill="#0f172a" />
          </svg>
        );

      // ==========================================
      // PALADÍN / CRUZADO (SELENA / PALADIN)
      // ==========================================
      case 'selena':
      case 'paladin':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="15" ry="4" fill="rgba(0,0,0,0.4)" />
            {/* Gilded Armor Plate */}
            <rect x="18" y="34" width="4.5" height="8" fill="#eab308" />
            <rect x="23.5" y="34" width="4.5" height="8" fill="#eab308" />
            <rect x="17" y="40" width="6" height="3" fill="#ca8a04" />
            <rect x="23" y="40" width="6" height="3" fill="#ca8a04" />

            {/* Radiant White/Gold Breastplate */}
            <path d="M16 18 L30 18 L28 34 L18 34 Z" fill="#f8fafc" />
            <path d="M18 20 L28 20 L26 32 L20 32 Z" fill="#fef08a" />
            {/* Sun Cross Emblem */}
            <rect x="21" y="22" width="4" height="8" fill="#eab308" />
            <rect x="18" y="24" width="10" height="3" fill="#eab308" />
            <circle cx="23" cy="25.5" r="1.5" fill="#ffffff" />

            {/* Winged Helmet */}
            <path d="M17 7 L29 7 L29 18 L17 18 Z" fill="#fef08a" />
            <path d="M19 8 L27 8 L27 17 L19 17 Z" fill="#facc15" />
            <rect x="18" y="12" width="10" height="2" fill="#0f172a" />
            {/* Wing Crests */}
            <polygon points="17,10 11,4 16,6" fill="#ffffff" />
            <polygon points="29,10 35,4 30,6" fill="#ffffff" />

            {/* Radiant Warhammer */}
            <rect x="33" y="6" width="3" height="28" fill="#ca8a04" rx="0.5" />
            <rect x="28" y="6" width="13" height="7" fill="#facc15" rx="1" />
            <rect x="29" y="7" width="11" height="5" fill="#fef08a" />
            <rect x="33" y="6" width="3" height="7" fill="#eab308" />

            {/* Radiant Kite Shield */}
            <path d="M7 18 L15 18 L14 36 L11 40 L8 36 Z" fill="#3b82f6" />
            <circle cx="11" cy="27" r="3" fill="#fde047" />
            <circle cx="11" cy="27" r="1.5" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // DARK FANTASY ENEMY: SKELETON KNIGHT
      // ==========================================
      case 'skeleton_knight':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="14" ry="4" fill="rgba(0,0,0,0.5)" />
            {/* Tattered Purple Cape */}
            <path d="M12 18 L6 42 L16 42 L16 22 Z" fill="#4c1d95" />
            <path d="M8 22 L7 42 L12 42 Z" fill="#581c87" />

            {/* Rusted Bronze Armor */}
            <rect x="18" y="34" width="4" height="8" fill="#451a03" />
            <rect x="24" y="34" width="4" height="8" fill="#451a03" />
            <path d="M16 18 L30 18 L28 34 L18 34 Z" fill="#78350f" />
            <path d="M18 20 L28 20 L26 32 L20 32 Z" fill="#92400e" />

            {/* Bone Skull Head */}
            <path d="M18 8 L28 8 L28 18 L18 18 Z" fill="#f8fafc" />
            {/* Glowing Eerie Violet Eye Sockets */}
            <rect x="19" y="11" width="3" height="3.5" fill="#020617" />
            <circle cx="20.5" cy="12.5" r="1" fill="#c084fc" />
            <rect x="24" y="11" width="3" height="3.5" fill="#020617" />
            <circle cx="25.5" cy="12.5" r="1" fill="#c084fc" />
            {/* Exposed Teeth */}
            <rect x="20" y="15" width="6" height="2" fill="#cbd5e1" />
            <line x1="22" y1="15" x2="22" y2="17" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="24" y1="15" x2="24" y2="17" stroke="#0f172a" strokeWidth="0.8" />

            {/* Spiked Horned Broken Helm */}
            <path d="M17 5 L29 5 L28 9 L18 9 Z" fill="#334155" />
            <polygon points="17,5 14,1 19,4" fill="#475569" />
            <polygon points="29,5 32,1 27,4" fill="#475569" />

            {/* Jagged Dark Broadsword */}
            <rect x="33" y="6" width="3" height="28" fill="#cbd5e1" />
            <rect x="32" y="8" width="1" height="4" fill="#020617" />
            <rect x="31" y="28" width="8" height="2.5" fill="#78350f" />
            <circle cx="34.5" cy="35" r="1.5" fill="#9333ea" />

            {/* Heavy Shield with Spikes */}
            <path d="M7 18 L15 18 L14 36 L11 40 L8 36 Z" fill="#334155" />
            <circle cx="11" cy="27" r="2.5" fill="#92400e" />
            <polygon points="11,27 8,24 11,21" fill="#cbd5e1" />
          </svg>
        );

      // ==========================================
      // PLAGUE DOCTOR / NECROMANCER (NIGROMANTE)
      // ==========================================
      case 'plague_doctor':
      case 'necromancer':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="14" ry="4" fill="rgba(0,0,0,0.5)" />
            {/* Long Gothic Trench Coat */}
            <path d="M14 18 L9 42 L37 42 L32 18 Z" fill="#0f172a" />
            <path d="M17 19 L13 41 L33 41 L29 19 Z" fill="#1e293b" />
            {/* Belts and Alchemical Vials */}
            <line x1="16" y1="20" x2="30" y2="34" stroke="#78350f" strokeWidth="2" />
            <circle cx="20" cy="24" r="2" fill="#22c55e" />
            <circle cx="24" cy="28" r="2" fill="#a855f7" />
            <circle cx="28" cy="32" r="2" fill="#ef4444" />

            {/* Raven Beak Mask */}
            <path d="M18 10 L28 10 L27 18 L19 18 Z" fill="#f8fafc" />
            {/* Beak */}
            <polygon points="21,14 10,19 21,17" fill="#e2e8f0" />
            {/* Glowing Ruby Goggles */}
            <circle cx="23" cy="13" r="2.5" fill="#dc2626" />
            <circle cx="23" cy="13" r="1.2" fill="#fca5a5" />

            {/* Wide Brimmed Black Hat */}
            <rect x="10" y="8" width="26" height="3" fill="#09090b" rx="1" />
            <rect x="15" y="1" width="16" height="8" fill="#18181b" />
            <rect x="15" y="7" width="16" height="1.5" fill="#713f12" />

            {/* Staff with Glowing Green Soul Skull */}
            <rect x="36" y="8" width="2.5" height="33" fill="#451a03" rx="0.5" />
            <circle cx="37" cy="8" r="4.5" fill="#22c55e" opacity="0.3" />
            <circle cx="37" cy="8" r="3" fill="#86efac" />
            <rect x="35.5" y="7" width="1.2" height="1.2" fill="#052e16" />
            <rect x="37.5" y="7" width="1.2" height="1.2" fill="#052e16" />
          </svg>
        );

      // ==========================================
      // FINAL BOSS: DRAGÓN ROJO CARMESÍ
      // ==========================================
      case 'red_dragon':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="44" rx="18" ry="4" fill="rgba(0,0,0,0.6)" />
            {/* Massive Dragon Wings */}
            <polygon points="4,8 18,22 2,28" fill="#991b1b" />
            <polygon points="6,11 16,21 5,25" fill="#b91c1c" />
            <polygon points="44,8 30,22 46,28" fill="#991b1b" />
            <polygon points="42,11 32,21 43,25" fill="#b91c1c" />

            {/* Dragon Body */}
            <path d="M14 20 L34 20 L31 40 L17 40 Z" fill="#dc2626" />
            {/* Molten Yellow Scale Belly */}
            <rect x="18" y="24" width="12" height="15" fill="#fef08a" />
            <line x1="18" y1="27" x2="30" y2="27" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="18" y1="31" x2="30" y2="31" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="18" y1="35" x2="30" y2="35" stroke="#ca8a04" strokeWidth="1.5" />

            {/* Dragon Head with Horns */}
            <path d="M16 10 L32 10 L30 22 L18 22 Z" fill="#ef4444" />
            {/* Horns */}
            <polygon points="16,10 10,2 18,7" fill="#f59e0b" />
            <polygon points="32,10 38,2 30,7" fill="#f59e0b" />
            {/* Glowing Burning Eyes */}
            <rect x="18" y="13" width="3" height="3" fill="#fde047" />
            <circle cx="19.5" cy="14.5" r="1" fill="#78350f" />
            <rect x="27" y="13" width="3" height="3" fill="#fde047" />
            <circle cx="28.5" cy="14.5" r="1" fill="#78350f" />
            {/* Fiery Maw with Fangs */}
            <rect x="19" y="18" width="10" height="3" fill="#450a0a" />
            <rect x="20" y="18" width="2" height="2" fill="#ffffff" />
            <rect x="26" y="18" width="2" height="2" fill="#ffffff" />
            {/* Smoke / Ember Puff */}
            <circle cx="21" cy="20" r="1.5" fill="#f97316" />
            <circle cx="27" cy="20" r="1.5" fill="#ea580c" />

            {/* Tail */}
            <path d="M30 36 L42 40 L38 43 L28 39 Z" fill="#b91c1c" />
            <polygon points="42,40 46,38 44,43" fill="#f59e0b" />
          </svg>
        );

      // ==========================================
      // BOSS: REY GELATINOSO (KING SLIME)
      // ==========================================
      case 'king_slime':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="18" ry="4.5" fill="rgba(0,0,0,0.5)" />
            {/* Giant Royal Blue Slime Body */}
            <path d="M8 38 L40 38 L38 42 L10 42 Z" fill="#1e40af" />
            <path d="M6 28 L42 28 L40 38 L8 38 Z" fill="#2563eb" />
            <path d="M10 20 L38 20 L42 28 L6 28 Z" fill="#3b82f6" />
            <path d="M16 16 L32 16 L38 20 L10 20 Z" fill="#60a5fa" />
            {/* Gelatinous Core Glow */}
            <ellipse cx="24" cy="30" rx="8" ry="5" fill="#93c5fd" opacity="0.6" />

            {/* Royal Golden Crown */}
            <path d="M14 8 L34 8 L32 16 L16 16 Z" fill="#eab308" />
            <polygon points="14,8 14,2 18,8" fill="#facc15" />
            <polygon points="21,8 24,1 27,8" fill="#facc15" />
            <polygon points="30,8 34,2 34,8" fill="#facc15" />
            {/* Crown Jewels */}
            <circle cx="16" cy="11" r="1.5" fill="#ef4444" />
            <circle cx="24" cy="10" r="2" fill="#3b82f6" />
            <circle cx="32" cy="11" r="1.5" fill="#22c55e" />

            {/* Big Cute Eyes */}
            <rect x="14" y="24" width="4.5" height="6" fill="#0f172a" rx="1" />
            <rect x="14" y="24" width="2" height="2" fill="#ffffff" />
            <rect x="29" y="24" width="4.5" height="6" fill="#0f172a" rx="1" />
            <rect x="29" y="24" width="2" height="2" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: SLIME
      // ==========================================
      case 'slime':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="42" rx="15" ry="3.5" fill="rgba(0,0,0,0.35)" />
            <path d="M12 36 L36 36 L34 40 L14 40 Z" fill="#15803d" />
            <path d="M10 28 L38 28 L36 36 L12 36 Z" fill="#16a34a" />
            <path d="M13 22 L35 22 L38 28 L10 28 Z" fill="#22c55e" />
            <path d="M18 18 L30 18 L35 22 L13 22 Z" fill="#4ade80" />
            {/* Highlight bubble */}
            <ellipse cx="20" cy="22" rx="3" ry="1.5" fill="#86efac" />
            {/* Eyes */}
            <rect x="16" y="28" width="3.5" height="5" fill="#052e16" rx="0.5" />
            <rect x="16" y="28" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="28" y="28" width="3.5" height="5" fill="#052e16" rx="0.5" />
            <rect x="28" y="28" width="1.5" height="1.5" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: GÁRGOLA DE PIEDRA
      // ==========================================
      case 'stone_gargoyle':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            {/* Pedestal */}
            <rect x="12" y="40" width="24" height="4" fill="#1e293b" />
            <rect x="14" y="37" width="20" height="3" fill="#334155" />
            {/* Stone Wings */}
            <polygon points="6,12 18,24 4,30" fill="#475569" />
            <polygon points="42,12 30,24 44,30" fill="#475569" />
            {/* Stone Body */}
            <path d="M16 18 L32 18 L29 36 L19 36 Z" fill="#64748b" />
            {/* Stone Head with Horns */}
            <path d="M17 10 L31 10 L29 20 L19 20 Z" fill="#64748b" />
            <polygon points="17,10 13,3 20,7" fill="#334155" />
            <polygon points="31,10 35,3 28,7" fill="#334155" />
            {/* Glowing Red Eyes */}
            <rect x="19" y="13" width="3" height="3" fill="#dc2626" />
            <rect x="26" y="13" width="3" height="3" fill="#dc2626" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: IMP DEL VACÍO
      // ==========================================
      case 'void_imp':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges animate-pulse">
            <ellipse cx="24" cy="43" rx="10" ry="2.5" fill="rgba(0,0,0,0.3)" />
            {/* Void Wings */}
            <polygon points="6,10 18,22 7,28" fill="#3b0764" />
            <polygon points="42,10 30,22 41,28" fill="#3b0764" />
            {/* Body */}
            <rect x="18" y="16" width="12" height="18" fill="#2e1065" rx="1" />
            {/* Horns */}
            <polygon points="19,16 16,9 22,14" fill="#6b21a8" />
            <polygon points="29,16 32,9 26,14" fill="#6b21a8" />
            {/* Eyes */}
            <rect x="19" y="19" width="3" height="3" fill="#ef4444" />
            <rect x="26" y="19" width="3" height="3" fill="#ef4444" />
            {/* Shadow ball */}
            <circle cx="36" cy="26" r="4.5" fill="#9333ea" />
            <circle cx="36" cy="26" r="2" fill="#f3e8ff" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: GOBLIN
      // ==========================================
      case 'goblin':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="13" ry="3.5" fill="rgba(0,0,0,0.35)" />
            {/* Body */}
            <rect x="18" y="24" width="12" height="15" fill="#15803d" />
            <rect x="19" y="25" width="10" height="10" fill="#78350f" />
            {/* Head & Pointy Ears */}
            <path d="M17 12 L31 12 L29 24 L19 24 Z" fill="#22c55e" />
            <polygon points="17,17 9,13 17,20" fill="#22c55e" />
            <polygon points="31,17 39,13 31,20" fill="#22c55e" />
            {/* Red Eyes */}
            <rect x="19" y="16" width="3" height="3" fill="#dc2626" />
            <rect x="26" y="16" width="3" height="3" fill="#dc2626" />
            {/* Spiked Club */}
            <rect x="33" y="14" width="5" height="24" fill="#92400e" rx="1" />
            <rect x="32" y="14" width="7" height="6" fill="#78350f" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: MURCIÉLAGO (BAT)
      // ==========================================
      case 'bat':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges animate-pulse">
            <ellipse cx="24" cy="43" rx="8" ry="2" fill="rgba(0,0,0,0.3)" />
            <polygon points="4,14 18,24 6,32" fill="#581c87" />
            <polygon points="44,14 30,24 42,32" fill="#581c87" />
            <rect x="18" y="18" width="12" height="14" fill="#3b0764" rx="2" />
            <rect x="20" y="21" width="2.5" height="2.5" fill="#ef4444" />
            <rect x="25.5" y="21" width="2.5" height="2.5" fill="#ef4444" />
            <rect x="21" y="27" width="1.5" height="3" fill="#ffffff" />
            <rect x="25.5" y="27" width="1.5" height="3" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: ESQUELETO (SKELETON)
      // ==========================================
      case 'skeleton':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="43" rx="11" ry="3" fill="rgba(0,0,0,0.35)" />
            {/* Ribs */}
            <rect x="23" y="20" width="2" height="17" fill="#f8fafc" />
            <rect x="18" y="23" width="12" height="2" fill="#f8fafc" />
            <rect x="19" y="27" width="10" height="2" fill="#f8fafc" />
            <rect x="20" y="31" width="8" height="2" fill="#f8fafc" />
            {/* Skull */}
            <path d="M18 10 L30 10 L29 19 L19 19 Z" fill="#f8fafc" />
            <rect x="20" y="13" width="3" height="3.5" fill="#020617" />
            <rect x="25" y="13" width="3" height="3.5" fill="#020617" />
            <rect x="21" y="17" width="6" height="1.5" fill="#94a3b8" />
            {/* Sword */}
            <rect x="33" y="12" width="2.5" height="26" fill="#94a3b8" />
            <rect x="31" y="28" width="6.5" height="2" fill="#78350f" />
          </svg>
        );

      // ==========================================
      // MONSTRUO: LOBO SOMBRÍO (WOLF)
      // ==========================================
      case 'wolf':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full shape-rendering-crispEdges">
            <ellipse cx="24" cy="42" rx="16" ry="3.5" fill="rgba(0,0,0,0.4)" />
            <path d="M12 22 L36 22 L33 38 L15 38 Z" fill="#312e81" />
            <path d="M26 14 L40 14 L36 26 L22 26 Z" fill="#3730a3" />
            <polygon points="26,14 29,6 33,14" fill="#312e81" />
            <rect x="34" y="17" width="3" height="3" fill="#ef4444" />
            <polygon points="40,22 46,24 40,26" fill="#4338ca" />
            <rect x="42" y="25" width="2" height="3" fill="#ffffff" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-xs rounded">
            {id}
          </div>
        );
    }
  };

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative inline-block ${animClasses}`}
    >
      {renderContent()}
    </div>
  );
};

// =========================================================================
// HIGH-FIDELITY CHARACTER BUST / PORTRAIT (FOR DIALOGS, CARDS, HUD)
// =========================================================================
interface PortraitProps {
  id: string;
  size?: number;
  className?: string;
}

export const PixelPortrait: React.FC<PortraitProps> = ({
  id,
  size = 56,
  className = '',
}) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-lg overflow-hidden border-2 border-amber-400/70 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0 flex items-center justify-center ${className}`}
    >
      <PixelSprite id={id} size={size * 1.25} className="mt-1" />
    </div>
  );
};

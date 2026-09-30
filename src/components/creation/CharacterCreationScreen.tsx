import React, { useState } from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { PixelSprite, PixelPortrait } from '../battle/PixelSprites';
import { Character, CharacterClass } from '../../types/game';
import { ALL_ITEMS } from '../../data/itemsData';
import { sound } from '../../services/soundService';
import { 
  Sparkles, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Check, 
  Dice5, 
  Compass,
  Scroll,
  Crown
} from 'lucide-react';

interface CharacterCreationProps {
  onCharacterCreated: (hero: Character, bonusGold: number) => void;
}

interface ClassOption {
  classId: CharacterClass;
  title: string;
  avatar: string;
  description: string;
  startingSkills: string[];
  baseHp: number;
  baseMp: number;
  baseAtk: number;
  baseDef: number;
  baseMag: number;
  baseSpeed: number;
  weaponId: string;
  armorId: string;
  accessoryId: string;
}

const CLASS_OPTIONS: ClassOption[] = [
  {
    classId: 'GUERRERO',
    title: 'Guerrero de Vanguardia',
    avatar: 'warrior',
    description: 'Especialista en combate cuerpo a cuerpo, armadura de placas completa y mandobles implacables.',
    startingSkills: ['heavy_slash', 'whirlwind', 'battle_cry'],
    baseHp: 160,
    baseMp: 20,
    baseAtk: 18,
    baseDef: 16,
    baseMag: 6,
    baseSpeed: 8,
    weaponId: 'iron_broadsword',
    armorId: 'iron_plate_armor',
    accessoryId: 'ring_of_might',
  },
  {
    classId: 'MAGO',
    title: 'Hechicero Astral',
    avatar: 'aria',
    description: 'Canalizador de artes arcanas, báculo de cristal y orbe cósmico que desata fuego, hielo y escudos de maná.',
    startingSkills: ['fireball', 'blizzard', 'mana_shield'],
    baseHp: 115,
    baseMp: 45,
    baseAtk: 10,
    baseDef: 8,
    baseMag: 24,
    baseSpeed: 10,
    weaponId: 'crystal_staff',
    armorId: 'mage_silk_robe',
    accessoryId: 'amulet_of_wisdom',
  },
  {
    classId: 'PICARO',
    title: 'Acechador Sombrío',
    avatar: 'kael',
    description: 'Maestro de la velocidad y las sombras, dagas con veneno mithril y golpes críticos letales.',
    startingSkills: ['shadow_strike', 'venom_blade', 'blade_dance'],
    baseHp: 125,
    baseMp: 25,
    baseAtk: 19,
    baseDef: 9,
    baseMag: 8,
    baseSpeed: 16,
    weaponId: 'shadow_daggers',
    armorId: 'leather_tunic',
    accessoryId: 'winged_boots',
  },
  {
    classId: 'CLERIGO',
    title: 'Sacerdotisa Solar',
    avatar: 'lyria',
    description: 'Portadora del sol y vestiduras sagradas, mitre celestial y cetro solar que restaura y bendice.',
    startingSkills: ['holy_heal', 'radiant_ray', 'sanctuary_prayer'],
    baseHp: 120,
    baseMp: 40,
    baseAtk: 11,
    baseDef: 10,
    baseMag: 20,
    baseSpeed: 9,
    weaponId: 'silver_mace',
    armorId: 'leather_tunic',
    accessoryId: 'amulet_of_wisdom',
  },
  {
    classId: 'PALADIN',
    title: 'Paladín Sagrado',
    avatar: 'paladin',
    description: 'Cruzado bendecido por la luz con armadura áurea, égida solar y martillo de guerra demoledor.',
    startingSkills: ['holy_smite', 'divine_aegis', 'lay_on_hands'],
    baseHp: 155,
    baseMp: 28,
    baseAtk: 17,
    baseDef: 17,
    baseMag: 15,
    baseSpeed: 8,
    weaponId: 'iron_broadsword',
    armorId: 'iron_plate_armor',
    accessoryId: 'ring_of_might',
  },
];

const BACKGROUND_PERKS = [
  {
    id: 'royal',
    name: 'Heredero de la Corona Caída',
    desc: 'Empiezas con +120 Monedas de Oro y un Medallón del Titán.',
    bonusGold: 120,
    bonusHp: 10,
  },
  {
    id: 'scholar',
    name: 'Erudito de la Torre Astral',
    desc: 'Empiezas con +15 Max MP y un Éter Puro en tu mochila.',
    bonusGold: 40,
    bonusMp: 15,
  },
  {
    id: 'outcast',
    name: 'Superviviente de las Fronteras',
    desc: 'Empiezas con +25 Max HP y una Poción Concentrada extra.',
    bonusGold: 50,
    bonusHp: 25,
  },
];

export const CharacterCreationScreen: React.FC<CharacterCreationProps> = ({
  onCharacterCreated,
}) => {
  const [heroName, setHeroName] = useState<string>('Eldrin');
  const [selectedClassIndex, setSelectedClassIndex] = useState<number>(0);
  const [selectedPerkIndex, setSelectedPerkIndex] = useState<number>(0);

  const selectedClass = CLASS_OPTIONS[selectedClassIndex];
  const selectedPerk = BACKGROUND_PERKS[selectedPerkIndex];

  const handleRandomizeName = () => {
    sound.playCursor();
    const names = [
      'Eldrin', 'Valeria', 'Rowan', 'Kaelen', 'Aria', 'Theron', 'Lyra', 
      'Darian', 'Morrigan', 'Gideon', 'Sylvan', 'Astrid', 'Corbin', 'Vesper'
    ];
    const random = names[Math.floor(Math.random() * names.length)];
    setHeroName(random);
  };

  const handleConfirmCreation = () => {
    sound.playConfirm();

    const createdHero: Character = {
      id: `hero_${Date.now()}`,
      name: heroName.trim() || 'Héroe Solitario',
      characterClass: selectedClass.classId,
      title: selectedClass.title,
      avatar: selectedClass.avatar,
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: selectedClass.baseHp + (selectedPerk.bonusHp || 0),
      maxHp: selectedClass.baseHp + (selectedPerk.bonusHp || 0),
      mp: selectedClass.baseMp + (selectedPerk.bonusMp || 0),
      maxMp: selectedClass.baseMp + (selectedPerk.bonusMp || 0),
      baseAtk: selectedClass.baseAtk,
      baseDef: selectedClass.baseDef,
      baseMag: selectedClass.baseMag,
      baseRes: 10,
      baseSpeed: selectedClass.baseSpeed,
      baseCrit: 8,
      skillPoints: 2,
      learnedSkillIds: [...selectedClass.startingSkills],
      equippedSkillIds: [...selectedClass.startingSkills],
      equipment: {
        weapon: ALL_ITEMS[selectedClass.weaponId],
        armor: ALL_ITEMS[selectedClass.armorId],
        accessory: ALL_ITEMS[selectedClass.accessoryId],
      },
      isLeader: true,
      statusEffects: [],
    };

    onCharacterCreated(createdHero, selectedPerk.bonusGold);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      {/* Title Lore Banner (Centered) */}
      <RetroWindow title="FORJA DEL AVENTURERO · PIXEL QUEST" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/50 rounded-xl hidden sm:flex">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300 font-['Cinzel'] tracking-wide">
                EL ORIGEN DEL HÉROE
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl leading-relaxed">
                Comienzas tu travesía solo frente a la Cripta de las Sombras. Diseña tu clase inicial; conforme explores sus misterios, rescatarás compañeros para tu grupo.
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 bg-amber-950/80 rounded-full border border-amber-500/60 text-xs font-mono text-amber-300 shadow">
            Aventura Solitaria
          </div>
        </div>
      </RetroWindow>

      {/* Main Form Split */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Side: Name and Class Selection (Cols 7) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <RetroWindow title="1. NOMBRE Y CLASE DE COMBATE" centerTitle>
            {/* Name input */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] font-mono text-amber-300 font-bold">
                  Nombre del Protagonista:
                </label>
                <input
                  type="text"
                  value={heroName}
                  maxLength={18}
                  onChange={(e) => setHeroName(e.target.value)}
                  className="px-3 py-2 bg-slate-900/90 border border-amber-400/50 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={handleRandomizeName}
                title="Generar Nombre Aleatorio"
                className="mt-5 p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-400/40 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow"
              >
                <Dice5 className="w-5 h-5" />
              </button>
            </div>

            {/* Class Cards */}
            <label className="text-[11px] font-mono text-amber-300 font-bold block mb-2">
              Elige tu Arquetipo Heroico:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLASS_OPTIONS.map((c, idx) => {
                const isSelected = selectedClassIndex === idx;
                return (
                  <div
                    key={c.classId}
                    onClick={() => {
                      sound.playCursor();
                      setSelectedClassIndex(idx);
                    }}
                    className={`
                      p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                      ${isSelected
                        ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                        : 'bg-slate-900/50 border-white/10 hover:border-amber-400/40 hover:bg-slate-900/80'
                      }
                    `}
                  >
                    <PixelPortrait id={c.avatar} size={46} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate font-mono">
                          {c.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-300 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        HP {c.baseHp} · MP {c.baseMp} · ATK {c.baseAtk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </RetroWindow>

          {/* Background Perk Selector */}
          <RetroWindow title="2. TRASFONDO Y VENTAJA INICIAL" centerTitle>
            <div className="flex flex-col gap-2">
              {BACKGROUND_PERKS.map((perk, idx) => {
                const isSelected = selectedPerkIndex === idx;
                return (
                  <div
                    key={perk.id}
                    onClick={() => {
                      sound.playCursor();
                      setSelectedPerkIndex(idx);
                    }}
                    className={`
                      p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                      ${isSelected
                        ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-900/40 border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {perk.name}
                      </span>
                      <span className="text-[10px] text-slate-300 font-sans">
                        {perk.desc}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </RetroWindow>
        </div>

        {/* Right Side: Hero Preview & Start Button (Cols 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <RetroWindow title="HOJA Y MODELO DEL AVENTURERO" centerTitle className="flex flex-col justify-between h-full">
            <div className="flex flex-col items-center text-center p-4 bg-slate-900/70 rounded-xl border border-white/10 relative overflow-hidden">
              {/* Magic Rune Aura */}
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-400/30 absolute top-2 left-1/2 -translate-x-1/2 blur-xs pointer-events-none" />
              
              <PixelSprite id={selectedClass.avatar} size={96} className="my-2" />

              <h3 className="text-base font-bold text-amber-300 font-mono mt-1">
                {heroName.trim() || 'Aventurero'}
              </h3>
              <span className="text-xs text-cyan-300 font-mono">
                {selectedClass.title}
              </span>
              <p className="text-[11px] text-slate-300 font-sans mt-2 italic px-2 leading-relaxed">
                "{selectedClass.description}"
              </p>
            </div>

            {/* Combined Attributes Preview */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Vitalidad:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedClass.baseHp + (selectedPerk.bonusHp || 0)} HP
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Maná:</span>
                <span className="text-cyan-400 font-bold">
                  {selectedClass.baseMp + (selectedPerk.bonusMp || 0)} MP
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Ataque:</span>
                <span className="text-amber-300 font-bold">{selectedClass.baseAtk}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Defensa:</span>
                <span className="text-blue-300 font-bold">{selectedClass.baseDef}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Magia:</span>
                <span className="text-purple-300 font-bold">{selectedClass.baseMag}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded-lg border border-white/10">
                <span className="text-slate-400">Velocidad:</span>
                <span className="text-emerald-300 font-bold">{selectedClass.baseSpeed}</span>
              </div>
            </div>

            {/* Start Game Button */}
            <button
              onClick={handleConfirmCreation}
              className="mt-4 w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.7)] cursor-pointer transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>¡Comenzar Travesía en Solitario!</span>
              <Compass className="w-4 h-4 text-slate-950" />
            </button>
          </RetroWindow>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { Character, Skill } from '../../types/game';
import { ALL_SKILLS } from '../../data/skillsData';
import { sound } from '../../services/soundService';
import { PixelPortrait } from '../battle/PixelSprites';
import { 
  Sparkles, 
  Flame, 
  Snowflake, 
  Zap, 
  Shield, 
  Sword, 
  Heart,
  CheckCircle, 
  Lock, 
  Plus, 
  BookOpen
} from 'lucide-react';

interface SkillsScreenProps {
  party: Character[];
  onEquipSkill: (characterId: string, skillId: string, slotIndex: number) => void;
  onUnequipSkill: (characterId: string, skillId: string) => void;
  onUnlockSkill: (characterId: string, skillId: string) => void;
}

export const SkillsScreen: React.FC<SkillsScreenProps> = ({
  party,
  onEquipSkill,
  onUnequipSkill,
  onUnlockSkill,
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(party[0]?.id || '');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('fireball');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  const activeHero = party.find((p) => p.id === selectedCharacterId) || party[0];
  const inspectedSkill = ALL_SKILLS[selectedSkillId] || ALL_SKILLS['fireball'];

  const allHeroRelevantSkills = Object.values(ALL_SKILLS);

  const handleEquipToSlot = (skillId: string) => {
    sound.playConfirm();
    onEquipSkill(activeHero.id, skillId, selectedSlotIndex);
  };

  const handleUnlock = (skillId: string) => {
    sound.playLevelUp();
    onUnlockSkill(activeHero.id, skillId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      {/* Top Bar with Hero Selector (Centered) */}
      <RetroWindow title="GRIMORIO DE HABILIDADES Y RANURAS ACTIVAS" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-300 font-mono">
              PERSONALIZACIÓN DE HECHIZOS Y ARTEFACTOS
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Configura los hechizos y técnicas que se desplegarán en el menú de combate de cada aventurero.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {party.map((hero) => {
              const isSelected = hero.id === selectedCharacterId;
              return (
                <button
                  key={hero.id}
                  onClick={() => {
                    sound.playCursor();
                    setSelectedCharacterId(hero.id);
                  }}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer
                    ${isSelected
                      ? 'bg-indigo-950 border-2 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <PixelPortrait id={hero.avatar} size={28} />
                  <span>{hero.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </RetroWindow>

      {/* Main Content: Left Active Slots, Center Skills List, Right Inspector */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Active Battle Slots (Cols 4) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <RetroWindow title={`RANURAS ACTIVAS (MAX 4)`} centerTitle>
            <p className="text-[11px] text-slate-300 font-mono mb-2 text-center">
              Selecciona una ranura para asignarle la habilidad inspeccionada:
            </p>

            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const currentSkillId = activeHero.equippedSkillIds[slotIdx];
                const skill = currentSkillId ? ALL_SKILLS[currentSkillId] : null;
                const isSelectedSlot = selectedSlotIndex === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => {
                      sound.playCursor();
                      setSelectedSlotIndex(slotIdx);
                    }}
                    className={`
                      p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                      ${isSelectedSlot
                        ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-amber-300 font-mono shrink-0">
                        {slotIdx + 1}
                      </span>
                      <div className="flex flex-col min-w-0 truncate">
                        <span className="text-xs font-bold text-white truncate font-mono">
                          {skill ? skill.name : '(Ranura Vacía)'}
                        </span>
                        {skill && (
                          <span className="text-[10px] text-cyan-300 font-mono">
                            {skill.mpCost} MP · {skill.element}
                          </span>
                        )}
                      </div>
                    </div>

                    {skill && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playCancel();
                          onUnequipSkill(activeHero.id, skill.id);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 bg-red-950/40 rounded border border-red-800 cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-2 bg-slate-900/80 rounded-lg border border-amber-400/30 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Puntos de Habilidad:</span>
              <span className="text-amber-300 font-bold">{activeHero.skillPoints} SP</span>
            </div>
          </RetroWindow>
        </div>

        {/* Center: Available Skills (Cols 4) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <RetroWindow title="CATÁLOGO DEL HÉROE" centerTitle>
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {allHeroRelevantSkills.map((skill) => {
                const isLearned = activeHero.learnedSkillIds.includes(skill.id);
                const isEquipped = activeHero.equippedSkillIds.includes(skill.id);
                const isInspected = selectedSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      sound.playCursor();
                      setSelectedSkillId(skill.id);
                    }}
                    className={`
                      p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                      ${isInspected
                        ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-900/50 border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {skill.element === 'FUEGO' && <Flame className="w-4 h-4 text-red-400 shrink-0" />}
                      {skill.element === 'HIELO' && <Snowflake className="w-4 h-4 text-blue-400 shrink-0" />}
                      {skill.element === 'RAYO' && <Zap className="w-4 h-4 text-yellow-400 shrink-0" />}
                      {skill.element === 'CURACION' && <Heart className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {skill.element === 'FISICO' && <Sword className="w-4 h-4 text-amber-400 shrink-0" />}
                      {skill.element === 'LUZ' && <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />}
                      {skill.element === 'OSCURIDAD' && <Shield className="w-4 h-4 text-purple-400 shrink-0" />}

                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white font-mono">{skill.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{skill.mpCost} MP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isEquipped ? (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Equipada</span>
                      ) : isLearned ? (
                        <span className="text-[10px] text-cyan-300 font-mono">Aprendida</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> Bloqueada
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </RetroWindow>
        </div>

        {/* Right: Skill Inspector & Actions (Cols 4) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <RetroWindow title="DETALLE DE HABILIDAD" centerTitle className="flex flex-col justify-between h-full">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 text-center">
                <h3 className="text-sm font-bold text-amber-300 font-mono">
                  {inspectedSkill.name}
                </h3>
                <span className="text-xs text-cyan-300 font-mono block mt-0.5">
                  Elemento: {inspectedSkill.element} · {inspectedSkill.type}
                </span>
                <p className="text-[11px] text-slate-300 font-sans mt-2 leading-relaxed">
                  {inspectedSkill.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex justify-between">
                  <span className="text-slate-400">Coste MP:</span>
                  <span className="text-cyan-400 font-bold">{inspectedSkill.mpCost}</span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex justify-between">
                  <span className="text-slate-400">Poder:</span>
                  <span className="text-amber-400 font-bold">x{inspectedSkill.power}</span>
                </div>
                <div className="col-span-2 p-2 bg-slate-900/50 rounded-lg border border-white/5 flex justify-between">
                  <span className="text-slate-400">Objetivo:</span>
                  <span className="text-white font-bold">{inspectedSkill.target}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {activeHero.learnedSkillIds.includes(inspectedSkill.id) ? (
                <button
                  onClick={() => handleEquipToSlot(inspectedSkill.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl border border-blue-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  Asignar a Ranura #{selectedSlotIndex + 1}
                </button>
              ) : (
                <button
                  disabled={activeHero.skillPoints < 1}
                  onClick={() => handleUnlock(inspectedSkill.id)}
                  className={`
                    w-full py-2.5 rounded-xl border text-xs font-bold transition-all
                    ${activeHero.skillPoints >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black border-amber-400 cursor-pointer shadow hover:scale-105'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  Desbloquear (Cuesta 1 SP)
                </button>
              )}
            </div>
          </RetroWindow>
        </div>
      </div>
    </div>
  );
};

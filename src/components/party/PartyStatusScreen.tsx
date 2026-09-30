import React from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { Character } from '../../types/game';
import { PixelPortrait, PixelSprite } from '../battle/PixelSprites';
import { Shield, Sparkles, Sword, Heart, Droplets, Zap, UserCheck, Award } from 'lucide-react';

interface PartyStatusScreenProps {
  party: Character[];
}

export const PartyStatusScreen: React.FC<PartyStatusScreenProps> = ({ party }) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      <RetroWindow title="ESTADO GENERAL DEL GRUPO DE AVENTUREROS" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-300 font-mono">
              ESCUADRÓN DE LA VANGUARDIA
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Consulta el nivel, atributos, ranuras de equipo y modelo activo de cada héroe.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-indigo-950/90 rounded-full border border-amber-400/50 text-xs font-mono text-amber-300 font-bold shadow">
            {party.length} Miembros en Vanguardia
          </div>
        </div>
      </RetroWindow>

      {/* Grid of Characters */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {party.map((hero) => {
          const expPercent = Math.min(100, (hero.exp / hero.maxExp) * 100);

          return (
            <RetroWindow key={hero.id} className="flex flex-col gap-3.5" centerTitle title={`${hero.name.toUpperCase()} · ${hero.characterClass}`}>
              {/* Header card with Portrait & Sprite */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-3">
                <PixelPortrait id={hero.avatar} size={64} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white font-mono truncate">
                      {hero.name}
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-black px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
                      NV {hero.level}
                    </span>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono block mt-0.5">
                    {hero.title}
                  </span>

                  {/* EXP Bar */}
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span>Experiencia (EXP)</span>
                      <span className="text-amber-300 font-bold">{hero.exp} / {hero.maxExp}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 transition-all duration-300"
                        style={{ width: `${expPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Health and Mana Gauges */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">Salud (HP)</span>
                    <span className="text-white font-bold">{hero.hp} / {hero.maxHp}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-cyan-400 font-bold">Maná (MP)</span>
                    <span className="text-white font-bold">{hero.mp} / {hero.maxMp}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${Math.max(0, (hero.mp / hero.maxMp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Ataque:</span>
                  <span className="text-amber-300 font-bold">
                    {hero.baseAtk + (hero.equipment.weapon?.stats?.atk || 0)}
                  </span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Defensa:</span>
                  <span className="text-blue-300 font-bold">
                    {hero.baseDef + (hero.equipment.armor?.stats?.def || 0)}
                  </span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Magia:</span>
                  <span className="text-cyan-300 font-bold">
                    {hero.baseMag + (hero.equipment.weapon?.stats?.mag || 0)}
                  </span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Velocidad:</span>
                  <span className="text-emerald-300 font-bold">{hero.baseSpeed}</span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Crítico:</span>
                  <span className="text-yellow-400 font-bold">{hero.baseCrit}%</span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-slate-400 text-[10px]">Puntos Hab:</span>
                  <span className="text-amber-400 font-bold">{hero.skillPoints} SP</span>
                </div>
              </div>

              {/* Current Gear Overview */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
                <span className="px-2 py-1 bg-slate-900/80 rounded border border-white/10">
                  🗡️ {hero.equipment.weapon?.name || 'Sin Arma'}
                </span>
                <span className="px-2 py-1 bg-slate-900/80 rounded border border-white/10">
                  🛡️ {hero.equipment.armor?.name || 'Sin Armadura'}
                </span>
                <span className="px-2 py-1 bg-slate-900/80 rounded border border-white/10">
                  💍 {hero.equipment.accessory?.name || 'Sin Accesorio'}
                </span>
              </div>
            </RetroWindow>
          );
        })}
      </div>
    </div>
  );
};

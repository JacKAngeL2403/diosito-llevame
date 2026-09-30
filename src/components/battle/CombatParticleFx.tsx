import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SpellElement = 'FISICO' | 'FUEGO' | 'HIELO' | 'RAYO' | 'CURACION' | 'VENENO' | 'BUFF';

interface CombatParticleFxProps {
  element: SpellElement | string;
  targetId: string;
  isCrit?: boolean;
}

// Generate deterministic particles for explosive visual effects
const SPARK_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export const CombatParticleFx: React.FC<CombatParticleFxProps> = ({ element, targetId, isCrit = false }) => {
  const isHero = targetId.includes('hero');
  const posStyle = {
    top: '45%',
    left: isHero ? '72%' : '26%',
  };

  const el = element.toUpperCase();

  return (
    <div
      className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={posStyle}
    >
      {/* 1. PHYSICAL SLASH ATTACK */}
      {el === 'FISICO' && (
        <div className="relative flex items-center justify-center">
          {/* Slashing Blade Arc */}
          <motion.div
            initial={{ scaleX: 0, scaleY: 0.2, rotate: -45, opacity: 1 }}
            animate={{
              scaleX: [0, isCrit ? 2.2 : 1.6, 2.0],
              scaleY: [0.2, 1.2, 0],
              rotate: isCrit ? -55 : -35,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`w-32 h-4 ${isCrit ? 'bg-gradient-to-r from-amber-200 via-yellow-400 to-white shadow-[0_0_25px_#f59e0b]' : 'bg-gradient-to-r from-slate-200 via-white to-blue-200 shadow-[0_0_20px_#fff]'} rounded-full`}
          />

          {/* Secondary Counter Slash on Critical */}
          {isCrit && (
            <motion.div
              initial={{ scaleX: 0, scaleY: 0.2, rotate: 45, opacity: 1 }}
              animate={{
                scaleX: [0, 2.2, 2.0],
                scaleY: [0.2, 1.2, 0],
                rotate: 55,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.38, delay: 0.05, ease: 'easeOut' }}
              className="absolute w-32 h-4 bg-gradient-to-r from-amber-300 via-white to-amber-500 rounded-full shadow-[0_0_30px_#f59e0b]"
            />
          )}

          {/* Spark Particles Flying Outward */}
          {SPARK_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = 35 + (i % 3) * 20;
            const targetX = Math.cos(rad) * dist;
            const targetY = Math.sin(rad) * dist;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                animate={{
                  x: targetX,
                  y: targetY,
                  scale: [1.2, 0.4, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`absolute w-2 h-2 rounded-full ${isCrit ? 'bg-amber-300 shadow-[0_0_8px_#fbbf24]' : 'bg-white shadow-[0_0_8px_#38bdf8]'}`}
              />
            );
          })}

          {/* Impact Shockwave Ring */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: isCrit ? 2.4 : 1.8, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`absolute w-24 h-24 rounded-full border-2 ${isCrit ? 'border-amber-400 shadow-[0_0_20px_#f59e0b]' : 'border-white shadow-[0_0_15px_#fff]'}`}
          />
        </div>
      )}

      {/* 2. FIREBALL / FLAME EXPLOSION */}
      {el === 'FUEGO' && (
        <div className="relative flex items-center justify-center">
          {/* Inner Fiery Core */}
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: [0.3, 1.8, 2.2], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 blur-md shadow-[0_0_40px_#f97316]"
          />

          {/* Expanding Flame Shockwave */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: [0.2, 2.6], opacity: [1, 0] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full border-4 border-orange-500 shadow-[0_0_30px_#ef4444]"
          />

          {/* Bursting Embers */}
          {SPARK_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = 45 + (i % 4) * 22;
            const targetX = Math.cos(rad) * dist;
            const targetY = Math.sin(rad) * dist;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
                animate={{
                  x: targetX,
                  y: targetY,
                  scale: [1.5, 0.5, 0],
                  opacity: [1, 0.7, 0],
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-red-500 shadow-[0_0_10px_#f97316]"
              />
            );
          })}
        </div>
      )}

      {/* 3. BLIZZARD / ICE SHARDS */}
      {el === 'HIELO' && (
        <div className="relative flex items-center justify-center">
          {/* Frost Core */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: [0.2, 1.7, 2.0], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white blur-md shadow-[0_0_35px_#38bdf8]"
          />

          {/* Ice Shockwave */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: [0.2, 2.4], opacity: [1, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-24 h-24 rounded-full border-2 border-cyan-300 shadow-[0_0_25px_#06b6d4]"
          />

          {/* Diamond Ice Shards Shooting Out */}
          {SPARK_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = 40 + (i % 3) * 25;
            const targetX = Math.cos(rad) * dist;
            const targetY = Math.sin(rad) * dist;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1.4, rotate: 45, opacity: 1 }}
                animate={{
                  x: targetX,
                  y: targetY,
                  scale: [1.4, 0.8, 0],
                  rotate: 225,
                  opacity: [1, 0.8, 0],
                }}
                transition={{ duration: 0.48, ease: 'easeOut' }}
                className="absolute w-3 h-3 bg-gradient-to-br from-cyan-100 to-blue-400 shadow-[0_0_8px_#38bdf8]"
              />
            );
          })}
        </div>
      )}

      {/* 4. LIGHTNING / THUNDER */}
      {el === 'RAYO' && (
        <div className="relative flex items-center justify-center">
          {/* Vertical Lightning Bolt Flash */}
          <motion.div
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: [0, 1.4, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-4 h-56 bg-gradient-to-b from-yellow-100 via-amber-300 to-white shadow-[0_0_35px_#fde047]"
          />

          {/* Electric Shock Ring */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: [0.1, 2.2], opacity: [1, 0] }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full border-2 border-yellow-300 shadow-[0_0_25px_#eab308]"
          />

          {/* Electrical Sparks */}
          {SPARK_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = 45 + (i % 3) * 20;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
                animate={{
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  scale: [1.5, 0.4, 0],
                  opacity: [1, 0.9, 0],
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_12px_#fde047]"
              />
            );
          })}
        </div>
      )}

      {/* 5. HOLY HEAL / DIVINE LIGHT */}
      {(el === 'CURACION' || el === 'SANCTUARY') && (
        <div className="relative flex items-center justify-center">
          {/* Radiant Pillar */}
          <motion.div
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: [0, 1.3, 1], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="w-16 h-64 bg-gradient-to-t from-emerald-500/80 via-teal-300/80 to-white blur-sm shadow-[0_0_40px_#10b981]"
          />

          {/* Ascending Holy Sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: (i - 6) * 12, y: 30, scale: 0.8, opacity: 0 }}
              animate={{
                y: -65 - (i % 4) * 15,
                scale: [0.8, 1.4, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: 'easeOut' }}
              className="absolute text-emerald-300 text-sm font-bold drop-shadow-[0_0_8px_#34d399]"
            >
              ✦
            </motion.div>
          ))}

          {/* Soft Expanding Aura */}
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: [0.3, 2.0], opacity: [1, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full border border-emerald-400 shadow-[0_0_25px_#10b981]"
          />
        </div>
      )}

      {/* 6. SHIELD / BUFF */}
      {el === 'BUFF' && (
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: [0.4, 1.2, 1.1],
              opacity: [0, 0.9, 0],
            }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="w-32 h-32 rounded-full border-4 border-indigo-400 bg-indigo-500/20 shadow-[0_0_30px_#6366f1]"
          />
        </div>
      )}
    </div>
  );
};

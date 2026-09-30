import React from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { PixelSprite, PixelPortrait } from '../battle/PixelSprites';
import { DungeonFloor, DungeonRoom, Character, Item } from '../../types/game';
import { DUNGEON_FLOORS } from '../../data/dungeonsData';
import { ALL_ITEMS } from '../../data/itemsData';
import { sound } from '../../services/soundService';
import { 
  Compass, 
  MapPin, 
  Flame, 
  Sparkles, 
  Package, 
  Swords, 
  Bed, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Users,
  Scroll,
  CheckCircle2,
  Lock,
  DoorOpen
} from 'lucide-react';

interface ExplorationScreenProps {
  currentFloor: DungeonFloor;
  currentRoomId: string;
  clearedRoomIds: string[];
  party: Character[];
  onSelectFloor: (floor: DungeonFloor) => void;
  onMoveToRoom: (room: DungeonRoom) => void;
  onTriggerRoomCombat: (room: DungeonRoom) => void;
  onOpenChest: (room: DungeonRoom, item: Item, gold: number) => void;
  onUseShrine: (room: DungeonRoom) => void;
  onRescueCompanion: (room: DungeonRoom) => void;
}

export const ExplorationScreen: React.FC<ExplorationScreenProps> = ({
  currentFloor,
  currentRoomId,
  clearedRoomIds,
  party,
  onSelectFloor,
  onMoveToRoom,
  onTriggerRoomCombat,
  onOpenChest,
  onUseShrine,
  onRescueCompanion,
}) => {
  const currentRoom = currentFloor.rooms.find((r) => r.id === currentRoomId) || currentFloor.rooms[0];
  const isRoomCleared = clearedRoomIds.includes(currentRoom.id);

  // Group rooms by x coordinate (columns) for layout
  const maxCol = Math.max(...currentFloor.rooms.map((r) => r.x), 0);
  const columns: DungeonRoom[][] = [];
  for (let c = 0; c <= maxCol; c++) {
    columns[c] = currentFloor.rooms.filter((r) => r.x === c).sort((a, b) => a.y - b.y);
  }

  const getRoomIcon = (room: DungeonRoom) => {
    switch (room.type) {
      case 'ENTRANCE':
        return <DoorOpen className="w-4 h-4 text-slate-300" />;
      case 'COMBAT':
        return <Swords className="w-4 h-4 text-red-400" />;
      case 'CHEST':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'SHRINE':
        return <Sparkles className="w-4 h-4 text-cyan-300" />;
      case 'RESCUE_COMPANION':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'LORE':
        return <Scroll className="w-4 h-4 text-purple-300" />;
      case 'BOSS':
        return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-300" />;
    }
  };

  const leaderHero = party[0] || null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      {/* Top Floor Summary & Region Selector (Centered) */}
      <RetroWindow title="MAPA Y EXPLORACIÓN VISUAL DE MAZMORRA" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-base sm:text-lg font-bold text-amber-300 font-['Cinzel'] tracking-wide">
                {currentFloor.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 text-[10px] font-mono text-cyan-300 border border-blue-500/50 shadow">
                NV Requerido {currentFloor.levelRequirement}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-2xl leading-relaxed">
              {currentFloor.description}
            </p>
          </div>

          {/* Dungeon Floor Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {DUNGEON_FLOORS.map((fl) => {
              const isSelected = fl.id === currentFloor.id;
              const isLocked = (leaderHero?.level || 1) < fl.levelRequirement;
              return (
                <button
                  key={fl.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      sound.playConfirm();
                      onSelectFloor(fl);
                    }
                  }}
                  className={`
                    px-3 py-1.5 text-xs font-bold font-mono rounded-xl border transition-all whitespace-nowrap cursor-pointer
                    ${isSelected
                      ? 'bg-indigo-950 border-2 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                      : isLocked
                        ? 'opacity-40 bg-slate-900 text-slate-500 border-slate-700 cursor-not-allowed'
                        : 'bg-slate-900/60 text-slate-300 hover:text-white border-white/10'
                    }
                  `}
                >
                  {fl.name.split(' ')[0]} {fl.name.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>
        </div>
      </RetroWindow>

      {/* Visual Dungeon Grid Layout (Slotted nodes connecting rooms) */}
      <RetroWindow title="PLANTA ARQUITECTÓNICA DE LA CRIPTA" centerTitle className="w-full">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between pb-2 border-b border-white/10">
            <span>Haz clic en una sala conectada para avanzar con tu héroe:</span>
            <span className="text-amber-300 font-bold">
              Salas Despejadas: {clearedRoomIds.filter((id) => currentFloor.rooms.some((r) => r.id === id)).length} / {currentFloor.rooms.length}
            </span>
          </div>

          {/* Visual Node Diagram Grid */}
          <div className="w-full overflow-x-auto py-4 px-3 flex items-center justify-center gap-4 sm:gap-8 min-h-[150px] bg-slate-950/70 rounded-xl border border-white/10 shadow-inner">
            {columns.map((colRooms, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-3 items-center justify-center shrink-0">
                {colRooms.map((room) => {
                  const isCurrent = room.id === currentRoom.id;
                  const isCleared = clearedRoomIds.includes(room.id);
                  const isConnectedToCurrent = currentRoom.connectedTo.includes(room.id);
                  const canMove = isConnectedToCurrent || isCurrent;

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (canMove && !isCurrent) {
                          sound.playCursor();
                          onMoveToRoom(room);
                        }
                      }}
                      className={`
                        relative w-40 sm:w-48 p-3 rounded-xl border-2 flex flex-col justify-between transition-all select-none
                        ${isCurrent
                          ? 'bg-gradient-to-b from-indigo-950/95 to-slate-950/95 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105 z-20'
                          : isConnectedToCurrent
                            ? 'bg-slate-900/90 border-cyan-400/80 hover:border-amber-400 hover:scale-[1.03] cursor-pointer z-10 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                            : 'bg-slate-950/60 border-slate-800 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      {/* Active Hero Avatar Badge in Current Room */}
                      {isCurrent && leaderHero && (
                        <div className="absolute -top-3.5 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black shadow-lg animate-bounce">
                          <span>AQUÍ</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2 truncate">
                          {getRoomIcon(room)}
                          <span className="text-xs font-bold text-white truncate font-mono">
                            {room.title.split(':')[0]}
                          </span>
                        </div>
                        {isCleared && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>

                      <span className="text-[10px] text-slate-400 line-clamp-1 font-sans mt-0.5">
                        {room.type === 'COMBAT' && 'Monstruos Acechando'}
                        {room.type === 'CHEST' && 'Cofre del Tesoro'}
                        {room.type === 'SHRINE' && 'Santuario Sagrado'}
                        {room.type === 'RESCUE_COMPANION' && '¡Aliado en Peligro!'}
                        {room.type === 'LORE' && 'Historia y Grabados'}
                        {room.type === 'BOSS' && 'Cámara del Jefe'}
                        {room.type === 'ENTRANCE' && 'Punto de Partida'}
                      </span>

                      {/* Connection pill */}
                      {isConnectedToCurrent && !isCurrent && (
                        <span className="mt-2 text-center text-[10px] font-mono text-cyan-300 bg-cyan-950/80 py-1 rounded-lg border border-cyan-500/40">
                          ▶ Avanzar a esta Sala
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </RetroWindow>

      {/* Active Room Interactive Event Window */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Room Lore & Action Button (Cols 7) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <RetroWindow title={`SALA ACTUAL: ${currentRoom.title.toUpperCase()}`} centerTitle>
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-900/70 rounded-xl border border-white/10">
                <div className="p-3 bg-slate-950 rounded-xl border border-white/20 shrink-0 shadow">
                  {getRoomIcon(currentRoom)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300 font-mono">
                    {currentRoom.title}
                  </h3>
                  <p className="text-xs text-slate-200 font-sans mt-1 leading-relaxed">
                    {currentRoom.description}
                  </p>
                  {currentRoom.loreText && (
                    <div className="mt-2 p-2 bg-purple-950/50 border-l-2 border-purple-400 rounded text-xs text-purple-200 italic font-mono">
                      {currentRoom.loreText}
                    </div>
                  )}
                </div>
              </div>

              {/* Contextual Room Action */}
              <div className="pt-2">
                {currentRoom.type === 'COMBAT' && !isRoomCleared && (
                  <button
                    onClick={() => {
                      sound.playConfirm();
                      onTriggerRoomCombat(currentRoom);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl border border-red-400 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Swords className="w-4 h-4 text-amber-300" />
                    <span>¡Entablar Combate Contra los Enemigos!</span>
                  </button>
                )}

                {currentRoom.type === 'CHEST' && !isRoomCleared && (
                  <button
                    onClick={() => {
                      const item = currentRoom.lootItemId ? ALL_ITEMS[currentRoom.lootItemId] : ALL_ITEMS['ruby_gem'];
                      sound.playCoin();
                      onOpenChest(currentRoom, item, currentRoom.lootGold || 80);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl border border-yellow-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Package className="w-4 h-4 text-slate-950" />
                    <span>Abrir Cofre Antiguo y Recoger Botín</span>
                  </button>
                )}

                {currentRoom.type === 'SHRINE' && (
                  <button
                    onClick={() => {
                      sound.playHealSpell();
                      onUseShrine(currentRoom);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-400 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Rezar en el Altar (Restaura todo el HP y MP)</span>
                  </button>
                )}

                {currentRoom.type === 'RESCUE_COMPANION' && !isRoomCleared && (
                  <button
                    onClick={() => {
                      sound.playConfirm();
                      onRescueCompanion(currentRoom);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-700 hover:from-emerald-600 hover:to-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Users className="w-4 h-4 text-amber-300" />
                    <span>¡Rescatar al Compañero y Reclutarlo al Grupo!</span>
                  </button>
                )}

                {currentRoom.type === 'BOSS' && !isRoomCleared && (
                  <button
                    onClick={() => {
                      sound.playCriticalHit();
                      onTriggerRoomCombat(currentRoom);
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-red-800 via-rose-700 to-amber-600 hover:from-red-700 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl border-2 border-amber-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <ShieldAlert className="w-5 h-5 text-amber-200" />
                    <span>¡DESAFIAR AL JEFE EN SU CÁMARA SUPREMA!</span>
                  </button>
                )}

                {isRoomCleared && (
                  <div className="flex items-center justify-center gap-2 p-2.5 bg-emerald-950/70 rounded-xl border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Esta sala ya ha sido explorada y asegurada con éxito.</span>
                  </div>
                )}
              </div>
            </div>
          </RetroWindow>
        </div>

        {/* Right: Party Member Resumes & Rescue Roster (Cols 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <RetroWindow title={`MIEMBROS DE LA VANGUARDIA (${party.length})`} centerTitle>
            <div className="flex flex-col gap-2 pt-1">
              {party.map((hero) => (
                <div
                  key={hero.id}
                  className="flex items-center justify-between p-2.5 bg-slate-900/70 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <PixelPortrait id={hero.avatar} size={40} />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {hero.name} {hero.isLeader && '👑'}
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        NV {hero.level} · {hero.characterClass}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-mono">
                    <span className="text-emerald-400 block font-bold">
                      {hero.hp}/{hero.maxHp} HP
                    </span>
                    <span className="text-cyan-400 block font-bold">
                      {hero.mp}/{hero.maxMp} MP
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-[10px] text-slate-300 font-sans leading-relaxed">
              Explora las salas de rescate con el icono de grupo <Users className="w-3 h-3 inline text-emerald-400 mx-0.5" /> para liberar aliados y sumarlos a tu escuadrón.
            </div>
          </RetroWindow>
        </div>
      </div>
    </div>
  );
};

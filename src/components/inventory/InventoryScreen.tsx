import React, { useState } from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { PixelPortrait } from '../battle/PixelSprites';
import { Character, Item, ItemType } from '../../types/game';
import { sound } from '../../services/soundService';
import { 
  Shield, 
  Sword, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Trash2, 
  Gem,
  Coins,
  CheckCircle2,
  X
} from 'lucide-react';

interface InventoryScreenProps {
  party: Character[];
  inventory: Item[];
  onEquipItem: (characterId: string, item: Item, slot: 'weapon' | 'armor' | 'accessory') => void;
  onUnequipItem: (characterId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  onUseItem: (item: Item, targetCharacterId: string) => void;
  onLearnGrimoire: (characterId: string, item: Item) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  party,
  inventory,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  onLearnGrimoire,
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(party[0]?.id || '');
  const [filterType, setFilterType] = useState<ItemType | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<Item | null>(inventory[0] || null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const activeHero = party.find((p) => p.id === selectedCharacterId) || party[0];

  const filteredItems = inventory.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const getRarityBadge = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'LEGENDARY':
        return <span className="text-[10px] text-yellow-400 font-bold font-mono">★ LEGENDARIO</span>;
      case 'EPIC':
        return <span className="text-[10px] text-purple-400 font-bold font-mono">◆ ÉPICO</span>;
      case 'RARE':
        return <span className="text-[10px] text-cyan-400 font-bold font-mono">▲ RARO</span>;
      default:
        return <span className="text-[10px] text-slate-400 font-mono">COMÚN</span>;
    }
  };

  const handleEquip = (item: Item) => {
    sound.playConfirm();
    if (item.type === 'WEAPON') {
      onEquipItem(activeHero.id, item, 'weapon');
      setFeedbackMsg(`Equipado ${item.name} en ${activeHero.name}.`);
    } else if (item.type === 'ARMOR') {
      onEquipItem(activeHero.id, item, 'armor');
      setFeedbackMsg(`Equipada ${item.name} en ${activeHero.name}.`);
    } else if (item.type === 'ACCESSORY') {
      onEquipItem(activeHero.id, item, 'accessory');
      setFeedbackMsg(`Equipado ${item.name} en ${activeHero.name}.`);
    }
  };

  const handleUseConsumable = (item: Item) => {
    sound.playHealSpell();
    onUseItem(item, activeHero.id);
    setFeedbackMsg(`Usaste ${item.name} en ${activeHero.name}.`);
  };

  const handleReadGrimoire = (item: Item) => {
    sound.playLevelUp();
    onLearnGrimoire(activeHero.id, item);
    setFeedbackMsg(`¡${activeHero.name} ha leído ${item.name} y aprendido un nuevo hechizo!`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      {/* Header and Hero Selector (Centered) */}
      <RetroWindow title="INVENTARIO Y ARMERÍA DEL GRUPO" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-300 font-mono">
              GESTIÓN DE EQUIPO Y PROVISIONES
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Equipa armas forjadas, armaduras arcanas y reliquias en tus héroes.
            </p>
          </div>

          {/* Hero Tabs with Mini Portraits */}
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
                  <span>{hero.name} (NV {hero.level})</span>
                </button>
              );
            })}
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </RetroWindow>

      {/* Main Split: Left Equipment & Hero Stats, Right Inventory Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Active Hero Equipment & Stats (Cols 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <RetroWindow title={`EQUIPO: ${activeHero.name.toUpperCase()}`} centerTitle>
            <div className="flex items-center gap-3 p-2 bg-slate-900/80 rounded-xl border border-white/10 mb-3">
              <PixelPortrait id={activeHero.avatar} size={52} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white font-mono">{activeHero.name}</span>
                <span className="text-xs text-amber-300 font-mono">{activeHero.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">NV {activeHero.level} · {activeHero.characterClass}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {/* Weapon Slot */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Sword className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Arma Principal</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {activeHero.equipment.weapon?.name || '(Vacío)'}
                    </span>
                  </div>
                </div>
                {activeHero.equipment.weapon && (
                  <button
                    onClick={() => {
                      sound.playCancel();
                      onUnequipItem(activeHero.id, 'weapon');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 rounded-lg border border-red-800 cursor-pointer"
                  >
                    Desequipar
                  </button>
                )}
              </div>

              {/* Armor Slot */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Armadura</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {activeHero.equipment.armor?.name || '(Vacío)'}
                    </span>
                  </div>
                </div>
                {activeHero.equipment.armor && (
                  <button
                    onClick={() => {
                      sound.playCancel();
                      onUnequipItem(activeHero.id, 'armor');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 rounded-lg border border-red-800 cursor-pointer"
                  >
                    Desequipar
                  </button>
                )}
              </div>

              {/* Accessory Slot */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Accesorio</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {activeHero.equipment.accessory?.name || '(Vacío)'}
                    </span>
                  </div>
                </div>
                {activeHero.equipment.accessory && (
                  <button
                    onClick={() => {
                      sound.playCancel();
                      onUnequipItem(activeHero.id, 'accessory');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 rounded-lg border border-red-800 cursor-pointer"
                  >
                    Desequipar
                  </button>
                )}
              </div>
            </div>

            {/* Total Hero Stats Breakdown */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-amber-300 font-mono block mb-2 text-center">
                ✦ ATRIBUTOS COMBINADOS CON EQUIPO ✦
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Ataque (ATK):</span>
                  <span className="text-amber-300 font-bold">
                    {activeHero.baseAtk + (activeHero.equipment.weapon?.stats?.atk || 0) + (activeHero.equipment.accessory?.stats?.atk || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Defensa (DEF):</span>
                  <span className="text-blue-300 font-bold">
                    {activeHero.baseDef + (activeHero.equipment.armor?.stats?.def || 0) + (activeHero.equipment.accessory?.stats?.def || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Magia (MAG):</span>
                  <span className="text-cyan-300 font-bold">
                    {activeHero.baseMag + (activeHero.equipment.weapon?.stats?.mag || 0) + (activeHero.equipment.armor?.stats?.mag || 0) + (activeHero.equipment.accessory?.stats?.mag || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Velocidad (VEL):</span>
                  <span className="text-emerald-300 font-bold">
                    {activeHero.baseSpeed + (activeHero.equipment.armor?.stats?.speed || 0) + (activeHero.equipment.accessory?.stats?.speed || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Salud Máxima:</span>
                  <span className="text-emerald-400 font-bold">{activeHero.maxHp} HP</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-400">Maná Máximo:</span>
                  <span className="text-cyan-400 font-bold">{activeHero.maxMp} MP</span>
                </div>
              </div>
            </div>
          </RetroWindow>
        </div>

        {/* Right: Backpack Grid & Item Inspector (Cols 7) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <RetroWindow title={`MOCHILA DEL GRUPO (${inventory.length} OBJETOS)`} centerTitle>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
              {(['ALL', 'WEAPON', 'ARMOR', 'ACCESSORY', 'CONSUMABLE', 'GRIMOIRE', 'TREASURE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sound.playCursor();
                    setFilterType(t);
                  }}
                  className={`
                    px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-colors whitespace-nowrap cursor-pointer
                    ${filterType === t
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                    }
                  `}
                >
                  {t === 'ALL' && 'Todos'}
                  {t === 'WEAPON' && 'Armas'}
                  {t === 'ARMOR' && 'Armaduras'}
                  {t === 'ACCESSORY' && 'Accesorios'}
                  {t === 'CONSUMABLE' && 'Pociones'}
                  {t === 'GRIMOIRE' && 'Grimorios'}
                  {t === 'TREASURE' && 'Tesoros'}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pt-2 pr-1 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-xs text-slate-400 font-mono">
                  No hay objetos en esta categoría.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        sound.playCursor();
                        setSelectedItem(item);
                      }}
                      className={`
                        p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between
                        ${isSelected
                          ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-[1.02]'
                          : 'bg-slate-900/50 border-white/10 hover:border-amber-400/40'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[130px] font-mono">
                          {item.name}
                        </span>
                        {getRarityBadge(item.rarity)}
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-sans">
                        {item.description}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Item Inspector Panel */}
            {selectedItem && (
              <div className="mt-3 p-3.5 bg-slate-900/90 rounded-xl border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {selectedItem.name}
                    </span>
                    {getRarityBadge(selectedItem.rarity)}
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                    {selectedItem.description}
                  </p>
                  {/* Stat bonuses preview */}
                  {selectedItem.stats && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-cyan-300 mt-1">
                      {selectedItem.stats.atk && <span>+{selectedItem.stats.atk} ATK</span>}
                      {selectedItem.stats.def && <span>+{selectedItem.stats.def} DEF</span>}
                      {selectedItem.stats.mag && <span>+{selectedItem.stats.mag} MAG</span>}
                      {selectedItem.stats.speed && <span>+{selectedItem.stats.speed} VEL</span>}
                      {selectedItem.stats.crit && <span>+{selectedItem.stats.crit}% CRIT</span>}
                      {selectedItem.stats.maxHp && <span>+{selectedItem.stats.maxHp} HP</span>}
                      {selectedItem.stats.maxMp && <span>+{selectedItem.stats.maxMp} MP</span>}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {(selectedItem.type === 'WEAPON' || selectedItem.type === 'ARMOR' || selectedItem.type === 'ACCESSORY') && (
                    <button
                      onClick={() => handleEquip(selectedItem)}
                      className="py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg border border-blue-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      Equipar en {activeHero.name}
                    </button>
                  )}

                  {selectedItem.type === 'CONSUMABLE' && (
                    <button
                      onClick={() => handleUseConsumable(selectedItem)}
                      className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg border border-emerald-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      Usar Objeto
                    </button>
                  )}

                  {selectedItem.type === 'GRIMOIRE' && (
                    <button
                      onClick={() => handleReadGrimoire(selectedItem)}
                      className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg border border-purple-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      Leer y Aprender Hechizo
                    </button>
                  )}
                </div>
              </div>
            )}
          </RetroWindow>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { TopNavigation, GameTab } from './components/common/TopNavigation';
import { BattleScreen } from './components/battle/BattleScreen';
import { ExplorationScreen } from './components/exploration/ExplorationScreen';
import { InventoryScreen } from './components/inventory/InventoryScreen';
import { SkillsScreen } from './components/skills/SkillsScreen';
import { ShopScreen } from './components/shop/ShopScreen';
import { PartyStatusScreen } from './components/party/PartyStatusScreen';
import { CharacterCreationScreen } from './components/creation/CharacterCreationScreen';
import { RetroWindow } from './components/common/RetroWindow';
import { PixelPortrait } from './components/battle/PixelSprites';

import { Character, Enemy, Item, DungeonFloor, DungeonRoom } from './types/game';
import { INITIAL_CHARACTERS } from './data/charactersData';
import { ALL_ITEMS } from './data/itemsData';
import { ALL_ENEMIES } from './data/enemiesData';
import { DUNGEON_FLOORS } from './data/dungeonsData';
import { sound } from './services/soundService';
import { Swords, RotateCcw, Download, Sparkles, Trophy, Users, CheckCircle2 } from 'lucide-react';

// Background image imports from generated assets
import dungeonBg from './assets/images/dungeon_battle_arena_1790782916628.jpg';
import forestBg from './assets/images/mystic_forest_battle_1790782926379.jpg';
import dragonBg from './assets/images/dragon_sanctum_arena_1790782936602.jpg';

const STORAGE_KEY = 'PIXEL_QUEST_SOLO_HERO_V2';

export default function App() {
  // Persistence state
  const [hasCreatedCharacter, setHasCreatedCharacter] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hasCreatedCharacter) return true;
      }
    } catch {}
    return false;
  });

  const [isCreatingHero, setIsCreatingHero] = useState<boolean>(() => !hasCreatedCharacter);

  const [party, setParty] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.party && parsed.party.length > 0) return parsed.party;
      }
    } catch {}
    // Default solo hero if none saved
    return [];
  });

  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.gold === 'number') return parsed.gold;
      }
    } catch {}
    return 200;
  });

  const [inventory, setInventory] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.inventory) return parsed.inventory;
      }
    } catch {}
    return [
      ALL_ITEMS['health_potion'],
      ALL_ITEMS['health_potion'],
      ALL_ITEMS['greater_health_potion'],
      ALL_ITEMS['mana_ether'],
      ALL_ITEMS['pure_ether'],
      ALL_ITEMS['fire_bomb'],
    ];
  });

  // Exploration persistent state (does NOT reset on tab switch or battle end)
  const [currentFloorId, setCurrentFloorId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentFloorId) return parsed.currentFloorId;
      }
    } catch {}
    return 'floor_crypt';
  });

  const [currentRoomId, setCurrentRoomId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentRoomId) return parsed.currentRoomId;
      }
    } catch {}
    return 'crypt_entrance';
  });

  const [clearedRoomIds, setClearedRoomIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clearedRoomIds) return parsed.clearedRoomIds;
      }
    } catch {}
    return ['crypt_entrance'];
  });

  const [currentTab, setCurrentTab] = useState<GameTab>('EXPLORACION');

  // Active combat state
  const [activeEnemies, setActiveEnemies] = useState<Enemy[] | null>(null);
  const [activeCombatRoom, setActiveCombatRoom] = useState<DungeonRoom | null>(null);

  // Companion rescue dialogue modal
  const [rescuedCompanionDialogue, setRescuedCompanionDialogue] = useState<{
    name: string;
    avatar: string;
    classTitle: string;
    dialogue: string;
  } | null>(null);

  const currentFloor = DUNGEON_FLOORS.find((f) => f.id === currentFloorId) || DUNGEON_FLOORS[0];

  // Autosave to localStorage on changes
  useEffect(() => {
    try {
      if (hasCreatedCharacter && party.length > 0) {
        const state = {
          hasCreatedCharacter,
          party,
          gold,
          inventory,
          currentFloorId,
          currentRoomId,
          clearedRoomIds,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {}
  }, [hasCreatedCharacter, party, gold, inventory, currentFloorId, currentRoomId, clearedRoomIds]);

  const getBackgroundForFloor = (floor: DungeonFloor) => {
    if (floor.backgroundKey === 'forest') return forestBg;
    if (floor.backgroundKey === 'dragon') return dragonBg;
    return dungeonBg;
  };

  // === CHARACTER CREATION CALLBACK ===
  const handleCharacterCreated = (hero: Character, bonusGold: number) => {
    sound.playVictory();
    const startingInventory: Item[] = [
      ALL_ITEMS['health_potion'],
      ALL_ITEMS['health_potion'],
      ALL_ITEMS['greater_health_potion'],
      ALL_ITEMS['mana_ether'],
      ALL_ITEMS['fire_bomb'],
    ];

    if (hero.equipment.weapon) startingInventory.push(hero.equipment.weapon);
    if (hero.equipment.armor) startingInventory.push(hero.equipment.armor);
    if (hero.equipment.accessory) startingInventory.push(hero.equipment.accessory);

    setParty([hero]); // START SOLO ADVENTURER!
    setGold(160 + bonusGold);
    setInventory(startingInventory);
    setCurrentFloorId('floor_crypt');
    setCurrentRoomId('crypt_entrance');
    setClearedRoomIds(['crypt_entrance']);
    setHasCreatedCharacter(true);
    setIsCreatingHero(false);
    setActiveEnemies(null);
    setActiveCombatRoom(null);
    setCurrentTab('EXPLORACION');
  };

  // === ROOM EXPLORATION ACTIONS ===
  const handleMoveToRoom = (room: DungeonRoom) => {
    setCurrentRoomId(room.id);
  };

  const handleTriggerRoomCombat = (room: DungeonRoom) => {
    sound.playConfirm();
    setActiveCombatRoom(room);

    const enemyList = room.enemyIds && room.enemyIds.length > 0 
      ? room.enemyIds 
      : ['bat', 'slime', 'goblin', 'skeleton_knight'];

    const isBoss = room.type === 'BOSS';

    if (isBoss) {
      const bossTemplate = ALL_ENEMIES[currentFloor.bossId] || ALL_ENEMIES['skeleton_knight'];
      const boss: Enemy = JSON.parse(JSON.stringify(bossTemplate));
      setActiveEnemies([boss]);
    } else {
      const count = enemyList.length > 1 ? (Math.random() < 0.65 ? 2 : 1) : 1;
      const spawned: Enemy[] = [];
      for (let i = 0; i < count; i++) {
        const enemyId = enemyList[Math.floor(Math.random() * enemyList.length)];
        const template = ALL_ENEMIES[enemyId] || ALL_ENEMIES['bat'];
        const copy: Enemy = JSON.parse(JSON.stringify(template));
        copy.id = `${copy.id}_${i}_${Date.now()}`;
        spawned.push(copy);
      }
      setActiveEnemies(spawned);
    }

    setCurrentTab('COMBATE');
  };

  // Battle victory callback
  const handleBattleEnd = (victory: boolean, loot: Item[], expWon: number, goldWon: number) => {
    if (victory) {
      setGold((prev) => prev + goldWon);
      setInventory((prev) => [...prev, ...loot]);
      if (activeCombatRoom) {
        setClearedRoomIds((prev) => Array.from(new Set([...prev, activeCombatRoom.id])));
      }
    }
    setActiveCombatRoom(null);
    setActiveEnemies(null);
    setCurrentTab('EXPLORACION');
  };

  const handleFlee = () => {
    setActiveCombatRoom(null);
    setActiveEnemies(null);
    setCurrentTab('EXPLORACION');
  };

  // Chest opening
  const handleOpenChest = (room: DungeonRoom, item: Item, bonusGold: number) => {
    setGold((prev) => prev + bonusGold);
    setInventory((prev) => [...prev, item]);
    setClearedRoomIds((prev) => Array.from(new Set([...prev, room.id])));
  };

  // Shrine full restore
  const handleUseShrine = (room: DungeonRoom) => {
    setParty((prev) =>
      prev.map((p) => ({
        ...p,
        hp: p.maxHp,
        mp: p.maxMp,
      }))
    );
    setClearedRoomIds((prev) => Array.from(new Set([...prev, room.id])));
  };

  // Companion rescue: Unlock companion into party!
  const handleRescueCompanion = (room: DungeonRoom) => {
    if (!room.companionReward) return;
    const { id: companionId, name, avatar, dialogue } = room.companionReward;

    const companionTemplate = INITIAL_CHARACTERS.find((c) => c.id === companionId);
    if (companionTemplate && !party.some((p) => p.id === companionTemplate.id)) {
      setParty((prev) => [...prev, { ...companionTemplate, isLeader: false }]);
      sound.playVictory();
      setRescuedCompanionDialogue({
        name,
        avatar,
        classTitle: companionTemplate.title,
        dialogue,
      });
    }

    setClearedRoomIds((prev) => Array.from(new Set([...prev, room.id])));
  };

  // Switch Dungeon floor
  const handleSelectFloor = (floor: DungeonFloor) => {
    setCurrentFloorId(floor.id);
    if (floor.rooms.length > 0) {
      setCurrentRoomId(floor.rooms[0].id);
      setClearedRoomIds((prev) => Array.from(new Set([...prev, floor.rooms[0].id])));
    }
  };

  // Consume item from battle or inventory
  const handleConsumeItem = (item: Item) => {
    setInventory((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((i) => i.id === item.id);
      if (idx >= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  // Inventory actions
  const handleEquipItem = (characterId: string, item: Item, slot: 'weapon' | 'armor' | 'accessory') => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          const oldEquipped = c.equipment[slot];
          setInventory((inv) => {
            const nextInv = [...inv];
            const itemIndex = nextInv.findIndex((i) => i.id === item.id);
            if (itemIndex >= 0) nextInv.splice(itemIndex, 1);
            if (oldEquipped) nextInv.push(oldEquipped);
            return nextInv;
          });
          return {
            ...c,
            equipment: {
              ...c.equipment,
              [slot]: item,
            },
          };
        }
        return c;
      })
    );
  };

  const handleUnequipItem = (characterId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId && c.equipment[slot]) {
          const unequipped = c.equipment[slot]!;
          setInventory((inv) => [...inv, unequipped]);
          return {
            ...c,
            equipment: {
              ...c.equipment,
              [slot]: undefined,
            },
          };
        }
        return c;
      })
    );
  };

  const handleUseItem = (item: Item, targetCharacterId: string) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === targetCharacterId) {
          let nextHp = c.hp;
          let nextMp = c.mp;
          if (item.effect?.healHp) nextHp = Math.min(c.maxHp, c.hp + item.effect.healHp);
          if (item.effect?.healMp) nextMp = Math.min(c.maxMp, c.mp + item.effect.healMp);
          return { ...c, hp: nextHp, mp: nextMp };
        }
        return c;
      })
    );
    handleConsumeItem(item);
  };

  const handleLearnGrimoire = (characterId: string, item: Item) => {
    if (!item.teachesSkillId) return;
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId && !c.learnedSkillIds.includes(item.teachesSkillId!)) {
          return {
            ...c,
            learnedSkillIds: [...c.learnedSkillIds, item.teachesSkillId!],
          };
        }
        return c;
      })
    );
    handleConsumeItem(item);
  };

  // Skill slot customization
  const handleEquipSkill = (characterId: string, skillId: string, slotIndex: number) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          const currentSlots = [...c.equippedSkillIds];
          currentSlots[slotIndex] = skillId;
          return { ...c, equippedSkillIds: currentSlots };
        }
        return c;
      })
    );
  };

  const handleUnequipSkill = (characterId: string, skillId: string) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          return {
            ...c,
            equippedSkillIds: c.equippedSkillIds.filter((s) => s !== skillId),
          };
        }
        return c;
      })
    );
  };

  const handleUnlockSkill = (characterId: string, skillId: string) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id === characterId && c.skillPoints >= 1) {
          return {
            ...c,
            skillPoints: c.skillPoints - 1,
            learnedSkillIds: [...c.learnedSkillIds, skillId],
          };
        }
        return c;
      })
    );
  };

  // Shop actions
  const handleBuyItem = (item: Item) => {
    if (gold < item.price) return false;
    setGold((prev) => prev - item.price);
    setInventory((prev) => [...prev, item]);
    return true;
  };

  const handleSellItem = (item: Item) => {
    setGold((prev) => prev + item.sellPrice);
    handleConsumeItem(item);
  };

  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCreatedCharacter(false);
    setIsCreatingHero(true);
    setParty([]);
    setActiveEnemies(null);
    setActiveCombatRoom(null);
    sound.playConfirm();
  };

  // If player hasn't created a hero yet or clicked to create a new character, show creation screen
  if (!hasCreatedCharacter || isCreatingHero || party.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-950/95 border-b border-indigo-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow">
              PIXEL QUEST
            </span>
            <span className="text-xs text-indigo-300/70 font-sans">
              Echoes of Fate · Creación de Aventurero
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
          <CharacterCreationScreen onCharacterCreated={handleCharacterCreated} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation conforming to the Top Bar Contract */}
      <TopNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        gold={gold}
        inBattle={activeEnemies !== null}
        onNewCharacter={() => setIsCreatingHero(true)}
      />

      {/* Main Tab View Port */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4">
        {currentTab === 'COMBATE' && (
          activeEnemies ? (
            <BattleScreen
              party={party}
              enemies={activeEnemies}
              inventory={inventory}
              backgroundUrl={getBackgroundForFloor(currentFloor)}
              onBattleEnd={handleBattleEnd}
              onFlee={handleFlee}
              onConsumeItem={handleConsumeItem}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto my-12">
              <RetroWindow className="flex flex-col items-center text-center p-6 gap-4">
                <Swords className="w-12 h-12 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white font-mono">
                  NO HAY COMBATE ACTIVO EN ESTE MOMENTO
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-md">
                  Explora las salas de la mazmorra para enfrentarte a los monstruos de la cripta y conseguir valioso botín.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentTab('EXPLORACION')}
                    className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded border border-blue-400 cursor-pointer shadow"
                  >
                    Volver al Mapa de Exploración ▶
                  </button>
                </div>
              </RetroWindow>
            </div>
          )
        )}

        {currentTab === 'EXPLORACION' && (
          <ExplorationScreen
            currentFloor={currentFloor}
            currentRoomId={currentRoomId}
            clearedRoomIds={clearedRoomIds}
            party={party}
            onSelectFloor={handleSelectFloor}
            onMoveToRoom={handleMoveToRoom}
            onTriggerRoomCombat={handleTriggerRoomCombat}
            onOpenChest={handleOpenChest}
            onUseShrine={handleUseShrine}
            onRescueCompanion={handleRescueCompanion}
          />
        )}

        {currentTab === 'INVENTARIO' && (
          <InventoryScreen
            party={party}
            inventory={inventory}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onUseItem={handleUseItem}
            onLearnGrimoire={handleLearnGrimoire}
          />
        )}

        {currentTab === 'HABILIDADES' && (
          <SkillsScreen
            party={party}
            onEquipSkill={handleEquipSkill}
            onUnequipSkill={handleUnequipSkill}
            onUnlockSkill={handleUnlockSkill}
          />
        )}

        {currentTab === 'TIENDA' && (
          <ShopScreen
            gold={gold}
            inventory={inventory}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
          />
        )}

        {currentTab === 'GRUPO' && (
          <PartyStatusScreen party={party} />
        )}
      </main>

      {/* Companion Rescue Dialogue Modal (Centered) */}
      {rescuedCompanionDialogue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <RetroWindow className="max-w-lg w-full flex flex-col gap-4 p-5 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.5)]" centerTitle title="¡NUEVO COMPAÑERO RESCATADO!">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm border-b border-white/20 pb-2 justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>SE UNE A LA VANGUARDIA</span>
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-slate-900/90 rounded-xl border border-white/10">
              <PixelPortrait id={rescuedCompanionDialogue.avatar} size={58} />

              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-white font-mono">
                  {rescuedCompanionDialogue.name}
                </span>
                <span className="text-xs text-amber-300 font-mono mb-1.5">
                  {rescuedCompanionDialogue.classTitle}
                </span>
                <p className="text-xs text-slate-200 font-sans italic leading-relaxed border-l-2 border-emerald-400 pl-3">
                  "{rescuedCompanionDialogue.dialogue}"
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playConfirm();
                setRescuedCompanionDialogue(null);
              }}
              className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl border border-emerald-400 shadow cursor-pointer self-center transition-all hover:scale-105 active:scale-95"
            >
              ¡Bienvenido al Escuadrón! Continuar ▶
            </button>
          </RetroWindow>
        </div>
      )}

      {/* Quiet Footer with Reset Save Option */}
      <footer className="py-3 px-6 border-t border-slate-800/80 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div>
          <span>Pixel Quest: Echoes of Fate · JRPG por Turnos</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreatingHero(true)}
            className="text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Cambiar Clase / Nuevo Héroe
          </button>
          <button
            onClick={handleResetGame}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Reiniciar partida guardada y comenzar de nuevo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Partida</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export type CharacterClass = 'GUERRERO' | 'MAGO' | 'PICARO' | 'CLERIGO' | 'PALADIN';

export type ElementType = 'FISICO' | 'FUEGO' | 'HIELO' | 'RAYO' | 'LUZ' | 'OSCURIDAD' | 'CURACION';

export type TargetType = 'ENEMY_SINGLE' | 'ENEMY_ALL' | 'ALLY_SINGLE' | 'ALLY_ALL' | 'SELF';

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  hpCost?: number;
  power: number; // Multiplier or base power
  type: 'ATTACK' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'SPECIAL';
  element: ElementType;
  target: TargetType;
  requiredLevel: number;
  requiredClass?: CharacterClass;
  icon: string;
  statusEffect?: {
    type: 'POISON' | 'SHIELD' | 'STUN' | 'ATK_UP' | 'DEF_UP' | 'REGEN';
    duration: number;
    value: number;
  };
}

export type ItemType = 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE' | 'GRIMOIRE' | 'TREASURE';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  sellPrice: number;
  icon: string;
  // Stats modifiers for equipment
  stats?: {
    atk?: number;
    def?: number;
    mag?: number;
    res?: number;
    speed?: number;
    crit?: number;
    maxHp?: number;
    maxMp?: number;
  };
  // Effect for consumables
  effect?: {
    healHp?: number;
    healMp?: number;
    revive?: boolean;
    reviveHpPercent?: number;
    buffType?: string;
    buffDuration?: number;
    damageEnemies?: number;
    damageElement?: ElementType;
  };
  teachesSkillId?: string; // For Grimoires
}

export interface EquipmentSlots {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Character {
  id: string;
  name: string;
  characterClass: CharacterClass;
  title: string;
  avatar: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseAtk: number;
  baseDef: number;
  baseMag: number;
  baseRes: number;
  baseSpeed: number;
  baseCrit: number;
  skillPoints: number;
  learnedSkillIds: string[];
  equippedSkillIds: string[]; // Active skills in battle (max 4-6)
  equipment: EquipmentSlots;
  isLeader?: boolean;
  statusEffects: Array<{
    type: 'POISON' | 'SHIELD' | 'STUN' | 'ATK_UP' | 'DEF_UP' | 'REGEN';
    duration: number;
    value: number;
  }>;
}

export interface Enemy {
  id: string;
  name: string;
  title?: string;
  sprite: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  res: number;
  speed: number;
  isBoss?: boolean;
  skills: Skill[];
  lootTable: Array<{
    itemId: string;
    chance: number; // 0 to 1
    quantity?: number;
  }>;
  expReward: number;
  goldReward: number;
  statusEffects: Array<{
    type: 'POISON' | 'SHIELD' | 'STUN' | 'ATK_UP' | 'DEF_UP' | 'REGEN';
    duration: number;
    value: number;
  }>;
}

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'ACTION' | 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEFEAT' | 'CRIT';
}

export type BattlePhase = 
  | 'INITIALIZING'
  | 'PLAYER_COMMAND'
  | 'PLAYER_SUBMENU_SKILLS'
  | 'PLAYER_SUBMENU_ITEMS'
  | 'SELECTING_TARGET'
  | 'EXECUTING_ACTION'
  | 'ENEMY_TURN'
  | 'CHECK_CONDITIONS'
  | 'VICTORY'
  | 'DEFEAT';

export interface FloatingText {
  id: string;
  text: string;
  targetId: string;
  type: 'DAMAGE' | 'CRIT' | 'HEAL' | 'MISS' | 'BUFF' | 'MP';
  timestamp: number;
}

export type RoomType = 'ENTRANCE' | 'COMBAT' | 'CHEST' | 'SHRINE' | 'RESCUE_COMPANION' | 'LORE' | 'BOSS';

export interface DungeonRoom {
  id: string;
  title: string;
  description: string;
  type: RoomType;
  x: number;
  y: number;
  connectedTo: string[];
  isCleared: boolean;
  enemyIds?: string[];
  lootItemId?: string;
  lootGold?: number;
  companionReward?: {
    id: string;
    name: string;
    characterClass: CharacterClass;
    title: string;
    avatar: string;
    dialogue: string;
  };
  loreText?: string;
}

export interface DungeonFloor {
  id: string;
  name: string;
  levelRequirement: number;
  backgroundKey: 'dungeon' | 'forest' | 'dragon';
  description: string;
  rooms: DungeonRoom[];
  bossId: string;
}

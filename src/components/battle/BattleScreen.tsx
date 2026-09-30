import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { RetroWindow } from '../common/RetroWindow';
import { PixelSprite, PixelPortrait } from './PixelSprites';
import { CombatParticleFx } from './CombatParticleFx';
import { Character, Enemy, BattlePhase, FloatingText, Skill, Item } from '../../types/game';
import { sound } from '../../services/soundService';
import { ALL_ITEMS } from '../../data/itemsData';
import { ALL_SKILLS } from '../../data/skillsData';
import { 
  Flame, 
  Snowflake, 
  Zap, 
  Shield, 
  Heart, 
  Sparkles, 
  Sword, 
  ArrowLeft,
  Trophy,
  Skull,
  Coins,
  Package,
  Crosshair,
  X,
  Play,
  CheckCircle2
} from 'lucide-react';

interface BattleScreenProps {
  party: Character[];
  enemies: Enemy[];
  inventory?: Item[];
  backgroundUrl: string;
  onBattleEnd: (victory: boolean, loot: Item[], expWon: number, goldWon: number) => void;
  onFlee: () => void;
  onConsumeItem?: (item: Item) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  party: initialParty,
  enemies: initialEnemies,
  inventory = [],
  backgroundUrl,
  onBattleEnd,
  onFlee,
  onConsumeItem,
}) => {
  const [party, setParty] = useState<Character[]>(() => 
    initialParty.map((c) => ({ ...c, statusEffects: [...c.statusEffects] }))
  );
  const [enemies, setEnemies] = useState<Enemy[]>(() => 
    initialEnemies.map((e) => ({ ...e, statusEffects: [...e.statusEffects] }))
  );

  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [turnQueue, setTurnQueue] = useState<Array<{ isParty: boolean; index: number }>>([]);
  
  const [phase, setPhase] = useState<BattlePhase>('INITIALIZING');
  const [message, setMessage] = useState<string>('¡PREPÁRATE PARA EL COMBATE POR TURNOS!');
  
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<boolean>(false);
  const [attackingEntity, setAttackingEntity] = useState<string | null>(null);
  const [hitEntity, setHitEntity] = useState<string | null>(null);
  const [activeSpellVisual, setActiveSpellVisual] = useState<{
    element: string;
    targetId: string;
  } | null>(null);

  const [battleRewards, setBattleRewards] = useState<{
    exp: number;
    gold: number;
    items: Item[];
    levelUps: string[];
  } | null>(null);

  const buildTurnQueue = (currentParty = party, currentEnemies = enemies) => {
    const list: Array<{ isParty: boolean; index: number; speed: number }> = [];
    currentParty.forEach((p, idx) => {
      if (p.hp > 0) list.push({ isParty: true, index: idx, speed: p.baseSpeed + (p.equipment.accessory?.stats?.speed || 0) });
    });
    currentEnemies.forEach((e, idx) => {
      if (e.hp > 0) list.push({ isParty: false, index: idx, speed: e.speed });
    });
    list.sort((a, b) => b.speed - a.speed);
    return list.map(({ isParty, index }) => ({ isParty, index }));
  };

  useEffect(() => {
    const q = buildTurnQueue();
    setTurnQueue(q);
    setActiveTurnIndex(0);
    
    const firstEnemy = initialEnemies[0];
    const introMsg = firstEnemy.isBoss 
      ? `¡EL JEFE ${firstEnemy.name.toUpperCase()} RUGE EN LA ARENA! ¡LUCHA POR TU VIDA!`
      : `¡${firstEnemy.name.toUpperCase()} APARECE DE ENTRE LAS SOMBRAS!`;
    
    setMessage(introMsg);
    sound.playConfirm();

    const t = setTimeout(() => {
      startTurn(q, 0);
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Safety check: if all enemies are dead, immediately trigger victory
    if (enemies.length > 0 && enemies.every((e) => e.hp <= 0) && phase !== 'VICTORY' && phase !== 'INITIALIZING') {
      handleVictory(enemies);
    }
  }, [enemies, phase]);

  const addFloatingText = (text: string, targetId: string, type: FloatingText['type']) => {
    const newText: FloatingText = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      targetId,
      type,
      timestamp: Date.now(),
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1000);
  };

  const triggerScreenImpact = () => {
    setScreenShake(true);
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 80);
    setTimeout(() => setScreenShake(false), 260);
  };

  const triggerSpellFx = (element: string, targetId: string) => {
    setActiveSpellVisual({ element, targetId });
    setTimeout(() => {
      setActiveSpellVisual(null);
    }, 600);
  };

  const startTurn = (
    queue: Array<{ isParty: boolean; index: number }>, 
    qIndex: number,
    currentParty = party,
    currentEnemies = enemies
  ) => {
    const aliveParty = currentParty.filter((p) => p.hp > 0);
    const aliveEnemies = currentEnemies.filter((e) => e.hp > 0);

    if (aliveEnemies.length === 0) {
      handleVictory(currentEnemies);
      return;
    }
    if (aliveParty.length === 0) {
      handleDefeat();
      return;
    }

    let nextIdx = qIndex;
    let nextQueue = queue;
    if (nextIdx >= queue.length) {
      nextQueue = buildTurnQueue(currentParty, currentEnemies);
      setTurnQueue(nextQueue);
      nextIdx = 0;
    }

    const currentActor = nextQueue[nextIdx];
    if (!currentActor) {
      startTurn(nextQueue, 0, currentParty, currentEnemies);
      return;
    }

    setActiveTurnIndex(nextIdx);

    if (currentActor.isParty) {
      const hero = currentParty[currentActor.index];
      if (!hero || hero.hp <= 0) {
        startTurn(nextQueue, nextIdx + 1, currentParty, currentEnemies);
        return;
      }
      setPhase('PLAYER_COMMAND');
      setMessage(`Turno de ${hero.name}. Elige una acción en la consola central.`);
      setSelectedSkill(null);
      setSelectedItem(null);
    } else {
      const enemy = currentEnemies[currentActor.index];
      if (!enemy || enemy.hp <= 0) {
        startTurn(nextQueue, nextIdx + 1, currentParty, currentEnemies);
        return;
      }
      setPhase('ENEMY_TURN');
      executeEnemyTurn(enemy, currentActor.index, nextQueue, nextIdx, currentParty, currentEnemies);
    }
  };

  const nextActorTurn = (currentParty = party, currentEnemies = enemies) => {
    startTurn(turnQueue, activeTurnIndex + 1, currentParty, currentEnemies);
  };

  // === PLAYER ACTIONS: DIRECT EXECUTION OR TARGET SELECT ===
  const handleSelectAttack = () => {
    sound.playCursor();
    const livingEnemies = enemies.filter((e) => e.hp > 0);
    if (livingEnemies.length === 1) {
      executePhysicalAttackOnEnemy(enemies.findIndex((e) => e.id === livingEnemies[0].id));
    } else {
      setPhase('SELECTING_TARGET');
      setSelectedSkill(null);
      setSelectedItem(null);
      setMessage('Haz clic en el enemigo que deseas atacar.');
    }
  };

  const executePhysicalAttackOnEnemy = (enemyIndex: number) => {
    const heroIdx = turnQueue[activeTurnIndex]?.index || 0;
    const hero = party[heroIdx];
    const targetEnemy = enemies[enemyIndex];
    if (!targetEnemy || targetEnemy.hp <= 0) return;

    sound.playConfirm();
    setPhase('EXECUTING_ACTION');
    setAttackingEntity(hero.id);
    setMessage(`¡${hero.name} asesta un ataque directo a ${targetEnemy.name}!`);

    setTimeout(() => {
      sound.playSwordSlash();
      triggerScreenImpact();
      triggerSpellFx('FISICO', targetEnemy.id);
      setHitEntity(targetEnemy.id);

      const totalAtk = hero.baseAtk + (hero.equipment.weapon?.stats?.atk || 0);
      const isCrit = Math.random() * 100 < (hero.baseCrit + (hero.equipment.weapon?.stats?.crit || 0));
      let dmg = Math.max(2, Math.round(totalAtk * (isCrit ? 1.85 : 1.15) - targetEnemy.def * 0.45));
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

      if (isCrit) {
        sound.playCriticalHit();
        addFloatingText(`¡CRÍTICO! -${dmg}`, targetEnemy.id, 'CRIT');
      } else {
        addFloatingText(`-${dmg}`, targetEnemy.id, 'DAMAGE');
      }

      const updatedEnemies = enemies.map((e, idx) => {
        if (idx === enemyIndex) {
          return { ...e, hp: Math.max(0, e.hp - dmg) };
        }
        return e;
      });
      setEnemies(updatedEnemies);

      setTimeout(() => {
        setAttackingEntity(null);
        setHitEntity(null);

        const remainingAlive = updatedEnemies.filter((e) => e.hp > 0).length;
        if (remainingAlive === 0) {
          handleVictory(updatedEnemies);
        } else {
          nextActorTurn(party, updatedEnemies);
        }
      }, 500);
    }, 400);
  };

  const handleOpenSkillsSubmenu = () => {
    sound.playConfirm();
    setPhase('PLAYER_SUBMENU_SKILLS');
    const hero = party[turnQueue[activeTurnIndex]?.index || 0];
    setMessage(`Grimorio de ${hero.name}. Elige un hechizo o habilidad.`);
  };

  const handleSelectSkill = (skill: Skill) => {
    const hero = party[turnQueue[activeTurnIndex]?.index || 0];
    if (hero.mp < skill.mpCost) {
      sound.playCancel();
      setMessage(`¡No tienes suficiente Maná para ${skill.name}! (Requiere ${skill.mpCost} MP)`);
      return;
    }

    sound.playConfirm();
    setSelectedSkill(skill);

    if (skill.target === 'SELF') {
      executeSkillOnTarget(skill, hero.id, true);
    } else if (skill.target === 'ENEMY_ALL') {
      executeSkillOnAllEnemies(skill);
    } else if (skill.target === 'ALLY_ALL') {
      executeSkillOnAllAllies(skill);
    } else if (skill.target === 'ALLY_SINGLE') {
      if (party.length === 1) {
        executeSkillOnTarget(skill, party[0].id, true);
      } else {
        setPhase('SELECTING_TARGET');
        setMessage(`Haz clic en el aliado para recibir 【${skill.name}】.`);
      }
    } else {
      // ENEMY_SINGLE
      const livingEnemies = enemies.filter((e) => e.hp > 0);
      if (livingEnemies.length === 1) {
        executeSkillOnTarget(skill, livingEnemies[0].id, false);
      } else {
        setPhase('SELECTING_TARGET');
        setMessage(`Haz clic en el objetivo para lanzar 【${skill.name}】.`);
      }
    }
  };

  const executeSkillOnTarget = (skill: Skill, targetId: string, isAlly: boolean) => {
    const heroIdx = turnQueue[activeTurnIndex]?.index || 0;
    const hero = party[heroIdx];

    setPhase('EXECUTING_ACTION');
    setAttackingEntity(hero.id);

    const updatedParty = party.map((p, idx) => 
      idx === heroIdx ? { ...p, mp: Math.max(0, p.mp - skill.mpCost) } : p
    );
    setParty(updatedParty);

    setMessage(`¡${hero.name} desata 【${skill.name}】!`);

    setTimeout(() => {
      if (skill.element === 'FUEGO') sound.playFireSpell();
      else if (skill.element === 'CURACION' || skill.element === 'LUZ') sound.playHealSpell();
      else sound.playSwordSlash();

      triggerScreenImpact();
      triggerSpellFx(skill.element, targetId);
      setHitEntity(targetId);

      const totalMag = hero.baseMag + (hero.equipment.weapon?.stats?.mag || 0);
      const totalAtk = hero.baseAtk + (hero.equipment.weapon?.stats?.atk || 0);

      if (skill.type === 'HEAL') {
        const healAmt = Math.round(totalMag * skill.power * 2.2 + 25);
        const healedParty = updatedParty.map((p) => {
          if (p.id === targetId) {
            return { ...p, hp: Math.min(p.maxHp, p.hp + healAmt) };
          }
          return p;
        });
        setParty(healedParty);
        addFloatingText(`+${healAmt} HP`, targetId, 'HEAL');

        setTimeout(() => {
          setAttackingEntity(null);
          setHitEntity(null);
          setSelectedSkill(null);
          nextActorTurn(healedParty, enemies);
        }, 500);
      } else if (skill.type === 'BUFF') {
        const buffedParty = updatedParty.map((p) => {
          if (p.id === targetId && skill.statusEffect) {
            return { ...p, statusEffects: [...p.statusEffects, skill.statusEffect] };
          }
          return p;
        });
        setParty(buffedParty);
        addFloatingText(`¡BENDICIÓN!`, targetId, 'BUFF');

        setTimeout(() => {
          setAttackingEntity(null);
          setHitEntity(null);
          setSelectedSkill(null);
          nextActorTurn(buffedParty, enemies);
        }, 500);
      } else {
        // Offensive skill
        const powerStat = skill.element === 'FISICO' ? totalAtk : totalMag;
        const targetEnemy = enemies.find((e) => e.id === targetId);
        const enemyRes = skill.element === 'FISICO' ? (targetEnemy?.def || 5) : (targetEnemy?.res || 5);
        let dmg = Math.max(2, Math.round(powerStat * skill.power * 1.6 - enemyRes * 0.4));
        dmg = Math.round(dmg * (0.95 + Math.random() * 0.15));

        const updatedEnemies = enemies.map((e) => {
          if (e.id === targetId) {
            return { ...e, hp: Math.max(0, e.hp - dmg) };
          }
          return e;
        });
        setEnemies(updatedEnemies);
        addFloatingText(`-${dmg}`, targetId, 'DAMAGE');

        setTimeout(() => {
          setAttackingEntity(null);
          setHitEntity(null);
          setSelectedSkill(null);

          const remainingAlive = updatedEnemies.filter((e) => e.hp > 0).length;
          if (remainingAlive === 0) {
            handleVictory(updatedEnemies);
          } else {
            nextActorTurn(updatedParty, updatedEnemies);
          }
        }, 500);
      }
    }, 450);
  };

  const executeSkillOnAllEnemies = (skill: Skill) => {
    const heroIdx = turnQueue[activeTurnIndex]?.index || 0;
    const hero = party[heroIdx];

    setPhase('EXECUTING_ACTION');
    setAttackingEntity(hero.id);
    const updatedParty = party.map((p, idx) => 
      idx === heroIdx ? { ...p, mp: Math.max(0, p.mp - skill.mpCost) } : p
    );
    setParty(updatedParty);

    setMessage(`¡${hero.name} desata 【${skill.name}】 sobre TODOS los adversarios!`);

    setTimeout(() => {
      sound.playFireSpell();
      triggerScreenImpact();
      triggerSpellFx(skill.element, 'all_enemies');

      const totalMag = hero.baseMag + (hero.equipment.weapon?.stats?.mag || 0);
      const totalAtk = hero.baseAtk + (hero.equipment.weapon?.stats?.atk || 0);
      const powerStat = skill.element === 'FISICO' ? totalAtk : totalMag;

      const updatedEnemies = enemies.map((e) => {
        if (e.hp <= 0) return e;
        const enemyRes = skill.element === 'FISICO' ? e.def : e.res;
        let dmg = Math.max(2, Math.round(powerStat * skill.power * 1.3 - enemyRes * 0.35));
        dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
        addFloatingText(`-${dmg}`, e.id, 'DAMAGE');
        return { ...e, hp: Math.max(0, e.hp - dmg) };
      });
      setEnemies(updatedEnemies);

      setTimeout(() => {
        setAttackingEntity(null);
        setSelectedSkill(null);
        const remainingAlive = updatedEnemies.filter((e) => e.hp > 0).length;
        if (remainingAlive === 0) {
          handleVictory(updatedEnemies);
        } else {
          nextActorTurn(updatedParty, updatedEnemies);
        }
      }, 500);
    }, 500);
  };

  const executeSkillOnAllAllies = (skill: Skill) => {
    const heroIdx = turnQueue[activeTurnIndex]?.index || 0;
    const hero = party[heroIdx];

    setPhase('EXECUTING_ACTION');
    setAttackingEntity(hero.id);
    const updatedParty = party.map((p, idx) => 
      idx === heroIdx ? { ...p, mp: Math.max(0, p.mp - skill.mpCost) } : p
    );
    setParty(updatedParty);

    setMessage(`¡${hero.name} entona 【${skill.name}】 bendiciendo a todo el escuadrón!`);

    setTimeout(() => {
      sound.playHealSpell();
      triggerScreenImpact();
      triggerSpellFx('CURACION', 'all_allies');

      const totalMag = hero.baseMag + (hero.equipment.weapon?.stats?.mag || 0);
      const healAmt = Math.round(totalMag * skill.power * 1.5 + 20);

      const healedParty = updatedParty.map((p) => {
        if (p.hp <= 0) return p;
        const newHp = Math.min(p.maxHp, p.hp + healAmt);
        addFloatingText(`+${healAmt} HP`, p.id, 'HEAL');
        const effects = skill.statusEffect ? [...p.statusEffects, skill.statusEffect] : p.statusEffects;
        return { ...p, hp: newHp, statusEffects: effects };
      });
      setParty(healedParty);

      setTimeout(() => {
        setAttackingEntity(null);
        setSelectedSkill(null);
        nextActorTurn(healedParty, enemies);
      }, 500);
    }, 500);
  };

  const handleSelectDefend = () => {
    const heroIdx = turnQueue[activeTurnIndex]?.index || 0;
    const hero = party[heroIdx];
    sound.playConfirm();

    setPhase('EXECUTING_ACTION');
    setAttackingEntity(hero.id);
    setMessage(`${hero.name} adopta una postura defensiva (-50% daño recibido y +8 MP).`);

    setTimeout(() => {
      const updatedParty = party.map((p, idx) => {
        if (idx === heroIdx) {
          return {
            ...p,
            mp: Math.min(p.maxMp, p.mp + 8),
            statusEffects: [...p.statusEffects, { type: 'SHIELD' as const, duration: 1, value: 50 }],
          };
        }
        return p;
      });
      setParty(updatedParty);
      addFloatingText('+8 MP', hero.id, 'MP');
      setAttackingEntity(null);
      setTimeout(() => nextActorTurn(updatedParty, enemies), 600);
    }, 500);
  };

  const handleOpenItemsSubmenu = () => {
    sound.playConfirm();
    setPhase('PLAYER_SUBMENU_ITEMS');
    setMessage('Bolsa de Provisiones. Elige un consumible para usar en combate.');
  };

  const handleSelectItem = (item: Item) => {
    sound.playConfirm();
    setSelectedItem(item);
    if (party.length === 1) {
      executeItemOnTarget(item, party[0]);
    } else {
      setPhase('SELECTING_TARGET');
      setMessage(`Haz clic en el héroe que recibirá ${item.name}.`);
    }
  };

  const executeItemOnTarget = (item: Item, targetHero: Character) => {
    sound.playHealSpell();
    setPhase('EXECUTING_ACTION');
    setMessage(`¡Usando ${item.name} en ${targetHero.name}!`);

    setTimeout(() => {
      const updatedParty = party.map((p) => {
        if (p.id === targetHero.id) {
          let nextHp = p.hp;
          let nextMp = p.mp;
          if (item.effect?.healHp) {
            nextHp = Math.min(p.maxHp, p.hp + item.effect.healHp);
            addFloatingText(`+${item.effect.healHp} HP`, p.id, 'HEAL');
          }
          if (item.effect?.healMp) {
            nextMp = Math.min(p.maxMp, p.mp + item.effect.healMp);
            addFloatingText(`+${item.effect.healMp} MP`, p.id, 'MP');
          }
          if (item.effect?.revive && p.hp === 0) {
            nextHp = Math.round(p.maxHp * (item.effect.reviveHpPercent || 0.5));
            addFloatingText(`¡RESUCITADO!`, p.id, 'HEAL');
          }
          return { ...p, hp: nextHp, mp: nextMp };
        }
        return p;
      });
      setParty(updatedParty);

      if (onConsumeItem) {
        onConsumeItem(item);
      }

      setTimeout(() => {
        setSelectedItem(null);
        nextActorTurn(updatedParty, enemies);
      }, 500);
    }, 400);
  };

  const handleSelectFlee = () => {
    sound.playConfirm();
    const hero = party[turnQueue[activeTurnIndex]?.index || 0];
    const bossPresent = enemies.some((e) => e.isBoss && e.hp > 0);

    if (bossPresent) {
      sound.playCancel();
      setMessage('¡No puedes huir de un combate contra un Jefe!');
      return;
    }

    setPhase('EXECUTING_ACTION');
    const success = Math.random() < 0.65;
    if (success) {
      setMessage(`¡${hero.name} y el escuadrón han logrado escapar con éxito!`);
      setTimeout(() => {
        onFlee();
      }, 900);
    } else {
      sound.playCancel();
      setMessage(`¡El grupo intentó retirarse pero los enemigos bloquearon el pasaje!`);
      setTimeout(() => nextActorTurn(party, enemies), 800);
    }
  };

  // === ENEMY AI TURN ===
  const executeEnemyTurn = (
    enemy: Enemy,
    enemyIdx: number,
    queue: Array<{ isParty: boolean; index: number }>,
    qIdx: number,
    currentParty = party,
    currentEnemies = enemies
  ) => {
    setAttackingEntity(enemy.id);

    const livingHeroes = currentParty
      .map((p, idx) => ({ hero: p, idx }))
      .filter(({ hero }) => hero.hp > 0);

    if (livingHeroes.length === 0) {
      handleDefeat();
      return;
    }

    const tauntedHero = livingHeroes.find(({ hero }) => 
      hero.statusEffects.some((s) => s.type === 'DEF_UP' || s.type === 'SHIELD')
    );
    const target = tauntedHero || livingHeroes[Math.floor(Math.random() * livingHeroes.length)];

    const canUseSkill = enemy.skills.length > 0 && enemy.mp >= (enemy.skills[0]?.mpCost || 0);
    const useSkill = canUseSkill && Math.random() < 0.6;
    const skill = useSkill ? enemy.skills[Math.floor(Math.random() * enemy.skills.length)] : null;

    if (skill && skill.target === 'ENEMY_ALL') {
      setMessage(`¡${enemy.name} desata 【${skill.name}】 sobre el grupo!`);
      setTimeout(() => {
        sound.playFireSpell();
        triggerScreenImpact();
        triggerSpellFx('FUEGO', 'all_allies');

        const damagedParty = currentParty.map((p) => {
          if (p.hp <= 0) return p;
          const isGuarding = p.statusEffects.some((s) => s.type === 'SHIELD');
          const defStat = p.baseDef + (p.equipment.armor?.stats?.def || 0);
          let dmg = Math.max(1, Math.round(enemy.atk * skill.power - defStat * 0.45));
          if (isGuarding) dmg = Math.round(dmg * 0.5);
          addFloatingText(`-${dmg}`, p.id, 'DAMAGE');
          return { ...p, hp: Math.max(0, p.hp - dmg) };
        });
        setParty(damagedParty);

        setTimeout(() => {
          setAttackingEntity(null);
          startTurn(queue, qIdx + 1, damagedParty, currentEnemies);
        }, 600);
      }, 600);
    } else {
      const actionName = skill ? `【${skill.name}】` : 'un ataque feroz';
      setMessage(`¡${enemy.name} arremete contra ${target.hero.name} con ${actionName}!`);

      setTimeout(() => {
        sound.playSwordSlash();
        triggerScreenImpact();
        triggerSpellFx('FISICO', target.hero.id);
        setHitEntity(target.hero.id);

        const isGuarding = target.hero.statusEffects.some((s) => s.type === 'SHIELD');
        const defStat = target.hero.baseDef + (target.hero.equipment.armor?.stats?.def || 0);
        const powerMult = skill ? skill.power : 1.0;
        let dmg = Math.max(2, Math.round(enemy.atk * powerMult * 1.15 - defStat * 0.5));
        if (isGuarding) dmg = Math.round(dmg * 0.5);
        dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

        addFloatingText(`-${dmg}`, target.hero.id, 'DAMAGE');

        const damagedParty = currentParty.map((p, idx) => {
          if (idx === target.idx) {
            return { ...p, hp: Math.max(0, p.hp - dmg) };
          }
          return p;
        });
        setParty(damagedParty);

        setTimeout(() => {
          setAttackingEntity(null);
          setHitEntity(null);
          if (target.hero.hp - dmg <= 0) {
            setMessage(`¡${target.hero.name} ha caído en combate!`);
          }
          setTimeout(() => {
            startTurn(queue, qIdx + 1, damagedParty, currentEnemies);
          }, 500);
        }, 500);
      }, 600);
    }
  };

  // === VICTORY & DEFEAT ===
  const handleVictory = (finalEnemies = enemies) => {
    setPhase('VICTORY');
    sound.playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    let totalExp = 0;
    let totalGold = 0;
    const droppedItems: Item[] = [];

    finalEnemies.forEach((e) => {
      totalExp += e.expReward;
      totalGold += e.goldReward;
      e.lootTable.forEach((loot) => {
        if (Math.random() <= loot.chance) {
          const item = ALL_ITEMS[loot.itemId];
          if (item) droppedItems.push(item);
        }
      });
    });

    const levelUps: string[] = [];
    setParty((prev) => {
      return prev.map((p) => {
        const nextExp = p.exp + totalExp;
        if (nextExp >= p.maxExp) {
          levelUps.push(p.name);
          return {
            ...p,
            level: p.level + 1,
            exp: nextExp - p.maxExp,
            maxExp: Math.round(p.maxExp * 1.4),
            maxHp: p.maxHp + 25,
            hp: p.maxHp + 25,
            maxMp: p.maxMp + 10,
            mp: p.maxMp + 10,
            baseAtk: p.baseAtk + 3,
            baseDef: p.baseDef + 2,
            baseMag: p.baseMag + 3,
            skillPoints: p.skillPoints + 1,
          };
        }
        return { ...p, exp: nextExp };
      });
    });

    setBattleRewards({
      exp: totalExp,
      gold: totalGold,
      items: droppedItems,
      levelUps,
    });

    setMessage(`¡VICTORIA! Todos los adversarios han sucumbido ante tu vanguardia.`);
  };

  const handleDefeat = () => {
    setPhase('DEFEAT');
    sound.playEnemyDefeat();
    setMessage('¡TU HÉROE Y ESCUADRÓN HAN SIDO VENCIDOS! Tus fuerzas se desvanecen...');
  };

  const activeHero = party[turnQueue[activeTurnIndex]?.index || 0] || party[0];

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-3 p-2 sm:p-4 select-none">
      {/* 1. TOP BATTLE STATUS BANNER (CENTERED) */}
      <RetroWindow className="w-full min-h-[58px] flex items-center justify-between shadow-lg" centerTitle>
        <div className="flex items-center gap-3 flex-1 justify-center sm:justify-start">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest font-mono">
            {phase === 'PLAYER_COMMAND' && '⚡ TURNO ALIADO'}
            {phase === 'SELECTING_TARGET' && '🎯 SELECCIÓN DE OBJETIVO'}
            {phase === 'ENEMY_TURN' && '⚔️ TURNO ENEMIGO'}
            {phase === 'EXECUTING_ACTION' && '💥 COMBATE'}
            {phase === 'VICTORY' && '🏆 VICTORIA'}
            {phase === 'DEFEAT' && '💀 DERROTA'}
            {phase === 'INITIALIZING' && '🛡️ PREPARANDO'}
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <p className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide truncate max-w-xl">
            {message}
          </p>
        </div>
      </RetroWindow>

      {/* 2. MIDDLE BATTLE ARENA (FRAMER MOTION SCREEN SHAKE) */}
      <motion.div 
        animate={
          screenShake
            ? {
                x: [-16, 16, -12, 12, -8, 8, -4, 4, 0],
                y: [-8, 8, -6, 6, -3, 3, 0],
                rotate: [-1.2, 1.2, -0.6, 0.6, 0],
                transition: { duration: 0.45, ease: 'easeOut' },
              }
            : { x: 0, y: 0, rotate: 0 }
        }
        className={`
          relative w-full h-[340px] sm:h-[410px] rounded-2xl overflow-hidden border-2 border-amber-500/60
          shadow-[inset_0_0_90px_rgba(0,0,0,0.92),0_12px_35px_rgba(0,0,0,0.85)]
          ${screenFlash ? 'brightness-150' : ''}
        `}
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle Dark Ambient & Stage Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Visual Spell Effect Layer with Framer Motion Particles */}
        {activeSpellVisual && (
          <CombatParticleFx
            element={activeSpellVisual.element}
            targetId={activeSpellVisual.targetId}
            isCrit={floatingTexts.some((f) => f.type === 'CRIT' && f.targetId === activeSpellVisual.targetId)}
          />
        )}

        {/* Floating Combat Numbers Layer with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 0, y: 15, scale: 0.6 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-10, -40, -65, -85],
                scale: ft.type === 'CRIT' ? [0.8, 1.65, 1.35, 1.1] : [0.8, 1.35, 1.15, 0.95],
              }}
              exit={{ opacity: 0, y: -95 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className={`
                absolute z-50 font-['Press_Start_2P'] text-xs sm:text-sm font-black pointer-events-none
                drop-shadow-[0_4px_10px_rgba(0,0,0,1)]
                ${ft.type === 'CRIT' ? 'text-amber-300 drop-shadow-[0_0_12px_#f59e0b]' : ''}
                ${ft.type === 'DAMAGE' ? 'text-red-400 drop-shadow-[0_0_8px_#ef4444]' : ''}
                ${ft.type === 'HEAL' ? 'text-emerald-300 drop-shadow-[0_0_8px_#10b981]' : ''}
                ${ft.type === 'MP' ? 'text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]' : ''}
                ${ft.type === 'BUFF' ? 'text-yellow-300 drop-shadow-[0_0_8px_#eab308]' : ''}
              `}
              style={{
                top: '38%',
                left: ft.targetId.includes('hero') ? '68%' : '26%',
              }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Target Selection Top Banner (when in SELECTING_TARGET) */}
        {phase === 'SELECTING_TARGET' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-slate-950/90 border-2 border-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-3 backdrop-blur-md animate-pulse">
            <Crosshair className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-amber-300 font-mono tracking-wider">
              {selectedSkill 
                ? `ELIGE OBJETIVO PARA 【${selectedSkill.name.toUpperCase()}】`
                : selectedItem 
                ? `ELIGE DESTINATARIO PARA 【${selectedItem.name.toUpperCase()}】`
                : 'ELIGE OBJETIVO PARA ATACAR'}
            </span>
            <button
              onClick={() => {
                sound.playCancel();
                setPhase('PLAYER_COMMAND');
                setSelectedSkill(null);
                setSelectedItem(null);
              }}
              className="text-[10px] text-red-300 hover:text-white px-2 py-0.5 bg-red-950/70 border border-red-500 rounded font-mono cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ARENA ACTORS */}
        <div className="relative w-full h-full flex items-center justify-between px-6 sm:px-14 pb-8">
          {/* ENEMIES ROW: DIRECT CLICK TARGETING WITH FRAMER MOTION LUNGES & SHAKE */}
          <div className="flex items-end gap-5 sm:gap-10 z-10">
            {enemies.map((enemy, idx) => {
              const isTargetDead = enemy.hp <= 0;
              const isAttacking = attackingEntity === enemy.id;
              const isHit = hitEntity === enemy.id;
              const isClickable = !isTargetDead && (phase === 'PLAYER_COMMAND' || (phase === 'SELECTING_TARGET' && selectedSkill?.target !== 'ALLY_SINGLE'));

              return (
                <motion.div
                  key={enemy.id}
                  animate={
                    isAttacking
                      ? {
                          x: [0, 85, 75, 0],
                          scale: [1, 1.25, 1.18, 1],
                          rotate: [0, 10, -5, 0],
                          transition: { duration: 0.45, ease: 'easeInOut' },
                        }
                      : isHit
                      ? {
                          x: [0, -24, 20, -14, 10, -4, 0],
                          filter: [
                            'brightness(1)',
                            'brightness(2.4) saturate(2)',
                            'brightness(1)',
                          ],
                          transition: { duration: 0.42, ease: 'easeOut' },
                        }
                      : isTargetDead
                      ? {
                          opacity: 0.25,
                          scale: 0.8,
                          rotate: -45,
                          y: 15,
                          filter: 'grayscale(100%)',
                          transition: { duration: 0.5 },
                        }
                      : {
                          x: 0,
                          scale: 1,
                          rotate: 0,
                          y: [0, -3, 0],
                          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 },
                        }
                  }
                  onClick={() => {
                    if (isClickable) {
                      if (phase === 'PLAYER_COMMAND') {
                        executePhysicalAttackOnEnemy(idx);
                      } else if (phase === 'SELECTING_TARGET') {
                        if (selectedSkill) {
                          executeSkillOnTarget(selectedSkill, enemy.id, false);
                        } else {
                          executePhysicalAttackOnEnemy(idx);
                        }
                      }
                    }
                  }}
                  className={`
                    relative flex flex-col items-center
                    ${isTargetDead ? 'opacity-25' : 'cursor-pointer hover:scale-110 active:scale-95'}
                    ${isClickable ? 'ring-2 ring-amber-400 rounded-lg p-1.5 shadow-[0_0_15px_rgba(245,158,11,0.7)] animate-pulse' : ''}
                  `}
                >
                  {/* Selector Crosshair Arrow */}
                  {isClickable && (
                    <div className="absolute -top-8 text-amber-300 text-xl font-bold animate-bounce drop-shadow-[0_2px_4px_#000]">
                      ▼
                    </div>
                  )}

                  {!isTargetDead && (
                    <div className="w-20 sm:w-24 mb-1.5 flex flex-col items-center">
                      <span className="text-[11px] text-white font-mono font-bold truncate max-w-full drop-shadow-[0_1px_2px_#000]">
                        {enemy.name}
                      </span>
                      <div className="w-full h-2 bg-slate-950/90 rounded-full border border-slate-700 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-300 font-mono mt-0.5">
                        {enemy.hp} / {enemy.maxHp}
                      </span>
                    </div>
                  )}

                  <PixelSprite
                    id={enemy.sprite}
                    size={enemy.isBoss ? 120 : 80}
                    isAttacking={isAttacking}
                    isHit={isHit}
                    isDead={isTargetDead}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* PARTY MEMBERS COLUMN: DIRECT CLICK TARGETING WITH FRAMER MOTION LUNGES & SHAKE */}
          <div className="flex flex-col gap-4 sm:gap-6 z-10">
            {party.map((hero, idx) => {
              const isCurrentTurn = turnQueue[activeTurnIndex]?.isParty && turnQueue[activeTurnIndex]?.index === idx;
              const isTargetDead = hero.hp <= 0;
              const isAttacking = attackingEntity === hero.id;
              const isHit = hitEntity === hero.id;
              const isDefending = hero.statusEffects.some((s) => s.type === 'SHIELD');
              const isSelectableAlly = phase === 'SELECTING_TARGET' && (selectedSkill?.target === 'ALLY_SINGLE' || selectedItem !== null);

              return (
                <motion.div
                  key={hero.id}
                  animate={
                    isAttacking
                      ? {
                          x: [0, -90, -80, 0],
                          scale: [1, 1.25, 1.18, 1],
                          rotate: [0, -12, 6, 0],
                          transition: { duration: 0.45, ease: 'easeInOut' },
                        }
                      : isHit
                      ? {
                          x: [0, 24, -20, 14, -10, 4, 0],
                          filter: [
                            'brightness(1)',
                            'brightness(2.4) saturate(2)',
                            'brightness(1)',
                          ],
                          transition: { duration: 0.42, ease: 'easeOut' },
                        }
                      : isTargetDead
                      ? {
                          opacity: 0.25,
                          scale: 0.85,
                          rotate: 45,
                          y: 15,
                          filter: 'grayscale(100%)',
                          transition: { duration: 0.5 },
                        }
                      : isCurrentTurn
                      ? {
                          x: -16,
                          scale: 1.06,
                          y: [0, -5, 0],
                          transition: { y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
                        }
                      : {
                          x: 0,
                          scale: 1,
                          rotate: 0,
                          y: [0, -2, 0],
                          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 },
                        }
                  }
                  onClick={() => {
                    if (isSelectableAlly) {
                      if (selectedItem) {
                        executeItemOnTarget(selectedItem, hero);
                      } else if (selectedSkill) {
                        executeSkillOnTarget(selectedSkill, hero.id, true);
                      }
                    }
                  }}
                  className={`
                    relative flex items-center gap-3
                    ${isTargetDead ? 'opacity-25' : ''}
                    ${isSelectableAlly ? 'ring-2 ring-emerald-400 rounded-lg p-1.5 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse' : ''}
                  `}
                >
                  {isCurrentTurn && (
                    <div className="absolute -left-6 text-amber-300 text-lg font-black animate-pulse drop-shadow">
                      ▶
                    </div>
                  )}

                  {isSelectableAlly && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-emerald-400 text-lg font-bold animate-bounce drop-shadow">
                      ▼
                    </div>
                  )}

                  <PixelSprite
                    id={hero.avatar}
                    size={64}
                    isAttacking={isAttacking}
                    isHit={isHit}
                    isDead={isTargetDead}
                    isDefending={isDefending}
                  />

                  <div className="hidden sm:flex flex-col min-w-[90px]">
                    <span className="text-xs font-bold text-white tracking-wide drop-shadow-[0_1px_2px_#000]">
                      {hero.name}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      NV {hero.level} · {hero.characterClass}
                    </span>
                    {/* Compact HP Gauge */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* ARENA VICTORY OVERLAY BANNER (CENTERED) */}
        {phase === 'VICTORY' && battleRewards && (
          <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xl sm:text-3xl font-black drop-shadow animate-bounce">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              <span>¡VICTORIA TRIUNFAL!</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 mb-4 font-mono text-center">
              Todos los adversarios han caído en combate
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-slate-900/90 border border-amber-400/60 rounded-xl text-xs sm:text-sm font-mono mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> +{battleRewards.gold} Oro
              </span>
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> +{battleRewards.exp} EXP
              </span>
              {battleRewards.items.length > 0 && (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> {battleRewards.items.map((i) => i.name).join(', ')}
                </span>
              )}
            </div>

            {battleRewards.levelUps.length > 0 && (
              <div className="mb-4 text-xs sm:text-sm font-bold text-yellow-300 animate-pulse font-mono">
                ⭐ ¡SUBIDA DE NIVEL: {battleRewards.levelUps.join(', ')}! ⭐
              </div>
            )}

            <button
              onClick={() => {
                sound.playConfirm();
                onBattleEnd(true, battleRewards.items, battleRewards.exp, battleRewards.gold);
              }}
              className="py-3 px-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.8)] cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
            >
              RECLAMAR BOTÍN Y VOLVER A EXPLORAR ▶
            </button>
          </div>
        )}

        {/* ARENA DEFEAT OVERLAY (CENTERED) */}
        {phase === 'DEFEAT' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <Skull className="w-12 h-12 text-red-500 animate-pulse mb-2" />
            <h2 className="text-xl sm:text-2xl font-black text-red-400 font-mono tracking-wider mb-2">
              EL ESCUADRÓN HA SIDO DERROTADO
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-md text-center mb-5 leading-relaxed">
              Tus fuerzas sucumbieron en los pasillos de la cripta. Regresas maltrecho a las puertas de la mazmorra.
            </p>
            <button
              onClick={() => onBattleEnd(false, [], 0, 0)}
              className="py-2.5 px-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-lg border border-red-400 shadow cursor-pointer transition-all"
            >
              Reagruparse en el Campamento ▶
            </button>
          </div>
        )}
      </motion.div>

      {/* 3. CENTERED HERO COMMAND CONSOLE (IN THE MIDDLE) */}
      <div className="w-full flex flex-col items-center justify-center">
        <RetroWindow className="w-full max-w-4xl flex flex-col gap-3" centerTitle title={`CONSOLA DE COMBATE · ${activeHero.name.toUpperCase()}`}>
          {/* Active Hero Status Strip (Centered) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-900/80 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <PixelPortrait id={activeHero.avatar} size={48} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">{activeHero.name}</span>
                  <span className="text-xs text-amber-300 font-mono">NV {activeHero.level}</span>
                </div>
                <span className="text-[11px] text-slate-400">{activeHero.title}</span>
              </div>
            </div>

            {/* Health and Mana Bars */}
            <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
              <div className="flex flex-col gap-1 w-32 sm:w-40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">HP</span>
                  <span className="text-slate-200">{activeHero.hp} / {activeHero.maxHp}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, (activeHero.hp / activeHero.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-28 sm:w-36">
                <div className="flex justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">MP</span>
                  <span className="text-slate-200">{activeHero.mp} / {activeHero.maxMp}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, (activeHero.mp / activeHero.maxMp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5 Prominent Action Buttons (Centered Row) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <button
              onClick={handleSelectAttack}
              disabled={phase !== 'PLAYER_COMMAND'}
              className={`
                py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all
                ${phase === 'PLAYER_COMMAND'
                  ? 'bg-gradient-to-b from-red-600/90 to-red-950/90 border-red-500/80 hover:from-red-500 hover:to-red-900 text-white cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <Sword className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold font-mono tracking-wide">ATACAR</span>
            </button>

            <button
              onClick={handleOpenSkillsSubmenu}
              disabled={phase !== 'PLAYER_COMMAND'}
              className={`
                py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all
                ${phase === 'PLAYER_COMMAND'
                  ? 'bg-gradient-to-b from-indigo-600/90 to-indigo-950/90 border-indigo-400/80 hover:from-indigo-500 hover:to-indigo-900 text-white cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span className="text-xs font-bold font-mono tracking-wide">HABILIDADES</span>
            </button>

            <button
              onClick={handleSelectDefend}
              disabled={phase !== 'PLAYER_COMMAND'}
              className={`
                py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all
                ${phase === 'PLAYER_COMMAND'
                  ? 'bg-gradient-to-b from-amber-600/90 to-amber-950/90 border-amber-500/80 hover:from-amber-500 hover:to-amber-900 text-white cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <Shield className="w-5 h-5 text-yellow-300" />
              <span className="text-xs font-bold font-mono tracking-wide">DEFENDER</span>
            </button>

            <button
              onClick={handleOpenItemsSubmenu}
              disabled={phase !== 'PLAYER_COMMAND'}
              className={`
                py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all
                ${phase === 'PLAYER_COMMAND'
                  ? 'bg-gradient-to-b from-emerald-600/90 to-emerald-950/90 border-emerald-400/80 hover:from-emerald-500 hover:to-emerald-900 text-white cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <Package className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold font-mono tracking-wide">OBJETOS</span>
            </button>

            <button
              onClick={handleSelectFlee}
              disabled={phase !== 'PLAYER_COMMAND'}
              className={`
                col-span-2 sm:col-span-1 py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all
                ${phase === 'PLAYER_COMMAND'
                  ? 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500 hover:from-slate-600 hover:to-slate-800 text-slate-200 cursor-pointer hover:scale-105 active:scale-95'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
              <span className="text-xs font-bold font-mono tracking-wide">HUIR</span>
            </button>
          </div>
        </RetroWindow>
      </div>

      {/* ========================================================================= */}
      {/* 4. CENTERED SKILLS MODAL (OPENS IN THE MIDDLE AS REQUESTED BY USER)       */}
      {/* ========================================================================= */}
      {phase === 'PLAYER_SUBMENU_SKILLS' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <RetroWindow className="w-full max-w-2xl flex flex-col gap-4 border-2 border-amber-400/80" centerTitle title={`GRIMORIO DE HABILIDADES · ${activeHero.name.toUpperCase()}`}>
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  MANÁ DISPONIBLE: {activeHero.mp} / {activeHero.maxMp} MP
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playCancel();
                  setPhase('PLAYER_COMMAND');
                }}
                className="text-xs text-amber-300 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-slate-900 rounded border border-white/20 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cerrar
              </button>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {activeHero.equippedSkillIds.map((skillId) => {
                const skill = ALL_SKILLS[skillId];
                if (!skill) return null;
                const canAfford = activeHero.mp >= skill.mpCost;

                return (
                  <div
                    key={skillId}
                    onClick={() => {
                      if (canAfford) {
                        handleSelectSkill(skill);
                      } else {
                        sound.playCancel();
                      }
                    }}
                    className={`
                      p-3 rounded-xl border flex flex-col justify-between transition-all
                      ${canAfford
                        ? 'bg-slate-900/80 border-indigo-400/50 hover:border-amber-400 hover:bg-indigo-950/60 cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)] hover:scale-[1.02]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        {skill.element === 'FUEGO' && <Flame className="w-3.5 h-3.5 text-red-400" />}
                        {skill.element === 'HIELO' && <Snowflake className="w-3.5 h-3.5 text-blue-400" />}
                        {skill.element === 'RAYO' && <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                        {skill.element === 'CURACION' && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
                        {skill.name}
                      </span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${canAfford ? 'bg-indigo-950 text-cyan-300 border border-cyan-500/40' : 'bg-red-950/50 text-red-400 border border-red-800'}`}>
                        {skill.mpCost} MP
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2 my-1">
                      {skill.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                      <span>Objetivo: {skill.target === 'SELF' ? 'Propio' : skill.target === 'ENEMY_ALL' ? 'Todos los Enemigos' : skill.target === 'ALLY_ALL' ? 'Todo el Grupo' : 'Individual'}</span>
                      <span className="text-amber-400 font-bold">Lanzar ▶</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                sound.playCancel();
                setPhase('PLAYER_COMMAND');
              }}
              className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-white/20 self-center cursor-pointer mt-1"
            >
              Volver al Combate
            </button>
          </RetroWindow>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CENTERED ITEMS MODAL (OPENS IN THE MIDDLE AS REQUESTED BY USER)        */}
      {/* ========================================================================= */}
      {phase === 'PLAYER_SUBMENU_ITEMS' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <RetroWindow className="w-full max-w-2xl flex flex-col gap-4 border-2 border-emerald-400/80" centerTitle title="BOLSA DE PROVISIONES Y POCIONES DEL GRUPO">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-xs font-bold text-emerald-300 font-mono">
                SELECCIONA UN OBJETO PARA UTILIZAR EN LA BATALLA
              </span>
              <button
                onClick={() => {
                  sound.playCancel();
                  setPhase('PLAYER_COMMAND');
                }}
                className="text-xs text-amber-300 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-slate-900 rounded border border-white/20 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cerrar
              </button>
            </div>

            {/* Consumables List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {(() => {
                const consumables = inventory.filter((i) => i.type === 'CONSUMABLE');
                const itemCounts: Record<string, { item: Item; count: number }> = {};

                if (consumables.length > 0) {
                  consumables.forEach((it) => {
                    if (!itemCounts[it.id]) {
                      itemCounts[it.id] = { item: it, count: 0 };
                    }
                    itemCounts[it.id].count += 1;
                  });
                } else {
                  // Fallback rations if inventory is empty
                  ['health_potion', 'greater_health_potion', 'mana_ether', 'fire_bomb'].forEach((id) => {
                    const it = ALL_ITEMS[id];
                    if (it) itemCounts[id] = { item: it, count: 2 };
                  });
                }

                return Object.values(itemCounts).map(({ item: it, count }) => (
                  <div
                    key={it.id}
                    onClick={() => handleSelectItem(it)}
                    className="p-3 bg-slate-900/80 hover:bg-emerald-950/60 rounded-xl border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                        {it.name}
                      </span>
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        x{count}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2 my-1">
                      {it.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-emerald-400 font-mono">
                      <span>{it.effect?.healHp ? `+${it.effect.healHp} HP` : it.effect?.healMp ? `+${it.effect.healMp} MP` : 'Efecto Táctico'}</span>
                      <span className="text-amber-300 font-bold">Usar ▶</span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <button
              onClick={() => {
                sound.playCancel();
                setPhase('PLAYER_COMMAND');
              }}
              className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-white/20 self-center cursor-pointer mt-1"
            >
              Volver al Combate
            </button>
          </RetroWindow>
        </div>
      )}
    </div>
  );
};

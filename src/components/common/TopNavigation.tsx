import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Coins, Download, Lock, UserPlus } from 'lucide-react';
import { sound } from '../../services/soundService';

export type GameTab = 'COMBATE' | 'EXPLORACION' | 'INVENTARIO' | 'HABILIDADES' | 'TIENDA' | 'GRUPO';

interface TopNavigationProps {
  currentTab: GameTab;
  onSelectTab: (tab: GameTab) => void;
  gold: number;
  inBattle: boolean;
  onNewCharacter?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  gold,
  inBattle,
  onNewCharacter,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(sound.isEnabled());
  const [combatAlert, setCombatAlert] = useState<string | null>(null);

  const toggleAudio = () => {
    const next = !audioEnabled;
    sound.setEnabled(next);
    setAudioEnabled(next);
    if (next) sound.playConfirm();
  };

  const navItems: Array<{ id: GameTab; label: string; badge?: string }> = [
    { id: 'COMBATE', label: 'Combate', badge: inBattle ? 'EN CURSO' : undefined },
    { id: 'EXPLORACION', label: 'Exploración' },
    { id: 'INVENTARIO', label: 'Inventario' },
    { id: 'HABILIDADES', label: 'Habilidades' },
    { id: 'TIENDA', label: 'Tienda' },
    { id: 'GRUPO', label: 'Grupo' },
  ];

  const handleTabClick = (item: { id: GameTab; label: string }) => {
    if (inBattle && item.id !== 'COMBATE') {
      sound.playCancel();
      setCombatAlert(`¡Estás en pleno combate! Debes derrotar a tus enemigos o huir antes de acceder a ${item.label}.`);
      setTimeout(() => setCombatAlert(null), 3200);
      return;
    }
    sound.playCursor();
    onSelectTab(item.id);
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-slate-950/95 border-b border-indigo-900/60 backdrop-blur-md">
      {combatAlert && (
        <div className="bg-red-950/90 border-b border-red-500/80 px-4 py-1.5 text-center text-xs text-red-200 font-mono flex items-center justify-center gap-2 animate-bounce">
          <Lock className="w-3.5 h-3.5 text-red-400" />
          <span>{combatAlert}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-['Cinzel'] text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow">
            PIXEL QUEST
          </span>
          <span className="hidden sm:inline-block text-[11px] text-indigo-300/70 font-sans tracking-tight">
            Echoes of Fate
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const isBlockedByBattle = inBattle && item.id !== 'COMBATE';

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`
                  relative px-2.5 sm:px-3.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap flex items-center gap-1.5
                  ${isActive
                    ? 'bg-blue-600/90 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/80'
                    : isBlockedByBattle
                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent cursor-pointer'
                  }
                `}
              >
                {isBlockedByBattle && <Lock className="w-3 h-3 text-red-400/80" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Resources (Gold & Audio) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onNewCharacter && (
            <button
              onClick={onNewCharacter}
              title="Crear un nuevo aventurero (seleccionar clase y origen)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-amber-300 hover:text-white transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Nuevo Héroe</span>
            </button>
          )}

          <a
            href="/pixel-quest.zip"
            download="pixel-quest.zip"
            title="Descargar paquete completo del juego (.ZIP) con todos los modelos, fondos y recursos para VS Code"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-[11px] sm:text-xs font-bold font-mono transition-transform hover:scale-105 active:scale-95 shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar (.ZIP)</span>
            <span className="sm:hidden">.ZIP</span>
          </a>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-mono font-bold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{gold.toLocaleString()} G</span>
          </div>

          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Desactivar Audio' : 'Activar Audio'}
            className="p-1.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

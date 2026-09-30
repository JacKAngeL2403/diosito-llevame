import React, { useState } from 'react';
import { RetroWindow } from '../common/RetroWindow';
import { Item } from '../../types/game';
import { ALL_ITEMS } from '../../data/itemsData';
import { sound } from '../../services/soundService';
import { 
  Store, 
  Coins, 
  ShoppingCart, 
  ArrowRightLeft, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ShopScreenProps {
  gold: number;
  inventory: Item[];
  onBuyItem: (item: Item) => boolean;
  onSellItem: (item: Item) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  gold,
  inventory,
  onBuyItem,
  onSellItem,
}) => {
  const [shopMode, setShopMode] = useState<'BUY' | 'SELL'>('BUY');
  const [message, setMessage] = useState<string>('¡Bienvenido, noble aventurero! ¿Qué deseas comerciar hoy?');

  const shopCatalog = Object.values(ALL_ITEMS).filter((it) => it.type !== 'TREASURE');

  const handleBuy = (item: Item) => {
    if (gold < item.price) {
      sound.playCancel();
      setMessage(`¡No tienes suficiente oro para comprar ${item.name}! (Cuesta ${item.price} G)`);
      return;
    }
    const success = onBuyItem(item);
    if (success) {
      sound.playCoin();
      setMessage(`¡Has adquirido ${item.name} por ${item.price} G! Añadido a tu mochila.`);
    }
  };

  const handleSell = (item: Item) => {
    sound.playCoin();
    onSellItem(item);
    setMessage(`¡Has vendido ${item.name} por ${item.sellPrice} G!`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
      {/* Merchant Header (Centered) */}
      <RetroWindow title="TIENDA Y BAZAR DEL MERCADER ERRANTE" centerTitle className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-400/60 flex items-center justify-center shadow">
              <Store className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-300 font-mono">
                BAZAR DE VALORIA
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-md">
                {message}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playCursor();
                setShopMode('BUY');
              }}
              className={`
                px-4 py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer
                ${shopMode === 'BUY'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.6)] scale-105'
                  : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
                }
              `}
            >
              Comprar
            </button>
            <button
              onClick={() => {
                sound.playCursor();
                setShopMode('SELL');
              }}
              className={`
                px-4 py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer
                ${shopMode === 'SELL'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-105'
                  : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
                }
              `}
            >
              Vender ({inventory.length})
            </button>
          </div>
        </div>
      </RetroWindow>

      {/* Catalog Grid */}
      <RetroWindow 
        title={shopMode === 'BUY' ? 'CATÁLOGO DE PROVISIONES EN VENTA' : 'OBJETOS EN TU MOCHILA PARA VENDER'}
        centerTitle
        className="w-full"
      >
        {shopMode === 'BUY' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {shopCatalog.map((item) => {
              const canAfford = gold >= item.price;
              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/70 rounded-xl border border-white/10 hover:border-amber-400/50 flex flex-col justify-between gap-2.5 transition-all hover:scale-[1.02] shadow"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[140px] font-mono">
                        {item.name}
                      </span>
                      <span className="text-xs text-amber-300 font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
                        {item.price} G
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 font-sans">
                      {item.description}
                    </p>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                    className={`
                      w-full py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                      ${canAfford
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400 shadow hover:scale-105 active:scale-95'
                        : 'opacity-40 bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }
                    `}
                  >
                    Comprar ({item.price} G)
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {inventory.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-xs text-slate-400 font-mono">
                No tienes objetos para vender en este momento.
              </div>
            ) : (
              inventory.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-3 bg-slate-900/70 rounded-xl border border-white/10 hover:border-amber-400/50 flex flex-col justify-between gap-2.5 transition-all hover:scale-[1.02] shadow"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[140px] font-mono">
                        {item.name}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                        +{item.sellPrice} G
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 font-sans">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSell(item)}
                    className="w-full py-1.5 text-xs font-bold rounded-lg border bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black border-amber-400 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
                  >
                    Vender por {item.sellPrice} G
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </RetroWindow>
    </div>
  );
};

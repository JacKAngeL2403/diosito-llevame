import React from 'react';

interface RetroWindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  centerTitle?: boolean;
  glow?: boolean;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  children,
  className = '',
  title,
  centerTitle = true,
  glow = false,
}) => {
  return (
    <div
      className={`
        relative rounded-xl
        bg-gradient-to-b from-slate-900/95 via-[#0d1538]/95 to-slate-950/98
        border-2 border-amber-400/75
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_10px_35px_rgba(0,0,0,0.85)]
        ${glow ? 'shadow-[0_0_25px_rgba(245,158,11,0.4),inset_0_0_15px_rgba(59,130,246,0.2)]' : ''}
        text-white font-mono backdrop-blur-md
        p-3 sm:p-5
        ${className}
      `}
    >
      {/* Ornate Golden Corner Flourishes */}
      <span className="absolute -top-1.5 -left-1.5 text-amber-400 text-xs select-none pointer-events-none drop-shadow">✦</span>
      <span className="absolute -top-1.5 -right-1.5 text-amber-400 text-xs select-none pointer-events-none drop-shadow">✦</span>
      <span className="absolute -bottom-1.5 -left-1.5 text-amber-400 text-xs select-none pointer-events-none drop-shadow">✦</span>
      <span className="absolute -bottom-1.5 -right-1.5 text-amber-400 text-xs select-none pointer-events-none drop-shadow">✦</span>

      {title && (
        <div
          className={`
            absolute -top-3.5 px-3 py-0.5
            bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950
            border border-amber-400/80 rounded-full
            text-[10px] sm:text-xs font-bold text-amber-300 tracking-wider shadow-lg
            flex items-center gap-1.5 select-none
            ${centerTitle ? 'left-1/2 -translate-x-1/2' : 'left-4'}
          `}
        >
          <span className="text-amber-400 text-[9px]">◆</span>
          <span>{title}</span>
          <span className="text-amber-400 text-[9px]">◆</span>
        </div>
      )}
      {children}
    </div>
  );
};

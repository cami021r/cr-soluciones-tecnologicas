import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showSubtitle = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.2",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1",
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Isotipo con Escudo Tecnológico y Red de Nodos */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-all duration-300 transform group-hover:scale-105 flex-shrink-0`}
      >
        <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Brillo de fondo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          {/* SVG Vectorial del Isotipo C&R */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 relative z-10 text-cyan-400"
          >
            {/* Escudo protector exterior */}
            <path
              d="M20 4L32 9V18.5C32 26 26.8 32.8 20 36C13.2 32.8 8 26 8 18.5V9L20 4Z"
              stroke="url(#shield-gradient)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-cyan-300 transition-colors"
            />
            {/* Circuito interno / Nodos de Red y Enlace */}
            <circle cx="20" cy="18" r="3.2" fill="#38bdf8" />
            <circle cx="14" cy="24" r="2" fill="#818cf8" />
            <circle cx="26" cy="24" r="2" fill="#818cf8" />
            <path
              d="M20 18L14 24M20 18L26 24M20 11V14.8"
              stroke="#e0f2fe"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="shield-gradient" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#2563eb" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Logotipo Tipográfico */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} font-extrabold tracking-tight text-white leading-none`}
          >
            C<span className="text-cyan-400">&</span>R
          </span>
          <span
            className={`${titleSizes[size]} font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-100 to-blue-200 leading-none`}
          >
            Soluciones
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`${badgeSizes[size]} uppercase tracking-widest font-bold text-cyan-400/90 bg-cyan-950/60 border border-cyan-800/60 rounded-full font-mono`}
            >
              Tecnológicas
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium">
              • Redes & CCTV
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;

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
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Isotipo Vectorial con Nodo CYRS & Escudo en Gradiente Violeta-Cyan */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-tr from-violet-600 via-blue-500 to-cyan-400 p-[2px] shadow-md shadow-blue-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 transform group-hover:scale-105 flex-shrink-0`}
      >
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Fondo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-violet-50 opacity-80"></div>
          
          {/* Isotipo de Nodo de Red CYRS (3 Nodos Interconectados en Y) */}
          <svg
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 relative z-10"
          >
            <defs>
              <linearGradient id="cyrs-grad" x1="6" y1="38" x2="38" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="0.5" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {/* Líneas conectoras en Y */}
            <path
              d="M22 22V34M22 22L11 11M22 22L33 11"
              stroke="url(#cyrs-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Nodos circulares */}
            <circle cx="11" cy="11" r="4.5" fill="white" stroke="url(#cyrs-grad)" strokeWidth="3" />
            <circle cx="33" cy="11" r="4.5" fill="white" stroke="url(#cyrs-grad)" strokeWidth="3" />
            <circle cx="22" cy="34" r="4.5" fill="white" stroke="url(#cyrs-grad)" strokeWidth="3" />
            {/* Centro */}
            <circle cx="22" cy="22" r="2.5" fill="#3b82f6" />
          </svg>
        </div>
      </div>

      {/* Tipografía Corporativa en Tema Claro */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} font-extrabold tracking-tight text-slate-900 leading-none`}
          >
            C<span className="text-cyan-500">&</span>R
          </span>
          <span
            className={`${titleSizes[size]} font-bold tracking-tight text-slate-800 leading-none`}
          >
            Soluciones
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
              Tecnológicas
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-violet-600 tracking-wider">
              CYRS
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;

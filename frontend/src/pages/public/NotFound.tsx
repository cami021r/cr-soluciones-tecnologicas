import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="card-glass p-10 sm:p-14 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60 shadow-sm">
          <Search className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-blue-600 tracking-tight">404</span>
          <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            El enlace que ingresaste no existe o ha sido reubicado en la nueva arquitectura del portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary-gradient px-6 py-3 text-xs font-bold inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
          <Link
            to="/servicios"
            className="px-6 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
          >
            Ver Servicios
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

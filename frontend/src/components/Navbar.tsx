import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Bot, LogIn, UserPlus, LogOut, LayoutDashboard, Wrench } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isTecnico, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-300">
                C&R Soluciones
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                Tecnológicas
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              Inicio
            </Link>
            <a href="#servicios" className="hover:text-cyan-400 transition-colors">
              Servicios
            </a>
            <a href="#cotizador-demo" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-cyan-400">
              <Bot className="w-4 h-4" />
              Cotizador IA
            </a>
            <a href="#contacto" className="hover:text-cyan-400 transition-colors">
              Contacto
            </a>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Botón hacia Dashboard según rol */}
                {isAdmin || isTecnico ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/30 transition-all"
                  >
                    <Wrench className="w-4 h-4" />
                    Panel {isAdmin ? "Admin" : "Técnico"}
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold border border-blue-500/30 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mi Portal
                  </Link>
                )}

                {/* Perfil & Logout */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">
                    {user?.nombre} {user?.apellido}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {user?.rol?.nombre}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

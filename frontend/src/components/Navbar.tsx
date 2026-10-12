import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import {
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Wrench,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isTecnico, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Inicio", path: "/" },
    { label: "Servicios", path: "/servicios" },
    { label: "Misión & Visión", path: "/mision-vision" },
    { label: "Proyectos", path: "/proyectos" },
    { label: "Proveedores", path: "/proveedores" },
    { label: "Cotizador IA", path: "/cotizador", highlight: true },
    { label: "Contacto", path: "/contacto" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-blue-100/70 text-slate-800 shadow-sm shadow-blue-500/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-semibold text-slate-600">
            {navLinks.map((link) => {
              const active = isActive(link.path);

              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-bold ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                        : "bg-cyan-50/90 text-cyan-700 border border-cyan-200/90 hover:bg-cyan-100/90"
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${active ? "text-white" : "text-cyan-500 animate-pulse"}`} />
                    {link.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                    active
                      ? "text-blue-600 font-bold bg-blue-50/90 border border-blue-200/80 shadow-xs"
                      : "hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop User Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin || isTecnico ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Panel {isAdmin ? "Admin" : "Técnico"}</span>
                  </Link>
                ) : (
                  <Link
                    to="/panel"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mi Panel</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">
                    {user?.nombre}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all border border-transparent hover:border-blue-100"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Ingresar
                </Link>

                <Link
                  to="/registro"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-blue-100 shadow-xl px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-blue-50 text-blue-600 border border-blue-200/80"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-100 text-cyan-700 font-extrabold uppercase">
                      IA
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                {isAdmin || isTecnico ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                  >
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    Panel {isAdmin ? "Administrador" : "Técnico"}
                  </Link>
                ) : (
                  <Link
                    to="/panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    Mi Panel de Cliente
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión ({user?.nombre})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Ingresar
                </Link>

                <Link
                  to="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold btn-primary-gradient"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

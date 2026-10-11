import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  PhoneCall,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isTecnico, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "¿Qué Hacemos?", href: "#que-hacemos" },
    { label: "Misión & Visión", href: "#mision-vision" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Proveedores", href: "#proveedores" },
    { label: "Cotizador IA", href: "#cotizador-demo", highlight: true },
    { label: "Contáctanos", href: "#contacto" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
            {navLinks.map((link) =>
              link.highlight ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-cyan-400 transition-colors py-1"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* User Controls & Mobile Button */}
          <div className="flex items-center gap-3">
            {/* Botón rápido Contáctanos (Desktop) */}
            <a
              href="#contacto"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contáctanos</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Botón hacia Dashboard según rol */}
                {isAdmin || isTecnico ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/30 transition-all"
                  >
                    <Wrench className="w-4 h-4" />
                    <span className="hidden sm:inline">Panel</span> {isAdmin ? "Admin" : "Técnico"}
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold border border-blue-500/30 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mi Portal
                  </Link>
                )}

                {/* Perfil & Logout */}
                <div className="hidden md:flex flex-col text-right">
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
                  className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
                <Link
                  to="/registro"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                link.highlight
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-900 hover:text-cyan-400"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              Contáctanos Ahora
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

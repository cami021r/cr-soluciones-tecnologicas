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
    { label: "Inicio", href: "#", active: true },
    { label: "Servicios", href: "#que-hacemos" },
    { label: "Misión & Visión", href: "#mision-vision" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Proveedores", href: "#proveedores" },
    { label: "Cotizador IA", href: "#cotizador-demo", highlight: true },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 text-slate-800 shadow-sm shadow-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {navLinks.map((link) =>
              link.highlight ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200/80 hover:bg-cyan-100/80 transition-all font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    link.active
                      ? "text-sky-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-sky-500 after:rounded-full"
                      : "hover:text-sky-600"
                  }`}
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* User Controls & Mobile Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Botón hacia Dashboard según rol */}
                {isAdmin || isTecnico ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold border border-sky-200 transition-all"
                  >
                    <Wrench className="w-4 h-4 text-sky-600" />
                    <span className="hidden sm:inline">Panel</span> {isAdmin ? "Admin" : "Técnico"}
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold border border-sky-200 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-600" />
                    Mi Portal
                  </Link>
                )}

                {/* Perfil & Logout */}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">
                    {user?.nombre} {user?.apellido}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {user?.rol?.nombre}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/registro"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-sky-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                link.highlight
                  ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                  : "text-slate-700 hover:bg-slate-50 hover:text-sky-600"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
            >
              Contáctanos Ahora
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

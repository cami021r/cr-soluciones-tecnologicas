import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../../components/Logo";
import { BackgroundEffect } from "../../components/BackgroundEffect";
import {
  LayoutDashboard,
  Users,
  Box,
  LifeBuoy,
  BookOpen,
  DollarSign,
  FileCheck,
  LogOut,
  ShieldCheck,
  Wrench,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Ítems de navegación según el rol
  const navItems = [
    { label: "Consola de Control", path: "/admin", icon: LayoutDashboard },
    { label: "Clientes & Contacto", path: "/admin/clientes", icon: Users },
    { label: "Inventario & QR", path: "/admin/inventario", icon: Box },
    { label: "Mesa de Tickets", path: "/admin/tickets", icon: LifeBuoy, badge: "SLA" },
    ...(isAdmin
      ? [
          { label: "Finanzas & Caja", path: "/admin/finanzas", icon: DollarSign },
          { label: "Catálogo Comercial", path: "/admin/catalogo", icon: BookOpen },
          { label: "Todas las Cotizaciones", path: "/admin/cotizaciones", icon: FileCheck },
        ]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative bg-slate-50/50 text-slate-800">
      <BackgroundEffect />

      {/* Header móvil */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <Logo size="sm" />
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Abrir menú de administración"
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar de Administración (Tema Claro & Glass) */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-white/90 backdrop-blur-md border-r border-blue-100 flex flex-col justify-between shrink-0 shadow-sm transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Logo y Rol */}
          <div className="border-b border-slate-100 pb-5">
            <Logo size="md" />
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Wrench className="w-3.5 h-3.5 text-cyan-600" />
              )}
              <span>Panel {user?.rol?.nombre || "Técnico"}</span>
            </div>
          </div>

          {/* Menú de administración */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
              {user?.nombre?.charAt(0)}
              {user?.apellido?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {user?.nombre} {user?.apellido}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {user?.rol?.nombre}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal Admin */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 relative z-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

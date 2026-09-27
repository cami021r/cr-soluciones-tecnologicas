import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Box,
  BookOpen,
  LifeBuoy,
  DollarSign,
  FileCheck,
  Shield,
  LogOut,
  UserCheck,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Consola Central", path: "/admin", icon: LayoutDashboard },
    { label: "Inventario & QR", path: "/admin/inventario", icon: Box },
    { label: "Catálogo Comercial", path: "/admin/catalogo", icon: BookOpen },
    { label: "Mesa de Tickets", path: "/admin/tickets", icon: LifeBuoy },
    { label: "Finanzas & Reportes", path: "/admin/finanzas", icon: DollarSign },
    { label: "Cotizaciones", path: "/admin/cotizaciones", icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo y Rol */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">C&R Soluciones</span>
                <span className="text-[10px] text-cyan-400 block font-bold uppercase tracking-wider">
                  Panel {user?.rol?.nombre}
                </span>
              </div>
            </Link>
          </div>

          {/* Menú de administración */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {user?.nombre} {user?.apellido}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  {user?.rol?.nombre}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal Admin */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

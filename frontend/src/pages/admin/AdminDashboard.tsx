import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  LifeBuoy,
  FileCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEquipos: 0,
    ticketsAbiertos: 0,
    cotizacionesPendientes: 0,
    serviciosActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resEq, resTk, resQ, resServ] = await Promise.all([
          api.get("/inventario/"),
          api.get("/tickets/"),
          api.get("/cotizaciones/"),
          api.get("/catalogo/servicios"),
        ]);

        setStats({
          totalEquipos: resEq.data?.length || 0,
          ticketsAbiertos: resTk.data?.filter((t: any) => t.estado !== "cerrado").length || 0,
          cotizacionesPendientes: resQ.data?.filter((q: any) => q.estado === "pendiente").length || 0,
          serviciosActivos: resServ.data?.length || 0,
        });
      } catch (e) {
        console.error("Error al cargar KPIs admin:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando indicadores de gestión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Banner */}
      <div>
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
          Panel de Operaciones & Control Técnico
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Consola Central C&R
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Monitoreo en tiempo real del inventario físico, acuerdos de nivel de servicio (SLA), catálogo comercial y flujo de cotizaciones.
        </p>
      </div>

      {/* Tarjetas de Rendimiento (Paso 11.11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Inventario de Equipos</span>
            <span className="text-3xl font-extrabold text-white">{stats.totalEquipos}</span>
            <span className="text-[11px] text-cyan-400 block mt-1">Con QR y trazabilidad</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Tickets de Soporte</span>
            <span className="text-3xl font-extrabold text-amber-400">{stats.ticketsAbiertos}</span>
            <span className="text-[11px] text-amber-400/80 block mt-1">SLA activo en cola</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Cotizaciones en Curso</span>
            <span className="text-3xl font-extrabold text-emerald-400">{stats.cotizacionesPendientes}</span>
            <span className="text-[11px] text-emerald-400/80 block mt-1">Pendientes por cliente</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Servicios en Catálogo</span>
            <span className="text-3xl font-extrabold text-indigo-400">{stats.serviciosActivos}</span>
            <span className="text-[11px] text-indigo-400/80 block mt-1">Con preguntas para IA</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Accesos Rápidos para Administración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/inventario"
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Gestión de Inventario & QR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registra nuevos activos, descarga e imprime etiquetas QR y gestiona el estado de bodegas.
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            Abrir Inventario <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/tickets"
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Mesa de Control de Tickets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reasigna técnicos responsables, redacta bitácoras privadas y cierra órdenes liberando equipos.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            Gestionar Mesa <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/catalogo"
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Catálogo Comercial & IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ajusta tarifas de mano de obra, horas estimadas, proveedores externos y preguntas clave del bot.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            Ver Catálogo <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

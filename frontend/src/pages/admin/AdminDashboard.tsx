import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  LifeBuoy,
  FileCheck,
  ArrowRight,
  Users,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipos: 0,
    totalClientes: 0,
    ticketsAbiertos: 0,
    cotizacionesPendientes: 0,
    serviciosActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resEq, resTk, resQ, resServ, resCli] = await Promise.all([
          api.get("/inventario").catch(() => ({ data: [] })),
          api.get("/tickets/").catch(() => ({ data: [] })),
          api.get("/cotizaciones/").catch(() => ({ data: [] })),
          api.get("/catalogo/servicios").catch(() => ({ data: [] })),
          api.get("/clientes").catch(() => ({ data: [] })),
        ]);

        const eqData = resEq.data;
        const totalEq = Array.isArray(eqData) ? eqData.length : eqData?.total || 0;

        setStats({
          totalEquipos: totalEq,
          totalClientes: (resCli.data || []).length,
          ticketsAbiertos: (resTk.data || []).filter((t: any) => t.estado !== "cerrado").length,
          cotizacionesPendientes: (resQ.data || []).filter((q: any) => q.estado === "pendiente").length,
          serviciosActivos: (resServ.data || []).length,
        });
      } catch (e) {
        console.error("Error al cargar KPIs admin:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Banner Principal en Tema Claro Glass */}
      <div className="card-glass p-6 sm:p-8 border border-blue-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold border border-blue-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Consola de Operaciones & Control Técnico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido al Panel, {user?.nombre} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Supervisa el estado del inventario de activos, acuerdos de servicio (SLA), directorio de clientes y cola de tickets en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/admin/tickets"
            className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Mesa de Tickets</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas KPI de Rendimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Inventario de Equipos
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "-" : stats.totalEquipos}
            </div>
            <span className="text-[11px] text-blue-600 font-medium block mt-1">
              Con código QR y trazabilidad
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Directorio de Clientes
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "-" : stats.totalClientes}
            </div>
            <span className="text-[11px] text-purple-600 font-medium block mt-1">
              Empresas y personas registradas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Tickets Activos
            </span>
            <div className="text-3xl font-extrabold text-amber-600">
              {loading ? "-" : stats.ticketsAbiertos}
            </div>
            <span className="text-[11px] text-amber-600/80 font-medium block mt-1">
              Atención bajo SLA en laboratorio
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Presupuestos en Curso
            </span>
            <div className="text-3xl font-extrabold text-emerald-600">
              {loading ? "-" : stats.cotizacionesPendientes}
            </div>
            <span className="text-[11px] text-emerald-600/80 font-medium block mt-1">
              Cotizaciones generadas con IA
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Accesos Rápidos para Administración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/clientes"
          className="card-glass p-6 border border-blue-100 flex flex-col justify-between group hover:border-blue-300 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Directorio de Clientes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consulta fichas de clientes, historial de presupuestos, equipos comprados/arrendados y contacto telefónico.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Ver Clientes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/inventario"
          className="card-glass p-6 border border-blue-100 flex flex-col justify-between group hover:border-blue-300 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-xs">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Inventario Segmentado & QR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipos de la empresa vs asignados por cliente en venta o arriendo. Descarga e imprime códigos QR de trazabilidad.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Abrir Inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/tickets"
          className="card-glass p-6 border border-blue-100 flex flex-col justify-between group hover:border-blue-300 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100 shadow-xs">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Mesa de Control de Tickets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conversación bidireccional en vivo con clientes, llamadas directas, visitas programadas y bitácora técnica privada.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Atender Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Laptop,
  FileText,
  LifeBuoy,
  Bot,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import type { Quote, Ticket } from "../../types";

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resQuotes, resTickets] = await Promise.all([
          api.get<Quote[]>("/cotizaciones/"),
          api.get<Ticket[]>("/tickets/"),
        ]);
        setQuotes(resQuotes.data || []);
        setTickets(resTickets.data || []);
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cotizacionesPendientes = quotes.filter((q) => q.estado === "pendiente");
  const ticketsAbiertos = tickets.filter((t) => t.estado === "abierto" || t.estado === "en_proceso");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner de Bienvenida */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
            Panel de Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bienvenido, {user?.nombre} 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md">
            Gestiona tus presupuestos tecnológicos, trazabilidad de equipos asignados y estado de incidentes técnicos.
          </p>
        </div>

        <Link
          to="/portal/cotizador"
          className="px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-xs sm:text-sm transition-all"
        >
          <Bot className="w-4 h-4" />
          Nueva Cotización con IA
        </Link>
      </div>

      {/* Tarjetas KPI (Paso 11.6) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Cotizaciones Pendientes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Cotizaciones Pendientes</span>
            <span className="text-3xl font-extrabold text-amber-400">{cotizacionesPendientes.length}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Por aprobar o revisar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Tickets Abiertos */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Tickets en Atención</span>
            <span className="text-3xl font-extrabold text-cyan-400">{ticketsAbiertos.length}</span>
            <span className="text-[11px] text-slate-500 block mt-1">SLA activo en laboratorio</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        {/* Equipos Vinculados */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Equipos en Renta / Custodia</span>
            <span className="text-3xl font-extrabold text-emerald-400">Activo</span>
            <span className="text-[11px] text-slate-500 block mt-1">Con código QR y garantía</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Laptop className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tablas Rápidas de Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cotizaciones Recientes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Cotizaciones Recientes
              </h3>
              <Link to="/portal/cotizaciones" className="text-xs text-cyan-400 hover:underline">
                Ver todas ➔
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-slate-500 py-6 text-center">Cargando cotizaciones...</div>
            ) : quotes.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center bg-slate-950 rounded-xl border border-slate-800/60">
                No tienes cotizaciones registradas aún. ¡Usa nuestro cotizador con IA!
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">Cotización #{q.id}</span>
                      <span className="text-[11px] text-slate-500">
                        Total: ${Number(q.total).toLocaleString()} COP
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        q.estado === "aceptada"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : q.estado === "pendiente"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {q.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tickets Recientes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-cyan-400" />
                Tickets de Soporte
              </h3>
              <Link to="/portal/tickets" className="text-xs text-cyan-400 hover:underline">
                Ver mesa de ayuda ➔
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-slate-500 py-6 text-center">Cargando tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center bg-slate-950 rounded-xl border border-slate-800/60">
                No tienes solicitudes de soporte abiertas actualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block truncate max-w-[200px]">
                        #{t.id} - {t.titulo}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        SLA: {t.sla_limite_horas}h | Prioridad: {t.prioridad}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        t.estado === "cerrado" || t.estado === "resuelto"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {t.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Sparkles,
  FileText,
  LifeBuoy,
  Box,
  User,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";
import type { Quote, Ticket } from "../../types";

export const PanelDashboard: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resQuotes, resTickets] = await Promise.all([
          api.get<Quote[]>("/cotizaciones/").catch(() => ({ data: [] })),
          api.get<Ticket[]>("/tickets/").catch(() => ({ data: [] })),
        ]);
        setQuotes(resQuotes.data || []);
        setTickets(resTickets.data || []);
      } catch (e) {
        console.error("Error al cargar datos del panel:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cotizacionesPendientes = quotes.filter((q) => q.estado === "pendiente");
  const ticketsActivos = tickets.filter((t) => t.estado === "abierto" || t.estado === "en_proceso");
  const ultimasCotizaciones = quotes.slice(0, 4);

  const getBadgeClase = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pendiente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rechazada":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ajuste_solicitado":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Banner Principal de Bienvenida */}
      <div className="card-glass p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/30 border border-blue-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold border border-blue-200/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Área de Cliente Corporativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido, {user?.nombre} 👋
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Gestiona tus presupuestos tecnológicos con IA, revisa el estado de tus cotizaciones,
              garantías de infraestructura y tickets de soporte técnico en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/cotizador"
              className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Cotizador con IA</span>
            </Link>
            <Link
              to="/panel/cotizaciones"
              className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Mis Cotizaciones</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Cotizaciones Pendientes
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "-" : cotizacionesPendientes.length}
            </div>
            <span className="text-[11px] text-amber-600 font-medium block mt-1">
              Listas para aprobación o descarga PDF
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Tickets en Proceso
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "-" : ticketsActivos.length}
            </div>
            <span className="text-[11px] text-blue-600 font-medium block mt-1">
              Atención técnica y laboratorio activa
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Equipos & Garantías
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              Activo
            </div>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              Trazabilidad física con código QR
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <Box className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Cotizaciones Recientes y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cotizaciones Recientes (2 Columnas) */}
        <div className="lg:col-span-2 card-glass p-6 border border-blue-100 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Presupuestos Recientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historial de cotizaciones generadas con el asesor inteligente
              </p>
            </div>
            <Link
              to="/panel/cotizaciones"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Cargando cotizaciones...
            </div>
          ) : ultimasCotizaciones.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                Aún no tienes cotizaciones registradas
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Utiliza nuestro Cotizador IA para estimar cableado, cámaras de seguridad o soporte técnico en segundos.
              </p>
              <Link
                to="/cotizador"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar primera cotización</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasCotizaciones.map((cot) => (
                <div
                  key={cot.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        Cotización #{cot.id}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getBadgeClase(
                          cot.estado
                        )}`}
                      >
                        {cot.estado.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Fecha: {new Date(cot.creado_en).toLocaleDateString("es-CO")} • Items:{" "}
                      {cot.items?.length || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Total</span>
                      <span className="text-sm font-extrabold text-blue-700">
                        ${Number(cot.total).toLocaleString()} COP
                      </span>
                    </div>
                    <Link
                      to="/panel/cotizaciones"
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ver detalle"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Accesos Directos & Ayuda */}
        <div className="space-y-6">
          {/* Tarjeta de Accesos Directos */}
          <div className="card-glass p-6 border border-blue-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Accesos Rápidos
            </h3>
            <div className="space-y-2">
              <Link
                to="/cotizador"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-100/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Cotizador IA
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Presupuestos instantáneos
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/panel/tickets"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Soporte & Tickets
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Reportar incidente técnico
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/panel/perfil"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Mi Perfil
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Datos de cuenta y empresa
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Soporte Técnico Directo */}
          <div className="card-glass p-6 border border-blue-100 space-y-3 bg-gradient-to-br from-white to-blue-50/50">
            <div className="flex items-center gap-2 text-blue-700">
              <PhoneCall className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Mesa de Ayuda C&R
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Tienes una urgencia de red o falla crítica en cámaras? Contáctanos de inmediato.
            </p>
            <div className="pt-2 border-t border-blue-100/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Teléfono:</span>
                <a href="tel:+573155823122" className="font-bold text-blue-700 hover:underline">
                  +57 315 582 3122
                </a>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>WhatsApp:</span>
                <a
                  href="https://wa.me/573155823122"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Chat Inmediato
                </a>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Horario:</span>
                <span className="font-medium text-slate-700">Lun - Sáb, 7am - 6pm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelDashboard;

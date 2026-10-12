import React, { useEffect, useState } from "react";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Shield,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Ticket } from "../../types";

export const PanelTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario nuevo ticket
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState<"baja" | "media" | "alta">("media");
  const [creando, setCreando] = useState(false);

  // Nuevo comentario en conversación
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets/");
      setTickets(res.data || []);
      if (selectedTicket) {
        const actualizado = (res.data || []).find((t: Ticket) => t.id === selectedTicket.id);
        if (actualizado) setSelectedTicket(actualizado);
      }
    } catch (e) {
      console.error("Error al cargar tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevaDescripcion.trim()) return;

    setCreando(true);
    try {
      await api.post("/tickets/", {
        titulo: nuevoTitulo.trim(),
        descripcion: nuevaDescripcion.trim(),
        prioridad: nuevaPrioridad,
      });
      setNuevoTitulo("");
      setNuevaDescripcion("");
      setShowCreateModal(false);
      await fetchTickets();
    } catch (e) {
      alert("Error al reportar el incidente técnico. Intenta nuevamente.");
    } finally {
      setCreando(false);
    }
  };

  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !nuevoComentario.trim() || enviandoComentario) return;

    setEnviandoComentario(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/comentarios`, {
        contenido: nuevoComentario.trim(),
        es_interno: false,
      });
      setNuevoComentario("");
      await fetchTickets();
    } catch (e) {
      alert("Error al enviar respuesta al ticket.");
    } finally {
      setEnviandoComentario(false);
    }
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "abierto":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "en_proceso":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "resuelto":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cerrado":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Soporte Técnico & Mesa de Ayuda
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Reporta incidentes de red, fallas en cámaras o solicita soporte a nuestros ingenieros certificados.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Incidente</span>
        </button>
      </div>

      {/* Grid de Tickets y Conversación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Tickets (5 columnas) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            Mis Solicitudes ({tickets.length})
          </h2>

          {loading ? (
            <div className="card-glass p-8 text-center text-xs text-slate-500 border border-blue-100">
              Cargando historial de tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="card-glass p-12 text-center space-y-3 border border-blue-100">
              <LifeBuoy className="w-10 h-10 text-blue-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">No tienes incidentes reportados</p>
              <p className="text-[11px] text-slate-500">
                Todo tu sistema e infraestructura funcionan con normalidad.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`card-glass p-4 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-md ring-1 ring-blue-400"
                        : "border-blue-100/80 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        Ticket #{t.id}: {t.titulo}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border shrink-0 ${getBadgeEstado(
                          t.estado
                        )}`}
                      >
                        {t.estado.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {t.descripcion}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{new Date(t.creado_en).toLocaleDateString("es-CO")}</span>
                      <span className="font-semibold text-blue-600">
                        {t.comentarios?.length || 0} respuestas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel de Conversación / Detalle (7 columnas) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="card-glass border border-blue-100 flex flex-col h-[600px] overflow-hidden shadow-sm">
              {/* Encabezado del ticket seleccionado */}
              <div className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      Ticket #{selectedTicket.id} • SLA: {selectedTicket.sla_limite_horas}h
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {selectedTicket.titulo}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${getBadgeEstado(
                      selectedTicket.estado
                    )}`}
                  >
                    {selectedTicket.estado.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  {selectedTicket.descripcion}
                </p>

                {selectedTicket.tecnico_nombre && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Técnico asignado: {selectedTicket.tecnico_nombre}</span>
                  </p>
                )}
              </div>

              {/* Hilo de Conversación / Respuestas */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                {(!selectedTicket.comentarios || selectedTicket.comentarios.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No hay mensajes aún. Escribe a continuación para comunicarte con el equipo técnico.
                  </div>
                ) : (
                  selectedTicket.comentarios.map((c) => {
                    const esMio = c.usuario_id === user?.id;
                    return (
                      <div
                        key={c.id}
                        className={`flex ${esMio ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                            esMio
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 mb-1 font-semibold">
                            <span>{c.usuario_nombre || (esMio ? "Tú" : "Soporte C&R")}</span>
                            <span>{new Date(c.creado_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="whitespace-pre-line">{c.contenido}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Caja para responder al ticket */}
              <form
                onSubmit={handleEnviarComentario}
                className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escribe una respuesta o consulta al técnico..."
                  className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={enviandoComentario || !nuevoComentario.trim()}
                  className="btn-primary-gradient px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="card-glass border border-blue-100 h-[600px] flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <LifeBuoy className="w-12 h-12 text-blue-400 opacity-60" />
              <h4 className="text-sm font-bold text-slate-800">
                Selecciona un ticket para ver la conversación
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Podrás dialogar en tiempo real con el técnico asignado, solicitar avances o adjuntar detalles del incidente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Incidente */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-lg w-full p-6 sm:p-8 space-y-5 bg-white border border-blue-200 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Reportar Nuevo Incidente Técnico
              </h3>
              <p className="text-xs text-slate-500">
                Un ingeniero especializado atenderá tu solicitud bajo acuerdos de nivel de servicio (SLA).
              </p>
            </div>

            <form onSubmit={handleCrearTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Incidente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Punto de red sala de juntas sin señal de internet"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={nuevaPrioridad}
                  onChange={(e: any) => setNuevaPrioridad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="baja">Baja (Consulta general o preventiva)</option>
                  <option value="media">Media (Falla parcial sin detener operación)</option>
                  <option value="alta">Alta (Caída total de red, CCTV o servidor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe qué ocurrió, desde cuándo y qué equipos están afectados..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creando}
                  className="btn-primary-gradient px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <span>{creando ? "Creando..." : "Crear Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelTickets;

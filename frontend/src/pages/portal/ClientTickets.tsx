import React, { useEffect, useState } from "react";
import { LifeBuoy, Plus, MessageSquare, Send, Clock, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import type { Ticket, Equipment } from "../../types";

export const ClientTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo ticket
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"baja" | "media" | "alta">("media");
  const [newEquipmentId, setNewEquipmentId] = useState<number | "">("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Formulario nuevo comentario
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const [resT, resE] = await Promise.all([
        api.get<Ticket[]>("/tickets/"),
        api.get<Equipment[]>("/inventario/"),
      ]);
      setTickets(resT.data || []);
      setEquipments(resE.data || []);

      if (selectedTicket) {
        const updated = resT.data?.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setSubmitLoading(true);
    try {
      await api.post("/tickets/", {
        titulo: newTitle.trim(),
        descripcion: newDesc.trim(),
        prioridad: newPriority,
        equipo_id: newEquipmentId ? Number(newEquipmentId) : null,
      });

      setShowNewModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewEquipmentId("");
      await fetchTickets();
    } catch (e) {
      alert("Error al reportar el ticket de soporte.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTicket || commentLoading) return;

    setCommentLoading(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/comentarios`, {
        contenido: commentInput.trim(),
        es_interno: false,
      });

      setCommentInput("");
      // Recargar ticket seleccionado
      const res = await api.get<Ticket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTickets();
    } catch (e) {
      alert("Error al enviar el comentario.");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mesa de Ayuda & Soporte</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reporta incidentes de hardware, fallas de red o solicita asistencia técnica con control de SLA.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Reportar Nueva Falla
        </button>
      </div>

      {/* Grid: Lista de tickets vs Hilo de comentarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Listado de tickets */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tus Solicitudes ({tickets.length})
          </span>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Cargando tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              No tienes tickets activos. Si presentas algún fallo, repórtalo con el botón superior.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTicket?.id === t.id
                    ? "bg-slate-800 border-cyan-500 shadow-md"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    #{t.id} - {t.titulo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      t.estado === "cerrado" || t.estado === "resuelto"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    }`}
                  >
                    {t.estado}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{t.descripcion}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    SLA: {t.sla_limite_horas}h
                  </span>
                  <span className="capitalize">Prioridad {t.prioridad}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Columna Derecha: Detalle e Hilo de Comentarios (Paso 11.10) */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col h-[650px] shadow-xl">
              {/* Encabezado del ticket */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-cyan-400" />
                    Ticket #{selectedTicket.id}: {selectedTicket.titulo}
                  </h3>
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-semibold uppercase">
                    {selectedTicket.estado}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedTicket.descripcion}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                  <span>Reportado: {new Date(selectedTicket.creado_en).toLocaleString()}</span>
                  <span>•</span>
                  <span>Prioridad: <strong className="text-white capitalize">{selectedTicket.prioridad}</strong></span>
                  {selectedTicket.tecnico_nombre && (
                    <>
                      <span>•</span>
                      <span>Técnico asignado: <strong className="text-cyan-400">{selectedTicket.tecnico_nombre}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Hilo de Seguimiento y Comentarios */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Historial de Comunicación y Avances:
                </span>

                {selectedTicket.comentarios && selectedTicket.comentarios.length > 0 ? (
                  selectedTicket.comentarios.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        c.usuario_rol === "Cliente"
                          ? "bg-cyan-950/40 border border-cyan-500/20 ml-6 text-slate-200"
                          : "bg-slate-950 border border-slate-800 mr-6 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <strong className={c.usuario_rol === "Cliente" ? "text-cyan-400" : "text-emerald-400"}>
                          {c.usuario_nombre} ({c.usuario_rol})
                        </strong>
                        <span>{new Date(c.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{c.contenido}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 text-center py-10">
                    Aún no hay comentarios adicionales. El equipo técnico te actualizará pronto.
                  </div>
                )}
              </div>

              {/* Input para agregar comentario al hilo */}
              <form onSubmit={handleSendComment} className="pt-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Escribe una actualización o respuesta para el equipo técnico..."
                  className="flex-1 bg-slate-950 text-white text-xs px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentInput.trim()}
                  className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Selecciona una solicitud</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Haz clic en cualquiera de los tickets a la izquierda para ver los avances y comunicarte con el soporte.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Ticket */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyan-400" />
              Reportar Falla o Incidente
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título del incidente *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Cámara no transmite video en el rack 2"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Equipo afectado (opcional)</label>
                <select
                  value={newEquipmentId}
                  onChange={(e) => setNewEquipmentId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Ninguno / Falla general de red</option>
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      #{eq.id} - {eq.marca} {eq.modelo} (S/N: {eq.numero_serie})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nivel de Prioridad *</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="alta">Alta (SLA urgente: 8 horas)</option>
                  <option value="media">Media (SLA estándar: 24 horas)</option>
                  <option value="baja">Baja (SLA programado: 48 horas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción detallada del fallo *</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explica qué síntomas presenta, luces apagadas, mensajes de error..."
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  {submitLoading ? "Registrando..." : "Crear Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTickets;

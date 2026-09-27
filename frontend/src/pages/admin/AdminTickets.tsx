import React, { useEffect, useState } from "react";
import { LifeBuoy, Clock, UserCheck, CheckCircle2, Send } from "lucide-react";
import api from "../../services/api";
import type { Ticket, User } from "../../types";

export const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Comentarios / Bitácora
  const [commentInput, setCommentInput] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // Cierre de ticket
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeDiagnostic, setCloseDiagnostic] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  const fetchTicketsData = async () => {
    try {
      const [resT, resU] = await Promise.all([
        api.get<Ticket[]>("/tickets/"),
        api.get<User[]>("/usuarios/"),
      ]);
      setTickets(resT.data || []);
      // Filtrar usuarios que sean técnicos o administradores
      const techs = (resU.data || []).filter(
        (u) => u.rol.nombre === "Técnico" || u.rol.nombre === "Administrador"
      );
      setTechnicians(techs);

      if (selectedTicket) {
        const updated = resT.data?.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      console.error("Error al cargar mesa de tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const handleAssignTechnician = async (ticketId: number, tecnicoId: number) => {
    try {
      await api.patch(`/tickets/${ticketId}/asignar?tecnico_id=${tecnicoId}`);
      await fetchTicketsData();
      if (selectedTicket?.id === ticketId) {
        const res = await api.get<Ticket>(`/tickets/${ticketId}`);
        setSelectedTicket(res.data);
      }
    } catch (e) {
      alert("Error al asignar técnico");
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTicket || commentLoading) return;

    setCommentLoading(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/comentarios`, {
        contenido: commentInput.trim(),
        es_interno: isInternalComment,
      });

      setCommentInput("");
      const res = await api.get<Ticket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTicketsData();
    } catch (e) {
      alert("Error al agregar nota/comentario");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!closeDiagnostic.trim() || !selectedTicket || closeLoading) return;

    setCloseLoading(true);
    try {
      await api.patch(
        `/tickets/${selectedTicket.id}/cerrar?diagnostico_final=${encodeURIComponent(closeDiagnostic.trim())}`
      );
      setShowCloseModal(false);
      setCloseDiagnostic("");
      const res = await api.get<Ticket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTicketsData();
    } catch (e) {
      alert("Error al cerrar el ticket");
    } finally {
      setCloseLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Mesa de Control de Tickets (SLA)</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Asignación técnica por criticidad de SLA, registro de bitácoras de laboratorio y liberación automática de activos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Cola de atención */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cola de Atención Ordenada ({tickets.length})
          </span>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Cargando cola...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              No hay tickets pendientes en el sistema.
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
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    #{t.id} - {t.titulo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.prioridad === "alta"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : t.prioridad === "media"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.prioridad}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Clock className="w-3 h-3" /> SLA {t.sla_limite_horas}h
                  </span>
                  <span className="uppercase text-[10px] text-slate-500 font-bold">{t.estado}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Columna 2: Ficha de Control y Bitácora (Paso 11.14) */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col h-[700px] shadow-xl">
              {/* Encabezado */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white">
                    Ticket #{selectedTicket.id}: {selectedTicket.titulo}
                  </h3>
                  {selectedTicket.estado !== "cerrado" && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Cerrar & Liberar Equipo
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedTicket.descripcion}
                </p>

                {/* Asignación Técnica con Selector Visual */}
                <div className="mt-3 flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <UserCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400">Técnico Asignado:</span>
                  <select
                    value={selectedTicket.tecnico_id || ""}
                    onChange={(e) => handleAssignTechnician(selectedTicket.id, Number(e.target.value))}
                    className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="">Sin Asignar</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} {t.apellido} ({t.rol.nombre})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hilo de Bitácora */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Bitácora Interna & Historial de Auditoría:
                </span>

                {selectedTicket.comentarios?.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      c.es_interno
                        ? "bg-purple-950/20 border border-purple-500/30 text-purple-200"
                        : "bg-slate-950 border border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className={c.es_interno ? "text-purple-400" : "text-cyan-400"}>
                        {c.usuario_nombre} {c.es_interno ? "[BITÁCORA TÉCNICA PRIVADA]" : "[VISIBLE AL CLIENTE]"}
                      </strong>
                      <span className="text-slate-500">{new Date(c.creado_en).toLocaleString()}</span>
                    </div>
                    <p className="leading-relaxed">{c.contenido}</p>
                  </div>
                ))}
              </div>

              {/* Input para agregar avance */}
              {selectedTicket.estado !== "cerrado" ? (
                <form onSubmit={handleSendComment} className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Bitácora Interna Privada (Oculta al cliente)</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Registrar avance técnico o diagnóstico..."
                      className="flex-1 bg-slate-950 text-white text-xs px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={commentLoading || !commentInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
                  Este ticket se encuentra cerrado oficialmente. El expediente está archivado.
                </div>
              )}
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
              <LifeBuoy className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Selecciona un ticket</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Selecciona una solicitud en la cola para asignar técnicos o registrar bitácoras.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cierre Oficial */}
      {showCloseModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Cierre Oficial del Ticket #{selectedTicket.id}
            </h3>
            <p className="text-xs text-slate-400">
              Ingresa el diagnóstico final y resolución. Si el ticket estaba asociado a un equipo, este volverá al estado <strong>'disponible'</strong> en el inventario.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Diagnóstico Final *</label>
              <textarea
                rows={3}
                required
                value={closeDiagnostic}
                onChange={(e) => setCloseDiagnostic(e.target.value)}
                placeholder="Ej. Cambio de transceiver SFP y prueba de tasa de bits con éxito."
                className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseTicket}
                disabled={closeLoading || !closeDiagnostic.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                {closeLoading ? "Cerrando..." : "Confirmar Cierre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;

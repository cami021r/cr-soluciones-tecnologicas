import React, { useEffect, useState, useRef } from "react";
import {
  LifeBuoy,
  UserCheck,
  CheckCircle2,
  Send,
  Phone,
  MessageCircle,
  Mail,
  Search,
  Lock,
  MessageSquare,
  RefreshCw,
  Save,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Ticket, User } from "../../types";

interface ExtendedTicket extends Ticket {
  cliente_nombre?: string | null;
  cliente_email?: string | null;
  cliente_telefono?: string | null;
  cliente_empresa?: string | null;
  categoria?: "software" | "hardware" | "red" | "cctv" | string;
  modalidad?: "remota" | "presencial" | string;
  fecha_visita?: string | null;
}

export const AdminTickets: React.FC = () => {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [clientesList, setClientesList] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTechnician, setFilterTechnician] = useState("");
  const [filterClient, setFilterClient] = useState("");

  // Pestaña activa del hilo: "chat" (con cliente) o "bitacora" (privada interna)
  const [chatTab, setChatTab] = useState<"chat" | "bitacora">("chat");

  // Input de mensajes
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isInternal, setIsInternal] = useState(false); // Por defecto False: MENSAJE VISIBLE AL CLIENTE

  // Clasificación y Visita técnica
  const [categoriaTicket, setCategoriaTicket] = useState("red");
  const [modalidadTicket, setModalidadTicket] = useState("remota");
  const [fechaVisita, setFechaVisita] = useState("");
  const [guardandoClasificacion, setGuardandoClasificacion] = useState(false);

  // Cierre de ticket
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeDiagnostic, setCloseDiagnostic] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketsData = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const [resT, resU, resC] = await Promise.all([
        api.get<ExtendedTicket[]>("/tickets/", {
          params: {
            estado: filterState || undefined,
            prioridad: filterPriority || undefined,
            categoria: filterCategory || undefined,
            tecnico_id: filterTechnician ? Number(filterTechnician) : undefined,
            cliente_id: filterClient ? Number(filterClient) : undefined,
            buscar: searchTerm || undefined,
          },
        }),
        api.get<User[]>("/usuarios/").catch(() => ({ data: [] })),
        api.get<any[]>("/clientes").catch(() => ({ data: [] })),
      ]);

      setTickets(resT.data || []);
      const techs = (resU.data || []).filter(
        (u) => u.rol.nombre === "Técnico" || u.rol.nombre === "Administrador"
      );
      setTechnicians(techs);
      setClientesList(
        (resC.data || []).map((c: any) => ({
          id: c.id,
          nombre: c.nombre_empresa ? `${c.nombre_empresa} (${c.nombre_completo})` : c.nombre_completo,
        }))
      );

      // Si hay un ticket seleccionado, refrescar sus comentarios en vivo
      if (selectedTicket) {
        const actualizado = (resT.data || []).find((t) => t.id === selectedTicket.id);
        if (actualizado) {
          // Si tiene más comentarios o cambió de estado, actualizar
          setSelectedTicket((prev) => (prev ? { ...prev, ...actualizado } : actualizado));
        }
      }
    } catch (e) {
      console.error("Error al cargar mesa de tickets:", e);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
  }, [filterState, filterPriority, filterCategory, filterTechnician, filterClient, searchTerm]);

  // Actualización automática cada 4 segundos (conversación bidireccional en vivo)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTicketsData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  useEffect(() => {
    if (selectedTicket) {
      setCategoriaTicket(selectedTicket.categoria || "red");
      setModalidadTicket(selectedTicket.modalidad || "remota");
      setFechaVisita(selectedTicket.fecha_visita ? selectedTicket.fecha_visita.substring(0, 16) : "");
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.comentarios, chatTab]);

  const handleSelectTicket = async (t: ExtendedTicket) => {
    try {
      const res = await api.get<ExtendedTicket>(`/tickets/${t.id}`);
      setSelectedTicket(res.data);
    } catch (e) {
      setSelectedTicket(t);
    }
  };

  const handleAssignTechnician = async (tecnicoId: string) => {
    if (!selectedTicket) return;
    try {
      const idNum = Number(tecnicoId);
      await api.patch(`/tickets/${selectedTicket.id}/asignar?tecnico_id=${idNum}`);
      const res = await api.get<ExtendedTicket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTicketsData(true);
    } catch (e) {
      alert("Error al asignar técnico.");
    }
  };

  const handleSaveClassification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setGuardandoClasificacion(true);
    try {
      const res = await api.patch(`/tickets/${selectedTicket.id}`, {
        categoria: categoriaTicket,
        modalidad: modalidadTicket,
        fecha_visita: modalidadTicket === "presencial" && fechaVisita ? fechaVisita : null,
      });
      setSelectedTicket(res.data);
      alert("Clasificación del ticket y programación de visita actualizadas.");
      await fetchTicketsData(true);
    } catch (e) {
      alert("Error al guardar clasificación del ticket.");
    } finally {
      setGuardandoClasificacion(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedTicket || sendingMessage) return;

    setSendingMessage(true);
    try {
      // isInternal determina si es mensaje público o bitácora privada
      await api.post(`/tickets/${selectedTicket.id}/comentarios`, {
        contenido: messageInput.trim(),
        es_interno: chatTab === "bitacora" ? true : isInternal,
      });

      setMessageInput("");
      const res = await api.get<ExtendedTicket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTicketsData(true);
    } catch (e) {
      alert("Error al enviar mensaje.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!closeDiagnostic.trim() || !selectedTicket || closeLoading) return;

    setCloseLoading(true);
    try {
      await api.patch(
        `/tickets/${selectedTicket.id}/cerrar?diagnostico_final=${encodeURIComponent(
          closeDiagnostic.trim()
        )}`
      );
      setShowCloseModal(false);
      setCloseDiagnostic("");
      const res = await api.get<ExtendedTicket>(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      await fetchTicketsData(true);
    } catch (e) {
      alert("Error al cerrar el ticket.");
    } finally {
      setCloseLoading(false);
    }
  };

  const cleanPhoneForWhatsApp = (phone?: string | null) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("57")) return digits;
    if (digits.length === 10) return `57${digits}`;
    return digits;
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

  const getBadgePrioridad = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-rose-50 text-rose-700 border-rose-200 font-extrabold";
      case "media":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Filtrar comentarios según pestaña seleccionada
  const comentariosCliente = (selectedTicket?.comentarios || []).filter((c) => !c.es_interno);
  const comentariosBitacora = (selectedTicket?.comentarios || []).filter((c) => c.es_interno);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Centro de Control de Incidentes & SLA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mesa de Ayuda & Soporte Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Supervisión de tickets en dos sentidos, contacto telefónico directo, agendamiento de visitas y bitácora técnica.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="card-glass p-4 border border-blue-100 flex flex-wrap items-center gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filtro Estado */}
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los Estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En Proceso</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>

        {/* Filtro Prioridad */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las Prioridades</option>
          <option value="alta">Alta (SLA 8h)</option>
          <option value="media">Media (SLA 24h)</option>
          <option value="baja">Baja (SLA 48h)</option>
        </select>

        {/* Filtro Categoría */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las Categorías</option>
          <option value="red">Redes & Cableado</option>
          <option value="cctv">CCTV & Cámaras</option>
          <option value="hardware">Hardware & Servidores</option>
          <option value="software">Software & Soporte</option>
        </select>

        {/* Filtro Técnico */}
        <select
          value={filterTechnician}
          onChange={(e) => setFilterTechnician(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los Técnicos</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} {t.apellido}
            </option>
          ))}
        </select>

        {/* Filtro Cliente */}
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 max-w-[180px]"
        >
          <option value="">Todos los Clientes</option>
          {clientesList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Grid Principal: Cola de Tickets & Panel de Atención */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Cola de Tickets (5 columnas) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Cola de Tickets ({tickets.length})
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              Sincronización activa
            </span>
          </div>

          {loading ? (
            <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100">
              Cargando mesa de tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100 space-y-2">
              <LifeBuoy className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="font-semibold text-slate-800">No hay tickets pendientes con estos filtros</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`card-glass p-4 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-md ring-1 ring-blue-400"
                        : "border-blue-100/80 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold text-slate-900 line-clamp-1">
                        #{t.id} - {t.titulo}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase border shrink-0 ${getBadgeEstado(
                          t.estado
                        )}`}
                      >
                        {t.estado.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">{t.descripcion}</p>

                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 text-[11px] space-y-1 mb-2">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold">Cliente:</span>
                        <span className="font-bold text-slate-800">
                          {t.cliente_empresa || t.cliente_nombre || "Cliente"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Técnico:</span>
                        <span className="text-blue-700 font-semibold">
                          {t.tecnico_nombre || "Sin Asignar"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] uppercase border ${getBadgePrioridad(
                          t.prioridad
                        )}`}
                      >
                        {t.prioridad} • SLA {t.sla_limite_horas}h
                      </span>

                      <span className="text-slate-400">
                        {new Date(t.creado_en).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Atención Integral del Ticket (7 columnas) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="card-glass border border-blue-100 p-6 space-y-5 flex flex-col min-h-[720px]">
              {/* 1. Cabecera con Datos del Cliente y Acciones de Contacto */}
              <div className="border-b border-slate-100 pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Ticket #{selectedTicket.id}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getBadgeEstado(
                          selectedTicket.estado
                        )}`}
                      >
                        {selectedTicket.estado.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 leading-snug mt-1">
                      {selectedTicket.titulo}
                    </h2>
                  </div>

                  {selectedTicket.estado !== "cerrado" && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs self-start shrink-0 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cerrar Ticket</span>
                    </button>
                  )}
                </div>

                {/* Ficha de Contacto Directo del Cliente */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">
                      Datos de Contacto del Cliente:
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedTicket.cliente_nombre}
                      {selectedTicket.cliente_empresa ? ` (${selectedTicket.cliente_empresa})` : ""}
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Tel: {selectedTicket.cliente_telefono || "Sin registrar"} • Email:{" "}
                      {selectedTicket.cliente_email || "N/A"}
                    </p>
                  </div>

                  {/* Botones para llamar, WhatsApp y Correo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${selectedTicket.cliente_telefono || ""}`}
                      title="Llamar al cliente"
                      className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                        selectedTicket.cliente_telefono
                          ? "bg-white text-blue-700 border-blue-200 hover:bg-blue-100"
                          : "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <a
                      href={
                        selectedTicket.cliente_telefono
                          ? `https://wa.me/${cleanPhoneForWhatsApp(selectedTicket.cliente_telefono)}`
                          : "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir WhatsApp"
                      className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                        selectedTicket.cliente_telefono
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <a
                      href={`mailto:${selectedTicket.cliente_email || ""}`}
                      title="Enviar correo"
                      className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-700 hover:bg-slate-100 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Selector de Asignación de Técnico */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Técnico Responsable:</span>
                  </div>
                  {isAdmin ? (
                    <select
                      value={selectedTicket.tecnico_id || ""}
                      onChange={(e) => handleAssignTechnician(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sin Asignar</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} {t.apellido} ({t.rol.nombre})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {selectedTicket.tecnico_nombre || "Tú"}
                    </span>
                  )}
                </div>

                {/* Clasificación y Visita Técnica */}
                <form
                  onSubmit={handleSaveClassification}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                    <span>Clasificación & Modalidad del Servicio:</span>
                    <button
                      type="submit"
                      disabled={guardandoClasificacion}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      <span>{guardandoClasificacion ? "Guardando..." : "Actualizar"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Categoría</label>
                      <select
                        value={categoriaTicket}
                        onChange={(e) => setCategoriaTicket(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="red">Redes & Cableado</option>
                        <option value="cctv">CCTV & Cámaras</option>
                        <option value="hardware">Hardware / Rack</option>
                        <option value="software">Software / SO</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Modalidad</label>
                      <select
                        value={modalidadTicket}
                        onChange={(e) => setModalidadTicket(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="remota">Remota (AnyDesk/SSH)</option>
                        <option value="presencial">Presencial en Sitio</option>
                      </select>
                    </div>

                    {modalidadTicket === "presencial" && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[10px] text-slate-500 block mb-0.5">
                          Fecha y Hora de Visita
                        </label>
                        <input
                          type="datetime-local"
                          value={fechaVisita}
                          onChange={(e) => setFechaVisita(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* 2. Pestañas de Conversación: Chat con Cliente vs Bitácora Técnica */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => {
                    setChatTab("chat");
                    setIsInternal(false);
                  }}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    chatTab === "chat"
                      ? "border-blue-600 text-blue-600 bg-blue-50/30 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversación con el Cliente ({comentariosCliente.length})</span>
                </button>

                <button
                  onClick={() => {
                    setChatTab("bitacora");
                    setIsInternal(true);
                  }}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    chatTab === "bitacora"
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bitácora Interna Privada ({comentariosBitacora.length})</span>
                </button>
              </div>

              {/* 3. Hilo de Mensajes */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 min-h-[220px] max-h-[360px]">
                {chatTab === "chat" ? (
                  comentariosCliente.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 space-y-1">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">No hay mensajes públicos aún</p>
                      <p>Escribe abajo para comunicarte directamente con el cliente.</p>
                    </div>
                  ) : (
                    comentariosCliente.map((c) => {
                      const esCliente = c.usuario_rol === "Cliente";

                      return (
                        <div
                          key={c.id}
                          className={`flex ${esCliente ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                              esCliente
                                ? "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                                : "bg-blue-600 text-white rounded-br-none"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between gap-3 text-[10px] mb-1 font-semibold ${
                                esCliente ? "text-slate-500" : "text-blue-100"
                              }`}
                            >
                              <span>
                                {c.usuario_nombre || (esCliente ? "Cliente" : "Soporte C&R")} (
                                {c.usuario_rol || "Usuario"})
                              </span>
                              <span>
                                {new Date(c.creado_en).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="whitespace-pre-line">{c.contenido}</p>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : comentariosBitacora.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 space-y-1">
                    <Lock className="w-8 h-8 text-indigo-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Bitácora interna vacía</p>
                    <p>Registra avances técnicos de laboratorio u observaciones confidenciales.</p>
                  </div>
                ) : (
                  comentariosBitacora.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-indigo-900 font-bold">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-indigo-600" />
                          <span>{c.usuario_nombre || "Técnico"} [NOTA TÉCNICA INTERNA]</span>
                        </span>
                        <span className="text-indigo-400 font-normal">
                          {new Date(c.creado_en).toLocaleString("es-CO")}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line pt-1">{c.contenido}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 4. Formulario para responder */}
              {selectedTicket.estado !== "cerrado" ? (
                <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-slate-700">
                      {chatTab === "chat" ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Escribir mensaje para el cliente (Visible en su panel)</span>
                        </span>
                      ) : (
                        <span className="text-indigo-700 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Registrar nota de bitácora privada (Oculta al cliente)</span>
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={
                        chatTab === "chat"
                          ? "Escribe una respuesta para el cliente..."
                          : "Escribe una nota técnica confidencial para la bitácora..."
                      }
                      className="flex-1 bg-white text-slate-800 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !messageInput.trim()}
                      className={`px-5 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                        chatTab === "chat" ? "btn-primary-gradient" : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{sendingMessage ? "Enviando..." : "Enviar"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-semibold">
                  Este ticket se encuentra cerrado oficialmente. El expediente está archivado.
                </div>
              )}
            </div>
          ) : (
            <div className="card-glass border border-blue-100 h-[640px] flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <LifeBuoy className="w-12 h-12 text-blue-400 opacity-60" />
              <h4 className="text-base font-bold text-slate-800">
                Selecciona un ticket de la lista
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Podrás responder al cliente en tiempo real, llamarlo o enviarle WhatsApp, agendar visitas técnicas y registrar notas en la bitácora técnica.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cierre Oficial */}
      {showCloseModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-md w-full p-6 sm:p-8 space-y-4 bg-white border border-blue-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Cierre Oficial del Ticket #{selectedTicket.id}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ingresa el diagnóstico final y resolución técnica. Si el incidente involucraba un equipo del inventario, este se liberará al estado <strong>'disponible'</strong> automáticamente.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diagnóstico & Solución Aplicada *
              </label>
              <textarea
                rows={4}
                required
                value={closeDiagnostic}
                onChange={(e) => setCloseDiagnostic(e.target.value)}
                placeholder="Ej. Se reconfiguró VLAN de invitados y se reemplazó cable Cat6 defectuoso."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={closeLoading || !closeDiagnostic.trim()}
                onClick={handleCloseTicket}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
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

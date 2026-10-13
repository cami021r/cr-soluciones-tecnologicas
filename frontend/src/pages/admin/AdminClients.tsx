import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Mail,
  Edit3,
  FileText,
  Box,
  LifeBuoy,
  X,
  Save,
  QrCode,
  Trash2,
  Briefcase,
  Archive,
} from "lucide-react";
import api from "../../services/api";

interface ClienteResumen {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  telefono_alt: string | null;
  nombre_empresa: string | null;
  tipo: string;
  documento: string;
  activo?: boolean;
  creado_en: string;
  total_cotizaciones: number;
  total_cotizaciones_aceptadas: number;
  total_comprado: number;
  total_equipos: number;
  total_tickets: number;
  tickets_abiertos: number;
}

interface ClienteDetalle extends ClienteResumen {
  cotizaciones: any[];
  equipos: any[];
  tickets: any[];
  contratos: any[];
}

export const AdminClients: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");

  // Ficha detalle
  const [selectedCliente, setSelectedCliente] = useState<ClienteDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "cotizaciones" | "equipos" | "tickets" | "contratos"
  >("cotizaciones");

  // Modal editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    apellido: "",
    nombre_empresa: "",
    tipo: "persona",
    documento: "",
    telefono: "",
    telefono_alt: "",
    activo: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal QR
  const [qrModalItem, setQrModalItem] = useState<{
    marca: string;
    modelo: string;
    qr: string;
  } | null>(null);

  const fetchClientes = async () => {
    try {
      const res = await api.get<ClienteResumen[]>("/clientes");
      setClientes(res.data || []);
    } catch (e) {
      console.error("Error al cargar clientes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSelectCliente = async (clienteId: number) => {
    setLoadingDetalle(true);
    try {
      const res = await api.get<ClienteDetalle>(`/clientes/${clienteId}`);
      setSelectedCliente(res.data);
      setEditFormData({
        nombre: res.data.nombre || "",
        apellido: res.data.apellido || "",
        nombre_empresa: res.data.nombre_empresa || "",
        tipo: res.data.tipo || "persona",
        documento: res.data.documento || "",
        telefono: res.data.telefono || "",
        telefono_alt: res.data.telefono_alt || "",
        activo: res.data.activo !== false,
      });
    } catch (e) {
      alert("Error al cargar la ficha del cliente.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;

    setSavingEdit(true);
    try {
      const res = await api.patch<ClienteDetalle>(`/clientes/${selectedCliente.id}`, editFormData);
      setSelectedCliente(res.data);
      setShowEditModal(false);
      await fetchClientes();
    } catch (e) {
      alert("Error al actualizar la información del cliente.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCliente = async (clienteId: number, nombre: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar al cliente "${nombre}"? Esta acción desactivará su cuenta y su ficha.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/clientes/${clienteId}`);
      if (selectedCliente?.id === clienteId) {
        setSelectedCliente(null);
      }
      await fetchClientes();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al eliminar el cliente");
    }
  };

  const handleCambiarEstadoContrato = async (contratoId: number, nuevoEstado: string) => {
    if (!selectedCliente) return;
    try {
      await api.patch(`/finanzas/contratos/${contratoId}`, { estado: nuevoEstado });
      await handleSelectCliente(selectedCliente.id);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al actualizar el estado del contrato.");
    }
  };

  const handleArchivarContrato = async (contratoId: number) => {
    if (!selectedCliente) return;
    if (
      !confirm(
        `¿Deseas archivar el contrato #${contratoId}? Se marcará como finalizado y se ocultará para mantener el panel limpio.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/finanzas/contratos/${contratoId}`);
      await handleSelectCliente(selectedCliente.id);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al archivar el contrato.");
    }
  };

  const cleanPhoneForWhatsApp = (phone?: string | null) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("57")) return digits;
    if (digits.length === 10) return `57${digits}`;
    return digits;
  };

  const filteredClientes = clientes.filter((c) => {
    if (filterType === "activos" && c.activo === false) return false;
    if (filterType === "inactivos" && c.activo !== false) return false;
    if (filterType === "empresa" && c.tipo !== "empresa") return false;
    if (filterType === "persona" && c.tipo !== "persona") return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nombre_completo.toLowerCase().includes(term) ||
      (c.nombre_empresa && c.nombre_empresa.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term) ||
      (c.telefono && c.telefono.includes(term)) ||
      c.documento.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Módulo de Clientes Corporativos & Hogar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestión & Directorio de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Consulta fichas de contacto, historial de compras, contratos de renta vigentes o finalizados y soporte técnico.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="card-glass p-4 border border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, email, teléfono o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "todos", label: "Todos" },
            { id: "activos", label: "Activos" },
            { id: "inactivos", label: "Finalizados / Inactivos" },
            { id: "empresa", label: "Empresas" },
            { id: "persona", label: "Personas" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === item.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Lista a la izquierda (5 columnas), Detalle a la derecha (7 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Listado de Clientes */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              Clientes Registrados ({filteredClientes.length})
            </span>
            <span className="text-[11px] text-slate-400">Clic para ver ficha completa</span>
          </div>

          {loading ? (
            <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100">
              Cargando directorio de clientes...
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100">
              No se encontraron clientes bajo este criterio.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredClientes.map((c) => {
                const isSelected = selectedCliente?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCliente(c.id)}
                    className={`card-glass p-4 border rounded-2xl cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-sm"
                        : "border-slate-200 hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                          {c.nombre.charAt(0)}
                          {c.apellido.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {c.nombre_completo}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {c.nombre_empresa || "Cliente Persona Natural"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            c.tipo === "empresa"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {c.tipo}
                        </span>
                        {c.activo === false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            Finalizado
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Activo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Facturado</span>
                        <span className="font-bold text-blue-700">
                          ${c.total_comprado.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Equipos</span>
                        <span className="font-bold text-slate-800">{c.total_equipos}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tickets</span>
                        <span
                          className={`font-bold ${
                            c.tickets_abiertos > 0 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {c.tickets_abiertos} activos
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Ficha Completa del Cliente (7 columnas) */}
        <div className="lg:col-span-7">
          {loadingDetalle ? (
            <div className="card-glass p-16 text-center text-xs text-slate-500 border border-blue-100">
              Cargando historial y ficha del cliente...
            </div>
          ) : selectedCliente ? (
            <div className="card-glass border border-blue-100 p-6 space-y-6">
              {/* Encabezado de la Ficha */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md uppercase shrink-0">
                    {selectedCliente.nombre.charAt(0)}
                    {selectedCliente.apellido.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {selectedCliente.nombre_completo}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedCliente.tipo}
                      </span>
                      {selectedCliente.activo === false ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          Finalizado / Inactivo
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedCliente.nombre_empresa ? (
                        <span className="font-semibold text-slate-700">
                          {selectedCliente.nombre_empresa} • Doc: {selectedCliente.documento}
                        </span>
                      ) : (
                        <span>Doc: {selectedCliente.documento}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar Datos</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteCliente(selectedCliente.id, selectedCliente.nombre_completo)
                    }
                    className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Desactivar y eliminar este cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Botones de Acción Directa: Llamar, WhatsApp, Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`tel:${selectedCliente.telefono || ""}`}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs ${
                    selectedCliente.telefono
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{selectedCliente.telefono ? "Llamar Teléfono" : "Sin teléfono"}</span>
                </a>

                <a
                  href={
                    selectedCliente.telefono
                      ? `https://wa.me/${cleanPhoneForWhatsApp(selectedCliente.telefono)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs ${
                    selectedCliente.telefono
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>

                <a
                  href={`mailto:${selectedCliente.email}`}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Enviar Correo</span>
                </a>
              </div>

              {/* Tarjetas KPI de Cliente */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Total Facturado
                  </span>
                  <span className="text-base font-extrabold text-blue-700">
                    ${selectedCliente.total_comprado.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Equipos Vinculados
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {selectedCliente.equipos.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Tickets Reportados
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {selectedCliente.tickets.length}
                  </span>
                </div>
              </div>

              {/* Pestañas de Historial */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap border-b border-slate-200 gap-1">
                  <button
                    onClick={() => setActiveTab("cotizaciones")}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "cotizaciones"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cotizaciones ({selectedCliente.cotizaciones.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("equipos")}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "equipos"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Equipos ({selectedCliente.equipos.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tickets")}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "tickets"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>Tickets ({selectedCliente.tickets.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("contratos")}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "contratos"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Contratos ({selectedCliente.contratos?.length || 0})</span>
                  </button>
                </div>

                {/* Contenido de la pestaña activa */}
                {activeTab === "cotizaciones" && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
                    {selectedCliente.cotizaciones.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No hay cotizaciones registradas para este cliente.
                      </p>
                    ) : (
                      selectedCliente.cotizaciones.map((cot: any) => (
                        <div
                          key={cot.id}
                          className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                Cotización #{cot.id}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white border border-slate-200">
                                {cot.estado}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {new Date(cot.creado_en).toLocaleDateString("es-CO")} • {cot.items_count} ítems
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-blue-700 block">
                              ${cot.total.toLocaleString()} COP
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "equipos" && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
                    {selectedCliente.equipos.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No hay equipos asignados en venta o arriendo para este cliente.
                      </p>
                    ) : (
                      selectedCliente.equipos.map((eq: any) => (
                        <div
                          key={eq.id}
                          className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {eq.marca} {eq.modelo}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                  eq.tipo_relacion === "arriendo"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {eq.tipo_relacion}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              S/N: {eq.numero_serie} {eq.categoria ? `• ${eq.categoria}` : ""}
                            </span>
                          </div>

                          {eq.qr_codigo && (
                            <button
                              onClick={() =>
                                setQrModalItem({
                                  marca: eq.marca,
                                  modelo: eq.modelo,
                                  qr: eq.qr_codigo,
                                })
                              }
                              className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Ver QR"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "tickets" && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
                    {selectedCliente.tickets.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No hay incidentes reportados por este cliente.
                      </p>
                    ) : (
                      selectedCliente.tickets.map((tk: any) => (
                        <div
                          key={tk.id}
                          className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                #{tk.id} - {tk.titulo}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white border border-slate-200">
                                {tk.estado}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Técnico: {tk.tecnico_nombre} • Categoría: {tk.categoria}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(tk.creado_en).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pestaña de Contratos */}
                {activeTab === "contratos" && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
                    {!selectedCliente.contratos || selectedCliente.contratos.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No hay contratos de renta o compra registrados para este cliente.
                      </p>
                    ) : (
                      selectedCliente.contratos.map((con: any) => {
                        const esActivo = con.estado === "activo";
                        const esFinalizado = con.estado === "finalizado";
                        return (
                          <div
                            key={con.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                              esFinalizado
                                ? "bg-slate-50 border-slate-200/80 opacity-80"
                                : "bg-white border-blue-200 shadow-2xs"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  Contrato #{con.id} ({con.tipo?.toUpperCase()})
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                    esActivo
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : esFinalizado
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : con.estado === "vencido"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {con.estado}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                                <span>
                                  <strong>Inicio:</strong>{" "}
                                  {con.fecha_inicio
                                    ? new Date(con.fecha_inicio).toLocaleDateString("es-CO")
                                    : "N/A"}
                                </span>
                                <span>
                                  <strong>Vence:</strong>{" "}
                                  {con.fecha_vencimiento
                                    ? new Date(con.fecha_vencimiento).toLocaleDateString("es-CO")
                                    : "Indefinido"}
                                </span>
                              </div>

                              {con.observaciones && (
                                <p className="text-[10px] text-slate-500 italic">
                                  "{con.observaciones}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="font-black text-slate-900 text-sm sm:mr-2">
                                ${Number(con.valor_total).toLocaleString()} COP
                              </span>

                              {esActivo ? (
                                <button
                                  onClick={() =>
                                    handleCambiarEstadoContrato(con.id, "finalizado")
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition-colors"
                                  title="Marcar este contrato como finalizado"
                                >
                                  Finalizar
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleCambiarEstadoContrato(con.id, "activo")
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition-colors"
                                  title="Reactivar este contrato"
                                >
                                  Reactivar
                                </button>
                              )}

                              <button
                                onClick={() => handleArchivarContrato(con.id)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Archivar y retirar de la vista"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-glass border border-blue-100 p-16 text-center space-y-3">
              <Users className="w-12 h-12 text-blue-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-slate-800">
                Selecciona un cliente de la lista
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Podrás ver sus datos de contacto, contratos activos y finalizados, equipos asignados y tickets.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar Datos del Cliente */}
      {showEditModal && selectedCliente && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-lg w-full p-6 sm:p-8 space-y-5 bg-white border border-blue-200 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Datos de {selectedCliente.nombre_completo}
              </h3>
              <p className="text-xs text-slate-500">
                Actualiza datos de contacto, razón social o estado del cliente.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={editFormData.apellido}
                    onChange={(e) => setEditFormData({ ...editFormData, apellido: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Cliente
                  </label>
                  <select
                    value={editFormData.tipo}
                    onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="persona">Persona Natural</option>
                    <option value="empresa">Empresa / Corporativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado en Plataforma
                  </label>
                  <select
                    value={editFormData.activo ? "activo" : "inactivo"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        activo: e.target.value === "activo",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="activo">Activo (Vigente)</option>
                    <option value="inactivo">Inactivo / Finalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Empresa / Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej. Soluciones TI SAS"
                  value={editFormData.nombre_empresa}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, nombre_empresa: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Documento / NIT
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.documento}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, documento: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Principal
                  </label>
                  <input
                    type="tel"
                    value={editFormData.telefono}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono Alternativo (Opcional)
                </label>
                <input
                  type="tel"
                  value={editFormData.telefono_alt}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, telefono_alt: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary-gradient px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-sm w-full p-6 text-center space-y-4 bg-white border border-blue-200 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">
              Código QR de {qrModalItem.marca} {qrModalItem.modelo}
            </h4>
            <div className="p-4 bg-white border rounded-2xl inline-block mx-auto">
              <img src={qrModalItem.qr} alt="QR" className="w-44 h-44 object-contain mx-auto" />
            </div>
            <button
              onClick={() => setQrModalItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;

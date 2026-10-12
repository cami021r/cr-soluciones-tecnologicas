import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  UserCheck,
  Wrench,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Edit3,
  Check,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Layers,
  Send,
} from "lucide-react";
import api from "../../services/api";
import type { Quote, QuoteItem } from "../../types";

export const AdminQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<string>("todas");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal para cambiar estado / avanzar embudo
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>("aprobada");
  const [observacionEstado, setObservacionEstado] = useState("");
  const [fechaVisita, setFechaVisita] = useState("");
  const [confirmarIngreso, setConfirmarIngreso] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Modal para edición de cotización
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editDescuento, setEditDescuento] = useState<number>(0);
  const [editIvaPorcentaje, setEditIvaPorcentaje] = useState<number>(19);
  const [editVigencia, setEditVigencia] = useState<string>("");
  const [editNotas, setEditNotas] = useState<string>("");
  const [editItems, setEditItems] = useState<QuoteItem[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const fetchQuotes = async () => {
    try {
      const res = await api.get<Quote[]>("/cotizaciones/");
      setQuotes(res.data || []);
    } catch (e) {
      console.error("Error al cargar cotizaciones:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDownloadPdf = async (cotizacionId: number) => {
    try {
      const res = await api.get(`/cotizaciones/${cotizacionId}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cotizacion_CR_${cotizacionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Error al descargar el PDF formal.");
    }
  };

  const openStatusModal = (cot: Quote) => {
    setSelectedQuote(cot);
    // Sugerir el siguiente estado lógico
    if (cot.estado === "pendiente") setNuevoEstado("aprobada");
    else if (cot.estado === "aceptada") setNuevoEstado("aprobada");
    else if (cot.estado === "aprobada") setNuevoEstado("contactado");
    else if (cot.estado === "contactado") setNuevoEstado("agendado");
    else if (cot.estado === "agendado") setNuevoEstado("en_ejecucion");
    else if (cot.estado === "en_ejecucion") setNuevoEstado("concretado");
    else setNuevoEstado(cot.estado);

    setObservacionEstado("");
    setFechaVisita(cot.fecha_visita_agendada ? cot.fecha_visita_agendada.slice(0, 16) : "");
    setConfirmarIngreso(cot.estado === "en_ejecucion" || !cot.ingreso_confirmado);
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedQuote) return;
    setStatusLoading(true);
    try {
      await api.patch(`/cotizaciones/${selectedQuote.id}/estado`, {
        estado: nuevoEstado,
        observacion: observacionEstado.trim() || undefined,
        fecha_visita: fechaVisita ? new Date(fechaVisita).toISOString() : undefined,
        confirmar_ingreso: nuevoEstado === "concretado" ? confirmarIngreso : undefined,
      });
      setStatusModalOpen(false);
      await fetchQuotes();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al actualizar el estado de la cotización");
    } finally {
      setStatusLoading(false);
    }
  };

  const openEditModal = (cot: Quote) => {
    setEditingQuote(cot);
    setEditDescuento(Number(cot.descuento || 0));
    setEditIvaPorcentaje(Number(cot.porcentaje_iva || 19));
    setEditVigencia(cot.fecha_vencimiento ? cot.fecha_vencimiento.slice(0, 10) : "");
    setEditNotas(cot.notas_internas || "");
    setEditItems(
      cot.items?.map((it) => ({
        ...it,
        cantidad: Number(it.cantidad),
        precio_unitario: Number(it.precio_unitario),
        subtotal: Number(it.subtotal),
      })) || []
    );
    setEditModalOpen(true);
  };

  const handleAddItem = () => {
    const nuevo: QuoteItem = {
      id: Date.now(),
      tipo_item: "servicio",
      descripcion: "Nuevo concepto o servicio técnico",
      cantidad: 1,
      precio_unitario: 50000,
      subtotal: 50000,
    };
    setEditItems([...editItems, nuevo]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    const updated = [...editItems];
    const current = { ...updated[index] };

    if (field === "cantidad" || field === "precio_unitario") {
      const numVal = Number(value) || 0;
      (current as any)[field] = numVal;
      current.subtotal = current.cantidad * current.precio_unitario;
    } else {
      (current as any)[field] = value;
    }

    updated[index] = current;
    setEditItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  // Cálculos dinámicos en el modal de edición
  const calcSubtotal = editItems.reduce((acc, it) => acc + (it.cantidad * it.precio_unitario), 0);
  const calcBase = Math.max(0, calcSubtotal - editDescuento);
  const calcIva = (calcBase * (editIvaPorcentaje / 100));
  const calcTotal = calcBase + calcIva;

  const handleSaveEdit = async () => {
    if (!editingQuote) return;
    setEditLoading(true);
    try {
      await api.patch(`/cotizaciones/${editingQuote.id}`, {
        descuento: editDescuento,
        porcentaje_iva: editIvaPorcentaje,
        fecha_vencimiento: editVigencia || undefined,
        notas_internas: editNotas,
        items: editItems.map((it) => ({
          tipo_item: it.tipo_item,
          descripcion: it.descripcion,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
        })),
      });
      setEditModalOpen(false);
      await fetchQuotes();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al actualizar la cotización");
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "concretado":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Concretado
          </span>
        );
      case "en_ejecucion":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            En Ejecución
          </span>
        );
      case "agendado":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            Agendado
          </span>
        );
      case "contactado":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            Contactado
          </span>
        );
      case "aprobada":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Aprobada Admin
          </span>
        );
      case "aceptada":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aceptada Cliente
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case "ajuste_solicitado":
      case "en_ajuste":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5" />
            En Ajuste
          </span>
        );
      case "rechazada":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {estado}
          </span>
        );
    }
  };

  // Métricas rápidas del embudo
  const totalEnEmbudo = quotes
    .filter((q) =>
      ["pendiente", "aceptada", "aprobada", "contactado", "agendado", "en_ejecucion"].includes(q.estado)
    )
    .reduce((acc, q) => acc + Number(q.total || 0), 0);

  const totalConcretado = quotes
    .filter((q) => q.estado === "concretado")
    .reduce((acc, q) => acc + Number(q.total || 0), 0);

  const filteredQuotes = quotes.filter((cot) => {
    // Filtro por estado
    if (filterState !== "todas") {
      if (filterState === "en_curso") {
        if (!["aceptada", "aprobada", "contactado", "agendado", "en_ejecucion"].includes(cot.estado)) return false;
      } else if (filterState === "ajuste") {
        if (!["ajuste_solicitado", "en_ajuste"].includes(cot.estado)) return false;
      } else if (cot.estado !== filterState) {
        return false;
      }
    }

    // Filtro por búsqueda
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchId = String(cot.id).includes(term);
      const matchNombre = (cot.cliente_nombre || "").toLowerCase().includes(term);
      const matchEmpresa = (cot.cliente_empresa || "").toLowerCase().includes(term);
      const matchEmail = (cot.cliente_email || "").toLowerCase().includes(term);
      if (!matchId && !matchNombre && !matchEmpresa && !matchEmail) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestión Comercial & Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Supervisa el embudo de ventas, ajusta propuestas económicas, agenda visitas técnicas y contacta directamente a cada cliente.
          </p>
        </div>
      </div>

      {/* Tarjetas de Indicadores del Embudo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass rounded-[20px] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Posible Venta (En Embudo)</span>
            <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight mt-0.5 block">
              ${totalEnEmbudo.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Cotizaciones activas en curso</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="card-glass rounded-[20px] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Ingreso Concretado</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight mt-0.5 block">
              ${totalConcretado.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Proyectos culminados a satisfacción</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="card-glass rounded-[20px] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Presupuestos por Revisar</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight mt-0.5 block">
              {quotes.filter((q) => ["pendiente", "aceptada"].includes(q.estado)).length}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Pendientes de aprobación comercial</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="card-glass rounded-[20px] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Proyectos en Ejecución</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight mt-0.5 block">
              {quotes.filter((q) => ["agendado", "en_ejecucion"].includes(q.estado)).length}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">Instalación o servicio técnico activo</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card-glass rounded-[20px] p-4 border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, empresa, correo o #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
            {[
              { label: "Todas", value: "todas" },
              { label: "Pendientes", value: "pendiente" },
              { label: "Aceptadas", value: "aceptada" },
              { label: "En Curso", value: "en_curso" },
              { label: "Concretadas", value: "concretado" },
              { label: "En Ajuste", value: "ajuste" },
              { label: "Rechazadas", value: "rechazada" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterState(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterState === f.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Cotizaciones */}
      {loading ? (
        <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-blue-100">
          Cargando cotizaciones del sistema...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="card-glass rounded-[20px] p-16 text-center space-y-3 border border-slate-200">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron cotizaciones</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay cotizaciones que coincidan con los filtros de búsqueda seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((cot) => {
            const isExpanded = expandedId === cot.id;
            const telClean = (cot.cliente_telefono || "").replace(/\D/g, "");

            return (
              <div
                key={cot.id}
                className="card-glass rounded-[20px] p-5 sm:p-6 border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs space-y-4"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info Principal */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-black text-slate-900">
                        Cotización #{cot.id}
                      </span>
                      {getStatusBadge(cot.estado)}
                      {cot.ingreso_confirmado && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Ingreso Verificado
                        </span>
                      )}
                    </div>

                    {/* Cliente y Empresa */}
                    <div className="text-xs text-slate-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-bold text-blue-900">
                        {cot.cliente_nombre || `Cliente #${cot.cliente_id}`}
                      </span>
                      {cot.cliente_empresa && (
                        <span className="text-slate-500">
                          🏢 {cot.cliente_empresa}
                        </span>
                      )}
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        Creada: {new Date(cot.creado_en).toLocaleDateString("es-CO")}
                      </span>
                      {cot.fecha_vencimiento && (
                        <span className="text-slate-500">
                          (Vence: {new Date(cot.fecha_vencimiento).toLocaleDateString("es-CO")})
                        </span>
                      )}
                    </div>

                    {/* Botones de Contacto Rápido */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {cot.cliente_telefono && (
                        <>
                          <a
                            href={`tel:${cot.cliente_telefono}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Llamar directamente al cliente"
                          >
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{cot.cliente_telefono}</span>
                          </a>
                          <a
                            href={`https://wa.me/57${telClean}?text=Hola%20${encodeURIComponent(
                              cot.cliente_nombre || ""
                            )},%20te%20escribimos%20de%20C%26R%20Soluciones%20Tecnol%C3%B3gicas%20sobre%20tu%20cotizaci%C3%B3n%20%23${cot.id}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="Chatear por WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      )}
                      {cot.cliente_email && (
                        <a
                          href={`mailto:${cot.cliente_email}?subject=Cotizaci%C3%B3n%20%23${cot.id}%20-%20C%26R%20Soluciones`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Enviar correo"
                        >
                          <Mail className="w-3 h-3 text-indigo-600" />
                          <span>{cot.cliente_email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Valores y Acciones */}
                  <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Total Liquidado (IVA {cot.porcentaje_iva || 19}%)
                      </span>
                      <span className="text-2xl font-black text-blue-700 tracking-tight">
                        ${Number(cot.total).toLocaleString()} COP
                      </span>
                      {Number(cot.descuento || 0) > 0 && (
                        <span className="text-[10px] text-emerald-600 block">
                          Desc. aplicado: -${Number(cot.descuento).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Botón de Cambiar Estado */}
                      <button
                        onClick={() => openStatusModal(cot)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Avanzar Estado</span>
                      </button>

                      {/* Botón de Edición de Propuesta */}
                      <button
                        onClick={() => openEditModal(cot)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5"
                        title="Modificar ítems, precios, descuentos y vigencia"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      {/* Botón de PDF */}
                      <button
                        onClick={() => handleDownloadPdf(cot.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Descargar propuesta formal en PDF"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>

                      {/* Expandir / Colapsar */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cot.id)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        title="Ver detalles e ítems"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner de Visita Agendada si aplica */}
                {cot.fecha_visita_agendada && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 text-cyan-900 text-xs">
                    <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <span className="font-bold">Visita Técnica Agendada: </span>
                      <span>
                        {new Date(cot.fecha_visita_agendada).toLocaleString("es-CO", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notas Internas si existen */}
                {cot.notas_internas && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Notas Internas: </span>
                    <span>{cot.notas_internas}</span>
                  </div>
                )}

                {/* Desglose Expandible */}
                {isExpanded && (
                  <div className="mt-3 pt-4 border-t border-slate-200 space-y-5">
                    {/* Tabla de Ítems */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Ítems y Conceptos Cotizados
                      </h4>

                      {cot.items && cot.items.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Descripción</th>
                                <th className="p-2.5 text-center">Tipo</th>
                                <th className="p-2.5 text-center">Cant.</th>
                                <th className="p-2.5 text-right">Precio Unitario</th>
                                <th className="p-2.5 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cot.items.map((it, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-medium text-slate-800">{it.descripcion}</td>
                                  <td className="p-2.5 text-center capitalize text-slate-600">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        it.tipo_item === "servicio"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-purple-50 text-purple-700"
                                      }`}
                                    >
                                      {it.tipo_item}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-center font-semibold text-slate-700">{it.cantidad}</td>
                                  <td className="p-2.5 text-right text-slate-600">
                                    ${Number(it.precio_unitario).toLocaleString()}
                                  </td>
                                  <td className="p-2.5 text-right font-bold text-slate-800">
                                    ${Number(it.subtotal).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No hay ítems registrados.</p>
                      )}
                    </div>

                    {/* Desglose Contable */}
                    <div className="flex justify-end">
                      <div className="w-full sm:w-72 rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-slate-800">${Number(cot.subtotal || 0).toLocaleString()} COP</span>
                        </div>
                        {Number(cot.descuento || 0) > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Descuento:</span>
                            <span className="font-semibold">-${Number(cot.descuento).toLocaleString()} COP</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>IVA ({Number(cot.porcentaje_iva || 19)}%):</span>
                          <span className="font-semibold text-slate-800">${Number(cot.iva || 0).toLocaleString()} COP</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                          <span>Total:</span>
                          <span className="text-blue-700">${Number(cot.total).toLocaleString()} COP</span>
                        </div>
                      </div>
                    </div>

                    {/* Historial de Estados & Bitácora */}
                    {cot.historial && cot.historial.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Línea de Tiempo del Proyecto
                        </h4>
                        <div className="space-y-1.5">
                          {cot.historial.map((h, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                            >
                              <div>
                                <span className="font-bold text-slate-800 capitalize mr-2">
                                  {h.estado.replace("_", " ")}
                                </span>
                                {h.observacion && <span className="text-slate-600">{h.observacion}</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 shrink-0">
                                {new Date(h.creado_en).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                                {h.usuario_nombre && ` • ${h.usuario_nombre}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: AVANZAR ESTADO EN EL EMBUDO COMERCIAL */}
      {statusModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Avanzar Etapa Comercial — Cotización #{selectedQuote.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nuevo Estado Comercial</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="pendiente">Pendiente (Emisión inicial)</option>
                  <option value="aceptada">Aceptada por el cliente</option>
                  <option value="aprobada">Aprobada por Gerencia/Admin</option>
                  <option value="contactado">Contactado (Asesor en comunicación)</option>
                  <option value="agendado">Agendado (Visita pactada)</option>
                  <option value="en_ejecucion">En Ejecución (Instalación en sitio)</option>
                  <option value="concretado">Proyecto Concretado (Culminado)</option>
                  <option value="en_ajuste">En Ajuste de Presupuesto</option>
                  <option value="rechazada">Rechazada / Cancelada</option>
                </select>
              </div>

              {/* Si es agendado o en ejecución, permitir fecha de visita */}
              {["agendado", "en_ejecucion"].includes(nuevoEstado) && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Fecha y Hora de la Visita Técnica
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaVisita}
                    onChange={(e) => setFechaVisita(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              )}

              {/* Si es concretado, opción de ingreso confirmado */}
              {nuevoEstado === "concretado" && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chkIngreso"
                      checked={confirmarIngreso}
                      onChange={(e) => setConfirmarIngreso(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                    />
                    <label htmlFor="chkIngreso" className="font-bold text-emerald-900 cursor-pointer">
                      Confirmar y registrar como Ingreso Verificado en Finanzas
                    </label>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Al marcar esta casilla, el valor total (${Number(selectedQuote.total).toLocaleString()} COP) pasará de "Posible Venta" a "Ingreso Verificado" en el libro contable.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observación o Bitácora</label>
                <textarea
                  rows={3}
                  value={observacionEstado}
                  onChange={(e) => setObservacionEstado(e.target.value)}
                  placeholder="Describe el avance comercial o acuerdos con el cliente..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={statusLoading}
                onClick={handleSaveStatus}
                className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
              >
                {statusLoading ? "Guardando..." : "Actualizar Etapa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDICIÓN COMPLETA DE COTIZACIÓN */}
      {editModalOpen && editingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-blue-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Modificar Cotización #{editingQuote.id}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Cliente: {editingQuote.cliente_nombre}
              </span>
            </h3>

            {/* Ítems */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Conceptos e Ítems Cotizados
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Ítem</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {editItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-2 text-xs"
                  >
                    <select
                      value={item.tipo_item}
                      onChange={(e) => handleUpdateItem(idx, "tipo_item", e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="servicio">Servicio</option>
                      <option value="producto">Producto</option>
                    </select>

                    <input
                      type="text"
                      value={item.descripcion}
                      onChange={(e) => handleUpdateItem(idx, "descripcion", e.target.value)}
                      placeholder="Descripción del concepto"
                      className="flex-1 p-1.5 rounded-lg border border-slate-200 text-xs bg-white w-full"
                    />

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-[11px] text-slate-500">Cant:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleUpdateItem(idx, "cantidad", e.target.value)}
                        className="w-16 p-1.5 rounded-lg border border-slate-200 text-xs bg-white text-center"
                      />

                      <span className="text-[11px] text-slate-500">Precio:</span>
                      <input
                        type="number"
                        step="1000"
                        value={item.precio_unitario}
                        onChange={(e) => handleUpdateItem(idx, "precio_unitario", e.target.value)}
                        className="w-24 p-1.5 rounded-lg border border-slate-200 text-xs bg-white text-right"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parámetros Financieros (Descuento, IVA, Vigencia) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descuento Comercial (COP)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={editDescuento}
                  onChange={(e) => setEditDescuento(Number(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Porcentaje de IVA (%)</label>
                <select
                  value={editIvaPorcentaje}
                  onChange={(e) => setEditIvaPorcentaje(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value={19}>19% (General Colombia)</option>
                  <option value={0}>0% (Exento / Sin IVA)</option>
                  <option value={5}>5% (Especial)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha de Vigencia / Vencimiento</label>
                <input
                  type="date"
                  value={editVigencia}
                  onChange={(e) => setEditVigencia(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Notas Internas Comerciales</label>
              <textarea
                rows={2}
                value={editNotas}
                onChange={(e) => setEditNotas(e.target.value)}
                placeholder="Observaciones exclusivas del equipo técnico/admin..."
                className="w-full p-2 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            {/* Resumen Calculado en Tiempo Real */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
              <div className="space-y-0.5">
                <div>Subtotal: <strong>${calcSubtotal.toLocaleString()} COP</strong></div>
                <div>Descuento: <strong>-${editDescuento.toLocaleString()} COP</strong></div>
                <div>IVA ({editIvaPorcentaje}%): <strong>${calcIva.toLocaleString()} COP</strong></div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase block font-semibold">Total a Guardar</span>
                <span className="text-lg font-black text-blue-700">${calcTotal.toLocaleString()} COP</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={editLoading || editItems.length === 0}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
              >
                {editLoading ? "Guardando..." : "Guardar Modificaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;

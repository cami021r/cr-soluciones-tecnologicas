import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calendar,
  UserCheck,
  Wrench,
  Check,
  AlertCircle,
  PhoneCall,
} from "lucide-react";
import api from "../../services/api";
import type { Quote } from "../../types";

export const PanelQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("todas");

  // Modal para solicitar ajuste
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [cotizacionAjusteId, setCotizacionAjusteId] = useState<number | null>(null);
  const [ajusteObservacion, setAjusteObservacion] = useState("");

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

  const handleUpdateStatus = async (
    id: number,
    nuevoEstado: "aceptada" | "rechazada" | "ajuste_solicitado",
    observacion?: string
  ) => {
    setActionLoading(id);
    try {
      await api.patch(`/cotizaciones/${id}/estado`, {
        estado: nuevoEstado,
        observacion:
          observacion ||
          (nuevoEstado === "aceptada"
            ? "Cotización aceptada por el cliente desde el portal."
            : nuevoEstado === "rechazada"
            ? "Cotización rechazada por el cliente."
            : "Solicitud de ajuste ingresada por el cliente."),
      });
      await fetchQuotes();
      if (ajusteModalOpen) {
        setAjusteModalOpen(false);
        setAjusteObservacion("");
      }
    } catch (e) {
      alert("No se pudo actualizar el estado de la cotización");
    } finally {
      setActionLoading(null);
    }
  };

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
      alert("El PDF formal aún se está generando o no está disponible en este momento.");
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "concretado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Proyecto Concretado
          </span>
        );
      case "en_ejecucion":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            En Ejecución
          </span>
        );
      case "agendado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            Visita Agendada
          </span>
        );
      case "contactado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
            Cliente Contactado
          </span>
        );
      case "aprobada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            Aprobada por Admin
          </span>
        );
      case "aceptada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aceptada por ti
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendiente de Aprobación
          </span>
        );
      case "ajuste_solicitado":
      case "en_ajuste":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Ajuste Solicitado
          </span>
        );
      case "rechazada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {estado}
          </span>
        );
    }
  };

  // Etapas del stepper lineal de seguimiento (tipo envío de paquetería)
  const ETAPAS = [
    { key: "pendiente", label: "Emitida", desc: "Cotización creada" },
    { key: "aceptada", label: "Aceptada", desc: "Aceptada por cliente" },
    { key: "aprobada", label: "Aprobada Admin", desc: "Verificada gerencia" },
    { key: "agendado", label: "Agendada", desc: "Visita o inicio pactado" },
    { key: "en_ejecucion", label: "En Ejecución", desc: "Instalación / Servicio" },
    { key: "concretado", label: "Concretado", desc: "Proyecto completado" },
  ];

  const getStepProgressIndex = (estado: string): number => {
    switch (estado) {
      case "pendiente":
        return 0;
      case "aceptada":
        return 1;
      case "aprobada":
        return 2;
      case "contactado":
        return 2;
      case "agendado":
        return 3;
      case "en_ejecucion":
        return 4;
      case "concretado":
        return 5;
      default:
        return -1;
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filter === "todas") return true;
    if (filter === "en_curso") {
      return ["aceptada", "aprobada", "contactado", "agendado", "en_ejecucion"].includes(q.estado);
    }
    if (filter === "concretado") return q.estado === "concretado";
    if (filter === "ajuste") return ["ajuste_solicitado", "en_ajuste"].includes(q.estado);
    return q.estado === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Cotizaciones & Proyectos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Revisa el desglose contable, sigue la línea de tiempo de ejecución y descarga propuestas oficiales en PDF.
          </p>
        </div>

        <Link
          to="/cotizador"
          className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 self-start sm:self-auto shadow-md rounded-2xl"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Nueva Cotización con IA</span>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: "Todas", value: "todas" },
          { label: "Por Aprobar", value: "pendiente" },
          { label: "En Curso / Seguimiento", value: "en_curso" },
          { label: "Concretadas", value: "concretado" },
          { label: "En Ajuste", value: "ajuste" },
          { label: "Rechazadas", value: "rechazada" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.value
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100 rounded-[20px]">
          Cargando listado de presupuestos y proyectos...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="card-glass p-16 text-center space-y-4 border border-blue-100 rounded-[20px]">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No hay cotizaciones para mostrar
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filter === "todas"
              ? "Aún no has generado cotizaciones. Chatea con nuestro cotizador inteligente para presupuestar cableado, CCTV, redes o computadores."
              : `No tienes cotizaciones registradas en la categoría seleccionada.`}
          </p>
          <Link
            to="/cotizador"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold btn-primary-gradient mt-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Abrir Cotizador IA</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuotes.map((cot) => {
            const isExpanded = expandedId === cot.id;
            const currentStepIdx = getStepProgressIndex(cot.estado);
            const isAlternateState = ["ajuste_solicitado", "en_ajuste", "rechazada"].includes(cot.estado);

            return (
              <div
                key={cot.id}
                className="card-glass rounded-[20px] p-6 sm:p-7 border border-blue-100/90 shadow-sm transition-all hover:border-blue-200 space-y-5"
              >
                {/* 1. Cabecera de la Cotización */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Cotización #{cot.id}
                      </span>
                      {getStatusBadge(cot.estado)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Emitida el {new Date(cot.creado_en).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
                      {cot.fecha_vencimiento && (
                        <span>
                          {" "}
                          • Vence: {new Date(cot.fecha_vencimiento).toLocaleDateString("es-CO")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Valor Total con IVA (COP)
                      </span>
                      <span className="text-2xl font-black text-blue-700 tracking-tight">
                        ${Number(cot.total).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPdf(cot.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                        title="Descargar PDF formal con membrete y desglose legal"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cot.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? "Ocultar" : "Detalles & Desglose"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Banner de Visita Agendada si aplica */}
                {cot.fecha_visita_agendada && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-900 text-xs">
                    <Calendar className="w-5 h-5 text-cyan-600 shrink-0" />
                    <div>
                      <span className="font-bold">Visita Técnica Agendada: </span>
                      <span>
                        {new Date(cot.fecha_visita_agendada).toLocaleString("es-CO", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="text-cyan-700 ml-1">
                        (Nuestro equipo se presentará en la fecha pactada para iniciar los trabajos).
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. LÍNEA DE TIEMPO / STEPPER TIPO SEGUIMIENTO DE ENVÍO */}
                {!isAlternateState ? (
                  <div className="pt-2 pb-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Seguimiento del Proyecto
                    </div>
                    {/* Stepper horizontal */}
                    <div className="relative">
                      <div className="hidden sm:block absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                      {currentStepIdx >= 0 && (
                        <div
                          className="hidden sm:block absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-500"
                          style={{
                            width: `${(currentStepIdx / (ETAPAS.length - 1)) * 92}%`,
                          }}
                        />
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 relative z-10">
                        {ETAPAS.map((etapa, idx) => {
                          const isDone = currentStepIdx > idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div
                              key={etapa.key}
                              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                                isCurrent
                                  ? "bg-blue-50/90 border-blue-300 shadow-xs"
                                  : isDone
                                  ? "bg-emerald-50/90 border-emerald-200"
                                  : "bg-white/80 border-slate-200 opacity-60"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                  isDone
                                    ? "bg-emerald-500 text-white"
                                    : isCurrent
                                    ? "bg-blue-600 text-white animate-pulse"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] font-bold leading-tight ${
                                  isCurrent
                                    ? "text-blue-700"
                                    : isDone
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {etapa.label}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                                {etapa.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border bg-slate-50 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      {cot.estado === "rechazada" ? (
                        <p className="text-rose-700 font-medium">
                          Esta propuesta fue cancelada o rechazada. Si deseas reactivarla o solicitar una nueva, puedes contactarnos o usar el Cotizador IA.
                        </p>
                      ) : (
                        <p className="text-blue-700 font-medium">
                          Has solicitado un ajuste a este presupuesto. El equipo comercial está recalculando costos y te notificará cuando la propuesta esté actualizada.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Botones de Decisión para Cotización Pendiente */}
                {cot.estado === "pendiente" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100">
                    <div className="text-xs text-slate-700">
                      <span className="font-bold">¿Deseas confirmar este presupuesto?</span>
                      <p className="text-[11px] text-slate-500">
                        Al aceptarlo, gerencia revisará el cronograma para contactarte y coordinar la ejecución técnica.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={actionLoading === cot.id}
                        onClick={() => handleUpdateStatus(cot.id, "aceptada")}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aceptar Cotización</span>
                      </button>

                      <button
                        disabled={actionLoading === cot.id}
                        onClick={() => {
                          setCotizacionAjusteId(cot.id);
                          setAjusteModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>Solicitar Ajuste</span>
                      </button>

                      <button
                        disabled={actionLoading === cot.id}
                        onClick={() => {
                          if (confirm("¿Estás seguro de que deseas rechazar este presupuesto?")) {
                            handleUpdateStatus(cot.id, "rechazada");
                          }
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 inline mr-1" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Desglose Expandible */}
                {isExpanded && (
                  <div className="mt-4 pt-5 border-t border-slate-200/80 space-y-6">
                    {/* Tabla de Conceptos Cotizados */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Desglose de Ítems Cotizados
                      </h4>

                      {cot.items && cot.items.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-3">Descripción del Concepto</th>
                                <th className="p-3 text-center">Tipo</th>
                                <th className="p-3 text-center">Cant.</th>
                                <th className="p-3 text-right">Precio Unitario</th>
                                <th className="p-3 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cot.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-medium text-slate-800">
                                    {item.descripcion}
                                  </td>
                                  <td className="p-3 text-center capitalize text-slate-600">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.tipo_item === "servicio"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-purple-50 text-purple-700"
                                      }`}
                                    >
                                      {item.tipo_item}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-semibold text-slate-700">
                                    {item.cantidad}
                                  </td>
                                  <td className="p-3 text-right text-slate-600">
                                    ${Number(item.precio_unitario).toLocaleString()} COP
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-800">
                                    ${Number(item.subtotal).toLocaleString()} COP
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No hay desglose detallado de ítems disponible.
                        </p>
                      )}
                    </div>

                    {/* Desglose Contable Formal (Subtotal, Descuento, IVA 19%, Total) */}
                    <div className="flex flex-col sm:flex-row justify-end">
                      <div className="w-full sm:w-80 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal Base:</span>
                          <span className="font-semibold text-slate-800">
                            ${Number(cot.subtotal || 0).toLocaleString()} COP
                          </span>
                        </div>

                        {Number(cot.descuento || 0) > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Descuento Comercial:</span>
                            <span className="font-semibold">
                              -${Number(cot.descuento).toLocaleString()} COP
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-slate-600">
                          <span>
                            IVA ({Number(cot.porcentaje_iva || 19)}%):
                          </span>
                          <span className="font-semibold text-slate-800">
                            ${Number(cot.iva || 0).toLocaleString()} COP
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                          <span>Total Liquidado:</span>
                          <span className="text-blue-700 text-base">
                            ${Number(cot.total).toLocaleString()} COP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Historial de Cambios / Bitácora */}
                    {cot.historial && cot.historial.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Bitácora y Estados del Proyecto
                        </h4>
                        <div className="space-y-2">
                          {cot.historial.map((h, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-white/70 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 capitalize">
                                  {h.estado.replace("_", " ")}
                                </span>
                                {h.observacion && (
                                  <span className="text-slate-600 text-[11px]">
                                    — {h.observacion}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 shrink-0">
                                {new Date(h.creado_en).toLocaleString("es-CO", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
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

      {/* Modal para Solicitar Ajuste */}
      {ajusteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              Solicitar Ajuste de Cotización
            </h3>
            <p className="text-xs text-slate-600">
              Indícanos qué cambios necesitas (ej. reducir cantidad de puntos de red, cambiar modelo de cámaras o ajustar el alcance).
            </p>
            <textarea
              rows={4}
              value={ajusteObservacion}
              onChange={(e) => setAjusteObservacion(e.target.value)}
              placeholder="Escribe tus requerimientos de ajuste aquí..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAjusteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!ajusteObservacion.trim()}
                onClick={() => {
                  if (cotizacionAjusteId) {
                    handleUpdateStatus(cotizacionAjusteId, "ajuste_solicitado", ajusteObservacion);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelQuotes;

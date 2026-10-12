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
} from "lucide-react";
import api from "../../services/api";
import type { Quote } from "../../types";

export const PanelQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("todas");

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

  const handleUpdateStatus = async (id: number, nuevoEstado: "aceptada" | "rechazada" | "ajuste_solicitado") => {
    setActionLoading(id);
    try {
      await api.patch(`/cotizaciones/${id}/estado`, {
        estado: nuevoEstado,
        observacion: `Estado actualizado a ${nuevoEstado} desde el panel de cliente`,
      });
      await fetchQuotes();
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
      case "aceptada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aceptada
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case "rechazada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      case "ajuste_solicitado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Ajuste Solicitado
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

  const filteredQuotes = quotes.filter((q) => {
    if (filter === "todas") return true;
    return q.estado === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Revisa los conceptos detallados, aprueba presupuestos formales y descarga propuestas en PDF.
          </p>
        </div>

        <Link
          to="/cotizador"
          className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Nueva Cotización con IA</span>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: "Todas", value: "todas" },
          { label: "Pendientes", value: "pendiente" },
          { label: "Aceptadas", value: "aceptada" },
          { label: "En Ajuste", value: "ajuste_solicitado" },
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
        <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100">
          Cargando listado de presupuestos...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="card-glass p-16 text-center space-y-4 border border-blue-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No hay cotizaciones para mostrar
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filter === "todas"
              ? "Aún no has generado cotizaciones. Chatea con nuestro asesor inteligente para calcular tarifas de cableado, CCTV o computadores."
              : `No tienes cotizaciones en estado "${filter}".`}
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
        <div className="space-y-4">
          {filteredQuotes.map((cot) => {
            const isExpanded = expandedId === cot.id;

            return (
              <div
                key={cot.id}
                className="card-glass p-6 border border-blue-100/80 transition-all hover:border-blue-200"
              >
                {/* Resumen Superior */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-slate-900">
                        Presupuesto #{cot.id}
                      </span>
                      {getStatusBadge(cot.estado)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Fecha de emisión: {new Date(cot.creado_en).toLocaleDateString("es-CO")}
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
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Valor Total (COP)
                      </span>
                      <span className="text-xl font-extrabold text-blue-700">
                        ${Number(cot.total).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPdf(cot.id)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        title="Descargar PDF formal"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cot.id)}
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? "Ocultar" : "Detalles"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desglose Expandible */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        Ítems y Conceptos Cotizados
                      </h4>

                      {cot.items && cot.items.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-3">Descripción</th>
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
                                    {item.tipo_item}
                                  </td>
                                  <td className="p-3 text-center font-semibold text-slate-700">
                                    {item.cantidad}
                                  </td>
                                  <td className="p-3 text-right text-slate-600">
                                    ${Number(item.precio_unitario).toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-800">
                                    ${Number(item.subtotal).toLocaleString()}
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

                    {/* Resumen de Valores & Acciones */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-slate-800">
                            ${Number(cot.subtotal).toLocaleString()} COP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Total con IVA:</span>
                          <span className="font-bold text-blue-700">
                            ${Number(cot.total).toLocaleString()} COP
                          </span>
                        </div>
                      </div>

                      {cot.estado === "pendiente" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            disabled={actionLoading === cot.id}
                            onClick={() => handleUpdateStatus(cot.id, "aceptada")}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs disabled:opacity-50"
                          >
                            Aceptar Cotización
                          </button>
                          <button
                            disabled={actionLoading === cot.id}
                            onClick={() => handleUpdateStatus(cot.id, "ajuste_solicitado")}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-50"
                          >
                            Solicitar Ajuste
                          </button>
                          <button
                            disabled={actionLoading === cot.id}
                            onClick={() => handleUpdateStatus(cot.id, "rechazada")}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PanelQuotes;

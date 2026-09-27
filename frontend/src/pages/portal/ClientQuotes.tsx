import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, XCircle, Clock, Bot, AlertCircle } from "lucide-react";
import api from "../../services/api";
import type { Quote } from "../../types";

export const ClientQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
        observacion: `Estado cambiado a ${nuevoEstado} desde el portal cliente`,
      });
      await fetchQuotes();
    } catch (e) {
      alert("No se pudo actualizar el estado de la cotización");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mis Cotizaciones</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revisa los conceptos detallados, aprueba presupuestos y descarga las propuestas formales.
          </p>
        </div>

        <Link
          to="/portal/cotizador"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          <Bot className="w-4 h-4" />
          Nueva Cotización IA
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Cargando cotizaciones...</div>
      ) : quotes.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No tienes cotizaciones activas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Puedes interactuar con nuestro asesor inteligente para cotizar redes, CCTV o servicios de soporte técnico.
          </p>
          <Link
            to="/portal/cotizador"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
          >
            Abrir Cotizador IA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
            >
              {/* Encabezado de la Cotización */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-white block">
                      Cotización #{q.id}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      Emitida el: {new Date(q.creado_en).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      q.estado === "aceptada"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : q.estado === "pendiente"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {q.estado}
                  </span>

                  <span className="text-lg font-extrabold text-cyan-400">
                    ${Number(q.total).toLocaleString()} COP
                  </span>
                </div>
              </div>

              {/* Items / Conceptos Cobrados (Paso 11.9) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Desglose de Conceptos:
                </span>
                {q.items && q.items.length > 0 ? (
                  <div className="space-y-1.5">
                    {q.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-300 py-1 border-b border-slate-900 last:border-0"
                      >
                        <span className="text-slate-300">
                          <strong className="text-cyan-400">[{item.tipo_item.toUpperCase()}]</strong>{" "}
                          {item.descripcion} (Cantidad: {item.cantidad})
                        </span>
                        <span className="font-semibold text-white">
                          ${Number(item.subtotal).toLocaleString()} COP
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Detalle general consolidado.</p>
                )}
              </div>

              {/* Acciones de Aceptación o Descarga */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-cyan-400" />
                  <span>Vigencia estándar de 15 días calendario garantizando disponibilidad de stock.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {q.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(q.id, "aceptada")}
                        disabled={actionLoading === q.id}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aceptar Cotización
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(q.id, "rechazada")}
                        disabled={actionLoading === q.id}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </>
                  )}

                  {q.estado === "aceptada" && (
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      Presupuesto Aprobado - Facturación Registrada
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientQuotes;

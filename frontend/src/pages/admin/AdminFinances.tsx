import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, FileText } from "lucide-react";
import api from "../../services/api";

export const AdminFinances: React.FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const res = await api.get("/cotizaciones/");
        setQuotes(res.data || []);
      } catch (e) {
        console.error("Error al cargar finanzas:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFinances();
  }, []);

  const cotizacionesAceptadas = quotes.filter((q) => q.estado === "aceptada");
  const ingresosTotales = cotizacionesAceptadas.reduce(
    (acc, q) => acc + Number(q.total || 0),
    0
  );
  const cotizacionesEnCola = quotes.filter((q) => q.estado === "pendiente");
  const ingresosProyectados = cotizacionesEnCola.reduce(
    (acc, q) => acc + Number(q.total || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando estado contable...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Finanzas & Control Contable</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Flujo de caja, ingresos automáticos por cotizaciones aprobadas y proyección trimestral.
        </p>
      </div>

      {/* Tarjetas Contables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Ingresos Facturados</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              ${ingresosTotales.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-emerald-400/80 block mt-1">Cotizaciones aprobadas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Flujo en Proyección</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
              ${ingresosProyectados.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-cyan-400/80 block mt-1">Presupuestos pendientes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Margen Promedio Comercial</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">32.5%</span>
            <span className="text-[11px] text-slate-500 block mt-1">Utilidad neta estimada</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Registro de Transacciones por Cotizaciones */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Libro de Entradas Contables por Cotizaciones
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Cargando registros contables...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            No hay transacciones financieras registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Ref. Cotización</th>
                  <th className="p-3">Cliente ID</th>
                  <th className="p-3">Fecha de Emisión</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-cyan-400 font-semibold">
                      Cotización #{q.id}
                    </td>
                    <td className="p-3 text-slate-400">Cliente #{q.cliente_id}</td>
                    <td className="p-3 text-slate-400">{new Date(q.creado_en).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          q.estado === "aceptada"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : q.estado === "pendiente"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {q.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ${Number(q.total).toLocaleString()} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinances;

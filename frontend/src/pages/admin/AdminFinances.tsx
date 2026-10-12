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
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando estado contable...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Finanzas & Control Contable</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Flujo de caja, ingresos automáticos por cotizaciones aprobadas y proyección contable.
        </p>
      </div>

      {/* Tarjetas Contables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-glass rounded-[20px] p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Ingresos Facturados</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              ${ingresosTotales.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-emerald-600/90 font-medium block mt-1">Cotizaciones aprobadas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass rounded-[20px] p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Flujo en Proyección</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
              ${ingresosProyectados.toLocaleString()} COP
            </span>
            <span className="text-[11px] text-blue-600/90 font-medium block mt-1">Presupuestos pendientes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="card-glass rounded-[20px] p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Margen Promedio Comercial</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">32.5%</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">Utilidad neta estimada</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Registro de Transacciones por Cotizaciones */}
      <div className="card-glass rounded-[20px] border border-slate-200/80 overflow-hidden shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Libro de Entradas Contables por Cotizaciones
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Cargando registros contables...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white/70 rounded-xl border border-slate-200">
            No hay transacciones financieras registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ref. Cotización</th>
                  <th className="p-3">Cliente ID</th>
                  <th className="p-3">Fecha de Emisión</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/50">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 font-mono text-blue-600 font-semibold">
                      Cotización #{q.id}
                    </td>
                    <td className="p-3 text-slate-600">Cliente #{q.cliente_id}</td>
                    <td className="p-3 text-slate-600">{new Date(q.creado_en).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          q.estado === "aceptada"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : q.estado === "pendiente"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {q.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
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

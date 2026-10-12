import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  FileText,
  PieChart,
  Plus,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import type {
  MetricasFinancierasAvanzadas,
  TransaccionFinanciera,
  CategoriaFinanciera,
} from "../../types";

export const AdminFinances: React.FC = () => {
  const [periodo, setPeriodo] = useState<
    "30_dias" | "mes_actual" | "trimestre" | "anio_actual" | "historico"
  >("mes_actual");
  const [metricas, setMetricas] = useState<MetricasFinancierasAvanzadas | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionFinanciera[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanciera[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabCatalogo, setTabCatalogo] = useState<"servicios" | "productos">("servicios");
  const [filtroTransacciones, setFiltroTransacciones] = useState<string>("todas");

  // Modal para registrar nueva transacción
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"gasto" | "inversion" | "ingreso">("gasto");
  const [modalCategoriaId, setModalCategoriaId] = useState<number | "">("");
  const [modalDescripcion, setModalDescripcion] = useState("");
  const [modalMonto, setModalMonto] = useState<number | "">("");
  const [modalEsFijo, setModalEsFijo] = useState(false);
  const [modalFecha, setModalFecha] = useState(new Date().toISOString().slice(0, 10));
  const [modalLoading, setModalLoading] = useState(false);

  const fetchFinanzas = async () => {
    setLoading(true);
    try {
      const [resMetricas, resTransacciones, resCategorias] = await Promise.all([
        api.get<MetricasFinancierasAvanzadas>(`/finanzas/metricas/avanzadas?periodo=${periodo}`),
        api.get<TransaccionFinanciera[]>("/finanzas/transacciones?limite=50"),
        api.get<CategoriaFinanciera[]>("/finanzas/categorias"),
      ]);

      setMetricas(resMetricas.data);
      setTransacciones(resTransacciones.data || []);
      setCategorias(resCategorias.data || []);
    } catch (e) {
      console.error("Error al cargar finanzas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanzas();
  }, [periodo]);

  const handleCrearTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCategoriaId || !modalDescripcion || !modalMonto) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    setModalLoading(true);
    try {
      await api.post("/finanzas/transacciones", {
        categoria_id: Number(modalCategoriaId),
        tipo: modalTipo,
        descripcion: modalDescripcion.trim(),
        monto: Number(modalMonto),
        es_fijo: modalEsFijo,
        fecha: modalFecha,
      });

      setModalOpen(false);
      setModalDescripcion("");
      setModalMonto("");
      setModalCategoriaId("");
      await fetchFinanzas();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al registrar la transacción contable");
    } finally {
      setModalLoading(false);
    }
  };

  const periodosLabel = {
    "30_dias": "Últimos 30 días",
    mes_actual: "Mes Actual",
    trimestre: "Trimestre",
    anio_actual: "Año Actual",
    historico: "Histórico Total",
  };

  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTransacciones === "todas") return true;
    return t.tipo === filtroTransacciones;
  });

  // Cálculo del valor máximo para las barras comparativas
  const maxMontoGrafica = Math.max(
    Number(metricas?.ingresos_verificados || 0),
    Number(metricas?.posible_venta || 0),
    Number(metricas?.gastos_operativos || 0),
    Number(metricas?.inversion_total || 0),
    Number(metricas?.ganancia_neta || 0),
    1
  );

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* 1. Cabecera y Selector de Periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centro de Finanzas & Rentabilidad
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Separación estricta de ingresos reales vs proyecciones, rentabilidad por producto/servicio y flujo de caja contable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Periodo */}
          <div className="inline-flex rounded-xl bg-white/80 p-1 border border-slate-200 shadow-2xs">
            {(["30_dias", "mes_actual", "trimestre", "anio_actual", "historico"] as const).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    periodo === p
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {periodosLabel[p]}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => {
              if (categorias.length > 0 && modalCategoriaId === "") {
                const primerVal = categorias.find((c) => c.tipo === "gasto");
                if (primerVal) setModalCategoriaId(primerVal.id);
              }
              setModalOpen(true);
            }}
            className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* 2. Cinco Tarjetas Clave con Definiciones Inequívocas */}
      {loading ? (
        <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-blue-100">
          Calculando libro contable y métricas avanzadas...
        </div>
      ) : metricas ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* TARJETA 1: INGRESO VERIFICADO */}
          <div className="card-glass rounded-[20px] p-5 border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-emerald-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Ingreso Verificado
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight block">
                ${Number(metricas.ingresos_verificados).toLocaleString()} COP
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                {metricas.cantidad_proyectos_concretados} proyecto(s) culminado(s)
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-100 text-[10px] text-slate-500 leading-tight">
              <strong>Definición:</strong> Pagos efectivamente percibidos por proyectos concretados o entradas confirmadas. No incluye promesas de venta.
            </div>
          </div>

          {/* TARJETA 2: POSIBLE VENTA (EN EMBUDO) */}
          <div className="card-glass rounded-[20px] p-5 border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-blue-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Posible Venta (Embudo)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight block">
                ${Number(metricas.posible_venta).toLocaleString()} COP
              </span>
              <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                {metricas.cantidad_cotizaciones_en_curso} cotización(es) en trámite
              </span>
            </div>

            <div className="pt-2 border-t border-blue-100 text-[10px] text-slate-500 leading-tight">
              <strong>Definición:</strong> Presupuestos emitidos, aprobados o en ejecución que aún están en proceso y no se han liquidado como ingreso.
            </div>
          </div>

          {/* TARJETA 3: GASTOS OPERATIVOS */}
          <div className="card-glass rounded-[20px] p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-amber-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Gastos Operativos
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight block">
                ${Number(metricas.gastos_operativos).toLocaleString()} COP
              </span>
              <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">
                Costos de funcionamiento directo
              </span>
            </div>

            <div className="pt-2 border-t border-amber-100 text-[10px] text-slate-500 leading-tight">
              <strong>Definición:</strong> Egresos corrientes (viáticos, consumibles, nómina de técnicos, servicios) gastados en el periodo.
            </div>
          </div>

          {/* TARJETA 4: INVERSIÓN TOTAL */}
          <div className="card-glass rounded-[20px] p-5 border border-indigo-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-indigo-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                Inversión en Activos
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight block">
                ${Number(metricas.inversion_total).toLocaleString()} COP
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">
                Herramientas, equipos & licencias
              </span>
            </div>

            <div className="pt-2 border-t border-indigo-100 text-[10px] text-slate-500 leading-tight">
              <strong>Definición:</strong> Compras de activos fijos, instrumental de medición, servidores o equipos duraderos que aumentan el patrimonio.
            </div>
          </div>

          {/* TARJETA 5: GANANCIA NETA & MARGEN */}
          <div
            className={`card-glass rounded-[20px] p-5 border shadow-xs flex flex-col justify-between space-y-3 ${
              Number(metricas.ganancia_neta) >= 0
                ? "border-blue-300 bg-gradient-to-br from-white/95 to-blue-100/50"
                : "border-rose-300 bg-gradient-to-br from-white/95 to-rose-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Ganancia Neta
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  Number(metricas.ganancia_neta) >= 0
                    ? "bg-blue-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight block ${
                  Number(metricas.ganancia_neta) >= 0 ? "text-blue-700" : "text-rose-600"
                }`}
              >
                ${Number(metricas.ganancia_neta).toLocaleString()} COP
              </span>
              <span className="text-[11px] text-slate-600 font-bold block mt-0.5">
                Margen Comercial: {metricas.margen_promedio_comercial}%
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
              <strong>Definición:</strong> Utilidad neta real = Ingreso Verificado menos (Gastos Operativos + Inversión en activos).
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Gráfica Visual Interactiva del Flujo Comparativo */}
      {metricas && metricas.flujo_comparativo && (
        <div className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Distribución y Balance Financiero Comparativo
              </h3>
              <p className="text-xs text-slate-500">
                Visualización de escala para medir proporción de ingresos frente a costos e inversión en el periodo ({periodosLabel[periodo]}).
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Período Activo: <span className="text-blue-700 font-bold">{periodosLabel[periodo]}</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {metricas.flujo_comparativo.map((item, idx) => {
              const porcentaje =
                maxMontoGrafica > 0
                  ? Math.min(100, Math.max(4, (Math.abs(item.monto) / maxMontoGrafica) * 100))
                  : 4;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.etiqueta}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ${Math.round(item.monto).toLocaleString()} COP
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${porcentaje}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tablas de Rentabilidad Desglosada por Catálogo */}
      <div className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Margen de Ganancia por Producto y Servicio
            </h3>
            <p className="text-xs text-slate-500">
              Análisis unitario de costo vs precio de venta y rentabilidad total generada en cotizaciones aceptadas o concluidas.
            </p>
          </div>

          {/* Pestañas de Servicios vs Productos */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setTabCatalogo("servicios")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                tabCatalogo === "servicios"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Servicios Técnicos ({metricas?.ganancias_por_servicio?.length || 0})
            </button>
            <button
              onClick={() => setTabCatalogo("productos")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                tabCatalogo === "productos"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Productos & Repuestos ({metricas?.ganancias_por_producto?.length || 0})
            </button>
          </div>
        </div>

        {tabCatalogo === "servicios" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Servicio Técnico</th>
                  <th className="p-3 text-right">Tarifa Venta</th>
                  <th className="p-3 text-right">Costo Operativo</th>
                  <th className="p-3 text-right">Ganancia Unitaria</th>
                  <th className="p-3 text-center">Margen</th>
                  <th className="p-3 text-center">Vendidas</th>
                  <th className="p-3 text-right">Utilidad Generada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metricas?.ganancias_por_servicio?.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{s.nombre}</td>
                    <td className="p-3 text-right">${Number(s.precio_venta).toLocaleString()} COP</td>
                    <td className="p-3 text-right text-slate-500">${Number(s.costo).toLocaleString()} COP</td>
                    <td className="p-3 text-right font-semibold text-emerald-700">
                      ${Number(s.ganancia_unitaria).toLocaleString()} COP
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.margen_porcentaje}%
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">{s.unidades_vendidas}</td>
                    <td className="p-3 text-right font-black text-blue-700">
                      ${Number(s.ganancia_total_generada).toLocaleString()} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Producto / Equipo</th>
                  <th className="p-3 text-right">Costo Proveedor</th>
                  <th className="p-3 text-right">Precio Venta</th>
                  <th className="p-3 text-right">Ganancia Unitaria</th>
                  <th className="p-3 text-center">Margen</th>
                  <th className="p-3 text-center">Vendidas</th>
                  <th className="p-3 text-right">Utilidad Generada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metricas?.ganancias_por_producto?.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{p.nombre}</td>
                    <td className="p-3 text-right text-slate-500">${Number(p.costo).toLocaleString()} COP</td>
                    <td className="p-3 text-right">${Number(p.precio_venta).toLocaleString()} COP</td>
                    <td className="p-3 text-right font-semibold text-emerald-700">
                      ${Number(p.ganancia_unitaria).toLocaleString()} COP
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        {p.margen_porcentaje}%
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">{p.unidades_vendidas}</td>
                    <td className="p-3 text-right font-black text-purple-700">
                      ${Number(p.ganancia_total_generada).toLocaleString()} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Libro Diario de Transacciones Recientes */}
      <div className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Libro Diario de Transacciones Contables
            </h3>
            <p className="text-xs text-slate-500">
              Registro cronológico de ingresos asentados, gastos corrientes e inversiones en capital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {[
              { label: "Todas", value: "todas" },
              { label: "Ingresos", value: "ingreso" },
              { label: "Gastos", value: "gasto" },
              { label: "Inversiones", value: "inversion" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroTransacciones(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filtroTransacciones === f.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {transaccionesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white/50 rounded-xl border border-slate-200">
            No hay movimientos contables registrados bajo este criterio.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3 text-center">Naturaleza</th>
                  <th className="p-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transaccionesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-slate-600 font-mono">
                      {new Date(t.fecha).toLocaleDateString("es-CO")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.tipo === "ingreso"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.tipo === "inversion"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.tipo}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {t.categoria_nombre || "General"}
                    </td>
                    <td className="p-3 text-slate-600">{t.descripcion}</td>
                    <td className="p-3 text-center">
                      <span className="text-[11px] text-slate-500">
                        {t.es_fijo ? "Fijo recurrente" : "Variable"}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-black ${
                        t.tipo === "ingreso" ? "text-emerald-700" : "text-slate-900"
                      }`}
                    >
                      {t.tipo === "ingreso" ? "+" : "-"}${Number(t.monto).toLocaleString()} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PARA REGISTRAR NUEVA TRANSACCIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Registrar Movimiento Financiero
            </h3>
            <p className="text-xs text-slate-600">
              Ingresa un gasto operativo, una inversión en infraestructura o un ingreso puntual al libro mayor.
            </p>

            <form onSubmit={handleCrearTransaccion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento</label>
                  <select
                    value={modalTipo}
                    onChange={(e) => {
                      const t = e.target.value as "gasto" | "inversion" | "ingreso";
                      setModalTipo(t);
                      const primera = categorias.find((c) => c.tipo === t);
                      if (primera) setModalCategoriaId(primera.id);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="gasto">Gasto Operativo</option>
                    <option value="inversion">Inversión en Activos</option>
                    <option value="ingreso">Ingreso Manual</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={modalCategoriaId}
                    onChange={(e) => setModalCategoriaId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                    required
                  >
                    {categorias
                      .filter((c) => c.tipo === modalTipo)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    {categorias.filter((c) => c.tipo === modalTipo).length === 0 && (
                      <option value="">(Sin categorías para {modalTipo})</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción del Movimiento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra de pinzas ponchadoras y tester Fluke"
                  value={modalDescripcion}
                  onChange={(e) => setModalDescripcion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monto (COP)</label>
                  <input
                    type="number"
                    min="100"
                    step="1000"
                    required
                    placeholder="Monto en pesos"
                    value={modalMonto}
                    onChange={(e) => setModalMonto(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={modalFecha}
                    onChange={(e) => setModalFecha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkFijo"
                  checked={modalEsFijo}
                  onChange={(e) => setModalEsFijo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="chkFijo" className="text-slate-700 cursor-pointer font-medium">
                  ¿Es un costo/gasto fijo recurrente? (ej. alquiler de bodega o suscripción)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {modalLoading ? "Registrando..." : "Guardar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinances;

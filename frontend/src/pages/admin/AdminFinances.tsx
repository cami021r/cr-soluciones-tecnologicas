import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  FileText,
  Plus,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  Calendar,
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
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [resumenAnual, setResumenAnual] = useState<{
    labels: string[];
    datasets: { label: string; data: number[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabCatalogo, setTabCatalogo] = useState<"servicios" | "productos">("servicios");
  const [filtroTransacciones, setFiltroTransacciones] = useState<string>("todas");

  // Modales de detalle
  const [modalIngresoDetalleOpen, setModalIngresoDetalleOpen] = useState(false);
  const [modalEmbudoDetalleOpen, setModalEmbudoDetalleOpen] = useState(false);
  const [modalInversionDetalleOpen, setModalInversionDetalleOpen] = useState(false);
  const [modalGananciaDetalleOpen, setModalGananciaDetalleOpen] = useState(false);

  // Modal para registrar nueva transacción
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"gasto" | "inversion" | "ingreso">("gasto");
  const [modalCategoriaId, setModalCategoriaId] = useState<number | "">("");
  const [modalDescripcion, setModalDescripcion] = useState("");
  const [modalMonto, setModalMonto] = useState<number | "">("");
  const [modalEsFijo, setModalEsFijo] = useState(false);
  const [modalFecha, setModalFecha] = useState(new Date().toISOString().slice(0, 10));
  const [modalLoading, setModalLoading] = useState(false);

  // Modal para editar transacción existente
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [transaccionEdit, setTransaccionEdit] = useState<TransaccionFinanciera | null>(null);
  const [editCategoriaId, setEditCategoriaId] = useState<number | "">("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editMonto, setEditMonto] = useState<number | "">("");
  const [editTipo, setEditTipo] = useState<"gasto" | "inversion" | "ingreso">("gasto");
  const [editEsFijo, setEditEsFijo] = useState(false);
  const [editFecha, setEditFecha] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchFinanzas = async () => {
    setLoading(true);
    try {
      const anioActual = new Date().getFullYear();
      const [resMetricas, resTransacciones, resCategorias, resCotizaciones, resAnual] =
        await Promise.all([
          api.get<MetricasFinancierasAvanzadas>(`/finanzas/metricas/avanzadas?periodo=${periodo}`),
          api.get<TransaccionFinanciera[]>("/finanzas/transacciones?limite=100"),
          api.get<CategoriaFinanciera[]>("/finanzas/categorias"),
          api.get<any[]>("/cotizaciones/").catch(() => ({ data: [] })),
          api
            .get<any>(`/finanzas/graficas/resumen-anual?anio=${anioActual}`)
            .catch(() => ({ data: null })),
        ]);

      setMetricas(resMetricas.data);
      setTransacciones(resTransacciones.data || []);
      setCategorias(resCategorias.data || []);
      setCotizaciones(resCotizaciones.data || []);
      if (resAnual.data) {
        setResumenAnual(resAnual.data);
      }
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

  const handleAbrirEditar = (t: TransaccionFinanciera) => {
    setTransaccionEdit(t);
    setEditCategoriaId(t.categoria_id);
    setEditDescripcion(t.descripcion);
    setEditMonto(Number(t.monto));
    setEditTipo(t.tipo);
    setEditEsFijo(t.es_fijo);
    setEditFecha(t.fecha ? String(t.fecha).slice(0, 10) : "");
    setModalEditarOpen(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaccionEdit) return;

    setEditLoading(true);
    try {
      await api.patch(`/finanzas/transacciones/${transaccionEdit.id}`, {
        categoria_id: editCategoriaId ? Number(editCategoriaId) : undefined,
        tipo: editTipo,
        descripcion: editDescripcion.trim(),
        monto: Number(editMonto),
        es_fijo: editEsFijo,
        fecha: editFecha,
      });

      setModalEditarOpen(false);
      setTransaccionEdit(null);
      await fetchFinanzas();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al actualizar la transacción");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEliminarTransaccion = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de anular la transacción contable #${id}?`)) return;

    try {
      await api.delete(`/finanzas/transacciones/${id}`);
      await fetchFinanzas();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al eliminar la transacción");
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

  // Filtros de cotizaciones para modales de detalle
  const cotizacionesConcretadas = cotizaciones.filter((c) => c.estado === "concretado");
  const estadosEmbudo = [
    "pendiente",
    "aceptada",
    "aprobada",
    "contactado",
    "agendado",
    "en_ejecucion",
    "en_ajuste",
    "ajuste_solicitado",
  ];
  const cotizacionesEnEmbudo = cotizaciones.filter((c) => estadosEmbudo.includes(c.estado));
  const transaccionesInversion = transacciones.filter((t) => t.tipo === "inversion");

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* 1. Cabecera y Selector de Periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centro de Finanzas & Rentabilidad
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Control de ingresos verificados, posibles ventas en trámite, gastos operativos, activos y balances mensuales.
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

      {/* 2. Cinco Tarjetas Clave Interactivas (Hacer clic abre el detalle) */}
      {loading ? (
        <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-blue-100">
          Calculando libro contable y métricas avanzadas...
        </div>
      ) : metricas ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* TARJETA 1: INGRESO VERIFICADO (Clic para ver de dónde salió) */}
          <div
            onClick={() => setModalIngresoDetalleOpen(true)}
            className="card-glass rounded-[20px] p-5 border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-emerald-50/40 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Ingreso Verificado
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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

            <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
              <span>Ver detalle de origen</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* TARJETA 2: POSIBLE VENTA EN EMBUDO (Clic para ver cotizaciones en curso) */}
          <div
            onClick={() => setModalEmbudoDetalleOpen(true)}
            className="card-glass rounded-[20px] p-5 border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-blue-50/40 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Posible Venta (Embudo)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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

            <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-700 font-bold">
              <span>Ver cotizaciones en curso</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* TARJETA 3: GASTOS OPERATIVOS */}
          <div
            onClick={() => {
              setFiltroTransacciones("gasto");
              const el = document.getElementById("libro-diario-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="card-glass rounded-[20px] p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-amber-50/40 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Gastos Operativos
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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

            <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-700 font-bold">
              <span>Gestionar y editar gastos</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* TARJETA 4: INVERSIÓN TOTAL EN ACTIVOS (Clic para ver control de activos) */}
          <div
            onClick={() => setModalInversionDetalleOpen(true)}
            className="card-glass rounded-[20px] p-5 border border-indigo-200/80 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white/95 to-indigo-50/40 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                Inversión en Activos
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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

            <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] text-indigo-700 font-bold">
              <span>Ver control de activos</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* TARJETA 5: GANANCIA NETA & DESGLOSE HISTÓRICO (Clic para ver meses rentables) */}
          <div
            onClick={() => setModalGananciaDetalleOpen(true)}
            className={`card-glass rounded-[20px] p-5 border shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all group ${
              Number(metricas.ganancia_neta) >= 0
                ? "border-blue-300 bg-gradient-to-br from-white/95 to-blue-100/50 hover:border-blue-500"
                : "border-rose-300 bg-gradient-to-br from-white/95 to-rose-50/50 hover:border-rose-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Ganancia Neta
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
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

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-blue-700 font-bold">
              <span>Ver historial de qué meses</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Resumen Histórico de Ganancia Neta Mensual */}
      {resumenAnual && resumenAnual.labels && (
        <div className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Historial Mensual de Rentabilidad ({new Date().getFullYear()})
              </h3>
              <p className="text-xs text-slate-500">
                Resumen de qué meses generaron utilidades netas, ingresos verificados y gastos operados.
              </p>
            </div>
            <button
              onClick={() => setModalGananciaDetalleOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start sm:self-auto transition-colors"
            >
              Ver Detalle Completo
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Mes</th>
                  <th className="p-3 text-right">Ingresos Verificados</th>
                  <th className="p-3 text-right">Gastos Operativos</th>
                  <th className="p-3 text-right">Ganancia Neta</th>
                  <th className="p-3 text-center">Estado del Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resumenAnual.labels.map((mesNombre, idx) => {
                  const ingresos = resumenAnual.datasets[0]?.data[idx] || 0;
                  const gastos = resumenAnual.datasets[1]?.data[idx] || 0;
                  const utilidad = resumenAnual.datasets[2]?.data[idx] || 0;
                  const esPositivo = utilidad > 0;
                  const esCero = utilidad === 0 && ingresos === 0 && gastos === 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{mesNombre}</td>
                      <td className="p-3 text-right text-emerald-700 font-semibold">
                        ${Math.round(ingresos).toLocaleString()} COP
                      </td>
                      <td className="p-3 text-right text-amber-700 font-semibold">
                        ${Math.round(gastos).toLocaleString()} COP
                      </td>
                      <td
                        className={`p-3 text-right font-black ${
                          esPositivo ? "text-blue-700" : utilidad < 0 ? "text-rose-600" : "text-slate-500"
                        }`}
                      >
                        ${Math.round(utilidad).toLocaleString()} COP
                      </td>
                      <td className="p-3 text-center">
                        {esCero ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Sin movimientos
                          </span>
                        ) : esPositivo ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Rentable
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Déficit
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

      {/* 5. Libro Diario de Transacciones Recientes (con Editar y Eliminar) */}
      <div id="libro-diario-section" className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Libro Diario de Transacciones Contables
            </h3>
            <p className="text-xs text-slate-500">
              Registro cronológico con edición y eliminación de gastos, ingresos e inversiones.
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
                  <th className="p-3 text-center">Acciones</th>
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
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleAbrirEditar(t)}
                          title="Editar transacción"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEliminarTransaccion(t.id)}
                          title="Eliminar transacción"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: DETALLE DE INGRESO VERIFICADO (DE DÓNDE SALIÓ) */}
      {/* ======================================================== */}
      {modalIngresoDetalleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-emerald-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Origen de Ingreso Verificado
                </h3>
                <p className="text-xs text-slate-500">
                  Desglose exacto de proyectos culminados y cobrados que integran esta cifra.
                </p>
              </div>
              <button
                onClick={() => setModalIngresoDetalleOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-800">Total Ingreso Percibido:</span>
                <span className="text-base font-black text-emerald-800">
                  ${Number(metricas?.ingresos_verificados || 0).toLocaleString()} COP
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Proyectos Concretados ({cotizacionesConcretadas.length})
                </h4>
                {cotizacionesConcretadas.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                    No hay proyectos en estado "concretado" registrados en este periodo.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Cotización</th>
                          <th className="p-2.5">Cliente</th>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cotizacionesConcretadas.map((c) => (
                          <tr key={c.id}>
                            <td className="p-2.5 font-bold text-blue-700">#{c.id}</td>
                            <td className="p-2.5">{c.cliente_nombre || c.cliente_empresa || "Cliente"}</td>
                            <td className="p-2.5 text-slate-500">
                              {new Date(c.creado_en).toLocaleDateString("es-CO")}
                            </td>
                            <td className="p-2.5 text-right font-black text-emerald-700">
                              ${Number(c.total).toLocaleString()} COP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Transacciones Contables Directas de Ingreso (
                  {transacciones.filter((t) => t.tipo === "ingreso").length})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Descripción</th>
                        <th className="p-2.5">Categoría</th>
                        <th className="p-2.5 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {transacciones
                        .filter((t) => t.tipo === "ingreso")
                        .map((t) => (
                          <tr key={t.id}>
                            <td className="p-2.5 font-mono text-slate-500">
                              {new Date(t.fecha).toLocaleDateString("es-CO")}
                            </td>
                            <td className="p-2.5 font-medium">{t.descripcion}</td>
                            <td className="p-2.5 text-slate-500">{t.categoria_nombre || "General"}</td>
                            <td className="p-2.5 text-right font-black text-emerald-700">
                              +${Number(t.monto).toLocaleString()} COP
                            </td>
                          </tr>
                        ))}
                      {transacciones.filter((t) => t.tipo === "ingreso").length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400">
                            Sin transacciones manuales de ingreso.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalIngresoDetalleOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DETALLE DE POSIBLE VENTA (EN EMBUDO COMERCIAL)  */}
      {/* ======================================================== */}
      {modalEmbudoDetalleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-blue-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-blue-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Embudo Comercial & Posibles Ventas
                </h3>
                <p className="text-xs text-slate-500">
                  Cotizaciones activas en trámite que no han sido liquidadas como ingreso.
                </p>
              </div>
              <button
                onClick={() => setModalEmbudoDetalleOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <span className="font-bold text-blue-800">Total Proyectado en Embudo:</span>
                <span className="text-base font-black text-blue-800">
                  ${Number(metricas?.posible_venta || 0).toLocaleString()} COP
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Cotizaciones en Proceso ({cotizacionesEnEmbudo.length})
                </h4>
                {cotizacionesEnEmbudo.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                    No hay cotizaciones activas en curso actualmente.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Cliente</th>
                          <th className="p-2.5">Estado</th>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5 text-right">Total Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cotizacionesEnEmbudo.map((c) => (
                          <tr key={c.id}>
                            <td className="p-2.5 font-bold text-blue-700">#{c.id}</td>
                            <td className="p-2.5">{c.cliente_nombre || c.cliente_empresa || "Cliente"}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                {c.estado}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-500">
                              {new Date(c.creado_en).toLocaleDateString("es-CO")}
                            </td>
                            <td className="p-2.5 text-right font-black text-blue-700">
                              ${Number(c.total).toLocaleString()} COP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalEmbudoDetalleOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CONTROL DE INVERSIÓN EN ACTIVOS                 */}
      {/* ======================================================== */}
      {modalInversionDetalleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-indigo-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-indigo-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Control de Inversión en Activos & Equipamiento
                </h3>
                <p className="text-xs text-slate-500">
                  Herramientas, servidores, instrumentación de red y compras duraderas de capital.
                </p>
              </div>
              <button
                onClick={() => setModalInversionDetalleOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <span className="font-bold text-indigo-800">Total Invertido en Activos:</span>
                <span className="text-base font-black text-indigo-800">
                  ${Number(metricas?.inversion_total || 0).toLocaleString()} COP
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Registro de Activos e Inversiones ({transaccionesInversion.length})
                </h4>
                {transaccionesInversion.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                    No se han registrado compras de activos fijos aún.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5">Descripción del Activo</th>
                          <th className="p-2.5">Categoría</th>
                          <th className="p-2.5 text-right">Inversión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {transaccionesInversion.map((t) => (
                          <tr key={t.id}>
                            <td className="p-2.5 font-mono text-slate-500">
                              {new Date(t.fecha).toLocaleDateString("es-CO")}
                            </td>
                            <td className="p-2.5 font-medium">{t.descripcion}</td>
                            <td className="p-2.5 text-slate-500">{t.categoria_nombre || "Herramientas"}</td>
                            <td className="p-2.5 text-right font-black text-indigo-700">
                              ${Number(t.monto).toLocaleString()} COP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setModalInversionDetalleOpen(false);
                  setModalTipo("inversion");
                  setModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Nuevo Activo</span>
              </button>
              <button
                onClick={() => setModalInversionDetalleOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DETALLE DE GANANCIA NETA POR MESES              */}
      {/* ======================================================== */}
      {modalGananciaDetalleOpen && resumenAnual && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-blue-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Desglose de Ganancia Neta Mes a Mes ({new Date().getFullYear()})
                </h3>
                <p className="text-xs text-slate-500">
                  Identificación de meses con ganancias reales y balance de flujo financiero.
                </p>
              </div>
              <button
                onClick={() => setModalGananciaDetalleOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Mes</th>
                      <th className="p-2.5 text-right">Ingresos</th>
                      <th className="p-2.5 text-right">Gastos</th>
                      <th className="p-2.5 text-right">Ganancia Neta</th>
                      <th className="p-2.5 text-center">Rentabilidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {resumenAnual.labels.map((m, idx) => {
                      const ing = resumenAnual.datasets[0]?.data[idx] || 0;
                      const gas = resumenAnual.datasets[1]?.data[idx] || 0;
                      const ut = resumenAnual.datasets[2]?.data[idx] || 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-900">{m}</td>
                          <td className="p-2.5 text-right text-emerald-700 font-semibold">
                            ${Math.round(ing).toLocaleString()} COP
                          </td>
                          <td className="p-2.5 text-right text-amber-700 font-semibold">
                            ${Math.round(gas).toLocaleString()} COP
                          </td>
                          <td
                            className={`p-2.5 text-right font-black ${
                              ut > 0 ? "text-blue-700" : ut < 0 ? "text-rose-600" : "text-slate-400"
                            }`}
                          >
                            ${Math.round(ut).toLocaleString()} COP
                          </td>
                          <td className="p-2.5 text-center">
                            {ut > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Superávit
                              </span>
                            ) : ut < 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Déficit
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Equilibrado
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalGananciaDetalleOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA REGISTRAR NUEVA TRANSACCIÓN                   */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Registrar Movimiento Financiero
            </h3>
            <p className="text-xs text-slate-600">
              Ingresa un gasto operativo, una inversión en activos o un ingreso puntual al libro mayor.
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
                  ¿Es un costo/gasto fijo recurrente? (ej. alquiler o nómina)
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

      {/* ======================================================== */}
      {/* MODAL PARA EDITAR TRANSACCIÓN CONTABLE EXISTENTE        */}
      {/* ======================================================== */}
      {modalEditarOpen && transaccionEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              Modificar Transacción #{transaccionEdit.id}
            </h3>
            <p className="text-xs text-slate-600">
              Actualiza los detalles, monto, fecha o categoría de este movimiento contable.
            </p>

            <form onSubmit={handleGuardarEdicion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento</label>
                  <select
                    value={editTipo}
                    onChange={(e) => {
                      const t = e.target.value as "gasto" | "inversion" | "ingreso";
                      setEditTipo(t);
                      const primera = categorias.find((c) => c.tipo === t);
                      if (primera) setEditCategoriaId(primera.id);
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
                    value={editCategoriaId}
                    onChange={(e) => setEditCategoriaId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                    required
                  >
                    {categorias
                      .filter((c) => c.tipo === editTipo)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
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
                    value={editMonto}
                    onChange={(e) => setEditMonto(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkEditFijo"
                  checked={editEsFijo}
                  onChange={(e) => setEditEsFijo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="chkEditFijo" className="text-slate-700 cursor-pointer font-medium">
                  ¿Es un costo/gasto fijo recurrente?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {editLoading ? "Guardando..." : "Guardar Cambios"}
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

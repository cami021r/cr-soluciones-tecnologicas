import React, { useEffect, useState } from "react";
import {
  Box,
  Plus,
  QrCode,
  Printer,
  Search,
  Users,
  Building,
  History,
  Edit,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Equipment } from "../../types";

interface ExtendedEquipment extends Equipment {
  categoria_id?: number | null;
  cliente_id?: number | null;
  cliente_nombre?: string | null;
  cliente_empresa?: string | null;
  tipo_relacion?: "empresa" | "venta" | "arriendo" | null;
  categoria_nombre?: string | null;
}

interface ClienteOption {
  id: number;
  nombre_completo: string;
  nombre_empresa?: string | null;
}

interface MovimientoItem {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  observacion: string | null;
  fecha: string;
  usuario_id: number;
}

export const AdminInventory: React.FC = () => {
  const { isAdmin } = useAuth();
  const [equipments, setEquipments] = useState<ExtendedEquipment[]>([]);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Segmentación y filtros
  const [activeSegment, setActiveSegment] = useState<"empresa" | "cliente">("empresa");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterRelation, setFilterRelation] = useState<string>("");
  const [filterClientId, setFilterClientId] = useState<string>("");

  // Modal Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    categoria_id: 1,
    numero_serie: "",
    marca: "",
    modelo: "",
    descripcion: "",
    estado: "disponible",
    fecha_compra: "",
    garantia_hasta: "",
    cliente_id: "",
    tipo_relacion: "empresa",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Modal Editar
  const [editEquipment, setEditEquipment] = useState<ExtendedEquipment | null>(null);
  const [editFormData, setEditFormData] = useState({
    categoria_id: 1,
    marca: "",
    modelo: "",
    descripcion: "",
    estado: "disponible",
    garantia_hasta: "",
    cliente_id: "",
    tipo_relacion: "empresa",
    observacion_cambio: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Modal QR Imprimir
  const [qrModalEquipment, setQrModalEquipment] = useState<ExtendedEquipment | null>(null);

  // Modal Historial
  const [historyEquipment, setHistoryEquipment] = useState<ExtendedEquipment | null>(null);
  const [historyItems, setHistoryItems] = useState<MovimientoItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal Crear Categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCategory(true);
    try {
      await api.post("/inventario/categorias", {
        nombre: newCatName.trim(),
        descripcion: newCatDesc.trim() || undefined,
      });
      setShowCategoryModal(false);
      setNewCatName("");
      setNewCatDesc("");
      const res = await api.get("/inventario/categorias");
      setCategories(res.data || []);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al registrar la categoría");
    } finally {
      setCreatingCategory(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const [resE, resC, resCli] = await Promise.all([
        api.get<any>("/inventario", {
          params: {
            segmento: activeSegment,
            por_pagina: 100,
          },
        }),
        api.get<{ id: number; nombre: string }[]>("/inventario/categorias").catch(() => ({ data: [] })),
        api.get<any[]>("/clientes").catch(() => ({ data: [] })),
      ]);

      const dataEquipos = resE.data;
      setEquipments(Array.isArray(dataEquipos) ? dataEquipos : dataEquipos?.resultados || []);
      setCategories(resC.data || []);
      setClientes(
        (resCli.data || []).map((c: any) => ({
          id: c.id,
          nombre_completo: c.nombre_completo || c.nombre,
          nombre_empresa: c.nombre_empresa,
        }))
      );
    } catch (e) {
      console.error("Error al cargar inventario:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeSegment]);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await api.post("/inventario/", {
        ...formData,
        categoria_id: Number(formData.categoria_id),
        cliente_id: formData.cliente_id ? Number(formData.cliente_id) : null,
        tipo_relacion: formData.tipo_relacion,
        garantia_hasta: formData.garantia_hasta || null,
        fecha_compra: formData.fecha_compra || null,
      });

      setShowCreateModal(false);
      setFormData({
        categoria_id: categories[0]?.id || 1,
        numero_serie: "",
        marca: "",
        modelo: "",
        descripcion: "",
        estado: "disponible",
        fecha_compra: "",
        garantia_hasta: "",
        cliente_id: "",
        tipo_relacion: "empresa",
      });
      await fetchInventory();
    } catch (err: any) {
      alert("Error al registrar equipo. Verifica el número de serie único.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEdit = (eq: ExtendedEquipment) => {
    setEditEquipment(eq);
    setEditFormData({
      categoria_id: eq.categoria?.id || eq.categoria_id || 1,
      marca: eq.marca,
      modelo: eq.modelo,
      descripcion: eq.descripcion || "",
      estado: eq.estado,
      garantia_hasta: eq.garantia_hasta ? eq.garantia_hasta.substring(0, 10) : "",
      cliente_id: eq.cliente_id ? String(eq.cliente_id) : "",
      tipo_relacion: eq.tipo_relacion || "empresa",
      observacion_cambio: "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEquipment) return;
    setEditLoading(true);

    try {
      await api.patch(`/inventario/${editEquipment.id}`, {
        categoria_id: Number(editFormData.categoria_id),
        marca: editFormData.marca,
        modelo: editFormData.modelo,
        descripcion: editFormData.descripcion,
        estado: editFormData.estado,
        garantia_hasta: editFormData.garantia_hasta || null,
        cliente_id: editFormData.cliente_id ? Number(editFormData.cliente_id) : null,
        tipo_relacion: editFormData.tipo_relacion,
        observacion_cambio:
          editFormData.observacion_cambio.trim() ||
          `Actualizado por administración (${editFormData.tipo_relacion}, estado: ${editFormData.estado})`,
      });

      setEditEquipment(null);
      await fetchInventory();
    } catch (e) {
      alert("Error al actualizar equipo.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenHistory = async (eq: ExtendedEquipment) => {
    setHistoryEquipment(eq);
    setHistoryLoading(true);
    try {
      const res = await api.get<MovimientoItem[]>(`/inventario/${eq.id}/historial`);
      setHistoryItems(res.data || []);
    } catch (e) {
      alert("No se pudo cargar el historial del equipo.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredEquipments = equipments.filter((eq) => {
    if (filterCategory && String(eq.categoria?.id || eq.categoria_id) !== filterCategory) return false;
    if (filterState && eq.estado !== filterState) return false;
    if (filterRelation && eq.tipo_relacion !== filterRelation) return false;
    if (filterClientId && String(eq.cliente_id) !== filterClientId) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchBasic =
        eq.marca.toLowerCase().includes(term) ||
        eq.modelo.toLowerCase().includes(term) ||
        eq.numero_serie.toLowerCase().includes(term);
      const matchClient =
        eq.cliente_nombre?.toLowerCase().includes(term) ||
        eq.cliente_empresa?.toLowerCase().includes(term);
      if (!matchBasic && !matchClient) return false;
    }
    return true;
  });

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rentado":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "en_bodega":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "en_mantenimiento":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Box className="w-3.5 h-3.5" />
            <span>Control de Activos & Trazabilidad QR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventario & Equipos Tecnológicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Segmentación de equipos propios vs asignados a clientes en venta o arriendo con trazabilidad inmutable.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Equipo</span>
            </button>
          </div>
        )}
      </div>

      {/* Pestañas Principales: Equipos de la Empresa vs Por Cliente */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSegment("empresa")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSegment === "empresa"
              ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Equipos de la Empresa (Stock Propio)</span>
        </button>

        <button
          onClick={() => setActiveSegment("cliente")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSegment === "cliente"
              ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Por Cliente (Venta o Arriendo)</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="card-glass p-4 border border-blue-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, S/N o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filtro por Categoría */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las Categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        {/* Filtro por Estado */}
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los Estados</option>
          <option value="disponible">Disponible</option>
          <option value="rentado">Rentado / Arriendo</option>
          <option value="en_bodega">En Bodega</option>
          <option value="en_mantenimiento">En Mantenimiento</option>
        </select>

        {/* Filtro por Relación (si es pestaña cliente) */}
        {activeSegment === "cliente" && (
          <>
            <select
              value={filterRelation}
              onChange={(e) => setFilterRelation(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Venta y Arriendo</option>
              <option value="arriendo">Solo Arriendo</option>
              <option value="venta">Solo Venta</option>
            </select>

            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 max-w-[200px]"
            >
              <option value="">Todos los Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_empresa ? `${c.nombre_empresa} (${c.nombre_completo})` : c.nombre_completo}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Grid de Equipos */}
      {loading ? (
        <div className="card-glass p-16 text-center text-xs text-slate-500 border border-blue-100">
          Cargando inventario de equipos...
        </div>
      ) : filteredEquipments.length === 0 ? (
        <div className="card-glass p-16 text-center space-y-3 border border-blue-100">
          <Box className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No hay equipos en este segmento o filtro
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeSegment === "empresa"
              ? "No hay equipos de stock propio registrados con los filtros seleccionados."
              : "No hay equipos asignados a clientes en venta o arriendo actualmente."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.map((eq) => (
            <div
              key={eq.id}
              className="card-glass p-6 border border-blue-100 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-200 transition-all"
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      {eq.categoria_nombre || eq.categoria?.nombre || "Hardware TI"}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {eq.marca} {eq.modelo}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getBadgeEstado(
                      eq.estado
                    )}`}
                  >
                    {eq.estado.replace("_", " ")}
                  </span>
                </div>

                {/* Cliente y Modalidad si está asignado */}
                {eq.cliente_nombre && (
                  <div className="p-2.5 mb-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">
                      Asignado a:
                    </span>
                    <p className="font-bold text-slate-800">
                      {eq.cliente_empresa || eq.cliente_nombre}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                      <span>Modalidad:</span>
                      <span className="font-extrabold uppercase text-indigo-700">
                        {eq.tipo_relacion || "Arriendo"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Datos técnicos */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-200/70">
                  <div className="flex justify-between">
                    <span className="text-slate-400">S/N:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {eq.numero_serie}
                    </span>
                  </div>
                  {eq.garantia_hasta && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Garantía:</span>
                      <span className="font-semibold text-emerald-600">
                        {new Date(eq.garantia_hasta).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  )}
                </div>

                {eq.descripcion && (
                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                    {eq.descripcion}
                  </p>
                )}
              </div>

              {/* Acciones de la Tarjeta */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQrModalEquipment(eq)}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Ver Código QR"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => handleOpenHistory(eq)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Ver Historial de Cambios"
                  >
                    <History className="w-4 h-4" />
                    <span>Historial</span>
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenEdit(eq)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Registrar Nuevo Equipo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-xl w-full p-6 sm:p-8 space-y-5 bg-white border border-blue-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Registrar Nuevo Equipo en Inventario
              </h3>
              <p className="text-xs text-slate-500">
                Se generará automáticamente el código QR inmutable de trazabilidad física.
              </p>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Serie (S/N) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SN-HIK-99201"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hikvision / Ruijie"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. DS-2CD2143G2-I"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Asignación y Segmento */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">
                  Asignación y Destino del Activo:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Relación</label>
                    <select
                      value={formData.tipo_relacion}
                      onChange={(e) => setFormData({ ...formData, tipo_relacion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="empresa">Stock de la Empresa</option>
                      <option value="arriendo">Arriendo a Cliente</option>
                      <option value="venta">Vendido a Cliente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Asignado</label>
                    <select
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Ninguno (Empresa C&R)</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre_empresa ? `${c.nombre_empresa} (${c.nombre_completo})` : c.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="rentado">Rentado</option>
                    <option value="en_bodega">En Bodega</option>
                    <option value="en_mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Garantía Hasta</label>
                  <input
                    type="date"
                    value={formData.garantia_hasta}
                    onChange={(e) => setFormData({ ...formData, garantia_hasta: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Detalles técnicos, puertos, accesorios incluidos..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary-gradient px-6 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {createLoading ? "Registrando..." : "Crear Equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Equipo (Admin) */}
      {editEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-xl w-full p-6 sm:p-8 space-y-5 bg-white border border-blue-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditEquipment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Equipo: {editEquipment.marca} {editEquipment.modelo}
              </h3>
              <p className="text-xs text-slate-500">
                S/N: {editEquipment.numero_serie} • Cada modificación queda registrada en el historial de trazabilidad.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={editFormData.estado}
                    onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="rentado">Rentado</option>
                    <option value="en_bodega">En Bodega</option>
                    <option value="en_mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Garantía Hasta</label>
                  <input
                    type="date"
                    value={editFormData.garantia_hasta}
                    onChange={(e) => setEditFormData({ ...editFormData, garantia_hasta: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Asignación a Cliente y Tipo de Relación */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">
                  Segmentación & Asignación:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Relación</label>
                    <select
                      value={editFormData.tipo_relacion}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, tipo_relacion: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="empresa">Equipos de la Empresa</option>
                      <option value="arriendo">Arrendado a Cliente</option>
                      <option value="venta">Vendido a Cliente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Vinculado</label>
                    <select
                      value={editFormData.cliente_id}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, cliente_id: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Ninguno (Empresa C&R)</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre_empresa ? `${c.nombre_empresa} (${c.nombre_completo})` : c.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo o Detalle del Cambio (Para Historial de Movimientos)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregado en arriendo a cliente tras firma de contrato..."
                  value={editFormData.observacion_cambio}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, observacion_cambio: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEquipment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary-gradient px-6 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {editLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial de Movimientos */}
      {historyEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-lg w-full p-6 sm:p-8 space-y-5 bg-white border border-blue-200 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setHistoryEquipment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Historial de Movimientos & Auditoría
              </h3>
              <p className="text-xs text-slate-500">
                {historyEquipment.marca} {historyEquipment.modelo} (S/N: {historyEquipment.numero_serie})
              </p>
            </div>

            {historyLoading ? (
              <p className="text-xs text-slate-400 py-8 text-center">Cargando trazabilidad...</p>
            ) : historyItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No hay movimientos registrados para este equipo todavía.
              </p>
            ) : (
              <div className="space-y-3">
                {historyItems.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">
                        Estado: {m.estado_anterior || "Inicial"} ➔ {m.estado_nuevo}
                      </span>
                      <span className="text-slate-400">
                        {new Date(m.fecha).toLocaleString("es-CO")}
                      </span>
                    </div>
                    {m.observacion && (
                      <p className="text-slate-600 text-xs pt-1 border-t border-slate-200/60">
                        {m.observacion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setHistoryEquipment(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrModalEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-sm w-full p-6 text-center space-y-4 bg-white border border-blue-200 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">
              Código QR de Trazabilidad
            </h4>
            <p className="text-xs text-slate-500">
              {qrModalEquipment.marca} {qrModalEquipment.modelo} (S/N: {qrModalEquipment.numero_serie})
            </p>

            <div className="p-4 bg-white border rounded-2xl inline-block mx-auto shadow-inner">
              <img
                src={qrModalEquipment.qr_codigo || `/api/v1/inventario/${qrModalEquipment.id}/qr`}
                alt="QR"
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir QR</span>
              </button>
              <button
                onClick={() => setQrModalEquipment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Nueva Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Nueva Categoría de Inventario
            </h3>
            <p className="text-xs text-slate-600">
              Crea una categoría para clasificar equipos e infraestructura (ej. Switch, Router, Servidor, Bobina, Cámara IP).
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Control de Acceso Biométrico"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre los equipos comprendidos en esta categoría..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory || !newCatName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {creatingCategory ? "Guardando..." : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;

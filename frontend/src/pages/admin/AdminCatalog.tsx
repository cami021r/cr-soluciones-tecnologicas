import React, { useEffect, useState } from "react";
import {
  Plus,
  Tag,
  Layers,
  Edit3,
  Trash2,
  Package,
} from "lucide-react";
import api from "../../services/api";
import type { ServiceItem, ProductItem } from "../../types";

interface ProveedorSimple {
  id: number;
  nombre: string;
  contacto?: string;
  activo: boolean;
}

export const AdminCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"servicios" | "productos">("servicios");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorSimple[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Servicio (Crear / Editar)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceHours, setServiceHours] = useState("1.0");
  const [savingService, setSavingService] = useState(false);

  // Modal Producto (Crear / Editar)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productProveedorId, setProductProveedorId] = useState<number | "">("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCosto, setProductCosto] = useState("");
  const [productMargen, setProductMargen] = useState("35"); // Porcentaje 35%
  const [productStock, setProductStock] = useState("1");
  const [productEntregaDias, setProductEntregaDias] = useState("1");
  const [savingProduct, setSavingProduct] = useState(false);

  const fetchData = async () => {
    try {
      const [resS, resP, resProv] = await Promise.all([
        api.get<ServiceItem[]>("/catalogo/servicios"),
        api.get<ProductItem[]>("/catalogo/productos"),
        api.get<ProveedorSimple[]>("/catalogo/proveedores").catch(() => ({ data: [] })),
      ]);
      setServices(resS.data || []);
      setProducts(resP.data || []);
      setProveedores(resProv.data || []);
    } catch (e) {
      console.error("Error al cargar catálogo:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SERVICIOS ---
  const handleOpenCreateService = () => {
    setEditingServiceId(null);
    setServiceName("");
    setServiceDesc("");
    setServicePrice("");
    setServiceHours("1.0");
    setShowServiceModal(true);
  };

  const handleOpenEditService = (s: ServiceItem) => {
    setEditingServiceId(s.id);
    setServiceName(s.nombre);
    setServiceDesc(s.descripcion || "");
    setServicePrice(String(s.precio_mano_obra));
    setServiceHours(String(s.horas_estimadas));
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingService(true);
    try {
      if (editingServiceId) {
        await api.put(`/catalogo/servicios/${editingServiceId}`, {
          nombre: serviceName.trim(),
          descripcion: serviceDesc.trim() || undefined,
          precio_mano_obra: Number(servicePrice),
          horas_estimadas: Number(serviceHours),
        });
      } else {
        await api.post("/catalogo/servicios", {
          nombre: serviceName.trim(),
          descripcion: serviceDesc.trim() || undefined,
          precio_mano_obra: Number(servicePrice),
          horas_estimadas: Number(serviceHours),
          preguntas_clave: [],
        });
      }
      setShowServiceModal(false);
      await fetchData();
    } catch (err: any) {
      alert("Error al guardar servicio: " + (err.response?.data?.detail || ""));
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el servicio "${nombre}"?`)) return;
    try {
      await api.delete(`/catalogo/servicios/${serviceId}`);
      await fetchData();
    } catch (err: any) {
      alert("Error al desactivar servicio: " + (err.response?.data?.detail || ""));
    }
  };

  // --- PRODUCTOS ---
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductProveedorId(proveedores[0]?.id || "");
    setProductName("");
    setProductDesc("");
    setProductCosto("");
    setProductMargen("35");
    setProductStock("1");
    setProductEntregaDias("1");
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    setEditingProductId(p.id);
    setProductProveedorId(p.proveedor_id);
    setProductName(p.nombre);
    setProductDesc(p.descripcion || "");
    setProductCosto(String(p.costo_proveedor));
    setProductMargen(String(Math.round(p.margen_ganancia * 100)));
    setProductStock(String(p.stock_disponible));
    setProductEntregaDias(String(p.tiempo_entrega_dias));
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productProveedorId) {
      alert("Debes seleccionar un proveedor registrado.");
      return;
    }
    setSavingProduct(true);
    try {
      const margenDecimal = Number(productMargen) / 100;
      if (editingProductId) {
        await api.put(`/catalogo/productos/${editingProductId}`, {
          proveedor_id: Number(productProveedorId),
          nombre: productName.trim(),
          descripcion: productDesc.trim() || undefined,
          costo_proveedor: Number(productCosto),
          margen_ganancia: margenDecimal,
          tiempo_entrega_dias: Number(productEntregaDias),
          stock_disponible: Number(productStock),
        });
      } else {
        await api.post("/catalogo/productos", {
          proveedor_id: Number(productProveedorId),
          nombre: productName.trim(),
          descripcion: productDesc.trim() || undefined,
          costo_proveedor: Number(productCosto),
          margen_ganancia: margenDecimal,
          tiempo_entrega_dias: Number(productEntregaDias),
          stock_disponible: Number(productStock),
        });
      }
      setShowProductModal(false);
      await fetchData();
    } catch (err: any) {
      alert("Error al guardar producto: " + (err.response?.data?.detail || ""));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"?`)) return;
    try {
      await api.delete(`/catalogo/productos/${productId}`);
      await fetchData();
    } catch (err: any) {
      alert("Error al eliminar producto: " + (err.response?.data?.detail || ""));
    }
  };

  // Cálculo sugerido de venta en tiempo real para el modal de productos
  const costoNum = Number(productCosto) || 0;
  const margenNum = Number(productMargen) || 0;
  const ventaSugeridaNum = costoNum > 0 ? costoNum * (1 + margenNum / 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Catálogo Comercial & Repuestos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Administra tarifas de mano de obra y productos de proveedores que alimentan al Cotizador Inteligente con IA.
          </p>
        </div>

        <div>
          {activeTab === "servicios" ? (
            <button
              onClick={handleOpenCreateService}
              className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio Técnico</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateProduct}
              className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto / Repuesto</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("servicios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "servicios"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Servicios Técnicos ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("productos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "productos"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Productos & Repuestos ({products.length})</span>
        </button>
      </div>

      {/* Contenido según Tab */}
      {loading ? (
        <div className="card-glass rounded-[20px] p-12 text-center text-slate-500 text-xs border border-blue-100">
          Cargando catálogo comercial...
        </div>
      ) : (
        <>
          {/* TAB 1: SERVICIOS TÉCNICOS */}
          {activeTab === "servicios" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="card-glass rounded-[20px] p-5 sm:p-6 border border-slate-200/90 hover:border-blue-200 shadow-xs space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                        ID #{s.id} • Mano de Obra Certificada
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{s.nombre}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditService(s)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600"
                        title="Modificar servicio"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id, s.nombre)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Desactivar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.descripcion || "Instalación y configuración técnica garantizada."}
                  </p>

                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Tarifa Base:</span>
                      <span className="text-base font-black text-blue-700">
                        ${Number(s.precio_mano_obra).toLocaleString()} COP
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Tiempo Estimado:</span>
                      <span className="font-bold text-slate-900">{s.horas_estimadas}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PRODUCTOS Y REPUESTOS */}
          {activeTab === "productos" && (
            <div className="card-glass rounded-[20px] border border-slate-200/90 overflow-hidden shadow-xs">
              {products.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">No hay productos ni repuestos registrados</p>
                  <p>Haz clic en "Nuevo Producto / Repuesto" para añadir referencias de tus proveedores.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Ref / ID</th>
                        <th className="p-3.5">Producto & Descripción</th>
                        <th className="p-3.5 text-right">Costo Proveedor</th>
                        <th className="p-3.5 text-center">Margen</th>
                        <th className="p-3.5 text-right">Venta Sugerida</th>
                        <th className="p-3.5 text-center">Stock</th>
                        <th className="p-3.5 text-center">Entrega</th>
                        <th className="p-3.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-3.5 font-mono text-blue-600 font-bold">#{p.id}</td>
                          <td className="p-3.5">
                            <strong className="text-slate-900 block">{p.nombre}</strong>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {p.descripcion || "Sin especificaciones"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono text-slate-600">
                            ${Number(p.costo_proveedor).toLocaleString()} COP
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {(p.margen_ganancia * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-bold text-blue-700 font-mono">
                            ${Number(p.precio_venta_sugerido).toLocaleString()} COP
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock_disponible > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {p.stock_disponible} u.
                            </span>
                          </td>
                          <td className="p-3.5 text-center text-slate-500">
                            {p.tiempo_entrega_dias} día(s)
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600"
                                title="Editar información del producto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.nombre)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                                title="Eliminar producto"
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
          )}
        </>
      )}

      {/* MODAL 1: CREAR / EDITAR SERVICIO TÉCNICO */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              {editingServiceId ? "Modificar Servicio Técnico" : "Nuevo Servicio Técnico"}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Configuración de VLANs y Segmentación de Red"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el alcance del trabajo técnico..."
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Mano de Obra (COP) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    placeholder="Ej. 120000"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horas Estimadas *</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={serviceHours}
                    onChange={(e) => setServiceHours(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingService || !serviceName.trim() || !servicePrice}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {savingService ? "Guardando..." : editingServiceId ? "Guardar Cambios" : "Crear Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR / EDITAR PRODUCTO O REPUESTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {editingProductId ? "Modificar Producto / Repuesto" : "Registrar Producto / Repuesto"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Proveedor Distribuidor *</label>
                <select
                  value={productProveedorId}
                  onChange={(e) => setProductProveedorId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  required
                >
                  {proveedores.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nombre} {pr.contacto ? `(${pr.contacto})` : ""}
                    </option>
                  ))}
                  {proveedores.length === 0 && (
                    <option value="">No hay proveedores creados</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Producto / Repuesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Switch Gigabit Ruijie RG-ES205GC-P PoE"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción y Especificaciones</label>
                <textarea
                  rows={2}
                  placeholder="Puertos, velocidad, norma técnica o compatibilidad..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Proveedor (COP) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    placeholder="Ej. 180000"
                    value={productCosto}
                    onChange={(e) => setProductCosto(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Margen Comercial (%) *</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    placeholder="35"
                    value={productMargen}
                    onChange={(e) => setProductMargen(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Disponible (Unidades)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-center"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiempo de Entrega (Días)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productEntregaDias}
                    onChange={(e) => setProductEntregaDias(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-center"
                  />
                </div>
              </div>

              {/* Cálculo en Tiempo Real */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Precio de Venta Sugerido:</span>
                <span className="font-black text-blue-700 text-sm">
                  ${Math.round(ventaSugeridaNum).toLocaleString()} COP
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || !productName.trim() || !productCosto}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {savingProduct ? "Guardando..." : editingProductId ? "Guardar Modificaciones" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCatalog;

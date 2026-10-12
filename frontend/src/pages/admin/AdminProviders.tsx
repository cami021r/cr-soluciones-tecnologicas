import React, { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Package,
  Search,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";

interface ProductoProveedor {
  id: number;
  nombre: string;
  descripcion?: string;
  costo_proveedor: number;
  margen_ganancia: number;
  precio_venta_sugerido: number;
  tiempo_entrega_dias: number;
  stock_disponible: number;
  activo: boolean;
}

interface ProveedorDetalle {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  productos?: ProductoProveedor[];
}

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<ProveedorDetalle[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProveedorDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Crear / Editar Proveedor
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formContacto, setFormContacto] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProviders = async () => {
    try {
      const res = await api.get<ProveedorDetalle[]>("/catalogo/proveedores?solo_activos=false");
      setProviders(res.data || []);
      if (res.data && res.data.length > 0 && !selectedProvider) {
        handleSelectProvider(res.data[0].id);
      }
    } catch (e) {
      console.error("Error al cargar proveedores:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSelectProvider = async (id: number) => {
    setLoadingDetalle(true);
    try {
      const res = await api.get<ProveedorDetalle>(`/catalogo/proveedores/${id}`);
      setSelectedProvider(res.data);
    } catch (e) {
      console.error("Error al cargar detalle del proveedor:", e);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormNombre("");
    setFormContacto("");
    setFormTelefono("");
    setFormEmail("");
    setShowModal(true);
  };

  const handleOpenEdit = (p: ProveedorDetalle) => {
    setEditingId(p.id);
    setFormNombre(p.nombre);
    setFormContacto(p.contacto || "");
    setFormTelefono(p.telefono || "");
    setFormEmail(p.email || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/catalogo/proveedores/${editingId}`, {
          nombre: formNombre.trim(),
          contacto: formContacto.trim() || undefined,
          telefono: formTelefono.trim() || undefined,
          email: formEmail.trim() || undefined,
        });
      } else {
        await api.post("/catalogo/proveedores", {
          nombre: formNombre.trim(),
          contacto: formContacto.trim() || undefined,
          telefono: formTelefono.trim() || undefined,
          email: formEmail.trim() || undefined,
        });
      }
      setShowModal(false);
      await fetchProviders();
      if (editingId && selectedProvider?.id === editingId) {
        handleSelectProvider(editingId);
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al guardar el proveedor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el proveedor "${nombre}"?`)) return;
    try {
      await api.delete(`/catalogo/proveedores/${id}`);
      await fetchProviders();
      if (selectedProvider?.id === id) {
        setSelectedProvider(null);
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error al desactivar proveedor");
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      (p.contacto && p.contacto.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Directorio de Proveedores & Distribución
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gestiona tus aliados mayoristas, tiempos de entrega y el portafolio de productos y repuestos que suministran.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Proveedor</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="card-glass rounded-[20px] p-4 border border-slate-200/80">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proveedor por empresa, contacto o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid de 2 Columnas: Lista de Proveedores vs Ficha Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Lista de Proveedores */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-blue-100">
              Cargando directorio de mayoristas...
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-slate-200 space-y-2">
              <Truck className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No se encontraron proveedores</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredProviders.map((p) => {
                const isSelected = selectedProvider?.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProvider(p.id)}
                    className={`card-glass rounded-[20px] p-4 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-md ring-1 ring-blue-400"
                        : "border-slate-200/80 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {p.nombre.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {p.nombre}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {p.contacto || "Sin contacto directo"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                          p.activo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{p.telefono || "Tel. no registrado"}</span>
                      <div className="flex items-center gap-1 text-blue-600 font-semibold">
                        <span>Ver Portafolio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Ficha del Proveedor y Productos que Ofrece */}
        <div className="lg:col-span-7">
          {loadingDetalle ? (
            <div className="card-glass rounded-[20px] p-12 text-center text-xs text-slate-500 border border-blue-100">
              Cargando portafolio y catálogo del proveedor...
            </div>
          ) : selectedProvider ? (
            <div className="card-glass rounded-[20px] p-6 border border-slate-200/90 shadow-xs space-y-6">
              {/* Cabecera del Proveedor */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {selectedProvider.nombre}
                    </h2>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        selectedProvider.activo
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {selectedProvider.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedProvider.contacto ? `Asesor: ${selectedProvider.contacto}` : "Distribuidor Mayorista"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedProvider)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedProvider.id, selectedProvider.nombre)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Desactivar</span>
                  </button>
                </div>
              </div>

              {/* Canales de Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Teléfono Comercial</span>
                    {selectedProvider.telefono ? (
                      <a href={`tel:${selectedProvider.telefono}`} className="font-bold text-slate-800 hover:text-blue-600">
                        {selectedProvider.telefono}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No registrado</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Correo de Pedidos</span>
                    {selectedProvider.email ? (
                      <a href={`mailto:${selectedProvider.email}`} className="font-bold text-slate-800 hover:text-blue-600">
                        {selectedProvider.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No registrado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Portafolio de Productos Suministrados */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Productos y Repuestos que Suministra ({selectedProvider.productos?.length || 0})</span>
                  </h3>
                </div>

                {(!selectedProvider.productos || selectedProvider.productos.length === 0) ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white/60 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700">Aún no hay productos vinculados a este proveedor.</p>
                    <p>Puedes asignarle referencias desde la pestaña "Productos & Repuestos" del Catálogo.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Producto</th>
                          <th className="p-3 text-right">Costo Compra</th>
                          <th className="p-3 text-center">Margen</th>
                          <th className="p-3 text-right">Venta Sugerida</th>
                          <th className="p-3 text-center">Stock</th>
                          <th className="p-3 text-center">Entrega</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedProvider.productos.map((prod) => (
                          <tr key={prod.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">
                              <div>{prod.nombre}</div>
                              {prod.descripcion && (
                                <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                                  {prod.descripcion}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600">
                              ${Number(prod.costo_proveedor).toLocaleString()} COP
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {(prod.margen_ganancia * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-blue-700 font-mono">
                              ${Number(prod.precio_venta_sugerido).toLocaleString()} COP
                            </td>
                            <td className="p-3 text-center font-bold text-slate-800">
                              {prod.stock_disponible} u.
                            </td>
                            <td className="p-3 text-center text-slate-500">
                              {prod.tiempo_entrega_dias} d.
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-[20px] p-16 text-center text-xs text-slate-500 border border-slate-200 space-y-2">
              <Truck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">Selecciona un proveedor de la lista</p>
              <p>Podrás ver su portafolio de repuestos, costos y contacto.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Proveedor */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              {editingId ? "Modificar Proveedor" : "Registrar Proveedor Mayorista"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Razón Social / Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Anixter Colombia SAS o Macrocity"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Asesor / Contacto</label>
                <input
                  type="text"
                  placeholder="Ej. Andrea Gómez (Ejecutiva de Cuenta)"
                  value={formContacto}
                  onChange={(e) => setFormContacto(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 3105551234"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="pedidos@mayorista.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formNombre.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-gradient text-white disabled:opacity-50"
                >
                  {saving ? "Guardando..." : editingId ? "Guardar Cambios" : "Crear Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;

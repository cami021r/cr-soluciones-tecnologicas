import React, { useEffect, useState } from "react";
import { Plus, Tag, Layers } from "lucide-react";
import api from "../../services/api";
import type { ServiceItem, ProductItem } from "../../types";

export const AdminCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"servicios" | "productos">("servicios");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal nuevo servicio
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceHours, setNewServiceHours] = useState("1.0");

  const fetchData = async () => {
    try {
      const [resS, resP] = await Promise.all([
        api.get<ServiceItem[]>("/catalogo/servicios"),
        api.get<ProductItem[]>("/catalogo/productos"),
      ]);
      setServices(resS.data || []);
      setProducts(resP.data || []);
    } catch (e) {
      console.error("Error al cargar catálogo:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/catalogo/servicios", {
        nombre: newServiceName.trim(),
        descripcion: newServiceDesc.trim(),
        precio_mano_obra: Number(newServicePrice),
        horas_estimadas: Number(newServiceHours),
        preguntas_clave: [],
      });
      setShowServiceModal(false);
      setNewServiceName("");
      setNewServiceDesc("");
      setNewServicePrice("");
      await fetchData();
    } catch (err: any) {
      alert("Error al registrar servicio: " + (err.response?.data?.detail || ""));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Catálogo de Conocimiento Comercial</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tarifas oficiales, horas estimadas de mano de obra y repuestos de proveedores que alimentan al Chatbot con IA.
          </p>
        </div>

        {activeTab === "servicios" && (
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Servicio Técnico
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("servicios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "servicios"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Servicios Técnicos ({services.length})
        </button>

        <button
          onClick={() => setActiveTab("productos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "productos"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          Productos & Repuestos de Proveedores ({products.length})
        </button>
      </div>

      {/* Contenido según Tab */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Cargando catálogo comercial...</div>
      ) : (
        <>
          {/* Tab: Servicios Técnicos */}
          {activeTab === "servicios" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    ID #{s.id} • Servicio Especializado
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{s.nombre}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Activo
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {s.descripcion || "Instalación y configuración técnica certificada por ingenieros de C&R."}
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Mano de Obra Base:</span>
                  <span className="text-sm font-extrabold text-cyan-400">
                    ${Number(s.precio_mano_obra).toLocaleString()} COP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Horas Estimadas:</span>
                  <span className="font-semibold text-white">{s.horas_estimadas}h</span>
                </div>
              </div>

              {s.preguntas_clave && s.preguntas_clave.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Preguntas Guía para el Chatbot IA:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    {s.preguntas_clave.map((p) => (
                      <li key={p.id} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{p.pregunta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Productos Externos */}
      {activeTab === "productos" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Producto & Descripción</th>
                  <th className="p-4">Costo Proveedor</th>
                  <th className="p-4">Margen Ganancia</th>
                  <th className="p-4">Precio Venta Sugerido</th>
                  <th className="p-4">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-cyan-400 font-semibold">#{p.id}</td>
                    <td className="p-4">
                      <strong className="text-white block">{p.nombre}</strong>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{p.descripcion}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      ${Number(p.costo_proveedor).toLocaleString()} COP
                    </td>
                    <td className="p-4 font-semibold text-emerald-400">
                      {(p.margen_ganancia * 100).toFixed(0)}%
                    </td>
                    <td className="p-4 font-bold text-cyan-400 font-mono">
                      ${Number(p.precio_venta_sugerido).toLocaleString()} COP
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stock_disponible > 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {p.stock_disponible} unidades
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

      {/* Modal Nuevo Servicio */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Nuevo Servicio Técnico
            </h3>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej. Certificación con Reflectómetro OTDR"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Detalles sobre el protocolo de prueba y entrega..."
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mano de Obra ($ COP) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="90000"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Horas Estimadas *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min={0.5}
                    value={newServiceHours}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Guardar Servicio
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

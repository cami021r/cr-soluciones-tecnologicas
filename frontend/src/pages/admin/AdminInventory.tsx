import React, { useEffect, useState } from "react";
import { Box, Plus, QrCode, Printer, Search } from "lucide-react";
import api from "../../services/api";
import type { Equipment } from "../../types";

export const AdminInventory: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  // Modal Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    categoria_id: 1,
    numero_serie: "",
    marca: "",
    modelo: "",
    descripcion: "",
    estado: "disponible",
    garantia_hasta: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Modal QR Imprimir
  const [qrModalEquipment, setQrModalEquipment] = useState<Equipment | null>(null);

  const fetchInventory = async () => {
    try {
      const [resE, resC] = await Promise.all([
        api.get<Equipment[]>("/inventario/"),
        api.get<{ id: number; nombre: string }[]>("/inventario/categorias"),
      ]);
      setEquipments(resE.data?.resultados || []);
      setCategories(resC.data || []);
    } catch (e) {
      console.error("Error al cargar inventario:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await api.post("/inventario/", {
        ...formData,
        categoria_id: Number(formData.categoria_id),
        garantia_hasta: formData.garantia_hasta || null,
      });

      setShowCreateModal(false);
      setFormData({
        categoria_id: 1,
        numero_serie: "",
        marca: "",
        modelo: "",
        descripcion: "",
        estado: "disponible",
        garantia_hasta: "",
      });
      await fetchInventory();
    } catch (err: any) {
      alert("Error al registrar equipo: " + (err.response?.data?.detail || "Verifica los datos."));
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  const filtered = equipments.filter((eq) => {
    const matchSearch =
      eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.numero_serie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchState = filterState ? eq.estado === filterState : true;
    return matchSearch && matchState;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Módulo de Inventario & Códigos QR</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control físico de activos, generación automática de QR digital y trazabilidad de bodegas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Activo
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo o S/N..."
            className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Todos los Estados</option>
            <option value="disponible">Disponible</option>
            <option value="rentado">Rentado</option>
            <option value="en_bodega">En Bodega</option>
            <option value="en_mantenimiento">En Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Tabla de Equipos */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Cargando inventario...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 rounded-2xl border border-slate-800">
          No se encontraron equipos registrados con ese criterio.
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">ID / Serie</th>
                  <th className="p-4">Equipo & Modelo</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Garantía</th>
                  <th className="p-4 text-right">Etiqueta QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filtered.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-cyan-400 font-semibold">
                      #{eq.id} <br />
                      <span className="text-[11px] text-slate-400">{eq.numero_serie}</span>
                    </td>
                    <td className="p-4">
                      <strong className="text-white block">{eq.marca} {eq.modelo}</strong>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{eq.descripcion || "Sin descripción"}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {eq.categoria?.nombre || "Hardware"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          eq.estado === "disponible"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : eq.estado === "rentado"
                            ? "bg-blue-500/10 text-blue-400"
                            : eq.estado === "en_mantenimiento"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {eq.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {eq.garantia_hasta ? new Date(eq.garantia_hasta).toLocaleDateString() : "Vigente"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setQrModalEquipment(eq)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 inline-flex items-center gap-1.5 transition-colors border border-slate-700 font-semibold text-[11px]"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Imprimir QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Activo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              Registrar Nuevo Activo en Inventario
            </h3>

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Número de Serie (S/N) *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    placeholder="CAM-DH-009"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Dahua"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="IPC-HFW2849S"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción técnica</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Cámara bala exterior 4MP con StarLight y visión nocturna color"
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estado Inicial</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_bodega">En Bodega</option>
                    <option value="rentado">Rentado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Garantía hasta</label>
                  <input
                    type="date"
                    value={formData.garantia_hasta}
                    onChange={(e) => setFormData({ ...formData, garantia_hasta: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  {createLoading ? "Registrando..." : "Guardar & Generar QR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Imprimir QR (Paso 11.12) */}
      {qrModalEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Etiqueta de Activo Físico
            </h3>
            <p className="text-xs text-slate-400">
              {qrModalEquipment.marca} {qrModalEquipment.modelo}
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              {qrModalEquipment.qr_codigo ? (
                <img
                  src={`http://localhost:8000/media/${qrModalEquipment.qr_codigo}`}
                  alt="Código QR del equipo"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-950 font-mono text-xs">
                  [QR #{qrModalEquipment.numero_serie}]
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-cyan-400 font-bold">
              ID: #{qrModalEquipment.id} | S/N: {qrModalEquipment.numero_serie}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handlePrintQR}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimir Etiqueta
              </button>
              <button
                onClick={() => setQrModalEquipment(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;

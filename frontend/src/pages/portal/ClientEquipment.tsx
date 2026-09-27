import React, { useEffect, useState } from "react";
import { Laptop, QrCode, Shield } from "lucide-react";
import api from "../../services/api";
import type { Equipment } from "../../types";

export const ClientEquipment: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedQR, setSelectedQR] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get<Equipment[]>("/inventario/");
        setEquipments(res.data || []);
      } catch (e) {
        console.error("Error al cargar inventario:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Mis Equipos e Infraestructura</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Fichas técnicas individuales, garantías vigentes y trazabilidad física con código QR.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Cargando inventario de equipos...</div>
      ) : equipments.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Laptop className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-white">No tienes activos vinculados actualmente</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando aceptes una cotización o suscribas un contrato de renta, tus equipos aparecerán inventariados aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((eq) => (
            <div
              key={eq.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                      {eq.categoria?.nombre || "Hardware TI"}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {eq.marca} {eq.modelo}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      eq.estado === "disponible"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : eq.estado === "rentado"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : eq.estado === "en_mantenimiento"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {eq.estado.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {eq.descripcion || "Activo empresarial bajo custodia de soporte técnico."}
                </p>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Número de Serie:</span>
                    <span className="font-mono text-cyan-400">{eq.numero_serie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Garantía hasta:</span>
                    <span className="font-semibold text-slate-200">
                      {eq.garantia_hasta ? new Date(eq.garantia_hasta).toLocaleDateString() : "Vigente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón QR */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Activo Verificado
                </span>

                <button
                  onClick={() => setSelectedQR(eq)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Ver QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal QR Digital */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Identificador QR - {selectedQR.marca} {selectedQR.modelo}
            </h3>
            <p className="text-xs text-slate-400">
              Escanea con tu celular para consultar la ficha pública y reporte técnico al instante.
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              {selectedQR.qr_codigo ? (
                <img
                  src={`http://localhost:8000/media/${selectedQR.qr_codigo}`}
                  alt="QR del equipo"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-950 font-mono text-xs">
                  [QR #{selectedQR.numero_serie}]
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-slate-300">
              S/N: {selectedQR.numero_serie}
            </div>

            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientEquipment;

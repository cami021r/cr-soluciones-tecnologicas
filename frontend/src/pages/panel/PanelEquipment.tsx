import React, { useEffect, useState } from "react";
import { Laptop, QrCode, Shield } from "lucide-react";
import api from "../../services/api";
import type { Equipment } from "../../types";

export const PanelEquipment: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedQR, setSelectedQR] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get<Equipment[]>("/inventario/mis-equipos/");
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mis Equipos e Infraestructura
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Fichas técnicas individuales, garantías vigentes y trazabilidad física con código QR.
        </p>
      </div>

      {loading ? (
        <div className="card-glass p-12 text-center text-xs text-slate-500 border border-blue-100">
          Cargando inventario de equipos...
        </div>
      ) : equipments.length === 0 ? (
        <div className="card-glass p-16 text-center space-y-4 border border-blue-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60">
            <Laptop className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No tienes activos vinculados actualmente
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando aceptes una cotización o suscribas un contrato de soporte, tus equipos e infraestructura aparecerán inventariados aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((eq) => (
            <div
              key={eq.id}
              className="card-glass p-6 border border-blue-100/80 hover:border-blue-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      {eq.categoria?.nombre || "Hardware TI"}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {eq.marca} {eq.modelo}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      eq.estado === "disponible"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : eq.estado === "rentado"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {eq.estado}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">S/N:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {eq.numero_serie}
                    </span>
                  </div>
                  {eq.garantia_hasta && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Garantía hasta:</span>
                      <span className="font-semibold text-emerald-600">
                        {new Date(eq.garantia_hasta).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  )}
                </div>

                {eq.descripcion && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                    {eq.descripcion}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Soporte Oficial C&R</span>
                </div>

                {eq.qr_codigo && (
                  <button
                    onClick={() => setSelectedQR(eq)}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Ver Código QR"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Ver QR</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal QR */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-glass max-w-sm w-full p-6 text-center space-y-4 border border-blue-200 shadow-2xl bg-white">
            <h3 className="text-base font-bold text-slate-900">
              Código QR de Trazabilidad
            </h3>
            <p className="text-xs text-slate-500">
              {selectedQR.marca} {selectedQR.modelo} (S/N: {selectedQR.numero_serie})
            </p>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src={selectedQR.qr_codigo}
                alt="QR Equipo"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Escanea con cualquier cámara para consultar historial y garantía técnica sin iniciar sesión.
            </p>

            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelEquipment;

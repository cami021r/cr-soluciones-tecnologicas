import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";

export const Projects: React.FC = () => {
  const proyectosReales = [
    {
      id: "rack-principal",
      titulo: "Reorganización Integral y Peinado de Rack de Servidores",
      cliente: "Oficina Corporativa de Servicios Contables",
      ubicacion: "Bogotá D.C. — Sector Chico Norte",
      fecha: "Septiembre 2026",
      imagen: "/images/proyectos/rack-principal-organizado.jpg",
      normativa: "ANSI/TIA/EIA-568.C y TIA-606",
      desafio:
        "El cliente presentaba constantes caídas de enlace y recalentamiento por cables enredados y falta de identificación en 48 puntos de red.",
      solucion:
        "Instalación de organizadores horizontales Panduit, patch cords certificados categoría 6 de 1 pie, marquillado térmico por puerto y balanceo de carga.",
      resultado: "0% caídas de red reportadas y reducción del tiempo de diagnóstico técnico de 4 horas a 10 minutos.",
      etiquetas: ["Panduit Cat6", "Patch Panels", "Organización Rack", "Certificación"],
    },
    {
      id: "conmutacion-ruijie",
      titulo: "Infraestructura de Conmutación Gigabit y Troncales PoE",
      cliente: "Sede Operativa de Logística y Transporte",
      ubicacion: "Bogotá D.C. — Parque Industrial Fontibón",
      fecha: "Agosto 2026",
      imagen: "/images/proyectos/rack-panduit-switches.jpg",
      normativa: "IEEE 802.3at PoE+ y VLANs 802.1Q",
      desafio:
        "Alimentación simultánea para 16 cámaras IP de alta resolución y 4 Access Points de alta concurrencia sin caídas de tensión.",
      solucion:
        "Despliegue de switches gestionables Ruijie Reyee Cloud con 24 puertos Gigabit PoE+ (370W), enlace troncal de fibra y segmentación de tráfico.",
      resultado: "Monitoreo en tiempo real desde la nube sin pagar licencias adicionales y estabilidad total en video 4K.",
      etiquetas: ["Ruijie Reyee", "Switches PoE+", "VLANs", "Fibra Óptica"],
    },
    {
      id: "cableado-detalle",
      titulo: "Certificación de Puntos de Voz/Datos y Rotulación Cat6",
      cliente: "Centro Odontológico y Clínico",
      ubicacion: "Bogotá D.C. — Teusaquillo",
      fecha: "Julio 2026",
      imagen: "/images/proyectos/cableado-detalle-16a.jpg",
      normativa: "ISO/IEC 11801 Clase E",
      desafio:
        "Interferencia electromagnética en equipos médicos por canalizaciones deficientes y cables de baja categoría.",
      solucion:
        "Tendido en canaleta con división metálica, cable 100% cobre puro Cat6 certificado y rotulado individual con código alfanumérico.",
      resultado: "Transferencias estables a 1.000 Mbps sin fluctuaciones y cumplimiento normativo para auditorías de salud.",
      etiquetas: ["Cat6 Certificado", "100% Cobre Puro", "Rotulación TIA-606", "Clínico"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs">
          Portafolio de Casos Reales
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Proyectos Realizados
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Evidencia fotográfica real de instalaciones de cableado estructurado, racks de comunicaciones y seguridad electrónica ejecutadas en Bogotá.
        </p>
      </div>

      {/* Listado de Casos de Estudio */}
      <div className="space-y-10">
        {proyectosReales.map((proy) => (
          <div
            key={proy.id}
            className="card-glass p-6 sm:p-10 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Imagen Real del Proyecto */}
              <div className="lg:col-span-5 rounded-[18px] overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group relative">
                <img
                  src={proy.imagen}
                  alt={proy.titulo}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback visual si falta el archivo
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-800 border border-slate-200 shadow-xs">
                  Foto de Campo Real
                </div>
              </div>

              {/* Contenido Técnico del Proyecto */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {proy.ubicacion}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {proy.fecha}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-1">
                    {proy.titulo}
                  </h2>
                  <p className="text-xs font-semibold text-blue-600">
                    {proy.cliente}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1">Desafío Técnico:</strong>
                    <span className="text-slate-600 leading-relaxed">{proy.desafio}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                    <strong className="text-blue-950 block mb-1">Solución C&R:</strong>
                    <span className="text-blue-900 leading-relaxed">{proy.solucion}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Resultado: {proy.resultado}</span>
                </div>

                {/* Etiquetas de hardware */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proy.etiquetas.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA Cotizar */}
                <div className="pt-2">
                  <Link
                    to="/cotizador"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-violet-600 transition-colors"
                  >
                    <span>Cotizar un requerimiento similar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bloque CTA inferior */}
      <div className="card-glass p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          ¿Tu empresa necesita una modernización de cableado o CCTV?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Levantamos la topología física, calculamos presupuestos transparentes y emitimos reportes con códigos QR.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/cotizador"
            className="btn-primary-gradient px-7 py-3.5 text-xs font-bold"
          >
            Cotizar con Inteligencia Artificial
          </Link>
          <Link
            to="/contacto"
            className="px-6 py-3.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
          >
            Agendar Visita en Bogotá
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Projects;

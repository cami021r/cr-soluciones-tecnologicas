import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Network,
  Camera,
  Radio,
  Wrench,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ZoomIn,
  X,
} from "lucide-react";

export const Services: React.FC = () => {
  const [imagenAmpliada, setImagenAmpliada] = useState<{ src: string; alt: string } | null>(null);

  const serviciosDetallados = [
    {
      id: "cableado",
      titulo: "Cableado Estructurado y Centros de Cómputo",
      categoria: "Infraestructura Física",
      icono: Network,
      color: "from-blue-500 to-indigo-600",
      descripcion:
        "Diseño, instalación, reestructuración de racks y rotulación de cableado de cobre (Cat5e, Cat6, Cat6A, Cat7) y fibra óptica para oficinas, locales y bodegas en Bogotá. Cumplimos estrictamente las normas ANSI/TIA/EIA 568 e ISO/IEC 11801.",
      puntosClave: [
        "Tendido y peinado en todas las categorías de cableado estructurado",
        "Conectorización de Patch Panels, organizadores y Jacks RJ45 certificados",
        "Reorganización integral de gabinetes (Antes y Después garantizado)",
        "Organización y marquillado estandarizado bajo norma TIA-606",
        "12 meses de garantía directa de mano de obra",
      ],
      aplicaciones: "PYMEs, consultorios, oficinas corporativas, bodegas y locales comerciales.",
      antesDespues: {
        antes: "/images/proyectos/cableado-antes.jpg",
        despues: "/images/proyectos/cableado-despues.jpg",
      },
    },
    {
      id: "cctv",
      titulo: "Sistemas de Videovigilancia CCTV, Cámaras IP y Control de Acceso",
      categoria: "Seguridad Electrónica & Norma EMT",
      icono: Camera,
      color: "from-indigo-500 to-violet-600",
      descripcion:
        "Circuitos cerrados de televisión IP/HD (2MP, 4MP y 4K) y sistemas de control de acceso biométrico facial con electroimanes y botones no-touch, instalados bajo norma técnica con tubería metálica EMT y cajas de paso.",
      puntosClave: [
        "Cámaras Hikvision y Dahua con visión nocturna a color ColorVu / StarLight",
        "Control de acceso biométrico facial, tarjeta RFID, electroimán y botón LED",
        "Canalización certificada en tubería metálica EMT y cajas conduleta",
        "Configuración de NVRs/DVRs y acceso remoto en tiempo real desde celular",
        "Detección inteligente de movimiento con filtro humano/vehículo",
      ],
      aplicaciones: "Oficinas corporativas, consultorios, conjuntos residenciales, bodegas y locales comerciales.",
      imagen: "/images/proyectos/cctv-norma-emt.jpg",
    },
    {
      id: "wifi",
      titulo: "Redes Wi-Fi (2.4 GHz, 5 GHz y 6 GHz) y Conmutación",
      categoria: "Conectividad Inalámbrica & Switching",
      icono: Radio,
      color: "from-violet-500 to-purple-600",
      descripcion:
        "Despliegue de redes inalámbricas empresariales multi-banda (2.4 GHz, 5 GHz y Wi-Fi 6) y conmutadores administrables. Eliminamos zonas muertas, caídas de señal y congestión por múltiples dispositivos conectados.",
      puntosClave: [
        "Cobertura simultánea en bandas 2.4 GHz (alcance), 5 GHz y 6 GHz (velocidad)",
        "Roaming continuo 802.11k/v/r sin cortes al desplazarse por la sede",
        "Switches PoE Gigabit para alimentación de cámaras, teléfonos IP y APs",
        "Segmentación de redes VLAN para aislar invitados y datos corporativos",
        "Gestión centralizada en la nube (Ruijie Cloud / Omada / UniFi)",
      ],
      aplicaciones: "Restaurantes, hoteles, coworking, colegios y oficinas de alta concurrencia.",
      imagen: "/images/proyectos/wifi-conmutacion.jpg",
    },
    {
      id: "mantenimiento",
      titulo: "Mantenimiento Preventivo y Correctivo de Cómputo",
      categoria: "Soporte Técnico de Hardware",
      icono: Wrench,
      color: "from-sky-500 to-blue-600",
      descripcion:
        "Laboratorio técnico especializado en diagnóstico, descontaminación profunda de polvo, reemplazo de pasta térmica de alta conductividad, ensamble y repotenciación con unidades SSD NVMe y memoria RAM.",
      puntosClave: [
        "Limpieza profunda de filtros, disipadores y cambio de pasta térmica",
        "Diagnóstico de memoria RAM, tarjeta madre, fuentes y discos duros",
        "Instalación limpia de sistemas operativos, licencias y seguridad",
        "Migración de discos mecánicos a discos sólidos ultrarrápidos",
        "Pólizas de soporte periódico mensual o por demanda para empresas",
      ],
      aplicaciones: "Equipos de escritorio, estaciones de alto rendimiento, laptops corporativas y servidores.",
      antesDespues: {
        antes: "/images/proyectos/mantenimiento-antes.jpg",
        despues: "/images/proyectos/mantenimiento-despues.jpg",
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Encabezado */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs">
          Catálogo Oficial de Servicios C&R
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Servicios de Infraestructura Tecnológica
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Desde el cableado estructurado en todas sus categorías hasta redes Wi-Fi multi-banda, videovigilancia CCTV y mantenimiento profundo de cómputo.
        </p>
      </div>

      {/* Lista de Servicios en Tarjetas Grandes */}
      <div className="space-y-10">
        {serviciosDetallados.map((srv, idx) => {
          const Icon = srv.icono;
          return (
            <div
              key={srv.id}
              className="card-glass p-8 sm:p-10 relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Columna Izquierda: Identidad, Descripción y Alcance */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.color} flex items-center justify-center text-white shadow-md shadow-blue-500/15 shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        Línea 0{idx + 1} • {srv.categoria}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {srv.titulo}
                      </h2>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {srv.descripcion}
                  </p>

                  {/* Alcance y Compromisos */}
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/80 space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Alcance y Compromisos
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {srv.puntosClave.map((punto, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{punto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-slate-500">
                    <strong className="text-slate-800">Ideal para:</strong> {srv.aplicaciones}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      to="/cotizador"
                      className="btn-primary-gradient px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>Cotizar con IA</span>
                    </Link>

                    <Link
                      to="/contacto"
                      className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all hover:border-blue-300"
                    >
                      Solicitar Visita Técnica
                    </Link>
                  </div>
                </div>

                {/* Columna Derecha: Evidencia Fotográfica en su Proporción Natural */}
                <div className="lg:col-span-6">
                  {srv.antesDespues ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() =>
                          setImagenAmpliada({
                            src: srv.antesDespues!.antes,
                            alt: `Antes - ${srv.titulo}`,
                          })
                        }
                        className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-slate-100 aspect-[3/4] cursor-pointer group shadow-sm"
                      >
                        <img
                          src={srv.antesDespues.antes}
                          alt={`Antes - ${srv.titulo}`}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-500 text-white shadow-md">
                          Antes
                        </span>
                        <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </div>

                      <div
                        onClick={() =>
                          setImagenAmpliada({
                            src: srv.antesDespues!.despues,
                            alt: `Después - ${srv.titulo}`,
                          })
                        }
                        className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-slate-100 aspect-[3/4] cursor-pointer group shadow-sm"
                      >
                        <img
                          src={srv.antesDespues.despues}
                          alt={`Después - ${srv.titulo}`}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-600 text-white shadow-md">
                          Después
                        </span>
                        <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ) : srv.imagen ? (
                    <div
                      onClick={() => setImagenAmpliada({ src: srv.imagen!, alt: srv.titulo })}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] cursor-pointer group shadow-sm"
                    >
                      <img
                        src={srv.imagen}
                        alt={srv.titulo}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white shadow-sm">
                        Evidencia Certificada C&R
                      </span>
                      <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Garantía y SLA */}
      <div className="card-glass p-8 sm:p-10 text-center space-y-6 bg-gradient-to-r from-blue-50 via-white to-violet-50">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          ¿Tienes una especificación personalizada o planos técnicos?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Analizamos tus requerimientos en planos, visitas de levantamiento físico y enviamos la cotización en PDF con desglose transparente.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/contacto"
            className="btn-primary-gradient px-6 py-3 text-xs font-bold"
          >
            Hablar con un Ingeniero
          </Link>
        </div>
      </div>

      {/* MODAL LIGHTBOX */}
      {imagenAmpliada && (
        <div
          onClick={() => setImagenAmpliada(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setImagenAmpliada(null)}
              className="absolute -top-11 right-0 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
            <img
              src={imagenAmpliada.src}
              alt={imagenAmpliada.alt}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain bg-slate-900"
            />
            <p className="text-white text-xs sm:text-sm font-semibold mt-3 text-center">
              {imagenAmpliada.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

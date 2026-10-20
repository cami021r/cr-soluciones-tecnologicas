import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  UserPlus,
  Network,
  Camera,
  Radio,
  Wrench,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  X,
} from "lucide-react";

interface Especialidad {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  icono: React.ElementType;
  color: string;
  badge: string;
  imagen?: string;
  antesDespues?: {
    antes: string;
    despues: string;
    labelAntes: string;
    labelDespues: string;
  };
  videoUrl?: string;
}

export const Home: React.FC = () => {
  // Estado para alternar vista Antes / Después o ver ambas en paralelo
  const [vistaComparativa, setVistaComparativa] = useState<{ [key: string]: "ambas" | "antes" | "despues" }>({
    cableado: "ambas",
    mantenimiento: "ambas",
  });

  // Estado para ampliar cualquier imagen en pantalla completa (Lightbox)
  const [imagenAmpliada, setImagenAmpliada] = useState<{ src: string; alt: string } | null>(null);

  const especialidades: Especialidad[] = [
    {
      id: "cableado",
      titulo: "Cableado Estructurado",
      categoria: "Infraestructura & Datos",
      descripcion:
        "Tendido, peinado, organización de racks y certificación de puntos de red en todas las categorías (Cat5e, Cat6, Cat6A, Cat7 y Fibra Óptica) bajo normas ANSI/TIA/EIA.",
      icono: Network,
      color: "from-blue-500 to-indigo-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      antesDespues: {
        antes: "/images/proyectos/cableado-antes.jpg",
        despues: "/images/proyectos/cableado-despues.jpg",
        labelAntes: "Antes: Cableado desorganizado",
        labelDespues: "Después: Rack peinado y certificado",
      },
    },
    {
      id: "mantenimiento",
      titulo: "Mantenimiento & Soporte TI",
      categoria: "Hardware & Laboratorio",
      descripcion:
        "Limpieza profunda de equipos y servidores, diagnóstico térmico, cambio de pasta disipadora de alto rendimiento, optimización y soporte preventivo/correctivo.",
      icono: Wrench,
      color: "from-sky-500 to-blue-600",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
      antesDespues: {
        antes: "/images/proyectos/mantenimiento-antes.jpg",
        despues: "/images/proyectos/mantenimiento-despues.jpg",
        labelAntes: "Antes: Saturación de polvo",
        labelDespues: "Después: Limpieza profunda",
      },
    },
    {
      id: "cctv",
      titulo: "Videovigilancia CCTV, Cámaras IP & Control de Acceso",
      categoria: "Seguridad Electrónica & Norma EMT",
      descripcion:
        "Instalación certificada con tubería metálica EMT y cajas de paso de cámaras IP Hikvision/Dahua, biometría facial, electroimanes y monitoreo continuo 24/7.",
      icono: Camera,
      color: "from-indigo-500 to-violet-600",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      imagen: "/images/proyectos/cctv-norma-emt.jpg",
    },
    {
      id: "wifi",
      titulo: "Redes Wi-Fi & Conmutación",
      categoria: "Conectividad 2.4 GHz / 5 GHz / 6 GHz",
      descripcion:
        "Despliegue de redes inalámbricas multi-banda (2.4 GHz, 5 GHz y Wi-Fi 6) y switches administrables con roaming continuo, balanceo de carga y segmentación VLAN.",
      icono: Radio,
      color: "from-violet-500 to-purple-600",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      imagen: "/images/proyectos/wifi-conmutacion.jpg",
    },
  ];

  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* 1. SECCIÓN HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass p-8 sm:p-12 lg:p-14 relative overflow-hidden text-center sm:text-left">
          {/* Mancha decorativa interior */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 via-violet-300/20 to-transparent blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Columna Izquierda: Contenido Principal */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge de Confianza */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-xs font-bold text-blue-700 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Soluciones Integrales en Infraestructura TI • Todo en un Solo Lugar</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Infraestructura TI y conectividad{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  al alcance de tu negocio
                </span>
              </h1>

              {/* Subtítulo explicativo: manejamos de todo en Infraestructura TI */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                Centralizamos todo lo que tu empresa u hogar necesita en tecnología: desde <strong>cableado estructurado y organización de racks</strong>, <strong>redes Wi-Fi multi-banda (2.4, 5 y 6 GHz)</strong>, <strong>cámaras CCTV y control de acceso</strong>, hasta <strong>mantenimiento profundo de computadores, servidores y soporte técnico integral</strong>. Todo al alcance de tu mano, con ingeniería certificada y cotización inteligente.
              </p>

              {/* Pastillas de alcance integral TI */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {[
                  "Cableado Estructurado & Racks",
                  "Redes Wi-Fi 2.4 / 5 / 6 GHz",
                  "CCTV & Control Biométrico",
                  "Mantenimiento PCs & Servidores",
                  "Switching & Routers",
                  "Soporte TI Integral",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-bold text-slate-700"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>

              {/* Botones Principales Requeridos */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/cotizador"
                  className="btn-primary-gradient px-7 py-4 text-sm font-bold flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Probar Cotizador IA</span>
                </Link>

                <Link
                  to="/registro"
                  className="px-7 py-4 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-all hover:border-blue-300 flex items-center justify-center gap-2 text-center"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Crear Cuenta de Cliente</span>
                </Link>
              </div>

              {/* Métricas de Calidad */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Norma TIA/EIA Certificada</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">12 Meses</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Garantía en Instalaciones</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-violet-600">PDF Inmediato</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Propuestas Formales con IA</div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Imagen de Rack y Cableado Estructurado */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() =>
                  setImagenAmpliada({
                    src: "/images/hero-rack-redes.jpg",
                    alt: "Rack de telecomunicaciones y cableado estructurado certificado",
                  })
                }
                className="relative rounded-2xl overflow-hidden border border-white/80 shadow-2xl shadow-indigo-500/15 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/10 to-transparent z-10 pointer-events-none" />
                <img
                  src="/images/hero-rack-redes.jpg"
                  alt="Rack de telecomunicaciones y cableado estructurado certificado"
                  className="w-full h-[340px] sm:h-[400px] lg:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-left flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Infraestructura & Racks Certificados</p>
                    <p className="text-[11px] text-slate-300">Cableado Estructurado, Patch Panels & Conmutación</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESUMEN DE ESPECIALIDADES CON FOTOS COMPLETAS EN PROPORCIÓN NATURAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Nuestras Soluciones
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ingeniería Especializada para Cada Requerimiento
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Diseñamos, instalamos y garantizamos la infraestructura tecnológica que sostiene la operación de tu empresa. Haz clic en cualquier foto para verla en tamaño completo.
          </p>
        </div>

        {/* Grid 2x2 de Especialidades con Proporción Exacta (3:4 para verticales y 16:9 para horizontales) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {especialidades.map((esp) => {
            const Icon = esp.icono;
            const modoVista = vistaComparativa[esp.id] || "ambas";

            return (
              <div
                key={esp.id}
                className="card-glass p-6 sm:p-8 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-5">
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${esp.color} flex items-center justify-center text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${esp.badge}`}>
                      {esp.categoria}
                    </span>
                  </div>

                  {/* Título y descripción arriba para que la imagen luzca amplia */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {esp.titulo}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1.5">
                      {esp.descripcion}
                    </p>
                  </div>

                  {/* Galería Visual: Antes y Después (Proporción 3:4 vertical completa) o Imagen 16:9 */}
                  {esp.antesDespues ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Evidencia Real: Antes vs. Después
                        </span>
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setVistaComparativa((prev) => ({ ...prev, [esp.id]: "ambas" }))}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              modoVista === "ambas" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Comparar
                          </button>
                          <button
                            type="button"
                            onClick={() => setVistaComparativa((prev) => ({ ...prev, [esp.id]: "antes" }))}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              modoVista === "antes" ? "bg-white text-amber-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Antes
                          </button>
                          <button
                            type="button"
                            onClick={() => setVistaComparativa((prev) => ({ ...prev, [esp.id]: "despues" }))}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              modoVista === "despues" ? "bg-white text-emerald-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Después
                          </button>
                        </div>
                      </div>

                      {modoVista === "ambas" ? (
                        <div className="grid grid-cols-2 gap-3.5">
                          <div
                            onClick={() =>
                              setImagenAmpliada({
                                src: esp.antesDespues!.antes,
                                alt: esp.antesDespues!.labelAntes,
                              })
                            }
                            className="relative rounded-2xl overflow-hidden border-2 border-amber-200/90 bg-slate-900/5 aspect-[3/4] cursor-pointer group/img shadow-sm"
                          >
                            <img
                              src={esp.antesDespues.antes}
                              alt={esp.antesDespues.labelAntes}
                              className="w-full h-full object-cover group-hover/img:scale-103 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-500 text-white shadow-md">
                              Antes
                            </span>
                            <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <ZoomIn className="w-4 h-4" />
                            </span>
                          </div>

                          <div
                            onClick={() =>
                              setImagenAmpliada({
                                src: esp.antesDespues!.despues,
                                alt: esp.antesDespues!.labelDespues,
                              })
                            }
                            className="relative rounded-2xl overflow-hidden border-2 border-emerald-200/90 bg-slate-900/5 aspect-[3/4] cursor-pointer group/img shadow-sm"
                          >
                            <img
                              src={esp.antesDespues.despues}
                              alt={esp.antesDespues.labelDespues}
                              className="w-full h-full object-cover group-hover/img:scale-103 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-600 text-white shadow-md">
                              Después
                            </span>
                            <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <ZoomIn className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            setImagenAmpliada({
                              src: modoVista === "antes" ? esp.antesDespues!.antes : esp.antesDespues!.despues,
                              alt: modoVista === "antes" ? esp.antesDespues!.labelAntes : esp.antesDespues!.labelDespues,
                            })
                          }
                          className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/90 h-[380px] sm:h-[420px] flex items-center justify-center cursor-pointer group/img"
                        >
                          <img
                            src={modoVista === "antes" ? esp.antesDespues.antes : esp.antesDespues.despues}
                            alt={modoVista === "antes" ? esp.antesDespues.labelAntes : esp.antesDespues.labelDespues}
                            className="h-full w-auto max-w-full object-contain"
                          />
                          <span
                            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase text-white shadow-md ${
                              modoVista === "antes" ? "bg-amber-500" : "bg-emerald-600"
                            }`}
                          >
                            {modoVista === "antes" ? esp.antesDespues.labelAntes : esp.antesDespues.labelDespues}
                          </span>
                          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-semibold flex items-center gap-1">
                            <ZoomIn className="w-3.5 h-3.5" /> Ampliar
                          </span>
                        </div>
                      )}
                    </div>
                  ) : esp.videoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/10]">
                      <video
                        src={esp.videoUrl}
                        controls
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : esp.imagen ? (
                    <div
                      onClick={() => setImagenAmpliada({ src: esp.imagen!, alt: esp.titulo })}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] cursor-pointer group/img shadow-sm"
                    >
                      <img
                        src={esp.imagen}
                        alt={esp.titulo}
                        className="w-full h-full object-cover group-hover/img:scale-103 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs shadow-sm">
                        Instalación Certificada C&R
                      </span>
                      <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/servicios"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-violet-600 transition-colors"
                  >
                    <span>Ver detalles del servicio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/cotizador"
                    className="text-xs font-bold text-slate-600 hover:text-blue-600"
                  >
                    Cotizar →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tarjeta Destacada CTA horizontal */}
        <div className="card-glass p-7 sm:p-9 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-none shadow-xl shadow-blue-500/20">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              ¿Necesitas asesoría técnica inmediata?
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Cotiza en 3 minutos con Inteligencia Artificial
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Describe tus cámaras, puntos de red, enlaces Wi-Fi o mantenimiento de equipos y obtén al instante un presupuesto formal en PDF.
            </p>
          </div>

          <Link
            to="/cotizador"
            className="px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Ir al Cotizador IA</span>
          </Link>
        </div>
      </section>

      {/* 3. TEASER DE PROYECTOS REALES (PROPORCIÓN AMPLIA PARA QUE SE VEAN COMPLETOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass p-8 sm:p-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Evidencia de Campo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Proyectos Realizados en Bogotá
              </h2>
            </div>

            <Link
              to="/proyectos"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-violet-600 transition-colors"
            >
              <span>Ver galería completa de proyectos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() =>
                setImagenAmpliada({
                  src: "/images/proyectos/rack-principal-organizado.jpg",
                  alt: "Organización Integral de Racks",
                })
              }
              className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                <img
                  src="/images/proyectos/rack-principal-organizado.jpg"
                  alt="Rack Principal Organizado"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Organización Integral de Racks</h4>
                <p className="text-xs text-slate-500">Peinado de cables, patch panels Panduit y conmutadores.</p>
              </div>
            </div>

            <div
              onClick={() =>
                setImagenAmpliada({
                  src: "/images/proyectos/rack-panduit-switches.jpg",
                  alt: "Conmutación Gigabit Ruijie Reyee",
                })
              }
              className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                <img
                  src="/images/proyectos/rack-panduit-switches.jpg"
                  alt="Switches y Patch Cords Panduit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Conmutación Gigabit Ruijie Reyee</h4>
                <p className="text-xs text-slate-500">Enlaces troncales certificados y patch cords de fábrica.</p>
              </div>
            </div>

            <div
              onClick={() =>
                setImagenAmpliada({
                  src: "/images/proyectos/cableado-detalle-16a.jpg",
                  alt: "Rotulación & Norma TIA-606",
                })
              }
              className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                <img
                  src="/images/proyectos/cableado-detalle-16a.jpg"
                  alt="Certificación de Puntos de Red"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Rotulación & Norma TIA-606</h4>
                <p className="text-xs text-slate-500">Identificación por punto para auditoría y soporte ágil.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BANNER FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass p-8 sm:p-12 text-center space-y-6 bg-gradient-to-b from-white to-blue-50/50">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¿Listo para transformar la conectividad de tu empresa?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Agenda una visita técnica presencial en Bogotá o prueba nuestro cotizador con IA sin compromiso.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/cotizador"
              className="btn-primary-gradient px-6 py-3.5 text-xs font-bold"
            >
              Comenzar Cotización con IA
            </Link>

            <Link
              to="/contacto"
              className="px-6 py-3.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-blue-300"
            >
              Contactar Asesor
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL LIGHTBOX PARA VER CUALQUIER IMAGEN COMPLETA SIN RECORTE */}
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

export default Home;

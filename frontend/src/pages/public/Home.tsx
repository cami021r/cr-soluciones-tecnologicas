import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  UserPlus,
  Network,
  Camera,
  Radio,
  Wrench,
  QrCode,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const Home: React.FC = () => {
  const especialidades = [
    {
      id: "cableado",
      titulo: "Cableado Estructurado Cat6",
      categoria: "Infraestructura & Datos",
      descripcion:
        "Tendido, peinado y certificación de puntos de red bajo normas TIA/EIA 568.C con insumos Panduit de alta durabilidad.",
      icono: Network,
      color: "from-blue-500 to-indigo-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "cctv",
      titulo: "Videovigilancia CCTV & Cámaras IP",
      categoria: "Seguridad Electrónica",
      descripcion:
        "Instalación de domos y cámaras ColorVu Hikvision y Dahua con grabación continua, visión nocturna y acceso remoto móvil.",
      icono: Camera,
      color: "from-indigo-500 to-violet-600",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      id: "wifi",
      titulo: "Redes Wi-Fi 6 & Conmutación",
      categoria: "Conectividad Inalámbrica",
      descripcion:
        "Access Points y switches administrables Ruijie Reyee con roaming continuo, balanceo de carga y aislamiento VLAN de invitados.",
      icono: Radio,
      color: "from-violet-500 to-purple-600",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      id: "mantenimiento",
      titulo: "Mantenimiento & Soporte TI",
      categoria: "Hardware & Laboratorio",
      descripcion:
        "Diagnóstico térmico, cambio de pasta disipadora, optimización de servidores, formateo e instalación de software seguro.",
      icono: Wrench,
      color: "from-sky-500 to-blue-600",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      id: "trazabilidad",
      titulo: "Trazabilidad con Códigos QR",
      categoria: "Innovación Tecnológica C&R",
      descripcion:
        "Identificación física en cada equipo para consultar historial técnico, fecha de mantenimiento y estado de garantía sin login.",
      icono: QrCode,
      color: "from-cyan-500 to-teal-600",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
  ];

  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* 1. SECCIÓN HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass p-8 sm:p-14 lg:p-16 relative overflow-hidden text-center sm:text-left">
          {/* Mancha decorativa interior */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 via-violet-300/20 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            {/* Badge de Confianza */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-xs font-bold text-blue-700 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Soporte Técnico, Redes & Seguridad en Bogotá</span>
            </div>

            {/* Título Principal Requerido */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Conectividad que impulsa el{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                crecimiento de tu negocio
              </span>
            </h1>

            {/* Subtítulo explicativo */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
              Eliminamos la informalidad en soporte técnico y redes mediante ingeniería certificada, presupuestos transparentes con Inteligencia Artificial y trazabilidad digital con códigos QR.
            </p>

            {/* Botones Principales Requeridos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
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
            <div className="pt-8 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
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
        </div>
      </section>

      {/* 2. RESUMEN DE ESPECIALIDADES CON BOTONES "VER MÁS" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Nuestras Soluciones
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ingeniería Especializada para Cada Requerimiento
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Diseñamos, instalamos y garantizamos la infraestructura tecnológica que sostiene la operación de tu empresa.
          </p>
        </div>

        {/* Grid de Especialidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialidades.map((esp) => {
            const Icon = esp.icono;
            return (
              <div
                key={esp.id}
                className="card-glass p-7 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${esp.color} flex items-center justify-center text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${esp.badge}`}>
                      {esp.categoria}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {esp.titulo}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                      {esp.descripcion}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/servicios"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-violet-600 transition-colors"
                  >
                    <span>Ver más</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/cotizador"
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                  >
                    Cotizar
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Tarjeta Destacada CTA */}
          <div className="card-glass p-7 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex flex-col justify-between space-y-5 border-none shadow-xl shadow-blue-500/20">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                ¿Necesitas asesoría técnica?
              </span>
              <h3 className="text-xl font-bold text-white">
                Cotiza en 3 minutos con Inteligencia Artificial
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                Describe tus cámaras, puntos de red o mantenimiento, y obtén de inmediato un presupuesto detallado con cálculo matemático exacto.
              </p>
            </div>

            <Link
              to="/cotizador"
              className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ir al Cotizador IA</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TEASER DE PROYECTOS REALES */}
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
            <div className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group">
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src="/images/proyectos/rack-principal-organizado.jpg"
                  alt="Rack Principal Organizado"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback visual si falta la imagen
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Organización Integral de Racks</h4>
                <p className="text-xs text-slate-500">Peinado de cables, patch panels Panduit y conmutadores.</p>
              </div>
            </div>

            <div className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group">
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src="/images/proyectos/rack-panduit-switches.jpg"
                  alt="Switches y Patch Cords Panduit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Conmutación Gigabit Ruijie Reyee</h4>
                <p className="text-xs text-slate-500">Enlaces troncales certificados y patch cords de fábrica.</p>
              </div>
            </div>

            <div className="rounded-[18px] overflow-hidden border border-slate-200 bg-white shadow-xs group">
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src="/images/proyectos/cableado-detalle-16a.jpg"
                  alt="Certificación de Puntos Cat6"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
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
    </div>
  );
};

export default Home;

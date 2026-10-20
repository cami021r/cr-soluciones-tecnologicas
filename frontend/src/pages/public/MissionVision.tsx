import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Compass,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Lightbulb,
  Building,
  ArrowRight,
} from "lucide-react";

export const MissionVision: React.FC = () => {
  const valores = [
    {
      titulo: "Eliminación de la Informalidad",
      descripcion:
        "Erradicamos las cotizaciones informales en servilletas o mensajes sin respaldo mediante presupuestos matemáticos precisos y contratos formales.",
      icono: ShieldCheck,
    },
    {
      titulo: "Transparencia Total de Costos",
      descripcion:
        "El cliente conoce el costo exacto de los insumos y la mano de obra sin sobrecostos ocultos ni intermediarios innecesarios.",
      icono: Award,
    },
    {
      titulo: "Calidad e Ingeniería Certificada",
      descripcion:
        "Cada punto de red, enlace inalámbrico, cámara o mantenimiento se entrega probado, certificado y con respaldo documental y garantía escrita.",
      icono: CheckCircle2,
    },
    {
      titulo: "Compromiso con la PYME Colombiana",
      descripcion:
        "Diseñamos soluciones tecnológicas robustas pero accesibles, impulsando el crecimiento económico del sector productivo en Bogotá.",
      icono: Building,
    },
    {
      titulo: "Innovación & Respaldo SENA",
      descripcion:
        "Formación técnica rigurosa del Servicio Nacional de Aprendizaje (SENA) aplicada a proyectos de infraestructura y desarrollo de software de clase mundial.",
      icono: Lightbulb,
    },
    {
      titulo: "Responsabilidad & Soporte Ágil",
      descripcion:
        "Cumplimiento de acuerdos de nivel de servicio (SLA) con canales de comunicación dedicados y respuesta técnica oportuna.",
      icono: Users,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs">
          Identidad & Principios Corporativos
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Nuestra Misión y Visión
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          En C&R Soluciones Tecnológicas creemos que una infraestructura tecnológica formal y confiable es la base del éxito para cualquier emprendedor o empresa.
        </p>
      </div>

      {/* Grid de Misión y Visión (Tarjetas 20px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tarjeta Misión */}
        <div className="card-glass p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Target className="w-7 h-7" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Propósito Fundamental
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Misión
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Brindar servicios de infraestructura tecnológica, cableado estructurado certificado, redes Wi-Fi multi-banda, videovigilancia CCTV y soporte informático a hogares, emprendimientos y PYMEs en Bogotá, eliminando la informalidad del sector a través de una plataforma digital con Inteligencia Artificial, garantizando precios justos, respaldo legal y excelencia técnica en cada servicio prestado.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 font-medium">
            🎯 Compromiso: 100% de servicios documentados con actas y pólizas de garantía claras.
          </div>
        </div>

        {/* Tarjeta Visión */}
        <div className="card-glass p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Compass className="w-7 h-7" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 block">
              Proyección 2028 - 2030
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Visión
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Consolidarnos para el año 2030 como la microempresa líder y referente en Bogotá y Cundinamarca en integración de redes, seguridad electrónica y mantenimiento TI para el sector microempresarial, reconocida por su modelo de atención digital transparente, la alta cualificación técnica de su talento humano y su plataforma tecnológica de autoservicio para cotizaciones inteligentes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200/60 text-xs text-violet-900 font-medium">
            🚀 Meta: Automatizar el 90% de los procesos presupuestales con cero margen de error.
          </div>
        </div>
      </div>

      {/* Valores Corporativos */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Principios que Rigen Nuestro Trabajo
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Cada instalación, cableado o mantenimiento técnico se ejecuta bajo los más altos estándares éticos y de ingeniería.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valores.map((val, idx) => {
            const Icon = val.icono;
            return (
              <div
                key={idx}
                className="card-glass p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {val.titulo}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {val.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloque SENA Capstone */}
      <div className="card-glass p-8 sm:p-10 border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-violet-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Proyecto de Grado SENA
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Tecnólogo en Análisis y Desarrollo de Software (ADSO)
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
            Este ecosistema web fue concebido e implementado por <strong>Camila Andrea Quintero Roa</strong> (Ficha 2834855) como propuesta integral de grado para modernizar el sector técnico en Colombia.
          </p>
        </div>

        <Link
          to="/proyectos"
          className="btn-primary-gradient px-6 py-3 text-xs font-bold shrink-0 flex items-center gap-2"
        >
          <span>Ver Evidencias</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default MissionVision;

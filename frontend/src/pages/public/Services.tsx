import React from "react";
import { Link } from "react-router-dom";
import {
  Network,
  Camera,
  Radio,
  Wrench,
  QrCode,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const Services: React.FC = () => {
  const serviciosDetallados = [
    {
      id: "cableado",
      titulo: "Cableado Estructurado Cat6 y Centros de Cómputo",
      categoria: "Infraestructura Física",
      icono: Network,
      color: "from-blue-500 to-indigo-600",
      descripcion:
        "Diseño, instalación y rotulación de cableado de cobre y fibra óptica para oficinas, locales y bodegas en Bogotá. Cumplimos estrictamente las normas ANSI/TIA/EIA 568.C e ISO/IEC 11801.",
      puntosClave: [
        "Tendido y peinado con insumos Panduit y Siemon",
        "Conectorización de Patch Panels y Jacks RJ45 certificados",
        "Organización y marquillado estandarizado TIA-606",
        "Pruebas de atenuación, continuidad y velocidad gigabit",
        "12 meses de garantía directa de mano de obra",
      ],
      aplicaciones: "PYMEs, consultorios, oficinas corporativas, bodegas y locales comerciales.",
    },
    {
      id: "cctv",
      titulo: "Sistemas de Videovigilancia CCTV y Cámaras IP",
      categoria: "Seguridad Electrónica",
      icono: Camera,
      color: "from-indigo-500 to-violet-600",
      descripcion:
        "Circuitos cerrados de televisión analógicos e IP de alta definición (4MP / 4K) con marcas líderes mundiales como Hikvision y Dahua Technology para monitoreo continuo 24/7.",
      puntosClave: [
        "Tecnología ColorVu y StarLight para visión nocturna a color",
        "Configuración de NVRs/DVRs con compresión eficiente H.265+",
        "Acceso remoto en tiempo real desde smartphones y computadores",
        "Detección de movimiento inteligente con filtro humano/vehículo",
        "Canalizaciones seguras en tubería EMT o canaleta plástica",
      ],
      aplicaciones: "Conjuntos residenciales, plantas industriales, almacenes, colegios y empresas.",
    },
    {
      id: "wifi",
      titulo: "Redes Wi-Fi 6 de Alta Densidad y Conmutación",
      categoria: "Conectividad Inalámbrica",
      icono: Radio,
      color: "from-violet-500 to-purple-600",
      descripcion:
        "Despliegue de redes inalámbricas empresariales con Access Points Ruijie Reyee. Eliminamos zonas muertas, caídas de señal y congestión por múltiples dispositivos conectados.",
      puntosClave: [
        "Roaming continuo 802.11k/v/r sin cortes al desplazarse",
        "Switches PoE Gigabit para alimentación de cámaras y APs",
        "Portal cautivo para clientes con control de ancho de banda",
        "Segmentación de redes VLAN para aislar datos sensibles",
        "Gestión centralizada en la nube Ruijie Cloud sin costo",
      ],
      aplicaciones: "Restaurantes, hoteles, coworking, colegios y oficinas de alta concurrencia.",
    },
    {
      id: "mantenimiento",
      titulo: "Mantenimiento Preventivo y Correctivo de Cómputo",
      categoria: "Soporte Técnico de Hardware",
      icono: Wrench,
      color: "from-sky-500 to-blue-600",
      descripcion:
        "Laboratorio técnico especializado en diagnóstico, limpieza ultrasónica, reemplazo de pasta térmica de alta conductividad, ensamble y repotenciación con unidades SSD NVMe.",
      puntosClave: [
        "Limpieza profunda y cambio de pasta térmica (Arctic MX-4)",
        "Diagnóstico de memoria RAM, tarjeta madre y discos duros",
        "Instalación limpia de sistemas operativos y antivirus",
        "Migración de discos mecánicos a discos sólidos ultrarrápidos",
        "Pólizas de soporte periódico mensual para empresas",
      ],
      aplicaciones: "Equipos de escritorio, laptops corporativas, servidores torre y estaciones de diseño.",
    },
    {
      id: "trazabilidad",
      titulo: "Trazabilidad Digital y Garantías con Código QR",
      categoria: "Software Exclusivo C&R",
      icono: QrCode,
      color: "from-cyan-500 to-teal-600",
      descripcion:
        "Módulo de desarrollo propio incluido en nuestra plataforma. Cada equipo intervenido recibe una etiqueta con código QR único para auditoría inmediata y consulta de garantía.",
      puntosClave: [
        "Escaneo público desde cualquier celular sin necesidad de login",
        "Consulta inmediata de marca, modelo, estado y fecha de garantía",
        "Historial inmutable de mantenimientos y técnicos responsables",
        "Generación automática de PDF con cotizaciones y actas de entrega",
        "Protección total de la privacidad del cliente",
      ],
      aplicaciones: "Inventarios empresariales, control de activos fijos y seguimiento de garantías.",
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
          Desde el cableado estructurado hasta la gestión de seguridad electrónica y trazabilidad digital, ofrecemos soluciones sólidas y con respaldo formal.
        </p>
      </div>

      {/* Lista de Servicios en Tarjetas Grandes 20px */}
      <div className="space-y-8">
        {serviciosDetallados.map((srv, idx) => {
          const Icon = srv.icono;
          return (
            <div
              key={srv.id}
              className="card-glass p-8 sm:p-10 relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Identidad y Descripción */}
                <div className="lg:col-span-7 space-y-4">
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

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-2">
                    {srv.descripcion}
                  </p>

                  <div className="pt-2 text-xs text-slate-500">
                    <strong className="text-slate-800">Ideal para:</strong> {srv.aplicaciones}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap items-center gap-3 pt-4">
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

                {/* Columna Derecha: Puntos Clave & Entregables */}
                <div className="lg:col-span-5 bg-blue-50/50 rounded-2xl p-6 border border-blue-100/80 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Alcance y Compromisos
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {srv.puntosClave.map((punto, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
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
    </div>
  );
};

export default Services;

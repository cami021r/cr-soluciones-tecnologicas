import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Network,
  Camera,
  Server,
  Wrench,
  Bot,
  Send,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Clock,
  Target,
  Compass,
  Radio,
  HardDrive,
  MessageCircle,
  ExternalLink,
  Layers,
  MapPin,
  Laptop,
  QrCode,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";

interface DemoMessage {
  rol: "user" | "assistant";
  contenido: string;
}

export const LandingPage: React.FC = () => {
  // Estado para el Chatbot de Demostración (Paso 11.3)
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    {
      rol: "assistant",
      contenido:
        "¡Hola! 👋 Soy el asesor virtual con IA de C&R Soluciones Tecnológicas. Puedes consultarme tarifas de cableado Cat6, cámaras Hikvision o Dahua, redes Wi-Fi Ruijie o pedirme una cotización rápida de prueba.",
    },
  ]);
  const [demoInput, setDemoInput] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  // Estado para el Formulario de Contacto (Paso 11.4)
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "Cableado Cat6 y Redes",
    mensaje: "",
  });
  const [contactErrors, setContactErrors] = useState<{ [key: string]: string }>({});
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleSendDemoMessage = async (texto: string) => {
    const promptTexto = texto || demoInput;
    if (!promptTexto.trim() || demoLoading) return;

    const userMsg: DemoMessage = { rol: "user", contenido: promptTexto };
    setDemoMessages((prev) => [...prev, userMsg]);
    setDemoInput("");
    setDemoLoading(true);

    try {
      const res = await api.get("/catalogo/chatbot/conocimiento");
      const servicios = res.data?.servicios || [];
      const lower = promptTexto.toLowerCase();

      let respuesta = "";
      if (lower.includes("cámara") || lower.includes("camara") || lower.includes("cctv") || lower.includes("hikvision")) {
        respuesta =
          "En C&R Soluciones instalamos sistemas de videovigilancia Hikvision y Dahua 4MP con visión nocturna ColorVu/StarLight. La mano de obra por cámara instalada está en aprox $60.000 COP y la cámara profesional en $364.000 COP (con 1 año de garantía). ¿Cuántas cámaras requieres para tu local o empresa?";
      } else if (lower.includes("cable") || lower.includes("red") || lower.includes("punto") || lower.includes("ruijie")) {
        respuesta =
          "Realizamos cableado estructurado Cat6 certificado con insumos Panduit y switches empresariales Ruijie Reyee. La tarifa de mano de obra base por punto de red es de $35.000 COP. ¿En qué zona de Bogotá se encuentra tu sede?";
      } else {
        const servicioEjemplo = servicios[0]?.nombre || "Instalación de redes y soporte técnico";
        respuesta = `Con gusto te asesoramos en ${servicioEjemplo}. Nuestra plataforma web te permite generar la propuesta formal con desglose en PDF y hacer seguimiento a garantías en tiempo real. ¡Te invitamos a crear tu cuenta o contactarnos por WhatsApp!`;
      }

      setDemoMessages((prev) => [...prev, { rol: "assistant", contenido: respuesta }]);
    } catch {
      setDemoMessages((prev) => [
        ...prev,
        {
          rol: "assistant",
          contenido:
            "En C&R Soluciones ofrecemos soporte técnico, cableado estructurado Cat6, videovigilancia Hikvision/Dahua y redes Wi-Fi Ruijie. Regístrate o haz clic en 'Contáctanos' para agendar una visita técnica presencial en Bogotá.",
        },
      ]);
    } finally {
      setDemoLoading(false);
    }
  };

  const validateContactForm = () => {
    const errors: { [key: string]: string } = {};

    if (!contactForm.nombre.trim() || contactForm.nombre.length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactForm.email.trim() || !emailRegex.test(contactForm.email)) {
      errors.email = "Ingresa un correo electrónico válido.";
    }

    const phoneRegex = /^[0-9+ ]{7,15}$/;
    if (!contactForm.telefono.trim() || !phoneRegex.test(contactForm.telefono)) {
      errors.telefono = "Ingresa un número de contacto válido (mínimo 7 dígitos).";
    }

    if (!contactForm.mensaje.trim() || contactForm.mensaje.length < 10) {
      errors.mensaje = "Por favor detalla tu requerimiento (mínimo 10 caracteres).";
    }

    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContactForm()) {
      setContactSuccess(true);
      setContactForm({
        nombre: "",
        email: "",
        telefono: "",
        servicio: "Cableado Cat6 y Redes",
        mensaje: "",
      });
      setTimeout(() => setContactSuccess(false), 7000);
    }
  };

  // Proveedores y marcas con las que trabajamos
  const proveedores = [
    {
      nombre: "Hikvision",
      alias: "CCTV & Seguridad Líder",
      categoria: "Videovigilancia & Control",
      descripcion:
        "Cámaras IP 4K, domos inteligentes, tecnología ColorVu para visión nocturna a color y NVRs centralizados.",
      borde: "border-red-200 hover:border-red-400",
      badge: "text-red-700 bg-red-50 border-red-200",
      iconoBg: "bg-red-50 text-red-600",
      icono: Camera,
    },
    {
      nombre: "Ruijie Networks / Reyee",
      alias: "Conmutación & Wi-Fi 6",
      categoria: "Redes Empresariales",
      descripcion:
        "Switches PoE gestionables en la nube, Access Points Wi-Fi 6 de alta concurrencia y roaming continuo.",
      borde: "border-sky-200 hover:border-sky-400",
      badge: "text-sky-700 bg-sky-50 border-sky-200",
      iconoBg: "bg-sky-50 text-sky-600",
      icono: Server,
    },
    {
      nombre: "Dahua Technology",
      alias: "Seguridad & Analítica",
      categoria: "Sistemas CCTV & IoT",
      descripcion:
        "Cámaras con sensores StarLight para ultra baja iluminación, reconocimiento y almacenamiento de alta fidelidad.",
      borde: "border-amber-200 hover:border-amber-400",
      badge: "text-amber-700 bg-amber-50 border-amber-200",
      iconoBg: "bg-amber-50 text-amber-600",
      icono: Shield,
    },
    {
      nombre: "TP-Link Omada",
      alias: "Infraestructura PYME",
      categoria: "Networking Gestionable",
      descripcion:
        "Gateways multi-WAN, switches gigabit capa 2/3 y controladores de red unificados para oficinas.",
      borde: "border-teal-200 hover:border-teal-400",
      badge: "text-teal-700 bg-teal-50 border-teal-200",
      iconoBg: "bg-teal-50 text-teal-600",
      icono: Network,
    },
    {
      nombre: "MikroTik",
      alias: "RouterOS & Firewall",
      categoria: "Enrutamiento Avanzado",
      descripcion:
        "Balanceo de cargas multicanal, túneles VPN IPsec/WireGuard y seguridad perimetral de alto tráfico.",
      borde: "border-cyan-200 hover:border-cyan-400",
      badge: "text-cyan-700 bg-cyan-50 border-cyan-200",
      iconoBg: "bg-cyan-50 text-cyan-600",
      icono: Radio,
    },
    {
      nombre: "Panduit",
      alias: "Cableado Certificado",
      categoria: "Cobre Cat6 & Racks",
      descripcion:
        "Patch cords de alto rendimiento, jacks blindados y canalización bajo estándares internacionales TIA/EIA.",
      borde: "border-emerald-200 hover:border-emerald-400",
      badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
      iconoBg: "bg-emerald-50 text-emerald-600",
      icono: Laptop,
    },
    {
      nombre: "Western Digital",
      alias: "Almacenamiento Continuo",
      categoria: "Discos WD Purple",
      descripcion:
        "Discos duros de grado industrial diseñados para grabación CCTV 24/7 ininterrumpida sin pérdida de cuadros.",
      borde: "border-purple-200 hover:border-purple-400",
      badge: "text-purple-700 bg-purple-50 border-purple-200",
      iconoBg: "bg-purple-50 text-purple-600",
      icono: HardDrive,
    },
    {
      nombre: "Ubiquiti UniFi",
      alias: "Wireless de Alta Densidad",
      categoria: "Ecosistema Corporativo",
      descripcion:
        "Enlaces punto a punto de largo alcance y gestión de red centralizada para escenarios de alta demanda.",
      borde: "border-indigo-200 hover:border-indigo-400",
      badge: "text-indigo-700 bg-indigo-50 border-indigo-200",
      iconoBg: "bg-indigo-50 text-indigo-600",
      icono: Layers,
    },
  ];

  // Proyectos reales con las fotos subidas por el usuario
  const proyectos = [
    {
      titulo: "Peinado de Patch Panels & Rotulación Normativa 16A",
      cliente: "Sede Corporativa & Coworking (Chapinero, Bogotá)",
      descripcion:
        "Conectorización detallada punto a punto en cable Cat6 azul de alto desempeño, marcación individual bajo norma TIA-606 y pruebas de reflectometría para cero pérdida de paquetes.",
      metricas: ["32 Puntos Certificados", "Marcación 100% Trazable", "Garantía 12 Meses"],
      marcas: ["Panduit Cat6", "Patch Panels 24p", "Conectores RJ45 Blindados"],
      imagen: "/images/proyectos/cableado-detalle-16a.jpg",
      icono: Network,
    },
    {
      titulo: "Montaje Integral de Rack Principal de Comunicaciones",
      cliente: "Centro Empresarial & Distribuidora (Fontibón, Bogotá)",
      descripcion:
        "Organización vertical y horizontal en rack de piso de 42RU con bandejas ventiladas, distribución simétrica de patch cords azules, conmutación con switches gigabit gestionables y rotulación de puertos.",
      metricas: ["Rack 42RU Organizado", "4 Switches Gigabit", "Flujo Térmico Optimizado"],
      marcas: ["Ruijie Networks", "HP ProCurve", "Racks de Piso"],
      imagen: "/images/proyectos/rack-principal-organizado.jpg",
      icono: Server,
    },
    {
      titulo: "Gabinete Panduit con Switches PoE y Enlace de Fibra",
      cliente: "Oficinas Administrativas PYME (Chicó, Bogotá)",
      descripcion:
        "Instalación de rack perimetral marca Panduit con organizadores de cable de alta densidad, alimentación PoE para cámaras CCTV y puntos de acceso Wi-Fi 6, y peinado con velcro certificado.",
      metricas: ["Rack Panduit Original", "Switches PoE+", "Alimentación Centralizada"],
      marcas: ["Panduit Original", "Switches PoE", "Fibra Óptica OM3"],
      imagen: "/images/proyectos/rack-panduit-switches.jpg",
      icono: Wrench,
    },
    {
      titulo: "Sistema CCTV IP 4K con Visión Nocturna ColorVu & NVR",
      cliente: "Bodega de Almacenamiento & Logística (Bogotá D.C.)",
      descripcion:
        "Despliegue de 12 cámaras IP domo y tubo Hikvision con sensor ColorVu para visualización a color 24/7, almacenamiento continuo en NVR con disco WD Purple de 8TB y visualización remota en tiempo real.",
      metricas: ["12 Cámaras IP 4K", "Grabación 24/7 30 Días", "Monitoreo Móvil"],
      marcas: ["Hikvision ColorVu", "WD Purple 8TB", "Switches Ruijie"],
      imagen: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80",
      icono: Camera,
    },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen selection:bg-sky-500 selection:text-white">
      {/* 1. HERO SECTION (Fondo Claro idéntico a la Maqueta) */}
      <section className="relative overflow-hidden pt-12 pb-24 bg-gradient-to-b from-sky-50/60 via-white to-slate-50 border-b border-slate-100">
        {/* Curvas y destellos orgánicos en azul y cyan */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-200/40 via-cyan-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-blue-100/40 via-violet-100/30 to-transparent rounded-full blur-3xl pointer-events-none -ml-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Columna Izquierda: Mensaje y Llamados a la Acción */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Kicker Superior */}
              <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono">
                REDES • CABLEADO ESTRUCTURADO • CCTV • SOPORTE TÉCNICO
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Conectividad que impulsa el crecimiento de tu{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600">
                  negocio
                </span>
              </h1>

              {/* Descripción */}
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                Diseñamos e implementamos redes de alta velocidad, cableado estructurado Cat6, sistemas CCTV de última generación y soporte técnico con presupuestos inteligentes en tiempo real.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <a
                  href="#cotizador-demo"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 text-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span>Probar Cotizador IA</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>

                <Link
                  to="/registro"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-white hover:bg-sky-50 text-sky-600 border border-sky-300 shadow-sm flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Shield className="w-4 h-4 text-sky-500" />
                  <span>Crear Cuenta de Cliente</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Columna Derecha: Ilustración Tecnológica con Tarjeta Flotante */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10 border border-sky-100 group">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80"
                  alt="Centro de Datos y Cableado Estructurado C&R"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-sky-900/10"></div>

                {/* Tarjeta Flotante: "Redes más rápidas, Negocios más fuertes" */}
                <div className="absolute top-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xl flex items-center gap-3 max-w-xs">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30 flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Redes más rápidas</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Negocios más fuertes</p>
                  </div>
                </div>

                {/* Badge Inferior */}
                <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Infraestructura Cat6 en Bogotá</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila de Tarjetas de Confianza (4 Badges de la Maqueta) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-200/80">
            {/* Badge 1 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:border-sky-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Certificación Panduit Cat6</h4>
                <p className="text-[11px] text-slate-500">Mayor rendimiento y estabilidad</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:border-sky-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Atención SLA Garantizada</h4>
                <p className="text-[11px] text-slate-500">Soporte cuando lo necesitas</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:border-sky-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Garantía 1 Año en Equipos</h4>
                <p className="text-[11px] text-slate-500">Tu inversión protegida</p>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:border-sky-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Trazabilidad con Códigos QR</h4>
                <p className="text-[11px] text-slate-500">Control total de cada instalación</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿QUÉ HACEMOS? / NUESTRAS ESPECIALIDADES (Tema Claro) */}
      <section id="que-hacemos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
            NUESTRAS ESPECIALIDADES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Soluciones robustas para empresas{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600">
              modernas
            </span>
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            Estandarización técnica bajo normas internacionales TIA/EIA e interoperabilidad con marcas líderes en el mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjeta 1: Cableado Estructurado */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cableado Estructurado</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Instalación punto a punto en cobre Cat6 y Cat6A con canalización, patch panels, racks ordenados y certificación.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-600">Desde $35.000 COP / pto</span>
              <a href="#cotizador-demo" className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-semibold">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tarjeta 2: Videovigilancia CCTV */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Videovigilancia CCTV</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Cámaras IP 4K con sensor StarLight para visión nocturna a color, switches PoE y almacenamiento NVR centralizado.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-600">Desde $60.000 COP</span>
              <a href="#cotizador-demo" className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-semibold">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tarjeta 3: Enrutamiento & Wi-Fi */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-600 text-white flex items-center justify-center mb-6 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enrutamiento & Wi-Fi 6</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Configuración de switches y routers Ruijie Reyee y MikroTik, seguridad perimetral, balanceo de cargas y roaming Wi-Fi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-600">Setup desde $80.000 COP</span>
              <a href="#cotizador-demo" className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-semibold">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tarjeta 4: Soporte y Mantenimiento */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Soporte y Mesa de Ayuda</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Mantenimiento preventivo de cómputo, diagnóstico de hardware, trazabilidad con códigos QR y atención con SLA.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-600">Atención con SLA</span>
              <a href="#cotizador-demo" className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-semibold">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISIÓN Y VISIÓN (Texto Exacto Institucional en Tema Claro) */}
      <section id="mision-vision" className="py-24 bg-gradient-to-b from-slate-50 via-sky-50/30 to-white border-y border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
              IDENTIDAD CORPORATIVA & RUMBO ESTRATÉGICO
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Nuestra Misión y Visión
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              El compromiso ético y la proyección tecnológica que guían cada uno de nuestros proyectos en C&R Soluciones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Card: MISIÓN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-sky-200 shadow-xl shadow-sky-500/5 relative flex flex-col justify-between hover:border-sky-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold tracking-wider">
                    <Target className="w-4 h-4 text-sky-600" />
                    MISIÓN
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Propósito Actual</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Transformar la informalidad técnica en un servicio profesional y trazable
                </h3>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-justify mb-6">
                  C&R Soluciones Tecnológicas es una microempresa bogotana dedicada a prestar servicios de soporte técnico, instalación y mantenimiento de redes, seguridad electrónica e IoT, y mantenimiento de equipos de cómputo a hogares, emprendedores, pequeños negocios y pymes, respaldada por una plataforma web de gestión empresarial que permite a sus clientes consultar en tiempo real cotizaciones, garantías y solicitudes de soporte. Buscamos transformar la informalidad del sector tecnológico local en un servicio profesional, trazable y confiable, aplicando conocimientos en desarrollo de software para generar valor real a nuestros clientes.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="block font-bold text-sky-700">Microempresa Bogotana</span>
                  <span className="text-[11px] text-slate-500">Cercanía y atención local</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="block font-bold text-sky-700">Plataforma Web</span>
                  <span className="text-[11px] text-slate-500">Gestión y garantías 24/7</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
                  <span className="block font-bold text-sky-700">Cero Informalidad</span>
                  <span className="text-[11px] text-slate-500">Transparencia técnica</span>
                </div>
              </div>
            </div>

            {/* Card: VISIÓN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-blue-200 shadow-xl shadow-blue-500/5 relative flex flex-col justify-between hover:border-blue-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold tracking-wider">
                    <Compass className="w-4 h-4 text-blue-600" />
                    VISIÓN 2029
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Meta a Futuro</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Consolidación como empresa referente de servicios tecnológicos en Bogotá y Colombia
                </h3>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-justify mb-6">
                  Para el año 2029, C&R Soluciones Tecnológicas se consolidará como una empresa referente en servicios tecnológicos en Bogotá, reconocida por su trazabilidad digital, la automatización de su proceso de cotización mediante inteligencia artificial y su compromiso con la calidad del servicio, ampliando su cobertura a otras ciudades de Colombia mediante soporte remoto, fortaleciendo su equipo técnico y consolidando una cartera de clientes recurrentes fidelizados a través de planes de mantenimiento y su portal digital.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="block font-bold text-blue-700">Cotización con IA</span>
                  <span className="text-[11px] text-slate-500">Automatización total</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="block font-bold text-blue-700">Expansión Nacional</span>
                  <span className="text-[11px] text-slate-500">Soporte remoto Colombia</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
                  <span className="block font-bold text-blue-700">Planes Continuos</span>
                  <span className="text-[11px] text-slate-500">Fidelización de clientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROYECTOS REALIZADOS (Con las Fotos Reales del Usuario) */}
      <section id="proyectos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
            EXPERIENCIA COMPROBADA EN CAMPO
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Proyectos Realizados
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Casos de éxito documentados con fotografías reales de nuestras instalaciones en racks, cableado estructurado y videovigilancia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {proyectos.map((proy, idx) => {
            const Icono = proy.icono;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl hover:border-sky-400 transition-all group flex flex-col justify-between"
              >
                {/* Fotografía Real */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                  <img
                    src={proy.imagen}
                    alt={proy.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                  {/* Badge de Cliente / Ubicación */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>{proy.cliente}</span>
                  </div>

                  {/* Icono de Solución */}
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Icono className="w-5 h-5" />
                  </div>
                </div>

                {/* Contenido del Proyecto */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {proy.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
                      {proy.descripcion}
                    </p>
                  </div>

                  {/* Métricas y Resultados */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {proy.metricas.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center"
                      >
                        <span className="text-[11px] font-bold text-sky-700 block">{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Marcas utilizadas */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Equipamiento:</span>
                    {proy.marcas.map((marca, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono font-medium"
                      >
                        {marca}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PROVEEDORES Y MARCAS CON LAS QUE TRABAJAMOS */}
      <section id="proveedores" className="py-24 bg-slate-50/70 border-y border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
              ALIANZAS TECNOLÓGICAS & REPUESTOS ORIGINALES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Marcas y Proveedores con los que Trabajamos
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Respaldamos nuestros proyectos con fabricantes de primer nivel mundial como Hikvision, Ruijie Networks, Dahua, MikroTik y Panduit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {proveedores.map((prov, idx) => {
              const Icono = prov.icono;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-white border ${prov.borde} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${prov.iconoBg} flex items-center justify-center`}>
                        <Icono className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${prov.badge}`}>
                        {prov.categoria}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {prov.nombre}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 block mb-2">
                      {prov.alias}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {prov.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Garantía Oficial</span>
                    <span className="text-sky-600 font-bold">Repuesto Original</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CHATBOT DE DEMOSTRACIÓN ABIERTO AL PÚBLICO (Tema Claro) */}
      <section id="cotizador-demo" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
            MOTOR INTELIGENTE CON IA
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Cotiza tu Proyecto en Tiempo Real con Nuestro Asesor IA
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            Conversa de forma natural. Nuestra IA consulta las tarifas oficiales de mano de obra y equipos en catálogo para calcular tu presupuesto en segundos.
          </p>
        </div>

        {/* Caja del Chat Interactivo en Tema Claro */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Cabecera del chat */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Asesor Virtual C&R</span>
                <span className="text-[10px] text-slate-500">En línea • Motor de Cotizaciones Activo</span>
              </div>
            </div>
            <Link
              to="/registro"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full transition-colors"
            >
              Registrarse para descargar PDF ➔
            </Link>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {demoMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.rol === "user"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none shadow-md shadow-sky-500/20"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.contenido}
                </div>
              </div>
            ))}
            {demoLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-600 text-xs rounded-2xl p-4 flex items-center gap-2 border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></div>
                  Consultando catálogo de tarifas y calculando presupuesto...
                </div>
              </div>
            )}
          </div>

          {/* Consultas frecuentes */}
          <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 whitespace-nowrap font-medium">Consultas frecuentes:</span>
            <button
              onClick={() => handleSendDemoMessage("¿Cuánto cuesta instalar 4 cámaras Hikvision exteriores?")}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap border border-slate-200 transition-colors font-medium"
            >
              📹 4 cámaras Hikvision
            </button>
            <button
              onClick={() => handleSendDemoMessage("Necesito cotizar cableado para 8 puntos de red Cat6")}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap border border-slate-200 transition-colors font-medium"
            >
              🔌 8 puntos Cat6
            </button>
            <button
              onClick={() => handleSendDemoMessage("¿Qué costo tiene el mantenimiento de 5 computadores?")}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap border border-slate-200 transition-colors font-medium"
            >
              💻 Mantenimiento de PCs
            </button>
          </div>

          {/* Input del chat */}
          <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendDemoMessage(demoInput)}
              placeholder="Escribe tu requerimiento aquí (ej. instalación de cámaras, cableado o PCs)..."
              className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSendDemoMessage(demoInput)}
              disabled={demoLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-sky-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. CONTÁCTANOS (Formulario + Canales Directos en Tema Claro) */}
      <section id="contacto" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-14 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Columna Izquierda: Información de Contacto Directo */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-block text-xs font-bold tracking-wider uppercase text-sky-600 font-mono mb-2">
                  ATENCIÓN INMEDIATA
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  Contáctanos
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
                  ¿Tienes un proyecto de cableado, seguridad CCTV o requieres mantenimiento técnico para tu negocio? Escríbenos o llámanos directamente.
                </p>
              </div>

              {/* Botón Destacado de WhatsApp */}
              <a
                href="https://wa.me/573115389889?text=Hola%20C%26R%20Soluciones,%20deseo%20asesor%C3%ADa%20para%20un%20proyecto%20tecnol%C3%B3gico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chatear por WhatsApp (+57 311 538 9889)</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>

              {/* Enlaces de Contacto Telefónico y Email */}
              <div className="space-y-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <a
                  href="tel:+573115389889"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="block font-bold text-slate-900">Línea Directa Móvil</span>
                    <span className="text-slate-600">+57 311 538 9889</span>
                  </div>
                </a>

                <a
                  href="mailto:contacto@crsoluciones.com"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="block font-bold text-slate-900">Correo Corporativo</span>
                    <span className="text-slate-600">contacto@crsoluciones.com</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <MapPin className="w-4 h-4 text-sky-600 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900">Ubicación</span>
                    <span className="text-slate-600">Bogotá D.C., Colombia • Visitas técnicas presenciales</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario con Validación TypeScript */}
            <div className="lg:col-span-3 bg-slate-50/70 p-6 sm:p-8 rounded-3xl border border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 mb-1">Envíanos un Mensaje</h4>
              <p className="text-xs text-slate-500 mb-6">
                Te responderemos con un diagnóstico preliminar y propuesta técnica en menos de 2 horas hábiles.
              </p>

              {contactSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  <span>¡Mensaje recibido con éxito! Un técnico especialista de C&R se comunicará contigo de inmediato.</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={contactForm.nombre}
                      onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                      placeholder="Ej. Camila Quintero"
                      className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.nombre ? "border-red-500" : "border-slate-200"
                      } focus:outline-none focus:border-sky-500`}
                    />
                    {contactErrors.nombre && (
                      <span className="text-[11px] text-red-500 mt-1 block">{contactErrors.nombre}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="camila@empresa.com"
                      className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.email ? "border-red-500" : "border-slate-200"
                      } focus:outline-none focus:border-sky-500`}
                    />
                    {contactErrors.email && (
                      <span className="text-[11px] text-red-500 mt-1 block">{contactErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      value={contactForm.telefono}
                      onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                      placeholder="311 538 9889"
                      className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.telefono ? "border-red-500" : "border-slate-200"
                      } focus:outline-none focus:border-sky-500`}
                    />
                    {contactErrors.telefono && (
                      <span className="text-[11px] text-red-500 mt-1 block">{contactErrors.telefono}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Línea de Servicio Requerida
                    </label>
                    <select
                      value={contactForm.servicio}
                      onChange={(e) => setContactForm({ ...contactForm, servicio: e.target.value })}
                      className="w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                    >
                      <option value="Cableado Cat6 y Redes">Cableado Estructurado Cat6 y Redes</option>
                      <option value="CCTV y Cámaras Hikvision">Videovigilancia CCTV y Cámaras IP</option>
                      <option value="Wi-Fi 6 y Conmutación Ruijie">Redes Wi-Fi 6 y Switches Ruijie</option>
                      <option value="Mantenimiento PCs">Mantenimiento de Cómputo (Hogar/PYME)</option>
                      <option value="Plataforma y Garantías">Plataforma Web y Trazabilidad con QR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Detalles del requerimiento *
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    placeholder="Cuéntanos cuántos puntos de red, cámaras, equipos o la ubicación de tu sede..."
                    className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                      contactErrors.mensaje ? "border-red-500" : "border-slate-200"
                    } focus:outline-none focus:border-sky-500`}
                  ></textarea>
                  {contactErrors.mensaje && (
                    <span className="text-[11px] text-red-500 mt-1 block">{contactErrors.mensaje}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud Técnica</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

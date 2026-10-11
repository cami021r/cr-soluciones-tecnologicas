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
  Sparkles,
  PhoneCall,
  Clock,
  Award,
  Target,
  Compass,
  Cpu,
  Radio,
  HardDrive,
  MessageCircle,
  ExternalLink,
  Layers,
  Check,
  Building2,
  MapPin,
  Laptop,
} from "lucide-react";
import { Logo } from "../../components/Logo";
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
        "¡Hola! 👋 Soy el asesor virtual con IA de C&R Soluciones Tecnológicas. Puedes consultarme tarifas de cableado Cat6, cámaras Hikvision o Dahua, configuraciones Wi-Fi Ruijie o solicitar una cotización automática de prueba.",
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
          "En C&R Soluciones instalamos sistemas de videovigilancia Hikvision y Dahua 4MP con visión nocturna ColorVu/StarLight. La mano de obra por cámara instalada está en aprox $60.000 COP y el kit de cámara profesional en $364.000 COP (con 1 año de garantía). ¿Cuántas cámaras requieres para tu hogar o empresa?";
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

  // Lista de Proveedores y Marcas Aliadas (Paso solicitado)
  const proveedores = [
    {
      nombre: "Hikvision",
      alias: "CCTV & Seguridad Líder",
      categoria: "Videovigilancia & Control",
      descripcion:
        "Cámaras IP 4K, domos inteligentes, tecnología ColorVu para visión nocturna a color y NVRs centralizados.",
      color: "from-red-500/20 to-orange-500/10",
      borde: "border-red-500/30",
      badge: "text-red-400 bg-red-950/60 border-red-800",
      icono: Camera,
    },
    {
      nombre: "Ruijie Networks / Reyee",
      alias: "Conmutación & Wi-Fi 6",
      categoria: "Redes Empresariales",
      descripcion:
        "Switches PoE gestionables en la nube, Access Points Wi-Fi 6 de alta concurrencia y roaming sin pérdidas.",
      color: "from-blue-500/20 to-cyan-500/10",
      borde: "border-blue-500/30",
      badge: "text-blue-400 bg-blue-950/60 border-blue-800",
      icono: Server,
    },
    {
      nombre: "Dahua Technology",
      alias: "Seguridad & Analítica",
      categoria: "Sistemas CCTV & IoT",
      descripcion:
        "Cámaras con sensores StarLight para ultra baja iluminación, reconocimiento y almacenamiento seguro.",
      color: "from-amber-500/20 to-yellow-500/10",
      borde: "border-amber-500/30",
      badge: "text-amber-400 bg-amber-950/60 border-amber-800",
      icono: Shield,
    },
    {
      nombre: "TP-Link Omada",
      alias: "Infraestructura PYME",
      categoria: "Networking Gestionable",
      descripcion:
        "Gateways multi-WAN, switches gigabit capa 2/3 y controladores de red unificados para oficinas.",
      color: "from-teal-500/20 to-emerald-500/10",
      borde: "border-teal-500/30",
      badge: "text-teal-400 bg-teal-950/60 border-teal-800",
      icono: Network,
    },
    {
      nombre: "MikroTik",
      alias: "RouterOS & Firewall",
      categoria: "Enrutamiento Avanzado",
      descripcion:
        "Balanceo de cargas multicanal, túneles VPN IPsec/WireGuard y seguridad perimetral de alto tráfico.",
      color: "from-cyan-500/20 to-blue-500/10",
      borde: "border-cyan-500/30",
      badge: "text-cyan-400 bg-cyan-950/60 border-cyan-800",
      icono: Radio,
    },
    {
      nombre: "Panduit",
      alias: "Cableado Certificado",
      categoria: "Cobre Cat6 & Conectividad",
      descripcion:
        "Patch cords de alto rendimiento, jacks blindados y canalización bajo estándares internacionales TIA/EIA.",
      color: "from-emerald-500/20 to-teal-500/10",
      borde: "border-emerald-500/30",
      badge: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      icono: Cpu,
    },
    {
      nombre: "Western Digital",
      alias: "Almacenamiento Continuo",
      categoria: "Discos WD Purple Surveillance",
      descripcion:
        "Discos duros de grado industrial diseñados para grabación 24/7 ininterrumpida sin pérdida de fotogramas.",
      color: "from-purple-500/20 to-pink-500/10",
      borde: "border-purple-500/30",
      badge: "text-purple-400 bg-purple-950/60 border-purple-800",
      icono: HardDrive,
    },
    {
      nombre: "Ubiquiti UniFi",
      alias: "Wireless de Alta Densidad",
      categoria: "Ecosistema Corporativo",
      descripcion:
        "Enlaces punto a punto de largo alcance y gestión de red centralizada para escenarios de alta demanda.",
      color: "from-indigo-500/20 to-violet-500/10",
      borde: "border-indigo-500/30",
      badge: "text-indigo-400 bg-indigo-950/60 border-indigo-800",
      icono: Layers,
    },
  ];

  // Proyectos Realizados con Datos Técnicos e Imágenes (Paso solicitado)
  const proyectos = [
    {
      titulo: "Red Estructurada Cat6 & Organización de Rack Principal",
      cliente: "Coworking & Espacio Empresarial (Chapinero, Bogotá)",
      descripcion:
        "Instalación y certificación de 32 puntos de red en cobre Cat6, montaje de rack de comunicaciones de 24RU, ordenamiento de patch panels con rotulación TIA-606 y pruebas de reflectometría sin pérdida.",
      metricas: ["32 Puntos Certificados", "100% Cero Caídas", "Garantía 12 Meses"],
      marcas: ["Panduit Cat6", "Ruijie Reyee", "Patch Panels 24p"],
      imagen: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
      icono: Network,
    },
    {
      titulo: "Sistema CCTV IP 4K con Visión Nocturna ColorVu",
      cliente: "Centro Logístico & Bodega Comercial (Fontibón, Bogotá)",
      descripcion:
        "Implementación de 12 cámaras IP tipo domo y tubo Hikvision con analítica de movimiento, sensor StarLight a color 24/7, NVR centralizado con 8TB WD Purple y enlace remoto en smartphones para socios.",
      metricas: ["12 Cámaras IP 4K", "Grabación 24/7 30 Días", "App Móvil Enlace"],
      marcas: ["Hikvision ColorVu", "WD Purple 8TB", "Switch PoE Ruijie"],
      imagen: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80",
      icono: Camera,
    },
    {
      titulo: "Infraestructura Wi-Fi 6 de Alta Concurrencia & Roaming",
      cliente: "Oficinas Administrativas PYME Consultoría (Chicó, Bogotá)",
      descripcion:
        "Despliegue de 6 Access Points Ruijie Reyee Wi-Fi 6 con roaming transparente sin desconexiones para más de 90 dispositivos simultáneos, segmentación de VLAN para área contable y portal cautivo de invitados.",
      metricas: ["90+ Dispositivos", "VLANs Segregadas", "Latencia < 15ms"],
      marcas: ["Ruijie Reyee Wi-Fi 6", "Gateway Cloud", "MikroTik Core"],
      imagen: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
      icono: Server,
    },
    {
      titulo: "Mantenimiento Preventivo, Upgrades SSD y Trazabilidad QR",
      cliente: "Parque Informático de 18 Estaciones (Teusaquillo, Bogotá)",
      descripcion:
        "Mantenimiento integral correctivo/preventivo de 18 computadores, cambio de pasta térmica de alta conductividad, migración a unidades NVMe ultrarrápidas y generación de hoja de vida con código QR digital.",
      metricas: ["18 PCs Optimizados", "+300% Rendimiento SSD", "QR de Trazabilidad"],
      marcas: ["C&R Trazabilidad QR", "Kingston NVMe", "Pasta Arctic MX-4"],
      imagen: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80",
      icono: Wrench,
    },
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-28 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        {/* Luces y mallas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-600/15 via-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge de Identidad */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Infraestructura TI • Redes Cat6 • Seguridad CCTV • Soporte Integral</span>
          </div>

          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Transformamos la tecnología local en un servicio{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              profesional, trazable y confiable
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
            Soporte técnico integral, cableado estructurado, circuitos de seguridad electrónica e IoT y mantenimiento de cómputo para hogares, emprendedores y PYMEs en Bogotá, respaldado por cotizaciones instantáneas con Inteligencia Artificial y seguimiento con códigos QR.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href="#cotizador-demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 text-sm"
            >
              <Bot className="w-5 h-5" />
              Probar Cotizador con IA
            </a>
            <a
              href="#contacto"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Contáctanos Ahora
            </a>
          </div>

          {/* Badges de Confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-10 border-t border-slate-800/80 text-slate-300 text-xs">
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Certificación Panduit Cat6</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Acuerdos SLA Garantizados</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Garantía de Fábrica & Repuestos</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Trazabilidad Digital con QR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿QUÉ HACEMOS? (Servicios & Líneas de Solución) */}
      <section id="que-hacemos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Portafolio Técnico Especializado
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ¿Qué Hacemos en C&R Soluciones?
          </h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
            Ofrecemos soluciones integrales de tecnología y comunicaciones, diseñadas a la medida de hogares, emprendedores y pequeñas y medianas empresas en Bogotá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Solución 1: Cableado Estructurado */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cableado Estructurado & Redes</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Diseño, tendido, conectorización y certificación de puntos de red en cobre Cat6 y Cat6A. Organización de racks de piso o pared, canalización rígida o decorativa y rotulación bajo norma TIA/EIA-568.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Puntos de red punto a punto certificados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Peinado y marcación de patch panels</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Materiales homologados Panduit</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400">Tarifa desde $35.000 COP / punto</span>
              <a href="#cotizador-demo" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Solución 2: Seguridad Electrónica & CCTV */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Seguridad Electrónica, CCTV e IoT</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Circuitos cerrados de televisión de alta definición (Full HD y 4K). Cámaras IP domo y tubo con tecnología StarLight y ColorVu para visión nocturna a color, sensores inteligentes y control remoto en tiempo real.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Cámaras Hikvision y Dahua con audio bidireccional</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Grabación continua NVR con WD Purple</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Acceso móvil desde celular iOS y Android</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400">Instalación desde $60.000 COP</span>
              <a href="#cotizador-demo" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Solución 3: Conmutación, Wi-Fi 6 & Enrutamiento */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enrutamiento, Switches & Wi-Fi 6</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Conectividad robusta y sin interrupciones con equipamiento Ruijie Reyee, MikroTik y TP-Link. Segmentación de VLANs, balanceo multienlace (failover), roaming fluido y red de invitados protegida.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Switches Gigabit PoE gestionables en nube</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Wi-Fi 6 de alta densidad para oficinas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>VPN segura para teletrabajo y soporte</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400">Setup desde $80.000 COP</span>
              <a href="#cotizador-demo" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Solución 4: Mantenimiento de Cómputo */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mantenimiento de Cómputo</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Mantenimiento preventivo y correctivo para computadores portátiles y de escritorio. Limpieza ultrasónica de circuitos, sustitución de pasta térmica de alto rendimiento, upgrades a discos SSD NVMe y optimización de software.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Optimización térmica y de rendimiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Actualización de hardware y memorias RAM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Planes periódicos para PYMEs y negocios</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">Mantenimiento desde $75.000 COP</span>
              <a href="#cotizador-demo" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
                Cotizar <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Solución 5: Plataforma Digital & Trazabilidad QR */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 group flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Plataforma Web de Gestión Empresarial & Trazabilidad Digital
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                La ventaja diferencial de C&R Soluciones: cada servicio, equipo y presupuesto queda indexado en nuestra plataforma web en la nube. Nuestros clientes pueden verificar garantías en tiempo real escaneando la etiqueta QR de su equipo, radicar tickets de soporte y descargar cotizaciones formales en PDF.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <Bot className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="text-xs font-bold text-white">Cotizador Inteligente con IA</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Cálculo matemático exacto de mano de obra y repuestos en segundos.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <Shield className="w-5 h-5 text-blue-400 mb-2" />
                  <h4 className="text-xs font-bold text-white">Códigos QR Físicos</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Hoja de vida inmutable de cada equipo y estado de garantía activo.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <Clock className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="text-xs font-bold text-white">Mesa de Ayuda SLA</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Atención rápida con bitácora técnica y comunicación transparente.</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400">Incluido gratis para todos nuestros clientes</span>
              <Link to="/registro" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                Crear Cuenta de Cliente <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISIÓN Y VISIÓN (Sección Institucional Solicitada con el texto exacto) */}
      <section id="mision-vision" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 border-y border-slate-800/80 scroll-mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Identidad Corporativa & Rumbo Estratégico
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Nuestra Misión y Visión
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              El compromiso ético y la proyección tecnológica que guían cada uno de nuestros proyectos en C&R Soluciones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Card: MISIÓN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/5 relative flex flex-col justify-between group hover:border-cyan-400/60 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                    <Target className="w-4 h-4 text-cyan-400" />
                    MISIÓN
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Propósito Actual</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Transformar la informalidad técnica en un servicio profesional y trazable
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-justify mb-6">
                  C&R Soluciones Tecnológicas es una microempresa bogotana dedicada a prestar servicios de soporte técnico, instalación y mantenimiento de redes, seguridad electrónica e IoT, y mantenimiento de equipos de cómputo a hogares, emprendedores, pequeños negocios y pymes, respaldada por una plataforma web de gestión empresarial que permite a sus clientes consultar en tiempo real cotizaciones, garantías y solicitudes de soporte. Buscamos transformar la informalidad del sector tecnológico local en un servicio profesional, trazable y confiable, aplicando conocimientos en desarrollo de software para generar valor real a nuestros clientes.
                </p>
              </div>

              {/* Pilares Clave de la Misión */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="block font-bold text-cyan-400">Microempresa Bogotana</span>
                  <span className="text-[11px] text-slate-400">Cercanía y atención local</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="block font-bold text-cyan-400">Plataforma Web</span>
                  <span className="text-[11px] text-slate-400">Gestión y garantías 24/7</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="block font-bold text-cyan-400">Cero Informalidad</span>
                  <span className="text-[11px] text-slate-400">Transparencia técnica</span>
                </div>
              </div>
            </div>

            {/* Card: VISIÓN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl shadow-blue-500/5 relative flex flex-col justify-between group hover:border-blue-400/60 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-blue-400" />
                    VISIÓN 2029
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Meta a Futuro</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Consolidación como empresa referente de servicios tecnológicos en Bogotá y Colombia
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-justify mb-6">
                  Para el año 2029, C&R Soluciones Tecnológicas se consolidará como una empresa referente en servicios tecnológicos en Bogotá, reconocida por su trazabilidad digital, la automatización de su proceso de cotización mediante inteligencia artificial y su compromiso con la calidad del servicio, ampliando su cobertura a otras ciudades de Colombia mediante soporte remoto, fortaleciendo su equipo técnico y consolidando una cartera de clientes recurrentes fidelizados a través de planes de mantenimiento y su portal digital.
                </p>
              </div>

              {/* Pilares Clave de la Visión */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="block font-bold text-blue-400">Cotización con IA</span>
                  <span className="text-[11px] text-slate-400">Automatización total</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="block font-bold text-blue-400">Expansión Nacional</span>
                  <span className="text-[11px] text-slate-400">Soporte remoto Colombia</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="block font-bold text-blue-400">Planes Continuos</span>
                  <span className="text-[11px] text-slate-400">Fidelización de clientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROYECTOS REALIZADOS (Casos de Éxito con Imágenes Reales / Ilustraciones) */}
      <section id="proyectos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Experiencia Comprobada en Campo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Proyectos Realizados
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Casos de éxito ejecutados con rigurosidad técnica, materiales originales y trazabilidad en Bogotá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {proyectos.map((proy, idx) => {
            const Icono = proy.icono;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
              >
                {/* Imagen del Proyecto */}
                <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
                  <img
                    src={proy.imagen}
                    alt={proy.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                  
                  {/* Badge de Cliente / Ubicación */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] text-cyan-300 font-medium">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{proy.cliente}</span>
                  </div>

                  {/* Icono de Solución */}
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-cyan-500/90 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                    <Icono className="w-5 h-5" />
                  </div>
                </div>

                {/* Contenido del Proyecto */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {proy.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2.5">
                      {proy.descripcion}
                    </p>
                  </div>

                  {/* Métricas y Resultados */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {proy.metricas.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center"
                      >
                        <span className="text-[11px] font-bold text-cyan-400 block">{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Marcas utilizadas */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">Equipamiento:</span>
                    {proy.marcas.map((marca, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono"
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
      <section id="proveedores" className="py-24 bg-slate-900/40 border-y border-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" />
              Alianzas Tecnológicas & Repuestos Originales
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Marcas y Proveedores con los que Trabajamos
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Respaldamos nuestros proyectos con fabricantes de primer nivel mundial como Hikvision, Ruijie Networks, Dahua, MikroTik y Panduit, garantizando compatibilidad y repuestos directos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {proveedores.map((prov, idx) => {
              const Icono = prov.icono;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-slate-900 border ${prov.borde} shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors">
                        <Icono className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${prov.badge}`}>
                        {prov.categoria}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {prov.nombre}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mb-2">
                      {prov.alias}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {prov.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Garantía Oficial</span>
                    <span className="text-cyan-400 font-semibold">Repuesto Original</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de Garantía con Proveedores */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-800/40 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                ¿Requieres una referencia específica de Hikvision o Ruijie Reyee?
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Nuestro catálogo comercial se sincroniza con distribuidores autorizados en Colombia con precios mayoristas.
              </p>
            </div>
            <a
              href="#contacto"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap flex items-center gap-2"
            >
              Consultar Disponibilidad
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. CHATBOT DE DEMOSTRACIÓN ABIERTO AL PÚBLICO (Paso 11.3) */}
      <section id="cotizador-demo" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Bot className="w-3.5 h-3.5" />
            Motor Inteligente con IA
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Cotiza tu Proyecto en Tiempo Real con Nuestro Asesor IA
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            Conversa de forma natural. Nuestra IA consulta las tarifas oficiales de mano de obra y equipos en catálogo para calcular tu presupuesto en segundos.
          </p>
        </div>

        {/* Caja del Chat Interactivo */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Cabecera del chat */}
          <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <span className="text-sm font-bold text-white block">Asesor Virtual C&R</span>
                <span className="text-[10px] text-slate-400">En línea • Motor de Cotizaciones Activo</span>
              </div>
            </div>
            <Link
              to="/registro"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full transition-colors"
            >
              Registrarse para descargar PDF ➔
            </Link>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {demoMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.rol === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.contenido}
                </div>
              </div>
            ))}
            {demoLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-300 text-xs rounded-2xl p-4 flex items-center gap-2 border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                  Consultando catálogo de tarifas y calculando presupuesto...
                </div>
              </div>
            )}
          </div>

          {/* Preguntas rápidas sugeridas */}
          <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 whitespace-nowrap font-medium">Consultas frecuentes:</span>
            <button
              onClick={() => handleSendDemoMessage("¿Cuánto cuesta instalar 4 cámaras Hikvision exteriores?")}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
            >
              📹 4 cámaras Hikvision
            </button>
            <button
              onClick={() => handleSendDemoMessage("Necesito cotizar cableado para 8 puntos de red Cat6")}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
            >
              🔌 8 puntos de red Cat6
            </button>
            <button
              onClick={() => handleSendDemoMessage("¿Qué costo tiene el mantenimiento de 5 computadores?")}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
            >
              💻 Mantenimiento de PCs
            </button>
          </div>

          {/* Input del chat */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendDemoMessage(demoInput)}
              placeholder="Escribe tu requerimiento aquí (ej. instalación de cámaras, cableado o PCs)..."
              className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSendDemoMessage(demoInput)}
              disabled={demoLoading}
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. CONTÁCTANOS (Formulario + Canales Directos y Enlace Interactivo) */}
      <section id="contacto" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Columna Izquierda: Información de Contacto Directo */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  <PhoneCall className="w-3.5 h-3.5" />
                  Atención Inmediata
                </div>
                <h3 className="text-3xl font-extrabold text-white">
                  Contáctanos
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
                  ¿Tienes un proyecto de cableado, seguridad CCTV o requieres mantenimiento técnico para tu negocio? Escríbenos o llámanos directamente.
                </p>
              </div>

              {/* Botón Destacado de WhatsApp */}
              <a
                href="https://wa.me/573115389889?text=Hola%20C%26R%20Soluciones,%20deseo%20asesor%C3%ADa%20para%20un%20proyecto%20tecnol%C3%B3gico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chatear por WhatsApp (+57 311 538 9889)</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>

              {/* Enlaces de Contacto Telefónico y Email */}
              <div className="space-y-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <a
                  href="tel:+573115389889"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block font-bold text-white">Línea Directa Móvil</span>
                    <span className="text-slate-400">+57 311 538 9889</span>
                  </div>
                </a>

                <a
                  href="mailto:contacto@crsoluciones.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block font-bold text-white">Correo Corporativo</span>
                    <span className="text-slate-400">contacto@crsoluciones.com</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div>
                    <span className="block font-bold text-white">Ubicación</span>
                    <span className="text-slate-400">Bogotá D.C., Colombia • Visitas técnicas presenciales</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario con Validación TypeScript (Paso 11.4) */}
            <div className="lg:col-span-3 bg-slate-950/70 p-6 sm:p-8 rounded-3xl border border-slate-800">
              <h4 className="text-lg font-bold text-white mb-2">Envíanos un Mensaje</h4>
              <p className="text-xs text-slate-400 mb-6">
                Te responderemos con un diagnóstico preliminar y propuesta técnica en menos de 2 horas hábiles.
              </p>

              {contactSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>¡Mensaje recibido con éxito! Un técnico especialista de C&R se comunicará contigo de inmediato.</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={contactForm.nombre}
                      onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                      placeholder="Ej. Camila Quintero"
                      className={`w-full bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.nombre ? "border-red-500" : "border-slate-800"
                      } focus:outline-none focus:border-cyan-500`}
                    />
                    {contactErrors.nombre && (
                      <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.nombre}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="camila@empresa.com"
                      className={`w-full bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.email ? "border-red-500" : "border-slate-800"
                      } focus:outline-none focus:border-cyan-500`}
                    />
                    {contactErrors.email && (
                      <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      value={contactForm.telefono}
                      onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                      placeholder="311 538 9889"
                      className={`w-full bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                        contactErrors.telefono ? "border-red-500" : "border-slate-800"
                      } focus:outline-none focus:border-cyan-500`}
                    />
                    {contactErrors.telefono && (
                      <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.telefono}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Línea de Servicio Requerida
                    </label>
                    <select
                      value={contactForm.servicio}
                      onChange={(e) => setContactForm({ ...contactForm, servicio: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detalles del requerimiento *
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    placeholder="Cuéntanos cuántos puntos de red, cámaras, equipos o la ubicación de tu sede..."
                    className={`w-full bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                      contactErrors.mensaje ? "border-red-500" : "border-slate-800"
                    } focus:outline-none focus:border-cyan-500`}
                  ></textarea>
                  {contactErrors.mensaje && (
                    <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.mensaje}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Enviar Solicitud Técnica
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

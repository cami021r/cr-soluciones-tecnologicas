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
        "¡Hola! 👋 Soy el asesor virtual de C&R Soluciones. Puedes hacerme preguntas sobre nuestros servicios de redes, cableado, cámaras de seguridad o pedirme una cotización rápida de prueba.",
    },
  ]);
  const [demoInput, setDemoInput] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  // Estado para el Formulario de Contacto (Paso 11.4)
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "Cableado Cat6",
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
      // Intentar consultar al endpoint de conocimiento o simular respuesta rápida
      const res = await api.get("/catalogo/chatbot/conocimiento");
      const servicios = res.data?.servicios || [];
      const lower = promptTexto.toLowerCase();

      let respuesta = "";
      if (lower.includes("cámara") || lower.includes("camara") || lower.includes("cctv")) {
        respuesta =
          "En C&R instalamos cámaras Dahua y Hikvision 4MP con visión nocturna StarLight. La mano de obra por cámara está en aprox $60.000 COP y la cámara StarLight en $364.000 COP (con garantía de 1 año). ¿Cuántas cámaras requieres para tu local o bodega?";
      } else if (lower.includes("cable") || lower.includes("red") || lower.includes("punto")) {
        respuesta =
          "Realizamos cableado estructurado Cat6 certificado con cable Panduit de alto rendimiento. La instalación punto a punto tiene una tarifa base de $35.000 COP mano de obra por punto. ¿En cuántos pisos se distribuirán los puntos?";
      } else {
        const servicioEjemplo = servicios[0]?.nombre || "Instalación de redes y soporte";
        respuesta = `Con gusto te asesoramos en ${servicioEjemplo} y soluciones integrales de infraestructura. Para generar tu presupuesto oficial en PDF y acceder a precios exclusivos, te invitamos a registrarte en nuestro portal de clientes.`;
      }

      setDemoMessages((prev) => [...prev, { rol: "assistant", contenido: respuesta }]);
    } catch (e) {
      // Fallback amigable
      setDemoMessages((prev) => [
        ...prev,
        {
          rol: "assistant",
          contenido:
            "En C&R Soluciones ofrecemos instalación de cableado estructurado Cat6, cámaras de seguridad IP y configuración de routers empresariales. Crea tu cuenta gratuita para recibir cotizaciones automáticas con PDF y seguimiento en tiempo real.",
        },
      ]);
    } finally {
      setDemoLoading(false);
    }
  };

  // Validación en TypeScript del Formulario de Contacto (Paso 11.4)
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
      errors.mensaje = "El mensaje debe detallar tu requerimiento (mínimo 10 caracteres).";
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
        servicio: "Cableado Cat6",
        mensaje: "",
      });
      setTimeout(() => setContactSuccess(false), 6000);
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* 1. HERO SECTION (Paso 11.2) */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-900 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Infraestructura TI, Redes & Seguridad Electrónica
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Conectividad que impulsa el crecimiento de tu{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              negocio
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Diseñamos e implementamos redes de alta velocidad, cableado estructurado Cat6, sistemas CCTV de última generación y soporte técnico con presupuestos inteligentes en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cotizador-demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Bot className="w-5 h-5" />
              Probar Cotizador IA
            </a>
            <Link
              to="/registro"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              Crear Cuenta de Cliente
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Badges de Confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 pt-10 border-t border-slate-900 text-slate-400 text-xs">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certificación Panduit Cat6</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Atención SLA Garantizada</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Garantía 1 Año en Equipos</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Trazabilidad con Códigos QR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PORTAFOLIO DE SERVICIOS (Paso 11.2) */}
      <section id="servicios" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            Nuestras Especialidades
          </h2>
          <h3 className="text-3xl font-bold tracking-tight text-white">
            Soluciones robustas para empresas modernas
          </h3>
          <p className="text-slate-400 mt-4 text-sm">
            Estandarización técnica bajo normas internacionales TIA/EIA e interoperabilidad con marcas líderes en el mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjeta 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all hover:shadow-xl hover:shadow-cyan-500/5 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Cableado Estructurado</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instalación punto a punto en cobre Cat6 y Cat6A con canalización, patch panels, racks ordenados y certificación.
            </p>
            <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
              Tarifa base desde $35.000 COP / punto
            </span>
          </div>

          {/* Tarjeta 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Videovigilancia CCTV</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Cámaras IP 4MP con sensor StarLight para visión a color nocturna, switches PoE y almacenamiento NVR centralizado.
            </p>
            <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              Instalación y setup desde $60.000 COP
            </span>
          </div>

          {/* Tarjeta 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Enrutamiento & WiFi</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Configuración de routers MikroTik, seguridad perimetral, balanceo de cargas y roaming WiFi empresarial sin interrupciones.
            </p>
            <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
              Setup profesional desde $80.000 COP
            </span>
          </div>

          {/* Tarjeta 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Soporte y Mesa de Ayuda</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mantenimiento preventivo de computadores, diagnóstico de hardware, trazabilidad con QR y atención de tickets con SLA.
            </p>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              Atención prioritaria y preventiva
            </span>
          </div>
        </div>
      </section>

      {/* 3. CHATBOT DE DEMOSTRACIÓN ABIERTO AL PÚBLICO (Paso 11.3) */}
      <section id="cotizador-demo" className="py-20 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-3">
              <Bot className="w-3.5 h-3.5" />
              Demostración Interactiva con IA
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white">
              Cotiza tu proyecto al instante con nuestro Asesor IA
            </h3>
            <p className="text-slate-400 text-xs mt-2 max-w-xl mx-auto">
              Conversa de forma natural. Nuestra IA consulta las tarifas del catálogo y calcula los presupuestos de inmediato.
            </p>
          </div>

          {/* Caja del Chat */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Cabecera del chat */}
            <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Asesor Virtual C&R</span>
                <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  Modo Demostración
                </span>
              </div>
              <Link
                to="/registro"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Registrarse para guardar PDF ➔
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
                    className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.rol === "user"
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                    }`}
                  >
                    {m.contenido}
                  </div>
                </div>
              ))}
              {demoLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 text-xs rounded-2xl p-4 flex items-center gap-2 border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                    Consultando catálogo y tarifas oficiales...
                  </div>
                </div>
              )}
            </div>

            {/* Preguntas rápidas sugeridas */}
            <div className="px-6 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 whitespace-nowrap">Ejemplos:</span>
              <button
                onClick={() => handleSendDemoMessage("¿Cuánto cuesta instalar 4 cámaras IP exteriores?")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                📹 4 cámaras exteriores
              </button>
              <button
                onClick={() => handleSendDemoMessage("Necesito cotizar cableado para 8 puntos de red")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                🔌 8 puntos de red Cat6
              </button>
            </div>

            {/* Input del chat */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendDemoMessage(demoInput)}
                placeholder="Escribe tu mensaje o consulta de cotización aquí..."
                className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSendDemoMessage(demoInput)}
                disabled={demoLoading}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FORMULARIO DE CONTACTO CON VALIDACIÓN TYPESCRIPT (Paso 11.4) */}
      <section id="contacto" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              ¿Requieres un proyecto a medida?
            </h3>
            <h4 className="text-2xl sm:text-3xl font-bold text-white">Contáctanos hoy mismo</h4>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">
              Un asesor de C&R analizará tu solicitud y te contactará en menos de 2 horas.
            </p>
          </div>

          {contactSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>¡Mensaje recibido con éxito! Un técnico especialista de C&R te contactará pronto.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={contactForm.nombre}
                  onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                  placeholder="Ej. Roberto Martínez"
                  className={`w-full bg-slate-950 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                    contactErrors.nombre ? "border-red-500" : "border-slate-800"
                  } focus:outline-none focus:border-cyan-500`}
                />
                {contactErrors.nombre && (
                  <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.nombre}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="roberto@miempresa.com"
                  className={`w-full bg-slate-950 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                    contactErrors.email ? "border-red-500" : "border-slate-800"
                  } focus:outline-none focus:border-cyan-500`}
                />
                {contactErrors.email && (
                  <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.email}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  value={contactForm.telefono}
                  onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                  placeholder="300 123 4567"
                  className={`w-full bg-slate-950 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                    contactErrors.telefono ? "border-red-500" : "border-slate-800"
                  } focus:outline-none focus:border-cyan-500`}
                />
                {contactErrors.telefono && (
                  <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.telefono}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Servicio de interés
                </label>
                <select
                  value={contactForm.servicio}
                  onChange={(e) => setContactForm({ ...contactForm, servicio: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cableado Cat6">Instalación cableado Cat6</option>
                  <option value="CCTV">Instalación cámaras IP / CCTV</option>
                  <option value="WiFi">Configuración router y red WiFi</option>
                  <option value="Mantenimiento">Mantenimiento preventivo PC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Mensaje o descripción de la necesidad *
              </label>
              <textarea
                rows={4}
                value={contactForm.mensaje}
                onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                placeholder="Describe cuántos equipos, ubicación aproximada o detalles específicos..."
                className={`w-full bg-slate-950 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                  contactErrors.mensaje ? "border-red-500" : "border-slate-800"
                } focus:outline-none focus:border-cyan-500`}
              ></textarea>
              {contactErrors.mensaje && (
                <span className="text-[11px] text-red-400 mt-1 block">{contactErrors.mensaje}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Enviar Solicitud Técnica
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

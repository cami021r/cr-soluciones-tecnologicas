import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "Cableado Cat6 y Redes",
    mensaje: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const err: { [key: string]: string } = {};
    if (!formData.nombre.trim() || formData.nombre.length < 3) {
      err.nombre = "Por favor ingresa tu nombre completo (mínimo 3 caracteres).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      err.email = "Ingresa un correo electrónico válido.";
    }
    const phoneRegex = /^[0-9+ ]{7,15}$/;
    if (!formData.telefono.trim() || !phoneRegex.test(formData.telefono)) {
      err.telefono = "Ingresa un número telefónico de contacto válido.";
    }
    if (!formData.mensaje.trim() || formData.mensaje.length < 10) {
      err.mensaje = "Cuéntanos detalles de tu necesidad (mínimo 10 caracteres).";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        servicio: "Cableado Cat6 y Redes",
        mensaje: "",
      });
      setTimeout(() => setSubmitted(false), 8000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs">
          Atención al Cliente & Visitas Técnicas
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contacto & Ubicación
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Agenda una visita técnica presencial en tu empresa en Bogotá o comunícate directamente con nuestros especialistas vía WhatsApp o correo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Tarjetas de Información de Contacto */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-glass p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Canales de Atención Directa
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <a
                href="https://wa.me/573115389889"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all text-emerald-950 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block font-bold text-emerald-900">WhatsApp Inmediato</strong>
                  <span className="text-emerald-800 text-xs">+57 311 538 9889</span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">Respuesta promedio: &lt; 15 minutos</span>
                </div>
              </a>

              <a
                href="mailto:contacto@crsoluciones.com"
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 transition-all text-blue-950 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block font-bold text-blue-900">Correo Electrónico</strong>
                  <span className="text-blue-800 text-xs">contacto@crsoluciones.com</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5 font-medium">Envío de planos, pliegos y solicitudes formales</span>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block font-bold text-slate-900">Cobertura Geográfica</strong>
                  <span className="text-slate-600 text-xs">Bogotá D.C. y Municipios Aledaños</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Visitas de levantamiento en sitio</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block font-bold text-slate-900">Horario de Operación</strong>
                  <span className="text-slate-600 text-xs">Lunes a Sábado: 8:00 AM – 6:00 PM</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Ventanas de mantenimiento nocturno concertadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Rápida Cotizador */}
          <div className="card-glass p-6 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-200" />
              ¿Prefieres un presupuesto automático?
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Prueba nuestro asistente con Inteligencia Artificial. Calcula el número de cámaras, puntos de red o mantenimiento y descarga el PDF formal.
            </p>
            <Link
              to="/cotizador"
              className="inline-block px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-sm transition-all"
            >
              Abrir Cotizador IA
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Formulario Interactivo */}
        <div className="lg:col-span-7">
          <div className="card-glass p-8 sm:p-12 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Envíanos tu Solicitud Técnica
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Diligencia el formulario y un técnico especialista se comunicará contigo el mismo día hábil.
              </p>
            </div>

            {submitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>¡Solicitud enviada con éxito!</strong> Hemos recibido tu mensaje y nos pondremos en contacto muy pronto.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Camila Quintero"
                    className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                      errors.nombre ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:border-blue-500`}
                  />
                  {errors.nombre && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.nombre}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="camila@empresa.com"
                    className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                      errors.email ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:border-blue-500`}
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="311 538 9889"
                    className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                      errors.telefono ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:border-blue-500`}
                  />
                  {errors.telefono && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.telefono}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Servicio Requerido
                  </label>
                  <select
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                    className="w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Cableado Cat6 y Redes">Cableado Estructurado Cat6 y Racks</option>
                    <option value="CCTV y Cámaras Hikvision">Videovigilancia CCTV y Cámaras IP</option>
                    <option value="Wi-Fi 6 y Conmutación Ruijie">Redes Wi-Fi 6 y Switches Ruijie</option>
                    <option value="Mantenimiento PCs">Mantenimiento y Soporte TI</option>
                    <option value="Trazabilidad y QR">Trazabilidad con Códigos QR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del requerimiento *
                </label>
                <textarea
                  rows={4}
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Detalla cantidad aproximada de puntos, cámaras, metros o ubicación de la sede en Bogotá..."
                  className={`w-full bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                    errors.mensaje ? "border-red-400" : "border-slate-200"
                  } focus:outline-none focus:border-blue-500`}
                ></textarea>
                {errors.mensaje && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.mensaje}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn-primary-gradient py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud Técnica</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

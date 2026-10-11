import React from "react";
import { Mail, Phone, MapPin, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-sm relative overflow-hidden">
      {/* Luz ambiental sutil en azul suave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-200/40 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 y 2: Identidad & Propósito */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm pt-2">
              Microempresa bogotana dedicada a la modernización de infraestructura TI, cableado estructurado, circuitos de seguridad CCTV, IoT y soporte técnico profesional para hogares, emprendedores y PYMEs.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-[11px] text-sky-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Plataforma con Trazabilidad Digital & Códigos QR</span>
            </div>
            <div className="text-[11px] text-slate-500 border-l-2 border-sky-500 pl-3 pt-1">
              Proyecto de Grado para el Comité Evaluador del SENA (ADSO / Infraestructura).
            </div>
          </div>

          {/* Col 3: Navegación Rápida */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#que-hacemos" className="hover:text-sky-600 transition-colors">
                  ¿Qué Hacemos?
                </a>
              </li>
              <li>
                <a href="#mision-vision" className="hover:text-sky-600 transition-colors">
                  Misión & Visión
                </a>
              </li>
              <li>
                <a href="#proyectos" className="hover:text-sky-600 transition-colors">
                  Proyectos Realizados
                </a>
              </li>
              <li>
                <a href="#proveedores" className="hover:text-sky-600 transition-colors">
                  Marcas & Proveedores
                </a>
              </li>
              <li>
                <a href="#cotizador-demo" className="text-sky-600 font-semibold hover:underline">
                  Cotizador con IA
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Líneas Técnicas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Soluciones Especializadas
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Cableado Estructurado Cat6 / Cat6A</li>
              <li>Videovigilancia CCTV IP 4K</li>
              <li>Redes Wi-Fi 6 & Conmutación Ruijie</li>
              <li>Seguridad Electrónica & Sensores IoT</li>
              <li>Mantenimiento Preventivo / Correctivo</li>
              <li>Garantías Digitales con Escaneo QR</li>
            </ul>
          </div>

          {/* Col 5: Canales de Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contáctanos Directamente
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://wa.me/573115389889?text=Hola%20C%26R%20Soluciones,%20estoy%20interesado%20en%20sus%20servicios%20tecnol%C3%B3gicos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-semibold"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp: +57 311 538 9889</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="tel:+573115389889"
                  className="flex items-center gap-2 hover:text-sky-600 transition-colors"
                >
                  <Phone className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>Línea Móvil: +57 311 538 9889</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@crsoluciones.com"
                  className="flex items-center gap-2 hover:text-sky-600 transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>contacto@crsoluciones.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1 text-slate-500">
                <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>Bogotá D.C., Colombia • Cobertura Metropolitana y Soporte Remoto Nacional</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior de Derechos */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} C&R Soluciones Tecnológicas S.A.S. (CYRS). Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <a href="#contacto" className="hover:text-sky-600 transition-colors">
              Solicitar Cotización
            </a>
            <span>•</span>
            <a href="/login" className="hover:text-sky-600 transition-colors">
              Portal Clientes
            </a>
            <span>•</span>
            <a href="/registro" className="hover:text-sky-600 transition-colors font-medium">
              Registro Gratuito
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { Logo } from "./Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-blue-100/70 text-slate-600 text-sm relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 y 2: Identidad & Propósito */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm pt-2">
              Infraestructura TI profesional, cableado estructurado certificado, videovigilancia CCTV, redes Wi-Fi (2.4 GHz, 5 GHz y 6 GHz), conmutación y soporte técnico para hogares, empresas y PYMEs en Bogotá.
            </p>
            <div className="text-[11px] text-slate-500 border-l-2 border-blue-500 pl-3 pt-1">
              Proyecto SENA — Ficha 2834855 (ADSO) | Camila Andrea Quintero Roa
            </div>
          </div>

          {/* Col 3: Navegación Rápida */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-blue-600 transition-colors">
                  Servicios Especializados
                </Link>
              </li>
              <li>
                <Link to="/mision-vision" className="hover:text-blue-600 transition-colors">
                  Misión & Visión
                </Link>
              </li>
              <li>
                <Link to="/proyectos" className="hover:text-blue-600 transition-colors">
                  Proyectos Realizados
                </Link>
              </li>
              <li>
                <Link to="/proveedores" className="hover:text-blue-600 transition-colors">
                  Marcas & Proveedores
                </Link>
              </li>
              <li>
                <Link to="/cotizador" className="text-blue-600 font-bold hover:underline">
                  Cotizador Inteligente con IA
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-blue-600 transition-colors">
                  Contacto & Ubicación
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Especialidades Técnicas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Soluciones
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Cableado Estructurado & Racks</li>
              <li>CCTV Hikvision / Dahua ColorVu</li>
              <li>Redes Wi-Fi (2.4 / 5 / 6 GHz) & Switching</li>
              <li>Mantenimiento Hardware y Servidores</li>
              <li>Generación Formal de Cotizaciones PDF</li>
            </ul>
          </div>

          {/* Col 5: Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contacto Bogotá
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="https://wa.me/573115389889"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>+57 311 538 9889 (WhatsApp)</span>
              </a>

              <a
                href="mailto:contacto@crsoluciones.com"
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-500" />
                <span>contacto@crsoluciones.com</span>
              </a>

              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span>Bogotá D.C., Colombia</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/contacto"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all"
              >
                <span>Agendar Asesoría</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} C&R Soluciones Tecnológicas. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>SENA Ficha 2834855</span>
            <span>•</span>
            <span>Bogotá, Colombia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

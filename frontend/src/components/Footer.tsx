import React from "react";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Info C&R */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                C&R Soluciones Tecnológicas
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Especialistas en redes empresariales, cableado estructurado Cat6, videovigilancia CCTV y soporte técnico con diagnóstico inteligente.
            </p>
            <div className="text-xs text-slate-500 border-l-2 border-cyan-500/50 pl-3">
              Proyecto de Grado para el Comité Evaluador del SENA (ADSO / Telecomunicaciones).
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Contacto
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>+57 (601) 345-6789 / 300 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>soporte@crsoluciones.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bogotá D.C., Colombia</span>
              </li>
            </ul>
          </div>

          {/* Servicios Clave */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Líneas de Soporte
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Cableado Estructurado Cat6</li>
              <li>Instalación CCTV y Cámaras IP</li>
              <li>Configuración Routers y WiFi</li>
              <li>Mantenimiento de Servidores y PCs</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} C&R Soluciones Tecnológicas. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Desarrollado con React, TypeScript, FastAPI y Gemini AI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

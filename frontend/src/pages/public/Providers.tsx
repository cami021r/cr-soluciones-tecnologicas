import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Network,
  Radio,
  Server,
  ShieldCheck,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Providers: React.FC = () => {
  const marcas = [
    {
      nombre: "Hikvision",
      categoria: "Videovigilancia & CCTV",
      descripcion:
        "Líder global en seguridad electrónica. Implementamos domos inteligentes, NVRs y tecnología ColorVu que ofrece video a color nítido incluso en oscuridad total.",
      lineas: ["Cámaras IP 4MP/4K", "Tecnología ColorVu", "NVRs H.265+", "Detección AcuSense"],
      icono: Camera,
      color: "from-red-500 to-rose-600",
      badge: "bg-red-50 text-red-700 border-red-200",
      garantia: "24 meses de fábrica",
    },
    {
      nombre: "Panduit",
      categoria: "Cableado Estructurado & Racks",
      descripcion:
        "Referente mundial en conectividad de red para centros de datos y oficinas. Usamos sus patch panels, jacks RJ45 Mini-Com y cable 100% cobre certificado en todas las categorías.",
      lineas: ["Cable UTP Cat5e / Cat6 / Cat6A", "Patch Panels 24/48 Puertos", "Organizadores Horizontales", "Jacks RJ45 TG"],
      icono: Network,
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      garantia: "Certificación hasta 20 años",
    },
    {
      nombre: "Ruijie Networks / Reyee",
      categoria: "Redes Wi-Fi (2.4 / 5 / 6 GHz) & Switching",
      descripcion:
        "Equipos de red multi-banda de alto desempeño con administración 100% en la nube gratuita de por vida. Ideales para eliminar cuellos de botella y gestionar múltiples sedes.",
      lineas: ["Access Points 2.4 / 5 / 6 GHz", "Switches PoE+ Administrables", "Routers Balanceadores Multi-WAN", "Ruijie Cloud"],
      icono: Radio,
      color: "from-blue-500 to-indigo-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      garantia: "36 meses de fábrica",
    },
    {
      nombre: "Dahua Technology",
      categoria: "Seguridad & Control de Acceso",
      descripcion:
        "Soluciones robustas en cámaras de circuito cerrado, videoporteros IP y biometría para condominios, locales comerciales y plantas industriales.",
      lineas: ["Cámaras HDCVI / IP", "Control de Acceso Biométrico", "Video Porteros IP", "Tecnología Full-Color"],
      icono: Camera,
      color: "from-orange-500 to-amber-600",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      garantia: "24 meses de fábrica",
    },
    {
      nombre: "MikroTik",
      categoria: "Enrutamiento & Firewalls",
      descripcion:
        "Dispositivos RouterBOARD de grado carrier con RouterOS para filtrado de contenido, balanceo de múltiples proveedores de internet y túneles VPN seguros.",
      lineas: ["Routers Gigabit Multi-Core", "Firewalling & QoS", "Túneles VPN WireGuard / IPsec", "Switches de Fibra SFP+"],
      icono: Server,
      color: "from-violet-500 to-purple-600",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      garantia: "12 meses de fábrica",
    },
    {
      nombre: "APC by Schneider Electric",
      categoria: "Protección Eléctrica & UPS",
      descripcion:
        "Respaldo ininterrumpido de energía y acondicionamiento eléctrico para proteger servidores, NVRs y switches ante cortes de luz y sobretensiones en Bogotá.",
      lineas: ["UPS Smart-UPS Online", "Reguladores de Voltaje", "Tomas Reguladas para Rack", "Baterías de Respaldo"],
      icono: Zap,
      color: "from-green-500 to-emerald-600",
      badge: "bg-green-50 text-green-700 border-green-200",
      garantia: "24 meses de fábrica",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs">
          Alianzas Estratégicas & Hardware Oficial
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Marcas y Proveedores
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Trabajamos exclusivamente con fabricantes certificados a nivel mundial. Cada componente instalado en tu empresa cuenta con garantía formal y respaldo de ingeniería.
        </p>
      </div>

      {/* Grid de Marcas (Tarjetas 20px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {marcas.map((m) => {
          const Icon = m.icono;
          return (
            <div
              key={m.nombre}
              className="card-glass p-8 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${m.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${m.badge}`}>
                    {m.categoria}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {m.nombre}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                    {m.descripcion}
                  </p>
                </div>

                {/* Líneas de productos */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Equipos destacados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.lineas.map((linea, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {linea}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  🛡️ {m.garantia}
                </span>
                <Link
                  to="/cotizador"
                  className="font-bold text-blue-600 hover:text-violet-600 inline-flex items-center gap-1"
                >
                  <span>Cotizar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compromiso Anti-Imitaciones */}
      <div className="card-glass p-8 sm:p-10 border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-violet-50/50 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Cero cables de aleación aluminio-cobre (CCA)
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Rechazamos los materiales defectuosos que provocan incendios o caídas de red. En C&R Soluciones instalamos únicamente cable <strong>100% cobre puro (BC)</strong> con certificación de laboratorio verificable.
          </p>
        </div>

        <Link
          to="/cotizador"
          className="btn-primary-gradient px-6 py-3 text-xs font-bold shrink-0"
        >
          Probar Cotizador IA
        </Link>
      </div>
    </div>
  );
};

export default Providers;

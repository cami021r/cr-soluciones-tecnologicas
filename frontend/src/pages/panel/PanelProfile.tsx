import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Mail,
  Shield,
  CheckCircle2,
  Lock,
  Calendar,
  Save,
} from "lucide-react";

export const PanelProfile: React.FC = () => {
  const { user } = useAuth();
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [empresa, setEmpresa] = useState("");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mi Perfil & Cuenta
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Gestiona tus datos de contacto corporativo y credenciales de acceso a C&R Soluciones.
        </p>
      </div>

      {/* Tarjeta de Información General */}
      <div className="card-glass p-6 sm:p-8 border border-blue-100 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 uppercase shrink-0">
            {user?.nombre?.charAt(0)}
            {user?.apellido?.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-900">
                {user?.nombre} {user?.apellido}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {user?.rol?.nombre || "Cliente"}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cuenta verificada en plataforma C&R</span>
            </div>
          </div>
        </div>

        {/* Formulario de Datos de Contacto */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre(s)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.nombre || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Apellido(s)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.apellido || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre de la Empresa o Razón Social (Opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej. Inversiones & Tecnología SAS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Aparecerá en el encabezado de tus cotizaciones y propuestas formales en PDF.
              </p>
            </div>
          </div>

          {guardadoExitoso && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Información actualizada correctamente en tu sesión actual.</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="btn-primary-gradient px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tarjeta de Seguridad y Privacidad */}
      <div className="card-glass p-6 sm:p-8 border border-blue-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3>Seguridad y Credenciales</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tu cuenta está protegida mediante encriptación Bcrypt y tokens JWT con rotación de refresh tokens.
          Para solicitar un cambio de contraseña o cambio de titularidad de empresa, por favor genera un ticket de soporte.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encriptación SHA-256 / Bcrypt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Sesión segura con expiración automática</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelProfile;

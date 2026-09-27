import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, LogIn, Lock, Mail, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Redirigir según el rol guardado en localStorage o esperar estado
      const savedUser = localStorage.getItem("cr_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const roleName = parsedUser?.rol?.nombre || user?.rol?.nombre;

      if (roleName === "Administrador" || roleName === "Técnico") {
        navigate("/admin");
      } else {
        navigate("/portal");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Credenciales incorrectas. Verifica tu correo y contraseña.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Ingresar a tu cuenta
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Accede al portal de clientes o panel administrativo de C&R
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-950 text-white text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-white text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Credenciales de demostración SENA */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Credenciales de prueba (Seeders):
            </span>
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p>👤 <strong>Cliente:</strong> cliente1@ejemplo.com / Test1234!</p>
              <p>🔧 <strong>Técnico:</strong> tecnico@crsoluciones.com / Test1234!</p>
              <p>🛡️ <strong>Admin:</strong> admin@crsoluciones.com / Test1234!</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

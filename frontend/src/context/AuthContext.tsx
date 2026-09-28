import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (datos: { nombre: string; apellido: string; email: string; password: string; telefono?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isTecnico: boolean;
  isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("cr_access_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      const storedToken = localStorage.getItem("cr_access_token");
      if (storedToken) {
        try {
          const res = await api.get("/ejemplo/mi-perfil");
          // Reconstruir objeto de usuario desde mi-perfil
          const usuarioData: User = {
            id: res.data.id,
            nombre: res.data.nombre || res.data.nombre_completo?.split(" ")[0] || "Usuario",
            apellido: res.data.apellido || res.data.nombre_completo?.split(" ")[1] || "",
            email: res.data.email,
            telefono: res.data.telefono,
            activo: res.data.activo ?? true,
            rol: {
              id: res.data.rol === "Administrador" ? 1 : res.data.rol === "Técnico" ? 2 : 3,
              nombre: res.data.rol as UserRole,
            },
          };
          setUser(usuarioData);
          localStorage.setItem("cr_user", JSON.stringify(usuarioData));
        } catch {
          localStorage.removeItem("cr_access_token");
          localStorage.removeItem("cr_user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    cargarPerfil();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post("/usuarios/login", { email, password });
    const access_token = res.data.access_token;
    localStorage.setItem("cr_access_token", access_token);
    setToken(access_token);

    const perfilRes = await api.get("/ejemplo/mi-perfil");
    const usuarioData: User = {
      id: perfilRes.data.id,
      nombre: perfilRes.data.nombre || perfilRes.data.nombre_completo?.split(" ")[0] || "Usuario",
      apellido: perfilRes.data.apellido || perfilRes.data.nombre_completo?.split(" ")[1] || "",
      email: perfilRes.data.email,
      telefono: perfilRes.data.telefono,
      activo: perfilRes.data.activo ?? true,
      rol: {
        id: perfilRes.data.rol === "Administrador" ? 1 : perfilRes.data.rol === "Técnico" ? 2 : 3,
        nombre: perfilRes.data.rol as UserRole,
      },
    };
    setUser(usuarioData);
    localStorage.setItem("cr_user", JSON.stringify(usuarioData));
    return usuarioData;
  };

  const register = async (datos: { nombre: string; apellido: string; email: string; password: string; telefono?: string }) => {
    await api.post("/usuarios/registro", datos);
  };

  const logout = async () => {
    try {
      await api.post("/usuarios/logout");
    } catch {
      // Ignorar errores en logout
    } finally {
      localStorage.removeItem("cr_access_token");
      localStorage.removeItem("cr_user");
      setToken(null);
      setUser(null);
    }
  };

  const role = user?.rol?.nombre;
  const isAdmin = role === "Administrador";
  const isTecnico = role === "Técnico" || isAdmin;
  const isCliente = role === "Cliente";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isTecnico,
        isCliente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

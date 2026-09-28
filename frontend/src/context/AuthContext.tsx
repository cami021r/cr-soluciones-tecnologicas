import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import type { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (datos: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTecnico: boolean;
  isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("cr_token");
    const savedUser = localStorage.getItem("cr_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("cr_token");
        localStorage.removeItem("cr_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/usuarios/login", {
      email,
      password,
    });

    const { access_token, usuario } = res.data;
    setToken(access_token);
    setUser(usuario);
    localStorage.setItem("cr_token", access_token);
    localStorage.setItem("cr_user", JSON.stringify(usuario));
  };

  const register = async (datos: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }) => {
    await api.post("/usuarios/registro", datos);
    // Login automático tras registro
    await login(datos.email, datos.password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("cr_token");
    localStorage.removeItem("cr_user");
  };

  const roleName = user?.rol?.nombre;
  const isAdmin = roleName === "Administrador";
  const isTecnico = roleName === "Técnico";
  const isCliente = roleName === "Cliente";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
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
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

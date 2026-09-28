import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  rolesPermitidos?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolesPermitidos }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(user.rol.nombre)) {
    // Si no tiene el rol, redirigir a su portal correspondiente
    if (user.rol.nombre === "Cliente") {
      return <Navigate to="/cliente/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

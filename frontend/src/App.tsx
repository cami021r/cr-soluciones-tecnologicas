import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Client Portal Pages
import PortalLayout from "./pages/portal/PortalLayout";
import ClientDashboard from "./pages/portal/ClientDashboard";
import ClientChatbot from "./pages/portal/ClientChatbot";
import ClientQuotes from "./pages/portal/ClientQuotes";
import ClientEquipment from "./pages/portal/ClientEquipment";
import ClientTickets from "./pages/portal/ClientTickets";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCatalog from "./pages/admin/AdminCatalog";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminFinances from "./pages/admin/AdminFinances";

// Layout para el sitio público con Navbar y Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-950">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Zona 1: Sitio Público */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Zona 2: Portal Cliente (Protegido por Rol Cliente) */}
          <Route element={<ProtectedRoute allowedRoles={["Cliente", "Administrador", "Técnico"]} />}>
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="cotizador" element={<ClientChatbot />} />
              <Route path="cotizaciones" element={<ClientQuotes />} />
              <Route path="equipos" element={<ClientEquipment />} />
              <Route path="tickets" element={<ClientTickets />} />
            </Route>
          </Route>

          {/* Zona 3: Panel de Administración & Técnico (Protegido por Rol Administrador o Técnico) */}
          <Route element={<ProtectedRoute allowedRoles={["Administrador", "Técnico"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventario" element={<AdminInventory />} />
              <Route path="catalogo" element={<AdminCatalog />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="finanzas" element={<AdminFinances />} />
              <Route path="cotizaciones" element={<ClientQuotes />} />
            </Route>
          </Route>

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import PanelLayout from "./layouts/PanelLayout";
import AdminLayout from "./pages/admin/AdminLayout";

// Public Pages
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import MissionVision from "./pages/public/MissionVision";
import Projects from "./pages/public/Projects";
import Providers from "./pages/public/Providers";
import Contact from "./pages/public/Contact";
import NotFound from "./pages/public/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Client Panel Pages (Tema Claro)
import PanelDashboard from "./pages/panel/PanelDashboard";
import PanelQuotes from "./pages/panel/PanelQuotes";
import PanelProfile from "./pages/panel/PanelProfile";
import PanelChatbot from "./pages/panel/PanelChatbot";
import PanelEquipment from "./pages/panel/PanelEquipment";
import PanelTickets from "./pages/panel/PanelTickets";

// Admin & Technician Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCatalog from "./pages/admin/AdminCatalog";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminProviders from "./pages/admin/AdminProviders";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ======================================================== */}
          {/* ZONA 1: SITIO PÚBLICO MULTIPÁGINA (Layout Compartido)    */}
          {/* ======================================================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/mision-vision" element={<MissionVision />} />
            <Route path="/proyectos" element={<Projects />} />
            <Route path="/proveedores" element={<Providers />} />
            <Route path="/contacto" element={<Contact />} />
          </Route>

          {/* Autenticación (Login y Registro) */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Cotizador con IA Público para Visitantes (sin forzar login antes de cotizar) */}
          <Route
            path="/cotizador"
            element={
              <PublicLayout>
                <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                  <PanelChatbot />
                </div>
              </PublicLayout>
            }
          />

          {/* ======================================================== */}
          {/* ZONA 2: ÁREA DEL CLIENTE (Panel Propio con Menú Lateral) */}
          {/* ======================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["Cliente", "Administrador", "Técnico"]} />}>
            <Route path="/panel" element={<PanelLayout />}>
              <Route index element={<PanelDashboard />} />
              <Route path="cotizador" element={<PanelChatbot />} />
              <Route path="cotizaciones" element={<PanelQuotes />} />
              <Route path="perfil" element={<PanelProfile />} />
              <Route path="equipos" element={<PanelEquipment />} />
              <Route path="tickets" element={<PanelTickets />} />
            </Route>

            {/* Redirección de compatibilidad para enlaces antiguos a /portal */}
            <Route path="/portal" element={<Navigate to="/panel" replace />} />
            <Route path="/portal/*" element={<Navigate to="/panel" replace />} />
          </Route>

          {/* ======================================================== */}
          {/* ZONA 3: PANEL ADMINISTRADOR Y TÉCNICO                   */}
          {/* ======================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["Administrador", "Técnico"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="clientes" element={<AdminClients />} />
              <Route path="inventario" element={<AdminInventory />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="cotizaciones" element={<AdminQuotes />} />

              {/* Rutas con acceso restringido exclusivo para Administrador */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
                <Route path="catalogo" element={<AdminCatalog />} />
                <Route path="proveedores" element={<AdminProviders />} />
                <Route path="finanzas" element={<AdminFinances />} />
              </Route>
            </Route>
          </Route>

          {/* Página 404 No Encontrado */}
          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFound />
              </PublicLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
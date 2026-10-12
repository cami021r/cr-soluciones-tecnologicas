import React from "react";
import { Outlet } from "react-router-dom";
import { BackgroundEffect } from "../components/BackgroundEffect";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const PublicLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen relative text-slate-800">
      <BackgroundEffect />
      <Navbar />
      <main className="flex-1 relative z-10">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;

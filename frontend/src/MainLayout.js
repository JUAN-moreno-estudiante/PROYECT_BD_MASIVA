// src/MainLayout.js
import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./MainLayout.css";

export default function MainLayout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpia credenciales o token aquí...
    onLogout?.();          // notifica a App.js que se cierre sesión
    navigate("/login");    // redirige al login
  };

  return (
    <div className="app">
      <Header onLogout={handleLogout} />

      <div className="main-layout">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="content-area">
          {/* Aquí se renderizan las rutas hijas definidas en App.js */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

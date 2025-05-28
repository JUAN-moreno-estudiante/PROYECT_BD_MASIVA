// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import './App.css';
import Login        from "./Login";
import MainLayout   from "./MainLayout";
import Inicio       from "./Inicio";
import Seguimientos from "./seguimientos";
import Nomina       from "./Nomina";
import Notas        from "./Notas";
import Asistencia   from "./Asistencia";
import Graficos     from "./components/PieChart";     // <-- Nuevo

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <MainLayout onLogout={() => setIsLoggedIn(false)} />
              : <Navigate to="/login" replace />
          }
        >
          {/* Ruta raíz */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Hijas */}
          <Route path="dashboard"     element={<Inicio       />} />
          <Route path="seguimientos"  element={<Seguimientos />} />
          <Route path="nomina"        element={<Nomina       />} />
          <Route path="notas"         element={<Notas        />} />
          <Route path="asistencias"   element={<Asistencia   />} />
          <Route path="graficos"      element={<Graficos     />} />  {/* Nueva */}
          
          {/* Catch-all protegido */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all público */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

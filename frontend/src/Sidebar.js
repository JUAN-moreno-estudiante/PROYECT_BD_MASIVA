import React from 'react';
import { FaHome, FaUsers, FaRegCheckCircle,FaMoneyCheckAlt, FaBook, FaSchool } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        ☰
      </button>

      <h3><FaSchool /> CRM SCHOOLARIUM</h3>

      <ul>
        <li onClick={() => handleNavigate('/dashboard')}>
          <FaHome /> Inicio
        </li>
        <li onClick={() => handleNavigate('/seguimientos')}>
          <FaUsers /> Seguimientos
        </li>
        <li onClick={() => handleNavigate('/nomina')}>
          <FaMoneyCheckAlt /> Docentes
        </li>
        <li onClick={() => handleNavigate('/notas')}>
          <FaBook /> Estudiante
        </li>
        <li onClick={() => handleNavigate('/asistencias')}>
        <FaRegCheckCircle /> Asistencias
         </li>
      </ul>
    </aside>
  );
}

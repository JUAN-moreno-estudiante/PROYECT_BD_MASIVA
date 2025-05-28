import React from 'react';
import './Header.css';

export default function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header__block" /> {/* espacio izquierdo */}
      <h1 className="header__title">SCHOOLARIUM</h1>
      <div className="header__block">
        <button className="header__logout-btn" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import miLogo from './assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password }) // <- debe coincidir con backend
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        return;
      }

      // ✅ Login exitoso
      onLoginSuccess(); // actualiza estado global
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error("❌ Error de red:", err);
      setError("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="avatar">
  <img src={miLogo} alt="Logo Scholarium" />
</div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
          )}

          <div className="options">
            
            <button
  type="button"
  className="link-button"
  onClick={() =>
    window.open(
      'https://wa.me/573133814695?text=Hola,olvidé+mi+contraseña+SOPORTE',
      '_blank'
    )
  }
>
  Forgot Password?
</button>
          </div>

          <button type="submit">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

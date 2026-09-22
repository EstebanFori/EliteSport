'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const [login, setLogin] = useState('admin');
  const [contrasena, setContrasena] = useState('Admin123!');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async (event) => {
    event.preventDefault();
    setError('');
    setCargando(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, contrasena }),
      });
      localStorage.setItem('elitesport_token', data.token);
      localStorage.setItem('elitesport_user', JSON.stringify(data.usuario));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <a href="/" className="brand">Elite<span>Sport</span></a>
        <div className="eyebrow" style={{ marginTop: 18 }}>Acceso seguro</div>
        <h1>Iniciar sesión</h1>
        <p className="muted">Accede a las funciones disponibles según tu rol.</p>

        <form className="form" onSubmit={entrar}>
          <label className="label">
            Usuario o correo
            <input className="input" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="admin" autoComplete="username" required />
          </label>
          <label className="label">
            Contraseña
            <input className="input" type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} autoComplete="current-password" required />
          </label>
          <button className="btn btn-primary" disabled={cargando}>{cargando ? 'Ingresando...' : 'Iniciar sesión'}</button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="demo-box">
          <strong>Usuarios demo</strong>
          <div className="demo-line">Administrador → admin / Admin123!</div>
          <div className="demo-line">Entrenador → entrenador / Entrenador123!</div>
          <div className="demo-line">Deportista → deportista / Deportista123!</div>
        </div>

        <a href="/" className="btn btn-secondary" style={{ marginTop: 20, width: '100%' }}>← Volver al inicio</a>
      </section>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const iconoDeporte = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('fútbol') || n.includes('futbol')) return '⚽';
  if (n.includes('baloncesto')) return '🏀';
  if (n.includes('natación') || n.includes('natacion')) return '🏊';
  if (n.includes('tenis')) return '🎾';
  return '🏆';
};

export default function Home() {
  const [deportes, setDeportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/deportes')
      .then(setDeportes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <a href="#inicio" className="brand">Elite<span>Sport</span></a>
          <nav className="toolbar">
            <a href="#inicio">Inicio</a>
            <a href="#deportes">Deportes</a>
            <a href="#equipos">Equipos</a>
            <a href="#torneos">Torneos</a>
          </nav>
          <div className="user-area">
            <span className="badge">Gestión deportiva</span>
            <a href="/login" className="btn btn-primary">Iniciar sesión</a>
          </div>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Gestión deportiva</div>
            <h1>Lleva tu organización deportiva al siguiente nivel.</h1>
            <p>EliteSport centraliza deportistas, entrenadores, equipos, entrenamientos y torneos desde una sola aplicación.</p>
            <div className="action-row">
              <a href="/login" className="btn btn-primary">Explorar plataforma</a>
              <a href="#deportes" className="btn btn-secondary">Ver deportes</a>
            </div>
          </div>
          <div className="hero-panel">
            <div className="eyebrow">Panel deportivo</div>
            <h2>Resumen</h2>
            <div className="stats">
              <div className="stat"><span>Deportes</span><strong>{cargando ? '...' : deportes.length}</strong></div>
              <div className="stat"><span>Equipos</span><strong>12</strong></div>
              <div className="stat"><span>Entrenamientos</span><strong>36</strong></div>
              <div className="stat"><span>Torneos</span><strong>5</strong></div>
            </div>
            {error ? <span className="badge badge-danger">API no disponible</span> : <span className="badge badge-success">API conectada</span>}
          </div>
        </div>
      </section>

      <section id="deportes" className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="eyebrow">Deportes</div>
              <h2>Deportes registrados</h2>
              <p className="muted">Los datos se consultan mediante la API REST.</p>
            </div>
            <a href="/login" className="btn btn-secondary">Administrar</a>
          </div>

          {cargando && <div className="loading">Cargando deportes...</div>}
          {error && <div className="error">No se pudieron cargar los deportes. Verifica que el backend esté activo.</div>}
          {!cargando && !error && deportes.length === 0 && <div className="empty">No hay deportes registrados.</div>}
          {!cargando && !error && deportes.length > 0 && (
            <div className="grid-3">
              {deportes.map((deporte) => (
                <article className="card" key={deporte.id_deporte}>
                  <div style={{ fontSize: '42px', marginBottom: '14px' }}>{iconoDeporte(deporte.nombre)}</div>
                  <h3>{deporte.nombre}</h3>
                  <p>{deporte.descripcion || 'Sin descripción registrada.'}</p>
                  <div style={{ marginTop: '14px' }}>
                    <span className={`badge ${deporte.estado ? 'badge-success' : 'badge-danger'}`}>
                      {deporte.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="equipos" className="section">
        <div className="container">
          <div className="section-header">
            <div><div className="eyebrow">Equipos</div><h2>Gestión de equipos</h2></div>
            <a href="/login" className="btn btn-secondary">Acceder</a>
          </div>
          <div className="grid-3">
            <article className="card"><div style={{ fontSize: '36px' }}>🏆</div><h3>Equipos deportivos</h3><p>Organización y administración de los equipos registrados.</p></article>
            <article className="card"><div style={{ fontSize: '36px' }}>👥</div><h3>Deportistas</h3><p>Asignación de deportistas y consulta de integrantes.</p></article>
            <article className="card"><div style={{ fontSize: '36px' }}>🧑‍🏫</div><h3>Entrenadores</h3><p>Gestión de entrenadores responsables de los equipos.</p></article>
          </div>
        </div>
      </section>

      <section id="torneos" className="section">
        <div className="container">
          <div className="section-header">
            <div><div className="eyebrow">Torneos</div><h2>Competencias deportivas</h2></div>
            <a href="/login" className="btn btn-secondary">Ver plataforma</a>
          </div>
          <div className="grid-2">
            <article className="card"><div style={{ fontSize: '36px' }}>🏟️</div><h3>Torneos</h3><p>Organiza competencias, fechas, equipos y estados.</p></article>
            <article className="card"><div style={{ fontSize: '36px' }}>📊</div><h3>Resultados</h3><p>Consulta partidos y resultados deportivos.</p></article>
          </div>
        </div>
      </section>

      <footer className="footer"><div className="container"><div className="brand">Elite<span>Sport</span></div><p>Plataforma de gestión deportiva · Proyecto Final de Programación 5</p></div></footer>
    </main>
  );
}

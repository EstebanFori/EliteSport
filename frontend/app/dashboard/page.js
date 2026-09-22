'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

const fmtDate = (value) => value ? String(value).slice(0, 10) : '—';
const fmtTime = (value) => value ? String(value).slice(0, 5) : '—';
const titleCase = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function Stats({ estadisticas = {} }) {
  return (
    <div className="stats">
      {Object.entries(estadisticas).map(([key, value]) => (
        <div className="stat" key={key}>
          <span>{titleCase(key)}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="section-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
    </div>
  );
}

function AdminPanel({ refreshDashboard }) {
  const [tab, setTab] = useState('deportes');
  const [deportes, setDeportes] = useState([]);
  const [deportistas, setDeportistas] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [editandoDeporte, setEditandoDeporte] = useState(null);

  const [sportForm, setSportForm] = useState({ nombre: '', descripcion: '', estado: true });
  const [athleteForm, setAthleteForm] = useState({
    nombre: '', apellido: '', fecha_nacimiento: '', documento: '', telefono: '', direccion: '',
    correo: '', nombre_usuario: '', contrasena: '',
  });
  const [coachForm, setCoachForm] = useState({
    nombre: '', apellido: '', documento: '', telefono: '', especialidad: '', fecha_contratacion: '',
    correo: '', nombre_usuario: '', contrasena: '',
  });
  const [assignForm, setAssignForm] = useState({ id_equipo: '', id_deportista: '' });
  const [tournamentForm, setTournamentForm] = useState({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'Planificado' });

  const cargarTodos = async () => {
    const [d, dep, ent, eq, cat, tor] = await Promise.all([
      apiFetch('/deportes'),
      apiFetch('/personas/deportistas'),
      apiFetch('/personas/entrenadores'),
      apiFetch('/equipos'),
      apiFetch('/equipos/categorias'),
      apiFetch('/torneos'),
    ]);
    setDeportes(d);
    setDeportistas(dep);
    setEntrenadores(ent);
    setEquipos(eq);
    setCategorias(cat);
    setTorneos(tor);
  };

  useEffect(() => {
    cargarTodos().catch((e) => setError(e.message));
  }, []);

  const ejecutar = async (fn, successMessage) => {
    setError('');
    setMensaje('');
    try {
      await fn();
      setMensaje(successMessage);
      await cargarTodos();
      await refreshDashboard();
    } catch (e) {
      setError(e.message);
    }
  };

  const guardarDeporte = async (event) => {
    event.preventDefault();
    await ejecutar(async () => {
      await apiFetch(editandoDeporte ? `/deportes/${editandoDeporte}` : '/deportes', {
        method: editandoDeporte ? 'PUT' : 'POST',
        body: JSON.stringify(sportForm),
      });
      setSportForm({ nombre: '', descripcion: '', estado: true });
      setEditandoDeporte(null);
    }, editandoDeporte ? 'Deporte actualizado.' : 'Deporte creado.');
  };

  const eliminarDeporte = async (id) => {
    if (!window.confirm('¿Deseas eliminar este deporte? Solo puede eliminarse si no tiene categorías relacionadas.')) return;
    await ejecutar(() => apiFetch(`/deportes/${id}`, { method: 'DELETE' }), 'Deporte eliminado.');
  };

  const crearDeportista = async (event) => {
    event.preventDefault();
    await ejecutar(async () => {
      await apiFetch('/personas/deportistas', { method: 'POST', body: JSON.stringify(athleteForm) });
      setAthleteForm({ nombre: '', apellido: '', fecha_nacimiento: '', documento: '', telefono: '', direccion: '', correo: '', nombre_usuario: '', contrasena: '' });
    }, 'Deportista registrado correctamente.');
  };

  const crearEntrenador = async (event) => {
    event.preventDefault();
    await ejecutar(async () => {
      await apiFetch('/personas/entrenadores', { method: 'POST', body: JSON.stringify(coachForm) });
      setCoachForm({ nombre: '', apellido: '', documento: '', telefono: '', especialidad: '', fecha_contratacion: '', correo: '', nombre_usuario: '', contrasena: '' });
    }, 'Entrenador registrado correctamente.');
  };

  const cambiarEstado = async (tipo, id, estado) => {
    await ejecutar(() => apiFetch(`/personas/${tipo}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado: !estado }) }), 'Estado actualizado.');
  };

  const asignarDeportista = async (event) => {
    event.preventDefault();
    await ejecutar(() => apiFetch(`/equipos/${assignForm.id_equipo}/roster`, { method: 'POST', body: JSON.stringify({ id_deportista: Number(assignForm.id_deportista) }) }), 'Deportista asignado al equipo.');
    setAssignForm({ id_equipo: '', id_deportista: '' });
  };

  const crearTorneo = async (event) => {
    event.preventDefault();
    await ejecutar(() => apiFetch('/torneos', { method: 'POST', body: JSON.stringify(tournamentForm) }), 'Torneo creado.');
    setTournamentForm({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'Planificado' });
  };

  const eliminarTorneo = async (id) => {
    if (!window.confirm('¿Eliminar este torneo?')) return;
    await ejecutar(() => apiFetch(`/torneos/${id}`, { method: 'DELETE' }), 'Torneo eliminado.');
  };

  const tabs = [
    ['deportes', 'Deportes'],
    ['deportistas', 'Deportistas'],
    ['entrenadores', 'Entrenadores'],
    ['equipos', 'Equipos'],
    ['torneos', 'Torneos'],
  ];

  return (
    <section className="section">
      <SectionTitle eyebrow="Administrador" title="Gestión general" description="Administra las entidades principales de EliteSport desde un solo panel." />
      {mensaje && <div className="notice">{mensaje}</div>}
      {error && <div className="error">{error}</div>}

      <div className="tabs">
        {tabs.map(([value, label]) => (
          <button key={value} type="button" className={`tab ${tab === value ? 'active' : ''}`} onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>

      {tab === 'deportes' && (
        <div className="grid-2">
          <div className="card">
            <h3>{editandoDeporte ? 'Editar deporte' : 'Registrar deporte'}</h3>
            <form className="form" onSubmit={guardarDeporte}>
              <label className="label">Nombre<input className="input" value={sportForm.nombre} onChange={(e) => setSportForm({ ...sportForm, nombre: e.target.value })} required /></label>
              <label className="label">Descripción<textarea className="textarea" value={sportForm.descripcion} onChange={(e) => setSportForm({ ...sportForm, descripcion: e.target.value })} /></label>
              <label className="label">Estado<select className="select" value={String(sportForm.estado)} onChange={(e) => setSportForm({ ...sportForm, estado: e.target.value === 'true' })}><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
              <div className="action-row">
                <button className="btn btn-primary">{editandoDeporte ? 'Actualizar' : 'Crear'}</button>
                {editandoDeporte && <button type="button" className="btn btn-secondary" onClick={() => { setEditandoDeporte(null); setSportForm({ nombre: '', descripcion: '', estado: true }); }}>Cancelar</button>}
              </div>
            </form>
          </div>
          <div className="card">
            <h3>Deportes disponibles</h3>
            {deportes.length === 0 ? <div className="empty">No hay deportes.</div> : (
              <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                {deportes.map((d) => <tr key={d.id_deporte}><td>{d.nombre}</td><td><span className={`badge ${d.estado ? 'badge-success' : 'badge-danger'}`}>{d.estado ? 'Activo' : 'Inactivo'}</span></td><td><div className="action-row"><button className="btn btn-secondary btn-small" onClick={() => { setEditandoDeporte(d.id_deporte); setSportForm({ nombre: d.nombre, descripcion: d.descripcion || '', estado: d.estado }); }}>Editar</button><button className="btn btn-danger btn-small" onClick={() => eliminarDeporte(d.id_deporte)}>Eliminar</button></div></td></tr>)}
              </tbody></table></div>
            )}
          </div>
        </div>
      )}

      {tab === 'deportistas' && (
        <div className="grid-2">
          <div className="card">
            <h3>Registrar deportista</h3>
            <form className="form-grid" onSubmit={crearDeportista}>
              {[
                ['nombre','Nombre'],['apellido','Apellido'],['documento','Documento'],['telefono','Teléfono'],['correo','Correo'],['nombre_usuario','Usuario'],['contrasena','Contraseña']
              ].map(([key,label]) => <label className="label" key={key}>{label}<input className="input" type={key === 'contrasena' ? 'password' : key === 'correo' ? 'email' : 'text'} value={athleteForm[key]} onChange={(e) => setAthleteForm({ ...athleteForm, [key]: e.target.value })} required={['nombre','apellido','documento','correo','nombre_usuario','contrasena'].includes(key)} /></label>)}
              <label className="label">Fecha de nacimiento<input className="input" type="date" value={athleteForm.fecha_nacimiento} onChange={(e) => setAthleteForm({ ...athleteForm, fecha_nacimiento: e.target.value })} required /></label>
              <label className="label">Dirección<input className="input" value={athleteForm.direccion} onChange={(e) => setAthleteForm({ ...athleteForm, direccion: e.target.value })} /></label>
              <div className="full"><button className="btn btn-primary">Registrar deportista</button></div>
            </form>
          </div>
          <div className="card">
            <h3>Deportistas registrados</h3>
            {deportistas.length === 0 ? <div className="empty">No hay deportistas.</div> : <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Documento</th><th>Usuario</th><th>Estado</th></tr></thead><tbody>{deportistas.map((d) => <tr key={d.id_deportista}><td>{d.nombre} {d.apellido}</td><td>{d.documento}</td><td>{d.nombre_usuario}</td><td><button className="btn btn-secondary btn-small" onClick={() => cambiarEstado('deportistas', d.id_deportista, d.estado)}>{d.estado ? 'Activo' : 'Inactivo'}</button></td></tr>)}</tbody></table></div>}
          </div>
        </div>
      )}

      {tab === 'entrenadores' && (
        <div className="grid-2">
          <div className="card">
            <h3>Registrar entrenador</h3>
            <form className="form-grid" onSubmit={crearEntrenador}>
              {[
                ['nombre','Nombre'],['apellido','Apellido'],['documento','Documento'],['telefono','Teléfono'],['especialidad','Especialidad'],['correo','Correo'],['nombre_usuario','Usuario'],['contrasena','Contraseña']
              ].map(([key,label]) => <label className="label" key={key}>{label}<input className="input" type={key === 'contrasena' ? 'password' : key === 'correo' ? 'email' : 'text'} value={coachForm[key]} onChange={(e) => setCoachForm({ ...coachForm, [key]: e.target.value })} required={['nombre','apellido','documento','correo','nombre_usuario','contrasena'].includes(key)} /></label>)}
              <label className="label">Fecha de contratación<input className="input" type="date" value={coachForm.fecha_contratacion} onChange={(e) => setCoachForm({ ...coachForm, fecha_contratacion: e.target.value })} required /></label>
              <div className="full"><button className="btn btn-primary">Registrar entrenador</button></div>
            </form>
          </div>
          <div className="card">
            <h3>Entrenadores registrados</h3>
            {entrenadores.length === 0 ? <div className="empty">No hay entrenadores.</div> : <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Especialidad</th><th>Usuario</th><th>Estado</th></tr></thead><tbody>{entrenadores.map((e) => <tr key={e.id_entrenador}><td>{e.nombre} {e.apellido}</td><td>{e.especialidad || '—'}</td><td>{e.nombre_usuario}</td><td><button className="btn btn-secondary btn-small" onClick={() => cambiarEstado('entrenadores', e.id_entrenador, e.estado)}>{e.estado ? 'Activo' : 'Inactivo'}</button></td></tr>)}</tbody></table></div>}
          </div>
        </div>
      )}

      {tab === 'equipos' && (
        <div className="grid-2">
          <div className="card">
            <h3>Equipos registrados</h3>
            {equipos.length === 0 ? <div className="empty">No hay equipos.</div> : <div className="table-wrap"><table><thead><tr><th>Equipo</th><th>Deporte</th><th>Categoría</th><th>Deportistas</th></tr></thead><tbody>{equipos.map((e) => <tr key={e.id_equipo}><td>{e.nombre}</td><td>{e.deporte}</td><td>{e.categoria}</td><td>{e.deportistas ?? '—'}</td></tr>)}</tbody></table></div>}
          </div>
          <div className="card">
            <h3>Asignar deportista a equipo</h3>
            <form className="form" onSubmit={asignarDeportista}>
              <label className="label">Equipo<select className="select" value={assignForm.id_equipo} onChange={(e) => setAssignForm({ ...assignForm, id_equipo: e.target.value })} required><option value="">Selecciona</option>{equipos.map((e) => <option key={e.id_equipo} value={e.id_equipo}>{e.nombre} · {e.deporte}</option>)}</select></label>
              <label className="label">Deportista<select className="select" value={assignForm.id_deportista} onChange={(e) => setAssignForm({ ...assignForm, id_deportista: e.target.value })} required><option value="">Selecciona</option>{deportistas.filter((d) => d.estado).map((d) => <option key={d.id_deportista} value={d.id_deportista}>{d.nombre} {d.apellido}</option>)}</select></label>
              <button className="btn btn-primary">Asignar</button>
            </form>
            <div style={{ marginTop: 18 }}><p className="muted">Categorías disponibles: {categorias.length}</p></div>
          </div>
        </div>
      )}

      {tab === 'torneos' && (
        <div className="grid-2">
          <div className="card">
            <h3>Registrar torneo</h3>
            <form className="form" onSubmit={crearTorneo}>
              <label className="label">Nombre<input className="input" value={tournamentForm.nombre} onChange={(e) => setTournamentForm({ ...tournamentForm, nombre: e.target.value })} required /></label>
              <label className="label">Descripción<textarea className="textarea" value={tournamentForm.descripcion} onChange={(e) => setTournamentForm({ ...tournamentForm, descripcion: e.target.value })} /></label>
              <div className="form-grid"><label className="label">Inicio<input className="input" type="date" value={tournamentForm.fecha_inicio} onChange={(e) => setTournamentForm({ ...tournamentForm, fecha_inicio: e.target.value })} required /></label><label className="label">Fin<input className="input" type="date" value={tournamentForm.fecha_fin} onChange={(e) => setTournamentForm({ ...tournamentForm, fecha_fin: e.target.value })} required /></label></div>
              <label className="label">Estado<select className="select" value={tournamentForm.estado} onChange={(e) => setTournamentForm({ ...tournamentForm, estado: e.target.value })}><option>Planificado</option><option>Activo</option><option>Finalizado</option><option>Cancelado</option></select></label>
              <button className="btn btn-primary">Crear torneo</button>
            </form>
          </div>
          <div className="card">
            <h3>Calendario de torneos</h3>
            {torneos.length === 0 ? <div className="empty">No hay torneos.</div> : <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Fechas</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{torneos.map((t) => <tr key={t.id_torneo}><td>{t.nombre}</td><td>{fmtDate(t.fecha_inicio)} → {fmtDate(t.fecha_fin)}</td><td>{t.estado}</td><td><button className="btn btn-danger btn-small" onClick={() => eliminarTorneo(t.id_torneo)}>Eliminar</button></td></tr>)}</tbody></table></div>}
          </div>
        </div>
      )}
    </section>
  );
}

function TrainerPanel({ usuario, refreshDashboard }) {
  const [tab, setTab] = useState('equipos');
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [recursos, setRecursos] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [equipoForm, setEquipoForm] = useState({ id_categoria: '', nombre: '' });
  const [trainingForm, setTrainingForm] = useState({ id_equipo: '', id_instalacion: '', id_horario: '', fecha: '', descripcion: '' });
  const [selectedTraining, setSelectedTraining] = useState('');
  const [deportistas, setDeportistas] = useState([]);
  const [asistencia, setAsistencia] = useState({});

  const cargar = async () => {
    const [e, c, t, r] = await Promise.all([
      apiFetch('/equipos'), apiFetch('/equipos/categorias'), apiFetch('/entrenamientos'), apiFetch('/entrenamientos/recursos')
    ]);
    setEquipos(e); setCategorias(c); setEntrenamientos(t); setRecursos(r);
  };

  useEffect(() => { cargar().catch((e) => setError(e.message)); }, []);

  const crearEquipo = async (event) => {
    event.preventDefault(); setMensaje(''); setError('');
    try {
      await apiFetch('/equipos', { method: 'POST', body: JSON.stringify({ id_categoria:Number(equipoForm.id_categoria), nombre:equipoForm.nombre }) });
      setEquipoForm({ id_categoria:'', nombre:'' }); setMensaje('Equipo creado y asignado al entrenador.'); await cargar(); await refreshDashboard();
    } catch (e) { setError(e.message); }
  };

  const crearTraining = async (event) => {
    event.preventDefault(); setMensaje(''); setError('');
    try {
      await apiFetch('/entrenamientos', {
        method:'POST',
        body: JSON.stringify({
          id_equipo:Number(trainingForm.id_equipo),
          id_entrenador:Number(usuario.id_entrenador),
          id_instalacion:Number(trainingForm.id_instalacion),
          id_horario:Number(trainingForm.id_horario),
          fecha:trainingForm.fecha,
          descripcion:trainingForm.descripcion,
        }),
      });
      setTrainingForm({ id_equipo:'', id_instalacion:'', id_horario:'', fecha:'', descripcion:'' }); setMensaje('Entrenamiento programado.'); await cargar(); await refreshDashboard();
    } catch(e) { setError(e.message); }
  };

  const cargarAsistencia = async (id) => {
    setSelectedTraining(id);
    setMensaje(''); setError('');
    try {
      const dep = await apiFetch(`/entrenamientos/${id}/deportistas`);
      const as = await apiFetch(`/entrenamientos/${id}/asistencia`);
      setDeportistas(dep);
      const map = {};
      as.forEach((item) => { map[item.id_deportista] = item.estado; });
      setAsistencia(map);
    } catch(e) { setError(e.message); }
  };

  const guardarAsistencia = async (idDeportista) => {
    try {
      await apiFetch(`/entrenamientos/${selectedTraining}/asistencia`, {
        method:'PUT', body:JSON.stringify({ id_deportista:idDeportista, estado:asistencia[idDeportista] || 'Presente' })
      });
      setMensaje('Asistencia guardada.');
      await refreshDashboard();
    } catch(e) { setError(e.message); }
  };

  return (
    <section className="section">
      <SectionTitle eyebrow="Entrenador" title="Operación de mis equipos" description="Crea equipos, programa entrenamientos y registra asistencias." />
      {mensaje && <div className="notice">{mensaje}</div>}
      {error && <div className="error">{error}</div>}
      <div className="tabs"><button className={`tab ${tab==='equipos'?'active':''}`} onClick={()=>setTab('equipos')}>Equipos</button><button className={`tab ${tab==='entrenamientos'?'active':''}`} onClick={()=>setTab('entrenamientos')}>Entrenamientos</button><button className={`tab ${tab==='asistencia'?'active':''}`} onClick={()=>setTab('asistencia')}>Asistencias</button></div>

      {tab === 'equipos' && <div className="grid-2"><div className="card"><h3>Crear equipo</h3><form className="form" onSubmit={crearEquipo}><label className="label">Categoría<select className="select" value={equipoForm.id_categoria} onChange={(e)=>setEquipoForm({...equipoForm,id_categoria:e.target.value})} required><option value="">Selecciona</option>{categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.deporte} · {c.nombre}</option>)}</select></label><label className="label">Nombre<input className="input" value={equipoForm.nombre} onChange={(e)=>setEquipoForm({...equipoForm,nombre:e.target.value})} required /></label><button className="btn btn-primary">Crear equipo</button></form></div><div className="card"><h3>Mis equipos</h3>{equipos.length===0?<div className="empty">No tienes equipos asignados.</div>:<div className="table-wrap"><table><thead><tr><th>Equipo</th><th>Deporte</th><th>Categoría</th><th>Deportistas</th></tr></thead><tbody>{equipos.map(e=><tr key={e.id_equipo}><td>{e.nombre}</td><td>{e.deporte}</td><td>{e.categoria}</td><td>{e.deportistas??'—'}</td></tr>)}</tbody></table></div>}</div></div>}

      {tab === 'entrenamientos' && <div className="grid-2"><div className="card"><h3>Programar entrenamiento</h3>{recursos ? <form className="form" onSubmit={crearTraining}><label className="label">Equipo<select className="select" value={trainingForm.id_equipo} onChange={(e)=>setTrainingForm({...trainingForm,id_equipo:e.target.value})} required><option value="">Selecciona</option>{equipos.map(e=><option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>)}</select></label><label className="label">Instalación<select className="select" value={trainingForm.id_instalacion} onChange={(e)=>setTrainingForm({...trainingForm,id_instalacion:e.target.value})} required><option value="">Selecciona</option>{recursos.instalaciones.map(x=><option key={x.id_instalacion} value={x.id_instalacion}>{x.nombre}</option>)}</select></label><label className="label">Horario<select className="select" value={trainingForm.id_horario} onChange={(e)=>setTrainingForm({...trainingForm,id_horario:e.target.value})} required><option value="">Selecciona</option>{recursos.horarios.map(x=><option key={x.id_horario} value={x.id_horario}>{x.dia_semana} · {fmtTime(x.hora_inicio)}-{fmtTime(x.hora_fin)}</option>)}</select></label><label className="label">Fecha<input className="input" type="date" value={trainingForm.fecha} onChange={(e)=>setTrainingForm({...trainingForm,fecha:e.target.value})} required /></label><label className="label">Descripción<input className="input" value={trainingForm.descripcion} onChange={(e)=>setTrainingForm({...trainingForm,descripcion:e.target.value})} /></label><button className="btn btn-primary">Programar</button></form>:<div className="loading">Cargando recursos...</div>}</div><div className="card"><h3>Entrenamientos</h3>{entrenamientos.length===0?<div className="empty">No hay entrenamientos.</div>:<div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Equipo</th><th>Instalación</th><th>Horario</th><th>Asistencia</th></tr></thead><tbody>{entrenamientos.map(x=><tr key={x.id_entrenamiento}><td>{fmtDate(x.fecha)}</td><td>{x.equipo}</td><td>{x.instalacion}</td><td>{x.dia_semana} {fmtTime(x.hora_inicio)}</td><td><button className="btn btn-secondary btn-small" onClick={()=>{setTab('asistencia');cargarAsistencia(x.id_entrenamiento);}}>Gestionar</button></td></tr>)}</tbody></table></div>}</div></div>}

      {tab === 'asistencia' && <div className="grid-2"><div className="card"><h3>Selecciona un entrenamiento</h3><label className="label">Entrenamiento<select className="select" value={selectedTraining} onChange={(e)=>cargarAsistencia(e.target.value)}><option value="">Selecciona</option>{entrenamientos.map(x=><option key={x.id_entrenamiento} value={x.id_entrenamiento}>{fmtDate(x.fecha)} · {x.equipo}</option>)}</select></label><p className="muted" style={{marginTop:12}}>Marca el estado y guarda por deportista.</p></div><div className="card"><h3>Lista de asistencia</h3>{!selectedTraining?<div className="empty">Selecciona un entrenamiento.</div>:deportistas.length===0?<div className="empty">Este equipo no tiene deportistas asignados.</div>:<div className="table-wrap"><table><thead><tr><th>Deportista</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{deportistas.map(d=><tr key={d.id_deportista}><td>{d.nombre} {d.apellido}</td><td><select className="select" value={asistencia[d.id_deportista] || 'Presente'} onChange={(e)=>setAsistencia({...asistencia,[d.id_deportista]:e.target.value})}><option>Presente</option><option>Ausente</option><option>Justificado</option></select></td><td><button className="btn btn-primary btn-small" onClick={()=>guardarAsistencia(d.id_deportista)}>Guardar</button></td></tr>)}</tbody></table></div>}</div></div>}
    </section>
  );
}

function AthletePanel({ usuario }) {
  const [equipos, setEquipos] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiFetch('/equipos'), apiFetch('/entrenamientos'), apiFetch('/torneos')])
      .then(([e,t,tor])=>{setEquipos(e);setEntrenamientos(t);setTorneos(tor);})
      .catch((e)=>setError(e.message));
  }, []);

  return (
    <section className="section">
      <SectionTitle eyebrow="Deportista" title="Mi actividad deportiva" description="Consulta tus equipos, próximos entrenamientos y torneos." />
      {error && <div className="error">{error}</div>}
      <div className="grid-3">
        <div className="card"><h3>Mi perfil</h3><div className="profile-list"><div className="profile-item"><span>Nombre</span><strong>{usuario.nombre_deportista} {usuario.apellido_deportista}</strong></div><div className="profile-item"><span>Documento</span><strong>{usuario.documento_deportista || '—'}</strong></div><div className="profile-item"><span>Correo</span><strong>{usuario.correo}</strong></div></div></div>
        <div className="card"><h3>Mis equipos</h3>{equipos.length===0?<div className="empty">No tienes equipos asignados.</div>:equipos.map(e=><div className="profile-item" key={e.id_equipo}><span>{e.deporte}</span><strong>{e.nombre}</strong></div>)}</div>
        <div className="card"><h3>Torneos</h3>{torneos.length===0?<div className="empty">No hay torneos.</div>:torneos.slice(0,5).map(t=><div className="profile-item" key={t.id_torneo}><span>{t.estado}</span><strong>{t.nombre}</strong></div>)}</div>
      </div>
      <div className="card" style={{marginTop:18}}><h3>Próximos entrenamientos</h3>{entrenamientos.length===0?<div className="empty">No hay entrenamientos disponibles.</div>:<div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Equipo</th><th>Entrenador</th><th>Instalación</th><th>Horario</th><th>Asistencia</th></tr></thead><tbody>{entrenamientos.map(x=><tr key={x.id_entrenamiento}><td>{fmtDate(x.fecha)}</td><td>{x.equipo}</td><td>{x.entrenador}</td><td>{x.instalacion}</td><td>{x.dia_semana} {fmtTime(x.hora_inicio)}-{fmtTime(x.hora_fin)}</td><td><span className="badge">{x.asistencia || 'Pendiente'}</span></td></tr>)}</tbody></table></div>}</div>
    </section>
  );
}

export default function Dashboard() {
  const [usuario,setUsuario]=useState(null);
  const [dashboard,setDashboard]=useState(null);
  const [cargando,setCargando]=useState(true);
  const [error,setError]=useState('');

  const cargarDashboard = async () => {
    const [perfil, datos] = await Promise.all([apiFetch('/auth/me'), apiFetch('/dashboard')]);
    setUsuario(perfil);
    setDashboard(datos);
  };

  useEffect(()=>{
    const token = localStorage.getItem('elitesport_token');
    if(!token){ window.location.href='/login'; return; }
    cargarDashboard().catch((e)=>{localStorage.removeItem('elitesport_token');setError(e.message);}).finally(()=>setCargando(false));
  },[]);

  const nombre = useMemo(()=>{
    if(!usuario) return 'Usuario';
    if(usuario.rol==='Deportista') return `${usuario.nombre_deportista || ''} ${usuario.apellido_deportista || ''}`.trim() || usuario.nombre_usuario;
    if(usuario.rol==='Entrenador') return `${usuario.nombre_entrenador || ''} ${usuario.apellido_entrenador || ''}`.trim() || usuario.nombre_usuario;
    return usuario.nombre_usuario;
  },[usuario]);

  const salir=()=>{localStorage.removeItem('elitesport_token');localStorage.removeItem('elitesport_user');window.location.href='/';};

  if(cargando) return <div className="loading" style={{minHeight:'100vh',display:'grid',placeItems:'center'}}>Cargando EliteSport...</div>;
  if(error || !usuario) return <main className="login-shell"><section className="login-card"><div className="brand">Elite<span>Sport</span></div><div className="error" style={{marginTop:18}}>{error || 'No se pudo cargar el usuario.'}</div><a href="/login" className="btn btn-primary" style={{marginTop:14,width:'100%'}}>Volver al login</a></section></main>;

  return (
    <main className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <a href="/" className="brand">Elite<span>Sport</span></a>
          <div className="user-area">
            <span className="badge">{usuario.rol}</span>
            <strong>{nombre}</strong>
            <button className="btn btn-secondary btn-small" onClick={salir}>Cerrar sesión</button>
          </div>
        </div>
      </header>
      <div className="container">
        <section className="hero" style={{paddingBottom:20}}>
          <div className="hero-grid">
            <div><div className="eyebrow">Panel de control</div><h1>Bienvenido a EliteSport.</h1><p>Tu experiencia y acciones dependen del rol autenticado.</p></div>
            <div className="hero-panel"><div className="eyebrow">Sesión</div><h2>{usuario.rol}</h2><p>{usuario.correo}</p><span className="badge badge-success">Autenticado con JWT</span></div>
          </div>
        </section>
        {dashboard && <Stats estadisticas={dashboard.estadisticas} />}
        {usuario.rol==='Administrador' && <AdminPanel refreshDashboard={cargarDashboard} />}
        {usuario.rol==='Entrenador' && <TrainerPanel usuario={usuario} refreshDashboard={cargarDashboard} />}
        {usuario.rol==='Deportista' && <AthletePanel usuario={usuario} />}
        <footer className="footer">EliteSport · Proyecto Final de Programación 5</footer>
      </div>
    </main>
  );
}

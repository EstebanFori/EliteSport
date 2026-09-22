const pool = require('../config/database');

const idEntrenadorPorUsuario = async (idUsuario) => {
  const r = await pool.query('SELECT id_entrenador FROM elitesport.entrenadores WHERE id_usuario=$1 AND estado=TRUE', [idUsuario]);
  return r.rows[0]?.id_entrenador || null;
};

const idDeportistaPorUsuario = async (idUsuario) => {
  const r = await pool.query('SELECT id_deportista FROM elitesport.deportistas WHERE id_usuario=$1 AND estado=TRUE', [idUsuario]);
  return r.rows[0]?.id_deportista || null;
};

const listarEntrenamientos = async (usuario) => {
  let result;

  if (usuario.rol === 'Deportista') {
    const idDeportista = await idDeportistaPorUsuario(usuario.id_usuario);
    if (!idDeportista) return [];
    result = await pool.query(`
      SELECT DISTINCT
        en.id_entrenamiento, en.fecha, en.descripcion,
        e.id_equipo, e.nombre AS equipo,
        i.nombre AS instalacion,
        h.dia_semana, h.hora_inicio, h.hora_fin,
        CONCAT(ent.nombre, ' ', ent.apellido) AS entrenador,
        COALESCE(a.estado, 'Pendiente') AS asistencia
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipos e ON e.id_equipo=en.id_equipo
      INNER JOIN elitesport.instalaciones i ON i.id_instalacion=en.id_instalacion
      INNER JOIN elitesport.horarios h ON h.id_horario=en.id_horario
      INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador=en.id_entrenador
      INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo=en.id_equipo AND ed.estado=TRUE
      LEFT JOIN elitesport.asistencias a ON a.id_entrenamiento=en.id_entrenamiento AND a.id_deportista=$1
      WHERE ed.id_deportista=$1
      ORDER BY en.fecha, h.hora_inicio;
    `, [idDeportista]);
  } else if (usuario.rol === 'Entrenador') {
    const idEntrenador = await idEntrenadorPorUsuario(usuario.id_usuario);
    if (!idEntrenador) return [];
    result = await pool.query(`
      SELECT
        en.id_entrenamiento, en.fecha, en.descripcion,
        e.id_equipo, e.nombre AS equipo,
        i.nombre AS instalacion,
        h.dia_semana, h.hora_inicio, h.hora_fin,
        CONCAT(ent.nombre, ' ', ent.apellido) AS entrenador
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipos e ON e.id_equipo=en.id_equipo
      INNER JOIN elitesport.instalaciones i ON i.id_instalacion=en.id_instalacion
      INNER JOIN elitesport.horarios h ON h.id_horario=en.id_horario
      INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador=en.id_entrenador
      WHERE en.id_entrenador=$1
      ORDER BY en.fecha, h.hora_inicio;
    `, [idEntrenador]);
  } else {
    result = await pool.query(`
      SELECT
        en.id_entrenamiento, en.fecha, en.descripcion,
        e.id_equipo, e.nombre AS equipo,
        i.nombre AS instalacion,
        h.dia_semana, h.hora_inicio, h.hora_fin,
        CONCAT(ent.nombre, ' ', ent.apellido) AS entrenador
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipos e ON e.id_equipo=en.id_equipo
      INNER JOIN elitesport.instalaciones i ON i.id_instalacion=en.id_instalacion
      INNER JOIN elitesport.horarios h ON h.id_horario=en.id_horario
      INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador=en.id_entrenador
      ORDER BY en.fecha, h.hora_inicio;
    `);
  }

  return result.rows;
};

const obtenerRecursosEntrenamiento = async (usuario) => {
  const [equipos, entrenadores, instalaciones, horarios] = await Promise.all([
    pool.query('SELECT id_equipo, nombre FROM elitesport.equipos WHERE estado=TRUE ORDER BY nombre'),
    pool.query("SELECT id_entrenador, CONCAT(nombre, ' ', apellido) AS nombre FROM elitesport.entrenadores WHERE estado=TRUE ORDER BY apellido,nombre"),
    pool.query('SELECT id_instalacion, nombre FROM elitesport.instalaciones WHERE estado=TRUE ORDER BY nombre'),
    pool.query('SELECT id_horario, dia_semana, hora_inicio, hora_fin FROM elitesport.horarios ORDER BY id_horario'),
  ]);

  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await idEntrenadorPorUsuario(usuario.id_usuario);
    const [misEquipos] = await Promise.all([
      pool.query(`SELECT e.id_equipo, e.nombre FROM elitesport.equipos e INNER JOIN elitesport.entrenador_equipo ee ON ee.id_equipo=e.id_equipo WHERE ee.id_entrenador=$1 AND ee.estado=TRUE AND e.estado=TRUE ORDER BY e.nombre`, [idEntrenador]),
    ]);
    return { equipos: misEquipos.rows, entrenadores: entrenadores.rows, instalaciones: instalaciones.rows, horarios: horarios.rows };
  }

  return { equipos: equipos.rows, entrenadores: entrenadores.rows, instalaciones: instalaciones.rows, horarios: horarios.rows };
};

const crearEntrenamiento = async ({ id_equipo, id_entrenador, id_instalacion, id_horario, fecha, descripcion }, usuario) => {
  let entrenador = Number(id_entrenador);

  if (usuario.rol === 'Entrenador') {
    const ownCoach = await idEntrenadorPorUsuario(usuario.id_usuario);
    if (!ownCoach || ownCoach !== entrenador) throw Object.assign(new Error('Un entrenador solo puede crear entrenamientos para sí mismo'), { code: 'FORBIDDEN_TRAINER' });

    const allowedTeam = await pool.query(`SELECT 1 FROM elitesport.entrenador_equipo WHERE id_entrenador=$1 AND id_equipo=$2 AND estado=TRUE`, [ownCoach, id_equipo]);
    if (!allowedTeam.rows[0]) throw Object.assign(new Error('No puedes programar entrenamiento para ese equipo'), { code: 'FORBIDDEN_TEAM' });
  }

  const result = await pool.query(`
    INSERT INTO elitesport.entrenamientos (id_equipo,id_entrenador,id_instalacion,id_horario,fecha,descripcion)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id_entrenamiento,id_equipo,id_entrenador,id_instalacion,id_horario,fecha,descripcion;
  `, [id_equipo, entrenador, id_instalacion, id_horario, fecha, descripcion || null]);
  return result.rows[0];
};

const obtenerAsistencia = async (idEntrenamiento, usuario) => {
  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await idEntrenadorPorUsuario(usuario.id_usuario);
    const allowed = await pool.query('SELECT 1 FROM elitesport.entrenamientos WHERE id_entrenamiento=$1 AND id_entrenador=$2', [idEntrenamiento, idEntrenador]);
    if (!allowed.rows[0]) return null;
  }

  const r = await pool.query(`
    SELECT a.id_asistencia, a.id_entrenamiento, a.id_deportista, a.estado, a.observacion,
           d.nombre, d.apellido, d.documento
    FROM elitesport.asistencias a
    INNER JOIN elitesport.deportistas d ON d.id_deportista=a.id_deportista
    WHERE a.id_entrenamiento=$1
    ORDER BY d.apellido, d.nombre;
  `, [idEntrenamiento]);
  return r.rows;
};

const registrarAsistencia = async (idEntrenamiento, idDeportista, estado, observacion, usuario) => {
  if (!['Presente','Ausente','Justificado'].includes(estado)) throw Object.assign(new Error('Estado de asistencia inválido'), { code: 'BAD_ATTENDANCE' });

  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await idEntrenadorPorUsuario(usuario.id_usuario);
    const allowed = await pool.query(`
      SELECT 1
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo=en.id_equipo AND ed.estado=TRUE
      WHERE en.id_entrenamiento=$1 AND en.id_entrenador=$2 AND ed.id_deportista=$3;
    `, [idEntrenamiento, idEntrenador, idDeportista]);
    if (!allowed.rows[0]) throw Object.assign(new Error('No puedes registrar esta asistencia'), { code: 'FORBIDDEN_ATTENDANCE' });
  }

  const r = await pool.query(`
    INSERT INTO elitesport.asistencias (id_entrenamiento,id_deportista,estado,observacion)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id_entrenamiento,id_deportista)
    DO UPDATE SET estado=EXCLUDED.estado, observacion=EXCLUDED.observacion
    RETURNING id_asistencia,id_entrenamiento,id_deportista,estado,observacion;
  `, [idEntrenamiento,idDeportista,estado,observacion || null]);
  return r.rows[0];
};

const obtenerDeportistasDeEntrenamiento = async (idEntrenamiento, usuario) => {
  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await idEntrenadorPorUsuario(usuario.id_usuario);
    const allowed = await pool.query('SELECT 1 FROM elitesport.entrenamientos WHERE id_entrenamiento=$1 AND id_entrenador=$2', [idEntrenamiento,idEntrenador]);
    if (!allowed.rows[0]) return null;
  }
  const r = await pool.query(`
    SELECT d.id_deportista, d.nombre, d.apellido, d.documento
    FROM elitesport.entrenamientos en
    INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo=en.id_equipo AND ed.estado=TRUE
    INNER JOIN elitesport.deportistas d ON d.id_deportista=ed.id_deportista
    WHERE en.id_entrenamiento=$1
    ORDER BY d.apellido,d.nombre;
  `, [idEntrenamiento]);
  return r.rows;
};

module.exports = {
  listarEntrenamientos,
  obtenerRecursosEntrenamiento,
  crearEntrenamiento,
  obtenerAsistencia,
  registrarAsistencia,
  obtenerDeportistasDeEntrenamiento,
};

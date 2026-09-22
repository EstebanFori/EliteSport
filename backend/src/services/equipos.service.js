const pool = require('../config/database');

const obtenerIdEntrenador = async (idUsuario) => {
  const r = await pool.query('SELECT id_entrenador FROM elitesport.entrenadores WHERE id_usuario=$1', [idUsuario]);
  return r.rows[0]?.id_entrenador || null;
};

const obtenerEquipos = async (usuario) => {
  if (usuario.rol === 'Administrador') {
    const r = await pool.query(`
      SELECT e.id_equipo, e.nombre, e.estado, c.nombre AS categoria, d.nombre AS deporte,
             COUNT(DISTINCT ed.id_deportista)::int AS deportistas
      FROM elitesport.equipos e
      INNER JOIN elitesport.categorias c ON c.id_categoria=e.id_categoria
      INNER JOIN elitesport.deportes d ON d.id_deporte=c.id_deporte
      LEFT JOIN elitesport.equipo_deportista ed ON ed.id_equipo=e.id_equipo AND ed.estado=TRUE
      GROUP BY e.id_equipo, c.nombre, d.nombre
      ORDER BY e.id_equipo;
    `);
    return r.rows;
  }

  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await obtenerIdEntrenador(usuario.id_usuario);
    if (!idEntrenador) return [];
    const r = await pool.query(`
      SELECT DISTINCT e.id_equipo, e.nombre, e.estado, c.nombre AS categoria, d.nombre AS deporte,
             COUNT(DISTINCT ed.id_deportista)::int AS deportistas
      FROM elitesport.equipos e
      INNER JOIN elitesport.categorias c ON c.id_categoria=e.id_categoria
      INNER JOIN elitesport.deportes d ON d.id_deporte=c.id_deporte
      INNER JOIN elitesport.entrenador_equipo ee ON ee.id_equipo=e.id_equipo AND ee.estado=TRUE
      LEFT JOIN elitesport.equipo_deportista ed ON ed.id_equipo=e.id_equipo AND ed.estado=TRUE
      WHERE ee.id_entrenador=$1
      GROUP BY e.id_equipo, c.nombre, d.nombre
      ORDER BY e.id_equipo;
    `, [idEntrenador]);
    return r.rows;
  }

  const r = await pool.query(`
    SELECT DISTINCT e.id_equipo, e.nombre, e.estado, c.nombre AS categoria, d.nombre AS deporte,
           ed.fecha_ingreso
    FROM elitesport.equipos e
    INNER JOIN elitesport.categorias c ON c.id_categoria=e.id_categoria
    INNER JOIN elitesport.deportes d ON d.id_deporte=c.id_deporte
    INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo=e.id_equipo AND ed.estado=TRUE
    INNER JOIN elitesport.deportistas dp ON dp.id_deportista=ed.id_deportista
    WHERE dp.id_usuario=$1
    ORDER BY e.id_equipo;
  `, [usuario.id_usuario]);
  return r.rows;
};

const obtenerCategorias = async () => {
  const r = await pool.query(`
    SELECT c.id_categoria, c.nombre, c.edad_minima, c.edad_maxima, d.nombre AS deporte
    FROM elitesport.categorias c
    INNER JOIN elitesport.deportes d ON d.id_deporte=c.id_deporte
    ORDER BY d.nombre, c.nombre;
  `);
  return r.rows;
};

const obtenerRoster = async (idEquipo, usuario) => {
  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await obtenerIdEntrenador(usuario.id_usuario);
    const permitted = await pool.query(`SELECT 1 FROM elitesport.entrenador_equipo WHERE id_entrenador=$1 AND id_equipo=$2 AND estado=TRUE`, [idEntrenador, idEquipo]);
    if (!permitted.rows[0]) return null;
  }

  const r = await pool.query(`
    SELECT d.id_deportista, d.nombre, d.apellido, d.documento, d.telefono, ed.fecha_ingreso
    FROM elitesport.equipo_deportista ed
    INNER JOIN elitesport.deportistas d ON d.id_deportista=ed.id_deportista
    WHERE ed.id_equipo=$1 AND ed.estado=TRUE
    ORDER BY d.apellido, d.nombre;
  `, [idEquipo]);
  return r.rows;
};

const crearEquipo = async ({ id_categoria, nombre, usuario }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const team = await client.query(`
      INSERT INTO elitesport.equipos (id_categoria,nombre,estado)
      VALUES ($1,$2,TRUE)
      RETURNING id_equipo, id_categoria, nombre, fecha_creacion, estado;
    `, [id_categoria, nombre]);

    if (usuario.rol === 'Entrenador') {
      const coach = await client.query('SELECT id_entrenador FROM elitesport.entrenadores WHERE id_usuario=$1', [usuario.id_usuario]);
      if (!coach.rows[0]) throw Object.assign(new Error('El usuario no tiene perfil de entrenador'), { code: 'PROFILE_MISSING' });
      await client.query(`
        INSERT INTO elitesport.entrenador_equipo (id_entrenador,id_equipo,estado)
        VALUES ($1,$2,TRUE)
        ON CONFLICT (id_entrenador,id_equipo,fecha_asignacion) DO NOTHING;
      `, [coach.rows[0].id_entrenador, team.rows[0].id_equipo]);
    }

    await client.query('COMMIT');
    return team.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const asignarDeportista = async (idEquipo, idDeportista, usuario) => {
  if (usuario.rol === 'Entrenador') {
    const idEntrenador = await obtenerIdEntrenador(usuario.id_usuario);
    const allowed = await pool.query(`SELECT 1 FROM elitesport.entrenador_equipo WHERE id_entrenador=$1 AND id_equipo=$2 AND estado=TRUE`, [idEntrenador, idEquipo]);
    if (!allowed.rows[0]) throw Object.assign(new Error('No puedes modificar ese equipo'), { code: 'FORBIDDEN_ASSIGN' });
  }
  const r = await pool.query(`
    INSERT INTO elitesport.equipo_deportista (id_equipo,id_deportista,estado)
    VALUES ($1,$2,TRUE)
    ON CONFLICT (id_equipo,id_deportista,fecha_ingreso) DO UPDATE SET estado=TRUE
    RETURNING id_equipo_deportista, id_equipo, id_deportista, fecha_ingreso, estado;
  `, [idEquipo, idDeportista]);
  return r.rows[0];
};

module.exports = { obtenerEquipos, obtenerCategorias, obtenerRoster, crearEquipo, asignarDeportista };

const pool = require('../config/database');

const listarTorneos = async () => {
  const r = await pool.query(`
    SELECT id_torneo, nombre, descripcion, fecha_inicio, fecha_fin, estado
    FROM elitesport.torneos
    ORDER BY fecha_inicio DESC, id_torneo DESC;
  `);
  return r.rows;
};

const crearTorneo = async ({ nombre, descripcion, fecha_inicio, fecha_fin, estado }) => {
  const r = await pool.query(`
    INSERT INTO elitesport.torneos (nombre,descripcion,fecha_inicio,fecha_fin,estado)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id_torneo,nombre,descripcion,fecha_inicio,fecha_fin,estado;
  `, [nombre,descripcion || null,fecha_inicio,fecha_fin,estado || 'Planificado']);
  return r.rows[0];
};

const actualizarTorneo = async (id, datos) => {
  const r = await pool.query(`
    UPDATE elitesport.torneos
    SET nombre=$1, descripcion=$2, fecha_inicio=$3, fecha_fin=$4, estado=$5
    WHERE id_torneo=$6
    RETURNING id_torneo,nombre,descripcion,fecha_inicio,fecha_fin,estado;
  `, [datos.nombre,datos.descripcion || null,datos.fecha_inicio,datos.fecha_fin,datos.estado,id]);
  return r.rows[0];
};

const eliminarTorneo = async (id) => {
  const r = await pool.query('DELETE FROM elitesport.torneos WHERE id_torneo=$1 RETURNING id_torneo,nombre', [id]);
  return r.rows[0];
};

const listarPartidos = async (idTorneo = null) => {
  const params = [];
  let filter = '';
  if (idTorneo) { params.push(idTorneo); filter = 'WHERE p.id_torneo=$1'; }
  const r = await pool.query(`
    SELECT p.id_partido,p.id_torneo,p.fecha,p.hora,p.estado,
           el.nombre AS equipo_local, ev.nombre AS equipo_visitante,
           i.nombre AS instalacion,
           r.puntos_local,r.puntos_visitante
    FROM elitesport.partidos p
    INNER JOIN elitesport.equipos el ON el.id_equipo=p.equipo_local
    INNER JOIN elitesport.equipos ev ON ev.id_equipo=p.equipo_visitante
    INNER JOIN elitesport.instalaciones i ON i.id_instalacion=p.id_instalacion
    LEFT JOIN elitesport.resultados r ON r.id_partido=p.id_partido
    ${filter}
    ORDER BY p.fecha,p.hora,p.id_partido;
  `, params);
  return r.rows;
};

module.exports = { listarTorneos, crearTorneo, actualizarTorneo, eliminarTorneo, listarPartidos };

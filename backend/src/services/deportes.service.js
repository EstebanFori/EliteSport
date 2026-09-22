const pool = require('../config/database');

const obtenerDeportes = async () => {
  const result = await pool.query(`
    SELECT id_deporte, nombre, descripcion, estado
    FROM elitesport.deportes
    ORDER BY id_deporte;
  `);
  return result.rows;
};

const obtenerDeportePorId = async (id) => {
  const result = await pool.query(`
    SELECT id_deporte, nombre, descripcion, estado
    FROM elitesport.deportes
    WHERE id_deporte = $1;
  `, [id]);
  return result.rows[0];
};

const crearDeporte = async (nombre, descripcion, estado = true) => {
  const result = await pool.query(`
    INSERT INTO elitesport.deportes (nombre, descripcion, estado)
    VALUES ($1, $2, $3)
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [nombre, descripcion, estado]);
  return result.rows[0];
};

const actualizarDeporte = async (id, nombre, descripcion, estado) => {
  const result = await pool.query(`
    UPDATE elitesport.deportes
    SET nombre = $1, descripcion = $2, estado = $3
    WHERE id_deporte = $4
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [nombre, descripcion, estado, id]);
  return result.rows[0];
};

const eliminarDeporte = async (id) => {
  const result = await pool.query(`
    DELETE FROM elitesport.deportes
    WHERE id_deporte = $1
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerDeportes,
  obtenerDeportePorId,
  crearDeporte,
  actualizarDeporte,
  eliminarDeporte,
};

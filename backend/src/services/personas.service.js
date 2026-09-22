const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getRoleId = async (client, roleName) => {
  const r = await client.query('SELECT id_rol FROM elitesport.roles WHERE nombre=$1', [roleName]);
  if (!r.rows[0]) throw new Error(`No existe el rol ${roleName}`);
  return r.rows[0].id_rol;
};

const listarDeportistas = async () => {
  const r = await pool.query(`
    SELECT d.id_deportista, d.id_usuario, d.nombre, d.apellido, d.fecha_nacimiento,
           d.documento, d.telefono, d.direccion, d.estado,
           u.nombre_usuario, u.correo
    FROM elitesport.deportistas d
    INNER JOIN elitesport.usuarios u ON u.id_usuario = d.id_usuario
    ORDER BY d.id_deportista;
  `);
  return r.rows;
};

const listarEntrenadores = async () => {
  const r = await pool.query(`
    SELECT e.id_entrenador, e.id_usuario, e.nombre, e.apellido,
           e.documento, e.telefono, e.especialidad,
           e.fecha_contratacion, e.estado,
           u.nombre_usuario, u.correo
    FROM elitesport.entrenadores e
    INNER JOIN elitesport.usuarios u ON u.id_usuario = e.id_usuario
    ORDER BY e.id_entrenador;
  `);
  return r.rows;
};

const crearPersonaUsuario = async ({
  tipo, nombre, apellido, documento, telefono, correo, nombre_usuario,
  contrasena, fecha_nacimiento, direccion, especialidad, fecha_contratacion,
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rolNombre = tipo === 'deportista' ? 'Deportista' : 'Entrenador';
    const roleId = await getRoleId(client, rolNombre);
    const hash = await bcrypt.hash(contrasena, 10);

    const userResult = await client.query(`
      INSERT INTO elitesport.usuarios (id_rol, nombre_usuario, correo, contrasena, estado)
      VALUES ($1,$2,$3,$4,TRUE)
      RETURNING id_usuario, nombre_usuario, correo, estado;
    `, [roleId, nombre_usuario, correo, hash]);

    const idUsuario = userResult.rows[0].id_usuario;
    let persona;

    if (tipo === 'deportista') {
      const r = await client.query(`
        INSERT INTO elitesport.deportistas
          (id_usuario,nombre,apellido,fecha_nacimiento,documento,telefono,direccion,estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
        RETURNING id_deportista, id_usuario, nombre, apellido, fecha_nacimiento, documento, telefono, direccion, estado;
      `, [idUsuario, nombre, apellido, fecha_nacimiento, documento, telefono || null, direccion || null]);
      persona = r.rows[0];
    } else {
      const r = await client.query(`
        INSERT INTO elitesport.entrenadores
          (id_usuario,nombre,apellido,documento,telefono,especialidad,fecha_contratacion,estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
        RETURNING id_entrenador, id_usuario, nombre, apellido, documento, telefono, especialidad, fecha_contratacion, estado;
      `, [idUsuario, nombre, apellido, documento, telefono || null, especialidad || null, fecha_contratacion]);
      persona = r.rows[0];
    }

    await client.query('COMMIT');
    return { ...persona, nombre_usuario: userResult.rows[0].nombre_usuario, correo: userResult.rows[0].correo };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const actualizarEstadoPersona = async (tipo, id, estado) => {
  const tabla = tipo === 'deportista' ? 'deportistas' : 'entrenadores';
  const campo = tipo === 'deportista' ? 'id_deportista' : 'id_entrenador';
  const r = await pool.query(
    `UPDATE elitesport.${tabla} SET estado=$1 WHERE ${campo}=$2 RETURNING ${campo} AS id, estado;`,
    [estado, id]
  );
  return r.rows[0];
};

module.exports = { listarDeportistas, listarEntrenadores, crearPersonaUsuario, actualizarEstadoPersona };

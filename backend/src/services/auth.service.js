const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const obtenerUsuarioPorLogin = async (login) => {
  const result = await pool.query(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.correo,
      u.contrasena,
      u.estado,
      r.id_rol,
      r.nombre AS rol
    FROM elitesport.usuarios u
    INNER JOIN elitesport.roles r ON r.id_rol = u.id_rol
    WHERE LOWER(u.nombre_usuario) = LOWER($1)
       OR LOWER(u.correo) = LOWER($1);
  `, [login]);

  return result.rows[0];
};

const obtenerPerfil = async (idUsuario) => {
  const result = await pool.query(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.correo,
      u.estado,
      r.id_rol,
      r.nombre AS rol,
      COALESCE(d.id_deportista, NULL) AS id_deportista,
      d.nombre AS nombre_deportista,
      d.apellido AS apellido_deportista,
      d.documento AS documento_deportista,
      d.telefono AS telefono_deportista,
      COALESCE(e.id_entrenador, NULL) AS id_entrenador,
      e.nombre AS nombre_entrenador,
      e.apellido AS apellido_entrenador,
      e.documento AS documento_entrenador,
      e.telefono AS telefono_entrenador,
      e.especialidad
    FROM elitesport.usuarios u
    INNER JOIN elitesport.roles r ON r.id_rol = u.id_rol
    LEFT JOIN elitesport.deportistas d ON d.id_usuario = u.id_usuario
    LEFT JOIN elitesport.entrenadores e ON e.id_usuario = u.id_usuario
    WHERE u.id_usuario = $1;
  `, [idUsuario]);

  return result.rows[0];
};

const iniciarSesion = async (login, contrasena) => {
  const usuario = await obtenerUsuarioPorLogin(login);

  if (!usuario || !usuario.estado) {
    return null;
  }

  const valida = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!valida) {
    return null;
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
};

module.exports = { iniciarSesion, obtenerPerfil };

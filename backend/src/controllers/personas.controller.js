const {
  listarDeportistas,
  listarEntrenadores,
  crearPersonaUsuario,
  actualizarEstadoPersona,
} = require('../services/personas.service');

const listarDeportistasController = async (req, res) => {
  try { res.json(await listarDeportistas()); }
  catch (error) { console.error('Error deportistas:', error); res.status(500).json({ mensaje: 'Error al obtener deportistas' }); }
};

const listarEntrenadoresController = async (req, res) => {
  try { res.json(await listarEntrenadores()); }
  catch (error) { console.error('Error entrenadores:', error); res.status(500).json({ mensaje: 'Error al obtener entrenadores' }); }
};

const crearDeportista = async (req, res) => {
  try {
    const { nombre, apellido, documento, telefono, correo, nombre_usuario, contrasena, fecha_nacimiento, direccion } = req.body;
    if (!nombre?.trim() || !apellido?.trim() || !documento?.trim() || !correo?.trim() || !nombre_usuario?.trim() || !contrasena || !fecha_nacimiento) {
      return res.status(400).json({ mensaje: 'Nombre, apellido, documento, correo, usuario, contraseña y fecha de nacimiento son obligatorios' });
    }
    const persona = await crearPersonaUsuario({ tipo: 'deportista', nombre: nombre.trim(), apellido: apellido.trim(), documento: documento.trim(), telefono, correo: correo.trim(), nombre_usuario: nombre_usuario.trim(), contrasena, fecha_nacimiento, direccion });
    res.status(201).json(persona);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Usuario, correo o documento ya existe' });
    console.error('Error crear deportista:', error);
    res.status(500).json({ mensaje: 'Error al crear deportista' });
  }
};

const crearEntrenador = async (req, res) => {
  try {
    const { nombre, apellido, documento, telefono, especialidad, fecha_contratacion, correo, nombre_usuario, contrasena } = req.body;
    if (!nombre?.trim() || !apellido?.trim() || !documento?.trim() || !correo?.trim() || !nombre_usuario?.trim() || !contrasena || !fecha_contratacion) {
      return res.status(400).json({ mensaje: 'Nombre, apellido, documento, correo, usuario, contraseña y fecha de contratación son obligatorios' });
    }
    const persona = await crearPersonaUsuario({ tipo: 'entrenador', nombre: nombre.trim(), apellido: apellido.trim(), documento: documento.trim(), telefono, especialidad, fecha_contratacion, correo: correo.trim(), nombre_usuario: nombre_usuario.trim(), contrasena });
    res.status(201).json(persona);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Usuario, correo o documento ya existe' });
    console.error('Error crear entrenador:', error);
    res.status(500).json({ mensaje: 'Error al crear entrenador' });
  }
};

const cambiarEstadoDeportista = async (req, res) => {
  try {
    const result = await actualizarEstadoPersona('deportista', req.params.id, Boolean(req.body.estado));
    if (!result) return res.status(404).json({ mensaje: 'Deportista no encontrado' });
    res.json(result);
  } catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al cambiar estado' }); }
};

const cambiarEstadoEntrenador = async (req, res) => {
  try {
    const result = await actualizarEstadoPersona('entrenador', req.params.id, Boolean(req.body.estado));
    if (!result) return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    res.json(result);
  } catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al cambiar estado' }); }
};

module.exports = {
  listarDeportistas: listarDeportistasController,
  listarEntrenadores: listarEntrenadoresController,
  crearDeportista,
  crearEntrenador,
  cambiarEstadoDeportista,
  cambiarEstadoEntrenador,
};

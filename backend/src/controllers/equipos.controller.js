const {
  obtenerEquipos,
  crearEquipo,
  obtenerCategorias,
  obtenerRoster,
  asignarDeportista,
} = require('../services/equipos.service');

const listar = async (req, res) => {
  try { res.json(await obtenerEquipos(req.usuario)); }
  catch (error) { console.error('Error equipos:', error); res.status(500).json({ mensaje: 'Error al obtener equipos' }); }
};

const categorias = async (req, res) => {
  try { res.json(await obtenerCategorias()); }
  catch (error) { console.error('Error categorías:', error); res.status(500).json({ mensaje: 'Error al obtener categorías' }); }
};

const crear = async (req, res) => {
  try {
    const { id_categoria, nombre } = req.body;
    if (!id_categoria || !nombre?.trim()) return res.status(400).json({ mensaje: 'Categoría y nombre son obligatorios' });
    res.status(201).json(await crearEquipo({ id_categoria: Number(id_categoria), nombre: nombre.trim(), usuario: req.usuario }));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Ya existe un equipo con ese nombre dentro de la categoría' });
    if (error.code === 'PROFILE_MISSING') return res.status(400).json({ mensaje: error.message });
    console.error('Error crear equipo:', error);
    res.status(500).json({ mensaje: 'Error al crear equipo' });
  }
};

const roster = async (req, res) => {
  try {
    const result = await obtenerRoster(Number(req.params.id), req.usuario);
    if (result === null) return res.status(403).json({ mensaje: 'No tienes acceso a ese equipo' });
    res.json(result);
  } catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener integrantes' }); }
};

const asignar = async (req, res) => {
  try {
    const { id_deportista } = req.body;
    if (!id_deportista) return res.status(400).json({ mensaje: 'El deportista es obligatorio' });
    res.status(201).json(await asignarDeportista(Number(req.params.id), Number(id_deportista), req.usuario));
  } catch (error) {
    if (error.code === 'FORBIDDEN_ASSIGN') return res.status(403).json({ mensaje: error.message });
    if (error.code === '23505') return res.status(409).json({ mensaje: 'El deportista ya está asignado al equipo' });
    console.error(error); res.status(500).json({ mensaje: 'Error al asignar deportista' });
  }
};

module.exports = { listar, categorias, crear, roster, asignar };

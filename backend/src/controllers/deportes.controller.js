const {
  obtenerDeportes,
  obtenerDeportePorId,
  crearDeporte,
  actualizarDeporte,
  eliminarDeporte,
} = require('../services/deportes.service');

const listarDeportes = async (req, res) => {
  try {
    res.json(await obtenerDeportes());
  } catch (error) {
    console.error('Error al listar deportes:', error);
    res.status(500).json({ mensaje: 'Error al obtener los deportes' });
  }
};

const buscarDeportePorId = async (req, res) => {
  try {
    const deporte = await obtenerDeportePorId(req.params.id);
    if (!deporte) return res.status(404).json({ mensaje: 'Deporte no encontrado' });
    res.json(deporte);
  } catch (error) {
    console.error('Error al buscar deporte:', error);
    res.status(500).json({ mensaje: 'Error al obtener el deporte' });
  }
};

const registrarDeporte = async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'El nombre del deporte es obligatorio' });
    res.status(201).json(await crearDeporte(nombre.trim(), descripcion?.trim() || null, estado ?? true));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Ya existe un deporte con ese nombre' });
    console.error('Error al crear deporte:', error);
    res.status(500).json({ mensaje: 'Error al crear el deporte' });
  }
};

const editarDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'El nombre del deporte es obligatorio' });
    const deporte = await actualizarDeporte(id, nombre.trim(), descripcion?.trim() || null, estado ?? true);
    if (!deporte) return res.status(404).json({ mensaje: 'Deporte no encontrado' });
    res.json(deporte);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Ya existe un deporte con ese nombre' });
    console.error('Error al actualizar deporte:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el deporte' });
  }
};

const borrarDeporte = async (req, res) => {
  try {
    const deporte = await eliminarDeporte(req.params.id);
    if (!deporte) return res.status(404).json({ mensaje: 'Deporte no encontrado' });
    res.json({ mensaje: 'Deporte eliminado correctamente', deporte });
  } catch (error) {
    if (error.code === '23503') return res.status(409).json({ mensaje: 'No se puede eliminar el deporte porque tiene registros relacionados' });
    console.error('Error al eliminar deporte:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el deporte' });
  }
};

module.exports = { listarDeportes, buscarDeportePorId, registrarDeporte, editarDeporte, borrarDeporte };

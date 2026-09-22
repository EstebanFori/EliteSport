const { listarTorneos, crearTorneo, actualizarTorneo, eliminarTorneo, listarPartidos } = require('../services/torneos.service');

const listar = async (req,res) => {
  try { res.json(await listarTorneos()); }
  catch(e) { console.error(e); res.status(500).json({ mensaje:'Error al obtener torneos' }); }
};

const crear = async (req,res) => {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
    if (!nombre?.trim() || !fecha_inicio || !fecha_fin) return res.status(400).json({ mensaje:'Nombre, fecha de inicio y fecha de fin son obligatorios' });
    if (fecha_fin < fecha_inicio) return res.status(400).json({ mensaje:'La fecha de fin no puede ser anterior a la fecha de inicio' });
    res.status(201).json(await crearTorneo({ nombre:nombre.trim(),descripcion,fecha_inicio,fecha_fin,estado }));
  } catch(e) { console.error(e); res.status(500).json({ mensaje:'Error al crear torneo' }); }
};

const editar = async (req,res) => {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
    if (!nombre?.trim() || !fecha_inicio || !fecha_fin) return res.status(400).json({ mensaje:'Nombre y fechas son obligatorios' });
    if (fecha_fin < fecha_inicio) return res.status(400).json({ mensaje:'La fecha de fin no puede ser anterior a la fecha de inicio' });
    const result = await actualizarTorneo(req.params.id,{nombre:nombre.trim(),descripcion,fecha_inicio,fecha_fin,estado});
    if (!result) return res.status(404).json({ mensaje:'Torneo no encontrado' });
    res.json(result);
  } catch(e) { console.error(e); res.status(500).json({ mensaje:'Error al actualizar torneo' }); }
};

const borrar = async (req,res) => {
  try {
    const result = await eliminarTorneo(req.params.id);
    if (!result) return res.status(404).json({ mensaje:'Torneo no encontrado' });
    res.json({ mensaje:'Torneo eliminado correctamente', torneo:result });
  } catch(e) {
    if (e.code === '23503') return res.status(409).json({ mensaje:'No se puede eliminar el torneo porque tiene partidos o equipos asociados' });
    console.error(e); res.status(500).json({ mensaje:'Error al eliminar torneo' });
  }
};

const partidos = async (req,res) => {
  try { res.json(await listarPartidos(req.params.id)); }
  catch(e) { console.error(e); res.status(500).json({ mensaje:'Error al obtener partidos' }); }
};

module.exports = { listar, crear, editar, borrar, partidos };

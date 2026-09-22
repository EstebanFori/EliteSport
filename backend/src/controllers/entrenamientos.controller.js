const {
  listarEntrenamientos,
  obtenerRecursosEntrenamiento,
  crearEntrenamiento,
  obtenerAsistencia,
  registrarAsistencia,
  obtenerDeportistasDeEntrenamiento,
} = require('../services/entrenamientos.service');

const listar = async (req,res) => {
  try { res.json(await listarEntrenamientos(req.usuario)); }
  catch (error) { console.error('Error entrenamientos:', error); res.status(500).json({ mensaje:'Error al obtener entrenamientos' }); }
};

const recursos = async (req,res) => {
  try { res.json(await obtenerRecursosEntrenamiento(req.usuario)); }
  catch (error) { console.error('Error recursos:', error); res.status(500).json({ mensaje:'Error al obtener recursos' }); }
};

const crear = async (req,res) => {
  try {
    const { id_equipo,id_entrenador,id_instalacion,id_horario,fecha,descripcion } = req.body;
    if (!id_equipo || !id_entrenador || !id_instalacion || !id_horario || !fecha) return res.status(400).json({ mensaje:'Equipo, entrenador, instalación, horario y fecha son obligatorios' });
    res.status(201).json(await crearEntrenamiento({ id_equipo,id_entrenador,id_instalacion,id_horario,fecha,descripcion }, req.usuario));
  } catch(error) {
    if (error.code === 'FORBIDDEN_TRAINER' || error.code === 'FORBIDDEN_TEAM') return res.status(403).json({ mensaje:error.message });
    if (error.code === '23503') return res.status(400).json({ mensaje:'Alguna referencia de entrenamiento no existe' });
    console.error('Error crear entrenamiento:',error); res.status(500).json({ mensaje:'Error al crear entrenamiento' });
  }
};

const listaAsistencia = async (req,res) => {
  try {
    const result = await obtenerAsistencia(Number(req.params.id),req.usuario);
    if (result === null) return res.status(403).json({ mensaje:'No tienes acceso a ese entrenamiento' });
    res.json(result);
  } catch(error) { console.error(error); res.status(500).json({ mensaje:'Error al obtener asistencia' }); }
};

const deportistas = async (req,res) => {
  try {
    const result = await obtenerDeportistasDeEntrenamiento(Number(req.params.id),req.usuario);
    if (result === null) return res.status(403).json({ mensaje:'No tienes acceso a ese entrenamiento' });
    res.json(result);
  } catch(error) { console.error(error); res.status(500).json({ mensaje:'Error al obtener deportistas' }); }
};

const asistencia = async (req,res) => {
  try {
    const { id_deportista, estado, observacion } = req.body;
    if (!id_deportista || !estado) return res.status(400).json({ mensaje:'Deportista y estado son obligatorios' });
    res.json(await registrarAsistencia(Number(req.params.id),Number(id_deportista),estado,observacion,req.usuario));
  } catch(error) {
    if (error.code === 'BAD_ATTENDANCE' || error.code === 'FORBIDDEN_ATTENDANCE') return res.status(error.code === 'BAD_ATTENDANCE' ? 400 : 403).json({ mensaje:error.message });
    console.error(error); res.status(500).json({ mensaje:'Error al registrar asistencia' });
  }
};

module.exports = { listar, recursos, crear, listaAsistencia, deportistas, asistencia };

const express = require('express');
const {
  listarDeportistas,
  listarEntrenadores,
  crearDeportista,
  crearEntrenador,
  cambiarEstadoDeportista,
  cambiarEstadoEntrenador,
} = require('../controllers/personas.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.use(autenticar, permitirRoles('Administrador'));

router.get('/deportistas', listarDeportistas);
router.post('/deportistas', crearDeportista);
router.patch('/deportistas/:id/estado', cambiarEstadoDeportista);

router.get('/entrenadores', listarEntrenadores);
router.post('/entrenadores', crearEntrenador);
router.patch('/entrenadores/:id/estado', cambiarEstadoEntrenador);

module.exports = router;

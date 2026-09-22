const express = require('express');
const { listar, recursos, crear, listaAsistencia, deportistas, asistencia } = require('../controllers/entrenamientos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.use(autenticar);
router.get('/', permitirRoles('Administrador','Entrenador','Deportista'), listar);
router.get('/recursos', permitirRoles('Administrador','Entrenador'), recursos);
router.post('/', permitirRoles('Administrador','Entrenador'), crear);
router.get('/:id/deportistas', permitirRoles('Administrador','Entrenador'), deportistas);
router.get('/:id/asistencia', permitirRoles('Administrador','Entrenador'), listaAsistencia);
router.put('/:id/asistencia', permitirRoles('Administrador','Entrenador'), asistencia);

module.exports = router;

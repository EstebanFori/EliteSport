const express = require('express');
const { listar, crear, editar, borrar, partidos } = require('../controllers/torneos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.use(autenticar);
router.get('/', permitirRoles('Administrador','Entrenador','Deportista'), listar);
router.get('/:id/partidos', permitirRoles('Administrador','Entrenador','Deportista'), partidos);
router.post('/', permitirRoles('Administrador'), crear);
router.put('/:id', permitirRoles('Administrador'), editar);
router.delete('/:id', permitirRoles('Administrador'), borrar);

module.exports = router;

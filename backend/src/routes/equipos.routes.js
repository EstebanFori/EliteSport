const express = require('express');
const { listar, categorias, crear, roster, asignar } = require('../controllers/equipos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.use(autenticar);
router.get('/', permitirRoles('Administrador', 'Entrenador', 'Deportista'), listar);
router.get('/categorias', permitirRoles('Administrador', 'Entrenador'), categorias);
router.post('/', permitirRoles('Administrador', 'Entrenador'), crear);
router.get('/:id/roster', permitirRoles('Administrador', 'Entrenador'), roster);
router.post('/:id/roster', permitirRoles('Administrador', 'Entrenador'), asignar);

module.exports = router;

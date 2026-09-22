const { obtenerDashboard } = require('../services/dashboard.service');

const dashboard = async (req, res) => {
  try {
    res.json(await obtenerDashboard(req.usuario));
  } catch (error) {
    console.error('Error del dashboard:', error);
    res.status(500).json({ mensaje: 'Error al cargar el dashboard' });
  }
};

module.exports = { dashboard };

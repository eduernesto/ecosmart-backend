const express = require('express');
const router = express.Router();
const {
    getAllTachos,
    getFullTachos,
    getStats,
    receiveMediciones,
    getHistorial
} = require('../controllers/tachosController');

router.get('/tachos', getAllTachos);
router.get('/tachos/llenos', getFullTachos);
router.get('/tachos/stats', getStats);
router.post('/mediciones', receiveMediciones);
router.get('/tachos/:id/historial', getHistorial);

module.exports = router;
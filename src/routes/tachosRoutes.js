import { Router } from 'express'
import {
  getAllTachos,
  getFullTachos,
  getStats,
  receiveMediciones,
  getHistorial
} from '../controllers/tachosController.js'
import hmacAuth from '../middleware/hmacAuth.js'
import validate from '../middleware/validate.js'
import { medicionSchema } from '../validators/mediciones.js'

const router = Router()

router.get('/tachos', getAllTachos)
router.get('/tachos/llenos', getFullTachos)
router.get('/tachos/stats', getStats)
router.post('/mediciones', hmacAuth, validate(medicionSchema), receiveMediciones)
router.get('/tachos/:id/historial', getHistorial)

export default router

import logger from '../config/logger.js'

export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  logger.error({ status, message: err.message, stack: err.stack })
  res.status(status).json({
    ok: false,
    error: err.message || 'Error interno del servidor'
  })
}

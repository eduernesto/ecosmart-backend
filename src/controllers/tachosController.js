import supabase from '../config/supabase.js'
import logger from '../config/logger.js'
import createError from 'http-errors'

const MAX_DIST = 120
const UMBRAL = 24

function calculatePercentage(distancia) {
  return Math.round(Math.max(0, Math.min(100, ((MAX_DIST - distancia) / MAX_DIST) * 100)))
}

function enrichTacho(t) {
  return {
    ...t,
    porcentaje: calculatePercentage(t.distancia_actual),
    esta_lleno: t.distancia_actual !== -1 && t.distancia_actual <= UMBRAL
  }
}

export async function getAllTachos(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('tachos')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw createError(500, error.message)

    res.json((data || []).map(enrichTacho))
  } catch (err) {
    next(err)
  }
}

export async function getFullTachos(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('tachos')
      .select('*')
      .eq('esta_lleno', true)
      .order('id', { ascending: true })

    if (error) throw createError(500, error.message)

    res.json((data || []).map(enrichTacho))
  } catch (err) {
    next(err)
  }
}

export async function getStats(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('tachos')
      .select('esta_lleno')

    if (error) throw createError(500, error.message)

    const total = data?.length || 0
    const llenos = data?.filter(t => t.esta_lleno).length || 0

    res.json({ total, llenos, disponibles: total - llenos })
  } catch (err) {
    next(err)
  }
}

export async function receiveMediciones(req, res, next) {
  try {
    const { lecturas } = req.body

    logger.info({ lecturas }, 'Nuevas lecturas recibidas')

    for (const tacho of lecturas) {
      const estaLleno = tacho.distancia !== -1 && tacho.distancia <= UMBRAL

      const { error: updateError } = await supabase
        .from('tachos')
        .update({
          distancia_actual: tacho.distancia,
          esta_lleno: estaLleno,
          actualizado_en: new Date()
        })
        .eq('id', tacho.tacho_id)

      if (updateError) {
        logger.error({ tachoId: tacho.tacho_id, error: updateError.message }, 'Error actualizando tacho')
      }

      if (tacho.distancia !== -1) {
        await supabase
          .from('historial_mediciones')
          .insert([{
            tacho_id: tacho.tacho_id,
            distancia: tacho.distancia
          }])
      }
    }

    res.json({ message: 'Datos procesados correctamente' })
  } catch (err) {
    next(err)
  }
}

export async function getHistorial(req, res, next) {
  try {
    const { id } = req.params
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('historial_mediciones')
      .select('*', { count: 'exact' })
      .eq('tacho_id', id)
      .order('creado_en', { ascending: false })
      .range(from, to)

    if (error) throw createError(500, error.message)

    res.json({
      data: data || [],
      pagination: { page, limit, total: count }
    })
  } catch (err) {
    next(err)
  }
}

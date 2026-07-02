import { describe, it, expect } from 'vitest'

describe('calculatePercentage', () => {
  const MAX_DIST = 120
  const calculatePercentage = (distancia) =>
    Math.round(Math.max(0, Math.min(100, ((MAX_DIST - distancia) / MAX_DIST) * 100)))

  it('devuelve 100% cuando distancia es 0', () => {
    expect(calculatePercentage(0)).toBe(100)
  })

  it('devuelve 0% cuando distancia es >= 120', () => {
    expect(calculatePercentage(120)).toBe(0)
    expect(calculatePercentage(150)).toBe(0)
  })

  it('devuelve 50% cuando distancia es 60', () => {
    expect(calculatePercentage(60)).toBe(50)
  })

  it('devuelve -1 correctamente', () => {
    expect(calculatePercentage(-1)).toBe(100)
  })
})

describe('validacion de mediciones', () => {
  const { z } = require('zod')
  const schema = z.object({
    lecturas: z.array(z.object({
      tacho_id: z.number().int().min(1).max(5),
      distancia: z.number().int().min(-1).max(120)
    })).min(1).max(5)
  })

  it('rechaza tacho_id invalido', () => {
    const result = schema.safeParse({ lecturas: [{ tacho_id: 0, distancia: 50 }] })
    expect(result.success).toBe(false)
  })

  it('rechaza distancia fuera de rango', () => {
    const result = schema.safeParse({ lecturas: [{ tacho_id: 1, distancia: 200 }] })
    expect(result.success).toBe(false)
  })

  it('acepta payload valido', () => {
    const result = schema.safeParse({
      lecturas: [
        { tacho_id: 1, distancia: 89 },
        { tacho_id: 2, distancia: 45 }
      ]
    })
    expect(result.success).toBe(true)
  })
})

import { z } from 'zod'

export const medicionSchema = z.object({
  lecturas: z.array(z.object({
    tacho_id: z.number().int().min(1).max(5),
    distancia: z.number().int().min(-1).max(120)
  })).min(1).max(5)
})

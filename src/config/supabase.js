import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'
import logger from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  logger.error('Faltan SUPABASE_URL o SUPABASE_KEY en las variables de entorno')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
})

export default supabase

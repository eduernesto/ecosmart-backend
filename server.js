require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws'); // La librería que ya instalaste exitosamente

const app = express();
const port = process.env.PORT || 3000;

// ¡Aquí está el cambio clave! Pasamos el WebSocket a la configuración de "realtime"
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    realtime: {
        transport: WebSocket
    }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡API de EcoSmart Bins funcionando al 100%!');
});

// Ruta principal que recibe los datos
app.post('/api/mediciones', async (req, res) => {
    try {
        const { lecturas } = req.body;

        if (!lecturas || lecturas.length === 0) {
            return res.status(400).json({ error: 'No se recibieron lecturas válidas.' });
        }

        console.log('--- Nuevas lecturas recibidas ---');
        console.log(lecturas);

        // 1. Recorrer el array y actualizar el estado en Supabase
        for (const tacho of lecturas) {
            const estaLleno = tacho.distancia !== -1 && tacho.distancia <= 25;

            // Actualizar la tabla "tachos"
            const { error: updateError } = await supabase
                .from('tachos')
                .update({ 
                    distancia_actual: tacho.distancia,
                    esta_lleno: estaLleno,
                    actualizado_en: new Date()
                })
                .eq('id', tacho.tacho_id);

            if (updateError) console.error(`Error actualizando tacho ${tacho.tacho_id}:`, updateError.message);

            // 2. (Opcional) Guardar en el historial
            if (tacho.distancia !== -1) {
                await supabase
                    .from('historial_mediciones')
                    .insert([{ 
                        tacho_id: tacho.tacho_id, 
                        distancia: tacho.distancia 
                    }]);
            }
        }

        res.status(200).json({ message: 'Datos procesados y guardados correctamente en Supabase.' });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Levantar el servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
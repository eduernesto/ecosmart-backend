const supabase = require('../config/supabase');

const MAX_DIST = 120;
const UMBRAL = 25;

function calculatePercentage(distancia) {
    return Math.round(Math.max(0, Math.min(100, ((MAX_DIST - distancia) / MAX_DIST) * 100)));
}

async function getAllTachos(req, res) {
    try {
        const { data, error } = await supabase
            .from('tachos')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const tachos = (data || []).map(t => ({
            ...t,
            porcentaje: calculatePercentage(t.distancia_actual),
            esta_lleno: t.distancia_actual !== -1 && t.distancia_actual <= UMBRAL
        }));

        res.json(tachos);
    } catch (err) {
        console.error('Error fetching tachos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getFullTachos(req, res) {
    try {
        const { data, error } = await supabase
            .from('tachos')
            .select('*')
            .eq('esta_lleno', true)
            .order('id', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const tachos = (data || []).map(t => ({
            ...t,
            porcentaje: calculatePercentage(t.distancia_actual)
        }));

        res.json(tachos);
    } catch (err) {
        console.error('Error fetching full tachos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getStats(req, res) {
    try {
        const { data, error } = await supabase
            .from('tachos')
            .select('esta_lleno');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const total = data?.length || 0;
        const llenos = data?.filter(t => t.esta_lleno).length || 0;

        res.json({
            total,
            llenos,
            disponibles: total - llenos
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function receiveMediciones(req, res) {
    try {
        const { lecturas } = req.body;

        if (!lecturas || lecturas.length === 0) {
            return res.status(400).json({ error: 'No se recibieron lecturas válidas.' });
        }

        console.log('--- Nuevas lecturas recibidas ---');
        console.log(lecturas);

        for (const tacho of lecturas) {
            const estaLleno = tacho.distancia !== -1 && tacho.distancia <= UMBRAL;

            const { error: updateError } = await supabase
                .from('tachos')
                .update({
                    distancia_actual: tacho.distancia,
                    esta_lleno: estaLleno,
                    actualizado_en: new Date()
                })
                .eq('id', tacho.tacho_id);

            if (updateError) console.error(`Error actualizando tacho ${tacho.tacho_id}:`, updateError.message);

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
}

async function getHistorial(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('historial_mediciones')
            .select('*')
            .eq('tacho_id', id)
            .order('creado_en', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Error fetching historial:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getAllTachos,
    getFullTachos,
    getStats,
    receiveMediciones,
    getHistorial
};
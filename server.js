require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tachosRoutes = require('./src/routes/tachosRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', tachosRoutes);

app.get('/', (req, res) => {
    res.send('¡API de EcoSmart Bins funcionando al 100%!');
});

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
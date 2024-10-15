const express = require('express');

require('dotenv').config();

const app = express();

const instaRoutes = require('./routes/instaRoutes');

const PORT = 3000;

app.use('/api', instaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
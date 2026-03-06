require('dotenv').config();
const express = require('express');
const sql = require('mssql');

const app = express();
const port = 3000;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

app.use(express.static('public'));

// Initialiser le pool au démarrage de l'app
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connecté à SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Échec de connexion à SQL Server', err);
    process.exit(1); // Arrêter l'app si la DB est inaccessible
  });

// Dans la route, utiliser le pool
app.get('/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT @@VERSION AS version');
    res.json({ success: true, version: result.recordset[0].version });
  } catch (err) {
    console.error('Erreur lors de la requête SQL', err);
    res.status(500).json({ success: false, message: 'Erreur de base de données' });
  }
});

app.listen(port, () => {
    console.log(`Backend démarré sur http://localhost:${port}`);
});
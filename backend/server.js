const express = require('express');
const mariadb = require('mariadb');
const config = require('./config.json');

// Configurare conexiune MariaDB
const pool = mariadb.createPool({
    host: config.server,  // adresa serverului MariaDB
    user: config.username,       // utilizatorul bazei de date
    password: config.password, // parola utilizatorului
    database: config.database,   // numele bazei de date
});


const app = express();
const port = 3333;
app.use(express.json());

// Scripturi de creare a tabelelor
const createTablesQueries = [
  `
    CREATE TABLE IF NOT EXISTS Tables (
      table_id INT AUTO_INCREMENT PRIMARY KEY,
      table_name TEXT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Client (
      client_id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(100) NOT NULL,
      table_id INT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Menu (
      menu_id INT AUTO_INCREMENT PRIMARY KEY,
      menu_name VARCHAR(100) NOT NULL,
      menu_description TEXT,
      menu_price DECIMAL(10,2) NOT NULL,
      menu_quantity_available INT NOT NULL DEFAULT 0
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Utensils (
      utensil_id INT AUTO_INCREMENT PRIMARY KEY,
      utensil_name VARCHAR(50) NOT NULL,
      utensil_quantity INT NOT NULL DEFAULT 0
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS CommandOffice (
      command_id INT AUTO_INCREMENT PRIMARY KEY,
      table_id INT,
      client_id INT,
      menu_id INT,
      menu_name TEXT NOT NULL,
      menu_quantity INT NOT NULL,
      utensil_id INT,
      utensil_quantity INT,
      total_price DECIMAL(10,2),
      order_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ClientResponse (
      response_id INT AUTO_INCREMENT PRIMARY KEY,
      menu_id INT,
      menu_name TEXT,
      menu_description TEXT,
      menu_quantity TEXT,
      menu_price TEXT,
      total_price TEXT,
      status TEXT,
      prepare_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
];

// Funcție pentru a verifica și crea tabelele
async function initializeDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    for (const query of createTablesQueries) {
      await conn.query(query);
    }
    console.log('Tabelele au fost verificate și create (dacă nu existau deja).');
  } catch (err) {
    console.error('Eroare la inițializarea bazei de date:', err);
  } finally {
    if (conn) conn.release();
  }
}


// Metodă POST pentru a adăuga o comandă
app.post('/api/v1/add_command', (req, res) => {
    const { table_id, dish_id, quantity } = req.body;

    // Verificarea datelor primite
    if (!table_id || !dish_id || !quantity) {
        return res.status(400).json({ error: 'Toate câmpurile sunt necesare!' });
    }

    // Răspuns de succes
    res.status(201).json({
        message: 'Comanda a fost adăugată cu succes!',
        order: { table_id, dish_id, quantity }
    });
});
// Pornește serverul
app.listen(port, async () => {
  console.log(`Serverul rulează pe http://localhost:${port}`);
  await initializeDatabase();
});

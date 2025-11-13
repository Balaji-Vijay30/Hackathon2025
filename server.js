// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require('path');
const sqlite3 = require('sqlite3').verbose();



const app = express();
const dbFile = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// SQLite DB


// Create tables if not exists
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  did TEXT PRIMARY KEY,
  publicKey TEXT NOT NULL,
  salt TEXT NOT NULL,
  createdAt INTEGER NOT NULL
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  did TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(did) REFERENCES users(did)
)`).run();

// Register DID (store public key + salt)
app.post('/register', (req, res) => {
  try {
    const { did, publicKey, salt } = req.body;
    if (!did || !publicKey || !salt) return res.status(400).send('Missing fields');
    const exists = db.prepare('SELECT did FROM users WHERE did = ?').get(did);
    if (exists) return res.status(400).send('DID already registered');
    db.prepare('INSERT INTO users (did, publicKey, salt, createdAt) VALUES (?, ?, ?, ?)').run(did, publicKey, salt, Date.now());
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

// Return meta for DID (salt & public key)
app.get('/meta/:did', (req, res) => {
  const did = req.params.did;
  const row = db.prepare('SELECT did, publicKey, salt, createdAt FROM users WHERE did = ?').get(did);
  if (!row) return res.status(404).send('DID not found');
  res.json({ did: row.did, publicKey: row.publicKey, salt: row.salt, createdAt: row.createdAt });
});

// Save credential (encrypted blob)
app.post('/credential', (req, res) => {
  try {
    const { did, ciphertext, iv } = req.body;
    if (!did || !ciphertext || !iv) return res.status(400).send('Missing fields');
    // ensure user exists
    const user = db.prepare('SELECT did FROM users WHERE did = ?').get(did);
    if (!user) return res.status(404).send('DID not registered');
    db.prepare('INSERT INTO credentials (did, ciphertext, iv, createdAt) VALUES (?, ?, ?, ?)').run(did, ciphertext, iv, Date.now());
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

// Get credentials for DID
app.get('/credentials/:did', (req, res) => {
  const did = req.params.did;
  const rows = db.prepare('SELECT id, ciphertext, iv, createdAt FROM credentials WHERE did = ? ORDER BY createdAt DESC').all(did);
  res.json(rows);
});

// Simple health route
app.get('/', (req, res) => res.send('SSI Vault Backend running'));

const port = 4000;
app.listen(port, () => console.log('Server listening on', port));

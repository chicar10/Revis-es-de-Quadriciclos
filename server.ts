import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const db = new Database('database.sqlite');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS quadricycles (
    id TEXT PRIMARY KEY,
    model TEXT,
    purchaseDate TEXT,
    clientName TEXT,
    whatsapp TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quadId TEXT,
    reviewNumber INTEGER,
    label TEXT,
    scheduledDate TEXT,
    isCompleted INTEGER,
    daysFromPrevious INTEGER,
    observation TEXT,
    responsible TEXT,
    km TEXT,
    FOREIGN KEY(quadId) REFERENCES quadricycles(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/quadricycles', (req, res) => {
    const quads = db.prepare('SELECT * FROM quadricycles').all();
    const result = quads.map((q: any) => {
      const reviews = db.prepare('SELECT * FROM reviews WHERE quadId = ? ORDER BY reviewNumber ASC').all(q.id);
      return {
        ...q,
        reviews: reviews.map((r: any) => ({
          ...r,
          id: r.reviewNumber, // Using reviewNumber as the ID for frontend compatibility
          isCompleted: !!r.isCompleted
        }))
      };
    });
    res.json(result);
  });

  app.post('/api/quadricycles', (req, res) => {
    const { id, model, purchaseDate, clientName, whatsapp, status, reviews } = req.body;
    
    const insertQuad = db.prepare('INSERT INTO quadricycles (id, model, purchaseDate, clientName, whatsapp, status) VALUES (?, ?, ?, ?, ?, ?)');
    insertQuad.run(id, model, purchaseDate, clientName, whatsapp, status);

    const insertReview = db.prepare('INSERT INTO reviews (quadId, reviewNumber, label, scheduledDate, isCompleted, daysFromPrevious) VALUES (?, ?, ?, ?, ?, ?)');
    for (const r of reviews) {
      insertReview.run(id, r.id, r.label, r.scheduledDate, r.isCompleted ? 1 : 0, r.daysFromPrevious);
    }

    res.status(201).json({ status: 'ok' });
  });

  app.put('/api/quadricycles/:id', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE quadricycles SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ status: 'ok' });
  });

  app.delete('/api/quadricycles/:id', (req, res) => {
    db.prepare('DELETE FROM quadricycles WHERE id = ?').run(req.params.id);
    res.json({ status: 'ok' });
  });

  app.put('/api/quadricycles/:quadId/reviews/:reviewNumber', (req, res) => {
    const { isCompleted, observation, responsible, km } = req.body;
    db.prepare(`
      UPDATE reviews 
      SET isCompleted = ?, observation = ?, responsible = ?, km = ? 
      WHERE quadId = ? AND reviewNumber = ?
    `).run(isCompleted ? 1 : 0, observation || null, responsible || null, km || null, req.params.quadId, req.params.reviewNumber);
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

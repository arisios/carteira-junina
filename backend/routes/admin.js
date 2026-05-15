const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../database/db');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Stats gerais
router.get('/stats', adminMiddleware, (req, res) => {
  const db = getDb();
  const totalUsers    = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM transactions').get().c;
  const totalEmitted  = db.prepare("SELECT COALESCE(SUM(amount),0) as c FROM transactions WHERE type='earn'").get().c;
  const totalClaims   = db.prepare('SELECT COUNT(*) as c FROM claims').get().c;
  const campaigns     = db.prepare('SELECT *, (budget - spent) as remaining FROM campaigns ORDER BY created_at DESC').all();
  const topUsers      = db.prepare(`
    SELECT user_id, COALESCE(SUM(amount),0) as balance
    FROM transactions GROUP BY user_id ORDER BY balance DESC LIMIT 10
  `).all();
  const recentClaims  = db.prepare(`
    SELECT cl.*, c.name as campaign_name, c.points
    FROM claims cl JOIN campaigns c ON cl.campaign_id = c.id
    ORDER BY cl.created_at DESC LIMIT 20
  `).all();
  res.json({ totalUsers, totalEmitted, totalClaims, campaigns, topUsers, recentClaims });
});

// Criar campanha
router.post('/campaigns', adminMiddleware, (req, res) => {
  const { name, description, points, budget } = req.body;
  if (!name?.trim() || !points) return res.status(400).json({ error: 'Nome e pontos são obrigatórios' });
  const nfc_token = crypto.randomBytes(16).toString('hex');
  const db = getDb();
  const result = db.prepare('INSERT INTO campaigns (name, description, nfc_token, points, budget) VALUES (?, ?, ?, ?, ?)').run(
    name.trim(), description?.trim() || null, nfc_token, parseInt(points), budget ? parseInt(budget) : null
  );
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ campaign });
});

// Atualizar campanha
router.patch('/campaigns/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const { name, description, points, budget, active } = req.body;
  const camp = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(parseInt(req.params.id));
  if (!camp) return res.status(404).json({ error: 'Campanha não encontrada' });
  db.prepare('UPDATE campaigns SET name=?, description=?, points=?, budget=?, active=? WHERE id=?').run(
    name ?? camp.name, description ?? camp.description, points ?? camp.points,
    budget !== undefined ? (budget === null ? null : parseInt(budget)) : camp.budget,
    active !== undefined ? (active ? 1 : 0) : camp.active,
    camp.id
  );
  res.json({ campaign: db.prepare('SELECT * FROM campaigns WHERE id = ?').get(camp.id) });
});

// Excluir campanha
router.delete('/campaigns/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const camp = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(parseInt(req.params.id));
  if (!camp) return res.status(404).json({ error: 'Campanha não encontrada' });
  db.prepare('DELETE FROM claims WHERE campaign_id = ?').run(camp.id);
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(camp.id);
  res.json({ success: true });
});

// Emitir moedas manualmente para um usuário
router.post('/emit', adminMiddleware, (req, res) => {
  const { user_id, amount, description } = req.body;
  if (!user_id || !amount) return res.status(400).json({ error: 'user_id e amount obrigatórios' });
  const db = getDb();
  db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)').run(
    user_id, parseInt(amount), amount > 0 ? 'earn' : 'deduct', description || 'Emissão manual pelo admin'
  );
  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const { getDb, getBalance } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Saldo e histórico do usuário
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const balance = getBalance(req.user.id);
  const transactions = db.prepare(`
    SELECT t.*, c.name as campaign_name
    FROM transactions t
    LEFT JOIN campaigns c ON t.campaign_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT 50
  `).all(req.user.id);
  res.json({ balance, transactions });
});

// Coletar pontos via token NFC
router.post('/claim/:token', authMiddleware, (req, res) => {
  const db = getDb();

  const campaign = db.prepare('SELECT * FROM campaigns WHERE nfc_token = ? AND active = 1').get(req.params.token);
  if (!campaign) return res.status(404).json({ error: 'Ponto não encontrado ou inativo' });

  // Verificar orçamento disponível
  if (campaign.budget !== null && campaign.spent + campaign.points > campaign.budget) {
    return res.status(400).json({ error: 'Este ponto esgotou seu orçamento' });
  }

  // Tentar inserir claim — UNIQUE(user_id, campaign_id) impede duplicata
  try {
    db.prepare('INSERT INTO claims (user_id, campaign_id, points) VALUES (?, ?, ?)').run(req.user.id, campaign.id, campaign.points);
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'Você já coletou este ponto!', already_claimed: true });
    throw err;
  }

  // Registrar transação e atualizar gasto da campanha
  db.prepare('INSERT INTO transactions (user_id, amount, type, description, campaign_id) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, campaign.points, 'earn', `Coletado em: ${campaign.name}`, campaign.id
  );
  db.prepare('UPDATE campaigns SET spent = spent + ? WHERE id = ?').run(campaign.points, campaign.id);

  const newBalance = getBalance(req.user.id);
  res.json({ success: true, points: campaign.points, balance: newBalance, campaign: campaign.name });
});

module.exports = router;

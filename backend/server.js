const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3007;

app.set('trust proxy', 1);

const allowedOrigins = [
  'https://carteira.festasjuninasdorio.com',
  'http://localhost:5179',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('CORS não permitido')),
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15*60*1000, max: 300, message: { error: 'Muitas requisições.' } });
app.use('/api', limiter);

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin',  require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Carteira Junina', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

initDb();
app.listen(PORT, () => console.log(`💰 Carteira Junina rodando na porta ${PORT}`));

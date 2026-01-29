const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const greenlockUtils = require('./greenlock-utils');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow inline scripts/styles if needed (adjust for production)
}));
app.use(cors());
app.use(bodyParser.json());

// Rate Limiting (Protect Dashboard API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Muitas requisições deste IP, tente novamente mais tarde."
});
app.use('/api/', apiLimiter);

app.use(express.static(path.join(__dirname, '../public')));

// API Routes - HOSTS
app.get('/api/hosts', (req, res) => {
  res.json(db.getAll());
});

app.post('/api/hosts', (req, res) => {
  const { domain, target } = req.body;
  if (!domain || !target) {
    return res.status(400).json({ error: 'Domínio e Alvo são obrigatórios' });
  }
  if (!domain.includes('.')) {
    return res.status(400).json({ error: 'Domínio inválido. Deve ser completo (ex: app.dominio.com)' });
  }
  // Ensure target has protocol
  let finalTarget = target;
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    finalTarget = 'http://' + target;
  }
  
  db.add({ domain, target: finalTarget });
  greenlockUtils.addDomain(domain);
  console.log(`Added mapping: ${domain} -> ${finalTarget}`);
  res.json({ success: true });
});

app.delete('/api/hosts/:domain', (req, res) => {
  const { domain } = req.params;
  db.remove(domain);
  greenlockUtils.removeDomain(domain);
  console.log(`Removed mapping: ${domain}`);
  res.json({ success: true });
});

// API Routes - BASE DOMAINS
app.get('/api/domains', (req, res) => {
  res.json(db.getDomains());
});

app.post('/api/domains', (req, res) => {
  const { domain } = req.body;
  if (!domain || !domain.includes('.')) {
    return res.status(400).json({ error: 'Domínio base inválido' });
  }
  db.addDomain(domain);
  res.json({ success: true });
});

app.delete('/api/domains/:domain', (req, res) => {
  const { domain } = req.params;
  db.removeDomain(domain);
  res.json({ success: true });
});

module.exports = app;
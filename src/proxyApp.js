const express = require('express');
const httpProxy = require('http-proxy');
const helmet = require('helmet');
const db = require('./db');

const proxy = httpProxy.createProxyServer({
  xfwd: true, // Add X-Forwarded-* headers
  secure: false // Allow self-signed certs on the target (internal) servers
});

const app = express();

// Security Headers for Proxy
app.use(helmet({
  contentSecurityPolicy: false, // Let apps handle their own CSP or set strict if known
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Strict-Transport-Security
}));

// Template Visual para Manutenção e Erros
const getMaintenanceHTML = (title, message, domain) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Nexus Proxy</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #00f3ff;
            --secondary: #bc13fe;
            --bg: #0a0b1e;
            --card-bg: rgba(20, 22, 45, 0.8);
            --text: #e0e6ed;
        }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Roboto', sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(188, 19, 254, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.1) 0%, transparent 40%);
        }
        .container {
            padding: 40px;
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            max-width: 500px;
        }
        h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.8em;
            text-shadow: 0 0 10px var(--primary), 0 0 20px var(--secondary);
            margin-bottom: 20px;
            color: #fff;
        }
        p {
            font-size: 1.1em;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #ccc;
        }
        .domain {
            color: var(--primary);
            font-weight: bold;
        }
        .footer {
            font-size: 0.8em;
            color: #666;
            margin-top: 20px;
        }
        .loader {
            width: 50px;
            height: 50px;
            border: 3px solid transparent;
            border-top-color: var(--primary);
            border-radius: 50%;
            margin: 0 auto 20px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <h1>Nexus Proxy Manager</h1>
        <p>A página <span class="domain">${domain}</span> ${message}</p>
        <div class="footer">Criado por Loucaso + AI</div>
    </div>
</body>
</html>
`;

// Log proxy errors
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy Error] ${req.hostname} -> ${err.message}`);
  if (!res.headersSent) {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getMaintenanceHTML(
        'Manutenção', 
        'está em manutenção, tente novamente em alguns minutos.', 
        req.hostname
    ));
  }
});

app.use((req, res, next) => {
  const host = req.hostname;
  const mapping = db.find(host);

  if (mapping) {
    // console.log(`Proxying ${host} => ${mapping.target}`);
    return proxy.web(req, res, { target: mapping.target });
  }

  next();
});

app.use((req, res) => {
  res.status(404).send(getMaintenanceHTML(
      'Não Encontrado', 
      'não está configurada neste servidor.', 
      req.hostname
  ));
});

module.exports = app;

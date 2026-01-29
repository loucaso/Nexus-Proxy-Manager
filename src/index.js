const greenlock = require('greenlock-express');
const path = require('path');
const fs = require('fs');
const dashboardApp = require('./dashboard');
const proxyApp = require('./proxyApp');
const db = require('./db');
const greenlockUtils = require('./greenlock-utils');

// 1. Start Dashboard (Management UI)
const DASHBOARD_PORT = 8080;
dashboardApp.listen(DASHBOARD_PORT, '0.0.0.0', () => {
  console.log(`===========================================================`);
  console.log(` Dashboard running at: http://localhost:${DASHBOARD_PORT}`);
  console.log(`===========================================================`);
});

// 2. Sync DB with Greenlock Config on Startup
const hosts = db.getAll();
hosts.forEach(host => {
  // Ignora localhost e domínios inválidos para SSL
  if (host.domain && host.domain.includes('.') && host.domain !== 'localhost') {
    greenlockUtils.addDomain(host.domain);
  }
});

// Ler email do config para evitar hardcode
let maintainerEmail = 'admin@localhost.com';
const configPath = path.join(__dirname, '../greenlock.d/config.json');
if (fs.existsSync(configPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.defaults && config.defaults.subscriberEmail) {
            maintainerEmail = config.defaults.subscriberEmail;
        }
    } catch (e) {
        console.error("Erro ao ler config greenlock:", e);
    }
}
console.log(`Using Greenlock maintainer email: ${maintainerEmail}`);

// 3. Start Greenlock Proxy (Public 80/443)
console.log('Starting Proxy Server on ports 80/443...');

// Note: This requires Administrator/Root privileges to bind to port 80/443
try {
  greenlock.init({
    packageRoot: path.join(__dirname, '../'),
    configDir: path.join(__dirname, '../greenlock.d'),
    maintainerEmail: maintainerEmail, 
    cluster: false
  }).serve(proxyApp);
} catch (err) {
  console.error('Failed to start Greenlock:', err);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

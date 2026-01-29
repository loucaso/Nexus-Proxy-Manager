const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../greenlock.d');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Ensure directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Initial Config Template
const INITIAL_CONFIG = {
  sites: [],
  defaults: {
    subscriberEmail: 'admin@localhost.com', // Será atualizado no primeiro addDomain
    agreeToTerms: true,
    challengeType: 'http-01'
  }
};

function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(INITIAL_CONFIG, null, 2));
    return INITIAL_CONFIG;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return INITIAL_CONFIG;
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function generateEmail(domain) {
  const parts = domain.split('.');
  // Se for domínio simples (ex: google.com, localhost)
  if (parts.length <= 2) {
    return `admin@${domain}`;
  } 
  // Se for subdomínio (ex: app.google.com -> app@google.com)
  const user = parts[0];
  const host = parts.slice(1).join('.');
  return `${user}@${host}`;
}

module.exports = {
  addDomain: (domain) => {
    // Validação extra: não tentar adicionar localhost ou domínios sem ponto
    if (!domain || !domain.includes('.') || domain === 'localhost') {
        console.log(`[Greenlock] Ignored invalid domain: ${domain}`);
        return;
    }

    const config = getConfig();
    const email = generateEmail(domain);
    
    // Atualiza o email padrão se for inválido ou example/localhost
    const currentDefault = config.defaults.subscriberEmail || '';
    if (currentDefault.includes('example.com') || currentDefault.includes('localhost.com')) {
        config.defaults.subscriberEmail = email;
        console.log(`[Greenlock] Updated default email to ${email}`);
    }

    // Check if exists
    const exists = config.sites.some(s => s.subject === domain);
    if (!exists) {
      config.sites.push({
        subject: domain,
        altnames: [domain],
        subscriberEmail: email // Tenta forçar email por site
      });
      saveConfig(config);
      console.log(`[Greenlock] Added ${domain} (Email: ${email})`);
    }
  },
  removeDomain: (domain) => {
    const config = getConfig();
    const initialLen = config.sites.length;
    config.sites = config.sites.filter(s => s.subject !== domain);
    if (config.sites.length !== initialLen) {
      saveConfig(config);
      console.log(`[Greenlock] Removed ${domain}`);
    }
  }
};

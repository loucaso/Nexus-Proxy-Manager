const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '../db.json'));
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ hosts: [], baseDomains: [] }).write();

module.exports = {
  // Hosts
  getAll: () => db.get('hosts').value(),
  add: (host) => {
    // host: { domain: "example.com", target: "http://localhost:3000" }
    const existing = db.get('hosts').find({ domain: host.domain }).value();
    if (existing) {
      db.get('hosts').find({ domain: host.domain }).assign(host).write();
    } else {
      db.get('hosts').push(host).write();
    }
  },
  remove: (domain) => {
    db.get('hosts').remove({ domain }).write();
  },
  find: (domain) => {
    return db.get('hosts').find({ domain }).value();
  },

  // Base Domains (for UI Dropdown)
  getDomains: () => db.get('baseDomains').value(),
  addDomain: (domain) => {
    const existing = db.get('baseDomains').find({ name: domain }).value();
    if (!existing) {
      db.get('baseDomains').push({ name: domain }).write();
    }
  },
  removeDomain: (domain) => {
    db.get('baseDomains').remove({ name: domain }).write();
  }
};
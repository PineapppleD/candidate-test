const fs = require('fs');

function parseEnv(path) {
  const env = {};
  if (!fs.existsSync(path)) return env;
  const lines = fs.readFileSync(path, 'utf-8').split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const [key, ...vals] = line.split('=');
    env[key.trim()] = vals.join('=').trim();
  }
  return env;
}

module.exports = { parseEnv }; 
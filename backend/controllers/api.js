const { getPgSocket } = require('../db/pg');

function ping(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({pong: true}));
}

function dbTest(req, res, env) {
  getPgSocket(env, (err, socket) => {
    if (err) {
      res.writeHead(500);
      res.end('DB connection error: ' + err.message);
      return;
    }
    res.writeHead(200);
    res.end('Connected to DB!');
    socket.end();
  });
}

module.exports = { ping, dbTest }; 
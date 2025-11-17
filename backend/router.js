const mainController = require('./controllers/mainController');
const Metadata = require('./controllers/Metadata');

function router(req, res, env) {
  if (req.url === '/' && req.method === 'GET') return mainController.doGet(req, res);
  if (req.url === '/' && req.method === 'POST') return mainController.doEvent(req, res);
  if (req.url === '/api' && req.method === 'POST') return mainController.doEvent(req, res);
  if (req.url === '/api/metadata' && req.method === 'POST') return Metadata.getPublicMetadata(req, res);
  
  // API для работы с экземплярами (по UUID)
  if (req.url === '/api/instance' && req.method === 'POST') return mainController.doEvent(req, res);
  if (req.url === '/api/instance/select' && req.method === 'POST') {
    req.body = { ...req.body, type: 'instance_select' };
    return mainController.doEvent(req, res);
  }
  if (req.url === '/api/instance/insert' && req.method === 'POST') {
    req.body = { ...req.body, type: 'instance_insert' };
    return mainController.doEvent(req, res);
  }
  if (req.url === '/api/instance/update' && req.method === 'POST') {
    req.body = { ...req.body, type: 'instance_update' };
    return mainController.doEvent(req, res);
  }
  if (req.url === '/api/instance/delete' && req.method === 'POST') {
    req.body = { ...req.body, type: 'instance_delete' };
    return mainController.doEvent(req, res);
  }
  if (req.url === '/api/instance/list' && req.method === 'POST') {
    req.body = { ...req.body, type: 'instance_list' };
    return mainController.doEvent(req, res);
  }
  
  res.writeHead(404);
  res.end('Not found');
}

module.exports = { router };  
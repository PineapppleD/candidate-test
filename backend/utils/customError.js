function customError({ res, statusCode, json }) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(json));
}

module.exports = customError; 
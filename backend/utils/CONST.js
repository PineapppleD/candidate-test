const HTTPSTATUSES = {
  ERRORS: {
    MethodNotAllowed: { code: 405, name: 'Method Not Allowed' },
    NotFound: { code: 404, name: 'Not Found' },
    InternalServerError: { code: 500, name: 'Internal Server Error' }
  },
  SUCCESS: {
    OK: { code: 200, name: 'OK' }
  }
};

module.exports = { HTTPSTATUSES }; 
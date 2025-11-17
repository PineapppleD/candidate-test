class DatabaseError extends Error {
  constructor(err, query) {
    super(err.message);
    this.query = query;
    this.original = err;
  }
}

module.exports = DatabaseError; 
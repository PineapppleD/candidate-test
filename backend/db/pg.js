/* global process */

const { Pool } = require('pg');
const DatabaseError = require('./databaseError');
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST, 
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

//const { Pool } = require('pg');
//
//const pool = new Pool({
//    user: process.env.PGUSER,
//    host: process.env.PGHOST,
//    database: process.env.PGDATABASE,
//    password: process.env.PGPASSWORD,
//    port: process.env.PGPORT
//});
//
//module.exports = {
//    query: (text, params, callback) => {
//        return pool.query(text, params, callback);
//    },
//    getClient: async () => {
//        return await pool.connect();
//    }
//};


module.exports = {
    query: (text, params, callback) => {
        return new Promise(function (resolve, reject) {
            pool.query(text, params, (err, res) => {
                if (err) {
                    return reject(new DatabaseError(err, text));
                }
                if (typeof callback === "function") return resolve(callback(err, res));
                resolve(res);
            });
        });
    },
    getClient: async () => {
        return await pool.connect();
    },
};

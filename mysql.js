import dotenv from 'dotenv';
dotenv.config();

import util from 'util';
import {
    createPool
} from 'mysql';

const pool = createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: 100,
    supportBigNumbers: true,
    bigNumberStrings: true
});

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Database connection was closed.');
        if (err.code === 'ER_CON_COUNT_ERROR') console.error('Database has too many connections.');
        if (err.code === 'ECONNREFUSED') console.error('Database connection was refused.');
    }

    if (connection) connection.release();

    return
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;
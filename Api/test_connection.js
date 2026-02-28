const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'E:/Applications/LMS/Api/.env' });

async function test() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    };

    console.log(`Testing config from .env: user=${config.user}, host=${config.host}, database=${config.database}`);
    try {
        const conn = await mysql.createConnection(config);
        console.log('SUCCESS: Connection established using .env credentials!');
        await conn.end();
    } catch (err) {
        console.log('FAILED:', err.message);
        process.exit(1);
    }
}

test();

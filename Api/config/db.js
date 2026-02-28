const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // To keep dates as strings like MSSQL does often
};

const pool = mysql.createPool(config);

class Transaction {
  constructor(poolWrapper) {
    // If we're passed our special poolPromise object, use the real pool inside it
    this.pool = pool;
    this.connection = null;
  }
  async begin() {
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
  }
  async commit() {
    if (this.connection) {
      await this.connection.commit();
      this.connection.release();
      this.connection = null;
    }
  }
  async rollback() {
    if (this.connection) {
      await this.connection.rollback();
      this.connection.release();
      this.connection = null;
    }
  }
  request() {
    // Return a request that uses the transaction's connection
    return new Request(this.connection || this.pool);
  }
}

// Mock sql object with data types used in controllers
const sql = {
  Int: 'int',
  NVarChar: 'nvarchar',
  DateTime: 'datetime',
  Date: 'date',
  Decimal: 'decimal',
  Bit: 'bit',
  Transaction: Transaction
};

class Request {
  constructor(connection) {
    this.connection = connection;
    this.params = {};
  }

  input(name, type, value) {
    this.params[name] = value;
    return this;
  }

  async query(sqlString) {
    let convertedSql = sqlString;

    // Basic syntax replacements
    convertedSql = convertedSql.replace(/GETDATE\(\)/gi, 'NOW()');
    convertedSql = convertedSql.replace(/ISNULL/gi, 'IFNULL');

    // Convert MSSQL parameters (@param) to MySQL (?)
    const values = [];
    const paramRegex = /@(\w+)/g;

    convertedSql = convertedSql.replace(paramRegex, (match, paramName) => {
      if (this.params.hasOwnProperty(paramName)) {
        values.push(this.params[paramName]);
        return '?';
      }
      return match;
    });

    try {
      // Use the provided connection (which might be the pool or a transaction connection)
      const [rows] = await this.connection.query(convertedSql, values);

      // Mimic MSSQL result structure
      if (Array.isArray(rows)) {
        return {
          recordset: rows,
          recordsets: [rows],
          rowsAffected: [rows.length]
        };
      } else {
        return {
          recordset: [],
          recordsets: [],
          rowsAffected: [rows.affectedRows],
          insertId: rows.insertId
        };
      }
    } catch (err) {
      console.error('Database Query Error:', err.message, 'SQL:', convertedSql);
      throw err;
    }
  }
}

const poolPromise = {
  request: () => new Request(pool),
  // Support for direct pool usage if any
  query: (sql, params) => pool.query(sql, params)
};

// Handle treating poolPromise as a thenable to wait for connection
// mysql2 pool doesn't need "connect()" call like mssql pool, it connects lazily or on pool creation
console.log('Database Initialized: MySQL Compatibility Layer Active');

module.exports = {
  sql,
  poolPromise: Promise.resolve(poolPromise)
};

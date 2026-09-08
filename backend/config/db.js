const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

let isSQLite = false;
let sqliteDb = null;
let mysqlPool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'packersmart_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Unified Connection Interface
const pool = {
  async query(sql, params = []) {
    if (!isSQLite) {
      return await mysqlPool.query(sql, params);
    } else {
      return new Promise((resolve, reject) => {
        let processedSql = sql
          .replace(/NOW\(\) - INTERVAL 1 DAY/gi, "datetime('now', '-1 day')")
          .replace(/NOW\(\)/gi, "datetime('now')");

        const trimmed = processedSql.trim().toUpperCase();

        if (trimmed.startsWith('SELECT')) {
          sqliteDb.all(processedSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve([rows]);
          });
        } else if (trimmed.startsWith('INSERT')) {
          sqliteDb.run(processedSql, params, function(err) {
            if (err) return reject(err);
            resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
          });
        } else {
          sqliteDb.run(processedSql, params, function(err) {
            if (err) return reject(err);
            resolve([{ affectedRows: this.changes }]);
          });
        }
      });
    }
  },

  async getConnection() {
    if (!isSQLite) {
      const conn = await mysqlPool.getConnection();
      return {
        query: (sql, params) => conn.query(sql, params),
        release: () => conn.release()
      };
    } else {
      return {
        query: (sql, params) => pool.query(sql, params),
        release: () => {}
      };
    }
  }
};

const seedInitialCompanies = async () => {
  const [companies] = await pool.query('SELECT COUNT(*) as count FROM companies');
  const count = companies[0].count !== undefined ? companies[0].count : (companies[0]['COUNT(*)'] || 0);

  if (count === 0) {
    console.log('Seeding Packers & Movers sample companies into database...');
    const sampleCompanies = [
      {
        name: 'Agarwal Packers & Movers',
        cities: JSON.stringify(['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai']),
        services: JSON.stringify(['Home Relocation', 'Vehicle Transport', 'Office Relocation']),
        rating: 4.8
      },
      {
        name: 'Gati KWE Logistics',
        cities: JSON.stringify(['Mumbai', 'Delhi', 'Kolkata', 'Ahmedabad', 'Pune']),
        services: JSON.stringify(['Home Relocation', 'Commercial Goods', 'Office Relocation']),
        rating: 4.6
      },
      {
        name: 'Porter Logistics Services',
        cities: JSON.stringify(['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']),
        services: JSON.stringify(['Home Relocation', 'Commercial Goods']),
        rating: 4.5
      },
      {
        name: 'SafeExpress Packers Ltd',
        cities: JSON.stringify(['Delhi', 'Chandigarh', 'Jaipur', 'Lucknow', 'Mumbai']),
        services: JSON.stringify(['Vehicle Transport', 'Commercial Goods']),
        rating: 4.3
      },
      {
        name: 'South Express Relocations',
        cities: JSON.stringify(['Chennai', 'Bangalore', 'Hyderabad', 'Kochi', 'Coimbatore']),
        services: JSON.stringify(['Home Relocation', 'Vehicle Transport', 'Office Relocation']),
        rating: 4.7
      },
      {
        name: 'Metro City Packers & Movers',
        cities: JSON.stringify(['Kolkata', 'Patna', 'Bhubaneswar', 'Delhi']),
        services: JSON.stringify(['Home Relocation', 'Office Relocation']),
        rating: 4.2
      },
      {
        name: 'Speedy Auto Transporters',
        cities: JSON.stringify(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Kolkata']),
        services: JSON.stringify(['Vehicle Transport']),
        rating: 4.9
      },
      {
        name: 'Crown Relocations India',
        cities: JSON.stringify(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Gurgaon']),
        services: JSON.stringify(['Home Relocation', 'Office Relocation', 'Vehicle Transport', 'Commercial Goods']),
        rating: 4.9
      }
    ];

    for (const comp of sampleCompanies) {
      await pool.query(
        `INSERT INTO companies (company_name, coverage_cities, service_types, rating) VALUES (?, ?, ?, ?)`,
        [comp.name, comp.cities, comp.services, comp.rating]
      );
    }
    console.log('Successfully seeded 8 logistics companies!');
  }
};

const initDB = async () => {
  try {
    // 1. Try MySQL Connection
    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConn.end();

    mysqlPool = mysql.createPool(dbConfig);
    const conn = await mysqlPool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL,
        pickup_city VARCHAR(100) NOT NULL,
        destination_city VARCHAR(100) NOT NULL,
        service_type ENUM('Home Relocation', 'Vehicle Transport', 'Office Relocation', 'Commercial Goods') NOT NULL,
        moving_date DATE NOT NULL,
        additional_requirements TEXT,
        status ENUM('Pending', 'Verified', 'Fake', 'Duplicate', 'Re-attempt') DEFAULT 'Pending',
        lead_score INT DEFAULT 0,
        lead_quality ENUM('Hot', 'Warm', 'Cold', 'Unverified') DEFAULT 'Unverified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        is_used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        coverage_cities JSON NOT NULL,
        service_types JSON NOT NULL,
        rating DECIMAL(2, 1) DEFAULT 4.0,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        contact_phone VARCHAR(20) DEFAULT '9876543210',
        email VARCHAR(100) DEFAULT 'info@company.com',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS lead_company_matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        company_id INT NOT NULL,
        match_score INT DEFAULT 0,
        notification_status ENUM('Sent', 'Pending') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    conn.release();
    await seedInitialCompanies();
    console.log('✅ MySQL Database connected & initialized successfully.');
  } catch (error) {
    console.warn('⚠️ MySQL connection failed:', error.message);
    console.log('🔄 Auto-switching to Zero-Config SQLite database mode...');

    isSQLite = true;
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const dbPath = path.join(dbDir, 'packersmart.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);

    const runSql = (sql) => new Promise((res, rej) => sqliteDb.run(sql, (err) => err ? rej(err) : res()));

    await runSql(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT NOT NULL,
        pickup_city TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        service_type TEXT NOT NULL,
        moving_date TEXT NOT NULL,
        additional_requirements TEXT,
        status TEXT DEFAULT 'Pending',
        lead_score INTEGER DEFAULT 0,
        lead_quality TEXT DEFAULT 'Unverified',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        otp TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        is_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      );
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        coverage_cities TEXT NOT NULL,
        service_types TEXT NOT NULL,
        rating REAL DEFAULT 4.0,
        status TEXT DEFAULT 'Active',
        contact_phone TEXT DEFAULT '9876543210',
        email TEXT DEFAULT 'info@company.com',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS lead_company_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        match_score INTEGER DEFAULT 0,
        notification_status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await seedInitialCompanies();
    console.log('✅ SQLite Database initialized successfully (Zero-Config mode active).');
  }
};

module.exports = { pool, initDB };

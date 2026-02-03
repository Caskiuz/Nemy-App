// Production database connection
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Parse MYSQL_DATABASE_URL or use individual env vars
function createConnectionConfig() {
  const mysqlUrl = process.env.MYSQL_DATABASE_URL;
  
  if (mysqlUrl) {
    // Parse the MySQL URL
    const url = new URL(mysqlUrl);
    const config: mysql.PoolOptions = {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading /
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
    
    // Add SSL for Aiven (if ca.pem exists)
    const caPath = path.join(process.cwd(), 'ca.pem');
    if (fs.existsSync(caPath)) {
      config.ssl = {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true,
      };
      console.log('📜 Using SSL certificate for MySQL connection');
    } else if (url.searchParams.get('ssl-mode') === 'REQUIRED') {
      // Use default SSL without custom CA
      config.ssl = {
        rejectUnauthorized: false,
      };
      console.log('🔒 Using SSL without custom CA');
    }
    
    return config;
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

// Create production connection pool
const connection = mysql.createPool(createConnectionConfig());

export const db = drizzle(connection);

// Test connection on startup and run migrations
connection.getConnection()
  .then(async (conn) => {
    console.log('✅ Database connected successfully');
    
    // Run migrations - add profile_image column if not exists
    try {
      await conn.query(`
        ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT NULL
      `);
      console.log('✅ Added profile_image column to users table');
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ profile_image column already exists');
      } else {
        console.log('ℹ️ Migration note:', err.message);
      }
    }
    
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

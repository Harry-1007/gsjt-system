const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 确保从正确路径加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// PostgreSQL 连接池配置
// 优先使用 DATABASE_URL（Railway、Heroku 等平台提供）
// 如果没有，则使用单独的配置项
let poolConfig;

if (process.env.DATABASE_URL) {
  // 使用 DATABASE_URL（Railway 等平台）
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // 使用单独的配置项
  const dbPassword = process.env.DB_PASSWORD 
    ? String(process.env.DB_PASSWORD).trim() 
    : '';
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gsjt',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// 测试连接
pool.on('connect', () => {
  console.log('PostgreSQL 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('PostgreSQL 数据库连接错误:', err);
});

// 初始化数据库
async function initDatabase() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    // 改进的 SQL 语句分割逻辑
    // 先移除注释行，然后按分号分割
    const lines = sql.split('\n');
    const cleanedLines = lines
      .map(line => {
        // 移除行内注释（-- 后面的内容）
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0);
    
    const sqlText = cleanedLines.join(' ');
    const statements = sqlText
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.toUpperCase().includes('CREATE'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (err) {
          // 忽略已存在的表/索引错误（PostgreSQL 和 SQLite 的错误消息格式）
          const errorMsg = err.message || '';
          const isIgnorableError = 
            errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate') ||
            errorMsg.includes('relation') && errorMsg.includes('already exists') ||
            err.code === '42P07'; // PostgreSQL: duplicate_table
          
          if (!isIgnorableError) {
            console.warn('执行 SQL 语句时出现警告:', err.message);
          }
        }
      }
    }
    
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 封装数据库查询为Promise
function run(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      // 将 SQLite 的 ? 占位符转换为 PostgreSQL 的 $1, $2, ...
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      resolve({ 
        id: result.insertId || result.rows[0]?.id, 
        changes: result.rowCount || 0 
      });
    } catch (err) {
      reject(err);
    }
  });
}

function get(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      resolve(result.rows[0] || null);
    } catch (err) {
      reject(err);
    }
  });
}

function all(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      resolve(result.rows || []);
    } catch (err) {
      reject(err);
    }
  });
}

// 将 SQLite 的 ? 占位符转换为 PostgreSQL 的 $1, $2, ...
function convertPlaceholders(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// 初始化数据库
initDatabase();

// 优雅关闭连接池
process.on('SIGINT', async () => {
  await pool.end();
  console.log('数据库连接池已关闭');
  process.exit(0);
});

module.exports = { pool, run, get, all };
/**
 * MySQL 数据库连接池
 * 环境变量配置，支持平滑迁移
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'sportsapp',
  password: process.env.DB_PASSWORD || 'SportsApp@2026#db',
  database: process.env.DB_NAME || 'sports_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;

/**
 * 获取连接池（单例）
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log(`✅ MySQL 连接池创建: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }
  return pool;
}

/**
 * 执行查询（自动获取连接，归还连接池）
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function query(sql, params = []) {
  const p = getPool();
  try {
    const [rows] = await p.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('❌ MySQL Query Error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/**
 * 执行插入并返回自增ID
 * @param {string} sql - INSERT SQL
 * @param {Array} params - 参数数组
 * @returns {Promise<number>} 自增ID
 */
async function insert(sql, params = []) {
  const p = getPool();
  try {
    const [result] = await p.execute(sql, params);
    return result.insertId;
  } catch (err) {
    console.error('❌ MySQL Insert Error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/**
 * 执行更新/删除
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<number>} 影响行数
 */
async function execute(sql, params = []) {
  const p = getPool();
  try {
    const [result] = await p.execute(sql, params);
    return result.affectedRows;
  } catch (err) {
    console.error('❌ MySQL Execute Error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/**
 * 获取一个连接（用于事务）
 */
async function getConnection() {
  return getPool().getConnection();
}

/**
 * 测试连接
 */
async function testConnection() {
  try {
    const rows = await query('SELECT 1 AS ok, NOW() AS now');
    console.log('✅ MySQL 连接测试成功:', rows);
    return true;
  } catch (err) {
    console.error('❌ MySQL 连接测试失败:', err.message);
    return false;
  }
}

/**
 * 关闭连接池（进程结束时调用）
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL 连接池已关闭');
  }
}

module.exports = { query, insert, execute, getPool, getConnection, testConnection, closePool };

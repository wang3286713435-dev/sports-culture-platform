/**
 * 全民体育文化平台 - 后端 API 服务器（MySQL 版本）
 * 端口: 3001
 * 数据库: MySQL / MariaDB
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { initTestData } = require('./db/init-data');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sports-platform-secret-2026';
const JWT_EXPIRES = '30d';

// MySQL 连接配置（从环境变量读取）
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'sportsapp',
  password: process.env.DB_PASSWORD || 'SportsApp@2026#db',
  database: process.env.DB_NAME || 'sports_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// ===================== 初始化数据库 =====================
async function initDatabase() {
  pool = mysql.createPool(dbConfig);
  console.log(`✅ MySQL 连接池: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

  // 测试连接
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ MySQL 连接测试成功');
  } catch (err) {
    console.error('❌ MySQL 连接失败:', err.message);
    process.exit(1);
  }

  // 初始化测试数据
  await initTestData();
}

// 简化 SQL 执行
async function sqlQuery(sqlStr, params = []) {
  try {
    const [rows] = await pool.query(sqlStr, params);
    return rows;
  } catch (err) {
    console.error('❌ SQL Error:', err.message, '\nSQL:', sqlStr);
    return [];
  }
}

async function sqlOne(sqlStr, params = []) {
  const rows = await sqlQuery(sqlStr, params);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function sqlRun(sql, params = []) {
  try {
    const [result] = await pool.query(sql, params);
    return result;
  } catch (err) {
    console.error('❌ SQL Run Error:', err.message);
    return { affectedRows: 0, insertId: 0 };
  }
}

// 中间件
app.use(cors());
app.use(express.json());

// ===================== 公共接口 =====================

// 运动项目
app.get('/api/sports', (req, res) => {
  res.json({
    code: 200, data: [
      { id: 1, name: '篮球', icon: '🏀' },
      { id: 2, name: '足球', icon: '⚽' },
      { id: 3, name: '网球', icon: '🎾' },
      { id: 4, name: '乒乓球', icon: '🏓' },
      { id: 5, name: '羽毛球', icon: '🏸' },
      { id: 6, name: '游泳', icon: '🏊' },
      { id: 7, name: '跆拳道', icon: '🥋' },
      { id: 8, name: '体能', icon: '💪' },
    ]
  });
});

// 热门教练
app.get('/api/coaches/popular', async (req, res) => {
  const coaches = await sqlQuery(`
    SELECT c.*, u.nickname, u.avatar as avatar_url
    FROM coaches c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'active'
    ORDER BY c.rating DESC, c.total_lessons DESC
    LIMIT 10
  `);
  res.json({ code: 200, data: coaches });
});

// 教练列表（带筛选）
app.get('/api/coaches', async (req, res) => {
  const { sport_type, level, keyword, coach_type } = req.query;
  let s = `
    SELECT c.*, u.nickname, u.avatar as avatar_url
    FROM coaches c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'active'
  `;
  const params = [];

  if (coach_type) { s += ' AND c.coach_type = ?'; params.push(coach_type); }
  if (sport_type) { s += ' AND c.sport_types LIKE ?'; params.push(`%${sport_type}%`); }
  if (level && level !== '全部') { s += ' AND c.level = ?'; params.push(level); }
  if (keyword) { s += ' AND u.nickname LIKE ?'; params.push(`%${keyword}%`); }
  s += ' ORDER BY c.rating DESC, c.total_lessons DESC';

  const coaches = await sqlQuery(s, params);
  res.json({ code: 200, data: coaches });
});

// 教练详情
app.get('/api/coaches/:id', async (req, res) => {
  const coach = await sqlOne(`
    SELECT c.*, u.nickname, u.avatar as avatar_url, u.phone
    FROM coaches c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [req.params.id]);

  if (!coach) return res.json({ code: 404, message: '教练不存在' });

  // 解析 sport_types JSON
  if (coach.sport_types && typeof coach.sport_types === 'string') {
    try { coach.sport_types = JSON.parse(coach.sport_types); } catch {}
  }

  res.json({ code: 200, data: coach });
});

// 课程列表
app.get('/api/courses', async (req, res) => {
  const { sport_type, level } = req.query;
  let s = 'SELECT * FROM courses WHERE status = ?';
  const params = ['online'];

  if (sport_type) { s += ' AND sport_type = ?'; params.push(sport_type); }
  if (level) { s += ' AND level = ?'; params.push(level); }
  s += ' ORDER BY created_at DESC';

  const courses = await sqlQuery(s, params);
  res.json({ code: 200, data: courses });
});

// 课程详情
app.get('/api/courses/:id', async (req, res) => {
  const course = await sqlOne('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.json({ code: 404, message: '课程不存在' });
  res.json({ code: 200, data: course });
});

// 收藏/取消收藏
app.post('/api/courses/:id/favorite', (req, res) => {
  res.json({ code: 200, message: '收藏成功' });
});

// 机构列表
app.get('/api/organizations', async (req, res) => {
  const orgs = await sqlQuery('SELECT * FROM institutions ORDER BY id DESC');
  res.json({ code: 200, data: orgs });
});

// 机构详情
app.get('/api/organizations/:id', async (req, res) => {
  const org = await sqlOne('SELECT * FROM institutions WHERE id = ?', [req.params.id]);
  if (!org) return res.json({ code: 404, message: '机构不存在' });
  res.json({ code: 200, data: org });
});

// ===================== 认证接口 =====================

// 发送验证码（测试环境直接返回）
app.post('/api/auth/sms/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ code: 400, message: '请输入手机号' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`📱 验证码 [${phone}]: ${code}`);
  res.json({ code: 200, message: '验证码已发送', data: { code } });
});

// 手机号登录（注册）
app.post('/api/auth/login/phone', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.json({ code: 400, message: '参数不完整' });

  // 验证码校验（测试环境接受任意6位数字）
  if (code.length !== 6) return res.json({ code: 400, message: '验证码错误' });

  // 查找或创建用户
  let user = await sqlOne('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!user) {
    const r = await sqlRun(
      'INSERT INTO users (phone, nickname) VALUES (?, ?)',
      [phone, '用户' + phone.slice(-4)]
    );
    user = await sqlOne('SELECT * FROM users WHERE id = ?', [r.insertId]);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({
    code: 200, message: '登录成功',
    data: {
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, role: user.role || 'student' }
    }
  });
});

// 账号密码登录
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await sqlOne('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password]);
  if (!user) return res.json({ code: 401, message: '账号或密码错误' });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({
    code: 200, message: '登录成功',
    data: { token, user: { id: user.id, phone: user.phone, nickname: user.nickname, role: user.role } }
  });
});

// ===================== 认证中间件 =====================
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ code: 401, message: '请先登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.json({ code: 401, message: 'Token无效' }); }
}

// ===================== 用户接口（需认证）====================

// 获取用户信息
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  const user = await sqlOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);
  if (!user) return res.json({ code: 404, message: '用户不存在' });
  delete user.password;
  res.json({ code: 200, data: user });
});

// 更新用户信息
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  const { nickname, avatar } = req.body;
  await sqlRun('UPDATE users SET nickname = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
    [nickname || '', avatar || '', req.user.userId]);
  res.json({ code: 200, message: '更新成功' });
});

// 获取学员档案
app.get('/api/user/student-profile', authMiddleware, async (req, res) => {
  const profile = await sqlOne(
    'SELECT sp.*, u.nickname, u.phone FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.user_id = ?',
    [req.user.userId]
  );
  if (!profile) return res.json({ code: 200, data: null });
  res.json({ code: 200, data: profile });
});

// 获取体测报告
app.get('/api/user/test-reports', authMiddleware, async (req, res) => {
  const reports = await sqlQuery(
    'SELECT * FROM body_tests WHERE user_id = ? ORDER BY test_date DESC LIMIT 10',
    [req.user.userId]
  );
  res.json({ code: 200, data: reports });
});

// 获取成长档案
app.get('/api/user/growth-records', authMiddleware, async (req, res) => {
  const records = await sqlQuery(
    'SELECT * FROM growth_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 20',
    [req.user.userId]
  );
  res.json({ code: 200, data: records });
});

// 获取学习记录
app.get('/api/user/learning-records', authMiddleware, async (req, res) => {
  const records = await sqlQuery(
    'SELECT lr.*, c.title as course_name, u.nickname as coach_name FROM lesson_records lr JOIN courses c ON lr.course_id = c.id JOIN coaches co ON lr.coach_id = co.id JOIN users u ON co.user_id = u.id WHERE lr.user_id = ? ORDER BY lr.lesson_date DESC LIMIT 50',
    [req.user.userId]
  );
  res.json({ code: 200, data: records });
});

// 获取订单
app.get('/api/user/orders', authMiddleware, async (req, res) => {
  const orders = await sqlQuery(
    'SELECT o.*, cp.name as package_name FROM orders o LEFT JOIN course_packages cp ON o.package_id = cp.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
    [req.user.userId]
  );
  res.json({ code: 200, data: orders });
});

// 收藏/取消收藏
app.post('/api/user/favorites', authMiddleware, async (req, res) => {
  const { fav_type, fav_id, action } = req.body;
  if (action === 'remove') {
    await sqlRun('DELETE FROM operation_logs WHERE user_id = ? AND action = ? AND target_id = ?',
      [req.user.userId, 'favorite_' + fav_type, fav_id]);
    return res.json({ code: 200, message: '已取消收藏' });
  }
  await sqlRun(
    'INSERT INTO operation_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)',
    [req.user.userId, 'favorite_' + fav_type, fav_type, fav_id]
  );
  res.json({ code: 200, message: '收藏成功' });
});

// ===================== 预约下单 =====================

app.post('/api/orders', authMiddleware, async (req, res) => {
  const { package_id, course_id } = req.body;
  const pkg = await sqlOne('SELECT * FROM course_packages WHERE id = ?', [package_id]);
  if (!pkg) return res.json({ code: 404, message: '课时包不存在' });

  const order_no = 'SP' + Date.now() + Math.floor(Math.random() * 1000);
  const r = await sqlRun(
    'INSERT INTO orders (order_no, user_id, package_id, course_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [order_no, req.user.userId, package_id, course_id, pkg.price, 'pending']
  );
  res.json({ code: 200, message: '订单创建成功', data: { order_id: r.insertId, order_no } });
});

// 支付
app.post('/api/orders/:id/pay', authMiddleware, async (req, res) => {
  const order = await sqlOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  if (order.status !== 'pending') return res.json({ code: 400, message: '订单状态异常' });

  await sqlRun("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [order.id]);

  // 创建课时账户
  const pkg = await sqlOne('SELECT * FROM course_packages WHERE id = ?', [order.package_id]);
  if (pkg) {
    await sqlRun(
      'INSERT INTO user_lessons (user_id, sport_type, total_lessons, package_id, expire_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
      [req.user.userId, pkg.sport_type, pkg.total_lessons, pkg.id, pkg.valid_days]
    );
  }

  res.json({ code: 200, message: '支付成功' });
});

// ===================== 管理后台接口（需认证）====================

// 统计概览
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  const [students] = await pool.query('SELECT COUNT(*) as c FROM users');
  const [coaches] = await pool.query("SELECT COUNT(*) as c FROM coaches WHERE status = 'active'");
  const [courses] = await pool.query("SELECT COUNT(*) as c FROM courses WHERE status = 'online'");
  const [orders] = await pool.query('SELECT COUNT(*) as c FROM orders');
  const [revenue] = await pool.query("SELECT COALESCE(SUM(amount), 0) as t FROM orders WHERE status = 'paid'");

  res.json({ code: 200, data: {
    total_students: students[0].c,
    total_coaches: coaches[0].c,
    total_courses: courses[0].c,
    total_orders: orders[0].c,
    today_revenue: revenue[0].t,
  }});
});

// 学员列表
app.get('/api/admin/students', authMiddleware, async (req, res) => {
  const students = await sqlQuery(`
    SELECT sp.*, u.nickname, u.phone, u.avatar as avatar_url,
           ul.balance_lessons as remaining_lessons
    FROM student_profiles sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN user_lessons ul ON ul.user_id = u.id
    ORDER BY sp.created_at DESC
  `);
  res.json({ code: 200, data: students });
});

// 教练列表
app.get('/api/admin/coaches', authMiddleware, async (req, res) => {
  const coaches = await sqlQuery(`
    SELECT c.*, u.nickname, u.phone, u.avatar as avatar_url
    FROM coaches c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `);
  res.json({ code: 200, data: coaches });
});

// 课程列表
app.get('/api/admin/courses', authMiddleware, async (req, res) => {
  const courses = await sqlQuery('SELECT * FROM courses ORDER BY created_at DESC');
  res.json({ code: 200, data: courses });
});

// 订单列表
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  const { status } = req.query;
  let s = 'SELECT o.*, u.nickname, u.phone FROM orders o JOIN users u ON o.user_id = u.id';
  const params = [];
  if (status) { s += ' WHERE o.status = ?'; params.push(status); }
  s += ' ORDER BY o.created_at DESC';
  const orders = await sqlQuery(s, params);
  res.json({ code: 200, data: orders });
});

// ===================== 启动 =====================

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 全民体育API服务已启动: http://0.0.0.0:${PORT}`);
  });
});

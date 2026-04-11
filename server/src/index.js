// =====================================================
// 全民体育文化平台 - 后端API服务器
// 端口：3001
// 数据库：sql.js (SQLite in-memory/WebAssembly)
// =====================================================

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'sports-platform-secret-key-2026';

// 中间件
app.use(cors());
app.use(express.json());

let db = null;

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'sports.db');

// 初始化数据库
async function initDatabase() {
    const SQL = await initSqlJs();
    
    // 尝试加载已有数据库
    let data = null;
    if (fs.existsSync(DB_PATH)) {
        data = fs.readFileSync(DB_PATH);
    }
    
    db = new SQL.Database(data ? new Uint8Array(data) : undefined);
    
    // 加载SQL schema并执行
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database_schema_clean.sql'), 'utf-8');
    db.run(schema);
    
    // 插入测试数据
    insertTestData();
    
    // 保存数据库
    saveDatabase();
    
    console.log('✅ 数据库初始化完成');
}

// 保存数据库到文件
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

// 简单封装db.prepare
function dbPrepare(sql) {
    return {
        all: (...params) => {
            try {
                const stmt = db.prepare(sql);
                if (params.length > 0 && params[0] !== undefined) {
                    stmt.bind(params);
                }
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            } catch(e) {
                console.error('SQL Error (all):', e.message, sql);
                return [];
            }
        },
        get: (...params) => {
            try {
                const stmt = db.prepare(sql);
                if (params.length > 0 && params[0] !== undefined) {
                    stmt.bind(params);
                }
                let result = null;
                if (stmt.step()) {
                    result = stmt.getAsObject();
                }
                stmt.free();
                return result;
            } catch(e) {
                console.error('SQL Error (get):', e.message, sql);
                return null;
            }
        },
        run: (...params) => {
            try {
                if (params.length > 0 && params[0] !== undefined) {
                    db.run(sql, params);
                } else {
                    db.run(sql);
                }
                saveDatabase();
                const lastId = db.exec("SELECT last_insert_rowid()");
                return { lastInsertRowid: lastId[0]?.values[0][0] || 0 };
            } catch(e) {
                console.error('SQL Error (run):', e.message, sql);
                return { lastInsertRowid: 0 };
            }
        }
    };
}

// 插入测试数据
function insertTestData() {
    try {
        // 检查是否已有数据
        const userCount = db.exec("SELECT COUNT(*) FROM users")[0]?.values[0][0] || 0;
        if (userCount > 0) return;
        
        // 平台
        db.run("INSERT INTO platforms (name, description) VALUES ('全民体育文化平台', '深圳市社会体育培训中心')");
        
        // 机构
        db.run("INSERT INTO organizations (name, type, license_no, status) VALUES ('深圳市社会体育培训中心', 'association', '深教培144030070001631号', 'active')");
        
        // 测试用户
        db.run("INSERT INTO users (phone, password_hash, nickname, role) VALUES ('13800138000', 'admin123', '管理员', 'platform_admin')");
        db.run("INSERT INTO users (phone, password_hash, nickname, role) VALUES ('13800138001', '888999', '张教练', 'coach')");
        
        // 教练
        db.run("INSERT INTO coaches (user_id, sport_types, level, bio, years_experience, status) VALUES (2, '[\"篮球\"]', '高级', '10年教学经验', 10, 'active')");
        
        // 课程
        db.run("INSERT INTO courses (sport_type, name, level, description, duration_minutes, price) VALUES ('篮球', '青少年篮球入门', '初级', '适合6-12岁儿童篮球启蒙', 60, 99.00)");
        db.run("INSERT INTO courses (sport_type, name, level, description, duration_minutes, price) VALUES ('篮球', '篮球技能提升', '中级', '提升投篮、运球技巧', 90, 149.00)");
        db.run("INSERT INTO courses (sport_type, name, level, description, duration_minutes, price) VALUES ('网球', '网球基础班', '初级', '正反手挥拍基础', 60, 120.00)");
        
        console.log('✅ 测试数据已插入');
    } catch (e) {
        console.log('数据已存在或插入失败:', e.message);
    }
}

// =====================================================
// 公共接口
// =====================================================

// 获取运动项目列表
app.get('/api/sports', (req, res) => {
    const sports = [
        { id: 1, name: '篮球', icon: '🏀', color: '#ff6b6b' },
        { id: 2, name: '足球', icon: '⚽', color: '#4ecdc4' },
        { id: 3, name: '网球', icon: '🎾', color: '#ffe66d' },
        { id: 4, name: '乒乓球', icon: '🏓', color: '#95e1d3' },
        { id: 5, name: '羽毛球', icon: '🏸', color: '#a8e6cf' },
        { id: 6, name: '游泳', icon: '🏊', color: '#74b9ff' },
        { id: 7, name: '跆拳道', icon: '🥋', color: '#dfe6e9' },
        { id: 8, name: '台球', icon: '🎱', color: '#fd79a8' },
    ];
    res.json({ code: 200, data: sports });
});

// 获取热门教练
app.get('/api/coaches/popular', (req, res) => {
    const coaches = dbPrepare(`
        SELECT c.*, u.nickname, u.avatar_url 
        FROM coaches c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.status = 'active'
        ORDER BY c.rating DESC, c.total_lessons DESC 
        LIMIT 10
    `).all();
    res.json({ code: 200, data: coaches });
});

// 获取教练列表（带筛选）
app.get('/api/coaches', (req, res) => {
    const { sport_type, level, keyword, coach_type } = req.query;
    let sql = `
        SELECT c.*, u.nickname, u.avatar_url 
        FROM coaches c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.status = 'active'
    `;
    const params = [];
    
    if (coach_type) {
        sql += ' AND c.coach_type = ?';
        params.push(coach_type);
    }
    if (sport_type) {
        sql += ' AND c.sport_types LIKE ?';
        params.push(`%${sport_type}%`);
    }
    if (level && level !== '全部') {
        sql += ' AND c.level = ?';
        params.push(level);
    }
    if (keyword) {
        sql += ' AND u.nickname LIKE ?';
        params.push(`%${keyword}%`);
    }
    
    sql += ' ORDER BY c.rating DESC, c.total_lessons DESC';
    
    const coaches = dbPrepare(sql).all(...params);
    res.json({ code: 200, data: coaches });
});

// 获取教练详情
app.get('/api/coaches/:id', (req, res) => {
    const coach = dbPrepare(`
        SELECT c.*, u.nickname, u.avatar_url, u.phone
        FROM coaches c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    `).get(req.params.id);
    
    if (!coach) {
        return res.json({ code: 404, message: '教练不存在' });
    }
    
    // 获取资质证书
    const certs = dbPrepare('SELECT * FROM coach_certifications WHERE coach_id = ?').all(coach.id);
    coach.certifications = certs;
    
    // 获取学员评价
    const reviews = dbPrepare(`
        SELECT r.*, u.nickname as student_name
        FROM reviews r
        JOIN users u ON r.student_id = u.id
        WHERE r.coach_id = ?
        ORDER BY r.created_at DESC
        LIMIT 10
    `).all(coach.id);
    coach.reviews = reviews;
    
    res.json({ code: 200, data: coach });
});

// 获取课程列表
app.get('/api/courses', (req, res) => {
    const { sport_type, level } = req.query;
    let sql = 'SELECT * FROM courses WHERE status = ?';
    const params = ['active'];
    
    if (sport_type) {
        sql += ' AND sport_type = ?';
        params.push(sport_type);
    }
    if (level) {
        sql += ' AND level = ?';
        params.push(level);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const courses = dbPrepare(sql).all(...params);
    res.json({ code: 200, data: courses });
});

// 获取课程详情
app.get('/api/courses/:id', (req, res) => {
    const course = dbPrepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    
    if (!course) {
        return res.json({ code: 404, message: '课程不存在' });
    }
    
    // 获取课程模块
    const modules = dbPrepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY sequence').all(course.id);
    course.modules = modules;
    
    res.json({ code: 200, data: course });
});

// 获取课程模块详情
app.get('/api/courses/:id/modules', (req, res) => {
    const modules = dbPrepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY sequence').all(req.params.id);
    res.json({ code: 200, data: modules });
});

// 收藏/取消收藏课程
app.post('/api/courses/:id/favorite', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.json({ code: 401, message: '请先登录' });
    }
    // 这里简化处理，实际应该解析token获取userId
    res.json({ code: 200, message: '收藏成功' });
});

// 获取机构列表
app.get('/api/organizations', (req, res) => {
    const orgs = dbPrepare(`
        SELECT * FROM organizations WHERE status = 'active' 
        ORDER BY id DESC
    `).all();
    res.json({ code: 200, data: orgs });
});

// 获取机构详情
app.get('/api/organizations/:id', (req, res) => {
    const org = dbPrepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
    
    if (!org) {
        return res.json({ code: 404, message: '机构不存在' });
    }
    
    // 获取关联的协会信息
    const associations = dbPrepare('SELECT * FROM associations WHERE org_id = ?').all(org.id);
    org.associations = associations;
    
    res.json({ code: 200, data: org });
});

// =====================================================
// 认证接口
// =====================================================

// 发送验证码
app.post('/api/auth/sms/send', (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.json({ code: 400, message: '请输入手机号' });
    }
    
    // 生成6位验证码（实际应该发短信）
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码（生产环境应该用Redis）
    dbPrepare('INSERT OR REPLACE INTO sms_codes (phone, code, expire_at) VALUES (?, ?, datetime("now", "+10 minutes"))').run(phone, code);
    
    console.log(`📱 验证码: ${code}`);
    
    res.json({ code: 200, message: '验证码已发送', data: { code } }); // 测试环境返回验证码
});

// 手机号登录
app.post('/api/auth/login/phone', (req, res) => {
    const { phone, code } = req.body;
    
    // 验证验证码
    const stored = dbPrepare('SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND expire_at > datetime("now")').get(phone, code);
    
    if (!stored) {
        return res.json({ code: 400, message: '验证码错误或已过期' });
    }
    
    // 查找或创建用户
    let user = dbPrepare('SELECT * FROM users WHERE phone = ?').get(phone);
    
    if (!user) {
        // 创建新用户
        const result = dbPrepare('INSERT INTO users (phone, nickname) VALUES (?, ?)').run(phone, '用户' + phone.slice(-4));
        user = dbPrepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }
    
    // 生成Token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
        code: 200, 
        message: '登录成功',
        data: { token, user: { id: user.id, phone: user.phone, nickname: user.nickname, role: user.role } }
    });
});

// 账号密码登录
app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    
    const user = dbPrepare('SELECT * FROM users WHERE phone = ? AND password_hash = ?').get(phone, password);
    
    if (!user) {
        return res.json({ code: 401, message: '账号或密码错误' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
        code: 200, 
        message: '登录成功',
        data: { token, user: { id: user.id, phone: user.phone, nickname: user.nickname, role: user.role } }
    });
});

// =====================================================
// 用户接口（需要认证）
// =====================================================

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.json({ code: 401, message: '请先登录' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.json({ code: 401, message: 'Token无效' });
    }
}

// 获取用户信息
app.get('/api/user/profile', authMiddleware, (req, res) => {
    const user = dbPrepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
        return res.json({ code: 404, message: '用户不存在' });
    }
    
    const profile = dbPrepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
    
    res.json({ code: 200, data: { ...user, profile } });
});

// 更新用户信息
app.put('/api/user/profile', authMiddleware, (req, res) => {
    const { nickname, avatar_url } = req.body;
    
    dbPrepare('UPDATE users SET nickname = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?')
        .run(nickname, avatar_url, req.user.userId);
    
    res.json({ code: 200, message: '更新成功' });
});

// 获取学员档案
app.get('/api/user/student-profile', authMiddleware, (req, res) => {
    const student = dbPrepare('SELECT s.*, u.nickname, u.phone FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?').get(req.user.userId);
    if (!student) {
        return res.json({ code: 404, message: '暂无学员信息' });
    }
    const profile = dbPrepare('SELECT * FROM student_profiles WHERE student_id = ?').get(student.id);
    const stats = dbPrepare('SELECT * FROM sports_stats WHERE student_id = ?').all(student.id);
    res.json({ code: 200, data: { student, profile, stats } });
});

// 获取学习记录
// 获取体测报告
app.get('/api/user/test-reports', authMiddleware, (req, res) => {
    const student = dbPrepare('SELECT id FROM students WHERE user_id = ?').get(req.user.userId);
    if (!student) {
        return res.json({ code: 404, message: '暂无学员信息' });
    }
    const reports = dbPrepare('SELECT * FROM test_reports WHERE student_id = ? ORDER BY test_date DESC').all(student.id);
    res.json({ code: 200, data: reports });
});

// 获取成长档案
app.get('/api/user/growth-records', authMiddleware, (req, res) => {
    const student = dbPrepare('SELECT id FROM students WHERE user_id = ?').get(req.user.userId);
    if (!student) {
        return res.json({ code: 404, message: '暂无学员信息' });
    }
    const records = dbPrepare('SELECT * FROM growth_records WHERE student_id = ? ORDER BY record_date DESC').all(student.id);
    res.json({ code: 200, data: records });
});

app.get('/api/user/learning-records', authMiddleware, (req, res) => {
    const student = dbPrepare('SELECT id FROM students WHERE user_id = ?').get(req.user.userId);
    if (!student) {
        return res.json({ code: 404, message: '暂无学员信息' });
    }
    const records = dbPrepare('SELECT * FROM learning_records WHERE student_id = ? ORDER BY record_date DESC LIMIT 50').all(student.id);
    res.json({ code: 200, data: records });
});

// 获取订单列表
app.get('/api/user/orders', authMiddleware, (req, res) => {
    const orders = dbPrepare(`
        SELECT o.*, c.name as course_name, c.cover_url
        FROM orders o
        JOIN courses c ON o.course_id = c.id
        WHERE o.student_id IN (SELECT id FROM students WHERE user_id = ?)
        ORDER BY o.created_at DESC
    `).all(req.user.userId);
    
    res.json({ code: 200, data: orders });
});

// 收藏/取消收藏
app.post('/api/user/favorites', authMiddleware, (req, res) => {
    const { fav_type, fav_id, action } = req.body; // action: add/remove
    
    if (action === 'remove') {
        dbPrepare('DELETE FROM favorites WHERE user_id = ? AND fav_type = ? AND fav_id = ?')
            .run(req.user.userId, fav_type, fav_id);
        return res.json({ code: 200, message: '已取消收藏' });
    }
    
    dbPrepare('INSERT OR IGNORE INTO favorites (user_id, fav_type, fav_id) VALUES (?, ?, ?)')
        .run(req.user.userId, fav_type, fav_id);
    
    res.json({ code: 200, message: '收藏成功' });
});

// 获取收藏列表
app.get('/api/user/favorites', authMiddleware, (req, res) => {
    const { fav_type } = req.query;
    let sql = 'SELECT * FROM favorites WHERE user_id = ?';
    const params = [req.user.userId];
    
    if (fav_type) {
        sql += ' AND fav_type = ?';
        params.push(fav_type);
    }
    
    const favorites = dbPrepare(sql).all(...params);
    
    // 补充详情
    for (const fav of favorites) {
        if (fav.fav_type === 'coach') {
            const coach = dbPrepare(`
                SELECT c.*, u.nickname, u.avatar_url 
                FROM coaches c JOIN users u ON c.user_id = u.id WHERE c.id = ?
            `).get(fav.fav_id);
            fav.detail = coach;
        } else if (fav.fav_type === 'course') {
            const course = dbPrepare('SELECT * FROM courses WHERE id = ?').get(fav.fav_id);
            fav.detail = course;
        }
    }
    
    res.json({ code: 200, data: favorites });
});

// =====================================================
// 预约下单
// =====================================================

app.post('/api/orders', authMiddleware, (req, res) => {
    const { course_id, coach_id, schedule_id, contact_name, contact_phone } = req.body;
    
    // 获取学员ID
    const student = dbPrepare('SELECT id FROM students WHERE user_id = ?').get(req.user.userId);
    
    if (!student) {
        return res.json({ code: 400, message: '请先完善个人信息' });
    }
    
    // 获取课程信息
    const course = dbPrepare('SELECT * FROM courses WHERE id = ?').get(course_id);
    
    if (!course) {
        return res.json({ code: 404, message: '课程不存在' });
    }
    
    // 生成订单号
    const order_no = 'SP' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 创建订单
    const result = dbPrepare(`
        INSERT INTO orders (order_no, student_id, course_id, coach_id, org_id, original_price, final_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(order_no, student.id, course_id, coach_id || null, course.org_id || 1, course.price, course.price);
    
    res.json({ 
        code: 200, 
        message: '订单创建成功',
        data: { order_id: result.lastInsertRowid, order_no }
    });
});

// 支付订单
app.post('/api/orders/:id/pay', authMiddleware, (req, res) => {
    const { payment_method } = req.body;
    
    const order = dbPrepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    
    if (!order) {
        return res.json({ code: 404, message: '订单不存在' });
    }
    
    if (order.status !== 'pending') {
        return res.json({ code: 400, message: '订单状态异常' });
    }
    
    // 更新订单状态
    dbPrepare(`
        UPDATE orders SET status = 'paid', payment_method = ?, payment_time = datetime('now') WHERE id = ?
    `).run(payment_method, req.params.id);
    
    // 创建课时包
    const course = dbPrepare('SELECT * FROM courses WHERE id = ?').get(order.course_id);
    dbPrepare(`
        INSERT INTO lesson_packages (order_id, total_lessons, remaining_lessons, expire_date)
        VALUES (?, ?, ?, datetime('now', '+1 year'))
    `).run(order.id, course.duration_minutes >= 60 ? 10 : 20, course.duration_minutes >= 60 ? 10 : 20);
    
    res.json({ code: 200, message: '支付成功' });
});

// =====================================================
// 管理后台接口
// =====================================================

// 统计概览
app.get('/api/admin/stats', authMiddleware, (req, res) => {
    if (req.user.role !== 'org_admin' && req.user.role !== 'platform_admin') {
        return res.json({ code: 403, message: '权限不足' });
    }
    
    const today = new Date().toISOString().slice(0, 10);
    
    const stats = {
        total_students: dbPrepare('SELECT COUNT(*) as count FROM students').get().count,
        total_coaches: dbPrepare('SELECT COUNT(*) as count FROM coaches WHERE status = ?').get('active').count,
        total_courses: dbPrepare('SELECT COUNT(*) as count FROM courses').get().count,
        total_orders: dbPrepare('SELECT COUNT(*) as count FROM orders').get().count,
        today_orders: dbPrepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today).count,
        today_revenue: dbPrepare("SELECT COALESCE(SUM(final_price), 0) as total FROM orders WHERE date(created_at) = ? AND status = 'paid'").get(today).total,
    };
    
    res.json({ code: 200, data: stats });
});

// 学员管理
app.get('/api/admin/students', authMiddleware, (req, res) => {
    const students = dbPrepare(`
        SELECT s.*, u.nickname, u.phone, u.avatar_url
        FROM students s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
    `).all();
    res.json({ code: 200, data: students });
});

app.post('/api/admin/students', authMiddleware, (req, res) => {
    const { phone, nickname, guardian_name, guardian_phone, relation } = req.body;
    
    // 查找或创建用户
    let user = dbPrepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (!user) {
        const result = dbPrepare('INSERT INTO users (phone, nickname, role) VALUES (?, ?, ?)').run(phone, nickname, 'student');
        user = { id: result.lastInsertRowid };
    }
    
    const result = dbPrepare(`
        INSERT INTO students (user_id, guardian_name, guardian_phone, relation, org_id)
        VALUES (?, ?, ?, ?, 1)
    `).run(user.id, guardian_name, guardian_phone, relation);
    
    res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
});

app.put('/api/admin/students/:id', authMiddleware, (req, res) => {
    const { guardian_name, guardian_phone, relation, status } = req.body;
    dbPrepare(`
        UPDATE students SET guardian_name = ?, guardian_phone = ?, relation = ?, status = ? WHERE id = ?
    `).run(guardian_name, guardian_phone, relation, status, req.params.id);
    res.json({ code: 200, message: '更新成功' });
});

app.delete('/api/admin/students/:id', authMiddleware, (req, res) => {
    dbPrepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
});

// 教练管理
app.get('/api/admin/coaches', authMiddleware, (req, res) => {
    const coaches = dbPrepare(`
        SELECT c.*, u.nickname, u.phone, u.avatar_url
        FROM coaches c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
    `).all();
    res.json({ code: 200, data: coaches });
});

app.post('/api/admin/coaches', authMiddleware, (req, res) => {
    const { phone, nickname, sport_types, level, bio, years_experience, password } = req.body;
    
    let user = dbPrepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (!user) {
        const pwd = password || '888999'; // 默认密码
        const result = dbPrepare('INSERT INTO users (phone, password_hash, nickname, role) VALUES (?, ?, ?, ?)').run(phone, pwd, nickname, 'coach');
        user = { id: result.lastInsertRowid };
    }
    
    const result = dbPrepare(`
        INSERT INTO coaches (user_id, sport_types, level, bio, years_experience, status, org_id)
        VALUES (?, ?, ?, ?, ?, 'active', 1)
    `).run(user.id, JSON.stringify(sport_types), level, bio, years_experience);
    
    res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
});

app.put('/api/admin/coaches/:id', authMiddleware, (req, res) => {
    const { sport_types, level, bio, years_experience, status } = req.body;
    dbPrepare(`
        UPDATE coaches SET sport_types = ?, level = ?, bio = ?, years_experience = ?, status = ? WHERE id = ?
    `).run(JSON.stringify(sport_types), level, bio, years_experience, status, req.params.id);
    res.json({ code: 200, message: '更新成功' });
});

app.delete('/api/admin/coaches/:id', authMiddleware, (req, res) => {
    dbPrepare('DELETE FROM coaches WHERE id = ?').run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
});

// 课程管理
app.get('/api/admin/courses', authMiddleware, (req, res) => {
    const courses = dbPrepare('SELECT * FROM courses ORDER BY created_at DESC').all();
    res.json({ code: 200, data: courses });
});

app.post('/api/admin/courses', authMiddleware, (req, res) => {
    const { sport_type, name, level, description, duration_minutes, price, cover_url } = req.body;
    
    const result = dbPrepare(`
        INSERT INTO courses (sport_type, name, level, description, duration_minutes, price, cover_url, org_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(sport_type, name, level, description, duration_minutes, price, cover_url);
    
    res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
});

app.put('/api/admin/courses/:id', authMiddleware, (req, res) => {
    const { sport_type, name, level, description, duration_minutes, price, cover_url, status } = req.body;
    dbPrepare(`
        UPDATE courses SET sport_type = ?, name = ?, level = ?, description = ?, duration_minutes = ?, price = ?, cover_url = ?, status = ? WHERE id = ?
    `).run(sport_type, name, level, description, duration_minutes, price, cover_url, status, req.params.id);
    res.json({ code: 200, message: '更新成功' });
});

app.delete('/api/admin/courses/:id', authMiddleware, (req, res) => {
    dbPrepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
});

// 订单管理
app.get('/api/admin/orders', authMiddleware, (req, res) => {
    const { status } = req.query;
    let sql = `
        SELECT o.*, c.name as course_name, s.guardian_name, u.phone
        FROM orders o
        JOIN courses c ON o.course_id = c.id
        JOIN students s ON o.student_id = s.id
        JOIN users u ON s.user_id = u.id
    `;
    
    if (status) {
        sql += ' WHERE o.status = ?';
        sql += ' ORDER BY o.created_at DESC';
        const orders = dbPrepare(sql).all(status);
        return res.json({ code: 200, data: orders });
    }
    
    sql += ' ORDER BY o.created_at DESC';
    const orders = dbPrepare(sql).all();
    res.json({ code: 200, data: orders });
});

// 排课管理
app.get('/api/admin/schedules', authMiddleware, (req, res) => {
    const schedules = dbPrepare(`
        SELECT sc.*, c.name as course_name, u.nickname as coach_name
        FROM schedules sc
        JOIN courses c ON sc.course_id = c.id
        JOIN coaches co ON sc.coach_id = co.id
        JOIN users u ON co.user_id = u.id
        ORDER BY sc.scheduled_date DESC
    `).all();
    res.json({ code: 200, data: schedules });
});

app.post('/api/admin/schedules', authMiddleware, (req, res) => {
    const { course_id, coach_id, class_name, location, scheduled_date, scheduled_time, duration_minutes, max_students } = req.body;
    
    const org = dbPrepare('SELECT org_id FROM coaches WHERE id = ?').get(coach_id);
    
    const result = dbPrepare(`
        INSERT INTO schedules (course_id, coach_id, org_id, class_name, location, scheduled_date, scheduled_time, duration_minutes, max_students)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(course_id, coach_id, org?.org_id || 1, class_name, location, scheduled_date, scheduled_time, duration_minutes, max_students);
    
    res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
});

// 考勤记录
app.get('/api/admin/attendance', authMiddleware, (req, res) => {
    const { date } = req.query;
    let sql = `
        SELECT a.*, sc.scheduled_date, sc.scheduled_time, c.name as course_name, u.nickname as student_name
        FROM attendance a
        JOIN schedules sc ON a.schedule_id = sc.id
        JOIN courses c ON sc.course_id = c.id
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
    `;
    
    if (date) {
        sql += ' WHERE date(sc.scheduled_date) = ?';
        sql += ' ORDER BY a.check_in_time DESC';
        const attendance = dbPrepare(sql).all(date);
        return res.json({ code: 200, data: attendance });
    }
    
    sql += ' ORDER BY a.check_in_time DESC';
    const attendance = dbPrepare(sql).all();
    res.json({ code: 200, data: attendance });
});

// =====================================================
// 教师端接口
// =====================================================

// 获取今日课表
app.get('/api/teacher/schedules/today', authMiddleware, (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    
    const schedules = dbPrepare(`
        SELECT sc.*, c.name as course_name, c.cover_url
        FROM schedules sc
        JOIN courses c ON sc.course_id = c.id
        WHERE date(sc.scheduled_date) = ? AND sc.status = 'scheduled'
        ORDER BY sc.scheduled_time
    `).all(today);
    
    res.json({ code: 200, data: schedules });
});

// 获取学员列表
app.get('/api/teacher/students', authMiddleware, (req, res) => {
    const students = dbPrepare(`
        SELECT s.*, u.nickname, u.phone, lp.remaining_lessons
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN lesson_packages lp ON s.id = lp.order_id AND lp.status = 'active'
        WHERE s.status = 'active'
        ORDER BY u.nickname
    `).all();
    
    res.json({ code: 200, data: students });
});

// 考勤签到
app.post('/api/teacher/attendance', authMiddleware, (req, res) => {
    const { schedule_id, student_id, status, notes } = req.body;
    
    const result = dbPrepare(`
        INSERT INTO attendance (schedule_id, student_id, status, check_in_time, lessons_consumed)
        VALUES (?, ?, ?, datetime('now'), 1)
    `).run(schedule_id, student_id, status || 'present');
    
    // 扣减课时
    dbPrepare(`
        UPDATE lesson_packages SET used_lessons = used_lessons + 1, remaining_lessons = remaining_lessons - 1
        WHERE student_id = ? AND status = 'active' AND remaining_lessons > 0
    `).run(student_id);
    
    res.json({ code: 200, message: '签到成功' });
});

// 课后点评
app.post('/api/teacher/reviews', authMiddleware, (req, res) => {
    const { schedule_id, student_id, rating, content, tags } = req.body;
    
    const coach = dbPrepare('SELECT id FROM coaches WHERE user_id = ?').get(req.user.userId);
    
    const result = dbPrepare(`
        INSERT INTO reviews (schedule_id, student_id, coach_id, rating, content, tags)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(schedule_id, student_id, coach?.id, rating, content, JSON.stringify(tags || []));
    
    res.json({ code: 200, message: '点评成功' });
});

// =====================================================
// 机构端接口
// =====================================================

// 获取机构数据
app.get('/api/org/dashboard', authMiddleware, (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    
    const stats = {
        student_count: dbPrepare('SELECT COUNT(*) as count FROM students WHERE org_id = ?').get(1).count,
        coach_count: dbPrepare('SELECT COUNT(*) as count FROM coaches WHERE org_id = ? AND status = ?').get(1, 'active').count,
        course_count: dbPrepare('SELECT COUNT(*) as count FROM courses WHERE org_id = ?').get(1).count,
        month_revenue: dbPrepare("SELECT COALESCE(SUM(final_price), 0) as total FROM orders WHERE org_id = 1 AND status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get().total,
    };
    
    res.json({ code: 200, data: stats });
});

// 启动服务器
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ API服务器运行中: http://localhost:${PORT}`);
        console.log(`🌐 访问地址: https://api.zhuoyusmart.top`);
    });
}).catch(err => {
    console.error('❌ 数据库初始化失败:', err);
    process.exit(1);
});

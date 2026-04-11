/**
 * 全民体育文化平台 - MySQL 数据初始化脚本
 * 为 sports_platform 数据库插入测试数据
 */

const mysql = require('mysql2/promise');

async function initTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'sportsapp',
    password: process.env.DB_PASSWORD || 'SportsApp@2026#db',
    database: process.env.DB_NAME || 'sports_platform',
    waitForConnections: true,
    connectionLimit: 5
  });

  console.log('✅ Connected to MySQL, inserting test data...');

  try {
    // 检查是否已有数据
    const [users] = await connection.query('SELECT COUNT(*) as c FROM users');
    if (users[0].c > 0) {
      console.log('数据已存在，跳过初始化');
      return;
    }

    // ===================== 用户 & 教练 & 课程 =====================

    // 插入学员用户
    await connection.query(`
      INSERT INTO users (phone, nickname, real_name, gender, status) VALUES
      ('13800138001', '张教练', '张明', 'male', 1),
      ('13800138002', '李教练', '李娜', 'female', 1),
      ('13800138003', '王教练', '王国强', 'male', 1),
      ('13800138004', '赵教练', '赵敏', 'female', 1),
      ('13800138005', '刘教练', '刘伟', 'male', 1),
      ('13900139001', '学员小龙', '陈小龙', 'male', 1),
      ('13900139002', '学员小美', '王小美', 'female', 1),
      ('13900139003', '学员小强', '张小强', 'male', 1)
    `);

    // 插入教练
    await connection.query(`
      INSERT INTO coaches (user_id, institution_id, nickname, sport_types, level, bio, years_experience, price, coach_type, rating, total_lessons) VALUES
      (1, 1, '张教练', '["篮球"]', 'senior', '10年教学经验，擅长青少年篮球', 10, 150, 'official', 5.0, 0),
      (2, 1, '李教练', '["篮球"]', 'intermediate', '5年教学经验', 5, 150, 'official', 5.0, 0),
      (3, 1, '王教练', '["网球"]', 'senior', '8年职业网球教练', 8, 150, 'official', 5.0, 0),
      (4, 1, '赵教练', '["游泳"]', 'senior', '国家游泳运动员', 10, 150, 'official', 5.0, 0),
      (5, 1, '刘教练', '["篮球","足球"]', 'intermediate', '5年教学经验，擅长青少年篮球', 5, 150, 'official', 5.0, 0)
    `);

    // 插入合作教练
    await connection.query(`
      INSERT INTO coaches (user_id, nickname, sport_types, level, bio, years_experience, price, coach_type) VALUES
      (NULL, '合作李教练', '["羽毛球"]', 'primary', '合作教练', 3, 150, 'partner'),
      (NULL, '合作王教练', '["网球"]', 'primary', '合作教练', 3, 150, 'partner'),
      (NULL, '合作张教练', '["足球"]', 'primary', '合作教练', 3, 150, 'partner'),
      (NULL, '合作刘教练', '["足球"]', 'primary', '合作教练', 3, 150, 'partner')
    `);

    // 插入课时包
    await connection.query(`
      INSERT INTO course_packages (name, sport_type, total_lessons, price, valid_days, description) VALUES
      ('篮球入门套餐', '篮球', 10, 1200, 180, '10课时篮球入门，送定制篮球服'),
      ('网球进阶套餐', '网球', 20, 2200, 365, '20课时，送网球拍一只'),
      ('中考体育特训', '体能', 30, 3600, 365, '针对深圳中考体育项目强化训练'),
      ('暑期游泳班', '游泳', 15, 1800, 90, '暑期集中训练，15课时'),
      ('羽毛球私教', '羽毛球', 8, 1600, 120, '一对一私教，8课时')
    `);

    // 插入课程
    await connection.query(`
      INSERT INTO courses (coach_id, institution_id, title, sport_type, description, price, duration_min, status) VALUES
      (1, 1, '青少年篮球入门班', '篮球', '适合6-12岁儿童篮球启蒙，培养运动兴趣', 150, 90, 'online'),
      (1, 1, '篮球技能提升班', '篮球', '提升投篮、运球、战术配合', 180, 90, 'online'),
      (2, 1, '中考体育强化班', '体能', '深圳中考体育项目专项训练', 200, 120, 'online'),
      (3, 1, '网球基础班', '网球', '正反手挥拍基础，发球训练', 150, 60, 'online'),
      (3, 1, '网球进阶班', '网球', '战术配合，比赛规则讲解', 180, 90, 'online'),
      (4, 1, '游泳零基础班', '游泳', '克服恐水，学会蛙泳', 180, 90, 'online'),
      (5, 1, '足球兴趣班', '足球', '基础传球、带球、射门', 150, 90, 'online')
    `);

    // 插入班级
    await connection.query(`
      INSERT INTO classes (name, course_id, coach_id, semester, start_date, end_date, max_students, status) VALUES
      ('篮球周六班', 1, 1, '2026春季', '2026-03-01', '2026-06-30', 15, 'ongoing'),
      ('网球周日班', 4, 3, '2026春季', '2026-03-02', '2026-06-29', 10, 'ongoing'),
      ('游泳暑期班', 6, 4, '2026暑期', '2026-07-01', '2026-08-31', 12, 'recruiting')
    `);

    // 关联学员到班级
    await connection.query(`
      INSERT INTO class_students (class_id, student_id) VALUES (1, 6), (1, 7), (1, 8)
    `);

    console.log('✅ 测试数据插入完成');
  } catch (err) {
    console.error('❌ 初始化数据失败:', err.message);
  } finally {
    await connection.end();
  }
}

module.exports = { initTestData };

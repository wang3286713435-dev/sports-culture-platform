const initSqlJs = require('sql.js');
const fs = require('fs');

async function addTables() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('sports.db'));
  
  // 添加课程类型和模块相关字段
  db.run("ALTER TABLE courses ADD COLUMN course_type VARCHAR(20) DEFAULT 'student'");
  db.run("ALTER TABLE courses ADD COLUMN is_video TINYINT DEFAULT 1");
  
  // 创建课程模块表
  db.run(`
    CREATE TABLE IF NOT EXISTS course_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      duration_minutes INTEGER,
      sequence INTEGER DEFAULT 0,
      content_type VARCHAR(20) DEFAULT 'video',
      content_url TEXT,
      content_text TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);
  
  // 保存
  const data = db.export();
  fs.writeFileSync('sports.db', Buffer.from(data));
  console.log('✅ 数据库更新完成');
  
  // 插入篮球相关课程
  db.run("DELETE FROM courses WHERE sport_type = '篮球'");
  
  // 学员课程（视频+文章）
  db.run("INSERT INTO courses (sport_type, name, level, course_type, description, duration_minutes, price, is_video, status) VALUES ('篮球', '篮球初级学员课程', '初级', 'student', '适合6-12岁儿童篮球启蒙，打好基础', 60, 99, 1, 'active')");
  db.run("INSERT INTO courses (sport_type, name, level, course_type, description, duration_minutes, price, is_video, status) VALUES ('篮球', '篮球小裁判员初级课程', '初级', 'student', '学习篮球裁判基础知识', 60, 99, 1, 'active')");
  
  // 教练课程（图文）
  db.run("INSERT INTO courses (sport_type, name, level, course_type, description, duration_minutes, price, is_video, status) VALUES ('篮球', '篮球教练初级课程', '初级', 'coach', '教练入门培训课程', 90, 199, 0, 'active')");
  db.run("INSERT INTO courses (sport_type, name, level, course_type, description, duration_minutes, price, is_video, status) VALUES ('篮球', '篮球裁判员初级课程', '初级', 'referee', '裁判员认证培训', 90, 199, 0, 'active')");
  
  // 获取新插入的课程ID
  const courses = db.exec("SELECT id, name, course_type FROM courses WHERE sport_type = '篮球'");
  if (courses[0]) {
    courses[0].values.forEach(v => {
      console.log('课程:', v[1], '- 类型:', v[2], '- ID:', v[0]);
      // 为每个课程添加20个小节
      for (let i = 1; i <= 20; i++) {
        const contentType = v[2] === 'student' ? 'video' : 'article';
        db.run("INSERT INTO course_modules (course_id, name, description, duration_minutes, sequence, content_type) VALUES (?, ?, ?, ?, ?, ?)", 
          [v[0], '第' + i + '节', '课程内容详情', 10, i, contentType]);
      }
    });
  }
  
  // 保存
  const data2 = db.export();
  fs.writeFileSync('sports.db', Buffer.from(data2));
  console.log('✅ 篮球课程和模块已添加');
  
  db.close();
}

addTables().catch(console.error);

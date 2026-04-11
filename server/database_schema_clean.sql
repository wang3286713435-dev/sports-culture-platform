PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'student', 
    status VARCHAR(20) DEFAULT 'active', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    real_name VARCHAR(100),
    gender VARCHAR(10),
    birthday DATE,
    id_card VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    medical_info TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id INTEGER DEFAULT 1,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50), 
    license_no VARCHAR(100), 
    legal_person VARCHAR(100),
    contact_phone VARCHAR(20),
    address VARCHAR(500),
    logo_url VARCHAR(500),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
);
CREATE TABLE IF NOT EXISTS associations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    sport_type VARCHAR(100) NOT NULL, 
    level VARCHAR(50), 
    certificate_urls TEXT, 
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS community_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    community_name VARCHAR(200),
    property_company VARCHAR(200),
    address VARCHAR(500),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    revenue_share_percent DECIMAL(5,2), 
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    org_id INTEGER,
    sport_types VARCHAR(500), 
    level VARCHAR(50), 
    certification_no VARCHAR(100), 
    bio TEXT,
    years_experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_lessons INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS coach_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL,
    cert_type VARCHAR(100), 
    cert_no VARCHAR(100),
    issue_org VARCHAR(200),
    issue_date DATE,
    expire_date DATE,
    cert_url VARCHAR(500),
    FOREIGN KEY (coach_id) REFERENCES coaches(id)
);
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    org_id INTEGER,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20) NOT NULL,
    relation VARCHAR(20), 
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    height DECIMAL(5,1),
    weight DECIMAL(5,1),
    health_level VARCHAR(50),
    goal TEXT, 
    medical_notes TEXT,
    last_体检 DATE,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
CREATE TABLE IF NOT EXISTS learning_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER,
    action_name VARCHAR(200) NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    progress_percent INTEGER DEFAULT 0, 
    notes TEXT,
    record_date DATE DEFAULT (DATE('now')),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER,
    sport_type VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    level VARCHAR(50), 
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10,2),
    cover_url VARCHAR(500),
    module_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sequence INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS course_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    duration_standard INTEGER, 
    sequence INTEGER DEFAULT 0,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    coach_id INTEGER,
    org_id INTEGER NOT NULL,
    original_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    payment_method VARCHAR(50), 
    payment_time DATETIME,
    expire_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS lesson_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    total_lessons INTEGER NOT NULL,
    used_lessons INTEGER DEFAULT 0,
    remaining_lessons INTEGER NOT NULL,
    expire_date DATE,
    status VARCHAR(20) DEFAULT 'active', 
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    paid_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE IF NOT EXISTS profit_sharing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    sport_type VARCHAR(100),
    platform_percent DECIMAL(5,2) DEFAULT 10.00, 
    association_percent DECIMAL(5,2), 
    org_percent DECIMAL(5,2), 
    coach_percent DECIMAL(5,2), 
    community_percent DECIMAL(5,2), 
    effective_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_amount DECIMAL(10,2),
    association_amount DECIMAL(10,2),
    org_amount DECIMAL(10,2),
    coach_amount DECIMAL(10,2),
    community_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending', 
    settled_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    org_id INTEGER NOT NULL,
    class_name VARCHAR(200),
    location VARCHAR(200),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_students INTEGER DEFAULT 10,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled', 
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'booked', 
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'present', 
    check_in_time DATETIME,
    check_out_time DATETIME,
    lessons_consumed DECIMAL(3,1) DEFAULT 1.0,
    notes TEXT,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    content TEXT,
    tags VARCHAR(200), 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id)
);
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fav_type VARCHAR(50) NOT NULL, 
    fav_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fav_type, fav_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200),
    content TEXT,
    type VARCHAR(50), 
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_coaches_user ON coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

# 全民体育文化平台 - 开发文档

## 📋 项目概述

**项目名称**：全民体育文化平台  
**主办方**：深圳市社会体育培训中心（深圳市教育局主管）  
**办学备案证编号**：深教培144030070001631号  
**平台定位**：深圳市唯一具备办学资质的体育类培训服务平台

---

## 🏗️ 技术架构

### 前端 (H5)
- **技术栈**：Vue3 + Vant4 + Vite
- **端口**：3000
- **访问地址**：https://h5.zhuoyusmart.top/

### 后端 (Server)
- **技术栈**：Node.js + Express + SQLite
- **端口**：3001
- **访问地址**：https://api.zhuoyusmart.top/

### 服务器 (新)
- **IP**：134.175.238.186
- **系统**：Ubuntu 22.04 + Docker 26

---

## ✅ 已完成功能

### 1. 课程介绍 (/courses)
- 32个体育课程分类
- 课程详情页（20节模块内容）
- 在线预约下单

### 2. 运动项目 (/coaches)
- 一级Tab：深社体认证教练 / 合作教练
- 二级筛选：运动项目
- 教练详情页（资质证书、学员评价）

### 3. 学员档案 (/profile)
- 体测数据：身高、体重、BMI、肺活量、50米跑、跳绳
- 运动统计：按项目分类统计时长和次数
- 学习记录：每节课的动作名称、时长、完成状态
- 成长档案：时间线展示，含课程、技能等级、证书

### 4. 中心简介 (/about)
- 机构简介
- 资质认证（办学备案证编号）
- 培训项目展示
- 核心优势
- 联系方式

### 5. 用户中心 (/user)
- 手机号 + 验证码登录
- 手机号 + 密码登录
- 自动注册功能（新用户直接登录）
- 我的订单
- 我的钱包
- 我的收藏
- 关注教练
- 考勤记录
- 结业证书

### 6. 机构入驻 (/join)
- 机构申请表单
- 资质上传

---

## 🔄 待开发功能

### P0 - 优先开发
1. **找场地** (/venues) - 场地列表、场地详情、预约
2. **合作协会** (/associations) - 协会展示、合作动态
3. **相关活动** (/articles) - 活动列表、活动详情、报名
4. **裁判档案** (/referee) - 裁判员信息、资质认证

### P1 - 核心功能
1. 微信支付对接
2. 短信验证码服务配置
3. 后台管理系统（管理教练、课程、订单）
4. 教师端（教练上课考勤）

### P2 - 进阶功能
1. 体测评估报告生成
2. 运动处方推荐
3. 赛事活动发布与报名
4. 学员积分系统
5. 家校互动通知

---

## 📁 项目结构

```
sports-culture-platform/
├── h5/                      # H5前端项目
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── api/             # API接口
│   │   ├── router/          # 路由配置
│   │   └── assets/          # 静态资源
│   └── package.json
│
├── server/                  # 后端API项目
│   ├── src/
│   │   ├── index.js         # 入口文件
│   │   └── sports.db        # SQLite数据库
│   └── package.json
│
└── README.md
```

---

## 🚀 部署指南

### 方式一：Docker部署（推荐）

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh

# 2. 克隆项目并部署
docker-compose up -d
```

### 方式二：手动部署

```bash
# 1. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装依赖
cd h5 && npm install
cd ../server && npm install

# 3. 启动服务
# 后端
cd server && node src/index.js

# 前端
cd h5 && npm run dev
```

### Nginx配置

```nginx
server {
    listen 80;
    server_name h5.zhuoyusmart.top;
    location / {
        proxy_pass http://localhost:3000;
    }
}

server {
    listen 80;
    server_name api.zhuoyusmart.top;
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

---

## 🔧 环境变量

### 后端 (.env)
```
PORT=3001
JWT_SECRET=your_secret_key
```

### 前端
API地址在 `h5/src/api/index.js` 中配置

---

## 📞 客服信息

- 客服热线：0755-12345678
- 邮箱：service@quantiyusmart.top
- 地址：深圳市福田区体育中心

---

## 📅 更新日志

### 2026-04-02
- 完成课程介绍、运动项目、学员档案、中心简介、用户中心
- 实现登录/注册一体化功能
- 新服务器就绪，准备迁移

---

*最后更新：2026-04-02*

<template>
  <div class="about-page">
    <!-- 顶部背景 -->
    <div class="header-bg">
      <div class="header-content">
        <div class="logo-icon">🏆</div>
        <div class="org-name">深圳市社会体育培训中心</div>
      </div>
    </div>

    <!-- 机构简介 -->
    <div class="section card">
      <div class="section-title">🏢 机构简介</div>
      <div class="intro-text">
        深圳市社会体育培训中心是由深圳市教育局主管的具有办学资质的体育类培训机构，主要从事体育类培训，办学层次为成人、青少年非学历教育。
      </div>
      <div class="intro-text">
        培训中心将陆续与各单项协会及学会合作，开展体育项目培训工作，为深圳市民提供专业的体育培训服务。
      </div>
    </div>

    <!-- 资质认证 -->
    <div class="section card">
      <div class="section-title">📜 资质认证</div>
      <div class="license-item">
        <div class="license-label">办学备案证编号</div>
        <div class="license-value">深教培144030070001631号</div>
      </div>
      <div class="license-item">
        <div class="license-label">主管部门</div>
        <div class="license-value">深圳市教育局</div>
      </div>
      <div class="license-item">
        <div class="license-label">办学层次</div>
        <div class="license-value">成人、青少年非学历教育</div>
      </div>
    </div>

    <!-- 培训项目 -->
    <div class="section card">
      <div class="section-title">🏃 培训项目</div>
      <div class="sports-grid">
        <div class="sport-item" v-for="sport in sports" :key="sport">
          <span class="sport-icon">{{ sport.icon }}</span>
          <span class="sport-name">{{ sport.name }}</span>
        </div>
      </div>
    </div>

    <!-- 核心优势 -->
    <div class="section card">
      <div class="section-title">⭐ 核心优势</div>
      <div class="advantage-list">
        <div class="advantage-item">
          <div class="advantage-icon">✅</div>
          <div class="advantage-content">
            <div class="advantage-title">政府认证</div>
            <div class="advantage-desc">深圳市教育局主管，具备办学资质</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">👨‍🏫</div>
          <div class="advantage-content">
            <div class="advantage-title">专业教练</div>
            <div class="advantage-desc">退役运动员、省队教练、持证教练</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">📋</div>
          <div class="advantage-content">
            <div class="advantage-title">标准化课程</div>
            <div class="advantage-desc">与协会合作，制定教学标准</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">🏆</div>
          <div class="advantage-content">
            <div class="advantage-title">赛事活动</div>
            <div class="advantage-desc">组织各类体育赛事，丰富学员经历</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系信息 -->
    <div class="section card">
      <div class="section-title">📞 联系我们</div>
      <div class="contact-item">
        <span class="contact-icon">📱</span>
        <span>客服热线：0755-12345678</span>
      </div>
      <div class="contact-item">
        <span class="contact-icon">📧</span>
        <span>邮箱：service@quantiyusmart.top</span>
      </div>
      <div class="contact-item">
        <span class="contact-icon">📍</span>
        <span>地址：深圳市福田区体育中心</span>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer">
      <div class="footer-text">© 深圳市社会体育培训中心</div>
      <div class="footer-sub">全民体育文化平台</div>
    </div>
  </div>
</template>

<script setup>
const sports = [
  { name: '篮球', icon: '🏀' },
  { name: '足球', icon: '⚽' },
  { name: '网球', icon: '🎾' },
  { name: '乒乓球', icon: '🏓' },
  { name: '羽毛球', icon: '🏸' },
  { name: '游泳', icon: '🏊' },
  { name: '跆拳道', icon: '🥋' },
  { name: '台球', icon: '🎱' }
]
</script>

<style scoped>
.about-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.header-bg {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 40px 20px 60px;
  text-align: center;
}

.logo-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.org-name {
  font-size: 22px;
  font-weight: 700;
  color: white;
}

.card {
  background: white;
  margin: -30px 16px 12px;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.intro-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 12px;
}

.license-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.license-item:last-child {
  border-bottom: none;
}

.license-label {
  font-size: 14px;
  color: #999;
}

.license-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.sports-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.sport-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.sport-icon {
  font-size: 24px;
}

.sport-name {
  font-size: 12px;
  color: #666;
}

.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advantage-item {
  display: flex;
  gap: 12px;
}

.advantage-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.advantage-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.advantage-desc {
  font-size: 12px;
  color: #999;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
}

.contact-icon {
  font-size: 16px;
}

.footer {
  text-align: center;
  padding: 30px 20px;
}

.footer-text {
  font-size: 13px;
  color: #bbb;
}

.footer-sub {
  font-size: 12px;
  color: #ddd;
  margin-top: 4px;
}
</style>

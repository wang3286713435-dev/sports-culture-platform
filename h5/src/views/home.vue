<template>
  <div class="home">
    <!-- 顶部白色导航 -->
    <div class="home-header">
      <div class="header-content">
        <div class="logo-row">
          <span class="logo-text">全民体育文化平台</span>
        </div>
        <van-icon name="bell-o" size="22" @click="$router.push('/notifications')" />
      </div>
      <!-- 搜索栏 -->
      <div class="search-bar" @click="goSearch">
        <van-icon name="search" size="16" color="#999" />
        <span>搜索教练、课程...</span>
      </div>
    </div>

    <!-- Banner轮播 -->
    <div class="banner-wrap">
      <van-swipe autoplay="3000" indicator-color="white" class="banner-swipe">
        <van-swipe-item>
          <div class="banner-slide slide-1">
            <div class="slide-content">
              <div class="slide-title">政府认证 · 资质合规</div>
              <div class="slide-desc">深圳市唯一市级体育类培训资质</div>
            </div>
          </div>
        </van-swipe-item>
        <van-swipe-item>
          <div class="banner-slide slide-2">
            <div class="slide-content">
              <div class="slide-title">冠军教练团队</div>
              <div class="slide-desc">国家队退役运动员，前省队专业教练</div>
            </div>
          </div>
        </van-swipe-item>
        <van-swipe-item>
          <div class="banner-slide slide-3">
            <div class="slide-content">
              <div class="slide-title">官方权威合作</div>
              <div class="slide-desc">深圳市社会体育培训中心官方平台</div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 功能导航 - 统一卡片 -->
    <div class="nav-grid-section">
      <div class="nav-grid-card">
        <div class="nav-item" v-for="item in navItems" :key="item.path" @click="$router.push(item.path)">
          <div class="nav-item-icon" :style="{ background: item.color }">{{ item.icon }}</div>
          <div class="nav-item-name">{{ item.name }}</div>
        </div>
      </div>
    </div>

    <!-- 相关活动 - 公众号风格 -->
    <div class="section articles-section">
      <div class="section-title-row">
        <span class="section-title">📰 相关活动</span>
        <span class="section-more" @click="$router.push('/articles')">更多 <van-icon name="arrow-right" size="12" /></span>
      </div>
      <div class="articles-list">
        <div class="article-item" v-for="event in events.slice(0, 3)" :key="event.id" @click="$router.push('/articles/' + event.id)">
          <img :src="event.cover" class="article-cover" />
          <div class="article-content">
            <div class="article-title">{{ event.title }}</div>
            <div class="article-meta">
              <span>{{ event.date }}</span>
              <span>阅读 {{ event.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 运动分类 -->
    <div class="section sports-section">
      <div class="section-title-row">
        <span class="section-title">运动分类</span>
      </div>
      <div class="sports-grid">
        <div
          v-for="sport in sportsTypes"
          :key="sport.id"
          class="sport-item"
          @click="goToSport(sport.name)"
        >
          <div class="sport-icon-bg" :style="{ background: sport.color + '15' }">
            <span class="sport-icon">{{ sport.icon }}</span>
          </div>
          <span class="sport-name">{{ sport.name }}</span>
        </div>
      </div>
    </div>

    <!-- 热门教练 -->
    <div class="section">
      <div class="section-title-row">
        <span class="section-title">热门教练</span>
        <span class="section-more" @click="$router.push('/sports')">查看全部 →</span>
      </div>
      <div class="coach-list">
        <div
          v-for="coach in coaches.slice(0, 4)"
          :key="coach.id"
          class="coach-card"
          @click="$router.push(`/coach/${coach.id}`)"
        >
          <img :src="coach.avatar_url || defaultAvatar" class="coach-avatar" :alt="coach.nickname">
          <div class="coach-info">
            <div class="coach-name">{{ coach.nickname }}</div>
            <div class="coach-meta">
              <span class="coach-sport">🏐 {{ JSON.parse(coach.sport_types || '[]').join('、') }}</span>
              <span class="coach-exp">{{ coach.years_experience || '5' }}年执教</span>
            </div>
            <div class="coach-rating">
              <van-rate v-model="coach.rating" :size="12" color="#fbbf24" void-icon="star" readonly />
              <span class="rating-text">{{ coach.rating }}</span>
            </div>
          </div>
          <div class="coach-price">¥{{ coach.price || 150 }}<span class="price-unit">/课时</span></div>
        </div>
      </div>
    </div>

    <!-- 推荐课程 -->
    <div class="section">
      <div class="section-title-row">
        <span class="section-title">热门课程</span>
        <span class="section-more" @click="$router.push('/sports')">更多 →</span>
      </div>
      <div class="course-list">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @click="$router.push(`/course/${course.id}`)"
        >
          <img :src="course.cover_url || defaultCourseCover" class="course-cover" :alt="course.name">
          <div class="course-info">
            <div class="course-title">{{ course.name }}</div>
            <div class="course-meta">
              <span class="sport-tag">{{ course.sport_type }}</span>
              <span class="level-tag">{{ course.level }}</span>
            </div>
            <div class="course-desc">{{ course.description }}</div>
            <div class="course-footer">
              <div class="course-duration">
                <van-icon name="clock-o" size="12" />
                <span>{{ course.duration_minutes }}分钟</span>
              </div>
              <div class="course-price">
                <span class="price-num">¥{{ course.price }}</span>
                <span class="price-unit">/课时</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getSportsTypes, getCoaches, getCourses } from '../api/index.js'

const defaultAvatar = 'https://i.pravatar.cc/150?img=1'
const defaultCourseCover = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400'
const sportsTypes = ref([])
const coaches = ref([])
const events = ref([
  { id: 1, title: "2026深圳市青少年篮球联赛", date: "2026-04-15", cover: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400", summary: "深圳市体育局主办，面向全市青少年的篮球赛事活动，现火热报名中！", views: 1256 },
  { id: 2, title: "社区亲子运动会", date: "2026-04-20", cover: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400", summary: "周末亲子活动，增强家庭体质，促进亲子关系", views: 892 },
  { id: 3, title: "深圳市网球公开赛", date: "2026-05-01", cover: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400", summary: "深圳市网球爱好者交流赛，专业组与业余组同时开赛", views: 654 },
  { id: 4, title: "跆拳道等级考核", date: "2026-05-15", cover: "https://images.unsplash.com/photo-1555597673-f21fc5c91295?w=400", summary: "年度跆拳道等级考核认证，含金量高", views: 423 }
])

const navItems = ref([
  { name: "课程介绍", icon: "📚", path: "/courses", color: "linear-gradient(135deg, #FF9500, #FF9500)" },
  { name: "运动项目", icon: "🏃", path: "/sports", color: "linear-gradient(135deg, #007AFF, #007AFF)" },
  { name: "学员档案", icon: "📖", path: "/profile", color: "linear-gradient(135deg, #007AFF, #007AFF)" },
  { name: "中心简介", icon: "📋", path: "/about", color: "linear-gradient(135deg, #34C759, #34C759)" },
  { name: "找场地", icon: "📍", path: "/venues", color: "linear-gradient(135deg, #FF3B30, #FF3B30)" },
  { name: "合作协会", icon: "🤝", path: "/associations", color: "linear-gradient(135deg, #AF52DE, #FF3B30)" },
  { name: "相关活动", icon: "📰", path: "/articles", color: "linear-gradient(135deg, #34C759, #34C759)" },
  { name: "裁判档案", icon: "🏅", path: "/referee", color: "linear-gradient(135deg, #FF3B30, #FF9500)" }
])

const courses = ref([])

const goSearch = () => {
  // 跳转搜索页
}

const goToSport = (sportName) => {
  // 点击运动项目跳转到找教练页面
  window.location.href = `/coaches?sport=${encodeURIComponent(sportName)}`
}

onMounted(async () => {
  const [typesRes, coachesRes, coursesRes] = await Promise.all([
    getSportsTypes(),
    getCoaches(),
    getCourses()
  ])
  sportsTypes.value = typesRes.data
  coaches.value = coachesRes.data
  courses.value = coursesRes.data
})
</script>

<style scoped>
.home {
  background: #F2F2F7;
  padding-bottom: 70px;
}

/* 顶部导航 */
.home-header {
  background: white;
  padding: 16px 16px 12px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F2F2F7;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Banner */
/* 功能导航 2x4 */
.nav-grid-section {
  margin: 12px 16px;
}

.nav-grid-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.nav-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  opacity: 0.75;
}

.nav-item-name {
  font-size: 12px;
  color: var(--color-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70px;
}

.nav-grid-section {
  margin: 12px 16px;
}

.nav-grid-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 4px;
}

/* 相关活动 */

.events-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 0;
  -webkit-overflow-scrolling: touch;
}

.events-scroll::-webkit-scrollbar {
  display: none;
}

.event-card {
  flex-shrink: 0;
  width: 200px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
}

.event-cover {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.event-info {
  padding: 12px;
}

.event-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  margin-bottom: 6px;
}

.event-badge.hot {
  background: #fff0f0;
  color: #ff4757;
}

.event-badge.registering {
  background: #e8f5e9;
  color: #4caf50;
}

.event-badge.soon {
  background: #fff3e0;
  color: #ff9800;
}

.event-badge.preparing {
  background: #F2F2F7;
  color: var(--color-text-secondary);
}

.event-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
}

.event-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  gap: 6px;
  cursor: pointer;
}

.course-intro-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FF9500, #FF9500);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.course-intro-name {
  font-size: 11px;
  color: var(--color-text);
  text-align: center;
}

.banner-slide {
  animation: gradientShift 8s ease infinite;
  background-size: 200% 200%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.slide-1 { background: linear-gradient(135deg, #007AFF, #007AFF); }
.slide-2 { background: linear-gradient(135deg, #34C759, #34C759); }
.slide-3 { background: linear-gradient(135deg, #AF52DE, #FF3B30); }

.slide-content {
  text-align: center;
}

.slide-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.slide-desc {
  font-size: 13px;
  opacity: 0.9;
}

/* 通用区块 */
/* 相关活动 */
.articles-section {
  padding: 0 16px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
}

.article-cover {
  width: 100px;
  height: 75px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 12px;
}

.section {
  background: white;
  margin: 12px 16px;
  border-radius: 16px;
  padding: 16px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.section-more {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 运动分类 */
.sports-section {
  padding: 16px;
}

.sports-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 10px;
}

.sport-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.sport-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sport-icon {
  font-size: 24px;
}

.sport-name {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 教练列表 */
.coach-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.coach-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.coach-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.coach-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.coach-info {
  flex: 1;
  min-width: 0;
}

.coach-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 3px;
}

.coach-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.coach-sport {
  background: rgba(102,126,234,0.08);
  color: #007AFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.coach-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-text {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
}

.rating-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.coach-price {
  font-size: 16px;
  font-weight: 700;
  color: #ef476f;
  flex-shrink: 0;
}

.coach-price .price-unit {
  font-size: 11px;
  font-weight: normal;
  color: var(--color-text-secondary);
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-card {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.course-cover {
  width: 88px;
  height: 88px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 5px;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

.course-coach-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

.sport-tag {
  font-size: 14px;
}

.course-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-tags {
  display: flex;
  gap: 4px;
}

.course-tag {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(102,126,234,0.08);
  color: #007AFF;
  border-radius: 4px;
}

.course-price {
  display: flex;
  align-items: baseline;
}

.price-num {
  font-size: 16px;
  font-weight: 700;
  color: #ef476f;
}

.price-unit {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-left: 1px;
}

/* 快捷入口 */
.quick-section {
  margin-bottom: 12px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 4px;
}

.quick-icon {
  font-size: 28px;
}

.quick-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 动画 keyframes */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slideUp {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out;
}
</style>

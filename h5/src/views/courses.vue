<template>
  <div class="courses-page">
    <!-- 左侧分类Tab + 右侧课程列表 -->
    <div class="courses-layout">
      <!-- 左侧Tab -->
      <div class="courses-sidebar">
        <div 
          class="sidebar-tab"
          :class="{ active: selectedSport === '' }"
          @click="selectedSport = ''"
        >
          <span class="tab-icon">⭐</span>
          <span class="tab-name">推荐</span>
        </div>
        <div 
          v-for="sport in sportsTypes" 
          :key="sport.id"
          class="sidebar-tab"
          :class="{ active: selectedSport === sport.name }"
          @click="selectedSport = sport.name"
        >
          <span class="tab-icon">{{ sport.icon }}</span>
          <span class="tab-name">{{ sport.name }}</span>
        </div>
      </div>

      <!-- 右侧课程列表 -->
      <div class="courses-content">
        <div class="content-header">
          <span class="content-title">{{ selectedSport === '' ? '推荐课程' : selectedSport }}</span>
          <span class="course-count">{{ filteredCourses.length }}个课程</span>
        </div>
        
        <div class="courses-list">
          <div 
            v-for="course in filteredCourses" 
            :key="course.id"
            class="course-card"
            @click="goToCourse(course.id)"
          >
            <div class="course-cover">
              <img :src="courseCover(course.sport_type)" :alt="course.name">
              <div class="course-badge">{{ course.level }}</div>
            </div>
            <div class="course-info">
              <div class="course-name">{{ course.name }}</div>
              <div class="course-desc">{{ course.description }}</div>
              <div class="course-meta">
                <span class="duration">
                  <van-icon name="clock-o" size="12" />
                  {{ course.duration_minutes }}分钟
                </span>
                <span class="lessons">约{{ Math.ceil(course.duration_minutes / 60 * 20) }}课时</span>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <span class="price-num">¥{{ course.price }}</span>
                  <span class="price-unit">/课时</span>
                </div>
                <van-button type="primary" size="small" round>查看</van-button>
              </div>
            </div>
          </div>
          
          <div v-if="filteredCourses.length === 0" class="empty-tip">
            暂无课程，敬请期待
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSportsTypes, getCourses } from '../api/index.js'

const router = useRouter()
const sportsTypes = ref([])
const courses = ref([])
const selectedSport = ref('')

const sportCovers = {
  '篮球': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  '足球': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
  '网球': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
  '乒乓球': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  '羽毛球': 'https://images.unsplash.com/photo-1617083873933-f9e58c11e77e?w=400',
  '游泳': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
  '跆拳道': 'https://images.unsplash.com/photo-1555597673-f21fc5c91295?w=400',
  '台球': 'https://images.unsplash.com/photo-1588790458384-a9e9f49e5c2e?w=400'
}

const defaultCover = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400'

const courseCover = (sportType) => {
  return sportCovers[sportType] || defaultCover
}

const filteredCourses = computed(() => {
  if (!selectedSport.value) {
    // 推荐：返回所有课程（可以后续按评分排序）
    return courses.value
  }
  return courses.value.filter(c => c.sport_type && c.sport_type.includes(selectedSport.value))
})

const goToCourse = (courseId) => {
  router.push(`/course/${courseId}`)
}

onMounted(async () => {
  const [typesRes, coursesRes] = await Promise.all([
    getSportsTypes(),
    getCourses()
  ])
  sportsTypes.value = typesRes.data
  courses.value = coursesRes.data
})
</script>

<style scoped>
.courses-page {
  background: #F2F2F7;
  min-height: 100vh;
  padding-bottom: 70px;
}

.courses-layout {
  display: flex;
  min-height: 100vh;
}

/* 左侧边栏 */
.courses-sidebar {
  width: 85px;
  background: white;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-bottom: 1px solid #F2F2F7;
  cursor: pointer;
}

.sidebar-tab.active {
  background: #F2F2F7;
  border-left: 3px solid #007AFF;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.tab-name {
  font-size: 12px;
  color: var(--color-text);
}

.sidebar-tab.active .tab-name {
  color: #007AFF;
  font-weight: 600;
}

/* 右侧内容 */
.courses-content {
  flex: 1;
  background: #F2F2F7;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
}

.course-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.courses-list {
  padding: 12px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.course-cover {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.course-info {
  padding: 12px;
}

.course-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.course-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.course-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.duration {
  display: flex;
  align-items: center;
  gap: 3px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price {
  display: flex;
  align-items: baseline;
}

.price-num {
  font-size: 18px;
  font-weight: 700;
  color: #ef476f;
}

.price-unit {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px 0;
  font-size: 14px;
}
</style>

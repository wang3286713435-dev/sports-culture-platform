<template>
  <div class="course-detail">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <van-icon name="arrow-left" size="22" @click="$router.back()" />
      <span class="header-title">课程详情</span>
      <van-icon name="star-o" size="22" :class="{ starred: isCollected }" @click="toggleCollect" />
    </div>

    <!-- 封面图 -->
    <div class="course-cover">
      <img :src="courseCover" class="cover-img" :alt="course.name">
      <div class="cover-overlay">
        <div class="sport-badge">{{ course.sport_type }}</div>
        <div class="course-type-badge">{{ courseTypeText }}</div>
      </div>
    </div>

    <!-- 课程信息 -->
    <div class="course-info">
      <div class="course-title">{{ course.name }}</div>
      <div class="course-meta-row">
        <span class="level-tag">{{ course.level }}</span>
        <span class="duration-tag">
          <van-icon name="clock-o" size="12" />
          {{ course.duration_minutes }}分钟/课时
        </span>
        <span class="price-tag">¥{{ course.price }}/课时</span>
      </div>
      <div class="course-desc">{{ course.description }}</div>
    </div>

    <!-- 课程目录 -->
    <div class="section modules-section">
      <div class="section-title">
        <span>课程目录</span>
        <span class="module-count">共{{ modules.length }}节</span>
      </div>
      <div class="modules-list">
        <div 
          v-for="(module, index) in modules" 
          :key="module.id"
          class="module-item"
          @click="playModule(module)"
        >
          <div class="module-index">{{ index + 1 }}</div>
          <div class="module-info">
            <div class="module-name">{{ module.name }}</div>
            <div class="module-meta">
              <van-icon :name="module.content_type === 'video' ? 'play-circle-o' : 'description'" size="12" />
              <span>{{ module.content_type === 'video' ? '视频' : '图文' }}</span>
              <span>{{ module.duration_minutes || 10 }}分钟</span>
            </div>
          </div>
          <van-icon name="play-circle-o" size="24" class="play-icon" />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <van-button type="primary" block round @click="startLearn">开始学习</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseById } from '../api/index.js'

const route = useRoute()
const course = ref({})
const modules = ref([])
const isCollected = ref(false)

const courseCovers = {
  '篮球': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  '足球': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  '网球': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
  '游泳': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
}

const defaultCover = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800'

const courseCover = computed(() => {
  return courseCovers[course.value.sport_type] || defaultCover
})

const courseTypeText = computed(() => {
  const types = { student: '学员课程', coach: '教练课程', referee: '裁判课程' }
  return types[course.value.course_type] || '学员课程'
})

const toggleCollect = () => {
  isCollected.value = !isCollected.value
}

const playModule = (module) => {
  if (module.content_type === 'video') {
    // 播放视频
    console.log('播放视频:', module.name)
  } else {
    // 查看图文
    console.log('查看图文:', module.name)
  }
}

const startLearn = () => {
  if (modules.value.length > 0) {
    playModule(modules.value[0])
  }
}

onMounted(async () => {
  const res = await getCourseById(route.params.id)
  if (res.code === 200) {
    course.value = res.data
    modules.value = res.data.modules || []
  }
})
</script>

<style scoped>
.course-detail {
  background: #F2F2F7;
  min-height: 100vh;
  padding-bottom: 80px;
}

.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.starred {
  color: #fbbf24;
}

.course-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  display: flex;
  gap: 8px;
}

.sport-badge {
  background: rgba(255,255,255,0.9);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.course-type-badge {
  background: #007AFF;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.course-info {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
}

.course-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.course-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.level-tag {
  background: #e8f5e9;
  color: #4caf50;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.duration-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.price-tag {
  font-size: 16px;
  font-weight: 600;
  color: #ef476f;
}

.course-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.section {
  background: white;
  padding: 16px;
}

.modules-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: normal;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F2F2F7;
  border-radius: 8px;
  cursor: pointer;
}

.module-item:active {
  background: #f0f0f0;
}

.module-index {
  width: 28px;
  height: 28px;
  background: #007AFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.module-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.module-meta span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.play-icon {
  color: #007AFF;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
</style>

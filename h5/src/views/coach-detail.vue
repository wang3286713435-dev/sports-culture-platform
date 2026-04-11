<template>
  <div class="coach-detail">
    <!-- 顶部导航 -->
    <div class="detail-header glass-card">
      <van-icon name="arrow-left" size="22" @click="$router.back()" />
      <span class="header-title">教练详情</span>
      <van-icon name="star-o" size="22" :class="{ starred: isCollected }" @click="toggleCollect" />
    </div>

    <!-- 教练信息卡片 -->
    <div class="coach-card glass-card animate-fade-in">
      <div class="coach-main">
        <img :src="coach.avatar || defaultAvatar" class="coach-avatar" :alt="coach.name">
        <div class="coach-info">
          <div class="coach-name">{{ coach.name }}</div>
          <div class="coach-type">
            <span class="sport-icon">{{ coach.sports_type_icon || '🏀' }}</span>
            <span>{{ coach.sports_type }}</span>
          </div>
          <div class="coach-cert">{{ coach.certificate || coach.certifications }}</div>
        </div>
      </div>
      <div class="coach-stats">
        <div class="stat-item">
          <div class="stat-value">{{ coach.rating || 4.8 }}</div>
          <div class="stat-label">评分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ coach.review_count || coach.reviews?.length || 0 }}</div>
          <div class="stat-label">评价</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ coach.experience || coach.teaching_years || '5' }}年</div>
          <div class="stat-label">执教</div>
        </div>
      </div>
    </div>

    <!-- 机构信息 -->
    <div class="institution-card glass-card animate-fade-in-up delay-1" v-if="coach.institution_name">
      <div class="institution-header">
        <span class="institution-icon">🏢</span>
        <span class="institution-name">{{ coach.institution_name }}</span>
      </div>
      <div class="institution-tags">
        <span class="tag tag-primary">资质认证</span>
        <span class="tag tag-success">政府认可</span>
      </div>
    </div>

    <!-- 个人简介 -->
    <div class="section glass-card-solid animate-fade-in-up delay-2">
      <div class="section-title">个人简介</div>
      <div class="intro-text">{{ coach.intro || coach.bio || '暂无简介' }}</div>
    </div>

    <!-- 资质证书 -->
    <div class="section glass-card-solid animate-fade-in-up delay-3" v-if="certList.length">
      <div class="section-title">资质证书</div>
      <div class="cert-list">
        <div v-for="cert in certList" :key="cert" class="cert-item">
          <span class="cert-icon">📜</span>
          <span>{{ cert }}</span>
        </div>
      </div>
    </div>

    <!-- 学员评价 -->
    <div class="section glass-card-solid animate-fade-in-up delay-4">
      <div class="section-title">
        学员评价
        <span class="review-count">({{ reviews.length }})</span>
      </div>
      <div v-if="reviews.length === 0" class="empty-review">
        暂无评价
      </div>
      <div v-else class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <img :src="review.avatar || defaultAvatar" class="review-avatar">
            <div class="review-info">
              <div class="review-name">{{ review.user_name || review.name }}</div>
              <div class="review-stars">{{ '★'.repeat(review.rating || 5) }}</div>
            </div>
            <div class="review-date">{{ formatDate(review.date || review.created_at) }}</div>
          </div>
          <div class="review-content">{{ review.content || review.text }}</div>
        </div>
      </div>
    </div>

    <!-- 底部预约按钮 -->
    <div class="book-bar glass-card">
      <div class="price-info">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ coach.price || 150 }}</span>
        <span class="price-unit">/课时</span>
      </div>
      <div class="book-btn glass-btn" @click="$router.push(`/book/${coach.id}`)">
        立即预约
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCoachById } from '../api/index.js'

const route = useRoute()
const coach = ref({})
const reviews = ref([])
const isCollected = ref(false)
const defaultAvatar = 'https://i.pravatar.cc/150?img=1'

const certList = computed(() => {
  const certs = coach.value.certifications || coach.value.certificate
  if (!certs) return []
  if (Array.isArray(certs)) return certs
  if (typeof certs === 'string') return certs.split(',').map(c => c.trim()).filter(Boolean)
  return []
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth()+1}/${d.getDate()}`
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
}

onMounted(async () => {
  const res = await getCoachById(route.params.id)
  coach.value = res.data
  reviews.value = res.data.reviews || []
})
</script>

<style scoped>
.coach-detail {
  background: #F2F2F7;
  min-height: 100vh;
  padding-bottom: 100px;
}

.detail-header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 0;
  margin-bottom: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-weight: 600;
  color: white;
}

.starred {
  color: #fbbf24;
}

.coach-card {
  padding: 20px;
  margin-bottom: 16px;
}

.coach-main {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.coach-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.5);
}

.coach-name {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.coach-type {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 4px;
}

.sport-icon {
  font-size: 16px;
}

.coach-cert {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

.coach-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

.institution-card {
  padding: 14px 16px;
  margin-bottom: 16px;
}

.institution-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.institution-icon {
  font-size: 20px;
}

.institution-name {
  font-weight: 600;
  color: white;
}

.institution-tags {
  display: flex;
  gap: 8px;
}

.section {
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.review-count {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: normal;
}

.intro-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.cert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.cert-icon {
  font-size: 16px;
}

.empty-review {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 20px 0;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.review-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.review-stars {
  color: #fbbf24;
  font-size: 12px;
}

.review-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.review-content {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.book-bar {
  position: fixed;
  bottom: 60px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 16px;
  color: #ef476f;
  font-weight: 600;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #ef476f;
}

.price-unit {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.book-btn {
  padding: 12px 32px;
  font-size: 16px;
}
</style>

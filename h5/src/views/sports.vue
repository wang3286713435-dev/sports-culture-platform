<template>
  <div class="sports-page">
    <!-- 一级菜单：深社体教练 / 合作教练 -->
    <div class="type-tabs">
      <div 
        class="type-tab" 
        :class="{ active: selectedType === 'official' }"
        @click="selectedType = 'official'"
      >
        🏆 深社体认证教练
      </div>
      <div 
        class="type-tab" 
        :class="{ active: selectedType === 'partner' }"
        @click="selectedType = 'partner'"
      >
        🤝 合作教练
      </div>
    </div>

    <!-- 二级菜单：运动项目 -->
    <div class="sport-tabs" v-if="currentCoaches.length > 0">
      <div 
        class="sport-tab"
        :class="{ active: selectedSport === '' }"
        @click="selectedSport = ''"
      >
        全部
      </div>
      <div 
        v-for="sport in availableSports" 
        :key="sport"
        class="sport-tab"
        :class="{ active: selectedSport === sport }"
        @click="selectedSport = sport"
      >
        {{ sport }}
      </div>
    </div>

    <!-- 教练列表 -->
    <div class="coach-list">
      <div 
        v-for="coach in filteredCoaches" 
        :key="coach.id"
        class="coach-card"
        @click="goToCoach(coach.id)"
      >
        <img :src="coach.avatar_url || defaultAvatar" class="coach-avatar">
        <div class="coach-info">
          <div class="coach-name">{{ coach.nickname }}</div>
          <div class="coach-meta">
            <span class="level-badge" :class="coach.level">{{ coach.level }}</span>
            <span class="sport-tags">{{ JSON.parse(coach.sport_types || '[]').join('、') }}</span>
          </div>
          <div class="coach-exp">{{ coach.years_experience }}年执教 · {{ coach.total_lessons || 0 }}课时</div>
          <div class="coach-rating">
            <van-rate v-model="coach.rating" :size="12" color="#fbbf24" void-icon="star" readonly />
            <span class="rating-text">{{ coach.rating }}</span>
          </div>
        </div>
        <div class="coach-right">
          <div class="coach-price">¥{{ coach.price || 150 }}<span class="price-unit">/课时</span></div>
        </div>
      </div>
      
      <div v-if="filteredCoaches.length === 0" class="empty-tip">
        暂无此类教练
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCoaches } from '../api/index.js'

const router = useRouter()
const allCoaches = ref([])
const selectedType = ref('official')  // official / partner
const selectedSport = ref('')
const defaultAvatar = 'https://i.pravatar.cc/150?img=1'

const currentCoaches = computed(() => {
  return allCoaches.value.filter(c => {
    if (selectedType.value === 'official') {
      return c.coach_type === 'official' || !c.coach_type
    } else {
      return c.coach_type === 'partner'
    }
  })
})

const availableSports = computed(() => {
  const sports = new Set()
  currentCoaches.value.forEach(c => {
    const types = JSON.parse(c.sport_types || '[]')
    types.forEach(t => sports.add(t))
  })
  return Array.from(sports)
})

const filteredCoaches = computed(() => {
  let result = currentCoaches.value
  if (selectedSport.value) {
    result = result.filter(c => c.sport_types && c.sport_types.includes(selectedSport.value))
  }
  // 深社体教练按等级排序
  if (selectedType.value === 'official') {
    const levelOrder = { '高级': 1, '中级': 2, '初级': 3 }
    result.sort((a, b) => (levelOrder[a.level] || 4) - (levelOrder[b.level] || 4))
  } else {
    // 合作教练按评分和课时排序
    result.sort((a, b) => (b.rating || 5) - (a.rating || 5) || (b.total_lessons || 0) - (a.total_lessons || 0))
  }
  return result
})

const goToCoach = (coachId) => {
  router.push(`/coach/${coachId}`)
}

onMounted(async () => {
  const coachesRes = await getCoaches()
  allCoaches.value = coachesRes.data
})
</script>

<style scoped>
.sports-page {
  min-height: 100vh;
  background: #F2F2F7;
}

/* 一级菜单：教练类型 */
.type-tabs {
  display: flex;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.type-tab.active {
  color: #007AFF;
  border-bottom-color: #007AFF;
}

/* 二级菜单：运动项目 */
.sport-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sport-tabs::-webkit-scrollbar {
  display: none;
}

.sport-tab {
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  background: #F2F2F7;
  color: var(--color-text-secondary);
}

.sport-tab.active {
  background: #007AFF;
  color: white;
}

/* 教练列表 */
.coach-list {
  padding: 12px 16px;
}

.coach-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: white;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.coach-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.coach-info {
  flex: 1;
  min-width: 0;
}

.coach-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.coach-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.level-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.level-badge.高级 { background: #fff3e0; color: #ff9800; }
.level-badge.中级 { background: #e3f2fd; color: #2196f3; }
.level-badge.初级 { background: #e8f5e9; color: #4caf50; }

.sport-tags {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.coach-exp {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.coach-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-text {
  font-size: 12px;
  color: #fbbf24;
  font-weight: 500;
}

.coach-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.coach-price {
  font-size: 18px;
  font-weight: 700;
  color: #ef476f;
}

.price-unit {
  font-size: 12px;
  font-weight: normal;
  color: var(--color-text-secondary);
}

.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px;
  font-size: 14px;
}
</style>

<template>
  <div class="coaches-page">
    <div class="coaches-header">
      <div class="header-nav">
        <van-icon name="arrow-left" size="20" @click="$router.back()" />
        <div class="header-title">选择教练</div>
        <div style="width:20px"></div>
      </div>
      <div class="search-area">
        <van-search v-model="keyword" placeholder="搜索教练姓名" shape="round" background="#F2F2F7" @search="doSearch" />
      </div>
      <div class="filter-scroll">
        <div class="filter-tab" :class="{ active: !selectedSport }" @click="selectSport(null)">全部</div>
        <div v-for="sport in sportsTypes" :key="sport.id" class="filter-tab" :class="{ active: selectedSport === sport.name }" @click="selectSport(sport.name)">
          {{ sport.icon }} {{ sport.name }}
        </div>
      </div>
    </div>

    <div class="coach-list">
      <div v-for="coach in filteredCoaches" :key="coach.id" class="coach-card" @click="$router.push(`/coach/${coach.id}`)">
        <div class="coach-main">
          <img :src="coach.avatar_url || defaultAvatar" class="coach-avatar" :alt="coach.nickname">
          <div class="coach-info">
            <div class="coach-top">
              <span class="coach-name">{{ coach.nickname }}</span>
              <span class="coach-price">¥{{ coach.price || 150 }}<span class="price-unit">/课时</span></span>
            </div>
            <div class="coach-meta">
              <span class="meta-tag">🏐 {{ JSON.parse(coach.sport_types || '[]').join('、') }}</span>
              <span class="meta-tag">认证教练</span>
            </div>
            <div class="coach-desc">{{ coach.bio }}</div>
            <div class="coach-footer">
              <div class="coach-rating">
                <van-rate v-model="coach.rating" :size="12" color="#fbbf24" void-icon="star" readonly />
                <span class="rating-text">{{ coach.rating }}</span>
                <span class="rating-count">(0条评价)</span>
              </div>
              <div class="coach-students">已教{{ coach.total_lessons || 0 }}名学员</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredCoaches.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">暂无相关教练</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSportsTypes, getCoaches } from '../api/index.js'

const router = useRouter()
const sportsTypes = ref([])
const coaches = ref([])
const keyword = ref('')
const selectedSport = ref('')
const defaultAvatar = 'https://i.pravatar.cc/150?img=1'

const filteredCoaches = computed(() => {
  let result = coaches.value
  if (selectedSport.value) {
    result = result.filter(c => c.sport_types && c.sport_types.includes(selectedSport.value))
  }
  if (keyword.value) {
    result = result.filter(c => c.nickname && c.nickname.includes(keyword.value))
  }
  return result
})

const selectSport = (sport) => {
  selectedSport.value = sport
}

const doSearch = () => {}

onMounted(async () => {
  const [typesRes, coachesRes] = await Promise.all([getSportsTypes(), getCoaches()])
  sportsTypes.value = typesRes.data
  coaches.value = coachesRes.data
})
</script>

<style scoped>
.coaches-page { background: #F2F2F7; min-height: 100vh; padding-bottom: 70px; }
.coaches-header { background: white; position: sticky; top: 0; z-index: 100; }
.header-nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; }
.header-title { font-size: 18px; font-weight: 600; }
.search-area { padding: 0 16px 12px; }
.filter-scroll { display: flex; gap: 8px; padding: 0 16px 12px; overflow-x: auto; }
.filter-tab { white-space: nowrap; padding: 6px 14px; border-radius: 16px; font-size: 13px; background: #F2F2F7; color: var(--color-text-secondary); }
.filter-tab.active { background: #007AFF; color: white; }
.coach-list { padding: 12px 16px; }
.coach-card { background: white; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.coach-main { display: flex; gap: 12px; }
.coach-avatar { width: 70px; height: 70px; border-radius: 8px; object-fit: cover; }
.coach-info { flex: 1; }
.coach-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.coach-name { font-size: 16px; font-weight: 600; }
.coach-price { font-size: 16px; font-weight: 700; color: #ef476f; }
.price-unit { font-size: 12px; color: var(--color-text-secondary); font-weight: normal; }
.coach-meta { display: flex; gap: 8px; margin-bottom: 6px; }
.meta-tag { font-size: 12px; padding: 2px 8px; background: #f0f0f0; border-radius: 4px; color: var(--color-text-secondary); }
.coach-desc { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; }
.coach-footer { display: flex; justify-content: space-between; align-items: center; }
.coach-rating { display: flex; align-items: center; gap: 4px; }
.rating-text { font-size: 13px; font-weight: 600; }
.rating-count { font-size: 12px; color: var(--color-text-secondary); }
.coach-students { font-size: 12px; color: var(--color-text-secondary); }
.empty-state { text-align: center; padding: 60px 0; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { color: var(--color-text-secondary); }
</style>

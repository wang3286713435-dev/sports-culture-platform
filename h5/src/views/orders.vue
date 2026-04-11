<template>
  <div class="orders-page">
    <!-- 顶部导航 -->
    <div class="page-header glass-card">
      <van-icon name="arrow-left" size="22" @click="$router.back()" />
      <span class="header-title">我的订单</span>
      <span></span>
    </div>

    <!-- 状态Tab -->
    <div class="status-tabs glass-card animate-fade-in">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
        <span class="tab-count" v-if="getCount(tab.id)">{{ getCount(tab.id) }}</span>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-if="filteredOrders.length">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card glass-card-solid animate-fade-in-up"
      >
        <div class="order-header">
          <span class="order-id">订单号：{{ order.id }}</span>
          <span class="order-status" :class="getStatusClass(order.status)">
            {{ order.status_text }}
          </span>
        </div>
        <div class="order-content">
          <img :src="order.cover_img || defaultCover" class="order-cover">
          <div class="order-info">
            <div class="order-title">{{ order.course }}</div>
            <div class="order-meta">
              <span class="coach-name">{{ order.coach }}</span>
              <span class="sport-icon">{{ order.sport_type_icon }}</span>
            </div>
            <div class="order-time">{{ order.appointment_time }}</div>
          </div>
        </div>
        <div class="order-footer">
          <div class="order-amount">
            <span class="amount-label">实付</span>
            <span class="amount-value">¥{{ order.amount }}</span>
          </div>
          <div class="order-actions">
            <van-button v-if="order.status === 'paid'" size="small" plain @click="cancelOrder(order)">
              取消预约
            </van-button>
            <van-button v-if="order.status === 'completed'" size="small" type="primary" plain>
              评价
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state animate-fade-in" v-else>
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无订单</div>
      <div class="empty-desc">快去预约课程吧</div>
      <div class="empty-btn glass-btn" @click="$router.push('/')">
        去逛逛
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders } from '../api/index.js'

const orders = ref([])
const activeTab = ref('all')
const defaultCover = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'paid', name: '待上课' },
  { id: 'completed', name: '已完成' },
  { id: 'cancelled', name: '已取消' },
]

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

const getCount = (tabId) => {
  if (tabId === 'all') return orders.value.length
  return orders.value.filter(o => o.status === tabId).length
}

const getStatusClass = (status) => {
  const map = {
    paid: 'status-pending',
    completed: 'status-done',
    cancelled: 'status-cancel',
  }
  return map[status] || ''
}

const cancelOrder = (order) => {
  order.status = 'cancelled'
  order.status_text = '已取消'
}

onMounted(async () => {
  const res = await getOrders()
  orders.value = res.data || []
})
</script>

<style scoped>
.orders-page {
  padding: 16px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.header-title {
  font-weight: 600;
  color: white;
}

.status-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-item.active {
  background: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
}

.tab-count {
  font-size: 11px;
  background: rgba(255,255,255,0.3);
  padding: 2px 6px;
  border-radius: 10px;
}

.order-card {
  padding: 14px;
  margin-bottom: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-id {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

.status-pending { color: #f59e0b; }
.status-done { color: #34C759; }
.status-cancel { color: var(--color-text-secondary); }

.order-content {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.order-cover {
  width: 70px;
  height: 70px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.order-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.coach-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.order-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: #ef476f;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.empty-btn {
  display: inline-block;
  padding: 12px 32px;
  font-size: 15px;
}
</style>

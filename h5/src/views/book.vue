<template>
  <div class="book-page">
    <!-- 顶部导航 -->
    <div class="detail-header glass-card">
      <van-icon name="arrow-left" size="22" @click="$router.back()" />
      <span class="header-title">确认预约</span>
      <span></span>
    </div>

    <!-- 课程信息 -->
    <div class="course-card glass-card animate-fade-in" v-if="course">
      <img :src="course.cover_img || defaultCover" class="course-cover">
      <div class="course-info">
        <div class="course-title">{{ course.title }}</div>
        <div class="course-meta">
          <img :src="course.coach_avatar || defaultAvatar" class="coach-avatar">
          <span>{{ course.coach_name }}</span>
          <span class="sport-icon">{{ course.sport_type_icon }}</span>
        </div>
      </div>
    </div>

    <!-- 课时选择 -->
    <div class="section glass-card-solid animate-fade-in-up delay-1">
      <div class="section-title">选择课时</div>
      <div class="package-list">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item"
          :class="{ selected: selectedPkg === pkg.id }"
          @click="selectedPkg = pkg.id"
        >
          <div class="pkg-info">
            <div class="pkg-name">{{ pkg.name }}</div>
            <div class="pkg-desc">{{ pkg.desc }}</div>
          </div>
          <div class="pkg-price">
            <span class="price">¥{{ pkg.price }}</span>
            <span class="unit">/ {{ pkg.count }}课时</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间选择 -->
    <div class="section glass-card-solid animate-fade-in-up delay-2">
      <div class="section-title">选择上课时间</div>
      <div class="time-select">
        <div class="time-week">
          <div
            v-for="week in weekDays"
            :key="week.day"
            class="week-item"
            :class="{ selected: selectedWeek === week.day, disabled: week.disabled }"
            @click="!week.disabled && (selectedWeek = week.day)"
          >
            <div class="week-name">{{ week.name }}</div>
            <div class="week-date">{{ week.date }}</div>
          </div>
        </div>
        <div class="time-slots">
          <div
            v-for="slot in timeSlots"
            :key="slot.id"
            class="slot-item"
            :class="{ selected: selectedSlot === slot.id, disabled: slot.disabled }"
            @click="!slot.disabled && (selectedSlot = slot.id)"
          >
            {{ slot.time }}
          </div>
        </div>
      </div>
    </div>

    <!-- 联系人信息 -->
    <div class="section glass-card-solid animate-fade-in-up delay-3">
      <div class="section-title">联系人信息</div>
      <div class="form-list">
        <div class="form-item">
          <span class="form-label">姓名</span>
          <input v-model="form.name" class="form-input" placeholder="请输入姓名" />
        </div>
        <div class="form-item">
          <span class="form-label">手机号</span>
          <input v-model="form.phone" class="form-input" placeholder="请输入手机号" type="tel" />
        </div>
        <div class="form-item">
          <span class="form-label">备注</span>
          <input v-model="form.note" class="form-input" placeholder="选填，如过敏史等" />
        </div>
      </div>
    </div>

    <!-- 费用说明 -->
    <div class="section glass-card-solid animate-fade-in-up delay-4">
      <div class="section-title">费用说明</div>
      <div class="fee-list">
        <div class="fee-item">
          <span>课程费用</span>
          <span>¥{{ currentPackage?.price || course?.price || 0 }}</span>
        </div>
        <div class="fee-item">
          <span>优惠</span>
          <span class="discount">-¥0</span>
        </div>
        <div class="fee-item total">
          <span>合计</span>
          <span class="total-price">¥{{ currentPackage?.price || course?.price || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 底部提交 -->
    <div class="submit-bar glass-card">
      <div class="total-info">
        <span class="total-label">实付</span>
        <span class="total-amount">¥{{ currentPackage?.price || course?.price || 0 }}</span>
      </div>
      <div class="submit-btn glass-btn" @click="submitOrder">
        确认支付
      </div>
    </div>

    <!-- 支付成功弹窗 -->
    <van-overlay :show="showSuccess" @click="showSuccess = false">
      <div class="success-modal glass-card">
        <div class="success-icon">✅</div>
        <div class="success-title">预约成功！</div>
        <div class="success-desc">已为您预约 {{ course?.coach_name }} 教练的课程</div>
        <div class="success-btn glass-btn" @click="goOrders">查看订单</div>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseById } from '../api/index.js'
import { createOrder } from '../api/index.js'

const route = useRoute()
const router = useRouter()
const course = ref({})
const showSuccess = ref(false)
const defaultCover = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'
const defaultAvatar = 'https://i.pravatar.cc/150?img=1'

const selectedPkg = ref(1)
const selectedWeek = ref('')
const selectedSlot = ref('')
const form = ref({ name: '', phone: '', note: '' })

const packages = [
  { id: 1, name: '体验课', desc: '1对1体验', price: 50, count: 1 },
  { id: 2, name: '基础班', desc: '10课时', price: 1500, count: 10 },
  { id: 3, name: '进阶班', desc: '20课时', price: 2800, count: 20 },
]

const weekDays = [
  { day: 1, name: '今天', date: '03/31', disabled: false },
  { day: 2, name: '明天', date: '04/01', disabled: false },
  { day: 3, name: '周三', date: '04/02', disabled: false },
  { day: 4, name: '周四', date: '04/03', disabled: false },
  { day: 5, name: '周五', date: '04/04', disabled: true },
  { day: 6, name: '周六', date: '04/05', disabled: false },
  { day: 7, name: '周日', date: '04/06', disabled: false },
]

const timeSlots = [
  { id: 1, time: '09:00', disabled: false },
  { id: 2, time: '10:00', disabled: false },
  { id: 3, time: '14:00', disabled: true },
  { id: 4, time: '15:00', disabled: false },
  { id: 5, time: '16:00', disabled: false },
  { id: 6, time: '19:00', disabled: false },
]

const currentPackage = computed(() => packages.find(p => p.id === selectedPkg.value))

const submitOrder = async () => {
  if (!form.value.name || !form.value.phone) {
    alert('请填写姓名和手机号')
    return
  }
  try {
    await createOrder({
      course_id: route.params.courseId,
      course_name: course.value.title,
      coach_name: course.value.coach_name,
      sport_type_icon: course.value.sport_type_icon,
      appointment_time: `${selectedWeek.value}/${selectedSlot.value}`,
      amount: currentPackage.value.price,
      ...form.value
    })
    showSuccess.value = true
  } catch (e) {
    alert('提交失败，请重试')
  }
}

const goOrders = () => {
  showSuccess.value = false
  router.push('/orders')
}

onMounted(async () => {
  const res = await getCourseById(route.params.courseId)
  course.value = res.data
  selectedWeek.value = weekDays[0].day
  selectedSlot.value = timeSlots[0].id
})
</script>

<style scoped>
.book-page {
  padding: 16px;
  padding-bottom: 100px;
}

.detail-header {
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

.course-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.course-cover {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.course-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.coach-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.section {
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 14px;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.package-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 2px solid #E5E5EA;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.package-item.selected {
  border-color: #007AFF;
  background: rgba(102, 126, 234, 0.05);
}

.pkg-name {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 2px;
}

.pkg-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.pkg-price {
  text-align: right;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #ef476f;
}

.unit {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.time-week {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
}

.week-item {
  flex-shrink: 0;
  text-align: center;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 2px solid #E5E5EA;
  cursor: pointer;
  min-width: 50px;
}

.week-item.selected {
  border-color: #007AFF;
  background: rgba(102, 126, 234, 0.08);
}

.week-item.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.week-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
}

.week-date {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.slot-item {
  padding: 8px 16px;
  border: 2px solid #E5E5EA;
  border-radius: 20px;
  font-size: 14px;
  color: #1a1a2e;
  cursor: pointer;
}

.slot-item.selected {
  border-color: #007AFF;
  background: rgba(102, 126, 234, 0.1);
  color: #007AFF;
  font-weight: 600;
}

.slot-item.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  min-width: 50px;
}

.form-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid #E5E5EA;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
  background: transparent;
}

.fee-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.fee-item.total {
  padding-top: 10px;
  border-top: 1px solid #E5E5EA;
  font-weight: 600;
  color: #1a1a2e;
}

.discount {
  color: #34C759;
}

.total-price {
  font-size: 20px;
  color: #ef476f;
}

.submit-bar {
  position: fixed;
  bottom: 60px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.total-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #ef476f;
}

.submit-btn {
  padding: 14px 36px;
  font-size: 16px;
}

.success-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  padding: 32px 24px;
  text-align: center;
  border-radius: var(--radius-xl);
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.success-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.success-btn {
  padding: 12px 32px;
  font-size: 15px;
}
</style>

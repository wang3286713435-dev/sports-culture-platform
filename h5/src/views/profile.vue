<template>
  <div class="profile-page">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="not-login">
      <div class="not-login-icon">📖</div>
      <div class="not-login-title">学员档案</div>
      <div class="not-login-desc">登录后可查看您的学习档案</div>
      <van-button type="primary" round block @click="$router.push('/user')">立即登录</van-button>
    </div>

    <!-- 已登录 - 显示档案 -->
    <template v-else>
      <!-- 顶部资料卡片 -->
      <div class="profile-header">
        <div class="avatar-section">
          <img :src="userInfo.avatar || defaultAvatar" class="avatar" />
          <div class="user-info">
            <div class="name">{{ userInfo.nickname || '学员' }}</div>
            <div class="level">成长等级：Lv.{{ level }}</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-num">{{ totalStats.totalDuration }}</div>
            <div class="stat-label">累计时长(分钟)</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ totalStats.totalCount }}</div>
            <div class="stat-label">上课次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ totalStats.days }}</div>
            <div class="stat-label">训练天数</div>
          </div>
        </div>
      </div>

      <!-- 体测数据 -->
      <div class="data-card">
        <div class="card-title">📋 体测数据</div>
        <div class="test-grid">
          <div class="test-item">
            <div class="test-label">身高</div>
            <div class="test-value">{{ profile?.height || '--' }} <span class="unit">cm</span></div>
          </div>
          <div class="test-item">
            <div class="test-label">体重</div>
            <div class="test-value">{{ profile?.weight || '--' }} <span class="unit">kg</span></div>
          </div>
          <div class="test-item">
            <div class="test-label">BMI</div>
            <div class="test-value">{{ profile?.bmi || '--' }}</div>
          </div>
          <div class="test-item">
            <div class="test-label">肺活量</div>
            <div class="test-value">{{ profile?.vital_capacity || '--' }} <span class="unit">ml</span></div>
          </div>
          <div class="test-item">
            <div class="test-label">50米跑</div>
            <div class="test-value">{{ profile?.run_50m || '--' }} <span class="unit">秒</span></div>
          </div>
          <div class="test-item">
            <div class="test-label">跳绳</div>
            <div class="test-value">{{ profile?.jump_count || '--' }} <span class="unit">次/分</span></div>
          </div>
        </div>
        <div class="health-badge" :class="profile?.health_level || '良好'">
          健康等级：{{ profile?.health_level || '良好' }}
        </div>
      </div>

      <!-- 运动统计 -->
      <div class="data-card">
        <div class="card-title">🏃 运动统计</div>
        <div class="sports-grid">
          <div class="sport-item" v-for="stat in stats" :key="stat.sport_type">
            <div class="sport-icon">{{ getSportIcon(stat.sport_type) }}</div>
            <div class="sport-name">{{ stat.sport_type }}</div>
            <div class="sport-duration">{{ stat.total_duration }}分钟</div>
            <div class="sport-count">{{ stat.total_count }}次</div>
          </div>
        </div>
      </div>

      <!-- 学习记录 -->
      <div class="data-card">
        <div class="card-title">📚 学习记录</div>
        <div class="records-list">
          <div class="record-item" v-for="record in recentRecords" :key="record.id">
            <div class="record-icon">🏃</div>
            <div class="record-content">
              <div class="record-title">{{ record.action_name }}</div>
              <div class="record-meta">
                <span>{{ record.duration_minutes }}分钟</span>
                <span>{{ record.record_date }}</span>
              </div>
            </div>
            <van-tag type="success" size="small">已完成</van-tag>
          </div>
          <div v-if="recentRecords.length === 0" class="empty-tip">
            暂无学习记录，开始上课后会同步到这里
          </div>
        </div>
      </div>

      <!-- 目标 -->
      <div class="data-card">
        <div class="card-title">🎯 学习目标</div>
        <div class="goal-text">{{ profile?.goal || '暂无目标' }}</div>
      </div>

      <!-- 体测报告 -->
      <div class="data-card" v-if="testReports.length > 0">
        <div class="card-title">📊 体测报告</div>
        <div class="test-report-card" v-for="report in testReports" :key="report.id">
          <div class="report-header">
            <span class="report-date">{{ report.test_date }}</span>
            <span class="report-age">{{ report.age }}岁 · {{ report.gender }}</span>
          </div>
          <div class="report-scores">
            <div class="score-circle">
              <div class="score-value">{{ report.overall_score }}</div>
              <div class="score-label">综合评分</div>
            </div>
            <div class="score-details">
              <div class="score-item">
                <span class="label">BMI</span>
                <span class="value">{{ report.bmi }}</span>
              </div>
              <div class="score-item">
                <span class="label">体脂率</span>
                <span class="value">{{ report.body_fat }}%</span>
              </div>
              <div class="score-item">
                <span class="label">肺活量</span>
                <span class="value">{{ report.vital_capacity }}ml</span>
              </div>
              <div class="score-item">
                <span class="label">50米跑</span>
                <span class="value">{{ report.run_50_m }}秒</span>
              </div>
              <div class="score-item">
                <span class="label">体态评估</span>
                <span class="value">{{ report.posture_score }}分</span>
              </div>
            </div>
          </div>
          <div class="report-recommend" v-if="report.recommendations">
            建议：{{ report.recommendations }}
          </div>
        </div>
      </div>

      <!-- 成长档案 -->
      <div class="data-card" v-if="growthRecords.length > 0">
        <div class="card-title">🌟 成长档案</div>
        <div class="growth-timeline">
          <div class="timeline-item" v-for="record in growthRecords" :key="record.id">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ record.record_date }}</div>
              <div class="timeline-course">{{ record.course_name }}</div>
              <div class="timeline-skill">技能等级：{{ record.skill_level }}</div>
              <div class="timeline-cert" v-if="record.certificate_earned">
                <van-icon name="award" color="#fbbf24" />
                <span>{{ record.certificate_earned }}</span>
                <span class="cert-no">证书号：{{ record.certificate_no }}</span>
              </div>
              <div class="timeline-eval">教练评价：{{ record.coach_evaluation }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserProfile, getStudentProfile, getLearningRecords, getTestReports, getGrowthRecords } from '../api/index.js'

const defaultAvatar = 'https://i.pravatar.cc/150?img=1'
const isLoggedIn = ref(false)
const userInfo = ref({})
const profile = ref(null)
const stats = ref([])
const learningRecords = ref([])
const testReports = ref([])
const growthRecords = ref([])
const level = ref(1)

const sportIcons = {
  '篮球': '🏀', '足球': '⚽', '网球': '🎾', '游泳': '🏊',
  '羽毛球': '🏸', '乒乓球': '🏓', '跆拳道': '🥋', '台球': '🎱'
}

const getSportIcon = (sport) => sportIcons[sport] || '🏃'

const totalStats = computed(() => {
  const total = stats.value.reduce((acc, s) => ({
    totalDuration: acc.totalDuration + (s.total_duration || 0),
    totalCount: acc.totalCount + (s.total_count || 0)
  }), { totalDuration: 0, totalCount: 0 })
  return {
    totalDuration: total.totalDuration,
    totalCount: total.totalCount,
    days: new Set(learningRecords.value.map(r => r.record_date)).size || 1
  }
})

const recentRecords = computed(() => {
  return learningRecords.value.slice(0, 10)
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  
  if (token && storedUser) {
    isLoggedIn.value = true
    userInfo.value = JSON.parse(storedUser)
    
    try {
      const profileRes = await getStudentProfile()
      if (profileRes.code === 200) {
        profile.value = profileRes.data.profile
        stats.value = profileRes.data.stats || []
      }
      
      const recordsRes = await getLearningRecords()
      if (recordsRes.code === 200) {
        learningRecords.value = recordsRes.data
      }
      
      const reportsRes = await getTestReports()
      if (reportsRes.code === 200) {
        testReports.value = reportsRes.data
      }
      
      const growthRes = await getGrowthRecords()
      if (growthRes.code === 200) {
        growthRecords.value = growthRes.data
      }
    } catch(e) {
      console.log('获取档案数据失败:', e)
    }
  }
})
</script>

<style scoped>
.profile-page {
  background: #F2F2F7;
  min-height: 100vh;
  padding-bottom: 70px;
}

/* 未登录状态 */
.not-login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%);
  color: white;
}

.not-login-icon { font-size: 64px; margin-bottom: 20px; }
.not-login-title { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
.not-login-desc { font-size: 14px; opacity: 0.85; margin-bottom: 30px; }
.not-login .van-button { background: white; color: #007AFF; border: none; }

/* 已登录样式 */
.profile-header {
  background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%);
  padding: 24px 16px;
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.3);
}

.name { font-size: 22px; font-weight: 600; }
.level { font-size: 13px; opacity: 0.85; margin-top: 4px; }

.stats-row {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 16px 0;
}

.stat-item { text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }

.data-card {
  background: white;
  margin: 12px 16px;
  border-radius: 12px;
  padding: 16px;
}

.card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }

.test-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.test-item {
  background: #F2F2F7;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.test-label { font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; }
.test-value { font-size: 18px; font-weight: 600; }
.unit { font-size: 12px; font-weight: normal; color: var(--color-text-secondary); }

.health-badge {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
}
.health-badge.良好 { background: #e8f5e9; color: #4caf50; }
.health-badge.一般 { background: #fff3e0; color: #ff9800; }

.sports-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.sport-item {
  background: #F2F2F7;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.sport-icon { font-size: 24px; margin-bottom: 4px; }
.sport-name { font-size: 12px; color: var(--color-text); margin-bottom: 2px; }
.sport-duration { font-size: 11px; color: #007AFF; }
.sport-count { font-size: 10px; color: var(--color-text-secondary); }

.records-list { display: flex; flex-direction: column; gap: 10px; }

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F2F2F7;
  border-radius: 8px;
}

.record-icon { font-size: 24px; }
.record-content { flex: 1; }
.record-title { font-size: 14px; font-weight: 500; }
.record-meta { font-size: 12px; color: var(--color-text-secondary); display: flex; gap: 12px; margin-top: 4px; }

.empty-tip { text-align: center; color: var(--color-text-secondary); padding: 20px; font-size: 13px; }

.goal-text { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }
</style>

/* 体测报告样式 */
.test-report-card {
  background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  margin-bottom: 12px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.report-date { font-size: 13px; opacity: 0.9; }
.report-age { font-size: 13px; opacity: 0.9; }

.report-scores {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.score-circle {
  width: 70px;
  height: 70px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-value { font-size: 24px; font-weight: 700; }
.score-label { font-size: 10px; opacity: 0.85; }

.score-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.score-item { display: flex; flex-direction: column; }
.score-item .label { font-size: 11px; opacity: 0.85; }
.score-item .value { font-size: 14px; font-weight: 600; }

.report-recommend {
  font-size: 12px;
  background: rgba(255,255,255,0.15);
  padding: 8px;
  border-radius: 6px;
}

/* 成长档案样式 */
.growth-timeline { padding-left: 20px; }

.timeline-item {
  position: relative;
  padding-left: 20px;
  padding-bottom: 20px;
  border-left: 2px solid #007AFF;
}

.timeline-dot {
  position: absolute;
  left: -6px;
  top: 0;
  width: 10px;
  height: 10px;
  background: #007AFF;
  border-radius: 50%;
}

.timeline-content { background: #F2F2F7; border-radius: 8px; padding: 12px; }

.timeline-date { font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; }
.timeline-course { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.timeline-skill { font-size: 12px; color: #007AFF; margin-bottom: 6px; }

.timeline-cert {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #fbbf24;
  margin-bottom: 4px;
}

.cert-no { font-size: 10px; color: var(--color-text-secondary); }

.timeline-eval { font-size: 12px; color: var(--color-text-secondary); }

<template>
  <div class="user-page">
    <!-- 已登录状态 -->
    <div v-if="isLoggedIn" class="logged-in">
      <div class="user-header">
        <div class="user-avatar-wrap">
          <img :src="userInfo.avatar || defaultAvatar" class="user-avatar">
          <div class="user-info">
            <div class="user-name">{{ userInfo.nickname || userInfo.name || '用户' }}</div>
            <div class="user-phone">{{ formatPhone(userInfo.phone) }}</div>
          </div>
        </div>
      </div>

      <div class="order-quick card">
        <div class="card-title">我的订单</div>
        <div class="order-tabs">
          <div class="order-tab" @click="$router.push('/orders')">
            <span class="tab-icon">📋</span>
            <span class="tab-text">全部</span>
          </div>
          <div class="order-tab">
            <span class="tab-icon">⏰</span>
            <span class="tab-text">待上课</span>
          </div>
          <div class="order-tab">
            <span class="tab-icon">✅</span>
            <span class="tab-text">已完成</span>
          </div>
        </div>
      </div>

      <div class="menu-list card">
        <div class="menu-item">
          <span class="menu-icon">💰</span>
          <span class="menu-text">我的钱包</span>
          <van-icon name="arrow" size="16" color="#ccc" />
        </div>
        <div class="menu-item">
          <span class="menu-icon">⭐</span>
          <span class="menu-text">我的收藏</span>
          <van-icon name="arrow" size="16" color="#ccc" />
        </div>
        <div class="menu-item">
          <span class="menu-icon">🏅</span>
          <span class="menu-text">结业证书</span>
          <van-icon name="arrow" size="16" color="#ccc" />
        </div>
        <div class="menu-item">
          <span class="menu-icon">📖</span>
          <span class="menu-text">中心简介</span>
          <van-icon name="arrow" size="16" color="#ccc" />
        </div>
        <div class="menu-item">
          <span class="menu-icon">⚙️</span>
          <span class="menu-text">设置</span>
          <van-icon name="arrow" size="16" color="#ccc" />
        </div>
        <div class="menu-item logout" @click="logout">
          <span class="menu-icon">🚪</span>
          <span class="menu-text">退出登录</span>
        </div>
      </div>
    </div>

    <!-- 未登录状态：重新设计版 -->
    <div v-else class="not-logged-in">
      <!-- Hero 头部 -->
      <div class="login-hero">
        <div class="hero-badge">🏆</div>
        <h1 class="hero-title">全民体育文化平台</h1>
        <p class="hero-subtitle">深圳市社会体育培训中心</p>
      </div>

      <!-- 表单区域 -->
      <div class="login-form-wrap">
        <div class="login-card">
          <!-- Tab 切换 -->
          <div class="login-tabs">
            <div class="login-tab" :class="{ active: loginMode === 'sms' }" @click="loginMode = 'sms'">验证码登录</div>
            <div class="login-tab" :class="{ active: loginMode === 'password' }" @click="loginMode = 'password'">密码登录</div>
          </div>

          <!-- 手机号（通用）-->
          <div class="field-group">
            <div class="field-label">手机号</div>
            <div class="field-row">
              <span class="field-icon">📱</span>
              <input v-model="loginForm.phone" type="tel" maxlength="11" placeholder="请输入手机号" class="field-input" />
            </div>
          </div>

          <!-- 验证码模式 -->
          <div v-if="loginMode === 'sms'" class="field-group">
            <div class="field-label">验证码</div>
            <div class="field-row">
              <span class="field-icon">🔐</span>
              <input v-model="loginForm.code" type="tel" maxlength="6" placeholder="请输入6位验证码" class="field-input" />
              <button class="code-btn" :disabled="countdown > 0 || !loginForm.phone" @click="sendCode">
                {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
              </button>
            </div>
          </div>

          <!-- 密码模式 -->
          <div v-else class="field-group">
            <div class="field-label">密码</div>
            <div class="field-row">
              <span class="field-icon">🔒</span>
              <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="field-input" />
            </div>
          </div>

          <!-- 登录按钮 -->
          <button class="login-btn" @click="doLogin">
            登录 / 注册
          </button>

          <!-- 协议提示 -->
          <p class="login-tip">
            登录即表示同意
            <span class="link">《用户协议》</span> 和
            <span class="link">《隐私政策》</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sendSmsCode, loginWithSms, loginWithPassword } from '../api/index.js'

const defaultAvatar = 'https://i.pravatar.cc/150?img=1'
const isLoggedIn = ref(false)
const loginMode = ref('sms')
const countdown = ref(0)
const userInfo = ref({ phone: '' })

const loginForm = ref({
  phone: '',
  code: '',
  password: ''
})

const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const sendCode = async () => {
  if (countdown.value > 0 || !loginForm.value.phone) return
  try {
    await sendSmsCode({ phone: loginForm.value.phone })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    console.log('发送失败')
  }
}

const doLogin = async () => {
  if (!loginForm.value.phone) {
    alert('请输入手机号')
    return
  }
  if (loginMode.value === 'password' && !loginForm.value.password) {
    alert('请输入密码')
    return
  }
  if (loginMode.value === 'sms' && !loginForm.value.code) {
    alert('请输入验证码')
    return
  }

  try {
    let res
    if (loginMode.value === 'sms') {
      res = await loginWithSms({ phone: loginForm.value.phone, code: loginForm.value.code })
    } else {
      res = await loginWithPassword({ phone: loginForm.value.phone, password: loginForm.value.password })
    }

    if (res.code === 200) {
      userInfo.value = res.data.user
      isLoggedIn.value = true
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } else if (res.code === 401) {
      alert('密码错误，请重新输入')
    }
  } catch (e) {
    console.log('登录失败，尝试注册:', e.message)
    try {
      const regRes = await loginWithPassword({
        phone: loginForm.value.phone,
        password: loginForm.value.password || '888999'
      })

      if (regRes.code === 200) {
        userInfo.value = regRes.data.user
        isLoggedIn.value = true
        localStorage.setItem('token', regRes.data.token)
        localStorage.setItem('user', JSON.stringify(regRes.data.user))
        alert('注册成功！欢迎加入全民体育文化平台')
      } else {
        alert('注册失败：' + (regRes.message || '请重试'))
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }
}

const logout = () => {
  isLoggedIn.value = false
  userInfo.value = {}
  loginForm.value = { phone: '', code: '', password: '' }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  if (storedUser && token) {
    userInfo.value = JSON.parse(storedUser)
    isLoggedIn.value = true
  }
})
</script>

<style scoped>
.user-page { background: var(--color-bg); min-height: 100vh; padding-bottom: 70px; }

/* ========== 已登录 Header ========== */
.user-header {
  background: var(--color-primary);
  padding: 32px 20px 40px;
}
.user-avatar-wrap { display: flex; align-items: center; gap: 14px; }
.user-avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; }
.user-name { font-size: 20px; font-weight: 600; color: white; }
.user-phone { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }

/* ========== 通用卡片 ========== */
.card { background: var(--color-card); margin: 12px 16px; border-radius: var(--radius-card); padding: var(--spacing-lg); box-shadow: var(--shadow-card); }
.card-title { font-size: var(--font-size-md); font-weight: 600; margin-bottom: 12px; }
.order-tabs { display: flex; justify-content: space-around; }
.order-tab { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
.tab-icon { font-size: 22px; }
.tab-text { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.menu-item { display: flex; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-divider); }
.menu-item:last-child { border-bottom: none; }
.menu-item.logout { color: var(--color-error); }
.menu-icon { font-size: 18px; margin-right: 12px; }
.menu-text { flex: 1; font-size: var(--font-size-base); color: var(--color-text); }

/* ========== 未登录：重新设计 ========== */
.not-logged-in { background: var(--color-bg); min-height: 100vh; }

/* Hero 头部 */
.login-hero {
  background: linear-gradient(160deg, #007AFF 0%, #5856D6 100%);
  padding: 56px 24px 48px;
  text-align: center;
  border-radius: 0 0 24px 24px;
}
.hero-badge { font-size: 52px; margin-bottom: 12px; }
.hero-title { font-size: 24px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px; letter-spacing: -0.3px; }
.hero-subtitle { font-size: 13px; color: rgba(255,255,255,0.75); }

/* 表单区域 */
.login-form-wrap { padding: 0 16px; margin-top: -20px; }
.login-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* Tab */
.login-tabs { display: flex; border-bottom: 1px solid var(--color-divider); margin-bottom: 20px; }
.login-tab { flex: 1; text-align: center; padding: 10px; font-size: 15px; color: var(--color-text-secondary); cursor: pointer; position: relative; transition: color 0.2s; }
.login-tab.active { color: var(--color-primary); font-weight: 600; }
.login-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px; background: var(--color-primary); border-radius: 1px; }

/* 字段 */
.field-group { margin-bottom: 14px; }
.field-label { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 6px; font-weight: 500; }
.field-row {
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border-radius: 10px;
  padding: 2px 12px;
  border: 1px solid var(--color-divider);
  transition: border-color 0.2s;
}
.field-row:focus-within { border-color: var(--color-primary); background: #fff; }
.field-icon { font-size: 15px; margin-right: 8px; flex-shrink: 0; }
.field-input { flex: 1; border: none; background: transparent; padding: 12px 0; font-size: 15px; color: var(--color-text); outline: none; }
.field-input::placeholder { color: var(--color-text-placeholder); }

/* 验证码按钮 */
.code-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.code-btn:disabled { background: #C7C7CC; cursor: not-allowed; }

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: opacity 0.2s;
  box-shadow: 0 4px 12px rgba(0,122,255,0.3);
}
.login-btn:active { opacity: 0.85; }

/* 协议 */
.login-tip { text-align: center; font-size: 11px; color: var(--color-text-secondary); margin-top: 14px; line-height: 1.5; }
.link { color: var(--color-primary); }
</style>

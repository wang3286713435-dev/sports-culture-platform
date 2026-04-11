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

    <!-- 未登录状态 -->
    <div v-else class="not-logged-in">
      <div class="login-header">
        <div class="login-logo">🏆</div>
        <div class="login-title">全民体育文化平台</div>
        <div class="login-subtitle">深圳市社会体育培训中心官方平台</div>
      </div>

      <div class="login-card card">
        <div class="login-tabs">
          <div class="login-tab" :class="{ active: loginMode === 'sms' }" @click="loginMode = 'sms'">验证码登录</div>
          <div class="login-tab" :class="{ active: loginMode === 'password' }" @click="loginMode = 'password'">密码登录</div>
        </div>

        <div v-if="loginMode === 'sms'" class="login-form">
          <div class="input-item">
            <span class="input-icon">📱</span>
            <input v-model="loginForm.phone" type="tel" maxlength="11" placeholder="请输入手机号" class="input-field" />
          </div>
          <div class="input-item">
            <span class="input-icon">🔐</span>
            <input v-model="loginForm.code" type="tel" maxlength="6" placeholder="请输入验证码" class="input-field" />
            <span class="code-btn" @click="sendCode">{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</span>
          </div>
        </div>

        <div v-else class="login-form">
          <div class="input-item">
            <span class="input-icon">📱</span>
            <input v-model="loginForm.phone" type="tel" maxlength="11" placeholder="请输入手机号" class="input-field" />
          </div>
          <div class="input-item">
            <span class="input-icon">🔒</span>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="input-field" />
          </div>
        </div>

        <div class="login-btn" @click="doLogin">登录 / 注册</div>

        <div class="login-tip">
          登录即表示同意
          <span class="link">《用户协议》</span> 和
          <span class="link">《隐私政策》</span>
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
      // 先尝试密码登录
      res = await loginWithPassword({ phone: loginForm.value.phone, password: loginForm.value.password })
    }
    
    if (res.code === 200) {
      // 登录成功
      userInfo.value = res.data.user
      isLoggedIn.value = true
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } else if (res.code === 401) {
      // 密码错误，提示用户
      alert('密码错误，请重新输入')
    }
  } catch (e) {
    // 登录失败，可能是新用户，自动注册
    console.log('登录失败，尝试注册:', e.message)
    try {
      // 使用默认密码自动注册
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
    } catch(err) {
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

.user-header {
  background: var(--color-primary);
  padding: 32px 20px 40px;
}
.user-avatar-wrap { display: flex; align-items: center; gap: 14px; }
.user-avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; }
.user-name { font-size: 20px; font-weight: 600; color: white; }
.user-phone { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }

.card { background: var(--color-card); margin: 12px 16px; border-radius: var(--radius-card); padding: var(--spacing-lg); }
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

.not-logged-in { padding: 40px 20px; }
.login-header { text-align: center; margin-bottom: 40px; }
.login-logo { font-size: 56px; margin-bottom: 12px; }
.login-title { font-size: var(--font-size-title); font-weight: 700; color: var(--color-text); margin-bottom: 8px; }
.login-subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); }

.login-card { margin: 0; }
.login-tabs { display: flex; border-bottom: 1px solid var(--color-divider); margin-bottom: 20px; }
.login-tab { flex: 1; text-align: center; padding: 12px; font-size: var(--font-size-md); color: var(--color-text-secondary); cursor: pointer; }
.login-tab.active { color: var(--color-primary); font-weight: 600; border-bottom: 2px solid var(--color-primary); }

.input-item { display: flex; align-items: center; background: var(--color-bg); border-radius: 24px; padding: 4px 16px; margin-bottom: 12px; }
.input-icon { font-size: 16px; margin-right: 8px; }
.input-field { flex: 1; border: none; background: transparent; padding: 12px 0; font-size: var(--font-size-md); outline: none; color: var(--color-text); }
.input-field::placeholder { color: var(--color-text-placeholder); }
.code-btn { color: var(--color-primary); font-size: var(--font-size-sm); white-space: nowrap; cursor: pointer; }

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-button);
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
}
.login-tip { text-align: center; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 16px; }
.link { color: var(--color-primary); }
</style>

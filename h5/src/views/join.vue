<template>
  <div class="join-page">
    <!-- 顶部导航 -->
    <div class="page-header glass-card">
      <van-icon name="arrow-left" size="22" @click="$router.back()" />
      <span class="header-title">机构入驻</span>
      <span></span>
    </div>

    <!-- 平台优势 -->
    <div class="advantages glass-card animate-fade-in">
      <div class="adv-title">为什么选择我们？</div>
      <div class="adv-grid">
        <div class="adv-item">
          <div class="adv-icon">🏆</div>
          <div class="adv-text">政府认证资质</div>
        </div>
        <div class="adv-item">
          <div class="adv-icon">📈</div>
          <div class="adv-text">精准流量入口</div>
        </div>
        <div class="adv-item">
          <div class="adv-icon">💰</div>
          <div class="adv-text">零佣金入驻</div>
        </div>
        <div class="adv-item">
          <div class="adv-icon">🎓</div>
          <div class="adv-text">专业培训支持</div>
        </div>
      </div>
    </div>

    <!-- 入驻须知 -->
    <div class="notice glass-card-solid animate-fade-in-up delay-1">
      <div class="notice-title">📋 入驻须知</div>
      <div class="notice-list">
        <div class="notice-item">
          <span class="notice-num">1</span>
          <span>需具有有效营业执照和体育培训相关资质</span>
        </div>
        <div class="notice-item">
          <span class="notice-num">2</span>
          <span>教练需持有相关运动项目资格证书</span>
        </div>
        <div class="notice-item">
          <span class="notice-num">3</span>
          <span>入驻审核通常在1-3个工作日内完成</span>
        </div>
        <div class="notice-item">
          <span class="notice-num">4</span>
          <span>平台收取少量服务费，用于运营和推广</span>
        </div>
      </div>
    </div>

    <!-- 入驻表单 -->
    <div class="form-section glass-card-solid animate-fade-in-up delay-2">
      <div class="form-title">机构信息</div>
      <div class="form-list">
        <div class="form-item">
          <label class="form-label">机构名称 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" placeholder="请输入机构全称" />
        </div>
        <div class="form-item">
          <label class="form-label">联系人 <span class="required">*</span></label>
          <input v-model="form.contact" class="form-input" placeholder="请输入联系人姓名" />
        </div>
        <div class="form-item">
          <label class="form-label">联系电话 <span class="required">*</span></label>
          <input v-model="form.phone" class="form-input" placeholder="请输入手机号" type="tel" />
        </div>
        <div class="form-item">
          <label class="form-label">所在地区 <span class="required">*</span></label>
          <input v-model="form.address" class="form-input" placeholder="如：深圳市南山区" />
        </div>
        <div class="form-item">
          <label class="form-label">详细地址</label>
          <input v-model="form.detail_address" class="form-input" placeholder="请输入详细地址" />
        </div>
        <div class="form-item">
          <label class="form-label">主营项目</label>
          <div class="sport-tags">
            <span
              v-for="sport in sportsTypes"
              :key="sport"
              class="sport-tag"
              :class="{ selected: form.sports.includes(sport) }"
              @click="toggleSport(sport)"
            >
              {{ sport.icon }} {{ sport.name }}
            </span>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">机构简介</label>
          <textarea v-model="form.intro" class="form-textarea" placeholder="请简单介绍一下您的机构..." rows="3"></textarea>
        </div>
      </div>
    </div>

    <!-- 资质上传 -->
    <div class="form-section glass-card-solid animate-fade-in-up delay-3">
      <div class="form-title">资质证明 <span class="required">*</span></div>
      <div class="upload-list">
        <div class="upload-item" @click="uploadLicense">
          <img v-if="form.license_img" :src="form.license_img" class="upload-preview">
          <div v-else class="upload-placeholder">
            <van-icon name="photograph" size="32" />
            <span>营业执照</span>
          </div>
        </div>
        <div class="upload-item" @click="uploadQual">
          <img v-if="form.qual_img" :src="form.qual_img" class="upload-preview">
          <div v-else class="upload-placeholder">
            <van-icon name="photograph" size="32" />
            <span>资质证书</span>
          </div>
        </div>
      </div>
      <div class="upload-tip">请上传清晰的证件照片，便于审核</div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-bar">
      <div class="submit-btn glass-btn" @click="submitJoin">
        提交入驻申请
      </div>
    </div>

    <!-- 提交成功弹窗 -->
    <van-overlay :show="showSuccess" @click="showSuccess = false">
      <div class="success-modal glass-card">
        <div class="success-icon">🎉</div>
        <div class="success-title">提交成功！</div>
        <div class="success-desc">我们将在1-3个工作日内完成审核，请保持电话畅通</div>
        <div class="success-btn glass-btn" @click="goHome">
          返回首页
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { joinInstitution } from '../api/index.js'

const router = useRouter()
const showSuccess = ref(false)

const sportsTypes = [
  { name: '篮球', icon: '🏀' },
  { name: '游泳', icon: '🏊' },
  { name: '羽毛球', icon: '🏸' },
  { name: '足球', icon: '⚽' },
  { name: '网球', icon: '🎾' },
  { name: '跆拳道', icon: '🥋' },
  { name: '乒乓球', icon: '🏓' },
  { name: '体能训练', icon: '💪' },
]

const form = ref({
  name: '',
  contact: '',
  phone: '',
  address: '',
  detail_address: '',
  sports: [],
  intro: '',
  license_img: '',
  qual_img: '',
})

const toggleSport = (sport) => {
  const idx = form.value.sports.indexOf(sport.name)
  if (idx > -1) {
    form.value.sports.splice(idx, 1)
  } else {
    form.value.sports.push(sport.name)
  }
}

const uploadLicense = () => {
  // 模拟上传
  form.value.license_img = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400'
}

const uploadQual = () => {
  // 模拟上传
  form.value.qual_img = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
}

const submitJoin = async () => {
  if (!form.value.name || !form.value.contact || !form.value.phone) {
    alert('请填写必填项')
    return
  }
  try {
    await joinInstitution(form.value)
    showSuccess.value = true
  } catch (e) {
    alert('提交失败，请重试')
  }
}

const goHome = () => {
  showSuccess.value = false
  router.push('/')
}
</script>

<style scoped>
.join-page {
  padding: 16px;
  padding-bottom: 40px;
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

.advantages {
  padding: 20px;
  margin-bottom: 16px;
}

.adv-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
  text-align: center;
}

.adv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.adv-item {
  text-align: center;
  padding: 14px 10px;
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-md);
}

.adv-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.adv-text {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
}

.notice {
  padding: 16px;
  margin-bottom: 16px;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 14px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.notice-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
}

.form-section {
  padding: 16px;
  margin-bottom: 16px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.required {
  color: #ef476f;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #666;
}

.form-input {
  border: 1px solid #eee;
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
}

.form-input:focus {
  border-color: #667eea;
}

.form-textarea {
  border: 1px solid #eee;
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
  resize: none;
}

.sport-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sport-tag {
  padding: 6px 12px;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.sport-tag.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.upload-list {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.upload-item {
  flex: 1;
  aspect-ratio: 3/4;
  border: 2px dashed #ddd;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
  font-size: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
}

.submit-bar {
  padding: 16px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  text-align: center;
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
  font-size: 56px;
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
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.success-btn {
  padding: 12px 32px;
  font-size: 15px;
  display: inline-block;
}
</style>

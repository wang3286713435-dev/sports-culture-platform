<template>
  <div class="articles-page">
    <div class="page-header">
      <van-icon name="arrow-left" @click="$router.back()" />
      <span class="page-title">相关活动</span>
      <span></span>
    </div>
    
    <div class="articles-list">
      <div class="article-card" @click="showToast('更多活动即将上线')">
        <div class="article-cover" style="background: linear-gradient(135deg, #ff9a56, #ff6a54)">🏀</div>
        <div class="article-content">
          <div class="article-title">2026深圳市青少年篮球联赛</div>
          <div class="article-desc">深圳市体育局主办，面向全市青少年的篮球赛事活动，现火热报名中！</div>
          <div class="article-meta">
            <span>📅 2026-04-15</span>
            <span>👁 1256</span>
          </div>
        </div>
      </div>
      
      <div class="article-card" @click="showToast('更多活动即将上线')">
        <div class="article-cover" style="background: linear-gradient(135deg, #667eea, #764ba2)">🏊</div>
        <div class="article-content">
          <div class="article-title">社区亲子运动会</div>
          <div class="article-desc">周末亲子活动，增强家庭体质，促进亲子关系，社区联动等你来！</div>
          <div class="article-meta">
            <span>📅 2026-04-20</span>
            <span>👁 892</span>
          </div>
        </div>
      </div>
      
      <div class="article-card" @click="showToast('更多活动即将上线')">
        <div class="article-cover" style="background: linear-gradient(135deg, #11998e, #38ef7d)">🎾</div>
        <div class="article-content">
          <div class="article-title">深圳市网球公开赛</div>
          <div class="article-desc">深圳市网球爱好者交流赛，专业组与业余组同时开赛</div>
          <div class="article-meta">
            <span>📅 2026-05-01</span>
            <span>👁 654</span>
          </div>
        </div>
      </div>
      
      <div class="article-card" @click="showToast('更多活动即将上线')">
        <div class="article-cover" style="background: linear-gradient(135deg, #f093fb, #f5576c)">🥋</div>
        <div class="article-content">
          <div class="article-title">跆拳道等级考核</div>
          <div class="article-desc">年度跆拳道等级考核认证，含金量高，升学加分！</div>
          <div class="article-meta">
            <span>📅 2026-05-15</span>
            <span>👁 423</span>
          </div>
        </div>
      </div>
      
      <div class="placeholder-tip">
        <van-icon name="info-o" size="24" />
        <span>更多公众号文章内容即将上线，敬请期待！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
</script>

<style scoped>
.articles-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.articles-list {
  padding: 16px;
}

.article-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.article-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.article-content {
  flex: 1;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.article-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.article-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 16px;
}

.placeholder-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>

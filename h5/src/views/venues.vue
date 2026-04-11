<template>
  <div class="placeholder-page">
    <div class="placeholder-icon">📍</div>
    <div class="placeholder-title">找场地</div>
    <div class="placeholder-desc">合作场地信息即将上线</div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
showToast('找场地功能待添加')
</script>

<style scoped>
.placeholder-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.placeholder-icon { font-size: 64px; margin-bottom: 20px; }
.placeholder-title { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
.placeholder-desc { color: #999; }
</style>

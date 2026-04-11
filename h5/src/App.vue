<template>
  <div id="app" class="app-wrapper">
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- 底部TabBar -->
    <van-tabbar
      v-model="activeTab"
      active-color="#667eea"
      inactive-color="#999"
      :fixed="true"
      :placeholder="true"
      route
      @change="onTabChange"
    >
      <van-tabbar-item to="/" icon="wap-home">首页</van-tabbar-item>
      <van-tabbar-item to="/coaches" icon="friends-o">找教练</van-tabbar-item>
      <van-tabbar-item to="/courses" icon="book-o">课程</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="chart-trending-o">档案</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref(0)

const onTabChange = (index) => {
  activeTab.value = index
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  min-height: 100vh;
  background: #ffffff;
}

.app-wrapper {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #ffffff;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>

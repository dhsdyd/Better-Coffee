<template>
  <div class="navbar">{{ pageTitle }}</div>
  <router-view />
  <nav class="tabbar">
    <router-link to="/" class="tabbar-item"><span class="icon">🏠</span>首页</router-link>
    <router-link to="/beans" class="tabbar-item"><span class="icon">🫘</span>豆子</router-link>
    <router-link to="/brewing" class="tabbar-item"><span class="icon">☕</span>冲煮</router-link>
    <router-link to="/history" class="tabbar-item"><span class="icon">📋</span>历史</router-link>
    <router-link to="/settings" class="tabbar-item"><span class="icon">⚙️</span>设置</router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const titleMap = {
  home: 'Better Coffee',
  beans: '我的豆子',
  brewing: '冲煮记录',
  history: '冲煮历史',
  settings: '设置'
}
const pageTitle = computed(() => titleMap[route.name] || 'Better Coffee')
</script>

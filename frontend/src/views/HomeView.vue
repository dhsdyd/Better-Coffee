<template>
  <div class="container">
    <!-- 卡片1：今日推荐 -->
    <div class="card">
      <div class="section-title">
        今日推荐
        <span v-if="recommend && recommend.demo" class="demo-badge">Demo 模式</span>
      </div>

      <div v-if="loadingRecommend" class="loading">AI 推荐中...</div>
      <div v-else-if="recommendError" class="error-tip">{{ recommendError }}</div>
      <div v-else-if="recommend" class="recommend-content">
        <div v-if="recommend.bean" class="recommend-bean">
          <div class="recommend-name">
            {{ recommend.bean.name }}
            <span v-if="recommend.bean.origin" class="tag tag-primary">{{ originLabel(recommend.bean.origin) }}</span>
          </div>
          <div v-if="recommend.status" class="recommend-status">
            养豆状态：
            <span :class="statusTagClass(recommend.status)">{{ recommend.status.label }}</span>
            <template v-if="recommend.status.days !== null">（第 {{ recommend.status.days }} 天）</template>
          </div>
          <div v-if="recommend.reason" class="recommend-reason">{{ recommend.reason }}</div>
          <div v-if="recommend.tasteTags && recommend.tasteTags.length" class="recommend-tags">
            <span v-for="t in recommend.tasteTags" :key="t" class="tag tag-info">{{ tasteLabel(t) }}</span>
          </div>
        </div>
        <div v-else class="empty-state">暂无可用豆子，请先添加</div>
      </div>
      <div v-else class="empty-state">点击下方按钮获取 AI 推荐</div>

      <button class="btn-primary" style="margin-top:12px" :disabled="loadingRecommend || beans.length === 0" @click="fetchRecommend">
        {{ loadingRecommend ? '推荐中...' : '获取 AI 推荐' }}
      </button>
    </div>

    <!-- 卡片2：养豆分析 -->
    <div class="card">
      <div class="section-title">养豆分析</div>
      <div v-if="loadingBeans" class="loading">加载中...</div>
      <div v-else-if="activeBeans.length === 0" class="empty-state">暂无在养豆子</div>
      <div v-else class="bean-status-list">
        <div v-for="bean in activeBeans" :key="bean._id" class="bean-status-item">
          <div class="bsi-name">{{ bean.name }}</div>
          <div class="bsi-meta">
            <span class="tag" :class="statusTagClass(beanStatus(bean))">{{ beanStatus(bean).label }}</span>
            <span v-if="beanStatus(bean).days !== null" class="bsi-days">第 {{ beanStatus(bean).days }} 天</span>
            <span v-if="beanStatus(bean).window" class="bsi-window">建议 {{ beanStatus(bean).window[0] }}-{{ beanStatus(bean).window[1] }} 天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片3：最近冲煮 -->
    <div class="card">
      <div class="section-title">最近冲煮</div>
      <div v-if="loadingBrewings" class="loading">加载中...</div>
      <div v-else-if="recentBrewings.length === 0" class="empty-state">暂无冲煮记录</div>
      <div v-else class="brewing-list">
        <div v-for="b in recentBrewings" :key="b._id" class="brewing-item" @click="goHistory">
          <div class="bi-header">
            <span class="bi-name">{{ beanName(b.beanId) }}</span>
            <span class="bi-method tag tag-primary">{{ methodLabel(b.method) }}</span>
          </div>
          <div class="bi-meta">
            <StarRating :model-value="b.rating || 0" readonly />
            <span class="bi-time">{{ formatRelative(b.createdAt) }}</span>
          </div>
          <div v-if="b.tasteTags && b.tasteTags.length" class="bi-tags">
            <span v-for="t in b.tasteTags" :key="t" class="tag tag-info">{{ tasteLabel(t) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { beansApi, brewingsApi, aiApi } from '@/api'
import { getBeanStatus } from '@/utils/bean-status'
import { formatRelative, methodLabel } from '@/utils/format'
import { ORIGINS, TASTE_TAGS } from '@/constants/options'
import StarRating from '@/components/StarRating.vue'

const router = useRouter()

const beans = ref([])
const brewings = ref([])
const recommend = ref(null)
const loadingBeans = ref(false)
const loadingBrewings = ref(false)
const loadingRecommend = ref(false)
const recommendError = ref('')

const activeBeans = computed(() => beans.value.filter(b => !b.finished))

function beanStatus(bean) {
  return getBeanStatus(bean.roastDate, bean.roastLevel)
}

function statusTagClass(status) {
  const map = {
    resting: 'tag-warning',
    peak: 'tag-success',
    late: 'tag-danger',
    unknown: 'tag'
  }
  return map[status.status] || 'tag'
}

function originLabel(val) {
  const o = ORIGINS.find(i => i.value === val)
  return o ? o.label : val
}

function tasteLabel(val) {
  const t = TASTE_TAGS.find(i => i.value === val)
  return t ? t.label : val
}

function beanName(beanId) {
  const b = beans.value.find(x => x._id === beanId)
  return b ? b.name : '未知豆子'
}

async function loadBeans() {
  loadingBeans.value = true
  try {
    beans.value = await beansApi.list() || []
  } catch (e) {
    beans.value = []
  } finally {
    loadingBeans.value = false
  }
}

async function loadBrewings() {
  loadingBrewings.value = true
  try {
    const list = await brewingsApi.list() || []
    brewings.value = list
  } catch (e) {
    brewings.value = []
  } finally {
    loadingBrewings.value = false
  }
}

const recentBrewings = computed(() => {
  const list = [...brewings.value]
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return list.slice(0, 3)
})

async function fetchRecommend() {
  if (activeBeans.value.length === 0) {
    recommendError.value = '暂无可用豆子'
    return
  }
  loadingRecommend.value = true
  recommendError.value = ''
  try {
    const res = await aiApi.beanRecommend({ beans: activeBeans.value })
    recommend.value = res
  } catch (e) {
    recommendError.value = e.message || '推荐失败'
  } finally {
    loadingRecommend.value = false
  }
}

function goHistory() {
  router.push('/history')
}

onMounted(() => {
  loadBeans()
  loadBrewings()
})
</script>

<style scoped>
.recommend-content .recommend-bean { padding: 4px 0; }
.recommend-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.recommend-status { font-size: 13px; color: var(--color-text); margin-bottom: 6px; }
.recommend-reason { font-size: 13px; color: var(--color-text-light); line-height: 1.6; margin-bottom: 8px; }
.recommend-tags { display: flex; flex-wrap: wrap; }

.error-tip { color: var(--color-danger); font-size: 13px; padding: 8px 0; }

.bean-status-list { display: flex; flex-direction: column; gap: 12px; }
.bean-status-item { border-bottom: 1px dashed var(--color-border); padding-bottom: 10px; }
.bean-status-item:last-child { border-bottom: none; }
.bsi-name { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.bsi-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-light); flex-wrap: wrap; }
.bsi-days { color: var(--color-text); }
.bsi-window { font-size: 11px; }

.brewing-list { display: flex; flex-direction: column; gap: 12px; }
.brewing-item { padding: 10px 0; border-bottom: 1px dashed var(--color-border); cursor: pointer; }
.brewing-item:last-child { border-bottom: none; }
.bi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.bi-name { font-size: 14px; font-weight: 500; }
.bi-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.bi-time { font-size: 11px; color: var(--color-text-light); }
.bi-tags { margin-top: 6px; display: flex; flex-wrap: wrap; }
</style>

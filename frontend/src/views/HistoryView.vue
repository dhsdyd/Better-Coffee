<template>
  <div class="container">
    <div class="card filter-bar">
      <label class="filter-item">
        <input type="checkbox" v-model="onlyFavorite" />
        <span>只看最爱</span>
      </label>
      <span class="count-tip">共 {{ filteredBrewings.length }} 条</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="filteredBrewings.length === 0" class="empty-state">
      暂无冲煮记录
    </div>
    <div v-else class="history-list">
      <div
        v-for="b in filteredBrewings"
        :key="b._id"
        class="history-item card"
        @click="openDetail(b)"
      >
        <div class="hi-header">
          <span class="hi-name">{{ beanName(b.beanId) }}</span>
          <span class="hi-method tag tag-primary">{{ methodLabel(b.method) }}</span>
          <span v-if="b.favorite" class="hi-fav">★</span>
        </div>
        <div class="hi-meta">
          <StarRating :model-value="b.rating || 0" readonly />
          <span class="hi-time">{{ formatRelative(b.createdAt) }}</span>
        </div>
        <div v-if="b.params" class="hi-params">{{ formatBrewingParams(b.params, b.method) }}</div>
        <div v-if="b.tasteTags && b.tasteTags.length" class="hi-tags">
          <span v-for="t in b.tasteTags" :key="t" class="tag tag-info">{{ tasteLabel(t) }}</span>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detailVisible" class="modal-mask" @click.self="closeDetail">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">冲煮详情</div>
          <span class="modal-close" @click="closeDetail">×</span>
        </div>
        <div v-if="current" class="modal-body">
          <div class="detail-row">
            <span class="detail-label">豆子</span>
            <span class="detail-value">{{ beanName(current.beanId) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">方式</span>
            <span class="detail-value">{{ methodLabel(current.method) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">评分</span>
            <span class="detail-value"><StarRating :model-value="current.rating || 0" readonly /></span>
          </div>
          <div v-if="current.params" class="detail-row">
            <span class="detail-label">参数</span>
            <span class="detail-value params-text">{{ formatBrewingParams(current.params, current.method) }}</span>
          </div>
          <div v-if="current.tasteTags && current.tasteTags.length" class="detail-row">
            <span class="detail-label">风味</span>
            <span class="detail-value">
              <span v-for="t in current.tasteTags" :key="t" class="tag tag-info">{{ tasteLabel(t) }}</span>
            </span>
          </div>
          <div v-if="current.improvement" class="detail-row">
            <span class="detail-label">改进方向</span>
            <span class="detail-value">{{ improvementLabel(current.improvement) }}</span>
          </div>
          <div v-if="current.notes" class="detail-row">
            <span class="detail-label">备注</span>
            <span class="detail-value notes-text">{{ current.notes }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">时间</span>
            <span class="detail-value">{{ formatDate(current.createdAt) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="toggleFavorite">
            {{ current && current.favorite ? '取消最爱' : '标记最爱' }}
          </button>
          <button class="btn-secondary" @click="reuse">复用参数</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { beansApi, brewingsApi } from '@/api'
import { formatRelative, formatDate, methodLabel, formatBrewingParams } from '@/utils/format'
import { TASTE_TAGS, IMPROVEMENT_DIRS } from '@/constants/options'
import StarRating from '@/components/StarRating.vue'

const router = useRouter()

const beans = ref([])
const brewings = ref([])
const loading = ref(false)
const onlyFavorite = ref(false)

const detailVisible = ref(false)
const current = ref(null)

const filteredBrewings = computed(() => {
  let list = [...brewings.value]
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (onlyFavorite.value) list = list.filter(b => b.favorite)
  return list
})

function beanName(beanId) {
  const b = beans.value.find(x => x._id === beanId)
  return b ? b.name : '未知豆子'
}

function tasteLabel(val) {
  const t = TASTE_TAGS.find(i => i.value === val)
  return t ? t.label : val
}

function improvementLabel(val) {
  const d = IMPROVEMENT_DIRS.find(i => i.value === val)
  return d ? d.label : val
}

async function loadBeans() {
  try {
    beans.value = await beansApi.list() || []
  } catch (e) {
    beans.value = []
  }
}

async function loadBrewings() {
  loading.value = true
  try {
    brewings.value = await brewingsApi.list() || []
  } catch (e) {
    brewings.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(b) {
  current.value = b
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  current.value = null
}

async function toggleFavorite() {
  if (!current.value) return
  try {
    const res = await brewingsApi.markFavorite(current.value._id)
    const newVal = res && typeof res.favorite === 'boolean' ? res.favorite : !current.value.favorite
    current.value.favorite = newVal
    const item = brewings.value.find(b => b._id === current.value._id)
    if (item) item.favorite = newVal
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

function reuse() {
  if (!current.value) return
  router.push({ path: '/brewing', query: { reuse: current.value._id } })
}

onMounted(async () => {
  await Promise.all([loadBeans(), loadBrewings()])
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.filter-item { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.filter-item input { width: 16px; height: 16px; }
.count-tip { font-size: 12px; color: var(--color-text-light); }

.history-list { display: flex; flex-direction: column; gap: 4px; }
.history-item { cursor: pointer; padding: 14px 16px; }
.history-item:active { transform: scale(0.99); }

.hi-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.hi-name { font-size: 15px; font-weight: 600; flex: 1; }
.hi-fav { color: var(--color-star); font-size: 16px; }

.hi-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.hi-time { font-size: 11px; color: var(--color-text-light); }
.hi-params { font-size: 12px; color: var(--color-text-light); margin-bottom: 6px; line-height: 1.5; }
.hi-tags { display: flex; flex-wrap: wrap; }

.detail-row { display: flex; padding: 8px 0; border-bottom: 1px dashed var(--color-border); }
.detail-row:last-child { border-bottom: none; }
.detail-label { width: 70px; font-size: 13px; color: var(--color-text-light); flex-shrink: 0; }
.detail-value { flex: 1; font-size: 13px; color: var(--color-text); }
.params-text { font-size: 12px; line-height: 1.6; }
.notes-text { white-space: pre-wrap; line-height: 1.6; }
</style>

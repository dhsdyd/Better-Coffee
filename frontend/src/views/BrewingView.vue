<template>
  <div class="container">
    <!-- 选豆 -->
    <div class="card">
      <div class="section-title">选择豆子</div>
      <div v-if="loadingBeans" class="loading">加载中...</div>
      <div v-else-if="beans.length === 0" class="empty-state">
        暂无豆子，请先到"豆子"页面添加
      </div>
      <div v-else>
        <div class="form-group">
          <label class="form-label">豆子 *</label>
          <select v-model="form.beanId" class="form-picker">
            <option value="">请选择</option>
            <option v-for="b in beans" :key="b._id" :value="b._id">
              {{ b.name }}{{ b.finished ? '（已喝完）' : '' }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">冲煮方式 *</label>
          <select v-model="form.method" class="form-picker">
            <option v-for="m in BREW_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 冲煮参数 -->
    <div class="card">
      <div class="section-title">冲煮参数</div>
      <BrewingForm v-model="form.params" :method="form.method" />
    </div>

    <!-- 评分与风味 -->
    <div class="card">
      <div class="section-title">评分与风味</div>
      <div class="form-group">
        <label class="form-label">评分</label>
        <StarRating v-model="form.rating" />
      </div>
      <div class="form-group">
        <label class="form-label">风味标签</label>
        <div class="taste-tags">
          <span
            v-for="t in TASTE_TAGS"
            :key="t.value"
            class="tag-select"
            :class="{ active: form.tasteTags.includes(t.value) }"
            @click="toggleTaste(t.value)"
          >{{ t.label }}</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">改进方向</label>
        <select v-model="form.improvement" class="form-picker">
          <option value="">无</option>
          <option v-for="d in IMPROVEMENT_DIRS" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea v-model="form.notes" class="form-textarea" placeholder="冲煮体验、改进想法等"></textarea>
      </div>
    </div>

    <!-- AI 推荐 -->
    <div class="card">
      <div class="section-title">
        AI 推荐参数
        <span v-if="recommend && recommend.demo" class="demo-badge">Demo 模式</span>
      </div>

      <div v-if="recommendError" class="error-tip">{{ recommendError }}</div>

      <div v-if="recommend" class="recommend-result">
        <div v-if="recommend.summary" class="recommend-summary">{{ recommend.summary }}</div>
        <div v-if="recommend.changes && recommend.changes.length" class="recommend-changes">
          <div class="rc-title">建议调整：</div>
          <ul>
            <li v-for="(c, i) in recommend.changes" :key="i">{{ c }}</li>
          </ul>
        </div>
        <div v-if="recommend.suggestedParams" class="suggested-params">
          <div class="rc-title">推荐参数：</div>
          <div class="params-text">{{ formatBrewingParams(recommend.suggestedParams, form.method) }}</div>
        </div>
        <button
          v-if="recommend.suggestedParams"
          class="btn-secondary"
          style="margin-top:10px"
          @click="applyRecommend"
        >应用推荐参数</button>
      </div>

      <button
        class="btn-primary"
        style="margin-top:10px"
        :disabled="loadingRecommend || !form.beanId"
        @click="fetchRecommend"
      >
        {{ loadingRecommend ? 'AI 思考中...' : '获取 AI 推荐' }}
      </button>
    </div>

    <!-- 保存 -->
    <div class="action-bar">
      <button class="btn-primary" :disabled="!form.beanId || saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存冲煮记录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { beansApi, brewingsApi, aiApi } from '@/api'
import { BREW_METHODS, TASTE_TAGS, IMPROVEMENT_DIRS } from '@/constants/options'
import { formatBrewingParams } from '@/utils/format'
import StarRating from '@/components/StarRating.vue'
import BrewingForm from '@/components/BrewingForm.vue'

const route = useRoute()
const router = useRouter()

const beans = ref([])
const loadingBeans = ref(false)

const form = reactive({
  beanId: '',
  method: 'pour_over',
  params: {},
  rating: 0,
  tasteTags: [],
  improvement: '',
  notes: ''
})

const saving = ref(false)
const loadingRecommend = ref(false)
const recommend = ref(null)
const recommendError = ref('')

function toggleTaste(val) {
  const idx = form.tasteTags.indexOf(val)
  if (idx >= 0) form.tasteTags.splice(idx, 1)
  else form.tasteTags.push(val)
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

async function fetchRecommend() {
  if (!form.beanId) return
  loadingRecommend.value = true
  recommendError.value = ''
  recommend.value = null
  try {
    const bean = beans.value.find(b => b._id === form.beanId)
    const res = await aiApi.brewingRecommend({
      bean,
      method: form.method,
      params: form.params,
      rating: form.rating,
      tasteTags: form.tasteTags,
      improvement: form.improvement
    })
    recommend.value = res
  } catch (e) {
    recommendError.value = e.message || '推荐失败'
  } finally {
    loadingRecommend.value = false
  }
}

function applyRecommend() {
  if (!recommend.value || !recommend.value.suggestedParams) return
  form.params = { ...form.params, ...recommend.value.suggestedParams }
}

async function handleSave() {
  if (!form.beanId) {
    alert('请选择豆子')
    return
  }
  saving.value = true
  try {
    await brewingsApi.create({
      beanId: form.beanId,
      method: form.method,
      params: form.params,
      rating: form.rating,
      tasteTags: form.tasteTags,
      improvement: form.improvement,
      notes: form.notes
    })
    router.push('/history')
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function loadReuse() {
  const reuseId = route.query.reuse
  if (!reuseId) return
  try {
    const b = await brewingsApi.get(reuseId)
    if (b) {
      form.beanId = b.beanId || ''
      form.method = b.method || 'pour_over'
      form.params = b.params || {}
      form.rating = b.rating || 0
      form.tasteTags = b.tasteTags || []
      form.improvement = b.improvement || ''
      form.notes = b.notes || ''
    }
  } catch (e) {
    // ignore
  }
}

watch(() => form.method, () => {
  form.params = {}
})

onMounted(async () => {
  await loadBeans()
  await loadReuse()
})
</script>

<style scoped>
.error-tip { color: var(--color-danger); font-size: 13px; padding: 8px 0; }
.recommend-result { padding: 4px 0; }
.recommend-summary { font-size: 13px; line-height: 1.6; margin-bottom: 8px; color: var(--color-text); }
.recommend-changes { font-size: 13px; margin-bottom: 10px; }
.rc-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.recommend-changes ul { padding-left: 20px; color: var(--color-text-light); }
.recommend-changes li { line-height: 1.6; }
.suggested-params { font-size: 13px; margin-bottom: 10px; }
.params-text { background: var(--color-bg); padding: 8px 10px; border-radius: 6px; font-size: 12px; line-height: 1.6; }

.taste-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-select {
  padding: 6px 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 12px;
  color: var(--color-text-light);
  cursor: pointer;
  user-select: none;
}
.tag-select.active {
  background: rgba(111, 78, 55, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>

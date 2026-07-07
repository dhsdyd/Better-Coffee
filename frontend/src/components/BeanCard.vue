<template>
  <div
    class="bean-card card"
    :class="{ finished: bean.finished }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchEnd"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <div v-if="bean.finished" class="finished-badge">已喝完</div>
    <div class="bean-card-header">
      <div class="bean-name">{{ bean.name }}</div>
      <span class="status-tag" :class="statusClass">{{ status.label }}</span>
    </div>

    <div class="bean-meta">
      <span v-if="originLabel" class="meta-item">产地：{{ originLabel }}</span>
      <span v-if="varietyLabel" class="meta-item">品种：{{ varietyLabel }}</span>
      <span v-if="processLabel" class="meta-item">处理：{{ processLabel }}</span>
      <span v-if="roastLabel" class="meta-item">烘焙：{{ roastLabel }}</span>
    </div>

    <div v-if="status.days !== null" class="roast-days">
      烘焙后第 <strong>{{ status.days }}</strong> 天
      <span v-if="status.window" class="window-tip">（建议 {{ status.window[0] }}-{{ status.window[1] }} 天）</span>
    </div>

    <div class="weight-section">
      <div class="weight-info">
        <span class="weight-label">剩余量</span>
        <span class="weight-value">{{ bean.remainingWeight }}g / {{ bean.weight }}g</span>
      </div>
      <div class="weight-bar">
        <div class="weight-bar-inner" :style="{ width: weightPercent + '%' }" :class="statusClass"></div>
      </div>
    </div>

    <div v-if="bean.notes" class="bean-notes">{{ bean.notes }}</div>

    <div class="longpress-tip">长按可操作</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue'
import { getBeanStatus, ROAST_LABELS } from '@/utils/bean-status'
import { ORIGINS, VARIETIES, PROCESSES } from '@/constants/options'

const props = defineProps({
  bean: { type: Object, required: true }
})
const emit = defineEmits(['longpress'])

let timer = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function startPress() {
  clearTimer()
  timer = setTimeout(() => {
    emit('longpress', props.bean)
    timer = null
  }, 500)
}

function endPress() {
  clearTimer()
}

function onTouchStart() { startPress() }
function onTouchEnd() { endPress() }
function onMouseDown() { startPress() }
function onMouseUp() { endPress() }

onBeforeUnmount(clearTimer)

const status = computed(() => getBeanStatus(props.bean.roastDate, props.bean.roastLevel))

const statusClass = computed(() => {
  const map = {
    resting: 'tag-warning',
    peak: 'tag-success',
    late: 'tag-danger',
    unknown: 'tag'
  }
  return map[status.value.status] || 'tag'
})

const originLabel = computed(() => {
  const o = ORIGINS.find(i => i.value === props.bean.origin)
  return o ? o.label : props.bean.origin
})

const varietyLabel = computed(() => {
  const v = VARIETIES.find(i => i.value === props.bean.variety)
  return v ? v.label : props.bean.variety
})

const processLabel = computed(() => {
  const p = PROCESSES.find(i => i.value === props.bean.process)
  return p ? p.label : props.bean.process
})

const roastLabel = computed(() => ROAST_LABELS[props.bean.roastLevel] || props.bean.roastLevel)

const weightPercent = computed(() => {
  const total = Number(props.bean.weight) || 0
  const remaining = Number(props.bean.remainingWeight) || 0
  if (total <= 0) return 0
  const p = (remaining / total) * 100
  return Math.max(0, Math.min(100, p))
})
</script>

<style scoped>
.bean-card { position: relative; cursor: pointer; transition: transform 0.15s; }
.bean-card:active { transform: scale(0.99); }
.bean-card.finished { opacity: 0.75; }

.finished-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-text-light);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.bean-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.bean-name {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  padding-right: 8px;
}

.status-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
}

.bean-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 12px;
  color: var(--color-text-light);
  margin-bottom: 8px;
}

.roast-days {
  font-size: 13px;
  color: var(--color-text);
  margin-bottom: 10px;
}
.window-tip { color: var(--color-text-light); font-size: 11px; }

.weight-section { margin-top: 4px; }
.weight-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-light);
  margin-bottom: 6px;
}
.weight-bar {
  height: 6px;
  background: var(--color-bg);
  border-radius: 3px;
  overflow: hidden;
}
.weight-bar-inner {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.weight-bar-inner.tag-warning { background: var(--color-warning); }
.weight-bar-inner.tag-success { background: var(--color-success); }
.weight-bar-inner.tag-danger { background: var(--color-danger); }
.weight-bar-inner.tag { background: var(--color-primary-light); }

.bean-notes {
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text-light);
  border-top: 1px dashed var(--color-border);
  padding-top: 8px;
  line-height: 1.5;
}

.longpress-tip {
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text-light);
  text-align: right;
  opacity: 0.6;
}
</style>

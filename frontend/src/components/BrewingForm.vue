<template>
  <div class="brewing-form">
    <template v-if="method === 'pour_over'">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">粉量(g)</label>
          <input v-model.number="local.beanWeight" type="number" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">水量(g)</label>
          <input v-model.number="local.waterWeight" type="number" min="0" step="0.1" class="form-input" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">比例(1:N)</label>
          <input v-model.number="local.ratio" type="number" min="0" step="0.1" class="form-input" placeholder="如 15" />
        </div>
        <div class="form-group">
          <label class="form-label">研磨度</label>
          <input v-model="local.grindSize" class="form-input" placeholder="如 中细" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">水温(℃)</label>
          <input v-model.number="local.waterTemp" type="number" min="0" step="1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">总时间</label>
          <input v-model="local.totalTime" class="form-input" placeholder="如 2:30" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">冲煮器具</label>
        <input v-model="local.brewer" class="form-input" placeholder="如 V60 / 蛋糕滤杯" />
      </div>
    </template>

    <template v-else-if="method === 'espresso'">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">粉量(g)</label>
          <input v-model.number="local.beanWeight" type="number" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">液重(g)</label>
          <input v-model.number="local.yieldWeight" type="number" min="0" step="0.1" class="form-input" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">比例(1:N)</label>
          <input v-model.number="local.ratio" type="number" min="0" step="0.1" class="form-input" placeholder="如 2" />
        </div>
        <div class="form-group">
          <label class="form-label">研磨度</label>
          <input v-model="local.grindSize" class="form-input" placeholder="如 细" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">水温(℃)</label>
          <input v-model.number="local.waterTemp" type="number" min="0" step="1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">总时间</label>
          <input v-model="local.totalTime" class="form-input" placeholder="如 28s" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">咖啡机</label>
        <input v-model="local.machine" class="form-input" placeholder="如 La Marzocco" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  method: { type: String, default: 'pour_over' },
  modelValue: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

function defaultParams() {
  return {
    beanWeight: null,
    waterWeight: null,
    yieldWeight: null,
    ratio: null,
    grindSize: '',
    waterTemp: null,
    totalTime: '',
    brewer: '',
    machine: ''
  }
}

const local = reactive({ ...defaultParams(), ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    Object.assign(local, defaultParams(), val)
  },
  { deep: true }
)

watch(
  local,
  (val) => {
    const cleaned = {}
    for (const k in val) {
      if (val[k] !== '' && val[k] !== null && val[k] !== undefined) {
        cleaned[k] = val[k]
      }
    }
    emit('update:modelValue', cleaned)
  },
  { deep: true }
)
</script>

<style scoped>
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
</style>

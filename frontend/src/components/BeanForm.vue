<template>
  <div v-if="visible" class="modal-mask" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">{{ isEdit ? '编辑豆子' : '添加豆子' }}</div>
        <span class="modal-close" @click="handleClose">×</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">名称 *</label>
          <input
            v-model="form.name"
            class="form-input"
            placeholder="例如：埃塞俄比亚 耶加雪菲"
          />
        </div>

        <div class="form-group">
          <label class="form-label">产地</label>
          <select v-model="form.origin" class="form-picker">
            <option value="">请选择</option>
            <option v-for="o in ORIGINS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">品种</label>
          <select v-model="form.variety" class="form-picker">
            <option value="">请选择</option>
            <option v-for="v in VARIETIES" :key="v.value" :value="v.value">{{ v.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">处理法</label>
          <select v-model="form.process" class="form-picker">
            <option value="">请选择</option>
            <option v-for="p in PROCESSES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">烘焙度 *</label>
          <select v-model="form.roastLevel" class="form-picker">
            <option value="">请选择</option>
            <option v-for="r in ROAST_LEVELS" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">烘焙日期 *</label>
          <input v-model="form.roastDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">总重量(g) *</label>
          <input v-model.number="form.weight" type="number" min="0" step="0.1" class="form-input" placeholder="例如：200" />
        </div>

        <div v-if="isEdit" class="form-group">
          <label class="form-label">剩余重量(g)</label>
          <input v-model.number="form.remainingWeight" type="number" min="0" step="0.1" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea v-model="form.notes" class="form-textarea" placeholder="风味描述、购买信息等"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">取消</button>
        <button class="btn-primary" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { ROAST_LEVELS, ORIGINS, VARIETIES, PROCESSES } from '@/constants/options'

const props = defineProps({
  visible: { type: Boolean, default: false },
  bean: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.bean)

function emptyForm() {
  return {
    name: '',
    origin: '',
    variety: '',
    process: '',
    roastLevel: '',
    roastDate: '',
    weight: null,
    remainingWeight: null,
    notes: '',
    finished: false
  }
}

const form = reactive(emptyForm())

watch(
  () => [props.visible, props.bean],
  ([vis]) => {
    if (!vis) return
    if (props.bean) {
      Object.assign(form, {
        name: props.bean.name || '',
        origin: props.bean.origin || '',
        variety: props.bean.variety || '',
        process: props.bean.process || '',
        roastLevel: props.bean.roastLevel || '',
        roastDate: props.bean.roastDate ? props.bean.roastDate.slice(0, 10) : '',
        weight: props.bean.weight ?? null,
        remainingWeight: props.bean.remainingWeight ?? null,
        notes: props.bean.notes || '',
        finished: props.bean.finished ?? false
      })
    } else {
      Object.assign(form, emptyForm())
    }
  },
  { immediate: true }
)

function validate() {
  if (!form.name || !form.name.trim()) return '请填写名称'
  if (!form.roastDate) return '请选择烘焙日期'
  if (!form.roastLevel) return '请选择烘焙度'
  if (form.weight === null || form.weight === '' || Number(form.weight) <= 0) return '请填写有效的总重量'
  return ''
}

function handleSave() {
  const err = validate()
  if (err) {
    alert(err)
    return
  }
  const payload = {
    name: form.name.trim(),
    origin: form.origin,
    variety: form.variety,
    process: form.process,
    roastLevel: form.roastLevel,
    roastDate: form.roastDate,
    weight: Number(form.weight),
    notes: form.notes || ''
  }
  if (isEdit.value) {
    payload._id = props.bean._id
    payload.remainingWeight = form.remainingWeight !== null ? Number(form.remainingWeight) : Number(form.weight)
    payload.finished = !!(form.finished || payload.remainingWeight <= 0)
  } else {
    payload.remainingWeight = Number(form.weight)
    payload.finished = false
  }
  emit('save', payload)
}

function handleClose() {
  emit('close')
}
</script>

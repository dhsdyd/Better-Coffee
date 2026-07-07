<template>
  <div class="container">
    <div class="action-bar">
      <button class="btn-primary" @click="openAdd">+ 添加豆子</button>
    </div>

    <div class="filter-bar card">
      <label class="filter-item">
        <input type="checkbox" v-model="showFinished" />
        <span>显示已喝完</span>
      </label>
      <span class="count-tip">共 {{ filteredBeans.length }} 包</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="filteredBeans.length === 0" class="empty-state">
      暂无豆子，点击上方添加
    </div>
    <div v-else class="beans-list">
      <BeanCard
        v-for="bean in filteredBeans"
        :key="bean._id"
        :bean="bean"
        @longpress="onLongPress"
        @click="openEdit(bean)"
      />
    </div>

    <BeanForm
      :visible="formVisible"
      :bean="editingBean"
      @close="closeForm"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { beansApi } from '@/api'
import BeanCard from '@/components/BeanCard.vue'
import BeanForm from '@/components/BeanForm.vue'

const beans = ref([])
const loading = ref(false)
const showFinished = ref(true)

const formVisible = ref(false)
const editingBean = ref(null)

const filteredBeans = computed(() => {
  const list = [...beans.value]
  list.sort((a, b) => {
    if (a.finished !== b.finished) return a.finished ? 1 : -1
    return new Date(b.roastDate) - new Date(a.roastDate)
  })
  return showFinished.value ? list : list.filter(b => !b.finished)
})

async function loadBeans() {
  loading.value = true
  try {
    beans.value = await beansApi.list() || []
  } catch (e) {
    beans.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingBean.value = null
  formVisible.value = true
}

function openEdit(bean) {
  editingBean.value = bean
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
  editingBean.value = null
}

async function onSave(payload) {
  try {
    if (payload._id) {
      await beansApi.update(payload._id, payload)
    } else {
      await beansApi.create(payload)
    }
    closeForm()
    await loadBeans()
  } catch (e) {
    alert(e.message || '保存失败')
  }
}

async function onLongPress(bean) {
  const action = confirm(
    `${bean.name}\n\n选择操作：\n  确定 - 编辑\n  取消 - 关闭\n\n（点击"取消"后再选择是否标记/删除）`
  )
  if (action) {
    openEdit(bean)
    return
  }
  // 二次确认：标记已喝完 / 删除
  const sub = prompt(
    `${bean.name}\n输入操作序号：\n  1 - ${bean.finished ? '取消已喝完' : '标记已喝完'}\n  2 - 删除\n  其他 - 取消`
  )
  if (sub === '1') {
    try {
      const newFinished = !bean.finished
      const remaining = newFinished ? 0 : (bean.weight || 0)
      await beansApi.update(bean._id, {
        ...bean,
        finished: newFinished,
        remainingWeight: remaining
      })
      await loadBeans()
    } catch (e) {
      alert(e.message || '操作失败')
    }
  } else if (sub === '2') {
    if (confirm(`确认删除 "${bean.name}"？`)) {
      try {
        await beansApi.remove(bean._id)
        await loadBeans()
      } catch (e) {
        alert(e.message || '删除失败')
      }
    }
  }
}

onMounted(loadBeans)
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text);
}
.filter-item input { width: 16px; height: 16px; }
.count-tip { font-size: 12px; color: var(--color-text-light); }

.beans-list { display: flex; flex-direction: column; gap: 4px; }
</style>

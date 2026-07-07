<template>
  <div class="container">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <!-- Demo 提示 -->
      <div v-if="!settings.hasApiKey" class="demo-tip">
        当前为 Demo 模式，AI 推荐将返回模拟数据。配置真实 API Key 后可获取真实推荐。
      </div>

      <!-- AI 配置 -->
      <div class="card">
        <div class="section-title">AI 服务配置</div>

        <div class="form-group">
          <label class="form-label">服务商</label>
          <select v-model="form.provider" class="form-picker" @change="onProviderChange">
            <option value="">请选择</option>
            <option v-for="p in AI_PROVIDERS" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">模型</label>
          <input v-model="form.model" class="form-input" placeholder="如 gpt-4o-mini" />
        </div>

        <div class="form-group">
          <label class="form-label">API Key</label>
          <div class="api-key-row">
            <input
              v-model="form.apiKey"
              :type="showKey ? 'text' : 'password'"
              class="form-input"
              placeholder="输入新的 API Key"
            />
            <button class="toggle-btn" @click="showKey = !showKey">{{ showKey ? '隐藏' : '显示' }}</button>
          </div>
          <div v-if="savedKeyMasked" class="saved-key">
            当前已保存：<span class="masked">{{ savedKeyMasked }}</span>
          </div>
        </div>

        <button
          class="btn-secondary"
          style="margin-top: 8px; width: 100%;"
          :disabled="testing || !form.provider"
          @click="testConnection"
        >
          {{ testing ? '测试中...' : '测试连接' }}
        </button>

        <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'fail'">
          {{ testResult.message }}
        </div>
      </div>

      <!-- 保存按钮 -->
      <button
        class="btn-primary save-btn"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存配置' }}
      </button>

      <!-- 关于 -->
      <div class="card about-card">
        <div class="section-title">关于</div>
        <div class="about-item">Better Coffee · 精品咖啡冲煮记录</div>
        <div class="about-item">版本 1.0.0</div>
        <div class="about-item about-tip">
          AI 推荐基于豆子信息和冲煮历史，提供参数调整建议。配置真实 API Key 后即可获取真实推荐。
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { settingsApi, aiApi } from '@/api'
import { AI_PROVIDERS } from '@/constants/options'
import { maskApiKey } from '@/utils/format'

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const showKey = ref(false)

const settings = reactive({
  provider: '',
  model: '',
  apiKey: '',
  hasApiKey: false
})

const form = reactive({
  provider: '',
  model: '',
  apiKey: ''
})

const testResult = ref(null)

const savedKeyMasked = computed(() => {
  if (!settings.apiKey) return ''
  return maskApiKey(settings.apiKey)
})

function onProviderChange() {
  const p = AI_PROVIDERS.find(i => i.value === form.provider)
  if (p && !form.model) {
    form.model = p.defaultModel
  } else if (p && form.model) {
    // 仅当当前 model 是其他服务商的 defaultModel 时才覆盖
    const isPrevDefault = AI_PROVIDERS.some(i => i.defaultModel === form.model && i.value !== form.provider)
    if (isPrevDefault) form.model = p.defaultModel
  }
}

async function loadSettings() {
  loading.value = true
  try {
    const res = await settingsApi.get()
    settings.provider = res?.provider || ''
    settings.model = res?.model || ''
    settings.apiKey = res?.apiKey || ''
    settings.hasApiKey = !!res?.hasApiKey
    form.provider = settings.provider
    form.model = settings.model
    form.apiKey = ''
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.provider) {
    alert('请选择服务商')
    return
  }
  saving.value = true
  try {
    const payload = {
      provider: form.provider,
      model: form.model
    }
    if (form.apiKey) {
      payload.apiKey = form.apiKey
    }
    const res = await settingsApi.update(payload)
    if (res) {
      settings.provider = res.provider || form.provider
      settings.model = res.model || form.model
      settings.apiKey = res.apiKey || (form.apiKey ? form.apiKey : settings.apiKey)
      settings.hasApiKey = !!res.hasApiKey
    } else {
      settings.hasApiKey = !!(form.apiKey || settings.apiKey)
    }
    form.apiKey = ''
    alert('保存成功')
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  if (!form.provider) {
    alert('请先选择服务商')
    return
  }
  testing.value = true
  testResult.value = null
  try {
    const payload = { provider: form.provider, model: form.model }
    if (form.apiKey) payload.apiKey = form.apiKey
    const res = await aiApi.ping(payload)
    if (res && (res.ok || res.success)) {
      testResult.value = {
        success: true,
        message: res.message || '连接成功'
      }
    } else if (res && res.demo) {
      testResult.value = {
        success: true,
        message: 'Demo 模式：' + (res.message || '返回模拟响应')
      }
    } else {
      testResult.value = {
        success: true,
        message: res?.message || '连接成功'
      }
    }
  } catch (e) {
    testResult.value = {
      success: false,
      message: e.message || '连接失败'
    }
  } finally {
    testing.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.api-key-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.api-key-row .form-input { flex: 1; }
.toggle-btn {
  padding: 12px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-light);
  white-space: nowrap;
}

.saved-key {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-light);
}
.saved-key .masked { color: var(--color-text); font-family: monospace; }

.test-result {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.test-result.success {
  background: rgba(76, 175, 80, 0.1);
  color: var(--color-success);
}
.test-result.fail {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-danger);
}

.save-btn { margin-top: 4px; }

.about-card { margin-top: 16px; }
.about-item { font-size: 13px; color: var(--color-text-light); line-height: 1.6; margin-bottom: 4px; }
.about-item:last-child { margin-bottom: 0; }
.about-tip {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border);
  font-size: 12px;
  line-height: 1.6;
}
</style>

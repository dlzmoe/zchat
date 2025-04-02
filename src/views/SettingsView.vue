<template>
  <div class="settings-container">
    <a-card class="settings-card" title="API设置">
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="apiEndpoint" label="API地址">
          <a-input v-model="form.apiEndpoint" placeholder="请输入完整的API地址，例如：https://api.openai.com/v1" @input="handleApiEndpointChange" :status="apiStatus" />
          <template #help>
            <div>
              <span :class="['api-status', apiStatus]">{{ apiStatusText }}</span>
              <div class="api-format-hint">
                常见格式：
                <ul>
                  <li>OpenAI API: https://api.openai.com/v1</li>
                  <li>Anthropic API: https://api.anthropic.com</li>
                  <li>Together API: https://api.together.xyz</li>
                </ul>
              </div>
            </div>
          </template>
        </a-form-item>
        <a-form-item field="apiKey" label="API密钥">
          <a-input-password v-model="form.apiKey" placeholder="请输入API密钥" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="saving">保存设置</a-button>
          <a-button type="outline" style="margin-left: 8px" @click="testConnection" :loading="testing">测试连接</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="settings-card" title="可用模型">
      <a-spin :loading="loading">
        <template v-if="models.length > 0">
          <div class="models-grid">
            <div
              v-for="model in models"
              :key="model.id"
              class="model-item"
              :class="{ active: model.id === settingsStore.defaultModel }"
              @click="handleModelSelect(model.id)"
            >
              <div class="model-name">{{ model.id }}</div>
              <icon-check v-if="model.id === settingsStore.defaultModel" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty-state">
            <icon-exclamation-circle class="empty-icon" />
            暂无可用模型
          </div>
        </template>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { Message } from '@arco-design/web-vue'
import { IconCheck, IconExclamationCircle } from '@arco-design/web-vue/es/icon'

const settingsStore = useSettingsStore()
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const models = ref([])
const apiStatus = ref('')
const apiStatusText = ref('')

const form = ref({
  apiEndpoint: settingsStore.apiEndpoint,
  apiKey: settingsStore.apiKey
})

const handleApiEndpointChange = async () => {
  if (!form.value.apiEndpoint) {
    apiStatus.value = ''
    apiStatusText.value = ''
    return
  }

  try {
    const apiType = await settingsStore.detectApiType(form.value.apiEndpoint)
    apiStatus.value = 'success'
    apiStatusText.value = `已识别为${apiType === 'openai' ? 'OpenAI' : apiType === 'anthropic' ? 'Anthropic' : 'Together'} API`
  } catch (error) {
    apiStatus.value = 'error'
    apiStatusText.value = error.message
  }
}

const testConnection = async () => {
  if (!form.value.apiEndpoint || !form.value.apiKey) {
    Message.warning('请填写 API 地址和密钥')
    return
  }

  testing.value = true
  try {
    await settingsStore.testApiConnection(form.value.apiEndpoint, form.value.apiKey)
    Message.success('API 连接测试成功')
    await fetchModels()
  } catch (error) {
    Message.error(error.message)
  } finally {
    testing.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.apiEndpoint || !form.value.apiKey) {
    Message.warning('请填写 API 地址和密钥')
    return
  }

  saving.value = true
  try {
    await settingsStore.updateSettings(form.value)
    Message.success('设置已保存')
    await fetchModels()
  } catch (error) {
    Message.error(error.message)
  } finally {
    saving.value = false
  }
}

const fetchModels = async () => {
  if (!settingsStore.apiEndpoint || !settingsStore.apiKey) return
  
  loading.value = true
  try {
    const response = await fetch(`${settingsStore.apiEndpoint}/models`, {
      headers: {
        'Authorization': `Bearer ${settingsStore.apiKey}`
      }
    })
    const data = await response.json()
    models.value = data.data || []
    
    // 如果没有设置默认模型，自动选择第一个模型
    if (!settingsStore.defaultModel && models.value.length > 0) {
      settingsStore.updateDefaultModel(models.value[0].id)
    }
  } catch (error) {
    Message.error('获取模型列表失败')
    models.value = []
  } finally {
    loading.value = false
  }
}

const handleModelSelect = (modelId) => {
  settingsStore.updateDefaultModel(modelId)
  Message.success('已设置为默认模型')
}

onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 736px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-card :deep(.arco-card-header) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
}

.settings-card :deep(.arco-card-body) {
  padding: 24px;
}

.settings-card :deep(.arco-form-item) {
  margin-bottom: 24px;
}

.settings-card :deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1f2937;
}

.settings-card :deep(.arco-input),
.settings-card :deep(.arco-input-password) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.settings-card :deep(.arco-btn) {
  border-radius: 8px;
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.settings-card :deep(.arco-btn-primary) {
  background-color: #1f2937;
  border-color: #1f2937;
}

.settings-card :deep(.arco-btn-primary:hover) {
  background-color: #374151;
  border-color: #374151;
}

.settings-card :deep(.arco-btn-outline) {
  border-color: #1f2937;
  color: #1f2937;
}

.settings-card :deep(.arco-btn-outline:hover) {
  background-color: #f3f4f6;
  border-color: #374151;
  color: #374151;
}

.settings-card :deep(.arco-input),
.settings-card :deep(.arco-input-password) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border-color: #e5e7eb;
}

.settings-card :deep(.arco-input:hover),
.settings-card :deep(.arco-input-password:hover) {
  border-color: #1f2937;
}

.settings-card :deep(.arco-input:focus),
.settings-card :deep(.arco-input-password:focus) {
  border-color: #1f2937;
  box-shadow: 0 0 0 2px rgba(31, 41, 55, 0.2);
}

.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 24px;
  font-size: 14px;
}

.api-status {
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
}

.api-status.success {
  background-color: #ecfdf5;
  color: #059669;
}

.api-status.error {
  background-color: #fef2f2;
  color: #dc2626;
}

.api-format-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.api-format-hint ul {
  margin: 8px 0 0 0;
  padding-left: 16px;
  list-style-type: none;
}

.api-format-hint li {
  margin: 6px 0;
  display: flex;
  align-items: center;
}

.api-format-hint li::before {
  content: "";
  width: 4px;
  height: 4px;
  background-color: #9ca3af;
  border-radius: 50%;
  margin-right: 8px;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.model-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-item:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

.model-item.active {
  border-color: #1f2937;
  background-color: #f3f4f6;
}

.model-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.model-item :deep(svg) {
  width: 16px;
  height: 16px;
  color: #1f2937;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon {
  font-size: 16px;
  color: #9ca3af;
}
</style>
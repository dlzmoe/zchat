import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apiEndpoint: localStorage.getItem('apiEndpoint') || '',
    apiKey: localStorage.getItem('apiKey') || '',
    apiType: localStorage.getItem('apiType') || 'openai',
    defaultModel: localStorage.getItem('defaultModel') || ''
  }),

  actions: {
    async detectApiType(endpoint) {
      if (endpoint.includes('api.openai.com')) {
        return 'openai'
      } else if (endpoint.includes('api.anthropic.com')) {
        return 'anthropic'
      } else if (endpoint.includes('api.together.xyz')) {
        return 'together'
      } else {
        return 'openai' // 默认使用 OpenAI 格式
      }
    },

    async testApiConnection(endpoint, key) {
      try {
        const response = await fetch(`${endpoint}/models`, {
          headers: {
            'Authorization': `Bearer ${key}`
          }
        })
        if (!response.ok) {
          throw new Error('API 连接测试失败')
        }
        const data = await response.json()
        return data.data || []
      } catch (error) {
        throw new Error('API 连接测试失败：' + error.message)
      }
    },

    async updateSettings({ apiEndpoint, apiKey }) {
      try {
        // 检测 API 类型
        const apiType = await this.detectApiType(apiEndpoint)
        
        // 测试 API 连接
        await this.testApiConnection(apiEndpoint, apiKey)
        
        // 更新设置
        this.apiEndpoint = apiEndpoint
        this.apiKey = apiKey
        this.apiType = apiType
        
        localStorage.setItem('apiEndpoint', apiEndpoint)
        localStorage.setItem('apiKey', apiKey)
        localStorage.setItem('apiType', apiType)
      } catch (error) {
        throw error
      }
    },

    updateDefaultModel(modelId) {
      this.defaultModel = modelId
      localStorage.setItem('defaultModel', modelId)
    }
  }
})
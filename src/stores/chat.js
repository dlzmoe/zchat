import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    loading: false,
    error: null
  }),

  actions: {
    async sendMessage(content) {
      const settingsStore = useSettingsStore()
      const { apiEndpoint, apiKey, apiType } = settingsStore

      if (!apiEndpoint || !apiKey) {
        throw new Error('请先配置 API 设置')
      }

      // 添加用户消息到历史记录
      this.messages.push({
        role: 'user',
        content
      })

      this.loading = true
      this.error = null

      try {
        let response
        const { defaultModel } = settingsStore
        
        if (apiType === 'openai') {
          response = await fetch(`${apiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: defaultModel || 'gpt-3.5-turbo',
              messages: this.messages,
              stream: false
            })
          })
        } else if (apiType === 'anthropic') {
          response = await fetch(`${apiEndpoint}/v1/messages`, {
            method: 'POST',
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: defaultModel || 'claude-2',
              messages: this.messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
              }))
            })
          })
        } else if (apiType === 'together') {
          response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: defaultModel || 'togethercomputer/llama-2-70b-chat',
              messages: this.messages,
              stream: false
            })
          })
        }

        if (!response.ok) {
          throw new Error('API 请求失败')
        }

        const data = await response.json()
        const assistantMessage = {
          role: 'assistant',
          content: apiType === 'anthropic' ? data.content : data.choices[0].message.content
        }

        this.messages.push(assistantMessage)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    clearMessages() {
      this.messages = []
      this.error = null
    }
  }
})
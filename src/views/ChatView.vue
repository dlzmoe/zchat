<template>
  <div class="chat-container">
    <div class="message-list" ref="messageListRef">
      <template v-if="messages.length > 0">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="message.role"
        >
          <div class="message-avatar">
            <a-avatar>
              <template #icon>
                <icon-user v-if="message.role === 'user'" />
                <icon-robot v-else />
              </template>
            </a-avatar>
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </template>
      <div v-else class="empty-message">
        <icon-empty />
        <p>开始和 AI 助手对话吧</p>
      </div>
    </div>
    <div class="input-container">
      <div class="input-wrapper">
        <a-textarea
          v-model="inputMessage"
          :auto-size="{ minRows: 1, maxRows: 4 }"
          placeholder="输入消息..."
          @keypress.enter.prevent="handleSend"
        />
        <a-button type="primary" @click="handleSend" :disabled="!inputMessage.trim()">
          发送
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { IconUser, IconRobot, IconEmpty } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const inputMessage = ref('')
const messageListRef = ref(null)
const { messages } = chatStore

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message) return

  inputMessage.value = ''
  await scrollToBottom()

  try {
    await chatStore.sendMessage(message)
    await scrollToBottom()
  } catch (error) {
    Message.error(error.message)
  }
}
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);
  border-radius: 8px;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message-item.assistant {
  flex-direction: row;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 80%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.assistant .message-text {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
}

.user .message-text {
  background-color: rgb(var(--primary-6));
  color: #fff;
}

.empty-message {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

.empty-message :deep(svg) {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}

.input-container {
  padding: 16px;
  background: var(--color-bg-2);
  border-top: 1px solid var(--color-border);
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.input-wrapper :deep(.arco-textarea-wrapper) {
  background-color: var(--color-bg-1);
}

.input-wrapper .arco-btn {
  align-self: flex-end;
}
</style>
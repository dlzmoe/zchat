<template>
  <a-layout class="layout-container">
    <a-layout-sider
      class="layout-sider"
      :collapsed="collapsed"
      collapsible
      :hide-trigger="true"
      breakpoint="xl"
      @collapse="handleCollapse"
    >
      <div class="logo">
        <img src="/vite.svg" alt="logo" />
        <span v-show="!collapsed">AI Chat</span>
      </div>
      <a-menu
        :selected-keys="selectedKeys"
        :style="{ width: '100%' }"
        @menu-item-click="handleMenuClick"
      >
        <a-menu-item key="chat">
          <template #icon><icon-message /></template>
          聊天
        </a-menu-item>
        <a-menu-item key="settings">
          <template #icon><icon-settings /></template>
          设置
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <a-button class="collapse-btn" @click="toggleCollapse">
          <icon-menu-fold v-if="!collapsed" />
          <icon-menu-unfold v-else />
        </a-button>
      </a-layout-header>
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { IconMessage, IconMenuFold, IconMenuUnfold, IconSettings } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'

const collapsed = ref(false)
const selectedKeys = ref(['chat'])
const router = useRouter()

const handleCollapse = (val) => {
  collapsed.value = val
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const handleMenuClick = (key) => {
  selectedKeys.value = [key]
  router.push({ name: key })
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-sider {
  background: var(--color-bg-2);
}

.logo {
  height: 32px;
  margin: 12px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo span {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-1);
}

.layout-header {
  background: var(--color-bg-2);
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 16px;
}

.layout-content {
  background: var(--color-bg-1);
  padding: 16px;
  height: calc(100vh - 60px);
}
</style>
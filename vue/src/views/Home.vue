<script setup lang="ts">
import { useAppStore } from '@stores/app'

const appStore = useAppStore()
</script>

<template>
  <div class="home">
    <h1>首页</h1>
    <p>计数器: {{ appStore.state.count }}</p>
    <p>双倍计数: {{ appStore.doubleCount }}</p>
    <div class="buttons">
      <button @click="appStore.decrement">-1</button>
      <button @click="appStore.increment">+1</button>
    </div>
    <button @click="appStore.toggleTheme">
      切换主题 (当前: {{ appStore.state.theme }})
    </button>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  transition: all 0.2s;
}

button:hover {
  background: #f0f0f0;
}
</style>

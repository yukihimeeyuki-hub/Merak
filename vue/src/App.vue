<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="nav">
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
.nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f5;
}

.nav a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav a:hover {
  background: #e0e0e0;
}

.nav a.router-link-active {
  background: #42b883;
  color: #fff;
}
</style>

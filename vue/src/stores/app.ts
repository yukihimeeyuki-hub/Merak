import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AppState {
  count: number
  loading: boolean
  theme: 'light' | 'dark'
}

export const useAppStore = defineStore('app', () => {
  const state = ref<AppState>({
    count: 0,
    loading: false,
    theme: 'light'
  })

  const doubleCount = computed(() => state.value.count * 2)

  const isLoading = computed(() => state.value.loading)

  function increment() {
    state.value.count++
  }

  function decrement() {
    state.value.count--
  }

  function setLoading(loading: boolean) {
    state.value.loading = loading
  }

  function toggleTheme() {
    state.value.theme = state.value.theme === 'light' ? 'dark' : 'light'
  }

  function reset() {
    state.value = {
      count: 0,
      loading: false,
      theme: 'light'
    }
  }

  return {
    state,
    doubleCount,
    isLoading,
    increment,
    decrement,
    setLoading,
    toggleTheme,
    reset
  }
})

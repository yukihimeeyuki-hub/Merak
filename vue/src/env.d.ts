/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_BASE_PATH: string
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_API_RETRY_COUNT?: string
  readonly VITE_API_RETRY_DELAY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

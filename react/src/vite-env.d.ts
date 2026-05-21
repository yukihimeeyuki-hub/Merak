/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_API_URL?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_API_RETRY_COUNT?: string
  readonly VITE_API_RETRY_DELAY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

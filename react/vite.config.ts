import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { UserConfigExport } from 'vite'

// https://vite.dev/config/
const config: UserConfigExport = ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // 基础路径配置
    base: env.VITE_BASE_PATH || '/',

    // 解析配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@views': resolve(__dirname, 'src/views'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@store': resolve(__dirname, 'src/stores'),
        '@router': resolve(__dirname, 'src/router'),
        '@services': resolve(__dirname, 'src/services'),
        '@hooks': resolve(__dirname, 'src/hooks'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      strictPort: false,
      hmr: {
        overlay: true
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name ?? '')) {
              return 'images/[name]-[hash][extname]'
            }
            if (/\.css$/i.test(name ?? '')) {
              return 'css/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name ?? '')) {
              return 'fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      },
      cssCodeSplit: true
    },

    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: mode === 'production'
          ? '[hash:base64:5]'
          : '[name]__[local]--[hash:base64:5]'
      }
    },

    // 依赖预构建
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'radashi'],
      exclude: []
    },

    // 静态资源配置
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],

    // 日志配置
    logLevel: 'info',
    clearScreen: true,

    // 环境变量前缀
    envPrefix: 'VITE_'
  }
}

export default defineConfig(config)

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@/styles/variables.less";`,
      },
    },
  },
  // 生产环境配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          antd: ['ant-design-vue'],
          icons: ['@ant-design/icons-vue']
        }
      }
    }
  },
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/zjry/' : '/',
  // 或者使用环境变量
  // base: process.env.VITE_BASE_URL || '/'
})

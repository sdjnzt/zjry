<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="layout-sider"
    >
      <div class="logo">
<!--        <img src="@/assets/logo.svg" alt="logo" />-->
        <span v-show="!collapsed">中交润杨智慧船舶监控</span>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        class="layout-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 有子菜单的情况 -->
          <a-sub-menu v-if="route.children && route.children.length > 0" :key="`sub-${route.path}`">
            <template #title>
              <component :is="getIcon(route.meta?.icon)" />
              <span>{{ route.meta?.title }}</span>
            </template>
            <a-menu-item
              v-for="childRoute in route.children"
              :key="childRoute.path"
              @click="handleMenuClick(childRoute)"
            >
              {{ childRoute.meta?.title }}
            </a-menu-item>
          </a-sub-menu>
          
          <!-- 没有子菜单的情况 -->
          <a-menu-item
            v-else
            :key="`item-${route.path}`"
            @click="handleMenuClick(route)"
          >
            <component :is="getIcon(route.meta?.icon)" />
            <span>{{ route.meta?.title }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区域 -->
    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button
            type="text"
            @click="collapsed = !collapsed"
            class="trigger-btn"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        
        <div class="header-right">
          <a-space>
            <a-badge :count="notificationCount" class="notification-badge">
              <a-button type="text" shape="circle">
                <BellOutlined />
              </a-button>
            </a-badge>
            <a-dropdown>
              <a-button type="text">
                <UserOutlined />
                <span>{{ currentUserName }}</span>
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">个人设置</a-menu-item>
                  <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <!-- 主内容 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ApiOutlined,
  HistoryOutlined,
  ControlOutlined,
  TeamOutlined,
  PhoneOutlined
} from '@ant-design/icons-vue'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 布局组件
 * 包含侧边栏导航、顶部导航和主内容区域
 */

const router = useRouter()
const route = useRoute()

// 响应式数据
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])
const notificationCount = ref(5)

// 菜单路由配置
const menuRoutes = computed(() => {
  return router.getRoutes().find(r => r.path === '/')?.children || []
})

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta?.title || '智慧船舶动态监控系统'
})

// 当前用户名
const currentUserName = computed(() => {
  return localStorage.getItem('currentUser') || '管理员'
})

// 图标映射
const iconMap: Record<string, any> = {
  'video-camera': VideoCameraOutlined,
  'setting': SettingOutlined,
  'share-alt': ShareAltOutlined,
  'api': ApiOutlined,
  'history': HistoryOutlined,
  'control': ControlOutlined,
  'team': TeamOutlined,
  'phone': PhoneOutlined
}

/**
 * 获取菜单图标
 * @param iconName 图标名称
 * @returns 图标组件
 */
const getIcon = (iconName?: string | unknown) => {
  if (typeof iconName === 'string') {
    return iconMap[iconName] || VideoCameraOutlined
  }
  return VideoCameraOutlined
}

/**
 * 处理菜单点击
 * @param route 路由对象
 */
const handleMenuClick = (route: RouteRecordRaw) => {
  if (route.path) {
    router.push(route.path)
  }
}

/**
 * 处理登出
 */
const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('currentUser')
  
  // 跳转到登录页面
  router.push('/login')
}

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.layout-container {
  height: 100vh;
  
  .layout-sider {
    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
    }
    
    .layout-menu {
      border-right: none;
    }
  }
  
  .layout-header {
    background: white;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    
    .header-left {
      display: flex;
      align-items: center;
      
      .trigger-btn {
        font-size: 18px;
        margin-right: 16px;
      }
      
      .page-title {
        font-size: 18px;
        font-weight: 500;
        color: #1890ff;
      }
    }
    
    .header-right {
      .notification-badge {
        .ant-badge-count {
          background: #ff4d4f;
        }
      }
    }
  }
  
  .layout-content {
    padding: 24px;
    background: #f0f2f5;
    overflow-y: auto;
  }
}
</style>

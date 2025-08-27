import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

/**
 * 路由配置
 * 包含智慧船舶动态监控系统的8个主要功能模块及其子功能
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '登录',
      hideInMenu: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/video-plaza/panoramic-view',
    children: [
      {
        path: '/video-plaza',
        name: 'VideoPlaza',
        redirect: '/video-plaza/panoramic-view',
        meta: {
          title: '视频广场',
          icon: 'video-camera'
        },
        children: [
          {
            path: '/video-plaza/panoramic-view',
            name: 'PanoramicView',
            component: () => import('@/views/video-plaza/panoramic-view.vue'),
            meta: {
              title: '全景视图',
              keepAlive: true
            }
          },
          {
            path: '/video-plaza/video-matrix',
            name: 'VideoMatrix',
            component: () => import('@/views/video-plaza/video-matrix.vue'),
            meta: {
              title: '视频矩阵',
              keepAlive: true
            }
          },
          {
            path: '/video-plaza/intelligent-patrol',
            name: 'IntelligentPatrol',
            component: () => import('@/views/video-plaza/intelligent-patrol.vue'),
            meta: {
              title: '智能轮巡',
              keepAlive: true
            }
          },
          {
            path: '/video-plaza/quick-call',
            name: 'VideoPlazaQuickCall',
            component: () => import('@/views/video-plaza/quick-call.vue'),
            meta: {
              title: '快速调用',
              keepAlive: true
            }
          },
          {
            path: '/video-plaza/quality-diagnosis',
            name: 'QualityDiagnosis',
            component: () => import('@/views/video-plaza/quality-diagnosis.vue'),
            meta: {
              title: '视频质量诊断',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/point-management',
        name: 'PointManagement',
        redirect: '/point-management/asset-management',
        meta: {
          title: '点位治理',
          icon: 'setting'
        },
        children: [
          {
            path: '/point-management/asset-management',
            name: 'AssetManagement',
            component: () => import('@/views/point-management/asset-management.vue'),
            meta: {
              title: '资产台账管理',
              keepAlive: true
            }
          },
          {
            path: '/point-management/geographic-annotation',
            name: 'GeographicAnnotation',
            component: () => import('@/views/point-management/geographic-annotation.vue'),
            meta: {
              title: '地理信息标注',
              keepAlive: true
            }
          },
          {
            path: '/point-management/status-monitoring',
            name: 'StatusMonitoring',
            component: () => import('@/views/point-management/status-monitoring.vue'),
            meta: {
              title: '在线状态监测',
              keepAlive: true
            }
          },
          {
            path: '/point-management/intelligent-maintenance',
            name: 'IntelligentMaintenance',
            component: () => import('@/views/point-management/intelligent-maintenance.vue'),
            meta: {
              title: '智能运维',
              keepAlive: true
            }
          },
          {
            path: '/point-management/coverage-analysis',
            name: 'CoverageAnalysis',
            component: () => import('@/views/point-management/coverage-analysis.vue'),
            meta: {
              title: '覆盖分析',
              keepAlive: true
            }
          },
          {
            path: '/point-management/permission-management',
            name: 'PermissionManagement',
            component: () => import('@/views/point-management/permission-management.vue'),
            meta: {
              title: '权限管理',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/video-sharing',
        name: 'VideoSharing',
        redirect: '/video-sharing/resource-pool',
        meta: {
          title: '视频共享',
          icon: 'share-alt'
        },
        children: [
          {
            path: '/video-sharing/resource-pool',
            name: 'ResourcePool',
            component: () => import('@/views/video-sharing/resource-pool.vue'),
            meta: {
              title: '共享资源池',
              keepAlive: true
            }
          },
          {
            path: '/video-sharing/protocol-access',
            name: 'ProtocolAccess',
            component: () => import('@/views/video-sharing/protocol-access.vue'),
            meta: {
              title: '标准协议接入',
              keepAlive: true
            }
          },
          {
            path: '/video-sharing/security-audit',
            name: 'SecurityAudit',
            component: () => import('@/views/video-sharing/security-audit.vue'),
            meta: {
              title: '安全审计日志',
              keepAlive: true
            }
          },
          {
            path: '/video-sharing/temporary-authorization',
            name: 'TemporaryAuthorization',
            component: () => import('@/views/video-sharing/temporary-authorization.vue'),
            meta: {
              title: '临时授权',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/integrated-access',
        name: 'IntegratedAccess',
        redirect: '/integrated-access/protocol-adaptation',
        meta: {
          title: '融合接入',
          icon: 'api'
        },
        children: [
          {
            path: '/integrated-access/protocol-adaptation',
            name: 'ProtocolAdaptation',
            component: () => import('@/views/integrated-access/multi-protocol.vue'),
            meta: {
              title: '多协议适配',
              keepAlive: true
            }
          },
          {
            path: '/integrated-access/data-standardization',
            name: 'DataStandardization',
            component: () => import('@/views/integrated-access/data-standardization.vue'),
            meta: {
              title: '数据解析与标准化',
              keepAlive: true
            }
          },

          {
            path: '/integrated-access/api-services',
            name: 'ApiServices',
            component: () => import('@/views/integrated-access/api-services.vue'),
            meta: {
              title: 'API接口服务',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/event-review',
        name: 'EventReview',
        redirect: '/event-review/event-retrieval',
        meta: {
          title: '事件回顾',
          icon: 'history'
        },
        children: [
          {
            path: '/event-review/event-retrieval',
            name: 'EventRetrieval',
            component: () => import('@/views/event-review/multi-dimensional-search.vue'),
            meta: {
              title: '多维事件检索',
              keepAlive: true
            }
          },
          {
            path: '/event-review/process-traceability',
            name: 'ProcessTraceability',
            component: () => import('@/views/event-review/full-process-traceability.vue'),
            meta: {
              title: '全过程回溯',
              keepAlive: true
            }
          },
          {
            path: '/event-review/electronic-evidence',
            name: 'ElectronicEvidence',
            component: () => import('@/views/event-review/electronic-evidence.vue'),
            meta: {
              title: '电子取证',
              keepAlive: true
            }
          },
          {
            path: '/event-review/statistical-analysis',
            name: 'StatisticalAnalysis',
            component: () => import('@/views/event-review/statistical-analysis.vue'),
            meta: {
              title: '统计分析',
              keepAlive: true
            }
          },
          {
            path: '/event-review/report-generation',
            name: 'ReportGeneration',
            component: () => import('@/views/event-review/report-generation.vue'),
            meta: {
              title: '报告生成',
              keepAlive: true
            }
          },
          {
            path: '/event-review/contingency-plan',
            name: 'ContingencyPlan',
            component: () => import('@/views/event-review/contingency-plan-management.vue'),
            meta: {
              title: '预案管理',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/video-dispatch',
        name: 'VideoDispatch',
        redirect: '/video-dispatch/one-click-dispatch',
        meta: {
          title: '视频调度',
          icon: 'control'
        },
        children: [
          {
            path: '/video-dispatch/one-click-dispatch',
            name: 'OneClickDispatch',
            component: () => import('@/views/video-dispatch/one-click-dispatch.vue'),
            meta: {
              title: '一键调度',
              keepAlive: true
            }
          },
          {
            path: '/video-dispatch/resource-tracking',
            name: 'ResourceTracking',
            component: () => import('@/views/video-dispatch/resource-tracking.vue'),
            meta: {
              title: '资源追踪',
              keepAlive: true
            }
          },
          {
            path: '/video-dispatch/mobile-resource-integration',
            name: 'MobileResourceIntegration',
            component: () => import('@/views/video-dispatch/mobile-resource-integration.vue'),
            meta: {
              title: '移动资源集成',
              keepAlive: true
            }
          },
          {
            path: '/video-dispatch/dispatch-records',
            name: 'DispatchRecords',
            component: () => import('@/views/video-dispatch/dispatch-records.vue'),
            meta: {
              title: '调度记录',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/collaborative-consultation',
        name: 'CollaborativeConsultation',
        redirect: '/collaborative-consultation/multi-party-call',
        meta: {
          title: '协同会商',
          icon: 'team'
        },
        children: [
          {
            path: '/collaborative-consultation/multi-party-call',
            name: 'MultiPartyCall',
            component: () => import('@/views/collaborative-consultation/multi-party-call.vue'),
            meta: {
              title: '多方音视频通话',
              keepAlive: true
            }
          },
          {
            path: '/collaborative-consultation/desktop-sharing',
            name: 'DesktopSharing',
            component: () => import('@/views/collaborative-consultation/desktop-sharing.vue'),
            meta: {
              title: '桌面与资料共享',
              keepAlive: true
            }
          },
          {
            path: '/collaborative-consultation/whiteboard',
            name: 'Whiteboard',
            component: () => import('@/views/collaborative-consultation/whiteboard.vue'),
            meta: {
              title: '电子白板',
              keepAlive: true
            }
          },
          {
            path: '/collaborative-consultation/consultation-records',
            name: 'ConsultationRecords',
            component: () => import('@/views/collaborative-consultation/consultation-records.vue'),
            meta: {
              title: '会商记录与回溯',
              keepAlive: true
            }
          },
          {
            path: '/collaborative-consultation/communication-integration',
            name: 'CommunicationIntegration',
            component: () => import('@/views/collaborative-consultation/communication-integration.vue'),
            meta: {
              title: '通讯调度集成',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: '/communication-dispatch',
        name: 'CommunicationDispatch',
        redirect: '/communication-dispatch/integrated-communication',
        meta: {
          title: '通讯调度',
          icon: 'phone'
        },
        children: [
          {
            path: '/communication-dispatch/integrated-communication',
            name: 'IntegratedCommunication',
            component: () => import('@/views/communication-dispatch/integrated-communication.vue'),
            meta: {
              title: '融合通讯',
              keepAlive: true
            }
          },
          {
            path: '/communication-dispatch/quick-call',
            name: 'QuickCall',
            component: () => import('@/views/communication-dispatch/quick-call.vue'),
            meta: {
              title: '一键呼叫/群呼',
              keepAlive: true
            }
          },
          {
            path: '/communication-dispatch/broadcast-management',
            name: 'BroadcastManagement',
            component: () => import('@/views/communication-dispatch/broadcast-management.vue'),
            meta: {
              title: '分级分区广播',
              keepAlive: true
            }
          },
          {
            path: '/communication-dispatch/communication-records',
            name: 'CommunicationRecords',
            component: () => import('@/views/communication-dispatch/communication-records.vue'),
            meta: {
              title: '通讯记录',
              keepAlive: true
            }
          },
          {
            path: '/communication-dispatch/intelligent-routing',
            name: 'IntelligentRouting',
            component: () => import('@/views/communication-dispatch/intelligent-routing.vue'),
            meta: {
              title: '智能路由',
              keepAlive: true
            }
          },
          {
            path: '/communication-dispatch/business-integration',
            name: 'BusinessIntegration',
            component: () => import('@/views/communication-dispatch/business-integration.vue'),
            meta: {
              title: '业务联动',
              keepAlive: true
            }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  // 本地开发使用history模式，GitHub Pages使用hash模式
  history: import.meta.env.DEV 
    ? createWebHistory() 
    : window.location.hostname.includes('github.io') 
      ? createWebHashHistory() 
      : createWebHistory(),
  routes
})

/**
 * 路由导航守卫
 * 检查用户是否已登录
 */
router.beforeEach((to, from, next) => {
  // 检查是否访问登录页面
  if (to.path === '/login') {
    // 如果已经登录，重定向到主页
    if (localStorage.getItem('isLoggedIn')) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 检查是否已登录
  if (!localStorage.getItem('isLoggedIn')) {
    // 在GitHub Pages环境下，提供默认登录状态
    if (window.location.hostname.includes('github.io')) {
      // 自动设置登录状态（仅用于演示）
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', 'admin')
      next()
      return
    }
    
    // 本地开发环境，跳过登录检查
    if (import.meta.env.DEV) {
      console.log('本地开发环境，跳过登录检查')
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', 'dev')
      next()
      return
    }
    
    // 生产环境重定向到登录页面
    next('/login')
    return
  }

  // 已登录，允许访问
  next()
})

export default router

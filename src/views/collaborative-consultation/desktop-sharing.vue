<template>
  <div class="desktop-sharing">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>桌面数据共享</h1>
      <p>支持桌面共享、文件共享、应用共享等多种共享模式</p>
    </div>

    <!-- 共享状态概览 -->
    <a-card class="status-overview" title="共享状态概览">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="当前共享数" :value="sharingStats.activeShares" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="在线用户" :value="sharingStats.onlineUsers" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="共享带宽" :value="sharingStats.bandwidth" suffix="Mbps" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="共享质量" :value="sharingStats.qualityScore" suffix="%" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="今日共享" :value="sharingStats.todayShares" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总共享时长" :value="sharingStats.totalDuration" suffix="小时" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="平均观看人数" :value="sharingStats.avgViewers" suffix="人" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="成功率" :value="sharingStats.successRate" suffix="%" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 共享管理区域 -->
    <a-row :gutter="16" class="sharing-management">
      <!-- 共享控制面板 -->
      <a-col :span="16">
        <a-card title="共享控制面板" class="sharing-control-panel">
          <!-- 共享预览区域 -->
          <div class="sharing-preview-area">
            <div class="main-preview">
              <div v-if="previewLoading" class="preview-loading">
                <a-skeleton :active="true" :paragraph="{ rows: 4 }" />
              </div>
              <div v-else class="preview-placeholder">
                <a-icon type="desktop" />
                <p>{{ isSharingActive ? '正在共享' : '待接入' }}</p>
                <div class="preview-badges">
                  <a-tag :color="isSharingActive ? 'green' : 'orange'">{{ isSharingActive ? '进行中' : '待接入' }}</a-tag>
                  <a-tag color="blue">{{ computedResolution }}</a-tag>
                  <a-tag color="orange">{{ computedFps }}fps</a-tag>
                  <a-tag :color="latencyMs < 80 ? 'green' : (latencyMs < 150 ? 'orange' : 'red')">{{ latencyMs }}ms</a-tag>
                  <a-tag color="purple">{{ bitrateMbps }}Mbps</a-tag>
                </div>
                <div class="preview-info">
                  <span>时长: {{ isSharingActive ? sharingDuration : '00:00:00' }}</span>
                  <span>观看: {{ viewers }} 人</span>
                </div>
              </div>
            </div>
            
            <!-- 共享控制按钮 -->
            <div class="sharing-controls">
              <a-button-group>
                <a-button type="primary" size="large" :disabled="isSharingActive" @click="startSharing">
                  <template #icon><PlayCircleOutlined /></template>
                  {{ isSharingActive ? '共享中' : '开始共享' }}
                </a-button>
                <a-button v-if="!isPaused" type="default" size="large" :disabled="!isSharingActive" @click="pauseSharing">
                  <template #icon><PauseCircleOutlined /></template>
                  暂停
                </a-button>
                <a-button v-else type="default" size="large" :disabled="!isSharingActive" @click="resumeSharing">
                  <template #icon><PlayCircleOutlined /></template>
                  继续
                </a-button>
                <a-button type="danger" size="large" :disabled="!isSharingActive" @click="stopSharing">
                  <template #icon><StopOutlined /></template>
                  停止共享
                </a-button>
                <a-button size="large" @click="openSettings">
                  <template #icon><SettingOutlined /></template>
                  设置
                </a-button>
                <a-button size="large" :disabled="!isSharingActive" @click="toggleFullscreen">
                  <template #icon><FullscreenOutlined /></template>
                  全屏
                </a-button>
              </a-button-group>
            </div>
          </div>

          <!-- 共享信息 -->
          <div class="sharing-info">
            <a-descriptions :column="3" bordered>
              <a-descriptions-item label="共享ID">{{ shareId }}</a-descriptions-item>
              <a-descriptions-item label="共享类型">桌面共享</a-descriptions-item>
              <a-descriptions-item label="共享时长">{{ isSharingActive ? sharingDuration : '00:00:00' }}</a-descriptions-item>
              <a-descriptions-item label="观看人数">{{ viewers }}人</a-descriptions-item>
              <a-descriptions-item label="共享质量">{{ qualityText }}</a-descriptions-item>
              <a-descriptions-item label="网络状态">{{ networkStatusText }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-col>

      <!-- 共享权限管理 -->
      <a-col :span="8">
        <a-card title="共享权限管理" class="permission-management">
          <!-- 权限设置 -->
          <div class="permission-settings">
            <a-form layout="vertical">
              <a-form-item label="共享范围">
                <a-select v-model:value="permissionSettings.scope" placeholder="选择共享范围">
                  <a-select-option value="public">公开</a-select-option>
                  <a-select-option value="private">私有</a-select-option>
                  <a-select-option value="group">群组</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="观看权限">
                <a-checkbox-group v-model:value="permissionSettings.viewPermissions">
                  <a-checkbox value="view">观看</a-checkbox>
                  <a-checkbox value="comment">评论</a-checkbox>
                  <a-checkbox value="download">下载</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
              
              <a-form-item label="水印设置">
                <a-switch v-model:checked="permissionSettings.watermark" />
              </a-form-item>
              
              <a-form-item label="录制权限">
                <a-switch v-model:checked="permissionSettings.recording" />
              </a-form-item>
            </a-form>
          </div>

          <!-- 用户权限列表 -->
          <div class="user-permissions">
            <h4>用户权限</h4>
            <div class="user-list">
              <div class="user-item" v-for="user in users" :key="user.id">
                <a-avatar :src="user.avatar" :size="32" />
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-department">{{ user.department }}</div>
                  <div class="user-last-active">{{ user.lastActive }}</div>
                </div>
                <a-tag :color="user.permission === 'admin' ? 'red' : 'blue'">
                  {{ user.permission === 'admin' ? '管理员' : '普通用户' }}
                </a-tag>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 共享记录 -->
    <a-card title="共享记录" class="sharing-records">
      <a-table :columns="recordColumns" :data-source="sharingRecords" :pagination="{ pageSize: 10 }">
        <template #action="{ record }">
          <a-button type="link" size="small" @click="viewRecord(record)">
            <template #icon><EyeOutlined /></template>
            查看详情
          </a-button>
          <a-button type="link" size="small" @click="downloadRecord(record)">
            <template #icon><DownloadOutlined /></template>
            下载
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 共享设置模态框 -->
    <a-modal
      v-model:visible="settingsModalVisible"
      title="共享设置"
      width="600px"
      @ok="saveSettings"
    >
      <a-form :model="sharingSettings" layout="vertical">
        <a-form-item label="共享质量">
          <a-select v-model:value="sharingSettings.quality">
            <a-select-option value="high">高清 (1080p)</a-select-option>
            <a-select-option value="medium">标清 (720p)</a-select-option>
            <a-select-option value="low">流畅 (480p)</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="帧率">
          <a-select v-model:value="sharingSettings.frameRate">
            <a-select-option value="60">60fps</a-select-option>
            <a-select-option value="30">30fps</a-select-option>
            <a-select-option value="24">24fps</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="音频共享">
          <a-switch v-model:checked="sharingSettings.audioSharing" />
        </a-form-item>
        
        <a-form-item label="网络自适应">
          <a-switch v-model:checked="sharingSettings.adaptiveNetwork" />
        </a-form-item>
        
        <a-form-item label="压缩算法">
          <a-select v-model:value="sharingSettings.compression">
            <a-select-option value="h264">H.264</a-select-option>
            <a-select-option value="h265">H.265</a-select-option>
            <a-select-option value="vp9">VP9</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  DesktopOutlined,
  PlayCircleOutlined,
  StopOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  FullscreenOutlined,
  EyeOutlined,
  DownloadOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

// 共享统计数据
const sharingStats = reactive({
  activeShares: 12,
  onlineUsers: 67,
  bandwidth: 284.5,
  qualityScore: 96.8,
  todayShares: 34,
  totalDuration: 89.5,
  avgViewers: 15.3,
  successRate: 99.2
})

// 实时共享状态
const isSharingActive = ref(false)
const isPaused = ref(false)
const previewLoading = ref(false)
const shareId = ref('SHARE-2025-001')
const sharingStartTime = ref<number | null>(null)
const sharingDuration = ref('00:00:00')
const durationTimer = ref<number | null>(null)
const viewers = ref(0)
const networkStatusText = ref('待检测')
const latencyMs = ref(0)
const bitrateMbps = ref(0)

// 由设置推导的分辨率/帧率显示
const sharingSettings = reactive({
  quality: 'high',
  frameRate: 30,
  audioSharing: true,
  adaptiveNetwork: true,
  compression: 'h264'
})

const computedResolution = computed(() => {
  if (sharingSettings.quality === 'high') return '1920x1080'
  if (sharingSettings.quality === 'medium') return '1280x720'
  return '854x480'
})
const computedFps = computed(() => Number(sharingSettings.frameRate))
const qualityText = computed(() => {
  return sharingSettings.quality === 'high' ? '高清' : (sharingSettings.quality === 'medium' ? '标清' : '流畅')
})

/**
 * 启动时长计时器
 */
const startDurationTimer = () => {
  if (durationTimer.value) window.clearInterval(durationTimer.value)
  durationTimer.value = window.setInterval(() => {
    if (sharingStartTime.value && isSharingActive.value && !isPaused.value) {
      const diff = Date.now() - sharingStartTime.value
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      sharingDuration.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
  }, 1000)
}

/**
 * 随机刷新网络/观看指标（模拟）
 */
const refreshLiveMetrics = () => {
  if (!isSharingActive.value) return
  viewers.value = Math.max(0, viewers.value + Math.floor(Math.random() * 5 - 2))
  latencyMs.value = Math.max(40, Math.min(220, latencyMs.value + Math.floor(Math.random() * 20 - 10)))
  bitrateMbps.value = Math.max(2, Math.min(18, +(bitrateMbps.value + (Math.random() * 2 - 1)).toFixed(1)))
  const statusPool = ['稳定', '良好', '一般']
  networkStatusText.value = statusPool[Math.floor(Math.random() * statusPool.length)]
}

let metricsTimer: number | null = null

/**
 * 开始共享
 */
const startSharing = () => {
  previewLoading.value = true
  window.setTimeout(() => {
    isSharingActive.value = true
    isPaused.value = false
    previewLoading.value = false
    sharingStartTime.value = Date.now()
    viewers.value = 5 + Math.floor(Math.random() * 6)
    latencyMs.value = 60 + Math.floor(Math.random() * 30)
    bitrateMbps.value = 6 + Math.floor(Math.random() * 6)
    networkStatusText.value = '稳定'
    sharingDuration.value = '00:00:00'
    startDurationTimer()
    if (metricsTimer) window.clearInterval(metricsTimer)
    metricsTimer = window.setInterval(refreshLiveMetrics, 2000)
    message.success('已开始共享')
  }, 600)
}

/**
 * 暂停共享
 */
const pauseSharing = () => {
  if (!isSharingActive.value) return
  isPaused.value = true
  message.info('共享已暂停')
}

/**
 * 继续共享
 */
const resumeSharing = () => {
  if (!isSharingActive.value) return
  isPaused.value = false
  message.success('继续共享')
}

/**
 * 停止共享
 */
const stopSharing = () => {
  isSharingActive.value = false
  isPaused.value = false
  sharingStartTime.value = null
  sharingDuration.value = '00:00:00'
  viewers.value = 0
  latencyMs.value = 0
  bitrateMbps.value = 0
  networkStatusText.value = '待检测'
  if (durationTimer.value) {
    window.clearInterval(durationTimer.value)
    durationTimer.value = null
  }
  if (metricsTimer) {
    window.clearInterval(metricsTimer)
    metricsTimer = null
  }
  message.success('共享已停止')
}

/** 打开设置 */
const settingsModalVisible = ref(false)
const openSettings = () => { settingsModalVisible.value = true }

/** 全屏（模拟） */
const toggleFullscreen = () => { message.info('进入全屏预览（模拟）') }

// 权限设置
const permissionSettings = reactive({
  scope: 'private',
  viewPermissions: ['view'],
  watermark: true,
  recording: false
})

// 用户数据（真实姓名）
const users = ref([
  { id: 1, name: '陈志强', avatar: '', permission: 'admin', department: '调度中心', lastActive: '09:15:30' },
  { id: 2, name: '刘建国', avatar: '', permission: 'admin', department: '海事部门', lastActive: '09:12:45' },
  { id: 3, name: '王海峰', avatar: '', permission: 'user', department: '港口管理', lastActive: '09:08:20' },
  { id: 4, name: '赵明华', avatar: '', permission: 'user', department: '应急响应', lastActive: '09:05:15' },
  { id: 5, name: '钱伟民', avatar: '', permission: 'user', department: '船舶公司', lastActive: '09:10:30' },
  { id: 6, name: '孙志刚', avatar: '', permission: 'user', department: '气象部门', lastActive: '08:55:10' },
  { id: 7, name: '周建军', avatar: '', permission: 'user', department: '安全监督', lastActive: '09:03:45' },
  { id: 8, name: '吴建华', avatar: '', permission: 'user', department: '技术保障', lastActive: '09:07:20' }
])

// 共享记录数据（保持不变）
const sharingRecords = ref([
  { id: 1, shareId: 'SHARE-2025-001', type: '桌面共享', startTime: '2025-08-20 09:00:00', duration: '00:45:15', viewers: 12, quality: '高清', department: '调度中心', status: '进行中' },
  { id: 2, shareId: 'SHARE-2025-002', type: '文件共享', startTime: '2025-08-20 10:30:00', duration: '00:28:30', viewers: 8, quality: '标清', department: '海事部门', status: '已完成' },
  { id: 3, shareId: 'SHARE-2025-003', type: '应用共享', startTime: '2025-08-20 14:00:00', duration: '01:15:45', viewers: 15, quality: '高清', department: '技术保障', status: '进行中' },
  { id: 4, shareId: 'SHARE-2025-004', type: '桌面共享', startTime: '2025-08-20 16:00:00', duration: '00:32:20', viewers: 6, quality: '标清', department: '安全监督', status: '已完成' },
  { id: 5, shareId: 'SHARE-2025-005', type: '文件共享', startTime: '2025-08-19 08:30:00', duration: '00:55:10', viewers: 10, quality: '高清', department: '应急响应', status: '已完成' },
  { id: 6, shareId: 'SHARE-2025-006', type: '应用共享', startTime: '2025-08-19 15:00:00', duration: '00:42:30', viewers: 18, quality: '标清', department: '技术保障', status: '已完成' },
  { id: 7, shareId: 'SHARE-2025-007', type: '桌面共享', startTime: '2025-08-18 11:00:00', duration: '00:38:45', viewers: 9, quality: '高清', department: '港口管理', status: '已完成' },
  { id: 8, shareId: 'SHARE-2025-008', type: '文件共享', startTime: '2025-08-18 16:30:00', duration: '00:51:20', viewers: 14, quality: '标清', department: '调度中心', status: '已完成' }
])

// 共享记录表格列定义（保持不变）
const recordColumns = [
  { title: '共享ID', dataIndex: 'shareId', key: 'shareId' },
  { title: '共享类型', dataIndex: 'type', key: 'type' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '共享时长', dataIndex: 'duration', key: 'duration' },
  { title: '观看人数', dataIndex: 'viewers', key: 'viewers' },
  { title: '共享质量', dataIndex: 'quality', key: 'quality' },
  { title: '负责部门', dataIndex: 'department', key: 'department' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', slots: { customRender: 'action' } }
]

// 模态框显示状态
// const settingsModalVisible = ref(false)

// 查看共享记录详情
const viewRecord = (record: any) => { message.info(`查看共享记录: ${record.shareId}`) }

// 下载共享记录
const downloadRecord = (record: any) => { message.success(`开始下载共享记录: ${record.shareId}`) }

// 保存共享设置
const saveSettings = () => { message.success('共享设置已保存'); settingsModalVisible.value = false }

// 组件挂载后的初始化
onMounted(() => {
  // 概览区模拟实时数据
  const overviewTimer = window.setInterval(() => {
    sharingStats.bandwidth = Math.floor(Math.random() * 100) + 180
    sharingStats.qualityScore = Math.floor(Math.random() * 15) + 85
    sharingStats.avgViewers = +(12 + Math.random() * 8).toFixed(1)
  }, 5000)
  // 防止内存泄漏
  window.addEventListener('beforeunload', () => window.clearInterval(overviewTimer))
})

onUnmounted(() => {
  if (durationTimer.value) window.clearInterval(durationTimer.value)
  if (metricsTimer) window.clearInterval(metricsTimer)
})
</script>

<style lang="less" scoped>
.desktop-sharing {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f1f1f;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .status-overview {
    margin-bottom: 24px;
  }

  .sharing-management {
    margin-bottom: 24px;
  }

  .sharing-control-panel {
    .sharing-preview-area {
      margin-bottom: 24px;

      .main-preview {
        width: 100%;
        height: 400px;
        background: #f0f0f0;
        border-radius: 8px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 16px;

        .preview-loading {
          width: 100%;
        }

        .preview-placeholder {
          text-align: center;
          color: #999;

          .anticon {
            font-size: 64px;
            margin-bottom: 12px;
          }

          p {
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f1f1f;
          }

          .preview-badges {
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: center;
          }

          .preview-info {
            display: flex;
            gap: 16px;
            justify-content: center;

            span {
              background: #e6f7ff;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              color: #1890ff;
            }
          }
        }
      }
    }

    .sharing-controls {
      text-align: center;
      margin-bottom: 24px;

      .ant-btn-group {
        .ant-btn {
          margin: 0 4px;
        }
      }
    }

    .sharing-info {
      .ant-descriptions {
        .ant-descriptions-item-label {
          font-weight: 600;
        }
      }
    }
  }

  .permission-management {
    .permission-settings {
      margin-bottom: 24px;

      .ant-form-item {
        margin-bottom: 16px;
      }
    }

    .user-permissions {
      h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .user-list {
        .user-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .user-info {
            flex: 1;
            margin-left: 12px;

            .user-name {
              font-weight: 600;
              margin-bottom: 2px;
              color: #1f1f1f;
              font-size: 14px;
            }

            .user-department {
              font-size: 12px;
              color: #666;
              margin-bottom: 2px;
            }

            .user-last-active {
              font-size: 11px;
              color: #999;
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
              display: inline-block;
            }
          }

          .ant-tag {
            margin: 0;
          }
        }
      }
    }
  }

  .sharing-records {
    .ant-table {
      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .status-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .sharing-management {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .sharing-controls {
      .ant-btn-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .ant-btn {
          margin: 0;
        }
      }
    }
  }
}
</style>

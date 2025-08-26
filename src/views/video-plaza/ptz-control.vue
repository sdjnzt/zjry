<template>
  <div class="ptz-control">
    <div class="page-header">
      <h2>云台控制</h2>
      <p>支持PTZ远程控制功能，包括方向控制、变焦控制、预设位置等</p>
    </div>

    <div class="ptz-content">
      <!-- 左侧摄像头列表 -->
      <div class="camera-list">
        <a-card title="摄像头列表" class="camera-list-card">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索摄像头"
            style="margin-bottom: 16px"
          />
          
          <div class="camera-items">
            <div 
              v-for="camera in filteredCameras" 
              :key="camera.id"
              class="camera-item"
              :class="{ active: selectedCamera?.id === camera.id }"
              @click="selectCamera(camera)"
            >
              <div class="camera-info">
                <a-avatar :style="{ backgroundColor: camera.status === 'online' ? '#52c41a' : '#ff4d4f' }">
                  <VideoCameraOutlined />
                </a-avatar>
                <div class="camera-details">
                  <div class="camera-name">{{ camera.name }}</div>
                  <div class="camera-location">{{ camera.location }}</div>
                  <div class="camera-status">
                    <a-tag :color="camera.status === 'online' ? 'green' : 'red'" size="small">
                      {{ camera.status === 'online' ? '在线' : '离线' }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧控制面板 -->
      <div class="control-panel">
        <a-card title="云台控制" class="control-panel-card">
          <div v-if="selectedCamera" class="control-content">
            <!-- 当前摄像头信息 -->
            <div class="current-camera">
              <h3>{{ selectedCamera.name }}</h3>
              <p>{{ selectedCamera.location }} - {{ selectedCamera.ip }}</p>
            </div>

            <!-- 方向控制 -->
            <div class="direction-control">
              <h4>方向控制</h4>
              <div class="direction-grid">
                <div class="direction-row">
                  <a-button 
                    shape="circle" 
                    size="large" 
                    class="direction-btn up"
                    @click="ptzControl('up')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <UpOutlined />
                  </a-button>
                </div>
                <div class="direction-row">
                  <a-button 
                    shape="circle" 
                    size="large" 
                    class="direction-btn left"
                    @click="ptzControl('left')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <LeftOutlined />
                  </a-button>
                  <a-button 
                    shape="circle" 
                    size="large" 
                    class="direction-btn home"
                    @click="ptzControl('home')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <HomeOutlined />
                  </a-button>
                  <a-button 
                    shape="circle" 
                    size="large" 
                    class="direction-btn right"
                    @click="ptzControl('right')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <RightOutlined />
                  </a-button>
                </div>
                <div class="direction-row">
                  <a-button 
                    shape="circle" 
                    size="large" 
                    class="direction-btn down"
                    @click="ptzControl('down')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <DownOutlined />
                  </a-button>
                </div>
              </div>
            </div>

            <!-- 变焦控制 -->
            <div class="zoom-control">
              <h4>变焦控制</h4>
              <div class="zoom-buttons">
                <a-button-group>
                  <a-button 
                    @click="ptzControl('zoomIn')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <ZoomInOutlined />
                    放大
                  </a-button>
                  <a-button 
                    @click="ptzControl('zoomOut')"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    <ZoomOutOutlined />
                    缩小
                  </a-button>
                </a-button-group>
              </div>
            </div>

            <!-- 预设位置 -->
            <div class="preset-control">
              <h4>预设位置</h4>
              <div class="preset-buttons">
                <a-space wrap>
                  <a-button 
                    v-for="preset in ptzPresets" 
                    :key="preset.id"
                    size="small"
                    @click="gotoPreset(preset.id)"
                    :disabled="selectedCamera.status !== 'online'"
                  >
                    {{ preset.name }}
                  </a-button>
                </a-space>
              </div>
            </div>

            <!-- 控制记录 -->
            <div class="control-log">
              <h4>控制记录</h4>
              <div class="log-list">
                <a-timeline>
                  <a-timeline-item 
                    v-for="log in controlLogs" 
                    :key="log.id"
                    :color="log.status === 'success' ? 'green' : 'red'"
                  >
                    <div class="log-item">
                      <span class="log-time">{{ log.time }}</span>
                      <span class="log-action">{{ log.action }}</span>
                      <span class="log-status">{{ log.status === 'success' ? '成功' : '失败' }}</span>
                    </div>
                  </a-timeline-item>
                </a-timeline>
              </div>
            </div>
          </div>
          
          <div v-else class="no-camera">
            <a-empty description="请选择摄像头进行控制" />
          </div>
        </a-card>
      </div>
    </div>

    <!-- 预设位置管理弹窗 -->
    <a-modal
      v-model:open="showPresetModal"
      title="预设位置管理"
      width="600px"
      @ok="savePreset"
      @cancel="cancelPreset"
    >
      <a-form :model="presetForm" layout="vertical">
        <a-form-item label="位置名称" required>
          <a-input v-model:value="presetForm.name" placeholder="请输入位置名称" />
        </a-form-item>
        
        <a-form-item label="位置描述">
          <a-textarea v-model:value="presetForm.description" placeholder="请输入位置描述" />
        </a-form-item>
        
        <a-form-item label="优先级">
          <a-select v-model:value="presetForm.priority" placeholder="选择优先级">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  VideoCameraOutlined,
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons-vue'

/**
 * 云台控制组件
 * 支持PTZ远程控制功能
 */

// 响应式数据
const searchKeyword = ref('')
const selectedCamera = ref<any>(null)
const showPresetModal = ref(false)
const editingPreset = ref<any>(null)

// 摄像头数据
const cameras = ref([
  {
    id: 1,
    name: '码头1号',
    location: '码头前沿',
    ip: '192.168.1.101',
    status: 'online',
    ptzEnabled: true
  },
  {
    id: 2,
    name: '码头2号',
    location: '码头前沿',
    ip: '192.168.1.102',
    status: 'online',
    ptzEnabled: true
  },
  {
    id: 3,
    name: '航道1号',
    location: '主航道',
    ip: '192.168.1.103',
    status: 'offline',
    ptzEnabled: true
  },
  {
    id: 4,
    name: '锚地1号',
    location: '锚地区域',
    ip: '192.168.1.104',
    status: 'online',
    ptzEnabled: true
  }
])

// PTZ预设位置
const ptzPresets = ref([
  { id: 1, name: '位置1', description: '码头前沿全景', priority: 'high' },
  { id: 2, name: '位置2', description: '航道入口', priority: 'medium' },
  { id: 3, name: '位置3', description: '锚地区域', priority: 'medium' },
  { id: 4, name: '位置4', description: '码头后方', priority: 'low' },
  { id: 5, name: '位置5', description: '航道中心', priority: 'low' }
])

// 控制记录
const controlLogs = ref([
  {
    id: 1,
    time: '2025-08-26 10:30:15',
    action: '向上转动',
    status: 'success'
  },
  {
    id: 2,
    time: '2025-08-26 10:29:45',
    action: '放大变焦',
    status: 'success'
  },
  {
    id: 3,
    time: '2025-08-26 10:29:20',
    action: '向左转动',
    status: 'success'
  },
  {
    id: 4,
    time: '2025-08-26 10:28:55',
    action: '跳转预设位置1',
    status: 'success'
  }
])

// 预设位置表单
const presetForm = reactive({
  name: '',
  description: '',
  priority: 'medium'
})

// 计算属性
const filteredCameras = computed(() => {
  if (!searchKeyword.value) return cameras.value
  return cameras.value.filter(camera => 
    camera.name.includes(searchKeyword.value) || 
    camera.location.includes(searchKeyword.value)
  )
})

// 方法
const selectCamera = (camera: any) => {
  selectedCamera.value = camera
  // 清空控制记录
  controlLogs.value = []
}

const ptzControl = (action: string) => {
  if (!selectedCamera.value) return
  
  const actionMap: Record<string, string> = {
    'up': '向上转动',
    'down': '向下转动',
    'left': '向左转动',
    'right': '向右转动',
    'home': '回到初始位置',
    'zoomIn': '放大变焦',
    'zoomOut': '缩小变焦'
  }
  
  const actionText = actionMap[action] || action
  
  // 添加到控制记录
  controlLogs.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleString(),
    action: actionText,
    status: 'success'
  })
  
  console.log('PTZ控制:', action, '摄像头:', selectedCamera.value.name)
}

const gotoPreset = (presetId: number) => {
  if (!selectedCamera.value) return
  
  const preset = ptzPresets.value.find(p => p.id === presetId)
  if (preset) {
    // 添加到控制记录
    controlLogs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString(),
      action: `跳转预设位置: ${preset.name}`,
      status: 'success'
    })
    
    console.log('跳转到预设位置:', preset.name)
  }
}

const showCreatePreset = () => {
  editingPreset.value = null
  resetPresetForm()
  showPresetModal.value = true
}

const editPreset = (preset: any) => {
  editingPreset.value = preset
  presetForm.name = preset.name
  presetForm.description = preset.description
  presetForm.priority = preset.priority
  showPresetModal.value = true
}

const savePreset = () => {
  if (editingPreset.value) {
    // 编辑现有预设
    editingPreset.value.name = presetForm.name
    editingPreset.value.description = presetForm.description
    editingPreset.value.priority = presetForm.priority
  } else {
    // 创建新预设
    const newPreset = {
      id: Date.now(),
      name: presetForm.name,
      description: presetForm.description,
      priority: presetForm.priority
    }
    ptzPresets.value.push(newPreset)
  }
  
  showPresetModal.value = false
  resetPresetForm()
}

const cancelPreset = () => {
  showPresetModal.value = false
  resetPresetForm()
}

const resetPresetForm = () => {
  presetForm.name = ''
  presetForm.description = ''
  presetForm.priority = 'medium'
}

// 生命周期
onMounted(() => {
  console.log('云台控制组件已挂载')
  // 默认选择第一个在线摄像头
  const onlineCamera = cameras.value.find(c => c.status === 'online')
  if (onlineCamera) {
    selectCamera(onlineCamera)
  }
})
</script>

<style lang="less" scoped>
.ptz-control {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: 16px;
    
    h2 {
      margin: 0 0 8px 0;
      color: @text-color;
    }
    
    p {
      margin: 0;
      color: @text-color-secondary;
      font-size: @font-size-sm;
    }
  }

  .ptz-content {
    flex: 1;
    display: flex;
    gap: 16px;
    min-height: 0;

    .camera-list {
      width: 300px;
      flex-shrink: 0;

      .camera-list-card {
        height: 100%;
        
        .camera-items {
          .camera-item {
            padding: 12px;
            border: 1px solid @border-color-base;
            border-radius: @border-radius-base;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: @primary-color;
              box-shadow: @box-shadow-base;
            }

            &.active {
              border-color: @primary-color;
              background-color: #f0f8ff;
            }

            .camera-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .camera-details {
                flex: 1;

                .camera-name {
                  font-weight: 500;
                  color: @text-color;
                  margin-bottom: 4px;
                }

                .camera-location {
                  font-size: 12px;
                  color: @text-color-secondary;
                  margin-bottom: 4px;
                }

                .camera-status {
                  display: flex;
                  justify-content: flex-end;
                }
              }
            }
          }
        }
      }
    }

    .control-panel {
      flex: 1;
      min-height: 0;

      .control-panel-card {
        height: 100%;
        
        .control-content {
          .current-camera {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid @border-color-split;

            h3 {
              margin: 0 0 8px 0;
              color: @text-color;
            }

            p {
              margin: 0;
              color: @text-color-secondary;
              font-size: 14px;
            }
          }

          .direction-control {
            margin-bottom: 24px;

            h4 {
              margin: 0 0 16px 0;
              color: @text-color;
              font-size: 16px;
            }

            .direction-grid {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;

              .direction-row {
                display: flex;
                gap: 8px;
                justify-content: center;
              }

              .direction-btn {
                width: 60px;
                height: 60px;
                font-size: 20px;

                &.up {
                  background-color: #f6ffed;
                  border-color: #52c41a;
                  color: #52c41a;
                }

                &.down {
                  background-color: #fff2e8;
                  border-color: #fa8c16;
                  color: #fa8c16;
                }

                &.left {
                  background-color: #f0f5ff;
                  border-color: #1890ff;
                  color: #1890ff;
                }

                &.right {
                  background-color: #f9f0ff;
                  border-color: #722ed1;
                  color: #722ed1;
                }

                &.home {
                  background-color: #fff7e6;
                  border-color: #faad14;
                  color: #faad14;
                }
              }
            }
          }

          .zoom-control {
            margin-bottom: 24px;

            h4 {
              margin: 0 0 16px 0;
              color: @text-color;
              font-size: 16px;
            }

            .zoom-buttons {
              text-align: center;
            }
          }

          .preset-control {
            margin-bottom: 24px;

            h4 {
              margin: 0 0 16px 0;
              color: @text-color;
              font-size: 16px;
            }

            .preset-buttons {
              text-align: center;
            }
          }

          .control-log {
            h4 {
              margin: 0 0 16px 0;
              color: @text-color;
              font-size: 16px;
            }

            .log-list {
              max-height: 200px;
              overflow-y: auto;

              .log-item {
                display: flex;
                gap: 16px;
                align-items: center;

                .log-time {
                  font-size: 12px;
                  color: @text-color-secondary;
                  min-width: 80px;
                }

                .log-action {
                  flex: 1;
                  color: @text-color;
                }

                .log-status {
                  font-size: 12px;
                  color: @text-color-secondary;
                }
              }
            }
          }
        }

        .no-camera {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>

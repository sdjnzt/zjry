<template>
  <div class="intelligent-patrol">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>智能轮巡</h1>
          <p>预设视频轮巡预案，系统自动按设定时间间隔切换大屏显示画面</p>
        </div>
        <div class="header-actions">
          <a-button type="primary" size="large" @click="showCreatePatrol">
            <PlusOutlined />
            新建预案
          </a-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧轮巡预案管理 -->
      <div class="left-panel">
        <a-card title="轮巡预案管理" class="patrol-card">
          <div class="patrol-list">
            <div 
              v-for="patrol in patrolPlans" 
              :key="patrol.id"
              class="patrol-item"
              :class="{ active: currentPatrol?.id === patrol.id }"
              @click="selectPatrol(patrol)"
            >
              <div class="patrol-info">
                <div class="patrol-name">{{ patrol.name }}</div>
                <div class="patrol-meta">
                  <span class="interval">间隔: {{ patrol.interval }}秒</span>
                  <span class="camera-count">{{ patrol.cameras.length }}个摄像头</span>
                </div>
              </div>
              <div class="patrol-status">
                <a-tag :color="patrol.status === 'running' ? 'success' : 'default'">
                  {{ patrol.status === 'running' ? '运行中' : '已停止' }}
                </a-tag>
              </div>
              <div class="patrol-actions">
                <a-button 
                  size="small" 
                  :type="patrol.status === 'running' ? 'default' : 'primary'"
                  @click.stop="togglePatrol(patrol)"
                >
                  {{ patrol.status === 'running' ? '停止' : '启动' }}
                </a-button>
                <a-button size="small" @click.stop="editPatrol(patrol)">
                  编辑
                </a-button>
                <a-button size="small" danger @click.stop="deletePatrol(patrol)">
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧轮巡预览 -->
      <div class="right-panel">
        <a-card title="轮巡预览" class="preview-card">
          <!-- 轮巡控制栏 -->
          <div class="control-bar">
            <div class="current-info">
              <h3>{{ currentPatrol ? currentPatrol.name : '未选择预案' }}</h3>
              <span class="status-text">{{ currentPatrol?.status === 'running' ? '运行中' : '已停止' }}</span>
            </div>
            <div class="control-buttons">
              <a-button-group>
                <a-button 
                  :disabled="!currentPatrol || currentPatrol.status !== 'running'"
                  @click="previousCamera"
                >
                  <LeftOutlined />
                  上一个
                </a-button>
                <a-button 
                  :disabled="!currentPatrol || currentPatrol.status !== 'running'"
                  @click="pausePatrol"
                >
                  <PauseOutlined />
                  暂停
                </a-button>
                <a-button 
                  :disabled="!currentPatrol || currentPatrol.status !== 'running'"
                  @click="nextCamera"
                >
                  下一个
                  <RightOutlined />
                </a-button>
              </a-button-group>
            </div>
          </div>

          <!-- 摄像头矩阵 -->
          <div class="camera-matrix">
            <div class="matrix-header">
              <span class="matrix-title">摄像头矩阵 ({{ patrolCells.length }}个位置)</span>
              <a-button size="small" @click="resetMatrix">重置矩阵</a-button>
            </div>
            <div class="matrix-grid">
              <div 
                v-for="(cell, index) in patrolCells" 
                :key="`cell-${index}`"
                class="matrix-cell"
                :class="{ 
                  'has-camera': !!cell.camera,
                  'current-active': currentPatrol?.status === 'running' && currentCameraIndex === index
                }"
              >
                <div class="cell-header">
                  <div class="camera-name">{{ cell.camera?.name || '未配置' }}</div>
                  <div class="camera-status">
                    <a-tag :color="cell.camera ? 'success' : 'default'" size="small">
                      {{ cell.camera ? '已配置' : '未配置' }}
                    </a-tag>
                  </div>
                </div>
                <div class="cell-content">
                  <div v-if="cell.camera && cell.camera.id" class="video-display">
                    <!-- 根据媒体类型显示图片或视频 -->
                    <div v-if="cell.camera.mediaType === 'image' && cell.camera.mediaPath" class="camera-image">
                      <img 
                        :src="cell.camera.mediaPath" 
                        :alt="`${cell.camera.name}摄像头`" 
                        class="camera-img"
                      />
                      <!-- 时间显示 -->
                      <div class="time-overlay">
                        <div class="timestamp">{{ getCurrentTime() }}</div>
                      </div>
                    </div>
                    <div v-else-if="cell.camera.mediaType === 'video' && cell.camera.mediaPath" class="camera-video">
                      <video 
                        :src="cell.camera.mediaPath" 
                        autoplay 
                        muted 
                        loop 
                        class="camera-vid"
                      />
                      <!-- 时间显示 -->
                      <div class="time-overlay">
                        <div class="timestamp">{{ getCurrentTime() }}</div>
                      </div>
                    </div>
                    <div v-else class="video-placeholder">
                      <VideoCameraOutlined class="camera-icon" />
                      <div class="camera-name">{{ cell.camera?.name || '' }}</div>
                      <div class="camera-location">{{ cell.camera?.location || '' }}</div>
                    </div>
                  </div>
                  <div v-else-if="!cell.camera || !cell.camera.id" class="empty-slot">
                    <PlusOutlined class="add-icon" />
                    <div class="add-text">添加摄像头</div>
                    <a-button 
                      size="small" 
                      type="primary" 
                      @click="openCameraPicker(index)"
                    >
                      选择
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 轮巡进度 -->
          <div class="patrol-progress" v-if="currentPatrol && currentPatrol.status === 'running'">
            <div class="progress-header">
              <span class="progress-text">轮巡进度: {{ currentCameraIndex + 1 }}/{{ currentPatrol.cameras.length }}</span>
              <span class="next-switch">下次切换: {{ nextSwitchTime }}秒</span>
            </div>
            <a-progress 
              :percent="patrolProgress" 
              :show-info="false"
              :stroke-color="{
                '0%': '#1890ff',
                '100%': '#52c41a',
              }"
            />
          </div>
        </a-card>
      </div>
    </div>

    <!-- 创建/编辑轮巡预案模态框 -->
    <a-modal
      v-model:open="showPatrolModal"
      :title="editingPatrol ? '编辑轮巡预案' : '新建轮巡预案'"
      width="700px"
      @ok="savePatrol"
      @cancel="cancelPatrol"
    >
      <a-form :model="patrolForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="预案名称" required>
              <a-input v-model:value="patrolForm.name" placeholder="请输入预案名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="轮巡间隔(秒)" required>
              <a-input-number 
                v-model:value="patrolForm.interval" 
                :min="5" 
                :max="300"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="选择摄像头" required>
          <a-transfer
            v-model:target-keys="patrolForm.selectedCameras"
            :data-source="availableCameras"
            :titles="['可选摄像头', '已选摄像头']"
            :render="(item: any) => item.title"
            :show-search="true"
            :show-select-all="false"
          />
        </a-form-item>
        
        <a-form-item label="轮巡策略">
          <a-radio-group v-model:value="patrolForm.strategy">
            <a-radio value="sequential">顺序轮巡</a-radio>
            <a-radio value="random">随机轮巡</a-radio>
            <a-radio value="priority">优先级轮巡</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="生效时间">
          <a-range-picker 
            v-model:value="patrolForm.timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 摄像头选择器模态框 -->
    <a-modal
      v-model:open="cameraPickerVisible"
      title="选择摄像头"
      width="900px"
      :footer="null"
    >
      <div class="camera-picker">
        <a-input-search 
          v-model:value="cameraPickerKeyword" 
          placeholder="搜索摄像头名称或位置" 
          style="margin-bottom: 16px"
          allow-clear
        />
        <a-table 
          :columns="cameraPickerColumns" 
          :data-source="filteredCameras" 
          row-key="id" 
          size="middle"
          :pagination="{ pageSize: 10, showSizeChanger: true }"
          :row-selection="{ selectedRowKeys: selectedCameraKeys, onChange: onCameraSelectionChange }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag color="success">在线</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="link" @click="selectCamera(record)">选择</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
  PauseOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

/**
 * 智能轮巡组件
 * 支持预设视频轮巡预案，自动按设定时间间隔切换大屏显示画面
 */

// 响应式数据
const currentPatrol = ref<any>(null)
const currentCamera = ref<any>(null)
const currentCameraIndex = ref(0)
const showPatrolModal = ref(false)
const editingPatrol = ref<any>(null)
const patrolTimer = ref<any>(null)
const nextSwitchTime = ref(0)

// 矩阵相关
interface PatrolCell {
  camera: {
    id: number;
    name: string;
    location: string;
    status: string;
    mediaType: string; // 新增媒体类型
    mediaPath: string; // 新增媒体路径
  } | null;
  index: number;
}

const patrolCells = ref<PatrolCell[]>([
  { camera: null, index: 0 },
  { camera: null, index: 1 },
  { camera: null, index: 2 },
  { camera: null, index: 3 }
])

// 摄像头选择器
const cameraPickerVisible = ref(false)
const cameraPickerKeyword = ref('')
const selectedCameraKeys = ref<number[]>([])
const targetCellIndex = ref(-1)

// 轮巡预案表单
const patrolForm = reactive({
  name: '',
  interval: 30,
  selectedCameras: [],
  strategy: 'sequential',
  timeRange: []
})

// 轮巡预案列表
const patrolPlans = ref([
  {
    id: 1,
    name: '码头重点区域轮巡',
    status: 'running',
    interval: 30,
    cameras: [
      { 
        id: 1, 
        name: '锚地1号监控', 
        location: '码头前沿A区', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/4.png'
      },
      { 
        id: 2, 
        name: '码头2号监控', 
        location: '码头前沿B区', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/2.png'
      },
      { 
        id: 3, 
        name: '码头3号监控', 
        location: '码头前沿C区', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/3.png'
      }
    ]
  },
  {
    id: 2,
    name: '航道监控轮巡',
    status: 'stopped',
    interval: 45,
    cameras: [
      { 
        id: 4, 
        name: '主航道1号', 
        location: '主航道入口', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/4.png'
      },
      { 
        id: 5, 
        name: '主航道2号', 
        location: '主航道中段', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/1.png'
      }
    ]
  },
  {
    id: 3,
    name: '锚地区域轮巡',
    status: 'stopped',
    interval: 60,
    cameras: [
      { 
        id: 6, 
        name: '锚地监控点', 
        location: '锚地区域中心', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/1.png'
      }
    ]
  },
  {
    id: 4,
    name: '港区周界巡检',
    status: 'stopped',
    interval: 50,
    cameras: [
      { 
        id: 7, 
        name: '码头4号监控', 
        location: '码头前沿D区', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/1.png'
      },
      { 
        id: 1, 
        name: '码头1号监控', 
        location: '码头前沿A区', 
        status: '在线',
        mediaType: 'video',
        mediaPath: '/image/1.mp4'
      }
    ]
  },
  {
    id: 5,
    name: '桥区桥面/引桥监控',
    status: 'stopped',
    interval: 40,
    cameras: [
      { 
        id: 8, 
        name: '航道3号监控', 
        location: '主航道出口', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/1.png'
      },
      { 
        id: 5, 
        name: '主航道2号', 
        location: '主航道中段', 
        status: '在线',
        mediaType: 'image',
        mediaPath: '/image/1.png'
      }
    ]
  }
])

// 可用摄像头列表
const availableCameras = ref([
  { 
    key: 1, 
    title: '码头1号监控', 
    location: '码头前沿A区', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/1.png'
  },
  { 
    key: 2, 
    title: '码头2号监控', 
    location: '码头前沿B区', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/2.png'
  },
  { 
    key: 3, 
    title: '码头3号监控', 
    location: '码头前沿C区', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/3.png'
  },
  { 
    key: 4, 
    title: '主航道1号', 
    location: '主航道入口', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/4.png'
  },
  { 
    key: 5, 
    title: '主航道2号', 
    location: '主航道中段', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/1.png'
  },
  { 
    key: 6, 
    title: '锚地监控点', 
    location: '锚地区域中心', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/1.png'
  },
  { 
    key: 7, 
    title: '码头4号监控', 
    location: '码头前沿D区', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/1.png'
  },
  { 
    key: 8, 
    title: '航道3号监控', 
    location: '主航道出口', 
    status: '在线',
    mediaType: 'image',
    mediaPath: '/image/1.png'
  }
])

// 计算属性
const patrolProgress = computed(() => {
  if (!currentPatrol.value) return 0
  return ((currentCameraIndex.value + 1) / currentPatrol.value.cameras.length) * 100
})

const filteredCameras = computed(() => {
  const keyword = cameraPickerKeyword.value.trim().toLowerCase()
  if (!keyword) return availableCameras.value
  
  return availableCameras.value.filter(camera => 
    camera.title.toLowerCase().includes(keyword) || 
    camera.location.toLowerCase().includes(keyword)
  )
})

const cameraPickerColumns = [
  { title: '摄像头名称', dataIndex: 'title', key: 'title', width: 200 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 100 }
]

// 方法
const selectPatrol = (patrol: any) => {
  currentPatrol.value = patrol
  if (patrol.cameras.length > 0) {
    currentCameraIndex.value = 0
    currentCamera.value = patrol.cameras[0]
    // 不要重置矩阵，保持前三个摄像头自动配置
    // resetMatrix()
  }
}

const togglePatrol = (patrol: any) => {
  if (patrol.status === 'running') {
    stopPatrol(patrol)
  } else {
    startPatrol(patrol)
  }
}

const startPatrol = (patrol: any) => {
  patrol.status = 'running'
  if (patrol.id === currentPatrol.value?.id) {
    startPatrolTimer()
    message.success(`预案"${patrol.name}"已启动`)
  }
}

const stopPatrol = (patrol: any) => {
  patrol.status = 'stopped'
  if (patrol.id === currentPatrol.value?.id) {
    stopPatrolTimer()
    message.info(`预案"${patrol.name}"已停止`)
  }
}

const startPatrolTimer = () => {
  if (patrolTimer.value) {
    clearInterval(patrolTimer.value)
  }
  
  nextSwitchTime.value = currentPatrol.value.interval
  
  patrolTimer.value = setInterval(() => {
    nextSwitchTime.value--
    
    if (nextSwitchTime.value <= 0) {
      nextCamera()
      nextSwitchTime.value = currentPatrol.value.interval
    }
  }, 1000)
}

const stopPatrolTimer = () => {
  if (patrolTimer.value) {
    clearInterval(patrolTimer.value)
    patrolTimer.value = null
  }
}

const nextCamera = () => {
  if (!currentPatrol.value) return
  
  currentCameraIndex.value = (currentCameraIndex.value + 1) % currentPatrol.value.cameras.length
  currentCamera.value = currentPatrol.value.cameras[currentCameraIndex.value]
}

const previousCamera = () => {
  if (!currentPatrol.value) return
  
  currentCameraIndex.value = currentCameraIndex.value === 0 
    ? currentPatrol.value.cameras.length - 1 
    : currentCameraIndex.value - 1
  currentCamera.value = currentPatrol.value.cameras[currentCameraIndex.value]
}

const pausePatrol = () => {
  if (currentPatrol.value) {
    stopPatrolTimer()
    message.info('轮巡已暂停')
  }
}

const openCameraPicker = (cellIndex: number) => {
  targetCellIndex.value = cellIndex
  cameraPickerVisible.value = true
  selectedCameraKeys.value = []
}

const selectCamera = (camera: any) => {
  if (targetCellIndex.value >= 0) {
    patrolCells.value[targetCellIndex.value].camera = {
      id: camera.key,
      name: camera.title,
      location: camera.location,
      status: camera.status,
      mediaType: camera.mediaType, // 新增媒体类型
      mediaPath: camera.mediaPath // 新增媒体路径
    }
    cameraPickerVisible.value = false
    message.success(`已选择摄像头: ${camera.title}`)
  }
}

const onCameraSelectionChange = (keys: number[]) => {
  selectedCameraKeys.value = keys
}

const resetMatrix = () => {
  patrolCells.value.forEach(cell => {
    cell.camera = null
  })
  message.info('矩阵已重置')
}

const showCreatePatrol = () => {
  editingPatrol.value = null
  resetPatrolForm()
  showPatrolModal.value = true
}

const editPatrol = (patrol: any) => {
  editingPatrol.value = patrol
  patrolForm.name = patrol.name
  patrolForm.interval = patrol.interval
  patrolForm.selectedCameras = patrol.cameras.map((c: any) => c.id)
  patrolForm.strategy = 'sequential'
  showPatrolModal.value = true
}

const deletePatrol = (patrol: any) => {
  const index = patrolPlans.value.findIndex(p => p.id === patrol.id)
  if (index > -1) {
    patrolPlans.value.splice(index, 1)
    if (currentPatrol.value?.id === patrol.id) {
      currentPatrol.value = null
      currentCamera.value = null
      stopPatrolTimer()
    }
    message.success('预案已删除')
  }
}

const savePatrol = () => {
  if (editingPatrol.value) {
    // 编辑现有预案
    editingPatrol.value.name = patrolForm.name
    editingPatrol.value.interval = patrolForm.interval
    editingPatrol.value.cameras = patrolForm.selectedCameras.map(id => {
      const camera = availableCameras.value.find(c => c.key === id)
      if (!camera) return null
      return {
        id: camera.key,
        name: camera.title,
        location: camera.location,
        status: camera.status,
        mediaType: camera.mediaType, // 新增媒体类型
        mediaPath: camera.mediaPath // 新增媒体路径
      }
    }).filter(Boolean) as { id: number; name: string; location: string; status: string; mediaType: string; mediaPath: string; }[]
    message.success('预案已更新')
  } else {
    // 创建新预案
    const newPatrol = {
      id: Date.now(),
      name: patrolForm.name,
      status: 'stopped',
      interval: patrolForm.interval,
      cameras: patrolForm.selectedCameras.map(id => {
        const camera = availableCameras.value.find(c => c.key === id)
        if (!camera) return null
        return {
          id: camera.key,
          name: camera.title,
          location: camera.location,
          status: camera.status,
          mediaType: camera.mediaType, // 新增媒体类型
          mediaPath: camera.mediaPath // 新增媒体路径
        }
      }).filter(Boolean) as { id: number; name: string; location: string; status: string; mediaType: string; mediaPath: string; }[]
    }
    patrolPlans.value.push(newPatrol)
    message.success('预案已创建')
  }
  
  showPatrolModal.value = false
  resetPatrolForm()
}

const cancelPatrol = () => {
  showPatrolModal.value = false
  resetPatrolForm()
}

const resetPatrolForm = () => {
  patrolForm.name = ''
  patrolForm.interval = 30
  patrolForm.selectedCameras = []
  patrolForm.strategy = 'sequential'
  patrolForm.timeRange = []
}

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 初始化矩阵，自动配置前三个摄像头
const initializeMatrix = () => {
  const firstPatrol = patrolPlans.value[0]
  if (firstPatrol && firstPatrol.cameras.length > 0) {
    // 自动配置前三个摄像头到矩阵中
    firstPatrol.cameras.forEach((camera, index) => {
      if (index < 3) { // 只配置前三个
        patrolCells.value[index].camera = {
          id: camera.id,
          name: camera.name,
          location: camera.location,
          status: camera.status,
          mediaType: camera.mediaType,
          mediaPath: camera.mediaPath
        }
      }
    })
  }
}

/**
 * 组件挂载后的初始化
 */
onMounted(() => {
  console.log('智能轮巡组件已挂载')
  
  // 初始化矩阵，自动配置前三个摄像头
  initializeMatrix()
  
  // 默认选择第一个预案
  if (patrolPlans.value.length > 0) {
    selectPatrol(patrolPlans.value[0])
  }
})

onUnmounted(() => {
  if (patrolTimer.value) {
    clearInterval(patrolTimer.value)
  }
})
</script>

<style lang="less" scoped>
.intelligent-patrol {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .page-header {
    background: #fff;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: #262626;
        }

        p {
          margin: 0;
          color: #8c8c8c;
          font-size: 14px;
        }
      }

      .header-actions {
        .ant-btn {
          border-radius: 8px;
          height: 40px;
          padding: 0 24px;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 0 16px 16px 16px;
    min-height: 0;

    .left-panel {
      width: 400px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      height: 100%;

      .patrol-card {
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        min-height: 850px;

        :deep(.ant-card-head) {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
          flex-shrink: 0;
        }

        :deep(.ant-card-body) {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }

        .patrol-list {
          height: 100%;
          overflow-y: auto;
          flex: 1;
          min-height: 0;

          .patrol-item {
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s;
            background: #fff;
            flex-shrink: 0;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            &:hover {
              border-color: #1890ff;
              box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
              transform: translateY(-2px);
            }

            &.active {
              border-color: #1890ff;
              background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
              box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
            }

            .patrol-info {
              margin-bottom: 12px;
              flex: 1;

              .patrol-name {
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 8px;
              }

              .patrol-meta {
                display: flex;
                gap: 16px;
                font-size: 12px;
                color: #8c8c8c;

                .interval, .camera-count {
                  background: #f5f5f5;
                  padding: 4px 8px;
                  border-radius: 4px;
                }
              }
            }

            .patrol-status {
              margin-bottom: 12px;
              flex-shrink: 0;
            }

            .patrol-actions {
              display: flex;
              gap: 8px;
              flex-shrink: 0;

              .ant-btn {
                border-radius: 6px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .right-panel {
      flex: 1;
      min-height: 0;

      .preview-card {
        height: 100%;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;

        :deep(.ant-card-head) {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
        }

        :deep(.ant-card-body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f6ffed 0%, #f0f8ff 100%);
          border-bottom: 1px solid #e8f5e8;

          .current-info {
            h3 {
              margin: 0 0 4px 0;
              font-size: 20px;
              font-weight: 600;
              color: #262626;
            }

            .status-text {
              font-size: 14px;
              color: #52c41a;
              background: rgba(82, 196, 26, 0.1);
              padding: 4px 12px;
              border-radius: 12px;
            }
          }

          .control-buttons {
            .ant-btn-group {
              .ant-btn {
                border-radius: 8px;
                height: 36px;
                padding: 0 16px;
              }
            }
          }
        }

        .camera-matrix {
          flex: 1;
          padding: 24px;
          background: #fafafa;

          .matrix-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .matrix-title {
              font-size: 16px;
              font-weight: 600;
              color: #262626;
            }
          }

          .matrix-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 20px;
            height: 400px;
            min-height: 500px;

            .matrix-cell {
              background: #fff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
              display: flex;
              flex-direction: column;
              transition: all 0.3s;
              min-height: 240px;

              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              }

              &.has-camera {
                border: 2px solid #52c41a;
              }

              &.current-active {
                border: 2px solid #1890ff;
                box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
              }

              .cell-header {
                padding: 12px 16px;
                background: #fafafa;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .camera-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #262626;
                }
              }

              .cell-content {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;

                .video-display {
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative; /* Added for time overlay positioning */

                  .camera-image {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                    .camera-img {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 8px;
                      transition: transform 0.3s ease;
                      
                      &:hover {
                        transform: scale(1.05);
                      }
                    }

                    .time-overlay {
                      position: absolute;
                      top: 8px;
                      right: 8px;
                      background: rgba(0, 0, 0, 0.7);
                      color: #fff;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-family: 'Courier New', monospace;
                      border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                  }

                  .camera-video {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                    .camera-vid {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 8px;
                      transition: transform 0.3s ease;
                      
                      &:hover {
                        transform: scale(1.05);
                      }
                    }

                    .time-overlay {
                      position: absolute;
                      top: 8px;
                      right: 8px;
                      background: rgba(0, 0, 0, 0.7);
                      color: #fff;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-family: 'Courier New', monospace;
                      border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                  }

                  .video-placeholder {
                    text-align: center;
                    color: #fff;

                    .camera-icon {
                      font-size: 48px;
                      margin-bottom: 12px;
                      color: #1890ff;
                    }

                    .camera-name {
                      font-size: 16px;
                      font-weight: 600;
                      margin-bottom: 8px;
                    }

                    .camera-location {
                      font-size: 12px;
                      opacity: 0.8;
                    }
                  }
                }

                .empty-slot {
                  width: 100%;
                  height: 100%;
                  background: #f5f5f5;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: #8c8c8c;

                  .add-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                    opacity: 0.6;
                    color: #52c41a;
                  }

                  .add-text {
                    font-size: 14px;
                    margin-bottom: 12px;
                    font-weight: 500;
                  }

                  .ant-btn {
                    border-radius: 6px;
                  }
                }
              }
            }
          }
        }

        .patrol-progress {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #f0f0f0;

          .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
            color: #8c8c8c;

            .progress-text {
              font-weight: 500;
            }

            .next-switch {
              color: #1890ff;
            }
          }

          :deep(.ant-progress-bg) {
            border-radius: 4px;
          }
        }
      }
    }
  }
}

// 摄像头选择器样式
.camera-picker {
  .ant-table {
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>

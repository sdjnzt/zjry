<template>
  <div class="electronic-evidence">
    <div class="page-header">
      <h2>电子取证</h2>
      <p>关键信息截屏、录像保存，支持证据链管理和完整性验证</p>
    </div>

    <!-- 证据概览 -->
    <div class="evidence-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper total">
                <FileTextOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ evidenceStats.totalEvidence }}</div>
                <div class="label">总证据数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper video">
                <VideoCameraOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ evidenceStats.videoEvidence }}</div>
                <div class="label">视频证据</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper image">
                <PictureOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ evidenceStats.imageEvidence }}</div>
                <div class="label">图片证据</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper audio">
                <SoundOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ evidenceStats.audioEvidence }}</div>
                <div class="label">音频证据</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 证据采集区域 -->
    <div class="evidence-collection">
      <a-card title="证据采集" class="collection-card">
        <template #extra>
          <a-space>
            <a-button @click="cameraPickerVisible = true">
              <VideoCameraOutlined />
              选择摄像头
            </a-button>
            <a-button type="primary" @click="startCollection">
              <PlayCircleOutlined />
              开始采集
            </a-button>
            <a-button @click="stopCollection">
              <PauseCircleOutlined />
              停止采集
            </a-button>
            <a-button @click="captureScreenshot">
              <CameraOutlined />
              截屏
            </a-button>
            <a-button @click="startRecording">
              <VideoCameraOutlined />
              录像
            </a-button>
          </a-space>
        </template>

        <a-row :gutter="16">
          <!-- 实时监控画面 -->
          <a-col :span="16">
            <a-card title="实时监控画面" size="small">
              <div class="monitor-display">
                <a-alert
                  :message="selectedCamera ? `已选择摄像头：${selectedCamera.name}（${selectedCamera.code}）` : '未选择摄像头'"
                  :type="selectedCamera ? 'success' : 'warning'"
                  show-icon
                  style="margin-bottom: 12px"
                />
                <div class="video-placeholder">
                  <VideoCameraOutlined style="font-size: 64px; color: #1890ff;" />
                  <p>{{ selectedCamera ? '实时监控画面' : '请先选择摄像头' }}</p>
                  <p v-if="isCollecting" class="collecting-status">正在采集证据...</p>
                  <p v-else>点击“选择摄像头”并“开始采集”进行取证</p>
                </div>
                <div class="monitor-controls">
                  <a-space>
                    <a-tag :color="isCollecting ? 'success' : 'default'">
                      {{ isCollecting ? '采集中' : '未采集' }}
                    </a-tag>
                    <span>采集时长: {{ collectionDuration }}</span>
                    <span>证据数量: {{ currentEvidenceCount }}</span>
                  </a-space>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 采集控制面板 -->
          <a-col :span="8">
            <a-card title="采集控制" size="small">
              <div class="control-panel">
                <a-form layout="vertical">
                  <a-form-item label="采集模式">
                    <a-radio-group v-model:value="collectionMode">
                      <a-radio value="auto">自动采集</a-radio>
                      <a-radio value="manual">手动采集</a-radio>
                      <a-radio value="trigger">触发采集</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  
                  <a-form-item label="采集间隔">
                    <a-input-number
                      v-model:value="collectionInterval"
                      :min="1"
                      :max="60"
                      addon-after="秒"
                      :disabled="collectionMode !== 'auto'"
                    />
                  </a-form-item>
                  
                  <a-form-item label="证据类型">
                    <a-checkbox-group v-model:value="evidenceTypes">
                      <a-checkbox value="video">视频</a-checkbox>
                      <a-checkbox value="image">图片</a-checkbox>
                      <a-checkbox value="audio">音频</a-checkbox>
                      <a-checkbox value="sensor">传感器数据</a-checkbox>
                      <a-checkbox value="radar">雷达数据</a-checkbox>
                      <a-checkbox value="ais">AIS数据</a-checkbox>
                      <a-checkbox value="gps">GPS轨迹</a-checkbox>
                      <a-checkbox value="weather">气象数据</a-checkbox>
                      <a-checkbox value="hydro">水文数据</a-checkbox>
                      <a-checkbox value="thermal">热成像</a-checkbox>
                    </a-checkbox-group>
                  </a-form-item>
                  
                  <a-form-item label="质量设置">
                    <a-select v-model:value="qualitySetting">
                      <a-select-option value="high">高质量</a-select-option>
                      <a-select-option value="medium">中等质量</a-select-option>
                      <a-select-option value="low">低质量</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-form>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 摄像头选择器 -->
    <a-modal
      v-model:open="cameraPickerVisible"
      title="选择监控摄像头"
      width="800px"
      @ok="confirmPickCamera"
      ok-text="确定"
      cancel-text="取消"
    >
      <a-input-search
        v-model:value="cameraKeyword"
        placeholder="输入摄像头编号或名称"
        style="margin-bottom: 12px"
      />
      <a-table
        :columns="cameraColumns"
        :data-source="filteredCameras"
        row-key="id"
        size="small"
        :pagination="{ pageSize: 6 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'online' ? 'success' : 'error'">
              {{ record.status === 'online' ? '在线' : '离线' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="pickCamera(record)" :disabled="record.status !== 'online'">选择</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 证据管理区域 -->
    <div class="evidence-management">
      <a-card title="证据管理" class="management-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshEvidence">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="exportEvidence">
              <DownloadOutlined />
              导出
            </a-button>
            <a-button @click="verifyIntegrity">
              <SafetyOutlined />
              完整性验证
            </a-button>
            <a-button type="primary" @click="createEvidenceChain">
              <LinkOutlined />
              创建证据链
            </a-button>
          </a-space>
        </template>

        <!-- 证据列表 -->
        <a-table
          :columns="evidenceColumns"
          :data-source="evidenceList"
          :pagination="pagination"
          :loading="tableLoading"
          row-key="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getEvidenceTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getEvidenceStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'integrity'">
              <a-tag :color="record.integrity ? 'success' : 'error'">
                {{ record.integrity ? '完整' : '不完整' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewEvidence(record)">
                  查看
                </a-button>
                <a-button size="small" @click="downloadEvidence(record)">
                  下载
                </a-button>
                <a-button size="small" @click="editEvidence(record)">
                  编辑
                </a-button>
                <a-button size="small" danger @click="deleteEvidence(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 证据链管理 -->
    <div class="evidence-chain">
      <a-card title="证据链管理" class="chain-card">
        <template #extra>
          <a-button type="primary" @click="addToChain">
            <PlusOutlined />
            添加到证据链
          </a-button>
        </template>

        <a-timeline>
          <a-timeline-item v-for="chain in evidenceChain" :key="chain.id">
            <template #dot>
              <a-avatar :size="32" :style="{ backgroundColor: getEvidenceTypeColor(chain.type) }">
                {{ getEvidenceTypeIcon(chain.type) }}
              </a-avatar>
            </template>
            <a-card size="small" :title="chain.title">
              <template #extra>
                <a-tag :color="chain.integrity ? 'success' : 'error'">
                  {{ chain.integrity ? '完整' : '不完整' }}
                </a-tag>
              </template>
              <p>{{ chain.description }}</p>
              <div class="chain-meta">
                <span>采集时间: {{ chain.collectionTime }}</span>
                <span>文件大小: {{ chain.fileSize }}</span>
                <span>哈希值: {{ chain.hash }}</span>
              </div>
            </a-card>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>

    <!-- 证据详情模态框 -->
    <a-modal
      v-model:open="evidenceDetailVisible"
      title="证据详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="证据编号">{{ selectedEvidence?.id }}</a-descriptions-item>
        <a-descriptions-item label="证据类型">{{ selectedEvidence?.type }}</a-descriptions-item>
        <a-descriptions-item label="采集时间">{{ selectedEvidence?.collectionTime }}</a-descriptions-item>
        <a-descriptions-item label="文件大小">{{ selectedEvidence?.fileSize }}</a-descriptions-item>
        <a-descriptions-item label="采集位置">{{ selectedEvidence?.location }}</a-descriptions-item>
        <a-descriptions-item label="采集设备">{{ selectedEvidence?.device }}</a-descriptions-item>
        <a-descriptions-item label="完整性">{{ selectedEvidence?.integrity ? '完整' : '不完整' }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ selectedEvidence?.status }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ selectedEvidence?.description }}</a-descriptions-item>
        <a-descriptions-item label="哈希值" :span="2">{{ selectedEvidence?.hash }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined, VideoCameraOutlined, PictureOutlined, SoundOutlined,
  PlayCircleOutlined, PauseCircleOutlined, CameraOutlined, VideoCameraOutlined as VideoIcon,
  ReloadOutlined, DownloadOutlined, SafetyOutlined, LinkOutlined, PlusOutlined
} from '@ant-design/icons-vue'

// 证据统计
const evidenceStats = ref({
  totalEvidence: 1247,
  videoEvidence: 789,
  imageEvidence: 324,
  audioEvidence: 134
})

// 采集状态
const isCollecting = ref(false)
const collectionDuration = ref('00:00:00')
const currentEvidenceCount = ref(0)
const collectionMode = ref('auto')
const collectionInterval = ref(5)
const evidenceTypes = ref(['video', 'image'])
const qualitySetting = ref('high')

// 摄像头选择
const cameraPickerVisible = ref(false)
const cameraKeyword = ref('')
const selectedCamera = ref<any>(null)
const cameraColumns = [
  { title: '编号', dataIndex: 'code', key: 'code', width: 120 },
  { title: '名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' }
]
const cameraList = ref([
  { id: 1, code: 'CAM001', name: '吴淞口·北向高清', location: '吴淞口监控点', status: 'online' },
  { id: 2, code: 'CAM002', name: '宝山港·码头前沿', location: '宝山港监控点', status: 'online' },
  { id: 3, code: 'CAM003', name: '外高桥·航道东侧', location: '外高桥监控点', status: 'online' },
  { id: 4, code: 'CAM004', name: '罗泾港·航标西面', location: '罗泾港监控点', status: 'online' },
  { id: 5, code: 'CAM005', name: '长兴岛·锚地南', location: '长兴岛监控点', status: 'offline' },
  { id: 6, code: 'CAM006', name: '杨浦大桥·桥下南', location: '杨浦大桥监控点', status: 'online' }
])
const filteredCameras = computed(() => {
  const kw = cameraKeyword.value.trim().toLowerCase()
  if (!kw) return cameraList.value
  return cameraList.value.filter(c =>
    c.code.toLowerCase().includes(kw) ||
    c.name.toLowerCase().includes(kw) ||
    c.location.toLowerCase().includes(kw)
  )
})
const pickCamera = (cam: any) => {
  if (cam.status !== 'online') {
    message.warning('该摄像头离线，无法选择')
    return
  }
  selectedCamera.value = cam
  message.success(`已选择摄像头：${cam.name}`)
}
const confirmPickCamera = () => {
  if (!selectedCamera.value) {
    message.warning('请先选择一个在线摄像头')
    return
  }
  cameraPickerVisible.value = false
}

// 表格数据
const evidenceList = ref([])
const tableLoading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 证据链
const evidenceChain = ref([])

// 模态框控制
const evidenceDetailVisible = ref(false)
const selectedEvidence = ref(null)

// 采集定时器
let collectionTimer: NodeJS.Timeout | null = null
let durationTimer: NodeJS.Timeout | null = null

// 表格列定义
const evidenceColumns = [
  { title: '证据编号', dataIndex: 'id', key: 'id', width: 120 },
  { title: '证据类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '采集时间', dataIndex: 'collectionTime', key: 'collectionTime', width: 180 },
  { title: '文件大小', dataIndex: 'fileSize', key: 'fileSize', width: 100 },
  { title: '采集位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '完整性', dataIndex: 'integrity', key: 'integrity', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 方法
const startCollection = () => {
  if (!selectedCamera.value) {
    message.warning('请先选择摄像头')
    return
  }
  if (evidenceTypes.value.length === 0) {
    message.warning('请选择至少一种证据类型')
    return
  }
  
  isCollecting.value = true
  currentEvidenceCount.value = 0
  collectionDuration.value = '00:00:00'
  
  // 开始采集定时器
  if (collectionMode.value === 'auto') {
    collectionTimer = setInterval(() => {
      collectEvidence()
    }, collectionInterval.value * 1000)
  }
  
  // 开始时长计时器
  let seconds = 0
  durationTimer = setInterval(() => {
    seconds++
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    collectionDuration.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, 1000)
  
  message.success('证据采集已开始')
}

const stopCollection = () => {
  isCollecting.value = false
  
  if (collectionTimer) {
    clearInterval(collectionTimer)
    collectionTimer = null
  }
  
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
  
  message.success('证据采集已停止')
}

const captureScreenshot = () => {
  if (!isCollecting.value) {
    message.warning('请先开始采集')
    return
  }
  
  collectEvidence('image')
  message.success('截屏已保存')
}

const startRecording = () => {
  if (!isCollecting.value) {
    message.warning('请先开始采集')
    return
  }
  
  collectEvidence('video')
  message.success('录像已开始')
}

const collectEvidence = (type?: string) => {
  const evidenceType = type || evidenceTypes.value[Math.floor(Math.random() * evidenceTypes.value.length)]
  currentEvidenceCount.value++
  
  // 监控点位置和设备信息
  const locations = [
    '吴淞口监控点', '宝山港监控点', '外高桥监控点', '罗泾港监控点',
    '长兴岛监控点', '横沙岛监控点', '崇明岛监控点', '杨浦大桥监控点',
    '南浦大桥监控点', '卢浦大桥监控点', '徐浦大桥监控点', '闵浦大桥监控点'
  ]
  
  const devices = {
    video: ['高清摄像头001', '高清摄像头002', '高清摄像头003', '高清摄像头004', '高清摄像头005', '高清摄像头006'],
    image: ['高清摄像头001', '高清摄像头002', '高清摄像头003', '高清摄像头004', '高清摄像头005', '高清摄像头006'],
    audio: ['音频采集器001', '音频采集器002', '音频采集器003', '音频采集器004', '音频采集器005', '音频采集器006'],
    sensor: ['传感器阵列001', '传感器阵列002', '传感器阵列003', '传感器阵列004', '传感器阵列005', '传感器阵列006']
  }
  
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const randomDevice = devices[evidenceType][Math.floor(Math.random() * devices[evidenceType].length)]
  
  // 模拟证据数据
  const newEvidence = {
    id: `EV${Date.now()}`,
    type: evidenceType,
    collectionTime: new Date().toLocaleString(),
    fileSize: `${Math.floor(Math.random() * 100) + 10}MB`,
    location: randomLocation,
    device: randomDevice,
    integrity: Math.random() > 0.1,
    status: '已采集',
    description: `自动采集的${evidenceType}证据`,
    hash: generateHash()
  }
  
  evidenceList.value.unshift(newEvidence)
  pagination.total++
}

const generateHash = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const refreshEvidence = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    message.success('证据列表已刷新')
  }, 1000)
}

const exportEvidence = () => {
  if (evidenceList.value.length === 0) {
    message.warning('没有证据可导出')
    return
  }
  message.success('证据导出中...')
}

const verifyIntegrity = () => {
  message.success('完整性验证中...')
  setTimeout(() => {
    message.success('完整性验证完成')
  }, 2000)
}

const createEvidenceChain = () => {
  if (evidenceList.value.length === 0) {
    message.warning('没有证据可创建证据链')
    return
  }
  
  // 模拟创建证据链
  evidenceChain.value = evidenceList.value.slice(0, 5).map((evidence, index) => ({
    id: `chain_${index}`,
    type: evidence.type,
    title: `${evidence.type}证据 ${index + 1}`,
    description: evidence.description,
    collectionTime: evidence.collectionTime,
    fileSize: evidence.fileSize,
    hash: evidence.hash,
    integrity: evidence.integrity
  }))
  
  message.success('证据链已创建')
}

const addToChain = () => {
  message.info('添加到证据链功能开发中...')
}

const viewEvidence = (record: any) => {
  selectedEvidence.value = record
  evidenceDetailVisible.value = true
}

const downloadEvidence = (record: any) => {
  message.success(`正在下载证据：${record.id}`)
}

const editEvidence = (record: any) => {
  message.info(`编辑证据：${record.id}`)
}

const deleteEvidence = (record: any) => {
  message.success(`删除证据：${record.id}`)
  evidenceList.value = evidenceList.value.filter(item => item.id !== record.id)
  pagination.total--
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 获取标签颜色
const getEvidenceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'video': 'blue',
    'image': 'green',
    'audio': 'purple',
    'sensor': 'orange',
    'radar': 'cyan',
    'ais': 'geekblue',
    'gps': 'lime',
    'weather': 'volcano',
    'hydro': 'magenta',
    'thermal': 'red'
  }
  return colorMap[type] || 'default'
}

const getEvidenceStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '已采集': 'success',
    '处理中': 'processing',
    '已处理': 'default',
    '已删除': 'error'
  }
  return colorMap[status] || 'default'
}

const getEvidenceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'video': 'V',
    'image': 'I',
    'audio': 'A',
    'sensor': 'S',
    'radar': 'R',
    'ais': 'A',
    'gps': 'G',
    'weather': 'W',
    'hydro': 'H',
    'thermal': 'T'
  }
  return iconMap[type] || '?'
}

// 初始化证据列表
onMounted(() => {
  console.log('电子取证页面已加载')
  
  // 模拟初始证据数据
  evidenceList.value = [
    {
      id: 'EV001',
      type: 'video',
      collectionTime: '2025-08-15 14:30:25',
      fileSize: '45MB',
      location: '吴淞口监控点',
      device: '高清摄像头001',
      integrity: true,
      status: '已采集',
      description: '船舶碰撞事件视频证据',
      hash: 'a1b2c3d4e5f6'
    },
    {
      id: 'EV002',
      type: 'image',
      collectionTime: '2025-08-15 14:31:15',
      fileSize: '2.5MB',
      location: '吴淞口监控点',
      device: '高清摄像头001',
      integrity: true,
      status: '已采集',
      description: '碰撞瞬间截图',
      hash: 'f6e5d4c3b2a1'
    },
    {
      id: 'EV003',
      type: 'audio',
      collectionTime: '2025-08-15 14:32:05',
      fileSize: '8.7MB',
      location: '吴淞口监控点',
      device: '音频采集器001',
      integrity: true,
      status: '已采集',
      description: '碰撞现场音频记录',
      hash: 'b2c3d4e5f6a1'
    },
    {
      id: 'EV004',
      type: 'video',
      collectionTime: '2025-08-15 16:45:12',
      fileSize: '67MB',
      location: '宝山港监控点',
      device: '高清摄像头002',
      integrity: true,
      status: '已采集',
      description: '船舶搁浅事件视频证据',
      hash: 'c3d4e5f6a1b2'
    },
    {
      id: 'EV005',
      type: 'image',
      collectionTime: '2025-08-15 16:46:22',
      fileSize: '3.2MB',
      location: '宝山港监控点',
      device: '高清摄像头002',
      integrity: true,
      status: '已采集',
      description: '搁浅现场高清照片',
      hash: 'd4e5f6a1b2c3'
    },
    {
      id: 'EV006',
      type: 'sensor',
      collectionTime: '2025-08-15 16:47:15',
      fileSize: '1.8MB',
      location: '宝山港监控点',
      device: '传感器阵列001',
      integrity: true,
      status: '已采集',
      description: '搁浅时环境传感器数据',
      hash: 'e5f6a1b2c3d4'
    },
    {
      id: 'EV007',
      type: 'video',
      collectionTime: '2025-08-15 18:20:33',
      fileSize: '89MB',
      location: '外高桥监控点',
      device: '高清摄像头003',
      integrity: true,
      status: '已采集',
      description: '火灾事故现场视频',
      hash: 'f6a1b2c3d4e5'
    },
    {
      id: 'EV008',
      type: 'image',
      collectionTime: '2025-08-15 18:21:45',
      fileSize: '4.1MB',
      location: '外高桥监控点',
      device: '高清摄像头003',
      integrity: true,
      status: '已采集',
      description: '火灾现场热成像照片',
      hash: 'a1b2c3d4e5f6'
    },
    {
      id: 'EV009',
      type: 'audio',
      collectionTime: '2025-08-15 18:22:18',
      fileSize: '12.3MB',
      location: '外高桥监控点',
      device: '音频采集器002',
      integrity: true,
      status: '已采集',
      description: '火灾报警音频记录',
      hash: 'b2c3d4e5f6a1'
    },
    {
      id: 'EV010',
      type: 'video',
      collectionTime: '2025-08-15 20:15:47',
      fileSize: '56MB',
      location: '罗泾港监控点',
      device: '高清摄像头004',
      integrity: true,
      status: '已采集',
      description: '人员落水救援视频',
      hash: 'c3d4e5f6a1b2'
    },
    {
      id: 'EV011',
      type: 'image',
      collectionTime: '2025-08-15 20:16:33',
      fileSize: '2.8MB',
      location: '罗泾港监控点',
      device: '高清摄像头004',
      integrity: true,
      status: '已采集',
      description: '救援现场照片',
      hash: 'd4e5f6a1b2c3'
    },
    {
      id: 'EV012',
      type: 'sensor',
      collectionTime: '2025-08-15 20:17:12',
      fileSize: '2.1MB',
      location: '罗泾港监控点',
      device: '传感器阵列002',
      integrity: true,
      status: '已采集',
      description: '救援时水文数据',
      hash: 'e5f6a1b2c3d4'
    }
  ]
  
  pagination.total = evidenceList.value.length
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (collectionTimer) {
    clearInterval(collectionTimer)
  }
  if (durationTimer) {
    clearInterval(durationTimer)
  }
})
</script>

<style lang="less" scoped>
.electronic-evidence {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }
    
    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .evidence-overview {
    margin-bottom: 24px;

    .overview-card {
      .card-content {
        display: flex;
        align-items: center;
        padding: 16px;

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.total { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.video { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.image { background: linear-gradient(135deg, #722ed1, #531dab); }
          &.audio { background: linear-gradient(135deg, #fa8c16, #d46b08); }
        }

        .stats {
          flex: 1;

          .number {
            font-size: 24px;
            font-weight: 600;
            color: #262626;
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: 14px;
            color: #8c8c8c;
          }
        }
      }
    }
  }

  .evidence-collection {
    margin-bottom: 24px;

    .collection-card {
      .monitor-display {
        .video-placeholder {
          height: 300px;
          background: #f5f5f5;
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #8c8c8c;
          margin-bottom: 16px;

          p {
            margin: 8px 0;
          }

          .collecting-status {
            color: #52c41a;
            font-weight: 500;
          }
        }

        .monitor-controls {
          text-align: center;
        }
      }

      .control-panel {
        .ant-form-item {
          margin-bottom: 16px;
        }
      }
    }
  }

  .evidence-management {
    margin-bottom: 24px;

    .management-card {
      .ant-table {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    }
  }

  .evidence-chain {
    .chain-card {
      .ant-timeline {
        .ant-timeline-item {
          .ant-timeline-item-content {
            .ant-card {
              margin-bottom: 16px;
            }

            .chain-meta {
              margin-top: 8px;
              font-size: 12px;
              color: #8c8c8c;

              span {
                margin-right: 16px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .electronic-evidence {
    padding: 16px;

    .evidence-overview,
    .evidence-collection {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="communication-integration">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>通讯调度集成</h1>
      <p>集成通讯调度功能，实现会商与通讯的无缝对接</p>
    </div>

    <!-- 集成状态概览 -->
    <a-card class="integration-overview" title="集成状态概览">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="集成状态" :value="integrationStats.status" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="通讯通道" :value="integrationStats.channels" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="调度任务" :value="integrationStats.dispatchTasks" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="响应时间" :value="integrationStats.responseTime" suffix="ms" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="今日调度" :value="integrationStats.todayDispatches" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="通讯质量" :value="integrationStats.communicationQuality" suffix="%" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="在线设备" :value="integrationStats.onlineDevices" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="成功率" :value="integrationStats.successRate" suffix="%" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <div style="display:flex; align-items:center; gap:12px;">
            <a-progress type="circle" :percent="Math.round(integrationStats.communicationQuality)" :width="64" />
            <div>
              <div style="font-weight:600;">通讯质量</div>
              <div style="color:#999;">稳定性良好</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 集成管理区域 -->
    <a-row :gutter="16" class="integration-management">
      <!-- 通讯集成配置 -->
      <a-col :span="12">
        <a-card title="通讯集成配置" class="communication-config">
          <!-- 集成状态 -->
          <div class="integration-status">
            <h4>集成状态</h4>
            <a-tag :color="integrationConfig.status === 'connected' ? 'green' : 'red'" size="large">
              {{ integrationConfig.status === 'connected' ? '已连接' : '未连接' }}
            </a-tag>
            <a-button 
              :type="integrationConfig.status === 'connected' ? 'danger' : 'primary'"
              size="small" 
              style="margin-left: 16px"
              @click="toggleConnection"
            >
              {{ integrationConfig.status === 'connected' ? '断开连接' : '建立连接' }}
            </a-button>
          </div>

          <!-- 通讯协议配置 -->
          <div class="protocol-config">
            <h4>通讯协议配置</h4>
            <a-form layout="vertical" size="small">
              <a-form-item label="协议类型">
                <a-select v-model:value="integrationConfig.protocol" placeholder="选择通讯协议">
                  <a-select-option value="sip">SIP</a-select-option>
                  <a-select-option value="rtp">RTP</a-select-option>
                  <a-select-option value="webrtc">WebRTC</a-select-option>
                  <a-select-option value="custom">自定义协议</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="服务器地址">
                <a-input v-model:value="integrationConfig.serverAddress" placeholder="输入服务器地址" />
              </a-form-item>
              
              <a-form-item label="端口号">
                <a-input-number v-model:value="integrationConfig.port" :min="1" :max="65535" />
              </a-form-item>
              
              <a-form-item label="认证方式">
                <a-select v-model:value="integrationConfig.authMethod" placeholder="选择认证方式">
                  <a-select-option value="none">无认证</a-select-option>
                  <a-select-option value="basic">基本认证</a-select-option>
                  <a-select-option value="digest">摘要认证</a-select-option>
                  <a-select-option value="token">令牌认证</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>

          <!-- 连接测试 -->
          <div class="connection-test">
            <a-button type="primary" @click="testConnection">
              <template #icon><PlayCircleOutlined /></template>
              测试连接
            </a-button>
            <a-button style="margin-left: 8px" @click="refreshStatus">
              <template #icon><ReloadOutlined /></template>
              刷新状态
            </a-button>
          </div>
        </a-card>
      </a-col>

      <!-- 调度管理 -->
      <a-col :span="12">
        <a-card title="调度管理" class="dispatch-management">
          <!-- 调度状态 -->
          <div class="dispatch-status">
            <h4>调度状态</h4>
            <a-tag color="blue">调度中: {{ dispatchStats.activeDispatches }}</a-tag>
            <a-tag color="green">已完成: {{ dispatchStats.completedDispatches }}</a-tag>
            <a-tag color="orange">等待中: {{ dispatchStats.pendingDispatches }}</a-tag>
          </div>

          <!-- 快速调度 -->
          <div class="quick-dispatch">
            <h4>快速调度</h4>
            <a-form layout="vertical" size="small">
              <a-form-item label="调度类型">
                <a-select v-model:value="quickDispatch.type" placeholder="选择调度类型">
                  <a-select-option value="emergency">紧急调度</a-select-option>
                  <a-select-option value="routine">例行调度</a-select-option>
                  <a-select-option value="maintenance">维护调度</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="目标设备">
                <a-select v-model:value="quickDispatch.targetDevice" placeholder="选择目标设备">
                  <a-select-option value="camera-001">摄像头001</a-select-option>
                  <a-select-option value="camera-002">摄像头002</a-select-option>
                  <a-select-option value="sensor-001">传感器001</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="调度指令">
                <a-textarea v-model:value="quickDispatch.command" placeholder="输入调度指令" :rows="3" />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" icon="rocket" @click="executeDispatch">
                  执行调度
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 状态监控 -->
    <a-card title="状态监控" class="status-monitoring">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="channels" tab="通讯通道">
          <div class="table-toolbar" style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a-input-search v-model:value="channelSearchKeyword" placeholder="搜索通道名称/地址/部门" style="width: 220px" @search="handleChannelSearch" />
            <a-select v-model:value="channelTypeFilter" placeholder="类型" style="width: 120px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="SIP">SIP</a-select-option>
              <a-select-option value="RTP">RTP</a-select-option>
              <a-select-option value="WebRTC">WebRTC</a-select-option>
            </a-select>
            <a-select v-model:value="channelStatusFilter" placeholder="状态" style="width: 120px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="active">活跃</a-select-option>
              <a-select-option value="inactive">离线</a-select-option>
            </a-select>
          </div>
          <a-table :columns="channelColumns" :data-source="filteredChannels" :pagination="{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }" :locale="{ emptyText: '暂无通讯通道数据' }">
            <template #status="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '活跃' : '离线' }}
              </a-tag>
            </template>
            <template #signalStrength="{ record }">
              <a-tag :color="getSignalColor(record.signalStrength)">{{ record.signalStrength }}</a-tag>
            </template>
            
            <template #action="{ record }">
              <a-button type="link" size="small" @click="viewChannel(record)">
                <template #icon><EyeOutlined /></template>
                查看
              </a-button>
              <a-button type="link" size="small" @click="editChannel(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="testChannel(record)">
                <template #icon><PlayCircleOutlined /></template>
                测试
              </a-button>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="tasks" tab="调度任务">
          <div class="table-toolbar" style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a-input-search v-model:value="taskSearchKeyword" placeholder="搜索任务/设备/部门/执行人" style="width: 260px" @search="handleTaskSearch" />
            <a-select v-model:value="taskStatusFilter" placeholder="状态" style="width: 120px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="running">执行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="pending">等待中</a-select-option>
              <a-select-option value="failed">失败</a-select-option>
            </a-select>
            <a-select v-model:value="taskPriorityFilter" placeholder="优先级" style="width: 120px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="high">高</a-select-option>
              <a-select-option value="medium">中</a-select-option>
              <a-select-option value="low">低</a-select-option>
            </a-select>
          </div>
          <a-table :columns="taskColumns" :data-source="filteredTasks" :pagination="{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }" :locale="{ emptyText: '暂无调度任务数据' }">
            <template #status="{ record }">
              <a-tag :color="getTaskStatusColor(record.status)">
                {{ getTaskStatusText(record.status) }}
              </a-tag>
            </template>
            
            <template #priority="{ record }">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
            
            <template #progress="{ record }">
              <a-progress :percent="record.progress" size="small" :status="record.status === 'failed' ? 'exception' : (record.status === 'completed' ? 'success' : 'active')" />
            </template>
            
            <template #action="{ record }">
              <a-button type="link" size="small" @click="viewTask(record)">
                <template #icon><EyeOutlined /></template>
                查看
              </a-button>
              <a-button type="link" size="small" v-if="record.status==='failed' || record.status==='pending'" @click="retryTask(record)">
                <template #icon><ReloadOutlined /></template>
                重试
              </a-button>
              <a-button type="link" size="small" @click="stopTask(record)">
                <template #icon><StopOutlined /></template>
                停止
              </a-button>
              <a-button type="link" size="small" @click="deleteTask(record)">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="logs" tab="系统日志">
          <a-timeline>
            <a-timeline-item v-for="log in systemLogs" :key="log.id" :color="getLogColor(log.level)">
              <p>{{ log.message }}</p>
              <p class="log-time">{{ log.time }}</p>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 集成设置模态框 -->
    <a-modal
      v-model:visible="settingsModalVisible"
      title="集成设置"
      width="600px"
      @ok="saveSettings"
    >
      <a-form :model="integrationSettings" layout="vertical">
        <a-form-item label="自动重连">
          <a-switch v-model:checked="integrationSettings.autoReconnect" />
        </a-form-item>
        
        <a-form-item label="重连间隔(秒)">
          <a-input-number v-model:value="integrationSettings.reconnectInterval" :min="5" :max="300" />
        </a-form-item>
        
        <a-form-item label="心跳检测">
          <a-switch v-model:checked="integrationSettings.heartbeat" />
        </a-form-item>
        
        <a-form-item label="心跳间隔(秒)">
          <a-input-number v-model:value="integrationSettings.heartbeatInterval" :min="10" :max="600" />
        </a-form-item>
        
        <a-form-item label="日志级别">
          <a-select v-model:value="integrationSettings.logLevel">
            <a-select-option value="debug">调试</a-select-option>
            <a-select-option value="info">信息</a-select-option>
            <a-select-option value="warn">警告</a-select-option>
            <a-select-option value="error">错误</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlayCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  SettingOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  TabletOutlined,
  WifiOutlined,
  SignalFilled,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

// 筛选与搜索（通道）
const channelSearchKeyword = ref('')
const channelTypeFilter = ref('')
const channelStatusFilter = ref('')
const filteredChannels = ref([] as any[])
const handleChannelSearch = () => {
  const kw = channelSearchKeyword.value.trim()
  filteredChannels.value = communicationChannels.value.filter((c) => {
    const hitKw = !kw || c.name.includes(kw) || c.address.includes(kw) || c.department.includes(kw)
    const hitType = !channelTypeFilter.value || c.type === channelTypeFilter.value
    const hitStatus = !channelStatusFilter.value || c.status === channelStatusFilter.value
    return hitKw && hitType && hitStatus
  })
}

// 信号强度颜色
const getSignalColor = (level: string) => {
  const map: Record<string, string> = { '强': 'green', '中': 'orange', '弱': 'red' }
  return map[level] || 'default'
}

// 初始化过滤数据
filteredChannels.value = []

// 自动联动筛选（通道）
watch([channelSearchKeyword, channelTypeFilter, channelStatusFilter, communicationChannels], () => {
  handleChannelSearch()
})

// 集成统计数据
const integrationStats = reactive({
  status: '已连接',
  channels: 8,
  dispatchTasks: 15,
  responseTime: 120,
  todayDispatches: 23,
  communicationQuality: 96.8,
  onlineDevices: 45,
  successRate: 98.7
})

// 筛选与搜索（任务）
const taskSearchKeyword = ref('')
const taskStatusFilter = ref('')
const taskPriorityFilter = ref('')
const filteredTasks = ref([] as any[])
const handleTaskSearch = () => {
  const kw = taskSearchKeyword.value.trim()
  filteredTasks.value = dispatchTasks.value.filter((t) => {
    const hitKw = !kw || t.name.includes(kw) || t.targetDevice.includes(kw) || t.department.includes(kw) || t.executor.includes(kw)
    const hitStatus = !taskStatusFilter.value || t.status === taskStatusFilter.value
    const hitPriority = !taskPriorityFilter.value || t.priority === taskPriorityFilter.value
    return hitKw && hitStatus && hitPriority
  })
}

// 初始化过滤数据
filteredTasks.value = []

// 自动联动筛选（任务）
watch([taskSearchKeyword, taskStatusFilter, taskPriorityFilter, dispatchTasks], () => {
  handleTaskSearch()
})

// 集成配置
const integrationConfig = reactive({
  status: 'connected',
  protocol: 'sip',
  serverAddress: '192.168.1.100',
  port: 5060,
  authMethod: 'digest'
})

// 调度统计
const dispatchStats = reactive({
  activeDispatches: 3,
  completedDispatches: 12,
  pendingDispatches: 2
})

// 快速调度
const quickDispatch = reactive({
  type: '',
  targetDevice: '',
  command: ''
})

// 通讯通道数据
const communicationChannels = ref([
  {
    id: 1,
    name: 'SIP通道001',
    type: 'SIP',
    status: 'active',
    address: '192.168.1.101:5060',
    lastActivity: '2分钟前',
    department: '调度中心',
    deviceType: 'IP电话',
    signalStrength: '强'
  },
  {
    id: 2,
    name: 'RTP通道001',
    type: 'RTP',
    status: 'active',
    address: '192.168.1.102:8000',
    lastActivity: '5分钟前',
    department: '海事部门',
    deviceType: '视频设备',
    signalStrength: '强'
  },
  {
    id: 3,
    name: 'WebRTC通道001',
    type: 'WebRTC',
    status: 'active',
    address: '192.168.1.103:8080',
    lastActivity: '1分钟前',
    department: '港口管理',
    deviceType: '移动设备',
    signalStrength: '中'
  },
  {
    id: 4,
    name: 'SIP通道002',
    type: 'SIP',
    status: 'active',
    address: '192.168.1.104:5060',
    lastActivity: '3分钟前',
    department: '应急响应',
    deviceType: '对讲机',
    signalStrength: '强'
  },
  {
    id: 5,
    name: 'RTP通道002',
    type: 'RTP',
    status: 'inactive',
    address: '192.168.1.105:8000',
    lastActivity: '30分钟前',
    department: '安全监督',
    deviceType: '监控设备',
    signalStrength: '弱'
  },
  {
    id: 6,
    name: 'WebRTC通道002',
    type: 'WebRTC',
    status: 'active',
    address: '192.168.1.106:8080',
    lastActivity: '10分钟前',
    department: '技术保障',
    deviceType: '平板电脑',
    signalStrength: '中'
  },
  {
    id: 7,
    name: 'SIP通道003',
    type: 'SIP',
    status: 'active',
    address: '192.168.1.107:5060',
    lastActivity: '1分钟前',
    department: '船舶公司',
    deviceType: 'IP电话',
    signalStrength: '强'
  },
  {
    id: 8,
    name: 'RTP通道003',
    type: 'RTP',
    status: 'active',
    address: '192.168.1.108:8000',
    lastActivity: '5分钟前',
    department: '气象部门',
    deviceType: '传感器',
    signalStrength: '强'
  }
])

// 通讯通道表格列定义
/**
 * 通道列表列配置
 */
const channelColumns = [
  {
    title: '通道名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '状态',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    key: 'deviceType'
  },
  {
    title: '信号强度',
    dataIndex: 'signalStrength',
    key: 'signalStrength',
    slots: { customRender: 'signalStrength' }
  },
  {
    title: '最后活动',
    dataIndex: 'lastActivity',
    key: 'lastActivity'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 调度任务数据
/**
 * 调度任务数据（替换更真实中文姓名为执行人）
 */
const dispatchTasks = ref([
  {
    id: 1,
    name: '摄像头001应急调度任务',
    type: 'emergency',
    targetDevice: 'camera-001',
    status: 'running',
    priority: 'high',
    startTime: '2025-08-20 09:00:00',
    progress: 75,
    department: '调度中心',
    executor: '陈志强',
    estimatedTime: '15分钟'
  },
  {
    id: 2,
    name: '传感器001例行调度任务',
    type: 'routine',
    targetDevice: 'sensor-001',
    status: 'completed',
    priority: 'medium',
    startTime: '2025-08-20 08:30:00',
    progress: 100,
    department: '技术保障',
    executor: '刘建国',
    estimatedTime: '30分钟'
  },
  {
    id: 3,
    name: '对讲机002通讯调度任务',
    type: 'coordination',
    targetDevice: 'radio-002',
    status: 'running',
    priority: 'high',
    startTime: '2025-08-20 10:00:00',
    progress: 45,
    department: '应急响应',
    executor: '王海峰',
    estimatedTime: '20分钟'
  },
  {
    id: 4,
    name: 'IP电话003调度任务',
    type: 'routine',
    targetDevice: 'phone-003',
    status: 'pending',
    priority: 'medium',
    startTime: '2025-08-20 11:00:00',
    progress: 0,
    department: '港口管理',
    executor: '赵明华',
    estimatedTime: '25分钟'
  },
  {
    id: 5,
    name: '视频设备004调度任务',
    type: 'emergency',
    targetDevice: 'video-004',
    status: 'completed',
    priority: 'high',
    startTime: '2025-08-20 07:00:00',
    progress: 100,
    department: '安全监督',
    executor: '钱伟民',
    estimatedTime: '40分钟'
  },
  {
    id: 6,
    name: '移动设备005调度任务',
    type: 'routine',
    targetDevice: 'mobile-005',
    status: 'running',
    priority: 'low',
    startTime: '2025-08-20 09:30:00',
    progress: 60,
    department: '技术保障',
    executor: '孙志刚',
    estimatedTime: '35分钟'
  }
])

// 调度任务表格列定义
/**
 * 调度任务列表列配置
 */
const taskColumns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '目标设备',
    dataIndex: 'targetDevice',
    key: 'targetDevice'
  },
  {
    title: '状态',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '优先级',
    key: 'priority',
    slots: { customRender: 'priority' }
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime'
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '执行人',
    dataIndex: 'executor',
    key: 'executor'
  },
  {
    title: '预计耗时',
    dataIndex: 'estimatedTime',
    key: 'estimatedTime'
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    slots: { customRender: 'progress' }
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 系统日志数据
const systemLogs = ref([
  {
    id: 1,
    level: 'info',
    message: '通讯通道SIP通道001连接成功',
    time: '2分钟前'
  },
  {
    id: 2,
    level: 'warn',
    message: 'WebRTC通道001连接超时，尝试重连',
    time: '5分钟前'
  },
  {
    id: 3,
    level: 'error',
    message: '调度任务执行失败：目标设备无响应',
    time: '10分钟前'
  }
])

// 集成设置
const integrationSettings = reactive({
  autoReconnect: true,
  reconnectInterval: 30,
  heartbeat: true,
  heartbeatInterval: 60,
  logLevel: 'info'
})

// 当前激活的标签页
const activeTab = ref('channels')

// 模态框显示状态
const settingsModalVisible = ref(false)

// 切换连接状态
const toggleConnection = () => {
  if (integrationConfig.status === 'connected') {
    integrationConfig.status = 'disconnected'
    message.success('已断开连接')
  } else {
    integrationConfig.status = 'connected'
    message.success('已建立连接')
  }
}

// 测试连接
const testConnection = () => {
  message.info('正在测试连接...')
  setTimeout(() => {
    message.success('连接测试成功')
  }, 2000)
}

// 刷新状态
const refreshStatus = () => {
  message.info('正在刷新状态...')
  setTimeout(() => {
    message.success('状态已刷新')
  }, 1000)
}

// 执行调度
const executeDispatch = () => {
  if (!quickDispatch.type || !quickDispatch.targetDevice || !quickDispatch.command) {
    message.warning('请填写完整的调度信息')
    return
  }
  message.success('调度任务已提交')
  // 重置表单
  Object.assign(quickDispatch, {
    type: '',
    targetDevice: '',
    command: ''
  })
}

// 获取任务状态颜色
const getTaskStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    running: 'blue',
    completed: 'green',
    pending: 'orange',
    failed: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取任务状态文本
const getTaskStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    running: '执行中',
    completed: '已完成',
    pending: '等待中',
    failed: '失败'
  }
  return textMap[status] || status
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap: { [key: string]: string } = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colorMap[priority] || 'default'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: { [key: string]: string } = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || priority
}

// 获取日志颜色
const getLogColor = (level: string) => {
  const colorMap: { [key: string]: string } = {
    info: 'blue',
    warn: 'orange',
    error: 'red',
    debug: 'green'
  }
  return colorMap[level] || 'blue'
}

// 查看通道
const viewChannel = (channel: any) => {
  message.info(`查看通道: ${channel.name}`)
}

// 编辑通道
const editChannel = (channel: any) => {
  message.info(`编辑通道: ${channel.name}`)
}

// 测试通道
const testChannel = (channel: any) => {
  message.info(`测试通道: ${channel.name}`)
}

// 查看任务
const viewTask = (task: any) => {
  message.info(`查看任务: ${task.name}`)
}

// 停止任务
const stopTask = (task: any) => {
  message.success(`停止任务: ${task.name}`)
}

// 删除任务
const deleteTask = (task: any) => {
  message.success(`删除任务: ${task.name}`)
}

// 重试任务（失败/等待）并模拟进度
const retryTask = (task: any) => {
  if (task.status === 'running') return
  task.status = 'running'
  task.progress = Math.min(task.progress || 0, 95)
  message.info(`任务重试中: ${task.name}`)
  const step = () => {
    if (task.status !== 'running') return
    task.progress = Math.min(100, (task.progress || 0) + Math.floor(Math.random() * 10) + 5)
    if (task.progress >= 100) {
      task.status = 'completed'
      message.success(`任务完成: ${task.name}`)
      return
    }
    setTimeout(step, 800)
  }
  setTimeout(step, 800)
}

// 保存集成设置
const saveSettings = () => {
  message.success('集成设置已保存')
  settingsModalVisible.value = false
}

// 组件挂载后的初始化
onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    integrationStats.responseTime = Math.floor(Math.random() * 100) + 80
    integrationStats.channels = Math.floor(Math.random() * 5) + 6
  }, 8000)

  // 初始化过滤结果为全量
  filteredChannels.value = communicationChannels.value.slice()
  filteredTasks.value = dispatchTasks.value.slice()
})
</script>

<style lang="less" scoped>
.communication-integration {
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

  .integration-overview {
    margin-bottom: 24px;
  }

  .integration-management {
    margin-bottom: 24px;
  }

  .communication-config {
    .integration-status {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .ant-tag {
        font-size: 16px;
        padding: 8px 16px;
      }
    }

    .protocol-config {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .ant-form-item {
        margin-bottom: 16px;
      }
    }

    .connection-test {
      .ant-btn {
        margin-right: 8px;
      }
    }
  }

  .dispatch-management {
    .dispatch-status {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .ant-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }

    .quick-dispatch {
      h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .ant-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .status-monitoring {
    .ant-table {
      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
      }
    }

    .log-time {
      color: #999;
      font-size: 12px;
      margin-top: 4px;
    }
  }
}
</style>

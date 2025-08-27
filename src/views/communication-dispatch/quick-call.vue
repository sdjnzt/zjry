<template>
  <div class="quick-call">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>一键呼叫/群呼</h1>
      <p>支持快速呼叫单个设备或群组，提供高效的通讯调度服务</p>
    </div>

    <!-- 呼叫状态概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="在线设备"
            :value="statusData.onlineDevices"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="呼叫中"
            :value="statusData.activeCalls"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="等待接听"
            :value="statusData.waitingCalls"
            :value-style="{ color: '#fa8c16' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日呼叫"
            :value="statusData.todayCalls"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" class="status-overview" style="margin-top: 16px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总呼叫时长"
            :value="statusData.totalCallDuration"
            :value-style="{ color: '#eb2f96' }"
          >
            <template #suffix>小时</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均响应时间"
            :value="statusData.avgResponseTime"
            :value-style="{ color: '#13c2c2' }"
          >
            <template #suffix>秒</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="接通率"
            :value="statusData.answerRate"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#f5222d' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="16" class="main-content">
      <!-- 快速呼叫面板 -->
      <a-col :span="12">
        <a-card title="快速呼叫面板" class="call-panel">
          <a-form layout="vertical">
            <a-form-item label="呼叫类型">
              <a-radio-group v-model:value="callData.callType" button-style="solid">
                <a-radio-button value="single">单呼</a-radio-button>
                <a-radio-button value="group">群呼</a-radio-button>
                <a-radio-button value="broadcast">广播</a-radio-button>
              </a-radio-group>
            </a-form-item>
            
            <a-form-item label="选择设备" v-if="callData.callType === 'single'">
              <a-select
                v-model:value="callData.selectedDevice"
                placeholder="选择要呼叫的设备"
                show-search
                :filter-option="filterDevices"
              >
                <a-select-option
                  v-for="device in availableDevices"
                  :key="device.id"
                  :value="device.id"
                >
                  {{ device.name }} ({{ device.status }})
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="选择群组" v-if="callData.callType === 'group'">
              <a-select
                v-model:value="callData.selectedGroup"
                placeholder="选择要呼叫的群组"
                show-search
                :filter-option="filterGroups"
              >
                <a-select-option
                  v-for="group in availableGroups"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.name }} ({{ group.deviceCount }}台设备)
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="呼叫优先级">
              <a-select v-model:value="callData.priority" placeholder="选择呼叫优先级">
                <a-select-option value="low">低优先级</a-select-option>
                <a-select-option value="normal">普通优先级</a-select-option>
                <a-select-option value="high">高优先级</a-select-option>
                <a-select-option value="emergency">紧急优先级</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="备注信息">
              <a-textarea
                v-model:value="callData.remark"
                placeholder="输入呼叫备注信息"
                :rows="3"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" @click="startCall" :loading="calling">
                  <template #icon><PhoneOutlined /></template>
                  开始呼叫
                </a-button>
                <a-button @click="resetCallForm">
                  <template #icon><SettingOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 呼叫控制 -->
      <a-col :span="12">
        <a-card title="呼叫控制" class="call-control">
          <div class="call-status">
            <div class="status-indicator" :class="callStatus.status">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusText(callStatus.status) }}</span>
            </div>
          </div>

          <div class="call-info" v-if="callStatus.status !== 'idle'">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="呼叫目标">
                {{ callStatus.targetName }}
              </a-descriptions-item>
              <a-descriptions-item label="呼叫类型">
                {{ getCallTypeText(callStatus.callType) }}
              </a-descriptions-item>
              <a-descriptions-item label="开始时间">
                {{ callStatus.startTime }}
              </a-descriptions-item>
              <a-descriptions-item label="持续时间">
                {{ callStatus.duration }}
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <div class="control-buttons">
            <a-space direction="vertical" style="width: 100%">
              <a-button
                type="primary"
                size="large"
                block
                @click="answerCall"
                v-if="callStatus.status === 'incoming'"
              >
                接听
              </a-button>
              <a-button
                type="default"
                size="large"
                block
                @click="rejectCall"
                v-if="callStatus.status === 'incoming'"
              >
                拒接
              </a-button>
              <a-button
                type="danger"
                size="large"
                block
                @click="endCall"
                v-if="['active', 'outgoing'].includes(callStatus.status)"
              >
                结束通话
              </a-button>
              <a-button
                type="default"
                size="large"
                block
                @click="holdCall"
                v-if="callStatus.status === 'active'"
              >
                保持通话
              </a-button>
              <a-button
                type="default"
                size="large"
                block
                @click="transferCall"
                v-if="callStatus.status === 'active'"
              >
                转接
              </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 呼叫记录 -->
    <a-card title="呼叫记录" class="call-records">
      <div class="table-operations">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索呼叫记录"
            style="width: 200px"
            @search="onSearch"
          />
          <a-range-picker v-model:value="dateRange" />
          <a-select
            v-model:value="statusFilter"
            placeholder="状态筛选"
            style="width: 120px"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="missed">未接</a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshRecords">刷新</a-button>
        </a-space>
      </div>
      
      <a-table
        :columns="recordColumns"
        :data-source="callRecords"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getRecordStatusColor(record.status)">
              {{ getRecordStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetails(record)">
                <template #icon><EyeOutlined /></template>
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="replayCall(record)">
                <template #icon><VideoCameraOutlined /></template>
                回放
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情查看模态框 -->
    <a-modal
      v-model:open="detailsModalVisible"
      title="呼叫记录详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="呼叫ID">{{ selectedRecord?.id }}</a-descriptions-item>
        <a-descriptions-item label="呼叫类型">{{ getCallTypeText(selectedRecord?.callType || '') }}</a-descriptions-item>
        <a-descriptions-item label="目标设备">{{ selectedRecord?.targetName }}</a-descriptions-item>
        <a-descriptions-item label="呼叫状态">{{ getRecordStatusText(selectedRecord?.status || '') }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ getPriorityText(selectedRecord?.priority || '') }}</a-descriptions-item>
        <a-descriptions-item label="负责部门">{{ selectedRecord?.department || '无' }}</a-descriptions-item>
        <a-descriptions-item label="操作员">{{ selectedRecord?.operator || '无' }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ selectedRecord?.startTime }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ selectedRecord?.endTime }}</a-descriptions-item>
        <a-descriptions-item label="通话时长">{{ selectedRecord?.duration }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedRecord?.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SettingOutlined,
  EyeOutlined,
  DownloadOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

/**
 * 呼叫状态数据
 */
const statusData = reactive({
  onlineDevices: 1247,
  activeCalls: 23,
  waitingCalls: 8,
  todayCalls: 156,
  totalCallDuration: 234.5,
  avgResponseTime: 2.8,
  answerRate: 97.2,
  successRate: 99.1
})

/**
 * 呼叫数据
 */
const callData = reactive({
  callType: 'single',
  selectedDevice: '',
  selectedGroup: '',
  priority: 'normal',
  remark: ''
})

/**
 * 呼叫状态
 */
const callStatus = reactive({
  status: 'idle', // idle, incoming, outgoing, active, ended
  targetName: '',
  callType: '',
  startTime: '',
  duration: '00:00'
})

/**
 * 可用设备列表
 */
/** 可用设备列表（名称/负责人更新为更真实中文） */
const availableDevices = ref([
  { 
    id: 'DEV001', 
    name: '长江集装箱一号·甲板摄像头', 
    status: '在线',
    type: '监控设备',
    department: '船舶监控部',
    operator: '陈志强',
    signalStrength: 95,
    lastActivity: '2025-08-15 14:30:00'
  },
  { 
    id: 'DEV002', 
    name: '海巡三号·卫星电话', 
    status: '在线',
    type: '通讯设备',
    department: '船舶通讯部',
    operator: '刘建国',
    signalStrength: 88,
    lastActivity: '2025-08-15 14:25:00'
  },
  { 
    id: 'DEV003', 
    name: '航标站·数据采集终端', 
    status: '在线',
    type: '数据设备',
    department: '船舶数据部',
    operator: '王海峰',
    signalStrength: 92,
    lastActivity: '2025-08-15 14:28:00'
  },
  { 
    id: 'DEV004', 
    name: '港区闸口·高清云台摄像机', 
    status: '离线',
    type: '监控设备',
    department: '船舶监控部',
    operator: '赵明华',
    signalStrength: 0,
    lastActivity: '2025-08-15 14:15:00'
  },
  { 
    id: 'DEV005', 
    name: '应急指挥车·集群对讲终端', 
    status: '在线',
    type: '通讯设备',
    department: '船舶通讯部',
    operator: '钱伟民',
    signalStrength: 85,
    lastActivity: '2025-08-15 14:32:00'
  },
  { 
    id: 'DEV006', 
    name: '拖轮·移动视频终端', 
    status: '在线',
    type: '监控设备',
    department: '船舶监控部',
    operator: '孙志刚',
    signalStrength: 90,
    lastActivity: '2025-08-15 14:26:00'
  },
  { 
    id: 'DEV007', 
    name: '危化品堆场·安检采集器', 
    status: '在线',
    type: '数据设备',
    department: '船舶数据部',
    operator: '周建军',
    signalStrength: 87,
    lastActivity: '2025-08-15 14:29:00'
  },
  { 
    id: 'DEV008', 
    name: '沿江站点·气象监测主机', 
    status: '离线',
    type: '通讯设备',
    department: '船舶通讯部',
    operator: '吴建华',
    signalStrength: 0,
    lastActivity: '2025-08-15 14:18:00'
  },
  { 
    id: 'DEV009', 
    name: '港池·岸边固定摄像头', 
    status: '在线',
    type: '监控设备',
    department: '船舶监控部',
    operator: '高鹏飞',
    signalStrength: 93,
    lastActivity: '2025-08-15 14:31:00'
  },
  { 
    id: 'DEV010', 
    name: '航道·雷达数据终端', 
    status: '在线',
    type: '数据设备',
    department: '船舶数据部',
    operator: '林倩',
    signalStrength: 89,
    lastActivity: '2025-08-15 14:27:00'
  },
  { 
    id: 'DEV011', 
    name: '信号塔·微波链路', 
    status: '在线',
    type: '通讯设备',
    department: '船舶通讯部',
    operator: '何志远',
    signalStrength: 91,
    lastActivity: '2025-08-15 14:33:00'
  },
  { 
    id: 'DEV012', 
    name: '锚地·球机', 
    status: '离线',
    type: '监控设备',
    department: '船舶监控部',
    operator: '李岚',
    signalStrength: 0,
    lastActivity: '2025-08-15 14:12:00'
  }
])

/**
 * 可用群组列表
 */
const availableGroups = ref([
  { 
    id: 'GRP001', 
    name: '监控设备群组', 
    deviceCount: 12,
    department: '船舶监控部',
    description: '所有船舶监控设备的统一管理群组',
    status: 'active'
  },
  { 
    id: 'GRP002', 
    name: '通讯设备群组', 
    deviceCount: 8,
    department: '船舶通讯部',
    description: '船舶通讯设备的统一管理群组',
    status: 'active'
  },
  { 
    id: 'GRP003', 
    name: '数据设备群组', 
    deviceCount: 15,
    department: '船舶数据部',
    description: '船舶数据采集设备的统一管理群组',
    status: 'active'
  },
  { 
    id: 'GRP004', 
    name: '紧急通讯群组', 
    deviceCount: 6,
    department: '应急响应部',
    description: '紧急情况下的快速通讯群组',
    status: 'active'
  },
  { 
    id: 'GRP005', 
    name: '日常维护群组', 
    deviceCount: 10,
    department: '设备维护部',
    description: '日常设备维护和检查群组',
    status: 'active'
  },
  { 
    id: 'GRP006', 
    name: '数据分析群组', 
    deviceCount: 8,
    department: '数据分析部',
    description: '数据分析和处理设备群组',
    status: 'active'
  },
  { 
    id: 'GRP007', 
    name: '安全监控群组', 
    deviceCount: 18,
    department: '安全监控部',
    description: '船舶安全监控设备群组',
    status: 'active'
  },
  { 
    id: 'GRP008', 
    name: '通讯调度群组', 
    deviceCount: 22,
    department: '通讯调度部',
    description: '通讯调度设备统一管理群组',
    status: 'active'
  }
])

/**
 * 搜索和筛选
 */
const searchText = ref('')
const dateRange = ref([])
const statusFilter = ref('')
const loading = ref(false)
const calling = ref(false)

/**
 * 呼叫记录类型定义
 */
interface CallRecord {
  id: string
  callType: string
  targetName: string
  status: string
  priority: string
  department?: string
  operator?: string
  startTime: string
  endTime: string
  duration: string
  remark?: string
}

/**
 * 呼叫记录数据
 */
const callRecords = ref<CallRecord[]>([
  {
    id: 'CALL001',
    callType: 'single',
    targetName: '长江集装箱一号·甲板摄像头',
    status: 'success',
    priority: 'high',
    startTime: '2025-08-15 10:30:00',
    endTime: '2025-08-15 10:45:00',
    duration: '15分钟',
    remark: '紧急情况通报',
    department: '船舶监控部',
    operator: '陈志强'
  },
  {
    id: 'CALL002',
    callType: 'group',
    targetName: '监控设备群组',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 09:15:00',
    endTime: '2025-08-15 09:25:00',
    duration: '10分钟',
    remark: '日常会议',
    department: '船舶监控部',
    operator: '刘建国'
  },
  {
    id: 'CALL003',
    callType: 'single',
    targetName: '航标站·数据采集终端',
    status: 'failed',
    priority: 'low',
    startTime: '2025-08-15 08:00:00',
    endTime: '2025-08-15 08:05:00',
    duration: '5分钟',
    remark: '设备离线',
    department: '船舶数据部',
    operator: '王海峰'
  },
  {
    id: 'CALL004',
    callType: 'single',
    targetName: '应急指挥车·集群对讲终端',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 14:20:00',
    endTime: '2025-08-15 14:35:00',
    duration: '15分钟',
    remark: '航线确认',
    department: '船舶通讯部',
    operator: '钱伟民'
  },
  {
    id: 'CALL005',
    callType: 'group',
    targetName: '紧急通讯群组',
    status: 'success',
    priority: 'emergency',
    startTime: '2025-08-15 13:45:00',
    endTime: '2025-08-15 14:00:00',
    duration: '15分钟',
    remark: '紧急救援协调',
    department: '应急响应部',
    operator: '赵明华'
  },
  {
    id: 'CALL006',
    callType: 'single',
    targetName: '拖轮·移动视频终端',
    status: 'success',
    priority: 'high',
    startTime: '2025-08-15 12:30:00',
    endTime: '2025-08-15 12:45:00',
    duration: '15分钟',
    remark: '设备状态检查',
    department: '船舶监控部',
    operator: '孙志刚'
  },
  {
    id: 'CALL007',
    callType: 'broadcast',
    targetName: '所有监控设备',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 11:00:00',
    endTime: '2025-08-15 11:05:00',
    duration: '5分钟',
    remark: '系统维护通知',
    department: '系统管理部',
    operator: '周建军'
  },
  {
    id: 'CALL008',
    callType: 'single',
    targetName: '危化品堆场·安检采集器',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 10:00:00',
    endTime: '2025-08-15 10:15:00',
    duration: '15分钟',
    remark: '数据同步确认',
    department: '船舶数据部',
    operator: '吴建华'
  },
  {
    id: 'CALL009',
    callType: 'group',
    targetName: '安全监控群组',
    status: 'success',
    priority: 'high',
    startTime: '2025-08-15 09:30:00',
    endTime: '2025-08-15 09:45:00',
    duration: '15分钟',
    remark: '安全巡检通知',
    department: '安全监控部',
    operator: '高鹏飞'
  },
  {
    id: 'CALL010',
    callType: 'single',
    targetName: '港池·岸边固定摄像头',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 08:30:00',
    endTime: '2025-08-15 08:45:00',
    duration: '15分钟',
    remark: '设备状态检查',
    department: '船舶监控部',
    operator: '林倩'
  },
  {
    id: 'CALL011',
    callType: 'broadcast',
    targetName: '所有通讯设备',
    status: 'success',
    priority: 'normal',
    startTime: '2025-08-15 07:45:00',
    endTime: '2025-08-15 07:50:00',
    duration: '5分钟',
    remark: '系统升级通知',
    department: '系统管理部',
    operator: '何志远'
  },
  {
    id: 'CALL012',
    callType: 'single',
    targetName: '航道·雷达数据终端',
    status: 'failed',
    priority: 'low',
    startTime: '2025-08-15 06:00:00',
    endTime: '2025-08-15 06:05:00',
    duration: '5分钟',
    remark: '设备离线',
    department: '船舶数据部',
    operator: '李岚'
  }
])

/**
 * 表格列定义
 */
const recordColumns = [
  {
    title: '呼叫ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '呼叫类型',
    dataIndex: 'callType',
    key: 'callType',
    customRender: ({ text }: { text: string }) => getCallTypeText(text)
  },
  {
    title: '目标设备',
    dataIndex: 'targetName',
    key: 'targetName'
  },
  {
    title: '呼叫状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority'
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '操作员',
    dataIndex: 'operator',
    key: 'operator'
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime'
  },
  {
    title: '通话时长',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

/**
 * 模态框控制
 */
const detailsModalVisible = ref(false)
const selectedRecord = ref<CallRecord | null>(null)

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: '空闲',
    incoming: '来电',
    outgoing: '呼出中',
    active: '通话中',
    ended: '已结束'
  }
  return statusMap[status] || status
}

/**
 * 获取呼叫类型文本
 */
const getCallTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    single: '单呼',
    group: '群呼',
    broadcast: '广播'
  }
  return typeMap[type] || type
}

/**
 * 获取记录状态颜色
 */
const getRecordStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    missed: 'orange'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取记录状态文本
 */
const getRecordStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    missed: '未接'
  }
  return textMap[status] || status
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'blue',
    normal: 'green',
    high: 'orange',
    emergency: 'red'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    low: '低',
    normal: '普通',
    high: '高',
    emergency: '紧急'
  }
  return textMap[priority] || priority
}

/**
 * 过滤设备
 */
const filterDevices = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 过滤群组
 */
const filterGroups = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 开始呼叫
 */
const startCall = () => {
  if (callData.callType === 'single' && !callData.selectedDevice) {
    message.error('请选择要呼叫的设备')
    return
  }
  if (callData.callType === 'group' && !callData.selectedGroup) {
    message.error('请选择要呼叫的群组')
    return
  }

  calling.value = true
  setTimeout(() => {
    calling.value = false
    callStatus.status = 'outgoing'
    callStatus.targetName = callData.callType === 'single' 
      ? availableDevices.value.find(d => d.id === callData.selectedDevice)?.name || ''
      : availableGroups.value.find(g => g.id === callData.selectedGroup)?.name || ''
    callStatus.callType = callData.callType
    callStatus.startTime = new Date().toLocaleString()
    
    message.success('呼叫已发起')
  }, 1000)
}

/**
 * 重置呼叫表单
 */
const resetCallForm = () => {
  Object.assign(callData, {
    callType: 'single',
    selectedDevice: '',
    selectedGroup: '',
    priority: 'normal',
    remark: ''
  })
}

/**
 * 接听电话
 */
const answerCall = () => {
  callStatus.status = 'active'
  message.success('通话已接通')
}

/**
 * 拒接电话
 */
const rejectCall = () => {
  callStatus.status = 'idle'
  message.info('通话已拒接')
}

/**
 * 结束通话
 */
const endCall = () => {
  callStatus.status = 'ended'
  message.info('通话已结束')
}

/**
 * 保持通话
 */
const holdCall = () => {
  message.info('通话已保持')
}

/**
 * 转接通话
 */
const transferCall = () => {
  message.info('通话转接功能')
}

/**
 * 搜索记录
 */
const onSearch = (value: string) => {
  console.log('搜索:', value)
  message.info(`搜索关键词: ${value}`)
}

/**
 * 刷新记录
 */
const refreshRecords = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('记录已刷新')
  }, 1000)
}

/**
 * 查看详情
 */
const viewDetails = (record: any) => {
  selectedRecord.value = record
  detailsModalVisible.value = true
}

/**
 * 回放呼叫
 */
const replayCall = (record: any) => {
  message.info(`开始回放呼叫记录: ${record.id}`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('一键呼叫/群呼页面已加载')
})
</script>

<style lang="less" scoped>
.quick-call {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    
    h1 {
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

  .status-overview {
    margin-bottom: 24px;
  }

  .main-content {
    margin-bottom: 24px;

    .call-panel {
      height: 100%;
    }

    .call-control {
      height: 100%;

      .call-status {
        margin-bottom: 20px;
        text-align: center;

        .status-indicator {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          border-radius: 8px;
          background-color: #f5f5f5;

          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
          }

          .status-text {
            font-size: 16px;
            font-weight: 500;
          }

          &.idle {
            background-color: #f0f0f0;
            .status-dot { background-color: #d9d9d9; }
          }

          &.incoming {
            background-color: #fff2e8;
            .status-dot { background-color: #fa8c16; }
          }

          &.outgoing {
            background-color: #e6f7ff;
            .status-dot { background-color: #1890ff; }
          }

          &.active {
            background-color: #f6ffed;
            .status-dot { background-color: #52c41a; }
          }

          &.ended {
            background-color: #fff1f0;
            .status-dot { background-color: #ff4d4f; }
          }
        }
      }

      .call-info {
        margin-bottom: 20px;
        padding: 16px;
        background-color: #fafafa;
        border-radius: 6px;
      }

      .control-buttons {
        .ant-space {
          width: 100%;
        }
      }
    }
  }

  .call-records {
    .table-operations {
      margin-bottom: 16px;
    }
  }

  .overview-card {
    text-align: center;
    
    .ant-statistic-title {
      color: #8c8c8c;
      font-size: 14px;
    }
    
    .ant-statistic-content {
      .ant-statistic-content-value {
        font-weight: 600;
      }
    }
  }

  .call-panel {
    .ant-form-item-label > label {
      font-weight: 500;
      color: #262626;
    }
  }

  .call-control {
    .call-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          color: #8c8c8c;
          font-size: 14px;
        }
        
        .value {
          color: #262626;
          font-weight: 500;
        }
      }
    }
  }

  .table-operations {
    .ant-space {
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .status-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
    
    .main-content {
      .ant-col {
        margin-bottom: 16px;
      }
    }
    
    .table-operations {
      .ant-space {
        flex-direction: column;
        align-items: stretch;
        
        .ant-input-search,
        .ant-select,
        .ant-range-picker {
          width: 100% !important;
        }
      }
    }
  }
}
</style>

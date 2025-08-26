<template>
  <div class="communication-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>通讯记录</h1>
      <p>管理所有通讯活动的记录，支持搜索、筛选和统计分析</p>
    </div>

    <!-- 记录统计概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日通讯"
            :value="statusData.todayCommunications"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功通讯"
            :value="statusData.successCommunications"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="失败通讯"
            :value="statusData.failedCommunications"
            :value-style="{ color: '#fa8c16' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总通讯时长"
            :value="statusData.totalDuration"
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>小时</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 更多统计概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均通讯时长"
            :value="statusData.avgDuration"
            :value-style="{ color: '#13c2c2' }"
          >
            <template #suffix>分钟</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="通讯成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均延迟"
            :value="statusData.avgLatency"
            :value-style="{ color: '#eb2f96' }"
          >
            <template #suffix>ms</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="活跃设备数"
            :value="statusData.activeDevices"
            :value-style="{ color: '#fa541c' }"
          >
            <template #suffix>台</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索和筛选区域 -->
    <a-card title="搜索筛选" class="search-filter">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="通讯类型">
          <a-select
            v-model:value="searchForm.communicationType"
            placeholder="选择通讯类型"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="voice">语音通话</a-select-option>
            <a-select-option value="video">视频通话</a-select-option>
            <a-select-option value="data">数据传输</a-select-option>
            <a-select-option value="broadcast">广播</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="通讯状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="选择通讯状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="missed">未接</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="设备名称">
          <a-input
            v-model:value="searchForm.deviceName"
            placeholder="输入设备名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="searchForm.timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="['开始时间', '结束时间']"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 通讯记录列表 -->
    <a-card title="通讯记录" class="records-list">
      <div class="table-operations">
        <a-space>
          <a-button type="primary" @click="refreshRecords">刷新</a-button>
          <a-button @click="batchDelete" :disabled="!hasSelected">批量删除</a-button>
          <span v-if="hasSelected">已选择 {{ selectedRowKeys.length }} 项</span>
        </a-space>
      </div>
      
      <a-table
        :columns="recordColumns"
        :data-source="communicationRecords"
        :pagination="{ pageSize: 15, showSizeChanger: true, showQuickJumper: true }"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'duration'">
            <span>{{ formatDuration(record.duration) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetails(record)">
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="replayRecord(record)">
                回放
              </a-button>
              <a-button type="link" size="small" @click="editRecord(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这条记录吗？"
                @confirm="deleteRecord(record)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 统计分析 -->
    <a-card title="统计分析" class="statistics-analysis">
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="chart-container">
            <div class="chart-title">通讯类型分布</div>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="typeDistributionChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
        
        <a-col :span="12">
          <div class="chart-container">
            <div class="chart-title">通讯状态统计</div>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="statusDistributionChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
      </a-row>
      
      <a-row :gutter="16" style="margin-top: 24px;">
        <a-col :span="24">
          <div class="chart-container">
            <div class="chart-title">通讯时长趋势</div>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="durationTrendChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 详情查看模态框 -->
    <a-modal
      v-model:open="detailsModalVisible"
      title="通讯记录详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="通讯ID">{{ selectedRecord.id }}</a-descriptions-item>
        <a-descriptions-item label="通讯名称">{{ selectedRecord.name }}</a-descriptions-item>
        <a-descriptions-item label="通讯类型">{{ getTypeText(selectedRecord.type) }}</a-descriptions-item>
        <a-descriptions-item label="通讯状态">{{ getStatusText(selectedRecord.status) }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ getPriorityText(selectedRecord.priority) }}</a-descriptions-item>
        <a-descriptions-item label="发起设备">{{ selectedRecord.initiator }}</a-descriptions-item>
        <a-descriptions-item label="目标设备">{{ selectedRecord.target }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ selectedRecord.startTime }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ selectedRecord.endTime }}</a-descriptions-item>
        <a-descriptions-item label="通讯时长">{{ formatDuration(selectedRecord.duration) }}</a-descriptions-item>
        <a-descriptions-item label="信号强度">{{ selectedRecord.signalStrength }}%</a-descriptions-item>
        <a-descriptions-item label="延迟">{{ selectedRecord.latency }}ms</a-descriptions-item>
        <a-descriptions-item label="丢包率">{{ selectedRecord.packetLoss }}%</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedRecord.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'

/**
 * 通讯状态数据
 */
const statusData = reactive({
  todayCommunications: 456,
  successCommunications: 432,
  failedCommunications: 24,
  totalDuration: 234.7,
  avgDuration: 18.5,
  successRate: 94.7,
  avgLatency: 28,
  activeDevices: 89
})

/**
 * 搜索表单数据
 */
const searchForm = reactive({
  communicationType: '',
  status: '',
  deviceName: '',
  timeRange: []
})

/**
 * 搜索和筛选
 */
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])

/**
 * 通讯记录数据
 */
const communicationRecords = ref([
  {
    id: 'COM001',
    name: '紧急情况通报',
    type: 'voice',
    status: 'success',
    priority: 'high',
    initiator: '船舶A-监控设备',
    target: '通讯中心',
    startTime: '2025-08-26 10:30:00',
    endTime: '2025-08-26 10:45:00',
    duration: 900, // 秒
    signalStrength: 90,
    latency: 35,
    packetLoss: 0.1,
    remark: '紧急情况处理'
  },
  {
    id: 'COM002',
    name: '日常会议通讯',
    type: 'video',
    status: 'success',
    priority: 'normal',
    initiator: '船舶B-通讯设备',
    target: '会议中心',
    startTime: '2025-08-26 09:15:00',
    endTime: '2025-08-26 09:45:00',
    duration: 1800,
    signalStrength: 85,
    latency: 42,
    packetLoss: 0.3,
    remark: '日常工作安排'
  },
  {
    id: 'COM003',
    name: '数据传输任务',
    type: 'data',
    status: 'failed',
    priority: 'low',
    initiator: '船舶C-数据设备',
    target: '数据中心',
    startTime: '2025-08-26 08:00:00',
    endTime: '2025-08-26 08:05:00',
    duration: 300,
    signalStrength: 45,
    latency: 120,
    packetLoss: 5.2,
    remark: '网络不稳定'
  },
  {
    id: 'COM004',
    name: '安全广播通知',
    type: 'broadcast',
    status: 'success',
    priority: 'important',
    initiator: '广播中心',
    target: '全部区域',
    startTime: '2025-08-26 07:30:00',
    endTime: '2025-08-26 07:35:00',
    duration: 300,
    signalStrength: 95,
    latency: 25,
    packetLoss: 0.0,
    remark: '安全提醒'
  },
  {
    id: 'COM005',
    name: '设备状态检查',
    type: 'voice',
    status: 'success',
    priority: 'normal',
    initiator: '船舶D-监控设备',
    target: '监控中心',
    startTime: '2025-08-26 06:45:00',
    endTime: '2025-08-26 07:00:00',
    duration: 900,
    signalStrength: 88,
    latency: 38,
    packetLoss: 0.2,
    remark: '例行检查'
  },
  {
    id: 'COM006',
    name: '数据传输同步',
    type: 'data',
    status: 'success',
    priority: 'normal',
    initiator: '船舶E-数据设备',
    target: '数据中心',
    startTime: '2025-08-26 06:00:00',
    endTime: '2025-08-26 06:15:00',
    duration: 900,
    signalStrength: 92,
    latency: 32,
    packetLoss: 0.1,
    remark: '数据同步'
  },
  {
    id: 'COM007',
    name: '紧急救援协调',
    type: 'video',
    status: 'success',
    priority: 'urgent',
    initiator: '救援中心',
    target: '船舶F-通讯设备',
    startTime: '2025-08-26 05:30:00',
    endTime: '2025-08-26 05:45:00',
    duration: 900,
    signalStrength: 96,
    latency: 28,
    packetLoss: 0.0,
    remark: '紧急救援'
  },
  {
    id: 'COM008',
    name: '航线规划会议',
    type: 'video',
    status: 'success',
    priority: 'high',
    initiator: '船舶G-通讯设备',
    target: '调度中心',
    startTime: '2025-08-26 05:00:00',
    endTime: '2025-08-26 05:30:00',
    duration: 1800,
    signalStrength: 89,
    latency: 35,
    packetLoss: 0.3,
    remark: '航线规划'
  },
  {
    id: 'COM009',
    name: '设备维护通知',
    type: 'broadcast',
    status: 'success',
    priority: 'normal',
    initiator: '维护中心',
    target: '维护区域',
    startTime: '2025-08-26 04:30:00',
    endTime: '2025-08-26 04:35:00',
    duration: 300,
    signalStrength: 94,
    latency: 26,
    packetLoss: 0.0,
    remark: '维护通知'
  },
  {
    id: 'COM010',
    name: '天气信息更新',
    type: 'data',
    status: 'failed',
    priority: 'low',
    initiator: '气象中心',
    target: '船舶H-数据设备',
    startTime: '2025-08-26 04:00:00',
    endTime: '2025-08-26 04:05:00',
    duration: 300,
    signalStrength: 52,
    latency: 95,
    packetLoss: 4.8,
    remark: '网络中断'
  },
  {
    id: 'COM011',
    name: '安全培训通讯',
    type: 'voice',
    status: 'success',
    priority: 'normal',
    initiator: '培训中心',
    target: '培训区域',
    startTime: '2025-08-26 03:30:00',
    endTime: '2025-08-26 04:00:00',
    duration: 1800,
    signalStrength: 91,
    latency: 31,
    packetLoss: 0.2,
    remark: '安全培训'
  },
  {
    id: 'COM012',
    name: '夜间巡逻报告',
    type: 'voice',
    status: 'success',
    priority: 'routine',
    initiator: '巡逻队',
    target: '指挥中心',
    startTime: '2025-08-26 03:00:00',
    endTime: '2025-08-26 03:15:00',
    duration: 900,
    signalStrength: 87,
    latency: 39,
    packetLoss: 0.4,
    remark: '巡逻报告'
  }
])

/**
 * 表格列定义
 */
const recordColumns = [
  {
    title: '通讯ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '通讯名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '通讯类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '通讯状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '发起设备',
    dataIndex: 'initiator',
    key: 'initiator',
    width: 150
  },
  {
    title: '目标设备',
    dataIndex: 'target',
    key: 'target',
    width: 150
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 150
  },
  {
    title: '通讯时长',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 类型分布数据
 */
const typeDistribution = ref([
  { type: 'voice', count: 189, percentage: 41, color: '#1890ff' },
  { type: 'video', count: 134, percentage: 29, color: '#52c41a' },
  { type: 'data', count: 89, percentage: 20, color: '#fa8c16' },
  { type: 'broadcast', count: 44, percentage: 10, color: '#722ed1' }
])

/**
 * 状态分布数据
 */
const statusDistribution = ref([
  { status: 'success', count: 432, percentage: 95, color: '#52c41a' },
  { status: 'failed', count: 24, percentage: 5, color: '#f5222d' }
])

/**
 * 时长趋势数据
 */
const durationTrend = ref([
  { date: '01-10', duration: 18.5 },
  { date: '01-11', duration: 22.3 },
  { date: '01-12', duration: 19.8 },
  { date: '01-13', duration: 24.1 },
  { date: '01-14', duration: 21.3 },
  { date: '01-15', duration: 26.7 }
])

/**
 * 计算最大时长
 */
const maxDuration = computed(() => {
  return Math.max(...durationTrend.value.map(item => item.duration))
})

/**
 * 图表加载状态
 */
const chartLoading = ref(true)

/**
 * 图表实例
 */
const typeDistributionChartRef = ref<HTMLElement | null>(null)
const statusDistributionChartRef = ref<HTMLElement | null>(null)
const durationTrendChartRef = ref<HTMLElement | null>(null)

/**
 * 模态框控制
 */
const detailsModalVisible = ref(false)
const selectedRecord = ref({})

/**
 * 计算属性
 */
const hasSelected = computed(() => selectedRowKeys.value.length > 0)

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    missed: 'orange',
    cancelled: 'blue'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    missed: '未接',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    voice: 'blue',
    video: 'green',
    data: 'orange',
    broadcast: 'purple'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    voice: '语音通话',
    video: '视频通话',
    data: '数据传输',
    broadcast: '广播'
  }
  return textMap[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'blue',
    normal: 'green',
    high: 'orange',
    urgent: 'red'
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
    urgent: '紧急'
  }
  return textMap[priority] || priority
}

/**
 * 格式化时长
 */
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('搜索完成')
  }, 1000)
}

/**
 * 处理重置
 */
const handleReset = () => {
  Object.assign(searchForm, {
    communicationType: '',
    status: '',
    deviceName: '',
    timeRange: []
  })
  message.info('搜索条件已重置')
}

/**
 * 处理导出
 */
const handleExport = () => {
  message.success('数据导出功能')
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
 * 批量删除
 */
const batchDelete = () => {
  message.success(`已删除 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

/**
 * 选择变化处理
 */
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

/**
 * 查看详情
 */
const viewDetails = (record: any) => {
  selectedRecord.value = record
  detailsModalVisible.value = true
}

/**
 * 回放记录
 */
const replayRecord = (record: any) => {
  message.info(`开始回放通讯记录: ${record.id}`)
}

/**
 * 编辑记录
 */
const editRecord = (record: any) => {
  message.info(`编辑通讯记录: ${record.id}`)
}

/**
 * 删除记录
 */
const deleteRecord = (record: any) => {
  message.success(`通讯记录 ${record.id} 已删除`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('通讯记录页面已加载')
  initCharts()
})

/**
 * 初始化图表
 */
const initCharts = () => {
  chartLoading.value = true
  setTimeout(() => {
    initTypeDistributionChart()
    initStatusDistributionChart()
    initDurationTrendChart()
    chartLoading.value = false
  }, 500) // 模拟图表加载时间
}

/**
 * 初始化通讯类型分布图表
 */
const initTypeDistributionChart = () => {
  if (!typeDistributionChartRef.value) return

  const chart = echarts.init(typeDistributionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['通讯次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: typeDistribution.value.map(item => getTypeText(item.type))
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 次'
      }
    },
    series: [
      {
        name: '通讯次数',
        type: 'bar',
        barWidth: '60%',
        data: typeDistribution.value.map(item => item.count)
      }
    ]
  }

  chart.setOption(option)
}

/**
 * 初始化通讯状态统计图表
 */
const initStatusDistributionChart = () => {
  if (!statusDistributionChartRef.value) return

  const chart = echarts.init(statusDistributionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['通讯次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statusDistribution.value.map(item => getStatusText(item.status))
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 次'
      }
    },
    series: [
      {
        name: '通讯次数',
        type: 'bar',
        barWidth: '60%',
        data: statusDistribution.value.map(item => item.count)
      }
    ]
  }

  chart.setOption(option)
}

/**
 * 初始化通讯时长趋势图表
 */
const initDurationTrendChart = () => {
  if (!durationTrendChartRef.value) return

  const chart = echarts.init(durationTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['通讯时长']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: durationTrend.value.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}h'
      }
    },
    series: [
      {
        name: '通讯时长',
        type: 'bar',
        barWidth: '60%',
        data: durationTrend.value.map(item => item.duration)
      }
    ]
  }

  chart.setOption(option)
}
</script>

<style lang="less" scoped>
.communication-records {
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

  .search-filter {
    margin-bottom: 24px;
  }

  .records-list {
    margin-bottom: 24px;

    .table-operations {
      margin-bottom: 16px;
    }
  }

  .statistics-analysis {
    .chart-container {
      .chart-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #262626;
        text-align: center;
      }

      .chart-wrapper {
        width: 100%;
        height: 300px; /* 设置图表容器高度 */
      }
    }
  }
}
</style>

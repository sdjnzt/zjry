<template>
  <div class="consultation-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>会商记录</h1>
      <p>管理所有会商活动的记录，支持搜索、筛选和统计分析</p>
    </div>

    <!-- 记录统计概览 -->
    <a-card class="stats-overview" title="记录统计概览">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="总会商次数" :value="stats.totalConsultations" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月会商" :value="stats.monthlyConsultations" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="参与人数" :value="stats.totalParticipants" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="平均时长" :value="stats.averageDuration" suffix="分钟" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="今日会商" :value="stats.todayConsultations" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="本周会商" :value="stats.weeklyConsultations" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="紧急会商" :value="stats.emergencyConsultations" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="完成率" :value="stats.completionRate" suffix="%" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 搜索和筛选区域 -->
    <a-card class="search-filter" title="搜索筛选">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="会商主题">
          <a-input v-model:value="searchForm.topic" placeholder="输入会商主题关键词" />
        </a-form-item>
        
        <a-form-item label="会商类型">
          <a-select v-model:value="searchForm.type" placeholder="选择会商类型" style="width: 150px">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="emergency">紧急会商</a-select-option>
            <a-select-option value="regular">例行会商</a-select-option>
            <a-select-option value="review">评审会商</a-select-option>
            <a-select-option value="coordination">协调会商</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="时间范围">
          <a-range-picker v-model:value="searchForm.timeRange" />
        </a-form-item>
        
        <a-form-item label="参与部门">
          <a-select v-model:value="searchForm.department" placeholder="选择参与部门" style="width: 150px">
            <a-select-option value="">全部部门</a-select-option>
            <a-select-option value="operations">运营部</a-select-option>
            <a-select-option value="maintenance">维护部</a-select-option>
            <a-select-option value="safety">安全部</a-select-option>
            <a-select-option value="management">管理部</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="会商状态">
          <a-select v-model:value="searchForm.status" placeholder="选择状态" style="width: 120px">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="ongoing">进行中</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 会商记录列表 -->
    <a-card class="records-list" title="会商记录列表">
      <!-- 操作按钮 -->
      <div class="action-buttons" style="margin-bottom: 16px">
        <a-button type="primary" @click="createRecord">
          <template #icon><PlusOutlined /></template>
          新建会商
        </a-button>
        <a-button @click="exportRecords">
          <template #icon><ExportOutlined /></template>
          导出记录
        </a-button>
        <a-button @click="batchDelete">
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
      </div>

      <!-- 记录表格 -->
      <a-table 
        :columns="recordColumns" 
        :data-source="consultationRecords" 
        :pagination="{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectionChange }"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #priority="{ record }">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>
        
        <template #action="{ record }">
          <a-button type="link" size="small" @click="viewRecord(record)">
            <template #icon><EyeOutlined /></template>
            查看
          </a-button>
          <a-button type="link" size="small" @click="editRecord(record)">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
          <a-button type="link" size="small" @click="deleteRecord(record)">
            <template #icon><DeleteOutlined /></template>
            删除
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 统计分析 -->
    <a-card class="statistics-analysis" title="统计分析">
      <a-row :gutter="16">
        <!-- 会商类型分布 -->
        <a-col :span="12">
          <div class="chart-container">
            <h4>会商类型分布</h4>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="consultationTypeChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
        
        <!-- 会商趋势分析 -->
        <a-col :span="12">
          <div class="chart-container">
            <h4>会商趋势分析</h4>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="consultationTrendChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
      </a-row>
      
      <a-row :gutter="16" style="margin-top: 16px">
        <!-- 部门参与统计 -->
        <a-col :span="12">
          <div class="chart-container">
            <h4>部门参与统计</h4>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="departmentChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
        
        <!-- 会商时长分布 -->
        <a-col :span="12">
          <div class="chart-container">
            <h4>会商时长分布</h4>
            <a-spin :spinning="chartLoading" tip="图表加载中...">
              <div ref="durationChartRef" class="chart-wrapper"></div>
            </a-spin>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 会商记录详情模态框 -->
    <a-modal
      v-model:visible="recordDetailModalVisible"
      title="会商记录详情"
      width="800px"
      @ok="closeRecordDetail"
    >
      <div v-if="selectedRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="会商主题">{{ selectedRecord.topic }}</a-descriptions-item>
          <a-descriptions-item label="会商类型">{{ getTypeText(selectedRecord.type) }}</a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ selectedRecord.startTime }}</a-descriptions-item>
          <a-descriptions-item label="结束时间">{{ selectedRecord.endTime }}</a-descriptions-item>
          <a-descriptions-item label="会商时长">{{ selectedRecord.duration }}分钟</a-descriptions-item>
          <a-descriptions-item label="参与人数">{{ selectedRecord.participantCount }}人</a-descriptions-item>
          <a-descriptions-item label="负责部门">{{ selectedRecord.department }}</a-descriptions-item>
          <a-descriptions-item label="会商地点">{{ selectedRecord.location }}</a-descriptions-item>
          <a-descriptions-item label="记录人">{{ selectedRecord.recorder }}</a-descriptions-item>
          <a-descriptions-item label="会商状态">
            <a-tag :color="getStatusColor(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(selectedRecord.priority)">
              {{ getPriorityText(selectedRecord.priority) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider />
        
        <h4>会商内容</h4>
        <p>{{ selectedRecord.content }}</p>
        
        <a-divider />
        
        <h4>参与人员</h4>
        <a-tag v-for="participant in selectedRecord.participants" :key="participant" style="margin: 4px">
          {{ participant }}
        </a-tag>
        
        <a-divider />
        
        <h4>会商结论</h4>
        <p>{{ selectedRecord.conclusion }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ExportOutlined, ReloadOutlined, FilterOutlined,
  CalendarOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const stats = reactive({
  totalConsultations: 156,
  monthlyConsultations: 23,
  totalParticipants: 89,
  averageDuration: 45,
  todayConsultations: 5,
  weeklyConsultations: 18,
  emergencyConsultations: 12,
  completionRate: 96.8
})

// 搜索表单
const searchForm = reactive({
  topic: '',
  type: '',
  timeRange: [],
  department: '',
  status: ''
})

// 选中的行
const selectedRowKeys = ref<number[]>([])

/**
 * 会商记录数据（使用更真实的中文姓名作为参与者与记录人）
 */
const consultationRecords = ref([
  {
    id: 1,
    topic: '船舶碰撞事故应急响应会商',
    type: 'emergency',
    startTime: '2025-08-20 09:00:00',
    endTime: '2025-08-20 10:30:00',
    duration: 90,
    participantCount: 12,
    status: 'completed',
    priority: 'high',
    department: 'operations',
    participants: ['陈志强', '刘建国', '王海峰', '赵明华', '钱伟民', '孙志刚'],
    content: '针对今日发生的船舶碰撞事故进行应急响应方案讨论和部署。',
    conclusion: '制定了详细的应急处理流程，明确了各部门职责分工。',
    location: '调度中心会议室',
    recorder: '周建军'
  },
  {
    id: 2,
    topic: '港口安全运营月度分析会商',
    type: 'regular',
    startTime: '2025-08-20 14:00:00',
    endTime: '2025-08-20 15:30:00',
    duration: 90,
    participantCount: 8,
    status: 'completed',
    priority: 'medium',
    department: 'management',
    participants: ['陈志强', '刘建国', '钱伟民', '周建军'],
    content: '分析上月港口安全运营数据，讨论改进措施和本月工作计划。',
    conclusion: '确定了三个重点改进方向，制定了具体的实施计划。',
    location: '安全监督部会议室',
    recorder: '吴建华'
  },
  {
    id: 3,
    topic: '智能监控系统升级评审会商',
    type: 'review',
    startTime: '2025-08-21 10:00:00',
    endTime: '2025-08-21 11:00:00',
    duration: 60,
    participantCount: 6,
    status: 'scheduled',
    priority: 'medium',
    department: 'maintenance',
    participants: ['王海峰', '赵明华', '孙志刚', '吴建华'],
    content: '评审智能监控系统升级方案，确保技术可行性和安全性。',
    conclusion: '待会商',
    location: '技术保障部会议室',
    recorder: '林倩'
  },
  {
    id: 4,
    topic: '恶劣天气应急预案协调会商',
    type: 'coordination',
    startTime: '2025-08-19 16:00:00',
    endTime: '2025-08-19 17:30:00',
    duration: 90,
    participantCount: 10,
    status: 'completed',
    priority: 'high',
    department: 'safety',
    participants: ['刘建国', '赵明华', '钱伟民', '孙志刚', '周建军'],
    content: '协调各部门制定恶劣天气应急预案，确保港口运营安全。',
    conclusion: '建立了跨部门应急响应机制，明确了预警等级和响应流程。',
    location: '安全监督部会议室',
    recorder: '高鹏飞'
  },
  {
    id: 5,
    topic: '船舶调度优化方案讨论会商',
    type: 'regular',
    startTime: '2025-08-18 09:00:00',
    endTime: '2025-08-18 11:00:00',
    duration: 120,
    participantCount: 7,
    status: 'completed',
    priority: 'medium',
    department: 'operations',
    participants: ['陈志强', '王海峰', '钱伟民', '周建军', '吴建华'],
    content: '讨论船舶调度优化方案，提高港口吞吐效率和安全性。',
    conclusion: '制定了新的调度算法，预计可提升效率15%。',
    location: '调度中心会议室',
    recorder: '林倩'
  },
  {
    id: 6,
    topic: '设备故障分析技术会商',
    type: 'review',
    startTime: '2025-08-17 14:00:00',
    endTime: '2025-08-17 15:00:00',
    duration: 60,
    participantCount: 5,
    status: 'completed',
    priority: 'medium',
    department: 'maintenance',
    participants: ['王海峰', '赵明华', '孙志刚', '吴建华'],
    content: '分析近期设备故障原因，制定预防性维护措施。',
    conclusion: '识别了三个主要故障模式，制定了相应的预防措施。',
    location: '技术保障部会议室',
    recorder: '何志远'
  },
  {
    id: 7,
    topic: '人员培训计划制定会商',
    type: 'regular',
    startTime: '2025-08-16 10:00:00',
    endTime: '2025-08-16 11:30:00',
    duration: 90,
    participantCount: 6,
    status: 'completed',
    priority: 'low',
    department: 'management',
    participants: ['刘建国', '钱伟民', '周建军', '林倩'],
    content: '制定年度人员培训计划，提升员工技能和安全意识。',
    conclusion: '制定了涵盖技术、安全、管理三个方面的培训计划。',
    location: '人力资源部会议室',
    recorder: '高鹏飞'
  },
  {
    id: 8,
    topic: '环保措施实施效果评估会商',
    type: 'review',
    startTime: '2025-08-15 15:00:00',
    endTime: '2025-08-15 16:30:00',
    duration: 90,
    participantCount: 8,
    status: 'completed',
    priority: 'medium',
    department: 'safety',
    participants: ['赵明华', '钱伟民', '孙志刚', '周建军', '吴建华'],
    content: '评估环保措施实施效果，讨论下一步改进方向。',
    conclusion: '环保措施效果显著，污染物排放减少30%。',
    location: '技术保障部会议室',
    recorder: '何志远'
  }
])

// 记录表格列定义
const recordColumns = [
  {
    title: '会商主题',
    dataIndex: 'topic',
    key: 'topic',
    width: 250
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 150
  },
  {
    title: '时长(分钟)',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '参与人数',
    dataIndex: 'participantCount',
    key: 'participantCount',
    width: 100
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department',
    width: 120
  },
  {
    title: '会商地点',
    dataIndex: 'location',
    key: 'location',
    width: 150
  },
  {
    title: '记录人',
    dataIndex: 'recorder',
    key: 'recorder',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' }
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100,
    slots: { customRender: 'priority' }
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    slots: { customRender: 'action' }
  }
]

// 模态框显示状态
const recordDetailModalVisible = ref(false)
const selectedRecord = ref<any>(null)

// 图表相关
const chartLoading = ref(true)
const consultationTypeChartRef = ref<HTMLElement | null>(null)
const consultationTrendChartRef = ref<HTMLElement | null>(null)
const departmentChartRef = ref<HTMLElement | null>(null)
const durationChartRef = ref<HTMLElement | null>(null)

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    completed: 'green',
    ongoing: 'blue',
    scheduled: 'orange',
    cancelled: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    completed: '已完成',
    ongoing: '进行中',
    scheduled: '已安排',
    cancelled: '已取消'
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

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: { [key: string]: string } = {
    emergency: '紧急会商',
    regular: '例行会商',
    review: '评审会商',
    coordination: '协调会商'
  }
  return textMap[type] || type
}

// 搜索处理
const handleSearch = () => {
  message.info('执行搜索操作')
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    topic: '',
    type: '',
    timeRange: [],
    department: '',
    status: ''
  })
  message.success('搜索条件已重置')
}

// 选择变化处理
const onSelectionChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 新建会商记录
const createRecord = () => {
  message.info('新建会商记录')
}

// 导出记录
const exportRecords = () => {
  message.success('开始导出会商记录')
}

// 批量删除
const batchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的记录')
    return
  }
  message.success(`删除选中的 ${selectedRowKeys.value.length} 条记录`)
}

// 查看记录详情
const viewRecord = (record: any) => {
  selectedRecord.value = record
  recordDetailModalVisible.value = true
}

// 编辑记录
const editRecord = (record: any) => {
  message.info(`编辑会商记录: ${record.topic}`)
}

// 删除记录
const deleteRecord = (record: any) => {
  message.success(`删除会商记录: ${record.topic}`)
}

// 关闭记录详情
const closeRecordDetail = () => {
  recordDetailModalVisible.value = false
  selectedRecord.value = null
}

/**
 * 初始化会商类型分布图表
 */
const initConsultationTypeChart = () => {
  if (!consultationTypeChartRef.value) return
  
  const chart = echarts.init(consultationTypeChartRef.value)
  
  const option = {
    title: {
      text: '会商类型分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '会商类型',
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: [
          { value: 35, name: '安全会商', itemStyle: { color: '#1890ff' } },
          { value: 25, name: '技术会商', itemStyle: { color: '#52c41a' } },
          { value: 20, name: '应急会商', itemStyle: { color: '#faad14' } },
          { value: 15, name: '协调会商', itemStyle: { color: '#ff4d4f' } },
          { value: 5, name: '其他', itemStyle: { color: '#722ed1' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

/**
 * 初始化会商趋势分析图表
 */
const initConsultationTrendChart = () => {
  if (!consultationTrendChartRef.value) return
  
  const chart = echarts.init(consultationTrendChartRef.value)
  
  const option = {
    title: {
      text: '会商数量趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['会商数量'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '会商数量',
        type: 'line',
        smooth: true,
        data: [12, 15, 18, 22, 25, 28],
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

/**
 * 初始化部门参与统计图表
 */
const initDepartmentChart = () => {
  if (!departmentChartRef.value) return
  
  const chart = echarts.init(departmentChartRef.value)
  
  const option = {
    title: {
      text: '部门参与度统计',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['安全部', '技术部', '运营部', '维护部', '应急部']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '参与次数',
        type: 'bar',
        data: [45, 38, 32, 28, 22],
        itemStyle: { color: '#1890ff' }
      }
    ]
  }
  
  chart.setOption(option)
}

/**
 * 初始化会商时长分布图表
 */
const initDurationChart = () => {
  if (!durationChartRef.value) return
  
  const chart = echarts.init(durationChartRef.value)
  
  const option = {
    title: {
      text: '会商时长分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['0-30分钟', '30-60分钟', '1-2小时', '2-4小时', '4小时以上']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '会商数量',
        type: 'bar',
        data: [25, 35, 28, 15, 7],
        itemStyle: { color: '#faad14' }
      }
    ]
  }
  
  chart.setOption(option)
}

// 组件挂载后的初始化
onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    stats.monthlyConsultations = Math.floor(Math.random() * 10) + 20
    stats.totalParticipants = Math.floor(Math.random() * 20) + 80
  }, 10000)
  
  // 初始化图表
  nextTick(() => {
    initConsultationTypeChart()
    initConsultationTrendChart()
    initDepartmentChart()
    initDurationChart()
    chartLoading.value = false
  })
})
</script>

<style lang="less" scoped>
.consultation-records {
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

  .stats-overview {
    margin-bottom: 24px;
  }

  .search-filter {
    margin-bottom: 24px;

    .ant-form-item {
      margin-bottom: 16px;
    }
  }

  .records-list {
    margin-bottom: 24px;

    .action-buttons {
      .ant-btn {
        margin-right: 8px;
      }
    }

    .ant-table {
      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
      }
    }
  }

  .statistics-analysis {
    .chart-container {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
      }

      .chart-wrapper {
        height: 300px; /* 设置图表容器高度 */
        background: #fafafa;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .stats-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .search-filter {
      .ant-form-item {
        margin-bottom: 12px;
      }
    }

    .action-buttons {
      .ant-btn {
        margin-bottom: 8px;
        margin-right: 0;
        width: 100%;
      }
    }

    .chart-container {
      margin-bottom: 16px;
    }
  }
}
</style>

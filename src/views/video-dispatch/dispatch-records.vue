<template>
  <div class="dispatch-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>调度记录</h1>
      <p>记录和管理所有视频调度任务的执行历史，支持查询、统计和分析</p>
    </div>

    <!-- 记录统计概览 -->
    <div class="records-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <ClockCircleOutlined />
                总调度次数
              </span>
            </template>
            <div class="statistic-value">{{ recordsStats.total }}</div>
            <div class="statistic-desc">累计调度任务</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <CheckCircleOutlined />
                成功完成
              </span>
            </template>
            <div class="statistic-value success">{{ recordsStats.success }}</div>
            <div class="statistic-desc">成功完成任务</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <ExclamationCircleOutlined />
                执行中
              </span>
            </template>
            <div class="statistic-value executing">{{ recordsStats.executing }}</div>
            <div class="statistic-desc">正在执行任务</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <CloseCircleOutlined />
                执行失败
              </span>
            </template>
            <div class="statistic-value failed">{{ recordsStats.failed }}</div>
            <div class="statistic-desc">执行失败任务</div>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <TeamOutlined />
                参与人员
              </span>
            </template>
            <div class="statistic-value">{{ dispatchStats.participants }}</div>
            <div class="statistic-desc">调度参与人员</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <GlobalOutlined />
                覆盖区域
              </span>
            </template>
            <div class="statistic-value">{{ dispatchStats.areas }}</div>
            <div class="statistic-desc">调度覆盖区域</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <BarChartOutlined />
                平均耗时
              </span>
            </template>
            <div class="statistic-value">{{ dispatchStats.avgDuration }}</div>
            <div class="statistic-desc">任务平均耗时</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <RiseOutlined />
                成功率
              </span>
            </template>
            <div class="statistic-value success">{{ dispatchStats.successRate }}%</div>
            <div class="statistic-desc">任务成功率</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 记录查询筛选 -->
    <div class="records-filter">
      <a-card title="记录查询" class="filter-card">
        <a-form layout="inline" :model="filterForm">
          <a-form-item label="时间范围">
            <a-range-picker
              v-model:value="filterForm.timeRange"
              :show-time="true"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="['开始时间', '结束时间']"
            />
          </a-form-item>
          <a-form-item label="调度类型">
            <a-select
              v-model:value="filterForm.type"
              placeholder="请选择调度类型"
              style="width: 150px"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="emergency">紧急调度</a-select-option>
              <a-select-option value="routine">例行调度</a-select-option>
              <a-select-option value="special">专项调度</a-select-option>
              <a-select-option value="coordination">协同调度</a-select-option>
              <a-select-option value="maintenance">维护调度</a-select-option>
              <a-select-option value="inspection">检查调度</a-select-option>
              <a-select-option value="training">培训调度</a-select-option>
              <a-select-option value="drill">演练调度</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="执行状态">
            <a-select
              v-model:value="filterForm.status"
              placeholder="请选择执行状态"
              style="width: 150px"
            >
              <a-select-option value="">全部状态</a-select-option>
                           <a-select-option value="executing">执行中</a-select-option>
             <a-select-option value="completed">已完成</a-select-option>
             <a-select-option value="failed">执行失败</a-select-option>
             <a-select-option value="paused">已暂停</a-select-option>
             <a-select-option value="cancelled">已取消</a-select-option>
             <a-select-option value="timeout">超时</a-select-option>
             <a-select-option value="interrupted">被中断</a-select-option>
             <a-select-option value="pending">等待中</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="优先级">
            <a-select
              v-model:value="filterForm.priority"
              placeholder="请选择优先级"
              style="width: 120px"
            >
              <a-select-option value="">全部优先级</a-select-option>
                           <a-select-option value="high">高</a-select-option>
             <a-select-option value="medium">中</a-select-option>
             <a-select-option value="low">低</a-select-option>
             <a-select-option value="urgent">紧急</a-select-option>
             <a-select-option value="normal">普通</a-select-option>
             <a-select-option value="routine">例行</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="执行人员">
            <a-select
              v-model:value="filterForm.executor"
              placeholder="请选择执行人员"
              style="width: 150px"
            >
              <a-select-option value="">全部人员</a-select-option>
              <a-select-option value="陈志强">陈志强</a-select-option>
              <a-select-option value="李明华">李明华</a-select-option>
              <a-select-option value="王建国">王建国</a-select-option>
              <a-select-option value="赵海军">赵海军</a-select-option>
              <a-select-option value="钱志明">钱志明</a-select-option>
              <a-select-option value="孙海洋">孙海洋</a-select-option>
              <a-select-option value="周建华">周建华</a-select-option>
              <a-select-option value="吴志强">吴志强</a-select-option>
              <a-select-option value="李晓光">李晓光</a-select-option>
              <a-select-option value="赵明亮">赵明亮</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="目标区域">
            <a-select
              v-model:value="filterForm.targetArea"
              placeholder="请选择目标区域"
              style="width: 150px"
            >
              <a-select-option value="">全部区域</a-select-option>
              <a-select-option value="码头A区">码头A区</a-select-option>
              <a-select-option value="码头B区">码头B区</a-select-option>
              <a-select-option value="锚地1号">锚地1号</a-select-option>
              <a-select-option value="锚地2号">锚地2号</a-select-option>
              <a-select-option value="航道主段">航道主段</a-select-option>
              <a-select-option value="航道支段">航道支段</a-select-option>
              <a-select-option value="港池区域">港池区域</a-select-option>
              <a-select-option value="引航区域">引航区域</a-select-option>
              <a-select-option value="应急区域">应急区域</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <SearchOutlined />
                查询
              </a-button>
              <a-button @click="handleReset">
                <ReloadOutlined />
                重置
              </a-button>
              <a-button @click="exportRecords">
                <DownloadOutlined />
                导出
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 记录统计图表 -->
    <div class="records-charts">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="调度类型分布" class="chart-card">
            <template #extra>
              <a-button type="link" size="small" @click="refreshDispatchTypeChart">
                <ReloadOutlined />
                刷新
              </a-button>
            </template>
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="dispatchTypeChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="执行状态趋势" class="chart-card">
            <template #extra>
              <a-button type="link" size="small" @click="refreshExecutionStatusChart">
                <ReloadOutlined />
                刷新
              </a-button>
            </template>
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="executionStatusChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 调度记录列表 -->
    <div class="records-list">
      <a-card title="调度记录列表" class="list-card">
        <a-table
          :columns="recordColumns"
          :data-source="filteredRecords"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeText(record.type) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'priority'">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewRecordDetail(record)">
                  查看
                </a-button>
                <a-button
                  v-if="record.status === 'executing'"
                  type="link"
                  size="small"
                  @click="stopDispatch(record)"
                >
                  停止
                </a-button>
                <a-button
                  v-if="record.status === 'executing'"
                  type="link"
                  size="small"
                  @click="pauseDispatch(record)"
                >
                  暂停
                </a-button>
                <a-button
                  v-if="record.status === 'paused'"
                  type="link"
                  size="small"
                  @click="resumeDispatch(record)"
                >
                  恢复
                </a-button>
                <a-button type="link" size="small" @click="exportRecord(record)">
                  导出
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 记录详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="调度记录详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="任务名称">
          {{ selectedRecord.taskName }}
        </a-descriptions-item>
        <a-descriptions-item label="调度类型">
          <a-tag :color="getTypeColor(selectedRecord.type)">
            {{ getTypeText(selectedRecord.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="执行状态">
          <a-tag :color="getStatusColor(selectedRecord.status)">
            {{ getStatusText(selectedRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(selectedRecord.priority)">
            {{ getPriorityText(selectedRecord.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="开始时间">
          {{ selectedRecord.startTime }}
        </a-descriptions-item>
        <a-descriptions-item label="结束时间">
          {{ selectedRecord.endTime || '进行中' }}
        </a-descriptions-item>
        <a-descriptions-item label="执行人员">
          {{ selectedRecord.executor }}
        </a-descriptions-item>
        <a-descriptions-item label="调度资源">
          {{ selectedRecord.resources }}
        </a-descriptions-item>
        <a-descriptions-item label="目标区域">
          {{ selectedRecord.targetArea }}
        </a-descriptions-item>
        <a-descriptions-item label="任务描述">
          {{ selectedRecord.description }}
        </a-descriptions-item>
        <a-descriptions-item label="执行结果" :span="2">
          {{ selectedRecord.result || '执行中' }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ selectedRecord.remark || '无' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TeamOutlined,
  GlobalOutlined,
  BarChartOutlined,
  RiseOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

/**
 * 调度记录数据接口
 */
interface DispatchRecord {
  id: string
  taskName: string
  type: string
  status: string
  priority: string
  startTime: string
  endTime?: string
  executor: string
  resources: string
  targetArea: string
  description: string
  result?: string
  remark?: string
}

/**
 * 筛选表单接口
 */
interface FilterForm {
  timeRange: any[]
  type: string
  status: string
  priority: string
  executor: string
  targetArea: string
}

// 响应式数据
const loading = ref(false)
const detailModalVisible = ref(false)
const selectedRecord = ref<DispatchRecord>({} as DispatchRecord)

// 记录统计数据
const recordsStats = reactive({
  total: 1247,
  success: 1189,
  executing: 23,
  failed: 35
})

// 图表数据
const chartData = reactive({
  emergency: 234,
  routine: 567,
  special: 289,
  coordination: 157
})

// 调度统计数据
const dispatchStats = reactive({
  participants: 89,
  areas: 24,
  avgDuration: '2.5小时',
  successRate: 95.3
})

// 筛选表单
const filterForm = reactive<FilterForm>({
  timeRange: [],
  type: '',
  status: '',
  priority: '',
  executor: '',
  targetArea: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 12,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 调度记录列表数据
const dispatchRecords = ref<DispatchRecord[]>([
  {
    id: '1',
    taskName: '船舶碰撞应急响应',
    type: 'emergency',
    status: 'completed',
    priority: 'high',
    startTime: '2025-08-20 14:30:00',
    endTime: '2025-08-20 16:45:00',
    executor: '陈志强',
    resources: '监控摄像头、无人机、救援船只',
    targetArea: '主航道A段',
    description: '立即启动船舶碰撞事故应急响应预案',
    result: '成功完成应急响应，无人员伤亡',
    remark: '响应及时，处置得当'
  },
  {
    id: '2',
    taskName: '日常航道巡查',
    type: 'routine',
    status: 'executing',
    priority: 'medium',
    startTime: '2025-08-20 09:00:00',
    executor: '李明华',
    resources: '固定监控点、移动巡查设备',
    targetArea: '全航道范围',
    description: '执行日常航道安全巡查任务',
    result: '正在执行中'
  },
  {
    id: '3',
    taskName: '恶劣天气专项检查',
    type: 'special',
    status: 'completed',
    priority: 'high',
    startTime: '2025-08-20 16:00:00',
    endTime: '2025-08-20 18:30:00',
    executor: '王建国',
    resources: '全天候监控设备、应急通讯设备',
    targetArea: '重点监控区域',
    description: '执行恶劣天气下的专项安全检查',
    result: '检查完成，发现3处安全隐患',
    remark: '及时发现问题，已安排整改'
  },
  {
    id: '4',
    taskName: '多部门协同调度',
    type: 'coordination',
    status: 'failed',
    priority: 'medium',
    startTime: '2025-08-20 10:00:00',
    endTime: '2025-08-20 12:15:00',
    executor: '赵海军',
    resources: '各部门监控资源、通讯设备',
    targetArea: '协同区域',
    description: '启动多部门协同调度预案',
    result: '执行失败，通讯设备故障',
    remark: '需要更换通讯设备'
  },
  {
    id: '5',
    taskName: '港口安全巡检',
    type: 'routine',
    status: 'completed',
    priority: 'medium',
    startTime: '2025-08-19 08:00:00',
    endTime: '2025-08-19 17:30:00',
    executor: '陈志强',
    resources: '港口监控系统、安全检测设备',
    targetArea: '港口作业区',
    description: '执行港口安全巡检任务',
    result: '巡检完成，发现2处安全隐患',
    remark: '已通知相关部门处理'
  },
  {
    id: '6',
    taskName: '船舶超速监控',
    type: 'special',
    status: 'completed',
    priority: 'high',
    startTime: '2025-08-19 20:00:00',
    endTime: '2025-08-19 22:15:00',
    executor: '钱志明',
    resources: '雷达监控、AIS系统、视频监控',
    targetArea: '限速航道段',
    description: '监控船舶超速行为',
    result: '发现3艘船舶超速，已记录并处理',
    remark: '超速船舶已收到警告'
  },
  {
    id: '7',
    taskName: '应急通讯测试',
    type: 'coordination',
    status: 'completed',
    priority: 'low',
    startTime: '2025-08-18 14:00:00',
    endTime: '2025-08-18 15:30:00',
    executor: '孙海洋',
    resources: '通讯设备、测试终端',
    targetArea: '通讯测试区域',
    description: '测试应急通讯系统功能',
    result: '测试完成，通讯系统正常',
    remark: '系统运行稳定'
  },
  {
    id: '8',
    taskName: '航道疏浚监控',
    type: 'routine',
    status: 'executing',
    priority: 'medium',
    startTime: '2025-08-18 07:00:00',
    executor: '周建华',
    resources: '水下监控设备、疏浚船监控',
    targetArea: '疏浚作业区',
    description: '监控航道疏浚作业进度',
    result: '正在执行中'
  },
  {
    id: '9',
    taskName: '船舶靠泊引导',
    type: 'emergency',
    status: 'completed',
    priority: 'high',
    startTime: '2025-08-17 16:00:00',
    endTime: '2025-08-17 18:30:00',
    executor: '吴志强',
    resources: '引导船、监控设备、通讯系统',
    targetArea: '靠泊区域',
    description: '引导大型船舶安全靠泊',
    result: '引导成功，船舶安全靠泊',
    remark: '操作规范，安全高效'
  },
  {
    id: '10',
    taskName: '夜间安全巡查',
    type: 'special',
    status: 'completed',
    priority: 'medium',
    startTime: '2025-08-17 22:00:00',
    endTime: '2025-08-18 06:00:00',
    executor: '李晓光',
    resources: '夜视设备、红外监控、巡逻车',
    targetArea: '夜间重点区域',
    description: '执行夜间安全巡查任务',
    result: '巡查完成，未发现异常情况',
    remark: '夜间安全状况良好'
  },
  {
    id: '11',
    taskName: '船舶流量统计',
    type: 'routine',
    status: 'completed',
    priority: 'low',
    startTime: '2025-08-16 00:00:00',
    endTime: '2025-08-16 23:59:59',
    executor: '赵明亮',
    resources: '流量统计系统、监控设备',
    targetArea: '统计监测点',
    description: '统计24小时船舶流量数据',
    result: '统计完成，共通过156艘船舶',
    remark: '数据准确，统计完整'
  },
  {
    id: '12',
    taskName: '设备维护检查',
    type: 'coordination',
    status: 'completed',
    priority: 'medium',
    startTime: '2025-08-15 09:00:00',
    endTime: '2025-08-15 17:00:00',
    executor: '陈志强',
    resources: '维护工具、检测设备、备用设备',
    targetArea: '设备维护区',
    description: '执行设备定期维护检查',
    result: '维护完成，设备运行正常',
    remark: '维护质量良好，设备状态稳定'
  }
])

// 表格列定义
const recordColumns = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName',
    width: 200
  },
  {
    title: '调度类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '执行状态',
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
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 180
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
    width: 180
  },
  {
    title: '执行人员',
    dataIndex: 'executor',
    key: 'executor',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性：过滤后的记录列表
const filteredRecords = computed(() => {
  let filtered = dispatchRecords.value

  if (filterForm.type) {
    filtered = filtered.filter(item => item.type === filterForm.type)
  }

  if (filterForm.status) {
    filtered = filtered.filter(item => item.status === filterForm.status)
  }

  if (filterForm.priority) {
    filtered = filtered.filter(item => item.priority === filterForm.priority)
  }

  if (filterForm.executor) {
    filtered = filtered.filter(item => item.executor === filterForm.executor)
  }

  if (filterForm.targetArea) {
    filtered = filtered.filter(item => item.targetArea === filterForm.targetArea)
  }

  if (filterForm.timeRange && filterForm.timeRange.length === 2) {
    const startTime = filterForm.timeRange[0].format('YYYY-MM-DD HH:mm:ss')
    const endTime = filterForm.timeRange[1].format('YYYY-MM-DD HH:mm:ss')
    filtered = filtered.filter(item => 
      item.startTime >= startTime && item.startTime <= endTime
    )
  }

  return filtered
})

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    emergency: 'red',
    routine: 'blue',
    special: 'orange',
    coordination: 'green',
    maintenance: 'purple',
    inspection: 'cyan',
    training: 'geekblue',
    drill: 'lime'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    emergency: '紧急调度',
    routine: '例行调度',
    special: '专项调度',
    coordination: '协同调度',
    maintenance: '维护调度',
    inspection: '检查调度',
    training: '培训调度',
    drill: '演练调度'
  }
  return textMap[type] || type
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    executing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'default',
    paused: 'orange',
    timeout: 'volcano',
    interrupted: 'magenta',
    pending: 'cyan'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    executing: '执行中',
    completed: '已完成',
    failed: '执行失败',
    cancelled: '已取消',
    paused: '已暂停',
    timeout: '超时',
    interrupted: '被中断',
    pending: '等待中'
  }
  return textMap[status] || status
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
    urgent: 'volcano',
    normal: 'green',
    routine: 'cyan'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string): string => {
  const textMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
    urgent: '紧急',
    normal: '普通',
    routine: '例行'
  }
  return textMap[priority] || priority
}

/**
 * 计算百分比
 */
const getPercent = (value: number): number => {
  const total = chartData.emergency + chartData.routine + chartData.special + chartData.coordination
  return Math.round((value / total) * 100)
}

/**
 * 处理查询
 */
const handleSearch = () => {
  pagination.current = 1
  message.info('执行查询操作')
}

/**
 * 处理重置
 */
const handleReset = () => {
  Object.assign(filterForm, {
    timeRange: [],
    type: '',
    status: '',
    priority: '',
    executor: '',
    targetArea: ''
  })
  pagination.current = 1
  message.info('筛选条件已重置')
}

/**
 * 导出记录
 */
const exportRecords = () => {
  message.success('记录导出功能开发中')
}

/**
 * 查看记录详情
 */
const viewRecordDetail = (record: DispatchRecord) => {
  selectedRecord.value = record
  detailModalVisible.value = true
}

/**
 * 停止调度
 */
const stopDispatch = (record: DispatchRecord) => {
  Modal.confirm({
    title: '确认停止调度',
    content: `确定要停止调度任务"${record.taskName}"吗？`,
    onOk: () => {
      record.status = 'cancelled'
      record.endTime = new Date().toLocaleString()
      record.result = '手动停止'
      message.success('调度任务已停止')
    }
  })
}

/**
 * 暂停调度
 */
const pauseDispatch = (record: DispatchRecord) => {
  Modal.confirm({
    title: '确认暂停调度',
    content: `确定要暂停调度任务"${record.taskName}"吗？`,
    onOk: () => {
      record.status = 'paused'
      message.success('调度任务已暂停')
    }
  })
}

/**
 * 恢复调度
 */
const resumeDispatch = (record: DispatchRecord) => {
  Modal.confirm({
    title: '确认恢复调度',
    content: `确定要恢复调度任务"${record.taskName}"吗？`,
    onOk: () => {
      record.status = 'executing'
      message.success('调度任务已恢复')
    }
  })
}

/**
 * 导出单条记录
 */
const exportRecord = (record: DispatchRecord) => {
  message.success(`记录"${record.taskName}"导出功能开发中`)
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 实现分页逻辑
}

// 图表相关
const chartLoading = ref(true)
const dispatchTypeChartRef = ref<HTMLElement | null>(null)
const executionStatusChartRef = ref<HTMLElement | null>(null)

/**
 * 初始化调度类型分布图表
 */
const initDispatchTypeChart = () => {
  console.log('初始化调度类型分布图表')
  console.log('图表容器引用:', dispatchTypeChartRef.value)
  
  if (!dispatchTypeChartRef.value) {
    console.error('调度类型图表容器未找到')
    return
  }
  
  try {
    const chart = echarts.init(dispatchTypeChartRef.value)
    console.log('图表实例创建成功:', chart)
    
    const option = {
      title: {
        text: '调度类型分布',
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
          name: '调度类型',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: [
            { value: chartData.emergency, name: '紧急调度', itemStyle: { color: '#ff4d4f' } },
            { value: chartData.routine, name: '例行调度', itemStyle: { color: '#1890ff' } },
            { value: chartData.special, name: '专项调度', itemStyle: { color: '#52c41a' } },
            { value: chartData.coordination, name: '协同调度', itemStyle: { color: '#faad14' } }
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
    console.log('调度类型图表配置成功')
  } catch (error) {
    console.error('初始化调度类型图表失败:', error)
  }
}

/**
 * 初始化执行状态趋势图表
 */
const initExecutionStatusChart = () => {
  console.log('初始化执行状态趋势图表')
  console.log('图表容器引用:', executionStatusChartRef.value)
  
  if (!executionStatusChartRef.value) {
    console.error('执行状态趋势图表容器未找到')
    return
  }
  
  try {
    const chart = echarts.init(executionStatusChartRef.value)
    console.log('执行状态趋势图表实例创建成功:', chart)
    
    const option = {
      title: {
        text: '近7天执行趋势',
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
        data: ['成功', '失败'],
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
        data: ['08-20', '08-21', '08-22', '08-23', '08-24', '08-25', '08-26']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '成功',
          type: 'line',
          smooth: true,
          data: [12, 15, 18, 14, 16, 13, 17],
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
        },
        {
          name: '失败',
          type: 'line',
          smooth: true,
          data: [1, 2, 0, 1, 2, 1, 0],
          itemStyle: { color: '#ff4d4f' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
              ]
            }
          }
        }
      ]
    }
    
    chart.setOption(option)
    console.log('执行状态趋势图表配置成功')
  } catch (error) {
    console.error('初始化执行状态趋势图表失败:', error)
  }
}

/**
 * 刷新调度类型分布图表
 */
const refreshDispatchTypeChart = () => {
  console.log('刷新调度类型分布图表')
  chartLoading.value = true
  setTimeout(() => {
    initDispatchTypeChart()
    chartLoading.value = false
  }, 500)
}

/**
 * 刷新执行状态趋势图表
 */
const refreshExecutionStatusChart = () => {
  console.log('刷新执行状态趋势图表')
  chartLoading.value = true
  setTimeout(() => {
    initExecutionStatusChart()
    chartLoading.value = false
  }, 500)
}

// 组件挂载后的初始化
onMounted(() => {
  console.log('视频调度记录页面已加载')
  
  // 延迟初始化图表，确保DOM完全渲染
  setTimeout(() => {
    nextTick(() => {
      initDispatchTypeChart()
      initExecutionStatusChart()
      chartLoading.value = false
    })
  }, 100)
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    nextTick(() => {
      initDispatchTypeChart()
      initExecutionStatusChart()
    })
  })
})
</script>

<style lang="less" scoped>
.dispatch-records {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    text-align: center;

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1f1f1f;
      margin-bottom: 8px;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  .records-overview {
    margin-bottom: 24px;

    .overview-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
      }

      .statistic-value {
        font-size: 32px;
        font-weight: 600;
        color: #1890ff;
        margin: 16px 0 8px;

        &.success {
          color: #52c41a;
        }

        &.executing {
          color: #1890ff;
        }

        &.failed {
          color: #ff4d4f;
        }
      }

      .statistic-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .records-filter {
    margin-bottom: 24px;

    .filter-card {
      :deep(.ant-form-item) {
        margin-bottom: 16px;
      }
    }
  }

  .records-charts {
    margin-bottom: 24px;

    .chart-card {
      .chart-container {
        height: 400px;
        background: #fafafa;
        border-radius: 8px;
        padding: 16px;
        position: relative;

        .chart-wrapper {
          width: 100%;
          height: 100%;
          min-height: 350px;
        }
      }
    }
  }

  .records-list {
    .list-card {
      :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        font-weight: 600;
      }

      :deep(.ant-table-tbody > tr:hover > td) {
        background: #f5f5f5;
      }
    }
  }

  :deep(.ant-modal-header) {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-descriptions-item-label) {
    font-weight: 600;
    background: #fafafa;
  }
}
</style>

<template>
  <div class="one-click-dispatch">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>一键调度</h1>
      <p>快速响应紧急情况，一键启动视频调度预案，实现资源快速调配</p>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="action-card emergency" @click="handleEmergencyDispatch">
            <div class="action-icon">
              <ExclamationCircleOutlined />
            </div>
            <div class="action-title">紧急调度</div>
            <div class="action-desc">立即启动应急响应</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="action-card routine" @click="handleRoutineDispatch">
            <div class="action-icon">
              <ScheduleOutlined />
            </div>
            <div class="action-title">例行调度</div>
            <div class="action-desc">启动日常巡查任务</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="action-card special" @click="handleSpecialDispatch">
            <div class="action-icon">
              <ToolOutlined />
            </div>
            <div class="action-title">专项调度</div>
            <div class="action-desc">执行专项检查任务</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="action-card coordination" @click="handleCoordinationDispatch">
            <div class="action-icon">
              <TeamOutlined />
            </div>
            <div class="action-title">协同调度</div>
            <div class="action-desc">多部门协同行动</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 调度状态监控 -->
    <div class="dispatch-status">
      <a-card title="调度状态监控" class="status-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="status-item">
              <div class="status-label">正在执行</div>
              <div class="status-value active">{{ activeDispatchCount }}</div>
              <div class="status-unit">个任务</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="status-item">
              <div class="status-label">等待中</div>
              <div class="status-value waiting">{{ waitingDispatchCount }}</div>
              <div class="status-unit">个任务</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="status-item">
              <div class="status-label">已完成</div>
              <div class="status-value completed">{{ completedDispatchCount }}</div>
              <div class="status-unit">个任务</div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 快速预案选择 -->
    <div class="quick-plans">
      <a-card title="快速预案选择" class="plans-card">
        <a-row :gutter="16">
          <a-col :span="8" v-for="plan in quickPlans" :key="plan.id">
            <div class="plan-item" @click="selectQuickPlan(plan)">
              <div class="plan-header">
                <span class="plan-name">{{ plan.name }}</span>
                <a-tag :color="getPriorityColor(plan.priority)" size="small">
                  {{ getPriorityText(plan.priority) }}
                </a-tag>
              </div>
              <div class="plan-desc">{{ plan.description }}</div>
              <div class="plan-resources">
                <span class="resource-label">资源：</span>
                <span class="resource-value">{{ plan.resources }}</span>
              </div>
              <div class="plan-actions">
                <a-button type="primary" size="small" @click.stop="executePlan(plan)">
                  执行
                </a-button>
                <a-button size="small" @click.stop="viewPlanDetail(plan)">
                  详情
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 最近调度记录 -->
    <div class="recent-records">
      <a-card title="最近调度记录" class="records-card">
        <a-table
          :columns="recordColumns"
          :data-source="recentRecords"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
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
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 调度执行弹窗 -->
    <a-modal
      v-model:open="dispatchModalVisible"
      :title="dispatchModalTitle"
      width="600px"
      @ok="executeDispatch"
      @cancel="cancelDispatch"
    >
      <a-form
        ref="dispatchFormRef"
        :model="dispatchForm"
        :rules="dispatchFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="调度类型" name="type">
          <a-select v-model:value="dispatchForm.type" placeholder="请选择调度类型">
            <a-select-option value="emergency">紧急调度</a-select-option>
            <a-select-option value="routine">例行调度</a-select-option>
            <a-select-option value="special">专项调度</a-select-option>
            <a-select-option value="coordination">协同调度</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预案选择" name="planId">
          <a-select v-model:value="dispatchForm.planId" placeholder="请选择预案">
            <a-select-option
              v-for="plan in availablePlans"
              :key="plan.id"
              :value="plan.id"
            >
              {{ plan.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调度范围" name="scope">
          <a-textarea
            v-model:value="dispatchForm.scope"
            placeholder="请描述调度范围和目标区域"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="dispatchForm.priority" placeholder="请选择优先级">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="dispatchForm.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预案详情弹窗 -->
    <a-modal
      v-model:open="planDetailModalVisible"
      title="预案详情"
      width="500px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="预案名称">
          {{ selectedPlan.name }}
        </a-descriptions-item>
        <a-descriptions-item label="预案类型">
          {{ getTypeText(selectedPlan.type) }}
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(selectedPlan.priority)">
            {{ getPriorityText(selectedPlan.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="适用场景">
          {{ selectedPlan.scenarios }}
        </a-descriptions-item>
        <a-descriptions-item label="调度资源">
          {{ selectedPlan.resources }}
        </a-descriptions-item>
        <a-descriptions-item label="执行步骤">
          {{ selectedPlan.steps }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 调度记录详情弹窗 -->
    <a-modal
      v-model:open="recordDetailModalVisible"
      title="调度记录详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="调度任务">
          {{ selectedRecord.taskName }}
        </a-descriptions-item>
        <a-descriptions-item label="调度类型">
          {{ getTypeText(selectedRecord.type) }}
        </a-descriptions-item>
        <a-descriptions-item label="执行状态">
          <a-tag :color="getStatusColor(selectedRecord.status)">
            {{ getStatusText(selectedRecord.status) }}
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
        <a-descriptions-item label="调度结果">
          {{ selectedRecord.result || '执行中' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ExclamationCircleOutlined,
  ScheduleOutlined,
  ToolOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

/**
 * 预案数据接口
 */
interface PlanData {
  id: string
  name: string
  type: string
  priority: string
  description: string
  resources: string
  scenarios: string
  steps: string
}

/**
 * 调度记录接口
 */
interface DispatchRecord {
  id: string
  taskName: string
  type: string
  status: string
  startTime: string
  endTime?: string
  executor: string
  result?: string
}

/**
 * 调度表单接口
 */
interface DispatchForm {
  type: string
  planId: string
  scope: string
  priority: string
  remark: string
}

// 响应式数据
const dispatchModalVisible = ref(false)
const dispatchModalTitle = ref('执行调度')
const planDetailModalVisible = ref(false)
const recordDetailModalVisible = ref(false)
const selectedPlan = ref<PlanData>({} as PlanData)
const selectedRecord = ref<DispatchRecord>({} as DispatchRecord)

// 调度状态计数
const activeDispatchCount = ref(23)
const waitingDispatchCount = ref(15)
const completedDispatchCount = ref(1247)

// 快速预案数据
const quickPlans = ref<PlanData[]>([
  {
    id: '1',
    name: '船舶碰撞应急响应',
    type: 'emergency',
    priority: 'high',
    description: '立即启动船舶碰撞事故应急响应预案',
    resources: '监控摄像头、无人机、救援船只',
    scenarios: '船舶碰撞事故应急响应',
    steps: '1. 立即启动应急响应\n2. 调取相关监控画面\n3. 协调救援资源\n4. 现场指挥调度'
  },
  {
    id: '2',
    name: '日常航道巡查',
    type: 'routine',
    priority: 'medium',
    description: '启动日常航道安全巡查任务',
    resources: '固定监控点、移动巡查设备',
    scenarios: '日常航道安全巡查',
    steps: '1. 制定巡查计划\n2. 分配巡查资源\n3. 执行巡查任务\n4. 记录巡查结果'
  },
  {
    id: '3',
    name: '恶劣天气专项检查',
    type: 'special',
    priority: 'high',
    description: '执行恶劣天气下的专项安全检查',
    resources: '全天候监控设备、应急通讯设备',
    scenarios: '台风、暴雨等恶劣天气下的安全检查',
    steps: '1. 启动恶劣天气预警\n2. 加强监控频次\n3. 重点区域巡查\n4. 应急响应准备'
  },
  {
    id: '4',
    name: '船舶搁浅救援调度',
    type: 'emergency',
    priority: 'high',
    description: '启动船舶搁浅事故救援调度预案',
    resources: '拖船、救援船只、潜水设备',
    scenarios: '船舶搁浅事故救援',
    steps: '1. 评估搁浅情况\n2. 调派救援船只\n3. 现场救援指挥\n4. 航道疏通作业'
  },
  {
    id: '5',
    name: '火灾事故应急调度',
    type: 'emergency',
    priority: 'high',
    description: '启动船舶火灾事故应急调度预案',
    resources: '消防船、灭火设备、救援船只',
    scenarios: '船舶火灾事故应急',
    steps: '1. 火情快速评估\n2. 调派消防资源\n3. 人员疏散指挥\n4. 火势控制扑救'
  },
  {
    id: '6',
    name: '人员落水搜救调度',
    type: 'emergency',
    priority: 'high',
    description: '启动人员落水搜救调度预案',
    resources: '搜救船只、潜水设备、医疗设备',
    scenarios: '人员落水搜救',
    steps: '1. 确定落水位置\n2. 调派搜救资源\n3. 现场搜救指挥\n4. 医疗救援准备'
  },
  {
    id: '7',
    name: '货物泄漏应急调度',
    type: 'emergency',
    priority: 'medium',
    description: '启动货物泄漏事故应急调度预案',
    resources: '围油栏、吸油设备、监测设备',
    scenarios: '货物泄漏事故应急',
    steps: '1. 泄漏范围评估\n2. 调派应急设备\n3. 污染控制作业\n4. 环境监测评估'
  },
  {
    id: '8',
    name: '航道堵塞疏通调度',
    type: 'special',
    priority: 'medium',
    description: '启动航道堵塞疏通调度预案',
    resources: '疏浚设备、拖船、监测设备',
    scenarios: '航道堵塞疏通',
    steps: '1. 堵塞情况评估\n2. 调派疏通设备\n3. 疏通作业指挥\n4. 航道恢复确认'
  }
])

// 可用预案列表
const availablePlans = ref<PlanData[]>([
  ...quickPlans.value,
  {
    id: '9',
    name: '多部门协同调度',
    type: 'coordination',
    priority: 'medium',
    description: '启动多部门协同调度预案',
    resources: '各部门监控资源、通讯设备',
    scenarios: '需要多部门协同的重大事件',
    steps: '1. 启动协同调度\n2. 协调各部门资源\n3. 统一指挥调度\n4. 信息共享反馈'
  },
  {
    id: '10',
    name: '船舶失控应急调度',
    type: 'emergency',
    priority: 'high',
    description: '启动船舶失控事故应急调度预案',
    resources: '拖船、救援船只、通讯设备',
    scenarios: '船舶失控事故应急',
    steps: '1. 失控情况评估\n2. 调派救援资源\n3. 现场指挥调度\n4. 船舶控制恢复'
  },
  {
    id: '11',
    name: '锚链断裂应急调度',
    type: 'emergency',
    priority: 'medium',
    description: '启动锚链断裂事故应急调度预案',
    resources: '拖船、锚链设备、监测设备',
    scenarios: '锚链断裂事故应急',
    steps: '1. 断裂情况评估\n2. 调派拖船资源\n3. 现场应急处理\n4. 安全锚泊恢复'
  },
  {
    id: '12',
    name: '船舶沉没应急调度',
    type: 'emergency',
    priority: 'high',
    description: '启动船舶沉没事故应急调度预案',
    resources: '打捞设备、潜水设备、监测设备',
    scenarios: '船舶沉没事故应急',
    steps: '1. 沉没位置确定\n2. 调派打捞资源\n3. 现场打捞指挥\n4. 航道安全评估'
  },
  {
    id: '13',
    name: '船舶倾覆救援调度',
    type: 'emergency',
    priority: 'high',
    description: '启动船舶倾覆事故救援调度预案',
    resources: '救援船只、起重设备、医疗设备',
    scenarios: '船舶倾覆事故救援',
    steps: '1. 倾覆情况评估\n2. 调派救援资源\n3. 现场救援指挥\n4. 人员救援处理'
  },
  {
    id: '14',
    name: '船舶进水应急调度',
    type: 'emergency',
    priority: 'medium',
    description: '启动船舶进水事故应急调度预案',
    resources: '抽水设备、救援船只、监测设备',
    scenarios: '船舶进水事故应急',
    steps: '1. 进水情况评估\n2. 调派抽水设备\n3. 现场应急处理\n4. 船舶安全恢复'
  },
  {
    id: '15',
    name: '船舶触礁应急调度',
    type: 'emergency',
    priority: 'medium',
    description: '启动船舶触礁事故应急调度预案',
    resources: '拖船、救援船只、监测设备',
    scenarios: '船舶触礁事故应急',
    steps: '1. 触礁情况评估\n2. 调派救援资源\n3. 现场应急处理\n4. 船舶脱险恢复'
  }
])

// 最近调度记录
const recentRecords = ref<DispatchRecord[]>([
  {
    id: '1',
    taskName: '船舶碰撞应急响应',
    type: 'emergency',
    status: 'executing',
    startTime: '2025-08-20 14:30:00',
    executor: '张三',
    result: '正在执行中'
  },
  {
    id: '2',
    taskName: '日常航道巡查',
    type: 'routine',
    status: 'completed',
    startTime: '2025-08-20 09:00:00',
    endTime: '2025-08-20 12:00:00',
    executor: '李四',
    result: '巡查完成，发现2处安全隐患'
  },
  {
    id: '3',
    taskName: '恶劣天气专项检查',
    type: 'special',
    status: 'waiting',
    startTime: '2025-08-20 16:00:00',
    executor: '王五',
    result: '等待天气条件满足'
  },
  {
    id: '4',
    taskName: '船舶搁浅救援调度',
    type: 'emergency',
    status: 'completed',
    startTime: '2025-08-19 08:15:00',
    endTime: '2025-08-19 16:30:00',
    executor: '赵六',
    result: '救援完成，船舶成功脱险'
  },
  {
    id: '5',
    taskName: '火灾事故应急调度',
    type: 'emergency',
    status: 'completed',
    startTime: '2025-08-19 22:45:00',
    endTime: '2025-08-20 03:20:00',
    executor: '钱七',
    result: '火势已控制，无人员伤亡'
  },
  {
    id: '6',
    taskName: '人员落水搜救调度',
    type: 'emergency',
    status: 'completed',
    startTime: '2025-08-18 15:20:00',
    endTime: '2025-08-18 18:45:00',
    executor: '孙八',
    result: '搜救完成，落水人员已获救'
  },
  {
    id: '7',
    taskName: '货物泄漏应急调度',
    type: 'emergency',
    status: 'executing',
    startTime: '2025-08-20 10:30:00',
    executor: '周九',
    result: '正在清理泄漏货物'
  },
  {
    id: '8',
    taskName: '航道堵塞疏通调度',
    type: 'special',
    status: 'executing',
    startTime: '2025-08-20 07:00:00',
    executor: '吴十',
    result: '疏通作业进行中'
  },
  {
    id: '9',
    taskName: '多部门协同调度',
    type: 'coordination',
    status: 'waiting',
    startTime: '2025-08-20 18:00:00',
    executor: '郑十一',
    result: '等待各部门协调确认'
  },
  {
    id: '10',
    taskName: '船舶失控应急调度',
    type: 'emergency',
    status: 'completed',
    startTime: '2025-08-17 12:15:00',
    endTime: '2025-08-17 20:30:00',
    executor: '王十二',
    result: '船舶已控制，恢复正常航行'
  }
])

// 调度表单
const dispatchFormRef = ref()
const dispatchForm = reactive<DispatchForm>({
  type: '',
  planId: '',
  scope: '',
  priority: '',
  remark: ''
})

// 表单验证规则
const dispatchFormRules = {
  type: [{ required: true, message: '请选择调度类型' }],
  planId: [{ required: true, message: '请选择预案' }],
  scope: [{ required: true, message: '请描述调度范围' }],
  priority: [{ required: true, message: '请选择优先级' }]
}

// 记录表格列定义
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
    width: 120,
    customRender: ({ text }: { text: string }) => getTypeText(text)
  },
  {
    title: '执行状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
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
    width: 120,
    fixed: 'right'
  }
]

/**
 * 获取预案类型文本
 */
const getTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    emergency: '紧急调度',
    routine: '例行调度',
    special: '专项调度',
    coordination: '协同调度'
  }
  return typeMap[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
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
    low: '低'
  }
  return textMap[priority] || priority
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    executing: 'blue',
    waiting: 'orange',
    completed: 'green',
    failed: 'red'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    executing: '执行中',
    waiting: '等待中',
    completed: '已完成',
    failed: '执行失败'
  }
  return textMap[status] || status
}

/**
 * 处理紧急调度
 */
const handleEmergencyDispatch = () => {
  dispatchForm.type = 'emergency'
  dispatchForm.priority = 'high'
  dispatchModalTitle.value = '紧急调度'
  dispatchModalVisible.value = true
}

/**
 * 处理例行调度
 */
const handleRoutineDispatch = () => {
  dispatchForm.type = 'routine'
  dispatchForm.priority = 'medium'
  dispatchModalTitle.value = '例行调度'
  dispatchModalVisible.value = true
}

/**
 * 处理专项调度
 */
const handleSpecialDispatch = () => {
  dispatchForm.type = 'special'
  dispatchForm.priority = 'high'
  dispatchModalTitle.value = '专项调度'
  dispatchModalVisible.value = true
}

/**
 * 处理协同调度
 */
const handleCoordinationDispatch = () => {
  dispatchForm.type = 'coordination'
  dispatchForm.priority = 'medium'
  dispatchModalTitle.value = '协同调度'
  dispatchModalVisible.value = true
}

/**
 * 选择快速预案
 */
const selectQuickPlan = (plan: PlanData) => {
  dispatchForm.planId = plan.id
  dispatchForm.type = plan.type
  dispatchForm.priority = plan.priority
  dispatchModalTitle.value = `执行预案：${plan.name}`
  dispatchModalVisible.value = true
}

/**
 * 执行预案
 */
const executePlan = (plan: PlanData) => {
  dispatchForm.planId = plan.id
  dispatchForm.type = plan.type
  dispatchForm.priority = plan.priority
  dispatchModalTitle.value = `执行预案：${plan.name}`
  dispatchModalVisible.value = true
}

/**
 * 查看预案详情
 */
const viewPlanDetail = (plan: PlanData) => {
  selectedPlan.value = plan
  planDetailModalVisible.value = true
}

/**
 * 查看记录详情
 */
const viewRecordDetail = (record: DispatchRecord) => {
  selectedRecord.value = record
  recordDetailModalVisible.value = true
}

/**
 * 停止调度
 */
const stopDispatch = (record: DispatchRecord) => {
  Modal.confirm({
    title: '确认停止调度',
    content: `确定要停止调度任务"${record.taskName}"吗？`,
    onOk: () => {
      record.status = 'completed'
      record.endTime = new Date().toLocaleString()
      record.result = '手动停止'
      activeDispatchCount.value--
      completedDispatchCount.value++
      message.success('调度任务已停止')
    }
  })
}

/**
 * 执行调度
 */
const executeDispatch = () => {
  dispatchFormRef.value?.validate().then(() => {
    // 创建新的调度记录
    const newRecord: DispatchRecord = {
      id: Date.now().toString(),
      taskName: availablePlans.value.find(p => p.id === dispatchForm.planId)?.name || '',
      type: dispatchForm.type,
      status: 'executing',
      startTime: new Date().toLocaleString(),
      executor: '当前用户',
      result: '正在执行中'
    }
    
    recentRecords.value.unshift(newRecord)
    activeDispatchCount.value++
    
    message.success('调度任务已启动')
    dispatchModalVisible.value = false
    
    // 重置表单
    Object.assign(dispatchForm, {
      type: '',
      planId: '',
      scope: '',
      priority: '',
      remark: ''
    })
  })
}

/**
 * 取消调度
 */
const cancelDispatch = () => {
  dispatchModalVisible.value = false
  Object.assign(dispatchForm, {
    type: '',
    planId: '',
    scope: '',
    priority: '',
    remark: ''
  })
}

// 组件挂载时初始化数据
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="less" scoped>
.one-click-dispatch {
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

  .quick-actions {
    margin-bottom: 24px;

    .action-card {
      text-align: center;
      cursor: pointer;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.emergency {
        border-left: 4px solid #ff4d4f;
        
        .action-icon {
          color: #ff4d4f;
        }
      }

      &.routine {
        border-left: 4px solid #1890ff;
        
        .action-icon {
          color: #1890ff;
        }
      }

      &.special {
        border-left: 4px solid #fa8c16;
        
        .action-icon {
          color: #fa8c16;
        }
      }

      &.coordination {
        border-left: 4px solid #52c41a;
        
        .action-icon {
          color: #52c41a;
        }
      }

      .action-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .action-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f1f1f;
        margin-bottom: 8px;
      }

      .action-desc {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .dispatch-status {
    margin-bottom: 24px;

    .status-card {
      .status-item {
        text-align: center;
        padding: 16px;

        .status-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .status-value {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 4px;

          &.active {
            color: #1890ff;
          }

          &.waiting {
            color: #fa8c16;
          }

          &.completed {
            color: #52c41a;
          }
        }

        .status-unit {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .quick-plans {
    margin-bottom: 24px;

    .plans-card {
      .plan-item {
        padding: 16px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .plan-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f1f1f;
          }
        }

        .plan-desc {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .plan-resources {
          margin-bottom: 16px;

          .resource-label {
            font-size: 12px;
            color: #999;
          }

          .resource-value {
            font-size: 12px;
            color: #666;
          }
        }

        .plan-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .recent-records {
    .records-card {
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

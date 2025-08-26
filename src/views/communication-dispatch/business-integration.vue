<template>
  <div class="business-integration">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>业务联动</h1>
      <p>实现通讯调度与其他业务系统的智能联动，提升整体运营效率</p>
    </div>

    <!-- 联动状态概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="联动规则"
            :value="statusData.integrationRules"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="活跃联动"
            :value="statusData.activeIntegrations"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="联动成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日联动"
            :value="statusData.todayIntegrations"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="16" class="main-content">
      <!-- 联动规则配置 -->
      <a-col :span="12">
        <a-card title="联动规则配置" class="rule-config">
          <a-form layout="vertical">
            <a-form-item label="联动类型">
              <a-select v-model:value="ruleData.integrationType" placeholder="选择联动类型">
                <a-select-option value="alarm">告警联动</a-select-option>
                <a-select-option value="schedule">定时联动</a-select-option>
                <a-select-option value="event">事件联动</a-select-option>
                <a-select-option value="condition">条件联动</a-select-option>
                <a-select-option value="manual">手动联动</a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="触发条件">
              <a-textarea
                v-model:value="ruleData.triggerCondition"
                placeholder="输入触发条件描述"
                :rows="3"
              />
            </a-form-item>

            <a-form-item label="联动动作">
              <a-checkbox-group v-model:value="ruleData.actions">
                <a-checkbox value="send-notification">发送通知</a-checkbox>
                <a-checkbox value="start-communication">启动通讯</a-checkbox>
                <a-checkbox value="record-event">记录事件</a-checkbox>
                <a-checkbox value="update-status">更新状态</a-checkbox>
                <a-checkbox value="execute-script">执行脚本</a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="目标系统">
              <a-select
                v-model:value="ruleData.targetSystems"
                mode="multiple"
                placeholder="选择目标系统"
                style="width: 100%"
              >
                <a-select-option value="monitoring">监控系统</a-select-option>
                <a-select-option value="communication">通讯系统</a-select-option>
                <a-select-option value="data">数据系统</a-select-option>
                <a-select-option value="management">管理系统</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="优先级">
              <a-select v-model:value="ruleData.priority" placeholder="选择优先级">
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="normal">普通</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="urgent">紧急</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" @click="saveRuleConfig" :loading="saving">
                  保存规则
                </a-button>
                <a-button @click="resetRuleConfig">重置</a-button>
                <a-button @click="testRuleConfig">测试规则</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 联动规则管理 -->
      <a-col :span="12">
        <a-card title="联动规则管理" class="rule-management">
          <div class="rule-operations">
            <a-button type="primary" @click="addRule" style="margin-bottom: 16px">
              添加规则
            </a-button>
          </div>
          
          <a-table
            :columns="ruleColumns"
            :data-source="integrationRules"
            :pagination="{ pageSize: 5 }"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-switch
                  v-model:checked="record.enabled"
                  size="small"
                  @change="toggleRule(record)"
                />
              </template>
              <template v-else-if="column.key === 'priority'">
                <a-tag :color="getPriorityColor(record.priority)">
                  {{ getPriorityText(record.priority) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editRule(record)">
                    编辑
                  </a-button>
                  <a-popconfirm
                    title="确定要删除这条规则吗？"
                    @confirm="deleteRule(record)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 联动监控 -->
    <a-card title="联动监控" class="integration-monitor">
      <a-row :gutter="16">
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">联动状态</div>
            <div class="status-chart">
              <div class="status-item" v-for="item in integrationStatus" :key="item.status">
                <div class="status-indicator" :class="item.status"></div>
                <div class="status-info">
                  <span class="status-name">{{ getStatusText(item.status) }}</span>
                  <span class="status-count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">联动性能</div>
            <div class="performance-chart">
              <div class="performance-item" v-for="item in performanceData" :key="item.name">
                <div class="performance-label">{{ item.name }}</div>
                <div class="performance-bar">
                  <a-progress
                    :percent="item.value"
                    :show-info="false"
                    :stroke-color="getPerformanceColor(item.value)"
                    size="small"
                  />
                </div>
                <div class="performance-value">{{ item.value }}%</div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">联动统计</div>
            <div class="integration-stats">
              <div class="stat-item">
                <span class="stat-label">总联动数:</span>
                <span class="stat-value">{{ statusData.totalIntegrations }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功联动:</span>
                <span class="stat-value success">{{ statusData.successIntegrations }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">失败联动:</span>
                <span class="stat-value failed">{{ statusData.failedIntegrations }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均响应时间:</span>
                <span class="stat-value">{{ statusData.avgResponseTime }}ms</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 联动事件管理 -->
    <a-card title="联动事件管理" class="event-management">
      <div class="event-operations">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索联动事件"
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
            <a-select-option value="processing">处理中</a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshEvents">刷新</a-button>
          <a-button @click="clearEvents">清空事件</a-button>
        </a-space>
      </div>
      
      <a-table
        :columns="eventColumns"
        :data-source="integrationEvents"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getEventStatusColor(record.status)">
              {{ getEventStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewEventDetails(record)">
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="retryEvent(record)">
                重试
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 规则编辑模态框 -->
    <a-modal
      v-model:open="ruleModalVisible"
      :title="editingRule.id ? '编辑联动规则' : '添加联动规则'"
      width="600px"
      @ok="saveRule"
      @cancel="cancelRule"
    >
      <a-form layout="vertical" :model="editingRule">
        <a-form-item label="规则名称" required>
          <a-input v-model:value="editingRule.name" placeholder="输入规则名称" />
        </a-form-item>
        <a-form-item label="联动类型" required>
          <a-select v-model:value="editingRule.type" placeholder="选择联动类型">
            <a-select-option value="alarm">告警联动</a-select-option>
            <a-select-option value="schedule">定时联动</a-select-option>
            <a-select-option value="event">事件联动</a-select-option>
            <a-select-option value="condition">条件联动</a-select-option>
            <a-select-option value="manual">手动联动</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="触发条件" required>
          <a-textarea v-model:value="editingRule.condition" :rows="3" placeholder="输入触发条件" />
        </a-form-item>
        <a-form-item label="联动动作" required>
          <a-checkbox-group v-model:value="editingRule.actions">
            <a-checkbox value="send-notification">发送通知</a-checkbox>
            <a-checkbox value="start-communication">启动通讯</a-checkbox>
            <a-checkbox value="record-event">记录事件</a-checkbox>
            <a-checkbox value="update-status">更新状态</a-checkbox>
            <a-checkbox value="execute-script">执行脚本</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="editingRule.priority" placeholder="选择优先级">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="normal">普通</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="urgent">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="规则描述">
          <a-textarea v-model:value="editingRule.description" :rows="3" placeholder="输入规则描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 事件详情模态框 -->
    <a-modal
      v-model:open="eventDetailsModalVisible"
      title="联动事件详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="事件ID">{{ selectedEvent.id }}</a-descriptions-item>
        <a-descriptions-item label="事件名称">{{ selectedEvent.name }}</a-descriptions-item>
        <a-descriptions-item label="联动类型">{{ getIntegrationTypeText(selectedEvent.type) }}</a-descriptions-item>
        <a-descriptions-item label="事件状态">{{ getEventStatusText(selectedEvent.status) }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ getPriorityText(selectedEvent.priority) }}</a-descriptions-item>
        <a-descriptions-item label="触发时间">{{ selectedEvent.triggerTime }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ selectedEvent.completeTime }}</a-descriptions-item>
        <a-descriptions-item label="响应时间">{{ selectedEvent.responseTime }}ms</a-descriptions-item>
        <a-descriptions-item label="详细信息">{{ selectedEvent.message }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

/**
 * 联动状态数据
 */
const statusData = reactive({
  integrationRules: 67,
  activeIntegrations: 52,
  successRate: 97.8,
  todayIntegrations: 156,
  totalIntegrations: 1247,
  successIntegrations: 1219,
  failedIntegrations: 28,
  avgResponseTime: 28
})

/**
 * 联动规则数据
 */
const ruleData = reactive({
  integrationType: '',
  triggerCondition: '',
  actions: [],
  targetSystems: [],
  priority: 'normal'
})

/**
 * 联动规则列表
 */
const integrationRules = ref([
  {
    id: 'RULE001',
    name: '设备告警联动',
    type: 'alarm',
    condition: '设备离线或异常时',
    actions: ['send-notification', 'start-communication'],
    priority: 'high',
    description: '设备告警时自动启动通讯并发送通知',
    enabled: true
  },
  {
    id: 'RULE002',
    name: '定时通讯联动',
    type: 'schedule',
    condition: '每日定时执行',
    actions: ['start-communication', 'record-event'],
    priority: 'normal',
    description: '定时启动通讯并记录事件',
    enabled: true
  },
  {
    id: 'RULE003',
    name: '紧急事件联动',
    type: 'event',
    condition: '紧急情况发生时',
    actions: ['send-notification', 'start-communication', 'update-status'],
    priority: 'urgent',
    description: '紧急情况下启动多重联动',
    enabled: false
  },
  {
    id: 'RULE004',
    name: '设备维护联动',
    type: 'schedule',
    condition: '设备维护时间到达时',
    actions: ['send-notification', 'record-event', 'update-status'],
    priority: 'normal',
    description: '设备维护时自动记录事件并更新状态',
    enabled: true
  },
  {
    id: 'RULE005',
    name: '安全巡检联动',
    type: 'condition',
    condition: '安全巡检完成时',
    actions: ['send-notification', 'record-event', 'execute-script'],
    priority: 'high',
    description: '安全巡检完成后自动执行相关脚本',
    enabled: true
  },
  {
    id: 'RULE006',
    name: '数据同步联动',
    type: 'event',
    condition: '数据同步完成时',
    actions: ['send-notification', 'update-status'],
    priority: 'normal',
    description: '数据同步完成后自动更新状态',
    enabled: true
  },
  {
    id: 'RULE007',
    name: '天气预警联动',
    type: 'alarm',
    condition: '天气预警触发时',
    actions: ['send-notification', 'start-communication', 'record-event'],
    priority: 'high',
    description: '天气预警时启动通讯并记录事件',
    enabled: true
  },
  {
    id: 'RULE008',
    name: '夜间巡逻联动',
    type: 'schedule',
    condition: '夜间巡逻开始时',
    actions: ['send-notification', 'start-communication'],
    priority: 'normal',
    description: '夜间巡逻时自动启动通讯',
    enabled: true
  }
])

/**
 * 联动状态数据
 */
const integrationStatus = ref([
  { status: 'active', count: 18 },
  { status: 'inactive', count: 7 },
  { status: 'error', count: 2 }
])

/**
 * 性能数据
 */
const performanceData = ref([
  { name: '联动成功率', value: 96.2 },
  { name: '平均响应时间', value: 85 },
  { name: '系统负载', value: 72 },
  { name: '资源利用率', value: 68 }
])

/**
 * 联动事件数据
 */
const integrationEvents = ref([
  {
    id: 'EVT001',
    name: '设备告警联动',
    type: 'alarm',
    status: 'success',
    priority: 'high',
    triggerTime: '2025-08-26 10:30:00',
    completeTime: '2025-08-26 10:30:15',
    responseTime: 15000,
    message: '设备离线告警，已启动通讯并发送通知'
  },
  {
    id: 'EVT002',
    name: '定时通讯联动',
    type: 'schedule',
    status: 'success',
    priority: 'normal',
    triggerTime: '2025-08-26 09:00:00',
    completeTime: '2025-08-26 09:00:08',
    responseTime: 8000,
    message: '定时通讯任务执行成功'
  },
  {
    id: 'EVT003',
    name: '紧急事件联动',
    type: 'event',
    status: 'failed',
    priority: 'urgent',
    triggerTime: '2025-08-26 08:15:00',
    completeTime: '2025-08-26 08:15:25',
    responseTime: 25000,
    message: '紧急联动执行失败，系统异常'
  },
  {
    id: 'EVT004',
    name: '设备维护联动',
    type: 'schedule',
    status: 'success',
    priority: 'normal',
    triggerTime: '2025-08-26 07:30:00',
    completeTime: '2025-08-26 07:30:12',
    responseTime: 12000,
    message: '设备维护联动执行成功'
  },
  {
    id: 'EVT005',
    name: '安全巡检联动',
    type: 'condition',
    status: 'success',
    priority: 'high',
    triggerTime: '2025-08-26 07:00:00',
    completeTime: '2025-08-26 07:00:08',
    responseTime: 8000,
    message: '安全巡检联动执行成功'
  },
  {
    id: 'EVT006',
    name: '数据同步联动',
    type: 'event',
    status: 'success',
    priority: 'normal',
    triggerTime: '2025-08-26 06:30:00',
    completeTime: '2025-08-26 06:30:15',
    responseTime: 15000,
    message: '数据同步联动执行成功'
  },
  {
    id: 'EVT007',
    name: '天气预警联动',
    type: 'alarm',
    status: 'success',
    priority: 'high',
    triggerTime: '2025-08-26 06:00:00',
    completeTime: '2025-08-26 06:00:10',
    responseTime: 10000,
    message: '天气预警联动执行成功'
  },
  {
    id: 'EVT008',
    name: '夜间巡逻联动',
    type: 'schedule',
    status: 'success',
    priority: 'normal',
    triggerTime: '2025-08-26 05:30:00',
    completeTime: '2025-08-26 05:30:08',
    responseTime: 8000,
    message: '夜间巡逻联动执行成功'
  }
])

/**
 * 表格列定义
 */
const ruleColumns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '联动类型',
    dataIndex: 'type',
    key: 'type',
    customRender: ({ text }: { text: string }) => getIntegrationTypeText(text)
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
]

const eventColumns = [
  {
    title: '事件名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '联动类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    customRender: ({ text }: { text: string }) => getIntegrationTypeText(text)
  },
  {
    title: '事件状态',
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
    title: '触发时间',
    dataIndex: 'triggerTime',
    key: 'triggerTime',
    width: 150
  },
  {
    title: '响应时间',
    dataIndex: 'responseTime',
    key: 'responseTime',
    width: 100,
    customRender: ({ text }: { text: number }) => `${text}ms`
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

/**
 * 搜索和筛选
 */
const searchText = ref('')
const dateRange = ref([])
const statusFilter = ref('')
const loading = ref(false)
const saving = ref(false)

/**
 * 模态框控制
 */
const ruleModalVisible = ref(false)
const eventDetailsModalVisible = ref(false)
const editingRule = reactive({
  id: '',
  name: '',
  type: '',
  condition: '',
  actions: [],
  priority: 'normal',
  description: ''
})
const selectedEvent = ref<any>({})

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    error: '错误'
  }
  return statusMap[status] || status
}

/**
 * 获取联动类型文本
 */
const getIntegrationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    alarm: '告警联动',
    schedule: '定时联动',
    event: '事件联动',
    condition: '条件联动',
    manual: '手动联动'
  }
  return typeMap[type] || type
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
 * 获取性能颜色
 */
const getPerformanceColor = (value: number) => {
  if (value >= 90) return '#52c41a'
  if (value >= 70) return '#faad14'
  return '#f5222d'
}

/**
 * 获取事件状态颜色
 */
const getEventStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    processing: 'blue'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取事件状态文本
 */
const getEventStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    processing: '处理中'
  }
  return textMap[status] || status
}

/**
 * 保存规则配置
 */
const saveRuleConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    message.success('联动规则保存成功')
  }, 1000)
}

/**
 * 重置规则配置
 */
const resetRuleConfig = () => {
  Object.assign(ruleData, {
    integrationType: '',
    triggerCondition: '',
    actions: [],
    targetSystems: [],
    priority: 'normal'
  })
  message.info('规则已重置')
}

/**
 * 测试规则配置
 */
const testRuleConfig = () => {
  message.info('开始测试联动规则')
}

/**
 * 添加规则
 */
const addRule = () => {
  Object.assign(editingRule, {
    id: '',
    name: '',
    type: '',
    condition: '',
    actions: [],
    priority: 'normal',
    description: ''
  })
  ruleModalVisible.value = true
}

/**
 * 编辑规则
 */
const editRule = (rule: any) => {
  Object.assign(editingRule, rule)
  ruleModalVisible.value = true
}

/**
 * 保存规则
 */
const saveRule = () => {
  if (!editingRule.name || !editingRule.type || !editingRule.condition) {
    message.error('请填写完整的规则信息')
    return
  }

  if (editingRule.id) {
    // 编辑现有规则
    const index = integrationRules.value.findIndex(r => r.id === editingRule.id)
    if (index !== -1) {
      Object.assign(integrationRules.value[index], editingRule)
    }
    message.success('规则更新成功')
  } else {
    // 添加新规则
    const newRule = {
      ...editingRule,
      id: `RULE${Date.now()}`,
      enabled: true
    }
    integrationRules.value.unshift(newRule)
    message.success('规则添加成功')
  }
  
  ruleModalVisible.value = false
}

/**
 * 取消规则编辑
 */
const cancelRule = () => {
  ruleModalVisible.value = false
}

/**
 * 删除规则
 */
const deleteRule = (rule: any) => {
  const index = integrationRules.value.findIndex(r => r.id === rule.id)
  if (index !== -1) {
    integrationRules.value.splice(index, 1)
    message.success('规则删除成功')
  }
}

/**
 * 切换规则状态
 */
const toggleRule = (rule: any) => {
  message.success(`规则 ${rule.name} ${rule.enabled ? '已启用' : '已禁用'}`)
}

/**
 * 搜索事件
 */
const onSearch = (value: string) => {
  console.log('搜索:', value)
  message.info(`搜索关键词: ${value}`)
}

/**
 * 刷新事件
 */
const refreshEvents = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('事件已刷新')
  }, 1000)
}

/**
 * 清空事件
 */
const clearEvents = () => {
  integrationEvents.value = []
  message.success('事件已清空')
}

/**
 * 查看事件详情
 */
const viewEventDetails = (event: any) => {
  selectedEvent.value = event
  eventDetailsModalVisible.value = true
}

/**
 * 重试事件
 */
const retryEvent = (event: any) => {
  message.info(`开始重试事件: ${event.name}`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('业务联动页面已加载')
})
</script>

<style lang="less" scoped>
.business-integration {
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

    .rule-config,
    .rule-management {
      height: 100%;
    }
  }

  .integration-monitor {
    margin-bottom: 24px;

    .monitor-item {
      .monitor-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #262626;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
      }

      .status-chart {
        .status-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 12px;

            &.active {
              background-color: #52c41a;
            }

            &.inactive {
              background-color: #d9d9d9;
            }

            &.error {
              background-color: #f5222d;
            }
          }

          .status-info {
            display: flex;
            justify-content: space-between;
            flex: 1;

            .status-name {
              color: #595959;
            }

            .status-count {
              font-weight: 500;
              color: #262626;
            }
          }
        }
      }

      .performance-chart {
        .performance-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .performance-label {
            width: 80px;
            font-size: 14px;
            color: #595959;
          }

          .performance-bar {
            flex: 1;
            margin: 0 12px;
          }

          .performance-value {
            width: 60px;
            font-size: 12px;
            color: #8c8c8c;
            text-align: right;
          }
        }
      }

      .integration-stats {
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .stat-label {
            color: #595959;
          }

          .stat-value {
            font-weight: 500;
            color: #262626;

            &.success {
              color: #52c41a;
            }

            &.failed {
              color: #f5222d;
            }
          }
        }
      }
    }
  }

  .event-management {
    .event-operations {
      margin-bottom: 16px;
    }
  }
}
</style>

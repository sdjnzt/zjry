<template>
  <div class="dispatch-config">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>调度配置</h1>
      <p>配置和管理视频调度系统的各项参数，优化调度策略和资源配置</p>
    </div>

    <!-- 配置概览 -->
    <div class="config-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <SettingOutlined />
                系统配置
              </span>
            </template>
            <div class="statistic-value">{{ configStats.system }}</div>
            <div class="statistic-desc">个配置项</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <ToolOutlined />
                策略配置
              </span>
            </template>
            <div class="statistic-value">{{ configStats.strategy }}</div>
            <div class="statistic-desc">个策略</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <TeamOutlined />
                权限配置
              </span>
            </template>
            <div class="statistic-value">{{ configStats.permission }}</div>
            <div class="statistic-desc">个权限组</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title>
                <MonitorOutlined />
                监控配置
              </span>
            </template>
            <div class="statistic-value">{{ configStats.monitor }}</div>
            <div class="statistic-desc">个监控项</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 配置管理区域 -->
    <div class="config-management">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 系统配置 -->
        <a-tab-pane key="system" tab="系统配置">
          <div class="tab-content">
            <a-card title="基础系统配置" class="config-card">
              <a-form
                ref="systemFormRef"
                :model="systemForm"
                :rules="systemFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
              >
                <a-form-item label="系统名称" name="systemName">
                  <a-input v-model:value="systemForm.systemName" placeholder="请输入系统名称" />
                </a-form-item>
                <a-form-item label="调度模式" name="dispatchMode">
                  <a-select v-model:value="systemForm.dispatchMode" placeholder="请选择调度模式">
                    <a-select-option value="auto">自动调度</a-select-option>
                    <a-select-option value="manual">手动调度</a-select-option>
                    <a-select-option value="hybrid">混合模式</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="并发数量" name="concurrencyLimit">
                  <a-input-number
                    v-model:value="systemForm.concurrencyLimit"
                    :min="1"
                    :max="100"
                    placeholder="请输入并发数量限制"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="超时时间(秒)" name="timeoutSeconds">
                  <a-input-number
                    v-model:value="systemForm.timeoutSeconds"
                    :min="30"
                    :max="3600"
                    placeholder="请输入超时时间"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="重试次数" name="retryCount">
                  <a-input-number
                    v-model:value="systemForm.retryCount"
                    :min="0"
                    :max="10"
                    placeholder="请输入重试次数"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="日志级别" name="logLevel">
                  <a-select v-model:value="systemForm.logLevel" placeholder="请选择日志级别">
                    <a-select-option value="debug">调试</a-select-option>
                    <a-select-option value="info">信息</a-select-option>
                    <a-select-option value="warn">警告</a-select-option>
                    <a-select-option value="error">错误</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="备注" name="remark">
                  <a-textarea
                    v-model:value="systemForm.remark"
                    placeholder="请输入备注信息"
                    :rows="2"
                  />
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 18, offset: 6 }">
                  <a-space>
                    <a-button type="primary" @click="saveSystemConfig">
                      <SaveOutlined />
                      保存配置
                    </a-button>
                    <a-button @click="resetSystemConfig">
                      <ReloadOutlined />
                      重置
                    </a-button>
                    <a-button @click="testSystemConfig">
                      <ExperimentOutlined />
                      测试配置
                    </a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 策略配置 -->
        <a-tab-pane key="strategy" tab="策略配置">
          <div class="tab-content">
            <a-card title="调度策略配置" class="config-card">
              <div class="strategy-header">
                <a-button type="primary" @click="showStrategyModal">
                  <PlusOutlined />
                  新建策略
                </a-button>
              </div>
              <a-table
                :columns="strategyColumns"
                :data-source="strategyList"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-switch
                      v-model:checked="record.enabled"
                      @change="toggleStrategyStatus(record)"
                    />
                  </template>
                  <template v-else-if="column.key === 'priority'">
                    <a-tag :color="getPriorityColor(record.priority)">
                      {{ getPriorityText(record.priority) }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="editStrategy(record)">
                        编辑
                      </a-button>
                      <a-button type="link" size="small" danger @click="deleteStrategy(record)">
                        删除
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 权限配置 -->
        <a-tab-pane key="permission" tab="权限配置">
          <div class="tab-content">
            <a-card title="权限组配置" class="config-card">
              <div class="permission-header">
                <a-button type="primary" @click="showPermissionModal">
                  <PlusOutlined />
                  新建权限组
                </a-button>
              </div>
              <a-table
                :columns="permissionColumns"
                :data-source="permissionList"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'permissions'">
                    <a-tag
                      v-for="perm in record.permissions"
                      :key="perm"
                      style="margin-bottom: 4px"
                    >
                      {{ perm }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="editPermission(record)">
                        编辑
                      </a-button>
                      <a-button type="link" size="small" danger @click="deletePermission(record)">
                        删除
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 监控配置 -->
        <a-tab-pane key="monitor" tab="监控配置">
          <div class="tab-content">
            <a-card title="监控项配置" class="config-card">
              <a-form
                ref="monitorFormRef"
                :model="monitorForm"
                :rules="monitorFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
              >
                <a-form-item label="监控开关" name="monitorEnabled">
                  <a-switch v-model:checked="monitorForm.monitorEnabled" />
                </a-form-item>
                <a-form-item label="监控间隔(秒)" name="monitorInterval">
                  <a-input-number
                    v-model:value="monitorForm.monitorInterval"
                    :min="5"
                    :max="300"
                    placeholder="请输入监控间隔"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="告警阈值" name="alertThreshold">
                  <a-input-number
                    v-model:value="monitorForm.alertThreshold"
                    :min="1"
                    :max="100"
                    placeholder="请输入告警阈值"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="告警方式" name="alertMethods">
                  <a-checkbox-group v-model:value="monitorForm.alertMethods">
                    <a-checkbox value="email">邮件</a-checkbox>
                    <a-checkbox value="sms">短信</a-checkbox>
                    <a-checkbox value="phone">电话</a-checkbox>
                    <a-checkbox value="system">系统通知</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                <a-form-item label="监控项目" name="monitorItems">
                  <a-checkbox-group v-model:value="monitorForm.monitorItems">
                    <a-checkbox value="resource">资源状态</a-checkbox>
                    <a-checkbox value="performance">性能指标</a-checkbox>
                    <a-checkbox value="network">网络状态</a-checkbox>
                    <a-checkbox value="system">系统状态</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 18, offset: 6 }">
                  <a-space>
                    <a-button type="primary" @click="saveMonitorConfig">
                      <SaveOutlined />
                      保存配置
                    </a-button>
                    <a-button @click="resetMonitorConfig">
                      <ReloadOutlined />
                      重置
                    </a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 策略配置弹窗 -->
    <a-modal
      v-model:open="strategyModalVisible"
      :title="strategyModalTitle"
      width="600px"
      @ok="handleStrategyOk"
      @cancel="handleStrategyCancel"
    >
      <a-form
        ref="strategyFormRef"
        :model="strategyForm"
        :rules="strategyFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="策略名称" name="name">
          <a-input v-model:value="strategyForm.name" placeholder="请输入策略名称" />
        </a-form-item>
        <a-form-item label="策略类型" name="type">
          <a-select v-model:value="strategyForm.type" placeholder="请选择策略类型">
            <a-select-option value="resource">资源调度</a-select-option>
            <a-select-option value="priority">优先级调度</a-select-option>
            <a-select-option value="load">负载均衡</a-select-option>
            <a-select-option value="custom">自定义策略</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="strategyForm.priority" placeholder="请选择优先级">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="策略描述" name="description">
          <a-textarea
            v-model:value="strategyForm.description"
            placeholder="请输入策略描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="策略参数" name="parameters">
          <a-textarea
            v-model:value="strategyForm.parameters"
            placeholder="请输入策略参数(JSON格式)"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="strategyForm.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限配置弹窗 -->
    <a-modal
      v-model:open="permissionModalVisible"
      :title="permissionModalTitle"
      width="600px"
      @ok="handlePermissionOk"
      @cancel="handlePermissionCancel"
    >
      <a-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="权限组名称" name="name">
          <a-input v-model:value="permissionForm.name" placeholder="请输入权限组名称" />
        </a-form-item>
        <a-form-item label="权限组描述" name="description">
          <a-textarea
            v-model:value="permissionForm.description"
            placeholder="请输入权限组描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="权限选择" name="permissions">
          <a-checkbox-group v-model:value="permissionForm.permissions">
            <a-row>
              <a-col :span="12">
                <a-checkbox value="dispatch_create">创建调度</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="dispatch_edit">编辑调度</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="dispatch_delete">删除调度</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="dispatch_execute">执行调度</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="resource_manage">资源管理</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="config_manage">配置管理</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="system_monitor">系统监控</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="log_view">日志查看</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="permissionForm.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  SettingOutlined,
  ToolOutlined,
  TeamOutlined,
  MonitorOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'

/**
 * 系统配置表单接口
 */
interface SystemForm {
  systemName: string
  dispatchMode: string
  concurrencyLimit: number
  timeoutSeconds: number
  retryCount: number
  logLevel: string
  remark: string
}

/**
 * 策略配置接口
 */
interface StrategyConfig {
  id: string
  name: string
  type: string
  priority: string
  description: string
  parameters: string
  enabled: boolean
  remark: string
}

/**
 * 权限配置接口
 */
interface PermissionConfig {
  id: string
  name: string
  description: string
  permissions: string[]
  remark: string
}

/**
 * 监控配置表单接口
 */
interface MonitorForm {
  monitorEnabled: boolean
  monitorInterval: number
  alertThreshold: number
  alertMethods: string[]
  monitorItems: string[]
}

// 响应式数据
const activeTab = ref('system')
const strategyModalVisible = ref(false)
const strategyModalTitle = ref('新建策略')
const permissionModalVisible = ref(false)
const permissionModalTitle = ref('新建权限组')
const isEditStrategy = ref(false)
const isEditPermission = ref(false)
const selectedStrategy = ref<StrategyConfig>({} as StrategyConfig)
const selectedPermission = ref<PermissionConfig>({} as PermissionConfig)

// 配置统计数据
const configStats = reactive({
  system: 8,
  strategy: 12,
  permission: 6,
  monitor: 10
})

// 系统配置表单
const systemFormRef = ref()
const systemForm = reactive<SystemForm>({
  systemName: '智慧船舶视频调度系统',
  dispatchMode: 'hybrid',
  concurrencyLimit: 20,
  timeoutSeconds: 300,
  retryCount: 3,
  logLevel: 'info',
  remark: '系统基础配置'
})

// 系统配置表单验证规则
const systemFormRules = {
  systemName: [{ required: true, message: '请输入系统名称' }],
  dispatchMode: [{ required: true, message: '请选择调度模式' }],
  concurrencyLimit: [{ required: true, message: '请输入并发数量限制' }],
  timeoutSeconds: [{ required: true, message: '请输入超时时间' }],
  retryCount: [{ required: true, message: '请输入重试次数' }],
  logLevel: [{ required: true, message: '请选择日志级别' }]
}

// 策略配置表单
const strategyFormRef = ref()
const strategyForm = reactive<StrategyConfig>({
  id: '',
  name: '',
  type: '',
  priority: '',
  description: '',
  parameters: '',
  enabled: true,
  remark: ''
})

// 策略配置表单验证规则
const strategyFormRules = {
  name: [{ required: true, message: '请输入策略名称' }],
  type: [{ required: true, message: '请选择策略类型' }],
  priority: [{ required: true, message: '请选择优先级' }],
  description: [{ required: true, message: '请输入策略描述' }]
}

// 权限配置表单
const permissionFormRef = ref()
const permissionForm = reactive<PermissionConfig>({
  id: '',
  name: '',
  description: '',
  permissions: [],
  remark: ''
})

// 权限配置表单验证规则
const permissionFormRules = {
  name: [{ required: true, message: '请输入权限组名称' }],
  description: [{ required: true, message: '请输入权限组描述' }],
  permissions: [{ required: true, message: '请选择权限项' }]
}

// 监控配置表单
const monitorFormRef = ref()
const monitorForm = reactive<MonitorForm>({
  monitorEnabled: true,
  monitorInterval: 30,
  alertThreshold: 80,
  alertMethods: ['email', 'system'],
  monitorItems: ['resource', 'performance', 'network']
})

// 监控配置表单验证规则
const monitorFormRules = {
  monitorInterval: [{ required: true, message: '请输入监控间隔' }],
  alertThreshold: [{ required: true, message: '请输入告警阈值' }],
  alertMethods: [{ required: true, message: '请选择告警方式' }],
  monitorItems: [{ required: true, message: '请选择监控项目' }]
}

// 策略列表数据
const strategyList = ref<StrategyConfig[]>([
  {
    id: '1',
    name: '资源优先策略',
    type: 'resource',
    priority: 'high',
    description: '优先调度可用资源最多的区域',
    parameters: '{"resourceWeight": 0.8, "distanceWeight": 0.2}',
    enabled: true,
    remark: '适用于资源分布不均的情况'
  },
  {
    id: '2',
    name: '负载均衡策略',
    type: 'load',
    priority: 'medium',
    description: '根据当前负载情况均衡分配任务',
    parameters: '{"loadThreshold": 0.7, "balanceFactor": 0.5}',
    enabled: true,
    remark: '适用于负载波动较大的情况'
  },
  {
    id: '3',
    name: '优先级调度策略',
    type: 'priority',
    priority: 'high',
    description: '严格按照任务优先级进行调度',
    parameters: '{"priorityWeight": 1.0, "timeWeight": 0.3}',
    enabled: false,
    remark: '适用于紧急任务较多的场景'
  }
])

// 权限列表数据
const permissionList = ref<PermissionConfig[]>([
  {
    id: '1',
    name: '系统管理员',
    description: '拥有系统所有权限',
    permissions: ['dispatch_create', 'dispatch_edit', 'dispatch_delete', 'dispatch_execute', 'resource_manage', 'config_manage', 'system_monitor', 'log_view'],
    remark: '最高权限组'
  },
  {
    id: '2',
    name: '调度操作员',
    description: '负责日常调度操作',
    permissions: ['dispatch_create', 'dispatch_edit', 'dispatch_execute', 'resource_manage'],
    remark: '日常操作权限'
  },
  {
    id: '3',
    name: '监控查看员',
    description: '只能查看系统状态和日志',
    permissions: ['system_monitor', 'log_view'],
    remark: '只读权限'
  }
])

// 策略表格列定义
const strategyColumns = [
  {
    title: '策略名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '策略类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    customRender: ({ text }: { text: string }) => getStrategyTypeText(text)
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

// 权限表格列定义
const permissionColumns = [
  {
    title: '权限组名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200
  },
  {
    title: '权限项',
    dataIndex: 'permissions',
    key: 'permissions',
    width: 300
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

/**
 * 获取策略类型文本
 */
const getStrategyTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    resource: '资源调度',
    priority: '优先级调度',
    load: '负载均衡',
    custom: '自定义策略'
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
 * 保存系统配置
 */
const saveSystemConfig = () => {
  systemFormRef.value?.validate().then(() => {
    message.success('系统配置保存成功')
  })
}

/**
 * 重置系统配置
 */
const resetSystemConfig = () => {
  Object.assign(systemForm, {
    systemName: '智慧船舶视频调度系统',
    dispatchMode: 'hybrid',
    concurrencyLimit: 20,
    timeoutSeconds: 300,
    retryCount: 3,
    logLevel: 'info',
    remark: '系统基础配置'
  })
  message.info('系统配置已重置')
}

/**
 * 测试系统配置
 */
const testSystemConfig = () => {
  message.success('系统配置测试功能开发中')
}

/**
 * 显示策略弹窗
 */
const showStrategyModal = () => {
  strategyModalTitle.value = '新建策略'
  isEditStrategy.value = false
  resetStrategyForm()
  strategyModalVisible.value = true
}

/**
 * 编辑策略
 */
const editStrategy = (record: StrategyConfig) => {
  strategyModalTitle.value = '编辑策略'
  isEditStrategy.value = true
  selectedStrategy.value = record
  Object.assign(strategyForm, record)
  strategyModalVisible.value = true
}

/**
 * 切换策略状态
 */
const toggleStrategyStatus = (record: StrategyConfig) => {
  const action = record.enabled ? '启用' : '禁用'
  message.success(`策略"${record.name}"已${action}`)
}

/**
 * 删除策略
 */
const deleteStrategy = (record: StrategyConfig) => {
  Modal.confirm({
    title: '确认删除策略',
    content: `确定要删除策略"${record.name}"吗？此操作不可恢复。`,
    onOk: () => {
      const index = strategyList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        strategyList.value.splice(index, 1)
        message.success('策略删除成功')
      }
    }
  })
}

/**
 * 处理策略确认
 */
const handleStrategyOk = () => {
  strategyFormRef.value?.validate().then(() => {
    if (isEditStrategy.value) {
      // 编辑策略
      const index = strategyList.value.findIndex(item => item.id === selectedStrategy.value.id)
      if (index > -1) {
        Object.assign(strategyList.value[index], strategyForm)
        message.success('策略更新成功')
      }
    } else {
      // 新建策略
      const newStrategy: StrategyConfig = {
        ...strategyForm,
        id: Date.now().toString()
      }
      strategyList.value.push(newStrategy)
      message.success('策略创建成功')
    }
    strategyModalVisible.value = false
  })
}

/**
 * 处理策略取消
 */
const handleStrategyCancel = () => {
  strategyModalVisible.value = false
  resetStrategyForm()
}

/**
 * 重置策略表单
 */
const resetStrategyForm = () => {
  Object.assign(strategyForm, {
    id: '',
    name: '',
    type: '',
    priority: '',
    description: '',
    parameters: '',
    enabled: true,
    remark: ''
  })
}

/**
 * 显示权限弹窗
 */
const showPermissionModal = () => {
  permissionModalTitle.value = '新建权限组'
  isEditPermission.value = false
  resetPermissionForm()
  permissionModalVisible.value = true
}

/**
 * 编辑权限
 */
const editPermission = (record: PermissionConfig) => {
  permissionModalTitle.value = '编辑权限组'
  isEditPermission.value = true
  selectedPermission.value = record
  Object.assign(permissionForm, record)
  permissionModalVisible.value = true
}

/**
 * 删除权限
 */
const deletePermission = (record: PermissionConfig) => {
  Modal.confirm({
    title: '确认删除权限组',
    content: `确定要删除权限组"${record.name}"吗？此操作不可恢复。`,
    onOk: () => {
      const index = permissionList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        permissionList.value.splice(index, 1)
        message.success('权限组删除成功')
      }
    }
  })
}

/**
 * 处理权限确认
 */
const handlePermissionOk = () => {
  permissionFormRef.value?.validate().then(() => {
    if (isEditPermission.value) {
      // 编辑权限
      const index = permissionList.value.findIndex(item => item.id === selectedPermission.value.id)
      if (index > -1) {
        Object.assign(permissionList.value[index], permissionForm)
        message.success('权限组更新成功')
      }
    } else {
      // 新建权限
      const newPermission: PermissionConfig = {
        ...permissionForm,
        id: Date.now().toString()
      }
      permissionList.value.push(newPermission)
      message.success('权限组创建成功')
    }
    permissionModalVisible.value = false
  })
}

/**
 * 处理权限取消
 */
const handlePermissionCancel = () => {
  permissionModalVisible.value = false
  resetPermissionForm()
}

/**
 * 重置权限表单
 */
const resetPermissionForm = () => {
  Object.assign(permissionForm, {
    id: '',
    name: '',
    description: '',
    permissions: [],
    remark: ''
  })
}

/**
 * 保存监控配置
 */
const saveMonitorConfig = () => {
  monitorFormRef.value?.validate().then(() => {
    message.success('监控配置保存成功')
  })
}

/**
 * 重置监控配置
 */
const resetMonitorConfig = () => {
  Object.assign(monitorForm, {
    monitorEnabled: true,
    monitorInterval: 30,
    alertThreshold: 80,
    alertMethods: ['email', 'system'],
    monitorItems: ['resource', 'performance', 'network']
  })
  message.info('监控配置已重置')
}

// 组件挂载时初始化数据
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="less" scoped>
.dispatch-config {
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

  .config-overview {
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
      }

      .statistic-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .config-management {
    .tab-content {
      .config-card {
        .strategy-header,
        .permission-header {
          margin-bottom: 16px;
        }

        :deep(.ant-table-thead > tr > th) {
          background: #fafafa;
          font-weight: 600;
        }

        :deep(.ant-table-tbody > tr:hover > td) {
          background: #f5f5f5;
        }
      }

      :deep(.ant-form-item) {
        margin-bottom: 16px;
      }
    }
  }

  :deep(.ant-tabs-tab) {
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.ant-modal-header) {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-checkbox-group) {
    .ant-checkbox-wrapper {
      margin-bottom: 8px;
    }
  }
}
</style>

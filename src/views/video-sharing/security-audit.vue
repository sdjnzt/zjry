<template>
  <div class="security-audit">
    <div class="page-header">
      <h2>安全审计日志</h2>
      <p>完整的操作记录和追溯，确保系统安全和合规性</p>
    </div>

    <!-- 审计统计概览 -->
    <div class="audit-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日操作"
              :value="auditStats.todayOperations"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <FileTextOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="安全事件"
              :value="auditStats.securityEvents"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <WarningOutlined style="color: #ff4d4f; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="访问次数"
              :value="auditStats.accessCount"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <EyeOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="异常登录"
              :value="auditStats.abnormalLogins"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <ExclamationCircleOutlined style="color: #faad14; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="严重事件"
              :value="auditStats.criticalEvents"
              :value-style="{ color: '#cf1322' }"
            >
              <template #suffix>
                <WarningOutlined style="color: #cf1322; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="警告事件"
              :value="auditStats.warningEvents"
              :value-style="{ color: '#d46b08' }"
            >
              <template #suffix>
                <ExclamationCircleOutlined style="color: #d46b08; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="错误事件"
              :value="auditStats.errorEvents"
              :value-style="{ color: '#a8071a' }"
            >
              <template #suffix>
                <InfoCircleOutlined style="color: #a8071a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="活跃用户"
              :value="auditStats.uniqueUsers"
              :value-style="{ color: '#722ed1' }"
            >
              <template #suffix>
                <UserOutlined style="color: #722ed1; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要功能区域 -->
    <div class="audit-content">
      <a-row :gutter="16">
        <!-- 审计日志列表 -->
        <a-col :span="18">
          <a-card title="审计日志" class="audit-log-card">
            <template #extra>
              <a-space>
                <a-range-picker
                  v-model:value="dateRange"
                  :show-time="{ format: 'HH:mm:ss' }"
                  format="YYYY-MM-DD HH:mm:ss"
                  @change="handleDateRangeChange"
                />
                <a-select
                  v-model:value="logFilter.level"
                  placeholder="日志级别"
                  style="width: 120px"
                  @change="handleFilterChange"
                >
                  <a-select-option value="">全部级别</a-select-option>
                  <a-select-option value="info">信息</a-select-option>
                  <a-select-option value="warning">警告</a-select-option>
                  <a-select-option value="error">错误</a-select-option>
                  <a-select-option value="critical">严重</a-select-option>
                </a-select>
                <a-select
                  v-model:value="logFilter.category"
                  placeholder="操作类型"
                  style="width: 120px"
                  @change="handleFilterChange"
                >
                  <a-select-option value="">全部类型</a-select-option>
                  <a-select-option value="login">登录</a-select-option>
                  <a-select-option value="access">访问</a-select-option>
                  <a-select-option value="operation">操作</a-select-option>
                  <a-select-option value="system">系统</a-select-option>
                </a-select>
                <a-button type="primary" @click="refreshAuditLogs">
                  <ReloadOutlined />
                  刷新
                </a-button>
                <a-button @click="exportAuditLogs">
                  <ExportOutlined />
                  导出
                </a-button>
              </a-space>
            </template>
            
            <a-table
              :columns="auditColumns"
              :data-source="filteredAuditLogs"
              :loading="loading"
              :pagination="pagination"
              row-key="id"
              size="small"
              :scroll="{ x: 1200 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <a-tag :color="getLevelColor(record.level)">
                    {{ getLevelText(record.level) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'category'">
                  <a-tag :color="getCategoryColor(record.category)">
                    {{ getCategoryText(record.category) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'user'">
                  <div class="user-info">
                    <div class="user-name">{{ record.user }}</div>
                    <div class="user-role">{{ record.userRole }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'operation'">
                  <div class="operation-info">
                    <div class="operation-name">{{ record.operation }}</div>
                    <div class="operation-target">{{ record.target }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'result'">
                  <a-tag :color="record.success ? 'green' : 'red'">
                    {{ record.success ? '成功' : '失败' }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'clientInfo'">
                  <div class="client-info">
                    <div class="client-ip">{{ record.clientIp }}</div>
                    <div class="client-location">{{ record.location }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'timestamp'">
                  <div class="timestamp-info">
                    <div class="timestamp">{{ formatTime(record.timestamp) }}</div>
                    <div class="duration">{{ getDurationText(record.timestamp) }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewLogDetails(record)">
                      <EyeOutlined />
                      详情
                    </a-button>
                    <a-button type="link" size="small" @click="traceOperation(record)">
                      <SearchOutlined />
                      追踪
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 实时监控面板 -->
        <a-col :span="6">
          <a-card title="实时监控" class="monitor-card">
            <template #extra>
              <a-badge :dot="realTimeMonitoring">
                <BellOutlined style="font-size: 16px" />
              </a-badge>
            </template>
            
            <!-- 实时告警 -->
            <div class="real-time-alerts">
              <h4>实时告警</h4>
              <div class="alert-list">
                <div
                  v-for="alert in realtimeAlerts"
                  :key="alert.id"
                  class="alert-item"
                  :class="`alert-${alert.level}`"
                >
                  <div class="alert-header">
                    <div class="alert-level">
                      <ExclamationCircleOutlined v-if="alert.level === 'critical'" />
                      <WarningOutlined v-else-if="alert.level === 'warning'" />
                      <InfoCircleOutlined v-else />
                    </div>
                    <div class="alert-time">{{ formatTime(alert.time) }}</div>
                  </div>
                  <div class="alert-message">{{ alert.message }}</div>
                </div>
              </div>
            </div>

            <!-- 在线用户 -->
            <div class="online-users">
              <h4>在线用户</h4>
              <div class="user-list">
                <div
                  v-for="user in onlineUsers"
                  :key="user.id"
                  class="user-item"
                >
                  <div class="user-avatar">
                    <UserOutlined />
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-status">{{ user.status }}</div>
                    <div class="user-login-time">{{ formatTime(user.loginTime) }}</div>
                  </div>
                  <div class="user-location">{{ user.location }}</div>
                </div>
              </div>
            </div>

            <!-- 系统状态 -->
            <div class="system-status">
              <h4>系统状态</h4>
              <div class="status-metrics">
                <div class="metric-item">
                  <span class="metric-label">CPU使用率:</span>
                  <a-progress
                    :percent="systemMetrics.cpuUsage"
                    :stroke-color="getMetricColor(systemMetrics.cpuUsage)"
                    size="small"
                    style="width: 80px"
                  />
                  <span class="metric-value">{{ systemMetrics.cpuUsage }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">内存使用率:</span>
                  <a-progress
                    :percent="systemMetrics.memoryUsage"
                    :stroke-color="getMetricColor(systemMetrics.memoryUsage)"
                    size="small"
                    style="width: 80px"
                  />
                  <span class="metric-value">{{ systemMetrics.memoryUsage }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">磁盘使用率:</span>
                  <a-progress
                    :percent="systemMetrics.diskUsage"
                    :stroke-color="getMetricColor(systemMetrics.diskUsage)"
                    size="small"
                    style="width: 80px"
                  />
                  <span class="metric-value">{{ systemMetrics.diskUsage }}%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 统计图表 -->
    <div class="audit-statistics">
      <a-card title="审计统计" class="statistics-card">
        <template #extra>
          <a-radio-group v-model:value="statisticsPeriod" size="small" @change="updateChartData">
            <a-radio-button value="today">今天</a-radio-button>
            <a-radio-button value="week">本周</a-radio-button>
            <a-radio-button value="month">本月</a-radio-button>
            <a-radio-button value="year">本年</a-radio-button>
          </a-radio-group>
        </template>
        
        <a-tabs v-model:activeKey="chartActiveTab" class="chart-tabs" @change="handleChartTabChange">
          <!-- 操作类型分布 -->
          <a-tab-pane key="operation" tab="操作类型分布">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="operationChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
          
          <!-- 日志级别趋势 -->
          <a-tab-pane key="level" tab="日志级别趋势">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="levelChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
          
          <!-- 用户活跃度 -->
          <a-tab-pane key="user" tab="用户活跃度">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="userChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
          
          <!-- 访问趋势 -->
          <a-tab-pane key="access" tab="访问趋势">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="accessChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
          
          <!-- 安全事件分析 -->
          <a-tab-pane key="security" tab="安全事件分析">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="securityChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
          
          <!-- 地理位置分布 -->
          <a-tab-pane key="location" tab="地理位置分布">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="locationChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 日志详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      title="日志详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedLog" class="log-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="日志ID">
            {{ selectedLog.id }}
          </a-descriptions-item>
          <a-descriptions-item label="日志级别">
            <a-tag :color="getLevelColor(selectedLog.level)">
              {{ getLevelText(selectedLog.level) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作类型">
            <a-tag :color="getCategoryColor(selectedLog.category)">
              {{ getCategoryText(selectedLog.category) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="执行结果">
            <a-tag :color="selectedLog.success ? 'green' : 'red'">
              {{ selectedLog.success ? '成功' : '失败' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作用户">
            {{ selectedLog.user }}
          </a-descriptions-item>
          <a-descriptions-item label="用户角色">
            {{ selectedLog.userRole }}
          </a-descriptions-item>
          <a-descriptions-item label="客户端IP">
            {{ selectedLog.clientIp }}
          </a-descriptions-item>
          <a-descriptions-item label="地理位置">
            {{ selectedLog.location }}
          </a-descriptions-item>
          <a-descriptions-item label="操作时间" :span="2">
            {{ formatTime(selectedLog.timestamp) }}
          </a-descriptions-item>
          <a-descriptions-item label="操作描述" :span="2">
            {{ selectedLog.operation }}
          </a-descriptions-item>
          <a-descriptions-item label="操作目标" :span="2">
            {{ selectedLog.target }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 请求详情 -->
        <div class="request-details">
          <h4>请求详情</h4>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="请求方法">
              {{ selectedLog.requestMethod || 'GET' }}
            </a-descriptions-item>
            <a-descriptions-item label="请求路径">
              {{ selectedLog.requestPath || '/api/v1/resources' }}
            </a-descriptions-item>
            <a-descriptions-item label="用户代理">
              {{ selectedLog.userAgent || 'Mozilla/5.0...' }}
            </a-descriptions-item>
            <a-descriptions-item label="会话ID">
              {{ selectedLog.sessionId || 'sess_' + selectedLog.id }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 响应详情 -->
        <div class="response-details">
          <h4>响应详情</h4>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="响应状态">
              {{ selectedLog.responseStatus || '200 OK' }}
            </a-descriptions-item>
            <a-descriptions-item label="响应时间">
              {{ selectedLog.responseTime || '125' }}ms
            </a-descriptions-item>
            <a-descriptions-item label="数据大小">
              {{ selectedLog.responseSize || '1024' }}字节
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 错误信息 -->
        <div v-if="!selectedLog.success" class="error-details">
          <h4>错误信息</h4>
          <a-alert
            :message="selectedLog.errorMessage || '操作失败'"
            :description="selectedLog.errorDetails || '具体错误详情信息'"
            type="error"
            show-icon
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  WarningOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  SearchOutlined,
  BellOutlined,
  InfoCircleOutlined,
  UserOutlined,
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

/**
 * 审计日志接口
 */
interface AuditLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  category: 'login' | 'access' | 'operation' | 'system'
  user: string
  userRole: string
  operation: string
  target: string
  success: boolean
  clientIp: string
  location: string
  timestamp: string
  requestMethod?: string
  requestPath?: string
  userAgent?: string
  sessionId?: string
  responseStatus?: string
  responseTime?: number
  responseSize?: number
  errorMessage?: string
  errorDetails?: string
}

/**
 * 实时告警接口
 */
interface RealtimeAlert {
  id: string
  level: 'info' | 'warning' | 'critical'
  message: string
  time: string
}

/**
 * 在线用户接口
 */
interface OnlineUser {
  id: string
  name: string
  status: string
  loginTime: string
  location: string
}

/**
 * 系统指标接口
 */
interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

/**
 * 响应式数据
 */
const loading = ref(false)
const realTimeMonitoring = ref(true)
const dateRange = ref([])
const statisticsPeriod = ref('today')
const selectedLog = ref<AuditLog | null>(null)
const chartLoading = ref(false)

// 图表相关变量
const chartActiveTab = ref('operation')
const operationChartRef = ref<HTMLElement>()
const levelChartRef = ref<HTMLElement>()
const userChartRef = ref<HTMLElement>()
const accessChartRef = ref<HTMLElement>()
const securityChartRef = ref<HTMLElement>()
const locationChartRef = ref<HTMLElement>()

const operationChart = ref<echarts.ECharts>()
const levelChart = ref<echarts.ECharts>()
const userChart = ref<echarts.ECharts>()
const accessChart = ref<echarts.ECharts>()
const securityChart = ref<echarts.ECharts>()
const locationChart = ref<echarts.ECharts>()

const logFilter = reactive({
  level: '',
  category: ''
})

const detailModal = reactive({
  visible: false
})

/**
 * 审计统计数据
 */
const auditStats = reactive({
  todayOperations: 1247,
  securityEvents: 3,
  accessCount: 8956,
  abnormalLogins: 2,
  totalLogs: 15678,
  criticalEvents: 8,
  warningEvents: 45,
  errorEvents: 23,
  successfulOperations: 11890,
  failedOperations: 788,
  uniqueUsers: 89,
  uniqueIPs: 156
})

/**
 * 系统指标数据
 */
const systemMetrics = reactive<SystemMetrics>({
  cpuUsage: 45,
  memoryUsage: 68,
  diskUsage: 72
})

/**
 * 分页配置
 */
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

/**
 * 模拟审计日志数据
 */
const auditLogs = ref<AuditLog[]>([
  {
    id: 'audit_001',
    level: 'info',
    category: 'login',
    user: '管理员',
    userRole: '系统管理员',
    operation: '用户登录',
    target: '管理控制台',
    success: true,
    clientIp: '192.168.1.100',
    location: '上海市',
    timestamp: dayjs().subtract(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'POST',
    requestPath: '/api/auth/login',
    responseStatus: '200 OK',
    responseTime: 156
  },
  {
    id: 'audit_002',
    level: 'warning',
    category: 'access',
    user: '操作员A',
    userRole: '操作员',
    operation: '访问敏感资源',
    target: '港区A-摄像头01',
    success: true,
    clientIp: '192.168.1.101',
    location: '北京市',
    timestamp: dayjs().subtract(25, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'GET',
    requestPath: '/api/resources/camera/001',
    responseStatus: '200 OK',
    responseTime: 89
  },
  {
    id: 'audit_003',
    level: 'error',
    category: 'operation',
    user: '未知用户',
    userRole: '未授权',
    operation: '尝试删除设备',
    target: '航道-传感器01',
    success: false,
    clientIp: '203.156.78.92',
    location: '未知地区',
    timestamp: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'DELETE',
    requestPath: '/api/devices/sensor/001',
    responseStatus: '403 Forbidden',
    responseTime: 45,
    errorMessage: '权限不足',
    errorDetails: '用户没有删除设备的权限'
  },
  {
    id: 'audit_004',
    level: 'critical',
    category: 'system',
    user: '系统',
    userRole: '系统',
    operation: '系统异常',
    target: '数据库连接',
    success: false,
    clientIp: '127.0.0.1',
    location: '本地',
    timestamp: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    errorMessage: '数据库连接失败',
    errorDetails: 'Connection timeout after 30 seconds'
  },
  {
    id: 'audit_005',
    level: 'info',
    category: 'operation',
    user: '监控员B',
    userRole: '监控员',
    operation: '修改摄像头参数',
    target: '济宁港主码头-高清监控01',
    success: true,
    clientIp: '192.168.1.102',
    location: '济宁市',
    timestamp: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'PUT',
    requestPath: '/api/cameras/001/params',
    responseStatus: '200 OK',
    responseTime: 234
  },
  {
    id: 'audit_006',
    level: 'warning',
    category: 'access',
    user: '操作员C',
    userRole: '操作员',
    operation: '访问系统配置',
    target: '系统设置',
    success: true,
    clientIp: '192.168.1.103',
    location: '济南市',
    timestamp: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'GET',
    requestPath: '/api/system/config',
    responseStatus: '200 OK',
    responseTime: 156
  },
  {
    id: 'audit_007',
    level: 'error',
    category: 'operation',
    user: '维护员A',
    userRole: '维护员',
    operation: '重启设备',
    target: '济宁港-环境监测站',
    success: false,
    clientIp: '192.168.1.104',
    location: '济宁市',
    timestamp: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'POST',
    requestPath: '/api/devices/environment/restart',
    responseStatus: '500 Internal Server Error',
    responseTime: 3000,
    errorMessage: '设备重启失败',
    errorDetails: '设备当前状态不允许重启操作'
  },
  {
    id: 'audit_008',
    level: 'critical',
    category: 'system',
    user: '系统',
    userRole: '系统',
    operation: '磁盘空间不足',
    target: '存储系统',
    success: false,
    clientIp: '127.0.0.1',
    location: '本地',
    timestamp: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    errorMessage: '磁盘空间不足',
    errorDetails: '系统磁盘使用率超过90%，需要清理或扩容'
  },
  {
    id: 'audit_009',
    level: 'info',
    category: 'login',
    user: '安全员A',
    userRole: '安全员',
    operation: '用户登录',
    target: '安全监控系统',
    success: true,
    clientIp: '192.168.1.105',
    location: '青岛市',
    timestamp: dayjs().subtract(7, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'POST',
    requestPath: '/api/auth/login',
    responseStatus: '200 OK',
    responseTime: 189
  },
  {
    id: 'audit_010',
    level: 'warning',
    category: 'access',
    user: '未知用户',
    userRole: '未授权',
    operation: '尝试访问管理接口',
    target: '用户管理',
    success: false,
    clientIp: '203.156.78.93',
    location: '未知地区',
    timestamp: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: 'GET',
    requestPath: '/api/admin/users',
    responseStatus: '401 Unauthorized',
    responseTime: 23,
    errorMessage: '未授权访问',
    errorDetails: '用户未登录或会话已过期'
  }
])

/**
 * 模拟实时告警数据
 */
const realtimeAlerts = ref<RealtimeAlert[]>([
  {
    id: 'alert_001',
    level: 'critical',
    message: '检测到异常登录尝试',
    time: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_002',
    level: 'warning',
    message: '系统CPU使用率过高',
    time: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_003',
    level: 'info',
    message: '用户权限已更新',
    time: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_004',
    level: 'critical',
    message: '数据库连接异常',
    time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_005',
    level: 'warning',
    message: '磁盘空间不足警告',
    time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_006',
    level: 'info',
    message: '系统备份完成',
    time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_007',
    level: 'critical',
    message: '网络连接中断',
    time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'alert_008',
    level: 'warning',
    message: '内存使用率过高',
    time: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss')
  }
])

/**
 * 模拟在线用户数据
 */
const onlineUsers = ref<OnlineUser[]>([
  {
    id: 'user_001',
    name: '管理员',
    status: '活跃',
    loginTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    location: '上海市'
  },
  {
    id: 'user_002',
    name: '操作员A',
    status: '在线',
    loginTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    location: '北京市'
  },
  {
    id: 'user_003',
    name: '监控员B',
    status: '空闲',
    loginTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    location: '广州市'
  },
  {
    id: 'user_004',
    name: '维护员A',
    status: '在线',
    loginTime: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    location: '济宁市'
  },
  {
    id: 'user_005',
    name: '安全员A',
    status: '活跃',
    loginTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    location: '青岛市'
  },
  {
    id: 'user_006',
    name: '操作员B',
    status: '空闲',
    loginTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    location: '济南市'
  },
  {
    id: 'user_007',
    name: '监控员C',
    status: '在线',
    loginTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    location: '烟台市'
  },
  {
    id: 'user_008',
    name: '维护员B',
    status: '活跃',
    loginTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    location: '潍坊市'
  }
])

/**
 * 过滤后的审计日志
 */
const filteredAuditLogs = computed(() => {
  let logs = auditLogs.value
  
  if (logFilter.level) {
    logs = logs.filter(log => log.level === logFilter.level)
  }
  
  if (logFilter.category) {
    logs = logs.filter(log => log.category === logFilter.category)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    logs = logs.filter(log => {
      const logTime = dayjs(log.timestamp)
      return logTime.isAfter(start) && logTime.isBefore(end)
    })
  }
  
  return logs
})

/**
 * 表格列定义
 */
const auditColumns = [
  {
    title: '级别',
    key: 'level',
    width: 80,
    fixed: 'left'
  },
  {
    title: '类型',
    key: 'category',
    width: 100
  },
  {
    title: '用户',
    key: 'user',
    width: 120
  },
  {
    title: '操作',
    key: 'operation',
    width: 200
  },
  {
    title: '结果',
    key: 'result',
    width: 80
  },
  {
    title: '客户端',
    key: 'clientInfo',
    width: 150
  },
  {
    title: '时间',
    key: 'timestamp',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

/**
 * 获取日志级别颜色
 */
const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    critical: 'red'
  }
  return colorMap[level] || 'default'
}

/**
 * 获取日志级别文本
 */
const getLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return levelMap[level] || level
}

/**
 * 获取操作类型颜色
 */
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    login: 'green',
    access: 'blue',
    operation: 'purple',
    system: 'orange'
  }
  return colorMap[category] || 'default'
}

/**
 * 获取操作类型文本
 */
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    login: '登录',
    access: '访问',
    operation: '操作',
    system: '系统'
  }
  return categoryMap[category] || category
}

/**
 * 获取指标颜色
 */
const getMetricColor = (value: number) => {
  if (value < 50) return '#52c41a'
  if (value < 80) return '#faad14'
  return '#ff4d4f'
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取持续时间文本
 */
const getDurationText = (time: string) => {
  const now = dayjs()
  const targetTime = dayjs(time)
  const diff = now.diff(targetTime, 'minute')
  
  if (diff < 60) {
    return `${diff}分钟前`
  } else if (diff < 1440) {
    return `${Math.floor(diff / 60)}小时前`
  } else {
    return `${Math.floor(diff / 1440)}天前`
  }
}

/**
 * 处理日期范围变化
 */
const handleDateRangeChange = () => {
  console.log('日期范围变化:', dateRange.value)
}

/**
 * 处理过滤条件变化
 */
const handleFilterChange = () => {
  console.log('过滤条件变化:', logFilter)
}

/**
 * 刷新审计日志
 */
const refreshAuditLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('审计日志已刷新')
  }, 1000)
}

/**
 * 导出审计日志
 */
const exportAuditLogs = () => {
  message.success('审计日志导出成功')
}

/**
 * 查看日志详情
 */
const viewLogDetails = (log: AuditLog) => {
  selectedLog.value = log
  detailModal.visible = true
}

/**
 * 追踪操作
 */
const traceOperation = (log: AuditLog) => {
  message.info(`开始追踪操作: ${log.operation}`)
}

/**
 * 初始化操作类型分布图表
 */
const initOperationChart = () => {
  if (operationChartRef.value) {
    chartLoading.value = true
    operationChart.value = echarts.init(operationChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '操作类型分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: {
          color: '#666'
        }
      },
      series: [
        {
          name: '操作类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return Math.random() * 200
          },
          data: [
            { value: 45, name: '登录操作', itemStyle: { color: '#52c41a' } },
            { value: 30, name: '访问操作', itemStyle: { color: '#1890ff' } },
            { value: 20, name: '系统操作', itemStyle: { color: '#faad14' } },
            { value: 5, name: '其他操作', itemStyle: { color: '#722ed1' } }
          ]
        }
      ]
    }
    operationChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 初始化日志级别趋势图表
 */
const initLevelChart = () => {
  if (levelChartRef.value) {
    chartLoading.value = true
    levelChart.value = echarts.init(levelChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '日志级别趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        data: ['信息', '警告', '错误', '严重'],
        bottom: 10,
        textStyle: {
          color: '#666'
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
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666'
        }
      },
      series: [
        {
          name: '信息',
          type: 'line',
          stack: 'Total',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [120, 132, 101, 134, 90, 230, 210],
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '警告',
          type: 'line',
          stack: 'Total',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [220, 182, 191, 234, 290, 330, 310],
          itemStyle: { color: '#faad14' }
        },
        {
          name: '错误',
          type: 'line',
          stack: 'Total',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [150, 232, 201, 154, 190, 330, 410],
          itemStyle: { color: '#ff4d4f' }
        },
        {
          name: '严重',
          type: 'line',
          stack: 'Total',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [320, 332, 301, 334, 390, 330, 320],
          itemStyle: { color: '#cf1322' }
        }
      ]
    }
    levelChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 初始化用户活跃度图表
 */
const initUserChart = () => {
  if (userChartRef.value) {
    chartLoading.value = true
    userChart.value = echarts.init(userChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '用户活跃度统计',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
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
        data: ['管理员', '操作员', '监控员', '维护员', '安全员', '其他'],
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666'
        }
      },
      series: [
        {
          name: '活跃度',
          type: 'bar',
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [
            { value: 95, itemStyle: { color: '#52c41a' } },
            { value: 78, itemStyle: { color: '#1890ff' } },
            { value: 65, itemStyle: { color: '#faad14' } },
            { value: 82, itemStyle: { color: '#722ed1' } },
            { value: 88, itemStyle: { color: '#13c2c2' } },
            { value: 45, itemStyle: { color: '#eb2f96' } }
          ]
        }
      ]
    }
    userChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 初始化访问趋势图表
 */
const initAccessChart = () => {
  if (accessChartRef.value) {
    chartLoading.value = true
    accessChart.value = echarts.init(accessChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '访问趋势分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        data: ['访问次数', '异常访问'],
        bottom: 10,
        textStyle: {
          color: '#666'
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
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666'
        }
      },
      series: [
        {
          name: '访问次数',
          type: 'line',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [1200, 1350, 1100, 1400, 1600, 800, 600],
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '异常访问',
          type: 'line',
          smooth: true,
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [15, 23, 18, 25, 30, 12, 8],
          itemStyle: { color: '#ff4d4f' }
        }
      ]
    }
    accessChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 初始化安全事件分析图表
 */
const initSecurityChart = () => {
  if (securityChartRef.value) {
    chartLoading.value = true
    securityChart.value = echarts.init(securityChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '安全事件分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: {
          color: '#666'
        }
      },
      series: [
        {
          name: '安全事件',
          type: 'pie',
          radius: '50%',
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return Math.random() * 200
          },
          data: [
            { value: 45, name: '异常登录', itemStyle: { color: '#ff4d4f' } },
            { value: 30, name: '权限越界', itemStyle: { color: '#faad14' } },
            { value: 15, name: '数据泄露', itemStyle: { color: '#cf1322' } },
            { value: 10, name: '其他', itemStyle: { color: '#722ed1' } }
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
    securityChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 初始化地理位置分布图表
 */
const initLocationChart = () => {
  if (locationChartRef.value) {
    chartLoading.value = true
    locationChart.value = echarts.init(locationChartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 设置图表主题
    echarts.registerTheme('custom', {
      color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
    })
    
    const option = {
      title: {
        text: '地理位置分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        data: ['访问次数'],
        textStyle: {
          color: '#666'
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
        data: ['上海市', '北京市', '济宁市', '济南市', '青岛市', '其他'],
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666'
        }
      },
      series: [
        {
          name: '访问次数',
          type: 'bar',
          smooth: true,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return idx * 100
          },
          data: [
            { value: 320, itemStyle: { color: '#1890ff' } },
            { value: 280, itemStyle: { color: '#52c41a' } },
            { value: 250, itemStyle: { color: '#faad14' } },
            { value: 200, itemStyle: { color: '#722ed1' } },
            { value: 180, itemStyle: { color: '#13c2c2' } },
            { value: 150, itemStyle: { color: '#eb2f96' } }
          ]
        }
      ]
    }
    locationChart.value.setOption(option)
    chartLoading.value = false
  }
}

/**
 * 处理图表标签页切换
 */
const handleChartTabChange = (activeKey: string) => {
  nextTick(() => {
    switch (activeKey) {
      case 'operation':
        if (!operationChart.value) initOperationChart()
        break
      case 'level':
        if (!levelChart.value) initLevelChart()
        break
      case 'user':
        if (!userChart.value) initUserChart()
        break
      case 'access':
        if (!accessChart.value) initAccessChart()
        break
      case 'security':
        if (!securityChart.value) initSecurityChart()
        break
      case 'location':
        if (!locationChart.value) initLocationChart()
        break
    }
  })
}

/**
 * 更新图表数据
 */
const updateChartData = () => {
  // 根据统计周期更新图表数据
  if (operationChart.value) {
    // 这里可以根据statisticsPeriod.value来更新不同的数据
    console.log('更新图表数据，周期:', statisticsPeriod.value)
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  pagination.total = auditLogs.value.length
  console.log('安全审计日志页面已加载，共', auditLogs.value.length, '条日志记录')
  
  // 初始化第一个图表
  nextTick(() => {
    initOperationChart()
  })
  
  // 添加窗口大小变化监听
  const handleResize = () => {
    if (operationChart.value) operationChart.value.resize()
    if (levelChart.value) levelChart.value.resize()
    if (userChart.value) userChart.value.resize()
    if (accessChart.value) accessChart.value.resize()
    if (securityChart.value) securityChart.value.resize()
    if (locationChart.value) locationChart.value.resize()
  }
  
  window.addEventListener('resize', handleResize)
  
  // 模拟实时数据更新
  const autoRefreshInterval = setInterval(() => {
    // 更新系统指标
    systemMetrics.cpuUsage = Math.floor(Math.random() * 100)
    systemMetrics.memoryUsage = Math.floor(Math.random() * 100)
    systemMetrics.diskUsage = Math.floor(Math.random() * 100)
    
    // 随机更新一些统计数据
    auditStats.todayOperations += Math.floor(Math.random() * 5)
    auditStats.accessCount += Math.floor(Math.random() * 10)
    
    // 随机生成新的告警
    if (Math.random() > 0.7) {
      const newAlert: RealtimeAlert = {
        id: `alert_${Date.now()}`,
        level: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'warning' : 'info',
        message: '系统运行正常',
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      realtimeAlerts.value.unshift(newAlert)
      
      // 保持最多10条告警
      if (realtimeAlerts.value.length > 10) {
        realtimeAlerts.value.pop()
      }
    }
  }, 30000) // 每30秒更新一次
  
  // 组件卸载时清理资源
  return () => {
    clearInterval(autoRefreshInterval)
    window.removeEventListener('resize', handleResize)
    
    // 销毁图表实例
    if (operationChart.value) operationChart.value.dispose()
    if (levelChart.value) levelChart.value.dispose()
    if (userChart.value) userChart.value.dispose()
    if (accessChart.value) accessChart.value.dispose()
    if (securityChart.value) securityChart.value.dispose()
    if (locationChart.value) locationChart.value.dispose()
  }
})
</script>

<style lang="less" scoped>
.security-audit {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .page-header {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h2 {
      margin: 0 0 8px 0;
      color: #1890ff;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .audit-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .audit-content {
    margin-bottom: 24px;

    .audit-log-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .user-info {
        .user-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 11px;
          color: #999;
        }
      }

      .operation-info {
        .operation-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .operation-target {
          font-size: 11px;
          color: #666;
        }
      }

      .client-info {
        .client-ip {
          font-family: monospace;
          color: #333;
          margin-bottom: 2px;
        }

        .client-location {
          font-size: 11px;
          color: #999;
        }
      }

      .timestamp-info {
        .timestamp {
          color: #333;
          margin-bottom: 2px;
        }

        .duration {
          font-size: 11px;
          color: #999;
        }
      }
    }

    .monitor-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .real-time-alerts {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .alert-list {
          max-height: 200px;
          overflow-y: auto;

          .alert-item {
            background: #fafafa;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
            border-left: 3px solid #d9d9d9;

            &.alert-critical {
              border-left-color: #ff4d4f;
              background: #fff2f0;
            }

            &.alert-warning {
              border-left-color: #faad14;
              background: #fffbe6;
            }

            &.alert-info {
              border-left-color: #1890ff;
              background: #f0f8ff;
            }

            .alert-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;

              .alert-level {
                font-size: 14px;
              }

              .alert-time {
                font-size: 11px;
                color: #999;
              }
            }

            .alert-message {
              font-size: 12px;
              color: #333;
              line-height: 1.4;
            }
          }
        }
      }

      .online-users {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .user-list {
          max-height: 200px;
          overflow-y: auto;

          .user-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px;
            margin-bottom: 8px;
            background: #fafafa;
            border-radius: 4px;

            .user-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #1890ff;
              color: white;
              font-size: 14px;
            }

            .user-details {
              flex: 1;

              .user-name {
                font-weight: 500;
                color: #333;
                margin-bottom: 2px;
                font-size: 13px;
              }

              .user-status {
                font-size: 11px;
                color: #52c41a;
                margin-bottom: 2px;
              }

              .user-login-time {
                font-size: 10px;
                color: #999;
              }
            }

            .user-location {
              font-size: 11px;
              color: #666;
            }
          }
        }
      }

      .system-status {
        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .status-metrics {
          .metric-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .metric-label {
              font-size: 12px;
              color: #666;
              min-width: 80px;
            }

            .metric-value {
              font-size: 12px;
              color: #333;
              min-width: 30px;
              text-align: right;
            }
          }
        }
      }
    }
  }

  .audit-statistics {
    .statistics-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .chart-tabs {
        .ant-tabs-content-holder {
          padding: 20px 0;
        }
      }

      .chart-container {
        text-align: center;
        padding: 20px;

        .chart-wrapper {
          width: 100%;
          height: 400px;
          background: white;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
        }

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .chart-placeholder {
          background: #fafafa;
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          padding: 40px 20px;
          color: #999;

          p {
            margin: 8px 0 0 0;
          }
        }
      }
    }
  }

  .log-detail {
    .request-details {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .response-details {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .error-details {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .security-audit {
    padding: 16px;

    .audit-overview,
    .audit-content {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .audit-content {
      .ant-col-18,
      .ant-col-6 {
        width: 100%;
      }
    }

    .audit-statistics {
      .statistics-card {
        .chart-container {
          padding: 16px;

          .chart-wrapper {
            height: 300px;
          }
        }
      }
    }
  }
}
</style>

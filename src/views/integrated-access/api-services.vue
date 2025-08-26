<template>
  <div class="api-services">
    <div class="page-header">
      <h2>API服务</h2>
      <p>提供统一的API接口服务，支持多种协议接入和数据访问</p>
    </div>

    <!-- API概览统计 -->
    <div class="api-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper rest">
                <ApiOutlined />
              </div>
              <div class="stats">
                <div class="number">324</div>
                <div class="label">REST接口</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper websocket">
                <MessageOutlined />
              </div>
              <div class="stats">
                <div class="number">67</div>
                <div class="label">WebSocket</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper grpc">
                <CodeOutlined />
              </div>
              <div class="stats">
                <div class="number">89</div>
                <div class="label">gRPC服务</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper graphql">
                <NodeIndexOutlined />
              </div>
              <div class="stats">
                <div class="number">34</div>
                <div class="label">GraphQL</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- API服务管理 -->
    <div class="api-management">
      <a-row :gutter="16">
        <!-- 接口管理 -->
        <a-col :span="12">
          <a-card title="接口管理" class="management-card">
            <template #extra>
              <a-button type="primary" @click="showApiModal = true">
                <PlusOutlined />
                添加接口
              </a-button>
            </template>
            
            <a-table
              :columns="apiColumns"
              :data-source="apiList"
              :pagination="false"
              size="small"
              :scroll="{ y: 300 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '禁用' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'method'">
                  <a-tag :color="getMethodColor(record.method)">
                    {{ record.method }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="editApi(record)">
                      编辑
                    </a-button>
                    <a-button 
                      type="link" 
                      size="small" 
                      :danger="record.status === 'active'"
                      @click="toggleApiStatus(record)"
                    >
                      {{ record.status === 'active' ? '禁用' : '启用' }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 服务监控 -->
        <a-col :span="12">
          <a-card title="服务监控" class="management-card">
            <div class="service-monitor">
              <div class="monitor-stats">
                <div class="stat-item">
                  <span class="label">总请求数</span>
                  <span class="value">{{ serviceStats.totalRequests }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">成功率</span>
                  <span class="value">{{ serviceStats.successRate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">平均响应时间</span>
                  <span class="value">{{ serviceStats.avgResponseTime }}ms</span>
                </div>
                <div class="stat-item">
                  <span class="label">在线服务</span>
                  <span class="value">{{ serviceStats.onlineServices }}</span>
                </div>
              </div>
              
              <div class="performance-chart">
                <h4>性能趋势</h4>
                <div class="chart-container">
                  <div class="chart-line">
                    <span>响应时间</span>
                    <a-progress :percent="serviceStats.responseTimePercent" size="small" />
                  </div>
                  <div class="chart-line">
                    <span>吞吐量</span>
                    <a-progress :percent="serviceStats.throughputPercent" size="small" />
                  </div>
                  <div class="chart-line">
                    <span>错误率</span>
                    <a-progress :percent="serviceStats.errorRatePercent" size="small" />
                  </div>
                </div>
              </div>
              
              <div class="recent-requests">
                <h4>最近请求</h4>
                <a-list size="small">
                  <a-list-item v-for="request in recentRequests" :key="request.id">
                    <a-list-item-meta>
                      <template #avatar>
                        <a-avatar :style="{ backgroundColor: getMethodColor(request.method) }">
                          {{ request.method.charAt(0) }}
                        </a-avatar>
                      </template>
                      <template #title>{{ request.path }}</template>
                      <template #description>
                        {{ request.method }} | {{ request.statusCode }} | {{ request.responseTime }}ms
                      </template>
                    </a-list-item-meta>
                    <a-tag :color="getStatusCodeColor(request.statusCode)">
                      {{ request.statusCode }}
                    </a-tag>
                  </a-list-item>
                </a-list>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 访问控制 -->
    <div class="access-control">
      <a-card title="访问控制" class="control-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshAccessLogs">
              <ReloadOutlined />
              刷新日志
            </a-button>
            <a-button type="primary" @click="showAccessModal = true">
              <SettingOutlined />
              访问配置
            </a-button>
          </a-space>
        </template>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="access-overview">
              <h4>访问统计</h4>
              <div class="access-stats">
                <div class="access-item">
                  <span>今日访问</span>
                  <span class="number">{{ accessStats.todayAccess }}</span>
                </div>
                <div class="access-item">
                  <span>活跃用户</span>
                  <span class="number">{{ accessStats.activeUsers }}</span>
                </div>
                <div class="access-item">
                  <span>IP黑名单</span>
                  <span class="number">{{ accessStats.blacklistedIPs }}</span>
                </div>
                <div class="access-item">
                  <span>异常访问</span>
                  <span class="number">{{ accessStats.abnormalAccess }}</span>
                </div>
              </div>
            </div>
          </a-col>
          
          <a-col :span="16">
            <div class="access-logs">
              <h4>访问日志</h4>
              <a-table
                :columns="accessColumns"
                :data-source="accessLogs"
                :pagination="false"
                size="small"
                :scroll="{ y: 250 }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getStatusCodeColor(record.status)">
                      {{ record.status }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="viewAccessDetail(record)">
                        详情
                      </a-button>
                      <a-button 
                        v-if="record.status >= 400"
                        type="link" 
                        size="small" 
                        danger
                        @click="blockIP(record)"
                      >
                        封禁IP
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 服务配置 -->
    <div class="service-config">
      <a-card title="服务配置" class="config-card">
        <a-table
          :columns="configColumns"
          :data-source="serviceConfigs"
          :pagination="false"
          size="small"
          :scroll="{ y: 200 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'running' ? 'green' : 'orange'">
                {{ record.status === 'running' ? '运行中' : '已停止' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button 
                  type="link" 
                  size="small" 
                  @click="toggleServiceStatus(record)"
                >
                  {{ record.status === 'running' ? '停止' : '启动' }}
                </a-button>
                <a-button type="link" size="small" @click="editServiceConfig(record)">
                  配置
                </a-button>
                <a-button type="link" size="small" @click="viewServiceLogs(record)">
                  日志
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加/编辑API接口弹窗 -->
    <a-modal
      v-model:open="showApiModal"
      :title="editingApi ? '编辑API接口' : '添加API接口'"
      @ok="saveApi"
      @cancel="cancelApi"
      width="700px"
    >
      <a-form
        ref="apiFormRef"
        :model="apiForm"
        :rules="apiRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="请求方法" name="method">
              <a-select v-model:value="apiForm.method" placeholder="请选择请求方法">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
                <a-select-option value="PUT">PUT</a-select-option>
                <a-select-option value="DELETE">DELETE</a-select-option>
                <a-select-option value="PATCH">PATCH</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="接口路径" name="path">
              <a-input v-model:value="apiForm.path" placeholder="请输入接口路径" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="接口名称" name="name">
              <a-input v-model:value="apiForm.name" placeholder="请输入接口名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="接口版本" name="version">
              <a-input v-model:value="apiForm.version" placeholder="请输入接口版本" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="接口描述" name="description">
          <a-textarea v-model:value="apiForm.description" :rows="3" placeholder="请输入接口描述" />
        </a-form-item>
        
        <a-form-item label="请求参数" name="parameters">
          <a-textarea v-model:value="apiForm.parameters" :rows="4" placeholder="请输入请求参数配置" />
        </a-form-item>
        
        <a-form-item label="响应格式" name="responseFormat">
          <a-textarea v-model:value="apiForm.responseFormat" :rows="3" placeholder="请输入响应格式配置" />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="apiForm.status" placeholder="请选择状态">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 访问控制配置弹窗 -->
    <a-modal
      v-model:open="showAccessModal"
      title="访问控制配置"
      @ok="saveAccessConfig"
      @cancel="showAccessModal = false"
      width="600px"
    >
      <a-form
        ref="accessFormRef"
        :model="accessForm"
        layout="vertical"
      >
        <a-form-item label="访问频率限制">
          <a-input-number 
            v-model:value="accessForm.rateLimit" 
            :min="1" 
            :max="10000"
            style="width: 100%"
            placeholder="每分钟最大请求数"
          />
        </a-form-item>
        
        <a-form-item label="IP白名单">
          <a-textarea v-model:value="accessForm.whiteList" :rows="3" placeholder="请输入IP白名单，每行一个IP" />
        </a-form-item>
        
        <a-form-item label="IP黑名单">
          <a-textarea v-model:value="accessForm.blackList" :rows="3" placeholder="请输入IP黑名单，每行一个IP" />
        </a-form-item>
        
        <a-form-item label="认证方式">
          <a-select v-model:value="accessForm.authType" placeholder="请选择认证方式">
            <a-select-option value="none">无认证</a-select-option>
            <a-select-option value="api_key">API Key</a-select-option>
            <a-select-option value="jwt">JWT Token</a-select-option>
            <a-select-option value="oauth2">OAuth 2.0</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="超时设置">
          <a-input-number 
            v-model:value="accessForm.timeout" 
            :min="1000" 
            :max="60000"
            :step="1000"
            style="width: 100%"
            placeholder="请求超时时间(毫秒)"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined, ApiOutlined, MessageOutlined, CodeOutlined, NodeIndexOutlined,
  ReloadOutlined, SettingOutlined
} from '@ant-design/icons-vue'

// API接口表格列定义
const apiColumns = [
  { title: '接口名称', dataIndex: 'name', key: 'name' },
  { title: '请求方法', dataIndex: 'method', key: 'method' },
  { title: '接口路径', dataIndex: 'path', key: 'path' },
  { title: '版本', dataIndex: 'version', key: 'version' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 150 }
]

// 访问日志表格列定义
const accessColumns = [
  { title: '时间', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
  { title: '请求路径', dataIndex: 'path', key: 'path' },
  { title: '状态码', dataIndex: 'status', key: 'status' },
  { title: '响应时间', dataIndex: 'responseTime', key: 'responseTime' },
  { title: '操作', key: 'action', width: 120 }
]

// 服务配置表格列定义
const configColumns = [
  { title: '服务名称', dataIndex: 'name', key: 'name' },
  { title: '服务类型', dataIndex: 'type', key: 'type' },
  { title: '端口', dataIndex: 'port', key: 'port' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 200 }
]

// 响应式数据
const showApiModal = ref(false)
const showAccessModal = ref(false)
const editingApi = ref<any>(null)
const apiFormRef = ref()
const accessFormRef = ref()

// API接口表单数据
const apiForm = reactive({
  name: '',
  method: '',
  path: '',
  version: '',
  description: '',
  parameters: '',
  responseFormat: '',
  status: 'active'
})

// 访问控制配置表单数据
const accessForm = reactive({
  rateLimit: 1000,
  whiteList: '',
  blackList: '',
  authType: 'api_key',
  timeout: 5000
})

// 表单验证规则
const apiRules = {
  name: [{ required: true, message: '请输入接口名称' }],
  method: [{ required: true, message: '请选择请求方法' }],
  path: [{ required: true, message: '请输入接口路径' }],
  version: [{ required: true, message: '请输入接口版本' }],
  status: [{ required: true, message: '请选择状态' }]
}

// 模拟数据
const apiList = ref([
  {
    id: '1',
    name: '获取设备列表',
    method: 'GET',
    path: '/api/v1/devices',
    version: 'v1.0',
    status: 'active',
    description: '获取所有设备的基本信息',
    parameters: '{"page": "number", "size": "number", "type": "string"}',
    responseFormat: '{"code": "number", "data": "array", "message": "string"}'
  },
  {
    id: '2',
    name: '创建设备',
    method: 'POST',
    path: '/api/v1/devices',
    version: 'v1.0',
    status: 'active',
    description: '创建新的设备记录',
    parameters: '{"name": "string", "type": "string", "location": "string"}',
    responseFormat: '{"code": "number", "data": "object", "message": "string"}'
  },
  {
    id: '3',
    name: '更新设备',
    method: 'PUT',
    path: '/api/v1/devices/:id',
    version: 'v1.0',
    status: 'active',
    description: '更新指定设备的信息',
    parameters: '{"name": "string", "type": "string", "location": "string"}',
    responseFormat: '{"code": "number", "data": "object", "message": "string"}'
  },
  {
    id: '4',
    name: '删除设备',
    method: 'DELETE',
    path: '/api/v1/devices/:id',
    version: 'v1.0',
    status: 'inactive',
    description: '删除指定的设备记录',
    parameters: '{}',
    responseFormat: '{"code": "number", "message": "string"}'
  },
  {
    id: '5',
    name: '获取视频流',
    method: 'GET',
    path: '/api/v1/streams/:deviceId',
    version: 'v1.0',
    status: 'active',
    description: '获取指定设备的视频流地址',
    parameters: '{"quality": "string", "protocol": "string"}',
    responseFormat: '{"code": "number", "data": {"rtspUrl": "string", "hlsUrl": "string"}, "message": "string"}'
  },
  {
    id: '6',
    name: '设备状态查询',
    method: 'GET',
    path: '/api/v1/devices/:id/status',
    version: 'v1.0',
    status: 'active',
    description: '查询指定设备的实时状态',
    parameters: '{}',
    responseFormat: '{"code": "number", "data": {"online": "boolean", "lastSeen": "string", "cpu": "number"}, "message": "string"}'
  },
  {
    id: '7',
    name: '事件上报',
    method: 'POST',
    path: '/api/v1/events',
    version: 'v1.0',
    status: 'active',
    description: '设备事件数据上报接口',
    parameters: '{"deviceId": "string", "eventType": "string", "eventData": "object", "timestamp": "string"}',
    responseFormat: '{"code": "number", "data": {"eventId": "string"}, "message": "string"}'
  },
  {
    id: '8',
    name: 'PTZ控制',
    method: 'POST',
    path: '/api/v1/devices/:id/ptz',
    version: 'v1.0',
    status: 'active',
    description: '云台控制接口',
    parameters: '{"action": "string", "pan": "number", "tilt": "number", "zoom": "number"}',
    responseFormat: '{"code": "number", "data": {"success": "boolean"}, "message": "string"}'
  },
  {
    id: '9',
    name: '录像回放',
    method: 'GET',
    path: '/api/v1/recordings',
    version: 'v1.0',
    status: 'active',
    description: '查询录像文件列表',
    parameters: '{"deviceId": "string", "startTime": "string", "endTime": "string", "type": "string"}',
    responseFormat: '{"code": "number", "data": [{"id": "string", "startTime": "string", "endTime": "string", "size": "number"}], "message": "string"}'
  },
  {
    id: '10',
    name: '用户认证',
    method: 'POST',
    path: '/api/v1/auth/login',
    version: 'v1.0',
    status: 'active',
    description: '用户登录认证接口',
    parameters: '{"username": "string", "password": "string", "captcha": "string"}',
    responseFormat: '{"code": "number", "data": {"token": "string", "expires": "string"}, "message": "string"}'
  },
  {
    id: '11',
    name: '权限验证',
    method: 'POST',
    path: '/api/v1/auth/verify',
    version: 'v1.0',
    status: 'active',
    description: '验证用户访问权限',
    parameters: '{"token": "string", "resource": "string", "action": "string"}',
    responseFormat: '{"code": "number", "data": {"allowed": "boolean", "permissions": "array"}, "message": "string"}'
  },
  {
    id: '12',
    name: '系统配置',
    method: 'GET',
    path: '/api/v1/system/config',
    version: 'v1.0',
    status: 'active',
    description: '获取系统配置信息',
    parameters: '{}',
    responseFormat: '{"code": "number", "data": {"version": "string", "features": "array", "settings": "object"}, "message": "string"}'
  },
  {
    id: '13',
    name: '日志查询',
    method: 'GET',
    path: '/api/v1/logs',
    version: 'v1.0',
    status: 'active',
    description: '查询系统操作日志',
    parameters: '{"level": "string", "module": "string", "startTime": "string", "endTime": "string", "page": "number", "size": "number"}',
    responseFormat: '{"code": "number", "data": {"logs": "array", "total": "number"}, "message": "string"}'
  },
  {
    id: '14',
    name: '告警配置',
    method: 'PUT',
    path: '/api/v1/alarms/config',
    version: 'v1.0',
    status: 'active',
    description: '更新告警配置参数',
    parameters: '{"enabled": "boolean", "thresholds": "object", "notifications": "array"}',
    responseFormat: '{"code": "number", "data": {"success": "boolean"}, "message": "string"}'
  },
  {
    id: '15',
    name: '数据统计',
    method: 'GET',
    path: '/api/v1/statistics',
    version: 'v1.0',
    status: 'active',
    description: '获取系统运行统计数据',
    parameters: '{"type": "string", "period": "string", "groupBy": "string"}',
    responseFormat: '{"code": "number", "data": {"metrics": "object", "charts": "array"}, "message": "string"}'
  }
])

const serviceStats = ref({
  totalRequests: 245680,
  successRate: 99.2,
  avgResponseTime: 32,
  onlineServices: 324,
  responseTimePercent: 85,
  throughputPercent: 92,
  errorRatePercent: 8
})

const recentRequests = ref([
  {
    id: '1',
    path: '/api/v1/devices',
    method: 'GET',
    statusCode: 200,
    responseTime: 23
  },
  {
    id: '2',
    path: '/api/v1/devices/123',
    method: 'PUT',
    statusCode: 200,
    responseTime: 45
  },
  {
    id: '3',
    path: '/api/v1/events',
    method: 'POST',
    statusCode: 400,
    responseTime: 67
  },
  {
    id: '4',
    path: '/api/v1/streams',
    method: 'GET',
    statusCode: 200,
    responseTime: 34
  },
  {
    id: '5',
    path: '/api/v1/devices/456/status',
    method: 'GET',
    statusCode: 200,
    responseTime: 18
  },
  {
    id: '6',
    path: '/api/v1/streams/789',
    method: 'GET',
    statusCode: 200,
    responseTime: 29
  },
  {
    id: '7',
    path: '/api/v1/recordings',
    method: 'GET',
    statusCode: 200,
    responseTime: 56
  },
  {
    id: '8',
    path: '/api/v1/auth/login',
    method: 'POST',
    statusCode: 200,
    responseTime: 89
  },
  {
    id: '9',
    path: '/api/v1/alarms/config',
    method: 'PUT',
    statusCode: 200,
    responseTime: 42
  },
  {
    id: '10',
    path: '/api/v1/statistics',
    method: 'GET',
    statusCode: 200,
    responseTime: 38
  }
])

const accessStats = ref({
  todayAccess: 25680,
  activeUsers: 456,
  blacklistedIPs: 23,
  abnormalAccess: 89
})

const accessLogs = ref([
  {
    id: '1',
    timestamp: '2025-08-26 10:30:00',
    ip: '192.168.1.100',
    path: '/api/v1/devices',
    status: 200,
    responseTime: 23
  },
  {
    id: '2',
    timestamp: '2025-08-26 10:29:45',
    ip: '192.168.1.101',
    path: '/api/v1/events',
    status: 401,
    responseTime: 12
  },
  {
    id: '3',
    timestamp: '2025-08-26 10:29:30',
    ip: '192.168.1.102',
    path: '/api/v1/streams',
    status: 200,
    responseTime: 45
  },
  {
    id: '4',
    timestamp: '2025-08-26 10:29:15',
    ip: '192.168.1.103',
    path: '/api/v1/devices/123',
    status: 404,
    responseTime: 8
  },
  {
    id: '5',
    timestamp: '2025-08-26 10:28:50',
    ip: '192.168.1.104',
    path: '/api/v1/auth/login',
    status: 200,
    responseTime: 89
  },
  {
    id: '6',
    timestamp: '2025-08-26 10:28:35',
    ip: '192.168.1.105',
    path: '/api/v1/recordings',
    status: 200,
    responseTime: 56
  },
  {
    id: '7',
    timestamp: '2025-08-26 10:28:20',
    ip: '192.168.1.106',
    path: '/api/v1/devices/456/status',
    status: 200,
    responseTime: 18
  },
  {
    id: '8',
    timestamp: '2025-08-26 10:28:05',
    ip: '192.168.1.107',
    path: '/api/v1/streams/789',
    status: 200,
    responseTime: 29
  },
  {
    id: '9',
    timestamp: '2025-08-26 10:27:50',
    ip: '192.168.1.108',
    path: '/api/v1/alarms/config',
    status: 200,
    responseTime: 42
  },
  {
    id: '10',
    timestamp: '2025-08-26 10:27:35',
    ip: '192.168.1.109',
    path: '/api/v1/statistics',
    status: 200,
    responseTime: 38
  },
  {
    id: '11',
    timestamp: '2025-08-26 10:27:20',
    ip: '192.168.1.110',
    path: '/api/v1/logs',
    status: 403,
    responseTime: 15
  },
  {
    id: '12',
    timestamp: '2025-08-26 10:27:05',
    ip: '192.168.1.111',
    path: '/api/v1/system/config',
    status: 200,
    responseTime: 27
  }
])

const serviceConfigs = ref([
  {
    id: '1',
    name: 'REST-API-Service',
    type: 'REST',
    port: 8080,
    status: 'running'
  },
  {
    id: '2',
    name: 'WebSocket-Service',
    type: 'WebSocket',
    port: 8081,
    status: 'running'
  },
  {
    id: '3',
    name: 'gRPC-Service',
    type: 'gRPC',
    port: 8082,
    status: 'running'
  },
  {
    id: '4',
    name: 'GraphQL-Service',
    type: 'GraphQL',
    port: 8083,
    status: 'stopped'
  },
  {
    id: '5',
    name: 'Video-Stream-Service',
    type: 'REST',
    port: 8084,
    status: 'running'
  },
  {
    id: '6',
    name: 'Event-Processing-Service',
    type: 'gRPC',
    port: 8085,
    status: 'running'
  },
  {
    id: '7',
    name: 'Authentication-Service',
    type: 'REST',
    port: 8086,
    status: 'running'
  },
  {
    id: '8',
    name: 'Notification-Service',
    type: 'WebSocket',
    port: 8087,
    status: 'running'
  },
  {
    id: '9',
    name: 'Data-Analytics-Service',
    type: 'GraphQL',
    port: 8088,
    status: 'running'
  },
  {
    id: '10',
    name: 'File-Storage-Service',
    type: 'REST',
    port: 8089,
    status: 'stopped'
  },
  {
    id: '11',
    name: 'Device-Management-Service',
    type: 'gRPC',
    port: 8090,
    status: 'running'
  },
  {
    id: '12',
    name: 'Alarm-Processing-Service',
    type: 'REST',
    port: 8091,
    status: 'running'
  }
])

// 方法
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    'GET': '#52c41a',
    'POST': '#1890ff',
    'PUT': '#fa8c16',
    'DELETE': '#ff4d4f',
    'PATCH': '#722ed1'
  }
  return colors[method] || '#d9d9d9'
}

const getStatusCodeColor = (status: number) => {
  if (status >= 200 && status < 300) return '#52c41a'
  if (status >= 300 && status < 400) return '#1890ff'
  if (status >= 400 && status < 500) return '#fa8c16'
  if (status >= 500) return '#ff4d4f'
  return '#d9d9d9'
}

const editApi = (record: any) => {
  editingApi.value = record
  Object.assign(apiForm, record)
  showApiModal.value = true
}

const toggleApiStatus = (record: any) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  message.success(`API接口 ${record.name} 已${record.status === 'active' ? '启用' : '禁用'}`)
}

const saveApi = async () => {
  try {
    await apiFormRef.value.validate()
    
    if (editingApi.value) {
      // 编辑现有API
      const index = apiList.value.findIndex(a => a.id === editingApi.value.id)
      if (index !== -1) {
        Object.assign(apiList.value[index], { ...apiForm })
        message.success('API接口更新成功')
      }
    } else {
      // 添加新API
      const newApi = {
        id: Date.now().toString(),
        ...apiForm
      }
      apiList.value.push(newApi)
      message.success('API接口添加成功')
    }
    
    showApiModal.value = false
    resetApiForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancelApi = () => {
  showApiModal.value = false
  resetApiForm()
}

const resetApiForm = () => {
  editingApi.value = null
  Object.assign(apiForm, {
    name: '',
    method: '',
    path: '',
    version: '',
    description: '',
    parameters: '',
    responseFormat: '',
    status: 'active'
  })
}

const refreshAccessLogs = () => {
  message.success('访问日志已刷新')
}

const saveAccessConfig = () => {
  message.success('访问控制配置已保存')
  showAccessModal.value = false
}

const viewAccessDetail = (record: any) => {
  message.info(`查看访问详情: ${record.path}`)
}

const blockIP = (record: any) => {
  message.success(`IP地址 ${record.ip} 已被封禁`)
  // 模拟封禁过程
  setTimeout(() => {
    const index = accessLogs.value.findIndex(log => log.id === record.id)
    if (index !== -1) {
      accessLogs.value.splice(index, 1)
    }
  }, 1000)
}

const toggleServiceStatus = (record: any) => {
  record.status = record.status === 'running' ? 'stopped' : 'running'
  message.success(`服务 ${record.name} 已${record.status === 'running' ? '启动' : '停止'}`)
}

const editServiceConfig = (record: any) => {
  message.info(`编辑服务配置: ${record.name}`)
}

const viewServiceLogs = (record: any) => {
  message.info(`查看服务日志: ${record.name}`)
}

onMounted(() => {
  console.log('API服务页面已加载')
})
</script>

<style lang="less" scoped>
.api-services {
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

  .api-overview {
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

          &.rest { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.websocket { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.grpc { background: linear-gradient(135deg, #fa8c16, #d46b08); }
          &.graphql { background: linear-gradient(135deg, #722ed1, #531dab); }
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

  .api-management {
    margin-bottom: 24px;

    .management-card {
      height: 100%;

      .service-monitor {
        .monitor-stats {
          margin-bottom: 24px;

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .label {
              font-size: 14px;
              color: #595959;
            }

            .value {
              font-size: 16px;
              font-weight: 600;
              color: #262626;
            }
          }
        }

        .performance-chart {
          margin-bottom: 24px;

          h4 {
            margin-bottom: 16px;
            font-size: 14px;
            font-weight: 500;
          }

          .chart-container {
            .chart-line {
              display: flex;
              align-items: center;
              margin-bottom: 12px;

              span {
                width: 80px;
                font-size: 14px;
                color: #595959;
              }

              .ant-progress {
                flex: 1;
                margin-left: 16px;
              }
            }
          }
        }

        .recent-requests {
          h4 {
            margin-bottom: 16px;
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .access-control {
    margin-bottom: 24px;

    .control-card {
      .access-overview {
        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .access-stats {
          .access-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding: 12px;
            background: #fafafa;
            border-radius: 6px;

            span {
              font-size: 14px;
              color: #595959;

              &.number {
                font-size: 18px;
                font-weight: 600;
                color: #262626;
              }
            }
          }
        }
      }

      .access-logs {
        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .service-config {
    .config-card {
      margin-bottom: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .api-services {
    padding: 16px;

    .api-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .api-management {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="resource-pool">
    <div class="page-header">
      <h2>共享资源池</h2>
      <p>管理可对外提供的视频资源目录，支持多种共享方式和权限控制</p>
    </div>

    <!-- 资源统计概览 -->
    <div class="resource-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="总共享资源"
              :value="resourceStats.totalResources"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <CameraOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="活跃共享"
              :value="resourceStats.activeSharing"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <ShareAltOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日访问量"
              :value="resourceStats.todayAccess"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <EyeOutlined style="color: #faad14; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="授权用户"
              :value="resourceStats.authorizedUsers"
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
    <div class="resource-content">
      <a-card class="main-content-card">
                 <a-tabs v-model:activeKey="activeTab" type="card" @change="handleTabChange">
          <!-- 共享资源列表 Tab -->
          <a-tab-pane key="resources" tab="共享资源列表">
            <div class="tab-header">
              <a-space>
                <a-select
                  v-model:value="resourceFilter.category"
                  placeholder="资源类型"
                  style="width: 120px"
                  @change="handleFilterChange"
                >
                  <a-select-option value="">全部类型</a-select-option>
                  <a-select-option value="camera">摄像头</a-select-option>
                  <a-select-option value="sensor">传感器</a-select-option>
                  <a-select-option value="radar">雷达</a-select-option>
                  <a-select-option value="ais">AIS</a-select-option>
                </a-select>
                <a-select
                  v-model:value="resourceFilter.status"
                  placeholder="共享状态"
                  style="width: 120px"
                  @change="handleFilterChange"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="active">活跃</a-select-option>
                  <a-select-option value="inactive">非活跃</a-select-option>
                  <a-select-option value="suspended">暂停</a-select-option>
                </a-select>
                <a-input-search
                  v-model:value="searchKeyword"
                  placeholder="搜索名称/描述/地址"
                  style="width: 220px"
                  @search="onSearch"
                  allow-clear
                />
                <a-select v-model:value="sortBy" style="width: 140px" placeholder="排序字段">
                  <a-select-option value="default">默认排序</a-select-option>
                  <a-select-option value="accessCount">访问量</a-select-option>
                  <a-select-option value="createTime">创建时间</a-select-option>
                  <a-select-option value="status">状态</a-select-option>
                </a-select>
                <a-select v-model:value="sortOrder" style="width: 120px" placeholder="排序方式">
                  <a-select-option value="descend">降序</a-select-option>
                  <a-select-option value="ascend">升序</a-select-option>
                </a-select>
                <a-button type="primary" @click="showAddResource">
                  <PlusOutlined />
                  添加资源
                </a-button>
                <a-button @click="exportResourceList">
                  <ExportOutlined />
                  导出列表
                </a-button>
              </a-space>
            </div>
            
            <a-table
              :columns="resourceColumns"
              :data-source="paginatedResources"
              :loading="loading"
              :pagination="pagination"
              row-key="id"
              size="small"
              @change="onTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'resourceInfo'">
                  <div class="resource-info">
                    <div class="resource-icon">
                      <CameraOutlined v-if="record.category === 'camera'" />
                      <RadarChartOutlined v-else-if="record.category === 'sensor'" />
                      <DashboardOutlined v-else-if="record.category === 'radar'" />
                      <CompassOutlined v-else />
                    </div>
                    <div class="resource-details">
                      <div class="resource-name">{{ record.name }}</div>
                      <div class="resource-description">{{ record.description }}</div>
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'category'">
                  <a-tag :color="getCategoryColor(record.category)">
                    {{ getCategoryText(record.category) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'permissions'">
                  <div class="permissions-info">
                    <a-tag
                      v-for="permission in record.permissions"
                      :key="permission"
                      size="small"
                      :color="getPermissionColor(permission)"
                    >
                      {{ getPermissionText(permission) }}
                    </a-tag>
                  </div>
                </template>

                <template v-else-if="column.key === 'accessCount'">
                  <div class="access-stats">
                    <div class="access-count">{{ record.accessCount }}</div>
                    <div class="access-label">次访问</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'health'">
                  <a-tag :color="getHealthColor(getResourceHealth(record))">
                    {{ getHealthText(getResourceHealth(record)) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'usage'">
                  <div class="usage-stats">
                    <a-progress 
                      :percent="getResourceUsage(record)" 
                      :stroke-color="getResourceUsage(record) > 80 ? '#ff4d4f' : '#52c41a'"
                      size="small"
                      :show-info="false"
                    />
                    <span class="usage-text">{{ getResourceUsage(record) }}%</span>
                  </div>
                </template>

                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewResource(record)">
                      <EyeOutlined />
                      查看
                    </a-button>
                    <a-button type="link" size="small" @click="editResource(record)">
                      <EditOutlined />
                      编辑
                    </a-button>
                    <a-button type="link" size="small" @click="shareResource(record)">
                      <ShareAltOutlined />
                      共享
                    </a-button>
                    <a-button type="link" size="small" @click="deleteResource(record)">
                      <DeleteOutlined />
                      删除
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 桌面数据共享 Tab -->
          <a-tab-pane key="desktop" tab="桌面数据共享">
            <div class="tab-header">
              <a-space>
                <a-input-search
                  v-model:value="desktopSearchKeyword"
                  placeholder="搜索会话/来源/单位"
                  style="width: 240px"
                  @search="handleDesktopSearch"
                  allow-clear
                />
                <a-select v-model:value="desktopFilter.status" style="width: 140px" placeholder="会话状态">
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="active">进行中</a-select-option>
                  <a-select-option value="idle">空闲</a-select-option>
                  <a-select-option value="error">异常</a-select-option>
                </a-select>
                <a-select v-model:value="desktopSortBy" style="width: 140px" placeholder="排序字段">
                  <a-select-option value="default">默认排序</a-select-option>
                  <a-select-option value="bitrate">带宽</a-select-option>
                  <a-select-option value="fps">帧率</a-select-option>
                  <a-select-option value="latency">延迟</a-select-option>
                </a-select>
                <a-select v-model:value="desktopSortOrder" style="width: 120px" placeholder="排序方式">
                  <a-select-option value="descend">降序</a-select-option>
                  <a-select-option value="ascend">升序</a-select-option>
                </a-select>
                <a-button @click="refreshDesktopSessions">
                  <ReloadOutlined />
                  刷新会话
                </a-button>
              </a-space>
            </div>

            <!-- 网格卡片 -->
            <a-row :gutter="16">
              <a-col :span="6" v-for="session in desktopPaginatedSessions" :key="session.id" style="margin-bottom: 16px">
                <a-card :hoverable="true" :body-style="{ padding: '12px' }">
                  <template #title>
                    <a-space>
                      <BarChartOutlined />
                      <span>{{ session.title }}</span>
                      <a-tag :color="session.status === 'active' ? 'green' : (session.status === 'idle' ? 'blue' : 'red')">
                        {{ session.status === 'active' ? '进行中' : (session.status === 'idle' ? '空闲' : '异常') }}
                      </a-tag>
                    </a-space>
                  </template>

                  <div v-if="session.loading">
                    <a-skeleton :active="true" :paragraph="{ rows: 3 }" />
                  </div>
                  <div v-else>
                    <div style="height: 120px; background: #f5f5f5; border-radius: 6px; display:flex; align-items:center; justify-content:center; margin-bottom: 8px; color: #999">
                      {{ session.resolution }} 预览
                    </div>
                    <a-space wrap size="small" style="margin-bottom: 8px">
                      <a-tag color="blue">{{ session.resolution }}</a-tag>
                      <a-tag color="orange">{{ session.fps }} FPS</a-tag>
                      <a-tag :color="session.latency < 80 ? 'green' : (session.latency < 150 ? 'orange' : 'red')">{{ session.latency }} ms</a-tag>
                      <a-tag :color="session.packetLoss < 1 ? 'green' : (session.packetLoss < 3 ? 'orange' : 'red')">丢包 {{ session.packetLoss }}%</a-tag>
                      <a-tag color="purple">{{ session.bitrate }} Mbps</a-tag>
                    </a-space>
                    <div style="display:flex; justify-content: space-between; align-items:center;">
                      <div style="font-size: 12px; color:#666">来源：{{ session.source }}</div>
                      <div>
                        <a-button type="link" size="small" @click="openDesktopSession(session)">查看</a-button>
                        <a-button v-if="session.status==='error'" type="link" size="small" @click="retryDesktopSession(session)">重试</a-button>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <!-- 分页 -->
            <div style="text-align: right; margin-top: 8px;">
              <a-pagination
                v-model:current="desktopPagination.current"
                :page-size="desktopPagination.pageSize"
                :total="desktopFilteredSessions.length"
                :show-size-changer="true"
                :page-size-options="['8','12','16']"
                size="small"
                @change="handleDesktopPageChange"
                @showSizeChange="handleDesktopPageSizeChange"
              />
            </div>
          </a-tab-pane>

          <!-- 共享配置 Tab -->
          <a-tab-pane key="config" tab="共享配置">
            <div class="tab-header">
              <a-button size="small" @click="refreshConfig">
                <ReloadOutlined />
                刷新配置
              </a-button>
            </div>
            
            <!-- 共享方式配置 -->
            <div class="sharing-methods">
              <h4>共享方式</h4>
              <div class="method-list">
                <div
                  v-for="method in sharingMethods"
                  :key="method.id"
                  class="method-item"
                  :class="{ active: method.enabled }"
                >
                  <div class="method-header">
                    <div class="method-info">
                      <div class="method-icon">
                        <ApiOutlined v-if="method.type === 'api'" />
                        <LinkOutlined v-else-if="method.type === 'rtmp'" />
                        <GlobalOutlined v-else />
                      </div>
                      <div class="method-details">
                        <div class="method-name">{{ method.name }}</div>
                        <div class="method-description">{{ method.description }}</div>
                      </div>
                    </div>
                    <div class="method-toggle">
                      <a-switch
                        v-model:checked="method.enabled"
                        size="small"
                        @change="toggleSharingMethod(method)"
                      />
                    </div>
                  </div>
                  <div v-if="method.enabled" class="method-config">
                    <div class="config-item">
                      <span class="config-label">端点:</span>
                      <span class="config-value">{{ method.endpoint }}</span>
                    </div>
                    <div class="config-item">
                      <span class="config-label">协议:</span>
                      <span class="config-value">{{ method.protocol }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                         <!-- 访问统计 -->
             <div class="access-statistics">
               <h4>访问统计</h4>
               <div class="stats-chart">
                 <div ref="accessChartRef" class="chart-container"></div>
               </div>
               
               <!-- 性能指标 -->
               <div class="performance-metrics">
                 <div class="metric-item">
                   <span class="metric-label">平均响应时间:</span>
                   <span class="metric-value">{{ performanceStats.avgResponseTime }}ms</span>
                 </div>
                 <div class="metric-item">
                   <span class="metric-label">成功率:</span>
                   <span class="metric-value">{{ performanceStats.successRate }}%</span>
                 </div>
                 <div class="metric-item">
                   <span class="metric-label">峰值并发:</span>
                   <span class="metric-value">{{ performanceStats.peakConcurrentUsers }}</span>
                 </div>
                 <div class="metric-item">
                   <span class="metric-label">总带宽:</span>
                   <span class="metric-value">{{ performanceStats.totalBandwidth }}</span>
                 </div>
               </div>
             </div>

            <!-- 资源分类统计 -->
            <div class="category-statistics">
              <h4>资源分类统计</h4>
              <div class="category-list">
                <div class="category-item">
                  <span class="category-name">摄像头</span>
                  <span class="category-count">{{ categoryStats.camera }}</span>
                </div>
                <div class="category-item">
                  <span class="category-name">传感器</span>
                  <span class="category-count">{{ categoryStats.sensor }}</span>
                </div>
                <div class="category-item">
                  <span class="category-name">雷达</span>
                  <span class="category-count">{{ categoryStats.radar }}</span>
                </div>
                <div class="category-item">
                  <span class="category-name">AIS</span>
                  <span class="category-count">{{ categoryStats.ais }}</span>
                </div>
              </div>
            </div>

            <!-- 最近访问 -->
            <div class="recent-access">
              <h4>最近访问</h4>
              <div class="access-list">
                <div
                  v-for="access in recentAccess"
                  :key="access.id"
                  class="access-item"
                >
                  <div class="access-info">
                    <div class="access-user">{{ access.user }}</div>
                    <div class="access-resource">{{ access.resource }}</div>
                    <div class="access-time">{{ formatTime(access.time) }}</div>
                  </div>
                  <div class="access-status">
                    <a-tag :color="access.success ? 'green' : 'red'" size="small">
                      {{ access.success ? '成功' : '失败' }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 添加资源弹窗 -->
    <a-modal
      v-model:open="resourceModal.visible"
      :title="resourceModal.title"
      width="700px"
      @ok="handleResourceSubmit"
      @cancel="handleResourceCancel"
    >
      <a-form
        ref="resourceFormRef"
        :model="resourceForm"
        :rules="resourceRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="资源名称" name="name">
          <a-input v-model:value="resourceForm.name" placeholder="请输入资源名称" />
        </a-form-item>
        
        <a-form-item label="资源类型" name="category">
          <a-select v-model:value="resourceForm.category" placeholder="请选择资源类型">
            <a-select-option value="camera">摄像头</a-select-option>
            <a-select-option value="sensor">传感器</a-select-option>
            <a-select-option value="radar">雷达</a-select-option>
            <a-select-option value="ais">AIS</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="资源描述" name="description">
          <a-textarea
            v-model:value="resourceForm.description"
            placeholder="请输入资源描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="资源地址" name="url">
          <a-input v-model:value="resourceForm.url" placeholder="请输入资源地址" />
        </a-form-item>
        
        <a-form-item label="共享权限" name="permissions">
          <a-checkbox-group v-model:value="resourceForm.permissions">
            <a-checkbox value="view">查看</a-checkbox>
            <a-checkbox value="control">控制</a-checkbox>
            <a-checkbox value="download">下载</a-checkbox>
            <a-checkbox value="share">转发</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item label="访问限制" name="accessLimit">
          <a-input-number
            v-model:value="resourceForm.accessLimit"
            :min="0"
            placeholder="最大同时访问数(0表示无限制)"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="共享状态" name="status">
          <a-radio-group v-model:value="resourceForm.status">
            <a-radio value="active">活跃</a-radio>
            <a-radio value="inactive">非活跃</a-radio>
            <a-radio value="suspended">暂停</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="resourceForm.notes"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 资源详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      title="资源详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedResource" class="resource-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="资源名称">
            {{ selectedResource.name }}
          </a-descriptions-item>
          <a-descriptions-item label="资源类型">
            {{ getCategoryText(selectedResource.category) }}
          </a-descriptions-item>
          <a-descriptions-item label="共享状态">
            <a-tag :color="getStatusColor(selectedResource.status)">
              {{ getStatusText(selectedResource.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatTime(selectedResource.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="资源地址" :span="2">
            {{ selectedResource.url }}
          </a-descriptions-item>
          <a-descriptions-item label="资源描述" :span="2">
            {{ selectedResource.description }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 访问统计 -->
        <div class="access-statistics-detail">
          <h4>访问统计</h4>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="总访问次数" :value="selectedResource.accessCount" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="今日访问" :value="selectedResource.todayAccess || 0" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="当前在线" :value="selectedResource.currentOnline || 0" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="平均响应时间" :value="selectedResource.avgResponseTime || 0" suffix="ms" />
            </a-col>
          </a-row>
        </div>

        <!-- 权限信息 -->
        <div class="permissions-detail">
          <h4>权限信息</h4>
          <div class="permissions-list">
            <a-tag
              v-for="permission in selectedResource.permissions"
              :key="permission"
              :color="getPermissionColor(permission)"
            >
              {{ getPermissionText(permission) }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CameraOutlined,
  ShareAltOutlined,
  EyeOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RadarChartOutlined,
  DashboardOutlined,
  CompassOutlined,
  ApiOutlined,
  LinkOutlined,
  GlobalOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

/**
 * 资源信息接口
 */
interface ResourceInfo {
  id: string
  name: string
  category: 'camera' | 'sensor' | 'radar' | 'ais'
  description: string
  url: string
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  accessLimit: number
  accessCount: number
  createTime: string
  notes?: string
  todayAccess?: number
  currentOnline?: number
  avgResponseTime?: number
}

/**
 * 共享方式接口
 */
interface SharingMethod {
  id: string
  name: string
  type: 'api' | 'rtmp' | 'http'
  description: string
  enabled: boolean
  endpoint: string
  protocol: string
}

/**
 * 访问记录接口
 */
interface AccessRecord {
  id: string
  user: string
  resource: string
  time: string
  success: boolean
  ip?: string
  userAgent?: string
}

/**
 * 响应式数据
 */
const loading = ref(false)
const activeTab = ref('resources')
const accessChartRef = ref<HTMLElement>()
const accessChart = ref<echarts.ECharts>()
const resourceFilter = reactive({
  category: '',
  status: ''
})

const resourceModal = reactive({
  visible: false,
  title: '添加资源',
  isEdit: false
})

const detailModal = reactive({
  visible: false
})

const selectedResource = ref<ResourceInfo | null>(null)

/**
 * 表单数据
 */
const resourceForm = reactive<Partial<ResourceInfo>>({
  name: '',
  category: 'camera',
  description: '',
  url: '',
  permissions: ['view'],
  accessLimit: 0,
  status: 'active',
  notes: ''
})

/**
 * 表单验证规则
 */
const resourceRules = {
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入资源描述', trigger: 'blur' }],
  url: [{ required: true, message: '请输入资源地址', trigger: 'blur' }],
  permissions: [{ required: true, message: '请选择共享权限', trigger: 'change' }]
}

/**
 * 资源统计数据
 */
const resourceStats = reactive({
  totalResources: 156,
  activeSharing: 142,
  todayAccess: 8923,
  authorizedUsers: 89
})

/**
 * 资源分类统计
 */
const categoryStats = reactive({
  camera: 67,
  sensor: 45,
  radar: 23,
  ais: 21
})

/**
 * 访问性能统计
 */
const performanceStats = reactive({
  avgResponseTime: 89,
  successRate: 96.8,
  peakConcurrentUsers: 234,
  totalBandwidth: '2.8 GB/s'
})

/**
 * 共享协议统计
 */
const protocolStats = reactive({
  http: 45,
  rtmp: 38,
  websocket: 23,
  ftp: 18,
  grpc: 12,
  mqtt: 8,
  other: 12
})

/**
 * 访问统计数据
 */
const accessChartData = reactive({
  dates: [
    '2025-08-01', '2025-08-02', '2025-08-03', '2025-08-04', '2025-08-05',
    '2025-08-06', '2025-08-07', '2025-08-08', '2025-08-09', '2025-08-10',
    '2025-08-11', '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-26'
  ],
  visits: [2345, 2890, 3120, 2980, 3450, 3780, 4120, 3890, 4560, 4230, 4780, 5120, 4890, 5340, 5670],
  apiCalls: [15600, 18900, 21200, 19800, 23400, 26700, 30100, 27800, 33400, 30100, 35600, 38900, 35600, 40100, 43400],
  bandwidth: [1.2, 1.5, 1.8, 1.6, 2.1, 2.4, 2.7, 2.3, 2.9, 2.6, 3.1, 3.4, 3.0, 3.5, 3.8]
})

/**
 * 分页配置
 */
const pagination = reactive({
  current: 1,
  pageSize: 8,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

/**
 * 模拟资源数据
 */
const resourceList = ref<ResourceInfo[]>([
  {
    id: '1',
    name: '济宁港主码头-高清监控01',
    category: 'camera',
    description: '济宁港主码头前沿4K超高清监控摄像头，覆盖范围500米',
    url: 'rtmp://192.168.1.100:1935/live/camera01',
    status: 'active',
    permissions: ['view', 'control'],
    accessLimit: 15,
    accessCount: 12456,
    createTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 456,
    currentOnline: 8,
    avgResponseTime: 95
  },
  {
    id: '2',
    name: '京杭大运河-航道水深传感器',
    category: 'sensor',
    description: '京杭大运河济宁段主航道水深实时监测传感器，精度±0.1米',
    url: 'http://192.168.1.101:8080/api/sensor/depth',
    status: 'active',
    permissions: ['view', 'download'],
    accessLimit: 0,
    accessCount: 8923,
    createTime: dayjs().subtract(45, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 289,
    currentOnline: 12,
    avgResponseTime: 65
  },
  {
    id: '3',
    name: '济宁港区-船舶雷达扫描',
    category: 'radar',
    description: '济宁港区船舶进出港雷达目标扫描数据，探测范围3公里',
    url: 'tcp://192.168.1.102:9999/radar/data',
    status: 'active',
    permissions: ['view'],
    accessLimit: 8,
    accessCount: 6945,
    createTime: dayjs().subtract(60, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 245,
    currentOnline: 5,
    avgResponseTime: 180
  },
  {
    id: '4',
    name: '济宁港-船舶AIS定位',
    category: 'ais',
    description: '济宁港船舶自动识别系统数据，实时跟踪船舶位置和状态',
    url: 'ws://192.168.1.103:8080/ais/stream',
    status: 'active',
    permissions: ['view', 'download', 'share'],
    accessLimit: 20,
    accessCount: 15678,
    createTime: dayjs().subtract(25, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 567,
    currentOnline: 18,
    avgResponseTime: 45
  },
  {
    id: '5',
    name: '济宁港-环境监测站',
    category: 'sensor',
    description: '济宁港区环境质量监测站，监测PM2.5、温湿度、风速等参数',
    url: 'http://192.168.1.104:8080/api/environment/current',
    status: 'active',
    permissions: ['view', 'download'],
    accessLimit: 0,
    accessCount: 7234,
    createTime: dayjs().subtract(40, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 234,
    currentOnline: 6,
    avgResponseTime: 78
  },
  {
    id: '6',
    name: '济宁港-集装箱堆场监控',
    category: 'camera',
    description: '济宁港集装箱堆场全景监控，支持PTZ控制和智能识别',
    url: 'rtmp://192.168.1.105:1935/live/container_yard',
    status: 'active',
    permissions: ['view', 'control'],
    accessLimit: 12,
    accessCount: 9876,
    createTime: dayjs().subtract(35, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 345,
    currentOnline: 9,
    avgResponseTime: 110
  },
  {
    id: '7',
    name: '济宁港-船舶靠泊监控',
    category: 'camera',
    description: '济宁港船舶靠泊作业实时监控，高清画质，支持回放',
    url: 'rtmp://192.168.1.106:1935/live/berth_monitor',
    status: 'active',
    permissions: ['view', 'control', 'download'],
    accessLimit: 18,
    accessCount: 11234,
    createTime: dayjs().subtract(28, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 478,
    currentOnline: 14,
    avgResponseTime: 88
  },
  {
    id: '8',
    name: '济宁港-气象站数据',
    category: 'sensor',
    description: '济宁港区专业气象站，提供精确的天气预报和实时气象数据',
    url: 'http://192.168.1.107:8080/api/weather/current',
    status: 'active',
    permissions: ['view', 'download', 'share'],
    accessLimit: 0,
    accessCount: 15678,
    createTime: dayjs().subtract(50, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 623,
    currentOnline: 22,
    avgResponseTime: 52
  },
  {
    id: '9',
    name: '济宁港-航道交通监控',
    category: 'camera',
    description: '京杭大运河济宁段航道交通监控，覆盖主要航道节点',
    url: 'rtmp://192.168.1.108:1935/live/waterway_traffic',
    status: 'active',
    permissions: ['view'],
    accessLimit: 10,
    accessCount: 8234,
    createTime: dayjs().subtract(42, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 267,
    currentOnline: 7,
    avgResponseTime: 125
  },
  {
    id: '10',
    name: '济宁港-船舶流量统计',
    category: 'sensor',
    description: '济宁港船舶进出港流量统计传感器，实时统计船舶数量',
    url: 'http://192.168.1.109:8080/api/traffic/statistics',
    status: 'active',
    permissions: ['view', 'download'],
    accessLimit: 0,
    accessCount: 5678,
    createTime: dayjs().subtract(38, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 189,
    currentOnline: 4,
    avgResponseTime: 95
  },
  {
    id: '11',
    name: '济宁港-安全巡检机器人',
    category: 'camera',
    description: '济宁港区智能安全巡检机器人，自主巡逻和异常检测',
    url: 'rtmp://192.168.1.110:1935/live/patrol_robot',
    status: 'active',
    permissions: ['view', 'control'],
    accessLimit: 6,
    accessCount: 4567,
    createTime: dayjs().subtract(20, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 156,
    currentOnline: 3,
    avgResponseTime: 140
  },
  {
    id: '12',
    name: '济宁港-船舶污染物监测',
    category: 'sensor',
    description: '济宁港船舶污染物排放监测系统，监测油污、废水等',
    url: 'http://192.168.1.111:8080/api/pollution/monitor',
    status: 'active',
    permissions: ['view', 'download'],
    accessLimit: 0,
    accessCount: 3456,
    createTime: dayjs().subtract(55, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 123,
    currentOnline: 2,
    avgResponseTime: 110
  },
  {
    id: '13',
    name: '济宁港-智能照明控制',
    category: 'sensor',
    description: '济宁港区智能照明控制系统，根据环境光线自动调节',
    url: 'http://192.168.1.112:8080/api/lighting/control',
    status: 'inactive',
    permissions: ['view', 'control'],
    accessLimit: 8,
    accessCount: 2345,
    createTime: dayjs().subtract(65, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 0,
    currentOnline: 0,
    avgResponseTime: 200
  },
  {
    id: '14',
    name: '济宁港-应急通信系统',
    category: 'radar',
    description: '济宁港区应急通信系统，支持紧急情况下的通信保障',
    url: 'tcp://192.168.1.113:9999/emergency/comm',
    status: 'suspended',
    permissions: ['view'],
    accessLimit: 5,
    accessCount: 1234,
    createTime: dayjs().subtract(70, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 0,
    currentOnline: 0,
    avgResponseTime: 300
  },
  {
    id: '15',
    name: '济宁港-船舶维修监控',
    category: 'camera',
    description: '济宁港船舶维修作业监控，支持多角度查看和记录',
    url: 'rtmp://192.168.1.114:1935/live/repair_monitor',
    status: 'active',
    permissions: ['view', 'control', 'download'],
    accessLimit: 15,
    accessCount: 6789,
    createTime: dayjs().subtract(32, 'day').format('YYYY-MM-DD HH:mm:ss'),
    todayAccess: 234,
    currentOnline: 6,
    avgResponseTime: 105
  }
])

/**
 * 模拟共享方式数据
 */
const sharingMethods = ref<SharingMethod[]>([
  {
    id: '1',
    name: 'RESTful API',
    type: 'api',
    description: 'HTTP RESTful API接口，支持JSON/XML格式数据交换',
    enabled: true,
    endpoint: '/api/v1/resources',
    protocol: 'HTTP/HTTPS'
  },
  {
    id: '2',
    name: 'RTMP流媒体',
    type: 'rtmp',
    description: 'RTMP实时流媒体推送，支持多码率自适应',
    enabled: true,
    endpoint: 'rtmp://server:1935/live',
    protocol: 'RTMP'
  },
  {
    id: '3',
    name: 'WebRTC',
    type: 'http',
    description: 'WebRTC点对点传输，低延迟实时通信',
    enabled: false,
    endpoint: '/webrtc/offer',
    protocol: 'WebRTC'
  },
  {
    id: '4',
    name: 'WebSocket',
    type: 'http',
    description: 'WebSocket实时数据推送，支持双向通信',
    enabled: true,
    endpoint: 'ws://server:8080/ws/resources',
    protocol: 'WebSocket'
  },
  {
    id: '5',
    name: 'FTP文件传输',
    type: 'http',
    description: 'FTP文件传输服务，支持大文件下载',
    enabled: true,
    endpoint: 'ftp://server:21/resources',
    protocol: 'FTP'
  },
  {
    id: '6',
    name: 'SFTP安全传输',
    type: 'http',
    description: 'SFTP安全文件传输，加密数据传输',
    enabled: true,
    endpoint: 'sftp://server:22/resources',
    protocol: 'SFTP'
  },
  {
    id: '7',
    name: 'MQTT消息队列',
    type: 'api',
    description: 'MQTT消息队列，支持发布订阅模式',
    enabled: false,
    endpoint: 'mqtt://server:1883/resources',
    protocol: 'MQTT'
  },
  {
    id: '8',
    name: 'gRPC服务',
    type: 'api',
    description: 'gRPC高性能RPC服务，支持多种编程语言',
    enabled: true,
    endpoint: 'grpc://server:9090/resources',
    protocol: 'gRPC'
  }
])

/**
 * 模拟最近访问数据
 */
const recentAccess = ref<AccessRecord[]>([
  {
    id: '1',
    user: '济宁市海事局-监控中心',
    resource: '济宁港主码头-高清监控01',
    time: dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.10.15',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    user: '山东省港口管理局-数据中心',
    resource: '京杭大运河-航道水深传感器',
    time: dayjs().subtract(8, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.20.23',
    userAgent: 'Python-requests/2.28.1'
  },
  {
    id: '3',
    user: '济宁港务集团-调度中心',
    resource: '济宁港区-船舶雷达扫描',
    time: dayjs().subtract(12, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.30.45',
    userAgent: 'Java/11.0.12'
  },
  {
    id: '4',
    user: '中交润杨智慧船舶系统',
    resource: '济宁港-船舶AIS定位',
    time: dayjs().subtract(18, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.40.67',
    userAgent: 'Node.js/16.14.0'
  },
  {
    id: '5',
    user: '济宁市环保局-监测站',
    resource: '济宁港-环境监测站',
    time: dayjs().subtract(25, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.50.89',
    userAgent: 'C#/.NET 6.0'
  },
  {
    id: '6',
    user: '第三方物流公司-监控系统',
    resource: '济宁港-集装箱堆场监控',
    time: dayjs().subtract(32, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: false,
    ip: '192.168.60.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: '7',
    user: '济宁市气象局-预报中心',
    resource: '济宁港-气象站数据',
    time: dayjs().subtract(38, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.70.34',
    userAgent: 'Python-requests/2.31.0'
  },
  {
    id: '8',
    user: '京杭大运河管理局-交通控制',
    resource: '济宁港-航道交通监控',
    time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.80.56',
    userAgent: 'Java/17.0.2'
  },
  {
    id: '9',
    user: '济宁港务集团-安全部',
    resource: '济宁港-安全巡检机器人',
    time: dayjs().subtract(52, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.90.78',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/115.0'
  },
  {
    id: '10',
    user: '济宁市生态环境局-监测科',
    resource: '济宁港-船舶污染物监测',
    time: dayjs().subtract(58, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.100.90',
    userAgent: 'Python-requests/2.29.0'
  },
  {
    id: '11',
    user: '济宁港务集团-技术部',
    resource: '济宁港-智能照明控制',
    time: dayjs().subtract(65, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: false,
    ip: '192.168.110.23',
    userAgent: 'PostmanRuntime/7.32.3'
  },
  {
    id: '12',
    user: '济宁市应急管理局-指挥中心',
    resource: '济宁港-应急通信系统',
    time: dayjs().subtract(72, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: false,
    ip: '192.168.120.45',
    userAgent: 'curl/7.88.1'
  },
  {
    id: '13',
    user: '济宁港务集团-维修部',
    resource: '济宁港-船舶维修监控',
    time: dayjs().subtract(78, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.130.67',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0'
  },
  {
    id: '14',
    user: '济宁市交通局-港航管理处',
    resource: '济宁港-船舶流量统计',
    time: dayjs().subtract(85, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.140.89',
    userAgent: 'Java/8.0.312'
  },
  {
    id: '15',
    user: '第三方船舶代理公司',
    resource: '济宁港-船舶靠泊监控',
    time: dayjs().subtract(92, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    success: true,
    ip: '192.168.150.12',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X)'
  }
])

/**
 * 搜索与排序
 */
const searchKeyword = ref('')
const sortBy = ref<'default' | 'accessCount' | 'createTime' | 'status'>('default')
const sortOrder = ref<'ascend' | 'descend'>('descend')

/**
 * 过滤后的资源列表
 */
const filteredResources = computed(() => {
  let resources = resourceList.value

  if (resourceFilter.category) {
    resources = resources.filter(resource => resource.category === resourceFilter.category)
  }

  if (resourceFilter.status) {
    resources = resources.filter(resource => resource.status === resourceFilter.status)
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.trim().toLowerCase()
    resources = resources.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      r.description.toLowerCase().includes(kw) ||
      r.url.toLowerCase().includes(kw)
    )
  }

  return resources
})

/**
 * 排序后的资源列表
 */
const sortedResources = computed(() => {
  const list = [...filteredResources.value]
  if (sortBy.value === 'default') return list

  const factor = sortOrder.value === 'ascend' ? 1 : -1

  return list.sort((a, b) => {
    if (sortBy.value === 'accessCount') {
      return (a.accessCount - b.accessCount) * factor
    }
    if (sortBy.value === 'createTime') {
      return (dayjs(a.createTime).valueOf() - dayjs(b.createTime).valueOf()) * factor
    }
    if (sortBy.value === 'status') {
      const order = { active: 3, inactive: 2, suspended: 1 } as Record<string, number>
      return ((order[a.status] || 0) - (order[b.status] || 0)) * factor
    }
    return 0
  })
})

/**
 * 分页后的列表
 */
const paginatedResources = computed(() => {
  pagination.total = sortedResources.value.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return sortedResources.value.slice(start, end)
})

/**
 * 事件处理
 */
const onSearch = () => {
  pagination.current = 1
}

// 监听筛选/排序变化，重置到第一页
watch([() => resourceFilter.category, () => resourceFilter.status, sortBy, sortOrder], () => {
  pagination.current = 1
})

/**
 * 表格列定义
 */
const resourceColumns = [
  {
    title: '资源信息',
    key: 'resourceInfo',
    width: 250
  },
  {
    title: '类型',
    key: 'category',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '权限',
    key: 'permissions',
    width: 150
  },
  {
    title: '访问量',
    key: 'accessCount',
    width: 100
  },
  {
    title: '健康状态',
    key: 'health',
    width: 100
  },
  {
    title: '使用率',
    key: 'usage',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 获取资源类型颜色
 */
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    camera: 'blue',
    sensor: 'green',
    radar: 'orange',
    ais: 'purple'
  }
  return colorMap[category] || 'default'
}

/**
 * 获取资源类型文本
 */
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    camera: '摄像头',
    sensor: '传感器',
    radar: '雷达',
    ais: 'AIS'
  }
  return categoryMap[category] || category
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '暂停'
  }
  return statusMap[status] || status
}

/**
 * 获取权限颜色
 */
const getPermissionColor = (permission: string) => {
  const colorMap: Record<string, string> = {
    view: 'blue',
    control: 'orange',
    download: 'green',
    share: 'purple'
  }
  return colorMap[permission] || 'default'
}

/**
 * 获取权限文本
 */
const getPermissionText = (permission: string) => {
  const permissionMap: Record<string, string> = {
    view: '查看',
    control: '控制',
    download: '下载',
    share: '转发'
  }
  return permissionMap[permission] || permission
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 处理过滤条件变化
 */
const handleFilterChange = () => {
  console.log('过滤条件变化:', resourceFilter)
}

/**
 * 显示添加资源弹窗
 */
const showAddResource = () => {
  resourceModal.visible = true
  resourceModal.title = '添加资源'
  resourceModal.isEdit = false
  resetResourceForm()
}

/**
 * 查看资源详情
 */
const viewResource = (resource: ResourceInfo) => {
  selectedResource.value = resource
  detailModal.visible = true
}

/**
 * 编辑资源
 */
const editResource = (resource: ResourceInfo) => {
  resourceModal.visible = true
  resourceModal.title = '编辑资源'
  resourceModal.isEdit = true
  Object.assign(resourceForm, resource)
}

/**
 * 共享资源
 */
const shareResource = (resource: ResourceInfo) => {
  message.info(`开始共享资源: ${resource.name}`)
}

/**
 * 删除资源
 */
const deleteResource = (resource: ResourceInfo) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除资源"${resource.name}"吗？`,
    onOk: () => {
      message.success('资源删除成功')
    }
  })
}

/**
 * 刷新配置
 */
const refreshConfig = () => {
  message.success('配置已刷新')
  // 更新图表数据
  updateAccessChart()
}

/**
 * 监听tab切换
 */
const handleTabChange = (activeKey: string) => {
  if (activeKey === 'config') {
    nextTick(() => {
      initAccessChart()
    })
  }
}

/**
 * 获取资源使用率
 */
const getResourceUsage = (resource: ResourceInfo) => {
  if (resource.accessLimit === 0) return 0
  return Math.round((resource.currentOnline || 0) / resource.accessLimit * 100)
}

/**
 * 获取资源健康状态
 */
const getResourceHealth = (resource: ResourceInfo) => {
  const responseTime = resource.avgResponseTime || 0
  if (responseTime < 100) return 'excellent'
  if (responseTime < 200) return 'good'
  if (responseTime < 500) return 'warning'
  return 'critical'
}

/**
 * 获取资源健康状态颜色
 */
const getHealthColor = (health: string) => {
  const colorMap: Record<string, string> = {
    excellent: 'green',
    good: 'blue',
    warning: 'orange',
    critical: 'red'
  }
  return colorMap[health] || 'default'
}

/**
 * 获取资源健康状态文本
 */
const getHealthText = (health: string) => {
  const textMap: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    warning: '警告',
    critical: '严重'
  }
  return textMap[health] || '未知'
}

/**
 * 导出资源列表
 */
const exportResourceList = () => {
  const csvContent = [
    '资源ID,资源名称,类型,状态,访问量,创建时间',
    ...resourceList.value.map(resource => 
      `${resource.id},${resource.name},${getCategoryText(resource.category)},${getStatusText(resource.status)},${resource.accessCount},${resource.createTime}`
    ).join('\n')
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `共享资源列表_${dayjs().format('YYYY-MM-DD')}.csv`
  link.click()
  message.success('资源列表导出成功')
}

/**
 * 切换共享方式
 */
const toggleSharingMethod = (method: SharingMethod) => {
  message.success(`${method.name} ${method.enabled ? '已启用' : '已禁用'}`)
}

/**
 * 提交资源表单
 */
const handleResourceSubmit = () => {
  if (resourceModal.isEdit) {
    message.success('资源信息更新成功')
  } else {
    message.success('资源添加成功')
  }
  resourceModal.visible = false
  resetResourceForm()
}

/**
 * 取消资源表单
 */
const handleResourceCancel = () => {
  resourceModal.visible = false
  resetResourceForm()
}

/**
 * 重置资源表单
 */
const resetResourceForm = () => {
  Object.assign(resourceForm, {
    name: '',
    category: 'camera',
    description: '',
    url: '',
    permissions: ['view'],
    accessLimit: 0,
    status: 'active',
    notes: ''
  })
}

/**
 * 初始化访问统计图表
 */
const initAccessChart = () => {
  if (!accessChartRef.value) return
  
  accessChart.value = echarts.init(accessChartRef.value)
  
  const option = {
    title: {
      text: '资源访问趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['访问量', 'API调用', '带宽(GB/s)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: accessChartData.dates,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '访问量/API调用',
        position: 'left'
      },
      {
        type: 'value',
        name: '带宽(GB/s)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '访问量',
        type: 'line',
        data: accessChartData.visits,
        smooth: true,
        lineStyle: {
          color: '#1890ff'
        },
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: 'API调用',
        type: 'line',
        data: accessChartData.apiCalls,
        smooth: true,
        lineStyle: {
          color: '#52c41a'
        },
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '带宽(GB/s)',
        type: 'line',
        yAxisIndex: 1,
        data: accessChartData.bandwidth,
        smooth: true,
        lineStyle: {
          color: '#faad14'
        },
        itemStyle: {
          color: '#faad14'
        }
      }
    ]
  }
  
  accessChart.value.setOption(option)
}

/**
 * 更新访问统计图表
 */
const updateAccessChart = () => {
  if (!accessChart.value) return
  
  // 模拟实时数据更新
  const newVisits = accessChartData.visits.map(v => v + Math.floor(Math.random() * 200 - 100))
  const newApiCalls = accessChartData.apiCalls.map(v => v + Math.floor(Math.random() * 1000 - 500))
  const newBandwidth = accessChartData.bandwidth.map(v => Math.max(0.1, v + (Math.random() * 0.4 - 0.2)))
  
  accessChartData.visits = newVisits
  accessChartData.apiCalls = newApiCalls
  accessChartData.bandwidth = newBandwidth
  
  accessChart.value.setOption({
    series: [
      { data: newVisits },
      { data: newApiCalls },
      { data: newBandwidth }
    ]
  })
}

/**
 * 处理表格分页变化
 */
const onTableChange = (paginationInfo: any, filters: any, sorter: any) => {
  pagination.current = paginationInfo.current
  pagination.pageSize = paginationInfo.pageSize
  if (sorter && sorter.order) {
    sortBy.value = (sorter.field || sortBy.value)
    sortOrder.value = sorter.order
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  pagination.total = resourceList.value.length
  console.log('共享资源池页面已加载，共', resourceList.value.length, '个资源')
  
  // 初始化图表
  nextTick(() => {
    if (activeTab.value === 'config') {
      initAccessChart()
    }
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (accessChart.value) {
      accessChart.value.resize()
    }
  })
})

/**
 * 桌面数据共享 - 会话模型
 * @typedef DesktopSession
 * @property {string} id - 会话ID
 * @property {string} title - 会话标题
 * @property {'active'|'idle'|'error'} status - 会话状态
 * @property {string} resolution - 分辨率，如 1920x1080
 * @property {number} fps - 帧率
 * @property {number} latency - 延迟(ms)
 * @property {number} packetLoss - 丢包率%
 * @property {number} bitrate - 码率(Mbps)
 * @property {string} source - 来源/单位
 * @property {boolean} loading - 是否加载中（用于Skeleton）
 */

// 桌面共享：筛选/排序/分页状态
const desktopSearchKeyword = ref('')
const desktopFilter = reactive({ status: '' })
const desktopSortBy = ref<'default'|'bitrate'|'fps'|'latency'>('default')
const desktopSortOrder = ref<'ascend'|'descend'>('descend')
const desktopPagination = reactive({ current: 1, pageSize: 8 })

// 模拟桌面共享会话数据
const desktopSessions = ref<Array<any>>([
  { id: 'd1', title: '调度中心-大屏1', status: 'active', resolution: '1920x1080', fps: 30, latency: 65, packetLoss: 0.4, bitrate: 8.6, source: '调度中心', loading: false },
  { id: 'd2', title: '海事局-航道监控', status: 'active', resolution: '2560x1440', fps: 60, latency: 42, packetLoss: 0.2, bitrate: 12.3, source: '海事局', loading: false },
  { id: 'd3', title: '港口集团-会议室', status: 'idle', resolution: '1280x720', fps: 25, latency: 88, packetLoss: 0.9, bitrate: 4.2, source: '港口集团', loading: false },
  { id: 'd4', title: '应急指挥-综合态势', status: 'active', resolution: '3840x2160', fps: 30, latency: 75, packetLoss: 0.6, bitrate: 18.4, source: '应急管理局', loading: false },
  { id: 'd5', title: '气象中心-预报平台', status: 'idle', resolution: '1920x1080', fps: 30, latency: 120, packetLoss: 1.2, bitrate: 6.1, source: '气象局', loading: false },
  { id: 'd6', title: '安全监督-巡检终端', status: 'error', resolution: '1920x1080', fps: 0, latency: 0, packetLoss: 0, bitrate: 0, source: '安全监督', loading: false },
  { id: 'd7', title: '技术保障-测试台', status: 'active', resolution: '2560x1440', fps: 48, latency: 54, packetLoss: 0.5, bitrate: 10.9, source: '技术保障', loading: false },
  { id: 'd8', title: '港航管理-调研端', status: 'active', resolution: '1920x1080', fps: 30, latency: 68, packetLoss: 0.7, bitrate: 7.2, source: '港航管理处', loading: false },
  { id: 'd9', title: '环保监测-分析台', status: 'idle', resolution: '1920x1080', fps: 25, latency: 135, packetLoss: 1.8, bitrate: 5.5, source: '生态环境局', loading: false },
  { id: 'd10', title: '外部合作-联测端', status: 'active', resolution: '1920x1200', fps: 30, latency: 72, packetLoss: 0.6, bitrate: 9.1, source: '第三方合作', loading: false }
])

/**
 * 过滤桌面共享会话
 * @returns {Array<any>} 过滤后的会话
 */
const desktopFilteredSessions = computed(() => {
  let list = desktopSessions.value
  if (desktopFilter.status) {
    list = list.filter(s => s.status === desktopFilter.status)
  }
  if (desktopSearchKeyword.value) {
    const kw = desktopSearchKeyword.value.toLowerCase()
    list = list.filter(s =>
      s.title.toLowerCase().includes(kw) ||
      s.source.toLowerCase().includes(kw)
    )
  }
  return list
})

/**
 * 排序桌面共享会话
 */
const desktopSortedSessions = computed(() => {
  const list = [...desktopFilteredSessions.value]
  if (desktopSortBy.value === 'default') return list
  const factor = desktopSortOrder.value === 'ascend' ? 1 : -1
  return list.sort((a, b) => {
    if (desktopSortBy.value === 'bitrate') return (a.bitrate - b.bitrate) * factor
    if (desktopSortBy.value === 'fps') return (a.fps - b.fps) * factor
    if (desktopSortBy.value === 'latency') return (a.latency - b.latency) * factor
    return 0
  })
})

/**
 * 分页桌面共享会话
 */
const desktopPaginatedSessions = computed(() => {
  const start = (desktopPagination.current - 1) * desktopPagination.pageSize
  const end = start + desktopPagination.pageSize
  return desktopSortedSessions.value.slice(start, end)
})

/** 事件处理 */
const handleDesktopSearch = () => { desktopPagination.current = 1 }
const handleDesktopPageChange = (current: number) => { desktopPagination.current = current }
const handleDesktopPageSizeChange = (_current: number, size: number) => { desktopPagination.pageSize = size; desktopPagination.current = 1 }

/**
 * 刷新会话（模拟：进入Skeleton，然后随机刷新指标）
 */
const refreshDesktopSessions = () => {
  desktopSessions.value.forEach(s => s.loading = true)
  setTimeout(() => {
    desktopSessions.value.forEach(s => {
      s.loading = false
      if (s.status !== 'error') {
        s.fps = Math.max(10, Math.min(60, Math.round(s.fps + (Math.random() * 10 - 5))))
        s.latency = Math.max(40, Math.min(220, Math.round(s.latency + (Math.random() * 30 - 15))))
        s.packetLoss = Math.max(0, Math.min(5, +(s.packetLoss + (Math.random() * 1 - 0.5)).toFixed(1)))
        s.bitrate = Math.max(2, Math.min(25, +(s.bitrate + (Math.random() * 2 - 1)).toFixed(1)))
      }
    })
  }, 800)
}

/**
 * 重试异常会话（模拟：转为loading，恢复为active并赋随机指标）
 */
const retryDesktopSession = (session: any) => {
  session.loading = true
  setTimeout(() => {
    session.loading = false
    session.status = 'active'
    session.fps = 30 + Math.round(Math.random() * 20)
    session.latency = 60 + Math.round(Math.random() * 40)
    session.packetLoss = +(Math.random().toFixed(1))
    session.bitrate = +(6 + Math.random() * 6).toFixed(1)
  }, 800)
}

/**
 * 打开会话（模拟）
 */
const openDesktopSession = (session: any) => {
  message.info(`打开会话：${session.title}`)
}
</script>

<style lang="less" scoped>
.resource-pool {
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

  .resource-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .resource-content {
    .main-content-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      // Tabs 样式
      .ant-tabs {
        .ant-tabs-nav {
          margin-bottom: 24px;
          
          .ant-tabs-tab {
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 500;
            
            &.ant-tabs-tab-active {
              background: #f0f8ff;
              border-color: #1890ff;
            }
          }
        }
      }

      // Tab 头部样式
      .tab-header {
        margin-bottom: 20px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      // 资源信息样式
      .resource-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .resource-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          background: #1890ff;
        }

        .resource-details {
          .resource-name {
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }

          .resource-description {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
        }
      }

      .permissions-info {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .access-stats {
        text-align: center;

        .access-count {
          font-weight: 500;
          color: #333;
          font-size: 16px;
        }

        .access-label {
          font-size: 11px;
          color: #999;
        }
      }

      .usage-stats {
        display: flex;
        align-items: center;
        gap: 8px;

        .usage-text {
          font-size: 12px;
          color: #666;
          min-width: 35px;
        }
      }

      // 共享方式配置样式
      .sharing-methods {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .method-list {
          .method-item {
            background: #fafafa;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
            border: 2px solid transparent;
            transition: all 0.3s;

            &.active {
              border-color: #1890ff;
              background: #f0f8ff;
            }

            .method-header {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .method-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .method-icon {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  background: #1890ff;
                }

                .method-details {
                  .method-name {
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 2px;
                    font-size: 14px;
                  }

                  .method-description {
                    font-size: 12px;
                    color: #666;
                  }
                }
              }
            }

            .method-config {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #e8e8e8;

              .config-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 12px;

                &:last-child {
                  margin-bottom: 0;
                }

                .config-label {
                  color: #666;
                }

                .config-value {
                  color: #333;
                  font-family: monospace;
                }
              }
            }
          }
        }
      }

      // 访问统计样式
      .access-statistics {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

                 .stats-chart {
           .chart-container {
             width: 100%;
             height: 300px;
             background: white;
             border-radius: 8px;
             border: 1px solid #f0f0f0;
           }
         }

        .performance-metrics {
          margin-top: 16px;

          .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .metric-label {
              color: #666;
              font-size: 13px;
            }

            .metric-value {
              color: #1890ff;
              font-weight: 500;
              font-size: 13px;
            }
          }
        }
      }

      // 资源分类统计样式
      .category-statistics {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .category-list {
          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .category-name {
              color: #666;
              font-size: 13px;
            }

            .category-count {
              color: #1890ff;
              font-weight: 500;
              font-size: 13px;
            }
          }
        }
      }

      // 最近访问样式
      .recent-access {
        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .access-list {
          max-height: 200px;
          overflow-y: auto;

          .access-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 8px;
            background: #fafafa;
            border-radius: 4px;

            .access-info {
              .access-user {
                font-weight: 500;
                color: #333;
                font-size: 13px;
                margin-bottom: 2px;
              }

              .access-resource {
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
              }

              .access-time {
                font-size: 11px;
                color: #999;
              }
            }
          }
        }
      }
    }
  }

  .resource-detail {
    .access-statistics-detail {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .permissions-detail {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .permissions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .resource-pool {
    .resource-content {
      .ant-col-16 {
        width: 100%;
        margin-bottom: 24px;
      }

      .ant-col-8 {
        width: 100%;
      }
    }
  }
}

@media (max-width: 768px) {
  .resource-pool {
    padding: 16px;

    .resource-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

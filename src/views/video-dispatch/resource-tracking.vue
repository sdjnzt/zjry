<template>
  <div class="resource-tracking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>资源跟踪</h1>
      <p>实时跟踪和监控调度资源的分布、状态和运行情况</p>
    </div>

    <!-- 资源概览统计 -->
    <div class="resource-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <VideoCameraOutlined />
                监控设备
              </span>
            </template>
            <div class="statistic-value">{{ resourceStats.camera.total }}</div>
            <div class="statistic-desc">
              在线：{{ resourceStats.camera.online }} | 离线：{{ resourceStats.camera.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <CarOutlined />
                移动设备
              </span>
            </template>
            <div class="statistic-value">{{ resourceStats.mobile.total }}</div>
            <div class="statistic-desc">
              在线：{{ resourceStats.mobile.online }} | 离线：{{ resourceStats.mobile.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <TeamOutlined />
                人员资源
              </span>
            </template>
            <div class="statistic-value">{{ resourceStats.personnel.total }}</div>
            <div class="statistic-desc">
              在岗：{{ resourceStats.personnel.online }} | 离岗：{{ resourceStats.personnel.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <ToolOutlined />
                设备资源
              </span>
            </template>
            <div class="statistic-value">{{ resourceStats.equipment.total }}</div>
            <div class="statistic-desc">
              可用：{{ resourceStats.equipment.online }} | 维护：{{ resourceStats.equipment.offline }}
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 资源分布地图 -->
    <!-- 已移除地图功能 -->

    <!-- 资源状态监控 -->
    <div class="resource-monitoring">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="实时状态监控" class="monitoring-card">
            <div class="status-list">
              <div
                v-for="item in paginatedStatus"
                :key="item.id"
                class="status-item"
                :class="item.status"
              >
                <div class="status-icon">
                  <component :is="item.icon" />
                </div>
                <div class="status-info">
                  <div class="status-name">{{ item.name }}</div>
                  <div class="status-desc">{{ item.description }}</div>
                  <div class="status-time">{{ item.updateTime }}</div>
                </div>
                <div class="status-indicator">
                  <a-tag :color="getStatusColor(item.status)">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </div>
              </div>
            </div>
            
            <!-- 分页组件 -->
            <div class="status-pagination">
              <a-pagination
                v-model:current="statusPagination.current"
                :page-size="statusPagination.pageSize"
                :total="realTimeStatus.length"
                :show-size-changer="false"
                :show-quick-jumper="false"
                :show-total="(total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
                size="small"
                @change="handleStatusPageChange"
              />
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="资源利用率" class="utilization-card">
            <div class="utilization-charts">
              <div class="chart-item">
                <div class="chart-title">监控设备利用率</div>
                <a-progress
                  :percent="utilizationStats.camera"
                  :stroke-color="getProgressColor(utilizationStats.camera)"
                  :format="(percent: number) => `${percent}%`"
                />
              </div>
              <div class="chart-item">
                <div class="chart-title">移动设备利用率</div>
                <a-progress
                  :percent="utilizationStats.mobile"
                  :stroke-color="getProgressColor(utilizationStats.mobile)"
                  :format="(percent: number) => `${percent}%`"
                />
              </div>
              <div class="chart-item">
                <div class="chart-title">人员资源利用率</div>
                <a-progress
                  :percent="utilizationStats.personnel"
                  :stroke-color="getProgressColor(utilizationStats.personnel)"
                  :format="(percent: number) => `${percent}%`"
                />
              </div>
              <div class="chart-item">
                <div class="chart-title">设备资源利用率</div>
                <a-progress
                  :percent="utilizationStats.equipment"
                  :stroke-color="getProgressColor(utilizationStats.equipment)"
                  :format="(percent: number) => `${percent}%`"
                />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <a-card title="资源详细列表" class="list-card">
        <div class="list-filters">
          <a-row :gutter="16" align="middle">
            <a-col :span="6">
              <a-select
                v-model:value="filterType"
                placeholder="资源类型"
                style="width: 100%"
                @change="handleFilterChange"
              >
                <a-select-option value="">全部类型</a-select-option>
                <a-select-option value="camera">监控设备</a-select-option>
                <a-select-option value="mobile">移动设备</a-select-option>
                <a-select-option value="personnel">人员资源</a-select-option>
                <a-select-option value="equipment">设备资源</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select
                v-model:value="filterStatus"
                placeholder="资源状态"
                style="width: 100%"
                @change="handleFilterChange"
              >
                <a-select-option value="">全部状态</a-select-option>
                <a-select-option value="online">在线</a-select-option>
                <a-select-option value="offline">离线</a-select-option>
                <a-select-option value="warning">警告</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="8">
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索资源名称、位置..."
                enter-button
                @search="handleSearch"
              />
            </a-col>
            <a-col :span="4" style="text-align: right">
              <a-button type="primary" @click="refreshResources">
                <ReloadOutlined />
                刷新
              </a-button>
            </a-col>
          </a-row>
        </div>

        <a-table
          :columns="resourceColumns"
          :data-source="filteredResources"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
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
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewResourceDetail(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editResource(record)">
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="toggleResourceStatus(record)"
                >
                  {{ record.status === 'online' ? '离线' : '上线' }}
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 资源详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="资源详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="资源名称">
          {{ selectedResource.name }}
        </a-descriptions-item>
        <a-descriptions-item label="资源类型">
          <a-tag :color="getTypeColor(selectedResource.type)">
            {{ getTypeText(selectedResource.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="资源状态">
          <a-tag :color="getStatusColor(selectedResource.status)">
            {{ getStatusText(selectedResource.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="位置信息">
          {{ selectedResource.location }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ selectedResource.manager }}
        </a-descriptions-item>
        <a-descriptions-item label="联系方式">
          {{ selectedResource.contact }}
        </a-descriptions-item>
        <a-descriptions-item label="最后更新">
          {{ selectedResource.updateTime }}
        </a-descriptions-item>
        <a-descriptions-item label="备注">
          {{ selectedResource.remark || '无' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 编辑资源弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑资源"
      width="500px"
      @ok="handleEditOk"
      @cancel="handleEditCancel"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="资源名称" name="name">
          <a-input v-model:value="editForm.name" placeholder="请输入资源名称" />
        </a-form-item>
        <a-form-item label="资源类型" name="type">
          <a-select v-model:value="editForm.type" placeholder="请选择资源类型">
            <a-select-option value="camera">监控设备</a-select-option>
            <a-select-option value="mobile">移动设备</a-select-option>
            <a-select-option value="personnel">人员资源</a-select-option>
            <a-select-option value="equipment">设备资源</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="位置信息" name="location">
          <a-input v-model:value="editForm.location" placeholder="请输入位置信息" />
        </a-form-item>
        <a-form-item label="负责人" name="manager">
          <a-input v-model:value="editForm.manager" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系方式" name="contact">
          <a-input v-model:value="editForm.contact" placeholder="请输入联系方式" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="editForm.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  VideoCameraOutlined,
  CarOutlined,
  TeamOutlined,
  ToolOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

/**
 * 资源数据接口
 */
interface ResourceData {
  id: string
  name: string
  type: string
  status: string
  location: string
  manager: string
  contact: string
  updateTime: string
  remark?: string
}

/**
 * 编辑表单接口
 */
interface EditForm {
  name: string
  type: string
  location: string
  manager: string
  contact: string
  remark: string
}

// 响应式数据
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const selectedResource = ref<ResourceData>({} as ResourceData)

// 资源统计数据
const resourceStats = reactive({
  camera: { total: 1247, online: 1189, offline: 58 },
  mobile: { total: 234, online: 218, offline: 16 },
  personnel: { total: 456, online: 423, offline: 33 },
  equipment: { total: 789, online: 745, offline: 44 }
})



// 实时状态数据
const realTimeStatus = ref([
  {
    id: '1',
    name: '主航道监控点A',
    description: '实时监控主航道船舶通行情况',
    status: 'online',
    updateTime: '2025-08-20 15:30:00',
    icon: VideoCameraOutlined
  },
  {
    id: '2',
    name: '移动巡查车01',
    description: '执行日常巡查任务',
    status: 'online',
    updateTime: '2025-08-20 15:28:00',
    icon: CarOutlined
  },
  {
    id: '3',
    name: '应急响应小组',
    description: '待命状态，随时响应紧急情况',
    status: 'online',
    updateTime: '2025-08-20 15:25:00',
    icon: TeamOutlined
  },
  {
    id: '4',
    name: '无人机设备03',
    description: '设备维护中，预计2小时后恢复',
    status: 'warning',
    updateTime: '2025-08-20 15:20:00',
    icon: ToolOutlined
  },
  {
    id: '5',
    name: '吴淞口监控点B',
    description: '监控吴淞口船舶进出港情况',
    status: 'online',
    updateTime: '2025-08-20 15:18:00',
    icon: VideoCameraOutlined
  },
  {
    id: '6',
    name: '宝山港监控点C',
    description: '监控宝山港码头作业情况',
    status: 'online',
    updateTime: '2025-08-20 15:15:00',
    icon: VideoCameraOutlined
  },
  {
    id: '7',
    name: '外高桥监控点D',
    description: '监控外高桥港区安全情况',
    status: 'online',
    updateTime: '2025-08-20 15:12:00',
    icon: VideoCameraOutlined
  },
  {
    id: '8',
    name: '移动巡查车02',
    description: '执行专项检查任务',
    status: 'online',
    updateTime: '2025-08-20 15:10:00',
    icon: CarOutlined
  },
  {
    id: '9',
    name: '无人机设备01',
    description: '执行高空巡查任务',
    status: 'online',
    updateTime: '2025-08-20 15:08:00',
    icon: ToolOutlined
  },
  {
    id: '10',
    name: '无人机设备02',
    description: '执行低空巡查任务',
    status: 'online',
    updateTime: '2025-08-20 15:05:00',
    icon: ToolOutlined
  },
  {
    id: '11',
    name: '应急救援小组',
    description: '执行救援任务',
    status: 'online',
    updateTime: '2025-08-20 15:02:00',
    icon: TeamOutlined
  },
  {
    id: '12',
    name: '技术维护小组',
    description: '执行设备维护任务',
    status: 'warning',
    updateTime: '2025-08-20 14:58:00',
    icon: TeamOutlined
  }
])

// 资源利用率数据
const utilizationStats = reactive({
  camera: 92,
  mobile: 89,
  personnel: 87,
  equipment: 91
})

// 资源列表数据
const resourceList = ref<ResourceData[]>([
  {
    id: '1',
    name: '主航道监控点A',
    type: 'camera',
    status: 'online',
    location: '主航道入口处',
    manager: '陈志强',
    contact: '13800138001',
    updateTime: '2025-08-20 15:30:00',
    remark: '高清摄像头，支持夜视功能'
  },
  {
    id: '2',
    name: '移动巡查车01',
    type: 'mobile',
    status: 'online',
    location: '巡查路线A段',
    manager: '刘建国',
    contact: '13800138002',
    updateTime: '2025-08-20 15:28:00',
    remark: '配备高清摄像头和通讯设备'
  },
  {
    id: '3',
    name: '应急响应小组',
    type: 'personnel',
    status: 'online',
    location: '应急指挥中心',
    manager: '王海峰',
    contact: '13800138003',
    updateTime: '2025-08-20 15:25:00',
    remark: '24小时待命，专业应急响应'
  },
  {
    id: '4',
    name: '无人机设备03',
    type: 'equipment',
    status: 'warning',
    location: '设备维护中心',
    manager: '赵明华',
    contact: '13800138004',
    updateTime: '2025-08-20 15:20:00',
    remark: '设备维护中，预计2小时后恢复'
  },
  {
    id: '5',
    name: '吴淞口监控点B',
    type: 'camera',
    status: 'online',
    location: '吴淞口港区',
    manager: '钱伟民',
    contact: '13800138005',
    updateTime: '2025-08-20 15:18:00',
    remark: '4K超高清摄像头，支持360度旋转'
  },
  {
    id: '6',
    name: '宝山港监控点C',
    type: 'camera',
    status: 'online',
    location: '宝山港码头',
    manager: '孙志刚',
    contact: '13800138006',
    updateTime: '2025-08-20 15:15:00',
    remark: '高清摄像头，支持热成像功能'
  },
  {
    id: '7',
    name: '外高桥监控点D',
    type: 'camera',
    status: 'online',
    location: '外高桥港区',
    manager: '周建军',
    contact: '13800138007',
    updateTime: '2025-08-20 15:12:00',
    remark: '高清摄像头，支持人脸识别功能'
  },
  {
    id: '8',
    name: '移动巡查车02',
    type: 'mobile',
    status: 'online',
    location: '巡查路线B段',
    manager: '吴建华',
    contact: '13800138008',
    updateTime: '2025-08-20 15:10:00',
    remark: '配备高清摄像头和通讯设备'
  },
  {
    id: '9',
    name: '无人机设备01',
    type: 'equipment',
    status: 'online',
    location: '无人机基地',
    manager: '郑国强',
    contact: '13800138009',
    updateTime: '2025-08-20 15:08:00',
    remark: '高空巡查无人机，续航时间2小时'
  },
  {
    id: '10',
    name: '无人机设备02',
    type: 'equipment',
    status: 'online',
    location: '无人机基地',
    manager: '王建军',
    contact: '13800138010',
    updateTime: '2025-08-20 15:05:00',
    remark: '低空巡查无人机，续航时间1.5小时'
  },
  {
    id: '11',
    name: '应急救援小组',
    type: 'personnel',
    status: 'online',
    location: '应急救援中心',
    manager: '李志强',
    contact: '13800138011',
    updateTime: '2025-08-20 15:02:00',
    remark: '专业救援人员，配备救援设备'
  },
  {
    id: '12',
    name: '技术维护小组',
    type: 'personnel',
    status: 'warning',
    location: '技术维护中心',
    manager: '张伟民',
    contact: '13800138012',
    updateTime: '2025-08-20 14:58:00',
    remark: '技术维护人员，负责设备维护'
  }
])

// 编辑表单
const editFormRef = ref()
const editForm = reactive<EditForm>({
  name: '',
  type: '',
  location: '',
  manager: '',
  contact: '',
  remark: ''
})

// 表单验证规则
const editFormRules = {
  name: [{ required: true, message: '请输入资源名称' }],
  type: [{ required: true, message: '请选择资源类型' }],
  location: [{ required: true, message: '请输入位置信息' }],
  manager: [{ required: true, message: '请输入负责人' }],
  contact: [{ required: true, message: '请输入联系方式' }]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 实时状态监控分页配置
const statusPagination = reactive({
  current: 1,
  pageSize: 3
})

// 表格列定义
const resourceColumns = [
  {
    title: '资源名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '资源类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '资源状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '位置信息',
    dataIndex: 'location',
    key: 'location',
    width: 150
  },
  {
    title: '负责人',
    dataIndex: 'manager',
    key: 'manager',
    width: 100
  },
  {
    title: '最后更新',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性：过滤后的资源列表
const filteredResources = computed(() => {
  let filtered = resourceList.value

  if (filterType.value) {
    filtered = filtered.filter(item => item.type === filterType.value)
  }

  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  if (searchKeyword.value) {
    filtered = filtered.filter(item =>
      item.name.includes(searchKeyword.value) ||
      item.location.includes(searchKeyword.value)
    )
  }

  return filtered
})

// 计算属性：实时状态监控的当前页数据
const paginatedStatus = computed(() => {
  const start = (statusPagination.current - 1) * statusPagination.pageSize
  const end = start + statusPagination.pageSize
  return realTimeStatus.value.slice(start, end)
})

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    online: 'green',
    offline: 'red',
    warning: 'orange'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    warning: '警告'
  }
  return textMap[status] || status
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    camera: 'blue',
    mobile: 'green',
    personnel: 'purple',
    equipment: 'orange'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    camera: '监控设备',
    mobile: '移动设备',
    personnel: '人员资源',
    equipment: '设备资源'
  }
  return textMap[type] || type
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (percent: number): string => {
  if (percent >= 80) return '#52c41a'
  if (percent >= 60) return '#fa8c16'
  return '#ff4d4f'
}

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  pagination.current = 1
  // 实现筛选逻辑
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.current = 1
  // 实现搜索逻辑
}

/**
 * 刷新资源
 */
const refreshResources = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('资源信息已刷新')
  }, 1000)
}

/**
 * 处理实时状态监控分页变化
 */
const handleStatusPageChange = (current: number, pageSize: number) => {
  statusPagination.current = current
  statusPagination.pageSize = pageSize
}

/**
 * 查看资源详情
 */
const viewResourceDetail = (record: ResourceData) => {
  selectedResource.value = record
  detailModalVisible.value = true
}

/**
 * 编辑资源
 */
const editResource = (record: ResourceData) => {
  Object.assign(editForm, record)
  editModalVisible.value = true
}

/**
 * 切换资源状态
 */
const toggleResourceStatus = (record: ResourceData) => {
  const action = record.status === 'online' ? '离线' : '上线'
  Modal.confirm({
    title: `确认${action}资源`,
    content: `确定要${action}资源"${record.name}"吗？`,
    onOk: () => {
      record.status = record.status === 'online' ? 'offline' : 'online'
      record.updateTime = new Date().toLocaleString()
      message.success(`资源${action}成功`)
    }
  })
}

/**
 * 处理编辑确认
 */
const handleEditOk = () => {
  editFormRef.value?.validate().then(() => {
    const index = resourceList.value.findIndex(item => item.id === selectedResource.value.id)
    if (index > -1) {
      Object.assign(resourceList.value[index], {
        ...editForm,
        updateTime: new Date().toLocaleString()
      })
      message.success('资源信息更新成功')
      editModalVisible.value = false
    }
  })
}

/**
 * 处理编辑取消
 */
const handleEditCancel = () => {
  editModalVisible.value = false
  Object.assign(editForm, {
    name: '',
    type: '',
    location: '',
    manager: '',
    contact: '',
    remark: ''
  })
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 实现分页逻辑
}

// 组件挂载后的初始化
onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    resourceStats.camera.online = Math.floor(Math.random() * 20) + 1180
    resourceStats.camera.offline = 1247 - resourceStats.camera.online
    resourceStats.mobile.online = Math.floor(Math.random() * 20) + 200
    resourceStats.mobile.offline = 234 - resourceStats.mobile.online
    resourceStats.personnel.online = Math.floor(Math.random() * 20) + 400
    resourceStats.personnel.offline = 456 - resourceStats.personnel.online
    resourceStats.equipment.online = Math.floor(Math.random() * 20) + 720
    resourceStats.equipment.offline = 789 - resourceStats.equipment.online
  }, 10000)

  
})









onUnmounted(() => {
  // 组件卸载时的清理工作
})
</script>

<style lang="less" scoped>
.resource-tracking {
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

  .resource-overview {
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



  .resource-monitoring {
    margin-bottom: 24px;

    .monitoring-card {
      .status-list {
        .status-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &.warning {
            background: #fff7e6;
          }

          .status-icon {
            font-size: 24px;
            color: #1890ff;
            margin-right: 16px;
          }

          .status-info {
            flex: 1;

            .status-name {
              font-size: 16px;
              font-weight: 600;
              color: #1f1f1f;
              margin-bottom: 4px;
            }

            .status-desc {
              font-size: 14px;
              color: #666;
              margin-bottom: 4px;
            }

            .status-time {
              font-size: 12px;
              color: #999;
            }
          }

          .status-indicator {
            margin-left: 16px;
          }
        }
      }

      .status-pagination {
        margin-top: 20px;
        text-align: right;
      }
    }

    .utilization-card {
      .utilization-charts {
        .chart-item {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }

          .chart-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
        }
      }
    }
  }

  .resource-list {
    .list-card {
      .list-filters {
        margin-bottom: 16px;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
      }

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

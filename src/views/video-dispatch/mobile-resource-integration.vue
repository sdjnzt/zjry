<template>
  <div class="mobile-resource-integration">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>移动资源集成</h1>
      <p>集成和管理移动监控设备，实现移动资源的统一调度和协同工作</p>
    </div>

    <!-- 移动资源概览 -->
    <div class="mobile-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <CarOutlined />
                移动车辆
              </span>
            </template>
            <div class="statistic-value">{{ mobileStats.vehicles.total }}</div>
            <div class="statistic-desc">
              在线：{{ mobileStats.vehicles.online }} | 离线：{{ mobileStats.vehicles.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <RocketOutlined />
                无人机
              </span>
            </template>
            <div class="statistic-value">{{ mobileStats.drones.total }}</div>
            <div class="statistic-desc">
              在线：{{ mobileStats.drones.online }} | 离线：{{ mobileStats.drones.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <TeamOutlined />
                移动人员
              </span>
            </template>
            <div class="statistic-value">{{ mobileStats.personnel.total }}</div>
            <div class="statistic-desc">
              在岗：{{ mobileStats.personnel.online }} | 离岗：{{ mobileStats.personnel.offline }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <template #title>
              <span class="card-title">
                <ToolOutlined />
                便携设备
              </span>
            </template>
            <div class="statistic-value">{{ mobileStats.portable.total }}</div>
            <div class="statistic-desc">
              可用：{{ mobileStats.portable.online }} | 维护：{{ mobileStats.portable.offline }}
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 移动资源地图 -->
    <div class="mobile-map">
      <a-card title="移动资源实时分布" class="map-card">
        <div class="map-container">
          <div class="map-placeholder">
            <div class="map-content">
              <div class="map-title">移动资源分布图</div>
              <div class="map-stats">
                <div class="map-stat-item">
                  <span class="stat-dot vehicle"></span>
                  <span class="stat-label">车辆：{{ mapStats.vehicles }}</span>
                </div>
                <div class="map-stat-item">
                  <span class="stat-dot drone"></span>
                  <span class="stat-label">无人机：{{ mapStats.drones }}</span>
                </div>
                <div class="map-stat-item">
                  <span class="stat-dot personnel"></span>
                  <span class="stat-label">人员：{{ mapStats.personnel }}</span>
                </div>
                <div class="map-stat-item">
                  <span class="stat-dot portable"></span>
                  <span class="stat-label">设备：{{ mapStats.portable }}</span>
                </div>
              </div>
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-color online"></span>
                  <span>在线</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color offline"></span>
                  <span>离线</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color moving"></span>
                  <span>移动中</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 移动资源管理 -->
    <div class="mobile-management">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="实时状态监控" class="status-card">
            <div class="status-list">
              <div
                v-for="item in realTimeStatus"
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
                  <div class="status-location">{{ item.location }}</div>
                  <div class="status-time">{{ item.updateTime }}</div>
                </div>
                <div class="status-indicator">
                  <a-tag :color="getStatusColor(item.status)">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="资源调度状态" class="dispatch-card">
            <div class="dispatch-status">
              <div class="dispatch-item">
                <div class="dispatch-label">正在调度</div>
                <div class="dispatch-value">{{ dispatchStats.active }}</div>
                <div class="dispatch-unit">个任务</div>
              </div>
              <div class="dispatch-item">
                <div class="dispatch-label">等待调度</div>
                <div class="dispatch-value">{{ dispatchStats.waiting }}</div>
                <div class="dispatch-unit">个任务</div>
              </div>
              <div class="dispatch-item">
                <div class="dispatch-label">已完成</div>
                <div class="dispatch-value">{{ dispatchStats.completed }}</div>
                <div class="dispatch-unit">个任务</div>
              </div>
            </div>
            <div class="dispatch-actions">
              <a-button type="primary" @click="showDispatchModal">
                <PlusOutlined />
                新建调度
              </a-button>
              <a-button style="margin-left: 8px" @click="refreshStatus">
                <ReloadOutlined />
                刷新状态
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 移动资源列表 -->
    <div class="mobile-list">
      <a-card title="移动资源列表" class="list-card">
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
                <a-select-option value="vehicle">移动车辆</a-select-option>
                <a-select-option value="drone">无人机</a-select-option>
                <a-select-option value="personnel">移动人员</a-select-option>
                <a-select-option value="portable">便携设备</a-select-option>
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
                <a-select-option value="moving">移动中</a-select-option>
                <a-select-option value="maintenance">维护中</a-select-option>
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
              <a-button type="primary" @click="addMobileResource">
                <PlusOutlined />
                添加资源
              </a-button>
            </a-col>
          </a-row>
        </div>

        <a-table
          :columns="mobileColumns"
          :data-source="filteredMobileResources"
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
                <a-button type="link" size="small" @click="viewMobileDetail(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editMobileResource(record)">
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="toggleMobileStatus(record)"
                >
                  {{ record.status === 'online' ? '离线' : '上线' }}
                </a-button>
                <a-button type="link" size="small" danger @click="deleteMobileResource(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新建调度弹窗 -->
    <a-modal
      v-model:open="dispatchModalVisible"
      title="新建移动资源调度"
      width="600px"
      @ok="handleDispatchOk"
      @cancel="handleDispatchCancel"
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
            <a-select-option value="patrol">巡查任务</a-select-option>
            <a-select-option value="emergency">应急响应</a-select-option>
            <a-select-option value="monitoring">监控任务</a-select-option>
            <a-select-option value="support">支援任务</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标区域" name="targetArea">
          <a-input v-model:value="dispatchForm.targetArea" placeholder="请输入目标区域" />
        </a-form-item>
        <a-form-item label="调度资源" name="resources">
          <a-select
            v-model:value="dispatchForm.resources"
            mode="multiple"
            placeholder="请选择调度的移动资源"
          >
            <a-select-option
              v-for="resource in availableResources"
              :key="resource.id"
              :value="resource.id"
            >
              {{ resource.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="任务描述" name="description">
          <a-textarea
            v-model:value="dispatchForm.description"
            placeholder="请描述调度任务的具体要求"
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

    <!-- 移动资源详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="移动资源详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="资源名称">
          {{ selectedMobileResource.name }}
        </a-descriptions-item>
        <a-descriptions-item label="资源类型">
          <a-tag :color="getTypeColor(selectedMobileResource.type)">
            {{ getTypeText(selectedMobileResource.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="资源状态">
          <a-tag :color="getStatusColor(selectedMobileResource.status)">
            {{ getStatusText(selectedMobileResource.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="当前位置">
          {{ selectedMobileResource.location }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ selectedMobileResource.manager }}
        </a-descriptions-item>
        <a-descriptions-item label="联系方式">
          {{ selectedMobileResource.contact }}
        </a-descriptions-item>
        <a-descriptions-item label="设备信息">
          {{ selectedMobileResource.equipment }}
        </a-descriptions-item>
        <a-descriptions-item label="最后更新">
          {{ selectedMobileResource.updateTime }}
        </a-descriptions-item>
        <a-descriptions-item label="备注">
          {{ selectedMobileResource.remark || '无' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 添加/编辑移动资源弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="editModalTitle"
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
            <a-select-option value="vehicle">移动车辆</a-select-option>
            <a-select-option value="drone">无人机</a-select-option>
            <a-select-option value="personnel">移动人员</a-select-option>
            <a-select-option value="portable">便携设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="当前位置" name="location">
          <a-input v-model:value="editForm.location" placeholder="请输入当前位置" />
        </a-form-item>
        <a-form-item label="负责人" name="manager">
          <a-input v-model:value="editForm.manager" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系方式" name="contact">
          <a-input v-model:value="editForm.contact" placeholder="请输入联系方式" />
        </a-form-item>
        <a-form-item label="设备信息" name="equipment">
          <a-textarea
            v-model:value="editForm.equipment"
            placeholder="请输入设备信息"
            :rows="2"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CarOutlined,
  RocketOutlined,
  TeamOutlined,
  ToolOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

/**
 * 移动资源数据接口
 */
interface MobileResource {
  id: string
  name: string
  type: string
  status: string
  location: string
  manager: string
  contact: string
  equipment: string
  updateTime: string
  remark?: string
}

/**
 * 调度表单接口
 */
interface DispatchForm {
  type: string
  targetArea: string
  resources: string[]
  description: string
  priority: string
  remark: string
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
  equipment: string
  remark: string
}

// 响应式数据
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const dispatchModalVisible = ref(false)
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const editModalTitle = ref('添加移动资源')
const isEdit = ref(false)
const selectedMobileResource = ref<MobileResource>({} as MobileResource)

// 移动资源统计数据
const mobileStats = reactive({
  vehicles: { total: 234, online: 218, offline: 16 },
  drones: { total: 156, online: 142, offline: 14 },
  personnel: { total: 456, online: 423, offline: 33 },
  portable: { total: 345, online: 318, offline: 27 }
})

// 地图统计数据
const mapStats = reactive({
  vehicles: 234,
  drones: 156,
  personnel: 456,
  portable: 345
})

// 调度统计数据
const dispatchStats = reactive({
  active: 23,
  waiting: 15,
  completed: 1247
})

// 实时状态数据
const realTimeStatus = ref([
  {
    id: '1',
    name: '巡查车01',
    description: '执行日常巡查任务',
    location: '主航道A段',
    status: 'moving',
    updateTime: '2025-08-20 15:30:00',
    icon: CarOutlined
  },
  {
    id: '2',
    name: '无人机03',
    description: '高空监控任务',
    location: '港口上空',
    status: 'online',
    updateTime: '2025-08-20 15:28:00',
    icon: RocketOutlined
  },
  {
    id: '3',
    name: '应急小组A',
    description: '待命状态',
    location: '应急指挥中心',
    status: 'online',
    updateTime: '2025-08-20 15:25:00',
    icon: TeamOutlined
  },
  {
    id: '4',
    name: '便携监控设备02',
    description: '临时监控点',
    location: '临时监控点B',
    status: 'online',
    updateTime: '2025-08-20 15:20:00',
    icon: ToolOutlined
  },
  {
    id: '5',
    name: '巡查车02',
    description: '执行专项检查任务',
    location: '吴淞口港区',
    status: 'moving',
    updateTime: '2025-08-20 15:18:00',
    icon: CarOutlined
  },
  {
    id: '6',
    name: '无人机01',
    description: '执行高空巡查任务',
    location: '宝山港上空',
    status: 'online',
    updateTime: '2025-08-20 15:15:00',
    icon: RocketOutlined
  },
  {
    id: '7',
    name: '无人机02',
    description: '执行低空巡查任务',
    location: '外高桥港区',
    status: 'online',
    updateTime: '2025-08-20 15:12:00',
    icon: RocketOutlined
  },
  {
    id: '8',
    name: '应急小组B',
    description: '执行救援任务',
    location: '罗泾港码头',
    status: 'online',
    updateTime: '2025-08-20 15:10:00',
    icon: TeamOutlined
  },
  {
    id: '9',
    name: '便携监控设备01',
    description: '临时监控点',
    location: '长兴岛临时点',
    status: 'online',
    updateTime: '2025-08-20 15:08:00',
    icon: ToolOutlined
  },
  {
    id: '10',
    name: '便携监控设备03',
    description: '临时监控点',
    location: '横沙岛临时点',
    status: 'warning',
    updateTime: '2025-08-20 15:05:00',
    icon: ToolOutlined
  },
  {
    id: '11',
    name: '巡查车03',
    description: '执行日常巡查任务',
    location: '崇明岛区域',
    status: 'moving',
    updateTime: '2025-08-20 15:02:00',
    icon: CarOutlined
  },
  {
    id: '12',
    name: '技术维护小组',
    description: '执行设备维护任务',
    location: '设备维护中心',
    status: 'offline',
    updateTime: '2025-08-20 14:58:00',
    icon: TeamOutlined
  }
])

// 移动资源列表数据
const mobileResourceList = ref<MobileResource[]>([
  {
    id: '1',
    name: '巡查车01',
    type: 'vehicle',
    status: 'online',
    location: '主航道A段',
    manager: '李磊',
    contact: '13800138001',
    equipment: '高清摄像头、通讯设备、GPS定位',
    updateTime: '2025-08-20 15:30:00',
    remark: '配备夜视功能，支持24小时巡查'
  },
  {
    id: '2',
    name: '无人机03',
    type: 'drone',
    status: 'online',
    location: '港口上空',
    manager: '王璐',
    contact: '13800138002',
    equipment: '高清摄像头、红外传感器、GPS定位',
    updateTime: '2025-08-20 15:28:00',
    remark: '续航时间2小时，最大飞行高度500米'
  },
  {
    id: '3',
    name: '应急小组A',
    type: 'personnel',
    status: 'online',
    location: '应急指挥中心',
    manager: '孙洋',
    contact: '13800138003',
    equipment: '便携监控设备、通讯设备、应急装备',
    updateTime: '2025-08-20 15:25:00',
    remark: '专业应急响应团队，24小时待命'
  },
  {
    id: '4',
    name: '便携监控设备02',
    type: 'portable',
    status: 'online',
    location: '临时监控点B',
    manager: '李宇',
    contact: '13800138004',
    equipment: '便携摄像头、移动电源、无线传输',
    updateTime: '2025-08-20 15:20:00',
    remark: '快速部署，支持移动监控'
  },
  {
    id: '5',
    name: '巡查车02',
    type: 'vehicle',
    status: 'online',
    location: '吴淞口港区',
    manager: '张华',
    contact: '13800138005',
    equipment: '高清摄像头、通讯设备、GPS定位',
    updateTime: '2025-08-20 15:18:00',
    remark: '配备热成像功能，支持全天候巡查'
  },
  {
    id: '6',
    name: '无人机01',
    type: 'drone',
    status: 'online',
    location: '宝山港上空',
    manager: '孙海洋',
    contact: '13800138006',
    equipment: '4K高清摄像头、红外传感器、GPS定位',
    updateTime: '2025-08-20 15:15:00',
    remark: '续航时间3小时，最大飞行高度800米'
  },
  {
    id: '7',
    name: '无人机02',
    type: 'drone',
    status: 'online',
    location: '外高桥港区',
    manager: '周建华',
    contact: '13800138007',
    equipment: '高清摄像头、红外传感器、GPS定位',
    updateTime: '2025-08-20 15:12:00',
    remark: '续航时间2.5小时，最大飞行高度600米'
  },
  {
    id: '8',
    name: '应急小组B',
    type: 'personnel',
    status: 'online',
    location: '罗泾港码头',
    manager: '吴志强',
    contact: '13800138008',
    equipment: '便携监控设备、通讯设备、应急装备',
    updateTime: '2025-08-20 15:10:00',
    remark: '专业救援团队，配备专业救援设备'
  },
  {
    id: '9',
    name: '便携监控设备01',
    type: 'portable',
    status: 'online',
    location: '长兴岛临时点',
    manager: '李晓光',
    contact: '13800138009',
    equipment: '便携摄像头、移动电源、无线传输',
    updateTime: '2025-08-20 15:08:00',
    remark: '快速部署，支持移动监控'
  },
  {
    id: '10',
    name: '便携监控设备03',
    type: 'portable',
    status: 'warning',
    location: '横沙岛临时点',
    manager: '赵明亮',
    contact: '13800138010',
    equipment: '便携摄像头、移动电源、无线传输',
    updateTime: '2025-08-20 15:05:00',
    remark: '设备故障，正在维修中'
  },
  {
    id: '11',
    name: '巡查车03',
    type: 'vehicle',
    status: 'online',
    location: '崇明岛区域',
    manager: '李明华',
    contact: '13800138011',
    equipment: '高清摄像头、通讯设备、GPS定位',
    updateTime: '2025-08-20 15:02:00',
    remark: '配备夜视功能，支持24小时巡查'
  },
  {
    id: '12',
    name: '技术维护小组',
    type: 'personnel',
    status: 'offline',
    location: '设备维护中心',
    manager: '陈志强',
    contact: '13800138012',
    equipment: '维修工具、测试设备、通讯设备',
    updateTime: '2025-08-20 14:58:00',
    remark: '专业技术人员，负责设备维护'
  }
])

// 可用资源列表
const availableResources = computed(() => {
  return mobileResourceList.value.filter(resource => resource.status === 'online')
})

// 调度表单
const dispatchFormRef = ref()
const dispatchForm = reactive<DispatchForm>({
  type: '',
  targetArea: '',
  resources: [],
  description: '',
  priority: '',
  remark: ''
})

// 编辑表单
const editFormRef = ref()
const editForm = reactive<EditForm>({
  name: '',
  type: '',
  location: '',
  manager: '',
  contact: '',
  equipment: '',
  remark: ''
})

// 表单验证规则
const dispatchFormRules = {
  type: [{ required: true, message: '请选择调度类型' }],
  targetArea: [{ required: true, message: '请输入目标区域' }],
  resources: [{ required: true, message: '请选择调度资源' }],
  description: [{ required: true, message: '请描述调度任务' }],
  priority: [{ required: true, message: '请选择优先级' }]
}

const editFormRules = {
  name: [{ required: true, message: '请输入资源名称' }],
  type: [{ required: true, message: '请选择资源类型' }],
  location: [{ required: true, message: '请输入当前位置' }],
  manager: [{ required: true, message: '请输入负责人' }],
  contact: [{ required: true, message: '请输入联系方式' }],
  equipment: [{ required: true, message: '请输入设备信息' }]
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

// 表格列定义
const mobileColumns = [
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
    title: '当前位置',
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

// 计算属性：过滤后的移动资源列表
const filteredMobileResources = computed(() => {
  let filtered = mobileResourceList.value

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

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    online: 'green',
    offline: 'red',
    moving: 'blue',
    maintenance: 'orange'
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
    moving: '移动中',
    maintenance: '维护中'
  }
  return textMap[status] || status
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    vehicle: 'blue',
    drone: 'green',
    personnel: 'purple',
    portable: 'orange'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    vehicle: '移动车辆',
    drone: '无人机',
    personnel: '移动人员',
    portable: '便携设备'
  }
  return textMap[type] || type
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
 * 刷新状态
 */
const refreshStatus = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('状态信息已刷新')
  }, 1000)
}

/**
 * 显示调度弹窗
 */
const showDispatchModal = () => {
  dispatchModalVisible.value = true
}

/**
 * 添加移动资源
 */
const addMobileResource = () => {
  editModalTitle.value = '添加移动资源'
  isEdit.value = false
  resetEditForm()
  editModalVisible.value = true
}

/**
 * 查看移动资源详情
 */
const viewMobileDetail = (record: MobileResource) => {
  selectedMobileResource.value = record
  detailModalVisible.value = true
}

/**
 * 编辑移动资源
 */
const editMobileResource = (record: MobileResource) => {
  editModalTitle.value = '编辑移动资源'
  isEdit.value = true
  Object.assign(editForm, record)
  editModalVisible.value = true
}

/**
 * 切换移动资源状态
 */
const toggleMobileStatus = (record: MobileResource) => {
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
 * 删除移动资源
 */
const deleteMobileResource = (record: MobileResource) => {
  Modal.confirm({
    title: '确认删除资源',
    content: `确定要删除资源"${record.name}"吗？此操作不可恢复。`,
    onOk: () => {
      const index = mobileResourceList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        mobileResourceList.value.splice(index, 1)
        message.success('资源删除成功')
      }
    }
  })
}

/**
 * 处理调度确认
 */
const handleDispatchOk = () => {
  dispatchFormRef.value?.validate().then(() => {
    message.success('调度任务创建成功')
    dispatchModalVisible.value = false
    resetDispatchForm()
  })
}

/**
 * 处理调度取消
 */
const handleDispatchCancel = () => {
  dispatchModalVisible.value = false
  resetDispatchForm()
}

/**
 * 处理编辑确认
 */
const handleEditOk = () => {
  editFormRef.value?.validate().then(() => {
    if (isEdit.value) {
      // 编辑资源
      const index = mobileResourceList.value.findIndex(item => item.id === selectedMobileResource.value.id)
      if (index > -1) {
        Object.assign(mobileResourceList.value[index], {
          ...editForm,
          updateTime: new Date().toLocaleString()
        })
        message.success('资源信息更新成功')
      }
    } else {
      // 添加资源
      const newResource: MobileResource = {
        id: Date.now().toString(),
        ...editForm,
        status: 'offline',
        updateTime: new Date().toLocaleString()
      }
      mobileResourceList.value.unshift(newResource)
      message.success('资源添加成功')
    }
    editModalVisible.value = false
  })
}

/**
 * 处理编辑取消
 */
const handleEditCancel = () => {
  editModalVisible.value = false
  resetEditForm()
}

/**
 * 重置调度表单
 */
const resetDispatchForm = () => {
  Object.assign(dispatchForm, {
    type: '',
    targetArea: '',
    resources: [],
    description: '',
    priority: '',
    remark: ''
  })
}

/**
 * 重置编辑表单
 */
const resetEditForm = () => {
  Object.assign(editForm, {
    name: '',
    type: '',
    location: '',
    manager: '',
    contact: '',
    equipment: '',
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

// 组件挂载时初始化数据
onMounted(() => {
  pagination.total = mobileResourceList.value.length
})
</script>

<style lang="less" scoped>
.mobile-resource-integration {
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

  .mobile-overview {
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

  .mobile-map {
    margin-bottom: 24px;

    .map-card {
      .map-container {
        height: 400px;
        background: #fafafa;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .map-placeholder {
          text-align: center;
          color: #666;

          .map-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
          }

          .map-stats {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-bottom: 24px;

            .map-stat-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .stat-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;

                &.vehicle {
                  background: #1890ff;
                }

                &.drone {
                  background: #52c41a;
                }

                &.personnel {
                  background: #722ed1;
                }

                &.portable {
                  background: #fa8c16;
                }
              }

              .stat-label {
                font-size: 14px;
              }
            }
          }

          .map-legend {
            display: flex;
            justify-content: center;
            gap: 24px;

            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 4px;

                &.online {
                  background: #52c41a;
                }

                &.offline {
                  background: #ff4d4f;
                }

                &.moving {
                  background: #1890ff;
                }
              }
            }
          }
        }
      }
    }
  }

  .mobile-management {
    margin-bottom: 24px;

    .status-card {
      .status-list {
        .status-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
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

            .status-location {
              font-size: 12px;
              color: #999;
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
    }

    .dispatch-card {
      .dispatch-status {
        display: flex;
        justify-content: space-around;
        margin-bottom: 24px;

        .dispatch-item {
          text-align: center;

          .dispatch-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }

          .dispatch-value {
            font-size: 32px;
            font-weight: 600;
            color: #1890ff;
            margin-bottom: 4px;
          }

          .dispatch-unit {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .dispatch-actions {
        text-align: center;
      }
    }
  }

  .mobile-list {
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

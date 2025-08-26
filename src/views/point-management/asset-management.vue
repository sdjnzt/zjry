<template>
  <div class="asset-management">
    <div class="page-header">
      <h2>资产台账管理</h2>
      <p>管理前端设备电子档案，包括摄像头、传感器、网络设备等</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <!-- 调试信息 -->
      <div style="margin-bottom: 16px; padding: 8px; background: #f0f0f0; border-radius: 4px; font-size: 12px;">
        <strong>当前搜索条件：</strong>
        设备类型: {{ searchForm.deviceType || '未选择' }} | 
        状态: {{ searchForm.status || '未选择' }} | 
        区域: {{ searchForm.area || '未选择' }}
      </div>
      
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="搜索设备名称、编号、位置"
            allow-clear
            @change="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="searchForm.deviceType"
            placeholder="请选择设备类型"
            allow-clear
            style="width: 100%"
            size="middle"
            show-search
            :filter-option="false"
            :not-found-content="null"
            @change="handleSearch"
          >
            <a-select-option value="camera">摄像头</a-select-option>
            <a-select-option value="sensor">传感器</a-select-option>
            <a-select-option value="network">网络设备</a-select-option>
            <a-select-option value="storage">存储设备</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择运行状态"
            allow-clear
            style="width: 100%"
            size="middle"
            show-search
            :filter-option="false"
            :not-found-content="null"
            @change="handleSearch"
          >
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="maintenance">维护中</a-select-option>
            <a-select-option value="fault">故障</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="searchForm.area"
            placeholder="请选择所属区域"
            allow-clear
            style="width: 100%"
            size="middle"
            show-search
            :filter-option="false"
            :not-found-content="null"
            @change="handleSearch"
          >
            <a-select-option value="area1">港区A</a-select-option>
            <a-select-option value="area2">港区B</a-select-option>
            <a-select-option value="area3">航道区</a-select-option>
            <a-select-option value="area4">锚地区</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
            <a-button type="primary" @click="showAddModal">
              <PlusOutlined />
              添加设备
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 设备列表 -->
    <div class="device-list">
      <a-table
        :columns="columns"
        :data-source="deviceList"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- 设备名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'deviceName'">
            <div class="device-info">
              <div class="device-icon">
                <CameraOutlined v-if="record.deviceType === 'camera'" />
                <RadarChartOutlined v-else-if="record.deviceType === 'sensor'" />
                <WifiOutlined v-else-if="record.deviceType === 'network'" />
                <DatabaseOutlined v-else />
              </div>
              <div class="device-details">
                <div class="device-name">{{ record.deviceName }}</div>
                <div class="device-id">ID: {{ record.deviceId }}</div>
              </div>
            </div>
          </template>

          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 位置列 -->
          <template v-else-if="column.key === 'location'">
            <div class="location-info">
              <div>{{ record.location }}</div>
              <div class="coordinates">
                {{ record.coordinates }}
              </div>
            </div>
          </template>

          <!-- 最后在线时间列 -->
          <template v-else-if="column.key === 'lastOnline'">
            <div class="time-info">
              <div>{{ formatTime(record.lastOnline) }}</div>
              <div class="duration">
                {{ getDurationText(record.lastOnline) }}
              </div>
            </div>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDevice(record)">
                <EyeOutlined />
                查看
              </a-button>
              <a-button type="link" size="small" @click="editDevice(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button type="link" size="small" @click="showMaintenance(record)">
                <ToolOutlined />
                维护
              </a-button>
              <a-button type="link" size="small" @click="deleteDevice(record)">
                <DeleteOutlined />
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑设备弹窗 -->
    <a-modal
      v-model:open="deviceModal.visible"
      :title="deviceModal.title"
      width="800px"
      @ok="handleDeviceSubmit"
      @cancel="handleDeviceCancel"
    >
      <a-form
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="deviceRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备名称" name="deviceName">
              <a-input v-model:value="deviceForm.deviceName" placeholder="请输入设备名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备编号" name="deviceId">
              <a-input v-model:value="deviceForm.deviceId" placeholder="请输入设备编号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备类型" name="deviceType">
              <a-select v-model:value="deviceForm.deviceType" placeholder="请选择设备类型">
                <a-select-option value="camera">摄像头</a-select-option>
                <a-select-option value="sensor">传感器</a-select-option>
                <a-select-option value="network">网络设备</a-select-option>
                <a-select-option value="storage">存储设备</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属区域" name="area">
              <a-select v-model:value="deviceForm.area" placeholder="请选择所属区域">
                <a-select-option value="area1">港区A</a-select-option>
                <a-select-option value="area2">港区B</a-select-option>
                <a-select-option value="area3">航道区</a-select-option>
                <a-select-option value="area4">锚地区</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="安装位置" name="location">
              <a-input v-model:value="deviceForm.location" placeholder="请输入安装位置" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="坐标信息" name="coordinates">
              <a-input v-model:value="deviceForm.coordinates" placeholder="请输入坐标信息" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="IP地址" name="ipAddress">
              <a-input v-model:value="deviceForm.ipAddress" placeholder="请输入IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="端口号" name="port">
              <a-input-number v-model:value="deviceForm.port" placeholder="请输入端口号" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="制造商" name="manufacturer">
              <a-input v-model:value="deviceForm.manufacturer" placeholder="请输入制造商" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="型号" name="model">
              <a-input v-model:value="deviceForm.model" placeholder="请输入型号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="安装日期" name="installDate">
              <a-date-picker v-model:value="deviceForm.installDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="保修期至" name="warrantyDate">
              <a-date-picker v-model:value="deviceForm.warrantyDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="设备描述" name="description">
          <a-textarea
            v-model:value="deviceForm.description"
            placeholder="请输入设备描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 设备详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      title="设备详情"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedDevice" class="device-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="设备名称">
            {{ selectedDevice.deviceName }}
          </a-descriptions-item>
          <a-descriptions-item label="设备编号">
            {{ selectedDevice.deviceId }}
          </a-descriptions-item>
          <a-descriptions-item label="设备类型">
            {{ getDeviceTypeText(selectedDevice.deviceType) }}
          </a-descriptions-item>
          <a-descriptions-item label="运行状态">
            <a-tag :color="getStatusColor(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="所属区域">
            {{ getAreaText(selectedDevice.area) }}
          </a-descriptions-item>
          <a-descriptions-item label="安装位置">
            {{ selectedDevice.location }}
          </a-descriptions-item>
          <a-descriptions-item label="坐标信息">
            {{ selectedDevice.coordinates }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ selectedDevice.ipAddress }}
          </a-descriptions-item>
          <a-descriptions-item label="端口号">
            {{ selectedDevice.port }}
          </a-descriptions-item>
          <a-descriptions-item label="制造商">
            {{ selectedDevice.manufacturer }}
          </a-descriptions-item>
          <a-descriptions-item label="型号">
            {{ selectedDevice.model }}
          </a-descriptions-item>
          <a-descriptions-item label="安装日期">
            {{ formatDate(selectedDevice.installDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="保修期至">
            {{ formatDate(selectedDevice.warrantyDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="最后在线时间" :span="2">
            {{ formatTime(selectedDevice.lastOnline) }}
          </a-descriptions-item>
          <a-descriptions-item label="设备描述" :span="2">
            {{ selectedDevice.description || '暂无描述' }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 设备状态监控 -->
        <div class="status-monitor">
          <h4>实时状态监控</h4>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="CPU使用率" :value="selectedDevice.cpuUsage" suffix="%" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="内存使用率" :value="selectedDevice.memoryUsage" suffix="%" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="网络流量" :value="selectedDevice.networkTraffic" suffix="MB/s" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="存储使用率" :value="selectedDevice.storageUsage" suffix="%" />
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>

    <!-- 维护记录弹窗 -->
    <a-modal
      v-model:open="maintenanceModal.visible"
      title="设备维护记录"
      width="800px"
      @ok="handleMaintenanceSubmit"
      @cancel="handleMaintenanceCancel"
    >
      <a-form
        :model="maintenanceForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="维护类型">
          <a-select v-model:value="maintenanceForm.type" placeholder="请选择维护类型">
            <a-select-option value="routine">例行维护</a-select-option>
            <a-select-option value="repair">故障维修</a-select-option>
            <a-select-option value="upgrade">设备升级</a-select-option>
            <a-select-option value="inspection">定期检查</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="维护内容">
          <a-textarea
            v-model:value="maintenanceForm.content"
            placeholder="请输入维护内容"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="维护人员">
          <a-input v-model:value="maintenanceForm.technician" placeholder="请输入维护人员姓名" />
        </a-form-item>
        <a-form-item label="维护日期">
          <a-date-picker v-model:value="maintenanceForm.date" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="maintenanceForm.notes"
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
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  DeleteOutlined,
  CameraOutlined,
  RadarChartOutlined,
  WifiOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 设备信息接口定义
 */
interface Device {
  id: string
  deviceName: string
  deviceId: string
  deviceType: 'camera' | 'sensor' | 'network' | 'storage'
  area: string
  location: string
  coordinates: string
  ipAddress: string
  port: number
  manufacturer: string
  model: string
  installDate: string
  warrantyDate: string
  status: 'online' | 'offline' | 'maintenance' | 'fault'
  lastOnline: string
  description?: string
  cpuUsage: number
  memoryUsage: number
  networkTraffic: number
  storageUsage: number
}

/**
 * 搜索表单数据
 */
const searchForm = reactive({
  keyword: '',
  deviceType: 'camera', // 设置默认值
  status: 'online',     // 设置默认值
  area: 'area1'         // 设置默认值
})

/**
 * 设备表单数据
 */
const deviceForm = reactive<Partial<Device>>({
  deviceName: '',
  deviceId: '',
  deviceType: 'camera',
  area: '',
  location: '',
  coordinates: '',
  ipAddress: '',
  port: 80,
  manufacturer: '',
  model: '',
  installDate: '',
  warrantyDate: '',
  description: ''
})

/**
 * 维护表单数据
 */
const maintenanceForm = reactive({
  type: '',
  content: '',
  technician: '',
  date: '',
  notes: ''
})

/**
 * 弹窗状态管理
 */
const deviceModal = reactive({
  visible: false,
  title: '添加设备',
  isEdit: false
})

const detailModal = reactive({
  visible: false
})

const maintenanceModal = reactive({
  visible: false
})

/**
 * 响应式数据
 */
const loading = ref(false)
const deviceList = ref<Device[]>([])
const selectedDevice = ref<Device | null>(null)
const deviceFormRef = ref()
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

/**
 * 表格列定义
 */
const columns = [
  {
    title: '设备信息',
    key: 'deviceName',
    width: 200
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    key: 'deviceType',
    width: 120,
    customRender: ({ text }: { text: string }) => getDeviceTypeText(text)
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '位置信息',
    key: 'location',
    width: 200
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    key: 'ipAddress',
    width: 120
  },
  {
    title: '最后在线',
    key: 'lastOnline',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 表单验证规则
 */
const deviceRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  area: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  ipAddress: [{ required: true, message: '请输入IP地址', trigger: 'blur' }]
}

/**
 * 获取设备类型文本
 */
const getDeviceTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    camera: '摄像头',
    sensor: '传感器',
    network: '网络设备',
    storage: '存储设备'
  }
  return typeMap[type] || type
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    online: 'green',
    offline: 'red',
    maintenance: 'orange',
    fault: 'red'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
    fault: '故障'
  }
  return statusMap[status] || status
}

/**
 * 获取区域文本
 */
const getAreaText = (area: string) => {
  const areaMap: Record<string, string> = {
    area1: '港区A',
    area2: '港区B',
    area3: '航道区',
    area4: '锚地区'
  }
  return areaMap[area] || area
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 获取持续时间文本
 */
const getDurationText = (time: string) => {
  const now = dayjs()
  const lastTime = dayjs(time)
  const diff = now.diff(lastTime, 'minute')
  
  if (diff < 60) {
    return `${diff}分钟前`
  } else if (diff < 1440) {
    return `${Math.floor(diff / 60)}小时前`
  } else {
    return `${Math.floor(diff / 1440)}天前`
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadDeviceList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    deviceType: 'camera',
    status: 'online',
    area: 'area1'
  })
  handleSearch()
}

/**
 * 显示添加设备弹窗
 */
const showAddModal = () => {
  deviceModal.visible = true
  deviceModal.title = '添加设备'
  deviceModal.isEdit = false
  resetDeviceForm()
}

/**
 * 编辑设备
 */
const editDevice = (device: Device) => {
  deviceModal.visible = true
  deviceModal.title = '编辑设备'
  deviceModal.isEdit = true
  Object.assign(deviceForm, device)
}

/**
 * 查看设备详情
 */
const viewDevice = (device: Device) => {
  selectedDevice.value = device
  detailModal.visible = true
}

/**
 * 显示维护弹窗
 */
const showMaintenance = (device: Device) => {
  selectedDevice.value = device
  maintenanceModal.visible = true
}

/**
 * 删除设备
 */
const deleteDevice = (device: Device) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除设备"${device.deviceName}"吗？`,
    onOk: () => {
      // 这里应该调用删除API
      message.success('删除成功')
      loadDeviceList()
    }
  })
}

/**
 * 提交设备表单
 */
const handleDeviceSubmit = async () => {
  try {
    await deviceFormRef.value.validate()
    
    if (deviceModal.isEdit) {
      // 编辑设备
      message.success('设备信息更新成功')
    } else {
      // 添加设备
      message.success('设备添加成功')
    }
    
    deviceModal.visible = false
    loadDeviceList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 取消设备表单
 */
const handleDeviceCancel = () => {
  deviceModal.visible = false
  resetDeviceForm()
}

/**
 * 提交维护记录
 */
const handleMaintenanceSubmit = () => {
  message.success('维护记录添加成功')
  maintenanceModal.visible = false
  resetMaintenanceForm()
}

/**
 * 取消维护记录
 */
const handleMaintenanceCancel = () => {
  maintenanceModal.visible = false
  resetMaintenanceForm()
}

/**
 * 重置设备表单
 */
const resetDeviceForm = () => {
  Object.assign(deviceForm, {
    deviceName: '',
    deviceId: '',
    deviceType: 'camera',
    area: '',
    location: '',
    coordinates: '',
    ipAddress: '',
    port: 80,
    manufacturer: '',
    model: '',
    installDate: '',
    warrantyDate: '',
    description: ''
  })
}

/**
 * 重置维护表单
 */
const resetMaintenanceForm = () => {
  Object.assign(maintenanceForm, {
    type: '',
    content: '',
    technician: '',
    date: '',
    notes: ''
  })
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadDeviceList()
}

/**
 * 加载设备列表
 */
const loadDeviceList = () => {
  loading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    // 生成模拟数据
    const mockData: Device[] = Array.from({ length: 50 }, (_, index) => {
      // 真实的设备名称配置
      const deviceNames = {
        camera: [
          '海康威视 DS-2CD3T47G2-L 4K球机',
          '大华 DH-SD6C232-HN 200万枪机',
          '海康威视 DS-2CD3T56-I3 500万筒机',
          '大华 DH-SD6C232-HN 300万枪机',
          '海康威视 DS-2CD3T47G2-L 4K球机',
          '大华 DH-SD6C232-HN 200万枪机',
          '海康威视 DS-2CD3T56-I3 500万筒机',
          '大华 DH-SD6C232-HN 300万枪机',
          '海康威视 DS-2CD3T47G2-L 4K球机',
          '大华 DH-SD6C232-HN 200万枪机',
          '海康威视 DS-2CD3T56-I3 500万筒机',
          '大华 DH-SD6C232-HN 300万枪机'
        ],
        sensor: [
          '温湿度传感器 DHT22',
          '压力传感器 MPX5050',
          '液位传感器 YW-1',
          '振动传感器 ADXL345',
          '气体传感器 MQ-2',
          '光照传感器 BH1750',
          '温湿度传感器 DHT22',
          '压力传感器 MPX5050',
          '液位传感器 YW-1',
          '振动传感器 ADXL345',
          '气体传感器 MQ-2',
          '光照传感器 BH1750'
        ],
        network: [
          '华为 S5720-32P-LI-AC 交换机',
          '思科 Catalyst 2960-X 交换机',
          '华为 AR2220 路由器',
          '思科 ISR 4321 路由器',
          '华为 S5720-32P-LI-AC 交换机',
          '思科 Catalyst 2960-X 交换机',
          '华为 AR2220 路由器',
          '思科 ISR 4321 路由器',
          '华为 S5720-32P-LI-AC 交换机',
          '思科 Catalyst 2960-X 交换机',
          '华为 AR2220 路由器',
          '思科 ISR 4321 路由器'
        ],
        storage: [
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储',
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储',
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储',
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储',
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储',
          '华为 OceanStor 5300 存储阵列',
          '戴尔 PowerVault MD3600 存储'
        ]
      }
      
      const deviceType = ['camera', 'sensor', 'network', 'storage'][index % 4] as 'camera' | 'sensor' | 'network' | 'storage'
      const deviceName = deviceNames[deviceType][index % 12]
      
      return {
        id: `device_${index + 1}`,
        deviceName: deviceName,
        deviceId: `DEV${String(index + 1).padStart(4, '0')}`,
        deviceType: deviceType,
        area: `area${(index % 4) + 1}`,
        location: getRealisticLocation(index, deviceType),
        coordinates: getRealisticCoordinates(index),
        ipAddress: `192.168.1.${100 + index}`,
        port: 80 + (index % 10),
        manufacturer: ['海康威视', '大华', '华为', '思科'][index % 4],
        model: `型号${index + 1}`,
        installDate: dayjs().subtract(index, 'day').format('YYYY-MM-DD'),
        warrantyDate: dayjs().add(365, 'day').format('YYYY-MM-DD'),
        status: ['online', 'offline', 'maintenance', 'fault'][index % 4] as any,
        lastOnline: dayjs().subtract(index * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        description: `这是设备${index + 1}的描述信息`,
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        networkTraffic: Math.floor(Math.random() * 100),
        storageUsage: Math.floor(Math.random() * 100)
      }
    })
    
    // 应用搜索过滤
    let filteredData = mockData
    
    if (searchForm.keyword) {
      filteredData = filteredData.filter(device => 
        device.deviceName.includes(searchForm.keyword) ||
        device.deviceId.includes(searchForm.keyword) ||
        device.location.includes(searchForm.keyword)
      )
    }
    
    if (searchForm.deviceType) {
      filteredData = filteredData.filter(device => device.deviceType === searchForm.deviceType)
    }
    
    if (searchForm.status) {
      filteredData = filteredData.filter(device => device.status === searchForm.status)
    }
    
    if (searchForm.area) {
      filteredData = filteredData.filter(device => device.area === searchForm.area)
    }
    
    // 分页处理
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    deviceList.value = filteredData.slice(start, end)
    pagination.total = filteredData.length
    
    loading.value = false
  }, 500)
}

/**
 * 获取真实位置信息
 */
const getRealisticLocation = (index: number, type: 'camera' | 'sensor' | 'network' | 'storage') => {
  const locations: Record<string, string[]> = {
    camera: [
      '码头A区1号泊位',
      '码头B区2号泊位',
      '航道入口处',
      '锚地1号锚位',
      '码头A区3号泊位',
      '码头B区4号泊位',
      '航道出口处',
      '锚地2号锚位',
      '码头A区5号泊位',
      '码头B区6号泊位',
      '航道入口处',
      '锚地3号锚位'
    ],
    sensor: [
      '码头A区1号泊位附近',
      '码头B区2号泊位附近',
      '航道入口处附近',
      '锚地1号锚位附近',
      '码头A区3号泊位附近',
      '码头B区4号泊位附近',
      '航道出口处附近',
      '锚地2号锚位附近',
      '码头A区5号泊位附近',
      '码头B区6号泊位附近',
      '航道入口处附近',
      '锚地3号锚位附近'
    ],
    network: [
      '码头A区1号泊位附近',
      '码头B区2号泊位附近',
      '航道入口处附近',
      '锚地1号锚位附近',
      '码头A区3号泊位附近',
      '码头B区4号泊位附近',
      '航道出口处附近',
      '锚地2号锚位附近',
      '码头A区5号泊位附近',
      '码头B区6号泊位附近',
      '航道入口处附近',
      '锚地3号锚位附近'
    ],
    storage: [
      '码头A区1号泊位附近',
      '码头B区2号泊位附近',
      '航道入口处附近',
      '锚地1号锚位附近',
      '码头A区3号泊位附近',
      '码头B区4号泊位附近',
      '航道出口处附近',
      '锚地2号锚位附近',
      '码头A区5号泊位附近',
      '码头B区6号泊位附近',
      '航道入口处附近',
      '锚地3号锚位附近'
    ]
  }
  return locations[type][index % 12]
}

/**
 * 获取真实坐标信息
 */
const getRealisticCoordinates = (index: number) => {
  const coordinates: string[] = [
    '30.123456, 120.123456',
    '30.234567, 120.234567',
    '30.345678, 120.345678',
    '30.456789, 120.456789',
    '30.567890, 120.567890',
    '30.678901, 120.678901',
    '30.789012, 120.789012',
    '30.890123, 120.890123',
    '30.901234, 120.901234',
    '30.012345, 120.012345',
    '30.123456, 120.123456',
    '30.234567, 120.234567'
  ]
  return coordinates[index % 12]
}

/**
 * 组件挂载时加载数据
 */
onMounted(() => {
  loadDeviceList()
})
</script>

<style lang="less" scoped>
.asset-management {
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

  .search-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .device-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .device-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .device-icon {
        font-size: 20px;
        color: #1890ff;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f8ff;
        border-radius: 8px;
      }

      .device-details {
        .device-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .device-id {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .location-info {
      .coordinates {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }

    .time-info {
      .duration {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .device-detail {
    .status-monitor {
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
  .asset-management {
    padding: 16px;

    .search-section {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

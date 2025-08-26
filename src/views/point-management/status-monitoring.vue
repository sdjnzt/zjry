<template>
  <div class="status-monitoring">
    <div class="page-header">
      <h2>在线状态监测</h2>
      <p>实时监测设备运行状态，包括在线状态、性能指标、告警信息等</p>
    </div>

    <!-- 状态概览卡片 -->
    <div class="status-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="status-card online">
            <a-statistic
              title="在线设备"
              :value="statusStats.online"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <span class="status-ratio">/ {{ statusStats.total }}</span>
              </template>
            </a-statistic>
                         <div class="status-trend">
               <RiseOutlined style="color: #52c41a" />
               <span>正常</span>
             </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="status-card offline">
            <a-statistic
              title="离线设备"
              :value="statusStats.offline"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <span class="status-ratio">/ {{ statusStats.total }}</span>
              </template>
            </a-statistic>
            <div class="status-trend">
              <ExclamationCircleOutlined style="color: #ff4d4f" />
              <span>需关注</span>
            </div>
                      </a-card>
          </a-col>
        <a-col :span="6">
          <a-card class="status-card maintenance">
            <a-statistic
              title="维护中"
              :value="statusStats.maintenance"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <span class="status-ratio">/ {{ statusStats.total }}</span>
              </template>
            </a-statistic>
            <div class="status-trend">
              <ToolOutlined style="color: #faad14" />
              <span>维护中</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="status-card fault">
            <a-statistic
              title="故障设备"
              :value="statusStats.fault"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <span class="status-ratio">/ {{ statusStats.total }}</span>
              </template>
            </a-statistic>
            <div class="status-trend">
              <WarningOutlined style="color: #ff4d4f" />
              <span>紧急</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 实时监控区域 -->
    <div class="monitoring-section">
      <a-row :gutter="16">
        <!-- 设备状态列表 -->
        <a-col :span="16">
          <a-card title="设备状态监控" class="monitoring-card">
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="selectedArea"
                  placeholder="选择区域"
                  style="width: 120px"
                  @change="handleAreaChange"
                >
                  <a-select-option value="">全部区域</a-select-option>
                  <a-select-option value="area1">济宁港</a-select-option>
                  <a-select-option value="area2">梁山港</a-select-option>
                  <a-select-option value="area3">京杭大运河</a-select-option>
                  <a-select-option value="area4">锚地区</a-select-option>
                  <a-select-option value="area5">散货码头</a-select-option>
                </a-select>
                <a-select
                  v-model:value="selectedDeviceType"
                  placeholder="设备类型"
                  style="width: 120px"
                  @change="handleDeviceTypeChange"
                >
                  <a-select-option value="">全部类型</a-select-option>
                  <a-select-option value="camera">摄像头</a-select-option>
                  <a-select-option value="sensor">传感器</a-select-option>
                  <a-select-option value="network">网络设备</a-select-option>
                  <a-select-option value="storage">存储设备</a-select-option>
                </a-select>
                <a-button type="primary" @click="refreshStatus">
                  <ReloadOutlined />
                  刷新
                </a-button>
              </a-space>
            </template>
            
                         <a-table
               :columns="statusColumns"
               :data-source="paginatedDevices"
               :loading="loading"
               :pagination="pagination"
               row-key="id"
               size="small"
               @change="handleTableChange"
             >
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
                      <div class="device-id">{{ record.deviceId }}</div>
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>

                                 <template v-else-if="column.key === 'performance'">
                   <div class="performance-indicators">
                     <!-- 摄像头性能指标 -->
                     <template v-if="record.deviceType === 'camera'">
                       <div class="indicator">
                         <span class="label">信号强度:</span>
                         <a-progress
                           :percent="getCameraSignalStrength(record)"
                           :stroke-color="getProgressColor(getCameraSignalStrength(record))"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ getCameraSignalStrength(record) }}%</span>
                       </div>
                       <div class="indicator">
                         <span class="label">存储:</span>
                         <a-progress
                           :percent="record.storageUsage"
                           :stroke-color="getProgressColor(record.storageUsage)"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ record.storageUsage }}%</span>
                       </div>
                     </template>
                     
                     <!-- 传感器性能指标 -->
                     <template v-else-if="record.deviceType === 'sensor'">
                       <div class="indicator">
                         <span class="label">电池:</span>
                         <a-progress
                           :percent="getSensorBatteryLevel(record)"
                           :stroke-color="getProgressColor(getSensorBatteryLevel(record))"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ getSensorBatteryLevel(record) }}%</span>
                       </div>
                       <div class="indicator">
                         <span class="label">信号:</span>
                         <a-progress
                           :percent="getSensorSignalQuality(record)"
                           :stroke-color="getProgressColor(getSensorSignalQuality(record))"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ getSensorSignalQuality(record) }}%</span>
                       </div>
                     </template>
                     
                     <!-- 网络设备性能指标 -->
                     <template v-else-if="record.deviceType === 'network'">
                       <div class="indicator">
                         <span class="label">CPU:</span>
                         <a-progress
                           :percent="record.cpuUsage"
                           :stroke-color="getProgressColor(record.cpuUsage)"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ record.cpuUsage }}%</span>
                       </div>
                       <div class="indicator">
                         <span class="label">流量:</span>
                         <span class="value">{{ record.networkTraffic }}MB/s</span>
                       </div>
                     </template>
                     
                     <!-- 存储设备性能指标 -->
                     <template v-else-if="record.deviceType === 'storage'">
                       <div class="indicator">
                         <span class="label">存储:</span>
                         <a-progress
                           :percent="record.storageUsage"
                           :stroke-color="getProgressColor(record.storageUsage)"
                           size="small"
                           :show-info="false"
                           style="width: 60px"
                         />
                         <span class="value">{{ record.storageUsage }}%</span>
                       </div>
                       <div class="indicator">
                         <span class="label">I/O:</span>
                         <span class="value">{{ getStorageIOPS(record) }}IOPS</span>
                       </div>
                     </template>
                   </div>
                 </template>

                <template v-else-if="column.key === 'lastOnline'">
                  <div class="time-info">
                    <div>{{ formatTime(record.lastOnline) }}</div>
                    <div class="duration">{{ getDurationText(record.lastOnline) }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewDetails(record)">
                      <EyeOutlined />
                      详情
                    </a-button>
                    <a-button type="link" size="small" @click="pingDevice(record)">
                      <ApiOutlined />
                      测试
                    </a-button>
                    <a-button type="link" size="small" @click="restartDevice(record)">
                      <ReloadOutlined />
                      重启
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 实时告警面板 -->
        <a-col :span="8">
          <a-card title="实时告警" class="alert-card">
            <template #extra>
              <a-badge :count="activeAlerts.length" :overflow-count="99">
                <BellOutlined style="font-size: 16px" />
              </a-badge>
            </template>
            
            <div class="alert-list">
              <div
                v-for="alert in activeAlerts"
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
                  <div class="alert-info">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-device">{{ alert.deviceName }}</div>
                  </div>
                  <div class="alert-time">{{ formatTime(alert.time) }}</div>
                </div>
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-actions">
                  <a-button type="link" size="small" @click="acknowledgeAlert(alert)">
                    确认
                  </a-button>
                  <a-button type="link" size="small" @click="viewAlertDetails(alert)">
                    详情
                  </a-button>
                </div>
              </div>
              
              <div v-if="activeAlerts.length === 0" class="no-alerts">
                <CheckCircleOutlined style="font-size: 24px; color: #52c41a" />
                <p>暂无告警信息</p>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    

    <!-- 设备详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      title="设备详情"
      width="800px"
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
            <div style="margin-top: 8px; font-size: 12px; color: #666;">
              {{ getDeviceStatusDescription(selectedDevice) }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ selectedDevice.ipAddress }}
          </a-descriptions-item>
          <a-descriptions-item label="端口号">
            {{ selectedDevice.port }}
          </a-descriptions-item>
          <a-descriptions-item label="最后在线时间" :span="2">
            {{ formatTime(selectedDevice.lastOnline) }}
          </a-descriptions-item>
        </a-descriptions>

                 <!-- 实时性能指标 -->
         <div class="performance-metrics">
           <h4>实时性能指标</h4>
           <a-row :gutter="16">
             <!-- 摄像头性能指标 -->
             <template v-if="selectedDevice.deviceType === 'camera'">
               <a-col :span="6">
                 <a-statistic title="信号强度" :value="getCameraSignalStrength(selectedDevice)" suffix="%" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="存储使用率" :value="selectedDevice.storageUsage" suffix="%" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="网络流量" :value="selectedDevice.networkTraffic" suffix="MB/s" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="设备状态" :value="getStatusText(selectedDevice.status)" />
               </a-col>
             </template>
             
             <!-- 传感器性能指标 -->
             <template v-else-if="selectedDevice.deviceType === 'sensor'">
               <a-col :span="6">
                 <a-statistic title="电池电量" :value="getSensorBatteryLevel(selectedDevice)" suffix="%" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="信号质量" :value="getSensorSignalQuality(selectedDevice)" suffix="%" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="网络流量" :value="selectedDevice.networkTraffic" suffix="MB/s" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="设备状态" :value="getStatusText(selectedDevice.status)" />
               </a-col>
             </template>
             
             <!-- 网络设备性能指标 -->
             <template v-else-if="selectedDevice.deviceType === 'network'">
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
             </template>
             
             <!-- 存储设备性能指标 -->
             <template v-else-if="selectedDevice.deviceType === 'storage'">
               <a-col :span="6">
                 <a-statistic title="存储使用率" :value="selectedDevice.storageUsage" suffix="%" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="I/O性能" :value="getStorageIOPS(selectedDevice)" suffix="IOPS" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="网络流量" :value="selectedDevice.networkTraffic" suffix="MB/s" />
               </a-col>
               <a-col :span="6">
                 <a-statistic title="设备状态" :value="getStatusText(selectedDevice.status)" />
               </a-col>
             </template>
           </a-row>
         </div>

        <!-- 告警历史 -->
        <div class="alert-history">
          <h4>告警历史</h4>
          <a-timeline>
            <a-timeline-item
              v-for="alert in selectedDevice.alertHistory"
              :key="alert.id"
              :color="getAlertColor(alert.level)"
            >
              <p>{{ alert.message }}</p>
              <p class="alert-time">{{ formatTime(alert.time) }}</p>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  RiseOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  WarningOutlined,
  ReloadOutlined,
  CameraOutlined,
  RadarChartOutlined,
  WifiOutlined,
  DatabaseOutlined,
  EyeOutlined,
  ApiOutlined,
  BellOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 设备状态信息接口
 */
interface DeviceStatus {
  id: string
  deviceName: string
  deviceId: string
  deviceType: 'camera' | 'sensor' | 'network' | 'storage'
  area: string
  status: 'online' | 'offline' | 'maintenance' | 'fault'
  lastOnline: string
  ipAddress: string
  port: number
  cpuUsage: number
  memoryUsage: number
  networkTraffic: number
  storageUsage: number
  alertHistory: AlertInfo[]
}

/**
 * 告警信息接口
 */
interface AlertInfo {
  id: string
  title: string
  message: string
  level: 'info' | 'warning' | 'critical'
  deviceName: string
  time: string
  acknowledged: boolean
}

/**
 * 响应式数据
 */
const selectedArea = ref('')
const selectedDeviceType = ref('')
const loading = ref(false)
const selectedDevice = ref<DeviceStatus | null>(null)
const detailModal = reactive({
  visible: false
})

/**
 * 分页配置
 */
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
})

/**
 * 状态统计
 */
const statusStats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  maintenance: 0,
  fault: 0
})

/**
 * 模拟设备状态数据 - 基于真实港口监控系统
 */
const deviceStatusList = ref<DeviceStatus[]>([
  // 济宁港主码头设备
  {
    id: '1',
    deviceName: '济宁港主码头-高清监控01',
    deviceId: 'JN-CAM-001',
    deviceType: 'camera',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.100',
    port: 80,
    cpuUsage: 45,
    memoryUsage: 62,
    networkTraffic: 12,
    storageUsage: 78,
    alertHistory: [
      {
        id: 'alert1',
        title: 'CPU使用率过高',
        message: 'CPU使用率超过80%，建议优化视频编码参数或降低分辨率',
        level: 'warning',
        deviceName: '济宁港主码头-高清监控01',
        time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: true
      }
    ]
  },
  {
    id: '2',
    deviceName: '济宁港主码头-高清监控02',
    deviceId: 'JN-CAM-002',
    deviceType: 'camera',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.101',
    port: 80,
    cpuUsage: 38,
    memoryUsage: 55,
    networkTraffic: 15,
    storageUsage: 72,
    alertHistory: []
  },
  {
    id: '3',
    deviceName: '济宁港主码头-高清监控03',
    deviceId: 'JN-CAM-003',
    deviceType: 'camera',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.102',
    port: 80,
    cpuUsage: 52,
    memoryUsage: 68,
    networkTraffic: 18,
    storageUsage: 81,
    alertHistory: []
  },
  
  // 济宁港集装箱堆场设备
  {
    id: '4',
    deviceName: '济宁港集装箱堆场-监控01',
    deviceId: 'JN-CAM-004',
    deviceType: 'camera',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.103',
    port: 80,
    cpuUsage: 41,
    memoryUsage: 59,
    networkTraffic: 14,
    storageUsage: 75,
    alertHistory: []
  },
  {
    id: '5',
    deviceName: '济宁港集装箱堆场-监控02',
    deviceId: 'JN-CAM-005',
    deviceType: 'camera',
    area: 'area1',
    status: 'maintenance',
    lastOnline: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.104',
    port: 80,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert5',
        title: '设备维护',
        message: '摄像头镜头清洁维护，预计2小时后恢复',
        level: 'info',
        deviceName: '济宁港集装箱堆场-监控02',
        time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: true
      }
    ]
  },
  
  // 济宁港航道设备
  {
    id: '6',
    deviceName: '济宁港航道-水深传感器01',
    deviceId: 'JN-SEN-001',
    deviceType: 'sensor',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.105',
    port: 8080,
    cpuUsage: 12,
    memoryUsage: 25,
    networkTraffic: 2,
    storageUsage: 35,
    alertHistory: []
  },
  {
    id: '7',
    deviceName: '济宁港航道-水流传感器01',
    deviceId: 'JN-SEN-002',
    deviceType: 'sensor',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.106',
    port: 8080,
    cpuUsage: 15,
    memoryUsage: 28,
    networkTraffic: 3,
    storageUsage: 42,
    alertHistory: []
  },
  {
    id: '8',
    deviceName: '济宁港航道-潮汐传感器01',
    deviceId: 'JN-SEN-003',
    deviceType: 'sensor',
    area: 'area3',
    status: 'offline',
    lastOnline: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.107',
    port: 8080,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert8',
        title: '设备离线',
        message: '潮汐传感器网络连接中断，可能是水下电缆故障',
        level: 'critical',
        deviceName: '济宁港航道-潮汐传感器01',
        time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  
  // 梁山港设备
  {
    id: '9',
    deviceName: '梁山港码头-高清监控01',
    deviceId: 'LS-CAM-001',
    deviceType: 'camera',
    area: 'area2',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.20.100',
    port: 80,
    cpuUsage: 48,
    memoryUsage: 65,
    networkTraffic: 16,
    storageUsage: 79,
    alertHistory: []
  },
  {
    id: '10',
    deviceName: '梁山港散货堆场-监控01',
    deviceId: 'LS-CAM-002',
    deviceType: 'camera',
    area: 'area2',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.20.101',
    port: 80,
    cpuUsage: 43,
    memoryUsage: 58,
    networkTraffic: 13,
    storageUsage: 76,
    alertHistory: []
  },
  {
    id: '11',
    deviceName: '梁山港航道-潮汐传感器01',
    deviceId: 'LS-SEN-001',
    deviceType: 'sensor',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.20.102',
    port: 8080,
    cpuUsage: 18,
    memoryUsage: 32,
    networkTraffic: 4,
    storageUsage: 48,
    alertHistory: []
  },
  
  // 京杭大运河设备
  {
    id: '12',
    deviceName: '京杭运河济宁段-航道监控01',
    deviceId: 'YH-CAM-001',
    deviceType: 'camera',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.30.100',
    port: 80,
    cpuUsage: 55,
    memoryUsage: 71,
    networkTraffic: 20,
    storageUsage: 85,
    alertHistory: [
      {
        id: 'alert12',
        title: '存储空间不足',
        message: '存储使用率超过85%，建议清理历史录像或扩容存储',
        level: 'warning',
        deviceName: '京杭运河济宁段-航道监控01',
        time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  {
    id: '13',
    deviceName: '京杭运河转弯处-监控02',
    deviceId: 'YH-CAM-002',
    deviceType: 'camera',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.30.101',
    port: 80,
    cpuUsage: 47,
    memoryUsage: 63,
    networkTraffic: 17,
    storageUsage: 78,
    alertHistory: []
  },
  {
    id: '14',
    deviceName: '京杭运河-水流传感器01',
    deviceId: 'YH-SEN-001',
    deviceType: 'sensor',
    area: 'area3',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.30.102',
    port: 8080,
    cpuUsage: 14,
    memoryUsage: 26,
    networkTraffic: 2,
    storageUsage: 38,
    alertHistory: []
  },
  
  // 锚地区设备
  {
    id: '15',
    deviceName: '济宁港锚地-全景监控01',
    deviceId: 'JN-CAM-006',
    deviceType: 'camera',
    area: 'area4',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.108',
    port: 80,
    cpuUsage: 51,
    memoryUsage: 67,
    networkTraffic: 19,
    storageUsage: 82,
    alertHistory: []
  },
  {
    id: '16',
    deviceName: '济宁港锚地-气象传感器01',
    deviceId: 'JN-SEN-004',
    deviceType: 'sensor',
    area: 'area4',
    status: 'fault',
    lastOnline: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.109',
    port: 8080,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert16',
        title: '设备故障',
        message: '气象传感器数据异常，温度读数超出正常范围，需要检修',
        level: 'critical',
        deviceName: '济宁港锚地-气象传感器01',
        time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  {
    id: '17',
    deviceName: '济宁港锚地-通信基站01',
    deviceId: 'JN-NET-001',
    deviceType: 'network',
    area: 'area4',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.110',
    port: 22,
    cpuUsage: 35,
    memoryUsage: 48,
    networkTraffic: 25,
    storageUsage: 65,
    alertHistory: []
  },
  
  // 散货码头设备
  {
    id: '18',
    deviceName: '济宁港散货码头-监控01',
    deviceId: 'JN-CAM-007',
    deviceType: 'camera',
    area: 'area5',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.111',
    port: 80,
    cpuUsage: 44,
    memoryUsage: 61,
    networkTraffic: 15,
    storageUsage: 77,
    alertHistory: []
  },
  {
    id: '19',
    deviceName: '济宁港散货码头-粉尘传感器01',
    deviceId: 'JN-SEN-005',
    deviceType: 'sensor',
    area: 'area5',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.112',
    port: 8080,
    cpuUsage: 16,
    memoryUsage: 29,
    networkTraffic: 3,
    storageUsage: 41,
    alertHistory: []
  },
  {
    id: '20',
    deviceName: '济宁港散货码头-通信设备01',
    deviceId: 'JN-NET-002',
    deviceType: 'network',
    area: 'area5',
    status: 'maintenance',
    lastOnline: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.113',
    port: 22,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert20',
        title: '设备维护',
        message: '网络设备定期维护，更换老化网线，预计1小时后恢复',
        level: 'info',
        deviceName: '济宁港散货码头-通信设备01',
        time: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: true
      }
    ]
  },
  
  // 控制中心设备
  {
    id: '21',
    deviceName: '济宁港控制中心-核心交换机01',
    deviceId: 'JN-NET-003',
    deviceType: 'network',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.1.100',
    port: 22,
    cpuUsage: 68,
    memoryUsage: 75,
    networkTraffic: 85,
    storageUsage: 45,
    alertHistory: [
      {
        id: 'alert21',
        title: '网络流量异常',
        message: '网络流量突然增加，可能存在异常访问，建议检查网络安全和防火墙设置',
        level: 'warning',
        deviceName: '济宁港控制中心-核心交换机01',
        time: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  {
    id: '22',
    deviceName: '济宁港控制中心-核心交换机02',
    deviceId: 'JN-NET-004',
    deviceType: 'network',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.1.101',
    port: 22,
    cpuUsage: 62,
    memoryUsage: 71,
    networkTraffic: 78,
    storageUsage: 42,
    alertHistory: []
  },
  {
    id: '23',
    deviceName: '济宁港数据中心-存储阵列01',
    deviceId: 'JN-STR-001',
    deviceType: 'storage',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.1.102',
    port: 22,
    cpuUsage: 28,
    memoryUsage: 35,
    networkTraffic: 45,
    storageUsage: 88,
    alertHistory: [
      {
        id: 'alert23',
        title: '存储空间不足',
        message: '存储使用率超过85%，建议扩容或清理历史数据，当前可用空间仅剩1.2TB',
        level: 'warning',
        deviceName: '济宁港数据中心-存储阵列01',
        time: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  {
    id: '24',
    deviceName: '济宁港数据中心-存储阵列02',
    deviceId: 'JN-STR-002',
    deviceType: 'storage',
    area: 'area1',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.1.103',
    port: 22,
    cpuUsage: 32,
    memoryUsage: 38,
    networkTraffic: 42,
    storageUsage: 82,
    alertHistory: []
  },
  
  // 梁山港控制设备
  {
    id: '25',
    deviceName: '梁山港通信机房-核心路由器01',
    deviceId: 'LS-NET-001',
    deviceType: 'network',
    area: 'area2',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.20.103',
    port: 22,
    cpuUsage: 58,
    memoryUsage: 64,
    networkTraffic: 72,
    storageUsage: 38,
    alertHistory: []
  },
  {
    id: '26',
    deviceName: '梁山港数据中心-存储设备01',
    deviceId: 'LS-STR-001',
    deviceType: 'storage',
    area: 'area2',
    status: 'online',
    lastOnline: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.20.104',
    port: 22,
    cpuUsage: 25,
    memoryUsage: 31,
    networkTraffic: 38,
    storageUsage: 76,
    alertHistory: []
  },
  
  // 故障设备
  {
    id: '27',
    deviceName: '济宁港仓库区-监控01',
    deviceId: 'JN-CAM-008',
    deviceType: 'camera',
    area: 'area1',
    status: 'fault',
    lastOnline: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.10.114',
    port: 80,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert27',
        title: '设备故障',
        message: '摄像头硬件故障，图像传感器损坏，需要更换设备',
        level: 'critical',
        deviceName: '济宁港仓库区-监控01',
        time: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  },
  {
    id: '28',
    deviceName: '京杭运河深水区-流速传感器01',
    deviceId: 'YH-SEN-002',
    deviceType: 'sensor',
    area: 'area3',
    status: 'fault',
    lastOnline: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ipAddress: '192.168.30.103',
    port: 8080,
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    storageUsage: 0,
    alertHistory: [
      {
        id: 'alert28',
        title: '设备故障',
        message: '流速传感器数据异常，可能是传感器被水草缠绕或损坏',
        level: 'critical',
        deviceName: '京杭运河深水区-流速传感器01',
        time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        acknowledged: false
      }
    ]
  }
])

/**
 * 模拟告警数据 - 基于真实港口监控系统
 */
const activeAlerts = ref<AlertInfo[]>([
  {
    id: 'alert1',
    title: '设备离线',
    message: '济宁港航道-潮汐传感器01设备连接超时，可能是水下电缆故障，影响潮汐数据采集',
    level: 'critical',
    deviceName: '济宁港航道-潮汐传感器01',
    time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert2',
    title: 'CPU使用率过高',
    message: '济宁港主码头-高清监控01 CPU使用率超过80%，建议优化视频编码参数或降低分辨率',
    level: 'warning',
    deviceName: '济宁港主码头-高清监控01',
    time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert3',
    title: '存储空间不足',
    message: '京杭运河济宁段-航道监控01存储使用率超过85%，建议清理历史录像或扩容存储设备',
    level: 'warning',
    deviceName: '京杭运河济宁段-航道监控01',
    time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert4',
    title: '设备故障',
    message: '济宁港锚地-气象传感器01传感器数据异常，温度读数超出正常范围(-20°C~50°C)，需要检修',
    level: 'critical',
    deviceName: '济宁港锚地-气象传感器01',
    time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert5',
    title: '网络流量异常',
    message: '济宁港控制中心-核心交换机01网络流量突然增加，可能存在异常访问，建议检查网络安全和防火墙设置',
    level: 'warning',
    deviceName: '济宁港控制中心-核心交换机01',
    time: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert6',
    title: '存储空间不足',
    message: '济宁港数据中心-存储阵列01存储使用率超过85%，建议扩容或清理历史数据，当前可用空间仅剩1.2TB',
    level: 'warning',
    deviceName: '济宁港数据中心-存储阵列01',
    time: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert7',
    title: '设备故障',
    message: '济宁港仓库区-监控01摄像头硬件故障，图像传感器损坏，需要更换设备，预计维修时间2-3天',
    level: 'critical',
    deviceName: '济宁港仓库区-监控01',
    time: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  },
  {
    id: 'alert8',
    title: '设备故障',
    message: '京杭运河深水区-流速传感器01传感器数据异常，可能是传感器被水草缠绕或损坏，需要潜水员检查',
    level: 'critical',
    deviceName: '京杭运河深水区-流速传感器01',
    time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    acknowledged: false
  }
])

/**
 * 过滤后的设备列表
 */
const filteredDevices = computed(() => {
  let devices = deviceStatusList.value
  
  if (selectedArea.value) {
    devices = devices.filter(device => device.area === selectedArea.value)
  }
  
  if (selectedDeviceType.value) {
    devices = devices.filter(device => device.deviceType === selectedDeviceType.value)
  }
  
  // 更新分页总数
  pagination.total = devices.length
  
  return devices
})

/**
 * 分页后的设备列表
 */
const paginatedDevices = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredDevices.value.slice(start, end)
})

/**
 * 表格列定义
 */
const statusColumns = [
  {
    title: '设备信息',
    key: 'deviceName',
    width: 200
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '设备指标',
    key: 'performance',
    width: 200
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
 * 获取设备状态描述
 */
const getDeviceStatusDescription = (device: DeviceStatus) => {
  if (device.status === 'online') {
    if (device.deviceType === 'camera') {
      return `监控画面正常，信号强度${getCameraSignalStrength(device)}%`
    } else if (device.deviceType === 'sensor') {
      return `数据采集正常，电池电量${getSensorBatteryLevel(device)}%`
    } else if (device.deviceType === 'network') {
      return `网络连接正常，CPU使用率${device.cpuUsage}%`
    } else if (device.deviceType === 'storage') {
      return `存储系统正常，使用率${device.storageUsage}%`
    }
  } else if (device.status === 'offline') {
    return '设备连接中断，请检查网络连接'
  } else if (device.status === 'maintenance') {
    return '设备维护中，预计很快恢复'
  } else if (device.status === 'fault') {
    return '设备故障，需要技术人员处理'
  }
  return '状态未知'
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (value: number) => {
  if (value < 50) return '#52c41a'
  if (value < 80) return '#faad14'
  return '#ff4d4f'
}

/**
 * 获取摄像头信号强度
 */
const getCameraSignalStrength = (device: DeviceStatus) => {
  // 基于网络流量、CPU使用率和存储使用率计算信号强度
  const networkFactor = Math.min(device.networkTraffic / 25 * 100, 100)
  const cpuFactor = Math.max(0, 100 - device.cpuUsage * 0.8)
  const storageFactor = Math.max(0, 100 - device.storageUsage * 0.6)
  return Math.round((networkFactor * 0.4 + cpuFactor * 0.3 + storageFactor * 0.3))
}

/**
 * 获取传感器电池电量
 */
const getSensorBatteryLevel = (device: DeviceStatus) => {
  // 基于设备运行时间和网络流量计算电池电量（模拟值）
  const baseBattery = 85 // 基础电量
  const timeFactor = Math.max(0, 100 - (dayjs().diff(dayjs(device.lastOnline), 'hour') * 2))
  const networkFactor = Math.min(device.networkTraffic / 8 * 100, 100)
  return Math.round(Math.min(100, baseBattery + timeFactor * 0.1 + networkFactor * 0.05))
}

/**
 * 获取传感器信号质量
 */
const getSensorSignalQuality = (device: DeviceStatus) => {
  // 基于网络流量、CPU使用率和设备状态计算信号质量
  const networkFactor = Math.min(device.networkTraffic / 6 * 100, 100)
  const cpuFactor = Math.max(0, 100 - device.cpuUsage * 0.5)
  const statusFactor = device.status === 'online' ? 100 : 0
  return Math.round((networkFactor * 0.5 + cpuFactor * 0.3 + statusFactor * 0.2))
}

/**
 * 获取存储设备IOPS
 */
const getStorageIOPS = (device: DeviceStatus) => {
  // 基于CPU使用率、内存使用率和网络流量计算IOPS（模拟值）
  const baseIOPS = 1200
  const cpuFactor = Math.max(0, 100 - device.cpuUsage * 0.7)
  const memoryFactor = Math.max(0, 100 - device.memoryUsage * 0.6)
  const networkFactor = Math.min(device.networkTraffic / 50 * 100, 100)
  return Math.round(baseIOPS * (1 + (cpuFactor + memoryFactor + networkFactor) / 300))
}

/**
 * 获取告警颜色
 */
const getAlertColor = (level: string) => {
  const colorMap: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    critical: 'red'
  }
  return colorMap[level] || 'blue'
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
 * 处理区域变化
 */
const handleAreaChange = () => {
  console.log('区域切换到:', selectedArea.value)
  // 重置分页到第一页
  pagination.current = 1
}

/**
 * 处理设备类型变化
 */
const handleDeviceTypeChange = () => {
  console.log('设备类型切换到:', selectedDeviceType.value)
  // 重置分页到第一页
  pagination.current = 1
}

/**
 * 处理表格变化（分页、排序、筛选）
 */
const handleTableChange = (pag: any) => {
  if (pag) {
    pagination.current = pag.current || 1
    pagination.pageSize = pag.pageSize || 10
  }
}

/**
 * 刷新状态
 */
const refreshStatus = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟刷新数据，包括一些随机的性能指标变化
    updateStatusStats()
    simulateRealTimeChanges()
    loading.value = false
    message.success('状态信息已刷新')
  }, 1000)
}

/**
 * 模拟实时变化
 */
const simulateRealTimeChanges = () => {
  deviceStatusList.value.forEach(device => {
    if (device.status === 'online') {
      // 模拟CPU和内存使用率的微小变化
      device.cpuUsage = Math.max(0, Math.min(100, device.cpuUsage + (Math.random() - 0.5) * 5))
      device.memoryUsage = Math.max(0, Math.min(100, device.memoryUsage + (Math.random() - 0.5) * 3))
      device.networkTraffic = Math.max(0, device.networkTraffic + (Math.random() - 0.5) * 2)
      
      // 模拟存储使用率的缓慢增长
      if (device.storageUsage < 95) {
        device.storageUsage = Math.min(95, device.storageUsage + Math.random() * 0.5)
      }
    }
  })
}

/**
 * 更新状态统计
 */
const updateStatusStats = () => {
  const devices = deviceStatusList.value
  statusStats.total = devices.length
  statusStats.online = devices.filter(d => d.status === 'online').length
  statusStats.offline = devices.filter(d => d.status === 'offline').length
  statusStats.maintenance = devices.filter(d => d.status === 'maintenance').length
  statusStats.fault = devices.filter(d => d.status === 'fault').length
}

/**
 * 查看设备详情
 */
const viewDetails = (device: DeviceStatus) => {
  selectedDevice.value = device
  detailModal.visible = true
}

/**
 * 测试设备连接
 */
const pingDevice = (device: DeviceStatus) => {
  message.loading('正在测试设备连接...', 1).then(() => {
    if (device.status === 'online') {
      message.success('设备连接正常')
    } else {
      message.error('设备连接失败')
    }
  })
}

/**
 * 重启设备
 */
const restartDevice = (device: DeviceStatus) => {
  Modal.confirm({
    title: '确认重启',
    content: `确定要重启设备"${device.deviceName}"吗？`,
    onOk: () => {
      message.success('设备重启指令已发送')
    }
  })
}

/**
 * 确认告警
 */
const acknowledgeAlert = (alert: AlertInfo) => {
  alert.acknowledged = true
  message.success('告警已确认')
}

/**
 * 查看告警详情
 */
const viewAlertDetails = (alert: AlertInfo) => {
  message.info(`告警详情: ${alert.message}`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  updateStatusStats()
  // 初始化分页总数
  pagination.total = deviceStatusList.value.length
  
  // 启动自动刷新（每30秒更新一次性能指标）
  const autoRefreshInterval = setInterval(() => {
    if (deviceStatusList.value.length > 0) {
      simulateRealTimeChanges()
      updateStatusStats()
    }
  }, 30000)
  
  console.log('在线状态监测页面已加载，自动刷新已启动')
  
  // 组件卸载时清理定时器
  return () => {
    clearInterval(autoRefreshInterval)
  }
})
</script>

<style lang="less" scoped>
.status-monitoring {
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

  .status-overview {
    margin-bottom: 24px;

    .status-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.online {
        border-left: 4px solid #52c41a;
      }

      &.offline {
        border-left: 4px solid #ff4d4f;
      }

      &.maintenance {
        border-left: 4px solid #faad14;
      }

      &.fault {
        border-left: 4px solid #ff4d4f;
      }

      .status-ratio {
        font-size: 14px;
        color: #999;
        margin-left: 8px;
      }

      .status-trend {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }
  }

  .monitoring-section {
    margin-bottom: 24px;

    .monitoring-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .device-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .device-icon {
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

        .device-details {
          .device-name {
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .device-id {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .performance-indicators {
        .indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            font-size: 12px;
            color: #666;
            min-width: 40px;
          }

          .value {
            font-size: 12px;
            color: #333;
            min-width: 30px;
            text-align: right;
          }
        }
      }

      .time-info {
        .duration {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }
    }

    .alert-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .alert-list {
        max-height: 400px;
        overflow-y: auto;

        .alert-item {
          background: #fafafa;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
          border-left: 4px solid #d9d9d9;

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
            background: #f6ffed;
          }

          .alert-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .alert-level {
              margin-right: 8px;
              font-size: 16px;
            }

            .alert-info {
              flex: 1;

              .alert-title {
                font-weight: 500;
                color: #333;
                margin-bottom: 2px;
              }

              .alert-device {
                font-size: 12px;
                color: #666;
              }
            }

            .alert-time {
              font-size: 11px;
              color: #999;
            }
          }

          .alert-message {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .alert-actions {
            display: flex;
            gap: 8px;
          }
        }

        .no-alerts {
          text-align: center;
          padding: 40px 20px;
          color: #999;

          p {
            margin: 8px 0 0 0;
          }
        }
      }
    }
  }

  

  .device-detail {
    .performance-metrics {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .alert-history {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .alert-time {
        font-size: 12px;
        color: #999;
        margin: 4px 0 0 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .status-monitoring {
    .monitoring-section {
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
  .status-monitoring {
    padding: 16px;

    .status-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

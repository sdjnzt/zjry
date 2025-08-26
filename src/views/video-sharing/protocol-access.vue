<template>
  <div class="protocol-access">
    <div class="page-header">
      <h2>标准协议接入</h2>
      <p>支持GB/T 28181、ONVIF、RTSP等多种标准协议的设备接入和管理</p>
    </div>

    <!-- 协议统计概览 -->
    <div class="protocol-overview">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="GB/T 28181设备"
              :value="protocolStats.gb28181"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <VideoCameraOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="ONVIF设备"
              :value="protocolStats.onvif"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <CameraOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="RTSP流"
              :value="protocolStats.rtsp"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <PlayCircleOutlined style="color: #faad14; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="在线设备"
              :value="protocolStats.online"
              :value-style="{ color: '#722ed1' }"
            >
              <template #suffix>
                <WifiOutlined style="color: #722ed1; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="总视频流"
              :value="protocolStats.totalStreams"
              :value-style="{ color: '#eb2f96' }"
            >
              <template #suffix>
                <VideoCameraOutlined style="color: #eb2f96; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card class="overview-card">
            <a-statistic
              title="活跃流"
              :value="protocolStats.activeStreams"
              :value-style="{ color: '#13c2c2' }"
            >
              <template #suffix>
                <PlayCircleOutlined style="color: #13c2c2; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要功能区域 -->
    <div class="protocol-content">
      <a-row :gutter="16">
        <!-- 协议配置 -->
        <a-col :span="8">
          <a-card title="协议配置" class="protocol-config-card">
            <template #extra>
              <a-button size="small" @click="refreshProtocolConfig">
                <ReloadOutlined />
                刷新
              </a-button>
            </template>
            
            <!-- GB/T 28181配置 -->
            <div class="protocol-section">
              <div class="protocol-header">
                <h4>GB/T 28181</h4>
                <a-switch
                  v-model:checked="protocolConfig.gb28181.enabled"
                  size="small"
                  @change="toggleProtocol('gb28181')"
                />
              </div>
              <div v-if="protocolConfig.gb28181.enabled" class="protocol-config">
                <div class="config-item">
                  <span class="config-label">SIP服务器ID:</span>
                  <a-input
                    v-model:value="protocolConfig.gb28181.serverId"
                    size="small"
                    placeholder="34020000002000000001"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">SIP域:</span>
                  <a-input
                    v-model:value="protocolConfig.gb28181.domain"
                    size="small"
                    placeholder="3402000000"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">SIP端口:</span>
                  <a-input-number
                    v-model:value="protocolConfig.gb28181.port"
                    size="small"
                    :min="1024"
                    :max="65535"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">用户名:</span>
                  <a-input
                    v-model:value="protocolConfig.gb28181.username"
                    size="small"
                    placeholder="admin"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">密码:</span>
                  <a-input-password
                    v-model:value="protocolConfig.gb28181.password"
                    size="small"
                    placeholder="请输入密码"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">心跳间隔:</span>
                  <a-input-number
                    v-model:value="protocolConfig.gb28181.heartbeatInterval"
                    size="small"
                    :min="30"
                    :max="300"
                    addon-after="秒"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">注册间隔:</span>
                  <a-input-number
                    v-model:value="protocolConfig.gb28181.registerInterval"
                    size="small"
                    :min="1800"
                    :max="7200"
                    addon-after="秒"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">最大重试:</span>
                  <a-input-number
                    v-model:value="protocolConfig.gb28181.maxRetries"
                    size="small"
                    :min="1"
                    :max="10"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">超时时间:</span>
                  <a-input-number
                    v-model:value="protocolConfig.gb28181.timeout"
                    size="small"
                    :min="10"
                    :max="60"
                    addon-after="秒"
                    style="width: 100%"
                  />
                </div>
              </div>
            </div>

            <!-- ONVIF配置 -->
            <div class="protocol-section">
              <div class="protocol-header">
                <h4>ONVIF</h4>
                <a-switch
                  v-model:checked="protocolConfig.onvif.enabled"
                  size="small"
                  @change="toggleProtocol('onvif')"
                />
              </div>
              <div v-if="protocolConfig.onvif.enabled" class="protocol-config">
                <div class="config-item">
                  <span class="config-label">发现端口:</span>
                  <a-input-number
                    v-model:value="protocolConfig.onvif.discoveryPort"
                    size="small"
                    :min="1024"
                    :max="65535"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">服务端口:</span>
                  <a-input-number
                    v-model:value="protocolConfig.onvif.servicePort"
                    size="small"
                    :min="1024"
                    :max="65535"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">认证方式:</span>
                  <a-select
                    v-model:value="protocolConfig.onvif.authType"
                    size="small"
                    style="width: 100%"
                  >
                    <a-select-option value="none">无认证</a-select-option>
                    <a-select-option value="digest">摘要认证</a-select-option>
                    <a-select-option value="wsse">WS-Security</a-select-option>
                  </a-select>
                </div>
                <div class="config-item">
                  <span class="config-label">发现超时:</span>
                  <a-input-number
                    v-model:value="protocolConfig.onvif.discoveryTimeout"
                    size="small"
                    :min="5"
                    :max="30"
                    addon-after="秒"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">最大设备数:</span>
                  <a-input-number
                    v-model:value="protocolConfig.onvif.maxDevices"
                    size="small"
                    :min="10"
                    :max="500"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">自动发现:</span>
                  <a-switch
                    v-model:checked="protocolConfig.onvif.autoDiscovery"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <!-- RTSP配置 -->
            <div class="protocol-section">
              <div class="protocol-header">
                <h4>RTSP</h4>
                <a-switch
                  v-model:checked="protocolConfig.rtsp.enabled"
                  size="small"
                  @change="toggleProtocol('rtsp')"
                />
              </div>
              <div v-if="protocolConfig.rtsp.enabled" class="protocol-config">
                <div class="config-item">
                  <span class="config-label">服务端口:</span>
                  <a-input-number
                    v-model:value="protocolConfig.rtsp.port"
                    size="small"
                    :min="1024"
                    :max="65535"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">传输协议:</span>
                  <a-select
                    v-model:value="protocolConfig.rtsp.transport"
                    size="small"
                    style="width: 100%"
                  >
                    <a-select-option value="tcp">TCP</a-select-option>
                    <a-select-option value="udp">UDP</a-select-option>
                    <a-select-option value="auto">自动</a-select-option>
                  </a-select>
                </div>
                <div class="config-item">
                  <span class="config-label">缓冲时间:</span>
                  <a-input-number
                    v-model:value="protocolConfig.rtsp.bufferTime"
                    size="small"
                    :min="100"
                    :max="5000"
                    :step="100"
                    addon-after="ms"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">最大连接数:</span>
                  <a-input-number
                    v-model:value="protocolConfig.rtsp.maxConnections"
                    size="small"
                    :min="10"
                    :max="200"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">保活连接:</span>
                  <a-switch
                    v-model:checked="protocolConfig.rtsp.keepAlive"
                    size="small"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">身份认证:</span>
                  <a-switch
                    v-model:checked="protocolConfig.rtsp.authentication"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div class="config-actions">
              <a-button type="primary" @click="saveProtocolConfig">
                <SaveOutlined />
                保存配置
              </a-button>
              <a-button @click="testProtocolConfig">
                <ExperimentOutlined />
                测试连接
              </a-button>
            </div>
          </a-card>
        </a-col>

        <!-- 设备列表 -->
        <a-col :span="16">
          <a-card title="协议设备管理" class="device-card">
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="deviceFilter.protocol"
                  placeholder="协议类型"
                  style="width: 120px"
                  @change="handleDeviceFilterChange"
                >
                  <a-select-option value="">全部协议</a-select-option>
                  <a-select-option value="gb28181">GB/T 28181</a-select-option>
                  <a-select-option value="onvif">ONVIF</a-select-option>
                  <a-select-option value="rtsp">RTSP</a-select-option>
                </a-select>
                <a-select
                  v-model:value="deviceFilter.status"
                  placeholder="设备状态"
                  style="width: 120px"
                  @change="handleDeviceFilterChange"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="online">在线</a-select-option>
                  <a-select-option value="offline">离线</a-select-option>
                  <a-select-option value="error">错误</a-select-option>
                </a-select>
                <a-button type="primary" @click="showAddDevice">
                  <PlusOutlined />
                  添加设备
                </a-button>
                <a-button @click="discoverDevices">
                  <SearchOutlined />
                  自动发现
                </a-button>
              </a-space>
            </template>
            
            <a-table
              :columns="deviceColumns"
              :data-source="filteredDevices"
              :loading="loading"
              :pagination="pagination"
              row-key="id"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'deviceInfo'">
                  <div class="device-info">
                    <div class="device-icon">
                      <VideoCameraOutlined v-if="record.protocol === 'gb28181'" />
                      <CameraOutlined v-else-if="record.protocol === 'onvif'" />
                      <PlayCircleOutlined v-else />
                    </div>
                    <div class="device-details">
                      <div class="device-name">{{ record.name }}</div>
                      <div class="device-id">ID: {{ record.deviceId }}</div>
                      <div class="device-address">{{ record.address }}</div>
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'protocol'">
                  <a-tag :color="getProtocolColor(record.protocol)">
                    {{ getProtocolText(record.protocol) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'status'">
                  <div class="status-info">
                    <a-tag :color="getStatusColor(record.status)">
                      {{ getStatusText(record.status) }}
                    </a-tag>
                    <div v-if="record.status === 'online'" class="online-time">
                      在线: {{ getDurationText(record.onlineTime) }}
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'streams'">
                  <div class="streams-info">
                    <div class="stream-count">{{ record.streams.length }}路流</div>
                    <div class="stream-quality">
                      <a-tag
                        v-for="stream in record.streams"
                        :key="stream.id"
                        size="small"
                        :color="getQualityColor(stream.quality)"
                      >
                        {{ stream.quality }}
                      </a-tag>
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewDevice(record)">
                      <EyeOutlined />
                      查看
                    </a-button>
                    <a-button type="link" size="small" @click="testDevice(record)">
                      <ExperimentOutlined />
                      测试
                    </a-button>
                    <a-button type="link" size="small" @click="editDevice(record)">
                      <EditOutlined />
                      编辑
                    </a-button>
                    <a-button type="link" size="small" @click="deleteDevice(record)">
                      <DeleteOutlined />
                      删除
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 设备发现结果 -->
    <div v-if="discoveryResults.length > 0" class="discovery-section">
      <a-card title="设备发现结果" class="discovery-card">
        <template #extra>
          <a-space>
            <a-button @click="clearDiscovery">清空</a-button>
            <a-button type="primary" @click="addSelectedDevices">
              <PlusOutlined />
              添加选中设备
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :columns="discoveryColumns"
          :data-source="discoveryResults"
          :pagination="false"
          row-key="id"
          size="small"
          :row-selection="{
            selectedRowKeys: selectedDiscoveryKeys,
            onChange: handleDiscoverySelectionChange
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'deviceInfo'">
              <div class="device-info">
                <div class="device-details">
                  <div class="device-name">{{ record.name || record.manufacturer + ' ' + record.model }}</div>
                  <div class="device-address">{{ record.address }}:{{ record.port }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'protocol'">
              <a-tag :color="getProtocolColor(record.protocol)">
                {{ getProtocolText(record.protocol) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'capabilities'">
              <div class="capabilities-info">
                <a-tag
                  v-for="capability in record.capabilities"
                  :key="capability"
                  size="small"
                >
                  {{ capability }}
                </a-tag>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加设备弹窗 -->
    <a-modal
      v-model:open="deviceModal.visible"
      :title="deviceModal.title"
      width="700px"
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
        <a-form-item label="设备名称" name="name">
          <a-input v-model:value="deviceForm.name" placeholder="请输入设备名称" />
        </a-form-item>
        
        <a-form-item label="协议类型" name="protocol">
          <a-select v-model:value="deviceForm.protocol" placeholder="请选择协议类型">
            <a-select-option value="gb28181">GB/T 28181</a-select-option>
            <a-select-option value="onvif">ONVIF</a-select-option>
            <a-select-option value="rtsp">RTSP</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="设备地址" name="address">
          <a-input v-model:value="deviceForm.address" placeholder="请输入IP地址或域名" />
        </a-form-item>
        
        <a-form-item label="端口号" name="port">
          <a-input-number
            v-model:value="deviceForm.port"
            :min="1"
            :max="65535"
            placeholder="请输入端口号"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="deviceForm.username" placeholder="请输入用户名" />
        </a-form-item>
        
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="deviceForm.password" placeholder="请输入密码" />
        </a-form-item>
        
        <a-form-item v-if="deviceForm.protocol === 'gb28181'" label="设备ID" name="deviceId">
          <a-input v-model:value="deviceForm.deviceId" placeholder="请输入GB/T 28181设备ID" />
        </a-form-item>
        
        <a-form-item v-if="deviceForm.protocol === 'rtsp'" label="RTSP路径" name="rtspPath">
          <a-input v-model:value="deviceForm.rtspPath" placeholder="请输入RTSP流路径" />
        </a-form-item>
        
        <a-form-item label="制造商" name="manufacturer">
          <a-input v-model:value="deviceForm.manufacturer" placeholder="请输入制造商" />
        </a-form-item>
        
        <a-form-item label="型号" name="model">
          <a-input v-model:value="deviceForm.model" placeholder="请输入设备型号" />
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="deviceForm.notes"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

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
            {{ selectedDevice.name }}
          </a-descriptions-item>
          <a-descriptions-item label="协议类型">
            {{ getProtocolText(selectedDevice.protocol) }}
          </a-descriptions-item>
          <a-descriptions-item label="设备地址">
            {{ selectedDevice.address }}:{{ selectedDevice.port }}
          </a-descriptions-item>
          <a-descriptions-item label="设备状态">
            <a-tag :color="getStatusColor(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="制造商">
            {{ selectedDevice.manufacturer }}
          </a-descriptions-item>
          <a-descriptions-item label="型号">
            {{ selectedDevice.model }}
          </a-descriptions-item>
          <a-descriptions-item label="固件版本">
            {{ selectedDevice.firmwareVersion || '未知' }}
          </a-descriptions-item>
          <a-descriptions-item label="在线时间">
            {{ selectedDevice.status === 'online' ? getDurationText(selectedDevice.onlineTime) : '离线' }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 流信息 -->
        <div class="streams-detail">
          <h4>视频流信息</h4>
          <a-table
            :columns="streamColumns"
            :data-source="selectedDevice.streams"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'quality'">
                <a-tag :color="getQualityColor(record.quality)">
                  {{ record.quality }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.active ? 'green' : 'red'">
                  {{ record.active ? '活跃' : '停止' }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 能力集 -->
        <div class="capabilities-detail">
          <h4>设备能力</h4>
          <div class="capabilities-list">
            <a-tag
              v-for="capability in selectedDevice.capabilities"
              :key="capability"
              style="margin-bottom: 8px"
            >
              {{ capability }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  VideoCameraOutlined,
  CameraOutlined,
  PlayCircleOutlined,
  WifiOutlined,
  ReloadOutlined,
  SaveOutlined,
  ExperimentOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 协议设备接口
 */
interface ProtocolDevice {
  id: string
  name: string
  protocol: 'gb28181' | 'onvif' | 'rtsp'
  address: string
  port: number
  deviceId?: string
  username: string
  password: string
  status: 'online' | 'offline' | 'error'
  manufacturer: string
  model: string
  firmwareVersion?: string
  onlineTime?: string
  streams: VideoStream[]
  capabilities: string[]
  rtspPath?: string
  notes?: string
}

/**
 * 视频流接口
 */
interface VideoStream {
  id: string
  name: string
  quality: 'HD' | 'SD' | '4K' | 'FHD'
  resolution: string
  bitrate: number
  fps: number
  active: boolean
  url: string
}

/**
 * 发现设备接口
 */
interface DiscoveredDevice {
  id: string
  name?: string
  protocol: 'gb28181' | 'onvif' | 'rtsp'
  address: string
  port: number
  manufacturer: string
  model: string
  capabilities: string[]
  deviceId?: string
}

/**
 * 协议配置接口
 */
interface ProtocolConfig {
  gb28181: {
    enabled: boolean
    serverId: string
    domain: string
    port: number
    username: string
    password: string
    heartbeatInterval: number
    registerInterval: number
    maxRetries: number
    timeout: number
  }
  onvif: {
    enabled: boolean
    discoveryPort: number
    servicePort: number
    authType: 'none' | 'digest' | 'wsse'
    discoveryTimeout: number
    maxDevices: number
    autoDiscovery: boolean
  }
  rtsp: {
    enabled: boolean
    port: number
    transport: 'tcp' | 'udp' | 'auto'
    bufferTime: number
    maxConnections: number
    keepAlive: boolean
    authentication: boolean
  }
}

/**
 * 响应式数据
 */
const loading = ref(false)
const deviceFilter = reactive({
  protocol: '',
  status: ''
})

const deviceModal = reactive({
  visible: false,
  title: '添加设备',
  isEdit: false
})

const detailModal = reactive({
  visible: false
})

const selectedDevice = ref<ProtocolDevice | null>(null)
const discoveryResults = ref<DiscoveredDevice[]>([
  {
    id: 'discovery-1',
    name: '济宁港主码头-高清监控',
    protocol: 'gb28181',
    address: '192.168.1.110',
    port: 5060,
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    capabilities: ['视频', '音频', '云台控制', '智能识别'],
    deviceId: '34020000001320000005'
  },
  {
    id: 'discovery-2',
    name: '京杭大运河-航道监控',
    protocol: 'onvif',
    address: '192.168.1.111',
    port: 80,
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    capabilities: ['视频', '音频', 'WDR', '智能分析']
  },
  {
    id: 'discovery-3',
    name: '济宁港锚地-船舶监控',
    protocol: 'rtsp',
    address: '192.168.1.112',
    port: 554,
    manufacturer: '宇视',
    model: 'IPC6322LR-X22P-VF',
    capabilities: ['视频', '红外夜视', '变焦']
  },
  {
    id: 'discovery-4',
    name: '济宁港集装箱堆场-全景监控',
    protocol: 'gb28181',
    address: '192.168.1.113',
    port: 5060,
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    capabilities: ['视频', '音频', '云台控制', '智能识别', '车牌识别'],
    deviceId: '34020000001320000006'
  },
  {
    id: 'discovery-5',
    name: '济宁港船舶靠泊-作业监控',
    protocol: 'onvif',
    address: '192.168.1.114',
    port: 80,
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    capabilities: ['视频', '音频', 'WDR', '智能分析', '行为分析']
  }
])
const selectedDiscoveryKeys = ref<string[]>([])

/**
 * 协议统计数据
 */
const protocolStats = reactive({
  gb28181: 45,
  onvif: 38,
  rtsp: 67,
  online: 127,
  totalDevices: 150,
  offlineDevices: 23,
  errorDevices: 8,
  totalStreams: 312,
  activeStreams: 289
})

/**
 * 协议性能统计
 */
const protocolPerformance = reactive({
  gb28181: {
    avgResponseTime: 45,
    successRate: 98.5,
    activeConnections: 42,
    totalRegistrations: 156
  },
  onvif: {
    avgResponseTime: 78,
    successRate: 96.2,
    activeConnections: 35,
    totalDiscoveries: 89
  },
  rtsp: {
    avgResponseTime: 23,
    successRate: 99.1,
    activeConnections: 58,
    totalStreams: 289
  }
})

/**
 * 设备状态统计
 */
const deviceStatusStats = reactive({
  byManufacturer: {
    '海康威视': 67,
    '大华': 45,
    '宇视': 38
  },
  byModel: {
    'DS-2CD2T47G1-L': 34,
    'DH-IPC-HFW4433M-I2': 28,
    'IPC6322LR-X22P-VF': 25
  },
  byQuality: {
    '4K': 45,
    'FHD': 78,
    'HD': 67,
    'SD': 20
  }
})

/**
 * 协议配置数据
 */
const protocolConfig = reactive<ProtocolConfig>({
  gb28181: {
    enabled: true,
    serverId: '34020000002000000001',
    domain: '3402000000',
    port: 5060,
    username: 'admin',
    password: '123456',
    heartbeatInterval: 60,
    registerInterval: 3600,
    maxRetries: 3,
    timeout: 30
  },
  onvif: {
    enabled: true,
    discoveryPort: 3702,
    servicePort: 80,
    authType: 'digest',
    discoveryTimeout: 10,
    maxDevices: 100,
    autoDiscovery: true
  },
  rtsp: {
    enabled: true,
    port: 554,
    transport: 'tcp',
    bufferTime: 1000,
    maxConnections: 50,
    keepAlive: true,
    authentication: true
  }
})

/**
 * 设备表单数据
 */
const deviceForm = reactive<Partial<ProtocolDevice>>({
  name: '',
  protocol: 'gb28181',
  address: '',
  port: 5060,
  username: 'admin',
  password: '',
  deviceId: '',
  manufacturer: '',
  model: '',
  rtspPath: '',
  notes: ''
})

/**
 * 表单验证规则
 */
const deviceRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择协议类型', trigger: 'change' }],
  address: [{ required: true, message: '请输入设备地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/**
 * 分页配置
 */
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

/**
 * 模拟设备数据
 */
const deviceList = ref<ProtocolDevice[]>([
  {
    id: '1',
    name: '济宁港主码头-GB28181监控01',
    protocol: 'gb28181',
    address: '192.168.1.100',
    port: 5060,
    deviceId: '34020000001320000001',
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '海康威视',
    model: 'DS-2CD2142FWD-I',
    firmwareVersion: 'V5.5.0',
    onlineTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '1',
        name: '主码流',
        quality: 'HD',
        resolution: '1920x1080',
        bitrate: 4096,
        fps: 25,
        active: true,
        url: 'rtmp://192.168.1.100:1935/live/main'
      },
      {
        id: '2',
        name: '子码流',
        quality: 'SD',
        resolution: '704x576',
        bitrate: 1024,
        fps: 15,
        active: true,
        url: 'rtmp://192.168.1.100:1935/live/sub'
      }
    ],
    capabilities: ['视频', '音频', '云台控制', '录像回放']
  },
  {
    id: '2',
    name: '京杭大运河-ONVIF监控01',
    protocol: 'onvif',
    address: '192.168.1.101',
    port: 80,
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    firmwareVersion: 'V2.800.0000000.25.R',
    onlineTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '3',
        name: '主码流',
        quality: '4K',
        resolution: '3840x2160',
        bitrate: 8192,
        fps: 30,
        active: true,
        url: 'rtsp://192.168.1.101:554/cam/realmonitor?channel=1&subtype=0'
      }
    ],
    capabilities: ['视频', '音频', 'WDR', '智能分析']
  },
  {
    id: '3',
    name: '济宁港锚地-RTSP监控01',
    protocol: 'rtsp',
    address: '192.168.1.102',
    port: 554,
    username: 'admin',
    password: '123456',
    status: 'offline',
    manufacturer: '宇视',
    model: 'IPC6322LR-X22P-VF',
    onlineTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '4',
        name: '主码流',
        quality: 'FHD',
        resolution: '1920x1080',
        bitrate: 6144,
        fps: 25,
        active: false,
        url: 'rtsp://192.168.1.102:554/live/ch1'
      }
    ],
    capabilities: ['视频', '红外夜视', '变焦'],
    rtspPath: '/live/ch1'
  },
  {
    id: '4',
    name: '济宁港集装箱堆场-GB28181监控02',
    protocol: 'gb28181',
    address: '192.168.1.103',
    port: 5060,
    deviceId: '34020000001320000002',
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    firmwareVersion: 'V5.6.0',
    onlineTime: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '5',
        name: '主码流',
        quality: '4K',
        resolution: '3840x2160',
        bitrate: 8192,
        fps: 30,
        active: true,
        url: 'rtmp://192.168.1.103:1935/live/main'
      },
      {
        id: '6',
        name: '子码流',
        quality: 'HD',
        resolution: '1920x1080',
        bitrate: 4096,
        fps: 25,
        active: true,
        url: 'rtmp://192.168.1.103:1935/live/sub'
      }
    ],
    capabilities: ['视频', '音频', '云台控制', '智能识别', '车牌识别']
  },
  {
    id: '5',
    name: '济宁港船舶靠泊-ONVIF监控02',
    protocol: 'onvif',
    address: '192.168.1.104',
    port: 80,
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    firmwareVersion: 'V2.800.0000000.25.R',
    onlineTime: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '7',
        name: '主码流',
        quality: 'FHD',
        resolution: '1920x1080',
        bitrate: 6144,
        fps: 25,
        active: true,
        url: 'rtsp://192.168.1.104:554/cam/realmonitor?channel=1&subtype=0'
      }
    ],
    capabilities: ['视频', '音频', 'WDR', '智能分析', '行为分析']
  },
  {
    id: '6',
    name: '济宁港航道交通-RTSP监控02',
    protocol: 'rtsp',
    address: '192.168.1.105',
    port: 554,
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '宇视',
    model: 'IPC6322LR-X22P-VF',
    onlineTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '8',
        name: '主码流',
        quality: 'HD',
        resolution: '1920x1080',
        bitrate: 4096,
        fps: 25,
        active: true,
        url: 'rtsp://192.168.1.105:554/live/ch1'
      }
    ],
    capabilities: ['视频', '红外夜视', '变焦', '智能跟踪'],
    rtspPath: '/live/ch1'
  },
  {
    id: '7',
    name: '济宁港安全巡检-GB28181监控03',
    protocol: 'gb28181',
    address: '192.168.1.106',
    port: 5060,
    deviceId: '34020000001320000003',
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    firmwareVersion: 'V5.6.0',
    onlineTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '9',
        name: '主码流',
        quality: '4K',
        resolution: '3840x2160',
        bitrate: 8192,
        fps: 30,
        active: true,
        url: 'rtmp://192.168.1.106:1935/live/main'
      }
    ],
    capabilities: ['视频', '音频', '云台控制', '智能识别', '人脸识别']
  },
  {
    id: '8',
    name: '济宁港环境监测-ONVIF监控03',
    protocol: 'onvif',
    address: '192.168.1.107',
    port: 80,
    username: 'admin',
    password: '123456',
    status: 'error',
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    firmwareVersion: 'V2.800.0000000.25.R',
    onlineTime: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '10',
        name: '主码流',
        quality: 'FHD',
        resolution: '1920x1080',
        bitrate: 6144,
        fps: 25,
        active: false,
        url: 'rtsp://192.168.1.107:554/cam/realmonitor?channel=1&subtype=0'
      }
    ],
    capabilities: ['视频', '音频', 'WDR', '智能分析', '环境监测']
  },
  {
    id: '9',
    name: '济宁港船舶维修-RTSP监控03',
    protocol: 'rtsp',
    address: '192.168.1.108',
    port: 554,
    username: 'admin',
    password: '123456',
    status: 'offline',
    manufacturer: '宇视',
    model: 'IPC6322LR-X22P-VF',
    onlineTime: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '11',
        name: '主码流',
        quality: 'HD',
        resolution: '1920x1080',
        bitrate: 4096,
        fps: 25,
        active: false,
        url: 'rtsp://192.168.1.108:554/live/ch1'
      }
    ],
    capabilities: ['视频', '红外夜视', '变焦', '智能跟踪'],
    rtspPath: '/live/ch1'
  },
  {
    id: '10',
    name: '济宁港应急通信-GB28181监控04',
    protocol: 'gb28181',
    address: '192.168.1.109',
    port: 5060,
    deviceId: '34020000001320000004',
    username: 'admin',
    password: '123456',
    status: 'online',
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    firmwareVersion: 'V5.6.0',
    onlineTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    streams: [
      {
        id: '12',
        name: '主码流',
        quality: '4K',
        resolution: '3840x2160',
        bitrate: 8192,
        fps: 30,
        active: true,
        url: 'rtmp://192.168.1.109:1935/live/main'
      }
    ],
    capabilities: ['视频', '音频', '云台控制', '智能识别', '应急通信']
  }
])

/**
 * 过滤后的设备列表
 */
const filteredDevices = computed(() => {
  let devices = deviceList.value
  
  if (deviceFilter.protocol) {
    devices = devices.filter(device => device.protocol === deviceFilter.protocol)
  }
  
  if (deviceFilter.status) {
    devices = devices.filter(device => device.status === deviceFilter.status)
  }
  
  return devices
})

/**
 * 表格列定义
 */
const deviceColumns = [
  {
    title: '设备信息',
    key: 'deviceInfo',
    width: 250
  },
  {
    title: '协议',
    key: 'protocol',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 120
  },
  {
    title: '视频流',
    key: 'streams',
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
 * 发现设备表格列
 */
const discoveryColumns = [
  {
    title: '设备信息',
    key: 'deviceInfo',
    width: 200
  },
  {
    title: '协议',
    key: 'protocol',
    width: 100
  },
  {
    title: '制造商',
    dataIndex: 'manufacturer',
    key: 'manufacturer',
    width: 120
  },
  {
    title: '型号',
    dataIndex: 'model',
    key: 'model',
    width: 150
  },
  {
    title: '能力',
    key: 'capabilities',
    width: 200
  }
]

/**
 * 流信息表格列
 */
const streamColumns = [
  {
    title: '流名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '质量',
    key: 'quality'
  },
  {
    title: '分辨率',
    dataIndex: 'resolution',
    key: 'resolution'
  },
  {
    title: '码率',
    dataIndex: 'bitrate',
    key: 'bitrate',
    customRender: ({ text }: { text: number }) => `${text}kbps`
  },
  {
    title: '帧率',
    dataIndex: 'fps',
    key: 'fps',
    customRender: ({ text }: { text: number }) => `${text}fps`
  },
  {
    title: '状态',
    key: 'status'
  }
]

/**
 * 获取协议颜色
 */
const getProtocolColor = (protocol: string) => {
  const colorMap: Record<string, string> = {
    gb28181: 'blue',
    onvif: 'green',
    rtsp: 'orange'
  }
  return colorMap[protocol] || 'default'
}

/**
 * 获取协议文本
 */
const getProtocolText = (protocol: string) => {
  const protocolMap: Record<string, string> = {
    gb28181: 'GB/T 28181',
    onvif: 'ONVIF',
    rtsp: 'RTSP'
  }
  return protocolMap[protocol] || protocol
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    online: 'green',
    offline: 'red',
    error: 'red'
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
    error: '错误'
  }
  return statusMap[status] || status
}

/**
 * 获取质量颜色
 */
const getQualityColor = (quality: string) => {
  const colorMap: Record<string, string> = {
    '4K': 'purple',
    'FHD': 'blue',
    'HD': 'green',
    'SD': 'orange'
  }
  return colorMap[quality] || 'default'
}

/**
 * 获取持续时间文本
 */
const getDurationText = (time: string) => {
  const now = dayjs()
  const targetTime = dayjs(time)
  const diff = now.diff(targetTime, 'minute')
  
  if (diff < 60) {
    return `${diff}分钟`
  } else if (diff < 1440) {
    return `${Math.floor(diff / 60)}小时`
  } else {
    return `${Math.floor(diff / 1440)}天`
  }
}

/**
 * 刷新协议配置
 */
const refreshProtocolConfig = () => {
  message.success('协议配置已刷新')
}

/**
 * 切换协议
 */
const toggleProtocol = (protocol: string) => {
  const enabled = protocolConfig[protocol as keyof ProtocolConfig].enabled
  message.success(`${getProtocolText(protocol)} ${enabled ? '已启用' : '已禁用'}`)
}

/**
 * 保存协议配置
 */
const saveProtocolConfig = () => {
  message.success('协议配置保存成功')
}

/**
 * 测试协议配置
 */
const testProtocolConfig = () => {
  message.loading('正在测试协议连接...', 2).then(() => {
    message.success('协议连接测试成功')
  })
}

/**
 * 处理设备过滤变化
 */
const handleDeviceFilterChange = () => {
  console.log('设备过滤条件变化:', deviceFilter)
}

/**
 * 显示添加设备弹窗
 */
const showAddDevice = () => {
  deviceModal.visible = true
  deviceModal.title = '添加设备'
  deviceModal.isEdit = false
  resetDeviceForm()
}

/**
 * 自动发现设备
 */
const discoverDevices = () => {
  message.loading('正在搜索网络设备...', 3).then(() => {
    // 模拟发现的设备
    discoveryResults.value = [
      {
        id: 'disc1',
        protocol: 'onvif',
        address: '192.168.1.200',
        port: 80,
        manufacturer: '海康威视',
        model: 'DS-2CD2143G0-I',
        capabilities: ['视频', '音频', '云台控制']
      },
      {
        id: 'disc2',
        protocol: 'gb28181',
        address: '192.168.1.201',
        port: 5060,
        manufacturer: '大华',
        model: 'DH-IPC-HFW2431S-S2',
        capabilities: ['视频', '音频'],
        deviceId: '34020000001320000002'
      }
    ]
    message.success(`发现 ${discoveryResults.value.length} 台设备`)
  })
}

/**
 * 查看设备详情
 */
const viewDevice = (device: ProtocolDevice) => {
  selectedDevice.value = device
  detailModal.visible = true
}

/**
 * 测试设备
 */
const testDevice = (device: ProtocolDevice) => {
  message.loading(`正在测试设备 ${device.name}...`, 2).then(() => {
    if (device.status === 'online') {
      message.success('设备连接正常')
    } else {
      message.error('设备连接失败')
    }
  })
}

/**
 * 编辑设备
 */
const editDevice = (device: ProtocolDevice) => {
  deviceModal.visible = true
  deviceModal.title = '编辑设备'
  deviceModal.isEdit = true
  Object.assign(deviceForm, device)
}

/**
 * 删除设备
 */
const deleteDevice = (device: ProtocolDevice) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除设备"${device.name}"吗？`,
    onOk: () => {
      message.success('设备删除成功')
    }
  })
}

/**
 * 清空发现结果
 */
const clearDiscovery = () => {
  discoveryResults.value = []
  selectedDiscoveryKeys.value = []
}

/**
 * 处理发现设备选择变化
 */
const handleDiscoverySelectionChange = (selectedKeys: string[]) => {
  selectedDiscoveryKeys.value = selectedKeys
}

/**
 * 添加选中的发现设备
 */
const addSelectedDevices = () => {
  if (selectedDiscoveryKeys.value.length === 0) {
    message.warning('请先选择要添加的设备')
    return
  }
  
  message.success(`已添加 ${selectedDiscoveryKeys.value.length} 台设备`)
  clearDiscovery()
}

/**
 * 提交设备表单
 */
const handleDeviceSubmit = () => {
  if (deviceModal.isEdit) {
    message.success('设备信息更新成功')
  } else {
    message.success('设备添加成功')
  }
  deviceModal.visible = false
  resetDeviceForm()
}

/**
 * 取消设备表单
 */
const handleDeviceCancel = () => {
  deviceModal.visible = false
  resetDeviceForm()
}

/**
 * 重置设备表单
 */
const resetDeviceForm = () => {
  Object.assign(deviceForm, {
    name: '',
    protocol: 'gb28181',
    address: '',
    port: 5060,
    username: 'admin',
    password: '',
    deviceId: '',
    manufacturer: '',
    model: '',
    rtspPath: '',
    notes: ''
  })
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  pagination.total = deviceList.value.length
  console.log('标准协议接入页面已加载，共', deviceList.value.length, '个设备')
  
  // 模拟实时数据更新
  setInterval(() => {
    // 随机更新一些设备状态
    const randomDevice = deviceList.value[Math.floor(Math.random() * deviceList.value.length)]
    if (randomDevice && randomDevice.status === 'online') {
      randomDevice.onlineTime = dayjs().subtract(Math.floor(Math.random() * 60), 'minute').format('YYYY-MM-DD HH:mm:ss')
    }
  }, 30000) // 每30秒更新一次
})
</script>

<style lang="less" scoped>
.protocol-access {
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

  .protocol-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .protocol-content {
    margin-bottom: 24px;

    .protocol-config-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .protocol-section {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .protocol-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h4 {
            margin: 0;
            color: #333;
          }
        }

        .protocol-config {
          .config-item {
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .config-label {
              display: block;
              margin-bottom: 4px;
              font-size: 12px;
              color: #666;
            }
          }
        }
      }

      .config-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
      }
    }

    .device-card {
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
            margin-bottom: 4px;
          }

          .device-id {
            font-size: 11px;
            color: #999;
            margin-bottom: 2px;
            font-family: monospace;
          }

          .device-address {
            font-size: 12px;
            color: #666;
            font-family: monospace;
          }
        }
      }

      .status-info {
        .online-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }
      }

      .streams-info {
        .stream-count {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .stream-quality {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
    }
  }

  .discovery-section {
    margin-bottom: 24px;

    .discovery-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .capabilities-info {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }

  .device-detail {
    .streams-detail {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .capabilities-detail {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .capabilities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .protocol-access {
    .protocol-content {
      .ant-col-8 {
        width: 100%;
        margin-bottom: 24px;
      }

      .ant-col-16 {
        width: 100%;
      }
    }
  }
}

@media (max-width: 768px) {
  .protocol-access {
    padding: 16px;

    .protocol-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

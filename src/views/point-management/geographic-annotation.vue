<template>
  <div class="geographic-annotation">
    <div class="page-header">
      <h2>地理信息标注</h2>
      <p>精确标注济宁港、梁山港、京杭大运河等区域的设备位置、覆盖范围和朝向角度，形成可视化的设备布点图</p>
    </div>

    <!-- 地图控制区域 -->
    <div class="map-controls">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-select
            v-model:value="selectedArea"
            placeholder="选择区域"
            @change="handleAreaChange"
          >
            <a-select-option value="area1">济宁港</a-select-option>
            <a-select-option value="area2">梁山港</a-select-option>
            <a-select-option value="area3">京杭大运河</a-select-option>
            <a-select-option value="area4">锚地区</a-select-option>
            <a-select-option value="area5">散货码头</a-select-option>
            <a-select-option value="">全部区域</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="selectedDeviceType"
            placeholder="设备类型"
            @change="handleDeviceTypeChange"
          >
            <a-select-option value="camera">摄像头</a-select-option>
            <a-select-option value="sensor">传感器</a-select-option>
            <a-select-option value="network">网络设备</a-select-option>
            <a-select-option value="storage">存储设备</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="selectedStatus"
            placeholder="设备状态"
            @change="handleStatusChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="maintenance">维护中</a-select-option>
            <a-select-option value="fault">故障</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="showAddAnnotation">
            <PlusOutlined />
            添加标注
          </a-button>
        </a-col>
        <a-col :span="4">
          <a-button @click="exportAnnotations">
            <ExportOutlined />
            导出数据
          </a-button>
        </a-col>
        <a-col :span="4">
          <a-button @click="toggleCoverageView">
            <EyeOutlined />
            {{ showCoverage ? '隐藏覆盖' : '显示覆盖' }}
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 地图和标注列表 -->
    <div class="map-container">
      <a-row :gutter="16">
        <!-- 地图区域 -->
        <a-col :span="16">
          <div class="map-area">
            <div class="map-header">
              <h3>济宁港水域电子地图 - {{ getAreaText(selectedArea) }}</h3>
              <div class="map-tools">
                <a-button-group>
                  <a-button size="small" @click="zoomIn">
                    <ZoomInOutlined />
                  </a-button>
                  <a-button size="small" @click="zoomOut">
                    <ZoomOutOutlined />
                  </a-button>
                  <a-button size="small" @click="resetView">
                    <HomeOutlined />
                  </a-button>
                </a-button-group>
                <a-divider type="vertical" />
                <span class="zoom-level">缩放: {{ currentZoom }}x</span>
                <a-divider type="vertical" />
                <span class="coordinate-info">中心: {{ currentCenterCoordinates }}</span>
              </div>
            </div>
            
            <!-- 模拟地图区域 -->
            <div class="map-content" @mousemove="handleMouseMove" @click="handleMapClick">
              <div class="water-area">
                <div class="water-text">水域区域</div>
                
                <!-- 网格线 -->
                <div class="grid-lines">
                  <div v-for="i in 10" :key="`v-${i}`" class="grid-line vertical" :style="{ left: i * 10 + '%' }"></div>
                  <div v-for="i in 6" :key="`h-${i}`" class="grid-line horizontal" :style="{ top: i * 16.67 + '%' }"></div>
                </div>
                
                <!-- 坐标刻度 -->
                <div class="coordinate-scales">
                  <div class="scale-x">
                    <span v-for="i in 11" :key="`x-${i}`" class="scale-mark" :style="{ left: (i-1) * 10 + '%' }">
                      {{ (116.57 + (i-1) * 0.01).toFixed(3) }}°
                    </span>
                  </div>
                  <div class="scale-y">
                    <span v-for="i in 7" :key="`y-${i}`" class="scale-mark" :style="{ top: (i-1) * 16.67 + '%' }">
                      {{ (35.39 - (i-1) * 0.01).toFixed(3) }}°
                    </span>
                  </div>
                </div>
                
                <!-- 设备标注点 -->
                <div
                  v-for="device in filteredDevices"
                  :key="device.id"
                  class="device-marker"
                  :class="[`device-${device.deviceType}`, `status-${device.status}`]"
                  :style="{
                    left: device.mapX + '%',
                    top: device.mapY + '%'
                  }"
                  @click.stop="selectDevice(device)"
                >
                  <div class="marker-icon">
                    <CameraOutlined v-if="device.deviceType === 'camera'" />
                    <RadarChartOutlined v-else-if="device.deviceType === 'sensor'" />
                    <WifiOutlined v-else-if="device.deviceType === 'network'" />
                    <DatabaseOutlined v-else />
                  </div>
                  
                  <!-- 设备标签 -->
                  <div class="marker-label">
                    <div class="device-name">{{ device.deviceName }}</div>
                    <div class="device-coordinates">{{ device.coordinates }}</div>
                    <div class="device-status">{{ getStatusText(device.status) }}</div>
                  </div>
                  
                  <!-- 朝向角度指示器 -->
                  <div 
                    v-if="device.orientation !== undefined"
                    class="orientation-indicator"
                    :style="{ transform: `rotate(${device.orientation}deg)` }"
                  >
                    <div class="arrow"></div>
                  </div>
                  
                  <!-- 覆盖范围指示器 -->
                  <div 
                    v-if="device.deviceType === 'camera' && showCoverage && device.coverageRadius"
                    class="coverage-area"
                    :style="{
                      width: device.coverageRadius * 2 + 'px',
                      height: device.coverageRadius * 2 + 'px'
                    }"
                  >
                    <div class="coverage-circle"></div>
                    <div class="coverage-info">
                      <div class="radius">{{ device.coverageRadius }}m</div>
                      <div class="angle">{{ device.coverageAngle }}°</div>
                    </div>
                  </div>
                </div>
                
                <!-- 船舶位置 -->
                <div
                  v-for="ship in shipPositions"
                  :key="ship.id"
                  class="ship-marker"
                  :style="{
                    left: ship.x + '%',
                    top: ship.y + '%'
                  }"
                >
                  <div class="ship-icon">🚢</div>
                  <div class="ship-label">{{ ship.name }}</div>
                  <div class="ship-course" :style="{ transform: `rotate(${ship.course}deg)` }">
                    <div class="course-arrow"></div>
                  </div>
                </div>
                
                <!-- 气象水文站 -->
                <div
                  v-for="station in weatherStations"
                  :key="station.id"
                  class="weather-marker"
                  :style="{
                    left: station.x + '%',
                    top: station.y + '%'
                  }"
                >
                  <div class="weather-icon">🌤️</div>
                  <div class="weather-label">{{ station.name }}</div>
                </div>
              </div>
              
              <!-- 图例 -->
              <div class="map-legend">
                <div class="legend-title">图例说明</div>
                <div class="legend-item">
                  <div class="legend-icon device-camera"></div>
                  <span>摄像头</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon device-sensor"></div>
                  <span>传感器</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon device-network"></div>
                  <span>网络设备</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon device-storage"></div>
                  <span>存储设备</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon ship-marker"></div>
                  <span>船舶</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon weather-marker"></div>
                  <span>气象站</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon orientation-arrow"></div>
                  <span>朝向角度</span>
                </div>
                <div class="legend-item">
                  <div class="legend-icon coverage-circle"></div>
                  <span>覆盖范围</span>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <!-- 标注信息面板 -->
        <a-col :span="8">
          <div class="annotation-panel">
            <div class="panel-header">
              <h3>标注信息</h3>
              <div class="panel-tools">
                <a-button size="small" @click="refreshAnnotations">
                  <ReloadOutlined />
                </a-button>
                <a-button size="small" @click="togglePanelView">
                  <AppstoreOutlined />
                </a-button>
              </div>
            </div>
            
            <!-- 设备列表 -->
            <div class="device-list">
              <div
                v-for="device in filteredDevices"
                :key="device.id"
                class="device-item"
                :class="{ active: selectedDevice?.id === device.id }"
                @click="selectDevice(device)"
              >
                <div class="device-info">
                  <div class="device-icon">
                    <CameraOutlined v-if="device.deviceType === 'camera'" />
                    <RadarChartOutlined v-else-if="device.deviceType === 'sensor'" />
                    <WifiOutlined v-else-if="device.deviceType === 'network'" />
                    <DatabaseOutlined v-else />
                  </div>
                  <div class="device-details">
                    <div class="device-name">{{ device.deviceName }}</div>
                    <div class="device-location">{{ device.location }}</div>
                    <div class="device-coordinates">{{ device.coordinates }}</div>
                  </div>
                  <div class="device-status">
                    <a-tag :color="getStatusColor(device.status)">
                      {{ getStatusText(device.status) }}
                    </a-tag>
                  </div>
                </div>
                
                <!-- 精确坐标信息 -->
                <div class="coordinate-details">
                  <div class="coordinate-item">
                    <span class="label">经度:</span>
                    <span class="value">{{ device.longitude }}°</span>
                  </div>
                  <div class="coordinate-item">
                    <span class="label">纬度:</span>
                    <span class="value">{{ device.latitude }}°</span>
                  </div>
                  <div v-if="device.orientation !== undefined" class="coordinate-item">
                    <span class="label">朝向:</span>
                    <span class="value">{{ device.orientation }}°</span>
                  </div>
                </div>
                
                <!-- 覆盖范围信息 -->
                <div v-if="device.deviceType === 'camera'" class="coverage-info">
                  <div class="coverage-item">
                    <span class="label">覆盖半径:</span>
                    <span class="value">{{ device.coverageRadius }}米</span>
                  </div>
                  <div class="coverage-item">
                    <span class="label">覆盖角度:</span>
                    <span class="value">{{ device.coverageAngle }}°</span>
                  </div>
                  <div class="coverage-item">
                    <span class="label">盲区面积:</span>
                    <span class="value">{{ device.blindArea }}㎡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 添加/编辑标注弹窗 -->
    <a-modal
      v-model:open="annotationModal.visible"
      :title="annotationModal.title"
      width="700px"
      @ok="handleAnnotationSubmit"
      @cancel="handleAnnotationCancel"
    >
      <a-form
        ref="annotationFormRef"
        :model="annotationForm"
        :rules="annotationRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备名称" name="deviceName">
              <a-input v-model:value="annotationForm.deviceName" placeholder="请输入设备名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备类型" name="deviceType">
              <a-select v-model:value="annotationForm.deviceType" placeholder="请选择设备类型">
                <a-select-option value="camera">摄像头</a-select-option>
                <a-select-option value="sensor">传感器</a-select-option>
                <a-select-option value="network">网络设备</a-select-option>
                <a-select-option value="storage">存储设备</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="安装位置" name="location">
              <a-input v-model:value="annotationForm.location" placeholder="请输入安装位置" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备状态" name="status">
              <a-select v-model:value="annotationForm.status" placeholder="请选择设备状态">
                <a-select-option value="online">在线</a-select-option>
                <a-select-option value="offline">离线</a-select-option>
                <a-select-option value="maintenance">维护中</a-select-option>
                <a-select-option value="fault">故障</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经度" name="longitude">
              <a-input-number
                v-model:value="annotationForm.longitude"
                :min="116.57"
                :max="116.66"
                :step="0.000001"
                placeholder="经度(116.570000-116.660000)"
                style="width: 100%"
                :precision="6"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="纬度" name="latitude">
              <a-input-number
                v-model:value="annotationForm.latitude"
                :min="35.34"
                :max="35.39"
                :step="0.000001"
                placeholder="纬度(35.340000-35.390000)"
                style="width: 100%"
                :precision="6"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="地图X坐标" name="mapX">
              <a-input-number
                v-model:value="annotationForm.mapX"
                :min="0"
                :max="100"
                :step="0.1"
                placeholder="X坐标(0-100%)"
                style="width: 100%"
                :precision="1"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="地图Y坐标" name="mapY">
              <a-input-number
                v-model:value="annotationForm.mapY"
                :min="0"
                :max="100"
                :step="0.1"
                placeholder="Y坐标(0-100%)"
                style="width: 100%"
                :precision="1"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="朝向角度" name="orientation">
              <a-input-number
                v-model:value="annotationForm.orientation"
                :min="0"
                :max="360"
                :step="1"
                placeholder="朝向角度(0-360°)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="安装高度" name="height">
              <a-input-number
                v-model:value="annotationForm.height"
                :min="0"
                :max="100"
                :step="0.1"
                placeholder="安装高度(米)"
                style="width: 100%"
                :precision="1"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16" v-if="annotationForm.deviceType === 'camera'">
          <a-col :span="8">
            <a-form-item label="覆盖半径" name="coverageRadius">
              <a-input-number
                v-model:value="annotationForm.coverageRadius"
                :min="10"
                :max="1000"
                :step="10"
                placeholder="覆盖半径(米)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="覆盖角度" name="coverageAngle">
              <a-input-number
                v-model:value="annotationForm.coverageAngle"
                :min="30"
                :max="360"
                :step="10"
                placeholder="覆盖角度(度)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="盲区面积" name="blindArea">
              <a-input-number
                v-model:value="annotationForm.blindArea"
                :min="0"
                :max="1000"
                :step="1"
                placeholder="盲区面积(㎡)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="annotationForm.notes"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ExportOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  HomeOutlined,
  ReloadOutlined,
  CameraOutlined,
  RadarChartOutlined,
  WifiOutlined,
  DatabaseOutlined,
  EyeOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

/**
 * 设备标注信息接口
 */
interface DeviceAnnotation {
  id: string
  deviceName: string
  deviceType: 'camera' | 'sensor' | 'network' | 'storage'
  location: string
  coordinates: string
  mapX: number
  mapY: number
  status: 'online' | 'offline' | 'maintenance' | 'fault'
  coverageRadius?: number
  coverageAngle?: number
  blindArea?: number
  notes?: string
  longitude: number
  latitude: number
  orientation?: number
  height?: number
}

/**
 * 船舶位置信息
 */
interface ShipPosition {
  id: string
  name: string
  x: number
  y: number
  course: number
  speed: number
}

/**
 * 气象水文站信息
 */
interface WeatherStation {
  id: string
  name: string
  x: number
  y: number
  type: 'weather' | 'hydrology'
}

/**
 * 响应式数据
 */
const selectedArea = ref('area1')
const selectedDeviceType = ref('camera')
const selectedStatus = ref('online')
const selectedDevice = ref<DeviceAnnotation | null>(null)
const annotationModal = reactive({
  visible: false,
  title: '添加标注',
  isEdit: false
})

/**
 * 地图显示控制
 */
const showCoverage = ref(true)
const currentZoom = ref(1)
const currentCenterCoordinates = ref('50%, 50%')
const panelView = ref('list') // 'list' 或 'map'

/**
 * 标注表单数据
 */
const annotationForm = reactive<Partial<DeviceAnnotation>>({
  deviceName: '',
  deviceType: 'camera',
  location: '',
  coordinates: '',
  mapX: 50,
  mapY: 50,
  coverageRadius: 100,
  coverageAngle: 90,
  notes: '',
  longitude: 116.5800,
  latitude: 35.3800,
  orientation: 90,
  height: 10
})

/**
 * 表单验证规则
 */
const annotationRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  mapX: [{ required: true, message: '请输入X坐标', trigger: 'blur' }],
  mapY: [{ required: true, message: '请输入Y坐标', trigger: 'blur' }],
  orientation: [{ required: false, message: '请输入朝向角度', trigger: 'blur' }],
  height: [{ required: false, message: '请输入安装高度', trigger: 'blur' }]
}

/**
 * 模拟设备数据
 */
const deviceAnnotations = ref<DeviceAnnotation[]>([
  // 济宁港设备
  {
    id: '1',
    deviceName: '济宁港主码头-高清监控01',
    deviceType: 'camera',
    location: '济宁港主码头前沿',
    coordinates: '116.5800, 35.3800',
    mapX: 25,
    mapY: 30,
    status: 'online',
    coverageRadius: 150,
    coverageAngle: 90,
    blindArea: 45,
    notes: '监控主码头船舶靠泊和装卸作业',
    longitude: 116.5800,
    latitude: 35.3800,
    orientation: 90,
    height: 12
  },
  {
    id: '2',
    deviceName: '济宁港集装箱堆场-监控02',
    deviceType: 'camera',
    location: '济宁港集装箱堆场中心',
    coordinates: '116.5820, 35.3780',
    mapX: 30,
    mapY: 25,
    status: 'online',
    coverageRadius: 120,
    coverageAngle: 120,
    blindArea: 30,
    notes: '监控集装箱堆场货物装卸和存储',
    longitude: 116.5820,
    latitude: 35.3780,
    orientation: 180,
    height: 10
  },
  {
    id: '3',
    deviceName: '济宁港航道-水深传感器01',
    deviceType: 'sensor',
    location: '济宁港航道入口',
    coordinates: '116.5780, 35.3820',
    mapX: 28,
    mapY: 32,
    status: 'online',
    notes: '监测航道水深和水流速度',
    longitude: 116.5780,
    latitude: 35.3820,
    orientation: 0,
    height: 2
  },
  {
    id: '4',
    deviceName: '济宁港控制中心-核心交换机01',
    deviceType: 'network',
    location: '济宁港控制中心机房',
    coordinates: '116.5810, 35.3790',
    mapX: 32,
    mapY: 28,
    status: 'online',
    notes: '港区网络通信核心设备',
    longitude: 116.5810,
    latitude: 35.3790,
    orientation: 270,
    height: 15
  },
  {
    id: '5',
    deviceName: '济宁港数据中心-存储阵列01',
    deviceType: 'storage',
    location: '济宁港数据中心',
    coordinates: '116.5830, 35.3770',
    mapX: 35,
    mapY: 26,
    status: 'online',
    notes: '港区监控数据存储和备份设备',
    longitude: 116.5830,
    latitude: 35.3770,
    orientation: 0,
    height: 12
  },
  
  // 梁山港设备
  {
    id: '6',
    deviceName: '梁山港码头-高清监控01',
    deviceType: 'camera',
    location: '梁山港主码头前沿',
    coordinates: '116.6500, 35.3500',
    mapX: 65,
    mapY: 35,
    status: 'online',
    coverageRadius: 140,
    coverageAngle: 100,
    blindArea: 40,
    notes: '监控梁山港码头作业区域',
    longitude: 116.6500,
    latitude: 35.3500,
    orientation: 45,
    height: 12
  },
  {
    id: '7',
    deviceName: '梁山港散货堆场-监控02',
    deviceType: 'camera',
    location: '梁山港散货堆场',
    coordinates: '116.6520, 35.3480',
    mapX: 68,
    mapY: 30,
    status: 'maintenance',
    coverageRadius: 130,
    coverageAngle: 110,
    blindArea: 35,
    notes: '监控散货堆场煤炭、铁矿石存储',
    longitude: 116.6520,
    latitude: 35.3480,
    orientation: 135,
    height: 9
  },
  {
    id: '8',
    deviceName: '梁山港航道-潮汐传感器01',
    deviceType: 'sensor',
    location: '梁山港航道入口',
    coordinates: '116.6480, 35.3520',
    mapX: 70,
    mapY: 38,
    status: 'online',
    notes: '监测航道潮汐和水位变化',
    longitude: 116.6480,
    latitude: 35.3520,
    orientation: 90,
    height: 3
  },
  {
    id: '9',
    deviceName: '梁山港通信机房-核心路由器01',
    deviceType: 'network',
    location: '梁山港通信机房',
    coordinates: '116.6510, 35.3490',
    mapX: 72,
    mapY: 33,
    status: 'online',
    notes: '梁山港网络通信核心设备',
    longitude: 116.6510,
    latitude: 35.3490,
    orientation: 180,
    height: 18
  },
  
  // 京杭大运河设备
  {
    id: '10',
    deviceName: '京杭运河济宁段-航道监控01',
    deviceType: 'camera',
    location: '京杭大运河济宁段主航道',
    coordinates: '116.5750, 35.3850',
    mapX: 50,
    mapY: 50,
    status: 'online',
    coverageRadius: 200,
    coverageAngle: 60,
    blindArea: 80,
    notes: '监控京杭运河济宁段船舶通行',
    longitude: 116.5750,
    latitude: 35.3850,
    orientation: 0,
    height: 15
  },
  {
    id: '11',
    deviceName: '京杭运河转弯处-监控02',
    deviceType: 'camera',
    location: '京杭运河济宁段转弯处',
    coordinates: '116.5730, 35.3870',
    mapX: 55,
    mapY: 55,
    status: 'online',
    coverageRadius: 180,
    coverageAngle: 80,
    blindArea: 60,
    notes: '监控运河转弯处船舶转向和避让',
    longitude: 116.5730,
    latitude: 35.3870,
    orientation: 45,
    height: 14
  },
  {
    id: '12',
    deviceName: '京杭运河-水流传感器01',
    deviceType: 'sensor',
    location: '京杭运河济宁段中心线',
    coordinates: '116.5760, 35.3840',
    mapX: 48,
    mapY: 52,
    status: 'online',
    notes: '监测运河水流速度和水质',
    longitude: 116.5760,
    latitude: 35.3840,
    orientation: 0,
    height: 5
  },
  {
    id: '13',
    deviceName: '京杭运河浅滩-水深传感器02',
    deviceType: 'sensor',
    location: '京杭运河济宁段浅滩区域',
    coordinates: '116.5740, 35.3860',
    mapX: 52,
    mapY: 58,
    status: 'online',
    notes: '监测浅滩区域水深变化',
    longitude: 116.5740,
    latitude: 35.3860,
    orientation: 90,
    height: 2
  },
  {
    id: '14',
    deviceName: '京杭运河监控中心-网络设备01',
    deviceType: 'network',
    location: '京杭运河济宁段监控中心',
    coordinates: '116.5770, 35.3830',
    mapX: 45,
    mapY: 45,
    status: 'online',
    notes: '运河监控网络通信设备',
    longitude: 116.5770,
    latitude: 35.3830,
    orientation: 270,
    height: 20
  },
  
  // 锚地区设备
  {
    id: '15',
    deviceName: '济宁港锚地-全景监控01',
    deviceType: 'camera',
    location: '济宁港锚地区域中心',
    coordinates: '116.5850, 35.3750',
    mapX: 75,
    mapY: 70,
    status: 'online',
    coverageRadius: 160,
    coverageAngle: 360,
    blindArea: 0,
    notes: '360度监控锚地区域船舶停泊',
    longitude: 116.5850,
    latitude: 35.3750,
    orientation: 0,
    height: 16
  },
  {
    id: '16',
    deviceName: '济宁港锚地入口-监控02',
    deviceType: 'camera',
    location: '济宁港锚地入口',
    coordinates: '116.5870, 35.3730',
    mapX: 78,
    mapY: 65,
    status: 'online',
    coverageRadius: 140,
    coverageAngle: 90,
    blindArea: 50,
    notes: '监控锚地入口船舶进出',
    longitude: 116.5870,
    latitude: 35.3730,
    orientation: 90,
    height: 13
  },
  {
    id: '17',
    deviceName: '济宁港锚地-气象传感器01',
    deviceType: 'sensor',
    location: '济宁港锚地区域',
    coordinates: '116.5890, 35.3710',
    mapX: 80,
    mapY: 72,
    status: 'offline',
    notes: '监测锚地区域气象和水文数据',
    longitude: 116.5890,
    latitude: 35.3710,
    orientation: 180,
    height: 4
  },
  {
    id: '18',
    deviceName: '济宁港锚地-通信基站01',
    deviceType: 'network',
    location: '济宁港锚地区域',
    coordinates: '116.5860, 35.3740',
    mapX: 73,
    mapY: 68,
    status: 'online',
    notes: '锚地区域无线通信覆盖设备',
    longitude: 116.5860,
    latitude: 35.3740,
    orientation: 180,
    height: 8
  },
  {
    id: '19',
    deviceName: '济宁港锚地-数据存储01',
    deviceType: 'storage',
    location: '济宁港锚地监控站',
    coordinates: '116.5880, 35.3720',
    mapX: 77,
    mapY: 75,
    status: 'online',
    notes: '锚地监控数据本地存储设备',
    longitude: 116.5880,
    latitude: 35.3720,
    orientation: 0,
    height: 10
  },
  
  // 新增区域设备
  {
    id: '20',
    deviceName: '济宁港散货码头-监控01',
    deviceType: 'camera',
    location: '济宁港散货码头前沿',
    coordinates: '116.5840, 35.3760',
    mapX: 85,
    mapY: 40,
    status: 'online',
    coverageRadius: 130,
    coverageAngle: 95,
    blindArea: 42,
    notes: '监控散货码头煤炭、铁矿石装卸',
    longitude: 116.5840,
    latitude: 35.3760,
    orientation: 135,
    height: 11
  },
  {
    id: '21',
    deviceName: '济宁港散货码头-粉尘传感器01',
    deviceType: 'sensor',
    location: '济宁港散货码头',
    coordinates: '116.5860, 35.3740',
    mapX: 88,
    mapY: 45,
    status: 'online',
    notes: '监测散货码头粉尘浓度',
    longitude: 116.5860,
    latitude: 35.3740,
    orientation: 90,
    height: 3
  },
  {
    id: '22',
    deviceName: '济宁港散货码头-通信设备01',
    deviceType: 'network',
    location: '济宁港散货码头通信中心',
    coordinates: '116.5850, 35.3750',
    mapX: 90,
    mapY: 42,
    status: 'maintenance',
    notes: '散货码头网络通信设备',
    longitude: 116.5850,
    latitude: 35.3750,
    orientation: 270,
    height: 16
  },
  
  // 故障设备
  {
    id: '23',
    deviceName: '济宁港仓库区-监控01',
    deviceType: 'camera',
    location: '济宁港综合仓库区',
    coordinates: '116.5820, 35.3780',
    mapX: 38,
    mapY: 22,
    status: 'fault',
    coverageRadius: 100,
    coverageAngle: 75,
    blindArea: 55,
    notes: '仓库区监控设备网络故障',
    longitude: 116.5820,
    latitude: 35.3780,
    orientation: 225,
    height: 7
  },
  {
    id: '24',
    deviceName: '京杭运河深水区-流速传感器01',
    deviceType: 'sensor',
    location: '京杭运河济宁段深水区',
    coordinates: '116.5750, 35.3840',
    mapX: 42,
    mapY: 48,
    status: 'fault',
    notes: '深水区流速传感器设备故障',
    longitude: 116.5750,
    latitude: 35.3840,
    orientation: 0,
    height: 6
  }
])

/**
 * 模拟船舶位置数据
 */
const shipPositions = ref<ShipPosition[]>([
  {
    id: 'ship1',
    name: '中交润杨001',
    x: 30,
    y: 40,
    course: 45,
    speed: 12
  },
  {
    id: 'ship2',
    name: '中交润杨002',
    x: 60,
    y: 60,
    course: 90,
    speed: 8
  },
  {
    id: 'ship3',
    name: '中交润杨003',
    x: 45,
    y: 55,
    course: 135,
    speed: 15
  },
  {
    id: 'ship4',
    name: '中交润杨004',
    x: 70,
    y: 45,
    course: 0,
    speed: 10
  },
  {
    id: 'ship5',
    name: '中交润杨005',
    x: 25,
    y: 65,
    course: 180,
    speed: 6
  },
  {
    id: 'ship6',
    name: '中交润杨006',
    x: 80,
    y: 70,
    course: 270,
    speed: 9
  },
  {
    id: 'ship7',
    name: '中交润杨007',
    x: 35,
    y: 75,
    course: 315,
    speed: 11
  },
  {
    id: 'ship8',
    name: '中交润杨008',
    x: 55,
    y: 35,
    course: 225,
    speed: 7
  }
])

/**
 * 模拟气象水文站数据
 */
const weatherStations = ref<WeatherStation[]>([
  {
    id: 'weather1',
    name: '港区A气象站',
    x: 20,
    y: 20,
    type: 'weather'
  },
  {
    id: 'hydrology1',
    name: '主航道水文站',
    x: 50,
    y: 80,
    type: 'hydrology'
  },
  {
    id: 'weather2',
    name: '港区B气象站',
    x: 65,
    y: 25,
    type: 'weather'
  },
  {
    id: 'hydrology2',
    name: '锚地水文站',
    x: 75,
    y: 80,
    type: 'hydrology'
  },
  {
    id: 'weather3',
    name: '港区C气象站',
    x: 85,
    y: 35,
    type: 'weather'
  },
  {
    id: 'hydrology3',
    name: '航道入口水文站',
    x: 40,
    y: 90,
    type: 'hydrology'
  },
  {
    id: 'weather4',
    name: '航道中心气象站',
    x: 45,
    y: 60,
    type: 'weather'
  },
  {
    id: 'hydrology4',
    name: '港区A水文站',
    x: 30,
    y: 85,
    type: 'hydrology'
  }
])

/**
 * 过滤后的设备列表
 */
const filteredDevices = computed(() => {
  let devices = deviceAnnotations.value
  
  if (selectedArea.value) {
    // 根据区域过滤设备
    devices = devices.filter(device => {
      if (selectedArea.value === 'area1') {
        return device.location.includes('济宁港')
      } else if (selectedArea.value === 'area2') {
        return device.location.includes('梁山港')
      } else if (selectedArea.value === 'area3') {
        return device.location.includes('京杭大运河')
      } else if (selectedArea.value === 'area4') {
        return device.location.includes('锚地')
      } else if (selectedArea.value === 'area5') {
        return device.location.includes('散货码头')
      }
      return true
    })
  }
  
  if (selectedDeviceType.value) {
    devices = devices.filter(device => device.deviceType === selectedDeviceType.value)
  }

  if (selectedStatus.value) {
    devices = devices.filter(device => device.status === selectedStatus.value)
  }
  
  return devices
})

/**
 * 获取区域文本
 */
const getAreaText = (area: string) => {
  const areaMap: Record<string, string> = {
    area1: '济宁港',
    area2: '梁山港',
    area3: '京杭大运河',
    area4: '锚地区',
    area5: '散货码头'
  }
  return areaMap[area] || '全部区域'
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
 * 处理区域变化
 */
const handleAreaChange = () => {
  // 可以在这里添加区域切换逻辑
  console.log('区域切换到:', selectedArea.value)
}

/**
 * 处理设备类型变化
 */
const handleDeviceTypeChange = () => {
  // 可以在这里添加设备类型过滤逻辑
  console.log('设备类型切换到:', selectedDeviceType.value)
}

/**
 * 处理设备状态变化
 */
const handleStatusChange = () => {
  // 可以在这里添加设备状态过滤逻辑
  console.log('设备状态切换到:', selectedStatus.value)
}

/**
 * 显示添加标注弹窗
 */
const showAddAnnotation = () => {
  annotationModal.visible = true
  annotationModal.title = '添加标注'
  annotationModal.isEdit = false
  resetAnnotationForm()
}

/**
 * 选择设备
 */
const selectDevice = (device: DeviceAnnotation) => {
  selectedDevice.value = device
}

/**
 * 刷新标注信息
 */
const refreshAnnotations = () => {
  message.success('标注信息已刷新')
}

/**
 * 导出标注数据
 */
const exportAnnotations = () => {
  message.success('标注数据导出成功')
}

/**
 * 地图缩放控制
 */
const zoomIn = () => {
  currentZoom.value = Math.min(currentZoom.value + 0.2, 3)
  message.info(`地图放大到 ${currentZoom.value.toFixed(1)}x`)
}

const zoomOut = () => {
  currentZoom.value = Math.max(currentZoom.value - 0.2, 0.5)
  message.info(`地图缩小到 ${currentZoom.value.toFixed(1)}x`)
}

const resetView = () => {
  currentZoom.value = 1
  currentCenterCoordinates.value = '50%, 50%'
  message.info('视图已重置')
}

/**
 * 切换覆盖范围显示
 */
const toggleCoverageView = () => {
  showCoverage.value = !showCoverage.value
}

/**
 * 处理地图鼠标移动
 */
const handleMouseMove = (event: MouseEvent) => {
  // 在地图上显示鼠标坐标
  const mapElement = document.querySelector('.map-content') as HTMLElement
  if (mapElement) {
    const rect = mapElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // 将鼠标坐标转换为地图百分比
    const mapWidth = mapElement.clientWidth
    const mapHeight = mapElement.clientHeight
    const mapXPercent = (x / mapWidth) * 100
    const mapYPercent = (y / mapHeight) * 100
    // 更新当前中心坐标
    currentCenterCoordinates.value = `${mapXPercent.toFixed(2)}%, ${mapYPercent.toFixed(2)}%`
  }
}

/**
 * 处理地图点击
 */
const handleMapClick = (event: MouseEvent) => {
  // 在地图上显示点击坐标
  const mapElement = document.querySelector('.map-content') as HTMLElement
  if (mapElement) {
    const rect = mapElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const mapWidth = mapElement.clientWidth
    const mapHeight = mapElement.clientHeight
    const mapXPercent = (x / mapWidth) * 100
    const mapYPercent = (y / mapHeight) * 100
    // 将点击坐标转换为经纬度（济宁港坐标范围）
    const longitude = 116.57 + (mapXPercent / 100) * 0.01
    const latitude = 35.39 - (mapYPercent / 100) * 0.01
    // 更新当前中心坐标
    currentCenterCoordinates.value = `${longitude.toFixed(6)}°, ${latitude.toFixed(6)}°`
  }
}

/**
 * 切换面板视图
 */
const togglePanelView = () => {
  panelView.value = panelView.value === 'list' ? 'map' : 'list'
}

/**
 * 提交标注表单
 */
const handleAnnotationSubmit = () => {
  if (annotationModal.isEdit) {
    message.success('标注信息更新成功')
  } else {
    message.success('标注添加成功')
  }
  annotationModal.visible = false
}

/**
 * 取消标注表单
 */
const handleAnnotationCancel = () => {
  annotationModal.visible = false
  resetAnnotationForm()
}

/**
 * 重置标注表单
 */
const resetAnnotationForm = () => {
  Object.assign(annotationForm, {
    deviceName: '',
    deviceType: 'camera',
    location: '',
    status: 'online',
    longitude: 116.5800,
    latitude: 35.3800,
    mapX: 50,
    mapY: 50,
    orientation: 90,
    height: 10,
    coverageRadius: 100,
    coverageAngle: 90,
    notes: ''
  })
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 初始化地图和标注
  console.log('地理信息标注页面已加载')
})
</script>

<style lang="less" scoped>
.geographic-annotation {
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

  .map-controls {
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .map-container {
    .map-area {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .map-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;

        h3 {
          margin: 0;
          color: #333;
        }

        .map-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .ant-btn-group {
            .ant-btn {
              border-radius: 4px;
            }
          }
          
          .zoom-level,
          .coordinate-info {
            font-size: 12px;
            color: #666;
            background: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
          }
        }
      }

      .map-content {
        position: relative;
        height: 600px;
        background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
        overflow: hidden;

        .water-area {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #1890ff 0%, #40a9ff 50%, #69c0ff 100%);
          border-radius: 8px;
          margin: 16px;

          .water-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.3);
            font-size: 48px;
            font-weight: bold;
            pointer-events: none;
          }

          .grid-lines {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;

            .grid-line {
              position: absolute;
              background: rgba(255, 255, 255, 0.2);
              z-index: 1;

              &.vertical {
                width: 1px;
                height: 100%;
              }

              &.horizontal {
                width: 100%;
                height: 1px;
              }
            }
          }

          .coordinate-scales {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            box-sizing: border-box;

            .scale-x {
              display: flex;
              justify-content: space-between;
              width: 100%;
              height: 20px;
              position: absolute;
              bottom: 0;
              left: 0;
              transform: translateX(-50%);
              z-index: 2;

              .scale-mark {
                position: absolute;
                bottom: -10px;
                font-size: 10px;
                color: white;
                transform: translateX(-50%);
              }
            }

            .scale-y {
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 20px;
              position: absolute;
              left: 0;
              top: 0;
              transform: translateY(-50%);
              z-index: 2;

              .scale-mark {
                position: absolute;
                left: -10px;
                font-size: 10px;
                color: white;
                transform: translateY(-50%);
              }
            }
          }

          .device-marker {
            position: absolute;
            transform: translate(-50%, -50%);
            cursor: pointer;
            z-index: 10;

            .marker-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            .marker-label {
              position: absolute;
              top: 40px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .marker-label {
              opacity: 1;
            }

            .orientation-indicator {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 3;

              .arrow {
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 10px solid white;
              }
            }

            .coverage-area {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border: 2px dashed rgba(255, 255, 255, 0.6);
              border-radius: 50%;
              pointer-events: none;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.7);
              z-index: 3;

              .coverage-circle {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: white;
                margin-bottom: 4px;
              }

              .coverage-info {
                text-align: center;
                color: white;
                font-size: 10px;
              }
            }

            // 设备类型样式
            &.device-camera .marker-icon {
              background: #52c41a;
            }

            &.device-sensor .marker-icon {
              background: #fa8c16;
            }

            &.device-network .marker-icon {
              background: #1890ff;
            }

            &.device-storage .marker-icon {
              background: #722ed1;
            }

            // 状态样式
            &.status-offline .marker-icon {
              background: #ff4d4f;
            }

            &.status-maintenance .marker-icon {
              background: #faad14;
            }

            &.status-fault .marker-icon {
              background: #ff4d4f;
            }
          }

          .ship-marker {
            position: absolute;
            transform: translate(-50%, -50%);
            cursor: pointer;

            .ship-icon {
              font-size: 24px;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            .ship-label {
              position: absolute;
              top: 30px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              white-space: nowrap;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .ship-label {
              opacity: 1;
            }

            .ship-course {
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 10px solid rgba(0, 0, 0, 0.7);
              z-index: 3;

              .course-arrow {
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid white;
              }
            }
          }

          .weather-marker {
            position: absolute;
            transform: translate(-50%, -50%);
            cursor: pointer;

            .weather-icon {
              font-size: 20px;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            .weather-label {
              position: absolute;
              top: 25px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              white-space: nowrap;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .weather-label {
              opacity: 1;
            }
          }

          .map-legend {
            position: absolute;
            bottom: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.9);
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 10;

            .legend-title {
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
            }

            .legend-item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              font-size: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .legend-icon {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                margin-right: 8px;
                border: 1px solid #d9d9d9;

                &.device-camera {
                  background: #52c41a;
                }

                &.device-sensor {
                  background: #fa8c16;
                }

                &.device-network {
                  background: #1890ff;
                }

                &.device-storage {
                  background: #722ed1;
                }

                &.ship-marker {
                  background: #1890ff;
                  border-radius: 0;
                }

                &.weather-marker {
                  background: #faad14;
                  border-radius: 0;
                }

                &.orientation-arrow {
                  background: #1890ff;
                  border-radius: 0;
                }

                &.coverage-circle {
                  background: #52c41a;
                  border-radius: 0;
                }
              }
            }
          }
        }
      }
    }

    .annotation-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: 600px;
      overflow: hidden;

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;

        h3 {
          margin: 0;
          color: #333;
        }
        
        .panel-tools {
          display: flex;
          gap: 8px;
        }
      }

      .device-list {
        height: calc(100% - 60px);
        overflow-y: auto;
        padding: 16px;

        .device-item {
          background: #fafafa;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;

          &:hover {
            background: #f0f8ff;
            border-color: #1890ff;
          }

          &.active {
            background: #e6f7ff;
            border-color: #1890ff;
          }

          .device-info {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .device-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              margin-right: 12px;
              background: #1890ff;
            }

            .device-details {
              flex: 1;

              .device-name {
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
              }

              .device-location {
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
              }

              .device-coordinates {
                font-size: 11px;
                color: #999;
                font-family: monospace;
              }
            }

            .device-status {
              margin-left: 8px;
            }
          }

          .coordinate-details {
            margin-top: 12px;
            padding-left: 20px;
            border-left: 3px solid #1890ff;

            .coordinate-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                color: #666;
              }

              .value {
                color: #333;
                font-weight: 500;
              }
            }
          }

          .coverage-info {
            background: white;
            border-radius: 4px;
            padding: 8px;
            border-left: 3px solid #1890ff;

            .coverage-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                color: #666;
              }

              .value {
                color: #333;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .geographic-annotation {
    .map-container {
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
  .geographic-annotation {
    padding: 16px;

    .map-controls {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

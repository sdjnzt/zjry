<template>
  <div class="panoramic-view">
    <div class="page-header">
      <h2>全景视图</h2>
      <p>在真实地图上，集成显示山东省济宁市济宁港和梁山港水域区域摄像头点位、船舶AIS位置、气象水文站等要素</p>
      
      <!-- 添加地图状态指示器 -->
      <div class="map-status-indicator">
        <a-tag :color="mapStatus === 'ready' ? 'success' : mapStatus === 'loading' ? 'processing' : 'error'">
          {{ mapStatus === 'ready' ? '地图已加载' : mapStatus === 'loading' ? '地图加载中' : '地图加载失败' }}
        </a-tag>
        <a-button v-if="mapStatus === 'error'" size="small" type="primary" @click="retryLoadMap" style="margin-left: 8px;">
          重试加载
        </a-button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧工具栏 -->
      <div class="left-toolbar">
        <a-card title="图层控制" size="small" class="toolbar-card">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="layerControl.cameras" @change="toggleLayer('cameras')">
              <template #icon><VideoCameraOutlined /></template>
              摄像头点位
            </a-checkbox>
            <a-checkbox v-model:checked="layerControl.ships" @change="toggleLayer('ships')">
              <template #icon><CarOutlined /></template>
              船舶AIS位置
            </a-checkbox>
            <a-checkbox v-model:checked="layerControl.weather" @change="toggleLayer('weather')">
              <template #icon><CloudOutlined /></template>
              气象水文站
            </a-checkbox>
            <a-checkbox v-model:checked="layerControl.radar" @change="toggleLayer('radar')">
              <template #icon><RadarChartOutlined /></template>
              雷达覆盖
            </a-checkbox>
          </a-space>
        </a-card>

        <a-card title="快速操作" size="small" class="toolbar-card">
          <a-space direction="vertical" style="width: 100%">
            <a-button type="primary" size="small" @click="centerMap" class="action-btn">
              <template #icon><AimOutlined /></template>
              居中显示
            </a-button>
            <a-button size="small" @click="resetZoom" class="action-btn">
              <template #icon><ReloadOutlined /></template>
              重置缩放
            </a-button>
            <a-button size="small" @click="toggleFullscreen" class="action-btn">
              <template #icon><FullscreenOutlined /></template>
              全屏显示
            </a-button>
          </a-space>
        </a-card>

        <a-card title="实时信息" size="small" class="toolbar-card">
          <div class="info-item">
            <span class="label">在线摄像头:</span>
            <span class="value success">{{ statistics.onlineCameras }}/{{ statistics.totalCameras }}</span>
          </div>
          <div class="info-item">
            <span class="label">在线船舶:</span>
            <span class="value info">{{ statistics.onlineShips }}</span>
          </div>
          <div class="info-item">
            <span class="label">天气状况:</span>
            <span class="value warning">{{ statistics.weather }}</span>
          </div>
        </a-card>
      </div>

      <!-- 主地图区域 -->
      <div class="main-map">
        <div class="map-container" ref="mapContainer">
          <!-- 高德地图容器 -->
          <div id="amap-container" class="amap-container"></div>
          
          <!-- 添加地图加载提示和错误处理 -->
          <div v-if="mapStatus !== 'ready'" class="map-loading">
            <a-spin size="large">
              <template #indicator>
                <LoadingOutlined style="font-size: 24px" />
              </template>
            </a-spin>
            <div class="loading-text">地图加载中...</div>
            <div v-if="mapStatus === 'error'" class="error-text">
              <p>地图加载失败，可能的原因：</p>
              <ul>
                <li>高德地图API密钥无效或过期</li>
                <li>网络连接问题</li>
                <li>API调用限制</li>
                <li>GitHub Pages环境限制</li>
              </ul>
              <p>请检查环境变量配置或联系管理员</p>
              <a-button type="primary" @click="retryLoadMap">重试加载</a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="right-panel">
        <a-card title="选中对象信息" size="small" v-if="selectedObject" class="info-card">
          <div class="object-info">
            <div class="object-header">
              <h4>{{ selectedObject.name || selectedObject.title }}</h4>
              <a-tag :color="getObjectStatusColor(selectedObject)" size="small">
                {{ getObjectStatusText(selectedObject) }}
              </a-tag>
            </div>
            <div class="info-content">
              <template v-if="selectedObject.type === 'camera'">
                <div class="info-row">
                  <span class="label">状态:</span>
                  <span :class="['status', selectedObject.status]">{{ selectedObject.statusText }}</span>
                </div>
                <div class="info-row">
                  <span class="label">IP地址:</span>
                  <span class="value">{{ selectedObject.ip }}</span>
                </div>
                <div class="info-row">
                  <span class="label">位置:</span>
                  <span class="value">{{ selectedObject.location }}</span>
                </div>
                <div class="info-row">
                  <span class="label">分辨率:</span>
                  <span class="value">{{ selectedObject.resolution }}</span>
                </div>
                <div class="info-row">
                  <span class="label">录像状态:</span>
                  <span :class="['status', selectedObject.recording ? 'online' : 'offline']">
                    {{ selectedObject.recording ? '录制中' : '未录制' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">PTZ控制:</span>
                  <span class="value">P:{{ selectedObject.ptz.pan }}° T:{{ selectedObject.ptz.tilt }}° Z:{{ selectedObject.ptz.zoom }}x</span>
                </div>
                <div class="info-row">
                  <span class="label">维护信息:</span>
                  <span class="value">上次:{{ selectedObject.lastMaintenance }} | 下次:{{ selectedObject.nextMaintenance }}</span>
                </div>
                <div v-if="selectedObject.status === 'offline' && selectedObject.offlineReason" class="info-row">
                  <span class="label">离线原因:</span>
                  <span class="value warning">{{ selectedObject.offlineReason }}</span>
                </div>
                
                <div class="action-buttons">
                  <a-button type="primary" size="small" @click="openCamera(selectedObject)" class="action-btn">
                    <template #icon><PlayCircleOutlined /></template>
                    打开视频
                  </a-button>
                  <a-button size="small" @click="controlPTZ(selectedObject)" class="action-btn">
                    <template #icon><AimOutlined /></template>
                    PTZ控制
                  </a-button>
                  <a-button size="small" @click="toggleRecording(selectedObject)" class="action-btn">
                    <template #icon><VideoCameraOutlined /></template>
                    {{ selectedObject.recording ? '停止录制' : '开始录制' }}
                  </a-button>
                </div>
              </template>
              
              <template v-else-if="selectedObject.type === 'ship'">
                <div class="info-row">
                  <span class="label">MMSI:</span>
                  <span class="value">{{ selectedObject.mmsi }}</span>
                </div>
                <div class="info-row">
                  <span class="label">船舶类型:</span>
                  <span class="value">{{ selectedObject.shipType }}</span>
                </div>
                <div class="info-row">
                  <span class="label">航速:</span>
                  <span class="value">{{ selectedObject.speed }}节</span>
                </div>
                <div class="info-row">
                  <span class="label">航向:</span>
                  <span class="value">{{ selectedObject.course }}°</span>
                </div>
                <div class="info-row">
                  <span class="label">目的地:</span>
                  <span class="value">{{ selectedObject.destination }}</span>
                </div>
                <div class="info-row">
                  <span class="label">预计到达:</span>
                  <span class="value">{{ selectedObject.eta }}</span>
                </div>
                <div class="info-row">
                  <span class="label">预计离港:</span>
                  <span class="value">{{ selectedObject.etd }}</span>
                </div>
                <div class="info-row">
                  <span class="label">货物:</span>
                  <span class="value">{{ selectedObject.cargo }}</span>
                </div>
                <div class="info-row">
                  <span class="label">船员数量:</span>
                  <span class="value">{{ selectedObject.crew }}人</span>
                </div>
                <div class="info-row">
                  <span class="label">最后更新:</span>
                  <span class="value">{{ selectedObject.lastUpdate }}</span>
                </div>
                <div v-if="selectedObject.status === 'warning' && selectedObject.warningReason" class="info-row">
                  <span class="label">警告原因:</span>
                  <span class="value warning">{{ selectedObject.warningReason }}</span>
                </div>
                
                <div class="action-buttons">
                  <a-button type="primary" size="small" @click="trackShip(selectedObject)" class="action-btn">
                    <template #icon><RadarChartOutlined /></template>
                    跟踪船舶
                  </a-button>
                  <a-button size="small" @click="showTrajectory(selectedObject)" class="action-btn">
                    <template #icon><AimOutlined /></template>
                    查看轨迹
                  </a-button>
                  <a-button size="small" @click="sendWarning(selectedObject)" class="action-btn">
                    <template #icon><WarningOutlined /></template>
                    发送警告
                  </a-button>
                </div>
              </template>
              
              <template v-else-if="selectedObject.type === 'weather'">
                <div class="info-row">
                  <span class="label">温度:</span>
                  <span class="value">{{ selectedObject.temperature }}°C</span>
                </div>
                <div class="info-row">
                  <span class="label">湿度:</span>
                  <span class="value">{{ selectedObject.humidity }}%</span>
                </div>
                <div class="info-row">
                  <span class="label">风速:</span>
                  <span class="value">{{ selectedObject.windSpeed }}m/s</span>
                </div>
                <div class="info-row">
                  <span class="label">风向:</span>
                  <span class="value">{{ selectedObject.windDirection }}°</span>
                </div>
                <div class="info-row">
                  <span class="label">能见度:</span>
                  <span class="value">{{ selectedObject.visibility }}km</span>
                </div>
                <div class="info-row">
                  <span class="label">气压:</span>
                  <span class="value">{{ selectedObject.pressure }}hPa</span>
                </div>
                <div class="info-row">
                  <span class="label">降雨量:</span>
                  <span class="value">{{ selectedObject.rainfall }}mm</span>
                </div>
                <div class="info-row">
                  <span class="label">紫外线指数:</span>
                  <span class="value">{{ selectedObject.uvIndex }}</span>
                </div>
                <div class="info-row">
                  <span class="label">空气质量:</span>
                  <span class="value">{{ selectedObject.airQuality }}</span>
                </div>
                <div class="info-row">
                  <span class="label">最后更新:</span>
                  <span class="value">{{ selectedObject.lastUpdate }}</span>
                </div>
                
                <div class="weather-alerts">
                  <div class="info-row">
                    <span class="label">监测提醒:</span>
                  </div>
                  <div class="alert-tags">
                    <a-tag v-for="alert in selectedObject.alerts" :key="alert" size="small" color="blue">
                      {{ alert }}
                    </a-tag>
                  </div>
                </div>
                
                <div class="weather-forecast">
                  <div class="info-row">
                    <span class="label">天气预报:</span>
                  </div>
                  <div class="forecast-list">
                    <div v-for="forecast in selectedObject.forecast" :key="forecast.time" class="forecast-item">
                      <span class="time">{{ forecast.time }}</span>
                      <span class="temp">{{ forecast.temp }}°C</span>
                      <span class="weather">{{ forecast.weather }}</span>
                      <span class="wind">{{ forecast.wind }}m/s</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </a-card>

        <a-card title="智能告警系统" size="small" class="info-card">
          <div class="alarm-header">
            <a-switch v-model:checked="alarmSystem.enabled" size="small" />
            <span class="alarm-status">{{ alarmSystem.enabled ? '已启用' : '已禁用' }}</span>
          </div>
          
          <div class="alarm-list">
            <div 
              v-for="alarm in alarms" 
              :key="alarm.id"
              class="alarm-item"
              :class="[alarm.level, alarm.status]"
              @click="selectAlarm(alarm)"
            >
              <div class="alarm-icon">
                <ExclamationCircleOutlined v-if="alarm.level === 'high'" />
                <WarningOutlined v-else-if="alarm.level === 'medium'" />
                <InfoCircleOutlined v-else />
              </div>
              <div class="alarm-content">
                <div class="alarm-title">{{ alarm.title }}</div>
                <div class="alarm-description">{{ alarm.description }}</div>
                                 <div class="alarm-meta">
                   <span class="alarm-time">{{ alarm.time }}</span>
                   <span class="alarm-device">{{ alarm.deviceName }}</span>
                   <a-tag :color="alarm.status === 'active' ? 'blue' : 'green'" size="small">
                     {{ alarm.status === 'active' ? '活跃' : '已解决' }}
                   </a-tag>
                 </div>
              </div>
            </div>
          </div>
          
          <div class="alarm-actions" v-if="selectedAlarm">
            <div class="action-title">建议操作:</div>
            <div class="action-buttons">
              <a-button 
                v-for="action in selectedAlarm.actions" 
                :key="action"
                size="small" 
                type="primary"
                @click="executeAction(selectedAlarm, action)"
              >
                {{ action }}
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- PTZ控制面板 -->
        <a-card title="PTZ控制" size="small" class="info-card" v-if="ptzControl.isActive">
          <div class="ptz-control-panel">
            <div class="ptz-info">
              <span class="label">当前摄像头:</span>
              <span class="value">{{ ptzControl.currentCamera?.name }}</span>
            </div>
            
            <div class="ptz-sliders">
              <div class="ptz-item">
                <span class="label">水平旋转 (Pan):</span>
                <a-slider
                  v-model:value="ptzControl.pan"
                  :min="-180"
                  :max="180"
                  :step="1"
                  @change="(value) => executePTZ('pan', value)"
                />
                <span class="value">{{ ptzControl.pan }}°</span>
              </div>
              
              <div class="ptz-item">
                <span class="label">垂直倾斜 (Tilt):</span>
                <a-slider
                  v-model:value="ptzControl.tilt"
                  :min="-90"
                  :max="90"
                  :step="1"
                  @change="(value) => executePTZ('tilt', value)"
                />
                <span class="value">{{ ptzControl.tilt }}°</span>
              </div>
              
              <div class="ptz-item">
                <span class="label">缩放 (Zoom):</span>
                <a-slider
                  v-model:value="ptzControl.zoom"
                  :min="1"
                  :max="10"
                  :step="0.1"
                  @change="(value) => executePTZ('zoom', value)"
                />
                <span class="value">{{ ptzControl.zoom }}x</span>
              </div>
            </div>
            
            <div class="ptz-actions">
              <a-button size="small" @click="ptzControl.isActive = false">关闭控制</a-button>
              <a-button size="small" type="primary" @click="executePTZ('reset', 0)">重置位置</a-button>
            </div>
          </div>
        </a-card>

        <!-- 视频播放器 -->
        <a-card title="视频监控" size="small" class="info-card" v-if="videoPlayer.isPlaying">
          <div class="video-player-panel">
            <div class="video-info">
              <span class="label">摄像头:</span>
              <span class="value">{{ videoPlayer.currentCamera?.name }}</span>
            </div>
            
            <div class="video-controls">
              <a-button-group>
                <a-button size="small" @click="videoPlayer.isPlaying = false">
                  <template #icon><PlayCircleOutlined /></template>
                  停止播放
                </a-button>
                <a-button size="small" @click="toggleRecording(videoPlayer.currentCamera)">
                  <template #icon><VideoCameraOutlined /></template>
                  {{ videoPlayer.recording ? '停止录制' : '开始录制' }}
                </a-button>
              </a-button-group>
            </div>
            
            <div class="video-quality">
              <span class="label">画质:</span>
              <a-select v-model:value="videoPlayer.quality" size="small" style="width: 80px">
                <a-select-option value="HD">HD</a-select-option>
                <a-select-option value="4K">4K</a-select-option>
              </a-select>
            </div>
            
            <div class="video-status">
              <a-tag :color="videoPlayer.recording ? 'red' : 'green'">
                {{ videoPlayer.recording ? '录制中' : '未录制' }}
              </a-tag>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  MinusOutlined, 
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  VideoCameraOutlined,
  CarOutlined,
  CloudOutlined,
  RadarChartOutlined,
  AimOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  PlayCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { mapConfig, validateConfig } from '@/config/map'

// 声明高德地图全局类型
declare global {
  interface Window {
    AMap: any
  }
  const AMap: any
}

/**
 * 全景视图组件
 * 显示真实地图、摄像头点位、船舶AIS位置、气象水文站等要素
 */

// 响应式数据
const mapContainer = ref<HTMLElement>()
const selectedObject = ref<any>(null)

// 选中的告警
const selectedAlarm = ref<any>(null)

// 实时数据更新定时器
let dataUpdateTimer: NodeJS.Timeout | null = null
let map: any = null
let markers: any[] = []

// 地图加载状态
const mapStatus = ref<'loading' | 'ready' | 'error'>('loading')

// 图层控制
const layerControl = reactive({
  cameras: true,
  ships: true,
  weather: true,
  radar: false
})

// 统计数据
const statistics = reactive({
  onlineCameras: 156,
  totalCameras: 180,
  onlineShips: 23,
  weather: '晴朗'
})

// 摄像头数据 - 使用真实坐标，增强功能（山东省济宁市济宁港和梁山港水域区域）
const cameras = ref([
  { 
    id: 1, 
    name: '济宁港码头1号', 
    lng: 116.5800, 
    lat: 35.3800, 
    status: 'online', 
    statusText: '在线', 
    ip: '192.168.1.101', 
    location: '济宁港主码头前沿', 
    resolution: '4K',
    ptz: { pan: 0, tilt: 0, zoom: 1 },
    recording: true,
    lastMaintenance: '2025-08-26',
    nextMaintenance: '2025-08-15',
    videoUrl: 'rtsp://192.168.1.101:554/stream1'
  },
  { 
    id: 2, 
    name: '京杭运河监控1号', 
    lng: 116.5750, 
    lat: 35.3850, 
    status: 'online', 
    statusText: '在线', 
    ip: '192.168.1.102', 
    location: '京杭大运河济宁段', 
    resolution: '4K',
    ptz: { pan: 45, tilt: 15, zoom: 1.2 },
    recording: true,
    lastMaintenance: '2025-08-20',
    nextMaintenance: '2025-08-20',
    videoUrl: 'rtsp://192.168.1.102:554/stream1'
  },
  { 
    id: 3, 
    name: '梁山港监控1号', 
    lng: 116.6500, 
    lat: 35.3500, 
    status: 'online', 
    statusText: '在线', 
    ip: '192.168.1.103', 
    location: '梁山港主码头', 
    resolution: '4K',
    ptz: { pan: 90, tilt: 0, zoom: 1 },
    recording: true,
    lastMaintenance: '2025-08-10',
    nextMaintenance: '2025-08-10',
    videoUrl: 'rtsp://192.168.1.103:554/stream1'
  },
  { 
    id: 4, 
    name: '济宁港监控2号', 
    lng: 116.5850, 
    lat: 35.3750, 
    status: 'online', 
    statusText: '在线', 
    ip: '192.168.1.104', 
    location: '济宁港集装箱码头', 
    resolution: '4K',
    ptz: { pan: 180, tilt: -10, zoom: 1.5 },
    recording: true,
    lastMaintenance: '2025-08-25',
    nextMaintenance: '2025-08-25',
    videoUrl: 'rtsp://192.168.1.104:554/stream1'
  }
])

// 船舶数据 - 使用真实坐标，增强功能（济宁港和梁山港水域航道）
const ships = ref([
  { 
    mmsi: '123456789', 
    name: '中交润杨001', 
    lng: 116.5780, 
    lat: 35.3780, 
    status: 'normal', 
    speed: 12, 
    course: 180, 
    destination: '济宁港',
    shipType: '集装箱船',
    length: 300,
    width: 45,
    draft: 15.5,
    eta: '2025-08-15 14:30',
    etd: '2025-08-16 08:00',
    cargo: '电子产品、机械设备',
    crew: 25,
    lastUpdate: '2025-08-14 10:15:30',
    trajectory: [
      { lng: 116.5760, lat: 35.3740, time: '2025-08-14 09:00:00' },
      { lng: 116.5770, lat: 35.3750, time: '2025-08-14 09:30:00' },
      { lng: 116.5780, lat: 35.3780, time: '2025-08-14 10:00:00' }
    ]
  },
  { 
    mmsi: '987654321', 
    name: '济宁物流002', 
    lng: 116.6520, 
    lat: 35.3480, 
    status: 'warning', 
    speed: 8, 
    course: 90, 
    destination: '梁山港',
    shipType: '散货船',
    length: 280,
    width: 42,
    draft: 14.8,
    eta: '2025-08-16 16:00',
    etd: '2025-08-17 10:00',
    cargo: '铁矿石、煤炭',
    crew: 22,
    lastUpdate: '2025-08-14 10:20:15',
    warningReason: '偏离航道',
    trajectory: [
      { lng: 116.6500, lat: 35.3460, time: '2025-08-14 09:15:00' },
      { lng: 116.6510, lat: 35.3470, time: '2025-08-14 09:45:00' },
      { lng: 116.6520, lat: 35.3480, time: '2025-08-14 10:15:00' }
    ]
  },
  { 
    mmsi: '456789123', 
    name: '济宁航运003', 
    lng: 116.5750, 
    lat: 35.3840, 
    status: 'normal', 
    speed: 15, 
    course: 270, 
    destination: '青岛港',
    shipType: '油轮',
    length: 320,
    width: 48,
    draft: 16.2,
    eta: '2025-08-18 12:00',
    etd: '2025-08-19 06:00',
    cargo: '原油',
    crew: 28,
    lastUpdate: '2025-08-14 10:25:45',
    trajectory: [
      { lng: 116.5770, lat: 35.3860, time: '2025-08-14 09:30:00' },
      { lng: 116.5760, lat: 35.3850, time: '2025-08-14 10:00:00' },
      { lng: 116.5750, lat: 35.3840, time: '2025-08-14 10:25:00' }
    ]
  }
])

// 气象站数据 - 使用真实坐标，增强功能（山东省济宁市济宁港和梁山港水域区域）
const weatherStations = ref([
  { 
    id: 1, 
    name: '济宁港气象站1', 
    lng: 116.5770, 
    lat: 35.3890, 
    temperature: 25, 
    humidity: 65, 
    windSpeed: 3.2, 
    visibility: 15,
    pressure: 1013.25,
    windDirection: 135,
    rainfall: 0,
    uvIndex: 6,
    airQuality: '优',
    lastUpdate: '2025-08-14 10:30:00',
    alerts: ['能见度良好', '风力适中'],
    forecast: [
      { time: '12:00', temp: 26, weather: '晴', wind: 3.5 },
      { time: '15:00', temp: 27, weather: '晴', wind: 4.0 },
      { time: '18:00', temp: 24, weather: '多云', wind: 3.0 }
    ]
  },
  { 
    id: 2, 
    name: '梁山港气象站1', 
    lng: 116.6570, 
    lat: 35.3550, 
    temperature: 24, 
    humidity: 68, 
    windSpeed: 2.8, 
    visibility: 18,
    pressure: 1012.80,
    windDirection: 120,
    rainfall: 0,
    uvIndex: 5,
    airQuality: '良',
    lastUpdate: '2025-08-14 10:32:00',
    alerts: ['温度适宜', '湿度正常'],
    forecast: [
      { time: '12:00', temp: 25, weather: '晴', wind: 3.0 },
      { time: '15:00', temp: 26, weather: '晴', wind: 3.5 },
      { time: '18:00', temp: 23, weather: '多云', wind: 2.8 }
    ]
  }
])

// 智能预警系统
const alarmSystem = reactive({
  enabled: true,
  rules: [
    { id: 1, name: '摄像头离线检测', type: 'camera', condition: 'offline', level: 'high', enabled: true },
    { id: 2, name: '船舶偏离航道', type: 'ship', condition: 'course_deviation', level: 'medium', enabled: true },
    { id: 3, name: '能见度预警', type: 'weather', condition: 'visibility_low', level: 'low', enabled: true },
    { id: 4, name: '船舶碰撞预警', type: 'ship', condition: 'collision_risk', level: 'high', enabled: true },
    { id: 5, name: '恶劣天气预警', type: 'weather', condition: 'storm_warning', level: 'medium', enabled: true }
  ]
})

// 雷达覆盖数据
const radarCoverage = ref([
  {
    id: 1,
    name: '济宁港雷达站',
    lng: 116.5800,
    lat: 35.3800,
    range: 5000, // 5公里覆盖半径
    frequency: 'X波段',
    status: 'online'
  },
  {
    id: 2,
    name: '梁山港雷达站',
    lng: 116.6500,
    lat: 35.3500,
    range: 4000, // 4公里覆盖半径
    frequency: 'S波段',
    status: 'online'
  }
])

// 航道边界数据
const channelBoundaries = ref([
  {
    id: 1,
    name: '济宁港主航道',
    points: [
      [116.5750, 35.3750],
      [116.5850, 35.3850],
      [116.5900, 35.3900]
    ],
    width: 200, // 航道宽度（米）
    depth: 15,  // 航道深度（米）
    status: 'active'
  },
  {
    id: 2,
    name: '梁山港航道',
    points: [
      [116.6450, 35.3450],
      [116.6550, 35.3550],
      [116.6600, 35.3600]
    ],
    width: 180,
    depth: 12,
    status: 'active'
  }
])

// 碰撞检测系统
const collisionDetection = reactive({
  enabled: true,
  safeDistance: 500, // 安全距离（米）
  warningDistance: 1000, // 警告距离（米）
  checkInterval: 5000 // 检测间隔（毫秒）
})

// 视频播放状态
const videoPlayer = reactive({
  isPlaying: false,
  currentCamera: null,
  quality: 'HD', // HD, 4K
  recording: false
})

// PTZ控制状态
const ptzControl = reactive({
  isActive: false,
  currentCamera: null,
  pan: 0,
  tilt: 0,
  zoom: 1
})

// 告警数据 - 增强功能
const alarms = ref([
  { 
    id: 1, 
    level: 'high', 
    title: '摄像头离线告警', 
    time: '10:30:15',
    type: 'camera',
    deviceId: 3,
    deviceName: '梁山港监控1号',
    description: '网络连接异常，已持续15分钟',
    status: 'active',
    actions: ['重启设备', '检查网络', '联系维护人员']
  },
  { 
    id: 2, 
    level: 'medium', 
    title: '船舶偏离航道', 
    time: '10:25:42',
    type: 'ship',
    deviceId: '987654321',
    deviceName: '济宁物流002',
    description: '船舶偏离主航道，距离航道中心线150米',
    status: 'active',
    actions: ['发送警告信息', '记录轨迹', '通知海事部门']
  },
  { 
    id: 3, 
    level: 'low', 
    title: '能见度降低', 
    time: '10:20:18',
    type: 'weather',
    deviceId: 1,
    deviceName: '济宁港气象站1',
    description: '能见度降至15公里，建议船舶减速航行',
    status: 'resolved',
    actions: ['发布航行警告', '调整航速限制']
  },
  { 
    id: 4, 
    level: 'high', 
    title: '船舶碰撞风险预警', 
    time: '10:35:20',
    type: 'ship',
    deviceId: '123456789',
    deviceName: '中交润杨001',
    description: '与济宁物流002距离过近，存在碰撞风险',
    status: 'active',
    actions: ['紧急避让', '发送碰撞警告', '记录事件']
  }
])

// 初始化地图
const initMap = () => {
  // 检查是否已加载高德地图API
  if (typeof AMap === 'undefined') {
    console.error('高德地图API未加载')
    mapStatus.value = 'error'
    return
  }

  try {
    // 创建地图实例
    map = new AMap.Map('amap-container', {
      zoom: mapConfig.amap.defaultZoom,
      center: mapConfig.amap.defaultCenter,
      mapStyle: mapConfig.amap.mapStyle,
      features: mapConfig.amap.features,
      viewMode: mapConfig.amap.viewMode
    })

    // 添加地图控件（添加可用性检查）
    try {
      if (typeof AMap.Scale === 'function') {
        map.addControl(new AMap.Scale())
        console.log('比例尺控件添加成功')
      } else {
        console.warn('比例尺控件不可用，跳过')
      }
    } catch (error) {
      console.warn('添加比例尺控件失败:', error)
    }

    try {
      if (typeof AMap.ToolBar === 'function') {
        map.addControl(new AMap.ToolBar())
        console.log('工具栏控件添加成功')
      } else {
        console.warn('工具栏控件不可用，跳过')
      }
    } catch (error) {
      console.warn('添加工具栏控件失败:', error)
    }

    try {
      if (typeof AMap.MapType === 'function') {
        map.addControl(new AMap.MapType())
        console.log('地图类型控件添加成功')
      } else {
        console.warn('地图类型控件不可用，跳过')
      }
    } catch (error) {
      console.warn('添加地图类型控件失败:', error)
    }

    // 初始化标记点
    initMarkers()
    
    // 初始化航道边界
    initChannelBoundaries()
    
    // 初始化雷达覆盖
    initRadarCoverage()
    
    // 启动碰撞检测
    startCollisionDetection()
    
    mapStatus.value = 'ready'
    console.log('地图初始化成功')
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapStatus.value = 'error'
  }
}

// 初始化标记点
const initMarkers = () => {
  if (!map) return

  // 清除现有标记
  markers.forEach(marker => map.remove(marker))
  markers = []

  // 添加摄像头标记
  if (layerControl.cameras) {
    cameras.value.forEach(camera => {
      const marker = new AMap.Marker({
        position: [camera.lng, camera.lat],
        title: camera.name,
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="white" stroke="#1890ff" stroke-width="2"/>
              <path d="M12 12h8v8h-8z" fill="#1890ff"/>
              <circle cx="16" cy="16" r="3" fill="#1890ff"/>
            </svg>
          `)
        })
      })

      marker.on('click', () => selectCamera(camera))
      map.add(marker)
      markers.push(marker)
    })
  }

  // 添加船舶标记
  if (layerControl.ships) {
    ships.value.forEach(ship => {
      const marker = new AMap.Marker({
        position: [ship.lng, ship.lat],
        title: ship.name,
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4l-4 8h8l-4-8z" fill="#52c41a"/>
              <rect x="12" y="12" width="8" height="8" fill="#52c41a"/>
            </svg>
          `)
        })
      })

      marker.on('click', () => selectShip(ship))
      map.add(marker)
      markers.push(marker)
    })
  }

  // 添加气象站标记
  if (layerControl.weather) {
    weatherStations.value.forEach(station => {
      const marker = new AMap.Marker({
        position: [station.lng, station.lat],
        title: station.name,
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="white" stroke="#1890ff" stroke-width="2"/>
              <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#1890ff"/>
            </svg>
          `)
        })
      })

      marker.on('click', () => selectWeatherStation(station))
      map.add(marker)
      markers.push(marker)
    })
  }
}

// 方法
const toggleLayer = (layer: string) => {
  console.log(`切换图层: ${layer}`)
  
  if (layer === 'radar') {
    // 切换雷达覆盖显示
    if (layerControl.radar) {
      initRadarCoverage()
    } else {
      clearRadarCoverage()
    }
  } else {
    // 重新初始化标记点
    initMarkers()
  }
}

// 初始化航道边界
const initChannelBoundaries = () => {
  if (!map) return
  
  channelBoundaries.value.forEach(channel => {
    // 创建航道边界多边形
    const polygon = new AMap.Polygon({
      path: channel.points,
      strokeColor: '#1890ff',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: '#1890ff',
      fillOpacity: 0.1,
      strokeStyle: 'dashed'
    })
    
    // 添加航道标签
    const label = new AMap.Text({
      text: channel.name,
      position: channel.points[1],
      style: {
        color: '#1890ff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    })
    
    map.add(polygon)
    map.add(label)
  })
}

// 初始化雷达覆盖
const initRadarCoverage = () => {
  if (!map || !layerControl.radar) return
  
  radarCoverage.value.forEach(radar => {
    // 创建雷达覆盖圆形
    const circle = new AMap.Circle({
      center: [radar.lng, radar.lat],
      radius: radar.range,
      strokeColor: '#52c41a',
      strokeWeight: 1,
      strokeOpacity: 0.6,
      fillColor: '#52c41a',
      fillOpacity: 0.1
    })
    
    // 添加雷达站标记
    const marker = new AMap.Marker({
      position: [radar.lng, radar.lat],
      title: radar.name,
      icon: new AMap.Icon({
        size: new AMap.Size(24, 24),
        image: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" stroke="#52c41a" stroke-width="2"/>
            <path d="M12 2l3 9h-6l3-9z" fill="#52c41a"/>
            <circle cx="12" cy="12" r="3" fill="#52c41a"/>
          </svg>
        `)
      })
    })
    
    map.add(circle)
    map.add(marker)
  })
}

// 清除雷达覆盖
const clearRadarCoverage = () => {
  // 这里可以实现清除雷达覆盖的逻辑
  console.log('清除雷达覆盖')
}

// 启动碰撞检测
const startCollisionDetection = () => {
  if (!collisionDetection.enabled) return
  
  setInterval(() => {
    checkShipCollisions()
  }, collisionDetection.checkInterval)
}

// 检查船舶碰撞风险
const checkShipCollisions = () => {
  const shipCount = ships.value.length
  
  for (let i = 0; i < shipCount; i++) {
    for (let j = i + 1; j < shipCount; j++) {
      const ship1 = ships.value[i]
      const ship2 = ships.value[j]
      
      // 计算两船之间的距离
      const distance = calculateDistance(ship1.lng, ship1.lat, ship2.lng, ship2.lat)
      
      if (distance < collisionDetection.safeDistance) {
        // 高风险碰撞
        createCollisionAlarm(ship1, ship2, 'high', distance)
      } else if (distance < collisionDetection.warningDistance) {
        // 中风险碰撞
        createCollisionAlarm(ship1, ship2, 'medium', distance)
      }
    }
  }
}

// 计算两点间距离（米）
const calculateDistance = (lng1: number, lat1: number, lng2: number, lat2: number) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 碰撞预警状态管理
const collisionWarningState = reactive({
  lastWarningTime: 0,
  warningInterval: 20000 // 20秒间隔
})

// 创建碰撞告警
const createCollisionAlarm = (ship1: any, ship2: any, level: string, distance: number) => {
  // 检查是否已经存在相同的告警，避免重复弹窗
  const existingAlarm = alarms.value.find(alarm => 
    alarm.deviceId === `${ship1.mmsi}-${ship2.mmsi}` && 
    alarm.status === 'active'
  )
  
  if (existingAlarm) {
    // 如果告警已存在，只更新描述，不弹窗
    existingAlarm.description = `两船距离${Math.round(distance)}米，存在碰撞风险`
    existingAlarm.time = new Date().toLocaleTimeString()
    return
  }
  
  const alarm = {
    id: Date.now(),
    level,
    title: '船舶碰撞风险预警',
    time: new Date().toLocaleTimeString(),
    type: 'ship',
    deviceId: `${ship1.mmsi}-${ship2.mmsi}`,
    deviceName: `${ship1.name} 与 ${ship2.name}`,
    description: `两船距离${Math.round(distance)}米，存在碰撞风险`,
    status: 'active',
    actions: ['紧急避让', '发送碰撞警告', '记录事件']
  }
  
  // 添加到告警列表
  alarms.value.unshift(alarm)
  
  // 检查是否到了可以弹窗的时间（20秒间隔）
  const now = Date.now()
  if (level === 'high' && now - collisionWarningState.lastWarningTime >= collisionWarningState.warningInterval) {
    message.error(`高风险碰撞预警：${ship1.name} 与 ${ship2.name}`)
    collisionWarningState.lastWarningTime = now
  }
  // 中风险不弹窗，只在告警列表中显示
}

const centerMap = () => {
  if (map) {
    map.setCenter(mapConfig.amap.defaultCenter)
    map.setZoom(mapConfig.amap.defaultZoom)
  }
}

const resetZoom = () => {
  if (map) {
    map.setZoom(mapConfig.amap.defaultZoom)
  }
}

const toggleFullscreen = () => {
  if (map) {
    map.setFitView()
  }
}

const zoomIn = () => {
  if (map) {
    map.zoomIn()
  }
}

const zoomOut = () => {
  if (map) {
    map.zoomOut()
  }
}

const selectCamera = (camera: any) => {
  selectedObject.value = { ...camera, type: 'camera' }
  // 地图居中到选中的摄像头
  if (map) {
    map.setCenter([camera.lng, camera.lat])
    map.setZoom(18)
  }
}

const selectShip = (ship: any) => {
  selectedObject.value = { ...ship, type: 'ship' }
  // 地图居中到选中的船舶
  if (map) {
    map.setCenter([ship.lng, ship.lat])
    map.setZoom(17)
  }
}

const selectWeatherStation = (station: any) => {
  selectedObject.value = { ...station, type: 'weather' }
  // 地图居中到选中的气象站
  if (map) {
    map.setCenter([station.lng, station.lat])
    map.setZoom(17)
  }
}

const trackShip = (ship: any) => {
  console.log('跟踪船舶:', ship.name)
  // 这里可以实现船舶跟踪逻辑
  // 静默开始跟踪，不弹窗提示
}

const showTrajectory = (ship: any) => {
  console.log('显示船舶轨迹:', ship.name)
  
  if (!map) return
  
  // 清除之前的轨迹
  clearShipTrajectory()
  
  // 创建轨迹线
  const path = ship.trajectory.map(point => [point.lng, point.lat])
  const polyline = new AMap.Polyline({
    path,
    strokeColor: '#1890ff',
    strokeWeight: 3,
    strokeOpacity: 0.8,
    strokeStyle: 'solid'
  })
  
  // 添加轨迹点标记
ship.trajectory.forEach((point: any, index: number) => {
  const marker = new AMap.Marker({
    position: [point.lng, point.lat],
    title: `${ship.name} - ${point.time}`,
    icon: new AMap.Icon({
      size: new AMap.Size(16, 16),
      image: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6" fill="#1890ff" stroke="white" stroke-width="2"/>
          <text x="8" y="10" text-anchor="middle" fill="white" font-size="8">${index + 1}</text>
        </svg>
      `)
    })
  })
  
  map.add(marker)
})
  
  map.add(polyline)
  
  // 调整视图以显示完整轨迹
  map.setFitView([polyline])
  
  // 静默显示轨迹，不弹窗提示
}

// 清除船舶轨迹
const clearShipTrajectory = () => {
  // 这里可以实现清除轨迹的逻辑
  console.log('清除船舶轨迹')
}

// 打开摄像头视频
const openCamera = (camera: any) => {
  console.log('打开摄像头:', camera.name)
  
  videoPlayer.currentCamera = camera
  videoPlayer.isPlaying = true
  
  // 静默打开，不弹窗提示，减少打扰
  // 这里可以集成真实的视频播放器
  // 例如：WebRTC、HLS、RTMP等协议
}

// PTZ控制
const controlPTZ = (camera: any) => {
  console.log('PTZ控制:', camera.name)
  
  ptzControl.isActive = true
  ptzControl.currentCamera = camera
  ptzControl.pan = camera.ptz.pan
  ptzControl.tilt = camera.ptz.tilt
  ptzControl.zoom = camera.ptz.zoom
  
  // 静默打开PTZ控制面板，不弹窗提示
}

// 执行PTZ操作
const executePTZ = (operation: string, value: number) => {
  if (!ptzControl.currentCamera) return
  
  const camera = ptzControl.currentCamera as any
  
  switch (operation) {
    case 'pan':
      camera.ptz.pan = value
      ptzControl.pan = value
      break
    case 'tilt':
      camera.ptz.tilt = value
      ptzControl.tilt = value
      break
    case 'zoom':
      camera.ptz.zoom = value
      ptzControl.zoom = value
      break
  }
  
  // 静默执行PTZ操作，不弹窗提示，减少打扰
  // 这里可以发送PTZ控制指令到摄像头
}

// 切换录制状态
const toggleRecording = (camera: any) => {
  console.log('切换录制状态:', camera.name)
  camera.recording = !camera.recording
  
  if (camera.recording) {
    videoPlayer.recording = true
    // 静默开始录制，不弹窗提示
  } else {
    videoPlayer.recording = false
    // 静默停止录制，不弹窗提示
  }
}

// 警告发送状态管理
const warningState = reactive({
  lastWarningTime: 0,
  warningInterval: 20000 // 20秒间隔
})

const sendWarning = (ship: any) => {
  console.log('发送警告:', ship.name)
  
  const now = Date.now()
  
  // 检查是否到了可以弹窗的时间
  if (now - warningState.lastWarningTime >= warningState.warningInterval) {
    // 显示警告弹窗
    message.warning(`已向船舶 ${ship.name} 发送警告信息`)
    warningState.lastWarningTime = now
  }
  
  // 这里可以实现警告发送逻辑
}

const selectAlarm = (alarm: any) => {
  selectedAlarm.value = alarm
  console.log('选中告警:', alarm.title)
}

const executeAction = (alarm: any, action: string) => {
  console.log('执行操作:', action, '告警:', alarm.title)
  // 静默执行操作，不弹窗提示，减少打扰
  // 这里可以实现具体的操作逻辑
}

// 实时数据更新
const startDataUpdate = () => {
  dataUpdateTimer = setInterval(() => {
    // 模拟实时数据更新
    updateShipPositions()
    updateWeatherData()
    updateCameraStatus()
  }, 30000) // 每30秒更新一次
}

const updateShipPositions = () => {
  // 模拟船舶位置更新
  ships.value.forEach(ship => {
    // 添加随机偏移模拟船舶移动（减小偏移量，避免偏离太远）
    ship.lng += (Math.random() - 0.5) * 0.0001
    ship.lat += (Math.random() - 0.5) * 0.0001
    ship.lastUpdate = new Date().toLocaleString()
  })
}

const updateWeatherData = () => {
  // 模拟气象数据更新
  weatherStations.value.forEach(station => {
    station.temperature += (Math.random() - 0.5) * 2
    station.humidity += (Math.random() - 0.5) * 5
    station.lastUpdate = new Date().toLocaleString()
  })
}

const updateCameraStatus = () => {
  // 模拟摄像头状态更新
  cameras.value.forEach(camera => {
    if (camera.status === 'offline' && Math.random() > 0.8) {
      camera.status = 'online'
      camera.statusText = '在线'
      camera.offlineReason = undefined
    }
  })
}

// 获取对象状态颜色
const getObjectStatusColor = (obj: any) => {
  if (obj.type === 'camera') {
    return obj.status === 'online' ? 'success' : 'error'
  } else if (obj.type === 'ship') {
    return obj.status === 'normal' ? 'success' : 'warning'
  } else if (obj.type === 'weather') {
    return 'processing'
  }
  return 'default'
}

// 获取对象状态文本
const getObjectStatusText = (obj: any) => {
  if (obj.type === 'camera') {
    return obj.status === 'online' ? '在线' : '离线'
  } else if (obj.type === 'ship') {
    return obj.status === 'normal' ? '正常' : '警告'
  } else if (obj.type === 'weather') {
    return '正常'
  }
  return '未知'
}

// 加载高德地图API
const loadAMapAPI = () => {
  return new Promise((resolve, reject) => {
    if (typeof AMap !== 'undefined') {
      resolve(AMap)
      return
    }

    const script = document.createElement('script')
    // 修复插件名称，使用正确的插件标识符
    script.src = `https://webapi.amap.com/maps?v=${mapConfig.amap.version}&key=${mapConfig.amap.apiKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.MapType`
    script.onload = () => {
      // 添加延迟确保插件完全加载
      setTimeout(() => {
        console.log('高德地图API加载完成，AMap对象:', AMap)
        if (AMap && typeof AMap === 'object') {
          console.log('可用插件:', Object.keys(AMap).filter(key => key.includes('Scale') || key.includes('ToolBar') || key.includes('MapType')))
        }
        resolve(AMap)
      }, 1000)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 生命周期
onMounted(async () => {
  console.log('全景视图组件已挂载')
  console.log('地图配置:', mapConfig)
  
  // 验证配置
  const configValidation = validateConfig()
  if (!configValidation.isValid) {
    console.warn('地图配置警告:', configValidation.errors)
    // 可以在这里显示配置警告提示
  }
  
  try {
    console.log('开始加载高德地图API...')
    await loadAMapAPI()
    console.log('高德地图API加载成功')
    
    console.log('开始初始化地图...')
    initMap()
    console.log('地图初始化完成')
    
    // 启动实时数据更新
    startDataUpdate()
  } catch (error) {
    console.error('加载地图失败:', error)
    mapStatus.value = 'error'
  }
})

onUnmounted(() => {
  console.log('全景视图组件已卸载')
  
  // 清理定时器
  if (dataUpdateTimer) {
    clearInterval(dataUpdateTimer)
    dataUpdateTimer = null
  }
  
  if (map) {
    map.destroy()
  }
})

// 重试加载地图
const retryLoadMap = async () => {
  mapStatus.value = 'loading'
  try {
    await loadAMapAPI()
    initMap()
    mapStatus.value = 'ready'
  } catch (error) {
    console.error('重试加载地图失败:', error)
    mapStatus.value = 'error'
  }
}
</script>

<style lang="less" scoped>
.panoramic-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: 16px;
    
    h2 {
      margin: 0 0 8px 0;
      color: @text-color;
    }
    
    p {
      margin: 0 0 16px 0;
      color: @text-color-secondary;
      font-size: @font-size-sm;
    }
    
    .map-status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    gap: 16px;
    min-height: 0;

    .left-toolbar {
      width: 250px;
      flex-shrink: 0;

      .toolbar-card {
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .ant-card-head {
          background: linear-gradient(135deg, #1890ff, #096dd9);
          color: white;
          border-radius: 8px 8px 0 0;
        }
      }

      .action-btn {
        width: 100%;
        height: 36px;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
      }
    }

    .main-map {
      flex: 1;
      min-height: 0;

      .map-container {
        height: 100%;
        position: relative;
        border-radius: @border-radius-base;
        overflow: hidden;

        .amap-container {
          width: 100%;
          height: 100%;
        }

        
      }
    }

    .right-panel {
      width: 300px;
      flex-shrink: 0;

      .info-card {
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .ant-card-head {
          background: linear-gradient(135deg, #52c41a, #389e0d);
          color: white;
          border-radius: 8px 8px 0 0;
        }
      }
    }
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .label {
      color: @text-color-secondary;
    }

    .value {
      font-weight: 500;
      color: @text-color;

      &.success {
        color: #52c41a;
      }

      &.warning {
        color: #faad14;
      }

      &.info {
        color: #1890ff;
      }
    }
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 4px 0;

    .label {
      color: @text-color-secondary;
      font-size: @font-size-sm;
    }

    .value {
      font-weight: 500;
      color: @text-color;
    }

    .status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;

      &.online {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }

      &.offline {
        background: #fff2f0;
        color: #ff4d4f;
        border: 1px solid #ffccc7;
      }

      &.normal {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }

      &.warning {
        background: #fffbe6;
        color: #faad14;
        border: 1px solid #ffe58f;
      }
    }
  }

  .object-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      color: @text-color;
    }
  }

  .object-info {
    .info-content {
      p {
        margin-bottom: 8px;
        font-size: @font-size-sm;

        strong {
          color: @text-color;
        }
      }

      .ant-btn {
        margin-top: 8px;
      }

      .action-btn {
        width: 100%;
        height: 32px;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
      }
    }
  }

  .alarm-list {
    .alarm-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid @border-color-split;

      &:last-child {
        border-bottom: none;
      }

      .alarm-icon {
        margin-right: 8px;
        font-size: 16px;

        &.high {
          color: @monitor-error;
        }

        &.medium {
          color: @monitor-warning;
        }

        &.low {
          color: @monitor-normal;
        }
      }

      .alarm-content {
        flex: 1;

        .alarm-title {
          font-size: @font-size-sm;
          color: @text-color;
          margin-bottom: 2px;
        }

        .alarm-time {
          font-size: 10px;
          color: @text-color-secondary;
        }
      }

      &.high .alarm-icon {
        color: @monitor-error;
      }

      &.medium .alarm-icon {
        color: @monitor-warning;
      }

      &.low .alarm-icon {
        color: @monitor-normal;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }
  
  .weather-alerts {
    margin-top: 16px;
    
    .alert-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
  }
  
  .weather-forecast {
    margin-top: 16px;
    
    .forecast-list {
      margin-top: 8px;
    }
    
    .forecast-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .time { color: #666; font-size: 12px; }
      .temp { color: #1890ff; font-weight: bold; }
      .weather { color: #333; }
      .wind { color: #666; font-size: 12px; }
    }
  }
  
  .alarm-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    
    .alarm-status {
      font-size: 12px;
      color: #666;
    }
  }
  
  .alarm-item {
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
         &.active {
       border-left: 3px solid #1890ff;
     }
    
    &.resolved {
      opacity: 0.7;
    }
  }
  
  .alarm-description {
    font-size: 12px;
    color: #666;
    margin: 4px 0;
  }
  
  .alarm-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #999;
    
    .alarm-device {
      color: #1890ff;
    }
  }
  
  .alarm-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    
    .action-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  // PTZ控制面板样式
  .ptz-control-panel {
    .ptz-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      
      .label {
        color: @text-color-secondary;
        font-size: @font-size-sm;
      }
      
      .value {
        font-weight: 500;
        color: @text-color;
      }
    }
    
    .ptz-sliders {
      .ptz-item {
        margin-bottom: 16px;
        
        .label {
          display: block;
          margin-bottom: 8px;
          color: @text-color-secondary;
          font-size: @font-size-sm;
        }
        
        .value {
          margin-left: 8px;
          font-weight: 500;
          color: @text-color;
        }
      }
    }
    
    .ptz-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
  }
  
  // 视频播放器样式
  .video-player-panel {
    .video-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      
      .label {
        color: @text-color-secondary;
        font-size: @font-size-sm;
      }
      
      .value {
        font-weight: 500;
        color: @text-color;
      }
    }
    
    .video-controls {
      margin-bottom: 16px;
    }
    
    .video-quality {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      
      .label {
        color: @text-color-secondary;
        font-size: @font-size-sm;
      }
    }
    
    .video-status {
      text-align: center;
    }
  }

  .map-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .loading-text {
      margin-top: 10px;
      font-size: 16px;
      color: @text-color;
    }

    .error-text {
      margin-top: 10px;
      font-size: 14px;
      color: @text-color-secondary;
      padding: 10px;
      background-color: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 4px;
      text-align: left;

      p {
        margin-bottom: 5px;
        font-weight: bold;
      }

      ul {
        padding-left: 20px;
        margin-bottom: 5px;
      }

      li {
        list-style: disc;
        margin-bottom: 3px;
      }
    }
  }
}
</style>

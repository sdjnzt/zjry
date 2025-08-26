<template>
  <div class="full-process-traceability">
    <div class="page-header">
      <h2>全过程回溯</h2>
      <p>同步回放视频、轨迹、录音等，支持时间轴控制和多源数据同步</p>
    </div>

    <!-- 事件选择区域 -->
    <div class="event-selection">
      <a-card title="事件选择" class="selection-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="事件编号">
              <a-input-search
                v-model:value="selectedEventId"
                placeholder="请输入事件编号"
                enter-button
                @search="loadEventData"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="事件类型">
              <a-select
                v-model:value="selectedEventType"
                placeholder="请选择事件类型"
                :options="eventTypeOptions"
                @change="filterEvents"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="时间范围">
              <a-range-picker
                v-model:value="timeRange"
                :show-time="true"
                format="YYYY-MM-DD HH:mm:ss"
                @change="filterEvents"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row>
          <a-col :span="24">
            <a-table
              :columns="eventColumns"
              :data-source="eventList"
              :pagination="{ pageSize: 5 }"
              size="small"
              @row-click="selectEvent"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button size="small" type="primary" @click="startPlayback(record)">
                    开始回溯
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 回溯播放区域 -->
    <div class="playback-area" v-if="currentEvent">
      <a-card title="回溯播放" class="playback-card">
        <template #extra>
          <a-space>
            <a-button @click="togglePlayback">
              <PlayCircleOutlined v-if="!isPlaying" />
              <PauseCircleOutlined v-else />
              {{ isPlaying ? '暂停' : '播放' }}
            </a-button>
            <a-button @click="stopPlayback">
              <StopOutlined />
              停止
            </a-button>
            <a-button @click="resetPlayback">
              <ReloadOutlined />
              重置
            </a-button>
            <a-button @click="exportPlayback">
              <DownloadOutlined />
              导出
            </a-button>
          </a-space>
        </template>

        <!-- 时间轴控制 -->
        <div class="timeline-control">
          <div class="timeline-header">
            <span>时间轴控制</span>
            <span class="current-time">{{ currentTime }}</span>
          </div>
          <a-slider
            v-model:value="timelineValue"
            :min="0"
            :max="totalDuration"
            :step="1"
            :tooltip-formatter="formatTime"
            @change="seekToTime"
          />
          <div class="timeline-info">
            <span>开始时间: {{ formatTime(startTime) }}</span>
            <span>结束时间: {{ formatTime(endTime) }}</span>
            <span>总时长: {{ formatTime(totalDuration) }}</span>
          </div>
        </div>

        <!-- 多源数据同步显示 -->
        <div class="multi-source-display">
          <a-row :gutter="16">
            <!-- 视频回放 -->
            <a-col :span="12">
              <a-card title="视频回放" size="small">
                <div class="video-player">
                  <div class="video-placeholder">
                    <VideoCameraOutlined style="font-size: 48px; color: #1890ff;" />
                    <p>视频播放器</p>
                    <p>当前时间: {{ currentTime }}</p>
                    <p>事件: {{ currentEvent?.id }}</p>
                  </div>
                  <div class="video-controls">
                    <a-space>
                      <a-button size="small" @click="toggleVideo">
                        {{ videoEnabled ? '关闭视频' : '开启视频' }}
                      </a-button>
                      <a-button size="small" @click="toggleAudio">
                        {{ audioEnabled ? '关闭音频' : '开启音频' }}
                      </a-button>
                      <a-button size="small" @click="fullscreenVideo">
                        全屏
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </a-card>
            </a-col>

            <!-- 轨迹回放 -->
            <a-col :span="12">
              <a-card title="轨迹回放" size="small">
                <div class="trajectory-player">
                  <div class="trajectory-placeholder">
                    <CompassOutlined style="font-size: 48px; color: #52c41a;" />
                    <p>轨迹播放器</p>
                    <p>当前位置: {{ currentPosition }}</p>
                    <p>航向: {{ currentHeading }}°</p>
                    <p>速度: {{ currentSpeed }} 节</p>
                  </div>
                  <div class="trajectory-controls">
                    <a-space>
                      <a-button size="small" @click="toggleTrajectory">
                        {{ trajectoryEnabled ? '关闭轨迹' : '开启轨迹' }}
                      </a-button>
                      <a-button size="small" @click="showTrajectoryMap">
                        地图显示
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>

          <!-- 音频回放 -->
          <a-row :gutter="16" style="margin-top: 16px;">
            <a-col :span="24">
              <a-card title="音频回放" size="small">
                <div class="audio-player">
                  <div class="audio-visualization">
                    <div class="audio-wave">
                      <div 
                        v-for="i in 20" 
                        :key="i" 
                        class="wave-bar"
                        :style="{ height: Math.random() * 50 + 10 + 'px' }"
                      ></div>
                    </div>
                  </div>
                  <div class="audio-controls">
                    <a-space>
                      <a-button size="small" @click="toggleAudio">
                        {{ audioEnabled ? '静音' : '取消静音' }}
                      </a-button>
                      <a-slider
                        v-model:value="audioVolume"
                        :min="0"
                        :max="100"
                        style="width: 100px"
                        @change="setAudioVolume"
                      />
                      <span>音量: {{ audioVolume }}%</span>
                    </a-space>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <!-- 传感器数据显示 -->
        <div class="sensor-data-display">
          <a-card title="传感器数据" size="small">
            <a-row :gutter="16">
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">气温:</span>
                  <span class="sensor-value">{{ sensorData.temperature }}°C</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">湿度:</span>
                  <span class="sensor-value">{{ sensorData.humidity }}%</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">气压:</span>
                  <span class="sensor-value">{{ sensorData.pressure }}hPa</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">风速:</span>
                  <span class="sensor-value">{{ sensorData.windSpeed }}m/s</span>
                </div>
              </a-col>
            </a-row>
            
            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">风向:</span>
                  <span class="sensor-value">{{ sensorData.windDirection }}°</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">能见度:</span>
                  <span class="sensor-value">{{ sensorData.visibility }}m</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">浪高:</span>
                  <span class="sensor-value">{{ sensorData.waveHeight }}m</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">水流速度:</span>
                  <span class="sensor-value">{{ sensorData.currentSpeed }}m/s</span>
                </div>
              </a-col>
            </a-row>
            
            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">水流方向:</span>
                  <span class="sensor-value">{{ sensorData.currentDirection }}°</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">水深:</span>
                  <span class="sensor-value">{{ sensorData.waterDepth }}m</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">水温:</span>
                  <span class="sensor-value">{{ sensorData.waterTemperature }}°C</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">盐度:</span>
                  <span class="sensor-value">{{ sensorData.salinity }}‰</span>
                </div>
              </a-col>
            </a-row>
            
            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">溶解氧:</span>
                  <span class="sensor-value">{{ sensorData.dissolvedOxygen }}mg/L</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">pH值:</span>
                  <span class="sensor-value">{{ sensorData.pH }}</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">浊度:</span>
                  <span class="sensor-value">{{ sensorData.turbidity }}NTU</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">更新时间:</span>
                  <span class="sensor-value">{{ new Date().toLocaleTimeString() }}</span>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <!-- 数据同步状态 -->
        <div class="sync-status">
          <a-card title="数据同步状态" size="small">
            <a-row :gutter="16">
              <a-col :span="6">
                <div class="status-item">
                  <span class="status-label">视频同步:</span>
                  <a-tag :color="videoSyncStatus === 'synced' ? 'success' : 'processing'">
                    {{ videoSyncStatus === 'synced' ? '已同步' : '同步中' }}
                  </a-tag>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="status-item">
                  <span class="status-label">轨迹同步:</span>
                  <a-tag :color="trajectorySyncStatus === 'synced' ? 'success' : 'processing'">
                    {{ trajectorySyncStatus === 'synced' ? '已同步' : '同步中' }}
                  </a-tag>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">音频同步:</span>
                  <a-tag :color="audioSyncStatus === 'synced' ? 'success' : 'processing'">
                    {{ audioSyncStatus === 'synced' ? '已同步' : '同步中' }}
                  </a-tag>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="sensor-item">
                  <span class="sensor-label">传感器同步:</span>
                  <a-tag :color="sensorSyncStatus === 'synced' ? 'success' : 'processing'">
                    {{ sensorSyncStatus === 'synced' ? '已同步' : '同步中' }}
                  </a-tag>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </div>
      </a-card>
    </div>

    <!-- 事件详情模态框 -->
    <a-modal
      v-model:open="eventDetailVisible"
      title="事件详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="事件编号">{{ currentEvent?.id }}</a-descriptions-item>
        <a-descriptions-item label="事件类型">{{ currentEvent?.type }}</a-descriptions-item>
        <a-descriptions-item label="发生时间">{{ currentEvent?.time }}</a-descriptions-item>
        <a-descriptions-item label="事件等级">{{ currentEvent?.level }}</a-descriptions-item>
        <a-descriptions-item label="地理位置">{{ currentEvent?.location }}</a-descriptions-item>
        <a-descriptions-item label="船舶信息">{{ currentEvent?.vessel }}</a-descriptions-item>
        <a-descriptions-item label="处理状态">{{ currentEvent?.status }}</a-descriptions-item>
        <a-descriptions-item label="责任部门">{{ currentEvent?.department }}</a-descriptions-item>
        <a-descriptions-item label="事件描述" :span="2">{{ currentEvent?.description }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined,
  DownloadOutlined, VideoCameraOutlined, CompassOutlined
} from '@ant-design/icons-vue'

// 事件选择
const selectedEventId = ref('')
const selectedEventType = ref('')
const timeRange = ref([])
const currentEvent = ref(null)

// 播放控制
const isPlaying = ref(false)
const timelineValue = ref(0)
const currentTime = ref('00:00:00')
const startTime = ref(0)
const endTime = ref(0)
const totalDuration = ref(0)

// 数据源控制
const videoEnabled = ref(true)
const audioEnabled = ref(true)
const trajectoryEnabled = ref(true)
const audioVolume = ref(80)

// 传感器数据
const sensorData = ref({
  temperature: 25.6,
  humidity: 68.3,
  pressure: 1013.2,
  windSpeed: 12.5,
  windDirection: 135,
  visibility: 8500,
  waveHeight: 1.2,
  currentSpeed: 2.1,
  currentDirection: 90,
  waterDepth: 15.8,
  waterTemperature: 18.5,
  salinity: 32.1,
  dissolvedOxygen: 8.2,
  pH: 7.8,
  turbidity: 2.3
})

// 同步状态
const videoSyncStatus = ref('synced')
const trajectorySyncStatus = ref('synced')
const audioSyncStatus = ref('synced')
const sensorSyncStatus = ref('synced')

// 模态框控制
const eventDetailVisible = ref(false)

// 选项数据
const eventTypeOptions = [
  { label: '船舶碰撞', value: '船舶碰撞' },
  { label: '船舶搁浅', value: '船舶搁浅' },
  { label: '火灾事故', value: '火灾事故' },
  { label: '人员落水', value: '人员落水' },
  { label: '货物泄漏', value: '货物泄漏' },
  { label: '航道堵塞', value: '航道堵塞' },
  { label: '船舶失控', value: '船舶失控' },
  { label: '锚链断裂', value: '锚链断裂' },
  { label: '船舶沉没', value: '船舶沉没' },
  { label: '船舶倾覆', value: '船舶倾覆' },
  { label: '船舶进水', value: '船舶进水' },
  { label: '船舶触礁', value: '船舶触礁' },
  { label: '船舶相撞', value: '船舶相撞' },
  { label: '船舶翻船', value: '船舶翻船' },
  { label: '船舶爆炸', value: '船舶爆炸' },
  { label: '船舶污染', value: '船舶污染' },
  { label: '船舶走私', value: '船舶走私' },
  { label: '船舶偷渡', value: '船舶偷渡' },
  { label: '船舶非法捕捞', value: '船舶非法捕捞' },
  { label: '船舶非法倾倒', value: '船舶非法倾倒' },
  { label: '船舶非法锚泊', value: '船舶非法锚泊' },
  { label: '船舶超速行驶', value: '船舶超速行驶' },
  { label: '船舶违规穿越', value: '船舶违规穿越' },
  { label: '船舶违规停泊', value: '船舶违规停泊' },
  { label: '船舶违规作业', value: '船舶违规作业' }
]

// 事件列表
const eventList = ref([
  {
    id: 'EV20250415001',
    type: '船舶碰撞',
    time: '2025-08-15 14:30:25',
    level: '较大',
    location: '吴淞口',
    vessel: '中远海运001号',
    status: '已处理',
    department: '海事局',
    description: '船舶在吴淞口附近发生碰撞事故，造成轻微损伤。'
  },
  {
    id: 'EV20250415002',
    type: '船舶搁浅',
    time: '2025-08-15 16:45:12',
    level: '一般',
    location: '宝山港',
    vessel: '招商轮船002号',
    status: '处理中',
    department: '港口管理局',
    description: '船舶在宝山港附近搁浅，需要拖船协助。'
  },
  {
    id: 'EV20250415003',
    type: '火灾事故',
    time: '2025-08-15 18:20:33',
    level: '重大',
    location: '外高桥',
    vessel: '中海集运003号',
    status: '处理中',
    department: '应急救援中心',
    description: '船舶在外高桥码头发生火灾，火势较大，需要消防船支援。'
  },
  {
    id: 'EV20250415004',
    type: '人员落水',
    time: '2025-08-15 20:15:47',
    level: '较大',
    location: '罗泾港',
    vessel: '长荣海运004号',
    status: '已处理',
    department: '海警局',
    description: '船员在罗泾港作业时不慎落水，已成功救援。'
  },
  {
    id: 'EV20250415005',
    type: '货物泄漏',
    time: '2025-08-15 22:08:19',
    level: '一般',
    location: '长兴岛',
    vessel: '阳明海运005号',
    status: '已处理',
    department: '环境保护局',
    description: '船舶在长兴岛附近发生货物泄漏，已采取应急措施。'
  },
  {
    id: 'EV20250415006',
    type: '航道堵塞',
    time: '2025-08-16 00:30:55',
    level: '较大',
    location: '横沙岛',
    vessel: '万海航运006号',
    status: '处理中',
    department: '航道管理处',
    description: '船舶在横沙岛附近搁浅，造成航道堵塞，影响其他船舶通行。'
  },
  {
    id: 'EV20250416001',
    type: '船舶失控',
    time: '2025-08-16 02:45:12',
    level: '重大',
    location: '崇明岛',
    vessel: '现代商船007号',
    status: '已处理',
    department: '船舶搜救中心',
    description: '船舶在崇明岛附近失去动力，需要拖船协助。'
  },
  {
    id: 'EV20250416002',
    type: '锚链断裂',
    time: '2025-08-16 05:20:38',
    level: '一般',
    location: '杨浦大桥',
    vessel: '韩进海运008号',
    status: '已处理',
    department: '船舶安全检查站',
    description: '船舶在杨浦大桥附近锚链断裂，已重新抛锚。'
  },
  {
    id: 'EV20250416003',
    type: '船舶沉没',
    time: '2025-08-16 08:15:26',
    level: '特别重大',
    location: '南浦大桥',
    vessel: '商船三井009号',
    status: '处理中',
    department: '应急救援中心',
    description: '船舶在南浦大桥附近发生严重事故，导致船舶沉没。'
  },
  {
    id: 'EV20250416004',
    type: '船舶倾覆',
    time: '2025-08-16 10:30:44',
    level: '重大',
    location: '卢浦大桥',
    vessel: '日本邮船010号',
    status: '已处理',
    department: '海警局',
    description: '船舶在卢浦大桥附近发生倾覆，已成功救援。'
  },
  {
    id: 'EV20250416005',
    type: '船舶进水',
    time: '2025-08-16 12:45:17',
    level: '较大',
    location: '徐浦大桥',
    vessel: '川崎汽船011号',
    status: '处理中',
    department: '船舶检验局',
    description: '船舶在徐浦大桥附近发生进水，正在紧急排水。'
  },
  {
    id: 'EV20250416006',
    type: '船舶触礁',
    time: '2025-08-16 15:20:33',
    level: '一般',
    location: '闵浦大桥',
    vessel: '三井商船012号',
    status: '已处理',
    department: '港口管理局',
    description: '船舶在闵浦大桥附近触礁，已成功脱险。'
  }
])

// 表格列定义
const eventColumns = [
  { title: '事件编号', dataIndex: 'id', key: 'id' },
  { title: '事件类型', dataIndex: 'type', key: 'type' },
  { title: '发生时间', dataIndex: 'time', key: 'time' },
  { title: '事件等级', dataIndex: 'level', key: 'level' },
  { title: '地理位置', dataIndex: 'location', key: 'location' },
  { title: '操作', key: 'action' }
]

// 计算属性
const currentPosition = computed(() => {
  if (!currentEvent.value) return '未知'
  const locations = {
    '吴淞口': '121.5°E, 31.2°N',
    '宝山港': '121.4°E, 31.3°N',
    '外高桥': '121.6°E, 31.1°N',
    '罗泾港': '121.3°E, 31.4°N',
    '长兴岛': '121.7°E, 31.0°N',
    '横沙岛': '121.8°E, 30.9°N',
    '崇明岛': '121.2°E, 31.5°N',
    '杨浦大桥': '121.5°E, 31.2°N',
    '南浦大桥': '121.5°E, 31.2°N',
    '卢浦大桥': '121.5°E, 31.2°N',
    '徐浦大桥': '121.5°E, 31.2°N',
    '闵浦大桥': '121.5°E, 31.2°N'
  }
  return `${currentEvent.value.location} (${locations[currentEvent.value.location] || '121.5°E, 31.2°N'})`
})

const currentHeading = computed(() => {
  if (!currentEvent.value) return 0
  const baseHeading = currentEvent.value.type === '船舶碰撞' ? 45 : 
                     currentEvent.value.type === '船舶搁浅' ? 90 : 
                     currentEvent.value.type === '火灾事故' ? 135 : 
                     currentEvent.value.type === '人员落水' ? 180 : 
                     currentEvent.value.type === '货物泄漏' ? 225 : 
                     currentEvent.value.type === '航道堵塞' ? 270 : 
                     currentEvent.value.type === '船舶失控' ? 315 : 
                     currentEvent.value.type === '锚链断裂' ? 0 : 
                     currentEvent.value.type === '船舶沉没' ? 45 : 
                     currentEvent.value.type === '船舶倾覆' ? 90 : 
                     currentEvent.value.type === '船舶进水' ? 135 : 
                     currentEvent.value.type === '船舶触礁' ? 180 : 0
  return (baseHeading + Math.floor(Math.random() * 30) - 15) % 360
})

const currentSpeed = computed(() => {
  if (!currentEvent.value) return '0.0'
  const baseSpeed = currentEvent.value.type === '船舶碰撞' ? 8.5 : 
                   currentEvent.value.type === '船舶搁浅' ? 2.3 : 
                   currentEvent.value.type === '火灾事故' ? 6.7 : 
                   currentEvent.value.type === '人员落水' ? 4.2 : 
                   currentEvent.value.type === '货物泄漏' ? 3.8 : 
                   currentEvent.value.type === '航道堵塞' ? 0.0 : 
                   currentEvent.value.type === '船舶失控' ? 1.5 : 
                   currentEvent.value.type === '锚链断裂' ? 0.0 : 
                   currentEvent.value.type === '船舶沉没' ? 0.0 : 
                   currentEvent.value.type === '船舶倾覆' ? 0.0 : 
                   currentEvent.value.type === '船舶进水' ? 2.1 : 
                   currentEvent.value.type === '船舶触礁' ? 0.0 : 5.0
  return (baseSpeed + (Math.random() * 2 - 1)).toFixed(1)
})

// 方法
const loadEventData = () => {
  if (!selectedEventId.value) {
    message.warning('请输入事件编号')
    return
  }
  
  const event = eventList.value.find(e => e.id === selectedEventId.value)
  if (event) {
    currentEvent.value = event
    initializePlayback()
    message.success('事件数据加载成功')
  } else {
    message.error('未找到指定事件')
  }
}

const filterEvents = () => {
  // 根据类型和时间范围过滤事件
  message.info('事件过滤功能开发中...')
}

const selectEvent = (record: any) => {
  currentEvent.value = record
  initializePlayback()
}

const startPlayback = (record: any) => {
  currentEvent.value = record
  initializePlayback()
  togglePlayback()
}

const initializePlayback = () => {
  if (!currentEvent.value) return
  
  // 模拟初始化播放器
  startTime.value = 0
  endTime.value = 3600 // 1小时
  totalDuration.value = 3600
  timelineValue.value = 0
  currentTime.value = '00:00:00'
  
  // 重置同步状态
  videoSyncStatus.value = 'syncing'
  trajectorySyncStatus.value = 'syncing'
  audioSyncStatus.value = 'syncing'
  sensorSyncStatus.value = 'syncing'
  
  // 模拟同步完成
  setTimeout(() => {
    videoSyncStatus.value = 'synced'
    trajectorySyncStatus.value = 'synced'
    audioSyncStatus.value = 'synced'
    sensorSyncStatus.value = 'synced'
  }, 2000)
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlaybackTimer()
  } else {
    stopPlaybackTimer()
  }
}

const stopPlayback = () => {
  isPlaying.value = false
  stopPlaybackTimer()
  timelineValue.value = 0
  currentTime.value = '00:00:00'
}

const resetPlayback = () => {
  stopPlayback()
  timelineValue.value = 0
  currentTime.value = '00:00:00'
}

const exportPlayback = () => {
  message.success('回溯数据导出中...')
}

const seekToTime = (value: number) => {
  timelineValue.value = value
  currentTime.value = formatTime(value)
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const toggleVideo = () => {
  videoEnabled.value = !videoEnabled.value
}

const toggleAudio = () => {
  audioEnabled.value = !audioEnabled.value
}

const fullscreenVideo = () => {
  message.info('全屏功能开发中...')
}

const toggleTrajectory = () => {
  trajectoryEnabled.value = !trajectoryEnabled.value
}

const showTrajectoryMap = () => {
  message.info('地图显示功能开发中...')
}

const setAudioVolume = (volume: number) => {
  audioVolume.value = volume
}

// 播放定时器
let playbackTimer: NodeJS.Timeout | null = null

const startPlaybackTimer = () => {
  playbackTimer = setInterval(() => {
    if (timelineValue.value < totalDuration.value) {
      timelineValue.value++
      currentTime.value = formatTime(timelineValue.value)
    } else {
      stopPlayback()
    }
  }, 1000)
}

const stopPlaybackTimer = () => {
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
  }
}

onMounted(() => {
  console.log('全过程回溯页面已加载')
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPlaybackTimer()
})
</script>

<style lang="less" scoped>
.full-process-traceability {
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

  .event-selection {
    margin-bottom: 24px;

    .selection-card {
      .ant-table-tbody > tr:hover > td {
        background-color: #e6f7ff;
        cursor: pointer;
      }
    }
  }

  .playback-area {
    .playback-card {
      .timeline-control {
        margin-bottom: 24px;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-weight: 500;

          .current-time {
            font-size: 18px;
            color: #1890ff;
            font-weight: 600;
          }
        }

        .timeline-info {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .multi-source-display {
        margin-bottom: 24px;

        .video-player,
        .trajectory-player {
          .video-placeholder,
          .trajectory-placeholder {
            height: 200px;
            background: #f5f5f5;
            border: 2px dashed #d9d9d9;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8c8c8c;
            margin-bottom: 16px;

            p {
              margin: 4px 0;
            }
          }

          .video-controls,
          .trajectory-controls {
            text-align: center;
          }
        }

        .audio-player {
          .audio-visualization {
            margin-bottom: 16px;

            .audio-wave {
              display: flex;
              align-items: flex-end;
              justify-content: center;
              height: 60px;
              gap: 2px;

              .wave-bar {
                width: 4px;
                background: #1890ff;
                border-radius: 2px;
                transition: height 0.1s ease;
              }
            }
          }

          .audio-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
        }
      }

      .sensor-data-display {
        margin-bottom: 24px;

        .sensor-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .sensor-label {
            font-weight: 500;
            color: #8c8c8c;
            min-width: 80px;
          }

          .sensor-value {
            font-weight: 600;
            color: #262626;
          }
        }
      }

      .sync-status {
        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-label {
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .full-process-traceability {
    padding: 16px;

    .ant-col {
      margin-bottom: 16px;
    }

    .timeline-info {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>

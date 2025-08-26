<template>
  <div class="quick-call-container">
    <!-- 页面标题 -->
    <div class="page-title">
      <h1>快速调用</h1>
      <p>支持通过点击电子地图上的摄像头图标、输入摄像头编号或名称等方式，快速调取指定视频流</p>
    </div>

    <!-- 统计卡片 + 工具栏 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card :bordered="false" class="elevated-card">
            <a-statistic title="摄像头总数" :value="70" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="elevated-card">
            <a-statistic title="在线摄像头" :value="77" :value-style="{ color: '#52c41a' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="elevated-card">
            <a-statistic title="离线摄像头" :value="0" :value-style="{ color: '#ff4d4f' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="elevated-card">
            <a-statistic title="在线率" :value="100" />
          </a-card>
        </a-col>
      </a-row>
      <div class="toolbar">
        <a-space wrap>
          <a-button type="primary" @click="callRecentOnline">调用最近在线</a-button>
          <a-button @click="exportList">导出列表</a-button>
          <a-button @click="resetFilters">清空筛选</a-button>
          <a-button @click="refreshData">刷新</a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和操作区域 -->
    <a-card title="快速搜索" style="margin-bottom: 16px">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="10" :lg="8">
          <a-input-search
            v-model:value="searchText"
            placeholder="输入摄像头编号或名称（如 CAM001 / 码头前沿）"
            enter-button="搜索"
            @search="handleSearch"
          />
        </a-col>
        <a-col :xs="12" :sm="6" :md="6" :lg="5">
          <a-select
            v-model:value="selectedArea"
            placeholder="选择区域"
            style="width: 100%"
            @change="handleAreaFilter"
          >
            <a-select-option value="">全部区域</a-select-option>
            <a-select-option value="码头">码头区域</a-select-option>
            <a-select-option value="航道">航道区域</a-select-option>
            <a-select-option value="锚地">锚地区域</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="12" :sm="6" :md="6" :lg="5">
          <a-select
            v-model:value="selectedStatus"
            placeholder="选择状态"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
          </a-select>
        </a-col>
        
      </a-row>
      <!-- 已选条件标签 -->
      <div class="filter-tags" v-if="searchText || selectedArea || selectedStatus">
        <a-space wrap>
          <a-tag v-if="searchText" closable @close.prevent="searchText = ''">关键词：{{ searchText }}</a-tag>
          <a-tag v-if="selectedArea" closable @close.prevent="selectedArea = ''">区域：{{ selectedArea }}</a-tag>
          <a-tag v-if="selectedStatus" closable @close.prevent="selectedStatus = ''">状态：{{ selectedStatus === 'online' ? '在线' : '离线' }}</a-tag>
          <a-tag v-if="selectedResolution" closable @close.prevent="selectedResolution = ''">分辨率：{{ selectedResolution }}</a-tag>
          <a-tag v-if="selectedDepartment" closable @close.prevent="selectedDepartment = ''">部门：{{ selectedDepartment }}</a-tag>
        </a-space>
      </div>
      <a-collapse class="advanced" v-model:activeKey="advancedActive">
        <a-collapse-panel key="1" header="高级筛选">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-select v-model:value="selectedResolution" placeholder="分辨率" style="width: 100%">
                <a-select-option value="">全部分辨率</a-select-option>
                <a-select-option value="4K">4K</a-select-option>
                <a-select-option value="1080P">1080P</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select v-model:value="selectedDepartment" placeholder="负责部门" style="width: 100%">
                <a-select-option value="">全部部门</a-select-option>
                <a-select-option v-for="d in departments" :key="d" :value="d">{{ d }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="12" class="advanced-actions">
              <a-space>
                <a-button @click="applyAdvanced">应用</a-button>
                <a-button @click="clearAdvanced">清空</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-card>

    <!-- 地图与列表（Tabs切换） -->
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="map" tab="电子地图">
        <a-card title="电子地图（可点击摄像头图标）" class="map-card elevated-card" :bordered="false">
          <!-- 如果 AMap 存在则显示真实地图，否则显示回退网格地图 -->
          <div v-if="amapReady" ref="amapEl" class="map-panel"></div>
          <div v-else ref="mapEl" class="map-panel">
            <div class="grid"></div>
            <div class="sim-inner" :style="{ transform: 'scale(' + simScale + ')' }">
              <button
                v-for="marker in simulatedMarkers"
                :key="marker.id"
                class="camera-marker"
                :class="{ active: selectedCamera && selectedCamera.id === marker.id, offline: marker.status !== 'online', online: marker.status === 'online' }"
                :style="{ left: marker.renderPos.x + '%', top: marker.renderPos.y + '%' }"
                @click="handleMarkerClick(marker)"
                @mouseenter="showMarkerTooltip(marker, $event)"
                @mouseleave="hideMarkerTooltip"
                :title="marker.name + '（' + (marker.status === 'online' ? '在线' : '离线') + '）'"
              >
                <span class="dot" :style="{ backgroundColor: marker.status === 'online' ? '#52c41a' : '#ff4d4f' }"></span>
                <span class="cam">📷</span>
                <span class="pulse" v-if="marker.status === 'online'"></span>
              </button>
            </div>
            <div v-show="tooltip.visible" class="sim-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
              <div class="title">{{ tooltip.data.name }}</div>
              <div class="row">编号：{{ tooltip.data.code }}</div>
              <div class="row">位置：{{ tooltip.data.location }}</div>
              <div class="row">状态：{{ tooltip.data.status === 'online' ? '在线' : '离线' }}</div>
            </div>
            <div class="sim-overlay">
              <div class="compass">N</div>
              <div class="scale">100m</div>
            </div>
          </div>
          <div class="map-legend">
            <span class="legend-item"><i class="legend-dot online"></i>在线</span>
            <span class="legend-item"><i class="legend-dot offline"></i>离线</span>
          </div>
          <div class="map-actions">
            <a-space>
              <a-button type="primary" :disabled="!selectedCamera || selectedCamera.status !== 'online'" @click="quickCallSelected">
                调用选中摄像头
              </a-button>
              <a-button @click="simZoomOut" v-if="!amapReady">-</a-button>
              <a-button @click="simZoomIn" v-if="!amapReady">+</a-button>
              <a-button @click="simZoomReset" v-if="!amapReady">复位</a-button>
              <span v-if="selectedCamera">
                已选中：{{ selectedCamera.name }}（{{ selectedCamera.status === 'online' ? '在线' : '离线' }}）
              </span>
              <span v-else class="muted">点击地图上的📷图标选择摄像头</span>
            </a-space>
          </div>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="list" tab="摄像头列表">
        <a-card title="摄像头列表" :bordered="false" class="elevated-card">
          <a-table
            :columns="columns"
            :data-source="filteredCameras"
            :pagination="pagination"
            :loading="loading"
            row-key="id"
            :row-class-name="rowClassName"
            :locale="{ emptyText: emptyText }"
            :customRow="customRow"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'online' ? 'green' : 'red'">
                  {{ record.status === 'online' ? '在线' : '离线' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button 
                    type="primary" 
                    size="small"
                    @click="callCamera(record)"
                    :disabled="record.status !== 'online'"
                  >
                    调用
                  </a-button>
                  <a-button size="small" @click="openDetail(record)">详情</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>
    <!-- 详情抽屉 -->
    <a-drawer
      v-model:open="detailVisible"
      :width="420"
      placement="right"
      title="摄像头详情"
    >
      <div v-if="selectedCamera" class="detail-drawer">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="摄像头名称">{{ selectedCamera.name }}</a-descriptions-item>
          <a-descriptions-item label="摄像头编号">{{ selectedCamera.code }}</a-descriptions-item>
          <a-descriptions-item label="IP地址">{{ selectedCamera.ip }}</a-descriptions-item>
          <a-descriptions-item label="安装位置">{{ selectedCamera.location }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedCamera.status === 'online' ? 'green' : 'red'">{{ selectedCamera.status === 'online' ? '在线' : '离线' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="分辨率">{{ selectedCamera.resolution }}</a-descriptions-item>
          <a-descriptions-item label="负责部门">{{ selectedCamera.department }}</a-descriptions-item>
          <a-descriptions-item label="操作员">{{ selectedCamera.operator }}</a-descriptions-item>
        </a-descriptions>
        <div class="drawer-actions">
          <a-space>
            <a-button type="primary" :disabled="selectedCamera.status !== 'online'" @click="callCamera(selectedCamera)">立即调用</a-button>
            <a-button @click="detailVisible = false">关闭</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'

/**
 * 快速调用：支持地图点击与编号/名称搜索调取视频流
 * @module QuickCall
 */

// 响应式数据
const searchText = ref('')
const selectedArea = ref('')
const selectedStatus = ref('')
const loading = ref(false)
const detailVisible = ref(false)
const selectedCamera = ref<any>(null)
const mapEl = ref<HTMLElement | null>(null)
const amapEl = ref<HTMLElement | null>(null)
const advancedActive = ref<string[] | string>([])
const selectedResolution = ref('')
const selectedDepartment = ref('')
const activeTab = ref<'map' | 'list'>('map')
const amapReady = ref(false)
const amap = ref<any>(null)
let amapMarkers: any[] = []

// 全局声明（脚本可能由组件内动态加载）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let AMap: any

// 从环境变量读取地图配置
const AMAP_KEY = (import.meta as any).env?.VITE_AMAP_API_KEY || ''
const MAP_CENTER_RAW = (import.meta as any).env?.VITE_MAP_CENTER || ''
const MAP_ZOOM_RAW = (import.meta as any).env?.VITE_MAP_ZOOM || ''
const MAP_STYLE = (import.meta as any).env?.VITE_MAP_STYLE || ''
const VIEW_MODE = ((import.meta as any).env?.VITE_VIEW_MODE || '').toUpperCase() // '3D' | '2D'

const parseCenter = (): [number, number] | null => {
  try {
    if (!MAP_CENTER_RAW) return null
    const [lngStr, latStr] = (MAP_CENTER_RAW as string).split(',')
    const lng = Number(lngStr), lat = Number(latStr)
    if (!isNaN(lng) && !isNaN(lat)) return [lng, lat]
  } catch {}
  return null
}

const getZoom = (): number | null => {
  const z = Number(MAP_ZOOM_RAW)
  return isNaN(z) ? null : z
}

// 动态加载 AMap 脚本（只加载一次）
const loadAmapScriptOnce = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 已存在
    if (typeof AMap !== 'undefined') return resolve()
    const existed = document.querySelector('script[data-amap-sdk]') as HTMLScriptElement | null
    if (existed) {
      existed.addEventListener('load', () => resolve())
      existed.addEventListener('error', () => reject(new Error('AMap load error')))
      return
    }
    if (!AMAP_KEY) {
      return reject(new Error('Missing VITE_AMAP_API_KEY'))
    }
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${encodeURIComponent(AMAP_KEY)}&plugin=AMap.Marker`;
    script.async = true
    script.defer = true
    script.setAttribute('data-amap-sdk', 'true')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('AMap load error'))
    document.head.appendChild(script)
  })
}

// 摄像头数据
const cameras = ref([
  {
    id: 1,
    code: 'CAM001',
    name: '码头前沿高清球机',
    ip: '192.168.1.101',
    location: '码头前沿',
    status: 'online',
    resolution: '4K',
    department: '港口监控部',
    operator: '陈志强',
    position: { x: 20, y: 35 }
  },
  {
    id: 2,
    code: 'CAM002',
    name: '集装箱堆场固定枪机',
    ip: '192.168.1.102',
    location: '集装箱堆场',
    status: 'online',
    resolution: '1080P',
    department: '堆场管理部',
    operator: '刘建国',
    position: { x: 62, y: 28 }
  },
  {
    id: 3,
    code: 'CAM003',
    name: '主航道夜视摄像头',
    ip: '192.168.1.103',
    location: '主航道',
    status: 'offline',
    resolution: '4K',
    department: '航道监控部',
    operator: '王海峰',
    position: { x: 48, y: 62 }
  },
  {
    id: 4,
    code: 'CAM004',
    name: '锚地区域全景摄像头',
    ip: '192.168.1.104',
    location: '锚地区域',
    status: 'online',
    resolution: '1080P',
    department: '锚地管理部',
    operator: '赵明华',
    position: { x: 78, y: 55 }
  },
  {
    id: 5,
    code: 'CAM005',
    name: '港池入口智能识别',
    ip: '192.168.1.105',
    location: '港池入口',
    status: 'online',
    resolution: '4K',
    department: '智能监控部',
    operator: '钱伟民',
    position: { x: 35, y: 18 }
  },
  {
    id: 6,
    code: 'CAM006',
    name: '拖轮码头移动监控',
    ip: '192.168.1.106',
    location: '拖轮码头',
    status: 'online',
    resolution: '1080P',
    department: '拖轮管理部',
    operator: '孙志刚',
    position: { x: 14, y: 70 }
  },
  {
    id: 7,
    code: 'CAM007',
    name: '危化品区防爆摄像头',
    ip: '192.168.1.107',
    location: '危化品区',
    status: 'online',
    resolution: '1080P',
    department: '安全监控部',
    operator: '周建军',
    position: { x: 22, y: 52 }
  },
  {
    id: 8,
    code: 'CAM008',
    name: '信号塔全景监控',
    ip: '192.168.1.108',
    location: '信号塔',
    status: 'online',
    resolution: '4K',
    department: '信号管理部',
    operator: '吴建华',
    position: { x: 68, y: 20 }
  },
  {
    id: 9,
    code: 'CAM009',
    name: '沿江大道交通监控',
    ip: '192.168.1.109',
    location: '沿江大道',
    status: 'online',
    resolution: '1080P',
    department: '交通监控部',
    operator: '高鹏飞',
    position: { x: 60, y: 64 }
  },
  {
    id: 10,
    code: 'CAM010',
    name: '港务大楼楼顶监控',
    ip: '192.168.1.110',
    location: '港务大楼',
    status: 'online',
    resolution: '4K',
    department: '行政监控部',
    operator: '林倩',
    position: { x: 84, y: 30 }
  },
  {
    id: 11,
    code: 'CAM011',
    name: '集装箱闸口道闸',
    ip: '192.168.1.111',
    location: '集装箱闸口',
    status: 'offline',
    resolution: '1080P',
    department: '堆场管理部',
    operator: '刘建国',
    position: { x: 46, y: 14 }
  },
  {
    id: 12,
    code: 'CAM012',
    name: '泊位三号岸桥监控',
    ip: '192.168.1.112',
    location: '三号泊位',
    status: 'online',
    resolution: '4K',
    department: '装卸作业部',
    operator: '唐宇航',
    position: { x: 28, y: 42 }
  },
  {
    id: 13,
    code: 'CAM013',
    name: '客运码头候船厅',
    ip: '192.168.1.113',
    location: '客运码头',
    status: 'online',
    resolution: '1080P',
    department: '客运管理部',
    operator: '韩晓宁',
    position: { x: 76, y: 74 }
  },
  {
    id: 14,
    code: 'CAM014',
    name: '维修工区围栏',
    ip: '192.168.1.114',
    location: '维修工区',
    status: 'offline',
    resolution: '1080P',
    department: '设备运维部',
    operator: '毕成龙',
    position: { x: 12, y: 28 }
  },
  {
    id: 15,
    code: 'CAM015',
    name: '锚地航标在线监控',
    ip: '192.168.1.115',
    location: '锚地区域',
    status: 'online',
    resolution: '4K',
    department: '航道监控部',
    operator: '王海峰',
    position: { x: 82, y: 58 }
  },
  {
    id: 16,
    code: 'CAM016',
    name: '危化仓库内走廊',
    ip: '192.168.1.116',
    location: '危化仓库',
    status: 'online',
    resolution: '1080P',
    department: '安全监控部',
    operator: '周建军',
    position: { x: 18, y: 84 }
  },
  {
    id: 17,
    code: 'CAM017',
    name: '调度中心大厅',
    ip: '192.168.1.117',
    location: '调度中心',
    status: 'online',
    resolution: '4K',
    department: '调度中心',
    operator: '陈志强',
    position: { x: 54, y: 46 }
  },
  {
    id: 18,
    code: 'CAM018',
    name: '油码头卸油臂监控',
    ip: '192.168.1.118',
    location: '油品码头',
    status: 'online',
    resolution: '1080P',
    department: '油品作业部',
    operator: '马建林',
    position: { x: 40, y: 78 }
  }
])

// 表格列定义
const columns = [
  {
    title: '摄像头编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '摄像头名称',
    dataIndex: 'name',
    key: 'name',
    width: 180
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 150
  },
  {
    title: '安装位置',
    dataIndex: 'location',
    key: 'location',
    width: 120
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department',
    width: 120
  },
  {
    title: '操作员',
    dataIndex: 'operator',
    key: 'operator',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '分辨率',
    dataIndex: 'resolution',
    key: 'resolution',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 计算属性
const onlineCount = computed(() => {
  return cameras.value.filter(c => c.status === 'online').length
})

const offlineCount = computed(() => {
  return cameras.value.filter(c => c.status === 'offline').length
})

const callCount = computed(() => {
  return 15 // 模拟今日调用次数
})

const onlineRateText = computed(() => {
  const total = cameras.value.length
  if (!total) return '0%'
  const rate = Math.round((onlineCount.value / total) * 100)
  return rate + '%'
})

const filteredCameras = computed(() => {
  let result = cameras.value

  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(camera => 
      camera.code.toLowerCase().includes(keyword) ||
      camera.name.toLowerCase().includes(keyword) ||
      camera.ip.toLowerCase().includes(keyword) ||
      camera.location.toLowerCase().includes(keyword)
    )
  }

  if (selectedArea.value) {
    result = result.filter(camera => 
      camera.location.includes(selectedArea.value)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(camera => camera.status === selectedStatus.value)
  }

  if (selectedResolution.value) {
    result = result.filter(camera => camera.resolution === selectedResolution.value)
  }

  if (selectedDepartment.value) {
    result = result.filter(camera => camera.department === selectedDepartment.value)
  }

  pagination.value.total = result.length
  return result
})

/**
 * 地图上显示的摄像头（同 filteredCameras，但确保有 position）
 */
const markerCameras = computed(() => {
  return filteredCameras.value.filter((c: any) => !!c.position)
})

// 将 position 百分比近似为经纬度（兜底），或直接使用已有 lng/lat
const getLngLat = (c: any) => {
  if (c.lng && c.lat) return [c.lng, c.lat]
  // 将 0-100 的 position.x/y 映射到一个港区附近的范围
  const baseLng = 117.0, baseLat = 35.30
  const lng = baseLng - 0.05 + (c.position?.x || 50) * 0.001
  const lat = baseLat - 0.05 + (c.position?.y || 50) * 0.001
  return [lng, lat]
}

// 渲染 AMap 标记
const renderAMarkers = () => {
  if (!amapReady.value || !amap.value) return
  amapMarkers.forEach(m => m.setMap(null))
  amapMarkers = []
  const list = markerCameras.value
  list.forEach((c: any) => {
    const [lng, lat] = getLngLat(c)
    const marker = new AMap.Marker({
      position: [lng, lat],
      offset: new AMap.Pixel(-10, -10),
      content: `<div class="amap-pin ${c.status === 'online' ? 'on' : 'off'}">📷</div>`
    })
    marker.setMap(amap.value)
    marker.on('click', () => handleMarkerClick(c))
    amapMarkers.push(marker)
  })
}

// 初始化 AMap
const initAMap = async () => {
  try {
    await loadAmapScriptOnce()
    await nextTick()
    if (!amapEl.value) return
    const centerFromEnv = parseCenter()
    const [lng, lat] = centerFromEnv || getLngLat(markerCameras.value[0] || {})
    const zoom = getZoom() ?? 13
    const opt: any = {
      resizeEnable: true,
      zoom,
      center: [lng, lat]
    }
    if (MAP_STYLE) opt.mapStyle = MAP_STYLE
    if (VIEW_MODE === '3D') opt.viewMode = '3D'
    amap.value = new AMap.Map(amapEl.value, opt)
    amapReady.value = true
    renderAMarkers()
  } catch (e) {
    console.error('AMap init failed:', e)
    amapReady.value = false
  }
}

// ======= 模拟地图增强（更真实） =======
const simScale = ref(1)
const simulatedMarkers = computed(() => {
  // 基于 position 加一点随机微偏移，避免完全栅格感
  return markerCameras.value.map((c: any) => {
    const jitterX = (c.id % 7) * 0.3
    const jitterY = (c.id % 5) * 0.3
    const renderPos = {
      x: Math.min(95, Math.max(5, (c.position?.x || 50) + jitterX - 1.5)),
      y: Math.min(95, Math.max(5, (c.position?.y || 50) + jitterY - 1.5))
    }
    return { ...c, renderPos }
  })
})

const simZoomIn = () => { simScale.value = Math.min(1.8, parseFloat((simScale.value + 0.1).toFixed(2))) }
const simZoomOut = () => { simScale.value = Math.max(0.6, parseFloat((simScale.value - 0.1).toFixed(2))) }
const simZoomReset = () => { simScale.value = 1 }

const tooltip = ref({ visible: false, x: 0, y: 0, data: {} as any })
const showMarkerTooltip = (marker: any, e: MouseEvent) => {
  tooltip.value = { visible: true, x: e.offsetX + 16, y: e.offsetY + 16, data: marker }
}
const hideMarkerTooltip = () => { tooltip.value.visible = false }

// 唯一部门列表
const departments = computed(() => {
  return Array.from(new Set(cameras.value.map((c: any) => c.department))).filter(Boolean)
})

// 方法
let searchTimer: any = null
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    message.success(`搜索完成，找到 ${filteredCameras.value.length} 个摄像头`)
  }, 200)
}

/**
 * 过滤区域改变
 */
const handleAreaFilter = () => {
  message.info(`已筛选 ${selectedArea.value || '全部'} 区域`)
}

/**
 * 状态筛选改变
 */
const handleStatusFilter = () => {
  message.info(`已筛选 ${selectedStatus.value || '全部'} 状态`)
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  searchText.value = ''
  selectedArea.value = ''
  selectedStatus.value = ''
  selectedResolution.value = ''
  selectedDepartment.value = ''
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据已刷新')
  }, 1000)
}

/**
 * 点击地图上的摄像头标记
 * @param camera 选中的摄像头
 */
const handleMarkerClick = (camera: any) => {
  selectedCamera.value = camera
}

const callCamera = (camera: any) => {
  if (camera.status !== 'online') {
    message.error(`${camera.name} 离线，无法调用`)
    return
  }
  
  message.success(`正在调用 ${camera.name}`)
  console.log('调用摄像头:', camera)
}

// 表格行样式与空状态
const rowClassName = (record: any) => {
  if (selectedCamera.value && record.id === selectedCamera.value.id) return 'row-active'
  return ''
}
const emptyText = '暂无数据，请调整筛选条件'

// 点击行选中（联动地图）
const customRow = (record: any) => {
  return {
    onClick: () => {
      selectedCamera.value = record
    }
  }
}

/**
 * 快速调用当前选中的摄像头
 */
const quickCallSelected = () => {
  if (!selectedCamera.value) {
    message.warning('请先在地图或表格中选择一个摄像头')
    return
  }
  callCamera(selectedCamera.value)
}

/**
 * 调用最近在线摄像头（按数据顺序模拟最近）
 */
const callRecentOnline = () => {
  const camera = cameras.value.find(c => c.status === 'online')
  if (!camera) {
    message.warning('暂无在线摄像头')
    return
  }
  selectedCamera.value = camera
  callCamera(camera)
}

/**
 * 导出当前筛选列表（控制台模拟导出）
 */
const exportList = () => {
  const data = filteredCameras.value.map((c: any) => ({
    编号: c.code,
    名称: c.name,
    IP: c.ip,
    区域: c.location,
    状态: c.status === 'online' ? '在线' : '离线',
    分辨率: c.resolution,
    部门: c.department,
    操作员: c.operator
  }))
  console.table(data)
  message.success(`已导出 ${data.length} 条记录（在控制台查看）`)
}

// 应用高级筛选
const applyAdvanced = () => {
  message.success('高级筛选已应用')
}

// 清空高级筛选
const clearAdvanced = () => {
  selectedResolution.value = ''
  selectedDepartment.value = ''
}

const openDetail = (camera: any) => {
  selectedCamera.value = camera
  detailVisible.value = true
}

// 生命周期
onMounted(() => {
  pagination.value.total = cameras.value.length
  if (activeTab.value === 'map') initAMap()
})

watch(activeTab, (t) => {
  if (t === 'map' && !amapReady.value) initAMap()
  else if (t === 'map' && amapReady.value) renderAMarkers()
})

watch(filteredCameras, () => {
  if (activeTab.value === 'map' && amapReady.value) renderAMarkers()
})

onBeforeUnmount(() => {
  amapMarkers.forEach(m => m.setMap && m.setMap(null))
  amapMarkers = []
  if (amap.value && amap.value.destroy) amap.value.destroy()
})
</script>

<style lang="less" scoped>
.quick-call-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;

  .page-title {
    text-align: center;
    margin-bottom: 24px;

    h1 {
      font-size: 28px;
      color: #1890ff;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .ant-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .elevated-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(6px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
      border-radius: 12px;
    }

    .toolbar {
      margin-top: 12px;
      display: flex;
      justify-content: flex-end;

      .ant-btn {
        border-radius: 20px;
      }
    }
  }

  .ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .ant-table {
    .ant-table-thead > tr > th {
      background-color: #fafafa;
      font-weight: 600;
    }
  }

  .map-card {
    .map-panel {
      position: relative;
      width: 100%;
      height: 360px;
      border-radius: 8px;
      overflow: hidden;
      background: radial-gradient(circle at 30% 30%, #e6f7ff 0%, #bae7ff 30%, #91d5ff 60%, #69c0ff 100%);
      border: 1px solid #e6f7ff;

      .grid {
        position: absolute;
        inset: 0;
        background-size: 24px 24px;
        background-image: linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px);
        pointer-events: none;
      }
      .sim-inner { position: absolute; inset: 0; transform-origin: left top; }
      
      .camera-marker {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.1);
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        gap: 4px;
      }

      .camera-marker:hover {
        transform: translate(-50%, -50%) scale(1.06);
      }

      .camera-marker.active {
        outline: 2px solid #1890ff;
      }

      .camera-marker.offline {
        opacity: 0.5;
      }

      .camera-marker .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .camera-marker .cam {
        line-height: 1;
      }
    }

    /* AMap 自定义 pin 状态样式 */
    :deep(.amap-pin){
      font-size: 16px;
    }
    :deep(.amap-pin.on){
      filter: drop-shadow(0 0 2px #52c41a);
    }
    :deep(.amap-pin.off){
      opacity: .6;
      filter: grayscale(1);
    }

    /* 模拟地图的提示与覆盖 */
    .sim-tooltip { position: absolute; z-index: 2; background: rgba(0,0,0,.75); color:#fff; padding:8px 10px; border-radius:6px; pointer-events:none; }
    .sim-tooltip .title { font-weight:600; margin-bottom:4px; }
    .sim-tooltip .row { font-size:12px; opacity:.9; }
    .sim-overlay { position:absolute; right:8px; bottom:8px; display:flex; gap:8px; }
    .sim-overlay .compass { width:24px; height:24px; border:1px solid #ddd; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#1890ff; background:#fff; }
    .sim-overlay .scale { padding:2px 6px; border:1px solid #ddd; background:#fff; border-radius:4px; font-size:12px; color:#666; }
  }

  // 表格行选中样式
  :deep(.row-active) > td {
    background: #e6f7ff !important;
  }
}
</style>

<template>
  <div class="video-matrix-container">
    <!-- 顶部导航栏 - 简化设计 -->
    <div class="top-navbar">
      <div class="nav-left">
        <div class="page-title">
          <VideoCameraOutlined class="title-icon" />
          <span>视频矩阵</span>
        </div>
        <div class="breadcrumb">
          <span>视频广场</span>
          <span class="separator">/</span>
          <span class="current">视频矩阵</span>
        </div>
    </div>

      <div class="nav-right">
        <div class="status-summary">
          <div class="status-item online">
            <div class="status-dot"></div>
            <span>在线 {{ 70 }}</span>
          </div>
          <div class="status-item offline">
            <div class="status-dot"></div>
            <span>离线 {{ 0 }}</span>
          </div>
          <div class="status-item recording">
            <div class="status-dot"></div>
            <span>录制 {{ recordingCount }}</span>
          </div>
        </div>
        
        <div class="nav-actions">
          <a-button type="primary" @click="showLayoutModal = true">
            <LayoutOutlined />
            布局管理
          </a-button>
          <a-button @click="openPickerForSelectedOrFirst()">
            <PlusOutlined />
            选择摄像头
          </a-button>
          <a-button @click="showCameraModal = true">
            <SettingOutlined />
            摄像头管理
          </a-button>
        </div>
        </div>
      </div>
      
    <!-- 主要内容区域 - 重新布局 -->
    <div class="main-content">
      <!-- 左侧控制面板 - 使用tabs组织功能 -->
      <div class="left-panel">
        <a-tabs v-model:activeKey="activeTab" class="control-tabs">
          <!-- 布局管理标签页 -->
          <a-tab-pane key="layout" tab="布局管理">
            <div class="tab-content">
              <!-- 分屏布局选择 -->
              <div class="panel-section">
                <div class="section-title">
                  <LayoutOutlined />
                  <span>分屏布局</span>
        </div>
        
          <div class="layout-grid">
            <div 
              v-for="layout in layoutOptions" 
              :key="layout.value"
              class="layout-item"
              :class="{ active: currentLayout === layout.value }"
              @click="changeLayout(layout.value)"
            >
              <div class="layout-preview" :class="`preview-${layout.value}`">
                <div v-for="i in layout.cells" :key="i" class="preview-cell"></div>
              </div>
                    <div class="layout-name">{{ layout.name }}</div>
              </div>
            </div>
          </div>

              
        </div>
          </a-tab-pane>

          <!-- 播放控制标签页 -->
          <a-tab-pane key="playback" tab="播放控制">
            <div class="tab-content">
        <!-- 播放控制 -->
              <div class="panel-section">
                <div class="section-title">
                  <ControlOutlined />
                  <span>播放控制</span>
          </div>
          
          <div class="control-buttons">
            <a-button 
              type="primary" 
              block 
              :loading="isPlaying"
              @click="playAll"
            >
                    <PlayCircleOutlined />
              全部播放
          </a-button>
            
            <a-button 
              block 
              :loading="isPausing"
              @click="pauseAll"
            >
                    <PauseCircleOutlined />
              全部暂停
            </a-button>
            
            <a-button 
              block 
              :loading="isRefreshing"
              @click="refreshAll"
            >
                    <ReloadOutlined />
              刷新画面
          </a-button>
        </div>
      </div>

              <!-- 播放设置 -->
              <div class="panel-section">
                <div class="section-title">
                  <PlayCircleOutlined />
                  <span>播放设置</span>
    </div>

                <div class="setting-list">
                  <div class="setting-item">
                    <span>自动轮播</span>
                    <a-switch v-model:checked="displaySettings.autoRotate" />
                  </div>
                  
                  <div class="setting-item">
                    <span>循环播放</span>
                    <a-switch v-model:checked="playbackSettings.loop" />
                  </div>
                  
                  <div class="setting-item">
                    <span>静音播放</span>
                    <a-switch v-model:checked="playbackSettings.mute" />
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 摄像头管理标签页 -->
          <a-tab-pane key="camera" tab="摄像头管理">
            <div class="tab-content">
              <!-- 摄像头列表 -->
              <div class="panel-section">
                <div class="section-title">
                  <VideoCameraOutlined />
                  <span>已配置摄像头</span>
                </div>
                
                <div class="camera-list-mini">
                  <div 
                    v-for="cell in matrixCells.filter(c => c.isActive)" 
                    :key="cell.id"
                    class="camera-item-mini"
                    :class="{ selected: selectedCellIndex === matrixCells.indexOf(cell) }"
                    @click="selectCell(matrixCells.indexOf(cell))"
                  >
                    <div class="camera-avatar-mini">
                      <a-avatar :style="{ backgroundColor: getStatusColor(cell.status) }" size="small">
                        <VideoCameraOutlined />
                      </a-avatar>
                    </div>
                    
                    <div class="camera-info-mini">
                      <div class="camera-name-mini">{{ cell.name }}</div>
                      <div class="camera-status-mini">
                        <a-tag :color="getStatusColor(cell.status)" size="small">
                          {{ getStatusText(cell.status) }}
                        </a-tag>
                      </div>
                    </div>
                    
                    <div class="camera-actions-mini">
                <a-button 
                  size="small" 
                  type="text"
                        @click.stop="toggleCell(matrixCells.indexOf(cell))"
                >
                  <PlayCircleOutlined v-if="!cell.isPlaying" />
                  <PauseCircleOutlined v-else />
                </a-button>
                    </div>
                  </div>
                  
                  <div v-if="matrixCells.filter(c => c.isActive).length === 0" class="no-cameras">
                    <VideoCameraOutlined class="no-cameras-icon" />
                    <p>暂无已配置摄像头</p>
                  </div>
                </div>
              </div>

              <!-- 快速操作 -->
              <div class="panel-section">
                <div class="section-title">
                  <ToolOutlined />
                  <span>快速操作</span>
                </div>
                
                <div class="quick-actions-mini">
                <a-button 
                    block 
                    @click="showCameraModal = true"
                  >
                    <PlusOutlined />
                    添加摄像头
                </a-button>
                  
                <a-button 
                    block 
                    @click="exportLayout"
                  >
                    <ExportOutlined />
                    导出配置
                </a-button>
              </div>
            </div>
            </div>
          </a-tab-pane>

          <!-- 系统设置标签页 -->
          <a-tab-pane key="settings" tab="系统设置">
            <div class="tab-content">
        <!-- 显示设置 -->
              <div class="panel-section">
                <div class="section-title">
                  <EyeOutlined />
                  <span>显示设置</span>
          </div>
          
          <div class="setting-list">
            <div class="setting-item">
                    <span>主题模式</span>
                    <a-select v-model:value="systemSettings.theme" size="small" style="width: 100px;">
                      <a-select-option value="light">浅色</a-select-option>
                      <a-select-option value="dark">深色</a-select-option>
                      <a-select-option value="auto">自动</a-select-option>
                    </a-select>
            </div>
            
            <div class="setting-item">
                    <span>语言设置</span>
                    <a-select v-model:value="systemSettings.language" size="small" style="width: 100px;">
                      <a-select-option value="zh">中文</a-select-option>
                      <a-select-option value="en">English</a-select-option>
                    </a-select>
            </div>
            
            <div class="setting-item">
                    <span>自动保存</span>
                    <a-switch v-model:checked="systemSettings.autoSave" />
                  </div>
                </div>
            </div>
            
              <!-- 性能设置 -->
              <div class="panel-section">
                <div class="section-title">
                  <DashboardOutlined />
                  <span>性能设置</span>
                </div>
                
                <div class="setting-list">
            <div class="setting-item">
                    <span>视频质量</span>
                    <a-select v-model:value="systemSettings.videoQuality" size="small" style="width: 100px;">
                      <a-select-option value="high">高清</a-select-option>
                      <a-select-option value="medium">标清</a-select-option>
                      <a-select-option value="low">流畅</a-select-option>
                    </a-select>
            </div>
                  
                  <div class="setting-item">
                    <span>帧率限制</span>
                    <a-select v-model:value="systemSettings.frameRate" size="small" style="width: 100px;">
                      <a-select-option value="30">30fps</a-select-option>
                      <a-select-option value="25">25fps</a-select-option>
                      <a-select-option value="15">15fps</a-select-option>
                    </a-select>
          </div>
        </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 中央视频矩阵 - 主要显示区域 -->
      <div class="center-matrix">
        <div class="matrix-header">
          <div class="matrix-info">
            <h3>{{ getCurrentLayoutName() }}</h3>
            <span class="camera-count">{{ activeCameraCount }}个摄像头</span>
          </div>
          
          <div class="matrix-actions">
            <a-button size="small" @click="refreshAll" :loading="isRefreshing">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button size="small" @click="fullscreenMode">
              <FullscreenOutlined />
              全屏
            </a-button>
          </div>
        </div>
        
        <div class="matrix-grid" :class="`layout-${currentLayout}`">

          
          <div 
            v-for="(cell, index) in matrixCells" 
            :key="`cell-${index}`"
            class="matrix-cell"
            :class="getCellClasses(cell, index)"
            @click="selectCell(index)"
            @dblclick="fullscreenCell(index)"
            @contextmenu="showCellMenu($event, index)"
          >
            <!-- 摄像头信息头部 - 始终显示 -->
            <div class="cell-header">
              <div class="camera-name">{{ cell.name || '未配置' }}</div>
              <div class="camera-status">
                <a-tag :color="getStatusColor(cell.status)" size="small">
                  {{ getStatusText(cell.status) }}
                </a-tag>
              </div>
            </div>

            <!-- 视频内容区域 -->
            <div class="cell-content">
              <div v-if="cell.isActive && cell.isPlaying" class="video-player">
                <div class="video-placeholder">
                  <VideoCameraOutlined class="video-icon" />
                  <div class="video-text">{{ cell.name }}</div>
                  <div class="video-location">{{ cell.location }}</div>
                  </div>
                
                <!-- 状态指示器 - 根据设置显示 -->
                <div class="status-indicators" v-if="displaySettings.showStatusIndicators">
                  <div v-if="cell.isRecording" class="recording-indicator">
                    <a-badge status="processing" text="录制" />
                  </div>
                  <div v-if="cell.hasAlarm" class="alarm-indicator">
                    <a-badge status="error" text="报警" />
                  </div>
                </div>
              </div>
              
              <div v-else-if="cell.isActive" class="video-paused">
                <PauseCircleOutlined class="pause-icon" />
                <div class="pause-text">已暂停</div>
                </div>
              
              <div v-else class="video-empty">
                <PlusOutlined class="add-icon" />
                <div class="add-text">添加摄像头</div>
                <a-button size="small" type="primary" @click="openPickerForCell(index)">
                  选择
                  </a-button>
                </div>
              </div>

            <!-- 摄像头信息底部 - 始终显示 -->
            <div class="cell-footer">
              <div class="camera-details">
                <span class="camera-ip">{{ cell.ip || '未配置' }}</span>
              </div>
            
              <div class="cell-controls">
                <a-button size="small" type="text" @click.stop="toggleCell(index)">
                  <PlayCircleOutlined v-if="!cell.isPlaying" />
                  <PauseCircleOutlined v-else />
                </a-button>
                
                <a-button size="small" type="text" @click.stop="openPtzControl(index)">
                  <ControlOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框保持不变 -->
    <a-modal
      v-model:open="showLayoutModal"
      title="选择分屏布局"
      :footer="null"
      width="800px"
      class="layout-modal"
    >
      <div class="layout-selector">
        <div class="layout-grid-large">
          <div 
            v-for="layout in layoutOptions" 
            :key="layout.value"
            class="layout-item-large"
            :class="{ active: currentLayout === layout.value }"
            @click="changeLayout(layout.value)"
          >
            <div class="layout-preview-large" :class="`preview-${layout.value}`">
              <div v-for="i in layout.cells" :key="i" class="preview-cell-large"></div>
            </div>
            
            <div class="layout-info-large">
              <h4 class="layout-name-large">{{ layout.name }}</h4>
              <p class="layout-desc-large">{{ layout.description }}</p>
              <div class="layout-features">
                <span class="feature-tag">{{ layout.cells }}个画面</span>
                <span class="feature-tag">{{ layout.recommended ? '推荐' : '标准' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 摄像头管理模态框 -->
    <a-modal
      v-model:open="showCameraModal"
      title="摄像头管理"
      :footer="null"
      width="900px"
      class="camera-modal"
    >
      <div class="camera-manager">
        <div class="search-filters">
        <a-input-search
          v-model:value="searchKeyword"
            placeholder="搜索摄像头名称或IP地址..."
            allow-clear
            style="width: 300px;"
          />
          
          <a-select
            v-model:value="filterStatus"
            placeholder="状态筛选"
            style="width: 120px;"
            allow-clear
          >
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
          </a-select>
          
          <a-select
            v-model:value="filterLocation"
            placeholder="位置筛选"
            style="width: 150px;"
            allow-clear
          >
            <a-select-option value="码头前沿">码头前沿</a-select-option>
            <a-select-option value="主航道">主航道</a-select-option>
            <a-select-option value="锚地区域">锚地区域</a-select-option>
          </a-select>
        </div>
        
        <div class="camera-list">
          <div 
            v-for="camera in filteredCameras" 
            :key="camera.id"
            class="camera-item"
            :class="{ 
              'online': camera.status === 'online',
              'offline': camera.status === 'offline',
              'selected': isCameraSelected(camera.id)
            }"
            @click="selectCamera(camera)"
          >
            <div class="camera-avatar">
              <a-avatar :style="{ backgroundColor: getStatusColor(camera.status) }">
                <VideoCameraOutlined />
              </a-avatar>
            </div>
            
              <div class="camera-details">
              <div class="camera-name">{{ camera.name }}</div>
              <div class="camera-location">{{ camera.location }}</div>
              <div class="camera-specs">
                <span class="spec-item">{{ camera.resolution }}</span>
                <span class="spec-item">{{ camera.fps }}fps</span>
                <span class="spec-item">{{ camera.ip }}</span>
              </div>
            </div>
            
            <div class="camera-actions">
              <a-button 
                size="small" 
                type="primary" 
                v-if="!isCameraSelected(camera.id)"
              >
                选择
              </a-button>
              <a-tag color="success" v-else>已选择</a-tag>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 摄像头选择器（空单元格直接选择） -->
    <a-modal
      v-model:open="pickerVisible"
      title="选择摄像头"
      width="800px"
      ok-text="关闭"
      :footer="null"
    >
      <a-input-search v-model:value="pickerKeyword" placeholder="搜索名称/IP/位置" style="margin-bottom:12px" />
      <a-table :columns="pickerColumns" :data-source="pickerList" row-key="id" size="small" :pagination="{ pageSize: 8 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'online' ? 'success' : 'error'">{{ record.status === 'online' ? '在线' : '离线' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="chooseForTarget(record)" :disabled="record.status !== 'online'">选择</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 云台控制模态框 -->
    <a-modal
      v-model:open="showPtzModal"
      title="云台控制"
      :footer="null"
      width="500px"
      class="ptz-modal"
    >
      <div class="ptz-control-panel">
        <div class="camera-info-header">
          <h4>{{ getSelectedCell()?.name }}</h4>
          <p>{{ getSelectedCell()?.location }}</p>
        </div>
        
        <div class="ptz-controls">
          <div class="speed-control">
            <span class="control-label">云台速度</span>
            <a-slider v-model:value="ptzSpeed" :min="1" :max="7" :marks="{1:'1',4:'4',7:'7'}" style="width: 220px; margin-left: 12px;" />
            <a-tag color="blue" style="margin-left:8px">{{ ptzSpeed }}</a-tag>
          </div>
          <!-- 方向控制 -->
          <div class="direction-controls">
          <div class="ptz-row">
              <a-button 
                shape="circle" 
                size="large" 
                @click="ptzMove('up')" 
                class="ptz-btn up"
              >
              <UpOutlined />
            </a-button>
          </div>
            
          <div class="ptz-row">
              <a-button 
                shape="circle" 
                size="large" 
                @click="ptzMove('left')" 
                class="ptz-btn left"
              >
              <LeftOutlined />
            </a-button>
              
              <a-button 
                shape="circle" 
                size="large" 
                @click="ptzMove('home')" 
                class="ptz-btn home"
              >
              <HomeOutlined />
            </a-button>
              
              <a-button 
                shape="circle" 
                size="large" 
                @click="ptzMove('right')" 
                class="ptz-btn right"
              >
              <RightOutlined />
            </a-button>
          </div>
            
          <div class="ptz-row">
              <a-button 
                shape="circle" 
                size="large" 
                @click="ptzMove('down')" 
                class="ptz-btn down"
              >
              <DownOutlined />
            </a-button>
          </div>
        </div>
        
          <!-- 变焦控制 -->
          <div class="zoom-controls">
            <span class="control-label">变焦控制</span>
            <div class="zoom-buttons">
              <a-button @click="ptzMove('zoomIn')" class="zoom-btn">
                <ZoomInOutlined />
                放大
              </a-button>
              <a-button @click="ptzMove('zoomOut')" class="zoom-btn">
                <ZoomOutOutlined />
                缩小
              </a-button>
            </div>
          </div>
          
          <!-- 预设位置 -->
          <div class="preset-controls">
            <span class="control-label">预设位置</span>
            <div class="preset-buttons">
              <a-button 
                size="小" 
                @click="ptzMove('preset1')"
                class="preset-btn"
              >
                位置1
            </a-button>
              <a-button 
                size="small" 
                @click="ptzMove('preset2')"
                class="preset-btn"
              >
                位置2
            </a-button>
              <a-button 
                size="small" 
                @click="ptzMove('preset3')"
                class="preset-btn"
              >
                位置3
            </a-button>
              <a-button 
                size="small" 
                @click="ptzMove('preset4')"
                class="preset-btn"
              >
                位置4
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 右键菜单 -->
    <a-dropdown
      v-model:open="showContextMenu"
      :trigger="['contextmenu']"
      placement="bottomRight"
    >
      <div class="context-menu-trigger"></div>
      <template #overlay>
        <a-menu @click="handleContextMenuClick">
          <a-menu-item key="play" v-if="canPlay()">
            <PlayCircleOutlined />
            播放
          </a-menu-item>
          <a-menu-item key="pause" v-if="canPause()">
            <PauseCircleOutlined />
            暂停
          </a-menu-item>
          <a-menu-item key="fullscreen">
            <FullscreenOutlined />
            全屏
          </a-menu-item>
          <a-menu-item key="ptz">
            <ControlOutlined />
            云台控制
          </a-menu-item>
          <a-menu-item key="snapshot">
            <CameraOutlined />
            截图
          </a-menu-item>
          <a-menu-item key="record" v-if="canStartRecording()">
            <VideoCameraOutlined />
            开始录制
          </a-menu-item>
          <a-menu-item key="stopRecord" v-if="canStopRecording()">
            <StopOutlined />
            停止录制
          </a-menu-item>
          <a-menu-item key="remove" v-if="canRemove()">
            <DeleteOutlined />
            移除
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  FullscreenOutlined,
  ControlOutlined,
  VideoCameraOutlined,
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  CloseOutlined,
  SettingOutlined,
  BorderOuterOutlined,
  AppstoreOutlined,
  ToolOutlined,
  EyeOutlined,
  LayoutOutlined,
  CameraOutlined,
  DeleteOutlined,
  StopOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons-vue'

/**
 * 视频矩阵组件
 * 支持多种分屏模式，同时监控多个摄像头
 * @author 系统开发团队
 * @version 2.0.0
 */

// ==================== 响应式数据 ====================

/** 当前分屏布局 */
const currentLayout = ref('4')

/** 模态框显示状态 */
const showLayoutModal = ref(false)
const showCameraModal = ref(false)
const showPtzModal = ref(false)
const showFullscreenModal = ref(false)
const ptzSpeed = ref(4)

/** 搜索和筛选 */
const searchKeyword = ref('')
const filterStatus = ref('')
const filterLocation = ref('')

/** 选中的单元格索引 */
const selectedCellIndex = ref<number>(-1)

/** 当前云台控制的摄像头 */
const currentPtzCamera = ref<any>(null)

/** 全屏摄像头 */
const fullscreenCamera = ref<any>(null)

// ==================== 加载状态 ====================

/** 播放状态 */
const isPlaying = ref(false)
const isPausing = ref(false)
const isRefreshing = ref(false)

// ==================== 显示设置 ====================

/** 显示配置 */
const displaySettings = ref({
  showInfo: true,
  showGrid: false,
  showTime: true,
  autoRotate: false,
  showStatusIndicators: true,
  showCameraDetails: true
})

/** 播放设置 */
const playbackSettings = ref({
  loop: false,
  mute: false
})

/** 系统设置 */
const systemSettings = ref({
  theme: 'light', // 'light', 'dark', 'auto'
  language: 'zh', // 'zh', 'en'
  autoSave: true,
  videoQuality: 'high', // 'high', 'medium', 'low'
  frameRate: '30' // '30', '25', '15'
})

// ==================== 分屏布局选项 ====================

/** 布局配置选项 */
const layoutOptions = ref([
  { 
    value: '1', 
    name: '单屏', 
    cells: 1, 
    description: '显示一个摄像头画面', 
    recommended: false 
  },
  { 
    value: '4', 
    name: '2×2', 
    cells: 4, 
    description: '显示四个摄像头画面', 
    recommended: true 
  },
  { 
    value: '9', 
    name: '3×3', 
    cells: 9, 
    description: '显示九个摄像头画面', 
    recommended: false 
  },
  { 
    value: '16', 
    name: '4×4', 
    cells: 16, 
    description: '显示十六个摄像头画面', 
    recommended: false 
  },
  { 
    value: 'custom', 
    name: '自定义', 
    cells: 0, 
    description: '自定义分屏布局', 
    recommended: false 
  }
])

// ==================== 矩阵单元格数据 ====================

/** 矩阵单元格数据 */
type MatrixCell = {
  id: number;
  name: string;
  isActive: boolean;
  isPlaying: boolean;
  status: string;
  statusClass: 'online' | 'offline' | string;
  location: string;
  ip: string;
  lastUpdate: string;
  resolution: string;
  fps: string;
  isRecording: boolean;
  hasAlarm: boolean;
}
const matrixCells = ref<MatrixCell[]>([])

// ==================== 可用摄像头列表 ====================

/** 可用摄像头列表 */
const availableCameras = ref([
  { id: 1, name: '码头1号', location: '码头前沿', ip: '192.168.1.101', resolution: '1080P', fps: '25', status: 'online', lastUpdate: '2025-08-26 14:30:25' },
  { id: 2, name: '码头2号', location: '码头前沿', ip: '192.168.1.102', resolution: '1080P', fps: '25', status: 'online', lastUpdate: '2025-08-26 14:30:22' },
  { id: 3, name: '航道1号', location: '主航道', ip: '192.168.1.103', resolution: '4K', fps: '30', status: 'offline', lastUpdate: '2025-08-26 14:25:18' },
  { id: 4, name: '锚地1号', location: '锚地区域', ip: '192.168.1.104', resolution: '1080P', fps: '25', status: 'online', lastUpdate: '2025-08-26 14:30:28' },
  { id: 5, name: '航道2号', location: '主航道', ip: '192.168.1.105', resolution: '4K', fps: '30', status: 'online', lastUpdate: '2025-08-26 14:30:20' },
  { id: 6, name: '码头3号', location: '码头前沿', ip: '192.168.1.106', resolution: '1080P', fps: '25', status: 'online', lastUpdate: '2025-08-26 14:30:15' }
])

/** 摄像头选择器 **/
const pickerVisible = ref(false)
const pickerTargetIndex = ref<number>(-1)
const pickerKeyword = ref('')
const pickerColumns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: 'IP', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' }
]
const pickerList = computed(() => {
  const kw = pickerKeyword.value.trim().toLowerCase()
  let list = availableCameras.value
  if (kw) {
    list = list.filter(c => c.name.toLowerCase().includes(kw) || c.ip.toLowerCase().includes(kw) || c.location.toLowerCase().includes(kw))
  }
  return list
})

const openPickerForCell = (index: number) => {
  pickerTargetIndex.value = index
  pickerVisible.value = true
}

const chooseForTarget = (cam: any) => {
  if (cam.status !== 'online') return
  const idx = pickerTargetIndex.value
  if (idx < 0 || idx >= matrixCells.value.length) return
  const cell = matrixCells.value[idx]
  cell.name = cam.name
  cell.isActive = true
  cell.isPlaying = true
  cell.status = cam.status === 'online' ? '在线' : '离线'
  cell.statusClass = cam.status === 'online' ? 'online' : 'offline'
  cell.location = cam.location
  cell.ip = cam.ip
  cell.lastUpdate = new Date().toLocaleString()
  cell.resolution = cam.resolution
  cell.fps = cam.fps
  cell.isRecording = false
  cell.hasAlarm = false
  pickerVisible.value = false
}

// ==================== 右键菜单 ====================

/** 右键菜单显示状态 */
const showContextMenu = ref(false)

/** 当前激活的标签页 */
const activeTab = ref('layout')

// ==================== 计算属性 ====================

/**
 * 筛选后的摄像头列表
 */
const filteredCameras = computed(() => {
  let filtered = availableCameras.value
  
  if (searchKeyword.value) {
    filtered = filtered.filter(camera => 
    camera.name.includes(searchKeyword.value) || 
    camera.ip.includes(searchKeyword.value)
  )
  }
  
  if (filterStatus.value) {
    filtered = filtered.filter(camera => camera.status === filterStatus.value)
  }
  
  if (filterLocation.value) {
    filtered = filtered.filter(camera => camera.location === filterLocation.value)
  }
  
  return filtered
})

/**
 * 在线摄像头数量
 */
const onlineCount = computed(() => {
  return matrixCells.value.filter(cell => cell.statusClass === 'online').length
})

/**
 * 离线摄像头数量
 */
const offlineCount = computed(() => {
  return matrixCells.value.filter(cell => cell.statusClass === 'offline').length
})

/**
 * 录制中摄像头数量
 */
const recordingCount = computed(() => {
  return matrixCells.value.filter(cell => cell.isRecording).length
})

/**
 * 活跃摄像头数量
 */
const activeCameraCount = computed(() => {
  return matrixCells.value.filter(cell => cell.isActive).length
})

// ==================== 方法 ====================

/**
 * 切换分屏布局
 * @param layout 布局值
 */
const changeLayout = (layout: string) => {
  currentLayout.value = layout
  if (layout === 'custom') {
    showLayoutModal.value = true
  } else {
  const cellCount = parseInt(layout)
  
    // 清空现有单元格
    matrixCells.value = []
    
    // 创建新的单元格
    for (let i = 0; i < cellCount; i++) {
      // 创建新的空单元格（默认未配置）
      matrixCells.value.push({
        id: i + 1,
        name: `摄像头${i + 1}`,
        isActive: false,
        isPlaying: false,
        status: '未配置',
        statusClass: 'offline',
        location: '未配置',
        ip: '未配置',
        lastUpdate: new Date().toLocaleString(),
        resolution: '',
        fps: '',
        isRecording: false,
        hasAlarm: false
      })
    }
  }
}

/**
 * 播放所有摄像头
 */
const playAll = async () => {
  isPlaying.value = true
  try {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  matrixCells.value.forEach(cell => {
    if (cell.isActive) {
      cell.isPlaying = true
    }
  })
  } finally {
    isPlaying.value = false
  }
}

/**
 * 暂停所有摄像头
 */
const pauseAll = async () => {
  isPausing.value = true
  try {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 500))
    
  matrixCells.value.forEach(cell => {
    cell.isPlaying = false
  })
  } finally {
    isPausing.value = false
  }
}

/**
 * 切换单元格播放状态
 * @param index 单元格索引
 */
const toggleCell = (index: number) => {
  if (index < 0 || index >= matrixCells.value.length) return
  
  const cell = matrixCells.value[index]
  if (cell.isActive) {
    cell.isPlaying = !cell.isPlaying
  } else {
    showCameraModal.value = true
  }
}

/**
 * 打开云台控制
 * @param index 单元格索引
 */
const openPtzControl = (index: number) => {
  if (index >= 0 && index < matrixCells.value.length) {
    currentPtzCamera.value = matrixCells.value[index]
    showPtzModal.value = true
  }
}

/**
 * 检查摄像头是否已选择
 * @param cameraId 摄像头ID
 * @returns 是否已选择
 */
const isCameraSelected = (cameraId: number) => {
  return matrixCells.value.some(cell => cell.id === cameraId && cell.isActive)
}

/**
 * 选择摄像头
 * @param camera 摄像头对象
 */
const selectCamera = (camera: any) => {
  if (!camera) return
  
  // 找到第一个未配置的单元格
  const emptyCell = matrixCells.value.find(cell => !cell.isActive)
  if (emptyCell) {
    emptyCell.name = camera.name
    emptyCell.isActive = true
    emptyCell.isPlaying = true
    emptyCell.status = camera.status === 'online' ? '在线' : '离线'
    emptyCell.statusClass = camera.status === 'online' ? 'online' : 'offline'
    emptyCell.location = camera.location
    emptyCell.ip = camera.ip
    emptyCell.lastUpdate = new Date().toLocaleString()
    emptyCell.resolution = camera.resolution
    emptyCell.fps = camera.fps
    emptyCell.isRecording = false
    emptyCell.hasAlarm = false
  }
  showCameraModal.value = false
}

/**
 * 选择单元格
 * @param index 单元格索引
 */
const selectCell = (index: number) => {
  if (index >= 0 && index < matrixCells.value.length) {
    selectedCellIndex.value = index
  }
}

/**
 * 全屏显示单元格
 * @param index 单元格索引
 */
const fullscreenCell = (index: number) => {
  if (index < 0 || index >= matrixCells.value.length) return
  
  const cell = matrixCells.value[index]
  if (!cell || !cell.isActive) return
  
  fullscreenCamera.value = { ...cell, index }
  showFullscreenModal.value = true
}

/**
 * 刷新所有画面
 */
const refreshAll = async () => {
  isRefreshing.value = true
  try {
    // 模拟异步刷新操作
    await new Promise(resolve => setTimeout(resolve, 1500))
    
  matrixCells.value.forEach(cell => {
    if (cell.isActive) {
      cell.lastUpdate = new Date().toLocaleString()
    }
  })
  } finally {
    isRefreshing.value = false
  }
}

/**
 * 导出布局配置
 */
const exportLayout = () => {
  const layout = {
    currentLayout: currentLayout.value,
    cells: matrixCells.value,
    displaySettings: displaySettings.value,
    timestamp: new Date().toISOString()
  }
  const dataStr = JSON.stringify(layout, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `video-matrix-layout-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 全屏模式
 */
const fullscreenMode = () => {
  showFullscreenModal.value = true
}

/**
 * 获取单元格CSS类名
 * @param cell 单元格对象
 * @param index 单元格索引
 * @returns CSS类名字符串
 */
const getCellClasses = (cell: any, index: number) => {
  const classes: string[] = []
  if (cell.isActive) {
    classes.push('active')
  }
  if (cell.isPlaying) {
    classes.push('playing')
  }
  if (cell.statusClass === 'offline') {
    classes.push('offline')
  }
  if (selectedCellIndex.value === index) {
    classes.push('selected')
  }
  if (cell.isRecording) {
    classes.push('recording')
  }
  if (cell.hasAlarm) {
    classes.push('alarm')
  }
  return classes.join(' ')
}

/**
 * 获取当前布局名称
 * @returns 布局名称
 */
const getCurrentLayoutName = () => {
  const layout = layoutOptions.value.find(l => l.value === currentLayout.value)
  return layout ? layout.name : '未知布局'
}

/**
 * 获取状态颜色
 * @param status 状态字符串
 * @returns 颜色值
 */
const getStatusColor = (status: string) => {
  if (status === '在线') return 'success'
  if (status === '离线') return 'error'
  if (status === '报警') return 'error'
  if (status === '录制中') return 'warning'
  return 'default'
}

/**
 * 获取状态文本
 * @param status 状态字符串
 * @returns 状态文本
 */
const getStatusText = (status: string) => {
  if (status === '在线') return '在线'
  if (status === '离线') return '离线'
  if (status === '报警') return '报警'
  if (status === '录制中') return '录制中'
  return status
}

/**
 * 获取选中的单元格
 * @returns 选中的单元格对象
 */
const getSelectedCell = () => {
  return matrixCells.value[selectedCellIndex.value]
}

/**
 * 添加摄像头到单元格
 * @param index 单元格索引
 */
const addCameraToCell = (index: number) => {
  if (index < 0 || index >= matrixCells.value.length) return
  openPickerForCell(index)
}

// 顶部按钮：优先对当前选中单元格打开选择器，若无选中则对第一个空位
const openPickerForSelectedOrFirst = () => {
  let target = selectedCellIndex.value
  if (target < 0) {
    target = matrixCells.value.findIndex(c => !c.isActive)
    if (target < 0) target = 0
  }
  openPickerForCell(target)
}

// ==================== 权限检查方法 ====================

/**
 * 检查是否可以播放
 * @returns 是否可以播放
 */
const canPlay = () => {
  return matrixCells.value.some(cell => cell.isActive && !cell.isPlaying)
}

/**
 * 检查是否可以暂停
 * @returns 是否可以暂停
 */
const canPause = () => {
  return matrixCells.value.some(cell => cell.isActive && cell.isPlaying)
}

/**
 * 检查是否可以开始录制
 * @returns 是否可以开始录制
 */
const canStartRecording = () => {
  return matrixCells.value.some(cell => cell.isActive && !cell.isRecording)
}

/**
 * 检查是否可以停止录制
 * @returns 是否可以停止录制
 */
const canStopRecording = () => {
  return matrixCells.value.some(cell => cell.isActive && cell.isRecording)
}

/**
 * 检查是否可以云台控制
 * @returns 是否可以云台控制
 */
const canPtzControl = () => {
  return currentPtzCamera.value !== null
}

/**
 * 检查是否可以移除
 * @returns 是否可以移除
 */
const canRemove = () => {
  return matrixCells.value.some(cell => cell.isActive)
}

/**
 * 检查是否可以截图
 * @returns 是否可以截图
 */
const canTakeSnapshot = () => {
  return matrixCells.value.some(cell => cell.isActive)
}

// ==================== 云台控制方法 ====================

/**
 * 云台移动控制
 * @param action 移动动作
 */
const ptzMove = (action: string) => {
  if (action && currentPtzCamera.value) {
    console.log('云台控制:', action, '速度:', ptzSpeed.value, '摄像头:', currentPtzCamera.value.name)
    
    // 这里可以添加实际的云台控制逻辑
    // 例如发送API请求到后端
  }
}

// ==================== 录制和截图方法 ====================

/**
 * 截图
 */
const takeSnapshot = () => {
  if (selectedCellIndex.value >= 0) {
    console.log('截图:', matrixCells.value[selectedCellIndex.value].name)
  }
}

/**
 * 开始录制
 */
const startRecording = () => {
  if (selectedCellIndex.value >= 0) {
    matrixCells.value[selectedCellIndex.value].isRecording = true
    setTimeout(() => {
      matrixCells.value[selectedCellIndex.value].isRecording = false
    }, 5000) // 5秒后停止录制
  }
}

/**
 * 停止录制
 */
const stopRecording = () => {
  if (selectedCellIndex.value >= 0) {
    matrixCells.value[selectedCellIndex.value].isRecording = false
  }
}

// ==================== 右键菜单方法 ====================

/**
 * 显示单元格右键菜单
 * @param event 鼠标事件
 * @param index 单元格索引
 */
const showCellMenu = (event: MouseEvent, index: number) => {
  selectedCellIndex.value = index
  showContextMenu.value = true
  event.preventDefault() // 阻止默认的右键菜单
}

/**
 * 处理右键菜单点击
 * @param e 菜单项事件
 */
const handleContextMenuClick = (e: any) => {
  const action = e.key
  if (action === 'play') {
    toggleCell(selectedCellIndex.value)
  } else if (action === 'pause') {
    toggleCell(selectedCellIndex.value)
  } else if (action === 'fullscreen') {
    fullscreenCell(selectedCellIndex.value)
  } else if (action === 'ptz') {
    openPtzControl(selectedCellIndex.value)
  } else if (action === 'snapshot') {
    takeSnapshot()
  } else if (action === 'record') {
    startRecording()
  } else if (action === 'stopRecord') {
    stopRecording()
  } else if (action === 'remove') {
    matrixCells.value[selectedCellIndex.value].isActive = false
    matrixCells.value[selectedCellIndex.value].isPlaying = false
    matrixCells.value[selectedCellIndex.value].status = '已移除'
    matrixCells.value[selectedCellIndex.value].statusClass = 'offline'
    matrixCells.value[selectedCellIndex.value].location = '已移除'
    matrixCells.value[selectedCellIndex.value].ip = '已移除'
    matrixCells.value[selectedCellIndex.value].lastUpdate = new Date().toLocaleString()
    selectedCellIndex.value = -1 // 取消选中
  }
  showContextMenu.value = false
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后的初始化
 */
onMounted(() => {
  console.log('视频矩阵组件已挂载')
  
  // 初始化布局为2×2
  changeLayout('4')
})
</script>

<style lang="less" scoped>
.video-matrix-container {
  height: 100vh; // 使用视口高度
  min-height: 100vh; // 强制最小高度
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  // ==================== 顶部导航栏 ====================
  .top-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 24px 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.3);

    .nav-left {
      .page-title {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 0 0 12px 0;
        color: #1a1a1a;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.5px;

        .title-icon {
          color: #1890ff;
          font-size: 36px;
        }
      }

      .breadcrumb {
        font-size: 16px;
        color: #666;
      display: flex;
      align-items: center;
        gap: 12px;

        .separator {
          color: #ccc;
        }

        .current {
          color: #1890ff;
        font-weight: 600;
        }
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 32px;

      .status-summary {
        display: flex;
        gap: 20px;

        .status-item {
        display: flex;
        align-items: center;
        gap: 12px;
          padding: 12px 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          min-width: 100px;
          justify-content: center;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #52c41a;
          }

          &.online .status-dot {
            background-color: #52c41a;
            }
          &.offline .status-dot {
            background-color: #ff4d4f;
            }
          &.recording .status-dot {
            background-color: #faad14;
            }

          span {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
          }
        }
      }

      .nav-actions {
        display: flex;
        gap: 16px;

        .ant-btn {
          border-radius: 12px;
          font-weight: 600;
          height: 48px;
          padding: 0 24px;
          font-size: 16px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }

  // ==================== 主要内容区域 ====================
  .main-content {
    display: flex;
    gap: 32px;
    flex: 1;
    min-height: 0;
    width: 100%;
    min-width: 1200px; // 强制最小宽度
    min-height: 800px; // 强制最小高度
    box-sizing: border-box;
  }

  // ==================== 左右面板 ====================
  .left-panel {
    flex: 0 0 380px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    flex-shrink: 0; // 防止被压缩
    min-height: 800px; // 强制最小高度
  }

  // ==================== 中央矩阵 ====================
  .center-matrix {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
    width: 100%;
    min-width: 600px; // 强制最小宽度
    min-height: 800px; // 强制最小高度
    box-sizing: border-box;
  }

  // ==================== 面板区域 ====================
  .panel-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.3);

    .section-title {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;

      .anticon {
        color: #1890ff;
        font-size: 24px;
      }
    }

    .layout-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .layout-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border: 2px solid #f0f0f0;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.8);

        &:hover {
          border-color: #1890ff;
          background: rgba(24, 144, 255, 0.05);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
        }

        &.active {
          border-color: #1890ff;
          background: rgba(24, 144, 255, 0.1);
          box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
        }

        .layout-preview {
          width: 100%;
          display: grid;
          gap: 3px;
          border-radius: 12px;
          overflow: hidden;
      padding: 8px;
          background: #f8fafc;
          min-height: 60px;

          &.preview-1 {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
      }

          &.preview-4 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }

          &.preview-9 {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
      }

          &.preview-16 {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr;
      }

          .preview-cell {
            background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
            border-radius: 6px;
            min-height: 12px;
          }
        }

        .layout-name {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }
      }
    }

    .control-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .ant-btn {
        height: 52px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .setting-list {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        span {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 16px;
        }

        .ant-switch {
          margin-left: 16px;
        }
      }
    }
  }

  // ==================== 矩阵头部 ====================
  .center-matrix {
  .matrix-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
      padding: 24px 32px;
      background: rgba(24, 144, 255, 0.05);
      border-bottom: 1px solid rgba(24, 144, 255, 0.1);

    .matrix-info {
      display: flex;
      align-items: baseline;
        gap: 16px;

        h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 24px;
          font-weight: 700;
        }

        .camera-count {
          font-size: 16px;
          color: #666;
          background: rgba(24, 144, 255, 0.1);
          padding: 6px 16px;
          border-radius: 24px;
          font-weight: 500;
      }
    }

    .matrix-actions {
      display: flex;
        gap: 12px;

        .ant-btn {
          border-radius: 10px;
          font-weight: 600;
          height: 40px;
          padding: 0 20px;
        }
      }
    }

    // ==================== 矩阵网格 ====================
  .matrix-grid {
    flex: 1;
    display: grid;
      gap: 20px;
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      position: relative;
      min-height: 600px;
      height: 100%; // 确保占满容器高度
      width: 100%;
      box-sizing: border-box;
      overflow: visible;

    &.layout-1 {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }

    &.layout-4 {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        min-height: 600px;
        height: 100%; // 确保2×2布局有足够高度
        /* 强制确保2x2布局 */
        grid-auto-flow: row dense;
    }

    &.layout-9 {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
    }

    &.layout-16 {
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
      }

      .matrix-cell {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
      border: 2px solid transparent;
        min-height: 280px;
        height: 100%; // 确保占满网格单元格高度
        min-width: 0; // 确保网格布局正常工作
        width: 100%;
        box-sizing: border-box;
        /* 强制显示 */
        flex-shrink: 0;
        flex-grow: 1;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }

        &.active {
          border-color: #1890ff;
        }
        
        &.playing {
          border-color: #52c41a;
        }
        
        &.offline {
          border-color: #ff4d4f;
          opacity: 0.8;
      }

      &.selected {
          border-color: #1890ff;
          box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
      }

      &.recording {
          border-color: #faad14;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
            height: 4px;
            background: linear-gradient(90deg, #faad14, #ff7875);
          animation: recording-pulse 2s infinite;
        }
      }

      &.alarm {
          border-color: #ff4d4f;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 77, 79, 0.1);
          animation: alarm-blink 1s infinite;
        }
      }

      .cell-header {
          padding: 16px 20px;
          background: rgba(24, 144, 255, 0.05);
          border-bottom: 1px solid rgba(24, 144, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;

            .camera-name {
            font-weight: 700;
            color: #1a1a1a;
            font-size: 16px;
        }

        .camera-status {
            .ant-tag {
              border-radius: 8px;
              font-weight: 600;
              font-size: 12px;
            }
        }
      }

      .cell-content {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
            position: relative;
          min-height: 200px;

            .video-player {
              width: 100%;
              height: 100%;
            }

            .video-placeholder {
              text-align: center;
              color: white;
            padding: 24px;

            .video-icon {
              font-size: 56px;
              margin-bottom: 20px;
              opacity: 0.8;
              color: #1890ff;
              }

              .video-text {
              font-size: 18px;
              margin-bottom: 12px;
              font-weight: 700;
          }

          .video-location {
              font-size: 14px;
              color: #ccc;
              margin-bottom: 12px;
            }
          }

          .video-paused {
            text-align: center;
            color: white;
            
            .pause-icon {
              font-size: 56px;
              margin-bottom: 20px;
              opacity: 0.8;
              color: #faad14;
            }
            
            .pause-text {
              font-size: 18px;
            margin-bottom: 12px;
              font-weight: 700;
            }
          }

          .video-empty {
            text-align: center;
            color: white;
            
            .add-icon {
              font-size: 72px;
              margin-bottom: 24px;
              opacity: 0.6;
              color: #52c41a;
            }
            
            .add-text {
              font-size: 20px;
              margin-bottom: 20px;
              font-weight: 600;
            }

            .ant-btn {
              border-radius: 10px;
              font-weight: 600;
              height: 40px;
              padding: 0 20px;
          }
        }

        .status-indicators {
          position: absolute;
            top: 16px;
            right: 16px;
          z-index: 10;
          display: flex;
          gap: 8px;
        }
      }

      .cell-footer {
          padding: 16px 20px;
          background: rgba(24, 144, 255, 0.05);
          border-top: 1px solid rgba(24, 144, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          font-size: 14px;

        .camera-details {
              display: flex;
              align-items: center;
            gap: 16px;
            color: #666;
            font-weight: 500;
          }

          .cell-controls {
            display: flex;
          gap: 8px;

            .ant-btn {
              border-radius: 8px;
              height: 32px;
              padding: 0 12px;
            }
          }
        }
      }
    }
  }

  // ==================== 左侧控制面板 - 使用tabs组织功能 ====================
  .left-panel {
    .control-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-tabs-content-holder {
        flex: 1;
        overflow-y: auto;
      }

      .ant-tabs-content {
        height: 100%;
      }

      .ant-tabs-tabpane {
        height: 100%;
      }

      .ant-tabs-tab {
        font-size: 18px;
        font-weight: 600;
        color: #666;
        padding: 16px 24px;
        margin: 0;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          color: #1890ff;
        }

        &.ant-tabs-tab-active {
          color: #1890ff;
          border-bottom-color: #1890ff;
        }
      }

      .ant-tabs-tab-btn {
        font-size: 16px;
        font-weight: 600;
      }

      .ant-tabs-ink-bar {
        background: #1890ff;
        height: 3px;
        border-radius: 2px;
      }
    }

    .tab-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 8px 0;
    }

    .panel-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.3);

      .section-title {
        display: flex;
      align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;

      .anticon {
          color: #1890ff;
          font-size: 24px;
        }
      }

      .layout-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

    .layout-item {
        display: flex;
      flex-direction: column;
        align-items: center;
          gap: 16px;
          padding: 20px;
          border: 2px solid #f0f0f0;
          border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        
        &:hover {
            border-color: #1890ff;
        background: rgba(24, 144, 255, 0.05);
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
      }

      &.active {
            border-color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
            box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
      }

      .layout-preview {
        width: 100%;
        display: grid;
            gap: 3px;
            border-radius: 12px;
        overflow: hidden;
            padding: 8px;
            background: #f8fafc;
            min-height: 60px;

        &.preview-1 {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }

        &.preview-4 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        &.preview-9 {
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
        }

        &.preview-16 {
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr 1fr;
        }

        .preview-cell {
              background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
              border-radius: 6px;
              min-height: 12px;
            }
          }

        .layout-name {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
          }
      }
    }

    .setting-list {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
          margin-bottom: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }

          span {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 16px;
        }

        .ant-switch {
            margin-left: 16px;
          }

          .ant-select {
            .ant-select-selector {
              border-radius: 8px;
              border: 1px solid #d9d9d9;
            }
          }
        }
      }

      .control-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .ant-btn {
          height: 52px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
        }
      }

      // 摄像头列表样式
      .camera-list-mini {
        .camera-item-mini {
        display: flex;
        align-items: center;
          gap: 12px;
        padding: 16px;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        
        &:hover {
            border-color: #1890ff;
            background: rgba(24, 144, 255, 0.05);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
        }
        
        &.selected {
            border-color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
            box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
          }

          .camera-avatar-mini {
            flex-shrink: 0;
          }

          .camera-info-mini {
          flex: 1;
            min-width: 0;

            .camera-name-mini {
              font-weight: 600;
              color: #1a1a1a;
              font-size: 14px;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .camera-status-mini {
              .ant-tag {
                border-radius: 6px;
                font-size: 11px;
                padding: 2px 6px;
              }
            }
          }

          .camera-actions-mini {
            flex-shrink: 0;

            .ant-btn {
              border-radius: 6px;
              height: 28px;
              padding: 0 8px;
              color: #1890ff;

              &:hover {
                background: rgba(24, 144, 255, 0.1);
              }
            }
          }
        }

        .no-cameras {
        text-align: center;
          padding: 32px 16px;
          color: #666;

          .no-cameras-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
            color: #1890ff;
          }

          p {
          margin: 0;
            font-size: 14px;
            font-weight: 500;
          }
        }
      }

      // 快速操作样式
      .quick-actions-mini {
      display: flex;
      flex-direction: column;
          gap: 12px;

        .ant-btn {
          height: 44px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }

  // ==================== 右侧信息面板 ====================
  // 已移除右侧面板，相关样式已删除

  // ==================== 模态框样式 ====================
  .layout-modal, .camera-modal, .ptz-modal {
    .ant-modal-content {
      border-radius: 20px;
      overflow: hidden;
    }

    .ant-modal-header {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      border-bottom: none;

      .ant-modal-title {
          color: white;
        font-weight: 700;
        font-size: 18px;
      }
    }
  }

  /* 云台控制美化 */
  .ptz-modal {
    .ptz-control-panel {
      padding: 8px 4px 16px 4px;

      .camera-info-header {
        text-align: center;
        margin-bottom: 8px;
        h4 { margin: 0; font-weight: 700; }
        p { margin: 4px 0 0 0; color: #8c8c8c; font-size: 12px; }
      }

      .ptz-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        .speed-control {
          grid-column: 1 / span 2;
          display: flex;
          align-items: center;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 10px 12px;
          .control-label { font-weight: 600; color: #1a1a1a; }
        }

        .direction-controls,
        .zoom-controls,
        .preset-controls {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }

        .direction-controls {
          .ptz-row { margin: 6px 0; }
          .ptz-btn {
            width: 56px; height: 56px; font-size: 18px;
            &:hover { filter: brightness(1.05); }
          }
          .ptz-btn.up { background: #f6ffed; border-color: #52c41a; color: #52c41a; }
          .ptz-btn.down { background: #fff7e6; border-color: #fa8c16; color: #fa8c16; }
          .ptz-btn.left { background: #f0f5ff; border-color: #1890ff; color: #1890ff; }
          .ptz-btn.right { background: #f9f0ff; border-color: #722ed1; color: #722ed1; }
          .ptz-btn.home { background: #e6f7ff; border-color: #69c0ff; color: #1890ff; }
        }

        .zoom-controls {
          .zoom-buttons { display:flex; gap:8px; justify-content:center; }
          .zoom-btn { border-radius: 10px; }
        }

        .preset-controls {
          .control-label { font-weight: 600; }
          .preset-buttons { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
          .preset-btn { border-radius: 8px; }
        }
      }
    }
  }

  // ==================== 动画效果 ====================
  @keyframes recording-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes alarm-blink {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.3; }
  }

  // ==================== 响应式设计 ====================
  @media (max-width: 1400px) {
    .left-panel {
      flex: 0 0 360px;
    }
  }

  @media (max-width: 1200px) {
    .main-content {
      flex-direction: column;
    }
    
    .left-panel {
      flex: none;
      width: 100%;
    }

    .left-panel {
      .control-tabs {
        .ant-tabs-tab {
            font-size: 16px;
          padding: 12px 20px;
        }
      }

      .tab-content {
        gap: 20px;
      }

      .panel-section {
        padding: 24px;
      }
    }
  }

  @media (max-width: 768px) {
    .video-matrix-container {
        padding: 16px;
    }

    .top-navbar {
      flex-direction: column;
      gap: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;

      .nav-left {
          width: 100%;
        text-align: center;

        .page-title {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .breadcrumb {
          font-size: 14px;
        }
      }

      .nav-right {
        width: 100%;
        justify-content: center;
        gap: 20px;

        .status-summary {
          gap: 16px;

          .status-item {
            padding: 8px 16px;
            font-size: 14px;
          }
        }

        .nav-actions {
          gap: 12px;

          .ant-btn {
            height: 40px;
            font-size: 14px;
          }
        }
      }
    }

    .main-content {
      gap: 20px;
    }

    .left-panel {
      .control-tabs {
        .ant-tabs-tab {
          font-size: 14px;
          padding: 10px 16px;
        }
      }

      .tab-content {
        gap: 16px;
      }

      .panel-section {
        padding: 20px;

        .section-title {
          font-size: 18px;
          margin-bottom: 20px;
          
          .anticon {
            font-size: 20px;
          }
        }

        .layout-grid {
          grid-template-columns: 1fr;
          gap: 12px;

          .layout-item {
            padding: 16px;
          }
        }

        .control-buttons {
          gap: 12px;

          .ant-btn {
            height: 44px;
            font-size: 14px;
          }
        }

        .camera-list-mini {
          .camera-item-mini {
            padding: 12px;
            margin-bottom: 8px;
          }
        }

        .quick-actions-mini {
          gap: 10px;

          .ant-btn {
            height: 40px;
            font-size: 14px;
          }
        }
      }
    }

    .center-matrix {
      .matrix-header {
        padding: 16px 20px;
        flex-direction: column;
        gap: 16px;
        text-align: center;

        .matrix-info {
          h3 {
            font-size: 20px;
          }

          .camera-count {
            font-size: 14px;
          }
        }

        .matrix-actions {
          gap: 10px;

          .ant-btn {
            height: 36px;
            font-size: 14px;
          }
        }
      }

      .matrix-grid {
        padding: 16px;
        gap: 16px;

        .matrix-cell {
          min-height: 240px;

          .cell-header {
            padding: 12px 16px;

            .camera-name {
              font-size: 14px;
            }
          }

          .cell-content {
            min-height: 160px;

            .video-placeholder {
      padding: 16px;

              .video-icon {
                font-size: 32px;
                margin-bottom: 12px;
              }

              .video-text {
            font-size: 16px;
                margin-bottom: 8px;
          }

              .video-location {
                font-size: 12px;
        }
      }
      
.video-paused {
        padding: 16px;
  
  .pause-icon {
                font-size: 32px;
    margin-bottom: 12px;
  }
  
  .pause-text {
    font-size: 16px;
  }
}

.video-empty {
              padding: 16px;
  
  .add-icon {
                font-size: 32px;
                margin-bottom: 12px;
  }
  
  .add-text {
                font-size: 16px;
    margin-bottom: 12px;
              }

              .ant-btn {
                height: 32px;
                font-size: 12px;
              }
            }
          }

          .cell-footer {
            padding: 12px 16px;

            .camera-details {
              font-size: 12px;
            }

            .cell-controls {
              gap: 6px;

              .ant-btn {
                height: 28px;
                padding: 0 6px;
              }
            }
          }
        }
      }
    }
  }

  // ==================== 动画效果 ====================
  @keyframes recording-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes alarm-blink {
    0%, 100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.3;
    }
  }

  // ==================== 滚动条样式 ====================
  .ant-tabs-content-holder {
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(24, 144, 255, 0.3);
      border-radius: 3px;
        
        &:hover {
        background: rgba(24, 144, 255, 0.5);
      }
    }
  }
}

// ==================== 全局样式优化 ====================
.video-matrix-container {
  * {
    box-sizing: border-box;
  }
  
  // 确保没有意外的边框和背景
  .debug-area,
  .debug-lines {
    display: none !important;
  }
  
  // 确保矩阵容器正确显示
  .center-matrix {
    position: relative;
    z-index: 1;
    
    .matrix-grid {
      position: relative;
      z-index: 1;
    }
  }
  
  // 修复可能的底部样式问题
  &::after,
  &::before {
    display: none !important;
  }
  
  // 确保所有子元素没有意外的边框
  > * {
    border: none !important;
    outline: none !important;
    
    &::after,
    &::before {
      border: none !important;
      outline: none !important;
    }
  }
  
  // 移除可能的红色边框
  .red-border,
  .debug-border {
    border: none !important;
    background: none !important;
  }
}

// ==================== 右键菜单触发器 ====================
.context-menu-trigger {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

// 摄像头列表样式
.camera-list-mini {
  .camera-item-mini {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);

      &:hover {
      border-color: #1890ff;
      background: rgba(24, 144, 255, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
    }

    &.selected {
      border-color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
      box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
    }

    .camera-avatar-mini {
      flex-shrink: 0;
    }

    .camera-info-mini {
      flex: 1;
      min-width: 0;

      .camera-name-mini {
        font-weight: 600;
        color: #1a1a1a;
        font-size: 14px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .camera-status-mini {
        .ant-tag {
          border-radius: 6px;
          font-size: 11px;
          padding: 2px 6px;
        }
      }
    }

    .camera-actions-mini {
      flex-shrink: 0;

      .ant-btn {
        border-radius: 6px;
        height: 28px;
        padding: 0 8px;
        color: #1890ff;

        &:hover {
          background: rgba(24, 144, 255, 0.1);
        }
      }
    }
  }

  .no-cameras {
        text-align: center;
    padding: 32px 16px;
    color: #666;

    .no-cameras-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
      color: #1890ff;
        }

        p {
          margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

// 快速操作样式
.quick-actions-mini {
      display: flex;
  flex-direction: column;
      gap: 12px;

  .ant-btn {
    height: 44px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
        transition: all 0.3s ease;
        
        &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>

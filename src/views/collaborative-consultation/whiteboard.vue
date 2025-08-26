<template>
  <div class="whiteboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>电子白板</h1>
      <p>支持多人协作绘图、标注、文档展示等功能的电子白板</p>
    </div>

    <!-- 白板状态概览 -->
    <a-card class="status-overview" title="白板状态概览">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="当前白板数" :value="whiteboardStats.activeBoards" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="在线协作者" :value="whiteboardStats.onlineCollaborators" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="内容数量" :value="whiteboardStats.contentCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="协作质量" :value="whiteboardStats.collaborationQuality" suffix="%" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="今日创建" :value="whiteboardStats.todayCreated" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总协作时长" :value="whiteboardStats.totalCollaborationTime" suffix="小时" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="平均参与者" :value="whiteboardStats.avgParticipants" suffix="人" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="保存率" :value="whiteboardStats.saveRate" suffix="%" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 白板工作区域 -->
    <a-row :gutter="16" class="whiteboard-workspace">
      <!-- 白板主区域 -->
      <a-col :span="18">
        <a-card title="白板工作区" class="whiteboard-main">
          <!-- 顶部属性栏 -->
          <div class="property-bar">
            <a-space wrap>
              <span>画笔颜色</span>
              <a-color-picker v-model:value="penColor" />
              <span>粗细</span>
              <a-slider v-model:value="strokeWidth" :min="1" :max="20" style="width: 160px" />
              <span>填充</span>
              <a-color-picker v-model:value="fillColor" />
              <a-switch v-model:checked="showGrid" />
              <span>显示网格</span>
              <a-switch v-model:checked="snapToGrid" />
              <span>吸附对齐</span>
              <a-tag :color="isAutosaving ? 'orange' : 'green'">{{ isAutosaving ? '自动保存中…' : '已自动保存' }}</a-tag>
            </a-space>
          </div>

          <div class="canvas-and-toolbar">
            <!-- 左侧垂直工具栏 -->
            <div class="left-tools">
              <a-tooltip placement="right" title="画笔">
                <a-button :type="currentTool==='pen' ? 'primary' : 'default'" @click="setTool('pen')"><EditOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="高亮">
                <a-button :type="currentTool==='highlighter' ? 'primary' : 'default'" @click="setTool('highlighter')"><HighlightOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="文字">
                <a-button :type="currentTool==='text' ? 'primary' : 'default'" @click="setTool('text')"><FontSizeOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="图片">
                <a-button :type="currentTool==='image' ? 'primary' : 'default'" @click="setTool('image')"><PictureOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="图形">
                <a-button :type="currentTool==='shape' ? 'primary' : 'default'" @click="setTool('shape')"><AppstoreOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="选择">
                <a-button :type="currentTool==='select' ? 'primary' : 'default'" @click="setTool('select')"><ScissorOutlined /></a-button>
              </a-tooltip>
              <a-divider />
              <a-tooltip placement="right" title="撤销">
                <a-button :disabled="!canUndo" @click="undo"><UndoOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="重做">
                <a-button :disabled="!canRedo" @click="redo"><RedoOutlined /></a-button>
              </a-tooltip>
              <a-tooltip placement="right" title="清除">
                <a-button @click="clearCanvas"><DeleteOutlined /></a-button>
              </a-tooltip>
            </div>

            <!-- 白板画布 -->
            <div class="whiteboard-canvas">
              <div class="canvas-placeholder" :class="{ 'grid-bg': showGrid }">
                <a-icon type="edit" />
                <p>白板画布区域</p>
                <div class="canvas-info">
                  <span>尺寸: {{ canvasSizeText }}</span>
                  <span>缩放: {{ zoomPercent }}%</span>
                  <span>模式: 协作模式</span>
                </div>
              </div>
              <!-- 迷你地图（占位） -->
              <div class="minimap">
                <div class="minimap-title">迷你地图</div>
                <div class="minimap-box"></div>
              </div>
            </div>
          </div>

          <!-- 底部状态栏 -->
          <div class="status-bar">
            <span>工具: {{ toolMap[currentTool] }}</span>
            <span>颜色: <i class="color-dot" :style="{ background: penColor }"></i></span>
            <span>粗细: {{ strokeWidth }} px</span>
            <a-space>
              <a-button size="small" @click="zoomOut">-</a-button>
              <span class="zoom-text">{{ zoomPercent }}%</span>
              <a-button size="small" @click="zoomIn">+</a-button>
              <a-button size="small" @click="resetZoom">重置</a-button>
            </a-space>
          </div>

          <!-- 白板信息 -->
          <div class="whiteboard-info">
            <a-descriptions :column="4" bordered>
              <a-descriptions-item label="白板ID">WB-2025-001</a-descriptions-item>
              <a-descriptions-item label="创建者">陈志强</a-descriptions-item>
              <a-descriptions-item label="创建时间">2025-08-26 09:00:00</a-descriptions-item>
              <a-descriptions-item label="最后修改">2分钟前</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧：图层与协作控制面板 -->
      <a-col :span="6">
        <a-card title="图层与协作" class="collaboration-panel">
          <!-- 图层面板 -->
          <div class="layers-panel">
            <h4>图层</h4>
            <div class="layer-actions">
              <a-button size="small" @click="addLayer">新建图层</a-button>
            </div>
            <div class="layer-list">
              <div class="layer-item" v-for="layer in layers" :key="layer.id" :class="{ active: layer.id===activeLayerId }">
                <a-switch v-model:checked="layer.visible" size="small" />
                <a-input size="small" v-model:value="layer.name" style="width: 90px; margin: 0 6px" />
                <a-button size="small" @click="moveLayerUp(layer.id)" :disabled="!canMoveUp(layer.id)">上移</a-button>
                <a-button size="small" @click="moveLayerDown(layer.id)" :disabled="!canMoveDown(layer.id)">下移</a-button>
                <a-button size="small" danger @click="removeLayer(layer.id)">删</a-button>
              </div>
            </div>
          </div>

          <!-- 协作状态 -->
          <div class="collaboration-status">
            <h4>协作状态</h4>
            <a-tag color="green">协作中</a-tag>
            <a-tag color="blue">{{ whiteboardStats.onlineCollaborators }}人在线</a-tag>
          </div>

          <!-- 协作者列表 -->
          <div class="collaborators-list">
            <h4>协作者</h4>
            <div class="collaborator-item" v-for="collaborator in paginatedCollaborators" :key="collaborator.id">
              <a-avatar :src="collaborator.avatar" :size="32" />
              <div class="collaborator-info">
                <div class="collaborator-name">{{ collaborator.name }}</div>
                <div class="collaborator-role">{{ collaborator.role }}</div>
                <div class="collaborator-department">{{ collaborator.department }}</div>
                <div class="collaborator-last-action">{{ collaborator.lastAction }}</div>
              </div>
              <a-tag :color="collaborator.status === 'active' ? 'green' : 'gray'" size="small">
                {{ collaborator.status === 'active' ? '活跃' : '空闲' }}
              </a-tag>
            </div>
            <div style="text-align: center; margin-top: 8px;">
              <a-pagination
                v-model:current="collaboratorsPagination.current"
                :page-size="collaboratorsPagination.pageSize"
                :total="collaborators.length"
                :show-size-changer="false"
                size="small"
                @change="handleCollaboratorsPageChange"
              />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 内容管理 -->
    <a-card title="内容管理" class="content-management">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="boards" tab="白板列表">
          <a-table :columns="boardColumns" :data-source="whiteboards" :pagination="{ pageSize: 10 }">
            <template #action="{ record }">
              <a-button type="link" size="small" @click="openBoard(record)">
                <template #icon><EyeOutlined /></template>
                打开
              </a-button>
              <a-button type="link" size="small" @click="editBoard(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="deleteBoard(record)">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="templates" tab="模板库">
          <div class="template-grid">
            <div class="template-item" v-for="template in templates" :key="template.id">
              <div class="template-preview">
                <a-icon :type="template.icon" />
              </div>
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
                <a-button type="primary" size="small" @click="useTemplate(template)">
                  使用模板
                </a-button>
              </div>
            </div>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="history" tab="历史记录">
          <a-timeline>
            <a-timeline-item v-for="history in historyRecords" :key="history.id">
              <p>{{ history.action }}</p>
              <p class="history-time">{{ history.time }}</p>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 白板设置模态框 -->
    <a-modal
      v-model:visible="settingsModalVisible"
      title="白板设置"
      width="600px"
      @ok="saveSettings"
    >
      <a-form :model="whiteboardSettings" layout="vertical">
        <a-form-item label="画布尺寸">
          <a-select v-model:value="whiteboardSettings.canvasSize">
            <a-select-option value="1920x1080">1920x1080 (16:9)</a-select-option>
            <a-select-option value="1366x768">1366x768 (16:9)</a-select-option>
            <a-select-option value="1024x768">1024x768 (4:3)</a-select-option>
            <a-select-option value="custom">自定义</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="背景颜色">
          <a-color-picker v-model:value="whiteboardSettings.backgroundColor" />
        </a-form-item>
        
        <a-form-item label="网格显示">
          <a-switch v-model:checked="whiteboardSettings.showGrid" />
        </a-form-item>
        
        <a-form-item label="自动保存">
          <a-switch v-model:checked="whiteboardSettings.autoSave" />
        </a-form-item>
        
        <a-form-item label="保存间隔(分钟)">
          <a-input-number v-model:value="whiteboardSettings.saveInterval" :min="1" :max="60" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  EditOutlined,
  HighlightOutlined,
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  ScissorOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  SaveOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  EyeOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'

/** 白板运行时状态 */
const currentTool = ref<'pen'|'highlighter'|'text'|'image'|'shape'|'select'>('pen')
const zoomPercent = ref(100)
const historyStack = ref<any[]>([])
const redoStack = ref<any[]>([])
const canUndo = computed(() => historyStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

/**
 * 设置当前工具
 * @param tool 工具名称
 */
const setTool = (tool: 'pen'|'highlighter'|'text'|'image'|'shape'|'select') => {
  currentTool.value = tool
  message.success(`已切换到 ${toolMap[tool]} 工具`)
}

const toolMap: Record<string, string> = {
  pen: '画笔',
  highlighter: '高亮',
  text: '文字',
  image: '图片',
  shape: '图形',
  select: '选择'
}

/** 撤销 */
const undo = () => {
  if (!canUndo.value) return
  const last = historyStack.value.pop()
  redoStack.value.push(last)
  // 这里应触发画布重绘
  message.info('已撤销一步')
}

/** 重做 */
const redo = () => {
  if (!canRedo.value) return
  const step = redoStack.value.pop()
  historyStack.value.push(step)
  // 这里应触发画布重绘
  message.info('已重做一步')
}

/** 清空画布 */
const clearCanvas = () => {
  historyStack.value = []
  redoStack.value = []
  // 这里应清空画布
  message.success('画布已清空')
}

/** 保存 */
const saveBoard = () => {
  message.success('白板内容已保存（模拟）')
}

/** 导出 */
const exportBoard = () => {
  message.success('已导出PNG（模拟）')
}

/** 分享 */
const shareBoard = () => {
  message.info('已生成分享链接（模拟）')
}

/** 缩放控制 */
const zoomIn = () => { zoomPercent.value = Math.min(300, zoomPercent.value + 10) }
const zoomOut = () => { zoomPercent.value = Math.max(10, zoomPercent.value - 10) }
const resetZoom = () => { zoomPercent.value = 100 }

// 画笔/属性
const penColor = ref<string>('#1677ff')
const fillColor = ref<string>('#ffffff')
const strokeWidth = ref<number>(4)
const showGrid = ref<boolean>(true)
const snapToGrid = ref<boolean>(true)

// 自动保存指示（模拟）
const isAutosaving = ref(false)
let autosaveTimer: number | null = null
let overviewTimer: number | null = null

// 图层（简单模拟）
interface Layer { id: number; name: string; visible: boolean }
const layers = ref<Layer[]>([
  { id: 1, name: '背景', visible: true },
  { id: 2, name: '标注', visible: true },
  { id: 3, name: '图形', visible: true }
])
const activeLayerId = ref<number>(3)
const canMoveUp = (id: number) => layers.value.findIndex(l => l.id === id) > 0
const canMoveDown = (id: number) => layers.value.findIndex(l => l.id === id) < layers.value.length - 1
const addLayer = () => {
  const id = Math.max(...layers.value.map(l => l.id)) + 1
  layers.value.unshift({ id, name: `图层${id}`, visible: true })
  activeLayerId.value = id
  message.success('已新建图层')
}
const removeLayer = (id: number) => {
  if (layers.value.length <= 1) return message.warning('至少保留一个图层')
  layers.value = layers.value.filter(l => l.id !== id)
  activeLayerId.value = layers.value[0].id
}
const moveLayerUp = (id: number) => {
  const i = layers.value.findIndex(l => l.id === id)
  if (i <= 0) return
  const arr = [...layers.value]
  const [item] = arr.splice(i, 1)
  arr.splice(i - 1, 0, item)
  layers.value = arr
}
const moveLayerDown = (id: number) => {
  const i = layers.value.findIndex(l => l.id === id)
  if (i < 0 || i >= layers.value.length - 1) return
  const arr = [...layers.value]
  const [item] = arr.splice(i, 1)
  arr.splice(i + 1, 0, item)
  layers.value = arr
}

// 白板统计数据
const whiteboardStats = reactive({
  activeBoards: 8,
  onlineCollaborators: 15,
  contentCount: 125,
  collaborationQuality: 88,
  todayCreated: 23,
  totalCollaborationTime: 67.5,
  avgParticipants: 8.3,
  saveRate: 97.8
})

// 协作者数据（更新为更真实中文姓名）
const collaborators = ref([
  { id: 1, name: '陈志强', avatar: '', status: 'active', role: '主持人', department: '调度中心', lastAction: '绘制图形' },
  { id: 2, name: '刘建国', avatar: '', status: 'active', role: '参与者', department: '海事部门', lastAction: '添加文字' },
  { id: 3, name: '王海峰', avatar: '', status: 'active', role: '参与者', department: '港口管理', lastAction: '高亮标注' },
  { id: 4, name: '赵明华', avatar: '', status: 'active', role: '参与者', department: '应急响应', lastAction: '插入图片' },
  { id: 5, name: '钱伟民', avatar: '', status: 'active', role: '参与者', department: '船舶公司', lastAction: '绘制线条' },
  { id: 6, name: '孙志刚', avatar: '', status: 'idle', role: '参与者', department: '气象部门', lastAction: '查看内容' },
  { id: 7, name: '周建军', avatar: '', status: 'active', role: '参与者', department: '安全监督', lastAction: '编辑文字' },
  { id: 8, name: '吴建华', avatar: '', status: 'active', role: '参与者', department: '技术保障', lastAction: '移动元素' }
])

// 协作者分页
const collaboratorsPagination = reactive({ current: 1, pageSize: 3 })
const paginatedCollaborators = computed(() => {
  const start = (collaboratorsPagination.current - 1) * collaboratorsPagination.pageSize
  const end = start + collaboratorsPagination.pageSize
  return collaborators.value.slice(start, end)
})
const handleCollaboratorsPageChange = (current: number) => { collaboratorsPagination.current = current }

// 协作设置
const collaborationSettings = reactive({
  permission: 'edit',
  realTimeSync: true,
  conflictResolution: 'last-wins'
})

// 白板列表数据
/**
 * 白板列表（使用更真实的中文姓名作为创建者）
 */
const whiteboards = ref([
  {
    id: 1,
    name: '船舶调度方案讨论',
    creator: '陈志强',
    createTime: '2025-08-20 09:00:00',
    lastModified: '2025-08-20 10:30:00',
    collaborators: 8,
    status: '活跃',
    department: '调度中心',
    type: '方案讨论'
  },
  {
    id: 2,
    name: '港口安全设计评审',
    creator: '刘建国',
    createTime: '2025-08-20 08:00:00',
    lastModified: '2025-08-20 09:15:00',
    collaborators: 6,
    status: '活跃',
    department: '安全监督',
    type: '设计评审'
  },
  {
    id: 3,
    name: '应急预案流程图',
    creator: '王海峰',
    createTime: '2025-08-20 14:00:00',
    lastModified: '2025-08-20 15:45:00',
    collaborators: 7,
    status: '活跃',
    department: '应急响应',
    type: '流程设计'
  },
  {
    id: 4,
    name: '技术架构图',
    creator: '赵明华',
    createTime: '2025-08-19 10:00:00',
    lastModified: '2025-08-19 16:30:00',
    collaborators: 5,
    status: '完成',
    department: '技术保障',
    type: '技术设计'
  },
  {
    id: 5,
    name: '培训课程大纲',
    creator: '钱伟民',
    createTime: '2025-08-19 15:00:00',
    lastModified: '2025-08-19 17:00:00',
    collaborators: 4,
    status: '完成',
    department: '技术保障',
    type: '培训材料'
  },
  {
    id: 6,
    name: '项目进度跟踪',
    creator: '孙志刚',
    createTime: '2025-08-18 09:00:00',
    lastModified: '2025-08-18 11:30:00',
    collaborators: 9,
    status: '活跃',
    department: '项目管理',
    type: '进度管理'
  },
  {
    id: 7,
    name: '会议纪要整理',
    creator: '周建军',
    createTime: '2025-08-18 14:00:00',
    lastModified: '2025-08-18 15:15:00',
    collaborators: 3,
    status: '完成',
    department: '调度中心',
    type: '会议记录'
  },
  {
    id: 8,
    name: '问题分析图表',
    creator: '吴建华',
    createTime: '2025-08-17 16:00:00',
    lastModified: '2025-08-17 18:00:00',
    collaborators: 6,
    status: '完成',
    department: '技术保障',
    type: '问题分析'
  }
])

// 白板表格列定义
const boardColumns = [
  {
    title: '白板名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '白板类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    key: 'creator'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '最后修改',
    dataIndex: 'lastModified',
    key: 'lastModified'
  },
  {
    title: '协作者',
    dataIndex: 'collaborators',
    key: 'collaborators'
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '会议记录模板',
    description: '适用于会议记录和讨论',
    icon: 'file-text'
  },
  {
    id: 2,
    name: '流程图模板',
    description: '适用于流程设计和分析',
    icon: 'share-alt'
  },
  {
    id: 3,
    name: '思维导图模板',
    description: '适用于思维整理和规划',
    icon: 'branches'
  }
])

// 历史记录数据
/**
 * 历史记录（同步替换为更真实姓名）
 */
const historyRecords = ref([
  {
    id: 1,
    action: '陈志强 添加了新的图形元素',
    time: '2分钟前'
  },
  {
    id: 2,
    action: '刘建国 修改了文字内容',
    time: '5分钟前'
  },
  {
    id: 3,
    action: '王海峰 上传了图片',
    time: '10分钟前'
  }
])

// 白板设置
const whiteboardSettings = reactive({
  canvasSize: '1920x1080',
  backgroundColor: '#ffffff',
  showGrid: true,
  autoSave: true,
  saveInterval: 5
})

// 当前激活的标签页
const activeTab = ref('boards')

// 模态框显示状态
const settingsModalVisible = ref(false)

// 打开白板
const openBoard = (board: any) => {
  message.info(`打开白板: ${board.name}`)
}

// 编辑白板
const editBoard = (board: any) => {
  message.info(`编辑白板: ${board.name}`)
}

// 删除白板
const deleteBoard = (board: any) => {
  message.success(`删除白板: ${board.name}`)
}

// 使用模板
const useTemplate = (template: any) => {
  message.success(`使用模板: ${template.name}`)
}

// 保存白板设置
const saveSettings = () => {
  message.success('白板设置已保存')
  settingsModalVisible.value = false
}

// 画布信息
const canvasSizeText = computed(() => '1920x1080')

// 概览区与自动保存模拟
onMounted(() => {
  overviewTimer = window.setInterval(() => {
    whiteboardStats.onlineCollaborators = Math.floor(Math.random() * 10) + 10
    whiteboardStats.collaborationQuality = Math.floor(Math.random() * 20) + 70
  }, 8000)

  autosaveTimer = window.setInterval(() => {
    isAutosaving.value = true
    setTimeout(() => { isAutosaving.value = false }, 800)
  }, 12000)

  window.addEventListener('beforeunload', () => {
    if (overviewTimer !== null) window.clearInterval(overviewTimer as number)
    if (autosaveTimer !== null) window.clearInterval(autosaveTimer as number)
  })
})
</script>

<style lang="less" scoped>
.whiteboard {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f1f1f;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .status-overview {
    margin-bottom: 24px;
  }

  .whiteboard-workspace {
    margin-bottom: 24px;
  }

  .whiteboard-main {
    .property-bar {
      background: #fafafa;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .canvas-and-toolbar { display: flex; gap: 12px; }

    .left-tools {
      width: 52px;
      background: #fafafa;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .whiteboard-canvas {
      position: relative;
      flex: 1;

      .canvas-placeholder {
        width: 100%;
        height: 480px;
        background: #fafafa;
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999;
        &.grid-bg {
          background-image: linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.03) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.03) 76%, transparent 77%),
                            linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.03) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.03) 76%, transparent 77%);
          background-size: 40px 40px;
        }
        .anticon { font-size: 64px; margin-bottom: 16px; }
        p { margin: 0 0 12px 0; font-size: 18px; }
        .canvas-info { display: flex; gap: 16px; span { background: #e6f7ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #1890ff; } }
      }

      .minimap {
        position: absolute;
        right: 12px;
        bottom: 12px;
        width: 180px;
        background: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        .minimap-title { font-size: 12px; color: #666; padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
        .minimap-box { height: 100px; }
      }
    }

    .status-bar {
      margin-top: 12px;
      background: #fafafa;
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .color-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #d9d9d9; vertical-align: middle; margin-left: 4px; }
      .zoom-text { min-width: 48px; text-align: center; display: inline-block; }
    }

    .whiteboard-info { .ant-descriptions { .ant-descriptions-item-label { font-weight: 600; } } }
  }

  .collaboration-panel {
    .layers-panel {
      margin-bottom: 16px;
      h4 { margin: 0 0 8px 0; font-size: 14px; font-weight: 600; }
      .layer-actions { margin-bottom: 8px; }
      .layer-list {
        display: flex; flex-direction: column; gap: 8px;
        .layer-item { display: flex; align-items: center; padding: 6px; border: 1px solid #f0f0f0; border-radius: 6px; &.active { background: #f0f8ff; border-color: #91caff; } }
      }
    }

    .collaboration-status { margin-bottom: 16px; h4 { margin: 0 0 8px 0; font-size: 14px; font-weight: 600; } .ant-tag { margin-right: 8px; } }
    .collaborators-list { h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; } .collaborator-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; &:last-child{ border-bottom: none; } .collaborator-info { flex: 1; margin-left: 12px; .collaborator-name { font-weight: 600; margin-bottom: 2px; color: #1f1f1f; font-size: 14px; } .collaborator-role { font-size: 12px; color: #1890ff; margin-bottom: 2px; font-weight: 500; } .collaborator-department { font-size: 12px; color: #666; margin-bottom: 2px; } .collaborator-last-action { font-size: 11px; color: #999; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; display: inline-block; } } .ant-tag { margin: 0; } } }
  }

  // 响应式
  @media (max-width: 768px) {
    .whiteboard-main {
      .canvas-and-toolbar { flex-direction: column; }
      .left-tools { width: 100%; flex-direction: row; }
    }
  }
}
</style>

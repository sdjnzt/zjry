<template>
  <div class="coverage-analysis">
    <div class="page-header">
      <h2>覆盖分析</h2>
      <p>智能分析监控盲区，优化设备布局，提升监控覆盖率</p>
    </div>

    <!-- 覆盖概览统计 -->
    <div class="coverage-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="总体覆盖率"
              :value="coverageStats.totalCoverage"
              suffix="%"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <span style="color: #52c41a">%</span>
              </template>
            </a-statistic>
                         <div class="coverage-trend">
               <RiseOutlined style="color: #52c41a" />
               <span>良好</span>
             </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="监控盲区面积"
              :value="coverageStats.blindArea"
              suffix="㎡"
              :value-style="{ color: '#ff4d4f' }"
            />
            <div class="coverage-trend">
              <ExclamationCircleOutlined style="color: #ff4d4f" />
              <span>需关注</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="重叠覆盖面积"
              :value="coverageStats.overlapArea"
              suffix="㎡"
              :value-style="{ color: '#faad14' }"
            />
            <div class="coverage-trend">
              <WarningOutlined style="color: #faad14" />
              <span>可优化</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="建议新增设备"
              :value="coverageStats.suggestedDevices"
              suffix="台"
              :value-style="{ color: '#1890ff' }"
            />
            <div class="coverage-trend">
              <PlusOutlined style="color: #1890ff" />
              <span>建议</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要分析区域 -->
    <div class="analysis-content">
      <a-row :gutter="16">
        <!-- 覆盖热力图 -->
        <a-col :span="16">
          <a-card title="覆盖热力图分析" class="analysis-card">
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="selectedArea"
                  placeholder="选择区域"
                  style="width: 120px"
                  @change="handleAreaChange"
                >
                  <a-select-option value="area1">济宁港主码头</a-select-option>
                  <a-select-option value="area2">济宁港散货码头</a-select-option>
                  <a-select-option value="area3">济宁港航道区</a-select-option>
                  <a-select-option value="area4">济宁港锚地区</a-select-option>
                </a-select>
                <a-select
                  v-model:value="coverageType"
                  placeholder="覆盖类型"
                  style="width: 120px"
                  @change="handleCoverageTypeChange"
                >
                  <a-select-option value="camera">摄像头覆盖</a-select-option>
                  <a-select-option value="sensor">传感器覆盖</a-select-option>
                  <a-select-option value="comprehensive">综合覆盖</a-select-option>
                </a-select>
                <a-button type="primary" @click="refreshCoverageMap">
                  <ReloadOutlined />
                  刷新
                </a-button>
              </a-space>
            </template>
            
            <!-- 模拟覆盖热力图 -->
            <div class="coverage-map">
              <div class="map-header">
                <h4>{{ getAreaText(selectedArea) }} - {{ getCoverageTypeText(coverageType) }}覆盖分析</h4>
                <div class="map-legend">
                  <div class="legend-item">
                    <div class="legend-color high"></div>
                    <span>高覆盖</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color medium"></div>
                    <span>中覆盖</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color low"></div>
                    <span>低覆盖</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color blind"></div>
                    <span>盲区</span>
                  </div>
                </div>
              </div>
              
              <div class="map-content">
                <div class="water-area">
                  <div class="water-text">水域区域</div>
                  
                  <!-- 覆盖热力网格 -->
                  <div class="coverage-grid">
                    <div
                      v-for="(cell, index) in coverageGrid"
                      :key="index"
                      class="coverage-cell"
                      :class="`coverage-${cell.level}`"
                      :style="{
                        left: cell.x + '%',
                        top: cell.y + '%',
                        width: cell.size + '%',
                        height: cell.size + '%'
                      }"
                      @click="selectCoverageCell(cell)"
                    >
                      <div class="cell-coverage">{{ cell.coverage }}%</div>
                    </div>
                  </div>
                  
                  <!-- 设备位置标记 -->
                  <div
                    v-for="device in areaDevices"
                    :key="device.id"
                    class="device-marker"
                    :style="{
                      left: device.x + '%',
                      top: device.y + '%'
                    }"
                  >
                    <div class="marker-icon">
                      <CameraOutlined v-if="device.type === 'camera'" />
                      <RadarChartOutlined v-else />
                    </div>
                    <div class="marker-label">{{ device.name }}</div>
                  </div>
                  
                  <!-- 盲区标记 -->
                  <div
                    v-for="blind in blindAreas"
                    :key="blind.id"
                    class="blind-area-marker"
                    :style="{
                      left: blind.x + '%',
                      top: blind.y + '%',
                      width: blind.width + '%',
                      height: blind.height + '%'
                    }"
                  >
                    <div class="blind-label">盲区{{ blind.id }}</div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 分析结果面板 -->
        <a-col :span="8">
          <a-card title="分析结果" class="result-card">
            <template #extra>
              <a-button size="small" @click="exportAnalysisReport">
                <ExportOutlined />
                导出报告
              </a-button>
            </template>
            
            <!-- 覆盖统计 -->
            <div class="coverage-stats">
              <h4>覆盖统计</h4>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic title="高覆盖区域" :value="areaStats.highCoverage" suffix="%" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="中覆盖区域" :value="areaStats.mediumCoverage" suffix="%" />
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic title="低覆盖区域" :value="areaStats.lowCoverage" suffix="%" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="盲区面积" :value="areaStats.blindArea" suffix="㎡" />
                </a-col>
              </a-row>
            </div>

            <!-- 盲区分析 -->
            <div class="blind-area-analysis">
              <h4>盲区分析</h4>
              <div class="blind-list">
                <div
                  v-for="blind in blindAreas"
                  :key="blind.id"
                  class="blind-item"
                >
                  <div class="blind-header">
                    <div class="blind-name">盲区{{ blind.id }}</div>
                    <div class="blind-priority">
                      <a-tag :color="getPriorityColor(blind.priority)">
                        {{ getPriorityText(blind.priority) }}
                      </a-tag>
                    </div>
                  </div>
                  <div class="blind-info">
                    <div class="blind-size">面积: {{ blind.area }}㎡</div>
                    <div class="blind-location">位置: {{ blind.location }}</div>
                  </div>
                  <div class="blind-suggestions">
                    <div class="suggestion-title">建议解决方案:</div>
                    <div class="suggestion-content">{{ blind.suggestion }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 优化建议 -->
            <div class="optimization-suggestions">
              <h4>优化建议</h4>
              <div class="suggestion-list">
                <div
                  v-for="suggestion in optimizationSuggestions"
                  :key="suggestion.id"
                  class="suggestion-item"
                >
                  <div class="suggestion-icon">
                    <BulbOutlined style="color: #1890ff" />
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                    <div class="suggestion-impact">
                      预期提升: {{ suggestion.improvement }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 设备布局优化 -->
    <div class="layout-optimization">
      <a-card title="设备布局优化建议" class="optimization-card">
        <template #extra>
          <a-space>
            <a-button type="primary" @click="showOptimizationModal">
              <PlusOutlined />
              添加优化方案
            </a-button>
            <a-button @click="simulateOptimization">
              <PlayCircleOutlined />
              模拟优化
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :columns="optimizationColumns"
          :data-source="optimizationPlans"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'planName'">
              <div class="plan-info">
                <div class="plan-name">{{ record.planName }}</div>
                <div class="plan-target">目标区域: {{ record.targetArea }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'type'">
              <a-tag :color="getOptimizationTypeColor(record.type)">
                {{ getOptimizationTypeText(record.type) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'expectedImprovement'">
              <div class="improvement-info">
                <div class="improvement-value">{{ record.expectedImprovement }}%</div>
                <div class="improvement-label">覆盖率提升</div>
              </div>
            </template>

            <template v-else-if="column.key === 'cost'">
              <div class="cost-info">
                <div class="cost-value">¥{{ record.cost.toLocaleString() }}</div>
                <div class="cost-label">预估成本</div>
              </div>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewOptimizationDetails(record)">
                  <EyeOutlined />
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editOptimization(record)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-button type="link" size="small" @click="deleteOptimization(record)">
                  <DeleteOutlined />
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加优化方案弹窗 -->
    <a-modal
      v-model:open="optimizationModal.visible"
      title="添加优化方案"
      width="700px"
      @ok="handleOptimizationSubmit"
      @cancel="handleOptimizationCancel"
    >
      <a-form
        ref="optimizationFormRef"
        :model="optimizationForm"
        :rules="optimizationRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="方案名称" name="planName">
          <a-input v-model:value="optimizationForm.planName" placeholder="请输入方案名称" />
        </a-form-item>
        
        <a-form-item label="目标区域" name="targetArea">
          <a-select v-model:value="optimizationForm.targetArea" placeholder="请选择目标区域">
            <a-select-option value="area1">济宁港主码头</a-select-option>
            <a-select-option value="area2">济宁港散货码头</a-select-option>
            <a-select-option value="area3">济宁港航道区</a-select-option>
            <a-select-option value="area4">济宁港锚地区</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="优化类型" name="type">
          <a-select v-model:value="optimizationForm.type" placeholder="请选择优化类型">
            <a-select-option value="addDevice">新增设备</a-select-option>
            <a-select-option value="adjustPosition">调整位置</a-select-option>
            <a-select-option value="upgradeDevice">设备升级</a-select-option>
            <a-select-option value="optimizeAngle">优化角度</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="预期提升" name="expectedImprovement">
          <a-input-number
            v-model:value="optimizationForm.expectedImprovement"
            :min="1"
            :max="100"
            placeholder="预期覆盖率提升(%)"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="预估成本" name="cost">
          <a-input-number
            v-model:value="optimizationForm.cost"
            :min="0"
            :step="100"
            placeholder="预估成本(元)"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="实施方案" name="implementation">
          <a-textarea
            v-model:value="optimizationForm.implementation"
            placeholder="请描述具体的实施方案"
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="optimizationForm.notes"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  RiseOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExportOutlined,
  BulbOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CameraOutlined,
  RadarChartOutlined
} from '@ant-design/icons-vue'

/**
 * 覆盖统计接口
 */
interface CoverageStats {
  totalCoverage: number
  blindArea: number
  overlapArea: number
  suggestedDevices: number
}

/**
 * 区域统计接口
 */
interface AreaStats {
  highCoverage: number
  mediumCoverage: number
  lowCoverage: number
  blindArea: number
}

/**
 * 覆盖网格单元接口
 */
interface CoverageCell {
  x: number
  y: number
  size: number
  level: 'high' | 'medium' | 'low' | 'blind'
  coverage: number
}

/**
 * 设备位置接口
 */
interface DeviceLocation {
  id: string
  name: string
  type: 'camera' | 'sensor'
  x: number
  y: number
}

/**
 * 盲区信息接口
 */
interface BlindArea {
  id: string
  x: number
  y: number
  width: number
  height: number
  area: number
  location: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
}

/**
 * 优化建议接口
 */
interface OptimizationSuggestion {
  id: string
  title: string
  description: string
  improvement: number
}

/**
 * 优化方案接口
 */
interface OptimizationPlan {
  id: string
  planName: string
  targetArea: string
  type: 'addDevice' | 'adjustPosition' | 'upgradeDevice' | 'optimizeAngle'
  expectedImprovement: number
  cost: number
  implementation: string
  notes?: string
  status: 'draft' | 'approved' | 'implemented'
}

/**
 * 响应式数据
 */
const selectedArea = ref('area1')
const coverageType = ref('camera')
const optimizationModal = reactive({
  visible: false
})

/**
 * 表单数据
 */
const optimizationForm = reactive<Partial<OptimizationPlan>>({
  planName: '',
  targetArea: '',
  type: 'addDevice',
  expectedImprovement: 10,
  cost: 0,
  implementation: '',
  notes: ''
})

/**
 * 表单验证规则
 */
const optimizationRules = {
  planName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  targetArea: [{ required: true, message: '请选择目标区域', trigger: 'change' }],
  type: [{ required: true, message: '请选择优化类型', trigger: 'change' }],
  expectedImprovement: [{ required: true, message: '请输入预期提升', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入预估成本', trigger: 'blur' }],
  implementation: [{ required: true, message: '请输入实施方案', trigger: 'blur' }]
}

/**
 * 覆盖统计数据 - 基于真实港口监控系统
 */
const coverageStats = reactive<CoverageStats>({
  totalCoverage: 89.3,
  blindArea: 2840,
  overlapArea: 1560,
  suggestedDevices: 5
})

/**
 * 区域统计数据 - 基于真实港口监控系统
 */
const areaStats = reactive<AreaStats>({
  highCoverage: 47.8,
  mediumCoverage: 31.2,
  lowCoverage: 10.7,
  blindArea: 10.3
})

/**
 * 模拟覆盖网格数据 - 基于真实港口监控系统
 */
const coverageGrid = ref<CoverageCell[]>([
  { x: 12, y: 8, size: 10, level: 'high', coverage: 94.2 },
  { x: 25, y: 18, size: 9, level: 'high', coverage: 91.7 },
  { x: 38, y: 22, size: 8, level: 'medium', coverage: 76.3 },
  { x: 52, y: 28, size: 7, level: 'medium', coverage: 67.8 },
  { x: 65, y: 35, size: 8, level: 'low', coverage: 43.5 },
  { x: 78, y: 42, size: 9, level: 'blind', coverage: 0 },
  { x: 85, y: 38, size: 8, level: 'high', coverage: 89.1 },
  { x: 92, y: 45, size: 7, level: 'medium', coverage: 71.4 },
  { x: 15, y: 55, size: 8, level: 'low', coverage: 38.9 },
  { x: 32, y: 62, size: 9, level: 'medium', coverage: 65.2 },
  { x: 48, y: 68, size: 8, level: 'high', coverage: 87.6 },
  { x: 72, y: 72, size: 7, level: 'blind', coverage: 0 }
])

/**
 * 模拟设备位置数据 - 基于真实港口监控系统
 */
const areaDevices = ref<DeviceLocation[]>([
  {
    id: '1',
    name: '济宁港主码头-高清监控01',
    type: 'camera',
    x: 18,
    y: 10
  },
  {
    id: '2',
    name: '济宁港主码头-高清监控02',
    type: 'camera',
    x: 38,
    y: 20
  },
  {
    id: '3',
    name: '济宁港航道-潮汐传感器01',
    type: 'sensor',
    x: 58,
    y: 30
  },
  {
    id: '4',
    name: '济宁港主码头-高清监控03',
    type: 'camera',
    x: 78,
    y: 40
  },
  {
    id: '5',
    name: '济宁港锚地-气象传感器01',
    type: 'sensor',
    x: 20,
    y: 58
  },
  {
    id: '6',
    name: '济宁港散货码头-高清监控01',
    type: 'camera',
    x: 45,
    y: 65
  },
  {
    id: '7',
    name: '济宁港控制中心-监控01',
    type: 'camera',
    x: 88,
    y: 35
  }
])

/**
 * 模拟盲区数据 - 基于真实港口监控系统
 */
const blindAreas = ref<BlindArea[]>([
  {
    id: '1',
    x: 78,
    y: 42,
    width: 9,
    height: 9,
    area: 81,
    location: '济宁港航道中心线附近',
    priority: 'high',
    suggestion: '建议在航道中心线新增一台高清摄像头，提升航道安全监控覆盖率，消除监控盲区'
  },
  {
    id: '2',
    x: 72,
    y: 72,
    width: 7,
    height: 7,
    area: 49,
    location: '济宁港锚地边缘区域',
    priority: 'medium',
    suggestion: '可考虑调整现有摄像头角度，或新增小型监控设备，提升锚地安全监控'
  },
  {
    id: '3',
    x: 15,
    y: 55,
    width: 8,
    height: 8,
    area: 64,
    location: '济宁港散货码头西侧',
    priority: 'low',
    suggestion: '建议新增环境监测传感器，完善散货码头环境监控网络'
  }
])

/**
 * 模拟优化建议数据 - 基于真实港口监控系统
 */
const optimizationSuggestions = ref<OptimizationSuggestion[]>([
  {
    id: '1',
    title: '济宁港航道监控优化',
    description: '在航道中心线新增高清摄像头，消除监控盲区，提升航道安全监控覆盖率',
    improvement: 12.8
  },
  {
    id: '2',
    title: '济宁港主码头设备角度调整',
    description: '优化现有摄像头安装角度，扩大监控范围，减少重叠覆盖',
    improvement: 7.3
  },
  {
    id: '3',
    title: '济宁港锚地传感器网络完善',
    description: '增加环境监测传感器，提升综合监控能力，完善锚地安全监控',
    improvement: 9.6
  },
  {
    id: '4',
    title: '济宁港散货码头监控补盲',
    description: '新增环境监测传感器，完善散货码头环境监控网络',
    improvement: 6.2
  }
])

/**
 * 模拟优化方案数据 - 基于真实港口监控系统
 */
const optimizationPlans = ref<OptimizationPlan[]>([
  {
    id: '1',
    planName: '济宁港航道监控补盲方案',
    targetArea: 'area3',
    type: 'addDevice',
    expectedImprovement: 12.8,
    cost: 68000,
    implementation: '在航道中心线安装2台高清摄像头，配置云台控制，提升航道安全监控覆盖率',
    notes: '优先实施，消除航道监控盲区，提升安全监控能力',
    status: 'approved'
  },
  {
    id: '2',
    planName: '济宁港主码头监控优化',
    targetArea: 'area1',
    type: 'adjustPosition',
    expectedImprovement: 7.3,
    cost: 12000,
    implementation: '调整现有摄像头安装位置和角度，扩大覆盖范围，减少重叠覆盖',
    notes: '成本较低，可快速实施，优化监控布局',
    status: 'draft'
  },
  {
    id: '3',
    planName: '济宁港锚地传感器网络完善',
    targetArea: 'area4',
    type: 'addDevice',
    expectedImprovement: 9.6,
    cost: 45000,
    implementation: '新增环境监测传感器，完善锚地安全监控网络',
    notes: '提升锚地环境监测能力，保障船舶安全',
    status: 'draft'
  }
])

/**
 * 表格列定义
 */
const optimizationColumns = [
  {
    title: '方案信息',
    key: 'planName',
    width: 200
  },
  {
    title: '优化类型',
    key: 'type',
    width: 120
  },
  {
    title: '预期提升',
    key: 'expectedImprovement',
    width: 120
  },
  {
    title: '预估成本',
    key: 'cost',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 获取区域文本
 */
const getAreaText = (area: string) => {
  const areaMap: Record<string, string> = {
    area1: '济宁港主码头',
    area2: '济宁港散货码头',
    area3: '济宁港航道区',
    area4: '济宁港锚地区'
  }
  return areaMap[area] || area
}

/**
 * 获取覆盖类型文本
 */
const getCoverageTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    camera: '摄像头',
    sensor: '传感器',
    comprehensive: '综合'
  }
  return typeMap[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return priorityMap[priority] || priority
}

/**
 * 获取优化类型颜色
 */
const getOptimizationTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    addDevice: 'blue',
    adjustPosition: 'green',
    upgradeDevice: 'orange',
    optimizeAngle: 'purple'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取优化类型文本
 */
const getOptimizationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    addDevice: '新增设备',
    adjustPosition: '调整位置',
    upgradeDevice: '设备升级',
    optimizeAngle: '优化角度'
  }
  return typeMap[type] || type
}

/**
 * 处理区域变化
 */
const handleAreaChange = () => {
  console.log('区域切换到:', selectedArea.value)
  // 这里可以根据区域重新加载数据
}

/**
 * 处理覆盖类型变化
 */
const handleCoverageTypeChange = () => {
  console.log('覆盖类型切换到:', coverageType.value)
  // 这里可以根据类型重新加载数据
}

/**
 * 刷新覆盖地图
 */
const refreshCoverageMap = () => {
  message.success('覆盖地图已刷新')
}

/**
 * 选择覆盖网格单元
 */
const selectCoverageCell = (cell: CoverageCell) => {
  message.info(`选中覆盖单元: ${cell.coverage}% 覆盖率`)
}

/**
 * 导出分析报告
 */
const exportAnalysisReport = () => {
  message.success('分析报告导出成功')
}

/**
 * 显示优化方案弹窗
 */
const showOptimizationModal = () => {
  optimizationModal.visible = true
  resetOptimizationForm()
}

/**
 * 模拟优化
 */
const simulateOptimization = () => {
  message.loading('正在模拟优化效果...', 2).then(() => {
    message.success('优化模拟完成，预期覆盖率提升至94.7%')
  })
}

/**
 * 查看优化方案详情
 */
const viewOptimizationDetails = (plan: OptimizationPlan) => {
  message.info(`查看方案: ${plan.planName}`)
}

/**
 * 编辑优化方案
 */
const editOptimization = (plan: OptimizationPlan) => {
  message.info(`编辑方案: ${plan.planName}`)
}

/**
 * 删除优化方案
 */
const deleteOptimization = (plan: OptimizationPlan) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除优化方案"${plan.planName}"吗？`,
    onOk: () => {
      message.success('优化方案删除成功')
    }
  })
}

/**
 * 提交优化方案表单
 */
const handleOptimizationSubmit = () => {
  message.success('优化方案添加成功')
  optimizationModal.visible = false
  resetOptimizationForm()
}

/**
 * 取消优化方案表单
 */
const handleOptimizationCancel = () => {
  optimizationModal.visible = false
  resetOptimizationForm()
}

/**
 * 重置优化方案表单
 */
const resetOptimizationForm = () => {
  Object.assign(optimizationForm, {
    planName: '',
    targetArea: '',
    type: 'addDevice',
    expectedImprovement: 10,
    cost: 0,
    implementation: '',
    notes: ''
  })
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('覆盖分析页面已加载')
})
</script>

<style lang="less" scoped>
.coverage-analysis {
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

  .coverage-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;

      .coverage-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }
  }

  .analysis-content {
    margin-bottom: 24px;

    .analysis-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .coverage-map {
        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h4 {
            margin: 0;
            color: #333;
          }

          .map-legend {
            display: flex;
            gap: 16px;

            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;

              .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 2px;

                &.high {
                  background: #52c41a;
                }

                &.medium {
                  background: #faad14;
                }

                &.low {
                  background: #ff7a45;
                }

                &.blind {
                  background: #ff4d4f;
                }
              }
            }
          }
        }

        .map-content {
          position: relative;
          height: 500px;
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
          border-radius: 8px;
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
              font-size: 36px;
              font-weight: bold;
              pointer-events: none;
            }

            .coverage-grid {
              .coverage-cell {
                position: absolute;
                border-radius: 2px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                font-weight: bold;
                transition: all 0.3s;

                &:hover {
                  transform: scale(1.1);
                  z-index: 10;
                }

                &.coverage-high {
                  background: rgba(82, 196, 26, 0.8);
                  border: 1px solid #52c41a;
                }

                &.coverage-medium {
                  background: rgba(250, 173, 20, 0.8);
                  border: 1px solid #faad14;
                }

                &.coverage-low {
                  background: rgba(255, 122, 69, 0.8);
                  border: 1px solid #ff7a45;
                }

                &.coverage-blind {
                  background: rgba(255, 77, 79, 0.8);
                  border: 1px solid #ff4d4f;
                }

                .cell-coverage {
                  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                }
              }
            }

            .device-marker {
              position: absolute;
              transform: translate(-50%, -50%);
              cursor: pointer;
              z-index: 5;

              .marker-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                background: #1890ff;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              }

              .marker-label {
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

              &:hover .marker-label {
                opacity: 1;
              }
            }

            .blind-area-marker {
              position: absolute;
              border: 2px dashed #ff4d4f;
              background: rgba(255, 77, 79, 0.1);
              border-radius: 4px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;

              .blind-label {
                background: rgba(255, 77, 79, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
              }
            }
          }
        }
      }

      .result-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .coverage-stats {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;

          h4 {
            margin: 0 0 16px 0;
            color: #333;
          }
        }

        .blind-area-analysis {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;

          h4 {
            margin: 0 0 16px 0;
            color: #333;
          }

          .blind-list {
            .blind-item {
              background: #fafafa;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 12px;
              border-left: 4px solid #ff4d4f;

              .blind-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .blind-name {
                  font-weight: 500;
                  color: #333;
                  font-size: 14px;
                }
              }

              .blind-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;

                .blind-size {
                  color: #666;
                }

                .blind-location {
                  color: #999;
                }
              }

              .blind-suggestions {
                .suggestion-title {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 4px;
                }

                .suggestion-content {
                  font-size: 12px;
                  color: #333;
                  line-height: 1.4;
                }
              }
            }
          }
        }

        .optimization-suggestions {
          h4 {
            margin: 0 0 16px 0;
            color: #333;
          }

          .suggestion-list {
            .suggestion-item {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              margin-bottom: 16px;

              .suggestion-icon {
                margin-top: 2px;
              }

              .suggestion-content {
                flex: 1;

                .suggestion-title {
                  font-weight: 500;
                  color: #333;
                  margin-bottom: 4px;
                  font-size: 14px;
                }

                .suggestion-desc {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 4px;
                  line-height: 1.4;
                }

                .suggestion-impact {
                  font-size: 11px;
                  color: #1890ff;
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
  }

  .layout-optimization {
    .optimization-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .plan-info {
        .plan-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .plan-target {
          font-size: 12px;
          color: #666;
        }
      }

      .improvement-info {
        .improvement-value {
          font-weight: 500;
          color: #52c41a;
          font-size: 14px;
        }

        .improvement-label {
          font-size: 11px;
          color: #999;
        }
      }

      .cost-info {
        .cost-value {
          font-weight: 500;
          color: #ff4d4f;
          font-size: 14px;
        }

        .cost-label {
          font-size: 11px;
          color: #999;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .coverage-analysis {
    .analysis-content {
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
  .coverage-analysis {
    padding: 16px;

    .coverage-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

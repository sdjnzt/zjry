<template>
  <div class="data-standardization">
    <div class="page-header">
      <h2>数据标准化</h2>
      <p>统一数据格式，建立标准数据模型，提升数据质量和互操作性</p>
    </div>

    <!-- 数据概览统计 -->
    <div class="data-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper video">
                <VideoCameraOutlined />
              </div>
              <div class="stats">
                <div class="number">24,789</div>
                <div class="label">视频数据</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper metadata">
                <FileTextOutlined />
              </div>
              <div class="stats">
                <div class="number">16,543</div>
                <div class="label">元数据</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper quality">
                <CheckCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">98.5%</div>
                <div class="label">数据质量</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper conversion">
                <SyncOutlined />
              </div>
              <div class="stats">
                <div class="number">2,867</div>
                <div class="label">转换任务</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 数据标准化配置 -->
    <div class="standardization-config">
      <a-row :gutter="16">
        <!-- 数据格式配置 -->
        <a-col :span="12">
          <a-card title="数据格式配置" class="config-card">
            <template #extra>
              <a-button type="primary" @click="showFormatModal = true">
                <PlusOutlined />
                添加格式
              </a-button>
            </template>
            
            <a-table
              :columns="formatColumns"
              :data-source="formatList"
              :pagination="false"
              size="small"
              :scroll="{ y: 300 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '禁用' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="editFormat(record)">
                      编辑
                    </a-button>
                    <a-button 
                      type="link" 
                      size="small" 
                      :danger="record.status === 'active'"
                      @click="toggleFormatStatus(record)"
                    >
                      {{ record.status === 'active' ? '禁用' : '启用' }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 字段映射配置 -->
        <a-col :span="12">
          <a-card title="字段映射配置" class="config-card">
            <template #extra>
              <a-button type="primary" @click="showMappingModal = true">
                <PlusOutlined />
                添加映射
              </a-button>
            </template>
            
            <a-table
              :columns="mappingColumns"
              :data-source="mappingList"
              :pagination="false"
              size="small"
              :scroll="{ y: 300 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
                    {{ record.status === 'active' ? '运行中' : '已停止' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="editMapping(record)">
                      编辑
                    </a-button>
                    <a-button 
                      type="link" 
                      size="small" 
                      @click="toggleMappingStatus(record)"
                    >
                      {{ record.status === 'active' ? '停止' : '启动' }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 数据质量检测 -->
    <div class="quality-detection">
      <a-card title="数据质量检测" class="quality-card">
        <template #extra>
          <a-space>
            <a-button @click="runQualityCheck">
              <ReloadOutlined />
              运行检测
            </a-button>
            <a-button type="primary" @click="showQualityModal = true">
              <SettingOutlined />
              检测配置
            </a-button>
          </a-space>
        </template>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="quality-metrics">
              <h4>质量指标</h4>
              <div class="metric-item">
                <span>完整性</span>
                <a-progress :percent="qualityMetrics.completeness" size="small" />
              </div>
              <div class="metric-item">
                <span>准确性</span>
                <a-progress :percent="qualityMetrics.accuracy" size="small" />
              </div>
              <div class="metric-item">
                <span>一致性</span>
                <a-progress :percent="qualityMetrics.consistency" size="small" />
              </div>
              <div class="metric-item">
                <span>及时性</span>
                <a-progress :percent="qualityMetrics.timeliness" size="small" />
              </div>
            </div>
          </a-col>
          
          <a-col :span="16">
            <div class="quality-issues">
              <h4>质量问题</h4>
              <a-table
                :columns="issueColumns"
                :data-source="qualityIssues"
                :pagination="false"
                size="small"
                :scroll="{ y: 200 }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'severity'">
                    <a-tag :color="getSeverityColor(record.severity)">
                      {{ record.severity }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button type="link" size="small" @click="fixIssue(record)">
                      修复
                    </a-button>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 转换任务监控 -->
    <div class="conversion-monitor">
      <a-card title="转换任务监控" class="monitor-card">
        <a-table
          :columns="taskColumns"
          :data-source="conversionTasks"
          :pagination="false"
          size="small"
          :scroll="{ y: 250 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getTaskStatusColor(record.status)">
                {{ getTaskStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <a-progress :percent="record.progress" size="small" />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button 
                  v-if="record.status === 'running'"
                  type="link" 
                  size="small" 
                  @click="pauseTask(record)"
                >
                  暂停
                </a-button>
                <a-button 
                  v-if="record.status === 'paused'"
                  type="link" 
                  size="small" 
                  @click="resumeTask(record)"
                >
                  继续
                </a-button>
                <a-button 
                  v-if="record.status === 'completed'"
                  type="link" 
                  size="small" 
                  @click="viewResult(record)"
                >
                  查看结果
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加/编辑数据格式弹窗 -->
    <a-modal
      v-model:open="showFormatModal"
      :title="editingFormat ? '编辑数据格式' : '添加数据格式'"
      @ok="saveFormat"
      @cancel="cancelFormat"
      width="600px"
    >
      <a-form
        ref="formatFormRef"
        :model="formatForm"
        :rules="formatRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="格式名称" name="name">
              <a-input v-model:value="formatForm.name" placeholder="请输入格式名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="格式类型" name="type">
              <a-select v-model:value="formatForm.type" placeholder="请选择格式类型">
                <a-select-option value="json">JSON</a-select-option>
                <a-select-option value="xml">XML</a-select-option>
                <a-select-option value="csv">CSV</a-select-option>
                <a-select-option value="binary">二进制</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="格式描述" name="description">
          <a-textarea v-model:value="formatForm.description" :rows="3" placeholder="请输入格式描述" />
        </a-form-item>
        
        <a-form-item label="格式规范" name="specification">
          <a-textarea v-model:value="formatForm.specification" :rows="4" placeholder="请输入格式规范" />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formatForm.status" placeholder="请选择状态">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加/编辑字段映射弹窗 -->
    <a-modal
      v-model:open="showMappingModal"
      :title="editingMapping ? '编辑字段映射' : '添加字段映射'"
      @ok="saveMapping"
      @cancel="cancelMapping"
      width="700px"
    >
      <a-form
        ref="mappingFormRef"
        :model="mappingForm"
        :rules="mappingRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="源字段" name="sourceField">
              <a-input v-model:value="mappingForm.sourceField" placeholder="请输入源字段名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标字段" name="targetField">
              <a-input v-model:value="mappingForm.targetField" placeholder="请输入目标字段名" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据类型" name="dataType">
              <a-select v-model:value="mappingForm.dataType" placeholder="请选择数据类型">
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
                <a-select-option value="datetime">日期时间</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="转换规则" name="transformRule">
              <a-select v-model:value="mappingForm.transformRule" placeholder="请选择转换规则">
                <a-select-option value="direct">直接映射</a-select-option>
                <a-select-option value="format">格式化</a-select-option>
                <a-select-option value="calculate">计算转换</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="映射描述" name="description">
          <a-textarea v-model:value="mappingForm.description" :rows="3" placeholder="请输入映射描述" />
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea v-model:value="mappingForm.notes" :rows="2" placeholder="请输入备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 质量检测配置弹窗 -->
    <a-modal
      v-model:open="showQualityModal"
      title="质量检测配置"
      @ok="saveQualityConfig"
      @cancel="showQualityModal = false"
      width="600px"
    >
      <a-form
        ref="qualityFormRef"
        :model="qualityForm"
        layout="vertical"
      >
        <a-form-item label="检测频率">
          <a-select v-model:value="qualityForm.frequency" placeholder="请选择检测频率">
            <a-select-option value="realtime">实时检测</a-select-option>
            <a-select-option value="hourly">每小时</a-select-option>
            <a-select-option value="daily">每日</a-select-option>
            <a-select-option value="weekly">每周</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="质量阈值">
          <a-input-number 
            v-model:value="qualityForm.threshold" 
            :min="0" 
            :max="100" 
            :step="0.1"
            style="width: 100%"
            placeholder="请输入质量阈值百分比"
          />
        </a-form-item>
        
        <a-form-item label="检测规则">
          <a-textarea v-model:value="qualityForm.rules" :rows="4" placeholder="请输入检测规则配置" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined, VideoCameraOutlined, FileTextOutlined, CheckCircleOutlined,
  SyncOutlined, ReloadOutlined, SettingOutlined
} from '@ant-design/icons-vue'

// 数据格式表格列定义
const formatColumns = [
  { title: '格式名称', dataIndex: 'name', key: 'name' },
  { title: '格式类型', dataIndex: 'type', key: 'type' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount' },
  { title: '操作', key: 'action', width: 150 }
]

// 字段映射表格列定义
const mappingColumns = [
  { title: '源字段', dataIndex: 'sourceField', key: 'sourceField' },
  { title: '目标字段', dataIndex: 'targetField', key: 'targetField' },
  { title: '数据类型', dataIndex: 'dataType', key: 'dataType' },
  { title: '转换规则', dataIndex: 'transformRule', key: 'transformRule' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 150 }
]

// 质量问题表格列定义
const issueColumns = [
  { title: '问题类型', dataIndex: 'type', key: 'type' },
  { title: '严重程度', dataIndex: 'severity', key: 'severity' },
  { title: '影响范围', dataIndex: 'scope', key: 'scope' },
  { title: '发现时间', dataIndex: 'discoveredAt', key: 'discoveredAt' },
  { title: '操作', key: 'action', width: 80 }
]

// 转换任务表格列定义
const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '源格式', dataIndex: 'sourceFormat', key: 'sourceFormat' },
  { title: '目标格式', dataIndex: 'targetFormat', key: 'targetFormat' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '进度', dataIndex: 'progress', key: 'progress' },
  { title: '操作', key: 'action', width: 120 }
]

// 响应式数据
const showFormatModal = ref(false)
const showMappingModal = ref(false)
const showQualityModal = ref(false)
const editingFormat = ref<any>(null)
const editingMapping = ref<any>(null)
const formatFormRef = ref()
const mappingFormRef = ref()
const qualityFormRef = ref()

// 数据格式表单数据
const formatForm = reactive({
  name: '',
  type: '',
  description: '',
  specification: '',
  status: 'active'
})

// 字段映射表单数据
const mappingForm = reactive({
  sourceField: '',
  targetField: '',
  dataType: '',
  transformRule: '',
  description: '',
  notes: ''
})

// 质量检测配置表单数据
const qualityForm = reactive({
  frequency: 'daily',
  threshold: 90,
  rules: ''
})

// 表单验证规则
const formatRules = {
  name: [{ required: true, message: '请输入格式名称' }],
  type: [{ required: true, message: '请选择格式类型' }],
  status: [{ required: true, message: '请选择状态' }]
}

const mappingRules = {
  sourceField: [{ required: true, message: '请输入源字段名' }],
  targetField: [{ required: true, message: '请输入目标字段名' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
  transformRule: [{ required: true, message: '请选择转换规则' }]
}

// 模拟数据
const formatList = ref([
  {
    id: '1',
    name: 'GB28181-Event',
    type: 'json',
    status: 'active',
    usageCount: 2456,
    description: '国标事件数据格式',
    specification: '{"eventType": "string", "timestamp": "datetime", "deviceId": "string"}'
  },
  {
    id: '2',
    name: 'ONVIF-Device',
    type: 'xml',
    status: 'active',
    usageCount: 1789,
    description: 'ONVIF设备信息格式',
    specification: '<device><name>string</name><location>string</location></device>'
  },
  {
    id: '3',
    name: 'RTSP-Stream',
    type: 'binary',
    status: 'active',
    usageCount: 3421,
    description: 'RTSP流数据格式',
    specification: 'Binary stream with H.264/H.265 encoding'
  },
  {
    id: '4',
    name: 'Custom-Metadata',
    type: 'csv',
    status: 'inactive',
    usageCount: 234,
    description: '自定义元数据格式',
    specification: 'device_id,location,status,timestamp'
  },
  {
    id: '5',
    name: 'HikVision-Event',
    type: 'json',
    status: 'active',
    usageCount: 1567,
    description: '海康威视事件格式',
    specification: '{"alarmType": "int", "alarmTime": "string", "channelId": "int", "alarmInfo": "object"}'
  },
  {
    id: '6',
    name: 'Dahua-Alarm',
    type: 'xml',
    status: 'active',
    usageCount: 892,
    description: '大华报警数据格式',
    specification: '<alarm><type>int</type><channel>int</channel><time>string</time></alarm>'
  },
  {
    id: '7',
    name: 'AIS-Position',
    type: 'json',
    status: 'active',
    usageCount: 3245,
    description: 'AIS船舶位置数据格式',
    specification: '{"mmsi": "string", "lat": "float", "lon": "float", "speed": "float", "course": "float"}'
  },
  {
    id: '8',
    name: 'Radar-Track',
    type: 'binary',
    status: 'active',
    usageCount: 1876,
    description: '雷达跟踪数据格式',
    specification: 'Binary format with track ID, position, velocity vectors'
  },
  {
    id: '9',
    name: 'Weather-Data',
    type: 'json',
    status: 'active',
    usageCount: 654,
    description: '气象数据格式',
    specification: '{"temperature": "float", "humidity": "float", "windSpeed": "float", "windDirection": "int"}'
  },
  {
    id: '10',
    name: 'IoT-Sensor',
    type: 'json',
    status: 'active',
    usageCount: 2134,
    description: '物联网传感器数据格式',
    specification: '{"sensorId": "string", "sensorType": "string", "value": "float", "unit": "string", "timestamp": "datetime"}'
  },
  {
    id: '11',
    name: 'WebRTC-Media',
    type: 'binary',
    status: 'active',
    usageCount: 789,
    description: 'WebRTC媒体流格式',
    specification: 'WebRTC media stream with VP8/VP9 video and Opus audio'
  },
  {
    id: '12',
    name: 'MQTT-Message',
    type: 'json',
    status: 'inactive',
    usageCount: 345,
    description: 'MQTT消息格式',
    specification: '{"topic": "string", "payload": "object", "qos": "int", "retain": "boolean"}'
  }
])

const mappingList = ref([
  {
    id: '1',
    sourceField: 'device_id',
    targetField: 'deviceId',
    dataType: 'string',
    transformRule: 'direct',
    status: 'active',
    description: '设备ID字段映射',
    notes: '直接映射，无需转换'
  },
  {
    id: '2',
    sourceField: 'event_time',
    targetField: 'timestamp',
    dataType: 'datetime',
    transformRule: 'format',
    status: 'active',
    description: '时间字段映射',
    notes: 'ISO 8601格式转换'
  },
  {
    id: '3',
    sourceField: 'location_x',
    targetField: 'longitude',
    dataType: 'number',
    transformRule: 'calculate',
    status: 'active',
    description: '坐标转换',
    notes: 'WGS84坐标系转换'
  },
  {
    id: '4',
    sourceField: 'location_y',
    targetField: 'latitude',
    dataType: 'number',
    transformRule: 'calculate',
    status: 'active',
    description: '纬度坐标转换',
    notes: 'WGS84坐标系转换'
  },
  {
    id: '5',
    sourceField: 'alarm_type',
    targetField: 'eventType',
    dataType: 'string',
    transformRule: 'custom',
    status: 'active',
    description: '报警类型映射',
    notes: '数值转换为描述性文本'
  },
  {
    id: '6',
    sourceField: 'channel_no',
    targetField: 'channelId',
    dataType: 'number',
    transformRule: 'format',
    status: 'active',
    description: '通道号格式化',
    notes: '补零格式化为4位数字'
  },
  {
    id: '7',
    sourceField: 'device_status',
    targetField: 'status',
    dataType: 'string',
    transformRule: 'custom',
    status: 'active',
    description: '设备状态映射',
    notes: '状态码转换为状态描述'
  },
  {
    id: '8',
    sourceField: 'temperature_c',
    targetField: 'temperature',
    dataType: 'number',
    transformRule: 'calculate',
    status: 'active',
    description: '温度单位转换',
    notes: '摄氏度转换为开尔文'
  },
  {
    id: '9',
    sourceField: 'speed_kmh',
    targetField: 'velocity',
    dataType: 'number',
    transformRule: 'calculate',
    status: 'active',
    description: '速度单位转换',
    notes: 'km/h转换为m/s'
  },
  {
    id: '10',
    sourceField: 'mmsi_code',
    targetField: 'vesselId',
    dataType: 'string',
    transformRule: 'format',
    status: 'active',
    description: 'MMSI码格式化',
    notes: '补零格式化为9位数字'
  },
  {
    id: '11',
    sourceField: 'sensor_value',
    targetField: 'measurement',
    dataType: 'number',
    transformRule: 'calculate',
    status: 'inactive',
    description: '传感器数值校准',
    notes: '应用校准系数和偏移量'
  },
  {
    id: '12',
    sourceField: 'user_name',
    targetField: 'operatorId',
    dataType: 'string',
    transformRule: 'custom',
    status: 'active',
    description: '用户名映射',
    notes: '用户名转换为操作员ID'
  }
])

const qualityMetrics = ref({
  completeness: 95.2,
  accuracy: 98.7,
  consistency: 92.1,
  timeliness: 89.5
})

const qualityIssues = ref([
  {
    id: '1',
    type: '数据缺失',
    severity: '高',
    scope: '设备位置信息',
    discoveredAt: '2025-08-26 10:30:00'
  },
  {
    id: '2',
    type: '格式不一致',
    severity: '中',
    scope: '时间戳格式',
    discoveredAt: '2025-08-26 09:15:00'
  },
  {
    id: '3',
    type: '数据重复',
    severity: '低',
    scope: '设备状态记录',
    discoveredAt: '2025-08-26 08:45:00'
  },
  {
    id: '4',
    type: '数据异常',
    severity: '高',
    scope: '温度传感器读数',
    discoveredAt: '2025-08-26 11:20:00'
  },
  {
    id: '5',
    type: '编码错误',
    severity: '中',
    scope: 'MMSI船舶识别码',
    discoveredAt: '2025-08-26 10:45:00'
  },
  {
    id: '6',
    type: '字段缺失',
    severity: '中',
    scope: 'AIS航行状态',
    discoveredAt: '2025-08-26 10:12:00'
  },
  {
    id: '7',
    type: '数据过期',
    severity: '低',
    scope: '雷达跟踪数据',
    discoveredAt: '2025-08-26 09:30:00'
  },
  {
    id: '8',
    type: '精度不足',
    severity: '中',
    scope: 'GPS坐标精度',
    discoveredAt: '2025-08-26 08:55:00'
  }
])

const conversionTasks = ref([
  {
    id: '1',
    name: 'GB28181转RTSP',
    sourceFormat: 'GB28181-Event',
    targetFormat: 'RTSP-Stream',
    status: 'running',
    progress: 78
  },
  {
    id: '2',
    name: 'ONVIF转JSON',
    sourceFormat: 'ONVIF-Device',
    targetFormat: 'GB28181-Event',
    status: 'completed',
    progress: 100
  },
  {
    id: '3',
    name: 'CSV转XML',
    sourceFormat: 'Custom-Metadata',
    targetFormat: 'ONVIF-Device',
    status: 'paused',
    progress: 42
  },
  {
    id: '4',
    name: 'AIS数据标准化',
    sourceFormat: 'AIS-Position',
    targetFormat: 'GB28181-Event',
    status: 'running',
    progress: 56
  },
  {
    id: '5',
    name: '雷达数据转换',
    sourceFormat: 'Radar-Track',
    targetFormat: 'AIS-Position',
    status: 'completed',
    progress: 100
  },
  {
    id: '6',
    name: '海康事件转换',
    sourceFormat: 'HikVision-Event',
    targetFormat: 'GB28181-Event',
    status: 'running',
    progress: 23
  },
  {
    id: '7',
    name: '大华报警转换',
    sourceFormat: 'Dahua-Alarm',
    targetFormat: 'ONVIF-Device',
    status: 'failed',
    progress: 15
  },
  {
    id: '8',
    name: '气象数据标准化',
    sourceFormat: 'Weather-Data',
    targetFormat: 'IoT-Sensor',
    status: 'completed',
    progress: 100
  },
  {
    id: '9',
    name: 'IoT传感器数据转换',
    sourceFormat: 'IoT-Sensor',
    targetFormat: 'GB28181-Event',
    status: 'running',
    progress: 89
  },
  {
    id: '10',
    name: 'WebRTC媒体转换',
    sourceFormat: 'WebRTC-Media',
    targetFormat: 'RTSP-Stream',
    status: 'paused',
    progress: 67
  },
  {
    id: '11',
    name: 'MQTT消息标准化',
    sourceFormat: 'MQTT-Message',
    targetFormat: 'IoT-Sensor',
    status: 'failed',
    progress: 8
  }
])

// 方法
const editFormat = (record: any) => {
  editingFormat.value = record
  Object.assign(formatForm, record)
  showFormatModal.value = true
}

const toggleFormatStatus = (record: any) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  message.success(`数据格式 ${record.name} 已${record.status === 'active' ? '启用' : '禁用'}`)
}

const saveFormat = async () => {
  try {
    await formatFormRef.value.validate()
    
    if (editingFormat.value) {
      // 编辑现有格式
      const index = formatList.value.findIndex(f => f.id === editingFormat.value.id)
      if (index !== -1) {
        Object.assign(formatList.value[index], { ...formatForm })
        message.success('数据格式更新成功')
      }
    } else {
      // 添加新格式
      const newFormat = {
        id: Date.now().toString(),
        ...formatForm,
        usageCount: 0
      }
      formatList.value.push(newFormat)
      message.success('数据格式添加成功')
    }
    
    showFormatModal.value = false
    resetFormatForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancelFormat = () => {
  showFormatModal.value = false
  resetFormatForm()
}

const resetFormatForm = () => {
  editingFormat.value = null
  Object.assign(formatForm, {
    name: '',
    type: '',
    description: '',
    specification: '',
    status: 'active'
  })
}

const editMapping = (record: any) => {
  editingMapping.value = record
  Object.assign(mappingForm, record)
  showMappingModal.value = true
}

const toggleMappingStatus = (record: any) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  message.success(`字段映射已${record.status === 'active' ? '启动' : '停止'}`)
}

const saveMapping = async () => {
  try {
    await mappingFormRef.value.validate()
    
    if (editingMapping.value) {
      // 编辑现有映射
      const index = mappingList.value.findIndex(m => m.id === editingMapping.value.id)
      if (index !== -1) {
        Object.assign(mappingList.value[index], { ...mappingForm })
        message.success('字段映射更新成功')
      }
    } else {
      // 添加新映射
      const newMapping = {
        id: Date.now().toString(),
        ...mappingForm,
        status: 'active'
      }
      mappingList.value.push(newMapping)
      message.success('字段映射添加成功')
    }
    
    showMappingModal.value = false
    resetMappingForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancelMapping = () => {
  showMappingModal.value = false
  resetMappingForm()
}

const resetMappingForm = () => {
  editingMapping.value = null
  Object.assign(mappingForm, {
    sourceField: '',
    targetField: '',
    dataType: '',
    transformRule: '',
    description: '',
    notes: ''
  })
}

const runQualityCheck = () => {
  message.success('数据质量检测已启动')
  // 模拟检测过程
  setTimeout(() => {
    qualityMetrics.value = {
      completeness: Math.floor(Math.random() * 20) + 80,
      accuracy: Math.floor(Math.random() * 20) + 80,
      consistency: Math.floor(Math.random() * 20) + 80,
      timeliness: Math.floor(Math.random() * 20) + 80
    }
    message.success('数据质量检测完成')
  }, 2000)
}

const saveQualityConfig = () => {
  message.success('质量检测配置已保存')
  showQualityModal.value = false
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    '高': '#ff4d4f',
    '中': '#fa8c16',
    '低': '#52c41a'
  }
  return colors[severity] || '#d9d9d9'
}

const getTaskStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'running': '#1890ff',
    'completed': '#52c41a',
    'paused': '#fa8c16',
    'failed': '#ff4d4f'
  }
  return colors[status] || '#d9d9d9'
}

const getTaskStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'running': '运行中',
    'completed': '已完成',
    'paused': '已暂停',
    'failed': '失败'
  }
  return texts[status] || status
}

const fixIssue = (record: any) => {
  message.success(`正在修复问题: ${record.type}`)
  // 模拟修复过程
  setTimeout(() => {
    const index = qualityIssues.value.findIndex(i => i.id === record.id)
    if (index !== -1) {
      qualityIssues.value.splice(index, 1)
      message.success('问题修复完成')
    }
  }, 1500)
}

const pauseTask = (record: any) => {
  record.status = 'paused'
  message.success('任务已暂停')
}

const resumeTask = (record: any) => {
  record.status = 'running'
  message.success('任务已恢复')
}

const viewResult = (record: any) => {
  message.info(`查看任务结果: ${record.name}`)
}

onMounted(() => {
  console.log('数据标准化页面已加载')
})
</script>

<style lang="less" scoped>
.data-standardization {
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

  .data-overview {
    margin-bottom: 24px;

    .overview-card {
      .card-content {
        display: flex;
        align-items: center;
        padding: 16px;

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.video { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.metadata { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.quality { background: linear-gradient(135deg, #fa8c16, #d46b08); }
          &.conversion { background: linear-gradient(135deg, #722ed1, #531dab); }
        }

        .stats {
          flex: 1;

          .number {
            font-size: 24px;
            font-weight: 600;
            color: #262626;
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: 14px;
            color: #8c8c8c;
          }
        }
      }
    }
  }

  .standardization-config {
    margin-bottom: 24px;

    .config-card {
      height: 100%;
    }
  }

  .quality-detection {
    margin-bottom: 24px;

    .quality-card {
      .quality-metrics {
        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .metric-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;

          span {
            width: 80px;
            font-size: 14px;
            color: #595959;
          }

          .ant-progress {
            flex: 1;
            margin-left: 16px;
          }
        }
      }

      .quality-issues {
        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .conversion-monitor {
    .monitor-card {
      margin-bottom: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .data-standardization {
    padding: 16px;

    .data-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .standardization-config {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

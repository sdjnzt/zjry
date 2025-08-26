<template>
  <div class="multi-protocol">
    <div class="page-header">
      <h2>多协议适配</h2>
      <p>支持多种视频协议接入，实现协议间的智能转换和统一管理</p>
    </div>

    <!-- 协议概览统计 -->
    <div class="protocol-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper gb28181">
                <DatabaseOutlined />
              </div>
              <div class="stats">
                <div class="number">324</div>
                <div class="label">GB/T 28181</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper onvif">
                <CameraOutlined />
              </div>
              <div class="stats">
                <div class="number">156</div>
                <div class="label">ONVIF</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper rtsp">
                <PlayCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">412</div>
                <div class="label">RTSP</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper custom">
                <ApiOutlined />
              </div>
              <div class="stats">
                <div class="number">78</div>
                <div class="label">自定义协议</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 协议管理区域 -->
    <div class="protocol-management">
      <a-row :gutter="16">
        <!-- 协议配置 -->
        <a-col :span="12">
          <a-card title="协议配置" class="management-card">
            <template #extra>
              <a-button type="primary" @click="showProtocolModal = true">
                <PlusOutlined />
                添加协议
              </a-button>
            </template>
            
            <a-table
              :columns="protocolColumns"
              :data-source="protocolList"
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
                    <a-button type="link" size="small" @click="editProtocol(record)">
                      编辑
                    </a-button>
                    <a-button 
                      type="link" 
                      size="small" 
                      :danger="record.status === 'active'"
                      @click="toggleProtocolStatus(record)"
                    >
                      {{ record.status === 'active' ? '禁用' : '启用' }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 协议转换 -->
        <a-col :span="12">
          <a-card title="协议转换规则" class="management-card">
            <template #extra>
              <a-button type="primary" @click="showConversionModal = true">
                <PlusOutlined />
                添加转换规则
              </a-button>
            </template>
            
            <a-table
              :columns="conversionColumns"
              :data-source="conversionList"
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
                    <a-button type="link" size="small" @click="editConversion(record)">
                      编辑
                    </a-button>
                    <a-button 
                      type="link" 
                      size="small" 
                      :danger="record.status === 'active'"
                      @click="toggleConversionStatus(record)"
                    >
                      {{ record.status === 'active' ? '禁用' : '启用' }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 添加协议弹窗 -->
    <a-modal
      v-model:open="showProtocolModal"
      title="添加协议"
      width="600px"
      @ok="handleProtocolSubmit"
      @cancel="handleProtocolCancel"
    >
      <a-form
        ref="protocolFormRef"
        :model="protocolForm"
        :rules="protocolRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="协议名称" name="name">
          <a-input v-model:value="protocolForm.name" placeholder="请输入协议名称" />
        </a-form-item>
        
        <a-form-item label="协议类型" name="type">
          <a-select v-model:value="protocolForm.type" placeholder="请选择协议类型">
            <a-select-option value="gb28181">GB/T 28181</a-select-option>
            <a-select-option value="onvif">ONVIF</a-select-option>
            <a-select-option value="rtsp">RTSP</a-select-option>
            <a-select-option value="custom">自定义协议</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="端口号" name="port">
          <a-input-number v-model:value="protocolForm.port" :min="1" :max="65535" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="protocolForm.status" placeholder="请选择状态">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="协议描述" name="description">
          <a-textarea v-model:value="protocolForm.description" :rows="3" placeholder="请输入协议描述" />
        </a-form-item>
        
        <a-form-item label="配置参数" name="config">
          <a-textarea v-model:value="protocolForm.config" :rows="4" placeholder="请输入JSON格式的配置参数" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加转换规则弹窗 -->
    <a-modal
      v-model:open="showConversionModal"
      title="添加转换规则"
      width="600px"
      @ok="handleConversionSubmit"
      @cancel="handleConversionCancel"
    >
      <a-form
        ref="conversionFormRef"
        :model="conversionForm"
        :rules="conversionRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="源协议" name="sourceProtocol">
          <a-select v-model:value="conversionForm.sourceProtocol" placeholder="请选择源协议">
            <a-select-option value="gb28181">GB/T 28181</a-select-option>
            <a-select-option value="onvif">ONVIF</a-select-option>
            <a-select-option value="rtsp">RTSP</a-select-option>
            <a-select-option value="custom">自定义协议</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="目标协议" name="targetProtocol">
          <a-select v-model:value="conversionForm.targetProtocol" placeholder="请选择目标协议">
            <a-select-option value="gb28181">GB/T 28181</a-select-option>
            <a-select-option value="onvif">ONVIF</a-select-option>
            <a-select-option value="rtsp">RTSP</a-select-option>
            <a-select-option value="custom">自定义协议</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="转换模式" name="mode">
          <a-select v-model:value="conversionForm.mode" placeholder="请选择转换模式">
            <a-select-option value="realtime">实时转换</a-select-option>
            <a-select-option value="batch">批量转换</a-select-option>
            <a-select-option value="on-demand">按需转换</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="优先级" name="priority">
          <a-input-number v-model:value="conversionForm.priority" :min="1" :max="10" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="转换规则" name="rules">
          <a-textarea v-model:value="conversionForm.rules" :rows="4" placeholder="请输入转换规则配置" />
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea v-model:value="conversionForm.notes" :rows="2" placeholder="请输入备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined, DatabaseOutlined, CameraOutlined, PlayCircleOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'

// 协议配置表格列定义
const protocolColumns = [
  { title: '协议名称', dataIndex: 'name', key: 'name' },
  { title: '协议类型', dataIndex: 'type', key: 'type' },
  { title: '端口号', dataIndex: 'port', key: 'port' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '设备数量', dataIndex: 'deviceCount', key: 'deviceCount' },
  { title: '操作', key: 'action', width: 150 }
]

// 协议转换表格列定义
const conversionColumns = [
  { title: '源协议', dataIndex: 'sourceProtocol', key: 'sourceProtocol' },
  { title: '目标协议', dataIndex: 'targetProtocol', key: 'targetProtocol' },
  { title: '转换模式', dataIndex: 'mode', key: 'mode' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 200 }
]

// 响应式数据
const showProtocolModal = ref(false)
const showConversionModal = ref(false)
const editingProtocol = ref<any>(null)
const editingConversion = ref<any>(null)
const protocolFormRef = ref()
const conversionFormRef = ref()

// 协议表单数据
const protocolForm = reactive({
  name: '',
  type: '',
  port: 80,
  status: 'active',
  description: '',
  config: ''
})

// 转换规则表单数据
const conversionForm = reactive({
  sourceProtocol: '',
  targetProtocol: '',
  mode: '',
  priority: 5,
  rules: '',
  notes: ''
})

// 表单验证规则
const protocolRules = {
  name: [{ required: true, message: '请输入协议名称' }],
  type: [{ required: true, message: '请选择协议类型' }],
  port: [{ required: true, message: '请输入端口号' }],
  status: [{ required: true, message: '请选择状态' }]
}

const conversionRules = {
  sourceProtocol: [{ required: true, message: '请选择源协议' }],
  targetProtocol: [{ required: true, message: '请选择目标协议' }],
  mode: [{ required: true, message: '请选择转换模式' }],
  priority: [{ required: true, message: '请输入优先级' }]
}

// 模拟数据
const protocolList = ref([
  {
    id: '1',
    name: 'GB28181-2022',
    type: 'gb28181',
    port: 5060,
    status: 'active',
    deviceCount: 324,
    description: '国标视频监控协议',
    config: '{"sipDomain": "3402000000", "localPort": 5060}'
  },
  {
    id: '2',
    name: 'ONVIF-2.0',
    type: 'onvif',
    port: 80,
    status: 'active',
    deviceCount: 156,
    description: '网络视频接口标准',
    config: '{"wsdlPath": "/onvif/device_service", "username": "admin"}'
  },
  {
    id: '3',
    name: 'RTSP-Server',
    type: 'rtsp',
    port: 554,
    status: 'active',
    deviceCount: 412,
    description: '实时流传输协议',
    config: '{"rtspPort": 554, "rtpPort": 8000}'
  },
  {
    id: '4',
    name: 'Custom-API',
    type: 'custom',
    port: 8080,
    status: 'inactive',
    deviceCount: 78,
    description: '自定义API协议',
    config: '{"apiEndpoint": "/api/v1", "authType": "token"}'
  },
  {
    id: '5',
    name: 'GB28181-2016',
    type: 'gb28181',
    port: 5061,
    status: 'active',
    deviceCount: 89,
    description: '国标2016版本协议',
    config: '{"sipDomain": "3402000000", "localPort": 5061, "version": "2016"}'
  },
  {
    id: '6',
    name: 'ONVIF-Profile-S',
    type: 'onvif',
    port: 8080,
    status: 'active',
    deviceCount: 67,
    description: 'ONVIF Profile S标准',
    config: '{"wsdlPath": "/onvif/device_service", "profile": "S", "username": "admin"}'
  },
  {
    id: '7',
    name: 'RTSP-Multicast',
    type: 'rtsp',
    port: 554,
    status: 'active',
    deviceCount: 123,
    description: 'RTSP组播流服务',
    config: '{"rtspPort": 554, "multicastEnabled": true, "multicastIP": "224.1.1.1"}'
  },
  {
    id: '8',
    name: 'HikVision-SDK',
    type: 'custom',
    port: 8000,
    status: 'active',
    deviceCount: 45,
    description: '海康威视SDK协议',
    config: '{"sdkVersion": "6.1.9", "port": 8000, "authMode": "digest"}'
  },
  {
    id: '9',
    name: 'Dahua-SDK',
    type: 'custom',
    port: 37777,
    status: 'active',
    deviceCount: 33,
    description: '大华SDK协议',
    config: '{"sdkVersion": "3.0", "port": 37777, "keepAlive": 30}'
  },
  {
    id: '10',
    name: 'RTMP-Server',
    type: 'custom',
    port: 1935,
    status: 'inactive',
    deviceCount: 0,
    description: '实时消息传输协议',
    config: '{"rtmpPort": 1935, "chunkSize": 4096, "maxConnections": 1000}'
  },
  {
    id: '11',
    name: 'WebRTC-Gateway',
    type: 'custom',
    port: 8443,
    status: 'active',
    deviceCount: 28,
    description: 'WebRTC网关协议',
    config: '{"httpsPort": 8443, "stunServer": "stun:stun.l.google.com:19302"}'
  },
  {
    id: '12',
    name: 'ONVIF-Profile-T',
    type: 'onvif',
    port: 8081,
    status: 'active',
    deviceCount: 34,
    description: 'ONVIF Profile T高级分析',
    config: '{"wsdlPath": "/onvif/device_service", "profile": "T", "analytics": true}'
  }
])

const conversionList = ref([
  {
    id: '1',
    sourceProtocol: 'gb28181',
    targetProtocol: 'rtsp',
    mode: 'realtime',
    priority: 1,
    status: 'active',
    rules: '{"videoCodec": "H.264", "audioCodec": "G.711"}',
    notes: '国标转RTSP实时流'
  },
  {
    id: '2',
    sourceProtocol: 'onvif',
    targetProtocol: 'gb28181',
    mode: 'on-demand',
    priority: 2,
    status: 'active',
    rules: '{"ptzControl": true, "eventNotification": true}',
    notes: 'ONVIF转国标按需转换'
  },
  {
    id: '3',
    sourceProtocol: 'rtsp',
    targetProtocol: 'custom',
    mode: 'batch',
    priority: 3,
    status: 'active',
    rules: '{"format": "mp4", "bitrate": "2Mbps", "resolution": "1920x1080"}',
    notes: 'RTSP流转自定义格式批量处理'
  },
  {
    id: '4',
    sourceProtocol: 'custom',
    targetProtocol: 'onvif',
    mode: 'realtime',
    priority: 2,
    status: 'active',
    rules: '{"profileMapping": {"S": "standard", "T": "advanced"}}',
    notes: '自定义协议转ONVIF实时转换'
  },
  {
    id: '5',
    sourceProtocol: 'gb28181',
    targetProtocol: 'custom',
    mode: 'on-demand',
    priority: 4,
    status: 'inactive',
    rules: '{"webrtcEnabled": true, "iceServers": ["stun:stun.l.google.com:19302"]}',
    notes: '国标转WebRTC按需转换'
  },
  {
    id: '6',
    sourceProtocol: 'onvif',
    targetProtocol: 'rtsp',
    mode: 'realtime',
    priority: 1,
    status: 'active',
    rules: '{"streamProfile": "main", "videoCodec": "H.265", "audioEnabled": false}',
    notes: 'ONVIF转RTSP主码流实时转换'
  },
  {
    id: '7',
    sourceProtocol: 'rtsp',
    targetProtocol: 'gb28181',
    mode: 'batch',
    priority: 5,
    status: 'active',
    rules: '{"sipDomain": "3402000000", "deviceType": "camera", "manufacturer": "generic"}',
    notes: 'RTSP流转国标批量注册'
  },
  {
    id: '8',
    sourceProtocol: 'custom',
    targetProtocol: 'rtsp',
    mode: 'realtime',
    priority: 3,
    status: 'active',
    rules: '{"transcoding": true, "targetCodec": "H.264", "bitrate": "adaptive"}',
    notes: '自定义协议转RTSP实时转码'
  }
])

// 编辑协议
const editProtocol = (record: any) => {
  editingProtocol.value = record
  Object.assign(protocolForm, record)
  showProtocolModal.value = true
}

// 切换协议状态
const toggleProtocolStatus = (record: any) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  message.success(`协议${record.name}已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 编辑转换规则
const editConversion = (record: any) => {
  editingConversion.value = record
  Object.assign(conversionForm, record)
  showConversionModal.value = true
}

// 切换转换规则状态
const toggleConversionStatus = (record: any) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  message.success(`转换规则已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 提交协议表单
const handleProtocolSubmit = () => {
  if (editingProtocol.value) {
    // 编辑模式
    Object.assign(editingProtocol.value, protocolForm)
    message.success('协议更新成功')
  } else {
    // 新增模式
    const newProtocol = {
      id: Date.now().toString(),
      ...protocolForm,
      deviceCount: 0
    }
    protocolList.value.push(newProtocol)
    message.success('协议添加成功')
  }
  showProtocolModal.value = false
  resetProtocolForm()
}

// 取消协议表单
const handleProtocolCancel = () => {
  showProtocolModal.value = false
  resetProtocolForm()
}

// 提交转换规则表单
const handleConversionSubmit = () => {
  if (editingConversion.value) {
    // 编辑模式
    Object.assign(editingConversion.value, conversionForm)
    message.success('转换规则更新成功')
  } else {
    // 新增模式
    const newConversion = {
      id: Date.now().toString(),
      ...conversionForm,
      status: 'active'
    }
    conversionList.value.push(newConversion)
    message.success('转换规则添加成功')
  }
  showConversionModal.value = false
  resetConversionForm()
}

// 取消转换规则表单
const handleConversionCancel = () => {
  showConversionModal.value = false
  resetConversionForm()
}

// 重置协议表单
const resetProtocolForm = () => {
  Object.assign(protocolForm, {
    name: '',
    type: '',
    port: 80,
    status: 'active',
    description: '',
    config: ''
  })
  editingProtocol.value = null
}

// 重置转换规则表单
const resetConversionForm = () => {
  Object.assign(conversionForm, {
    sourceProtocol: '',
    targetProtocol: '',
    mode: '',
    priority: 5,
    rules: '',
    notes: ''
  })
  editingConversion.value = null
}

onMounted(() => {
  console.log('多协议适配页面已加载')
})
</script>

<style lang="less" scoped>
.multi-protocol {
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

  .protocol-overview {
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

          &.gb28181 { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.onvif { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.rtsp { background: linear-gradient(135deg, #fa8c16, #d46b08); }
          &.custom { background: linear-gradient(135deg, #722ed1, #531dab); }
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

  .protocol-management {
    margin-bottom: 24px;

    .management-card {
      height: 100%;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .multi-protocol {
    padding: 16px;

    .protocol-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .protocol-management {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

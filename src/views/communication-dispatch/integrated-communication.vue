<template>
  <div class="integrated-communication">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>融合通讯</h1>
      <p>集成多种通讯方式，提供统一的通讯调度服务</p>
    </div>

    <!-- 通讯状态概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="在线设备"
            :value="statusData.onlineDevices"
            :value-style="{ color: '#3f8600' }"
          >
            <template #suffix>
              <span class="status-indicator online"></span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="通讯通道"
            :value="statusData.communicationChannels"
            :value-style="{ color: '#1890ff' }"
          >
            <template #suffix>
              <span class="status-indicator active"></span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="信号强度"
            :value="statusData.signalStrength"
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="通讯质量"
            :value="statusData.qualityScore"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #suffix>分</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" class="status-overview" style="margin-top: 16px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日通讯"
            :value="statusData.todayCommunications"
            :value-style="{ color: '#eb2f96' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总通讯时长"
            :value="statusData.totalDuration"
            :value-style="{ color: '#13c2c2' }"
          >
            <template #suffix>小时</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均响应时间"
            :value="statusData.avgResponseTime"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>ms</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#f5222d' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="16" class="main-content">
      <!-- 通讯配置管理 -->
      <a-col :span="12">
        <a-card title="通讯配置管理" class="config-card">
          <a-form layout="vertical">
            <a-form-item label="通讯协议">
              <a-select v-model:value="configData.protocol" placeholder="选择通讯协议">
                <a-select-option value="tcp">TCP</a-select-option>
                <a-select-option value="udp">UDP</a-select-option>
                <a-select-option value="http">HTTP</a-select-option>
                <a-select-option value="websocket">WebSocket</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="端口号">
              <a-input-number v-model:value="configData.port" :min="1" :max="65535" />
            </a-form-item>
            <a-form-item label="超时时间(秒)">
              <a-input-number v-model:value="configData.timeout" :min="1" :max="60" />
            </a-form-item>
            <a-form-item label="重试次数">
              <a-input-number v-model:value="configData.retryCount" :min="0" :max="10" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveConfig">
                <template #icon><SaveOutlined /></template>
                保存配置
              </a-button>
              <a-button style="margin-left: 8px" @click="resetConfig">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 通讯质量监控 -->
      <a-col :span="12">
        <a-card title="通讯质量监控" class="monitor-card">
          <div class="quality-chart">
            <div class="chart-placeholder">
              <div class="chart-title">信号质量趋势</div>
              <div class="chart-content">
                <div class="quality-indicator">
                  <span class="quality-label">当前质量:</span>
                  <a-progress
                    :percent="statusData.qualityScore"
                    :show-info="false"
                    :stroke-color="getQualityColor(statusData.qualityScore)"
                  />
                  <span class="quality-value">{{ statusData.qualityScore }}%</span>
                </div>
                <div class="signal-info">
                  <div class="signal-item">
                    <span class="signal-label">延迟:</span>
                    <span class="signal-value">{{ statusData.latency }}ms</span>
                  </div>
                  <div class="signal-item">
                    <span class="signal-label">丢包率:</span>
                    <span class="signal-value">{{ statusData.packetLoss }}%</span>
                  </div>
                  <div class="signal-item">
                    <span class="signal-label">带宽:</span>
                    <span class="signal-value">{{ statusData.bandwidth }}Mbps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 通讯记录 -->
    <a-card title="通讯记录" class="records-card">
      <div class="table-operations">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索通讯记录"
            style="width: 200px"
            @search="onSearch"
          />
          <a-range-picker v-model:value="dateRange" />
          <a-button type="primary" @click="refreshRecords">刷新</a-button>
        </a-space>
      </div>
      
      <a-table
        :columns="recordColumns"
        :data-source="communicationRecords"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetails(record)">
                <template #icon><EyeOutlined /></template>
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="replayRecord(record)">
                <template #icon><PlayCircleOutlined /></template>
                回放
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情查看模态框 -->
    <a-modal
      v-model:open="detailsModalVisible"
      title="通讯记录详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions v-if="selectedRecord" :column="2" bordered>
        <a-descriptions-item label="通讯ID">{{ selectedRecord.id }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ selectedRecord.deviceName }}</a-descriptions-item>
        <a-descriptions-item label="通讯类型">{{ selectedRecord.type }}</a-descriptions-item>
        <a-descriptions-item label="通讯状态">{{ getStatusText(selectedRecord.status) }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ selectedRecord.startTime }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ selectedRecord.endTime }}</a-descriptions-item>
        <a-descriptions-item label="通讯时长">{{ selectedRecord.duration }}</a-descriptions-item>
        <a-descriptions-item label="信号强度">{{ selectedRecord.signalStrength }}%</a-descriptions-item>
        <a-descriptions-item label="延迟">{{ selectedRecord.latency }}ms</a-descriptions-item>
        <a-descriptions-item label="丢包率">{{ selectedRecord.packetLoss }}%</a-descriptions-item>
        <a-descriptions-item label="负责部门">{{ selectedRecord.department }}</a-descriptions-item>
        <a-descriptions-item label="操作员">{{ selectedRecord.operator }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedRecord.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  UserOutlined,
  SignalFilled,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

/**
 * 通讯状态数据
 */
const statusData = reactive({
  onlineDevices: 156,
  communicationChannels: 24,
  signalStrength: 85,
  qualityScore: 92,
  latency: 45,
  packetLoss: 0.2,
  bandwidth: 100,
  todayCommunications: 234,
  totalDuration: 89.5,
  avgResponseTime: 32,
  successRate: 98.7
})

/**
 * 配置数据
 */
const configData = reactive({
  protocol: 'tcp',
  port: 8080,
  timeout: 30,
  retryCount: 3
})

/**
 * 搜索和筛选
 */
const searchText = ref('')
const dateRange = ref([])
const loading = ref(false)

/**
 * 通讯记录数据
 */
const communicationRecords = ref([
  {
    id: 'COM001',
    deviceName: '长江集装箱一号·甲板摄像头',
    type: '视频通话',
    status: 'success',
    startTime: '2025-08-20 10:30:00',
    endTime: '2025-08-20 10:45:00',
    duration: '15分钟',
    signalStrength: 90,
    latency: 35,
    packetLoss: 0.1,
    remark: '画面稳定、无卡顿',
    department: '调度中心',
    operator: '陈志强'
  },
  {
    id: 'COM002',
    deviceName: '海巡三号·卫星电话',
    type: '语音通话',
    status: 'success',
    startTime: '2025-08-20 09:15:00',
    endTime: '2025-08-20 09:25:00',
    duration: '10分钟',
    signalStrength: 85,
    latency: 42,
    packetLoss: 0.3,
    remark: '语音清晰、回声抑制正常',
    department: '海事部门',
    operator: '刘建国'
  },
  {
    id: 'COM003',
    deviceName: '航标站·数据采集终端',
    type: '数据传输',
    status: 'failed',
    startTime: '2025-08-20 08:00:00',
    endTime: '2025-08-20 08:05:00',
    duration: '5分钟',
    signalStrength: 45,
    latency: 120,
    packetLoss: 5.2,
    remark: '上行波动大，触发超时重传',
    department: '技术保障',
    operator: '王海峰'
  },
  {
    id: 'COM004',
    deviceName: '港区闸口·高清云台摄像机',
    type: '视频通话',
    status: 'success',
    startTime: '2025-08-20 14:00:00',
    endTime: '2025-08-20 14:20:00',
    duration: '20分钟',
    signalStrength: 95,
    latency: 28,
    packetLoss: 0.05,
    remark: '码率稳定、无明显丢帧',
    department: '港口管理',
    operator: '赵明华'
  },
  {
    id: 'COM005',
    deviceName: '应急指挥车·集群对讲终端',
    type: '语音通话',
    status: 'success',
    startTime: '2025-08-20 16:00:00',
    endTime: '2025-08-20 16:15:00',
    duration: '15分钟',
    signalStrength: 88,
    latency: 38,
    packetLoss: 0.2,
    remark: '组呼接入正常，覆盖良好',
    department: '应急响应',
    operator: '钱伟民'
  },
  {
    id: 'COM006',
    deviceName: '拖轮·移动视频终端',
    type: '数据传输',
    status: 'success',
    startTime: '2025-08-20 11:00:00',
    endTime: '2025-08-20 11:30:00',
    duration: '30分钟',
    signalStrength: 82,
    latency: 55,
    packetLoss: 0.8,
    remark: '数据包完整校验通过',
    department: '技术保障',
    operator: '孙志刚'
  },
  {
    id: 'COM007',
    deviceName: '危化品堆场·安检采集器',
    type: '视频通话',
    status: 'success',
    startTime: '2025-08-20 13:00:00',
    endTime: '2025-08-20 13:10:00',
    duration: '10分钟',
    signalStrength: 92,
    latency: 32,
    packetLoss: 0.1,
    remark: '告警推送与回传同步',
    department: '安全监督',
    operator: '周建军'
  },
  {
    id: 'COM008',
    deviceName: '沿江站点·气象监测主机',
    type: '数据传输',
    status: 'success',
    startTime: '2025-08-20 15:00:00',
    endTime: '2025-08-20 15:25:00',
    duration: '25分钟',
    signalStrength: 87,
    latency: 45,
    packetLoss: 0.3,
    remark: '分钟级数据稳定同步',
    department: '气象部门',
    operator: '吴建华'
  }
])

/**
 * 表格列定义
 */
const recordColumns = [
  {
    title: '通讯ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName'
  },
  {
    title: '通讯类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '通讯状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime'
  },
  {
    title: '通讯时长',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: '信号强度',
    dataIndex: 'signalStrength',
    key: 'signalStrength',
    customRender: ({ text }: { text: number }) => `${text}%`
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '操作员',
    dataIndex: 'operator',
    key: 'operator'
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

/**
 * 模态框控制
 */
const detailsModalVisible = ref(false)
/**
 * 通讯记录类型
 */
interface CommRecord {
  id: string
  deviceName: string
  type: string
  status: string
  startTime: string
  endTime: string
  duration: string
  signalStrength: number
  latency: number
  packetLoss: number
  department: string
  operator: string
  remark?: string
}

const selectedRecord = ref<CommRecord | null>(null)

/**
 * 获取质量颜色
 */
const getQualityColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 70) return '#faad14'
  return '#f5222d'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    pending: 'blue',
    processing: 'orange'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '待处理',
    processing: '进行中'
  }
  return textMap[status] || status
}

/**
 * 保存配置
 */
const saveConfig = () => {
  message.success('配置保存成功')
}

/**
 * 重置配置
 */
const resetConfig = () => {
  Object.assign(configData, {
    protocol: 'tcp',
    port: 8080,
    timeout: 30,
    retryCount: 3
  })
  message.info('配置已重置')
}

/**
 * 搜索记录
 */
const onSearch = (value: string) => {
  console.log('搜索:', value)
  message.info(`搜索关键词: ${value}`)
}

/**
 * 刷新记录
 */
const refreshRecords = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('记录已刷新')
  }, 1000)
}

/**
 * 查看详情
 */
const viewDetails = (record: any) => {
  selectedRecord.value = record
  detailsModalVisible.value = true
}

/**
 * 回放记录
 */
const replayRecord = (record: any) => {
  message.info(`开始回放通讯记录: ${record.id}`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('融合通讯页面已加载')
})
</script>

<style lang="less" scoped>
.integrated-communication {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    
    h1 {
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

  .status-overview {
    margin-bottom: 24px;

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-left: 8px;

      &.online {
        background-color: #52c41a;
      }

      &.active {
        background-color: #1890ff;
      }
    }
  }

  .main-content {
    margin-bottom: 24px;

    .config-card {
      height: 100%;
    }

    .monitor-card {
      height: 100%;

      .quality-chart {
        .chart-placeholder {
          text-align: center;
          padding: 20px;

          .chart-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #262626;
          }

          .chart-content {
            .quality-indicator {
              display: flex;
              align-items: center;
              margin-bottom: 20px;

              .quality-label {
                margin-right: 12px;
                color: #595959;
                min-width: 80px;
              }

              .ant-progress {
                flex: 1;
                margin-right: 12px;
              }

              .quality-value {
                font-weight: 600;
                color: #262626;
                min-width: 40px;
              }
            }

            .signal-info {
              .signal-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;

                .signal-label {
                  color: #595959;
                }

                .signal-value {
                  font-weight: 500;
                  color: #262626;
                }
              }
            }
          }
        }
      }
    }
  }

  .records-card {
    .table-operations {
      margin-bottom: 16px;
    }
  }
}
</style>

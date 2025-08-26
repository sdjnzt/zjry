<template>
  <div class="quality-diagnosis">
    <div class="page-header">
      <h2>视频质量诊断</h2>
      <p>自动检测视频质量问题，包括清晰度、流畅性、延迟等指标，提供诊断报告和优化建议</p>
    </div>

    <div class="diagnosis-content">
      <!-- 左侧诊断概览 -->
      <div class="diagnosis-overview">
        <a-card title="诊断概览" class="overview-card">
          <div class="overview-stats">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic
                  title="总摄像头"
                  :value="70"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="正常"
                  :value="70"
                  :value-style="{ color: '#52c41a' }"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="异常"
                  :value="0"
                  :value-style="{ color: '#ff4d4f' }"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="离线"
                  :value="0"
                  :value-style="{ color: '#faad14' }"
                />
              </a-col>
            </a-row>
          </div>
          
          <a-divider />
          
          <div class="quality-chart">
            <div ref="qualityChartRef" style="height: 200px;"></div>
          </div>
        </a-card>
      </div>

      <!-- 右侧诊断列表 -->
      <div class="diagnosis-list">
        <a-card title="诊断详情" class="diagnosis-list-card">
          <template #extra>
            <a-space>
              <a-button @click="refreshDiagnosis">
                <template #icon><ReloadOutlined /></template>
                刷新
              </a-button>
              <a-button type="primary" @click="exportReport">
                导出报告
              </a-button>
            </a-space>
          </template>
          
          <a-table
            :columns="columns"
            :data-source="diagnosisData"
            :pagination="pagination"
            :loading="loading"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'quality'">
                <a-progress 
                  :percent="record.quality" 
                  :stroke-color="getQualityColor(record.quality)"
                  :show-info="false"
                  size="small"
                />
                <span style="margin-left: 8px;">{{ record.quality }}%</span>
              </template>
              
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button 
                    size="small" 
                    @click="showDetail(record)"
                  >
                    详情
                  </a-button>
                  <a-button 
                    size="small" 
                    type="primary"
                    @click="fixIssue(record)"
                    :disabled="record.status === 'normal'"
                  >
                    修复
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </div>
    </div>

    <!-- 诊断详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      title="诊断详情"
      width="800px"
      footer={null}
    >
      <div v-if="selectedRecord" class="diagnosis-detail">
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="摄像头名称">
            {{ selectedRecord.cameraName }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ selectedRecord.ip }}
          </a-descriptions-item>
          <a-descriptions-item label="安装位置">
            {{ selectedRecord.location }}
          </a-descriptions-item>
          <a-descriptions-item label="诊断状态">
            <a-tag :color="getStatusColor(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider />
        
        <a-descriptions title="质量指标" :column="2" bordered>
          <a-descriptions-item label="整体质量">
            <a-progress 
              :percent="selectedRecord.quality" 
              :stroke-color="getQualityColor(selectedRecord.quality)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="清晰度">
            <a-progress 
              :percent="selectedRecord.clarity" 
              :stroke-color="getQualityColor(selectedRecord.clarity)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="流畅性">
            <a-progress 
              :percent="selectedRecord.fluency" 
              :stroke-color="getQualityColor(selectedRecord.fluency)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="延迟">
            <a-progress 
              :percent="selectedRecord.latency" 
              :stroke-color="getQualityColor(selectedRecord.latency)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="分辨率">
            <a-tag color="blue">{{ selectedRecord.resolution }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="帧率">
            <a-tag color="green">{{ selectedRecord.fps > 0 ? selectedRecord.fps + 'fps' : 'N/A' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="码率">
            <a-tag color="purple">{{ selectedRecord.bitrate > 0 ? selectedRecord.bitrate + 'Mbps' : 'N/A' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="信噪比">
            <a-tag color="orange">{{ selectedRecord.snr > 0 ? selectedRecord.snr + 'dB' : 'N/A' }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider />
        
        <div class="issue-details">
          <h4>问题详情</h4>
          <a-list
            :data-source="selectedRecord.issues"
            item-layout="horizontal"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.level === 'high' ? '#ff4d4f' : item.level === 'medium' ? '#faad14' : '#52c41a' }">
                      <ExclamationCircleOutlined />
                    </a-avatar>
                  </template>
                  <template #title>
                    <span :style="{ color: item.level === 'high' ? '#ff4d4f' : item.level === 'medium' ? '#faad14' : '#52c41a' }">
                      {{ item.title }}
                    </span>
                  </template>
                  <template #description>
                    <div>{{ item.description }}</div>
                    <div class="issue-suggestion">
                      <strong>建议:</strong> {{ item.suggestion }}
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'

/**
 * 视频质量诊断组件
 * 自动检测视频质量问题
 */

// 响应式数据
const loading = ref(false)
const showDetailModal = ref(false)
const selectedRecord = ref<any>(null)
const qualityChartRef = ref<HTMLElement>()
let qualityChart: echarts.ECharts | null = null

// 诊断数据
const diagnosisData = ref([
  {
    id: 1,
    cameraName: '码头1号',
    ip: '192.168.1.101',
    location: '码头前沿',
    status: 'normal',
    quality: 95,
    clarity: 98,
    fluency: 92,
    latency: 150,
    resolution: '4K',
    fps: 25,
    bitrate: 8,
    snr: 42,
    lastDiagnosis: '2025-08-26 10:30:00',
    issues: []
  },
  {
    id: 2,
    cameraName: '码头2号',
    ip: '192.168.1.102',
    location: '码头前沿',
    status: 'warning',
    quality: 78,
    clarity: 85,
    fluency: 70,
    latency: 300,
    resolution: '1080P',
    fps: 15,
    bitrate: 4,
    snr: 35,
    lastDiagnosis: '2025-08-26 10:30:00',
    issues: [
      {
        level: 'medium',
        title: '帧率偏低',
        description: '当前帧率为15fps，低于标准25fps',
        suggestion: '检查网络带宽，调整编码参数'
      }
    ]
  },
  {
    id: 3,
    cameraName: '航道1号',
    ip: '192.168.1.103',
    location: '主航道',
    status: 'error',
    quality: 45,
    clarity: 60,
    fluency: 30,
    latency: 800,
    resolution: '720P',
    fps: 10,
    bitrate: 2,
    snr: 28,
    lastDiagnosis: '2025-08-26 10:30:00',
    issues: [
      {
        level: 'high',
        title: '网络延迟过高',
        description: '网络延迟达到800ms，严重影响实时性',
        suggestion: '检查网络连接，优化网络配置'
      },
      {
        level: 'high',
        title: '画面卡顿严重',
        description: '流畅性指标仅为30%，存在严重卡顿',
        suggestion: '检查设备性能，优化编码设置'
      }
    ]
  },
  {
    id: 4,
    cameraName: '锚地1号',
    ip: '192.168.1.104',
    location: '锚地区域',
    status: 'offline',
    quality: 0,
    clarity: 0,
    fluency: 0,
    latency: 0,
    resolution: 'N/A',
    fps: 0,
    bitrate: 0,
    snr: 0,
    lastDiagnosis: '2025-08-26 10:30:00',
    issues: [
      {
        level: 'high',
        title: '设备离线',
        description: '摄像头无法连接，网络中断',
        suggestion: '检查网络连接，重启设备'
      }
    ]
  },
  {
    id: 5,
    cameraName: '码头3号',
    ip: '192.168.1.105',
    location: '码头后方',
    status: 'normal',
    quality: 92,
    clarity: 95,
    fluency: 88,
    latency: 180,
    resolution: '4K',
    fps: 25,
    bitrate: 8,
    snr: 40,
    lastDiagnosis: '2025-08-26 10:28:00',
    issues: []
  },
  {
    id: 6,
    cameraName: '航道2号',
    ip: '192.168.1.106',
    location: '航道转弯处',
    status: 'warning',
    quality: 82,
    clarity: 88,
    fluency: 75,
    latency: 250,
    resolution: '1080P',
    fps: 20,
    bitrate: 5,
    snr: 38,
    lastDiagnosis: '2025-08-26 10:25:00',
    issues: [
      {
        level: 'medium',
        title: '清晰度下降',
        description: '画面清晰度从95%降至88%，可能存在镜头污染',
        suggestion: '清洁镜头，检查摄像头防护罩'
      },
      {
        level: 'low',
        title: '轻微色彩偏差',
        description: '画面色彩饱和度偏低，可能存在白平衡问题',
        suggestion: '调整白平衡参数，检查环境光线'
      }
    ]
  },
  {
    id: 7,
    cameraName: '锚地2号',
    ip: '192.168.1.107',
    location: '锚地中心',
    status: 'error',
    quality: 35,
    clarity: 45,
    fluency: 25,
    latency: 1200,
    resolution: '720P',
    fps: 8,
    bitrate: 1.5,
    snr: 22,
    lastDiagnosis: '2025-08-26 10:22:00',
    issues: [
      {
        level: 'high',
        title: '严重网络丢包',
        description: '网络丢包率达到15%，导致画面严重失真',
        suggestion: '检查网络设备，更换网络线路'
      },
      {
        level: 'high',
        title: '编码器故障',
        description: 'H.264编码器工作异常，输出码率不稳定',
        suggestion: '重启编码器，检查固件版本'
      }
    ]
  },
  {
    id: 8,
    cameraName: '码头4号',
    ip: '192.168.1.108',
    location: '码头侧翼',
    status: 'normal',
    quality: 89,
    clarity: 92,
    fluency: 85,
    latency: 200,
    resolution: '1080P',
    fps: 25,
    bitrate: 6,
    snr: 39,
    lastDiagnosis: '2025-08-26 10:20:00',
    issues: []
  },
  {
    id: 9,
    cameraName: '航道3号',
    ip: '192.168.1.109',
    location: '航道入口',
    status: 'warning',
    quality: 76,
    clarity: 82,
    fluency: 68,
    latency: 350,
    resolution: '1080P',
    fps: 18,
    bitrate: 4.5,
    snr: 36,
    lastDiagnosis: '2025-08-26 10:18:00',
    issues: [
      {
        level: 'medium',
        title: '带宽不足',
        description: '当前带宽占用率95%，影响视频传输质量',
        suggestion: '增加网络带宽，优化QoS设置'
      },
      {
        level: 'low',
        title: '轻微画面抖动',
        description: '画面存在轻微抖动，可能受环境影响',
        suggestion: '检查设备安装稳定性，调整防抖参数'
      },
      {
        level: 'low',
        title: '夜间噪点增加',
        description: '夜间模式下画面噪点明显增加',
        suggestion: '调整降噪参数，检查红外补光效果'
      }
    ]
  },
  {
    id: 10,
    cameraName: '锚地3号',
    ip: '192.168.1.110',
    location: '锚地边缘',
    status: 'offline',
    quality: 0,
    clarity: 0,
    fluency: 0,
    latency: 0,
    resolution: 'N/A',
    fps: 0,
    bitrate: 0,
    snr: 0,
    lastDiagnosis: '2025-08-26 10:15:00',
    issues: [
      {
        level: 'high',
        title: '电源故障',
        description: '设备电源指示灯熄灭，可能电源模块损坏',
        suggestion: '检查电源线路，更换电源模块'
      }
    ]
  },
  {
    id: 11,
    cameraName: '码头5号',
    ip: '192.168.1.111',
    location: '码头装卸区',
    status: 'normal',
    quality: 94,
    clarity: 96,
    fluency: 91,
    latency: 160,
    resolution: '4K',
    fps: 25,
    bitrate: 8,
    snr: 41,
    lastDiagnosis: '2025-08-26 10:12:00',
    issues: []
  },
  {
    id: 12,
    cameraName: '航道4号',
    ip: '192.168.1.112',
    location: '航道出口',
    status: 'error',
    quality: 28,
    clarity: 35,
    fluency: 20,
    latency: 1500,
    resolution: '720P',
    fps: 5,
    bitrate: 1,
    snr: 18,
    lastDiagnosis: '2025-08-26 10:10:00',
    issues: [
      {
        level: 'high',
        title: '网络风暴',
        description: '检测到网络风暴，大量广播包影响正常通信',
        suggestion: '检查网络配置，隔离故障设备'
      },
      {
        level: 'high',
        title: '存储空间不足',
        description: '本地存储空间仅剩5%，无法正常录制',
        suggestion: '清理历史数据，扩展存储空间'
      },
      {
        level: 'medium',
        title: '温度过高',
        description: '设备温度达到75°C，超过正常工作范围',
        suggestion: '检查散热系统，改善通风条件'
      }
    ]
  },
  {
    id: 13,
    cameraName: '锚地4号',
    ip: '192.168.1.113',
    location: '锚地深水区',
    status: 'warning',
    quality: 71,
    clarity: 78,
    fluency: 65,
    latency: 400,
    resolution: '1080P',
    fps: 16,
    bitrate: 3.5,
    snr: 33,
    lastDiagnosis: '2025-08-26 10:08:00',
    issues: [
      {
        level: 'medium',
        title: '信号衰减',
        description: '无线信号强度较弱，影响传输稳定性',
        suggestion: '调整天线角度，增加信号放大器'
      }
    ]
  },
  {
    id: 14,
    cameraName: '码头6号',
    ip: '192.168.1.114',
    location: '码头维修区',
    status: 'normal',
    quality: 91,
    clarity: 94,
    fluency: 87,
    latency: 170,
    resolution: '1080P',
    fps: 25,
    bitrate: 6,
    snr: 40,
    lastDiagnosis: '2025-08-26 10:05:00',
    issues: []
  },
  {
    id: 15,
    cameraName: '航道5号',
    ip: '192.168.1.115',
    location: '航道中段',
    status: 'normal',
    quality: 88,
    clarity: 91,
    fluency: 84,
    latency: 190,
    resolution: '1080P',
    fps: 22,
    bitrate: 5.5,
    snr: 37,
    lastDiagnosis: '2025-08-26 10:02:00',
    issues: []
  },
  {
    id: 16,
    cameraName: '锚地5号',
    ip: '192.168.1.116',
    location: '锚地浅水区',
    status: 'error',
    quality: 42,
    clarity: 55,
    fluency: 38,
    latency: 900,
    resolution: '720P',
    fps: 12,
    bitrate: 2.5,
    snr: 25,
    lastDiagnosis: '2025-08-26 10:00:00',
    issues: [
      {
        level: 'high',
        title: '镜头起雾',
        description: '镜头表面起雾，严重影响画面清晰度',
        suggestion: '清洁镜头，检查密封性，更换防雾镜片'
      },
      {
        level: 'medium',
        title: '对焦异常',
        description: '自动对焦功能失效，画面模糊',
        suggestion: '重启摄像头，检查对焦马达'
      },
      {
        level: 'medium',
        title: '防水等级下降',
        description: '设备防护等级可能下降，存在进水风险',
        suggestion: '检查密封圈，更换防水配件'
      }
    ]
  },
  {
    id: 17,
    cameraName: '码头7号',
    ip: '192.168.1.117',
    location: '码头办公区',
    status: 'warning',
    quality: 79,
    clarity: 85,
    fluency: 72,
    latency: 280,
    resolution: '1080P',
    fps: 20,
    bitrate: 4.8,
    snr: 35,
    lastDiagnosis: '2025-08-26 09:58:00',
    issues: [
      {
        level: 'medium',
        title: '光线不足',
        description: '夜间光线不足，红外补光效果不佳',
        suggestion: '调整补光角度，增加补光强度'
      }
    ]
  },
  {
    id: 18,
    cameraName: '航道6号',
    ip: '192.168.1.118',
    location: '航道转弯处',
    status: 'normal',
    quality: 93,
    clarity: 95,
    fluency: 90,
    latency: 155,
    resolution: '4K',
    fps: 25,
    bitrate: 8,
    snr: 41,
    lastDiagnosis: '2025-08-26 09:55:00',
    issues: []
  },
  {
    id: 19,
    cameraName: '锚地6号',
    ip: '192.168.1.119',
    location: '锚地入口',
    status: 'offline',
    quality: 0,
    clarity: 0,
    fluency: 0,
    latency: 0,
    resolution: 'N/A',
    fps: 0,
    bitrate: 0,
    snr: 0,
    lastDiagnosis: '2025-08-26 09:52:00',
    issues: [
      {
        level: 'high',
        title: '网络设备故障',
        description: '交换机端口异常，无法建立网络连接',
        suggestion: '检查交换机状态，更换故障端口'
      }
    ]
  },
  {
    id: 20,
    cameraName: '码头8号',
    ip: '192.168.1.120',
    location: '码头停车场',
    status: 'normal',
    quality: 90,
    clarity: 93,
    fluency: 86,
    latency: 175,
    resolution: '1080P',
    fps: 25,
    bitrate: 6,
    snr: 39,
    lastDiagnosis: '2025-08-26 09:50:00',
    issues: []
  }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列定义
const columns = [
  {
    title: '摄像头名称',
    dataIndex: 'cameraName',
    key: 'cameraName',
    ellipsis: true,
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
    width: 80
  },
  {
    title: '质量评分',
    dataIndex: 'quality',
    key: 'quality',
    ellipsis: true,
    width: 200
  },
  {
    title: '安装位置',
    dataIndex: 'location',
    key: 'location',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    ellipsis: true
  }
]

// 计算属性
const totalCameras = computed(() => diagnosisData.value.length)
const normalCount = computed(() => diagnosisData.value.filter(item => item.status === 'normal').length)
const abnormalCount = computed(() => diagnosisData.value.filter(item => item.status === 'warning' || item.status === 'error').length)
const offlineCount = computed(() => diagnosisData.value.filter(item => item.status === 'offline').length)

// 方法
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'normal': 'green',
    'warning': 'orange',
    'error': 'red',
    'offline': 'default'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'normal': '正常',
    'warning': '警告',
    'error': '异常',
    'offline': '离线'
  }
  return textMap[status] || '未知'
}

const getQualityColor = (quality: number) => {
  if (quality >= 90) return '#52c41a'
  if (quality >= 70) return '#faad14'
  return '#ff4d4f'
}

const refreshDiagnosis = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // 模拟刷新数据
    console.log('刷新诊断数据')
  }, 1000)
}

const exportReport = () => {
  console.log('导出诊断报告')
}

const showDetail = (record: any) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

const fixIssue = (record: any) => {
  console.log('修复问题:', record.cameraName)
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const initQualityChart = () => {
  if (!qualityChartRef.value) return
  
  qualityChart = echarts.init(qualityChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '摄像头状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: normalCount.value, name: '正常', itemStyle: { color: '#52c41a' } },
          { value: abnormalCount.value, name: '异常', itemStyle: { color: '#ff4d4f' } },
          { value: offlineCount.value, name: '离线', itemStyle: { color: '#faad14' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  qualityChart.setOption(option)
}

// 生命周期
onMounted(() => {
  console.log('视频质量诊断组件已挂载')
  pagination.total = diagnosisData.value.length
  
  nextTick(() => {
    initQualityChart()
  })
})
</script>

<style lang="less" scoped>
.quality-diagnosis {
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
      margin: 0;
      color: @text-color-secondary;
      font-size: @font-size-sm;
    }
  }

  .diagnosis-content {
    flex: 1;
    display: flex;
    gap: 16px;
    min-height: 0;

    .diagnosis-overview {
      width: 400px;
      flex-shrink: 0;

      .overview-card {
        height: 100%;
        
        .overview-stats {
          margin-bottom: 16px;
        }

        .quality-chart {
          margin-top: 16px;
        }
      }
    }

    .diagnosis-list {
      flex: 1;
      min-height: 0;

      .diagnosis-list-card {
        height: 100%;
        
        .ant-table {
          // 确保表格容器能够自适应
          width: 100%;
          
          .ant-table-thead > tr > th {
            background-color: @background-color-light;
            font-weight: 500;
            // 移除固定宽度，让列自适应
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .ant-table-tbody > tr > td {
            // 移除固定宽度，让列自适应
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          // 表格滚动条样式
          .ant-table-body {
            overflow-x: auto;
          }
          
          // 确保表格列能够自适应
          .ant-table-cell {
            min-width: 0;
            word-break: break-word;
          }
        }
      }
    }
  }

  .diagnosis-detail {
    .issue-details {
      margin-top: 16px;

      h4 {
        margin: 0 0 16px 0;
        color: @text-color;
        font-size: 16px;
      }

      .issue-suggestion {
        margin-top: 8px;
        font-size: 12px;
        color: @text-color-secondary;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .quality-diagnosis {
    .diagnosis-content {
      flex-direction: column;
      
      .diagnosis-overview {
        width: 100%;
        margin-bottom: 16px;
      }
      
      .diagnosis-list {
        .diagnosis-list-card {
          .ant-table {
            .ant-table-body {
              overflow-x: auto;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quality-diagnosis {
    .diagnosis-content {
      gap: 12px;
      
      .diagnosis-overview {
        .overview-card {
          .overview-stats {
            .ant-row {
              .ant-col {
                margin-bottom: 8px;
                
                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

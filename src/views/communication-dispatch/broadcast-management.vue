<template>
  <div class="broadcast-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>分级分区广播</h1>
      <p>支持分级广播和分区广播，实现精准的通讯调度服务</p>
    </div>

    <!-- 广播状态概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="广播区域"
            :value="statusData.broadcastAreas"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="广播等级"
            :value="statusData.broadcastLevels"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="正在广播"
            :value="statusData.activeBroadcasts"
            :value-style="{ color: '#fa8c16' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日广播"
            :value="statusData.todayBroadcasts"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 更多统计概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总广播时长"
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
            :value-style="{ color: '#eb2f96' }"
          >
            <template #suffix>秒</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="广播成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="覆盖设备数"
            :value="statusData.coveredDevices"
            :value-style="{ color: '#fa541c' }"
          >
            <template #suffix>台</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="16" class="main-content">
      <!-- 分级广播管理 -->
      <a-col :span="12">
        <a-card title="分级广播管理" class="level-broadcast">
          <a-form layout="vertical">
            <a-form-item label="广播等级">
              <a-select v-model:value="levelData.broadcastLevel" placeholder="选择广播等级">
                <a-select-option value="emergency">紧急广播</a-select-option>
                <a-select-option value="important">重要广播</a-select-option>
                <a-select-option value="normal">普通广播</a-select-option>
                <a-select-option value="routine">例行广播</a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="广播内容">
              <a-textarea
                v-model:value="levelData.broadcastContent"
                placeholder="输入广播内容"
                :rows="4"
              />
            </a-form-item>

            <a-form-item label="广播范围">
              <a-checkbox-group v-model:value="levelData.broadcastScope">
                <a-checkbox value="all">全部区域</a-checkbox>
                <a-checkbox value="monitoring">监控区域</a-checkbox>
                <a-checkbox value="communication">通讯区域</a-checkbox>
                <a-checkbox value="data">数据区域</a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="重复次数">
              <a-input-number
                v-model:value="levelData.repeatCount"
                :min="1"
                :max="10"
                placeholder="广播重复次数"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" @click="startLevelBroadcast" :loading="levelBroadcasting">
                  <template #icon><SoundOutlined /></template>
                  开始广播
                </a-button>
                <a-button @click="resetLevelForm">
                  <template #icon><SettingOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 分区广播管理 -->
      <a-col :span="12">
        <a-card title="分区广播管理" class="area-broadcast">
          <a-form layout="vertical">
            <a-form-item label="选择分区">
              <a-tree-select
                v-model:value="areaData.selectedAreas"
                :tree-data="areaTreeData"
                placeholder="选择广播分区"
                tree-checkable
                show-checked-strategy="SHOW_PARENT"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="广播内容">
              <a-textarea
                v-model:value="areaData.broadcastContent"
                placeholder="输入广播内容"
                :rows="4"
              />
            </a-form-item>

            <a-form-item label="广播优先级">
              <a-select v-model:value="areaData.priority" placeholder="选择广播优先级">
                <a-select-option value="low">低优先级</a-select-option>
                <a-select-option value="normal">普通优先级</a-select-option>
                <a-select-option value="high">高优先级</a-select-option>
                <a-select-option value="urgent">紧急优先级</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="广播时间">
              <a-range-picker
                v-model:value="areaData.broadcastTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="['开始时间', '结束时间']"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" @click="startAreaBroadcast" :loading="areaBroadcasting">
                  <template #icon><SoundOutlined /></template>
                  开始广播
                </a-button>
                <a-button @click="resetAreaForm">
                  <template #icon><SettingOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 广播状态监控 -->
    <a-card title="广播状态监控" class="broadcast-monitor">
      <a-row :gutter="16">
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">当前广播</div>
            <div class="monitor-content">
              <div class="broadcast-item" v-for="broadcast in activeBroadcasts" :key="broadcast.id">
                <div class="broadcast-info">
                  <span class="broadcast-name">{{ broadcast.name }}</span>
                  <a-tag :color="getPriorityColor(broadcast.priority)" size="small">
                    {{ getPriorityText(broadcast.priority) }}
                  </a-tag>
                </div>
                <div class="broadcast-details">
                  <span class="broadcast-department">{{ broadcast.department }}</span>
                  <span class="broadcast-operator">{{ broadcast.operator }}</span>
                  <span class="broadcast-time">{{ broadcast.startTime }}</span>
                </div>
                <div class="broadcast-status">
                  <a-progress
                    :percent="broadcast.progress"
                    :show-info="false"
                    size="small"
                  />
                  <span class="progress-text">{{ broadcast.progress }}%</span>
                </div>
                <div class="broadcast-actions">
                  <a-button type="link" size="small" @click="stopBroadcast(broadcast)">
                    <template #icon><StopOutlined /></template>
                    停止
                  </a-button>
                  <a-button type="link" size="small" @click="pauseBroadcast(broadcast)">
                    <template #icon><PauseCircleOutlined /></template>
                    暂停
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">广播队列</div>
            <div class="monitor-content">
              <div class="queue-item" v-for="item in broadcastQueue" :key="item.id">
                <div class="queue-info">
                  <span class="queue-name">{{ item.name }}</span>
                  <a-tag :color="getPriorityColor(item.priority)" size="small">
                    {{ getPriorityText(item.priority) }}
                  </a-tag>
                </div>
                <div class="queue-details">
                  <span class="queue-department">{{ item.department }}</span>
                  <span class="queue-operator">{{ item.operator }}</span>
                </div>
                <div class="queue-status">
                  <span class="status-text">{{ getQueueStatusText(item.status) }}</span>
                  <span class="queue-time">{{ item.scheduledTime }}</span>
                </div>
                <div class="queue-actions">
                  <a-button type="link" size="small" @click="cancelBroadcast(item)">
                    <template #icon><StopOutlined /></template>
                    取消
                  </a-button>
                  <a-button type="link" size="small" @click="editBroadcast(item)">
                    <template #icon><SettingOutlined /></template>
                    编辑
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">广播统计</div>
            <div class="monitor-content">
              <div class="stat-item">
                <span class="stat-label">今日广播:</span>
                <span class="stat-value">{{ statusData.todayBroadcasts }}次</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功广播:</span>
                <span class="stat-value success">{{ statusData.successBroadcasts }}次</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">失败广播:</span>
                <span class="stat-value failed">{{ statusData.failedBroadcasts }}次</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均时长:</span>
                <span class="stat-value">{{ statusData.avgDuration }}分钟</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 广播记录 -->
    <a-card title="广播记录" class="broadcast-records">
      <div class="table-operations">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索广播记录"
            style="width: 200px"
            @search="onSearch"
          />
          <a-range-picker v-model:value="dateRange" />
          <a-select
            v-model:value="statusFilter"
            placeholder="状态筛选"
            style="width: 120px"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshRecords">刷新</a-button>
        </a-space>
      </div>
      
      <a-table
        :columns="recordColumns"
        :data-source="broadcastRecords"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getRecordStatusColor(record.status)">
              {{ getRecordStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetails(record)">
                <template #icon><EyeOutlined /></template>
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="replayBroadcast(record)">
                <template #icon><VideoCameraOutlined /></template>
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
      title="广播记录详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="广播ID">{{ selectedRecord?.id }}</a-descriptions-item>
        <a-descriptions-item label="广播名称">{{ selectedRecord?.name }}</a-descriptions-item>
        <a-descriptions-item label="广播类型">{{ selectedRecord?.type }}</a-descriptions-item>
        <a-descriptions-item label="广播状态">{{ getRecordStatusText(selectedRecord?.status || '') }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ getPriorityText(selectedRecord?.priority || '') }}</a-descriptions-item>
        <a-descriptions-item label="负责部门">{{ selectedRecord?.department || '无' }}</a-descriptions-item>
        <a-descriptions-item label="操作员">{{ selectedRecord?.operator || '无' }}</a-descriptions-item>
        <a-descriptions-item label="广播区域">{{ selectedRecord?.area }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ selectedRecord?.startTime }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ selectedRecord?.endTime }}</a-descriptions-item>
        <a-descriptions-item label="广播内容" :span="2">{{ selectedRecord?.content }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedRecord?.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

/**
 * 广播状态数据
 */
const statusData = reactive({
  broadcastAreas: 24,
  broadcastLevels: 6,
  activeBroadcasts: 8,
  todayBroadcasts: 89,
  successBroadcasts: 85,
  failedBroadcasts: 4,
  avgDuration: 18.5,
  totalDuration: 456.7,
  avgResponseTime: 2.8,
  successRate: 97.8,
  coveredDevices: 2345
})

/**
 * 分级广播数据
 */
const levelData = reactive({
  broadcastLevel: '',
  broadcastContent: '',
  broadcastScope: [],
  repeatCount: 3
})

/**
 * 分区广播数据
 */
const areaData = reactive({
  selectedAreas: [],
  broadcastContent: '',
  priority: 'normal',
  broadcastTime: []
})

/**
 * 分区树形数据
 */
const areaTreeData = ref([
  {
    title: '监控区域',
    value: 'monitoring',
    children: [
      { title: '船舶A区域', value: 'ship-a' },
      { title: '船舶B区域', value: 'ship-b' },
      { title: '船舶C区域', value: 'ship-c' },
      { title: '船舶D区域', value: 'ship-d' },
      { title: '船舶E区域', value: 'ship-e' },
      { title: '船舶F区域', value: 'ship-f' }
    ]
  },
  {
    title: '通讯区域',
    value: 'communication',
    children: [
      { title: '通讯中心', value: 'comm-center' },
      { title: '通讯节点1', value: 'comm-node-1' },
      { title: '通讯节点2', value: 'comm-node-2' },
      { title: '通讯节点3', value: 'comm-node-3' },
      { title: '通讯节点4', value: 'comm-node-4' }
    ]
  },
  {
    title: '数据区域',
    value: 'data',
    children: [
      { title: '数据中心', value: 'data-center' },
      { title: '数据节点1', value: 'data-node-1' },
      { title: '数据节点2', value: 'data-node-2' },
      { title: '数据节点3', value: 'data-node-3' }
    ]
  },
  {
    title: '港口区域',
    value: 'port',
    children: [
      { title: '码头作业区', value: 'dock-area' },
      { title: '仓储区域', value: 'warehouse-area' },
      { title: '装卸区域', value: 'loading-area' },
      { title: '维修区域', value: 'maintenance-area' }
    ]
  },
  {
    title: '海上区域',
    value: 'sea',
    children: [
      { title: '航道区域', value: 'waterway-area' },
      { title: '锚地区域', value: 'anchorage-area' },
      { title: '作业区域', value: 'operation-area' },
      { title: '安全区域', value: 'safety-area' },
      { title: '救援区域', value: 'rescue-area' },
      { title: '巡逻区域', value: 'patrol-area' }
    ]
  },
  {
    title: '应急区域',
    value: 'emergency',
    children: [
      { title: '应急指挥中心', value: 'emergency-center' },
      { title: '救援基地', value: 'rescue-base' },
      { title: '医疗中心', value: 'medical-center' },
      { title: '疏散区域', value: 'evacuation-area' }
    ]
  },
  {
    title: '管理区域',
    value: 'management',
    children: [
      { title: '行政办公区', value: 'admin-office' },
      { title: '会议中心', value: 'meeting-center' },
      { title: '培训中心', value: 'training-center' },
      { title: '档案中心', value: 'archive-center' }
    ]
  }
])

/**
 * 当前广播列表
 */
const activeBroadcasts = ref([
  {
    id: 'BC001',
    name: '紧急通知广播',
    priority: 'urgent',
    progress: 75,
    department: '应急响应部',
    operator: '张调度',
    startTime: '14:25:00'
  },
  {
    id: 'BC002',
    name: '日常信息广播',
    priority: 'normal',
    progress: 45,
    department: '船舶监控部',
    operator: '李调度',
    startTime: '14:30:00'
  },
  {
    id: 'BC003',
    name: '例行检查广播',
    priority: 'routine',
    progress: 90,
    department: '设备维护部',
    operator: '王调度',
    startTime: '14:20:00'
  },
  {
    id: 'BC004',
    name: '安全提醒广播',
    priority: 'important',
    progress: 30,
    department: '安全管理部',
    operator: '赵调度',
    startTime: '14:35:00'
  },
  {
    id: 'BC005',
    name: '会议通知广播',
    priority: 'normal',
    progress: 60,
    department: '行政管理部',
    operator: '陈调度',
    startTime: '14:40:00'
  },
  {
    id: 'BC006',
    name: '设备维护广播',
    priority: 'normal',
    progress: 25,
    department: '设备维护部',
    operator: '刘调度',
    startTime: '14:45:00'
  },
  {
    id: 'BC007',
    name: '航线变更广播',
    priority: 'high',
    progress: 80,
    department: '船舶调度部',
    operator: '孙调度',
    startTime: '14:50:00'
  },
  {
    id: 'BC008',
    name: '天气预警广播',
    priority: 'urgent',
    progress: 15,
    department: '气象监测部',
    operator: '周调度',
    startTime: '14:55:00'
  }
])

/**
 * 广播队列
 */
const broadcastQueue = ref([
  {
    id: 'BC006',
    name: '安全提醒广播',
    priority: 'important',
    status: 'waiting',
    scheduledTime: '14:30',
    department: '安全管理部',
    operator: '刘调度'
  },
  {
    id: 'BC007',
    name: '会议通知广播',
    priority: 'normal',
    status: 'scheduled',
    scheduledTime: '16:00',
    department: '行政管理部',
    operator: '孙调度'
  },
  {
    id: 'BC008',
    name: '设备维护广播',
    priority: 'routine',
    status: 'waiting',
    scheduledTime: '15:00',
    department: '设备维护部',
    operator: '周调度'
  },
  {
    id: 'BC009',
    name: '航线变更广播',
    priority: 'high',
    status: 'scheduled',
    scheduledTime: '17:00',
    department: '船舶调度部',
    operator: '吴调度'
  },
  {
    id: 'BC010',
    name: '天气预警广播',
    priority: 'urgent',
    status: 'waiting',
    scheduledTime: '15:30',
    department: '气象监测部',
    operator: '郑调度'
  },
  {
    id: 'BC011',
    name: '安全培训广播',
    priority: 'important',
    status: 'scheduled',
    scheduledTime: '18:00',
    department: '安全管理部',
    operator: '钱调度'
  },
  {
    id: 'BC012',
    name: '设备检查广播',
    priority: 'routine',
    status: 'waiting',
    scheduledTime: '19:00',
    department: '设备维护部',
    operator: '冯调度'
  },
  {
    id: 'BC013',
    name: '夜间巡逻广播',
    priority: 'normal',
    status: 'scheduled',
    scheduledTime: '20:00',
    department: '安全管理部',
    operator: '褚调度'
  }
])

/**
 * 搜索和筛选
 */
const searchText = ref('')
const dateRange = ref([])
const statusFilter = ref('')
const loading = ref(false)
const levelBroadcasting = ref(false)
const areaBroadcasting = ref(false)

/**
 * 广播记录类型定义
 */
interface BroadcastRecord {
  id: string | number
  name: string
  type: string
  status: string
  priority: string
  department?: string
  operator?: string
  area: string
  startTime: string
  endTime: string
  content: string
  remark?: string
}

/**
 * 广播记录数据
 */
const broadcastRecords = ref<BroadcastRecord[]>([
  {
    id: 'BC001',
    name: '紧急通知广播',
    type: '分级广播',
    status: 'success',
    priority: 'urgent',
    area: '全部区域',
    startTime: '2025-08-15 10:00:00',
    endTime: '2025-08-15 10:15:00',
    content: '紧急情况通知，请所有人员立即到指定位置集合',
    remark: '紧急情况处理',
    department: '应急响应部',
    operator: '张调度'
  },
  {
    id: 'BC002',
    name: '日常信息广播',
    type: '分区广播',
    status: 'success',
    priority: 'normal',
    area: '监控区域',
    startTime: '2025-08-15 09:00:00',
    endTime: '2025-08-15 09:10:00',
    content: '今日工作安排和注意事项',
    remark: '日常工作安排',
    department: '船舶监控部',
    operator: '李调度'
  },
  {
    id: 'BC003',
    name: '例行检查广播',
    type: '分区广播',
    status: 'failed',
    priority: 'routine',
    area: '通讯区域',
    startTime: '2025-08-15 08:00:00',
    endTime: '2025-08-15 08:05:00',
    content: '设备例行检查通知',
    remark: '设备检查失败',
    department: '设备维护部',
    operator: '王调度'
  },
  {
    id: 'BC004',
    name: '安全提醒广播',
    type: '分区广播',
    status: 'success',
    priority: 'important',
    area: '港口区域',
    startTime: '2025-08-15 14:00:00',
    endTime: '2025-08-15 14:10:00',
    content: '港口安全注意事项和操作规程',
    remark: '安全培训广播',
    department: '安全管理部',
    operator: '赵调度'
  },
  {
    id: 'BC005',
    name: '会议通知广播',
    type: '分级广播',
    status: 'success',
    priority: 'normal',
    area: '全部区域',
    startTime: '2025-08-15 13:00:00',
    endTime: '2025-08-15 13:05:00',
    content: '下午3点召开全体会议，请准时参加',
    remark: '会议通知',
    department: '行政管理部',
    operator: '陈调度'
  },
  {
    id: 'BC006',
    name: '设备维护广播',
    type: '分区广播',
    status: 'success',
    priority: 'routine',
    area: '维修区域',
    startTime: '2025-08-15 12:00:00',
    endTime: '2025-08-15 12:15:00',
    content: '设备维护通知，请相关人员做好准备',
    remark: '维护准备',
    department: '设备维护部',
    operator: '刘调度'
  },
  {
    id: 'BC007',
    name: '航线变更广播',
    type: '分级广播',
    status: 'success',
    priority: 'high',
    area: '海上区域',
    startTime: '2025-08-15 11:00:00',
    endTime: '2025-08-15 11:10:00',
    content: '航线变更通知，请相关船舶注意调整',
    remark: '航线调整',
    department: '船舶调度部',
    operator: '孙调度'
  },
  {
    id: 'BC008',
    name: '天气预警广播',
    type: '分级广播',
    status: 'success',
    priority: 'urgent',
    area: '全部区域',
    startTime: '2025-08-15 10:30:00',
    endTime: '2025-08-15 10:35:00',
    content: '天气预警通知，请注意防范',
    remark: '天气预警',
    department: '气象监测部',
    operator: '周调度'
  },
  {
    id: 'BC009',
    name: '安全培训广播',
    type: '分区广播',
    status: 'success',
    priority: 'important',
    area: '培训中心',
    startTime: '2025-08-15 09:30:00',
    endTime: '2025-08-15 09:45:00',
    content: '安全培训通知，请相关人员参加',
    remark: '安全培训',
    department: '安全管理部',
    operator: '钱调度'
  },
  {
    id: 'BC010',
    name: '设备检查广播',
    type: '分区广播',
    status: 'success',
    priority: 'routine',
    area: '维修区域',
    startTime: '2025-08-15 08:30:00',
    endTime: '2025-08-15 08:45:00',
    content: '设备检查通知，请相关人员配合',
    remark: '设备检查',
    department: '设备维护部',
    operator: '冯调度'
  },
  {
    id: 'BC011',
    name: '夜间巡逻广播',
    type: '分区广播',
    status: 'success',
    priority: 'normal',
    area: '巡逻区域',
    startTime: '2025-08-15 07:30:00',
    endTime: '2025-08-15 07:45:00',
    content: '夜间巡逻通知，请相关人员注意',
    remark: '夜间巡逻',
    department: '安全管理部',
    operator: '褚调度'
  },
  {
    id: 'BC012',
    name: '应急演练广播',
    type: '分级广播',
    status: 'success',
    priority: 'high',
    area: '应急区域',
    startTime: '2025-08-15 06:30:00',
    endTime: '2025-08-15 06:45:00',
    content: '应急演练通知，请相关人员参加',
    remark: '应急演练',
    department: '应急响应部',
    operator: '卫调度'
  }
])

/**
 * 表格列定义
 */
const recordColumns = [
  {
    title: '广播ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '广播名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '广播类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '广播状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority'
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
    title: '广播区域',
    dataIndex: 'area',
    key: 'area'
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime'
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
const selectedRecord = ref<BroadcastRecord | null>(null)

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'blue',
    normal: 'green',
    high: 'orange',
    urgent: 'red',
    emergency: 'red',
    important: 'orange',
    routine: 'blue'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急',
    emergency: '紧急',
    important: '重要',
    routine: '例行'
  }
  return textMap[priority] || priority
}

/**
 * 获取记录状态颜色
 */
const getRecordStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    cancelled: 'orange'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取记录状态文本
 */
const getRecordStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

/**
 * 获取队列状态文本
 */
const getQueueStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    waiting: '等待中',
    scheduled: '已安排'
  }
  return textMap[status] || status
}

/**
 * 开始分级广播
 */
const startLevelBroadcast = () => {
  if (!levelData.broadcastLevel) {
    message.error('请选择广播等级')
    return
  }
  if (!levelData.broadcastContent) {
    message.error('请输入广播内容')
    return
  }
  if (levelData.broadcastScope.length === 0) {
    message.error('请选择广播范围')
    return
  }

  levelBroadcasting.value = true
  setTimeout(() => {
    levelBroadcasting.value = false
    message.success('分级广播已开始')
  }, 1000)
}

/**
 * 重置分级广播表单
 */
const resetLevelForm = () => {
  Object.assign(levelData, {
    broadcastLevel: '',
    broadcastContent: '',
    broadcastScope: [],
    repeatCount: 3
  })
}

/**
 * 开始分区广播
 */
const startAreaBroadcast = () => {
  if (areaData.selectedAreas.length === 0) {
    message.error('请选择广播分区')
    return
  }
  if (!areaData.broadcastContent) {
    message.error('请输入广播内容')
    return
  }
  if (areaData.broadcastTime.length === 0) {
    message.error('请选择广播时间')
    return
  }

  areaBroadcasting.value = true
  setTimeout(() => {
    areaBroadcasting.value = false
    message.success('分区广播已开始')
  }, 1000)
}

/**
 * 重置分区广播表单
 */
const resetAreaForm = () => {
  Object.assign(areaData, {
    selectedAreas: [],
    broadcastContent: '',
    priority: 'normal',
    broadcastTime: []
  })
}

/**
 * 停止广播
 */
const stopBroadcast = (broadcast: any) => {
  message.success(`广播 ${broadcast.name} 已停止`)
}

/**
 * 暂停广播
 */
const pauseBroadcast = (broadcast: any) => {
  message.info(`广播 ${broadcast.name} 已暂停`)
}

/**
 * 取消广播
 */
const cancelBroadcast = (item: any) => {
  message.success(`广播 ${item.name} 已取消`)
}

/**
 * 编辑广播
 */
const editBroadcast = (item: any) => {
  message.info(`编辑广播 ${item.name}`)
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
 * 回放广播
 */
const replayBroadcast = (record: any) => {
  message.info(`开始回放广播记录: ${record.id}`)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('分级分区广播页面已加载')
})
</script>

<style lang="less" scoped>
.broadcast-management {
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
  }

  .main-content {
    margin-bottom: 24px;

    .level-broadcast,
    .area-broadcast {
      height: 100%;
    }
  }

  .broadcast-monitor {
    margin-bottom: 24px;

    .monitor-item {
      .monitor-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #262626;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
      }

      .monitor-content {
        .broadcast-item,
        .queue-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 6px;
          margin-bottom: 12px;
          background-color: #fafafa;

          .broadcast-info,
          .queue-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .broadcast-name,
            .queue-name {
              font-weight: 500;
              color: #262626;
            }
          }

          .broadcast-details,
          .queue-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: #8c8c8c;

            .broadcast-department,
            .queue-department {
              color: #1890ff;
            }

            .broadcast-operator,
            .queue-operator {
              color: #52c41a;
            }

            .broadcast-time,
            .queue-time {
              color: #fa8c16;
            }
          }

          .broadcast-status,
          .queue-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-text {
              font-size: 12px;
              color: #8c8c8c;
              min-width: 40px;
            }

            .status-text {
              font-size: 12px;
              color: #8c8c8c;
            }

            .queue-time {
              font-size: 12px;
              color: #8c8c8c;
            }
          }

          .broadcast-actions,
          .queue-actions {
            text-align: right;
          }
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .stat-label {
            color: #595959;
          }

          .stat-value {
            font-weight: 500;
            color: #262626;

            &.success {
              color: #52c41a;
            }

            &.failed {
              color: #f5222d;
            }
          }
        }
      }
    }
  }

  .broadcast-records {
    .table-operations {
      margin-bottom: 16px;
    }
  }

  .overview-card {
    text-align: center;
    
    .ant-statistic-title {
      color: #8c8c8c;
      font-size: 14px;
    }
    
    .ant-statistic-content {
      .ant-statistic-content-value {
        font-weight: 600;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .status-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
    
    .main-content {
      .ant-col {
        margin-bottom: 16px;
      }
    }
    
    .broadcast-monitor {
      .ant-col {
        margin-bottom: 16px;
      }
    }
    
    .table-operations {
      .ant-space {
        flex-direction: column;
        align-items: stretch;
        
        .ant-input-search,
        .ant-select,
        .ant-range-picker {
          width: 100% !important;
        }
      }
    }
  }
}
</style>

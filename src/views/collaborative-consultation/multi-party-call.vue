<template>
  <div class="multi-party-call">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>多方音视频通话</h1>
      <p>支持多参与者音视频通话，提供高质量通信体验</p>
    </div>

    <!-- 通话状态概览 -->
    <a-card class="status-overview" title="通话状态概览">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="当前通话数" :value="callStats.activeCalls" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="在线参与者" :value="callStats.onlineParticipants" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="通话质量" :value="callStats.qualityScore" suffix="%" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="网络延迟" :value="callStats.networkLatency" suffix="ms" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="今日通话" :value="callStats.todayCalls" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总通话时长" :value="callStats.totalDuration" suffix="小时" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="平均通话时长" :value="callStats.avgDuration" suffix="分钟" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="成功率" :value="callStats.successRate" suffix="%" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 通话管理区域 -->
    <a-row :gutter="16" class="call-management">
      <!-- 通话控制面板 -->
      <a-col :span="16">
        <a-card title="通话控制面板" class="call-control-panel">
          <!-- 通话状态指示器 -->
          <div class="call-status-indicator">
            <div class="status-badge" :class="{ active: callStatus.isActive }">
              <span class="status-dot"></span>
              {{ callStatus.isActive ? '正在通话中' : '待接入' }}
            </div>
            <div class="call-duration" :class="{ active: callStatus.isActive }">
              <ClockCircleOutlined />
              <span>{{ callStatus.isActive ? callDuration : '00:00:00' }}</span>
            </div>
            <div class="call-quality">
              <span class="quality-icon">{{ getQualityLevel(callStatus.quality).icon }}</span>
              <span class="quality-text">{{ getQualityLevel(callStatus.quality).text }}</span>
            </div>
            <div class="network-status">
              <span class="network-icon">{{ getNetworkStatus(callStatus.networkStatus).icon }}</span>
              <span class="network-text">{{ getNetworkStatus(callStatus.networkStatus).text }}</span>
            </div>
          </div>

          <!-- 视频显示区域 -->
          <div class="video-display-area">
            <div class="main-video">
              <div class="video-placeholder">
                <a-avatar :size="80" :style="{ backgroundColor: currentCallParticipants[0].color }">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <p>{{ currentCallParticipants[0].name }}</p>
                <span class="main-role">{{ currentCallParticipants[0].role }}</span>
                <!-- 主画面状态指示器 -->
                <div class="main-status-indicators">
                  <span v-if="currentCallParticipants[0].isMuted" class="mute-indicator" title="已静音">
                    <AudioOutlined />
                  </span>
                  <span v-if="!currentCallParticipants[0].isVideoOn" class="video-off-indicator" title="视频已关闭">
                    <VideoCameraOutlined />
                  </span>
                  <span v-if="currentCallParticipants[0].status === 'speaking'" class="speaking-indicator" title="正在说话">
                    <AudioOutlined />
                  </span>
                </div>
              </div>
            </div>
            <div class="participant-videos">
              <div class="video-item" v-for="participant in currentCallParticipants.slice(1)" :key="participant.id">
                <div class="video-placeholder small">
                  <a-avatar :size="40" :style="{ backgroundColor: participant.color }">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <p>{{ participant.name }}</p>
                  <span class="participant-role">{{ participant.role }}</span>
                  <!-- 参与者状态指示器 -->
                  <div class="participant-status-indicators">
                    <span v-if="participant.isMuted" class="mute-indicator small" title="已静音">
                      <AudioOutlined />
                    </span>
                    <span v-if="!participant.isVideoOn" class="video-off-indicator small" title="视频已关闭">
                      <VideoCameraOutlined />
                    </span>
                    <span v-if="participant.status === 'speaking'" class="speaking-indicator small" title="正在说话">
                      <AudioOutlined />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 通话控制按钮 -->
          <div class="call-controls">
            <a-button-group>
              <a-button 
                type="primary" 
                size="large"
                :disabled="callStatus.isActive"
                @click="handleAnswerCall"
              >
                <template #icon><PhoneOutlined /></template>
                {{ callStatus.isActive ? '通话中' : '接听' }}
              </a-button>
              <a-button 
                type="danger" 
                size="large"
                :disabled="!callStatus.isActive"
                @click="handleHangupCall"
              >
                <template #icon><PhoneOutlined /></template>
                挂断
              </a-button>
              <a-button size="large" :disabled="!callStatus.isActive">
                <template #icon><VideoCameraOutlined /></template>
                视频
              </a-button>
              <a-button size="large" :disabled="!callStatus.isActive">
                <template #icon><AudioOutlined /></template>
                音频
              </a-button>
              <a-button size="large">
                <template #icon><SettingOutlined /></template>
                设置
              </a-button>
            </a-button-group>
          </div>

          <!-- 通话信息 -->
          <div class="call-info">
            <a-descriptions :column="3" bordered>
              <a-descriptions-item label="通话ID">CALL-2025-001</a-descriptions-item>
              <a-descriptions-item label="通话类型">多方会议</a-descriptions-item>
              <a-descriptions-item label="通话时长">{{ callStatus.isActive ? callDuration : '00:00:00' }}</a-descriptions-item>
              <a-descriptions-item label="参与者数量">{{ callStatus.participantsCount }}人</a-descriptions-item>
              <a-descriptions-item label="通话质量">{{ callStatus.isActive ? getQualityLevel(callStatus.quality).text : '待检测' }}</a-descriptions-item>
              <a-descriptions-item label="网络状态">{{ getNetworkStatus(callStatus.networkStatus).text }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-col>

      <!-- 参与者管理 -->
      <a-col :span="8">
        <a-card title="参与者管理" class="participant-management">
          <!-- 搜索和筛选 -->
          <div class="search-and-filter">
            <a-input-group compact>
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索参与者"
                style="width: 200px"
                @search="handleSearch"
              />
              <a-select
                v-model:value="filterDepartment"
                style="width: 120px"
                placeholder="筛选部门"
                @change="handleFilterDepartmentChange"
              >
                <a-select-option value="">全部部门</a-select-option>
                <a-select-option value="调度中心">调度中心</a-select-option>
                <a-select-option value="海事部门">海事部门</a-select-option>
                <a-select-option value="港口管理">港口管理</a-select-option>
                <a-select-option value="应急响应">应急响应</a-select-option>
                <a-select-option value="船舶公司">船舶公司</a-select-option>
                <a-select-option value="气象部门">气象部门</a-select-option>
                <a-select-option value="安全监督">安全监督</a-select-option>
                <a-select-option value="技术保障">技术保障</a-select-option>
              </a-select>
              <a-select
                v-model:value="filterRole"
                style="width: 120px"
                placeholder="筛选角色"
                @change="handleFilterRoleChange"
              >
                <a-select-option value="">全部角色</a-select-option>
                <a-select-option value="总调度长">总调度长</a-select-option>
                <a-select-option value="副调度长">副调度长</a-select-option>
                <a-select-option value="调度员">调度员</a-select-option>
                <a-select-option value="海事处长">海事处长</a-select-option>
                <a-select-option value="副处长">副处长</a-select-option>
                <a-select-option value="海事监督员">海事监督员</a-select-option>
                <a-select-option value="港口经理">港口经理</a-select-option>
                <a-select-option value="副经理">副经理</a-select-option>
                <a-select-option value="码头主管">码头主管</a-select-option>
                <a-select-option value="船务经理">船务经理</a-select-option>
                <a-select-option value="船长">船长</a-select-option>
                <a-select-option value="船员">船员</a-select-option>
                <a-select-option value="应急队长">应急队长</a-select-option>
                <a-select-option value="副队长">副队长</a-select-option>
                <a-select-option value="救援队员">救援队员</a-select-option>
                <a-select-option value="气象专家">气象专家</a-select-option>
                <a-select-option value="副专家">副专家</a-select-option>
                <a-select-option value="预报员">预报员</a-select-option>
                <a-select-option value="安全总监">安全总监</a-select-option>
                <a-select-option value="副总监">副总监</a-select-option>
                <a-select-option value="安全检查员">安全检查员</a-select-option>
                <a-select-option value="技术总监">技术总监</a-select-option>
                <a-select-option value="副总监">副总监</a-select-option>
                <a-select-option value="系统工程师">系统工程师</a-select-option>
              </a-select>
            </a-input-group>
          </div>

          <!-- 参与者列表 -->
          <div class="participant-list">
            <div class="participant-item" v-for="participant in paginatedParticipants" :key="participant.id">
              <a-avatar :src="participant.avatar" :size="40" />
              <div class="participant-info">
                <div class="participant-name">{{ participant.name }}</div>
                <div class="participant-role">{{ participant.role }}</div>
                <div class="participant-department">{{ participant.department }}</div>
                <div class="participant-status">
                  <a-tag :color="participant.status === 'online' ? 'green' : 'red'">
                    {{ participant.status === 'online' ? '在线' : '离线' }}
                  </a-tag>
                  <span class="join-time">{{ participant.joinTime }}</span>
                </div>
              </div>
              <div class="participant-actions">
                <a-button type="link" size="small">
                  <template #icon><EyeOutlined /></template>
                  查看
                </a-button>
                <a-button type="link" size="small">
                  <template #icon><SettingOutlined /></template>
                  设置
                </a-button>
              </div>
            </div>
          </div>

          <!-- 参与者分页 -->
          <div class="participant-pagination">
            <a-pagination
              v-model:current="participantPagination.current"
              :page-size="participantPagination.pageSize"
              :total="filteredParticipants.length"
              :show-size-changer="false"
              :show-quick-jumper="false"
              :show-total="(total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
              size="small"
              @change="handleParticipantPageChange"
            />
          </div>

          <!-- 添加参与者 -->
          <div class="add-participant">
            <a-button type="dashed" block>
              <template #icon><PlusOutlined /></template>
              添加参与者
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 通话记录 -->
    <a-card title="通话记录" class="call-records">
      <a-table :columns="recordColumns" :data-source="callRecords" :pagination="{ pageSize: 10 }">
        <template #action="{ record }">
          <a-button type="link" size="small" @click="viewRecord(record)">
            <template #icon><EyeOutlined /></template>
            查看详情
          </a-button>
          <a-button type="link" size="small" @click="downloadRecord(record)">
            <template #icon><DownloadOutlined /></template>
            下载
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 通话设置模态框 -->
    <a-modal
      v-model:visible="settingsModalVisible"
      title="通话设置"
      width="600px"
      @ok="saveSettings"
    >
      <a-form :model="callSettings" layout="vertical">
        <a-form-item label="视频质量">
          <a-select v-model:value="callSettings.videoQuality">
            <a-select-option value="high">高清</a-select-option>
            <a-select-option value="medium">标清</a-select-option>
            <a-select-option value="low">流畅</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="音频质量">
          <a-select v-model:value="callSettings.audioQuality">
            <a-select-option value="high">高音质</a-select-option>
            <a-select-option value="medium">标准音质</a-select-option>
            <a-select-option value="low">压缩音质</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="网络自适应">
          <a-switch v-model:checked="callSettings.adaptiveNetwork" />
        </a-form-item>
        <a-form-item label="噪音抑制">
          <a-switch v-model:checked="callSettings.noiseSuppression" />
        </a-form-item>
        <a-form-item label="回声消除">
          <a-switch v-model:checked="callSettings.echoCancellation" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SettingOutlined,
  EyeOutlined,
  PlusOutlined,
  DownloadOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// 通话统计数据
const callStats = reactive({
  activeCalls: 25,           // 增加活跃通话数
  onlineParticipants: 180,   // 增加在线参与者数
  qualityScore: 96.8,
  networkLatency: 32,
  todayCalls: 156,          // 增加今日通话数
  totalDuration: 1256.5,    // 增加总通话时长
  avgDuration: 42.3,
  successRate: 98.7
})

// 当前通话的参与者数据
const currentCallParticipants = ref([
  { id: 1, name: '陈志强', role: '总调度长', color: '#1890ff', status: 'speaking', isMuted: false, isVideoOn: true },
  { id: 2, name: '刘建国', role: '海事处长', color: '#52c41a', status: 'listening', isMuted: true, isVideoOn: false },
  { id: 3, name: '王海峰', role: '港口经理', color: '#fa8c16', status: 'speaking', isMuted: false, isVideoOn: true },
  { id: 4, name: '赵明华', role: '应急队长', color: '#eb2f96', status: 'listening', isMuted: false, isVideoOn: true }
])

// 参与者数据
const participants = ref([
  // 调度中心 (15人)
  { id: 1, name: '陈志强', avatar: '', status: 'online', role: '总调度长', department: '调度中心', joinTime: '09:00:00' },
  { id: 2, name: '李明', avatar: '', status: 'online', role: '副调度长', department: '调度中心', joinTime: '09:01:15' },
  { id: 3, name: '王芳', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:02:30' },
  { id: 4, name: '张伟', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:03:45' },
  { id: 5, name: '刘敏', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:04:20' },
  { id: 6, name: '陈华', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:05:10' },
  { id: 7, name: '赵强', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:06:25' },
  { id: 8, name: '孙丽', avatar: '', status: 'offline', role: '调度员', department: '调度中心', joinTime: '08:55:30' },
  { id: 9, name: '周明', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:07:15' },
  { id: 10, name: '吴敏', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:08:40' },
  { id: 11, name: '郑华', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:09:20' },
  { id: 12, name: '王强', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:10:35' },
  { id: 13, name: '李华', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:11:50' },
  { id: 14, name: '张敏', avatar: '', status: 'offline', role: '调度员', department: '调度中心', joinTime: '08:50:15' },
  { id: 15, name: '刘强', avatar: '', status: 'online', role: '调度员', department: '调度中心', joinTime: '09:12:05' },

  // 海事部门 (20人)
  { id: 16, name: '刘建国', avatar: '', status: 'online', role: '海事处长', department: '海事部门', joinTime: '09:02:15' },
  { id: 17, name: '王海军', avatar: '', status: 'online', role: '副处长', department: '海事部门', joinTime: '09:02:45' },
  { id: 18, name: '陈海峰', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:03:20' },
  { id: 19, name: '赵海涛', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:03:55' },
  { id: 20, name: '孙海波', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:04:30' },
  { id: 21, name: '周海燕', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:05:15' },
  { id: 22, name: '吴海龙', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:06:00' },
  { id: 23, name: '郑海霞', avatar: '', status: 'offline', role: '海事监督员', department: '海事部门', joinTime: '08:45:20' },
  { id: 24, name: '王海明', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:07:25' },
  { id: 25, name: '李海英', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:08:10' },
  { id: 26, name: '张海强', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:09:35' },
  { id: 27, name: '刘海燕', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:10:20' },
  { id: 28, name: '陈海涛', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:11:45' },
  { id: 29, name: '赵海波', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:12:30' },
  { id: 30, name: '孙海燕', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:13:15' },
  { id: 31, name: '周海龙', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:14:00' },
  { id: 32, name: '吴海霞', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:14:45' },
  { id: 33, name: '郑海明', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:15:30' },
  { id: 34, name: '王海英', avatar: '', status: 'offline', role: '海事监督员', department: '海事部门', joinTime: '08:40:15' },
  { id: 35, name: '李海强', avatar: '', status: 'online', role: '海事监督员', department: '海事部门', joinTime: '09:16:15' },

  // 港口管理 (25人)
  { id: 36, name: '王海峰', avatar: '', status: 'online', role: '港口经理', department: '港口管理', joinTime: '09:01:30' },
  { id: 37, name: '陈港涛', avatar: '', status: 'online', role: '副经理', department: '港口管理', joinTime: '09:02:00' },
  { id: 38, name: '赵港波', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:02:30' },
  { id: 39, name: '孙港燕', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:03:00' },
  { id: 40, name: '周港龙', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:03:30' },
  { id: 41, name: '吴港霞', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:04:00' },
  { id: 42, name: '郑港明', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:04:30' },
  { id: 43, name: '王港英', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:05:00' },
  { id: 44, name: '李港强', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:05:30' },
  { id: 45, name: '张港涛', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:06:00' },
  { id: 46, name: '刘港波', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:06:30' },
  { id: 47, name: '陈港燕', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:07:00' },
  { id: 48, name: '赵港龙', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:07:30' },
  { id: 49, name: '孙港霞', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:08:00' },
  { id: 50, name: '周港明', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:08:30' },
  { id: 51, name: '吴港英', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:09:00' },
  { id: 52, name: '郑港强', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:09:30' },
  { id: 53, name: '王港涛', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:10:00' },
  { id: 54, name: '李港波', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:10:30' },
  { id: 55, name: '张港燕', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:11:00' },
  { id: 56, name: '刘港龙', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:11:30' },
  { id: 57, name: '陈港霞', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:12:00' },
  { id: 58, name: '赵港明', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:12:30' },
  { id: 59, name: '孙港英', avatar: '', status: 'offline', role: '码头主管', department: '港口管理', joinTime: '08:35:20' },
  { id: 60, name: '周港强', avatar: '', status: 'online', role: '码头主管', department: '港口管理', joinTime: '09:13:00' },

  // 应急响应 (20人)
  { id: 61, name: '赵明华', avatar: '', status: 'online', role: '应急队长', department: '应急响应', joinTime: '09:03:45' },
  { id: 62, name: '陈应急', avatar: '', status: 'online', role: '副队长', department: '应急响应', joinTime: '09:04:15' },
  { id: 63, name: '王救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:04:45' },
  { id: 64, name: '李救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:05:15' },
  { id: 65, name: '张救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:05:45' },
  { id: 66, name: '刘救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:06:15' },
  { id: 67, name: '孙救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:06:45' },
  { id: 68, name: '周救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:07:15' },
  { id: 69, name: '吴救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:07:45' },
  { id: 70, name: '郑救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:08:15' },
  { id: 71, name: '王救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:08:45' },
  { id: 72, name: '李救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:09:15' },
  { id: 73, name: '张救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:09:45' },
  { id: 74, name: '刘救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:10:15' },
  { id: 75, name: '孙救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:10:45' },
  { id: 76, name: '周救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:11:15' },
  { id: 77, name: '吴救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:11:45' },
  { id: 78, name: '郑救援', avatar: '', status: 'offline', role: '救援队员', department: '应急响应', joinTime: '08:30:10' },
  { id: 79, name: '王救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:12:15' },
  { id: 80, name: '李救援', avatar: '', status: 'online', role: '救援队员', department: '应急响应', joinTime: '09:12:45' },

  // 船舶公司 (40人)
  { id: 81, name: '钱伟民', avatar: '', status: 'online', role: '船务经理', department: '船舶公司', joinTime: '09:05:20' },
  { id: 82, name: '陈船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:05:50' },
  { id: 83, name: '王船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:06:20' },
  { id: 84, name: '李船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:06:50' },
  { id: 85, name: '张船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:07:20' },
  { id: 86, name: '刘船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:07:50' },
  { id: 87, name: '孙船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:08:20' },
  { id: 88, name: '周船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:08:50' },
  { id: 89, name: '吴船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:09:20' },
  { id: 90, name: '郑船长', avatar: '', status: 'online', role: '船长', department: '船舶公司', joinTime: '09:09:50' },
  { id: 91, name: '王船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:10:20' },
  { id: 92, name: '李船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:10:50' },
  { id: 93, name: '张船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:11:20' },
  { id: 94, name: '刘船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:11:50' },
  { id: 95, name: '孙船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:12:20' },
  { id: 96, name: '周船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:12:50' },
  { id: 97, name: '吴船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:13:20' },
  { id: 98, name: '郑船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:13:50' },
  { id: 99, name: '王船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:14:20' },
  { id: 100, name: '李船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:14:50' },
  { id: 101, name: '张船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:15:20' },
  { id: 102, name: '刘船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:15:50' },
  { id: 103, name: '孙船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:16:20' },
  { id: 104, name: '周船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:16:50' },
  { id: 105, name: '吴船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:17:20' },
  { id: 106, name: '郑船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:17:50' },
  { id: 107, name: '王船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:18:20' },
  { id: 108, name: '李船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:18:50' },
  { id: 109, name: '张船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:19:20' },
  { id: 110, name: '刘船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:19:50' },
  { id: 111, name: '孙船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:20:20' },
  { id: 112, name: '周船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:20:50' },
  { id: 113, name: '吴船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:21:20' },
  { id: 114, name: '郑船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:21:50' },
  { id: 115, name: '王船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:22:20' },
  { id: 116, name: '李船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:22:50' },
  { id: 117, name: '张船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:23:20' },
  { id: 118, name: '刘船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:23:50' },
  { id: 119, name: '孙船员', avatar: '', status: 'offline', role: '船员', department: '船舶公司', joinTime: '08:25:15' },
  { id: 120, name: '周船员', avatar: '', status: 'online', role: '船员', department: '船舶公司', joinTime: '09:24:20' },

  // 气象部门 (15人)
  { id: 121, name: '孙志刚', avatar: '', status: 'offline', role: '气象专家', department: '气象部门', joinTime: '08:55:10' },
  { id: 122, name: '陈气象', avatar: '', status: 'online', role: '副专家', department: '气象部门', joinTime: '09:00:30' },
  { id: 123, name: '王预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:01:00' },
  { id: 124, name: '李预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:01:30' },
  { id: 125, name: '张预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:02:00' },
  { id: 126, name: '刘预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:02:30' },
  { id: 127, name: '孙预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:03:00' },
  { id: 128, name: '周预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:03:30' },
  { id: 129, name: '吴预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:04:00' },
  { id: 130, name: '郑预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:04:30' },
  { id: 131, name: '王预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:05:00' },
  { id: 132, name: '李预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:05:30' },
  { id: 133, name: '张预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:06:00' },
  { id: 134, name: '刘预报', avatar: '', status: 'online', role: '预报员', department: '气象部门', joinTime: '09:06:30' },
  { id: 135, name: '孙预报', avatar: '', status: 'offline', role: '预报员', department: '气象部门', joinTime: '08:20:45' },

  // 安全监督 (20人)
  { id: 136, name: '周建军', avatar: '', status: 'online', role: '安全总监', department: '安全监督', joinTime: '09:04:30' },
  { id: 137, name: '陈安全', avatar: '', status: 'online', role: '副总监', department: '安全监督', joinTime: '09:05:00' },
  { id: 138, name: '王检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:05:30' },
  { id: 139, name: '李检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:06:00' },
  { id: 140, name: '张检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:06:30' },
  { id: 141, name: '刘检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:07:00' },
  { id: 142, name: '孙检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:07:30' },
  { id: 143, name: '周检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:08:00' },
  { id: 144, name: '吴检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:08:30' },
  { id: 145, name: '郑检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:09:00' },
  { id: 146, name: '王检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:09:30' },
  { id: 147, name: '李检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:10:00' },
  { id: 148, name: '张检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:10:30' },
  { id: 149, name: '刘检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:11:00' },
  { id: 150, name: '孙检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:11:30' },
  { id: 151, name: '周检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:12:00' },
  { id: 152, name: '吴检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:12:30' },
  { id: 153, name: '郑检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:13:00' },
  { id: 154, name: '王检查', avatar: '', status: 'offline', role: '安全检查员', department: '安全监督', joinTime: '08:15:20' },
  { id: 155, name: '李检查', avatar: '', status: 'online', role: '安全检查员', department: '安全监督', joinTime: '09:13:30' },

  // 技术保障 (25人)
  { id: 156, name: '吴建华', avatar: '', status: 'online', role: '技术总监', department: '技术保障', joinTime: '09:06:15' },
  { id: 157, name: '陈技术', avatar: '', status: 'online', role: '副总监', department: '技术保障', joinTime: '09:06:45' },
  { id: 158, name: '王系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:07:15' },
  { id: 159, name: '李系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:07:45' },
  { id: 160, name: '张系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:08:15' },
  { id: 161, name: '刘系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:08:45' },
  { id: 162, name: '孙系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:09:15' },
  { id: 163, name: '周系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:09:45' },
  { id: 164, name: '吴系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:10:15' },
  { id: 165, name: '郑系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:10:45' },
  { id: 166, name: '王系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:11:15' },
  { id: 167, name: '李系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:11:45' },
  { id: 168, name: '张系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:12:15' },
  { id: 169, name: '刘系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:12:45' },
  { id: 170, name: '孙系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:13:15' },
  { id: 171, name: '周系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:13:45' },
  { id: 172, name: '吴系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:14:15' },
  { id: 173, name: '郑系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:14:45' },
  { id: 174, name: '王系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:15:15' },
  { id: 175, name: '李系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:15:45' },
  { id: 176, name: '张系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:16:15' },
  { id: 177, name: '刘系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:16:45' },
  { id: 178, name: '孙系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:17:15' },
  { id: 179, name: '周系统', avatar: '', status: 'offline', role: '系统工程师', department: '技术保障', joinTime: '08:10:30' },
  { id: 180, name: '吴系统', avatar: '', status: 'online', role: '系统工程师', department: '技术保障', joinTime: '09:17:45' }
])

// 搜索和筛选相关数据
const searchKeyword = ref('')
const filterDepartment = ref('')
const filterRole = ref('')

// 参与者分页配置
const participantPagination = reactive({
  current: 1,
  pageSize: 5  // 每页显示5条
})

// 计算属性：过滤后的参与者数据
const filteredParticipants = computed(() => {
  let filtered = participants.value
  
  if (searchKeyword.value) {
    filtered = filtered.filter(p => 
      p.name.includes(searchKeyword.value) || 
      p.department.includes(searchKeyword.value) ||
      p.role.includes(searchKeyword.value)
    )
  }
  
  if (filterDepartment.value) {
    filtered = filtered.filter(p => p.department === filterDepartment.value)
  }
  
  if (filterRole.value) {
    filtered = filtered.filter(p => p.role === filterRole.value)
  }
  
  return filtered
})

// 计算属性：当前页的参与者数据
const paginatedParticipants = computed(() => {
  const start = (participantPagination.current - 1) * participantPagination.pageSize
  const end = start + participantPagination.pageSize
  return filteredParticipants.value.slice(start, end)
})

// 通话记录数据
const callRecords = ref([
  {
    id: 1,
    callId: 'CALL-2025-001',
    participants: '陈志强, 李明, 王芳, 刘建国, 王海峰, 赵明华, 钱伟民, 陈船长',
    startTime: '2025-08-20 09:00:00',
    duration: '00:45:30',
    status: '已完成',
    quality: '优秀',
    type: '应急会商',
    department: '调度中心'
  },
  {
    id: 2,
    callId: 'CALL-2025-002',
    participants: '刘建国, 王海军, 陈海峰, 赵明华, 孙志刚, 陈气象',
    startTime: '2025-08-20 10:30:00',
    duration: '00:28:15',
    status: '已完成',
    quality: '良好',
    type: '日常协调',
    department: '海事部门'
  },
  {
    id: 3,
    callId: 'CALL-2025-003',
    participants: '王海峰, 陈港涛, 赵港波, 吴建华, 陈技术, 王系统',
    startTime: '2025-08-20 14:00:00',
    duration: '01:15:45',
    status: '进行中',
    quality: '优秀',
    type: '技术研讨',
    department: '技术保障'
  },
  {
    id: 4,
    callId: 'CALL-2025-004',
    participants: '陈志强, 张伟, 钱伟民, 孙志刚, 周建军, 陈安全',
    startTime: '2025-08-20 16:00:00',
    duration: '00:32:20',
    status: '已完成',
    quality: '良好',
    type: '安全会议',
    department: '安全监督'
  },
  {
    id: 5,
    callId: 'CALL-2025-005',
    participants: '刘建国, 王海军, 王海峰, 陈港涛, 赵明华, 陈应急',
    startTime: '2025-08-19 08:30:00',
    duration: '00:55:10',
    status: '已完成',
    quality: '优秀',
    type: '应急预案',
    department: '应急响应'
  },
  {
    id: 6,
    callId: 'CALL-2025-006',
    participants: '周建军, 陈安全, 吴建华, 陈技术, 陈志强, 李明',
    startTime: '2025-08-19 15:00:00',
    duration: '00:42:30',
    status: '已完成',
    quality: '良好',
    type: '培训会议',
    department: '技术保障'
  },
  {
    id: 7,
    callId: 'CALL-2025-007',
    participants: '钱伟民, 陈船长, 孙志刚, 陈气象, 刘建国, 王海军',
    startTime: '2025-08-18 11:00:00',
    duration: '00:38:45',
    status: '已完成',
    quality: '优秀',
    type: '协调会议',
    department: '港口管理'
  },
  {
    id: 8,
    callId: 'CALL-2025-008',
    participants: '王海峰, 陈港涛, 赵明华, 陈应急, 周建军, 陈安全',
    startTime: '2025-08-18 16:30:00',
    duration: '00:51:20',
    status: '已完成',
    quality: '良好',
    type: '工作总结',
    department: '调度中心'
  }
])

// 通话记录表格列定义
const recordColumns = [
  {
    title: '通话ID',
    dataIndex: 'callId',
    key: 'callId'
  },
  {
    title: '通话类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '参与者',
    dataIndex: 'participants',
    key: 'participants'
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime'
  },
  {
    title: '通话时长',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '通话质量',
    dataIndex: 'quality',
    key: 'quality'
  },
  {
    title: '负责部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 通话设置
const callSettings = reactive({
  videoQuality: 'high',
  audioQuality: 'high',
  adaptiveNetwork: true,
  noiseSuppression: true,
  echoCancellation: true
})

// 模态框显示状态
const settingsModalVisible = ref(false)

// 查看通话记录详情
const viewRecord = (record: any) => {
  message.info(`查看通话记录: ${record.callId}`)
}

// 下载通话记录
const downloadRecord = (record: any) => {
  message.success(`开始下载通话记录: ${record.callId}`)
}

// 保存通话设置
const saveSettings = () => {
  message.success('通话设置已保存')
  settingsModalVisible.value = false
}

/**
 * 处理参与者分页变化
 */
const handleParticipantPageChange = (current: number, pageSize: number) => {
  participantPagination.current = current
  participantPagination.pageSize = pageSize
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  participantPagination.current = 1 // 搜索时重置到第一页
}

/**
 * 处理部门筛选变化
 */
const handleFilterDepartmentChange = (value: string) => {
  filterDepartment.value = value
  participantPagination.current = 1 // 筛选部门时重置到第一页
}

/**
 * 处理角色筛选变化
 */
const handleFilterRoleChange = (value: string) => {
  filterRole.value = value
  participantPagination.current = 1 // 筛选角色时重置到第一页
}

// 实时通话时长
const callDuration = ref('00:15:30')

// 更新通话时长
const updateCallDuration = () => {
  const now = new Date()
  const diff = now.getTime() - callStatus.startTime.getTime()
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  callDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 通话质量等级
const getQualityLevel = (quality: string) => {
  const levels = {
    excellent: { text: '优秀', color: '#52c41a', icon: '🔴' },
    good: { text: '良好', color: '#1890ff', icon: '🟡' },
    fair: { text: '一般', color: '#fa8c16', icon: '🟠' },
    poor: { text: '较差', color: '#f5222d', icon: '🔴' }
  }
  return levels[quality as keyof typeof levels] || levels.good
}

// 网络状态指示器
const getNetworkStatus = (status: string) => {
  const statuses = {
    stable: { text: '稳定', color: '#52c41a', icon: '📶' },
    unstable: { text: '不稳定', color: '#fa8c16', icon: '📶' },
    poor: { text: '较差', color: '#f5222d', icon: '📶' }
  }
  return statuses[status as keyof typeof statuses] || statuses.stable
}

// 通话状态
const callStatus = reactive({
  isActive: false, // 改为false，表示待接入状态
  startTime: new Date('2025-08-20 09:00:00'),
  currentTime: new Date('2025-08-20 09:15:30'),
  quality: 'excellent',
  networkStatus: 'stable',
  participantsCount: 4
})

// 组件挂载后的初始化
onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    callStats.networkLatency = Math.floor(Math.random() * 100) + 20
    callStats.qualityScore = Math.floor(Math.random() * 20) + 80
    
    // 更新通话时长
    updateCallDuration()
    
    // 模拟通话质量变化
    const qualities = ['excellent', 'good', 'fair', 'poor']
    if (Math.random() < 0.1) { // 10%概率改变质量
      callStatus.quality = qualities[Math.floor(Math.random() * qualities.length)]
    }
    
    // 模拟网络状态变化
    const networkStatuses = ['stable', 'unstable', 'poor']
    if (Math.random() < 0.05) { // 5%概率改变网络状态
      callStatus.networkStatus = networkStatuses[Math.floor(Math.random() * networkStatuses.length)]
    }
    
    // 模拟参与者状态变化
    currentCallParticipants.value.forEach(participant => {
      if (Math.random() < 0.3) { // 30%概率改变说话状态
        participant.status = Math.random() < 0.5 ? 'speaking' : 'listening'
      }
      if (Math.random() < 0.1) { // 10%概率改变静音状态
        participant.isMuted = Math.random() < 0.3
      }
      if (Math.random() < 0.05) { // 5%概率改变视频状态
        participant.isVideoOn = Math.random() < 0.8
      }
    })
  }, 1000) // 每秒更新一次
})

// 接听通话
const handleAnswerCall = () => {
  callStatus.isActive = true
  callStatus.startTime = new Date()
}

// 挂断通话
const handleHangupCall = () => {
  callStatus.isActive = false
}
</script>

<style lang="less" scoped>
.multi-party-call {
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

  .call-management {
    margin-bottom: 24px;
  }

  .call-control-panel {
    .call-status-indicator {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      .status-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
        background: #f5f5f5;
        color: #666;
        border: 1px solid #d9d9d9;

        &.active {
          background: #f6ffed;
          color: #52c41a;
          border-color: #b7eb8f;
        }

        &:not(.active) {
          background: #fff7e6;
          color: #fa8c16;
          border-color: #ffd591;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d9d9d9;
        }

        &.active .status-dot {
          background: #52c41a;
          animation: pulse 2s infinite;
        }

        &:not(.active) .status-dot {
          background: #fa8c16;
          animation: pulse 1.5s infinite;
        }
      }

      .call-duration {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 16px;
        font-weight: 600;
        color: #1890ff;

        &:not(.active) {
          color: #fa8c16;
        }
      }

      .call-quality, .network-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #666;

        .quality-icon, .network-icon {
          font-size: 16px;
        }

        .quality-text, .network-text {
          font-weight: 500;
        }
      }
    }

    .video-display-area {
      margin-bottom: 24px;

      .main-video {
        width: 100%;
        height: 300px;
        background: #f0f0f0;
        border-radius: 8px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .video-placeholder {
          text-align: center;
          color: #999;
          position: relative;

          .ant-avatar {
            margin-bottom: 16px;
            border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          p {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1f1f1f;
          }

          .main-role {
            font-size: 14px;
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
            padding: 4px 12px;
            border-radius: 12px;
            margin-top: 8px;
            display: inline-block;
          }

          .main-status-indicators {
            position: absolute;
            top: 16px;
            right: 16px;
            display: flex;
            gap: 8px;

            .mute-indicator, .video-off-indicator, .speaking-indicator {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              color: #fff;
              font-size: 16px;
            }

            .mute-indicator {
              background: #ff4d4f;
            }

            .video-off-indicator {
              background: #fa8c16;
            }

            .speaking-indicator {
              background: #52c41a;
              animation: pulse 1.5s infinite;
            }
          }
        }
      }

      .participant-videos {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        .video-item {
          .video-placeholder.small {
            height: 120px;
            background: #f5f5f5;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #999;
            position: relative;

            .ant-avatar {
              margin-bottom: 8px;
              border: 2px solid #fff;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }

            p {
              margin: 0;
              font-size: 12px;
              font-weight: 600;
              color: #1f1f1f;
            }

            .participant-role {
              font-size: 10px;
              color: #666;
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 8px;
              margin-top: 4px;
            }

            .participant-status-indicators {
              position: absolute;
              top: 8px;
              right: 8px;
              display: flex;
              gap: 4px;

              .mute-indicator.small, .video-off-indicator.small, .speaking-indicator.small {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                color: #fff;
                font-size: 10px;
              }

              .mute-indicator.small {
                background: #ff4d4f;
              }

              .video-off-indicator.small {
                background: #fa8c16;
              }

              .speaking-indicator.small {
                background: #52c41a;
                animation: pulse 1.5s infinite;
              }
            }
          }
        }
      }
    }

    .call-controls {
      text-align: center;
      margin-bottom: 24px;

      .ant-btn-group {
        .ant-btn {
          margin: 0 4px;
        }
      }
    }

    .call-info {
      .ant-descriptions {
        .ant-descriptions-item-label {
          font-weight: 600;
        }
      }
    }
  }

  .participant-management {
    .search-and-filter {
      margin-bottom: 16px;
      .ant-input-group {
        .ant-input-group-addon {
          background-color: #f0f0f0;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 0 8px;
        }
      }
    }

    .participant-list {
      margin-bottom: 16px;

      .participant-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .participant-info {
          flex: 1;
          margin-left: 12px;

          .participant-name {
            font-weight: 600;
            margin-bottom: 4px;
            color: #1f1f1f;
            font-size: 14px;
          }

          .participant-role {
            font-size: 12px;
            color: #1890ff;
            margin-bottom: 2px;
            font-weight: 500;
          }

          .participant-department {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }

          .participant-status {
            display: flex;
            align-items: center;
            gap: 8px;

            .ant-tag {
              margin: 0;
            }

            .join-time {
              font-size: 11px;
              color: #999;
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
            }
          }
        }

        .participant-actions {
          .ant-btn {
            padding: 0;
            height: auto;
            line-height: 1;
          }
        }
      }
    }

    .add-participant {
      .ant-btn {
        height: 40px;
      }
    }

    .participant-pagination {
      margin-top: 16px;
      text-align: center;
      
      .ant-pagination {
        margin: 0;
      }
    }
  }

  .call-records {
    .ant-table {
      .ant-table-thead > tr > th {
        background: #fafafa;
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

    .call-management {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .participant-videos {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}

 // 脉冲动画
 @keyframes pulse {
   0% {
     opacity: 1;
     transform: scale(1);
   }
   50% {
     opacity: 0.7;
     transform: scale(1.1);
   }
   100% {
     opacity: 1;
     transform: scale(1);
  }
}
</style>

<template>
  <div class="temporary-authorization">
    <div class="page-header">
      <h2>临时授权</h2>
      <p>突发事件临时访问权限管理，支持快速授权和权限回收</p>
    </div>

    <!-- 授权统计概览 -->
    <div class="authorization-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="活跃授权"
              :value="authStats.activeAuthorizations"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <KeyOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="即将过期"
              :value="authStats.expiringSoon"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <ClockCircleOutlined style="color: #faad14; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日申请"
              :value="authStats.todayApplications"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <FileAddOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="紧急授权"
              :value="authStats.emergencyAuthorizations"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <ExclamationCircleOutlined style="color: #ff4d4f; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要功能区域 -->
    <div class="authorization-content">
      <a-row :gutter="16">
        <!-- 授权申请列表 -->
        <a-col :span="16">
          <a-card title="授权申请管理" class="application-card">
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="applicationFilter.status"
                  placeholder="申请状态"
                  style="width: 120px"
                  @change="handleApplicationFilterChange"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="pending">待审批</a-select-option>
                  <a-select-option value="approved">已批准</a-select-option>
                  <a-select-option value="rejected">已拒绝</a-select-option>
                  <a-select-option value="expired">已过期</a-select-option>
                </a-select>
                <a-select
                  v-model:value="applicationFilter.priority"
                  placeholder="优先级"
                  style="width: 120px"
                  @change="handleApplicationFilterChange"
                >
                  <a-select-option value="">全部优先级</a-select-option>
                  <a-select-option value="low">低</a-select-option>
                  <a-select-option value="medium">中</a-select-option>
                  <a-select-option value="high">高</a-select-option>
                  <a-select-option value="emergency">紧急</a-select-option>
                </a-select>
                <a-button type="primary" @click="showCreateApplication">
                  <PlusOutlined />
                  新建申请
                </a-button>
                <a-button @click="refreshApplications">
                  <ReloadOutlined />
                  刷新
                </a-button>
              </a-space>
            </template>
            
            <a-table
              :columns="applicationColumns"
              :data-source="filteredApplications"
              :loading="loading"
              :pagination="pagination"
              row-key="id"
              size="small"
              :scroll="{ x: 1200 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'applicantInfo'">
                  <div class="applicant-info">
                    <div class="applicant-name">{{ record.applicant }}</div>
                    <div class="applicant-org">{{ record.organization }}</div>
                    <div class="applicant-contact">{{ record.contactInfo }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'priority'">
                  <a-tag :color="getPriorityColor(record.priority)">
                    {{ getPriorityText(record.priority) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'resources'">
                  <div class="resources-info">
                    <div class="resource-count">{{ record.requestedResources.length }}个资源</div>
                    <div class="resource-types">
                      <a-tag
                        v-for="type in getUniqueResourceTypes(record.requestedResources)"
                        :key="type"
                        size="small"
                      >
                        {{ type }}
                      </a-tag>
                    </div>
                  </div>
                </template>

                <template v-else-if="column.key === 'timeRange'">
                  <div class="time-range">
                    <div class="start-time">{{ formatTime(record.startTime) }}</div>
                    <div class="end-time">{{ formatTime(record.endTime) }}</div>
                    <div class="duration">{{ getDurationText(record.startTime, record.endTime) }}</div>
                  </div>
                </template>

                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewApplication(record)">
                      <EyeOutlined />
                      查看
                    </a-button>
                    <a-button
                      v-if="record.status === 'pending'"
                      type="link"
                      size="small"
                      @click="approveApplication(record)"
                    >
                      <CheckOutlined />
                      批准
                    </a-button>
                    <a-button
                      v-if="record.status === 'pending'"
                      type="link"
                      size="small"
                      @click="rejectApplication(record)"
                    >
                      <CloseOutlined />
                      拒绝
                    </a-button>
                    <a-button
                      v-if="record.status === 'approved'"
                      type="link"
                      size="small"
                      @click="revokeAuthorization(record)"
                    >
                      <StopOutlined />
                      撤销
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 快速操作面板 -->
        <a-col :span="8">
          <a-card title="快速操作" class="quick-action-card">
            <template #extra>
              <a-badge :dot="hasUrgentApplications">
                <BellOutlined style="font-size: 16px" />
              </a-badge>
            </template>
            
            <!-- 紧急授权 -->
            <div class="emergency-authorization">
              <h4>紧急授权</h4>
              <a-alert
                message="紧急情况快速授权"
                description="用于突发事件需要立即访问资源的情况"
                type="warning"
                show-icon
                style="margin-bottom: 16px"
              />
              <a-button type="primary" danger block @click="showEmergencyAuth">
                <ThunderboltOutlined />
                启动紧急授权
              </a-button>
            </div>

            <!-- 待处理申请 -->
            <div class="pending-applications">
              <h4>待处理申请</h4>
              <div class="pending-list">
                <div
                  v-for="app in pendingApplications"
                  :key="app.id"
                  class="pending-item"
                  :class="`priority-${app.priority}`"
                >
                  <div class="pending-header">
                    <div class="pending-applicant">{{ app.applicant }}</div>
                    <div class="pending-priority">
                      <a-tag :color="getPriorityColor(app.priority)" size="small">
                        {{ getPriorityText(app.priority) }}
                      </a-tag>
                    </div>
                  </div>
                  <div class="pending-reason">{{ app.reason }}</div>
                  <div class="pending-time">{{ formatTime(app.applicationTime) }}</div>
                  <div class="pending-actions">
                    <a-button type="link" size="small" @click="quickApprove(app)">
                      批准
                    </a-button>
                    <a-button type="link" size="small" @click="quickReject(app)">
                      拒绝
                    </a-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 即将过期的授权 -->
            <div class="expiring-authorizations">
              <h4>即将过期</h4>
              <div class="expiring-list">
                <div
                  v-for="auth in expiringAuthorizations"
                  :key="auth.id"
                  class="expiring-item"
                >
                  <div class="expiring-info">
                    <div class="expiring-applicant">{{ auth.applicant }}</div>
                    <div class="expiring-resource">{{ auth.resourceName }}</div>
                    <div class="expiring-time">
                      {{ getExpirationText(auth.endTime) }}
                    </div>
                  </div>
                  <div class="expiring-actions">
                    <a-button type="link" size="small" @click="extendAuthorization(auth)">
                      延期
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 授权模板 -->
    <div class="authorization-templates">
      <a-card title="授权模板" class="template-card">
        <template #extra>
          <a-button type="primary" @click="showCreateTemplate">
            <PlusOutlined />
            创建模板
          </a-button>
        </template>
        
        <a-row :gutter="16">
          <a-col
            v-for="template in authorizationTemplates"
            :key="template.id"
            :span="8"
          >
            <a-card class="template-item" :hoverable="true" @click="useTemplate(template)">
              <div class="template-header">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-type">
                  <a-tag :color="getTemplateTypeColor(template.type)">
                    {{ getTemplateTypeText(template.type) }}
                  </a-tag>
                </div>
              </div>
              <div class="template-description">{{ template.description }}</div>
              <div class="template-info">
                <div class="template-duration">有效期: {{ template.duration }}小时</div>
                <div class="template-resources">资源: {{ template.resourceCount }}个</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 创建申请弹窗 -->
    <a-modal
      v-model:open="applicationModal.visible"
      :title="applicationModal.title"
      width="800px"
      @ok="handleApplicationSubmit"
      @cancel="handleApplicationCancel"
    >
      <a-form
        ref="applicationFormRef"
        :model="applicationForm"
        :rules="applicationRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="申请人" name="applicant">
          <a-input v-model:value="applicationForm.applicant" placeholder="请输入申请人姓名" />
        </a-form-item>
        
        <a-form-item label="所属机构" name="organization">
          <a-input v-model:value="applicationForm.organization" placeholder="请输入所属机构" />
        </a-form-item>
        
        <a-form-item label="联系方式" name="contactInfo">
          <a-input v-model:value="applicationForm.contactInfo" placeholder="请输入联系方式" />
        </a-form-item>
        
        <a-form-item label="申请原因" name="reason">
          <a-textarea
            v-model:value="applicationForm.reason"
            placeholder="请详细说明申请原因"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="applicationForm.priority" placeholder="请选择优先级">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="emergency">紧急</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="授权时间" name="timeRange">
          <a-range-picker
            v-model:value="applicationForm.timeRange"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="申请资源" name="requestedResources">
          <a-transfer
            v-model:value="applicationForm.requestedResources"
            :data-source="availableResources"
            :titles="['可选资源', '已选资源']"
            :render="item => item.title"
            :target-keys="applicationForm.requestedResources"
          />
        </a-form-item>
        
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="applicationForm.notes"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 申请详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      title="申请详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedApplication" class="application-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请ID">
            {{ selectedApplication.id }}
          </a-descriptions-item>
          <a-descriptions-item label="申请状态">
            <a-tag :color="getStatusColor(selectedApplication.status)">
              {{ getStatusText(selectedApplication.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请人">
            {{ selectedApplication.applicant }}
          </a-descriptions-item>
          <a-descriptions-item label="所属机构">
            {{ selectedApplication.organization }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ selectedApplication.contactInfo }}
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(selectedApplication.priority)">
              {{ getPriorityText(selectedApplication.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ formatTime(selectedApplication.applicationTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="授权时间">
            {{ formatTime(selectedApplication.startTime) }} - {{ formatTime(selectedApplication.endTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="申请原因" :span="2">
            {{ selectedApplication.reason }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 申请资源列表 -->
        <div class="requested-resources">
          <h4>申请资源</h4>
          <a-table
            :columns="resourceColumns"
            :data-source="selectedApplication.requestedResources"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag>{{ record.type }}</a-tag>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 审批记录 -->
        <div class="approval-history">
          <h4>审批记录</h4>
          <a-timeline>
            <a-timeline-item
              v-for="record in selectedApplication.approvalHistory"
              :key="record.id"
              :color="getApprovalColor(record.action)"
            >
              <p>{{ record.action }} - {{ record.approver }}</p>
              <p class="approval-time">{{ formatTime(record.time) }}</p>
              <p v-if="record.comment" class="approval-comment">{{ record.comment }}</p>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>

    <!-- 紧急授权弹窗 -->
    <a-modal
      v-model:open="emergencyModal.visible"
      title="紧急授权"
      width="600px"
      @ok="handleEmergencySubmit"
      @cancel="handleEmergencyCancel"
    >
      <a-alert
        message="紧急授权警告"
        description="紧急授权将绕过正常审批流程，直接生效。请确保操作的必要性和合规性。"
        type="error"
        show-icon
        style="margin-bottom: 24px"
      />
      
      <a-form
        :model="emergencyForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="授权对象">
          <a-input v-model:value="emergencyForm.target" placeholder="请输入授权对象" />
        </a-form-item>
        
        <a-form-item label="紧急原因">
          <a-textarea
            v-model:value="emergencyForm.reason"
            placeholder="请详细说明紧急情况"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="授权时长">
          <a-select v-model:value="emergencyForm.duration" placeholder="请选择授权时长">
            <a-select-option value="1">1小时</a-select-option>
            <a-select-option value="2">2小时</a-select-option>
            <a-select-option value="4">4小时</a-select-option>
            <a-select-option value="8">8小时</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="授权资源">
          <a-checkbox-group v-model:value="emergencyForm.resources">
            <a-checkbox value="all">全部资源</a-checkbox>
            <a-checkbox value="camera">摄像头</a-checkbox>
            <a-checkbox value="sensor">传感器</a-checkbox>
            <a-checkbox value="radar">雷达</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  KeyOutlined,
  ClockCircleOutlined,
  FileAddOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  BellOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 授权申请接口
 */
interface AuthorizationApplication {
  id: string
  applicant: string
  organization: string
  contactInfo: string
  reason: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  applicationTime: string
  startTime: string
  endTime: string
  requestedResources: Resource[]
  approvalHistory: ApprovalRecord[]
  notes?: string
}

/**
 * 资源接口
 */
interface Resource {
  id: string
  name: string
  type: string
  description: string
  title?: string
  key?: string
}

/**
 * 审批记录接口
 */
interface ApprovalRecord {
  id: string
  action: string
  approver: string
  time: string
  comment?: string
}

/**
 * 授权模板接口
 */
interface AuthorizationTemplate {
  id: string
  name: string
  type: 'emergency' | 'routine' | 'temporary'
  description: string
  duration: number
  resourceCount: number
  resources: string[]
}

/**
 * 响应式数据
 */
const loading = ref(false)
const hasUrgentApplications = ref(true)
const selectedApplication = ref<AuthorizationApplication | null>(null)

const applicationFilter = reactive({
  status: '',
  priority: ''
})

const applicationModal = reactive({
  visible: false,
  title: '创建授权申请',
  isEdit: false
})

const detailModal = reactive({
  visible: false
})

const emergencyModal = reactive({
  visible: false
})

/**
 * 表单数据
 */
const applicationForm = reactive<Partial<AuthorizationApplication>>({
  applicant: '',
  organization: '',
  contactInfo: '',
  reason: '',
  priority: 'medium',
  timeRange: [],
  requestedResources: [],
  notes: ''
})

const emergencyForm = reactive({
  target: '',
  reason: '',
  duration: '2',
  resources: ['camera']
})

/**
 * 表单验证规则
 */
const applicationRules = {
  applicant: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  organization: [{ required: true, message: '请输入所属机构', trigger: 'blur' }],
  contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择授权时间', trigger: 'change' }],
  requestedResources: [{ required: true, message: '请选择申请资源', trigger: 'change' }]
}

/**
 * 授权统计数据
 */
const authStats = reactive({
  activeAuthorizations: 42,
  expiringSoon: 8,
  todayApplications: 23,
  emergencyAuthorizations: 5
})

/**
 * 分页配置
 */
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

/**
 * 模拟申请数据
 */
const applications = ref<AuthorizationApplication[]>([
  {
    id: 'auth_001',
    applicant: '海事局调度员',
    organization: '上海海事局',
    contactInfo: '13812345678',
    reason: '紧急海上救援任务，需要查看港区A和航道区域的实时监控画面',
    priority: 'emergency',
    status: 'pending',
    applicationTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_001', name: '港区A-摄像头01', type: '摄像头', description: '港区A码头监控' },
      { id: 'res_002', name: '航道-传感器01', type: '传感器', description: '航道水深监测' }
    ],
    approvalHistory: [
      {
        id: 'approval_001',
        action: '提交申请',
        approver: '海事局调度员',
        time: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  },
  {
    id: 'auth_002',
    applicant: '港口管理员',
    organization: '港口管理局',
    contactInfo: '13987654321',
    reason: '例行检查港区设备运行状态',
    priority: 'medium',
    status: 'approved',
    applicationTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_003', name: '港区B-摄像头02', type: '摄像头', description: '港区B监控设备' }
    ],
    approvalHistory: [
      {
        id: 'approval_002',
        action: '提交申请',
        approver: '港口管理员',
        time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_003',
        action: '批准申请',
        approver: '系统管理员',
        time: dayjs().subtract(1.5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '例行检查申请，予以批准'
      }
    ]
  },
  {
    id: 'auth_003',
    applicant: '第三方检测机构',
    organization: '海洋环境监测中心',
    contactInfo: '13611112222',
    reason: '环境监测数据采集',
    priority: 'low',
    status: 'expired',
    applicationTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_004', name: '环境监测传感器', type: '传感器', description: '水质监测数据' }
    ],
    approvalHistory: [
      {
        id: 'approval_004',
        action: '提交申请',
        approver: '第三方检测机构',
        time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_005',
        action: '批准申请',
        approver: '系统管理员',
        time: dayjs().subtract(10, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_006',
        action: '授权过期',
        approver: '系统',
        time: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  },
  {
    id: 'auth_004',
    applicant: '海警支队队长',
    organization: '中国海警局东海分局',
    contactInfo: '13755566677',
    reason: '海上执法行动，需要实时监控可疑船舶动向',
    priority: 'emergency',
    status: 'approved',
    applicationTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_005', name: '雷达监测设备', type: '雷达', description: '船舶跟踪雷达' },
      { id: 'res_006', name: '港区C-摄像头03', type: '摄像头', description: '港区C全景监控' },
      { id: 'res_007', name: 'AIS基站01', type: 'AIS', description: '船舶自动识别系统' }
    ],
    approvalHistory: [
      {
        id: 'approval_007',
        action: '提交申请',
        approver: '海警支队队长',
        time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_008',
        action: '紧急批准',
        approver: '值班主管',
        time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        comment: '海上执法紧急需要，立即批准'
      }
    ]
  },
  {
    id: 'auth_005',
    applicant: '船舶调度中心',
    organization: '上海港集团',
    contactInfo: '13888999000',
    reason: '台风预警期间船舶调度和安全监控',
    priority: 'high',
    status: 'pending',
    applicationTime: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().add(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_008', name: '气象监测站', type: '传感器', description: '风速风向监测' },
      { id: 'res_009', name: '港区D-摄像头04', type: '摄像头', description: '港区D码头监控' },
      { id: 'res_010', name: '港区E-摄像头05', type: '摄像头', description: '港区E锚地监控' }
    ],
    approvalHistory: [
      {
        id: 'approval_009',
        action: '提交申请',
        approver: '船舶调度中心',
        time: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  },
  {
    id: 'auth_006',
    applicant: '海关缉私局',
    organization: '上海海关',
    contactInfo: '13666777888',
    reason: '反走私专项行动，监控重点区域',
    priority: 'high',
    status: 'approved',
    applicationTime: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_011', name: '红外夜视摄像头01', type: '摄像头', description: '夜间监控专用' },
      { id: 'res_012', name: '声呐探测设备', type: '传感器', description: '水下目标探测' }
    ],
    approvalHistory: [
      {
        id: 'approval_010',
        action: '提交申请',
        approver: '海关缉私局',
        time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_011',
        action: '批准申请',
        approver: '安全主管',
        time: dayjs().subtract(2.5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '反走私行动，优先批准'
      }
    ]
  },
  {
    id: 'auth_007',
    applicant: '渔业管理部门',
    organization: '上海市农业农村委员会',
    contactInfo: '13444555666',
    reason: '禁渔期执法检查，监控渔船活动',
    priority: 'medium',
    status: 'rejected',
    applicationTime: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_013', name: '渔业监控摄像头', type: '摄像头', description: '渔港区域监控' }
    ],
    approvalHistory: [
      {
        id: 'approval_012',
        action: '提交申请',
        approver: '渔业管理部门',
        time: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_013',
        action: '拒绝申请',
        approver: '系统管理员',
        time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '权限级别不足，需要上级部门审批'
      }
    ]
  },
  {
    id: 'auth_008',
    applicant: '海洋科研院所',
    organization: '中科院海洋研究所',
    contactInfo: '13222333444',
    reason: '海洋生态环境监测研究项目数据采集',
    priority: 'low',
    status: 'approved',
    applicationTime: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(20, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_014', name: '水质监测传感器组', type: '传感器', description: '多参数水质监测' },
      { id: 'res_015', name: '海底摄像系统', type: '摄像头', description: '海底生态监控' }
    ],
    approvalHistory: [
      {
        id: 'approval_014',
        action: '提交申请',
        approver: '海洋科研院所',
        time: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_015',
        action: '批准申请',
        approver: '技术主管',
        time: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '科研项目申请，批准使用'
      }
    ]
  },
  {
    id: 'auth_009',
    applicant: '应急管理局',
    organization: '上海市应急管理局',
    contactInfo: '13111222333',
    reason: '危化品运输船舶监控，防范安全事故',
    priority: 'high',
    status: 'pending',
    applicationTime: dayjs().subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().add(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_016', name: '危化品码头监控', type: '摄像头', description: '危化品装卸作业监控' },
      { id: 'res_017', name: '气体泄漏检测器', type: '传感器', description: '有害气体监测' },
      { id: 'res_018', name: '船舶跟踪雷达02', type: '雷达', description: '危化品船舶跟踪' }
    ],
    approvalHistory: [
      {
        id: 'approval_016',
        action: '提交申请',
        approver: '应急管理局',
        time: dayjs().subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  },
  {
    id: 'auth_010',
    applicant: '海事巡逻队',
    organization: '长江海事局',
    contactInfo: '13999888777',
    reason: '夜间巡逻执法，监控非法采砂船舶',
    priority: 'medium',
    status: 'approved',
    applicationTime: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_019', name: '夜视监控系统', type: '摄像头', description: '夜间巡逻监控' },
      { id: 'res_020', name: '船舶识别雷达', type: '雷达', description: '船舶身份识别' }
    ],
    approvalHistory: [
      {
        id: 'approval_017',
        action: '提交申请',
        approver: '海事巡逻队',
        time: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_018',
        action: '批准申请',
        approver: '值班调度员',
        time: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '巡逻执法申请，批准使用'
      }
    ]
  },
  {
    id: 'auth_011',
    applicant: '水上交通管制',
    organization: '上海海事局交管中心',
    contactInfo: '13777888999',
    reason: '大型邮轮进港引导，需要全程监控',
    priority: 'medium',
    status: 'expired',
    applicationTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().subtract(18, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_021', name: '引航道监控系统', type: '摄像头', description: '船舶引航监控' },
      { id: 'res_022', name: '港口调度雷达', type: '雷达', description: '船舶调度引导' }
    ],
    approvalHistory: [
      {
        id: 'approval_019',
        action: '提交申请',
        approver: '水上交通管制',
        time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        id: 'approval_020',
        action: '批准申请',
        approver: '交管主管',
        time: dayjs().subtract(20, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        comment: '邮轮进港申请，批准使用'
      },
      {
        id: 'approval_021',
        action: '授权到期',
        approver: '系统',
        time: dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  },
  {
    id: 'auth_012',
    applicant: '边防检查站',
    organization: '上海边检总站',
    contactInfo: '13555666777',
    reason: '国际邮轮旅客通关检查，需要监控码头区域',
    priority: 'medium',
    status: 'pending',
    applicationTime: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    startTime: dayjs().add(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    requestedResources: [
      { id: 'res_023', name: '客运码头监控', type: '摄像头', description: '旅客通关监控' },
      { id: 'res_024', name: '人脸识别系统', type: '传感器', description: '旅客身份识别' }
    ],
    approvalHistory: [
      {
        id: 'approval_022',
        action: '提交申请',
        approver: '边防检查站',
        time: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  }
])

/**
 * 模拟可用资源数据
 */
const availableResources = ref<Resource[]>([
  { key: 'res_001', title: '港区A-摄像头01', id: 'res_001', name: '港区A-摄像头01', type: '摄像头', description: '港区A码头监控' },
  { key: 'res_002', title: '航道-传感器01', id: 'res_002', name: '航道-传感器01', type: '传感器', description: '航道水深监测' },
  { key: 'res_003', title: '港区B-摄像头02', id: 'res_003', name: '港区B-摄像头02', type: '摄像头', description: '港区B监控设备' },
  { key: 'res_004', title: '环境监测传感器', id: 'res_004', name: '环境监测传感器', type: '传感器', description: '水质监测数据' },
  { key: 'res_005', title: '雷达监测设备', id: 'res_005', name: '雷达监测设备', type: '雷达', description: '船舶跟踪雷达' },
  { key: 'res_006', title: '港区C-摄像头03', id: 'res_006', name: '港区C-摄像头03', type: '摄像头', description: '港区C全景监控' },
  { key: 'res_007', title: 'AIS基站01', id: 'res_007', name: 'AIS基站01', type: 'AIS', description: '船舶自动识别系统' },
  { key: 'res_008', title: '气象监测站', id: 'res_008', name: '气象监测站', type: '传感器', description: '风速风向监测' },
  { key: 'res_009', title: '港区D-摄像头04', id: 'res_009', name: '港区D-摄像头04', type: '摄像头', description: '港区D码头监控' },
  { key: 'res_010', title: '港区E-摄像头05', id: 'res_010', name: '港区E-摄像头05', type: '摄像头', description: '港区E锚地监控' },
  { key: 'res_011', title: '红外夜视摄像头01', id: 'res_011', name: '红外夜视摄像头01', type: '摄像头', description: '夜间监控专用' },
  { key: 'res_012', title: '声呐探测设备', id: 'res_012', name: '声呐探测设备', type: '传感器', description: '水下目标探测' },
  { key: 'res_013', title: '渔业监控摄像头', id: 'res_013', name: '渔业监控摄像头', type: '摄像头', description: '渔港区域监控' },
  { key: 'res_014', title: '水质监测传感器组', id: 'res_014', name: '水质监测传感器组', type: '传感器', description: '多参数水质监测' },
  { key: 'res_015', title: '海底摄像系统', id: 'res_015', name: '海底摄像系统', type: '摄像头', description: '海底生态监控' },
  { key: 'res_016', title: '危化品码头监控', id: 'res_016', name: '危化品码头监控', type: '摄像头', description: '危化品装卸作业监控' },
  { key: 'res_017', title: '气体泄漏检测器', id: 'res_017', name: '气体泄漏检测器', type: '传感器', description: '有害气体监测' },
  { key: 'res_018', title: '船舶跟踪雷达02', id: 'res_018', name: '船舶跟踪雷达02', type: '雷达', description: '危化品船舶跟踪' },
  { key: 'res_019', title: '夜视监控系统', id: 'res_019', name: '夜视监控系统', type: '摄像头', description: '夜间巡逻监控' },
  { key: 'res_020', title: '船舶识别雷达', id: 'res_020', name: '船舶识别雷达', type: '雷达', description: '船舶身份识别' },
  { key: 'res_021', title: '引航道监控系统', id: 'res_021', name: '引航道监控系统', type: '摄像头', description: '船舶引航监控' },
  { key: 'res_022', title: '港口调度雷达', id: 'res_022', name: '港口调度雷达', type: '雷达', description: '船舶调度引导' },
  { key: 'res_023', title: '客运码头监控', id: 'res_023', name: '客运码头监控', type: '摄像头', description: '旅客通关监控' },
  { key: 'res_024', title: '人脸识别系统', id: 'res_024', name: '人脸识别系统', type: '传感器', description: '旅客身份识别' },
  { key: 'res_025', title: '集装箱堆场监控', id: 'res_025', name: '集装箱堆场监控', type: '摄像头', description: '集装箱作业监控' },
  { key: 'res_026', title: '船舶进出港雷达', id: 'res_026', name: '船舶进出港雷达', type: '雷达', description: '港口交通管制' },
  { key: 'res_027', title: '油污监测传感器', id: 'res_027', name: '油污监测传感器', type: '传感器', description: '海面油污检测' },
  { key: 'res_028', title: '港区F-摄像头06', id: 'res_028', name: '港区F-摄像头06', type: '摄像头', description: '港区F作业监控' },
  { key: 'res_029', title: 'VTS雷达系统', id: 'res_029', name: 'VTS雷达系统', type: '雷达', description: '船舶交通管理系统' },
  { key: 'res_030', title: '海洋气象浮标', id: 'res_030', name: '海洋气象浮标', type: '传感器', description: '海上气象监测' }
])

/**
 * 模拟授权模板数据
 */
const authorizationTemplates = ref<AuthorizationTemplate[]>([
  {
    id: 'template_001',
    name: '紧急救援授权',
    type: 'emergency',
    description: '用于紧急海上救援任务的快速授权模板',
    duration: 4,
    resourceCount: 8,
    resources: ['camera', 'sensor', 'radar']
  },
  {
    id: 'template_002',
    name: '例行检查授权',
    type: 'routine',
    description: '日常设备检查和维护的标准授权模板',
    duration: 2,
    resourceCount: 3,
    resources: ['camera']
  },
  {
    id: 'template_003',
    name: '临时访问授权',
    type: 'temporary',
    description: '短期临时访问的基础授权模板',
    duration: 1,
    resourceCount: 2,
    resources: ['camera', 'sensor']
  },
  {
    id: 'template_004',
    name: '海上执法授权',
    type: 'emergency',
    description: '海警、海事执法专用授权模板，包含全套监控设备',
    duration: 6,
    resourceCount: 12,
    resources: ['camera', 'sensor', 'radar', 'ais']
  },
  {
    id: 'template_005',
    name: '环境监测授权',
    type: 'routine',
    description: '环境保护部门监测作业标准模板',
    duration: 8,
    resourceCount: 6,
    resources: ['sensor', 'camera']
  },
  {
    id: 'template_006',
    name: '港口作业授权',
    type: 'routine',
    description: '港口日常作业监控的标准授权',
    duration: 12,
    resourceCount: 10,
    resources: ['camera', 'sensor']
  },
  {
    id: 'template_007',
    name: '科研项目授权',
    type: 'temporary',
    description: '科研院所数据采集专用模板',
    duration: 24,
    resourceCount: 8,
    resources: ['sensor', 'camera']
  },
  {
    id: 'template_008',
    name: '反走私行动授权',
    type: 'emergency',
    description: '海关缉私专项行动授权模板',
    duration: 8,
    resourceCount: 15,
    resources: ['camera', 'sensor', 'radar']
  },
  {
    id: 'template_009',
    name: '台风应急授权',
    type: 'emergency',
    description: '台风等恶劣天气应急响应授权',
    duration: 48,
    resourceCount: 20,
    resources: ['camera', 'sensor', 'radar', 'ais']
  }
])

/**
 * 计算属性
 */
const filteredApplications = computed(() => {
  let apps = applications.value
  
  if (applicationFilter.status) {
    apps = apps.filter(app => app.status === applicationFilter.status)
  }
  
  if (applicationFilter.priority) {
    apps = apps.filter(app => app.priority === applicationFilter.priority)
  }
  
  return apps
})

const pendingApplications = computed(() => {
  return applications.value.filter(app => app.status === 'pending')
})

const expiringAuthorizations = computed(() => {
  return applications.value
    .filter(app => app.status === 'approved')
    .map(app => ({
      id: app.id,
      applicant: app.applicant,
      resourceName: app.requestedResources[0]?.name || '未知资源',
      endTime: app.endTime
    }))
    .filter(auth => dayjs(auth.endTime).diff(dayjs(), 'hour') <= 2)
})

/**
 * 表格列定义
 */
const applicationColumns = [
  {
    title: '申请人信息',
    key: 'applicantInfo',
    width: 200,
    fixed: 'left'
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '申请资源',
    key: 'resources',
    width: 150
  },
  {
    title: '授权时间',
    key: 'timeRange',
    width: 200
  },
  {
    title: '申请时间',
    dataIndex: 'applicationTime',
    key: 'applicationTime',
    width: 150,
    customRender: ({ text }: { text: string }) => formatTime(text)
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 资源列表列定义
 */
const resourceColumns = [
  {
    title: '资源名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    key: 'type'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  }
]

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    emergency: 'red'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    emergency: '紧急'
  }
  return priorityMap[priority] || priority
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    expired: 'default'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    expired: '已过期'
  }
  return statusMap[status] || status
}

/**
 * 获取模板类型颜色
 */
const getTemplateTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    emergency: 'red',
    routine: 'blue',
    temporary: 'green'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取模板类型文本
 */
const getTemplateTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    emergency: '紧急',
    routine: '例行',
    temporary: '临时'
  }
  return typeMap[type] || type
}

/**
 * 获取审批颜色
 */
const getApprovalColor = (action: string) => {
  if (action.includes('批准')) return 'green'
  if (action.includes('拒绝')) return 'red'
  if (action.includes('撤销')) return 'orange'
  return 'blue'
}

/**
 * 获取唯一资源类型
 */
const getUniqueResourceTypes = (resources: Resource[]) => {
  return [...new Set(resources.map(r => r.type))]
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取持续时间文本
 */
const getDurationText = (startTime: string, endTime: string) => {
  const start = dayjs(startTime)
  const end = dayjs(endTime)
  const hours = end.diff(start, 'hour')
  return `${hours}小时`
}

/**
 * 获取过期时间文本
 */
const getExpirationText = (endTime: string) => {
  const now = dayjs()
  const end = dayjs(endTime)
  const diff = end.diff(now, 'minute')
  
  if (diff < 0) {
    return '已过期'
  } else if (diff < 60) {
    return `${diff}分钟后过期`
  } else {
    return `${Math.floor(diff / 60)}小时后过期`
  }
}

/**
 * 处理申请过滤变化
 */
const handleApplicationFilterChange = () => {
  console.log('申请过滤条件变化:', applicationFilter)
}

/**
 * 显示创建申请弹窗
 */
const showCreateApplication = () => {
  applicationModal.visible = true
  applicationModal.title = '创建授权申请'
  applicationModal.isEdit = false
  resetApplicationForm()
}

/**
 * 刷新申请列表
 */
const refreshApplications = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('申请列表已刷新')
  }, 1000)
}

/**
 * 查看申请详情
 */
const viewApplication = (application: AuthorizationApplication) => {
  selectedApplication.value = application
  detailModal.visible = true
}

/**
 * 批准申请
 */
const approveApplication = (application: AuthorizationApplication) => {
  Modal.confirm({
    title: '确认批准',
    content: `确定要批准申请人"${application.applicant}"的授权申请吗？`,
    onOk: () => {
      application.status = 'approved'
      application.approvalHistory.push({
        id: `approval_${Date.now()}`,
        action: '批准申请',
        approver: '当前用户',
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        comment: '申请已批准'
      })
      message.success('申请已批准')
    }
  })
}

/**
 * 拒绝申请
 */
const rejectApplication = (application: AuthorizationApplication) => {
  Modal.confirm({
    title: '确认拒绝',
    content: `确定要拒绝申请人"${application.applicant}"的授权申请吗？`,
    onOk: () => {
      application.status = 'rejected'
      application.approvalHistory.push({
        id: `approval_${Date.now()}`,
        action: '拒绝申请',
        approver: '当前用户',
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        comment: '申请已拒绝'
      })
      message.success('申请已拒绝')
    }
  })
}

/**
 * 撤销授权
 */
const revokeAuthorization = (application: AuthorizationApplication) => {
  Modal.confirm({
    title: '确认撤销',
    content: `确定要撤销申请人"${application.applicant}"的授权吗？`,
    onOk: () => {
      application.status = 'expired'
      application.approvalHistory.push({
        id: `approval_${Date.now()}`,
        action: '撤销授权',
        approver: '当前用户',
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        comment: '授权已撤销'
      })
      message.success('授权已撤销')
    }
  })
}

/**
 * 快速批准
 */
const quickApprove = (application: AuthorizationApplication) => {
  approveApplication(application)
}

/**
 * 快速拒绝
 */
const quickReject = (application: AuthorizationApplication) => {
  rejectApplication(application)
}

/**
 * 延期授权
 */
const extendAuthorization = (auth: any) => {
  message.success(`已为"${auth.applicant}"延期2小时`)
}

/**
 * 显示紧急授权弹窗
 */
const showEmergencyAuth = () => {
  emergencyModal.visible = true
}

/**
 * 显示创建模板弹窗
 */
const showCreateTemplate = () => {
  message.info('创建授权模板功能')
}

/**
 * 使用模板
 */
const useTemplate = (template: AuthorizationTemplate) => {
  applicationModal.visible = true
  applicationModal.title = `使用模板: ${template.name}`
  // 根据模板预填表单
  message.success(`已应用模板: ${template.name}`)
}

/**
 * 提交申请表单
 */
const handleApplicationSubmit = () => {
  message.success('授权申请提交成功')
  applicationModal.visible = false
  resetApplicationForm()
}

/**
 * 取消申请表单
 */
const handleApplicationCancel = () => {
  applicationModal.visible = false
  resetApplicationForm()
}

/**
 * 提交紧急授权
 */
const handleEmergencySubmit = () => {
  message.success('紧急授权已生效')
  emergencyModal.visible = false
  resetEmergencyForm()
}

/**
 * 取消紧急授权
 */
const handleEmergencyCancel = () => {
  emergencyModal.visible = false
  resetEmergencyForm()
}

/**
 * 重置申请表单
 */
const resetApplicationForm = () => {
  Object.assign(applicationForm, {
    applicant: '',
    organization: '',
    contactInfo: '',
    reason: '',
    priority: 'medium',
    timeRange: [],
    requestedResources: [],
    notes: ''
  })
}

/**
 * 重置紧急授权表单
 */
const resetEmergencyForm = () => {
  Object.assign(emergencyForm, {
    target: '',
    reason: '',
    duration: '2',
    resources: ['camera']
  })
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  pagination.total = applications.value.length
  console.log('临时授权页面已加载')
})
</script>

<style lang="less" scoped>
.temporary-authorization {
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

  .authorization-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .authorization-content {
    margin-bottom: 24px;

    .application-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .applicant-info {
        .applicant-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .applicant-org {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }

        .applicant-contact {
          font-size: 11px;
          color: #999;
        }
      }

      .resources-info {
        .resource-count {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .resource-types {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }

      .time-range {
        .start-time {
          color: #333;
          margin-bottom: 2px;
        }

        .end-time {
          color: #333;
          margin-bottom: 2px;
        }

        .duration {
          font-size: 11px;
          color: #999;
        }
      }
    }

    .quick-action-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .emergency-authorization {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }
      }

      .pending-applications {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .pending-list {
          max-height: 300px;
          overflow-y: auto;

          .pending-item {
            background: #fafafa;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
            border-left: 4px solid #d9d9d9;

            &.priority-emergency {
              border-left-color: #ff4d4f;
              background: #fff2f0;
            }

            &.priority-high {
              border-left-color: #faad14;
              background: #fffbe6;
            }

            .pending-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .pending-applicant {
                font-weight: 500;
                color: #333;
                font-size: 14px;
              }
            }

            .pending-reason {
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
              line-height: 1.4;
            }

            .pending-time {
              font-size: 11px;
              color: #999;
              margin-bottom: 8px;
            }

            .pending-actions {
              display: flex;
              gap: 8px;
            }
          }
        }
      }

      .expiring-authorizations {
        h4 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .expiring-list {
          max-height: 200px;
          overflow-y: auto;

          .expiring-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 8px;
            background: #fff7e6;
            border-radius: 4px;
            border-left: 3px solid #faad14;

            .expiring-info {
              .expiring-applicant {
                font-weight: 500;
                color: #333;
                font-size: 13px;
                margin-bottom: 2px;
              }

              .expiring-resource {
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
              }

              .expiring-time {
                font-size: 11px;
                color: #faad14;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }

  .authorization-templates {
    margin-bottom: 24px;

    .template-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .template-item {
        border-radius: 6px;
        border: 2px solid #f0f0f0;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .template-name {
            font-weight: 500;
            color: #333;
            font-size: 16px;
          }
        }

        .template-description {
          color: #666;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .template-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .application-detail {
    .requested-resources {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }
    }

    .approval-history {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .approval-time {
        font-size: 12px;
        color: #999;
        margin: 4px 0;
      }

      .approval-comment {
        font-size: 12px;
        color: #666;
        margin: 4px 0;
        font-style: italic;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .temporary-authorization {
    .authorization-content {
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
  .temporary-authorization {
    padding: 16px;

    .authorization-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .authorization-templates {
      .ant-col-8 {
        width: 100%;
        margin-bottom: 16px;
      }
    }
  }
}
</style>

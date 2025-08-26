<template>
  <div class="contingency-plan-management">
    <div class="page-header">
      <h2>预案管理</h2>
      <p>应急预案管理，包含预案制定、审批流程、执行记录等</p>
    </div>

    <!-- 预案概览 -->
    <div class="plan-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper total">
                <FileTextOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ planStats.totalPlans }}</div>
                <div class="label">总预案数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper active">
                <CheckCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ planStats.activePlans }}</div>
                <div class="label">生效预案</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper pending">
                <ClockCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ planStats.pendingPlans }}</div>
                <div class="label">待审批</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper executed">
                <PlayCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ planStats.executedPlans }}</div>
                <div class="label">已执行</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 预案创建区域 -->
    <div class="plan-creation">
      <a-card title="创建新预案" class="creation-card">
        <template #extra>
          <a-button type="primary" @click="createPlan">
            <PlusOutlined />
            创建预案
          </a-button>
        </template>

        <a-form layout="vertical" :model="planForm" @finish="handleCreatePlan">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="预案名称" name="name" :rules="[{ required: true, message: '请输入预案名称' }]">
                <a-input
                  v-model:value="planForm.name"
                  placeholder="请输入预案名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="预案类型" name="type" :rules="[{ required: true, message: '请选择预案类型' }]">
                <a-select
                  v-model:value="planForm.type"
                  placeholder="请选择预案类型"
                  :options="planTypeOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="风险等级" name="riskLevel" :rules="[{ required: true, message: '请选择风险等级' }]">
                <a-select
                  v-model:value="planForm.riskLevel"
                  placeholder="请选择风险等级"
                  :options="riskLevelOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="预案描述" name="description">
                <a-textarea
                  v-model:value="planForm.description"
                  :rows="3"
                  placeholder="请输入预案描述"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="适用范围" name="scope">
                <a-textarea
                  v-model:value="planForm.scope"
                  :rows="3"
                  placeholder="请输入适用范围"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="责任部门" name="department" :rules="[{ required: true, message: '请选择责任部门' }]">
                <a-select
                  v-model:value="planForm.department"
                  placeholder="请选择责任部门"
                  :options="departmentOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="负责人" name="responsible" :rules="[{ required: true, message: '请输入负责人' }]">
                <a-input
                  v-model:value="planForm.responsible"
                  placeholder="请输入负责人"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="生效日期" name="effectiveDate" :rules="[{ required: true, message: '请选择生效日期' }]">
                <a-date-picker
                  v-model:value="planForm.effectiveDate"
                  style="width: 100%"
                  placeholder="请选择生效日期"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="creating">
                    提交预案
                  </a-button>
                  <a-button @click="resetForm">
                    重置
                  </a-button>
                  <a-button @click="previewPlan">
                    预览
                  </a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>

    <!-- 预案管理区域 -->
    <div class="plan-management">
      <a-card title="预案管理" class="management-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshPlans">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="batchApprove">
              <CheckCircleOutlined />
              批量审批
            </a-button>
            <a-button @click="exportPlans">
              <DownloadOutlined />
              导出预案
            </a-button>
          </a-space>
        </template>

        <!-- 预案列表 -->
        <a-table
          :columns="planColumns"
          :data-source="planList"
          :pagination="pagination"
          :loading="tableLoading"
          row-key="id"
          @change="handleTableChange"
          :row-selection="rowSelection"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getPlanTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'riskLevel'">
              <a-tag :color="getRiskLevelColor(record.riskLevel)">
                {{ record.riskLevel }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getPlanStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewPlan(record)">
                  查看
                </a-button>
                <a-button size="small" @click="editPlan(record)">
                  编辑
                </a-button>
                <a-button size="small" @click="executePlan(record)">
                  执行
                </a-button>
                <a-button size="small" @click="deletePlan(record)" danger>
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 审批流程管理 -->
    <div class="approval-management">
      <a-card title="审批流程管理" class="approval-card">
        <template #extra>
          <a-button type="primary" @click="createApprovalFlow">
            <PlusOutlined />
            创建审批流程
          </a-button>
        </template>

        <a-table
          :columns="approvalColumns"
          :data-source="approvalList"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getApprovalStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewApproval(record)">
                  查看
                </a-button>
                <a-button size="small" @click="approvePlan(record)" v-if="record.status === '待审批'">
                  审批
                </a-button>
                <a-button size="small" @click="rejectPlan(record)" v-if="record.status === '待审批'">
                  驳回
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 执行记录管理 -->
    <div class="execution-records">
      <a-card title="执行记录管理" class="execution-card">
        <template #extra>
          <a-button @click="refreshExecutions">
            <ReloadOutlined />
            刷新
          </a-button>
        </template>

        <a-table
          :columns="executionColumns"
          :data-source="executionList"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'result'">
              <a-tag :color="getExecutionResultColor(record.result)">
                {{ record.result }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewExecution(record)">
                  查看详情
                </a-button>
                <a-button size="small" @click="evaluateExecution(record)">
                  评估
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 预案详情模态框 -->
    <a-modal
      v-model:open="planDetailVisible"
      title="预案详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="预案名称">{{ selectedPlan?.name }}</a-descriptions-item>
        <a-descriptions-item label="预案类型">{{ selectedPlan?.type }}</a-descriptions-item>
        <a-descriptions-item label="风险等级">{{ selectedPlan?.riskLevel }}</a-descriptions-item>
        <a-descriptions-item label="责任部门">{{ selectedPlan?.department }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ selectedPlan?.responsible }}</a-descriptions-item>
        <a-descriptions-item label="生效日期">{{ selectedPlan?.effectiveDate }}</a-descriptions-item>
        <a-descriptions-item label="预案描述" :span="2">{{ selectedPlan?.description }}</a-descriptions-item>
        <a-descriptions-item label="适用范围" :span="2">{{ selectedPlan?.scope }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined,
  PlusOutlined, ReloadOutlined, DownloadOutlined, EditOutlined
} from '@ant-design/icons-vue'

// 预案统计
const planStats = ref({
  totalPlans: 45,
  activePlans: 32,
  pendingPlans: 8,
  executedPlans: 15
})

// 预案表单
const planForm = reactive({
  name: '',
  type: undefined,
  riskLevel: undefined,
  description: '',
  scope: '',
  department: undefined,
  responsible: '',
  effectiveDate: null
})

// 创建状态
const creating = ref(false)
const tableLoading = ref(false)
const planDetailVisible = ref(false)
const selectedPlan = ref(null)

// 表格数据
const planList = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 选择状态
const selectedRowKeys = ref([])
const rowSelection = reactive({
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: any[]) => {
    selectedRowKeys.value = keys
  }
})

// 审批和执行记录
const approvalList = ref([])
const executionList = ref([])

// 选项数据
const planTypeOptions = [
  { label: '船舶碰撞应急预案', value: '船舶碰撞应急预案' },
  { label: '船舶搁浅应急预案', value: '船舶搁浅应急预案' },
  { label: '火灾事故应急预案', value: '火灾事故应急预案' },
  { label: '人员落水应急预案', value: '人员落水应急预案' },
  { label: '货物泄漏应急预案', value: '货物泄漏应急预案' }
]

const riskLevelOptions = [
  { label: '特别重大', value: '特别重大' },
  { label: '重大', value: '重大' },
  { label: '较大', value: '较大' },
  { label: '一般', value: '一般' }
]

const departmentOptions = [
  { label: '海事局', value: '海事局' },
  { label: '港口管理局', value: '港口管理局' },
  { label: '航道管理处', value: '航道管理处' },
  { label: '应急救援中心', value: '应急救援中心' }
]

// 表格列定义
const planColumns = [
  { title: '预案名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '预案类型', dataIndex: 'type', key: 'type', width: 150 },
  { title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel', width: 100 },
  { title: '责任部门', dataIndex: 'department', key: 'department', width: 120 },
  { title: '负责人', dataIndex: 'responsible', key: 'responsible', width: 100 },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const approvalColumns = [
  { title: '预案名称', dataIndex: 'planName', key: 'planName' },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime' },
  { title: '审批人', dataIndex: 'approver', key: 'approver' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' }
]

const executionColumns = [
  { title: '预案名称', dataIndex: 'planName', key: 'planName' },
  { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime' },
  { title: '执行人', dataIndex: 'executor', key: 'executor' },
  { title: '执行结果', dataIndex: 'result', key: 'result' },
  { title: '操作', key: 'action' }
]

// 方法
const createPlan = () => {
  // 重置表单
  Object.keys(planForm).forEach(key => {
    if (Array.isArray(planForm[key])) {
      planForm[key] = []
    } else {
      planForm[key] = ''
    }
  })
  planForm.effectiveDate = null
}

const handleCreatePlan = () => {
  creating.value = true
  
  // 模拟预案创建过程
  setTimeout(() => {
    const newPlan = {
      id: `PLAN${Date.now()}`,
      name: planForm.name,
      type: planForm.type,
      riskLevel: planForm.riskLevel,
      description: planForm.description,
      scope: planForm.scope,
      department: planForm.department,
      responsible: planForm.responsible,
      effectiveDate: planForm.effectiveDate ? planForm.effectiveDate.format('YYYY-MM-DD') : '',
      status: '待审批'
    }
    
    planList.value.unshift(newPlan)
    pagination.total++
    
    creating.value = false
    message.success('预案创建成功，等待审批')
  }, 2000)
}

const resetForm = () => {
  createPlan()
}

const previewPlan = () => {
  if (!planForm.name) {
    message.warning('请先填写预案名称')
    return
  }
  message.info('预案预览功能开发中...')
}

const refreshPlans = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    message.success('预案列表已刷新')
  }, 1000)
}

const batchApprove = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要审批的预案')
    return
  }
  message.success(`正在批量审批 ${selectedRowKeys.value.length} 个预案...`)
}

const exportPlans = () => {
  message.success('预案导出中...')
}

const createApprovalFlow = () => {
  message.info('创建审批流程功能开发中...')
}

const viewPlan = (record: any) => {
  selectedPlan.value = record
  planDetailVisible.value = true
}

const editPlan = (record: any) => {
  message.info(`编辑预案：${record.name}`)
}

const executePlan = (record: any) => {
  if (record.status !== '已生效') {
    message.warning('预案尚未生效，无法执行')
    return
  }
  message.success(`开始执行预案：${record.name}`)
}

const deletePlan = (record: any) => {
  message.success(`删除预案：${record.name}`)
  planList.value = planList.value.filter(item => item.id !== record.id)
  pagination.total--
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const viewApproval = (record: any) => {
  message.info(`查看审批：${record.planName}`)
}

const approvePlan = (record: any) => {
  record.status = '已通过'
  message.success(`预案 ${record.planName} 审批通过`)
}

const rejectPlan = (record: any) => {
  record.status = '已驳回'
  message.success(`预案 ${record.planName} 审批驳回`)
}

const refreshExecutions = () => {
  message.success('执行记录已刷新')
}

const viewExecution = (record: any) => {
  message.info(`查看执行详情：${record.planName}`)
}

const evaluateExecution = (record: any) => {
  message.info(`评估执行结果：${record.planName}`)
}

// 获取标签颜色
const getPlanTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '船舶碰撞应急预案': 'red',
    '船舶搁浅应急预案': 'orange',
    '火灾事故应急预案': 'volcano',
    '人员落水应急预案': 'blue',
    '货物泄漏应急预案': 'purple'
  }
  return colorMap[type] || 'default'
}

const getRiskLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    '特别重大': 'red',
    '重大': 'volcano',
    '较大': 'orange',
    '一般': 'blue'
  }
  return colorMap[level] || 'default'
}

const getPlanStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '待审批': 'processing',
    '已通过': 'success',
    '已驳回': 'error',
    '已生效': 'default'
  }
  return colorMap[status] || 'default'
}

const getApprovalStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '待审批': 'processing',
    '已通过': 'success',
    '已驳回': 'error'
  }
  return colorMap[status] || 'default'
}

const getExecutionResultColor = (result: string) => {
  const colorMap: Record<string, string> = {
    '成功': 'success',
    '部分成功': 'warning',
    '失败': 'error'
  }
  return colorMap[result] || 'default'
}

// 初始化数据
onMounted(() => {
  console.log('预案管理页面已加载')
  
  // 模拟预案列表数据
  planList.value = [
    {
      id: 'PLAN001',
      name: '船舶碰撞应急预案V2.0',
      type: '船舶碰撞应急预案',
      riskLevel: '重大',
      description: '针对船舶碰撞事故的应急响应预案',
      scope: '长江口、黄浦江等主要航道',
      department: '海事局',
      responsible: '张主任',
      effectiveDate: '2025-08-01',
      status: '已生效'
    },
    {
      id: 'PLAN002',
      name: '火灾事故应急预案',
      type: '火灾事故应急预案',
      riskLevel: '较大',
      description: '船舶火灾事故应急处理预案',
      scope: '所有港口和锚地',
      department: '港口管理局',
      responsible: '李经理',
      effectiveDate: '2025-08-15',
      status: '待审批'
    }
  ]
  
  pagination.total = planList.value.length
  
  // 模拟审批列表数据
  approvalList.value = [
    {
      planName: '火灾事故应急预案',
      applicant: '李经理',
      applyTime: '2025-08-15 14:30:25',
      approver: '王局长',
      status: '待审批'
    }
  ]
  
  // 模拟执行记录数据
  executionList.value = [
    {
      planName: '船舶碰撞应急预案V2.0',
      executeTime: '2025-08-10 16:45:12',
      executor: '张主任',
      result: '成功'
    }
  ]
})
</script>

<style lang="less" scoped>
.contingency-plan-management {
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

  .plan-overview {
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

          &.total { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.active { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.pending { background: linear-gradient(135deg, #fa8c16, #d46b08); }
          &.executed { background: linear-gradient(135deg, #722ed1, #531dab); }
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

  .plan-creation {
    margin-bottom: 24px;

    .creation-card {
      .ant-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .plan-management {
    margin-bottom: 24px;

    .management-card {
      .ant-table {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    }
  }

  .approval-management {
    margin-bottom: 24px;

    .approval-card {
      .ant-table {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    }
  }

  .execution-records {
    .execution-card {
      .ant-table {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .contingency-plan-management {
    padding: 16px;

    .plan-overview,
    .plan-creation {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

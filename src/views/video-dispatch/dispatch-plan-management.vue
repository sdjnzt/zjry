<template>
  <div class="dispatch-plan-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>调度预案管理</h1>
      <p>管理和配置视频调度预案，支持快速响应和标准化调度流程</p>
    </div>

    <!-- 功能区域 -->
    <div class="function-area">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="function-card">
            <template #title>
              <span class="card-title">
                <VideoCameraOutlined />
                预案总数
              </span>
            </template>
            <div class="statistic-value">24</div>
            <div class="statistic-desc">个有效预案</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="function-card">
            <template #title>
              <span class="card-title">
                <CheckCircleOutlined />
                启用预案
              </span>
            </template>
            <div class="statistic-value">18</div>
            <div class="statistic-desc">个正在使用</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="function-card">
            <template #title>
              <span class="card-title">
                <ClockCircleOutlined />
                本月执行
              </span>
            </template>
            <div class="statistic-value">156</div>
            <div class="statistic-desc">次调度执行</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="function-card">
            <template #title>
              <span class="card-title">
                <StarOutlined />
                平均评分
              </span>
            </template>
            <div class="statistic-value">4.8</div>
            <div class="statistic-desc">分（满分5分）</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 操作区域 -->
    <div class="operation-area">
      <a-row :gutter="16" align="middle">
        <a-col :span="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索预案名称、类型、描述..."
            enter-button
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="8">
          <a-select
            v-model:value="filterType"
            placeholder="预案类型"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="emergency">应急响应</a-select-option>
            <a-select-option value="routine">日常巡查</a-select-option>
            <a-select-option value="special">专项检查</a-select-option>
            <a-select-option value="coordination">协同调度</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            新建预案
          </a-button>
          <a-button style="margin-left: 8px" @click="handleBatchEnable">
            <CheckOutlined />
            批量启用
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 预案列表 -->
    <div class="plan-list">
      <a-table
        :columns="columns"
        :data-source="planList"
        :pagination="pagination"
        :loading="loading"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'enabled' ? 'green' : 'default'">
              {{ record.status === 'enabled' ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewPlan(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editPlan(record)">
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                :danger="record.status === 'enabled'"
                @click="togglePlanStatus(record)"
              >
                {{ record.status === 'enabled' ? '禁用' : '启用' }}
              </a-button>
              <a-button type="link" size="small" danger @click="deletePlan(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新建/编辑预案弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="预案名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入预案名称" />
        </a-form-item>
        <a-form-item label="预案类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择预案类型">
            <a-select-option value="emergency">应急响应</a-select-option>
            <a-select-option value="routine">日常巡查</a-select-option>
            <a-select-option value="special">专项检查</a-select-option>
            <a-select-option value="coordination">协同调度</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="formData.priority" placeholder="请选择优先级">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="适用场景" name="scenarios">
          <a-textarea
            v-model:value="formData.scenarios"
            placeholder="请描述适用场景"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="调度资源" name="resources">
          <a-textarea
            v-model:value="formData.resources"
            placeholder="请描述需要调度的资源类型和数量"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="执行步骤" name="steps">
          <a-textarea
            v-model:value="formData.steps"
            placeholder="请描述执行步骤和流程"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预案详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="预案详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="预案名称">
          {{ selectedPlan.name }}
        </a-descriptions-item>
        <a-descriptions-item label="预案类型">
          {{ getTypeText(selectedPlan.type) }}
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(selectedPlan.priority)">
            {{ getPriorityText(selectedPlan.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="适用场景">
          {{ selectedPlan.scenarios }}
        </a-descriptions-item>
        <a-descriptions-item label="调度资源">
          {{ selectedPlan.resources }}
        </a-descriptions-item>
        <a-descriptions-item label="执行步骤">
          {{ selectedPlan.steps }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ selectedPlan.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="最后修改">
          {{ selectedPlan.updateTime }}
        </a-descriptions-item>
        <a-descriptions-item label="备注">
          {{ selectedPlan.remark }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  PlusOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'

/**
 * 预案数据接口
 */
interface PlanData {
  id: string
  name: string
  type: string
  priority: string
  scenarios: string
  resources: string
  steps: string
  status: string
  createTime: string
  updateTime: string
  remark: string
}

/**
 * 表单数据接口
 */
interface FormData {
  name: string
  type: string
  priority: string
  scenarios: string
  resources: string
  steps: string
  remark: string
}

// 响应式数据
const searchKeyword = ref('')
const filterType = ref('')
const loading = ref(false)
const modalVisible = ref(false)
const detailModalVisible = ref(false)
const modalTitle = ref('新建预案')
const isEdit = ref(false)
const selectedPlan = ref<PlanData>({} as PlanData)
const selectedRowKeys = ref<string[]>([])

// 表单引用和数据
const formRef = ref()
const formData = reactive<FormData>({
  name: '',
  type: '',
  priority: '',
  scenarios: '',
  resources: '',
  steps: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入预案名称' }],
  type: [{ required: true, message: '请选择预案类型' }],
  priority: [{ required: true, message: '请选择优先级' }],
  scenarios: [{ required: true, message: '请描述适用场景' }],
  resources: [{ required: true, message: '请描述调度资源' }],
  steps: [{ required: true, message: '请描述执行步骤' }]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列定义
const columns = [
  {
    title: '预案名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '预案类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    customRender: ({ text }: { text: string }) => getTypeText(text)
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '最后修改',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 预案列表数据
const planList = ref<PlanData[]>([
  {
    id: '1',
    name: '船舶碰撞应急响应预案',
    type: 'emergency',
    priority: 'high',
    scenarios: '船舶碰撞事故应急响应',
    resources: '监控摄像头、无人机、救援船只',
    steps: '1. 立即启动应急响应\n2. 调取相关监控画面\n3. 协调救援资源\n4. 现场指挥调度',
    status: 'enabled',
    createTime: '2025-08-26 10:30:00',
    updateTime: '2025-08-20 14:20:00',
    remark: '适用于各类船舶碰撞事故'
  },
  {
    id: '2',
    name: '日常航道巡查预案',
    type: 'routine',
    priority: 'medium',
    scenarios: '日常航道安全巡查',
    resources: '固定监控点、移动巡查设备',
    steps: '1. 制定巡查计划\n2. 分配巡查资源\n3. 执行巡查任务\n4. 记录巡查结果',
    status: 'enabled',
    createTime: '2025-08-10 09:00:00',
    updateTime: '2025-08-18 16:45:00',
    remark: '每日例行巡查任务'
  },
  {
    id: '3',
    name: '恶劣天气专项检查预案',
    type: 'special',
    priority: 'high',
    scenarios: '台风、暴雨等恶劣天气下的安全检查',
    resources: '全天候监控设备、应急通讯设备',
    steps: '1. 启动恶劣天气预警\n2. 加强监控频次\n3. 重点区域巡查\n4. 应急响应准备',
    status: 'enabled',
    createTime: '2025-08-12 11:15:00',
    updateTime: '2025-08-19 10:30:00',
    remark: '恶劣天气专用预案'
  }
])

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

/**
 * 获取预案类型文本
 */
const getTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    emergency: '应急响应',
    routine: '日常巡查',
    special: '专项检查',
    coordination: '协同调度'
  }
  return typeMap[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string): string => {
  const textMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || priority
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 实现搜索逻辑
  message.info('执行搜索操作')
}

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  // 实现筛选逻辑
  message.info('执行筛选操作')
}

/**
 * 显示创建弹窗
 */
const showCreateModal = () => {
  modalTitle.value = '新建预案'
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

/**
 * 查看预案
 */
const viewPlan = (record: PlanData) => {
  selectedPlan.value = record
  detailModalVisible.value = true
}

/**
 * 编辑预案
 */
const editPlan = (record: PlanData) => {
  modalTitle.value = '编辑预案'
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

/**
 * 切换预案状态
 */
const togglePlanStatus = (record: PlanData) => {
  const action = record.status === 'enabled' ? '禁用' : '启用'
  Modal.confirm({
    title: `确认${action}预案`,
    content: `确定要${action}预案"${record.name}"吗？`,
    onOk: () => {
      record.status = record.status === 'enabled' ? 'disabled' : 'enabled'
      message.success(`预案${action}成功`)
    }
  })
}

/**
 * 删除预案
 */
const deletePlan = (record: PlanData) => {
  Modal.confirm({
    title: '确认删除预案',
    content: `确定要删除预案"${record.name}"吗？此操作不可恢复。`,
    onOk: () => {
      const index = planList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        planList.value.splice(index, 1)
        message.success('预案删除成功')
      }
    }
  })
}

/**
 * 批量启用
 */
const handleBatchEnable = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要启用的预案')
    return
  }
  
  Modal.confirm({
    title: '确认批量启用',
    content: `确定要启用选中的 ${selectedRowKeys.value.length} 个预案吗？`,
    onOk: () => {
      planList.value.forEach(plan => {
        if (selectedRowKeys.value.includes(plan.id)) {
          plan.status = 'enabled'
        }
      })
      selectedRowKeys.value = []
      message.success('批量启用成功')
    }
  })
}

/**
 * 处理弹窗确认
 */
const handleModalOk = () => {
  formRef.value?.validate().then(() => {
    if (isEdit.value) {
      // 编辑预案
      const index = planList.value.findIndex(item => item.id === selectedPlan.value.id)
      if (index > -1) {
        Object.assign(planList.value[index], {
          ...formData,
          updateTime: new Date().toLocaleString()
        })
        message.success('预案更新成功')
      }
    } else {
      // 新建预案
      const newPlan: PlanData = {
        id: Date.now().toString(),
        ...formData,
        status: 'disabled',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      planList.value.unshift(newPlan)
      message.success('预案创建成功')
    }
    modalVisible.value = false
  })
}

/**
 * 处理弹窗取消
 */
const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: '',
    priority: '',
    scenarios: '',
    resources: '',
    steps: '',
    remark: ''
  })
  formRef.value?.resetFields()
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 实现分页逻辑
}

// 组件挂载时初始化数据
onMounted(() => {
  // 初始化数据
  pagination.total = planList.value.length
})
</script>

<style lang="less" scoped>
.dispatch-plan-management {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    text-align: center;

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1f1f1f;
      margin-bottom: 8px;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  .function-area {
    margin-bottom: 24px;

    .function-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
      }

      .statistic-value {
        font-size: 32px;
        font-weight: 600;
        color: #1890ff;
        margin: 16px 0 8px;
      }

      .statistic-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .operation-area {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .plan-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 600;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f5f5;
  }

  :deep(.ant-btn-link) {
    padding: 0;
    height: auto;
    line-height: 1;
  }

  :deep(.ant-modal-header) {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-descriptions-item-label) {
    font-weight: 600;
    background: #fafafa;
  }
}
</style>

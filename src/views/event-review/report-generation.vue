<template>
  <div class="report-generation">
    <div class="page-header">
      <h2>报告生成</h2>
      <p>标准化事件分析报告，支持多种格式导出和模板定制</p>
    </div>

    <!-- 报告概览 -->
    <div class="report-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper total">
                <FileTextOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ reportStats.totalReports }}</div>
                <div class="label">总报告数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper completed">
                <CheckCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ reportStats.completedReports }}</div>
                <div class="label">已完成</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper processing">
                <ClockCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ reportStats.processingReports }}</div>
                <div class="label">生成中</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper templates">
                <BookOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ reportStats.availableTemplates }}</div>
                <div class="label">可用模板</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 报告创建区域 -->
    <div class="report-creation">
      <a-card title="创建新报告" class="creation-card">
        <template #extra>
          <a-button type="primary" @click="createReport">
            <PlusOutlined />
            创建报告
          </a-button>
        </template>

        <a-form layout="vertical" :model="reportForm" @finish="handleCreateReport">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="报告标题" name="title" :rules="[{ required: true, message: '请输入报告标题' }]">
                <a-input
                  v-model:value="reportForm.title"
                  placeholder="请输入报告标题"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="报告类型" name="type" :rules="[{ required: true, message: '请选择报告类型' }]">
                <a-select
                  v-model:value="reportForm.type"
                  placeholder="请选择报告类型"
                  :options="reportTypeOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="报告模板" name="template" :rules="[{ required: true, message: '请选择报告模板' }]">
                <a-select
                  v-model:value="reportForm.template"
                  placeholder="请选择报告模板"
                  :options="templateOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="事件范围" name="eventRange">
                <a-range-picker
                  v-model:value="reportForm.eventRange"
                  :show-time="true"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="['开始时间', '结束时间']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="事件类型" name="eventTypes">
                <a-select
                  v-model:value="reportForm.eventTypes"
                  placeholder="请选择事件类型"
                  mode="multiple"
                  :options="eventTypeOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="输出格式" name="outputFormat">
                <a-select
                  v-model:value="reportForm.outputFormat"
                  placeholder="请选择输出格式"
                  mode="multiple"
                  :options="outputFormatOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="报告描述" name="description">
                <a-textarea
                  v-model:value="reportForm.description"
                  :rows="3"
                  placeholder="请输入报告描述"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="包含内容" name="includeContent">
                <a-checkbox-group v-model:value="reportForm.includeContent">
                  <a-checkbox value="summary">事件摘要</a-checkbox>
                  <a-checkbox value="analysis">详细分析</a-checkbox>
                  <a-checkbox value="evidence">证据材料</a-checkbox>
                  <a-checkbox value="recommendations">改进建议</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="creating">
                    开始生成
                  </a-button>
                  <a-button @click="resetForm">
                    重置
                  </a-button>
                  <a-button @click="previewReport">
                    预览
                  </a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>

    <!-- 报告管理区域 -->
    <div class="report-management">
      <a-card title="报告管理" class="management-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshReports">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="batchExport">
              <DownloadOutlined />
              批量导出
            </a-button>
            <a-button @click="manageTemplates">
              <SettingOutlined />
              模板管理
            </a-button>
          </a-space>
        </template>

        <!-- 报告列表 -->
        <a-table
          :columns="reportColumns"
          :data-source="reportList"
          :pagination="pagination"
          :loading="tableLoading"
          row-key="id"
          @change="handleTableChange"
          :row-selection="rowSelection"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getReportTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getReportStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <a-progress
                :percent="record.progress"
                :status="record.progress === 100 ? 'success' : 'active'"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewReport(record)">
                  查看
                </a-button>
                <a-button size="small" @click="downloadReport(record)">
                  下载
                </a-button>
                <a-button size="small" @click="editReport(record)">
                  编辑
                </a-button>
                <a-button size="small" danger @click="deleteReport(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 模板管理区域 -->
    <div class="template-management">
      <a-card title="报告模板管理" class="template-card">
        <template #extra>
          <a-button type="primary" @click="createTemplate">
            <PlusOutlined />
            创建模板
          </a-button>
        </template>

        <a-row :gutter="16">
          <a-col :span="8" v-for="template in templateList" :key="template.id">
            <a-card size="small" class="template-item">
              <template #title>
                <div class="template-header">
                  <span>{{ template.name }}</span>
                  <a-tag :color="template.status === 'active' ? 'success' : 'default'">
                    {{ template.status === 'active' ? '启用' : '禁用' }}
                  </a-tag>
                </div>
              </template>
              <template #extra>
                <a-dropdown>
                  <a-button type="text" size="small">
                    <EllipsisOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="editTemplate(template)">
                        <EditOutlined />
                        编辑
                      </a-menu-item>
                      <a-menu-item @click="duplicateTemplate(template)">
                        <CopyOutlined />
                        复制
                      </a-menu-item>
                      <a-menu-item @click="toggleTemplate(template)">
                        <PoweroffOutlined />
                        {{ template.status === 'active' ? '禁用' : '启用' }}
                      </a-menu-item>
                      <a-menu-item @click="deleteTemplate(template)" danger>
                        <DeleteOutlined />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </template>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-meta">
                <span>类型: {{ template.type }}</span>
                <span>创建时间: {{ template.createTime }}</span>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 报告预览模态框 -->
    <a-modal
      v-model:open="previewVisible"
      title="报告预览"
      width="1000px"
      :footer="null"
    >
      <div class="report-preview">
        <div class="preview-header">
          <h3>{{ reportForm.title || '报告标题' }}</h3>
          <p>{{ reportForm.description || '报告描述' }}</p>
        </div>
        
        <div class="preview-content">
          <a-tabs v-model:activeKey="previewTab">
            <a-tab-pane key="summary" tab="事件摘要">
              <div class="preview-section">
                <h4>事件摘要</h4>
                <p>这里是事件摘要的预览内容...</p>
              </div>
            </a-tab-pane>
            <a-tab-pane key="analysis" tab="详细分析">
              <div class="preview-section">
                <h4>详细分析</h4>
                <p>这里是详细分析的预览内容...</p>
              </div>
            </a-tab-pane>
            <a-tab-pane key="evidence" tab="证据材料">
              <div class="preview-section">
                <h4>证据材料</h4>
                <p>这里是证据材料的预览内容...</p>
              </div>
            </a-tab-pane>
            <a-tab-pane key="recommendations" tab="改进建议">
              <div class="preview-section">
                <h4>改进建议</h4>
                <p>这里是改进建议的预览内容...</p>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined,
  PlusOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined,
  EditOutlined, CopyOutlined, PoweroffOutlined, DeleteOutlined, EllipsisOutlined
} from '@ant-design/icons-vue'

// 报告统计
const reportStats = ref({
  totalReports: 1247,
  completedReports: 1189,
  processingReports: 34,
  availableTemplates: 28
})

// 报告表单
const reportForm = reactive({
  title: '',
  type: undefined,
  template: undefined,
  eventRange: [],
  eventTypes: [],
  outputFormat: ['pdf'],
  description: '',
  includeContent: ['summary', 'analysis']
})

// 创建状态
const creating = ref(false)
const tableLoading = ref(false)
const previewVisible = ref(false)
const previewTab = ref('summary')

// 表格数据
const reportList = ref([])
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

// 模板列表
const templateList = ref([])

// 选项数据
const reportTypeOptions = [
  { label: '事件分析报告', value: 'event-analysis' },
  { label: '月度总结报告', value: 'monthly-summary' },
  { label: '年度总结报告', value: 'annual-summary' },
  { label: '专项调查报告', value: 'special-investigation' },
  { label: '风险评估报告', value: 'risk-assessment' },
  { label: '事故调查报告', value: 'accident-investigation' },
  { label: '安全评估报告', value: 'safety-assessment' },
  { label: '应急响应报告', value: 'emergency-response' },
  { label: '预防措施报告', value: 'prevention-measures' },
  { label: '整改建议报告', value: 'improvement-suggestions' },
  { label: '统计分析报告', value: 'statistical-analysis' },
  { label: '趋势预测报告', value: 'trend-prediction' },
  { label: '对比分析报告', value: 'comparative-analysis' },
  { label: '案例研究报告', value: 'case-study' },
  { label: '技术评估报告', value: 'technical-assessment' },
  { label: '合规性报告', value: 'compliance-report' },
  { label: '质量评估报告', value: 'quality-assessment' },
  { label: '成本分析报告', value: 'cost-analysis' },
  { label: '效益评估报告', value: 'benefit-assessment' },
  { label: '环境影响报告', value: 'environmental-impact' },
  { label: '社会影响报告', value: 'social-impact' }
]

const templateOptions = [
  { label: '标准事件报告模板', value: 'standard-event' },
  { label: '月度总结模板', value: 'monthly-summary' },
  { label: '年度总结模板', value: 'annual-summary' },
  { label: '专项调查模板', value: 'special-investigation' },
  { label: '风险评估模板', value: 'risk-assessment' },
  { label: '事故调查标准模板', value: 'accident-standard' },
  { label: '安全评估专业模板', value: 'safety-professional' },
  { label: '应急响应快速模板', value: 'emergency-rapid' },
  { label: '预防措施详细模板', value: 'prevention-detailed' },
  { label: '整改建议执行模板', value: 'improvement-execution' },
  { label: '统计分析图表模板', value: 'statistical-chart' },
  { label: '趋势预测分析模板', value: 'trend-prediction' },
  { label: '对比分析研究模板', value: 'comparative-research' },
  { label: '案例研究深度模板', value: 'case-study-deep' },
  { label: '技术评估专业模板', value: 'technical-professional' },
  { label: '合规性检查模板', value: 'compliance-check' },
  { label: '质量评估体系模板', value: 'quality-system' },
  { label: '成本分析经济模板', value: 'cost-economic' },
  { label: '效益评估综合模板', value: 'benefit-comprehensive' },
  { label: '环境影响评估模板', value: 'environmental-assessment' },
  { label: '社会影响分析模板', value: 'social-analysis' }
]

const eventTypeOptions = [
  { label: '船舶碰撞', value: '船舶碰撞' },
  { label: '船舶搁浅', value: '船舶搁浅' },
  { label: '火灾事故', value: '火灾事故' },
  { label: '人员落水', value: '人员落水' },
  { label: '货物泄漏', value: '货物泄漏' },
  { label: '航道堵塞', value: '航道堵塞' },
  { label: '船舶失控', value: '船舶失控' },
  { label: '锚链断裂', value: '锚链断裂' },
  { label: '船舶沉没', value: '船舶沉没' },
  { label: '船舶倾覆', value: '船舶倾覆' },
  { label: '船舶进水', value: '船舶进水' },
  { label: '船舶触礁', value: '船舶触礁' },
  { label: '船舶相撞', value: '船舶相撞' },
  { label: '船舶翻船', value: '船舶翻船' },
  { label: '船舶爆炸', value: '船舶爆炸' },
  { label: '船舶污染', value: '船舶污染' },
  { label: '船舶走私', value: '船舶走私' },
  { label: '船舶偷渡', value: '船舶偷渡' },
  { label: '船舶非法捕捞', value: '船舶非法捕捞' },
  { label: '船舶非法倾倒', value: '船舶非法倾倒' },
  { label: '船舶非法锚泊', value: '船舶非法锚泊' },
  { label: '船舶超速行驶', value: '船舶超速行驶' },
  { label: '船舶违规穿越', value: '船舶违规穿越' },
  { label: '船舶违规停泊', value: '船舶违规停泊' },
  { label: '船舶违规作业', value: '船舶违规作业' }
]

const outputFormatOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Word', value: 'word' },
  { label: 'Excel', value: 'excel' },
  { label: 'HTML', value: 'html' },
  { label: 'PowerPoint', value: 'powerpoint' },
  { label: 'TXT', value: 'txt' },
  { label: 'RTF', value: 'rtf' },
  { label: 'XML', value: 'xml' },
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'LaTeX', value: 'latex' },
  { label: 'EPUB', value: 'epub' },
  { label: 'MOBI', value: 'mobi' },
  { label: 'AZW3', value: 'azw3' }
]

// 表格列定义
const reportColumns = [
  { title: '报告标题', dataIndex: 'title', key: 'title', width: 200 },
  { title: '报告类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 120 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 方法
const createReport = () => {
  // 重置表单
  Object.keys(reportForm).forEach(key => {
    if (Array.isArray(reportForm[key])) {
      reportForm[key] = []
    } else {
      reportForm[key] = ''
    }
  })
  reportForm.includeContent = ['summary', 'analysis']
  reportForm.outputFormat = ['pdf']
}

const handleCreateReport = () => {
  creating.value = true
  
  // 模拟报告创建过程
  setTimeout(() => {
    const newReport = {
      id: `RPT${Date.now()}`,
      title: reportForm.title,
      type: reportForm.type,
      createTime: new Date().toLocaleString(),
      status: '生成中',
      progress: 0
    }
    
    reportList.value.unshift(newReport)
    pagination.total++
    
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      const report = reportList.value.find(r => r.id === newReport.id)
      if (report && report.progress < 100) {
        report.progress += 20
        if (report.progress >= 100) {
          report.status = '已完成'
          clearInterval(progressTimer)
        }
      }
    }, 1000)
    
    creating.value = false
    message.success('报告创建成功，正在生成中...')
  }, 2000)
}

const resetForm = () => {
  createReport()
}

const previewReport = () => {
  if (!reportForm.title) {
    message.warning('请先填写报告标题')
    return
  }
  previewVisible.value = true
}

const refreshReports = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    message.success('报告列表已刷新')
  }, 1000)
}

const batchExport = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导出的报告')
    return
  }
  message.success(`正在批量导出 ${selectedRowKeys.value.length} 个报告...`)
}

const manageTemplates = () => {
  message.info('模板管理功能开发中...')
}

const viewReport = (record: any) => {
  message.info(`查看报告：${record.title}`)
}

const downloadReport = (record: any) => {
  if (record.status !== '已完成') {
    message.warning('报告尚未生成完成，无法下载')
    return
  }
  message.success(`正在下载报告：${record.title}`)
}

const editReport = (record: any) => {
  message.info(`编辑报告：${record.title}`)
}

const deleteReport = (record: any) => {
  message.success(`删除报告：${record.title}`)
  reportList.value = reportList.value.filter(item => item.id !== record.id)
  pagination.total--
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const createTemplate = () => {
  message.info('创建模板功能开发中...')
}

const editTemplate = (template: any) => {
  message.info(`编辑模板：${template.name}`)
}

const duplicateTemplate = (template: any) => {
  message.success(`复制模板：${template.name}`)
}

const toggleTemplate = (template: any) => {
  template.status = template.status === 'active' ? 'inactive' : 'active'
  message.success(`模板 ${template.name} 已${template.status === 'active' ? '启用' : '禁用'}`)
}

const deleteTemplate = (template: any) => {
  message.success(`删除模板：${template.name}`)
  templateList.value = templateList.value.filter(item => item.id !== template.id)
}

// 获取标签颜色
const getReportTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'event-analysis': 'blue',
    'monthly-summary': 'green',
    'annual-summary': 'purple',
    'special-investigation': 'orange',
    'risk-assessment': 'red',
    'accident-investigation': 'volcano',
    'safety-assessment': 'cyan',
    'emergency-response': 'magenta',
    'prevention-measures': 'lime',
    'improvement-suggestions': 'geekblue',
    'statistical-analysis': 'gold',
    'trend-prediction': 'pink',
    'comparative-analysis': 'orange',
    'case-study': 'green',
    'technical-assessment': 'blue',
    'compliance-report': 'purple',
    'quality-assessment': 'cyan',
    'cost-analysis': 'volcano',
    'benefit-assessment': 'magenta',
    'environmental-impact': 'lime',
    'social-impact': 'geekblue'
  }
  return colorMap[type] || 'default'
}

const getReportStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '已完成': 'success',
    '生成中': 'processing',
    '失败': 'error',
    '已取消': 'default'
  }
  return colorMap[status] || 'default'
}

// 初始化数据
onMounted(() => {
  console.log('报告生成页面已加载')
  
  // 模拟报告列表数据
  reportList.value = [
    {
      id: 'RPT001',
      title: '4月事件分析报告',
      type: 'event-analysis',
      createTime: '2025-08-15 14:30:25',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT002',
      title: '3月月度总结报告',
      type: 'monthly-summary',
      createTime: '2025-08-01 09:15:30',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT003',
      title: '船舶碰撞专项调查报告',
      type: 'special-investigation',
      createTime: '2025-08-15 16:45:12',
      status: '生成中',
      progress: 60
    },
    {
      id: 'RPT004',
      title: '船舶搁浅事故调查报告',
      type: 'accident-investigation',
      createTime: '2025-08-16 08:20:15',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT005',
      title: '火灾事故应急响应报告',
      type: 'emergency-response',
      createTime: '2025-08-16 10:45:33',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT006',
      title: '人员落水救援分析报告',
      type: 'case-study',
      createTime: '2025-08-16 12:30:18',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT007',
      title: '货物泄漏环境影响报告',
      type: 'environmental-impact',
      createTime: '2025-08-16 14:15:42',
      status: '生成中',
      progress: 80
    },
    {
      id: 'RPT008',
      title: '航道堵塞风险评估报告',
      type: 'risk-assessment',
      createTime: '2025-08-16 16:00:25',
      status: '生成中',
      progress: 45
    },
    {
      id: 'RPT009',
      title: '船舶失控技术评估报告',
      type: 'technical-assessment',
      createTime: '2025-08-16 18:30:10',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT010',
      title: '锚链断裂预防措施报告',
      type: 'prevention-measures',
      createTime: '2025-08-16 20:45:55',
      status: '已完成',
      progress: 100
    },
    {
      id: 'RPT011',
      title: '船舶沉没专项调查报告',
      type: 'special-investigation',
      createTime: '2025-08-17 02:15:30',
      status: '生成中',
      progress: 30
    },
    {
      id: 'RPT012',
      title: '船舶倾覆安全评估报告',
      type: 'safety-assessment',
      createTime: '2025-08-17 04:30:45',
      status: '已完成',
      progress: 100
    }
  ]
  
  pagination.total = reportList.value.length
  
  // 模拟模板列表数据
  templateList.value = [
    {
      id: 'TPL001',
      name: '标准事件报告模板',
      description: '适用于一般事件分析的标准化模板',
      type: '事件分析',
      status: 'active',
      createTime: '2025-08-26'
    },
    {
      id: 'TPL002',
      name: '月度总结模板',
      description: '月度事件统计和趋势分析模板',
      type: '月度总结',
      status: 'active',
      createTime: '2025-08-20'
    },
    {
      id: 'TPL003',
      name: '专项调查模板',
      description: '重大事件专项调查分析模板',
      type: '专项调查',
      status: 'inactive',
      createTime: '2025-08-01'
    },
    {
      id: 'TPL004',
      name: '事故调查标准模板',
      description: '海事事故调查的标准格式模板',
      type: '事故调查',
      status: 'active',
      createTime: '2025-08-15'
    },
    {
      id: 'TPL005',
      name: '安全评估专业模板',
      description: '船舶安全评估的专业分析模板',
      type: '安全评估',
      status: 'active',
      createTime: '2025-08-20'
    },
    {
      id: 'TPL006',
      name: '应急响应快速模板',
      description: '紧急事件快速响应报告模板',
      type: '应急响应',
      status: 'active',
      createTime: '2025-08-01'
    },
    {
      id: 'TPL007',
      name: '预防措施详细模板',
      description: '事故预防措施详细分析模板',
      type: '预防措施',
      status: 'active',
      createTime: '2025-08-15'
    },
    {
      id: 'TPL008',
      name: '整改建议执行模板',
      description: '问题整改建议执行跟踪模板',
      type: '整改建议',
      status: 'active',
      createTime: '2025-08-20'
    },
    {
      id: 'TPL009',
      name: '统计分析图表模板',
      description: '数据统计分析图表展示模板',
      type: '统计分析',
      status: 'active',
      createTime: '2025-08-01'
    },
    {
      id: 'TPL010',
      name: '趋势预测分析模板',
      description: '事件趋势预测分析报告模板',
      type: '趋势预测',
      status: 'active',
      createTime: '2025-08-05'
    },
    {
      id: 'TPL011',
      name: '对比分析研究模板',
      description: '多维度对比分析研究模板',
      type: '对比分析',
      status: 'inactive',
      createTime: '2025-08-10'
    },
    {
      id: 'TPL012',
      name: '案例研究深度模板',
      description: '典型案例深度分析研究模板',
      type: '案例研究',
      status: 'active',
      createTime: '2025-08-12'
    }
  ]
})
</script>

<style lang="less" scoped>
.report-generation {
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

  .report-overview {
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
          &.completed { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.processing { background: linear-gradient(135deg, #fa8c16, #d46b08); }
          &.templates { background: linear-gradient(135deg, #722ed1, #531dab); }
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

  .report-creation {
    margin-bottom: 24px;

    .creation-card {
      .ant-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .report-management {
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

  .template-management {
    .template-card {
      .template-item {
        margin-bottom: 16px;

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .template-description {
          margin: 8px 0;
          color: #595959;
          font-size: 14px;
        }

        .template-meta {
          font-size: 12px;
          color: #8c8c8c;

          span {
            display: block;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}

// 报告预览样式
.report-preview {
  .preview-header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #8c8c8c;
    }
  }

  .preview-content {
    .preview-section {
      h4 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #595959;
        line-height: 1.6;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .report-generation {
    padding: 16px;

    .report-overview,
    .report-creation {
      .ant-col {
        margin-bottom: 16px;
      }
    }

    .template-management {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="statistical-analysis">
    <div class="page-header">
      <h2>统计分析</h2>
      <p>多维度统计分析和报表，包含时间、地理、船舶、环境等维度分析</p>
    </div>

    <!-- 统计概览 -->
    <div class="analysis-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="总事件数"
              :value="analysisStats.totalEvents"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <BarChartOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="本月事件"
              :value="analysisStats.monthlyEvents"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <LineChartOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="趋势变化"
              :value="analysisStats.trendRate"
              :value-style="{ color: '#fa8c16' }"
              suffix="%"
            >
              <template #suffix>
                <RiseOutlined style="color: #fa8c16; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="风险等级"
              :value="analysisStats.riskLevel"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <WarningOutlined style="color: #ff4d4f; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日事件"
              :value="analysisStats.todayEvents"
              :value-style="{ color: '#722ed1' }"
            >
              <template #suffix>
                <ClockCircleOutlined style="color: #722ed1; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="严重事件"
              :value="analysisStats.criticalEvents"
              :value-style="{ color: '#cf1322' }"
            >
              <template #suffix>
                <WarningOutlined style="color: #cf1322; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="已解决"
              :value="analysisStats.resolvedEvents"
              :value-style="{ color: '#13c2c2' }"
            >
              <template #suffix>
                <FileTextOutlined style="color: #13c2c2; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="满意度"
              :value="analysisStats.satisfactionRate"
              :value-style="{ color: '#eb2f96' }"
              suffix="%"
            >
              <template #suffix>
                <RiseOutlined style="color: #eb2f96; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 图表分析区域 -->
    <div class="chart-analysis">
      <a-row :gutter="16">
        <!-- 事件类型分布 -->
        <a-col :span="12">
          <a-card title="事件类型分布" class="chart-card">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="eventTypeChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-card>
        </a-col>

        <!-- 事件趋势分析 -->
        <a-col :span="12">
          <a-card title="事件趋势分析" class="chart-card">
            <div class="chart-container">
              <a-spin :spinning="chartLoading" tip="图表加载中...">
                <div ref="eventTrendChartRef" class="chart-wrapper"></div>
              </a-spin>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 详细统计分析 -->
    <div class="detailed-analysis">
      <a-card title="详细统计分析" class="analysis-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshAnalysis">
              <ReloadOutlined />
              刷新数据
            </a-button>
            <a-button type="primary" @click="generateReport">
              <FileTextOutlined />
              生成报告
            </a-button>
            <a-button @click="exportData">
              <DownloadOutlined />
              导出数据
            </a-button>
          </a-space>
        </template>
        
        <a-tabs v-model:activeKey="activeTab">
          <!-- 时间维度分析 -->
          <a-tab-pane key="time" tab="时间维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="8">
                  <h4>按小时分布</h4>
                  <div class="time-distribution">
                    <div class="time-item">
                      <span>00-06时</span>
                      <a-progress :percent="15" size="small" />
                    </div>
                    <div class="time-item">
                      <span>06-12时</span>
                      <a-progress :percent="35" size="small" />
                    </div>
                    <div class="time-item">
                      <span>12-18时</span>
                      <a-progress :percent="30" size="small" />
                    </div>
                    <div class="time-item">
                      <span>18-24时</span>
                      <a-progress :percent="20" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <h4>按星期分布</h4>
                  <div class="week-distribution">
                    <div class="week-item">
                      <span>周一</span>
                      <a-progress :percent="18" size="small" />
                    </div>
                    <div class="week-item">
                      <span>周二</span>
                      <a-progress :percent="22" size="small" />
                    </div>
                    <div class="week-item">
                      <span>周三</span>
                      <a-progress :percent="20" size="small" />
                    </div>
                    <div class="week-item">
                      <span>周四</span>
                      <a-progress :percent="16" size="small" />
                    </div>
                    <div class="week-item">
                      <span>周五</span>
                      <a-progress :percent="24" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <h4>按月份分布</h4>
                  <div class="month-distribution">
                    <div class="month-item">
                      <span>1月</span>
                      <a-progress :percent="15" size="small" />
                    </div>
                    <div class="month-item">
                      <span>2月</span>
                      <a-progress :percent="12" size="small" />
                    </div>
                    <div class="month-item">
                      <span>3月</span>
                      <a-progress :percent="18" size="small" />
                    </div>
                    <div class="month-item">
                      <span>4月</span>
                      <a-progress :percent="22" size="small" />
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 地理维度分析 -->
          <a-tab-pane key="location" tab="地理维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>按区域分布</h4>
                  <a-table
                    :columns="locationColumns"
                    :data-source="locationData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
                <a-col :span="12">
                  <h4>按航道分布</h4>
                  <a-table
                    :columns="waterwayColumns"
                    :data-source="waterwayData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 船舶维度分析 -->
          <a-tab-pane key="vessel" tab="船舶维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>按船舶类型</h4>
                  <a-table
                    :columns="vesselTypeColumns"
                    :data-source="vesselTypeData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
                <a-col :span="12">
                  <h4>按船舶吨位</h4>
                  <a-table
                    :columns="tonnageColumns"
                    :data-source="tonnageData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 环境维度分析 -->
          <a-tab-pane key="weather" tab="环境维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>按天气条件</h4>
                  <div class="weather-distribution">
                    <div class="weather-item">
                      <span>晴天</span>
                      <a-progress :percent="45" size="small" />
                    </div>
                    <div class="weather-item">
                      <span>多云</span>
                      <a-progress :percent="25" size="small" />
                    </div>
                    <div class="weather-item">
                      <span>雨天</span>
                      <a-progress :percent="20" size="small" />
                    </div>
                    <div class="weather-item">
                      <span>雾天</span>
                      <a-progress :percent="10" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <h4>按潮汐条件</h4>
                  <div class="tide-distribution">
                    <div class="tide-item">
                      <span>高潮</span>
                      <a-progress :percent="40" size="small" />
                    </div>
                    <div class="tide-item">
                      <span>低潮</span>
                      <a-progress :percent="35" size="small" />
                    </div>
                    <div class="tide-item">
                      <span>涨潮</span>
                      <a-progress :percent="15" size="small" />
                    </div>
                    <div class="tide-item">
                      <span>退潮</span>
                      <a-progress :percent="10" size="small" />
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>

          <!-- 风险分析 -->
          <a-tab-pane key="risk" tab="风险分析">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>风险等级分布</h4>
                  <div class="risk-distribution">
                    <div class="risk-item">
                      <span>特别重大</span>
                      <a-progress :percent="5" size="small" :stroke-color="'#ff4d4f'" />
                    </div>
                    <div class="risk-item">
                      <span>重大</span>
                      <a-progress :percent="15" size="small" :stroke-color="'#ff7a45'" />
                    </div>
                    <div class="risk-item">
                      <span>较大</span>
                      <a-progress :percent="30" size="small" :stroke-color="'#ffa940'" />
                    </div>
                    <div class="risk-item">
                      <span>一般</span>
                      <a-progress :percent="50" size="small" :stroke-color="'#52c41a'" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <h4>风险趋势分析</h4>
                  <div class="risk-trend">
                    <div class="trend-item">
                      <span>高风险时段</span>
                      <a-tag color="red">06:00-12:00</a-tag>
                    </div>
                    <div class="trend-item">
                      <span>中风险时段</span>
                      <a-tag color="orange">12:00-18:00</a-tag>
                    </div>
                    <div class="trend-item">
                      <span>低风险时段</span>
                      <a-tag color="green">18:00-06:00</a-tag>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 统计报表 -->
    <div class="statistical-reports">
      <a-card title="统计报表" class="reports-card">
        <template #extra>
          <a-space>
            <a-button @click="createCustomReport">
              <PlusOutlined />
              创建自定义报表
            </a-button>
            <a-button @click="scheduleReport">
              <ClockCircleOutlined />
              定时报表
            </a-button>
          </a-space>
        </template>

        <a-table
          :columns="reportColumns"
          :data-source="reportList"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getReportStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  BarChartOutlined, LineChartOutlined, RiseOutlined, WarningOutlined,
  PieChartOutlined, ReloadOutlined, FileTextOutlined, DownloadOutlined,
  PlusOutlined, ClockCircleOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

// 统计分析概览
const analysisStats = ref({
  totalEvents: 1256,
  monthlyEvents: 89,
  trendRate: 12.5,
  riskLevel: '中等',
  todayEvents: 12,
  weeklyEvents: 67,
  criticalEvents: 8,
  resolvedEvents: 1189,
  pendingEvents: 67,
  avgResponseTime: 45,
  satisfactionRate: 94.2
})

// 标签页控制
const activeTab = ref('time')

// 图表相关变量
const chartLoading = ref(false)
const eventTypeChartRef = ref<HTMLElement>()
const eventTrendChartRef = ref<HTMLElement>()

const eventTypeChart = ref<echarts.ECharts>()
const eventTrendChart = ref<echarts.ECharts>()

// 表格列定义
const locationColumns = [
  { title: '区域', dataIndex: 'area', key: 'area' },
  { title: '事件数量', dataIndex: 'count', key: 'count' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' }
]

const waterwayColumns = [
  { title: '航道', dataIndex: 'waterway', key: 'waterway' },
  { title: '事件数量', dataIndex: 'count', key: 'count' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' }
]

const vesselTypeColumns = [
  { title: '船舶类型', dataIndex: 'type', key: 'type' },
  { title: '事件数量', dataIndex: 'count', key: 'count' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' }
]

const tonnageColumns = [
  { title: '吨位范围', dataIndex: 'range', key: 'range' },
  { title: '事件数量', dataIndex: 'count', key: 'count' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' }
]

const reportColumns = [
  { title: '报表名称', dataIndex: 'name', key: 'name' },
  { title: '报表类型', dataIndex: 'type', key: 'type' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' }
]

// 表格数据
const locationData = ref([
  { area: '济宁港主码头', count: 45, percentage: '35%' },
  { area: '京杭大运河济宁段', count: 32, percentage: '25%' },
  { area: '济宁港锚地', count: 28, percentage: '22%' },
  { area: '济宁港集装箱堆场', count: 18, percentage: '14%' },
  { area: '济宁港船舶维修区', count: 8, percentage: '4%' }
])

const waterwayData = ref([
  { waterway: '京杭大运河主航道', count: 52, percentage: '40%' },
  { waterway: '济宁港进港航道', count: 38, percentage: '29%' },
  { waterway: '济宁港锚地', count: 25, percentage: '19%' },
  { waterway: '济宁港支航道', count: 14, percentage: '12%' }
])

const vesselTypeData = ref([
  { type: '集装箱船', count: 58, percentage: '45%' },
  { type: '散货船', count: 25, percentage: '19%' },
  { type: '油轮', count: 22, percentage: '17%' },
  { type: '客船', count: 15, percentage: '12%' },
  { type: '渔船', count: 8, percentage: '6%' },
  { type: '其他', count: 3, percentage: '1%' }
])

const tonnageData = ref([
  { range: '1000吨以下', count: 35, percentage: '27%' },
  { range: '1000-5000吨', count: 42, percentage: '33%' },
  { range: '5000-10000吨', count: 28, percentage: '22%' },
  { range: '10000-50000吨', count: 18, percentage: '14%' },
  { range: '50000吨以上', count: 6, percentage: '4%' }
])

const reportList = ref([
  {
    name: '月度事件统计报表',
    type: '月度报表',
    createTime: '2025-08-15',
    status: '已完成'
  },
  {
    name: '风险分析报告',
    type: '专项报告',
    createTime: '2025-08-14',
    status: '处理中'
  },
  {
    name: '年度总结报告',
    type: '年度报表',
    createTime: '2025-08-13',
    status: '已完成'
  },
  {
    name: '济宁港安全事件分析',
    type: '专项报告',
    createTime: '2025-08-12',
    status: '已完成'
  },
  {
    name: '京杭大运河通航分析',
    type: '专项报告',
    createTime: '2025-08-11',
    status: '已完成'
  },
  {
    name: '船舶碰撞事故统计',
    type: '专项报告',
    createTime: '2025-08-10',
    status: '已完成'
  },
  {
    name: '环境监测数据分析',
    type: '月度报表',
    createTime: '2025-08-09',
    status: '已完成'
  },
  {
    name: '应急响应效率评估',
    type: '专项报告',
    createTime: '2025-08-08',
    status: '已完成'
  },
  {
    name: '航道维护状况报告',
    type: '月度报表',
    createTime: '2025-08-07',
    status: '已完成'
  },
  {
    name: '安全培训效果评估',
    type: '专项报告',
    createTime: '2025-08-06',
    status: '已完成'
  }
])

/**
 * 初始化事件类型分布图表
 */
const initEventTypeChart = () => {
  if (!eventTypeChartRef.value) return
  
  chartLoading.value = true
  eventTypeChart.value = echarts.init(eventTypeChartRef.value, null, {
    renderer: 'canvas',
    useDirtyRect: true
  })
  
  // 设置图表主题
  echarts.registerTheme('custom', {
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
  })
  
  const option = {
    title: {
      text: '事件类型分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: [
          { value: 35, name: '船舶碰撞', itemStyle: { color: '#1890ff' } },
          { value: 25, name: '船舶搁浅', itemStyle: { color: '#52c41a' } },
          { value: 20, name: '火灾事故', itemStyle: { color: '#faad14' } },
          { value: 15, name: '设备故障', itemStyle: { color: '#ff4d4f' } },
          { value: 5, name: '其他', itemStyle: { color: '#722ed1' } }
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
  
  eventTypeChart.value.setOption(option)
  chartLoading.value = false
}

/**
 * 初始化事件趋势分析图表
 */
const initEventTrendChart = () => {
  if (!eventTrendChartRef.value) return
  
  chartLoading.value = true
  eventTrendChart.value = echarts.init(eventTrendChartRef.value, null, {
    renderer: 'canvas',
    useDirtyRect: true
  })
  
  // 设置图表主题
  echarts.registerTheme('custom', {
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
  })
  
  const option = {
    title: {
      text: '月度事件趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      data: ['事件数量', '严重事件'],
      bottom: 10,
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666'
      }
    },
    series: [
      {
        name: '事件数量',
        type: 'line',
        smooth: true,
        data: [15, 12, 18, 22, 25, 28, 30, 26, 24, 20, 18, 16],
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '严重事件',
        type: 'line',
        smooth: true,
        data: [2, 1, 3, 4, 5, 6, 7, 5, 4, 3, 2, 1],
        itemStyle: { color: '#ff4d4f' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
              { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  eventTrendChart.value.setOption(option)
  chartLoading.value = false
}

// 方法
const refreshAnalysis = () => {
  message.success('数据已刷新')
  // 重新初始化图表
  nextTick(() => {
    if (eventTypeChart.value) {
      eventTypeChart.value.dispose()
      eventTypeChart.value = undefined
    }
    if (eventTrendChart.value) {
      eventTrendChart.value.dispose()
      eventTrendChart.value = undefined
    }
    initEventTypeChart()
    initEventTrendChart()
  })
}

const generateReport = () => {
  message.success('分析报告生成中...')
  setTimeout(() => {
    message.success('分析报告已生成，可下载查看')
  }, 2000)
}

const exportData = () => {
  message.success('数据导出中...')
}

const createCustomReport = () => {
  message.info('创建自定义报表功能开发中...')
}

const scheduleReport = () => {
  message.info('定时报表功能开发中...')
}

const viewReport = (record: any) => {
  message.info(`查看报表：${record.name}`)
}

const downloadReport = (record: any) => {
  message.success(`正在下载报表：${record.name}`)
}

const editReport = (record: any) => {
  message.info(`编辑报表：${record.name}`)
}

const deleteReport = (record: any) => {
  message.success(`删除报表：${record.name}`)
  reportList.value = reportList.value.filter(item => item.name !== record.name)
}

// 获取标签颜色
const getReportStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '已完成': 'success',
    '处理中': 'processing',
    '待处理': 'default'
  }
  return colorMap[status] || 'default'
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('统计分析页面已加载')
  nextTick(() => {
    initEventTypeChart()
    initEventTrendChart()
  })
})
</script>

<style lang="less" scoped>
.statistical-analysis {
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

  .analysis-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .chart-analysis {
    margin-bottom: 24px;

    .chart-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .chart-container {
        .chart-wrapper {
          height: 300px;
          width: 100%;
        }
      }
    }
  }

  .detailed-analysis {
    margin-bottom: 24px;

    .analysis-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .tab-content {
        padding: 16px 0;

        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .time-distribution,
        .week-distribution,
        .month-distribution,
        .weather-distribution,
        .tide-distribution,
        .risk-distribution {
          .time-item,
          .week-item,
          .month-item,
          .weather-item,
          .tide-item,
          .risk-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

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

        .risk-trend {
          .trend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px;
            background: #fafafa;
            border-radius: 4px;

            span {
              font-size: 14px;
              color: #595959;
            }
          }
        }
      }
    }
  }

  .statistical-reports {
    .reports-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
  .statistical-analysis {
    padding: 16px;

    .analysis-overview,
    .chart-analysis {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="satisfaction-analysis">
    <div class="page-header">
      <h2>满意度分析</h2>
      <p>全面分析用户满意度，持续改进服务质量，提升用户体验</p>
    </div>

    <!-- 满意度概览 -->
    <div class="satisfaction-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper overall">
                <SmileOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ satisfactionStats.overallScore }}</div>
                <div class="label">整体满意度</div>
                <div class="trend">
                  <span :class="satisfactionStats.trend > 0 ? 'up' : 'down'">
                    {{ Math.abs(satisfactionStats.trend) }}%
                  </span>
                  较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper response">
                <ClockCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ satisfactionStats.responseRate }}</div>
                <div class="label">响应率</div>
                <div class="trend">
                  <span :class="satisfactionStats.responseTrend > 0 ? 'up' : 'down'">
                    {{ Math.abs(satisfactionStats.responseTrend) }}%
                  </span>
                  较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper resolution">
                <CheckCircleOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ satisfactionStats.resolutionRate }}</div>
                <div class="label">问题解决率</div>
                <div class="trend">
                  <span :class="satisfactionStats.resolutionTrend > 0 ? 'up' : 'down'">
                    {{ Math.abs(satisfactionStats.resolutionTrend) }}%
                  </span>
                  较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <div class="card-content">
              <div class="icon-wrapper feedback">
                <MessageOutlined />
              </div>
              <div class="stats">
                <div class="number">{{ satisfactionStats.feedbackCount }}</div>
                <div class="label">反馈数量</div>
                <div class="trend">
                  <span :class="satisfactionStats.feedbackTrend > 0 ? 'up' : 'down'">
                    {{ Math.abs(satisfactionStats.feedbackTrend) }}%
                  </span>
                  较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 满意度评分分布 -->
    <div class="score-distribution">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="满意度评分分布" class="chart-card">
            <div class="score-bars">
              <div class="score-item">
                <div class="score-label">
                  <span>非常满意 (5分)</span>
                  <span class="count">{{ scoreDistribution.excellent.count }}</span>
                </div>
                <a-progress 
                  :percent="scoreDistribution.excellent.percentage" 
                  :stroke-color="scoreColors.excellent"
                  :show-info="false"
                />
              </div>
              <div class="score-item">
                <div class="score-label">
                  <span>满意 (4分)</span>
                  <span class="count">{{ scoreDistribution.good.count }}</span>
                </div>
                <a-progress 
                  :percent="scoreDistribution.good.percentage" 
                  :stroke-color="scoreColors.good"
                  :show-info="false"
                />
              </div>
              <div class="score-item">
                <div class="score-label">
                  <span>一般 (3分)</span>
                  <span class="count">{{ scoreDistribution.average.count }}</span>
                </div>
                <a-progress 
                  :percent="scoreDistribution.average.percentage" 
                  :stroke-color="scoreColors.average"
                  :show-info="false"
                />
              </div>
              <div class="score-item">
                <div class="score-label">
                  <span>不满意 (2分)</span>
                  <span class="count">{{ scoreDistribution.poor.count }}</span>
                </div>
                <a-progress 
                  :percent="scoreDistribution.poor.percentage" 
                  :stroke-color="scoreColors.poor"
                  :show-info="false"
                />
              </div>
              <div class="score-item">
                <div class="score-label">
                  <span>非常不满意 (1分)</span>
                  <span class="count">{{ scoreDistribution.veryPoor.count }}</span>
                </div>
                <a-progress 
                  :percent="scoreDistribution.veryPoor.percentage" 
                  :stroke-color="scoreColors.veryPoor"
                  :show-info="false"
                />
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="满意度趋势分析" class="chart-card">
            <div class="trend-chart">
              <div class="chart-placeholder">
                <LineChartOutlined style="font-size: 48px; color: #1890ff;" />
                <p>折线图：月度满意度趋势</p>
                <div class="trend-data">
                  <div class="trend-item">
                    <span>1月</span>
                    <span class="score">4.2</span>
                  </div>
                  <div class="trend-item">
                    <span>2月</span>
                    <span class="score">4.3</span>
                  </div>
                  <div class="trend-item">
                    <span>3月</span>
                    <span class="score">4.1</span>
                  </div>
                  <div class="trend-item">
                    <span>4月</span>
                    <span class="score">4.5</span>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 详细分析 -->
    <div class="detailed-analysis">
      <a-card title="满意度详细分析" class="analysis-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshData">
              <ReloadOutlined />
              刷新数据
            </a-button>
            <a-button type="primary" @click="exportReport">
              <DownloadOutlined />
              导出报告
            </a-button>
          </a-space>
        </template>
        
        <a-tabs v-model:activeKey="activeTab">
          <!-- 服务维度分析 -->
          <a-tab-pane key="service" tab="服务维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="8">
                  <h4>响应速度</h4>
                  <div class="service-metrics">
                    <div class="metric-item">
                      <span>5分钟内</span>
                      <a-progress :percent="65" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>5-15分钟</span>
                      <a-progress :percent="25" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>15分钟以上</span>
                      <a-progress :percent="10" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <h4>问题解决质量</h4>
                  <div class="service-metrics">
                    <div class="metric-item">
                      <span>一次性解决</span>
                      <a-progress :percent="75" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>二次解决</span>
                      <a-progress :percent="20" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>多次解决</span>
                      <a-progress :percent="5" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <h4>服务态度</h4>
                  <div class="service-metrics">
                    <div class="metric-item">
                      <span>非常友好</span>
                      <a-progress :percent="80" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>友好</span>
                      <a-progress :percent="15" size="small" />
                    </div>
                    <div class="metric-item">
                      <span>一般</span>
                      <a-progress :percent="5" size="small" />
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 用户维度分析 -->
          <a-tab-pane key="user" tab="用户维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>按用户类型</h4>
                  <a-table
                    :columns="userTypeColumns"
                    :data-source="userTypeData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
                <a-col :span="12">
                  <h4>按使用频率</h4>
                  <a-table
                    :columns="usageFrequencyColumns"
                    :data-source="usageFrequencyData"
                    :pagination="false"
                    size="small"
                  />
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 时间维度分析 -->
          <a-tab-pane key="time" tab="时间维度">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <h4>按时间段</h4>
                  <div class="time-metrics">
                    <div class="time-item">
                      <span>工作时间 (9:00-18:00)</span>
                      <a-progress :percent="85" size="small" />
                    </div>
                    <div class="time-item">
                      <span>非工作时间</span>
                      <a-progress :percent="70" size="small" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <h4>按星期</h4>
                  <div class="week-metrics">
                    <div class="week-item">
                      <span>工作日</span>
                      <a-progress :percent="82" size="small" />
                    </div>
                    <div class="week-item">
                      <span>周末</span>
                      <a-progress :percent="75" size="small" />
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <!-- 反馈内容分析 -->
          <a-tab-pane key="feedback" tab="反馈内容">
            <div class="tab-content">
              <a-row :gutter="16">
                <a-col :span="24">
                  <h4>用户反馈关键词</h4>
                  <div class="keyword-tags">
                    <a-tag v-for="tag in feedbackKeywords" :key="tag.word" :color="tag.color">
                      {{ tag.word }} ({{ tag.count }})
                    </a-tag>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 24px;">
                <a-col :span="24">
                  <h4>典型反馈内容</h4>
                  <a-list
                    :data-source="typicalFeedback"
                    size="small"
                  >
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-list-item-meta>
                          <template #avatar>
                            <a-avatar :style="{ backgroundColor: item.type === 'positive' ? '#52c41a' : '#ff4d4f' }">
                              {{ item.type === 'positive' ? '👍' : '👎' }}
                            </a-avatar>
                          </template>
                          <template #title>
                            <span :style="{ color: item.type === 'positive' ? '#52c41a' : '#ff4d4f' }">
                              {{ item.title }}
                            </span>
                          </template>
                          <template #description>
                            <span>{{ item.content }}</span>
                            <div class="feedback-meta">
                              <span>{{ item.user }}</span>
                              <span>{{ item.time }}</span>
                            </div>
                          </template>
                        </a-list-item-meta>
                      </a-list-item>
                    </template>
                  </a-list>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 改进建议 -->
    <div class="improvement-suggestions">
      <a-card title="改进建议与行动计划" class="suggestion-card">
        <template #extra>
          <a-button type="primary" @click="addSuggestion">
            <PlusOutlined />
            添加建议
          </a-button>
        </template>
        
        <a-list
          :data-source="improvementSuggestions"
          size="large"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar :style="{ backgroundColor: item.priority === 'high' ? '#ff4d4f' : item.priority === 'medium' ? '#fa8c16' : '#52c41a' }">
                    {{ item.priority === 'high' ? 'H' : item.priority === 'medium' ? 'M' : 'L' }}
                  </a-avatar>
                </template>
                <template #title>
                  <span>{{ item.title }}</span>
                  <a-tag :color="item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'" style="margin-left: 8px;">
                    {{ item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级' }}
                  </a-tag>
                </template>
                <template #description>
                  <p>{{ item.description }}</p>
                  <div class="suggestion-meta">
                    <span>建议人: {{ item.suggester }}</span>
                    <span>预计完成时间: {{ item.expectedTime }}</span>
                    <span>状态: 
                      <a-tag :color="item.status === 'pending' ? 'default' : item.status === 'in-progress' ? 'processing' : 'success'">
                        {{ item.status === 'pending' ? '待处理' : item.status === 'in-progress' ? '进行中' : '已完成' }}
                      </a-tag>
                    </span>
                  </div>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-space>
                  <a-button size="small" @click="editSuggestion(item)">编辑</a-button>
                  <a-button size="small" type="primary" @click="updateStatus(item)">更新状态</a-button>
                </a-space>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SmileOutlined, ClockCircleOutlined, CheckCircleOutlined, MessageOutlined,
  LineChartOutlined, ReloadOutlined, DownloadOutlined, PlusOutlined
} from '@ant-design/icons-vue'

// 满意度统计概览
const satisfactionStats = ref({
  overallScore: 4.3,
  responseRate: 92,
  resolutionRate: 88,
  feedbackCount: 156,
  trend: 5.2,
  responseTrend: 3.1,
  resolutionTrend: 2.8,
  feedbackTrend: 12.5
})

// 评分分布
const scoreDistribution = ref({
  excellent: { count: 89, percentage: 57 },
  good: { count: 45, percentage: 29 },
  average: { count: 15, percentage: 10 },
  poor: { count: 4, percentage: 3 },
  veryPoor: { count: 3, percentage: 1 }
})

// 评分颜色
const scoreColors = reactive({
  excellent: '#52c41a',
  good: '#1890ff',
  average: '#fa8c16',
  poor: '#faad14',
  veryPoor: '#ff4d4f'
})

// 标签页控制
const activeTab = ref('service')

// 表格列定义
const userTypeColumns = [
  { title: '用户类型', dataIndex: 'type', key: 'type' },
  { title: '满意度', dataIndex: 'score', key: 'score' },
  { title: '反馈数量', dataIndex: 'count', key: 'count' }
]

const usageFrequencyColumns = [
  { title: '使用频率', dataIndex: 'frequency', key: 'frequency' },
  { title: '满意度', dataIndex: 'score', key: 'score' },
  { title: '用户数量', dataIndex: 'count', key: 'count' }
]

// 表格数据
const userTypeData = ref([
  { type: '船舶公司', score: 4.5, count: 45 },
  { type: '船员', score: 4.2, count: 78 },
  { type: '港口管理', score: 4.4, count: 23 },
  { type: '监管部门', score: 4.1, count: 10 }
])

const usageFrequencyData = ref([
  { frequency: '每日使用', score: 4.4, count: 89 },
  { frequency: '每周使用', score: 4.2, count: 45 },
  { frequency: '每月使用', score: 4.0, count: 22 }
])

// 反馈关键词
const feedbackKeywords = ref([
  { word: '响应快', count: 45, color: '#52c41a' },
  { word: '服务好', count: 38, color: '#52c41a' },
  { word: '专业', count: 32, color: '#1890ff' },
  { word: '界面友好', count: 28, color: '#52c41a' },
  { word: '功能完善', count: 25, color: '#52c41a' },
  { word: '操作简单', count: 22, color: '#52c41a' },
  { word: '需要改进', count: 18, color: '#fa8c16' },
  { word: '建议优化', count: 15, color: '#fa8c16' }
])

// 典型反馈
const typicalFeedback = ref([
  {
    type: 'positive',
    title: '系统响应速度很快',
    content: '使用体验很好，界面清晰，操作简单，能够快速找到需要的信息。',
    user: '张船长',
    time: '2025-08-15'
  },
  {
    type: 'positive',
    title: '功能设计很人性化',
    content: '各项功能都很实用，特别是视频监控和调度功能，大大提高了工作效率。',
    user: '李经理',
    time: '2025-08-14'
  },
  {
    type: 'negative',
    title: '部分功能需要优化',
    content: '建议增加更多的数据导出格式，方便我们进行数据分析。',
    user: '王主管',
    time: '2025-08-13'
  }
])

// 改进建议
const improvementSuggestions = ref([
  {
    title: '优化移动端体验',
    description: '根据用户反馈，移动端操作体验需要进一步优化，建议增加手势操作和触摸友好的界面元素。',
    priority: 'high',
    suggester: '产品经理',
    expectedTime: '2025-08-26',
    status: 'in-progress'
  },
  {
    title: '增加数据可视化功能',
    description: '用户希望有更多的图表和统计功能，建议增加自定义图表和报表功能。',
    priority: 'medium',
    suggester: '技术总监',
    expectedTime: '2025-08-15',
    status: 'pending'
  },
  {
    title: '完善帮助文档',
    description: '建议增加更详细的操作指南和常见问题解答，提升用户使用体验。',
    priority: 'low',
    suggester: '客服主管',
    expectedTime: '2025-05-15',
    status: 'completed'
  }
])

// 方法
const refreshData = () => {
  message.success('满意度数据已刷新')
}

const exportReport = () => {
  message.success('满意度分析报告导出中...')
  setTimeout(() => {
    message.success('报告已导出，可下载查看')
  }, 2000)
}

const addSuggestion = () => {
  message.info('添加改进建议功能开发中...')
}

const editSuggestion = (item: any) => {
  message.info(`编辑建议：${item.title}`)
}

const updateStatus = (item: any) => {
  message.info(`更新状态：${item.title}`)
}

onMounted(() => {
  console.log('满意度分析页面已加载')
})
</script>

<style lang="less" scoped>
.satisfaction-analysis {
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

  .satisfaction-overview {
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

          &.overall { background: linear-gradient(135deg, #52c41a, #389e0d); }
          &.response { background: linear-gradient(135deg, #1890ff, #096dd9); }
          &.resolution { background: linear-gradient(135deg, #722ed1, #531dab); }
          &.feedback { background: linear-gradient(135deg, #fa8c16, #d46b08); }
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
            margin-bottom: 4px;
          }

          .trend {
            font-size: 12px;
            color: #8c8c8c;

            .up {
              color: #52c41a;
              font-weight: 500;
            }

            .down {
              color: #ff4d4f;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .score-distribution {
    margin-bottom: 24px;

    .chart-card {
      .score-bars {
        .score-item {
          margin-bottom: 16px;

          .score-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
            color: #595959;

            .count {
              font-weight: 500;
              color: #262626;
            }
          }
        }
      }

      .trend-chart {
        .chart-placeholder {
          height: 300px;
          background: #f5f5f5;
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #8c8c8c;

          p {
            margin: 8px 0;
          }

          .trend-data {
            margin-top: 16px;

            .trend-item {
              display: flex;
              justify-content: space-between;
              width: 120px;
              margin-bottom: 8px;

              .score {
                font-weight: 500;
                color: #1890ff;
              }
            }
          }
        }
      }
    }
  }

  .detailed-analysis {
    margin-bottom: 24px;

    .analysis-card {
      .tab-content {
        padding: 16px 0;

        h4 {
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .service-metrics,
        .time-metrics,
        .week-metrics {
          .metric-item,
          .time-item,
          .week-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            span {
              width: 120px;
              font-size: 14px;
              color: #595959;
            }

            .ant-progress {
              flex: 1;
              margin-left: 16px;
            }
          }
        }

        .keyword-tags {
          .ant-tag {
            margin-bottom: 8px;
            font-size: 14px;
            padding: 4px 12px;
          }
        }

        .feedback-meta {
          margin-top: 8px;
          font-size: 12px;
          color: #8c8c8c;

          span {
            margin-right: 16px;
          }
        }
      }
    }
  }

  .improvement-suggestions {
    .suggestion-card {
      .suggestion-meta {
        margin-top: 8px;
        font-size: 12px;
        color: #8c8c8c;

        span {
          margin-right: 16px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .satisfaction-analysis {
    padding: 16px;

    .satisfaction-overview,
    .score-distribution {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="intelligent-routing">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>智能路由</h1>
      <p>基于智能算法的通讯路由管理，实现最优通讯路径选择</p>
    </div>

    <!-- 路由状态概览 -->
    <a-row :gutter="16" class="status-overview">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="路由节点"
            :value="statusData.routingNodes"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="活跃路由"
            :value="statusData.activeRoutes"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="路由成功率"
            :value="statusData.successRate"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均延迟"
            :value="statusData.avgLatency"
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>ms</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="16" class="main-content">
      <!-- 路由策略配置 -->
      <a-col :span="12">
        <a-card title="路由策略配置" class="strategy-config">
          <a-form layout="vertical">
            <a-form-item label="路由算法">
              <a-select v-model:value="strategyData.algorithm" placeholder="选择路由算法">
                <a-select-option value="shortest">最短路径</a-select-option>
                <a-select-option value="fastest">最快路径</a-select-option>
                <a-select-option value="reliable">最可靠路径</a-select-option>
                <a-select-option value="adaptive">自适应路由</a-select-option>
                <a-select-option value="load-balance">负载均衡</a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="优先级权重">
              <a-slider
                v-model:value="strategyData.priorityWeight"
                :min="0"
                :max="100"
                :marks="{ 0: '延迟优先', 50: '平衡', 100: '可靠性优先' }"
              />
            </a-form-item>

            <a-form-item label="路由策略">
              <a-checkbox-group v-model:value="strategyData.routingPolicies">
                <a-checkbox value="auto-failover">自动故障转移</a-checkbox>
                <a-checkbox value="load-balancing">负载均衡</a-checkbox>
                <a-checkbox value="qos-guarantee">QoS保证</a-checkbox>
                <a-checkbox value="bandwidth-optimization">带宽优化</a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="最大跳数">
              <a-input-number
                v-model:value="strategyData.maxHops"
                :min="1"
                :max="10"
                placeholder="最大路由跳数"
              />
            </a-form-item>

            <a-form-item label="超时时间(秒)">
              <a-input-number
                v-model:value="strategyData.timeout"
                :min="1"
                :max="60"
                placeholder="路由超时时间"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" @click="saveStrategy" :loading="saving">
                  保存策略
                </a-button>
                <a-button @click="resetStrategy">重置</a-button>
                <a-button @click="testStrategy">测试策略</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 路由规则管理 -->
      <a-col :span="12">
        <a-card title="路由规则管理" class="rule-management">
          <div class="rule-operations">
            <a-button type="primary" @click="addRule" style="margin-bottom: 16px">
              添加规则
            </a-button>
          </div>
          
          <a-table
            :columns="ruleColumns"
            :data-source="routingRules"
            :pagination="{ pageSize: 5 }"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-switch
                  v-model:checked="record.enabled"
                  size="small"
                  @change="toggleRule(record)"
                />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editRule(record)">
                    编辑
                  </a-button>
                  <a-popconfirm
                    title="确定要删除这条规则吗？"
                    @confirm="deleteRule(record)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 路由监控 -->
    <a-card title="路由监控" class="routing-monitor">
      <a-row :gutter="16">
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">路由拓扑</div>
            <div class="topology-placeholder">
              <div class="node center">中心节点</div>
              <div class="connections">
                <div class="connection-line" v-for="connection in topologyConnections" :key="connection.id">
                  <div class="line" :class="connection.status"></div>
                  <div class="connection-info">
                    <span class="target">{{ connection.target }}</span>
                    <span class="status">{{ connection.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">路由性能</div>
            <div class="performance-chart">
              <div class="performance-item" v-for="item in performanceData" :key="item.name">
                <div class="performance-label">{{ item.name }}</div>
                <div class="performance-bar">
                  <a-progress
                    :percent="item.value"
                    :show-info="false"
                    :stroke-color="getPerformanceColor(item.value)"
                    size="small"
                  />
                </div>
                <div class="performance-value">{{ item.value }}%</div>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="8">
          <div class="monitor-item">
            <div class="monitor-title">路由统计</div>
            <div class="routing-stats">
              <div class="stat-item">
                <span class="stat-label">总路由数:</span>
                <span class="stat-value">{{ statusData.totalRoutes }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功路由:</span>
                <span class="stat-value success">{{ statusData.successRoutes }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">失败路由:</span>
                <span class="stat-value failed">{{ statusData.failedRoutes }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均响应时间:</span>
                <span class="stat-value">{{ statusData.avgResponseTime }}ms</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 路由日志 -->
    <a-card title="路由日志" class="routing-logs">
      <div class="log-operations">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索路由日志"
            style="width: 200px"
            @search="onSearch"
          />
          <a-range-picker v-model:value="dateRange" />
          <a-select
            v-model:value="levelFilter"
            placeholder="日志级别"
            style="width: 120px"
          >
            <a-select-option value="">全部级别</a-select-option>
            <a-select-option value="info">信息</a-select-option>
            <a-select-option value="warning">警告</a-select-option>
            <a-select-option value="error">错误</a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshLogs">刷新</a-button>
          <a-button @click="clearLogs">清空日志</a-button>
        </a-space>
      </div>
      
      <a-table
        :columns="logColumns"
        :data-source="routingLogs"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLogLevelColor(record.level)">
              {{ getLogLevelText(record.level) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewLogDetails(record)">
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 规则编辑模态框 -->
    <a-modal
      v-model:open="ruleModalVisible"
      :title="editingRule.id ? '编辑路由规则' : '添加路由规则'"
      width="600px"
      @ok="saveRule"
      @cancel="cancelRule"
    >
      <a-form layout="vertical" :model="editingRule">
        <a-form-item label="规则名称" required>
          <a-input v-model:value="editingRule.name" placeholder="输入规则名称" />
        </a-form-item>
        <a-form-item label="源节点" required>
          <a-select v-model:value="editingRule.source" placeholder="选择源节点">
            <a-select-option value="center">中心节点</a-select-option>
            <a-select-option value="node1">节点1</a-select-option>
            <a-select-option value="node2">节点2</a-select-option>
            <a-select-option value="node3">节点3</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标节点" required>
          <a-select v-model:value="editingRule.target" placeholder="选择目标节点">
            <a-select-option value="center">中心节点</a-select-option>
            <a-select-option value="node1">节点1</a-select-option>
            <a-select-option value="node2">节点2</a-select-option>
            <a-select-option value="node3">节点3</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="editingRule.priority" placeholder="选择优先级">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="normal">普通</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="规则描述">
          <a-textarea v-model:value="editingRule.description" :rows="3" placeholder="输入规则描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 日志详情模态框 -->
    <a-modal
      v-model:open="logDetailsModalVisible"
      title="路由日志详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="日志ID">{{ selectedLog.id }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ selectedLog.timestamp }}</a-descriptions-item>
        <a-descriptions-item label="级别">{{ getLogLevelText(selectedLog.level) }}</a-descriptions-item>
        <a-descriptions-item label="源节点">{{ selectedLog.source }}</a-descriptions-item>
        <a-descriptions-item label="目标节点">{{ selectedLog.target }}</a-descriptions-item>
        <a-descriptions-item label="路由状态">{{ selectedLog.status }}</a-descriptions-item>
        <a-descriptions-item label="响应时间">{{ selectedLog.responseTime }}ms</a-descriptions-item>
        <a-descriptions-item label="详细信息">{{ selectedLog.message }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

/**
 * 路由状态数据
 */
const statusData = reactive({
  routingNodes: 12,
  activeRoutes: 8,
  successRate: 95.8,
  avgLatency: 45,
  totalRoutes: 156,
  successRoutes: 149,
  failedRoutes: 7,
  avgResponseTime: 38
})

/**
 * 路由策略数据
 */
const strategyData = reactive({
  algorithm: 'adaptive',
  priorityWeight: 50,
  routingPolicies: ['auto-failover', 'load-balancing'],
  maxHops: 5,
  timeout: 30
})

/**
 * 路由规则数据
 */
const routingRules = ref([
  {
    id: 'RULE001',
    name: '中心到节点1路由',
    source: 'center',
    target: 'node1',
    priority: 'high',
    description: '中心节点到节点1的高优先级路由',
    enabled: true
  },
  {
    id: 'RULE002',
    name: '节点1到节点2路由',
    source: 'node1',
    target: 'node2',
    priority: 'normal',
    description: '节点1到节点2的普通路由',
    enabled: true
  },
  {
    id: 'RULE003',
    name: '节点2到中心路由',
    source: 'node2',
    target: 'center',
    priority: 'low',
    description: '节点2到中心的低优先级路由',
    enabled: false
  }
])

/**
 * 路由拓扑连接
 */
const topologyConnections = ref([
  { id: 'CONN001', target: '节点1', status: 'active' },
  { id: 'CONN002', target: '节点2', status: 'active' },
  { id: 'CONN003', target: '节点3', status: 'warning' },
  { id: 'CONN004', target: '节点4', status: 'error' }
])

/**
 * 性能数据
 */
const performanceData = ref([
  { name: '路由成功率', value: 95.8 },
  { name: '平均延迟', value: 78 },
  { name: '带宽利用率', value: 65 },
  { name: '节点健康度', value: 92 }
])

/**
 * 路由日志数据
 */
const routingLogs = ref([
  {
    id: 'LOG001',
    timestamp: '2025-08-26 10:30:00',
    level: 'info',
    source: 'center',
    target: 'node1',
    status: '成功',
    responseTime: 35,
    message: '路由建立成功，延迟35ms'
  },
  {
    id: 'LOG002',
    timestamp: '2025-08-26 10:25:00',
    level: 'warning',
    source: 'node2',
    target: 'center',
    status: '延迟较高',
    responseTime: 120,
    message: '路由延迟较高，建议检查网络质量'
  },
  {
    id: 'LOG003',
    timestamp: '2025-08-26 10:20:00',
    level: 'error',
    source: 'node3',
    target: 'center',
    status: '连接失败',
    responseTime: 0,
    message: '路由连接失败，节点3离线'
  }
])

/**
 * 表格列定义
 */
const ruleColumns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '源节点',
    dataIndex: 'source',
    key: 'source'
  },
  {
    title: '目标节点',
    dataIndex: 'target',
    key: 'target'
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
]

const logColumns = [
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 150
  },
  {
    title: '级别',
    dataIndex: 'level',
    key: 'level',
    width: 80
  },
  {
    title: '源节点',
    dataIndex: 'source',
    key: 'source',
    width: 100
  },
  {
    title: '目标节点',
    dataIndex: 'target',
    key: 'target',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '响应时间',
    dataIndex: 'responseTime',
    key: 'responseTime',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 100
  }
]

/**
 * 搜索和筛选
 */
const searchText = ref('')
const dateRange = ref([])
const levelFilter = ref('')
const loading = ref(false)
const saving = ref(false)

/**
 * 模态框控制
 */
const ruleModalVisible = ref(false)
const logDetailsModalVisible = ref(false)
const editingRule = reactive({
  id: '',
  name: '',
  source: '',
  target: '',
  priority: 'normal',
  description: ''
})
const selectedLog = ref({})

/**
 * 获取性能颜色
 */
const getPerformanceColor = (value: number) => {
  if (value >= 90) return '#52c41a'
  if (value >= 70) return '#faad14'
  return '#f5222d'
}

/**
 * 获取日志级别颜色
 */
const getLogLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    error: 'red'
  }
  return colorMap[level] || 'default'
}

/**
 * 获取日志级别文本
 */
const getLogLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误'
  }
  return textMap[level] || level
}

/**
 * 保存策略
 */
const saveStrategy = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    message.success('路由策略保存成功')
  }, 1000)
}

/**
 * 重置策略
 */
const resetStrategy = () => {
  Object.assign(strategyData, {
    algorithm: 'adaptive',
    priorityWeight: 50,
    routingPolicies: ['auto-failover', 'load-balancing'],
    maxHops: 5,
    timeout: 30
  })
  message.info('策略已重置')
}

/**
 * 测试策略
 */
const testStrategy = () => {
  message.info('开始测试路由策略')
}

/**
 * 添加规则
 */
const addRule = () => {
  Object.assign(editingRule, {
    id: '',
    name: '',
    source: '',
    target: '',
    priority: 'normal',
    description: ''
  })
  ruleModalVisible.value = true
}

/**
 * 编辑规则
 */
const editRule = (rule: any) => {
  Object.assign(editingRule, rule)
  ruleModalVisible.value = true
}

/**
 * 保存规则
 */
const saveRule = () => {
  if (!editingRule.name || !editingRule.source || !editingRule.target) {
    message.error('请填写完整的规则信息')
    return
  }

  if (editingRule.id) {
    // 编辑现有规则
    const index = routingRules.value.findIndex(r => r.id === editingRule.id)
    if (index !== -1) {
      Object.assign(routingRules.value[index], editingRule)
    }
    message.success('规则更新成功')
  } else {
    // 添加新规则
    const newRule = {
      ...editingRule,
      id: `RULE${Date.now()}`,
      enabled: true
    }
    routingRules.value.unshift(newRule)
    message.success('规则添加成功')
  }
  
  ruleModalVisible.value = false
}

/**
 * 取消规则编辑
 */
const cancelRule = () => {
  ruleModalVisible.value = false
}

/**
 * 删除规则
 */
const deleteRule = (rule: any) => {
  const index = routingRules.value.findIndex(r => r.id === rule.id)
  if (index !== -1) {
    routingRules.value.splice(index, 1)
    message.success('规则删除成功')
  }
}

/**
 * 切换规则状态
 */
const toggleRule = (rule: any) => {
  message.success(`规则 ${rule.name} ${rule.enabled ? '已启用' : '已禁用'}`)
}

/**
 * 搜索日志
 */
const onSearch = (value: string) => {
  console.log('搜索:', value)
  message.info(`搜索关键词: ${value}`)
}

/**
 * 刷新日志
 */
const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('日志已刷新')
  }, 1000)
}

/**
 * 清空日志
 */
const clearLogs = () => {
  routingLogs.value = []
  message.success('日志已清空')
}

/**
 * 查看日志详情
 */
const viewLogDetails = (log: any) => {
  selectedLog.value = log
  logDetailsModalVisible.value = true
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('智能路由页面已加载')
})
</script>

<style lang="less" scoped>
.intelligent-routing {
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

    .strategy-config,
    .rule-management {
      height: 100%;
    }
  }

  .routing-monitor {
    margin-bottom: 24px;

    .monitor-item {
      .monitor-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #262626;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
      }

      .topology-placeholder {
        text-align: center;
        padding: 20px;

        .node.center {
          display: inline-block;
          width: 80px;
          height: 80px;
          line-height: 80px;
          background-color: #1890ff;
          color: white;
          border-radius: 50%;
          margin-bottom: 20px;
          font-size: 12px;
        }

        .connections {
          .connection-line {
            margin-bottom: 12px;

            .line {
              height: 2px;
              background-color: #d9d9d9;
              margin-bottom: 4px;

              &.active {
                background-color: #52c41a;
              }

              &.warning {
                background-color: #faad14;
              }

              &.error {
                background-color: #f5222d;
              }
            }

            .connection-info {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #8c8c8c;

              .status {
                font-weight: 500;
              }
            }
          }
        }
      }

      .performance-chart {
        .performance-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .performance-label {
            width: 80px;
            font-size: 14px;
            color: #595959;
          }

          .performance-bar {
            flex: 1;
            margin: 0 12px;
          }

          .performance-value {
            width: 60px;
            font-size: 12px;
            color: #8c8c8c;
            text-align: right;
          }
        }
      }

      .routing-stats {
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

  .routing-logs {
    .log-operations {
      margin-bottom: 16px;
    }
  }
}
</style>

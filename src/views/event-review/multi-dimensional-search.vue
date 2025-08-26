<template>
  <div class="multi-dimensional-search">
    <div class="page-header">
      <h2>多维事件检索</h2>
      <p>多条件组合查询历史事件，支持时间、地点、事件类型等多维度筛选</p>
    </div>

    <!-- 统计概览区域 -->
    <div class="search-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="总事件数"
              :value="searchStats.totalEvents"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <FileTextOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日事件"
              :value="searchStats.todayEvents"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CalendarOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="处理中事件"
              :value="searchStats.processingEvents"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <SyncOutlined spin />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="已完成事件"
              :value="searchStats.completedEvents"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="高等级事件"
              :value="searchStats.highLevelEvents"
              :value-style="{ color: '#f5222d' }"
            >
              <template #prefix>
                <ExclamationCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="紧急事件"
              :value="searchStats.emergencyEvents"
              :value-style="{ color: '#eb2f96' }"
            >
              <template #prefix>
                <WarningOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="多部门协同"
              :value="searchStats.multiDepartmentEvents"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="跨区域事件"
              :value="searchStats.crossRegionEvents"
              :value-style="{ color: '#13c2c2' }"
            >
              <template #prefix>
                <GlobalOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索条件区域 -->
    <div class="search-conditions">
      <a-card title="搜索条件" class="search-card">
        <a-form layout="vertical" :model="searchForm" @finish="handleSearch">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="时间范围" name="timeRange">
                <a-range-picker 
                  v-model:value="searchForm.timeRange"
                  :show-time="true"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="['开始时间', '结束时间']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="事件类型" name="eventType">
                <a-select
                  v-model:value="searchForm.eventType"
                  placeholder="请选择事件类型"
                  mode="multiple"
                  :options="eventTypeOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="事件等级" name="eventLevel">
                <a-select
                  v-model:value="searchForm.eventLevel"
                  placeholder="请选择事件等级"
                  mode="multiple"
                  :options="eventLevelOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="地理位置" name="location">
                <a-tree-select
                  v-model:value="searchForm.location"
                  :tree-data="locationTreeData"
                  placeholder="请选择地理位置"
                  tree-default-expand-all
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="船舶信息" name="vesselInfo">
                <a-input
                  v-model:value="searchForm.vesselInfo"
                  placeholder="请输入船舶名称、MMSI、IMO等"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="关键词" name="keywords">
                <a-input
                  v-model:value="searchForm.keywords"
                  placeholder="请输入事件描述关键词"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="处理状态" name="status">
                <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择处理状态"
                  mode="multiple"
                  :options="statusOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="责任部门" name="department">
                <a-select
                  v-model:value="searchForm.department"
                  placeholder="请选择责任部门"
                  mode="multiple"
                  :options="departmentOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="天气条件" name="weather">
                <a-select
                  v-model:value="searchForm.weather"
                  placeholder="请选择天气条件"
                  mode="multiple"
                  :options="weatherOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="searching">
                    <SearchOutlined />
                    搜索
                  </a-button>
                  <a-button @click="resetSearch">
                    <ReloadOutlined />
                    重置
                  </a-button>
                  <a-button @click="showAdvancedSearch">
                    <SettingOutlined />
                    高级搜索
                  </a-button>
                  <a-button @click="exportResults">
                    <DownloadOutlined />
                    导出结果
                  </a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>

    <!-- 搜索结果区域 -->
    <div class="search-results">
      <a-card title="搜索结果" class="results-card">
        <template #extra>
          <a-space>
            <span>共找到 {{ totalResults }} 条记录</span>
            <a-button @click="refreshResults">
              <ReloadOutlined />
              刷新
            </a-button>
          </a-space>
        </template>

        <a-table
          :columns="tableColumns"
          :data-source="searchResults"
          :pagination="pagination"
          :loading="tableLoading"
          row-key="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'eventType'">
              <a-tag :color="getEventTypeColor(record.eventType)">
                {{ record.eventType }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'eventLevel'">
              <a-tag :color="getEventLevelColor(record.eventLevel)">
                {{ record.eventLevel }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewDetails(record)">
                  查看详情
                </a-button>
                <a-button size="small" @click="playback(record)">
                  回放
                </a-button>
                <a-button size="small" @click="downloadEvidence(record)">
                  下载证据
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 高级搜索模态框 -->
    <a-modal
      v-model:open="advancedSearchVisible"
      title="高级搜索"
      width="800px"
      :footer="null"
    >
      <a-form layout="vertical" :model="advancedSearchForm">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="视频质量" name="videoQuality">
              <a-select
                v-model:value="advancedSearchForm.videoQuality"
                placeholder="请选择视频质量"
                mode="multiple"
                :options="videoQualityOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="音频质量" name="audioQuality">
              <a-select
                v-model:value="advancedSearchForm.audioQuality"
                placeholder="请选择音频质量"
                mode="multiple"
                :options="audioQualityOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据完整性" name="dataIntegrity">
              <a-select
                v-model:value="advancedSearchForm.dataIntegrity"
                placeholder="请选择数据完整性"
                :options="dataIntegrityOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="证据类型" name="evidenceType">
              <a-select
                v-model:value="advancedSearchForm.evidenceType"
                placeholder="请选择证据类型"
                mode="multiple"
                :options="evidenceTypeOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="自定义SQL" name="customSQL">
              <a-textarea
                v-model:value="advancedSearchForm.customSQL"
                :rows="4"
                placeholder="请输入自定义SQL查询语句（高级用户）"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="executeAdvancedSearch">
                  执行高级搜索
                </a-button>
                <a-button @click="advancedSearchVisible = false">
                  取消
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined, ReloadOutlined, SettingOutlined, DownloadOutlined,
  FileTextOutlined, CalendarOutlined, SyncOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, WarningOutlined, TeamOutlined, GlobalOutlined
} from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  timeRange: [],
  eventType: [],
  eventLevel: [],
  location: undefined,
  vesselInfo: '',
  keywords: '',
  status: [],
  department: [],
  weather: []
})

// 高级搜索表单
const advancedSearchForm = reactive({
  videoQuality: [],
  audioQuality: [],
  dataIntegrity: undefined,
  evidenceType: [],
  customSQL: ''
})

// 搜索状态
const searching = ref(false)
const tableLoading = ref(false)
const advancedSearchVisible = ref(false)

// 统计数据
const searchStats = ref({
  totalEvents: 0,
  todayEvents: 0,
  processingEvents: 0,
  completedEvents: 0,
  highLevelEvents: 0,
  emergencyEvents: 0,
  multiDepartmentEvents: 0,
  crossRegionEvents: 0
})

// 搜索结果
const searchResults = ref([])
const totalResults = ref(0)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
})

// 选项数据
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

const eventLevelOptions = [
  { label: '特别重大', value: '特别重大' },
  { label: '重大', value: '重大' },
  { label: '较大', value: '较大' },
  { label: '一般', value: '一般' }
]

const statusOptions = [
  { label: '待处理', value: '待处理' },
  { label: '处理中', value: '处理中' },
  { label: '已处理', value: '已处理' },
  { label: '已关闭', value: '已关闭' }
]

const departmentOptions = [
  { label: '海事局', value: '海事局' },
  { label: '港口管理局', value: '港口管理局' },
  { label: '航道管理处', value: '航道管理处' },
  { label: '应急救援中心', value: '应急救援中心' },
  { label: '海警局', value: '海警局' },
  { label: '边防检查站', value: '边防检查站' },
  { label: '海关缉私局', value: '海关缉私局' },
  { label: '渔业管理部门', value: '渔业管理部门' },
  { label: '环境保护局', value: '环境保护局' },
  { label: '水上交通管制中心', value: '水上交通管制中心' },
  { label: '船舶检验局', value: '船舶检验局' },
  { label: '船员考试中心', value: '船员考试中心' },
  { label: '船舶登记处', value: '船舶登记处' },
  { label: '船舶签证处', value: '船舶签证处' },
  { label: '船舶安全检查站', value: '船舶安全检查站' },
  { label: '船舶污染应急中心', value: '船舶污染应急中心' },
  { label: '船舶溢油应急中心', value: '船舶溢油应急中心' },
  { label: '船舶搜救中心', value: '船舶搜救中心' },
  { label: '船舶通信中心', value: '船舶通信中心' },
  { label: '船舶气象中心', value: '船舶气象中心' },
  { label: '船舶导航中心', value: '船舶导航中心' }
]

const weatherOptions = [
  { label: '晴天', value: '晴天' },
  { label: '多云', value: '多云' },
  { label: '雨天', value: '雨天' },
  { label: '雾天', value: '雾天' },
  { label: '大风', value: '大风' },
  { label: '台风', value: '台风' },
  { label: '暴雨', value: '暴雨' },
  { label: '小雪', value: '小雪' },
  { label: '大雪', value: '大雪' },
  { label: '冰雹', value: '冰雹' },
  { label: '沙尘暴', value: '沙尘暴' },
  { label: '雷暴', value: '雷暴' },
  { label: '龙卷风', value: '龙卷风' },
  { label: '海雾', value: '海雾' },
  { label: '海啸', value: '海啸' }
]

const videoQualityOptions = [
  { label: '4K超高清', value: '4K超高清' },
  { label: '1080P高清', value: '1080P高清' },
  { label: '720P标清', value: '720P标清' },
  { label: '480P流畅', value: '480P流畅' },
  { label: '360P低清', value: '360P低清' },
  { label: '红外夜视', value: '红外夜视' },
  { label: '热成像', value: '热成像' },
  { label: '全景360°', value: '全景360°' },
  { label: '鱼眼镜头', value: '鱼眼镜头' },
  { label: '长焦镜头', value: '长焦镜头' },
  { label: '广角镜头', value: '广角镜头' },
  { label: '微距镜头', value: '微距镜头' }
]

const audioQualityOptions = [
  { label: '无损音质', value: '无损音质' },
  { label: '高保真', value: '高保真' },
  { label: '清晰', value: '清晰' },
  { label: '一般', value: '一般' },
  { label: '模糊', value: '模糊' },
  { label: '噪音较大', value: '噪音较大' },
  { label: '回声严重', value: '回声严重' },
  { label: '断断续续', value: '断断续续' },
  { label: '立体声', value: '立体声' },
  { label: '环绕声', value: '环绕声' },
  { label: '降噪处理', value: '降噪处理' },
  { label: '语音增强', value: '语音增强' }
]

const dataIntegrityOptions = [
  { label: '完整', value: '完整' },
  { label: '部分完整', value: '部分完整' },
  { label: '不完整', value: '不完整' }
]

const evidenceTypeOptions = [
  { label: '视频录像', value: '视频录像' },
  { label: '音频录音', value: '音频录音' },
  { label: '图片截图', value: '图片截图' },
  { label: '轨迹数据', value: '轨迹数据' },
  { label: '传感器数据', value: '传感器数据' },
  { label: '雷达数据', value: '雷达数据' },
  { label: 'AIS数据', value: 'AIS数据' },
  { label: 'GPS定位', value: 'GPS定位' },
  { label: '气象数据', value: '气象数据' },
  { label: '水文数据', value: '水文数据' },
  { label: '船舶档案', value: '船舶档案' },
  { label: '船员信息', value: '船员信息' },
  { label: '货物清单', value: '货物清单' },
  { label: '通讯记录', value: '通讯记录' },
  { label: '维修记录', value: '维修记录' },
  { label: '检验报告', value: '检验报告' },
  { label: '事故报告', value: '事故报告' },
  { label: '现场照片', value: '现场照片' },
  { label: '无人机航拍', value: '无人机航拍' },
  { label: '卫星图像', value: '卫星图像' }
]

// 地理位置树形数据
const locationTreeData = [
  {
    title: '长江口',
    value: '长江口',
    children: [
      { title: '吴淞口', value: '吴淞口' },
      { title: '宝山港', value: '宝山港' },
      { title: '外高桥', value: '外高桥' },
      { title: '罗泾港', value: '罗泾港' },
      { title: '长兴岛', value: '长兴岛' },
      { title: '横沙岛', value: '横沙岛' },
      { title: '崇明岛', value: '崇明岛' }
    ]
  },
  {
    title: '黄浦江',
    value: '黄浦江',
    children: [
      { title: '杨浦大桥', value: '杨浦大桥' },
      { title: '南浦大桥', value: '南浦大桥' },
      { title: '卢浦大桥', value: '卢浦大桥' },
      { title: '徐浦大桥', value: '徐浦大桥' },
      { title: '闵浦大桥', value: '闵浦大桥' },
      { title: '松浦大桥', value: '松浦大桥' },
      { title: '奉浦大桥', value: '奉浦大桥' }
    ]
  },
  {
    title: '杭州湾',
    value: '杭州湾',
    children: [
      { title: '金山港', value: '金山港' },
      { title: '乍浦港', value: '乍浦港' },
      { title: '海盐港', value: '海盐港' },
      { title: '慈溪港', value: '慈溪港' },
      { title: '镇海港', value: '镇海港' }
    ]
  },
  {
    title: '东海',
    value: '东海',
    children: [
      { title: '嵊泗列岛', value: '嵊泗列岛' },
      { title: '舟山群岛', value: '舟山群岛' },
      { title: '岱山岛', value: '岱山岛' },
      { title: '普陀山', value: '普陀山' },
      { title: '朱家尖', value: '朱家尖' }
    ]
  },
  {
    title: '黄海',
    value: '黄海',
    children: [
      { title: '连云港', value: '连云港' },
      { title: '日照港', value: '日照港' },
      { title: '青岛港', value: '青岛港' },
      { title: '威海港', value: '威海港' },
      { title: '烟台港', value: '烟台港' }
    ]
  },
  {
    title: '渤海',
    value: '渤海',
    children: [
      { title: '大连港', value: '大连港' },
      { title: '营口港', value: '营口港' },
      { title: '锦州港', value: '锦州港' },
      { title: '秦皇岛港', value: '秦皇岛港' },
      { title: '天津港', value: '天津港' }
    ]
  }
]

// 表格列定义
const tableColumns = [
  { title: '事件编号', dataIndex: 'id', key: 'id', width: 120 },
  { title: '事件时间', dataIndex: 'eventTime', key: 'eventTime', width: 180 },
  { title: '事件类型', dataIndex: 'eventType', key: 'eventType', width: 120 },
  { title: '事件等级', dataIndex: 'eventLevel', key: 'eventLevel', width: 100 },
  { title: '地理位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '船舶信息', dataIndex: 'vesselInfo', key: 'vesselInfo', width: 200 },
  { title: '处理状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '责任部门', dataIndex: 'department', key: 'department', width: 120 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 方法
const handleSearch = () => {
  searching.value = true
  tableLoading.value = true
  
  // 模拟搜索延迟
  setTimeout(() => {
    // 模拟搜索结果
    searchResults.value = [
      {
        id: 'EV20250415001',
        eventTime: '2025-08-15 14:30:25',
        eventType: '船舶碰撞',
        eventLevel: '较大',
        location: '吴淞口',
        vesselInfo: '中远海运001号 / MMSI: 123456789',
        status: '已处理',
        department: '海事局'
      },
      {
        id: 'EV20250415002',
        eventTime: '2025-08-15 16:45:12',
        eventType: '船舶搁浅',
        eventLevel: '一般',
        location: '宝山港',
        vesselInfo: '招商轮船002号 / MMSI: 987654321',
        status: '处理中',
        department: '港口管理局'
      },
      {
        id: 'EV20250415003',
        eventTime: '2025-08-15 18:20:33',
        eventType: '火灾事故',
        eventLevel: '重大',
        location: '外高桥',
        vesselInfo: '中海集运003号 / MMSI: 456789123',
        status: '处理中',
        department: '应急救援中心'
      },
      {
        id: 'EV20250415004',
        eventTime: '2025-08-15 20:15:47',
        eventType: '人员落水',
        eventLevel: '较大',
        location: '罗泾港',
        vesselInfo: '长荣海运004号 / MMSI: 789123456',
        status: '已处理',
        department: '海警局'
      },
      {
        id: 'EV20250415005',
        eventTime: '2025-08-15 22:08:19',
        eventType: '货物泄漏',
        eventLevel: '一般',
        location: '长兴岛',
        vesselInfo: '阳明海运005号 / MMSI: 321654987',
        status: '已处理',
        department: '环境保护局'
      },
      {
        id: 'EV20250415006',
        eventTime: '2025-08-16 00:30:55',
        eventType: '航道堵塞',
        eventLevel: '较大',
        location: '横沙岛',
        vesselInfo: '万海航运006号 / MMSI: 654987321',
        status: '处理中',
        department: '航道管理处'
      },
      {
        id: 'EV20250416001',
        eventTime: '2025-08-16 02:45:12',
        eventType: '船舶失控',
        eventLevel: '重大',
        location: '崇明岛',
        vesselInfo: '现代商船007号 / MMSI: 987321654',
        status: '已处理',
        department: '船舶搜救中心'
      },
      {
        id: 'EV20250416002',
        eventTime: '2025-08-16 05:20:38',
        eventType: '锚链断裂',
        eventLevel: '一般',
        location: '杨浦大桥',
        vesselInfo: '韩进海运008号 / MMSI: 321987654',
        status: '已处理',
        department: '船舶安全检查站'
      },
      {
        id: 'EV20250416003',
        eventTime: '2025-08-16 08:15:26',
        eventType: '船舶沉没',
        eventLevel: '特别重大',
        location: '南浦大桥',
        vesselInfo: '商船三井009号 / MMSI: 654321987',
        status: '处理中',
        department: '应急救援中心'
      },
      {
        id: 'EV20250416004',
        eventTime: '2025-08-16 10:30:44',
        eventType: '船舶倾覆',
        eventLevel: '重大',
        location: '卢浦大桥',
        vesselInfo: '日本邮船010号 / MMSI: 987654321',
        status: '已处理',
        department: '海警局'
      },
      {
        id: 'EV20250416005',
        eventTime: '2025-08-16 12:45:17',
        eventType: '船舶进水',
        eventLevel: '较大',
        location: '徐浦大桥',
        vesselInfo: '川崎汽船011号 / MMSI: 123789456',
        status: '处理中',
        department: '船舶检验局'
      },
      {
        id: 'EV20250416006',
        eventTime: '2025-08-16 15:20:33',
        eventType: '船舶触礁',
        eventLevel: '一般',
        location: '闵浦大桥',
        vesselInfo: '三井商船012号 / MMSI: 456123789',
        status: '已处理',
        department: '港口管理局'
      }
    ]
    
    totalResults.value = 12
    pagination.total = 12
    searching.value = false
    tableLoading.value = false
    message.success(`搜索完成，找到${totalResults.value}条记录`)
  }, 1500)
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  searchResults.value = []
  totalResults.value = 0
  message.info('搜索条件已重置')
}

const showAdvancedSearch = () => {
  advancedSearchVisible.value = true
}

const executeAdvancedSearch = () => {
  message.success('高级搜索执行中...')
  advancedSearchVisible.value = false
}

const exportResults = () => {
  if (searchResults.value.length === 0) {
    message.warning('没有搜索结果可导出')
    return
  }
  message.success('正在导出搜索结果...')
}

const refreshResults = () => {
  if (searchForm.timeRange.length > 0 || 
      searchForm.eventType.length > 0 || 
      searchForm.keywords) {
    handleSearch()
  } else {
    message.info('请先设置搜索条件')
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 重新搜索当前页数据
}

const viewDetails = (record: any) => {
  message.info(`查看事件详情：${record.id}`)
}

const playback = (record: any) => {
  message.info(`开始回放事件：${record.id}`)
}

const downloadEvidence = (record: any) => {
  message.info(`下载事件证据：${record.id}`)
}

// 获取标签颜色
const getEventTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '船舶碰撞': 'red',
    '船舶搁浅': 'orange',
    '火灾事故': 'volcano',
    '人员落水': 'blue',
    '货物泄漏': 'purple',
    '航道堵塞': 'cyan',
    '船舶失控': 'red',
    '锚链断裂': 'orange',
    '船舶沉没': 'red',
    '船舶倾覆': 'volcano',
    '船舶进水': 'blue',
    '船舶触礁': 'orange',
    '船舶相撞': 'red',
    '船舶翻船': 'volcano',
    '船舶爆炸': 'red',
    '船舶污染': 'purple',
    '船舶走私': 'volcano',
    '船舶偷渡': 'orange',
    '船舶非法捕捞': 'cyan',
    '船舶非法倾倒': 'purple',
    '船舶非法锚泊': 'orange',
    '船舶超速行驶': 'orange',
    '船舶违规穿越': 'orange',
    '船舶违规停泊': 'orange',
    '船舶违规作业': 'orange'
  }
  return colorMap[type] || 'default'
}

const getEventLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    '特别重大': 'red',
    '重大': 'volcano',
    '较大': 'orange',
    '一般': 'blue'
  }
  return colorMap[level] || 'default'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '待处理': 'red',
    '处理中': 'processing',
    '已处理': 'success',
    '已关闭': 'default'
  }
  return colorMap[status] || 'default'
}

onMounted(() => {
  console.log('多维事件检索页面已加载')
  
  // 初始化统计数据
  searchStats.value = {
    totalEvents: 1247,
    todayEvents: 23,
    processingEvents: 156,
    completedEvents: 1091,
    highLevelEvents: 89,
    emergencyEvents: 34,
    multiDepartmentEvents: 234,
    crossRegionEvents: 67
  }
})
</script>

<style lang="less" scoped>
.multi-dimensional-search {
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

  .search-overview {
    margin-bottom: 24px;

    .overview-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .ant-statistic-title {
        font-size: 14px;
        color: #8c8c8c;
        margin-bottom: 8px;
      }
      
      .ant-statistic-content {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .search-conditions {
    margin-bottom: 24px;

    .search-card {
      .ant-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .search-results {
    .results-card {
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
  .multi-dimensional-search {
    padding: 16px;

    .search-overview .ant-col {
      margin-bottom: 16px;
    }

    .ant-col {
      margin-bottom: 16px;
    }
  }
}
</style>

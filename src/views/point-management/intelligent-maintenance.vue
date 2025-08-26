<template>
  <div class="intelligent-maintenance">
    <div class="page-header">
      <h2>智能运维</h2>
      <p>设备故障记录、维修历史、保养计划等运维管理功能</p>
    </div>

    <!-- 运维概览统计 -->
    <div class="maintenance-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card">
            
            <a-statistic
              title="待处理故障"
              :value="maintenanceStats.pendingFaults"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #suffix>
                <ExclamationCircleOutlined style="color: #ff4d4f; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="维修中设备"
              :value="maintenanceStats.maintenanceDevices"
              :value-style="{ color: '#faad14' }"
            >
              <template #suffix>
                <ToolOutlined style="color: #faad14; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="今日保养计划"
              :value="maintenanceStats.todayMaintenance"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <CalendarCircleOutlined style="color: #1890ff; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card">
            <a-statistic
              title="平均修复时间"
              :value="maintenanceStats.avgRepairTime"
              suffix="小时"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>
                <ClockCircleOutlined style="color: #52c41a; margin-left: 8px" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要功能区域 -->
    <div class="maintenance-content">
      <a-row :gutter="16">
        <!-- 故障记录管理 -->
        <a-col :span="12">
          <a-card title="故障记录管理" class="maintenance-card">
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="faultFilter.status"
                  placeholder="故障状态"
                  style="width: 120px"
                  @change="handleFaultFilterChange"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="pending">待处理</a-select-option>
                  <a-select-option value="processing">处理中</a-select-option>
                  <a-select-option value="resolved">已解决</a-select-option>
                  <a-select-option value="closed">已关闭</a-select-option>
                </a-select>
                <a-button type="primary" @click="showAddFault">
                  <PlusOutlined />
                  添加故障
                </a-button>
              </a-space>
            </template>
            
            <div class="fault-list">
              <div
                v-for="fault in filteredFaults"
                :key="fault.id"
                class="fault-item"
                :class="`fault-${fault.status}`"
              >
                <div class="fault-header">
                  <div class="fault-title">{{ fault.title }}</div>
                  <div class="fault-status">
                    <a-tag :color="getFaultStatusColor(fault.status)">
                      {{ getFaultStatusText(fault.status) }}
                    </a-tag>
                  </div>
                </div>
                <div class="fault-info">
                  <div class="fault-device">{{ fault.deviceName }}</div>
                  <div class="fault-time">{{ formatTime(fault.reportTime) }}</div>
                </div>
                <div class="fault-description">{{ fault.description }}</div>
                <div class="fault-actions">
                  <a-button type="link" size="small" @click="viewFaultDetails(fault)">
                    查看详情
                  </a-button>
                  <a-button type="link" size="small" @click="assignTechnician(fault)">
                    分配技师
                  </a-button>
                  <a-button type="link" size="small" @click="updateFaultStatus(fault)">
                    更新状态
                  </a-button>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 维修历史记录 -->
        <a-col :span="12">
          <a-card title="维修历史记录" class="maintenance-card">
            <template #extra>
              <a-space>
                <a-range-picker
                  v-model:value="repairDateRange"
                  @change="handleRepairDateChange"
                />
                <a-button @click="exportRepairHistory">
                  <ExportOutlined />
                  导出
                </a-button>
              </a-space>
            </template>
            
            <div class="repair-history">
              <div
                v-for="repair in filteredRepairHistory"
                :key="repair.id"
                class="repair-item"
              >
                <div class="repair-header">
                  <div class="repair-title">{{ repair.title }}</div>
                  <div class="repair-result">
                    <a-tag :color="repair.success ? 'green' : 'red'">
                      {{ repair.success ? '成功' : '失败' }}
                    </a-tag>
                  </div>
                </div>
                <div class="repair-info">
                  <div class="repair-device">{{ repair.deviceName }}</div>
                  <div class="repair-technician">技师: {{ repair.technician }}</div>
                  <div class="repair-time">{{ formatTime(repair.repairTime) }}</div>
                </div>
                <div class="repair-duration">
                  耗时: {{ repair.duration }}小时
                </div>
                <div class="repair-actions">
                  <a-button type="link" size="small" @click="viewRepairDetails(repair)">
                    查看详情
                  </a-button>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 保养计划管理 -->
    <div class="maintenance-planning">
      <a-card title="保养计划管理" class="planning-card">
        <template #extra>
          <a-space>
            <a-select
              v-model:value="planFilter.type"
              placeholder="保养类型"
              style="width: 120px"
              @change="handlePlanFilterChange"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="routine">例行保养</a-select-option>
              <a-select-option value="preventive">预防性保养</a-select-option>
              <a-select-option value="emergency">紧急保养</a-select-option>
            </a-select>
            <a-button type="primary" @click="showAddMaintenancePlan">
              <PlusOutlined />
              添加计划
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :columns="planColumns"
          :data-source="filteredMaintenancePlans"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'planName'">
              <div class="plan-info">
                <div class="plan-name">{{ record.planName }}</div>
                <div class="plan-device">{{ record.deviceName }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="getPlanStatusColor(record.status)">
                {{ getPlanStatusText(record.status) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'nextMaintenance'">
              <div class="next-maintenance">
                <div>{{ formatDate(record.nextMaintenance) }}</div>
                <div class="countdown">{{ getCountdownText(record.nextMaintenance) }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="executePlan(record)">
                  <PlayCircleOutlined />
                  执行
                </a-button>
                <a-button type="link" size="small" @click="editPlan(record)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-button type="link" size="small" @click="deletePlan(record)">
                  <DeleteOutlined />
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加故障记录弹窗 -->
    <a-modal
      v-model:open="faultModal.visible"
      title="添加故障记录"
      width="600px"
      @ok="handleFaultSubmit"
      @cancel="handleFaultCancel"
    >
      <a-form
        ref="faultFormRef"
        :model="faultForm"
        :rules="faultRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="故障标题" name="title">
          <a-input v-model:value="faultForm.title" placeholder="请输入故障标题" />
        </a-form-item>
        
        <a-form-item label="故障设备" name="deviceId">
          <a-select v-model:value="faultForm.deviceId" placeholder="请选择故障设备">
            <a-select-option
              v-for="device in deviceList"
              :key="device.id"
              :value="device.id"
            >
              {{ device.deviceName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="故障类型" name="type">
          <a-select v-model:value="faultForm.type" placeholder="请选择故障类型">
            <a-select-option value="hardware">硬件故障</a-select-option>
            <a-select-option value="software">软件故障</a-select-option>
            <a-select-option value="network">网络故障</a-select-option>
            <a-select-option value="power">电源故障</a-select-option>
            <a-select-option value="environmental">环境故障</a-select-option>
            <a-select-option value="other">其他故障</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="故障等级" name="level">
          <a-select v-model:value="faultForm.level" placeholder="请选择故障等级">
            <a-select-option value="low">低 - 轻微影响，可延后处理</a-select-option>
            <a-select-option value="medium">中 - 影响部分功能，需及时处理</a-select-option>
            <a-select-option value="high">高 - 影响主要功能，需优先处理</a-select-option>
            <a-select-option value="critical">紧急 - 影响安全监控，需立即处理</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="故障描述" name="description">
          <a-textarea
            v-model:value="faultForm.description"
            placeholder="请详细描述故障现象、影响范围、发现时间等关键信息"
            :rows="4"
          />
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            提示：建议包含故障现象、影响范围、发现时间、是否影响安全监控等关键信息
          </div>
        </a-form-item>
        
        <a-form-item label="报告人" name="reporter">
          <a-input v-model:value="faultForm.reporter" placeholder="请输入报告人姓名" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加保养计划弹窗 -->
    <a-modal
      v-model:open="planModal.visible"
      title="添加保养计划"
      width="600px"
      @ok="handlePlanSubmit"
      @cancel="handlePlanCancel"
    >
      <a-form
        ref="planFormRef"
        :model="planForm"
        :rules="planRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="计划名称" name="planName">
          <a-input v-model:value="planForm.planName" placeholder="请输入计划名称" />
        </a-form-item>
        
        <a-form-item label="保养设备" name="deviceId">
          <a-select v-model:value="planForm.deviceId" placeholder="请选择保养设备">
            <a-select-option
              v-for="device in deviceList"
              :key="device.id"
              :value="device.id"
            >
              {{ device.deviceName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="保养类型" name="type">
          <a-select v-model:value="planForm.type" placeholder="请选择保养类型">
            <a-select-option value="routine">例行保养</a-select-option>
            <a-select-option value="preventive">预防性保养</a-select-option>
            <a-select-option value="emergency">紧急保养</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="保养周期" name="cycle">
          <a-input-number
            v-model:value="planForm.cycle"
            :min="1"
            :max="365"
            placeholder="保养周期(天)"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="下次保养" name="nextMaintenance">
          <a-date-picker v-model:value="planForm.nextMaintenance" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="保养内容" name="content">
          <a-textarea
            v-model:value="planForm.content"
            placeholder="请描述保养内容"
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item label="负责人" name="responsible">
          <a-input v-model:value="planForm.responsible" placeholder="请输入负责人姓名" />
        </a-form-item>
      </a-form>
         </a-modal>

     <!-- 故障详情弹窗 -->
     <a-modal
       v-model:open="faultDetailModal.visible"
       title="故障详情"
       width="600px"
       :footer="null"
     >
       <div v-if="selectedFault" class="fault-detail">
         <a-descriptions :column="1" bordered>
           <a-descriptions-item label="故障标题">
             {{ selectedFault.title }}
           </a-descriptions-item>
           <a-descriptions-item label="故障设备">
             {{ selectedFault.deviceName }}
           </a-descriptions-item>
           <a-descriptions-item label="故障类型">
             <a-tag :color="getFaultTypeColor(selectedFault.type)">
               {{ getFaultTypeText(selectedFault.type) }}
             </a-tag>
           </a-descriptions-item>
           <a-descriptions-item label="故障等级">
             <a-tag :color="getFaultLevelColor(selectedFault.level)">
               {{ getFaultLevelText(selectedFault.level) }}
             </a-tag>
           </a-descriptions-item>
           <a-descriptions-item label="故障状态">
             <a-tag :color="getFaultStatusColor(selectedFault.status)">
               {{ getFaultStatusText(selectedFault.status) }}
             </a-tag>
           </a-descriptions-item>
           <a-descriptions-item label="故障描述">
             {{ selectedFault.description }}
           </a-descriptions-item>
           <a-descriptions-item label="报告人">
             {{ selectedFault.reporter }}
           </a-descriptions-item>
           <a-descriptions-item label="报告时间">
             {{ formatTime(selectedFault.reportTime) }}
           </a-descriptions-item>
           <a-descriptions-item v-if="selectedFault.assignedTechnician" label="分配技师">
             {{ selectedFault.assignedTechnician }}
           </a-descriptions-item>
           <a-descriptions-item v-if="selectedFault.resolution" label="解决方案">
             {{ selectedFault.resolution }}
           </a-descriptions-item>
           <a-descriptions-item v-if="selectedFault.resolveTime" label="解决时间">
             {{ formatTime(selectedFault.resolveTime) }}
           </a-descriptions-item>
         </a-descriptions>
       </div>
     </a-modal>

     <!-- 维修详情弹窗 -->
     <a-modal
       v-model:open="repairDetailModal.visible"
       title="维修详情"
       width="600px"
       :footer="null"
     >
       <div v-if="selectedRepair" class="repair-detail">
         <a-descriptions :column="1" bordered>
           <a-descriptions-item label="维修标题">
             {{ selectedRepair.title }}
           </a-descriptions-item>
           <a-descriptions-item label="维修设备">
             {{ selectedRepair.deviceName }}
           </a-descriptions-item>
           <a-descriptions-item label="维修技师">
             {{ selectedRepair.technician }}
           </a-descriptions-item>
           <a-descriptions-item label="维修时间">
             {{ formatTime(selectedRepair.repairTime) }}
           </a-descriptions-item>
           <a-descriptions-item label="维修耗时">
             {{ selectedRepair.duration }}小时
           </a-descriptions-item>
           <a-descriptions-item label="维修结果">
             <a-tag :color="selectedRepair.success ? 'green' : 'red'">
               {{ selectedRepair.success ? '成功' : '失败' }}
             </a-tag>
           </a-descriptions-item>
           <a-descriptions-item label="维修描述">
             {{ selectedRepair.description }}
           </a-descriptions-item>
           <a-descriptions-item label="更换配件">
             {{ selectedRepair.parts.join(', ') || '无' }}
           </a-descriptions-item>
           <a-descriptions-item label="维修成本">
             ¥{{ selectedRepair.cost }}
           </a-descriptions-item>
         </a-descriptions>
       </div>
     </a-modal>

     <!-- 分配技师弹窗 -->
     <a-modal
       v-model:open="assignTechnicianModal.visible"
       title="分配技师"
       width="500px"
       @ok="handleAssignTechnicianSubmit"
       @cancel="assignTechnicianModal.visible = false"
     >
       <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
         <a-form-item label="选择技师" required>
           <a-select
             v-model:value="assignTechnicianForm.technician"
             placeholder="请选择技师"
             style="width: 100%"
           >
             <a-select-option
               v-for="technician in technicianList"
               :key="technician"
               :value="technician"
             >
               {{ technician }}
             </a-select-option>
           </a-select>
         </a-form-item>
         
         <a-form-item label="预计时间">
           <a-input
             v-model:value="assignTechnicianForm.estimatedTime"
             placeholder="如：2小时"
           />
         </a-form-item>
         
         <a-form-item label="备注">
           <a-textarea
             v-model:value="assignTechnicianForm.notes"
             placeholder="请输入备注信息"
             :rows="3"
           />
         </a-form-item>
       </a-form>
     </a-modal>

     <!-- 更新故障状态弹窗 -->
     <a-modal
       v-model:open="updateStatusModal.visible"
       title="更新故障状态"
       width="500px"
       @ok="handleUpdateStatusSubmit"
       @cancel="updateStatusModal.visible = false"
     >
       <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
         <a-form-item label="故障状态" required>
           <a-select
             v-model:value="updateStatusForm.status"
             placeholder="请选择状态"
             style="width: 100%"
           >
             <a-select-option value="pending">待处理</a-select-option>
             <a-select-option value="processing">处理中</a-select-option>
             <a-select-option value="resolved">已解决</a-select-option>
             <a-select-option value="closed">已关闭</a-select-option>
           </a-select>
         </a-form-item>
         
         <a-form-item label="备注">
           <a-textarea
             v-model:value="updateStatusForm.notes"
             placeholder="请输入备注信息"
             :rows="3"
           />
         </a-form-item>
         
         <a-form-item v-if="updateStatusForm.status === 'resolved'" label="解决方案">
           <a-textarea
             v-model:value="updateStatusForm.resolution"
             placeholder="请描述解决方案"
             :rows="3"
           />
         </a-form-item>
       </a-form>
     </a-modal>

     <!-- 编辑保养计划弹窗 -->
     <a-modal
       v-model:open="editPlanModal.visible"
       title="编辑保养计划"
       width="600px"
       @ok="handleEditPlanSubmit"
       @cancel="editPlanModal.visible = false"
     >
       <a-form
         :model="editPlanForm"
         :rules="planRules"
         :label-col="{ span: 6 }"
         :wrapper-col="{ span: 18 }"
       >
         <a-form-item label="计划名称" name="planName">
           <a-input v-model:value="editPlanForm.planName" placeholder="请输入计划名称" />
         </a-form-item>
         
         <a-form-item label="保养设备" name="deviceId">
           <a-select v-model:value="editPlanForm.deviceId" placeholder="请选择保养设备">
             <a-select-option
               v-for="device in deviceList"
               :key="device.id"
               :value="device.id"
             >
               {{ device.deviceName }}
             </a-select-option>
           </a-select>
         </a-form-item>
         
         <a-form-item label="保养类型" name="type">
           <a-select v-model:value="editPlanForm.type" placeholder="请选择保养类型">
             <a-select-option value="routine">例行保养</a-select-option>
             <a-select-option value="preventive">预防性保养</a-select-option>
             <a-select-option value="emergency">紧急保养</a-select-option>
           </a-select>
         </a-form-item>
         
         <a-form-item label="保养周期" name="cycle">
           <a-input-number
             v-model:value="editPlanForm.cycle"
             :min="1"
             :max="365"
             placeholder="保养周期(天)"
             style="width: 100%"
           />
         </a-form-item>
         
         <a-form-item label="下次保养" name="nextMaintenance">
           <a-date-picker v-model:value="editPlanForm.nextMaintenance" style="width: 100%" />
         </a-form-item>
         
         <a-form-item label="保养内容" name="content">
           <a-textarea
             v-model:value="editPlanForm.content"
             placeholder="请描述保养内容"
             :rows="4"
           />
         </a-form-item>
         
         <a-form-item label="负责人" name="responsible">
           <a-input v-model:value="editPlanForm.responsible" placeholder="请输入负责人姓名" />
         </a-form-item>
       </a-form>
     </a-modal>
   </div>
 </template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ExclamationCircleOutlined,
  ToolOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 故障记录接口
 */
interface FaultRecord {
  id: string
  title: string
  deviceName: string
  deviceId: string
  type: 'hardware' | 'software' | 'network' | 'power' | 'environmental' | 'other'
  level: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  description: string
  reporter: string
  reportTime: string
  assignedTechnician?: string
  resolution?: string
  resolveTime?: string
}

/**
 * 维修历史接口
 */
interface RepairHistory {
  id: string
  title: string
  deviceName: string
  deviceId: string
  technician: string
  repairTime: string
  duration: number
  success: boolean
  description: string
  parts: string[]
  cost: number
}

/**
 * 保养计划接口
 */
interface MaintenancePlan {
  id: string
  planName: string
  deviceName: string
  deviceId: string
  type: 'routine' | 'preventive' | 'emergency'
  cycle: number
  nextMaintenance: string
  content: string
  responsible: string
  status: 'active' | 'completed' | 'cancelled'
  lastMaintenance?: string
}

/**
 * 设备信息接口
 */
interface Device {
  id: string
  deviceName: string
  deviceType: string
  status: string
}

/**
 * 响应式数据
 */
const faultFilter = reactive({
  status: ''
})

const planFilter = reactive({
  type: ''
})

const repairDateRange = ref([])
const faultModal = reactive({
  visible: false
})

const planModal = reactive({
  visible: false
})

// 技师列表
const technicianList = ref([
  '王技师',
  '李技师', 
  '赵技师',
  '钱技师',
  '孙技师',
  '周技师'
])

// 当前选中的故障记录
const selectedFault = ref<FaultRecord | null>(null)

// 当前选中的维修记录
const selectedRepair = ref<RepairHistory | null>(null)

// 当前选中的保养计划
const selectedPlan = ref<MaintenancePlan | null>(null)

// 故障详情弹窗
const faultDetailModal = reactive({
  visible: false
})

// 维修详情弹窗
const repairDetailModal = reactive({
  visible: false
})

// 保养计划详情弹窗
const planDetailModal = reactive({
  visible: false
})

// 分配技师弹窗
const assignTechnicianModal = reactive({
  visible: false
})

// 更新故障状态弹窗
const updateStatusModal = reactive({
  visible: false
})

// 编辑保养计划弹窗
const editPlanModal = reactive({
  visible: false
})

/**
 * 表单数据
 */
const faultForm = reactive<Partial<FaultRecord>>({
  title: '',
  deviceId: '',
  type: 'hardware',
  level: 'medium',
  description: '',
  reporter: ''
})

const planForm = reactive<Partial<MaintenancePlan>>({
  planName: '',
  deviceId: '',
  type: 'routine',
  cycle: 30,
  nextMaintenance: '',
  content: '',
  responsible: ''
})

// 分配技师表单
const assignTechnicianForm = reactive({
  technician: '',
  estimatedTime: '',
  notes: ''
})

// 更新故障状态表单
const updateStatusForm = reactive({
  status: 'pending',
  notes: '',
  resolution: ''
})

// 编辑保养计划表单
const editPlanForm = reactive<Partial<MaintenancePlan>>({
  planName: '',
  deviceId: '',
  type: 'routine',
  cycle: 30,
  nextMaintenance: '',
  content: '',
  responsible: ''
})

/**
 * 表单验证规则
 */
const faultRules = {
  title: [{ required: true, message: '请输入故障标题', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请选择故障设备', trigger: 'change' }],
  type: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择故障等级', trigger: 'change' }],
  description: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  reporter: [{ required: true, message: '请输入报告人姓名', trigger: 'blur' }]
}

const planRules = {
  planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请选择保养设备', trigger: 'change' }],
  type: [{ required: true, message: '请选择保养类型', trigger: 'change' }],
  cycle: [{ required: true, message: '请输入保养周期', trigger: 'blur' }],
  nextMaintenance: [{ required: true, message: '请选择下次保养时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入保养内容', trigger: 'blur' }],
  responsible: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }]
}

/**
 * 运维统计数据 - 基于真实港口监控系统
 */
const maintenanceStats = reactive({
  pendingFaults: 7,
  maintenanceDevices: 4,
  todayMaintenance: 12,
  avgRepairTime: 6.2
})

/**
 * 模拟故障记录数据 - 基于真实港口监控系统
 */
const faultRecords = ref<FaultRecord[]>([
  {
    id: '1',
    title: '济宁港主码头摄像头画面模糊',
    deviceName: '济宁港主码头-高清监控01',
    deviceId: 'JN-CAM-001',
    type: 'hardware',
    level: 'medium',
    status: 'pending',
    description: '摄像头镜头表面有污渍，画面出现模糊现象，影响港口作业监控效果，需要清洁镜头',
    reporter: '张运维',
    reportTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '2',
    title: '梁山港航道传感器数据异常',
    deviceName: '梁山港航道-潮汐传感器01',
    deviceId: 'LS-SEN-001',
    type: 'software',
    level: 'high',
    status: 'processing',
    description: '潮汐传感器数据采集异常，显示错误数值，影响航道安全监测，需要重新校准',
    reporter: '李监控',
    reportTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    assignedTechnician: '王技师'
  },
  {
    id: '3',
    title: '京杭运河监控设备网络中断',
    deviceName: '京杭运河济宁段-航道监控01',
    deviceId: 'YH-CAM-001',
    type: 'network',
    level: 'critical',
    status: 'pending',
    description: '监控设备网络连接中断，无法传输视频信号，影响运河航道安全监控',
    reporter: '陈安全',
    reportTime: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '4',
    title: '济宁港锚地气象传感器故障',
    deviceName: '济宁港锚地-气象传感器01',
    deviceId: 'JN-SEN-004',
    type: 'hardware',
    level: 'high',
    status: 'processing',
    description: '气象传感器温度读数异常，超出正常范围(-20°C~50°C)，可能是传感器损坏',
    reporter: '刘气象',
    reportTime: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    assignedTechnician: '赵技师'
  },
  {
    id: '5',
    title: '济宁港控制中心交换机过热',
    deviceName: '济宁港控制中心-核心交换机01',
    deviceId: 'JN-NET-003',
    type: 'hardware',
    level: 'medium',
    status: 'pending',
    description: '核心交换机CPU温度过高，达到85°C，超过正常工作温度，需要检查散热系统',
    reporter: '王网络',
    reportTime: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '6',
    title: '济宁港散货码头粉尘传感器离线',
    deviceName: '济宁港散货码头-粉尘传感器01',
    deviceId: 'JN-SEN-005',
    type: 'power',
    level: 'medium',
    status: 'resolved',
    description: '粉尘传感器电源模块故障，设备离线，已更换电源模块，恢复正常工作',
    reporter: '孙环保',
    reportTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    assignedTechnician: '李技师',
    resolution: '更换电源模块，设备恢复正常',
    resolveTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '7',
    title: '梁山港存储设备硬盘故障',
    deviceName: '梁山港数据中心-存储设备01',
    deviceId: 'LS-STR-001',
    type: 'hardware',
    level: 'critical',
    status: 'processing',
    description: '存储设备RAID阵列中一块硬盘故障，影响数据存储稳定性，需要更换硬盘',
    reporter: '周数据',
    reportTime: dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    assignedTechnician: '钱技师'
  }
])

/**
 * 模拟维修历史数据 - 基于真实港口监控系统
 */
const repairHistory = ref<RepairHistory[]>([
  {
    id: '1',
    title: '修复济宁港锚地通信基站故障',
    deviceName: '济宁港锚地-通信基站01',
    deviceId: 'JN-NET-001',
    technician: '王技师',
    repairTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    duration: 2.5,
    success: true,
    description: '更换老化网线，重新配置网络参数，恢复通信基站正常连接',
    parts: ['网线', '网络模块'],
    cost: 1200
  },
  {
    id: '2',
    title: '修复济宁港数据中心存储阵列故障',
    deviceName: '济宁港数据中心-存储阵列01',
    deviceId: 'JN-STR-001',
    technician: '赵技师',
    repairTime: dayjs().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
    duration: 8,
    success: true,
    description: '更换故障硬盘，重建RAID阵列，恢复数据存储系统正常运行',
    parts: ['硬盘', 'RAID控制器', '散热风扇'],
    cost: 3800
  },
  {
    id: '3',
    title: '修复梁山港码头监控设备故障',
    deviceName: '梁山港码头-高清监控01',
    deviceId: 'LS-CAM-001',
    technician: '李技师',
    repairTime: dayjs().subtract(2, 'week').format('YYYY-MM-DD HH:mm:ss'),
    duration: 4,
    success: true,
    description: '更换损坏的图像传感器，重新校准摄像头参数，恢复高清监控画面',
    parts: ['图像传感器', '镜头组件'],
    cost: 2800
  },
  {
    id: '4',
    title: '修复京杭运河流速传感器故障',
    deviceName: '京杭运河-水流传感器01',
    deviceId: 'YH-SEN-001',
    technician: '钱技师',
    repairTime: dayjs().subtract(3, 'week').format('YYYY-MM-DD HH:mm:ss'),
    duration: 6,
    success: true,
    description: '清理传感器表面水草，更换防水密封圈，重新校准传感器精度',
    parts: ['防水密封圈', '校准工具'],
    cost: 1500
  },
  {
    id: '5',
    title: '修复济宁港散货码头网络设备故障',
    deviceName: '济宁港散货码头-通信设备01',
    deviceId: 'JN-NET-002',
    technician: '孙技师',
    repairTime: dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
    duration: 3,
    success: false,
    description: '尝试修复网络设备，但设备老化严重，最终决定更换新设备',
    parts: ['网络模块', '电源适配器'],
    cost: 2200
  }
])

/**
 * 模拟保养计划数据 - 基于真实港口监控系统
 */
const maintenancePlans = ref<MaintenancePlan[]>([
  {
    id: '1',
    planName: '济宁港主码头摄像头月度保养',
    deviceName: '济宁港主码头-高清监控01',
    deviceId: 'JN-CAM-001',
    type: 'routine',
    cycle: 30,
    nextMaintenance: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    content: '清洁镜头表面，检查云台转动，测试变焦功能，校准图像参数',
    responsible: '王技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(25, 'day').format('YYYY-MM-DD')
  },
  {
    id: '2',
    planName: '梁山港航道传感器季度保养',
    deviceName: '梁山港航道-潮汐传感器01',
    deviceId: 'LS-SEN-001',
    type: 'preventive',
    cycle: 90,
    nextMaintenance: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    content: '校准传感器精度，检查防水密封性能，更新固件版本，测试数据传输',
    responsible: '李技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(75, 'day').format('YYYY-MM-DD')
  },
  {
    id: '3',
    planName: '济宁港控制中心网络设备月度保养',
    deviceName: '济宁港控制中心-核心交换机01',
    deviceId: 'JN-NET-003',
    type: 'routine',
    cycle: 30,
    nextMaintenance: dayjs().add(8, 'day').format('YYYY-MM-DD'),
    content: '清洁设备散热器，检查风扇运行状态，更新网络配置，测试端口连接',
    responsible: '赵技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(22, 'day').format('YYYY-MM-DD')
  },
  {
    id: '4',
    planName: '京杭运河监控设备紧急保养',
    deviceName: '京杭运河济宁段-航道监控01',
    deviceId: 'YH-CAM-001',
    type: 'emergency',
    cycle: 7,
    nextMaintenance: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    content: '紧急清洁镜头，检查网络连接，测试监控功能，确保航道安全监控',
    responsible: '钱技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(5, 'day').format('YYYY-MM-DD')
  },
  {
    id: '5',
    planName: '济宁港数据中心存储设备季度保养',
    deviceName: '济宁港数据中心-存储阵列01',
    deviceId: 'JN-STR-001',
    type: 'preventive',
    cycle: 90,
    nextMaintenance: dayjs().add(20, 'day').format('YYYY-MM-DD'),
    content: '检查硬盘健康状态，清理设备灰尘，测试RAID阵列，备份重要数据',
    responsible: '孙技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(70, 'day').format('YYYY-MM-DD')
  },
  {
    id: '6',
    planName: '济宁港锚地气象传感器月度保养',
    deviceName: '济宁港锚地-气象传感器01',
    deviceId: 'JN-SEN-004',
    type: 'routine',
    cycle: 30,
    nextMaintenance: dayjs().add(12, 'day').format('YYYY-MM-DD'),
    content: '清洁传感器表面，校准温度湿度读数，检查防水性能，测试数据传输',
    responsible: '周技师',
    status: 'active',
    lastMaintenance: dayjs().subtract(18, 'day').format('YYYY-MM-DD')
  }
])

/**
 * 模拟设备列表 - 基于真实港口监控系统
 */
const deviceList = ref<Device[]>([
  {
    id: 'JN-CAM-001',
    deviceName: '济宁港主码头-高清监控01',
    deviceType: '摄像头',
    status: 'online'
  },
  {
    id: 'LS-SEN-001',
    deviceName: '梁山港航道-潮汐传感器01',
    deviceType: '传感器',
    status: 'online'
  },
  {
    id: 'JN-NET-001',
    deviceName: '济宁港锚地-通信基站01',
    deviceType: '网络设备',
    status: 'online'
  },
  {
    id: 'YH-CAM-001',
    deviceName: '京杭运河济宁段-航道监控01',
    deviceType: '摄像头',
    status: 'online'
  },
  {
    id: 'JN-SEN-004',
    deviceName: '济宁港锚地-气象传感器01',
    deviceType: '传感器',
    status: 'fault'
  },
  {
    id: 'JN-NET-003',
    deviceName: '济宁港控制中心-核心交换机01',
    deviceType: '网络设备',
    status: 'online'
  },
  {
    id: 'JN-STR-001',
    deviceName: '济宁港数据中心-存储阵列01',
    deviceType: '存储设备',
    status: 'online'
  },
  {
    id: 'LS-STR-001',
    deviceName: '梁山港数据中心-存储设备01',
    deviceType: '存储设备',
    status: 'online'
  },
  {
    id: 'JN-SEN-005',
    deviceName: '济宁港散货码头-粉尘传感器01',
    deviceType: '传感器',
    status: 'online'
  },
  {
    id: 'JN-NET-002',
    deviceName: '济宁港散货码头-通信设备01',
    deviceType: '网络设备',
    status: 'maintenance'
  }
])

/**
 * 过滤后的数据
 */
const filteredFaults = computed(() => {
  if (!faultFilter.status) return faultRecords.value
  return faultRecords.value.filter(fault => fault.status === faultFilter.status)
})

const filteredRepairHistory = computed(() => {
  if (!repairDateRange.value || repairDateRange.value.length !== 2) {
    return repairHistory.value
  }
  const [start, end] = repairDateRange.value
  return repairHistory.value.filter(repair => {
    const repairTime = dayjs(repair.repairTime)
    return repairTime.isAfter(start) && repairTime.isBefore(end)
  })
})

const filteredMaintenancePlans = computed(() => {
  if (!planFilter.type) return maintenancePlans.value
  return maintenancePlans.value.filter(plan => plan.type === planFilter.type)
})

/**
 * 表格列定义
 */
const planColumns = [
  {
    title: '计划信息',
    key: 'planName',
    width: 200
  },
  {
    title: '保养类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    customRender: ({ text }: { text: string }) => getPlanTypeText(text)
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '下次保养',
    key: 'nextMaintenance',
    width: 150
  },
  {
    title: '负责人',
    dataIndex: 'responsible',
    key: 'responsible',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

/**
 * 获取故障状态颜色
 */
const getFaultStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'red',
    processing: 'orange',
    resolved: 'green',
    closed: 'default'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取故障状态文本
 */
const getFaultStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

/**
 * 获取计划状态颜色
 */
const getPlanStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    completed: 'blue',
    cancelled: 'red'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取计划状态文本
 */
const getPlanStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

/**
 * 获取计划类型文本
 */
const getPlanTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    routine: '例行保养',
    preventive: '预防性保养',
    emergency: '紧急保养'
  }
  return typeMap[type] || type
}

/**
 * 获取故障类型颜色
 */
const getFaultTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    hardware: 'blue',
    software: 'purple',
    network: 'orange',
    power: 'red',
    environmental: 'cyan',
    other: 'default'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取故障类型文本
 */
const getFaultTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    hardware: '硬件故障',
    software: '软件故障',
    network: '网络故障',
    power: '电源故障',
    environmental: '环境故障',
    other: '其他故障'
  }
  return typeMap[type] || type
}

/**
 * 获取故障等级颜色
 */
const getFaultLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'red'
  }
  return colorMap[level] || 'default'
}

/**
 * 获取故障等级文本
 */
const getFaultLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return levelMap[level] || level
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 获取倒计时文本
 */
const getCountdownText = (date: string) => {
  const now = dayjs()
  const targetDate = dayjs(date)
  const diff = targetDate.diff(now, 'day')
  
  if (diff < 0) {
    return '已过期'
  } else if (diff === 0) {
    return '今天'
  } else if (diff === 1) {
    return '明天'
  } else {
    return `${diff}天后`
  }
}

/**
 * 处理故障过滤
 */
const handleFaultFilterChange = () => {
  console.log('故障过滤条件变化:', faultFilter.status)
}

/**
 * 处理计划过滤
 */
const handlePlanFilterChange = () => {
  console.log('计划过滤条件变化:', planFilter.type)
}

/**
 * 处理维修日期变化
 */
const handleRepairDateChange = () => {
  console.log('维修日期范围变化:', repairDateRange.value)
}

/**
 * 显示添加故障弹窗
 */
const showAddFault = () => {
  faultModal.visible = true
  resetFaultForm()
}

/**
 * 显示添加保养计划弹窗
 */
const showAddMaintenancePlan = () => {
  planModal.visible = true
  resetPlanForm()
}

/**
 * 查看故障详情
 */
const viewFaultDetails = (fault: FaultRecord) => {
  selectedFault.value = fault
  faultDetailModal.visible = true
}

/**
 * 分配技师
 */
const assignTechnician = (fault: FaultRecord) => {
  selectedFault.value = fault
  assignTechnicianForm.technician = fault.assignedTechnician || ''
  assignTechnicianForm.estimatedTime = ''
  assignTechnicianForm.notes = ''
  assignTechnicianModal.visible = true
}

/**
 * 更新故障状态
 */
const updateFaultStatus = (fault: FaultRecord) => {
  selectedFault.value = fault
  updateStatusForm.status = fault.status
  updateStatusForm.notes = ''
  updateStatusForm.resolution = fault.resolution || ''
  updateStatusModal.visible = true
}

/**
 * 查看维修详情
 */
const viewRepairDetails = (repair: RepairHistory) => {
  selectedRepair.value = repair
  repairDetailModal.visible = true
}

/**
 * 导出维修历史
 */
const exportRepairHistory = () => {
  // 模拟导出功能
  const data = filteredRepairHistory.value.map(repair => ({
    维修标题: repair.title,
    维修设备: repair.deviceName,
    维修技师: repair.technician,
    维修时间: repair.repairTime,
    维修耗时: `${repair.duration}小时`,
    维修结果: repair.success ? '成功' : '失败',
    维修描述: repair.description,
    更换配件: repair.parts.join(', ') || '无',
    维修成本: `¥${repair.cost}`
  }))
  
  // 创建CSV内容
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
  ].join('\n')
  
  // 创建下载链接
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `维修历史_${dayjs().format('YYYY-MM-DD')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  message.success('维修历史导出成功')
}

/**
 * 执行保养计划
 */
const executePlan = (plan: MaintenancePlan) => {
  Modal.confirm({
    title: '确认执行',
    content: `确定要执行保养计划"${plan.planName}"吗？`,
    onOk: () => {
      // 更新保养计划状态为已完成
      plan.status = 'completed'
      plan.lastMaintenance = dayjs().format('YYYY-MM-DD')
      // 计算下次保养时间
      plan.nextMaintenance = dayjs().add(plan.cycle, 'day').format('YYYY-MM-DD')
      message.success('保养计划执行成功')
    }
  })
}

/**
 * 编辑保养计划
 */
const editPlan = (plan: MaintenancePlan) => {
  selectedPlan.value = plan
  Object.assign(editPlanForm, {
    planName: plan.planName,
    deviceId: plan.deviceId,
    type: plan.type,
    cycle: plan.cycle,
    nextMaintenance: plan.nextMaintenance,
    content: plan.content,
    responsible: plan.responsible
  })
  editPlanModal.visible = true
}

/**
 * 删除保养计划
 */
const deletePlan = (plan: MaintenancePlan) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除保养计划"${plan.planName}"吗？`,
    onOk: () => {
      const index = maintenancePlans.value.findIndex(p => p.id === plan.id)
      if (index > -1) {
        maintenancePlans.value.splice(index, 1)
        message.success('保养计划删除成功')
      }
    }
  })
}

/**
 * 提交故障表单
 */
const handleFaultSubmit = () => {
  // 获取设备名称
  const device = deviceList.value.find(d => d.id === faultForm.deviceId)
  if (!device) {
    message.error('设备不存在')
    return
  }
  
  // 创建新的故障记录
  const newFault: FaultRecord = {
    id: Date.now().toString(),
    title: faultForm.title!,
    deviceName: device.deviceName,
    deviceId: faultForm.deviceId!,
    type: faultForm.type!,
    level: faultForm.level!,
    status: 'pending',
    description: faultForm.description!,
    reporter: faultForm.reporter!,
    reportTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  // 添加到故障记录列表
  faultRecords.value.unshift(newFault)
  
  // 更新统计数据
  maintenanceStats.pendingFaults += 1
  
  message.success('故障记录添加成功')
  faultModal.visible = false
  resetFaultForm()
}

/**
 * 取消故障表单
 */
const handleFaultCancel = () => {
  faultModal.visible = false
  resetFaultForm()
}

/**
 * 提交保养计划表单
 */
const handlePlanSubmit = () => {
  // 获取设备名称
  const device = deviceList.value.find(d => d.id === planForm.deviceId)
  if (!device) {
    message.error('设备不存在')
    return
  }
  
  // 创建新的保养计划
  const newPlan: MaintenancePlan = {
    id: Date.now().toString(),
    planName: planForm.planName!,
    deviceName: device.deviceName,
    deviceId: planForm.deviceId!,
    type: planForm.type!,
    cycle: planForm.cycle!,
    nextMaintenance: planForm.nextMaintenance!,
    content: planForm.content!,
    responsible: planForm.responsible!,
    status: 'active'
  }
  
  // 添加到保养计划列表
  maintenancePlans.value.unshift(newPlan)
  
  // 更新统计数据
  maintenanceStats.todayMaintenance += 1
  
  message.success('保养计划添加成功')
  planModal.visible = false
  resetPlanForm()
}

/**
 * 取消保养计划表单
 */
const handlePlanCancel = () => {
  planModal.visible = false
  resetPlanForm()
}

/**
 * 重置故障表单
 */
const resetFaultForm = () => {
  Object.assign(faultForm, {
    title: '',
    deviceId: '',
    type: 'hardware',
    level: 'medium',
    description: '',
    reporter: ''
  })
}

/**
 * 重置保养计划表单
 */
const resetPlanForm = () => {
  Object.assign(planForm, {
    planName: '',
    deviceId: '',
    type: 'routine',
    cycle: 30,
    nextMaintenance: '',
    content: '',
    responsible: ''
  })
}

/**
 * 提交分配技师表单
 */
const handleAssignTechnicianSubmit = () => {
  if (!selectedFault.value || !assignTechnicianForm.technician) {
    message.error('请选择技师')
    return
  }
  
  // 更新故障记录
  selectedFault.value.assignedTechnician = assignTechnicianForm.technician
  selectedFault.value.status = 'processing'
  
  // 添加到维修历史
  const newRepair: RepairHistory = {
    id: Date.now().toString(),
    title: `修复${selectedFault.value.deviceName}故障`,
    deviceName: selectedFault.value.deviceName,
    deviceId: selectedFault.value.deviceId,
    technician: assignTechnicianForm.technician,
    repairTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    duration: 0,
    success: false,
    description: selectedFault.value.description,
    parts: [],
    cost: 0
  }
  
  repairHistory.value.unshift(newRepair)
  assignTechnicianModal.visible = false
  message.success('技师分配成功')
}

/**
 * 提交更新故障状态表单
 */
const handleUpdateStatusSubmit = () => {
  if (!selectedFault.value) return
  
  // 更新故障状态
  selectedFault.value.status = updateStatusForm.status as any
  if (updateStatusForm.resolution) {
    selectedFault.value.resolution = updateStatusForm.resolution
    selectedFault.value.resolveTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  // 如果状态为已解决，更新统计数据
  if (updateStatusForm.status === 'resolved') {
    maintenanceStats.pendingFaults = Math.max(0, maintenanceStats.pendingFaults - 1)
  }
  
  updateStatusModal.visible = false
  message.success('故障状态更新成功')
}

/**
 * 提交编辑保养计划表单
 */
const handleEditPlanSubmit = () => {
  if (!selectedPlan.value) return
  
  // 更新保养计划
  Object.assign(selectedPlan.value, editPlanForm)
  editPlanModal.visible = false
  message.success('保养计划更新成功')
}

/**
 * 重置分配技师表单
 */
const resetAssignTechnicianForm = () => {
  Object.assign(assignTechnicianForm, {
    technician: '',
    estimatedTime: '',
    notes: ''
  })
}

/**
 * 重置更新状态表单
 */
const resetUpdateStatusForm = () => {
  Object.assign(updateStatusForm, {
    status: 'pending',
    notes: '',
    resolution: ''
  })
}

/**
 * 重置编辑计划表单
 */
const resetEditPlanForm = () => {
  Object.assign(editPlanForm, {
    planName: '',
    deviceId: '',
    type: 'routine',
    cycle: 30,
    nextMaintenance: '',
    content: '',
    responsible: ''
  })
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  console.log('智能运维页面已加载')
})
</script>

<style lang="less" scoped>
.intelligent-maintenance {
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

  .maintenance-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  }

  .maintenance-content {
    margin-bottom: 24px;

    .maintenance-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .fault-list {
        max-height: 400px;
        overflow-y: auto;

        .fault-item {
          background: #fafafa;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #d9d9d9;

          &.fault-pending {
            border-left-color: #ff4d4f;
            background: #fff2f0;
          }

          &.fault-processing {
            border-left-color: #faad14;
            background: #fffbe6;
          }

          &.fault-resolved {
            border-left-color: #52c41a;
            background: #f6ffed;
          }

          &.fault-closed {
            border-left-color: #d9d9d9;
            background: #fafafa;
          }

          .fault-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .fault-title {
              font-weight: 500;
              color: #333;
              font-size: 14px;
            }
          }

          .fault-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;

            .fault-device {
              color: #666;
            }

            .fault-time {
              color: #999;
            }
          }

          .fault-description {
            font-size: 13px;
            color: #666;
            margin-bottom: 12px;
            line-height: 1.4;
          }

          .fault-actions {
            display: flex;
            gap: 8px;
          }
        }
      }

      .repair-history {
        max-height: 400px;
        overflow-y: auto;

        .repair-item {
          background: #fafafa;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #52c41a;

          .repair-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .repair-title {
              font-weight: 500;
              color: #333;
              font-size: 14px;
            }
          }

          .repair-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;

            .repair-device {
              color: #666;
            }

            .repair-technician {
              color: #666;
            }

            .repair-time {
              color: #999;
            }
          }

          .repair-duration {
            font-size: 12px;
            color: #666;
            margin-bottom: 12px;
          }

          .repair-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }

  .maintenance-planning {
    .planning-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .plan-info {
        .plan-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .plan-device {
          font-size: 12px;
          color: #666;
        }
      }

      .next-maintenance {
        .countdown {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }
    }
  }
}

// 弹窗样式
.fault-detail,
.repair-detail {
  .ant-descriptions-item-label {
    font-weight: 500;
    color: #333;
  }
  
  .ant-descriptions-item-content {
    color: #666;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .intelligent-maintenance {
    .maintenance-content {
      .ant-col-12 {
        width: 100%;
        margin-bottom: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  .intelligent-maintenance {
    padding: 16px;

    .maintenance-overview {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

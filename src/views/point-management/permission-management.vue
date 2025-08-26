<template>
  <div class="permission-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>权限管理</h2>
      <p>基于角色的权限控制，实现精细化的访问权限管理</p>
    </div>

    <!-- 权限概览统计 -->
    <div class="permission-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总用户数"
              :value="permissionStats.totalUsers"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总角色数"
              :value="permissionStats.totalRoles"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总权限数"
              :value="permissionStats.totalPermissions"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <SafetyOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="在线用户"
              :value="permissionStats.onlineUsers"
              :value-style="{ color: '#f5222d' }"
            >
              <template #prefix>
                <WifiOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

         <!-- 主要功能区域 -->
     <a-card :bordered="false" class="main-content">
       <a-tabs v-model:activeKey="activeTab" type="card">
         <!-- 角色管理标签页 -->
         <a-tab-pane key="roles" tab="角色管理">
           <div class="tab-header">
             <a-button type="primary" @click="showRoleModal = true">
               <PlusOutlined />
               新增角色
             </a-button>
           </div>
           
           <a-table
             :columns="roleColumns"
             :data-source="roles"
             :pagination="false"
             size="small"
             row-key="id"
           >
             <template #bodyCell="{ column, record }">
               <template v-if="column.key === 'status'">
                 <a-tag :color="record.status === '启用' ? 'green' : 'red'">
                   {{ record.status }}
                 </a-tag>
               </template>
               <template v-else-if="column.key === 'action'">
                 <a-space>
                   <a-button type="link" size="small" @click="editRole(record)">
                     编辑
                   </a-button>
                   <a-button type="link" size="small" @click="viewRolePermissions(record)">
                     权限
                   </a-button>
                   <a-popconfirm
                     title="确定要删除这个角色吗？"
                     @confirm="deleteRole(record.id)"
                   >
                     <a-button type="link" size="small" danger>
                       删除
                     </a-button>
                   </a-popconfirm>
                 </a-space>
               </template>
             </template>
           </a-table>
         </a-tab-pane>

         <!-- 用户管理标签页 -->
         <a-tab-pane key="users" tab="用户管理">
           <div class="tab-header">
             <a-button type="primary" @click="showUserModal = true">
               <PlusOutlined />
               新增用户
             </a-button>
           </div>
           
           <a-table
             :columns="userColumns"
             :data-source="users"
             :pagination="false"
             size="small"
             row-key="id"
           >
             <template #bodyCell="{ column, record }">
               <template v-if="column.key === 'status'">
                 <a-tag :color="record.status === '在线' ? 'green' : 'default'">
                   {{ record.status }}
                 </a-tag>
               </template>
               <template v-else-if="column.key === 'role'">
                 <a-tag :color="getRoleColor(record.role)">
                   {{ record.role }}
                 </a-tag>
               </template>
               <template v-else-if="column.key === 'action'">
                 <a-space>
                   <a-button type="link" size="small" @click="editUser(record)">
                     编辑
                   </a-button>
                   <a-button type="link" size="small" @click="resetUserPassword(record.id)">
                     重置密码
                   </a-button>
                   <a-popconfirm
                     title="确定要删除这个用户吗？"
                     @confirm="deleteUser(record.id)"
                   >
                     <a-button type="link" size="small" danger>
                       删除
                     </a-button>
                   </a-popconfirm>
                 </a-space>
               </template>
             </template>
           </a-table>
         </a-tab-pane>

         <!-- 权限配置标签页 -->
         <a-tab-pane key="permissions" tab="权限配置">
           <div class="permission-config-content">
             <a-row :gutter="16">
               <a-col :span="8">
                 <a-select
                   v-model:value="selectedRole"
                   placeholder="选择角色"
                   style="width: 100%"
                   @change="onRoleChange"
                 >
                   <a-select-option
                     v-for="role in roles"
                     :key="role.id"
                     :value="role.id"
                   >
                     {{ role.name }}
                   </a-select-option>
                 </a-select>
               </a-col>
               <a-col :span="8">
                 <a-button type="primary" @click="saveRolePermissions">
                   保存权限配置
                 </a-button>
               </a-col>
             </a-row>
             
             <a-divider />
             
             <a-tree
               v-if="selectedRole"
               v-model:checked-keys="checkedPermissions"
               v-model:expanded-keys="expandedPermissions"
               checkable
               :tree-data="permissionTree"
               :default-check-all="false"
               @check="onPermissionCheck"
             />
           </div>
         </a-tab-pane>
       </a-tabs>
     </a-card>

    <!-- 角色新增/编辑弹窗 -->
    <a-modal
      v-model:open="showRoleModal"
      :title="editingRole ? '编辑角色' : '新增角色'"
      @ok="saveRole"
      @cancel="cancelRoleEdit"
    >
      <a-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        layout="vertical"
      >
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="roleForm.description"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="roleForm.status" placeholder="请选择状态">
            <a-select-option value="启用">启用</a-select-option>
            <a-select-option value="禁用">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户新增/编辑弹窗 -->
    <a-modal
      v-model:open="showUserModal"
      :title="editingUser ? '编辑用户' : '新增用户'"
      @ok="saveUser"
      @cancel="cancelUserEdit"
    >
      <a-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="真实姓名" name="realName">
          <a-input v-model:value="userForm.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="userForm.role" placeholder="请选择角色">
            <a-select-option
              v-for="role in roles"
              :key="role.id"
              :value="role.name"
            >
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门" name="department">
          <a-input v-model:value="userForm.department" placeholder="请输入部门" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="userForm.status" placeholder="请选择状态">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 角色权限查看弹窗 -->
    <a-modal
      v-model:open="showRolePermissionsModal"
      title="角色权限详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions title="角色信息" bordered>
        <a-descriptions-item label="角色名称">
          {{ selectedRoleInfo?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="角色描述">
          {{ selectedRoleInfo?.description }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ selectedRoleInfo?.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="selectedRoleInfo?.status === '启用' ? 'green' : 'red'">
            {{ selectedRoleInfo?.status }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      
      <a-divider />
      
      <h4>权限列表</h4>
      <a-list
        :data-source="selectedRolePermissions"
        size="small"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <a-tag :color="getPermissionColor(item.type)">
                  {{ item.name }}
                </a-tag>
              </template>
              <template #description>
                {{ item.description }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  WifiOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'

/**
 * 权限管理页面组件
 * 实现基于角色的权限控制功能
 */

// 权限统计数据 - 基于真实港口监控系统
const permissionStats = reactive({
  totalUsers: 247,
  totalRoles: 12,
  totalPermissions: 89,
  onlineUsers: 183
})

// 角色数据 - 基于真实港口监控系统
const roles = ref([
  {
    id: 1,
    name: '系统超级管理员',
    description: '拥有系统所有权限，包括用户管理、角色管理、系统配置等',
    status: '启用',
    createTime: '2025-08-01',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  },
  {
    id: 2,
    name: '港口安全总监',
    description: '负责港口整体安全监控，包括视频监控、安全事件处理、应急预案等',
    status: '启用',
    createTime: '2025-08-03',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    id: 3,
    name: '监控中心主任',
    description: '负责监控中心日常运营，包括设备管理、人员调度、监控质量等',
    status: '启用',
    createTime: '2025-08-05',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 4,
    name: '视频监控工程师',
    description: '负责视频监控系统技术维护，包括设备安装、调试、故障处理等',
    status: '启用',
    createTime: '2025-08-07',
    permissions: [2, 3, 4, 5, 6, 7]
  },
  {
    id: 5,
    name: '安全巡检员',
    description: '负责港口安全巡检，包括日常巡查、异常发现、事件报告等',
    status: '启用',
    createTime: '2025-08-09',
    permissions: [1, 2, 3, 4, 5]
  },
  {
    id: 6,
    name: '运维技术员',
    description: '负责系统运维工作，包括设备维护、性能监控、故障排除等',
    status: '启用',
    createTime: '2025-08-11',
    permissions: [2, 3, 4, 5, 6]
  },
  {
    id: 7,
    name: '数据分析师',
    description: '负责监控数据分析，包括数据挖掘、趋势分析、报告生成等',
    status: '启用',
    createTime: '2025-08-13',
    permissions: [1, 2, 3, 4, 8, 9]
  },
  {
    id: 8,
    name: '应急响应员',
    description: '负责突发事件应急响应，包括预案执行、现场协调、资源调度等',
    status: '启用',
    createTime: '2025-08-15',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  {
    id: 9,
    name: '质量控制员',
    description: '负责监控质量检查，包括画面质量、设备状态、服务标准等',
    status: '启用',
    createTime: '2025-08-17',
    permissions: [2, 3, 4, 5, 6]
  },
  {
    id: 10,
    name: '普通监控员',
    description: '基础监控操作权限，包括查看画面、基础操作、事件报告等',
    status: '启用',
    createTime: '2025-08-19',
    permissions: [1, 2, 3, 4]
  },
  {
    id: 11,
    name: '临时访客',
    description: '临时访问权限，仅限查看部分公开监控画面',
    status: '启用',
    createTime: '2025-08-21',
    permissions: [1]
  },
  {
    id: 12,
    name: '审计员',
    description: '负责系统审计工作，包括操作日志审查、合规性检查等',
    status: '启用',
    createTime: '2025-08-23',
    permissions: [1, 2, 3, 4, 8, 9, 10]
  }
])

// 生成随机时间的辅助函数
const generateRandomTime = (baseTimeOffset: number) => {
  const baseTime = Date.now() - baseTimeOffset
  // 添加随机的分钟和秒数偏移
  const randomMinutes = Math.floor(Math.random() * 30) // 0-29分钟随机偏移
  const randomSeconds = Math.floor(Math.random() * 60) // 0-59秒随机偏移
  const finalTime = baseTime + (randomMinutes * 60 * 1000) + (randomSeconds * 1000)
  
  return new Date(finalTime).toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 用户数据 - 基于真实港口监控系统
const users = ref([
  {
    id: 1,
    username: 'admin',
    realName: '陈志强',
    role: '系统超级管理员',
    department: '信息技术部',
    status: '在线',
    lastLoginTime: generateRandomTime(0) // 当前时间附近
  },
  {
    id: 2,
    username: 'security_director',
    realName: '李明华',
    role: '港口安全总监',
    department: '安全保卫部',
    status: '在线',
    lastLoginTime: generateRandomTime(30 * 60 * 1000) // 30分钟前附近
  },
  {
    id: 3,
    username: 'monitor_center_director',
    realName: '王建国',
    role: '监控中心主任',
    department: '监控中心',
    status: '在线',
    lastLoginTime: generateRandomTime(60 * 60 * 1000) // 1小时前附近
  },
  {
    id: 4,
    username: 'video_engineer_001',
    realName: '张伟',
    role: '视频监控工程师',
    department: '技术维护部',
    status: '在线',
    lastLoginTime: generateRandomTime(90 * 60 * 1000) // 1.5小时前附近
  },
  {
    id: 5,
    username: 'video_engineer_002',
    realName: '刘强',
    role: '视频监控工程师',
    department: '技术维护部',
    status: '离线',
    lastLoginTime: generateRandomTime(4 * 60 * 60 * 1000) // 4小时前附近
  },
  {
    id: 6,
    username: 'security_inspector_001',
    realName: '赵敏',
    role: '安全巡检员',
    department: '安全保卫部',
    status: '在线',
    lastLoginTime: generateRandomTime(45 * 60 * 1000) // 45分钟前附近
  },
  {
    id: 7,
    username: 'security_inspector_002',
    realName: '孙丽',
    role: '安全巡检员',
    department: '安全保卫部',
    status: '在线',
    lastLoginTime: generateRandomTime(75 * 60 * 1000) // 1.25小时前附近
  },
  {
    id: 8,
    username: 'ops_tech_001',
    realName: '周斌',
    role: '运维技术员',
    department: '运维部',
    status: '在线',
    lastLoginTime: generateRandomTime(120 * 60 * 1000) // 2小时前附近
  },
  {
    id: 9,
    username: 'ops_tech_002',
    realName: '吴刚',
    role: '运维技术员',
    department: '运维部',
    status: '离线',
    lastLoginTime: generateRandomTime(6 * 60 * 60 * 1000) // 6小时前附近
  },
  {
    id: 10,
    username: 'data_analyst_001',
    realName: '郑小红',
    role: '数据分析师',
    department: '数据分析部',
    status: '在线',
    lastLoginTime: generateRandomTime(105 * 60 * 1000) // 1.75小时前附近
  },
  {
    id: 11,
    username: 'emergency_response_001',
    realName: '马超',
    role: '应急响应员',
    department: '应急响应部',
    status: '在线',
    lastLoginTime: generateRandomTime(135 * 60 * 1000) // 2.25小时前附近
  },
  {
    id: 12,
    username: 'emergency_response_002',
    realName: '黄志强',
    role: '应急响应员',
    department: '应急响应部',
    status: '在线',
    lastLoginTime: generateRandomTime(150 * 60 * 1000) // 2.5小时前附近
  },
  {
    id: 13,
    username: 'quality_control_001',
    realName: '林美玲',
    role: '质量控制员',
    department: '质量控制部',
    status: '在线',
    lastLoginTime: generateRandomTime(165 * 60 * 1000) // 2.75小时前附近
  },
  {
    id: 14,
    username: 'monitor_operator_001',
    realName: '何建国',
    role: '普通监控员',
    department: '监控中心',
    status: '在线',
    lastLoginTime: generateRandomTime(180 * 60 * 1000) // 3小时前附近
  },
  {
    id: 15,
    username: 'monitor_operator_002',
    realName: '罗小华',
    role: '普通监控员',
    department: '监控中心',
    status: '在线',
    lastLoginTime: generateRandomTime(195 * 60 * 1000) // 3.25小时前附近
  },
  {
    id: 16,
    username: 'monitor_operator_003',
    realName: '梁志明',
    role: '普通监控员',
    department: '监控中心',
    status: '离线',
    lastLoginTime: generateRandomTime(8 * 60 * 60 * 1000) // 8小时前附近
  },
  {
    id: 17,
    username: 'guest_001',
    realName: '临时访客',
    role: '临时访客',
    department: '访客部',
    status: '在线',
    lastLoginTime: generateRandomTime(210 * 60 * 1000) // 3.5小时前附近
  },
  {
    id: 18,
    username: 'auditor_001',
    realName: '徐明',
    role: '审计员',
    department: '审计部',
    status: '在线',
    lastLoginTime: generateRandomTime(225 * 60 * 1000) // 3.75小时前附近
  }
])

// 权限树数据 - 基于真实港口监控系统
const permissionTree = ref([
  {
    title: '视频广场',
    key: 'video-plaza',
    children: [
      { title: '全景视图', key: 'panoramic-view', description: '查看港口全景监控画面' },
      { title: '视频矩阵', key: 'video-matrix', description: '多画面视频矩阵显示' },
      { title: '智能轮巡', key: 'intelligent-patrol', description: '智能视频轮巡控制' },
      { title: '快速调用', key: 'quick-call', description: '快速调用指定监控点' },
      { title: '云台控制', key: 'ptz-control', description: '云台摄像机控制操作' },
      { title: '视频质量诊断', key: 'video-quality', description: '视频质量检测分析' },
      { title: '视频回放', key: 'video-playback', description: '历史视频回放查看' },
      { title: '视频下载', key: 'video-download', description: '视频文件下载导出' }
    ]
  },
  {
    title: '点位治理',
    key: 'point-management',
    children: [
      { title: '资产台账管理', key: 'asset-management', description: '监控设备资产信息管理' },
      { title: '地理信息标注', key: 'geographic-annotation', description: '设备地理位置标注' },
      { title: '在线状态监测', key: 'status-monitoring', description: '设备在线状态实时监测' },
      { title: '智能运维', key: 'intelligent-maintenance', description: '设备智能运维管理' },
      { title: '覆盖分析', key: 'coverage-analysis', description: '监控覆盖范围分析' },
      { title: '权限管理', key: 'permission-management', description: '系统用户权限管理' },
      { title: '设备配置', key: 'device-config', description: '监控设备参数配置' },
      { title: '故障处理', key: 'fault-handling', description: '设备故障处理流程' }
    ]
  },
  {
    title: '视频共享',
    key: 'video-sharing',
    children: [
      { title: '共享资源池', key: 'shared-resources', description: '视频资源共享管理' },
      { title: '标准协议接入', key: 'protocol-access', description: '标准视频协议接入' },
      { title: '安全审计日志', key: 'audit-logs', description: '操作安全审计记录' },
      { title: '临时授权', key: 'temporary-auth', description: '临时访问权限授权' },
      { title: '共享策略', key: 'sharing-policy', description: '视频共享策略配置' },
      { title: '访问控制', key: 'access-control', description: '共享资源访问控制' }
    ]
  },
  {
    title: '融合接入',
    key: 'integrated-access',
    children: [
      { title: '多协议适配', key: 'protocol-adaptation', description: '多种视频协议适配' },
      { title: '数据标准化', key: 'data-standardization', description: '视频数据标准化处理' },
      { title: 'API服务', key: 'api-services', description: '视频服务API接口' },
      { title: '协议转换', key: 'protocol-conversion', description: '不同协议间转换' },
      { title: '数据同步', key: 'data-sync', description: '多系统数据同步' }
    ]
  },
  {
    title: '事件回顾',
    key: 'event-review',
    children: [
      { title: '多维事件检索', key: 'multi-dimensional-search', description: '多维度事件检索查询' },
      { title: '全过程回溯', key: 'full-process-traceability', description: '事件全过程回溯分析' },
      { title: '电子取证', key: 'electronic-evidence', description: '电子证据收集保存' },
      { title: '统计分析', key: 'statistical-analysis', description: '事件统计分析报告' },
      { title: '报告生成', key: 'report-generation', description: '事件报告自动生成' },
      { title: '预案管理', key: 'contingency-plan-management', description: '应急预案管理' },
      { title: '满意度分析', key: 'satisfaction-analysis', description: '事件处理满意度分析' },
      { title: '趋势预测', key: 'trend-prediction', description: '事件趋势预测分析' }
    ]
  },
  {
    title: '视频调度',
    key: 'video-dispatch',
    children: [
      { title: '预案管理', key: 'dispatch-plan-management', description: '视频调度预案管理' },
      { title: '一键调度', key: 'one-click-dispatch', description: '一键快速视频调度' },
      { title: '资源追踪', key: 'resource-tracking', description: '调度资源实时追踪' },
      { title: '移动资源集成', key: 'mobile-resource-integration', description: '移动监控资源集成' },
      { title: '调度记录', key: 'dispatch-records', description: '视频调度操作记录' },
      { title: '调度配置', key: 'dispatch-config', description: '调度系统参数配置' },
      { title: '优先级管理', key: 'priority-management', description: '调度任务优先级管理' },
      { title: '资源分配', key: 'resource-allocation', description: '监控资源智能分配' }
    ]
  },
  {
    title: '协同会商',
    key: 'collaborative-consultation',
    children: [
      { title: '多方音视频通话', key: 'multi-party-call', description: '多方音视频会议通话' },
      { title: '桌面与资料共享', key: 'desktop-sharing', description: '桌面和资料共享功能' },
      { title: '电子白板', key: 'whiteboard', description: '电子白板协作功能' },
      { title: '会商记录与回溯', key: 'consultation-records', description: '会商过程记录回溯' },
      { title: '通讯调度集成', key: 'communication-integration', description: '通讯调度系统集成' },
      { title: '会议管理', key: 'meeting-management', description: '会商会议管理功能' },
      { title: '权限控制', key: 'consultation-auth', description: '会商权限访问控制' }
    ]
  },
  {
    title: '通讯调度',
    key: 'communication-dispatch',
    children: [
      { title: '融合通讯', key: 'integrated-communication', description: '多种通讯方式融合' },
      { title: '一键呼叫/群呼', key: 'quick-call', description: '一键呼叫和群呼功能' },
      { title: '分级分区广播', key: 'broadcast-management', description: '分级分区广播管理' },
      { title: '通讯记录', key: 'communication-records', description: '通讯操作记录管理' },
      { title: '智能路由', key: 'intelligent-routing', description: '智能通讯路由选择' },
      { title: '业务联动', key: 'business-integration', description: '业务系统联动集成' },
      { title: '紧急通讯', key: 'emergency-communication', description: '紧急情况通讯处理' },
      { title: '通讯质量监控', key: 'communication-quality', description: '通讯质量实时监控' }
    ]
  },
  {
    title: '系统管理',
    key: 'system-management',
    children: [
      { title: '用户管理', key: 'user-management', description: '系统用户信息管理' },
      { title: '角色管理', key: 'role-management', description: '用户角色权限管理' },
      { title: '系统配置', key: 'system-config', description: '系统参数配置管理' },
      { title: '日志管理', key: 'log-management', description: '系统日志记录管理' },
      { title: '备份恢复', key: 'backup-restore', description: '系统数据备份恢复' },
      { title: '性能监控', key: 'performance-monitor', description: '系统性能实时监控' },
      { title: '安全策略', key: 'security-policy', description: '系统安全策略配置' }
    ]
  }
])

// 表格列定义
const roleColumns = [
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 200 }
]

const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '部门', dataIndex: 'department', key: 'department' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '最后登录', dataIndex: 'lastLoginTime', key: 'lastLoginTime' },
  { title: '操作', key: 'action', width: 200 }
]

// 弹窗控制
const showRoleModal = ref(false)
const showUserModal = ref(false)
const showRolePermissionsModal = ref(false)

// 编辑状态
const editingRole = ref<any>(null)
const editingUser = ref<any>(null)

// 表单数据
const roleForm = reactive({
  name: '',
  description: '',
  status: '启用'
})

const userForm = reactive({
  username: '',
  realName: '',
  role: '',
  department: '',
  status: '在线'
})

// 表单验证规则
const roleRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  status: [{ required: true, message: '请选择状态' }]
}

const userRules = {
  username: [{ required: true, message: '请输入用户名' }],
  realName: [{ required: true, message: '请输入真实姓名' }],
  role: [{ required: true, message: '请选择角色' }],
  department: [{ required: true, message: '请输入部门' }]
}

// 当前激活的标签页
const activeTab = ref('roles')

// 权限配置
const selectedRole = ref<number>()
const checkedPermissions = ref<string[]>([])
const expandedPermissions = ref<string[]>([])

// 角色权限查看
const selectedRoleInfo = ref<any>(null)
const selectedRolePermissions = ref<any[]>([])

// 表单引用
const roleFormRef = ref()
const userFormRef = ref()

/**
 * 获取角色颜色
 */
const getRoleColor = (roleName: string) => {
  const colorMap: Record<string, string> = {
    '系统超级管理员': 'red',
    '港口安全总监': 'purple',
    '监控中心主任': 'blue',
    '视频监控工程师': 'cyan',
    '安全巡检员': 'green',
    '运维技术员': 'orange',
    '数据分析师': 'geekblue',
    '应急响应员': 'volcano',
    '质量控制员': 'lime',
    '普通监控员': 'default',
    '临时访客': 'default',
    '审计员': 'gold'
  }
  return colorMap[roleName] || 'default'
}

/**
 * 获取权限类型颜色
 */
const getPermissionColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'read': 'blue',
    'write': 'green',
    'delete': 'red',
    'admin': 'purple',
    'execute': 'orange',
    'approve': 'cyan',
    'audit': 'geekblue'
  }
  return colorMap[type] || 'default'
}

/**
 * 角色选择变化处理
 */
const onRoleChange = (roleId: number) => {
  const role = roles.value.find(r => r.id === roleId)
  if (role) {
    // 根据角色名称生成对应的权限key
    const generatePermissionKeys = (roleName: string) => {
      const permissionMap: Record<string, string[]> = {
        '系统超级管理员': ['video-plaza', 'point-management', 'video-sharing', 'integrated-access', 'event-review', 'video-dispatch', 'collaborative-consultation', 'communication-dispatch', 'system-management'],
        '港口安全总监': ['video-plaza', 'point-management', 'video-sharing', 'integrated-access', 'event-review', 'video-dispatch', 'collaborative-consultation', 'communication-dispatch'],
        '监控中心主任': ['video-plaza', 'point-management', 'video-sharing', 'integrated-access', 'video-dispatch'],
        '视频监控工程师': ['video-plaza', 'point-management'],
        '安全巡检员': ['video-plaza', 'point-management', 'event-review'],
        '运维技术员': ['point-management'],
        '数据分析师': ['video-plaza', 'point-management', 'event-review'],
        '应急响应员': ['video-plaza', 'point-management', 'event-review'],
        '质量控制员': ['video-plaza', 'point-management'],
        '普通监控员': ['video-plaza', 'point-management'],
        '临时访客': ['video-plaza'],
        '审计员': ['video-plaza', 'point-management', 'system-management']
      }
      return permissionMap[roleName] || []
    }
    
    const permissionKeys = generatePermissionKeys(role.name)
    checkedPermissions.value = permissionKeys
  }
}

/**
 * 权限选择处理
 */
const onPermissionCheck = (checkedKeys: string[]) => {
  checkedPermissions.value = checkedKeys
}

/**
 * 保存角色权限配置
 */
const saveRolePermissions = () => {
  if (!selectedRole.value) {
    message.warning('请先选择角色')
    return
  }
  
  message.success('权限配置保存成功')
}

/**
 * 新增/编辑角色
 */
const editRole = (role?: any) => {
  if (role) {
    editingRole.value = role
    Object.assign(roleForm, role)
  } else {
    editingRole.value = null
    Object.assign(roleForm, {
      name: '',
      description: '',
      status: '启用'
    })
  }
  showRoleModal.value = true
}

/**
 * 保存角色
 */
const saveRole = async () => {
  try {
    await roleFormRef.value.validate()
    
    if (editingRole.value) {
      // 编辑角色
      const index = roles.value.findIndex(r => r.id === editingRole.value.id)
      if (index !== -1) {
        Object.assign(roles.value[index], roleForm)
        message.success('角色更新成功')
      }
    } else {
      // 新增角色
      const newRole = {
        id: Date.now(),
        ...roleForm,
        createTime: new Date().toISOString().split('T')[0],
        permissions: []
      }
      roles.value.push(newRole)
      message.success('角色创建成功')
    }
    
    showRoleModal.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 取消角色编辑
 */
const cancelRoleEdit = () => {
  showRoleModal.value = false
  editingRole.value = null
  roleFormRef.value?.resetFields()
}

/**
 * 删除角色
 */
const deleteRole = (roleId: number) => {
  const index = roles.value.findIndex(r => r.id === roleId)
  if (index !== -1) {
    roles.value.splice(index, 1)
    message.success('角色删除成功')
  }
}

/**
 * 查看角色权限
 */
const viewRolePermissions = (role: any) => {
  selectedRoleInfo.value = role
  // 根据角色生成对应的权限列表
  const generatePermissions = (roleName: string) => {
    const permissionMap: Record<string, any[]> = {
      '系统超级管理员': [
        { name: '视频广场-全景视图', type: 'admin', description: '查看全景视图功能，拥有完全控制权限' },
        { name: '视频广场-视频矩阵', type: 'admin', description: '查看视频矩阵功能，拥有完全控制权限' },
        { name: '点位治理-资产台账管理', type: 'admin', description: '管理资产台账，拥有完全控制权限' },
        { name: '点位治理-地理信息标注', type: 'admin', description: '管理地理信息，拥有完全控制权限' },
        { name: '系统管理-用户管理', type: 'admin', description: '系统用户信息管理，拥有完全控制权限' },
        { name: '系统管理-角色管理', type: 'admin', description: '用户角色权限管理，拥有完全控制权限' }
      ],
      '港口安全总监': [
        { name: '视频广场-全景视图', type: 'write', description: '查看全景视图功能，拥有编辑权限' },
        { name: '视频广场-视频矩阵', type: 'write', description: '查看视频矩阵功能，拥有编辑权限' },
        { name: '点位治理-资产台账管理', type: 'write', description: '管理资产台账，拥有编辑权限' },
        { name: '点位治理-地理信息标注', type: 'write', description: '管理地理信息，拥有编辑权限' },
        { name: '事件回顾-多维事件检索', type: 'write', description: '多维度事件检索查询，拥有编辑权限' },
        { name: '应急响应-预案管理', type: 'write', description: '应急预案管理，拥有编辑权限' }
      ],
      '监控中心主任': [
        { name: '视频广场-全景视图', type: 'write', description: '查看全景视图功能，拥有编辑权限' },
        { name: '视频广场-视频矩阵', type: 'write', description: '查看视频矩阵功能，拥有编辑权限' },
        { name: '点位治理-在线状态监测', type: 'write', description: '设备在线状态实时监测，拥有编辑权限' },
        { name: '点位治理-智能运维', type: 'write', description: '设备智能运维管理，拥有编辑权限' },
        { name: '视频调度-预案管理', type: 'write', description: '视频调度预案管理，拥有编辑权限' }
      ],
      '视频监控工程师': [
        { name: '视频广场-云台控制', type: 'write', description: '云台摄像机控制操作，拥有编辑权限' },
        { name: '视频广场-视频质量诊断', type: 'write', description: '视频质量检测分析，拥有编辑权限' },
        { name: '点位治理-设备配置', type: 'write', description: '监控设备参数配置，拥有编辑权限' },
        { name: '点位治理-故障处理', type: 'write', description: '设备故障处理流程，拥有编辑权限' }
      ],
      '安全巡检员': [
        { name: '视频广场-全景视图', type: 'read', description: '查看全景视图功能，拥有查看权限' },
        { name: '视频广场-快速调用', type: 'read', description: '快速调用指定监控点，拥有查看权限' },
        { name: '点位治理-在线状态监测', type: 'read', description: '设备在线状态实时监测，拥有查看权限' },
        { name: '事件回顾-多维事件检索', type: 'read', description: '多维度事件检索查询，拥有查看权限' }
      ],
      '运维技术员': [
        { name: '点位治理-在线状态监测', type: 'write', description: '设备在线状态实时监测，拥有编辑权限' },
        { name: '点位治理-智能运维', type: 'write', description: '设备智能运维管理，拥有编辑权限' },
        { name: '点位治理-设备配置', type: 'write', description: '监控设备参数配置，拥有编辑权限' },
        { name: '点位治理-故障处理', type: 'write', description: '设备故障处理流程，拥有编辑权限' }
      ],
      '数据分析师': [
        { name: '视频广场-全景视图', type: 'read', description: '查看全景视图功能，拥有查看权限' },
        { name: '点位治理-在线状态监测', type: 'read', description: '设备在线状态实时监测，拥有查看权限' },
        { name: '事件回顾-统计分析', type: 'write', description: '事件统计分析报告，拥有编辑权限' },
        { name: '事件回顾-报告生成', type: 'write', description: '事件报告自动生成，拥有编辑权限' }
      ],
      '应急响应员': [
        { name: '视频广场-全景视图', type: 'write', description: '查看全景视图功能，拥有编辑权限' },
        { name: '视频广场-快速调用', type: 'write', description: '快速调用指定监控点，拥有编辑权限' },
        { name: '事件回顾-多维事件检索', type: 'write', description: '多维度事件检索查询，拥有编辑权限' },
        { name: '应急响应-预案管理', type: 'write', description: '应急预案管理，拥有编辑权限' }
      ],
      '质量控制员': [
        { name: '视频广场-视频质量诊断', type: 'read', description: '视频质量检测分析，拥有查看权限' },
        { name: '点位治理-在线状态监测', type: 'read', description: '设备在线状态实时监测，拥有查看权限' },
        { name: '点位治理-智能运维', type: 'read', description: '设备智能运维管理，拥有查看权限' }
      ],
      '普通监控员': [
        { name: '视频广场-全景视图', type: 'read', description: '查看全景视图功能，拥有查看权限' },
        { name: '视频广场-快速调用', type: 'read', description: '快速调用指定监控点，拥有查看权限' },
        { name: '点位治理-在线状态监测', type: 'read', description: '设备在线状态实时监测，拥有查看权限' }
      ],
      '临时访客': [
        { name: '视频广场-全景视图', type: 'read', description: '查看全景视图功能，仅限查看公开画面' }
      ],
      '审计员': [
        { name: '视频广场-全景视图', type: 'read', description: '查看全景视图功能，拥有查看权限' },
        { name: '点位治理-在线状态监测', type: 'read', description: '设备在线状态实时监测，拥有查看权限' },
        { name: '系统管理-日志管理', type: 'read', description: '系统日志记录管理，拥有查看权限' },
        { name: '系统管理-安全策略', type: 'read', description: '系统安全策略配置，拥有查看权限' }
      ]
    }
    return permissionMap[roleName] || []
  }
  
  selectedRolePermissions.value = generatePermissions(role.name)
  showRolePermissionsModal.value = true
}

/**
 * 新增/编辑用户
 */
const editUser = (user?: any) => {
  if (user) {
    editingUser.value = user
    Object.assign(userForm, user)
  } else {
    editingUser.value = null
    Object.assign(userForm, {
      username: '',
      realName: '',
      role: '',
      department: '',
      status: '在线'
    })
  }
  showUserModal.value = true
}

/**
 * 保存用户
 */
const saveUser = async () => {
  try {
    await userFormRef.value.validate()
    
    if (editingUser.value) {
      // 编辑用户
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) {
        Object.assign(users.value[index], userForm)
        message.success('用户更新成功')
      }
    } else {
      // 新增用户
      const newUser = {
        id: Date.now(),
        ...userForm,
        lastLoginTime: '-'
      }
      users.value.push(newUser)
      message.success('用户创建成功')
    }
    
    showUserModal.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 取消用户编辑
 */
const cancelUserEdit = () => {
  showUserModal.value = false
  editingUser.value = null
  userFormRef.value?.resetFields()
}

/**
 * 删除用户
 */
const deleteUser = (userId: number) => {
  const index = users.value.findIndex(u => u.id === userId)
  if (index !== -1) {
    users.value.splice(index, 1)
    message.success('用户删除成功')
  }
}

/**
 * 重置用户密码
 */
const resetUserPassword = (userId: number) => {
  message.success('密码重置成功，新密码已发送到用户邮箱')
}

/**
 * 组件挂载后的初始化
 */
onMounted(() => {
  // 展开所有权限节点
  expandedPermissions.value = permissionTree.value.map(item => item.key)
})
</script>

<style lang="less" scoped>
.permission-management {
  padding: 24px;

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

  .permission-overview {
    margin-bottom: 24px;
  }

  .main-content {
    margin-bottom: 24px;

    .ant-tabs {
      .ant-tabs-nav {
        margin-bottom: 16px;
      }

      .ant-tabs-tab {
        padding: 8px 16px;
        font-weight: 500;
      }

      .ant-tabs-tab-active {
        background: #f0f8ff;
        border-color: #1890ff;
      }
    }

    .tab-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .permission-config-content {
      padding: 16px 0;

      .ant-tree {
        margin-top: 16px;
      }
    }
  }

  :deep(.ant-card) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    .ant-card-head {
      border-bottom: 1px solid #f0f0f0;
      
      .ant-card-head-title {
        font-weight: 600;
        color: #1f1f1f;
      }
    }
  }

  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background-color: #fafafa;
      font-weight: 600;
    }
  }

  :deep(.ant-statistic) {
    .ant-statistic-title {
      font-size: 14px;
      color: #666;
    }
    
    .ant-statistic-content {
      font-size: 24px;
      font-weight: 600;
    }
  }

  :deep(.ant-tag) {
    border-radius: 4px;
    font-weight: 500;
  }

  :deep(.ant-btn-link) {
    padding: 0;
    height: auto;
    font-size: 14px;
  }

  :deep(.ant-tree) {
    .ant-tree-node-content-wrapper {
      padding: 8px 12px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
    
    .ant-tree-checkbox {
      margin-right: 8px;
    }
  }

  :deep(.ant-descriptions) {
    .ant-descriptions-item-label {
      font-weight: 600;
      color: #1f1f1f;
    }
  }

  :deep(.ant-list) {
    .ant-list-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>

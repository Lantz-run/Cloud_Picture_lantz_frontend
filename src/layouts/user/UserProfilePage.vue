<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-cover"></div>
      <div class="profile-info">
        <div class="avatar-wrapper">
          <a-avatar
            :size="responsiveAvatarSize"
            :src="userInfo.userAvatar"
            class="profile-avatar"
            :style="{ backgroundColor: !userInfo.userAvatar ? getColorByString(userInfo.userAccount) : undefined }"
          >
            <template v-if="!userInfo.userAvatar" >
              {{ userInfo.userAccount?.charAt(0)?.toUpperCase() }}
            </template>
          </a-avatar>
        </div>
        <div class="user-basic-info">
          <h1 class="user-account" style="color: black">{{ userInfo.userAccount }}</h1>
          <p class="username" style="color: black">@{{ userInfo.userName }}</p>
          <a-tag :color="userInfo.userRole === 'admin' ? 'green' : 'blue'" class="role-tag">
            {{ userInfo.userRole === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <a-row :gutter="[responsiveGutter, responsiveGutter]">
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <a-card class="info-card">
            <template #title>
              <div class="card-title">
                <UserOutlined />
                <span>个人资料</span>
                <a-button
                  type="primary"
                  class="edit-button"
                  @click="showEditModal"
                >
                  <template #icon><EditOutlined /></template>
                  编辑资料
                </a-button>
              </div>
            </template>
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="用户账号">
                {{ userInfo.userAccount }}
              </a-descriptions-item>
              <a-descriptions-item label="用户昵称">
                {{ userInfo.userName }}
              </a-descriptions-item>
              <a-descriptions-item label="用户角色">
                <a-tag :color="userInfo.userRole === 'admin' ? 'green' : 'blue'">
                  {{ userInfo.userRole === 'admin' ? '管理员' : '普通用户' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="个人简介">
                {{ userInfo.userProfile || '这个人很懒，什么都没写~' }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ dayjs(userInfo.createTime).format('YYYY-MM-DD HH:mm:ss') }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                {{ dayjs(userInfo.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 编辑资料对话框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑个人资料"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
      :maskClosable="false"
      :width="modalWidth"
      class="edit-modal"
    >
      <a-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        :label-col="responsiveLabelCol"
        :wrapper-col="responsiveWrapperCol"
      >
        <a-form-item label="用户账号" name="userAccount" >
          <a-input v-model:value="editForm.userAccount" disabled />
        </a-form-item>

        <a-form-item label="用户昵称" name="userName">
          <a-input
            v-model:value="editForm.userName"
            placeholder="请输入用户昵称"
            :maxLength="20"
            show-count
          />
        </a-form-item>

        <a-form-item label="用户头像" name="userAvatar">
          <a-input
            v-model:value="editForm.userAvatar"
            placeholder="请输入头像URL"
            :maxLength="256"
            show-count
          />
          <div class="avatar-preview" v-if="editForm.userAvatar">
            <a-avatar :size="64" :src="editForm.userAvatar">
              <template v-if="!editForm.userAvatar">
                {{ editForm.userAccount?.charAt(0)?.toUpperCase() }}
              </template>
            </a-avatar>
          </div>
        </a-form-item>

        <a-form-item label="用户角色" name="userRole">
          <a-input
            v-model:value="editForm.userRole"
            disabled
            :value="userInfo.userRole === 'admin' ? '管理员' : '普通用户'"
          />
        </a-form-item>

        <a-form-item label="个人简介" name="userProfile">
          <a-textarea
            v-model:value="editForm.userProfile"
            placeholder="请输入个人简介"
            :rows="4"
            :maxLength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { UserOutlined, EditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import dayjs from 'dayjs'
import {
  getUserVoByIdUsingGet,
  updateMyUserUsingPost
} from '@/api/userController'
import { useLoginUserStore } from '@/stores/user'
import { getColorByString } from '@/utils/colorUtils'

const loginUserStore = useLoginUserStore()
const userInfo = ref<any>({})

const fetchUserInfo = async () => {
  try {
    const res = await getUserVoByIdUsingGet({ id: loginUserStore.loginUser.id })
    if (res.data.code === 0 && res.data.data) {
      userInfo.value = res.data.data
    } else {
      message.error('获取用户信息失败')
    }
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 编辑表单相关
const editModalVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: '',
  userAccount: '',
  userName: '',
  userAvatar: '',
  userRole: '',
  userProfile: '',
})

// 编辑表单验证规则
const editRules: Record<string, Rule[]> = {
  userName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符之间', trigger: 'blur' }
  ],
  userAvatar: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  userProfile: [
    { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
  ]
}

// 显示编辑对话框
const showEditModal = () => {
  Object.assign(editForm, userInfo.value)
  editModalVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate()
    const res = await updateMyUserUsingPost({
      ...editForm,
    })
    if (res.data.code === 0) {
      message.success('更新个人资料成功')
      editModalVisible.value = false
      // 重新获取用户信息
      await fetchUserInfo()
    } else {
      message.error('更新个人资料失败: ' + res.data.message)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消编辑
const handleEditCancel = () => {
  editModalVisible.value = false
  editFormRef.value?.resetFields()
}

// 响应式布局相关
const responsiveAvatarSize = computed(() => {
  return window.innerWidth < 768 ? 80 : 120
})

const responsiveGutter = computed(() => {
  return window.innerWidth < 768 ? 16 : 24
})

const modalWidth = computed(() => {
  return window.innerWidth < 768 ? '90%' : 600
})

const responsiveLabelCol = computed(() => {
  return window.innerWidth < 768 ? { span: 6 } : { span: 4 }
})

const responsiveWrapperCol = computed(() => {
  return window.innerWidth < 768 ? { span: 18 } : { span: 20 }
})

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 24px);
  width: 100%;
  box-sizing: border-box;
}

.profile-header {
  position: relative;
  margin-bottom: clamp(16px, 3vw, 24px);
  border-radius: clamp(12px, 2vw, 16px);
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-cover {
  height: clamp(150px, 20vw, 200px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.profile-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.1"/></svg>');
  opacity: 0.5;
}

.profile-info {
  position: relative;
  padding: 0 clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px);
  margin-top: clamp(-40px, -5vw, -60px);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: clamp(16px, 2vw, 24px);
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-basic-info {
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.username {
  margin: 4px 0;
  font-size: clamp(14px, 2vw, 16px);
  opacity: 0.9;

}

.user-account {
  margin: 0;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 600;
}

.role-tag {
  margin-top: 8px;
}

.info-card {
  border-radius: clamp(12px, 2vw, 16px);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 500;
}

.edit-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar-preview {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

:deep(.ant-descriptions-item-label) {
  width: clamp(100px, 15vw, 120px);
  font-weight: 500;
  background: #fafafa;
}

:deep(.ant-descriptions-item-content) {
  padding: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.edit-modal .ant-modal-content) {
  border-radius: clamp(12px, 2vw, 16px);
  overflow: hidden;
}

:deep(.edit-modal .ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px);
  margin-bottom: 0;
}

:deep(.edit-modal .ant-modal-body) {
  padding: clamp(16px, 3vw, 24px);
}

:deep(.edit-modal .ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px);
  margin-top: 0;
}

:deep(.edit-modal .ant-form-item-label) {
  font-weight: 500;
}

:deep(.edit-modal .ant-input-disabled) {
  background-color: #fafafa;
  color: rgba(0, 0, 0, 0.65);
}

:deep(.edit-modal .ant-input-affix-wrapper-disabled) {
  background-color: #fafafa;
}

:deep(.edit-modal .ant-input[disabled]) {
  background-color: #fafafa;
  color: rgba(0, 0, 0, 0.65);
}

@media screen and (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-basic-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .role-tag {
    margin-top: 8px;
  }

  :deep(.ant-form-item-label) {
    text-align: left;
  }

  :deep(.ant-modal-footer) {
    text-align: center;
  }
}
</style>

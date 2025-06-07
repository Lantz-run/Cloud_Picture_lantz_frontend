<template>
  <div id="user-edit-page">
    <a-card 
      title="编辑用户信息" 
      :bordered="false"
      class="edit-card"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        :label-col="responsiveLabelCol"
        :wrapper-col="responsiveWrapperCol"
      >
        <a-form-item label="用户账号" name="userAccount">
          <a-input v-model:value="formState.userAccount" disabled />
        </a-form-item>
        
        <a-form-item label="用户昵称" name="userName">
          <a-input v-model:value="formState.userName" placeholder="请输入用户昵称" />
        </a-form-item>

        <a-form-item label="用户头像" name="userAvatar">
          <a-input v-model:value="formState.userAvatar" placeholder="请输入头像URL" />
        </a-form-item>

        <a-form-item label="用户角色" name="userRole">
          <a-select v-model:value="formState.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="用户简介" name="userProfile">
          <a-textarea
            v-model:value="formState.userProfile"
            placeholder="请输入用户简介"
            :rows="4"
          />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit">保存</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { getUserByIdUsingGet, updateUserUsingPost } from '@/api/userController'

const route = useRoute()
const router = useRouter()
const formRef = ref()

// 表单数据
const formState = reactive({
  id: '',
  userAccount: '',
  userName: '',
  userAvatar: '',
  userRole: '',
  userProfile: '',
})

// 表单验证规则
const rules: Record<string, Rule[]> = {
  userName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  userRole: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
}

// 响应式布局相关
const responsiveLabelCol = computed(() => {
  return window.innerWidth < 768 ? { span: 6 } : { span: 4 }
})

const responsiveWrapperCol = computed(() => {
  return window.innerWidth < 768 ? { span: 18 } : { span: 16 }
})

// 获取用户信息
const fetchUserInfo = async (id: string) => {
  try {
    const res = await getUserByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      Object.assign(formState, res.data.data)
    } else {
      message.error('获取用户信息失败')
    }
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const res = await updateUserUsingPost(formState)
    if (res.data.code === 0) {
      message.success('更新用户信息成功')
      router.push('/admin/userManage')
    } else {
      message.error('更新用户信息失败: ' + res.data.message)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消编辑
const handleCancel = () => {
  router.back()
}

// 页面加载时获取用户信息
onMounted(() => {
  const id = route.query.id as string
  if (id) {
    fetchUserInfo(id)
  }
})
</script>

<style scoped>
#user-edit-page {
  padding: clamp(16px, 3vw, 24px);
  width: 100%;
  box-sizing: border-box;
}

.edit-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: clamp(12px, 2vw, 16px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px);
}

:deep(.ant-card-body) {
  padding: clamp(16px, 3vw, 24px);
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.ant-form-item) {
  margin-bottom: clamp(16px, 3vw, 24px);
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-textarea) {
  border-radius: clamp(4px, 0.5vw, 8px);
}

:deep(.ant-form-item-explain) {
  font-size: clamp(12px, 1.5vw, 14px);
}

:deep(.ant-btn) {
  height: clamp(32px, 4vw, 40px);
  padding: 0 clamp(16px, 2vw, 24px);
  font-size: clamp(14px, 1.5vw, 16px);
  border-radius: clamp(4px, 0.5vw, 8px);
}

@media screen and (max-width: 768px) {
  .edit-card {
    margin: 0;
  }

  :deep(.ant-form-item-label) {
    text-align: left;
  }

  :deep(.ant-form-item-control-input) {
    min-height: 32px;
  }

  :deep(.ant-form-item-control-input-content) {
    display: flex;
    justify-content: flex-start;
  }

  :deep(.ant-space) {
    width: 100%;
    justify-content: center;
  }
}
</style> 
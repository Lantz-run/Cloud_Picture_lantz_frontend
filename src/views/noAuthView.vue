<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LockOutlined, HomeOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 返回首页
const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="no-auth-container">
    <div class="content-wrapper">
      <div class="icon-wrapper">
        <LockOutlined class="lock-icon" />
      </div>
      <h1 class="title">访问受限</h1>
      <p class="description">抱歉，您没有权限访问此页面</p>
      <div class="action-wrapper">
        <a-button type="primary" size="large" @click="goToHome">
          <template #icon><HomeOutlined /></template>
          返回首页
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, rgba(182, 122, 221, 0.81), rgba(83, 111, 216, 0.92));
  padding: 20px;
}

.content-wrapper {
  text-align: center;
  padding: 40px;
  background: #d1c0f8;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  max-width: 480px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
}

.icon-wrapper {
  margin-bottom: 24px;
}

.lock-icon {
  font-size: 64px;
  color: #ff4d4f;
  animation: bounce 1s ease-in-out;
}

.title {
  font-size: 28px;
  color: #1f1f1f;
  margin-bottom: 16px;
  font-weight: 600;
}

.description {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.action-wrapper {
  margin-top: 24px;
}

.action-wrapper :deep(.ant-btn) {
  height: 44px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-wrapper :deep(.ant-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .content-wrapper {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .lock-icon {
    font-size: 48px;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }

  .action-wrapper :deep(.ant-btn) {
    height: 40px;
    padding: 0 24px;
    font-size: 14px;
  }
}
</style>

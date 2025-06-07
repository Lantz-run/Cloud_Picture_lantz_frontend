<template>
  <div id="userLoginPage">
    <h2 class="title">用户登录</h2>
    <div class="subcontext">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入您的用户名' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入您的密码!' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <div class="tips">
        <RouterLink to="/user/register">没有账号？前去注册！</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { useLoginUserStore } from '@/stores/user'
import { userLoginUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
  // 登录成功，保存到全局状态之中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success("用户" + loginUserStore.loginUser.userName + "登录成功");
    await router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败, ' + res.data.message)
  }
}
</script>

<style scoped>
#userLoginPage{
  max-width: 360px;
  margin: 0 auto;
}
.title {
  text-align: center;
  margin-bottom: 16px;
}

.subcontext {
  text-align: center;
  color: #242424;
  margin-bottom: 16px;
}
.tips {
  text-align: right;
  margin-bottom: 16px;
  font-size: 13px;
}

</style>

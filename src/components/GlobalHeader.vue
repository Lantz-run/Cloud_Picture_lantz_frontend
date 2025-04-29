<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="180px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">岚茨云图库</div>
          </div>
        </RouterLink>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="deMenuClick"
          class="menu"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.userName ?? '图库用户' }}
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login" style="margin-left: 3px">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue'
import { HomeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/user'

const loginUserStore = useLoginUserStore()
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://github.com/Lantz-run', target: '_blank' }, 'LANTZ-RUN'),
    title: 'GitHub',
  },
])

const router = useRouter()

// 路由跳转事件
const deMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前选中的菜单
const current = ref<string[]>([])

router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalHeader {
}

.menu {
  background: linear-gradient(to right, rgba(156, 140, 234, 0.85), rgba(194, 118, 241, 0.88));
}

.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 16px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>

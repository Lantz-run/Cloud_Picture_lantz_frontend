<template>
  <div id="globalHeader">
    <a-row :wrap="false" class="header-row">
      <a-col flex="160px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title" v-show="!collapsed">岚茨云图库</div>
          </div>
        </RouterLink>
      </a-col>
      <a-col flex="auto" class="menu-col">
        <div class="menu-wrapper" :class="{ 'menu-collapsed': collapsed }">
          <a-menu
            v-model:selectedKeys="current"
            :mode="isMobile ? 'vertical' : 'horizontal'"
            :items="items"
            @click="deMenuClick"
            class="menu"
            :inline-collapsed="collapsed"
          />
        </div>
        <a-button
          type="text"
          class="collapse-btn"
          @click="toggleCollapsed"
          v-if="!isMobile"
        >
          <template #icon>
            <MenuFoldOutlined v-if="!collapsed" />
            <MenuUnfoldOutlined v-else />
          </template>
        </a-button>
      </a-col>
      <a-col flex="100px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace>
                <a-avatar
                  :src="loginUserStore.loginUser.userAvatar"
                  :size="48"
                  :style="{
                    backgroundColor: !loginUserStore.loginUser.userAvatar
                      ? getColorByString(loginUserStore.loginUser.userAccount)
                      : undefined,
                  }"
                >
                  <template v-if="!loginUserStore.loginUser.userAvatar">
                    {{ loginUserStore.loginUser.userAccount?.charAt(0)?.toUpperCase() }}
                  </template>
                </a-avatar>
                {{ loginUserStore.loginUser.userName ?? '默认用户' }}
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile" @click="goToProfile">
                    <UserOutlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-item key="logout" @click="doLogout" style="color: red">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
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
import { computed, h, ref, watch } from 'vue'
import { 
  HomeOutlined, 
  LogoutOutlined, 
  UserOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  GithubOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/user'
import { userLogoutUsingPost } from '@/api/userController'
import { getColorByString } from '@/utils/colorUtils'

const loginUserStore = useLoginUserStore()
// 菜单列表
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    icon: () => h(TeamOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/about',
    icon: () => h(InfoCircleOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    icon: () => h(GithubOutlined),
    label: h('a', { href: 'https://github.com/Lantz-run', target: '_blank' }, 'LANTZ-RUN'),
    title: 'GitHub',
  },
]

// 菜单折叠状态
const collapsed = ref(false)
const isMobile = ref(window.innerWidth < 768)

// 监听窗口大小变化
watch(() => window.innerWidth, (width) => {
  isMobile.value = width < 768
  if (width < 768) {
    collapsed.value = true
  }
})

// 切换菜单折叠状态
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed(() => filterMenus(originItems))

const router = useRouter()

// 路由跳转事件
const deMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  console.log(res)
  if (res.data.code === 0) {
    message.success('用户' + loginUserStore.loginUser.userName + '退出登录成功')
    await router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('退出登录失败, ' + res.data.message)
  }
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/user/profile')
}

// 当前选中的菜单
const current = ref<string[]>([])

router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalHeader {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
  background: #e1e1e1;
}

.header-row {
  height: 64px;
  display: flex;
  align-items: center;
}

.menu-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-wrapper {
  flex: 1;
  overflow: hidden;
  transition: all 0.3s;
}

.menu-collapsed {
  width: 80px;
}

.collapse-btn {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.65);
}

.menu {
  background: linear-gradient(to right, rgba(156, 140, 234, 0.85), rgba(194, 118, 241, 0.88));
  border: none;
  line-height: 64px;
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

.username {
  margin-left: 8px;
  color: #333;
  font-size: 14px;
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
}

:deep(.menu .ant-menu-item) {
  color: rgba(255, 255, 255, 0.85);
  margin: 0 4px;
  border-radius: 4px;
}

:deep(.menu .ant-menu-item:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

:deep(.menu .ant-menu-item-selected) {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

:deep(.menu .ant-menu-item .anticon) {
  margin-right: 8px;
}

@media screen and (max-width: 768px) {
  .header-row {
    height: auto;
    flex-wrap: wrap;
  }

  .menu-col {
    width: 100%;
    order: 3;
  }

  .menu-wrapper {
    width: 100%;
  }

  :deep(.menu) {
    line-height: 40px;
  }

  :deep(.menu .ant-menu-item) {
    margin: 0;
    border-radius: 0;
  }
}
</style>

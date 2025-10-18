<template>
  <div id="globalHeader">
    <a-row :wrap="false" class="header-row">
      <a-col :flex="headerLogoWidth" class="logo-col">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title" v-show="!collapsed && !isMobile">岚茨云图库</div>
          </div>
        </RouterLink>
      </a-col>

      <!-- 分隔线 -->
      <a-col v-if="!isMobile" class="divider-col">
        <div class="vertical-divider"></div>
      </a-col>

      <a-col flex="auto" class="menu-col">
        <!-- 桌面端菜单 -->
        <div v-if="!isMobile" class="menu-wrapper" :class="{ 'menu-collapsed': collapsed }">
          <a-menu
            v-model:selectedKeys="current"
            mode="horizontal"
            :items="items"
            @click="deMenuClick"
            class="menu"
            :inline-collapsed="collapsed"
          />
        </div>
        <!-- 移动端菜单按钮 -->
        <a-button
          v-else
          type="text"
          class="mobile-menu-btn"
          @click="showDrawer"
        >
          <template #icon><MenuOutlined /></template>
        </a-button>
        <!-- 桌面端折叠按钮 -->
        <a-button
          v-if="!isMobile"
          type="text"
          class="collapse-btn"
          @click="toggleCollapsed"
        >
          <template #icon>
            <MenuFoldOutlined v-if="!collapsed" />
            <MenuUnfoldOutlined v-else />
          </template>
        </a-button>
      </a-col>

      <!-- 分隔线 -->
      <a-col v-if="!isMobile && loginUserStore.loginUser.id" class="divider-col">
        <div class="vertical-divider"></div>
      </a-col>

      <a-col :flex="headerUserWidth" class="user-col">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace>
                <a-avatar
                  :src="loginUserStore.loginUser.userAvatar"
                  :size="responsiveAvatarSize"
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
                <span class="username" v-show="!collapsed && !isMobile">
                  {{ loginUserStore.loginUser.userName ?? '默认用户' }}
                </span>
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
            <a-button type="primary" href="/user/login" class="login-btn">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 移动端抽屉菜单 -->
    <a-drawer
      v-model:visible="drawerVisible"
      placement="right"
      :closable="true"
      :width="280"
      @close="closeDrawer"
      class="mobile-drawer"
    >
      <template #title>
        <div class="drawer-title">
          <a-avatar
            :size="40"
            :src="loginUserStore.loginUser.userAvatar"
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
          <span class="drawer-username">
            {{ loginUserStore.loginUser.userName ?? '默认用户' }}
          </span>
        </div>
      </template>
      <a-menu
        v-model:selectedKeys="current"
        mode="vertical"
        :items="items"
        @click="handleMobileMenuClick"
        class="mobile-menu"
      />
      <template #extra>
        <a-button type="link" @click="doLogout" danger>
          <LogoutOutlined />
          退出登录
        </a-button>
      </template>
    </a-drawer>
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
  MenuUnfoldOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'
import { type MenuProps, message, Drawer } from 'ant-design-vue'
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
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/picture_manager',
    label: '图片管理',
    title: '图片管理',
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

// 移动端抽屉菜单
const drawerVisible = ref(false)

// 显示抽屉菜单
const showDrawer = () => {
  drawerVisible.value = true
}

// 关闭抽屉菜单
const closeDrawer = () => {
  drawerVisible.value = false
}

// 处理移动端菜单点击
const handleMobileMenuClick = ({ key }: { key: string }) => {
  deMenuClick({ key })
  closeDrawer()
}

// 响应式布局相关
const isTablet = computed(() => {
  return window.innerWidth >= 768 && window.innerWidth < 1024
})

const isMobile = computed(() => {
  return window.innerWidth < 768
})

const headerLogoWidth = computed(() => {
  if (isMobile.value) return 'auto'
  if (isTablet.value) return '120px'
  return '160px'
})

const headerUserWidth = computed(() => {
  if (isMobile.value) return 'auto'
  if (isTablet.value) return '100px'
  return '120px'
})

const responsiveAvatarSize = computed(() => {
  if (isMobile.value) return 32
  if (isTablet.value) return 40
  return 48
})

// 菜单折叠状态
const collapsed = ref(false)

// 监听窗口大小变化
watch(() => window.innerWidth, (width) => {
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
    if (menu?.key && typeof menu.key === 'string' && menu.key.startsWith('/admin')) {
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-row {
  height: 64px;
  display: flex;
  align-items: center;
}

.logo-col {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 16px;
}

.menu-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  flex: 1;
  padding: 0 16px;
}

.user-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  padding-left: 16px;
}

/* 新增分隔线列样式 */
.divider-col {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1px;
}

.vertical-divider {
  height: 24px;
  width: 1px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
}

.menu-wrapper {
  flex: 1;
  overflow: hidden;
  transition: all 0.3s;
  min-width: 0;
}

.menu-collapsed {
  width: 80px;
}

.collapse-btn {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.65);
  flex-shrink: 0;
}

.mobile-menu-btn {
  font-size: 20px;
  padding: 0 8px;
}

.menu {
  background: linear-gradient(to right, rgba(156, 140, 234, 0.85), rgba(194, 118, 241, 0.88));
  border: none;
  line-height: 64px;
  white-space: nowrap;
  border-radius: 8px;
  margin-left: 8px;
}

.title-bar {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 8px 0;
}

.title {
  color: black;
  font-size: 18px;
  font-weight: 600;
  margin-left: 16px;
  white-space: nowrap;
}

.logo {
  height: 48px;
  width: auto;
}

.username {
  margin-left: 8px;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
}

.login-btn {
  margin-left: 3px;
  white-space: nowrap;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-username {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.mobile-menu {
  border-right: none;
}

:deep(.mobile-menu .ant-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
  border-radius: 4px;
}

:deep(.mobile-menu .ant-menu-item-selected) {
  background: rgba(156, 140, 234, 0.1);
}

:deep(.mobile-menu .ant-menu-item .anticon) {
  margin-right: 12px;
}

:deep(.menu .ant-menu-item) {
  color: rgba(255, 255, 255, 0.85);
  margin: 0 4px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
}

:deep(.menu .ant-menu-item:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

:deep(.menu .ant-menu-item-selected) {
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.menu .ant-menu-item .anticon) {
  margin-right: 8px;
}

:deep(.menu .ant-menu-overflow-item) {
  padding: 0 12px;
}

:deep(.menu .ant-menu-overflow-item-rest) {
  padding: 0 12px;
}

/* 添加内容区域的顶部边距，防止被固定导航栏遮挡 */
:deep(body) {
  padding-top: 64px;
}

/* 平板端适配 */
@media screen and (max-width: 1024px) {
  .header-row {
    height: 56px;
  }

  .logo {
    height: 40px;
  }

  .title {
    font-size: 16px;
    margin-left: 12px;
  }

  .logo-col {
    padding-right: 12px;
  }

  .menu-col {
    padding: 0 12px;
  }

  .user-col {
    padding-left: 12px;
  }

  :deep(body) {
    padding-top: 56px;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .header-row {
    height: 48px;
  }

  .logo {
    height: 32px;
  }

  .title {
    font-size: 14px;
    margin-left: 8px;
  }

  #globalHeader {
    padding: 0 12px;
  }

  .logo-col {
    padding-right: 8px;
  }

  .menu-col {
    padding: 0 8px;
  }

  .user-col {
    padding-left: 8px;
  }

  .user-login-status {
    padding-right: 0;
  }

  :deep(body) {
    padding-top: 48px;
  }
}
</style>

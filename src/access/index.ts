import router from '@/router'
import { useLoginUserStore } from '@/stores/user'
import ACCESS_ENUMS from '@/access/accessEnums'
import checkAccess from '@/access/checkAccess'
import { message } from 'ant-design-vue'

// 是否为首次获取登录用户
let firstFetchLoginUser = true

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser

  // 确保页面刷新，首次加载时，能够等后端返回用户信息后再校验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }

  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUMS.NOT_LOGIN

  // 要跳转的页面必须要登录
  if (needAccess !== ACCESS_ENUMS.NOT_LOGIN) {
    // 如果没登录，跳转到登录页面
    if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUMS.NOT_LOGIN) {
      message.warning('请先登录后再访问')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
    // 如果已经登录了，但是权限不足，那么跳转到无权限页面
    if (!checkAccess(loginUser, needAccess)) {
      message.error('抱歉，您没有权限访问该页面')
      next('/noAuth')
      return
    }
  }

  next()
})

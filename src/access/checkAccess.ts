import ACCESS_ENUMS from '@/access/accessEnums'

/**
 * 检查权限（判断当前登录用户是否具有某个权限）
 * @param loginUser 当前登录用户
 * @param needAccess 需要有的权限
 */
const checkAccess = (loginUser: any, needAccess = ACCESS_ENUMS.NOT_LOGIN) => {
  // 获取当前登录用户具有的权限（如果没有 loginUser，则表示没登录）
  const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUMS.NOT_LOGIN
  if (needAccess === ACCESS_ENUMS.NOT_LOGIN) {
    return true
  }
  // 如果用户登录才能访问
  if (needAccess === ACCESS_ENUMS.USER) {
    // 如果用户没登陆，那就是没权限
    if (loginUser === ACCESS_ENUMS.NOT_LOGIN) {
      return false
    }
  }
  // 如果需要管理员权限
  if (needAccess === ACCESS_ENUMS.ADMIN) {
    // 如果不为管理员，表示无权限
    if (loginUserAccess !== ACCESS_ENUMS.ADMIN) {
      return false;
    }
  }
  return true;
};

export default checkAccess;

// 预定义一组美观的颜色
const avatarColors = [
  '#f56a00', // 橙色
  '#7265e6', // 紫色
  '#ffbf00', // 金色
  '#00a2ae', // 青色
  '#712fd1', // 深紫色
  '#13c2c2', // 蓝绿色
  '#eb2f96', // 粉色
  '#fa8c16', // 橙黄色
  '#52c41a', // 绿色
  '#1890ff', // 蓝色
  '#722ed1', // 紫色
  '#fa541c', // 红橙色
  '#2f54eb', // 靛蓝色
  '#13c2c2', // 青色
  '#eb2f96', // 玫红色
]

// 根据字符串生成固定的颜色（相同字符串会得到相同的颜色）
export const getColorByString = (str: string): string => {
  if (!str) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// 获取随机颜色
export const getRandomColor = (): string => {
  const index = Math.floor(Math.random() * avatarColors.length)
  return avatarColors[index]
} 
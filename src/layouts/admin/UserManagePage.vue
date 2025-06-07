<template>
  <div id="user-manage-page">
    <!--搜索表单-->
    <a-form
      :layout="searchFormLayout"
      :model="searchParams"
      @finish="doSearch"
      :style="searchFormStyle"
      class="search-form"
    >
      <a-form-item label="账号" name="userAccount">
        <a-input
          v-model:value="searchParams.userAccount"
          placeholder="请输入账号"
          allow-clear
        />
      </a-form-item>

      <a-form-item label="用户昵称" name="userName">
        <a-input
          v-model:value="searchParams.userName"
          placeholder="请输入用户昵称"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="resetSearch">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <ADivider />
    <!--表单-->
    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="responsiveColumns"
        :data-source="dataList"
        :scroll="{ x: 'max-content' }"
        :pagination="{
          total: total,
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: any) => `共 ${total} 条记录`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-avatar
              :size="responsiveAvatarSize"
              :src="record.userAvatar"
              :style="{
                backgroundColor: !record.userAvatar
                  ? getColorByString(record.userAccount)
                  : undefined,
              }"
            >
              <template v-if="!record.userAvatar">
                {{ record.userAccount?.charAt(0)?.toUpperCase() }}
              </template>
            </a-avatar>
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <div v-if="record.userRole === 'admin'">
              <a-tag color="green">管理员</a-tag>
            </div>
            <div v-else>
              <a-tag color="blue">普通用户</a-tag>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.dataIndex === 'updateTime'">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="responsiveSpaceSize">
              <a-button type="primary" @click="handleEdit(record)">修改</a-button>
              <a-popconfirm
                title="确定要删除该用户吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { getColorByString } from '@/utils/colorUtils'

const router = useRouter()

// 响应式布局相关
const responsiveAvatarSize = computed(() => {
  return window.innerWidth < 768 ? 40 : 60
})

const responsiveSpaceSize = computed(() => {
  return window.innerWidth < 768 ? 8 : 16
})

// 响应式表格列配置
const responsiveColumns = computed(() => {
  const baseColumns = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '用户账号',
      dataIndex: 'userAccount',
      width: 120,
    },
    {
      title: '用户昵称',
      dataIndex: 'userName',
      width: 120,
    },
    {
      title: '用户头像',
      dataIndex: 'userAvatar',
      width: 100,
    },
    {
      title: '用户角色',
      dataIndex: 'userRole',
      width: 100,
    },
    {
      title: '用户简介',
      dataIndex: 'userProfile',
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
    },
  ]

  // 在小屏幕下隐藏某些列
  if (window.innerWidth < 768) {
    return baseColumns.filter((col) =>
      ['id', 'userAccount', 'userName', 'userRole', 'action'].includes(col.dataIndex || col.key),
    )
  }

  return baseColumns
})

// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 搜索表单布局
const searchFormLayout = computed(() => {
  return window.innerWidth < 768 ? 'vertical' : 'inline'
})

// 搜索表单样式
const searchFormStyle = computed(() => {
  return window.innerWidth < 768 ? { marginBottom: '16px' } : {}
})

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败, ' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 搜索用户
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.userAccount = ''
  searchParams.userName = ''
  searchParams.current = 1
  fetchData()
}

// 处理表格分页变化
const handleTableChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 处理编辑用户
const handleEdit = (record: any) => {
  router.push({
    path: '/admin/user/edit',
    query: { id: record.id },
  })
}

// 处理删除用户
const handleDelete = async (record: any) => {
  try {
    const res = await deleteUserUsingPost({
      id: record.id,
    })
    if (res.data.code === 0) {
      message.success('删除用户成功')
      // 重新加载数据
      await fetchData()
    } else {
      message.error('删除用户失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('删除用户失败')
  }
}
</script>

<style scoped>
#user-manage-page {
  padding: clamp(16px, 3vw, 24px);
  width: 100%;
  box-sizing: border-box;
}

.table-card {
  border-radius: clamp(12px, 2vw, 16px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.ant-table-wrapper) {
  overflow-x: auto;
}

:deep(.ant-table) {
  border-radius: clamp(8px, 1vw, 12px);
  overflow: hidden;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 500;
}

:deep(.ant-table-tbody > tr > td) {
  padding: clamp(8px, 1vw, 16px);
}

:deep(.ant-table-pagination) {
  margin: clamp(12px, 2vw, 16px) 0;
  padding: 0 clamp(16px, 3vw, 24px);
}

.search-form {
  background: #fff;
  padding: clamp(16px, 3vw, 24px);
  border-radius: clamp(8px, 1vw, 12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: clamp(16px, 3vw, 24px);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

:deep(.search-form .ant-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

:deep(.search-form .ant-form-item-label) {
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .search-form {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  :deep(.search-form .ant-form-item) {
    margin-right: 0;
    width: 100%;
  }
  
  :deep(.search-form .ant-form-item-label) {
    text-align: left;
  }
  
  :deep(.search-form .ant-space) {
    width: 100%;
    justify-content: center;
  }
}
</style>

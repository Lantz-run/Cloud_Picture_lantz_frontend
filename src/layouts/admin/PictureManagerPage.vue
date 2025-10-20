<template>
  <div id="picture-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <a-icon type="picture" class="title-icon" />
            图片管理
          </h1>
          <p class="page-subtitle">管理和维护平台图片资源</p>
        </div>
        <a-button type="primary" size="large" href="/add_picture" target="_blank" class="create-btn">
          <template #icon>
            <PlusOutlined />
          </template>
          创建图片
        </a-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
        <a-row :gutter="[16, 16]" style="width: 100%">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="关键词" name="searchText">
              <a-input
                v-model:value="searchParams.searchText"
                placeholder="请输入名称或介绍"
                allow-clear
                size="large"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="分类" name="category">
              <a-input
                v-model:value="searchParams.category"
                placeholder="请输入分类"
                allow-clear
                size="large"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="标签" name="tags">
              <a-select
                v-model:value="searchParams.tags"
                mode="tags"
                placeholder="请输入标签"
                style="width: 100%"
                allow-clear
                size="large"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit" size="large">
                  <template #icon>
                    <SearchOutlined />
                  </template>
                  搜索
                </a-button>
                <a-button @click="resetSearch" size="large">
                  <template #icon>
                    <ReloadOutlined />
                  </template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        @change="doTableChange"
        class="data-table"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'url'">
            <div class="image-cell">
              <a-image
                :src="record.url"
                :width="120"
                :preview="true"
                class="table-image"
              />
            </div>
          </template>
          <!-- 标签 -->
          <template v-else-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag
                v-for="tag in JSON.parse(record.tags ?? '[]')"
                :key="tag"
                color="blue"
                class="tag-item"
              >
                {{ tag }}
              </a-tag>
            </a-space>
          </template>
          <!-- 图片信息 -->
          <template v-else-if="column.dataIndex === 'pictureInfo'">
            <div class="picture-info">
              <div class="info-item">
                <span class="info-label">格式:</span>
                <a-tag color="green" size="small">{{ record.picFormat }}</a-tag>
              </div>
              <div class="info-item">
                <span class="info-label">尺寸:</span>
                <span class="info-value">{{ record.picWidth }} × {{ record.picHeight }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">大小:</span>
                <span class="info-value">{{ formatFileSize(record.picSize) }}</span>
              </div>
            </div>
          </template>
          <!-- 创建时间 -->
          <template v-else-if="column.dataIndex === 'createTime'">
            <div class="time-cell">
              <a-icon type="clock-circle" />
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <!-- 编辑时间 -->
          <template v-else-if="column.dataIndex === 'editTime'">
            <div class="time-cell">
              <a-icon type="edit" />
              {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <div>
              <a-button
                type="link"
                :href="`/add_picture?id=${record.id}`"
                target="_blank"
                class="action-btn edit-btn"
              >
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-button
                type="link"
                danger
                @click="doDelete(record.id)"
                class="action-btn delete-btn"
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, listPictureByPageUsingPost } from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

/**
 * 数据
 */
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(false)

/**
 * 搜素条件
 */
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

/**
 * 分页
 */
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: any) => `共 ${total} 条记录`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
})

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
    })
    if (res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败, ' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取数据失败, ' + error.message)
  } finally {
    loading.value = false
  }
}

/**
 * 删除操作
 */
const doDelete = async (id: any) => {
  if (!id) {
    return
  }
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个图片吗？删除后无法恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 重新加载数据
          fetchData()
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败：' + error.data.message)
      }
    },
  })
}

/**
 * 表格变动处理
 */
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

/**
 * 搜索
 */
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

/**
 * 重置搜索
 */
const resetSearch = () => {
  Object.assign(searchParams, {
    current: 1,
    pageSize: 10,
    searchText: undefined,
    category: undefined,
    tags: undefined,
  })
  fetchData()
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'pictureInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]
</script>

<style scoped>
#picture-manager {
  max-width: 1450px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  color: #ffd700;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.create-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
}

.search-form {
  padding: 8px 0;
}

.search-form .ant-form-item {
  margin-bottom: 0;
}

/* 表格卡片样式 */
.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
  overflow: hidden;
}

.data-table {
  border-radius: 8px;
}

/* 表格单元格样式 */
.image-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.table-image:hover {
  transform: scale(1.05);
}

.tag-item {
  margin: 2px;
  border-radius: 12px;
  font-size: 12px;
}

.picture-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.info-label {
  color: #666;
  font-weight: 500;
  min-width: 40px;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.delete-btn:hover {
  background-color: #fff2f0;
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #picture-manager {
    padding: 16px;
  }

  .page-header {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .create-btn {
    width: 100%;
    max-width: 200px;
  }
}

/* 表格响应式 */
@media (max-width: 1200px) {
  .data-table {
    font-size: 13px;
  }

  .table-image {
    width: 60px;
    height: 60px;
  }
}

/* 加载状态优化 */
.ant-spin-container {
  min-height: 400px;
}

/* 分页样式优化 */
:deep(.ant-pagination) {
  margin-top: 24px;
  text-align: center;
}

:deep(.ant-pagination .ant-pagination-item) {
  border-radius: 8px;
}

:deep(.ant-pagination .ant-pagination-item-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

:deep(.ant-pagination .ant-pagination-item-active a) {
  color: white;
}
</style>

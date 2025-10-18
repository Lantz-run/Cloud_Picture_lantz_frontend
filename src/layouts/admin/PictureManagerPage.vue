<template>
  <div id="picture-manager">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-button type="primary" href="/add_picture" target="_blank">+创建图片</a-button>
    </a-flex>
    <!--搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="请输入名称或者介绍"
          allow-clear
        />
      </a-form-item>

      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
      </a-form-item>

      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          style="width: 180px"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <!--表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" />
        </template>
        <!--标签-->
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag
              v-for="tag in JSON.parse(record.tags ?? '[]')"
              :key="tag"
              :color="'green'"
              style="font-size: 13px"
            >
              {{ tag }}
            </a-tag>
          </a-space>
        </template>
        <!--图片信息-->
        <template v-else-if="column.dataIndex === 'pictureInfo'">
          <div>格式: {{ record.picFormat }}</div>
          <div>宽度: {{ record.picWidth }}</div>
          <div>高度: {{ record.picHeight }}</div>
          <div>宽高比: {{ record.picScale }}</div>
          <div>大小: {{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <!--创建时间-->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!--编辑时间-->
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!--操作-->
        <template v-else-if="column.key === 'action'">
          <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
            >编辑</a-button
          >
          <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, listPictureByPageUsingPost } from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'

/**
 * 数据
 */
const dataList = ref<API.Picture[]>([])
const total = ref(0)

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
    showSizeChange: true,
    showTotal: (total: any) => `共 ${total} 条`,
  }
})

/**
 * 获取数据
 */
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败, ' + res.data.message)
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
    content: '确定要删除这个图表吗？删除后无法恢复。',
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
#picture-manager .search-form {
  margin-bottom: 18px;
}
</style>

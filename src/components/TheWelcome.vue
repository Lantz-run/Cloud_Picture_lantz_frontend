<template class="">
  <div id="TheWelcomePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="从海量图片中搜索"
        v-model:value="searchParam.searchText"
        enter-button="搜索"
        size="large"
        @search="doSearch"
        allow-clear
      />
    </div>
    <!-- 分类 + 标签 -->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!--图片-->
          <a-card
            hoverable
            style="width: 270px"
            @click="doClickPicture(picture)"
            class="picture-card"
          >
            <template #cover>
                <div class="image-container">
                  <img
                    class="picture-image"
                    :alt="picture.name"
                    :src="picture.url"
                  />
                </div>
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag" color="blue">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
      <template #loadMore>
        <div v-if="hasMore" class="load-more">
          <a-spin v-if="loadingMore" />
          <a-button v-else @click="loadMore" type="link">加载更多</a-button>
        </div>
        <div v-else class="no-more">
          <a-typography-text type="secondary">没有更多了</a-typography-text>
        </div>
      </template>
    </a-list>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { useRouter } from 'vue-router'

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

// 分类, 标签列表
const selectedCategory = ref<string>('all')
const categoryList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const tagList = ref<string[]>([])

// 搜索条件
const searchParam = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20, // 增加每页数量
  sortField: 'createTime',
  sortOrder: 'desc',
})

/**
 * 获取数据
 */
const fetchData = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  // 转换搜索参数
  const params = {
    ...searchParam,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((userTag, index) => {
    if (userTag) {
      params.tags.push(tagList.value[index])
    }
  })

  try {
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.data) {
      const newRecords = res.data.data.records ?? []
      if (isLoadMore) {
        // 追加数据
        dataList.value = [...dataList.value, ...newRecords]
      } else {
        // 重置数据
        dataList.value = newRecords
      }
      total.value = res.data.data.total ?? 0

      // 检查是否还有更多数据
      hasMore.value = dataList.value.length < total.value
    } else {
      message.error('获取数据失败, ' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取数据失败, ' + error.message)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return
  searchParam.current = (searchParam.current || 1) + 1
  fetchData(true)
}

// 滚动监听
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 当滚动到距离底部100px时加载更多
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMore()
  }
}

const doSearch = () => {
  // 重置搜索条件
  searchParam.current = 1
  hasMore.value = true
  fetchData()
}
/**
 * 页面加载时请求一次
 */
onMounted(() => {
  fetchData()
  getTagCategoryOptions()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 转换成下拉格式支持的组件
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败, ' + res.data.message)
  }
}

const router = useRouter()

// 跳转图片详情页
const doClickPicture = (picture: API.Picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}
</script>
<style scoped>
#TheWelcomePage {
  max-width: 1400px;
  margin: 0 auto;
}

#TheWelcomePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#TheWelcomePage .tag-bar {
  margin-bottom: 16px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

.no-more {
  text-align: center;
  padding: 20px 0;
}

/* 图片卡片样式 */
.picture-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.picture-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.image-container {
  height: 340px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
}

.picture-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  cursor: pointer;
}

.picture-card:hover .picture-image {
  transform: scale(1.1);
}

/* 图片容器 */
.image-container {
  position: relative;
  overflow: hidden;
}

/* 卡片内容区域 */
.picture-card :deep(.ant-card-body) {
  padding: 16px;
}

.picture-card :deep(.ant-card-meta-title) {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picture-card :deep(.ant-card-meta-description) {
  margin-top: 0;
}

/* 标签样式优化 */
.picture-card :deep(.ant-tag) {
  margin: 2px 4px 2px 0;
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
  border: none;
}

.picture-card :deep(.ant-tag-green) {
  background-color: #f6ffed;
  color: #52c41a;
}

.picture-card :deep(.ant-tag-blue) {
  background-color: #e6f7ff;
  color: #1890ff;
}
</style>

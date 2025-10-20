<template>
  <div id="pictureDetailsPage">
    <a-row :gutter="[16, 16]">
      <!--图片展示区-->
      <a-col :sm="24" :md="16" :xl="16">
        <a-card title="图片预览">
          <template #cover>
            <a-image style="max-height: 550px;max-width: 100%; object-fit: contain" :src="picture.url" />
          </template>
        </a-card>
      </a-col>
      <!--图片信息区-->
      <a-col :sm="24" :md="12" :xl="8">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.userVO?.userAvatar" />
                <div>{{ picture.userVO?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '作者很懒, 什么都没写' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" color="green">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比例">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ dayjs(picture.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </a-descriptions-item>
          </a-descriptions>
          <a-space wrap>
            <a-button type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>

            <a-button v-if="canEdit" type="default" @click="doEdit">
              编辑
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>
            <a-popconfirm
              v-if="canEdit"
              title="确定要删除该用户吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="doDelete"
            >
              <a-button danger>
                删除
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-popconfirm>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { downloadImage } from '@/utils/formatSizeUtils'

const picture = ref<API.PictureVO>({})
const router = useRouter()

const props = defineProps<{
  id: string | undefined
}>()

// 获取图片详情
const fetchPictureDetails = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败, ' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败, ' + e.message)
  }
}

const loginUserStore = useLoginUserStore()

// 是否具有编辑权限
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 未登录不可编辑
  if (!loginUser.id) {
    return false
  }
  // 只有用户本人和管理员才可以编辑
  const user = picture.value.userVO ?? {}
  return user.id === loginUser.id || loginUser.userRole === 'admin'
})

// 编辑跳转图片编辑页面
const doEdit = () => {
  router.push('/add_picture?id=' + picture.value.id)
}

const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('图片删除成功')
  } else {
    message.error('图片删除失败')
  }
  await router.push('/')
}

// 下载组件
const doDownload = () => {
  downloadImage(picture.value.url, picture.value.name)
}


onMounted(() => {
  fetchPictureDetails()
})
</script>

<style scoped>
#pictureDetailsPage {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

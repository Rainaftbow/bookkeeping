<script setup>
import {ref, onMounted, computed} from 'vue'
import {getInPage, createList, updateList, deleteList, getList, markListAsBought} from '@/apis/shoppingLists.js'
import {uploadFile} from '@/apis/index.js'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'

const lists = ref([])
const loading = ref(false)
const selected = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({id: null, name: '', img: '', itemCount: 0})
const searchQuery = ref('')
const pagination = ref({pageNo: 1, pageSize: 8, total: 0})
const router = useRouter()

const isSearching = computed(() => searchQuery.value.trim() !== '')

// 获取清单卡片分页
const fetchLists = async () => {
  loading.value = true
  try {
    const res = await getInPage({
      name: searchQuery.value,
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize
    })
    lists.value = res.data?.list || res.data?.records || res.data?.items || []
    pagination.value.total = res.data?.total || 0
  } catch (e) {
    ElMessage.error('获取清单失败')
  } finally {
    loading.value = false
  }
}

// 新建/编辑弹窗
const openDialog = async (list = null) => {
  if (list) {
    isEdit.value = true
    const res = await getList(list.id)
    const detail = res.data
    Object.assign(form.value, {
      id: detail.id,
      name: detail.name,
      img: detail.img,
      itemCount: detail.itemCount || 0
    })
  } else {
    isEdit.value = false
    Object.assign(form.value, {id: null, name: '', img: '', itemCount: 0})
  }
  dialogVisible.value = true
}

// 上传图片
const handleUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  try {
    const res = await uploadFile(formData)
    form.value.img = res.data || ''
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

// 提交表单
const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateList({id: form.value.id, name: form.value.name, img: form.value.img})
      ElMessage.success('修改成功')
    } else {
      await createList({name: form.value.name, img: form.value.img})
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchLists()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selected.value.length) return
  try {
    await ElMessageBox.confirm('确定要删除选中的清单吗？', '提示', {type: 'warning'})
    await deleteList({ids: selected.value.join(',')})
    ElMessage.success('删除成功')
    selected.value = []
    fetchLists()
  } catch {
  }
}

// 跳转详情页
const goToDetail = (list) => {
  router.push({path: `/shopping-list/${list.id}`})
}

// 标记为已完成
const handleMarkListBought = async (list) => {
  await markListAsBought({id: list.id})
  ElMessage.success('清单已完成')
  fetchLists()
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNo = 1
  fetchLists()
}

// 重置搜索
const handleReset = () => {
  searchQuery.value = ''
  pagination.value.pageNo = 1
  fetchLists()
}

// 分页切换
const handlePageChange = (page) => {
  pagination.value.pageNo = page
  fetchLists()
}

onMounted(fetchLists)
</script>

<template>
  <div>
    <el-input
        v-model="searchQuery"
        placeholder="搜索清单名称"
        style="width: 220px; margin-bottom: 12px; margin-right: 8px;"
        @keyup.enter="handleSearch"
        clearable
    />
    <el-button type="primary" @click="handleSearch" style="margin-bottom: 12px;">搜索</el-button>
    <el-button @click="handleReset" style="margin-bottom: 12px;">重置</el-button>
    <el-button type="danger" :disabled="!selected.length" @click="handleBatchDelete" style="margin-bottom: 12px;">删除
    </el-button>
    <el-row :gutter="16">
      <el-col v-for="list in lists" :key="list.id" :span="6">
        <el-card class="card-item">
          <template #header>
            <el-checkbox v-model="selected" :label="list.id" style="margin-right:8px;"/>
            <span>{{ list.name }}</span>
            <el-button type="primary" size="small" @click.stop="openDialog(list)" style="float:right;">修改</el-button>
          </template>
          <div v-if="list.img">
            <img :src="list.img" alt="cover" style="width:100%;height:100px;object-fit:cover;margin-bottom:8px;"/>
          </div>
          <el-button type="text" @click="goToDetail(list)" style="margin-top:8px;">查看详情</el-button>
        </el-card>
      </el-col>
      <!-- 仅无搜索条件时显示新建卡片 -->
      <el-col v-if="!isSearching" :span="6">
        <el-card class="new-card" @click="openDialog()">
          <div style="text-align:center;color:#999;">
            <el-icon>
              <Plus/>
            </el-icon>
            <div>新建购物清单</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination
        v-if="pagination.total > 0"
        style="margin-top: 16px; text-align: right;"
        layout="prev, pager, next, jumper"
        :current-page="pagination.pageNo"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
    />
    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改清单' : '新建清单'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
              :show-file-list="false"
              :before-upload="() => false"
              :on-change="handleUpload"
              accept="image/*"
          >
            <el-button>上传图片</el-button>
            <img v-if="form.img" :src="form.img" alt="cover" style="width:60px;height:60px;margin-left:10px;"/>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.card-item {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.new-card {
  cursor: pointer;
  border: 1px dashed #bbb;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
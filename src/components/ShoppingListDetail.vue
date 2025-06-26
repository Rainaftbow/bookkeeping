<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addItem,
  updateListItem,
  deleteListItem,
  markItemAsBought
} from '@/apis/shoppingLists.js'
import { useIconStore } from '@/stores/iconStore.js'

const route = useRoute()
const router = useRouter()
const listId = Number(route.params.id)

const items = ref([])
const pagination = reactive({ pageNo: 1, pageSize: 10, total: 0 })
const searchForm = reactive({ name: '' })

const itemDialogVisible = ref(false)
const isItemEdit = ref(false)
const itemForm = reactive({
  itemId: null,
  name: '',
  categoryName: '',
  price: 1,
  quantity: 1
})
const itemFormRef = ref()
const itemRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, type: 'number', min: 0.01, message: '单价必须大于0', trigger: 'blur' }],
  quantity: [{ required: true, type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }]
}

const multipleSelection = ref([])

const iconStore = useIconStore()

function goBack() {
  router.back()
}

async function fetchItems() {
  // getItem: { id } 返回清单详情，包含商品列表
  const res = await getItem(listId)
  let allItems = res.data?.items || []
  if (searchForm.name) {
    allItems = allItems.filter(i => i.name.includes(searchForm.name))
  }
  // 未购买的在前，已购买的在后（用status判断）
  allItems.sort((a, b) => (a.status === b.status ? 0 : a.status === 1 ? 1 : -1))
  pagination.total = allItems.length
  // 分页
  const start = (pagination.pageNo - 1) * pagination.pageSize
  items.value = allItems.slice(start, start + pagination.pageSize)
}

function openItemDialog(item = null) {
  if (item) {
    isItemEdit.value = true
    Object.assign(itemForm, {
      itemId: item.itemId,
      name: item.name,
      categoryName: item.categoryName,
      price: item.price,
      quantity: item.quantity
    })
  } else {
    isItemEdit.value = false
    Object.assign(itemForm, {
      itemId: null,
      name: '',
      categoryName: iconStore.outcomeIcons.length > 0 ? iconStore.outcomeIcons[0].name : '',
      price: 1,
      quantity: 1
    })
  }
  itemDialogVisible.value = true
}

async function submitItem() {
  await itemFormRef.value.validate()
  if (isItemEdit.value) {
    await updateListItem({
      itemId: itemForm.itemId,
      name: itemForm.name,
      categoryName: itemForm.categoryName,
      price: itemForm.price,
      quantity: itemForm.quantity
    })
    ElMessage.success('修改成功')
  } else {
    await addItem({
      listId,
      name: itemForm.name,
      categoryName: itemForm.categoryName,
      price: itemForm.price,
      quantity: itemForm.quantity
    })
    ElMessage.success('添加成功')
  }
  itemDialogVisible.value = false
  fetchItems()
}

async function handleDeleteItem(item) {
  await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
  await deleteListItem({ itemIds: String(item.itemId) })
  ElMessage.success('删除成功')
  fetchItems()
}

async function handleBatchDelete() {
  if (!multipleSelection.value.length) return
  try {
    await ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', { type: 'warning' })
    const ids = multipleSelection.value.map(i => i.itemId)
    await deleteListItem({ ids })
    ElMessage.success('删除成功')
    fetchItems()
  } catch {}
}

async function handleMarkBought(item) {
  await markItemAsBought(1, item.itemId)
  ElMessage.success('标记为已购买')
  fetchItems()
}

async function handleBatchMarkBought() {
  if (!multipleSelection.value.length) return
  const ids = multipleSelection.value.map(i => i.itemId)
  for (const id of ids) {
    await markItemAsBought(1, id)
  }
  ElMessage.success('标记为已购买')
  fetchItems()
}

async function handleMarkUnbought(item) {
  await markItemAsBought(0, item.itemId)
  ElMessage.success('标记为未购买')
  fetchItems()
}

function handleSelectionChange(val) {
  multipleSelection.value = val
}

function resetSearch() {
  searchForm.name = ''
  fetchItems()
}

onMounted(() => {
  fetchItems()
  iconStore.fetchIcons()
})
</script>

<template>
  <div>
    <el-page-header @back="goBack" content="返回购物清单卡片" />
    <h2>购物清单详情</h2>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <el-form :inline="true" :model="searchForm" @submit.prevent="fetchItems" style="margin-bottom: 0;">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="输入商品名称搜索" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchItems">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-left: 2px;">
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <el-button type="primary" @click="openItemDialog()">新增商品</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">删除</el-button>
      <el-button type="success" :disabled="!multipleSelection.length" @click="handleBatchMarkBought">标记为已购</el-button>
    </div>
    <el-table :data="items" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="商品名称">
        <template #default="{ row }">
          <span :style="row.status === 1 ? 'text-decoration: line-through; color: #aaa;' : ''">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类">
        <template #default="{ row }">
          <template v-if="row.categoryName">
            <img v-if="iconStore.outcomeIcons.find(i => i.name === row.categoryName)" :src="iconStore.outcomeIcons.find(i => i.name === row.categoryName)?.logo" style="width:18px;height:18px;margin-right:4px;vertical-align:middle;" />
            <span>{{ row.categoryName }}</span>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="bought" label="状态">
        <template #default="{ row }">
          <span v-if="row.status === 1">已购买</span>
          <span v-else>未购买</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="openItemDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDeleteItem(row)">删除</el-button>
          <el-button size="small" v-if="row.status !== 1" @click="handleMarkBought(row)">标记为已购</el-button>
          <el-button size="small" v-else @click="handleMarkUnbought(row)">标记为未购</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.pageNo"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="prev, pager, next"
      @current-change="fetchItems"
      style="margin-top: 16px; text-align: right;"
    />
    <el-dialog v-model="itemDialogVisible" :title="isItemEdit ? '编辑商品' : '新增商品'">
      <el-form :model="itemForm" :rules="itemRules" ref="itemFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="itemForm.name" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryName" :rules="[{ required: true, message: '请选择分类', trigger: 'change' }]">
          <el-select v-model="itemForm.categoryName" placeholder="请选择分类" filterable style="width: 100%">
            <el-option
              v-for="item in iconStore.outcomeIcons"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            >
              <template #default>
                <img :src="item.logo" alt="icon" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" />
                <span>{{ item.name }}</span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="itemForm.price" :min="0.01" :step="0.01" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="itemForm.quantity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

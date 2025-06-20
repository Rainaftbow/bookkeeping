<template>
  <div>
    <!-- 自定义导航栏 -->
    <div class="book-toolbar">
      <el-select
          v-model="searchForm.categoryId"
          placeholder="请选择分类"
          style="width: 180px; margin-right: 12px;"
          clearable
      >
        <el-option
            v-for="item in allCategories"
            :key="item.id"
            :value="item.id"
            :label="item.name"
        >
    <span>
      <img v-if="item.logo" :src="item.logo" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;" />
      {{ item.name }}
    </span>
        </el-option>
      </el-select>
      <el-date-picker v-model="searchForm.startDate" type="date" placeholder="开始日期" style="margin-right: 12px;" />
      <el-date-picker v-model="searchForm.endDate" type="date" placeholder="结束日期" style="margin-right: 12px;" />
      <el-input v-model="searchForm.keyword" placeholder="备注" style="width: 120px; margin-right: 12px;" clearable />
      <el-button type="primary" @click="handleSearch" style="margin-right: 12px;">搜索</el-button>
      <el-button @click="handleReset" style="margin-right: 12px;">重置</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">删除</el-button>
      <el-button type="success" @click="handleExport" style="margin-right: 12px;">导出</el-button>
      <el-upload
        :action="''"
        :http-request="handleImport"
        accept=".xlsx,.xls,.csv"
        :show-file-list="false"
      >
        <el-button type="primary" style="margin-right: 12px;">导入</el-button>
      </el-upload>
    </div>
    <el-main>
      <el-table :data="billList" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="amount" label="金额" />
        <!-- 分类列往右调，并自定义内容 -->
        <el-table-column prop="categoryName" label="分类">
          <template #default="scope">
      <span>
        <img
            v-if="allCategories.find(c => c.name === scope.row.categoryName)?.logo"
            :src="allCategories.find(c => c.name === scope.row.categoryName).logo"
            style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"
        />
        {{ scope.row.categoryName }}
      </span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNo"
        @current-change="handlePageChange"
        style="margin-top: 16px; text-align: right;"
      />
    </el-main>

    <el-dialog v-model="editDialogVisible" title="编辑账单" width="400px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <el-form-item label="分类" prop="categoryId" required>
          <el-select v-model="editForm.categoryId" placeholder="请选择分类">
            <el-option
                v-for="item in allCategories"
                :key="item.id"
                :value="item.id"
                :label="item.name"
            >
    <span>
      <img v-if="item.logo" :src="item.logo" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;" />
      {{ item.name }}
    </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount" required>
          <el-input v-model="editForm.amount" type="number" />
        </el-form-item>
        <el-form-item label="日期" prop="date" required>
          <el-date-picker v-model="editForm.date" type="date" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getBillList, deleteBill } from '@/apis/inOutCome'
import { importBill, exportBill } from '@/apis/importAndExport.js'
import { useIconStore } from '@/stores/iconStore.js'
import { ElMessage } from 'element-plus'
import { updateListItem } from '@/apis/shoppingLists'
import dayjs from 'dayjs'

const billList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const multipleSelection = ref([])

const searchForm = ref({
  categoryId: '',
  startDate: '',
  endDate: '',
  keyword: '',
})

const iconStore = useIconStore()

const allCategories = computed(() => {
  return [...iconStore.incomeIcons, ...iconStore.outcomeIcons]
})

const fetchBillList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }
    if (searchForm.value.categoryId) params.categoryId = searchForm.value.categoryId
    if (searchForm.value.startDate) params.startDate = dayjs(searchForm.value.startDate).format('YYYY-MM-DD')
    if (searchForm.value.endDate) params.endDate = dayjs(searchForm.value.endDate).format('YYYY-MM-DD')
    if (searchForm.value.keyword) params.remark = searchForm.value.keyword
    const res = await getBillList(params)
    billList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (e) {
    billList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchForm.value.startDate && searchForm.value.endDate && searchForm.value.startDate > searchForm.value.endDate) {
    ElMessage.error('开始日期不能大于结束日期')
    return
  }
  pageNo.value = 1
  fetchBillList()
}

const handleReset = () => {
  searchForm.value = {
    categoryId: '',
    startDate: '',
    endDate: '',
    keyword: '',
  }
  pageNo.value = 1
  fetchBillList()
  ElMessage.success('重置成功')
}

const handlePageChange = (val) => {
  pageNo.value = val
  fetchBillList()
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) return
  await deleteBill({ ids: multipleSelection.value.map(item => item.id).join(',') })
  fetchBillList()
  ElMessage.success('删除成功')
}

const handleExport = async () => {
  try {
    const params = {}
    if (searchForm.value.startDate) params.startDate = searchForm.value.startDate
    if (searchForm.value.endDate) params.endDate = searchForm.value.endDate
    const res = await exportBill(params)
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '账单导出.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const handleImport = async (option) => {
  const formData = new FormData()
  formData.append('file', option.file)
  try {
    await importBill(formData)
    ElMessage.success('导入成功')
    fetchBillList()
  } catch (e) {
    ElMessage.error('导入失败')
  }
}

const editDialogVisible = ref(false)
const editForm = ref({})
const editFormRef = ref()
const editRules = {
  categoryId: [ { required: true, message: '请选择分类', trigger: 'change' } ],
  amount: [ { required: true, message: '请输入金额', trigger: 'blur' } ],
  date: [ { required: true, message: '请选择日期', trigger: 'change' } ]
}

const openEditDialog = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await updateListItem(editForm.value)
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      fetchBillList()
    } catch (e) {
      ElMessage.error('修改失败')
    }
  })
}

onMounted(() => {
  iconStore.fetchIcons()
  fetchBillList()
})
</script>

<style scoped>
.book-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
</style>

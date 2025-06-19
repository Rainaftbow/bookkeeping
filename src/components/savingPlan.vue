<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {getSavingPlanList, createSavingPlan, updateSavingPlan, deleteSavingPlan, getSavingPlan} from '@/apis/savingPlans.js'

const plans = ref([])
const loading = ref(false)
const selected = ref([]) // 批量选择
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  targetAmount: 0,
  currentAmount: 0,
  endDate: '',
  remark: ''
})
const pagination = ref({
  current: 1,
  pageSize: 8,
  total: 0
})
const formRef = ref()
const searchName = ref('')
const isSearched = ref(false)

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  targetAmount: [
    { required: true, message: '请输入目标金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '目标金额必须大于0', trigger: 'blur' }
  ],
  startDate: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
  endDate: [
    {
      validator: (rule, value, callback) => {
        if (value && form.value.startDate && value < form.value.startDate) {
          callback(new Error('截止日期不能早于起始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 获取计划列表
const fetchPlans = async () => {
  loading.value = true
  try {
    const res = await getSavingPlanList({current: pagination.value.current, pageSize: pagination.value.pageSize})
    plans.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch (e) {
    ElMessage.error('获取计划失败')
  } finally {
    loading.value = false
  }
}

// 打开新建/编辑弹窗
const openDialog = (plan = null) => {
  if (plan) {
    isEdit.value = true
    Object.assign(form.value, plan)
  } else {
    isEdit.value = false
    Object.assign(form.value, {
      id: null,
      name: '',
      targetAmount: 1000,
      currentAmount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      remark: ''
    })
  }
  dialogVisible.value = true
  // 重置校验
  formRef.value && formRef.value.clearValidate()
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await updateSavingPlan(form.value.id, form.value)
      ElMessage.success('修改成功')
    } else {
      await createSavingPlan(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchPlans()
  } catch (e) {
    ElMessage.error({duration: 1000, message: e.msg || '请规范填写信息'})
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selected.value.length) return
  try {
    await ElMessageBox.confirm('确定要删除选中的计划吗？', '提示', {type: 'warning'})
    await deleteSavingPlan({ids: selected.value})
    ElMessage.success('删除成功')
    selected.value = []
    await fetchPlans()
  } catch {
  }
}

// 根据ID搜索计划
const handleSearch = async () => {
  isSearched.value = !!searchName.value
  if (!searchName.value) {
    fetchPlans()
    return
  }
  loading.value = true
  try {
    let result = []
    // 按name查（本地过滤）
    const res = await getSavingPlanList({current: 1, pageSize: 1000})
    if (res.data?.list) {
      result = res.data.list.filter(plan => plan.name && plan.name.includes(searchName.value))
    }
    plans.value = result
    pagination.value.total = result.length
    if (!result.length) ElMessage.warning('未找到对应计划')
  } catch (e) {
    plans.value = []
    pagination.value.total = 0
    ElMessage.error('未找到对应计划')
  } finally {
    loading.value = false
  }
}

onMounted(fetchPlans)
</script>

<template>
  <div>
    <el-input v-model="searchName" placeholder="按名称搜索" style="width:180px;margin-bottom:12px;margin-right:8px;" clearable @keyup.enter.native="handleSearch" />
    <el-button @click="handleSearch" type="primary" style="margin-bottom:12px;">搜索</el-button>
    <el-button @click="() => {searchName='';isSearched=false;fetchPlans()}" style="margin-bottom:12px;">重置</el-button>
    <el-button type="danger" :disabled="!selected.length" @click="handleBatchDelete" style="margin-bottom: 12px;">
      删除
    </el-button>
    <el-row :gutter="16">
      <el-col v-for="plan in plans" :key="plan.id" :span="6">
        <el-card>
          <template #header>
            <el-checkbox v-model="selected" :label="plan.id" style="margin-right:8px;"/>
            <span>{{ plan.name }}</span>
            <el-button type="primary" size="small" @click="openDialog(plan)" style="float:right;">修改</el-button>
          </template>
          <div>目标金额：￥{{ plan.targetAmount }}</div>
          <div>已存金额：￥{{ plan.currentAmount }}</div>
          <div>截止日期：{{ plan.endDate || '长期' }}</div>
          <div v-if="plan.remark">备注：{{ plan.remark }}</div>
        </el-card>
      </el-col>
      <!-- 新建卡片：仅在未主动搜索时显示 -->
      <el-col v-if="!isSearched" :span="6">
        <el-card class="new-card" @click="openDialog()">
          <div style="text-align:center;color:#999;">
            <el-icon>
              <Plus/>
            </el-icon>
            <div>新建存钱计划</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination
        v-model:current-page="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="prev, pager, next, jumper"
        @current-change="fetchPlans"
        style="margin-top: 16px; text-align: right;"
    />
    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改计划' : '新建计划'">
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount" required>
          <el-input-number v-model="form.targetAmount" :min="0"/>
        </el-form-item>
        <el-form-item label="起始日期" prop="startDate" required>
          <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD"/>
        </el-form-item>
        <el-form-item label="截止日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD"/>
        </el-form-item>
        <el-form-item label="已存金额" prop="currentAmount">
          <el-input-number v-model="form.currentAmount" :min="0"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark"/>
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
.new-card {
  cursor: pointer;
  border: 1px dashed #bbb;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
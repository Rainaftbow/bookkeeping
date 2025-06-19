<script setup>
import {
  Notebook,
  Setting,
  Plus,
  Tickets,
  DataAnalysis,
  ShoppingCart,
  Calendar
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore.js'
import { useIconStore } from '@/stores/iconStore.js'
import { ElMessage, ElDialog } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { addBill } from "@/apis/index.js";
import { ref} from "vue";

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const iconStore = useIconStore()

// 表单数据
const form = ref({
  type: 1, // 默认收入类型
  amount: null,
  date: new Date().toISOString().split('T')[0], // 默认当天
  categoryId: null,
  remark: ''
})

// 控制弹窗显示
const dialogVisible = ref(false)
const loading = ref(false)

// 打开添加账单弹窗
const openAddBillDialog = () => {
  // 重置表单
  form.value = {
    type: 1,
    amount: null,
    date: new Date().toISOString().split('T')[0],
    categoryId: null,
    remark: ''
  }
  dialogVisible.value = true
}

// 提交账单
const handleBill = async () => {
  if (!form.value.amount || !form.value.categoryId || !form.value.date) {
    ElMessage.warning('请规范填写信息')
    return
  }
  try {
    loading.value = true
    await addBill(form.value)
    ElMessage.success('账单添加成功')
    dialogVisible.value = false
    // 重置表单
    form.value = {
      type: 1,
      amount: null,
      date: new Date().toISOString().split('T')[0],
      categoryId: null,
      remark: ''
    }
  } catch (err) {
    ElMessage.error(err || '请求失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleCommand = async (command) => {
  if (command === 'userInfo') {
    await router.push({name: 'userProfile'})
  }
  if (command === 'loginOut') {
    await userStore.logout()
    ElMessage.info("账号已登出")
  }
}

const handleTypeChange = () => {
  form.value.categoryId = null;
}

iconStore.fetchIcons()
</script>

<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-left">
        <el-icon size="24">
          <Notebook/>
        </el-icon>
        <span class="app-title">个人记账系统</span>
      </div>
      <el-dropdown @command="handleCommand" trigger="click" class="header-right">
        <el-button type="text">
          <el-icon size="24" color="black">
            <Setting/>
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="userInfo">个人中心</el-dropdown-item>
            <el-dropdown-item command="loginOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <!-- 主体区域（侧边栏 + 主内容） -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-card class="sidebar">
        <template #header>
          <div class="addButton">
            <el-button
                style="font-size: 16px; padding: 20px 20px;box-shadow: 2px 2px 2px rgb(0, 0, 0, 0.1)"
                type="plain"
                :icon="Plus"
                @click="openAddBillDialog"
            >
              添加账单
            </el-button>
          </div>
        </template>
        <el-menu style="position: relative;bottom: 70%" :router="true" :default-active="route.path">
          <el-menu-item index="/dashboard/diagrams">
            <el-icon>
              <DataAnalysis/>
            </el-icon>
            <span>报表</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/book">
            <el-icon>
              <Tickets/>
            </el-icon>
            <span>账单</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/shopping-list">
            <el-icon>
              <ShoppingCart/>
            </el-icon>
            <span>购物清单</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/saving-plan">
            <el-icon>
              <Calendar/>
            </el-icon>
            <span>存钱计划</span>
          </el-menu-item>
        </el-menu>
        <template #footer>
          <a class="aside-footer" href="https://github.com/Rainaftbow" target="_blank">© 2025 Rainaftbow</a>
        </template>
      </el-card>

      <!-- 主内容区域 -->
      <el-card class="mainArea">
        <router-view />
      </el-card>
    </el-container>

    <!-- 添加账单弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        title="添加账单"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="账单类型" required>
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio :label="1">收入</el-radio>
            <el-radio :label="0">支出</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="金额(￥)" required>
          <el-input-number
              v-model="form.amount"
              :precision="2"
              :min="0.01"
              :step="1"
              placeholder="输入金额"
          />
        </el-form-item>

        <el-form-item label="日期" required>
          <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" filterable style="width: 100%">
            <el-option
              v-for="item in iconStore.getCategoriesByType(form.type)"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <template #default>
                <img :src="item.logo" alt="icon" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" />
                <span>{{ item.name }}</span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBill" :loading="loading">
          确认添加
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100%;
  background-image: url("https://tu.ltyuanfang.cn/api/fengjing.php");
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  margin: 5px 0 5px 5px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.aside-footer {
  color: black;
  font-size: 12px;
  text-decoration: none;
}

.addButton {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.mainArea {
  flex: 1;
  margin: 5px;
  background-color: #f5f5f5;
  background-color: rgba(255, 255, 255, 0.9);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  font-size: 18px;
  font-weight: bold;
}

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>

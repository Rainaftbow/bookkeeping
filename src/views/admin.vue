<script setup>
import {Notebook, Setting} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore.js'
import {ElMessage} from "element-plus";
import router from "@/router/index.js";
const userStore = useUserStore()

const handleCommand = async (command) => {
    await userStore.logout()
    ElMessage.info("账号已登出")
}
</script>

<template>
  <el-container class="layout-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon size="24"><link><Notebook /></el-icon>
        <span class="app-title">个人记账系统后台</span>
      </div>
      <el-dropdown @command="handleCommand" trigger="click" class="header-right">
        <el-button type="info">
          <el-icon size="24"><Setting /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="loginOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>
    <el-main>该功能仍在开发中!</el-main>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100%
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
</style>
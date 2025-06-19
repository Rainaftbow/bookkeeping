<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import { storeToRefs } from "pinia";

const mode = ref('login')
const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  const success = await userStore.login(loginForm)
  if (success) {
    if (userInfo.value.username === 'admin') {
      await router.push('/admin')
    } else {
      const redirectPath = router.currentRoute.value.query.redirect || '/dashboard/diagrams'
      await router.push(redirectPath)
    }
  }
}

const handleRegister = async () => {
  const success = await userStore.register(registerForm)
  if (success) {
    mode.value = 'login'
    Object.assign(registerForm, { username: '', password: '', confirmPassword: '' })
  }
}
</script>

<template>
  <div class="container">
    <div class="login-card">
      <div class="mode-switch">
        <el-button
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
        >登录</el-button>
        <el-button
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
        >注册</el-button>
      </div>

      <el-form v-if="mode === 'login'" :model="loginForm" label-position="top" autocomplete="off">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              type="password"
          />
        </el-form-item>
        <el-form-item label-position="right">
          <el-button type="primary" block @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <el-form v-if="mode === 'register'" :model="registerForm" label-position="top" autocomplete="off">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
              v-model="registerForm.password"
              placeholder="请输入密码"
              type="password"
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              type="password"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" block @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  background-color: #f0f2f5;
  background-image: url("https://tu.ltyuanfang.cn/api/fengjing.php");
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 380px;
  padding: 32px 40px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.1);
  border-radius: 12px;
  box-sizing: border-box;
}

.mode-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.mode-switch .el-button {
  font-weight: 600;
  font-size: 18px;
  color: #606266;
}

.mode-switch .el-button.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}
</style>

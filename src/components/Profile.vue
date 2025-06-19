<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import {Back, Edit} from '@element-plus/icons-vue'
import { Get, Update } from '@/apis/auth.js'

const details = ref({
  username: '',
  phone: '',
  avatar: null,
})

const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  username: '',
  phone: '',
})

// 上传头像 input ref
const fileInput = ref(null)

// 头像上传事件
async function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = async (event) => {
    const newAvatar = event.target.result

    // 立即调用接口提交修改
    try {
      await Update({
        username: details.value.username,
        phone: details.value.phone,
        avatar: newAvatar,
      })
      details.value.avatar = newAvatar
      ElMessage.success('头像上传成功')
    } catch (err) {
      ElMessage.error('头像上传失败，请重试')
      console.error(err)
    }
  }
  reader.readAsDataURL(file)
}

function triggerFileInput() {
  fileInput.value.click()
}

// 打开修改弹窗
function openDialog() {
  form.value.username = details.value.username
  form.value.phone = details.value.phone
  dialogVisible.value = true
}

// 提交修改，调用接口
async function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    // 这里准备提交的数据
    const data = {
      username: form.value.username,
      phone: form.value.phone,
      avatar: details.value.avatar, // 把头像也传过去，如果接口支持
    }

    try {
      await Update(data)
      ElMessage.success('个人信息更新成功')

      dialogVisible.value = false

      // 更新本地 details
      await fetchdetails()
    } catch (err) {
      ElMessage.error(err)
      console.error(err)
    }
  })
}

// 获取用户信息接口调用封装
async function fetchdetails() {
  try {
    const res = await Get()
    details.value.username = res.data.username || ''
    details.value.phone = res.data.phone || ''
    details.value.avatar = res.data.avatar || null

    // 同步初始化表单数据
    form.value.username = details.value.username
    form.value.phone = details.value.phone
  } catch (err) {
    ElMessage.error('获取用户信息失败')
    console.error(err)
  }
}

onMounted(() => {
  fetchdetails()
})
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="hover">
      <div class="header">
        <router-link :to="{ name: 'diagrams' }">
          <el-button type="primary" :icon="Back"></el-button>
        </router-link>
      </div>
      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-wrapper" @click="triggerFileInput" title="点击上传头像">
          <img
              v-if="details.avatar"
              :src="details.avatar"
              alt="头像"
              class="avatar-image"
          />
          <div v-else class="avatar-placeholder">上传头像</div>
          <input
              type="file"
              accept="image/*"
              ref="fileInput"
              class="avatar-file-input"
              @change="onAvatarChange"
          />
        </div>

        <!-- 用户信息 -->
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ details.username}}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号：</span>
          <span class="value">{{ details.phone}}</span>
        </div>
      </div>

      <!-- 右下角修改按钮 -->
      <el-button
          class="edit-btn"
          type="primary"
          size="small"
          @click="openDialog"
          :icon="Edit"
      >
        修改信息
      </el-button>
    </el-card>

    <!-- 修改信息弹窗 -->
    <el-dialog
        title="修改个人信息"
        v-model="dialogVisible"
        width="400px"
        :before-close="() => (dialogVisible = false)"
    >
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username"
                      :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="form.username"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone"
                      :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]">
          <el-input v-model="form.phone"/>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 60px 16px;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
}

.header {
  position: absolute;
  left: 0;
  top: 0;
}

/* 卡片内容垂直居中，整体居中 */
.profile-card {
  display: flex;
  flex-direction: row;
  position: relative;
  min-height: 400px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 头像 + 信息垂直排列 */
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 用户信息左对齐 */
  gap: 16px;
  width: 100%;
  max-width: 320px;  /* 限制宽度方便控制居中效果 */
}

/* 头像容器 */
/* 通过margin自动居中头像 */
.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f0f0;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  user-select: none;
  margin: 0 auto; /* 让头像容器水平居中 */
  box-shadow: 0 0 6px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.avatar-wrapper:hover {
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
}

/* 隐藏的文件上传input */
.avatar-file-input {
  display: none;
}

/* 头像图片 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* 头像为空时的占位 */
.avatar-placeholder {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 0 10px;
  user-select: none;
}

/* 用户信息条目 */
.info-item {
  display: flex;
  gap: 8px;
  font-size: 18px;
  color: #333;
  user-select: none;
  width: 100%;
}

/* 标签 */
.label {
  font-weight: 600;
  color: #606266;
  min-width: 70px; /* 统一标签宽度，便于对齐 */
  text-align: left;
  flex-shrink: 0;
}

/* 值 */
.value {
  font-weight: 400;
  flex: 1; /* 占满剩余空间 */
  text-align: left;
  word-break: break-word; /* 防止长内容撑破布局 */
}

/* 卡片右下角修改按钮 */
.edit-btn {
  position: absolute;
  right: 0;
  bottom: 0;
}

.edit-btn:hover {
  background-color: #66b1ff;
}

</style>

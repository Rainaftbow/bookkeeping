import { defineStore } from 'pinia'
import {Login, Register} from "@/apis/index.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        userInfo: null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions: {
        setAuth(data) {
            this.token = data.token || ''
            this.userInfo = data || null
            sessionStorage.setItem('token', this.token)
            sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        },
        loadAuthFromStorage() {
            const token = sessionStorage.getItem('token')
            const userInfoStr = sessionStorage.getItem('userInfo')
            if (token) this.token = token
            if (userInfoStr) {
                try {
                    this.userInfo = JSON.parse(userInfoStr)
                } catch (_) {
                    this.userInfo = null
                }
            }
        },
        async logout() {
            this.token = ''
            this.userInfo = null
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('userInfo')
            await router.push({name: 'login'})
        },
        // 登录逻辑封装
        async login(form) {
            // 简单前端校验
            if (!form.username) {
                ElMessage.error('请输入用户名')
                return false
            }
            if (!form.password) {
                ElMessage.error('请输入密码')
                return false
            }
            try {
                const res = await Login(form)
                this.setAuth(res.data)
                ElMessage.success({duration: 1500, grouping: true, message: '登录成功'})
                return true
            } catch (err) {
                ElMessage.error(err)
                console.log(err)
                return false
            }
        },
        // 注册逻辑封装
        async register(form) {
            // 简单前端校验
            if (!form.username) {
                ElMessage.error('请输入用户名')
                return false
            }
            if (!form.password) {
                ElMessage.error('请输入密码')
                return false
            }
            // 密码规范校验
            const pwd = form.password;
            // 1. 长度校验
            if (pwd.length <= 6 || pwd.length >= 20) {
                ElMessage.error('密码长度需大于6且小于20个字符')
                return false
            }
            // 2. 只能包含字母、数字、下划线
            if (!/^\w+$/.test(pwd)) {
                ElMessage.error('密码只能包含字母、数字和下划线')
                return false
            }
            // 3. 下划线不能在开头
            if (/^_/.test(pwd)) {
                ElMessage.error('密码不能以下划线开头')
                return false
            }
            // 4. 必须包含字母和数字
            if (!(/[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd))) {
                ElMessage.error('密码必须包含字母和数字')
                return false
            }
            if (form.password !== form.confirmPassword) {
                ElMessage.error('两次输入密码不一致')
                return false
            }
            try {
                await Register({
                    username: form.username,
                    password: form.password
                })
                ElMessage.success('注册成功，请登录')
                return true
            } catch (err) {
                ElMessage.error(err)
                console.log(err)
                return false
            }
        }
    }
})

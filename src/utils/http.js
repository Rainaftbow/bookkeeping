import axios from 'axios'

// 创建实例
const service = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(function (config) {
    const token = sessionStorage.getItem('token')
    if (token) {
        config.headers.token = token
    }
    // 仅当不是 FormData 时设置 json Content-Type
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 如果是导出（blob），直接返回 response
        if (response.config.responseType === 'blob') {
            return response
        }
        if (response.data.code !== 1) {
            console.log(response.data)
            return Promise.reject(response.data.msg || '服务器状态正常，业务code异常')
        }
        return response.data
    },
    error => {
        return Promise.reject(error)
    }
)

export default service

// stores/iconStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategoryList } from "@/apis/index.js";

export const useIconStore = defineStore('icon', () => {
    const outcomeIcons = ref([]) // 支出分类
    const incomeIcons = ref([])  // 收入分类
    const loading = ref(false)
    const error = ref(null)

    // 获取分类数据
    const fetchIcons = async () => {
        try {
            loading.value = true
            error.value = null

            // 并行获取收入和支出分类
            const [outcomeRes, incomeRes] = await Promise.all([
                getCategoryList({type: 0}), // 支出
                getCategoryList({type: 1})  // 收入
            ])

            outcomeIcons.value = outcomeRes.data
            incomeIcons.value = incomeRes.data
            } catch (err) {
            error.value = err || '获取分类数据失败'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    // 根据类型获取分类选项
    const getCategoriesByType = (type) => {
        return type === 1 ? incomeIcons.value : outcomeIcons.value
    }

    return {
        outcomeIcons,
        incomeIcons,
        loading,
        error,
        fetchIcons,
        getCategoriesByType,
    }
})

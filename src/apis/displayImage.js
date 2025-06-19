import service from '@/utils/http'

export const getCategoryPie = (params) => service.get('/statistics/category', {params})
export const getMonthlyTrend = (params) => service.get('/statistics/monthlyTrend', {params})

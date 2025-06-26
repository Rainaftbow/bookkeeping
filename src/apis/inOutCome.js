import service from '@/utils/http'

export const addBill = (data) => service.post('/bill', data)
export const getCategoryList = (type) => service.get('/category/list', {params: type})
export const getBillList = (params) => service.get('/bill/list', {params})
export const getBillInId = (id) => service.get(`/bill/${id}`)
export const updateBill = (data) => service.put(`/bill`, data)
export const deleteBill = (ids) => service.delete(`/bill`, {params: ids})
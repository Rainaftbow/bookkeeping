import service from '@/utils/http'

export const createList = (data) => service.post('/shoppingList', data)
export const markItemAsBought = (status, itemId) => service.post(`/shoppingList/item/${itemId}`, {params: {status}})
export const getInPage = (params) => service.get(`/shoppingList/list`, {params})
export const getList = (id) => service.get(`/shoppingList/${id}`)
export const addItem = (data) => service.post(`/shoppingList/item/addItem`, data)
export const updateList = (data) => service.put(`/shoppingList`, data)
export const updateListItem = (data) => service.put(`/shoppingList/item`, data)
export const deleteList = (params) => service.delete(`/shoppingList`, {params})
export const deleteListItem = (params) => service.delete(`/shoppingList/item`, {params})
export const getItem = (id) => service.get(`/shoppingList/item/${id}`)
export const markListAsBought = (id) => service.post(`/shoppingList/status`)
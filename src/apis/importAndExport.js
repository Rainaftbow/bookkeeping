import service from "@/utils/http.js";

export const importBill = (data) => service.post('/bill/import', data);
export const exportBill = (params) => service({
  url: '/bill/export',
  method: 'get',
  params,
  responseType: 'blob',
  headers: {
    Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/octet-stream,*/*'
  }
})

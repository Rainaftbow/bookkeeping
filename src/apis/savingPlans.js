import service from "@/utils/http.js";

export const createSavingPlan = (data) => service.post("/savingPlan", data);
export const getSavingPlan = (id) => service.get(`/savingPlan/${id}`);
export const updateSavingPlan = (id, data) => service.put(`/savingPlan`, data);
export const deleteSavingPlan = (ids) => service.delete(`/savingPlan`, {params: ids});
export const getSavingPlanList = (params) => service.get("/savingPlan/list", {params});
import service from "@/utils/http.js";

export const uploadFile = (file) => service.post("/common/upload", file)
import { UploadParams, UploadResponse } from "../types/chat";
import api from "./axios-instance";
export const uploadMedia = async (params: UploadParams)=> {
  const { files, fileName } = params;
  const formData = new FormData();
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach((file, index) => {
    if (file instanceof Blob && !(file instanceof File)) {
      const name = fileName || `upload-${Date.now()}-${index}`;
      formData.append("files", file, name);
    } else {
      formData.append("files", file as File);
    }
  });

  // 'api' is your axios instance
  const { data } = await api.post("/upload/bulk", formData, {});

  return data;
};
import API from '@/lib/service';

export const readFileAsBinary = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

type TUploadFilePayload = {
  file: File;
  categoryId: string;
  type: string;
  name: string;
};

export type TUploadFileResponse = {
  id: string;
  path: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
};

class UploadServices {
  private static basePath = '/file-upload';

  static uploadFile = async (payload: TUploadFilePayload): Promise<TUploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('categoryId', payload.categoryId);
    formData.append('type', payload.type);
    formData.append('name', payload.name);

    return API.post(UploadServices.basePath, formData);
  };
}

export default UploadServices;

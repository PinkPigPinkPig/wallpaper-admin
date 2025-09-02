export type TListResponse<T> = {
  data: T;
  totalItems: number;
};

export type TFile<T = unknown> = {
  id?: string;
  fileId?: string;
  type?: T;
  fileName: string;
  filePath: string;
  fileExtension: string;
  url?: string;
};

export type TMimeType = {
  type: 'MimeType.Static';
  value: string;
};

export type TFormRef = {
  submit: () => void;
};

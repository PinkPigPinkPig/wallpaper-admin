import { ProjectFileType } from '@/data/constants';
import { TFile } from '@/data/type';

export function convertToArray(fileExtensions: string): string[] {
  return fileExtensions
    .split(',')
    .map((ext) => ext.trim())
    .map((ext) => ext.replace('.', ''))
    .filter((ext) => ext.length > 0);
}

export const getFileValues = <T = ProjectFileType>(files: TFile<T>[], type: T) => {
  const filteredFiles = files
    .filter((file) => file.type === type)
    .map((file) => {
      return {
        id: file.id,
        uid: file.id ?? '',
        name: file.fileName,
        url: file.url,
        extension: file.fileExtension,
        path: file.filePath,
        fileType: file.type,
      };
    });

  return filteredFiles;
};

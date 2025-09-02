import { Rule } from 'antd/es/form';
import { TFileType, checkIsValidFiles, checkIsValidFilesSize } from './useUpload';
import { convertToArray } from '@/utils/file';

const useValidation = () => {

  const validateFile =
    (accepts: string[], size: number) =>
    (_: Rule, fileList: TFileType[]) => {
      return new Promise((resolve, reject) => {
        if (!fileList || !fileList.length) resolve(true);

        const extension = accepts.reduce((str, item, index) => {
          if (index < accepts.length - 1) {
            return `${str}${item.toUpperCase()}, `;
          }

          return `${str}or ${item.toUpperCase()}`;
        }, '');

        for (const file of fileList) {
          if (!file.type || !file.size) continue;

          if (!checkIsValidFiles(file, accepts) || !checkIsValidFilesSize(file, size)) {
            reject(`Please choose a file that is smaller than ${size}MB and in ${extension} format.`);
            break;
          }
        }

        resolve(true);
      });
    };

  const validateFileNew =
    (accept: string, size: number) =>
    (_: Rule, fileList: TFileType[]) => {
      const arrayAccepts = convertToArray(accept);

      return new Promise((resolve, reject) => {
        if (!fileList || !fileList.length) resolve(true);

        const extension = arrayAccepts.reduce((str, item, index) => {
          if (index < arrayAccepts.length - 1) {
            return `${str}${item.toUpperCase()}, `;
          }

          return `${str}or ${item.toUpperCase()}`;
        }, '');

        for (const file of fileList) {
          if (!file.type || !file.size) continue;

          if (!checkIsValidFiles(file, arrayAccepts) || !checkIsValidFilesSize(file, size)) {
            reject(`Please choose a file that is smaller than ${size}MB and in ${extension} format.`);
            break;
          }

          // Check if file is uploaded (has id) or is a local file (has originFileObj)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!(file as any)?.id && !(file as any)?.originFileObj) {
            reject('Files are being uploaded');
            break;
          }
        }

        resolve(true);
      });
    };

  return {
    validateFile,
    validateFileNew,
  };
};

export default useValidation;

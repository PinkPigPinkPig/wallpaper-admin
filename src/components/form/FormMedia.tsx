import { useValidation } from "@/hooks";
import {
  ConfigProvider,
  FormInstance,
} from "antd";
import FormItem, {
  FormItemProps,
} from "antd/es/form/FormItem";
import { NamePath } from "antd/es/form/interface";
import { Rule } from "antd/es/form";
import UploadMedia from "./UploadMedia";
import { TFileType } from "@/hooks/useUpload";

interface IProps<TForm> extends FormItemProps {
  form: FormInstance;
  name: keyof TForm;
  label?: string;
  rules?: Rule[];
  fileType?: string;
  multiple?: boolean;
  maxCount?: number;
  size?: number;
  accept?: string;
  disabled?: boolean;
  onFilesChange?: (files: TFileType[]) => void;
}

const FormMedia = <TForm,>({
  label,
  name,
  maxCount = 9999,
  size = 64,
  rules,
  fileType,
  accept = ".jpg, .jpeg, .png, .mp4, .avi, .mov, .wmv, .flv, .webm",
  multiple,
  disabled,
  onFilesChange,
  ...rest
}: IProps<TForm>) => {
  const { validateFileNew } = useValidation();
  const { componentDisabled } =
    ConfigProvider.useConfig();

  return (
    <FormItem<TForm>
      label={label}
      name={name as string | NamePath}
      valuePropName="fileList"
      validateTrigger="onChange"
      className="custom-error-margin"
      rules={[
        {
          validator: validateFileNew(
            accept,
            size
          ),
        },
        ...(rules || []),
      ]}
      {...rest}
    >
      <UploadMedia
        multiple={multiple}
        fileType={fileType}
        accept={accept}
        maxCount={maxCount}
        onFilesChange={onFilesChange}
        disabled={
          disabled !== undefined
            ? disabled
            : componentDisabled
        }
      />
    </FormItem>
  );
};

export default FormMedia;

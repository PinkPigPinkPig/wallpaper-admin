import Select, {
  SelectProps,
} from "antd/es/select";
import {
  useCallback,
  useMemo,
  useRef,
} from "react";
import useGetCategoryOptions from "../hooks/useGetCategoryOptions";

type LabelRender = SelectProps["labelRender"];

type TProps = SelectProps;

const SelectCategory = ({
  value,
  defaultValue,
  ...rest
}: TProps) => {
  const openDropdown = useRef(false);

  const computedDefaultValue = useMemo(() => {
    if (typeof defaultValue === "string")
      return Number(defaultValue);

    if (
      typeof defaultValue === "object" &&
      Array.isArray(defaultValue)
    ) {
      return defaultValue.map((o) => Number(o));
    }

    return defaultValue;
  }, [defaultValue]);

  const {
    search,
    options,
    isLoading,
    onSearch,
    refetch,
  } = useGetCategoryOptions(
    {},
    {
      enabled:
        !rest.disabled && openDropdown.current,
    }
  );

  const onSelect = useCallback(() => {
    if (search.current?.get("categoryId"))
      onSearch("");
  }, [search, onSearch]);

  const labelRender: LabelRender = (props) => {
    const { label } = props;
    return label;
  };

  const onDropdownVisibleChange = (
    open: boolean
  ) => {
    if (openDropdown.current) return;
    openDropdown.current = open;
    refetch();
  };

  return (
    <Select
      {...rest}
      defaultValue={computedDefaultValue}
      value={value}
      size="large"
      showSearch
      filterOption={false}
      labelRender={labelRender}
      options={options}
      loading={isLoading}
      allowClear
      onSearch={onSearch}
      onSelect={onSelect}
      onOpenChange={onDropdownVisibleChange}
    />
  );
};

export default SelectCategory;

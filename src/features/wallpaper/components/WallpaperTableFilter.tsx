"use client";

import FilterContainer from "@/components/ui/FilterContainer";
import SelectCategory from "@/features/category/components/SelectCategory";
import useTableFilter from "@/hooks/useTableFilter";
import {
  Input,
  InputProps,
  SelectProps,
} from "antd";
import { useSearchParams } from "next/navigation";
import React from "react";

const WallpaperTableFilter = () => {
  const searchParams = useSearchParams();
  const searchKeyword =
    searchParams
      .get("keyword")
      ?.split(",") ?? [];
  const selectedCategoryId =
    searchParams
      .get("categoryId") ?? undefined;
  const { onDebouncedFilter, onFilter } =
    useTableFilter();

  const onChangeInput: (
    key: string
  ) => InputProps["onChange"] =
    (key) => (event) => {
      onDebouncedFilter(key, event.target.value);
    };

  const onChangeSelect: (
    key: string
  ) => SelectProps["onChange"] =
    (key) => (value) => {
      onFilter(key, value);
    };

  return (
    <FilterContainer>
      <Input
        defaultValue={searchKeyword}
        placeholder={"Search"}
        allowClear
        onChange={onChangeInput("keyword")}
      />
      <SelectCategory
        placeholder={"Filter by category"}
        onChange={onChangeSelect("categoryId")}
        value={selectedCategoryId}
      />
    </FilterContainer>
  );
};

export default WallpaperTableFilter;

'use client'

import FilterContainer from '@/components/ui/FilterContainer';
import useTableFilter from '@/hooks/useTableFilter';
import { Input, InputProps } from 'antd';
import { useSearchParams } from 'next/navigation';
import React from 'react'

const CategoryTableFilter = () => {
    const searchParams = useSearchParams();
    const searchKeyword =
      searchParams
        .get("keyword")
        ?.split(",") ?? [];

    const { onDebouncedFilter } =
      useTableFilter();
  
    const onChangeInput: (
      key: string
    ) => InputProps["onChange"] =
      (key) => (event) => {
        onDebouncedFilter(key, event.target.value);
      };
  
    return (
      <FilterContainer>
        <Input
          defaultValue={searchKeyword}
          placeholder={"Search"}
          allowClear
          onChange={onChangeInput("keyword")}
        />
      </FilterContainer>
    );
  }

export default CategoryTableFilter
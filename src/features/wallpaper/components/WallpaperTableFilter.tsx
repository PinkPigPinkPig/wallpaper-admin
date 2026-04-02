"use client";

import { Button, Card, Flex, Input } from "antd";
import FilterContainer from "@/components/ui/FilterContainer";
import SelectCategory from "@/features/category/components/SelectCategory";
import useTableFilter from "@/hooks/useTableFilter";
import { useSearchParams } from "next/navigation";
import React from "react";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";

const WallpaperTableFilter = () => {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("keyword")?.split(",") ?? [];
  const selectedCategoryId = searchParams.get("categoryId") ?? undefined;
  const { onDebouncedFilter, onFilter, onClearFilters } = useTableFilter();

  const hasActiveFilters = searchKeyword.length > 0 || !!selectedCategoryId;

  const onChangeInput = (key: string): Input["onChange"] =>
    (e) => {
      onDebouncedFilter(key, e.target.value);
    };

  return (
    <Card
      size="small"
      style={{ marginBottom: 16, borderRadius: 12 }}
      styles={{ body: { padding: "16px 20px" } }}
    >
      <Flex vertical gap={12}>
        <Flex align="center" justify="space-between">
          <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>
            Filters
          </span>
          {hasActiveFilters && (
            <Button
              type="link"
              size="small"
              icon={<ClearOutlined />}
              onClick={onClearFilters}
              danger
              style={{ paddingRight: 0 }}
            >
              Clear filters
            </Button>
          )}
        </Flex>

        <FilterContainer>
          <div>
            <Input
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              defaultValue={searchKeyword.join(",")}
              placeholder="Search by name or tags"
              allowClear
              onChange={onChangeInput("keyword")}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>
          <div>
            <SelectCategory
              placeholder="Filter by category"
              onChange={(value) => onFilter("categoryId", value)}
              value={selectedCategoryId}
              size="large"
              style={{ width: "100%" }}
            />
          </div>
        </FilterContainer>
      </Flex>
    </Card>
  );
};

export default WallpaperTableFilter;

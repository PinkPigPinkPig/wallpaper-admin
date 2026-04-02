"use client";

import CommonTable from "@/components/ui/CommonTable";
import React from "react";
import { TCategory } from "../data/type";
import Show from "@/components/ui/Show";
import { Dropdown, Flex, MenuProps } from "antd";
import { ColumnsType } from "antd/es/table";
import Link, {
  TLinkHref,
} from "@/components/ui/Link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import useURLQueries from "@/hooks/useURLQueries";
import useGetCategoryList from "../hooks/useGetCategoryList";
import Image from "next/image";
import { MoreOutlined } from "@ant-design/icons";

const CategoryTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { currentPage, currentPageSize } =
    useURLQueries();

  const { data, isLoading } = useGetCategoryList(
    `${searchParams.toString()}` || undefined
  );

  const onRowClick = (record: TCategory) => {
    router.push(
      `/admin/category/${record.id}/detail` as TLinkHref
    );
  };

  const handleDeleteButtonClick = (
    record: TCategory
  ) => {
    console.log(record);
  };

  const actions = (record: TCategory) => {
    const actions = [
      {
        key: "1",
        label: (
          <Link
            href={
              `/admin/category/${record.id}/detail` as TLinkHref
            }
          >
            <Flex
              gap={8}
              style={{ width: 200, height: 40 }}
              align="center"
              justify="start"
            >
              Edit
            </Flex>
          </Link>
        ),
      },
      {
        key: "3",
        label: (
          <Flex
            gap={8}
            style={{ minWidth: 140, height: 40 }}
            align="center"
            justify="start"
            onClick={() =>
              handleDeleteButtonClick(record)
            }
          >
            Delete
          </Flex>
        ),
      },
    ] as MenuProps["items"];

    return actions;
  };

  const columns: ColumnsType<TCategory> = [
    {
      title: "#",
      dataIndex: "id",
      sorter: false,
      render: (id, record, index) => (
        <div key={id} id={record.id.toString()}>
          {(currentPage - 1) * currentPageSize +
            index +
            1}
        </div>
      ),
      width: 60,
      key: "id",
    },
    {
      title: "Thumbnail",
      dataIndex: "thumbUrl",
      render: (thumbUrl) => {
        if (!thumbUrl) {
          return <div>No thumbnail</div>;
        }
        try {
          // Validate URL
          new URL(thumbUrl);
          return (
            <Image
              src={thumbUrl}
              alt="thumbnail"
              width={100}
              height={100}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          );
        } catch {
          return <div>Invalid URL</div>;
        }
      },
      key: "thumbUrl",
      width: 171,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name) => name,
      key: "name",
      width: 171,
      ellipsis: true,
    },
    {
      title: "Total Wallpaper",
      dataIndex: "totalWallpaper",
      render: (totalWallpaper) => totalWallpaper,
      key: "totalWallpaper",
      width: 171,
    },
    {
      title: "Updated",
      dataIndex: "updated",
      render: (updated) => {
        if (!updated) return '-';
        const date = new Date(Number(updated));
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      },
      key: "updated",
      width: 171,
    },
    {
      title: "Actions",
      dataIndex: "id",
      onCell: () => ({
        onClick: (e) => {
          e.stopPropagation();
        },
      }),
      render: (id, record) => (
        <Show when={id}>
          <Dropdown
            menu={{
              items: actions(record),
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <MoreOutlined
              style={{
                fontSize: 24,
                color: "#3437B3",
              }}
            />
          </Dropdown>
        </Show>
      ),
      width: 96,
      align: "center",
      key: "actions",
    },
  ];

  return (
    <CommonTable<TCategory>
      loading={isLoading}
      columns={columns}
      dataSource={data?.data}
      total={data?.totalItems}
      onClickRow={onRowClick}
    />
  );
};

export default CategoryTable;

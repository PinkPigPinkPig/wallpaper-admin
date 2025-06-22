"use client";

import useURLQueries from "@/hooks/useURLQueries";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import React from "react";
import useGetWallpaperList from "../hooks/useGetWallpaperList";
import { Dropdown, Flex, MenuProps } from "antd";
import { TWallpaper, WallpaperMime } from "../data/type";
import Link, {
  TLinkHref,
} from "@/components/ui/Link";
import { ColumnsType } from "antd/es/table";
import Show from "@/components/ui/Show";
import { MoreOutlined } from "@ant-design/icons";
import CommonTable from "@/components/ui/CommonTable";
import Image from "next/image";

const WallpaperTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { currentPage, currentPageSize } =
    useURLQueries();

  const { data, isLoading } = useGetWallpaperList(
    `${searchParams.toString()}` || undefined
  );

  const onRowClick = (record: TWallpaper) => {
    router.push(
      `/admin/wallpaper/${record.id}/detail` as TLinkHref
    );
  };

  const handleDeleteButtonClick = (
    record: TWallpaper
  ) => {
    console.log(record);
  };

  const actions = (record: TWallpaper) => {
    const actions = [
      {
        key: "1",
        label: (
          <Link
            href={
              `/admin/wallpaper/${record.id}/detail` as TLinkHref
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

  const columns: ColumnsType<TWallpaper> = [
    {
      title: "No.",
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
      render: (thumbUrl) => <Image src={thumbUrl} alt="thumbnail" width={100} height={100} />,
      key: "thumbUrl",
      width: 171,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name) => name,
      key: "name",
      width: 171,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      render: (categoryName) => categoryName,
      key: "categoryName",
      width: 171,
    },
    {
      title: "Linked Menu",
      dataIndex: "numberOfMenu",
      render: (numberOfMenu) => numberOfMenu,
      key: "numberOfMenu",
      width: 171,
    },
    {
      title: "Type",
      dataIndex: "mime",
      render: (mime: WallpaperMime) => mime.value,
      key: "mime",
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
    <CommonTable<TWallpaper>
      loading={isLoading}
      columns={columns}
      dataSource={data?.data}
      total={data?.totalItems}
      onClickRow={onRowClick}
    />
  );
};

export default WallpaperTable;

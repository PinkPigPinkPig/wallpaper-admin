"use client";

import useURLQueries from "@/hooks/useURLQueries";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useRef, useState } from "react";
import useGetWallpaperList from "../hooks/useGetWallpaperList";
import { Button, Dropdown, Flex, MenuProps, Modal } from "antd";
import { TWallpaper } from "../data/type";
import { TMimeType, TFormRef } from "@/data/type";
import Link, {
  TLinkHref,
} from "@/components/ui/Link";
import { ColumnsType } from "antd/es/table";
import Show from "@/components/ui/Show";
import { MoreOutlined } from "@ant-design/icons";
import CommonTable from "@/components/ui/CommonTable";
import Image from "next/image";
import MenuForm, { TMenuForm } from "@/features/menu/components/form/MenuForm";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showToast } from '@/lib/error';
import { TSaveMenuPayload } from "@/features/menu/data/type";
import { IResponseError } from '@/lib/service/utility';
import MenuServices from "@/features/menu/services";

const WallpaperTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const menuFormRef = useRef<TFormRef>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<TWallpaper | null>(null);

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

  const handleCreateMenuButtonClick = (
    record: TWallpaper
  ) => {
    setSelectedWallpaper(record);
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedWallpaper(null);
  };

  const onSuccess = () => {
    showSuccessToast('create', 'menu-list', 'Menu created');
    queryClient.invalidateQueries({
      queryKey: ["menu-list"],
    });
    setIsModalOpen(false);
    setSelectedWallpaper(null);
  };

  const onError = (error: IResponseError<unknown>) => {
    console.error('Error creating menu:', error);
    showToast('server', 'Failed to create menu. Please try again.');
  };

  const { mutate: createMenu, isPending: isCreatingMenu } = useMutation({
    mutationFn: (payload: TSaveMenuPayload) => MenuServices.addMenu(payload),
    onSuccess,
    onError,
  });

  const handleMenuSubmit = (values: TMenuForm) => {
    if (!selectedWallpaper) return;

    const payload: TSaveMenuPayload = {
      ...values,
      wallpaper_id: selectedWallpaper.id,
      category_id: selectedWallpaper.category_id,
    };

    createMenu(payload);
  };

  const actions = (record: TWallpaper) => {
    const actions = [
      {
        key: "3",
        label: (
          <Flex
            gap={8}
            style={{ width: 200, height: 40 }}
            align="center"
            justify="start"
            onClick={() =>
              handleCreateMenuButtonClick(record)
            }
          >
            Create Menu
          </Flex>
        ),
      },
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
        key: "2",
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
      render: (thumbUrl) => (
        <Image
          src={thumbUrl}
          alt="thumbnail"
          width={100}
          height={100}
        />
      ),
      key: "thumbUrl",
      width: 171,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name) => name,
      key: "name",
      width: 171,
      ellipsis: { tooltip: true },
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      render: (categoryName) => categoryName,
      key: "categoryName",
      width: 171,
    },
    {
      title: "Menus",
      dataIndex: "numberOfMenu",
      render: (numberOfMenu) => numberOfMenu,
      key: "numberOfMenu",
      width: 171,
    },
    {
      title: "Type",
      dataIndex: "mime",
      render: (mime: TMimeType) => mime.value,
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
    <>
      <CommonTable<TWallpaper>
        loading={isLoading}
        columns={columns}
        dataSource={data?.data}
        total={data?.totalItems}
        onClickRow={onRowClick}
      />

      <Modal
        title="Create Menu"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <MenuForm
          ref={menuFormRef}
          onSubmit={handleMenuSubmit}
        />
        <Flex justify="end" gap={8} style={{ marginTop: 16 }}>
          <Button onClick={handleModalCancel}>Cancel</Button>
          <Button
            type="primary"
            loading={isCreatingMenu}
            onClick={() => menuFormRef.current?.submit()}
          >
            {isCreatingMenu ? "Creating..." : "Create Menu"}
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default WallpaperTable;

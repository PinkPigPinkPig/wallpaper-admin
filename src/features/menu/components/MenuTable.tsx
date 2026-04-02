import CommonTable from '@/components/ui/CommonTable';
import React, { useState } from 'react';
import { TMenu, MENU } from '../data/type';
import { useRouter, useSearchParams } from 'next/navigation';
import useURLQueries from '@/hooks/useURLQueries';
import useGetMenuList from '../hooks/useGetMenuList';
import Link, { TLinkHref } from '@/components/ui/Link';
import { Dropdown, Flex, MenuProps, Modal, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Image from 'next/image';
import Show from '@/components/ui/Show';
import { MoreOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showToast } from '@/lib/error';
import { IResponseError } from '@/lib/service/utility';
import MenuServices from '../services';

const MenuTable = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [deleteTarget, setDeleteTarget] = useState<TMenu | null>(null);

    const { currentPage, currentPageSize } =
      useURLQueries();

    const { data, isLoading } = useGetMenuList(
      `${searchParams.toString()}` || undefined
    );

    const onRowClick = (record: TMenu) => {
      router.push(
        `/admin/menu/${record.id}/detail` as TLinkHref
      );
    };

    const handleDeleteSuccess = () => {
      showSuccessToast('delete', MENU.LIST, 'Menu deleted');
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === MENU.LIST,
      });
      setDeleteTarget(null);
    };

    const { mutate: deleteMenu, isPending: isDeleting } = useMutation({
      mutationFn: (id: number) => MenuServices.deleteMenu(id),
      onSuccess: handleDeleteSuccess,
      onError: (error: IResponseError<unknown>) => {
        showToast('server', (error as { message?: string }).message || 'Failed to delete menu');
      },
    });

    const actions = (record: TMenu) => {
      const items = [
        {
          key: "1",
          label: (
            <Link
              href={
                `/admin/menu/${record.id}/detail` as TLinkHref
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
              onClick={() => setDeleteTarget(record)}
            >
              Delete
            </Flex>
          ),
        },
      ] as MenuProps["items"];

      return items;
    };

    const columns: ColumnsType<TMenu> = [
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
        title: "Wallpaper Name",
        dataIndex: "wallpaperName",
        render: (wallpaperName) => wallpaperName,
        key: "wallpaperName",
        width: 171,
        ellipsis: true,
      },
      {
        title: "Category",
        dataIndex: "categoryName",
        render: (categoryName) => categoryName,
        key: "categoryName",
        width: 171,
        ellipsis: true,
      },
      {
        title: "Filter",
        dataIndex: "filter",
        render: (filter) => filter,
        key: "filter",
        width: 171,
      },
      {
        title: "Query Order",
        dataIndex: "queryOrder",
        render: (queryOrder) => queryOrder,
        key: "queryOrder",
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
      <>
        <CommonTable<TMenu>
          loading={isLoading}
          columns={columns}
          dataSource={data?.data}
          total={data?.totalItems}
          onClickRow={onRowClick}
        />

        <Modal
          title="Delete Menu"
          open={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          footer={
            <Flex gap={8} justify="end">
              <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                danger
                type="primary"
                loading={isDeleting}
                onClick={() => deleteTarget && deleteMenu(deleteTarget.id)}
              >
                Delete
              </Button>
            </Flex>
          }
        >
          <p>
            Are you sure you want to delete this menu?
          </p>
        </Modal>
      </>
    );
}

export default MenuTable

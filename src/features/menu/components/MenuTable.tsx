import CommonTable from '@/components/ui/CommonTable';
import React from 'react'
import { TMenu } from '../data/type';
import { useRouter, useSearchParams } from 'next/navigation';
import useURLQueries from '@/hooks/useURLQueries';
import useGetMenuList from '../hooks/useGetMenuList';
import Link, { TLinkHref } from '@/components/ui/Link';
import { Dropdown, Flex, MenuProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Image from 'next/image';
import Show from '@/components/ui/Show';
import { MoreOutlined } from "@ant-design/icons";

const MenuTable = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
  
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
  
    const handleDeleteButtonClick = (
      record: TMenu
    ) => {
      console.log(record);
    };
  
    const actions = (record: TMenu) => {
      const actions = [
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
      <CommonTable<TMenu>
        loading={isLoading}
        columns={columns}
        dataSource={data?.data}
        total={data?.totalItems}
        onClickRow={onRowClick}
      />
    );
  }

export default MenuTable
'use client';
import { Flex, Table, Typography, type TableProps } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { ReactNode } from 'react';
import EmptyData from '@/assets/svg/EmptyData.svg';
import Image from 'next/image';
import Show from './Show';
import { Key, SorterResult } from 'antd/es/table/interface';
import { TLinkHref } from './Link';

const { Text } = Typography;

export const TableEmpty = ({ text, img }: { text: ReactNode; img: string }) => {

  return (
    <Flex vertical justify="center" align="center" gap={24} style={{ marginTop: 32 }}>
      <Image src={img ?? EmptyData} alt="Empty data" style={{ pointerEvents: 'none' }} />
      <Text>{text ?? "No data"}</Text>
    </Flex>
  );
};

type TProps<TData> = {
  emptyText?: ReactNode;
  total?: number;
  onClickRow?: (record: TData) => void;
} & TableProps<TData>;

const CommonTable = <TData,>({
  loading,
  columns,
  dataSource = [],
  total = 0,
  emptyText,
  onClickRow,
  pagination,
  ...rest
}: TProps<TData>) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Derive current page and page size from external or URL params
  const currentPage = (pagination && pagination?.current) || parseInt(searchParams.get('page') || '1');
  const currentPageSize = (pagination && pagination?.pageSize) || parseInt(searchParams.get('limit') || '10');

  const handleTableChange: TableProps<TData>['onChange'] = (pagination, _, sorter) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', (pagination.current || 1).toString());
    current.set('limit', (pagination.pageSize || 10).toString());
    current.delete('sort');

    if ((sorter as SorterResult<unknown>).order) {
      const order = (sorter as SorterResult<unknown>).order === 'ascend' ? 'asc' : 'desc';
      const orderBy = ([] as Key[]).concat((sorter as SorterResult<unknown>).field || []);

      if (orderBy.length) {
        const sort = [
          {
            orderBy: orderBy.pop(),
            order,
          },
        ];

        current.set('sort', JSON.stringify(sort));
      }
    }

    router.replace(`${pathname}?${current.toString()}` as TLinkHref, { scroll: false });
  };

  const showTotal = (total: number) => {
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
        }}>{`Total ${total} ${total === 1 ? 'item' : 'items'}`}</div>
    );
  };

  return (
    <Table
      tableLayout="auto"
      key="ste-list-table"
      locale={{
        emptyText: (
          <Show when={emptyText} fallback={<TableEmpty text={"No data"} img={EmptyData} />}>
            {emptyText}
          </Show>
        ),
      }}
      loading={loading}
      columns={columns}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rowKey={(record) => (record as any)?.id || (record as any)?._id || (record as any)?.name}
      dataSource={dataSource}
      scroll={{ x: 1000 }}
      pagination={
        pagination === false
          ? false
          : {
              total: total,
              pageSize: currentPageSize,
              current: currentPage,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal,
              ...pagination,
            }
      }
      showSorterTooltip={false}
      onChange={handleTableChange}
      onRow={(record) => {
        return {
          onClick: () => onClickRow && onClickRow(record),
        };
      }}
      {...rest}
    />
  );
};

export default CommonTable;

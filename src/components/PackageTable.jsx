import React from 'react';
import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { PACKAGE_TYPE_MAP, PACKAGE_STATUS_MAP } from '../data/packageMock';
import dayjs from 'dayjs';

function PackageTable({ data, loading, onEdit, onCopy, onToggle, onDelete }) {
  const columns = [
    {
      title: '套餐名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 160,
      render: (sku, record) => record.skuName || sku,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type) => {
        const config = PACKAGE_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '套餐内容',
      dataIndex: 'benefitsText',
      key: 'benefitsText',
      width: 200,
      ellipsis: true,
    },
    {
      title: '有效期',
      dataIndex: 'validityText',
      key: 'validityText',
      width: 110,
    },
    {
      title: '刊例价',
      dataIndex: 'priceInfo',
      key: 'priceInfo',
      width: 110,
    },
    {
      title: '实际售价',
      dataIndex: 'priceText',
      key: 'priceText',
      width: 110,
    },
    {
      title: '折扣',
      dataIndex: 'discountTag',
      key: 'discountTag',
      width: 110,
    },
    {
      title: '渠道',
      dataIndex: 'channelText',
      key: 'channelText',
      width: 110,
    },
    {
      title: '上架时间',
      dataIndex: 'shelfTime',
      key: 'shelfTime',
      width: 150,
      render: (shelfTime) => (shelfTime ? dayjs(shelfTime).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'displayStatus',
      key: 'displayStatus',
      width: 100,
      render: (displayStatus) => {
        const config = PACKAGE_STATUS_MAP[displayStatus] || { label: displayStatus, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.displayStatus === 'pending' && (
            <Button type="link" size="small" onClick={() => onEdit(record)}>
              编辑
            </Button>
          )}
          {['active', 'pending'].includes(record.displayStatus) && (
            <Button type="link" size="small" onClick={() => onToggle(record)}>
              {record.displayStatus === 'pending' ? '取消上架' : '下架'}
            </Button>
          )}
          {['inactive', 'replaced'].includes(record.displayStatus) && (
            <Button type="link" size="small" onClick={() => onCopy(record)}>
              复制
            </Button>
          )}
          <Popconfirm
            title="确认删除？"
            description="删除后不可恢复"
            onConfirm={() => onDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      scroll={{ x: 1300 }}
    />
  );
}

export default PackageTable;

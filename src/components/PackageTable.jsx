import React from 'react';
import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { PACKAGE_TYPE_MAP, PACKAGE_STATUS_MAP } from '../data/packageMock';

function PackageTable({ data, loading, onEdit, onToggle, onDelete }) {
  const columns = [
    {
      title: '套餐 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
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
      width: 120,
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
      width: 300,
      ellipsis: true,
    },
    {
      title: '有效期',
      dataIndex: 'validityText',
      key: 'validityText',
      width: 100,
    },
    {
      title: '原价 / 起价',
      dataIndex: 'priceInfo',
      key: 'priceInfo',
      width: 120,
    },
    {
      title: '现价 / 售价',
      dataIndex: 'priceText',
      key: 'priceText',
      width: 120,
    },
    {
      title: '优惠政策',
      dataIndex: 'promotionText',
      key: 'promotionText',
      width: 260,
      ellipsis: true,
    },
    {
      title: '适用渠道',
      dataIndex: 'channelText',
      key: 'channelText',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = PACKAGE_STATUS_MAP[status] || { label: status, color: 'default' };
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
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => onToggle(record)}>
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
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
      scroll={{ x: 1500 }}
    />
  );
}

export default PackageTable;

import React from 'react';
import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { PLAN_TYPE_MAP, STATUS_MAP } from '../data/mock';
import { EXPANDABLE_TYPES } from '../api/quota';

function QuotaTable({ data, loading, onEdit, onDetail, onLog, onDelete }) {
  const columns = [
    {
      title: '账号 ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 140,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '所属项目',
      dataIndex: 'project',
      key: 'project',
      width: 120,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '套餐权益',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const config = PLAN_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '积分额度',
      dataIndex: 'pointsLimitText',
      key: 'pointsLimitText',
      width: 160,
    },
    {
      title: '并发',
      dataIndex: 'concurrencyText',
      key: 'concurrencyText',
      width: 120,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
      render: (text) => (
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = STATUS_MAP[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const expandable = EXPANDABLE_TYPES.includes(record.type);
        return (
          <Space size="small">
            {expandable ? (
              <Button type="link" size="small" onClick={() => onEdit(record)}>
                编辑
              </Button>
            ) : (
              <Button type="link" size="small" onClick={() => onDetail(record)}>
                详情
              </Button>
            )}
            {!['personal', 'enterprise'].includes(record.type) && (
              <Button type="link" size="small" onClick={() => onLog(record)}>
                日志
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
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      scroll={{ x: 1400 }}
    />
  );
}

export default QuotaTable;

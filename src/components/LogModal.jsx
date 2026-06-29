import React, { useEffect, useState } from 'react';
import { Modal, Table, Empty, Tooltip } from 'antd';
import { getQuotaRecords } from '../api/quota';

function formatContent(record) {
  if (record.content) return record.content;
  if (!record.changes || record.changes.length === 0) return '-';

  if (record.action === '新增') {
    return `新增：${record.changes.map((c) => `${c.field}=${c.after}`).join('，')}`;
  }

  return record.changes
    .map((c) => {
      if (c.before && c.before !== '-') {
        return `${c.field}由「${c.before}」改为「${c.after}」`;
      }
      return `${c.field}设为「${c.after}」`;
    })
    .join('；');
}

function EllipsisCell({ text }) {
  return (
    <Tooltip title={text}>
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
}

function LogModal({ visible, record, onCancel }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && record) {
      setLoading(true);
      getQuotaRecords(record.id)
        .then((data) => setRecords(data))
        .finally(() => setLoading(false));
    }
  }, [visible, record]);

  if (!record) return null;

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '内容',
      key: 'content',
      ellipsis: true,
      render: (_, item) => {
        const text = formatContent(item);
        return <EllipsisCell text={text} />;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
  ];

  return (
    <Modal
      title="操作日志"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      {records.length === 0 && !loading ? (
        <Empty description="暂无操作日志" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={false}
          size="small"
        />
      )}
    </Modal>
  );
}

export default LogModal;

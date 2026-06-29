import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Tabs,
  Table,
  Card,
  Row,
  Col,
  Empty,
  Divider,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { PLAN_TYPE_MAP, STATUS_MAP, SKU_MAP } from '../data/mock';
import { getQuotaRecords } from '../api/quota';

const CHANNEL_MAP = {
  open_platform: '开放平台',
  own_channel: '自有渠道',
};

const ROLE_MAP = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
};

const SOURCE_MAP = {
  normal: '普通未分配',
  resigned: '离职释放',
};

function useOperationLogs(planId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    getQuotaRecords(planId)
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, [planId]);

  return { logs, loading };
}

function EllipsisNumber({ value, suffix = '' }) {
  const text = `${value}${suffix}`;
  return (
    <div
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      title={text}
    >
      {text}
    </div>
  );
}

function numColumn(title, key, suffix = '') {
  return {
    title,
    dataIndex: key,
    key,
    render: (value) => <EllipsisNumber value={value} suffix={suffix} />,
  };
}

const logColumns = [
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作人', dataIndex: 'operator', key: 'operator' },
  { title: '动作', dataIndex: 'action', key: 'action' },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    ellipsis: true,
    render: (content, record) => content || record.applyUrl || '-',
  },
  {
    title: '消费金额',
    dataIndex: 'consumedAmount',
    key: 'consumedAmount',
    render: (value) => (value != null ? <EllipsisNumber value={value} suffix=" 元" /> : '-'),
  },
];

function EllipsisText({ children }) {
  const text = children || '-';
  return (
    <div
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      title={text}
    >
      {text}
    </div>
  );
}

const purchaseColumns = [
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作人', dataIndex: 'operator', key: 'operator' },
  { title: '动作', dataIndex: 'action', key: 'action' },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    render: (content) => <EllipsisText>{content}</EllipsisText>,
  },
  {
    title: '消费金额',
    dataIndex: 'consumedAmount',
    key: 'consumedAmount',
    render: (value) => (value != null ? <EllipsisNumber value={value} suffix=" 元" /> : '-'),
  },
];

const topUpColumns = [
  { title: '到期时间', dataIndex: 'expireDate', key: 'expireDate' },
  numColumn('数量', 'total'),
  numColumn('已分配', 'allocated'),
  numColumn('剩余', 'remaining'),
];

function LogTable({ planId }) {
  const { logs, loading } = useOperationLogs(planId);
  return (
    <Table
      rowKey="id"
      columns={logColumns}
      dataSource={logs}
      loading={loading}
      pagination={{ pageSize: 5, hideOnSinglePage: true }}
      size="small"
      locale={{ emptyText: '暂无操作日志' }}
    />
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function PersonalDetail({ record }) {
  const {
    orderNo = '-',
    channel = '-',
    autoRenew = false,
    planSku = 'basic',
    planPoints = 0,
    topUpPoints = 0,
    // rewardPoints removed
    pointsValue = 0,
    consumedPoints = 0,
    remainingPoints = 0,
    topUpInventory = [],
    accountId,
    nickname,
    phone,
    project,
    applicant,
    type,
    status,
    startDate,
    expireDate,
    operator,
    updateTime,
    concurrencyText,
  } = record;

  const typeConfig = PLAN_TYPE_MAP[type] || { label: type, color: 'default' };
  const statusConfig = STATUS_MAP[status] || { label: status, color: 'default' };
  const skuConfig = SKU_MAP[planSku] || { label: planSku, points: 0, price: 0 };
  const percentage = pointsValue > 0 ? Math.round((remainingPoints / pointsValue) * 100) : 0;

  const compositionColumns = [
    numColumn('套餐内积分', 'planPoints'),
    numColumn('加油包积分', 'topUpPoints'),
    numColumn('总积分', 'totalPoints'),
  ];

  const compositionData = [
    { key: 'composition', planPoints, topUpPoints, totalPoints: pointsValue },
  ];

  const usageColumns = [
    numColumn('已消耗积分', 'consumedPoints'),
    numColumn('剩余积分', 'remainingPoints'),
    { title: '余量百分比', dataIndex: 'percentage', key: 'percentage' },
  ];

  const usageData = [{ key: 'usage', consumedPoints, remainingPoints, percentage: `${percentage}%` }];

  const tabItems = [
    {
      key: 'purchase',
      label: '购买记录',
      children: (
        <Table
          rowKey="id"
          columns={purchaseColumns}
          dataSource={record.purchaseRecords || []}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无购买记录' }}
        />
      ),
    },
    {
      key: 'points',
      label: '积分明细',
      children: (
        <>
          <SectionTitle>加油包明细</SectionTitle>
          {topUpInventory.length ? (
            <Table
              rowKey={(_, index) => `topup-${index}`}
              columns={topUpColumns}
              dataSource={topUpInventory}
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="暂无加油包" />
          )}
        </>
      ),
    },
    {
      key: 'logs',
      label: '操作日志',
      children: <LogTable planId={record.id} />,
    },
  ];

  return (
    <>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="账号 ID">{accountId}</Descriptions.Item>
        <Descriptions.Item label="昵称">{nickname}</Descriptions.Item>
        <Descriptions.Item label="手机号">{phone}</Descriptions.Item>
        <Descriptions.Item label="所属项目">{project}</Descriptions.Item>
        <Descriptions.Item label="申请人">{applicant}</Descriptions.Item>
        <Descriptions.Item label="套餐权益">
          <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="具体套餐">
          <Tag color="orange">{skuConfig.label}</Tag>
          <span style={{ color: '#999', marginLeft: 8 }}>¥{skuConfig.price}</span>
        </Descriptions.Item>
        <Descriptions.Item label="渠道">{CHANNEL_MAP[channel] || channel}</Descriptions.Item>
        <Descriptions.Item label="订单号">{orderNo}</Descriptions.Item>
        <Descriptions.Item label="自动续订">
          <Tag color={autoRenew ? 'success' : 'default'}>{autoRenew ? '是' : '否'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="最大并发">{concurrencyText}</Descriptions.Item>
        <Descriptions.Item label="有效期">
          {startDate} ~ {expireDate}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="操作人">{operator}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{updateTime}</Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '20px 0' }} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="积分构成" size="small">
            <Table
              rowKey="key"
              columns={compositionColumns}
              dataSource={compositionData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="用量概览" size="small">
            <Table
              rowKey="key"
              columns={usageColumns}
              dataSource={usageData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="points" items={tabItems} />
    </>
  );
}

function EnterpriseDetail({ record }) {
  const { logs, loading } = useOperationLogs(record.id);

  const {
    enterpriseName = '-',
    orderNo = '-',
    channel = '-',
    autoRenew = false,
    planSku = 'basic',
    purchasedSeats = 0,
    allocatedSeats = 0,
    availableSeats = 0,
    pointsValue = 0,
    consumedPoints = 0,
    remainingPoints = 0,
    startDate,
    expireDate,
    accountId,
    status,
    seatInventory = [],
    topUpInventory = [],
    members = [],
    resignedRecords = [],
  } = record;

  const skuConfig = SKU_MAP[planSku] || { label: planSku, points: 0 };
  const topUpRemaining = topUpInventory.reduce((sum, item) => sum + (item.remaining || 0), 0);
  const statusConfig = STATUS_MAP[status] || { label: status, color: 'default' };

  const seatColumns = [
    numColumn('已购席位', 'purchasedSeats'),
    numColumn('已分配席位', 'allocatedSeats'),
    numColumn('可用席位', 'availableSeats'),
    numColumn('加油包剩余', 'topUpRemaining', ' 个'),
  ];

  const seatData = [
    { key: 'seats', purchasedSeats, allocatedSeats, availableSeats, topUpRemaining },
  ];

  const pointsColumns = [
    numColumn('总积分', 'pointsValue'),
    numColumn('已消耗积分', 'consumedPoints'),
    numColumn('剩余积分', 'remainingPoints'),
  ];

  const pointsData = [{ key: 'points', pointsValue, consumedPoints, remainingPoints }];

  const memberColumns = [
    { title: '成员', dataIndex: 'name', key: 'name' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => ROLE_MAP[role] || role,
    },
    { title: '部门', dataIndex: 'dept', key: 'dept' },
    {
      title: '套餐',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => (SKU_MAP[sku]?.label || sku),
    },
    { title: '到期时间', dataIndex: 'expireDate', key: 'expireDate' },
    numColumn('剩余积分', 'remainingPoints'),
    numColumn('已用积分', 'consumedPoints'),
    numColumn('并发数', 'concurrency'),
    numColumn('有效加油包', 'topUpCount'),
  ];

  const inventoryColumns = [
    {
      title: '类型',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => (sku ? (SKU_MAP[sku]?.label || sku) : '加油包'),
    },
    { title: '到期时间', dataIndex: 'expireDate', key: 'expireDate' },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (source ? SOURCE_MAP[source] || source : '-'),
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      render: (_, row) => <EllipsisNumber value={row.count ?? row.total ?? 0} />,
    },
  ];

  const resignedColumns = [
    { title: '原成员', dataIndex: 'name', key: 'name' },
    { title: '释放时间', dataIndex: 'releasedAt', key: 'releasedAt' },
    numColumn('剩余积分', 'remainingPoints'),
    { title: '原到期时间', dataIndex: 'expireDate', key: 'expireDate' },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 'available' ? <Tag color="success">可分配</Tag> : <Tag>已分配</Tag>),
    },
  ];

  const tabItems = [
    {
      key: 'purchase',
      label: '购买记录',
      children: (
        <Table
          rowKey="id"
          columns={purchaseColumns}
          dataSource={record.purchaseRecords || []}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无购买记录' }}
        />
      ),
    },
    {
      key: 'members',
      label: `成员列表 (${members.length})`,
      children: members.length ? (
        <Table
          rowKey="userId"
          columns={memberColumns}
          dataSource={members}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          size="small"
        />
      ) : (
        <Empty description="暂无成员" />
      ),
    },
    {
      key: 'inventory',
      label: '库存明细',
      children: (
        <>
          <SectionTitle>套餐席位库存</SectionTitle>
          {seatInventory.length ? (
            <Table
              rowKey={(row, index) => `${row.sku}-${row.source}-${index}`}
              columns={inventoryColumns}
              dataSource={seatInventory}
              pagination={false}
              size="small"
              style={{ marginBottom: 24 }}
            />
          ) : (
            <Empty description="暂无可用席位" />
          )}
          <SectionTitle>加油包库存</SectionTitle>
          {topUpInventory.length ? (
            <Table
              rowKey={(_, index) => `topup-${index}`}
              columns={topUpColumns}
              dataSource={topUpInventory}
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="暂无加油包库存" />
          )}
        </>
      ),
    },
    {
      key: 'resigned',
      label: '离职释放',
      children: resignedRecords.length ? (
        <Table
          rowKey={(_, index) => `resigned-${index}`}
          columns={resignedColumns}
          dataSource={resignedRecords}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          size="small"
        />
      ) : (
        <Empty description="暂无离职释放记录" />
      ),
    },
    {
      key: 'logs',
      label: '操作日志',
      children: (
        <Table
          rowKey="id"
          columns={logColumns}
          dataSource={logs}
          loading={loading}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          size="small"
          locale={{ emptyText: '暂无操作日志' }}
        />
      ),
    },
  ];

  return (
    <>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="企业名称">{enterpriseName}</Descriptions.Item>
        <Descriptions.Item label="主账号">{accountId}</Descriptions.Item>
        <Descriptions.Item label="订单号">{orderNo}</Descriptions.Item>
        <Descriptions.Item label="渠道">{CHANNEL_MAP[channel] || channel}</Descriptions.Item>
        <Descriptions.Item label="套餐类型">
          <Tag color="blue">{skuConfig.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="自动续订">
          <Tag color={autoRenew ? 'success' : 'default'}>{autoRenew ? '是' : '否'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="有效期">
          {startDate} ~ {expireDate}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '20px 0' }} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="席位概览" size="small">
            <Table
              rowKey="key"
              columns={seatColumns}
              dataSource={seatData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="积分概览" size="small">
            <Table
              rowKey="key"
              columns={pointsColumns}
              dataSource={pointsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="members" items={tabItems} />
    </>
  );
}

function BasicDetail({ record }) {
  const typeConfig = PLAN_TYPE_MAP[record.type] || { label: record.type, color: 'default' };
  const statusConfig = STATUS_MAP[record.status] || { label: record.status, color: 'default' };

  return (
    <Descriptions column={1} bordered size="small" labelStyle={{ width: 120 }}>
      <Descriptions.Item label="账号 ID">{record.accountId}</Descriptions.Item>
      <Descriptions.Item label="昵称">{record.nickname}</Descriptions.Item>
      <Descriptions.Item label="手机号">{record.phone}</Descriptions.Item>
      <Descriptions.Item label="所属项目">{record.project}</Descriptions.Item>
      <Descriptions.Item label="申请人">{record.applicant}</Descriptions.Item>
      <Descriptions.Item label="套餐权益">
        <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="积分额度">{record.pointsValue} 积分</Descriptions.Item>
      <Descriptions.Item label="并发任务">{record.concurrencyText}</Descriptions.Item>
      <Descriptions.Item label="生效时间">{record.startDate}</Descriptions.Item>
      <Descriptions.Item label="到期时间">{record.expireDate}</Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="操作人">{record.operator}</Descriptions.Item>
      <Descriptions.Item label="更新时间">{record.updateTime}</Descriptions.Item>
    </Descriptions>
  );
}

function DetailDrawer({ visible, record, onCancel }) {
  if (!record) return null;

  let content = <BasicDetail record={record} />;
  let title = '权益详情';
  let width = 560;

  if (record.type === 'personal') {
    content = <PersonalDetail record={record} />;
    title = '个人套餐详情';
    width = 800;
  } else if (record.type === 'enterprise') {
    content = <EnterpriseDetail record={record} />;
    title = '企业团购详情';
    width = 800;
  }

  return (
    <Drawer
      title={title}
      placement="right"
      size={width}
      onClose={onCancel}
      open={visible}
      closable={false}
      styles={{ body: { padding: '24px 32px' } }}
      extra={<Button aria-label="关闭" title="关闭" type="text" icon={<CloseOutlined />} onClick={onCancel} />}
    >
      {content}
    </Drawer>
  );
}

export default DetailDrawer;

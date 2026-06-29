import { useEffect, useState, useCallback } from 'react';
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  message,
  Empty,
  Space,
  Typography,
} from 'antd';
import {
  DesktopOutlined,
  WalletOutlined,
  AppstoreOutlined,
  ExportOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import SearchForm from './components/SearchForm';
import QuotaTable from './components/QuotaTable';
import EquityModal from './components/EquityModal';
import LogModal from './components/LogModal';
import DetailDrawer from './components/DetailDrawer';
import PackageManagement from './components/PackageManagement';
import { getQuotaList, addQuota, updateQuota, deleteQuota } from './api/quota';
import { initMockData } from './data/mock';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  { key: 'workbench', icon: <DesktopOutlined />, label: '工作台' },
  {
    key: 'billing',
    icon: <WalletOutlined />,
    label: '计费管理',
    children: [
      { key: 'equity', label: '权益管理' },
      { key: 'package', label: '套餐管理' },
    ],
  },
  {
    key: 'operations',
    icon: <AppstoreOutlined />,
    label: '运营中心',
    children: [
      { key: 'recommend', label: '推荐管理' },
      { key: 'dataCenter', label: '数据中心' },
      { key: 'metering', label: '计量分析' },
    ],
  },
  { key: 'export', icon: <ExportOutlined />, label: '导出任务' },
  {
    key: 'security',
    icon: <SafetyOutlined />,
    label: '安全中心',
    children: [{ key: 'audit', label: '审计日志' }],
  },
];

function EquityManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const res = await getQuotaList(params);
      setData(res.data);
    } catch (error) {
      message.error(error.message || '查询失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    initMockData();
    fetchData({});
  }, []);

  const handleSearch = (values) => {
    setFilters(values);
    fetchData(values);
  };

  const handleReset = () => {
    setFilters({});
    fetchData({});
  };

  const handleAdd = () => {
    setSelectedRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleDetail = (record) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleDetailCancel = () => {
    setDetailVisible(false);
    setDetailRecord(null);
  };

  const handleLog = (record) => {
    setSelectedRecord(record);
    setLogVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteQuota(record.id);
      message.success('删除成功');
      fetchData(filters);
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const handleLogCancel = () => {
    setLogVisible(false);
    setSelectedRecord(null);
  };

  const handleModalOk = async (values) => {
    setModalLoading(true);
    try {
      if (selectedRecord) {
        await updateQuota(selectedRecord.id, values);
      } else {
        await addQuota(values);
      }
      await fetchData(filters);
      return Promise.resolve();
    } catch (error) {
      message.error(error.message || '提交失败');
      return Promise.reject(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: 'TeleAgent' },
          { title: '计费管理' },
          { title: '权益管理' },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            权益管理
          </Title>
          <Space>
            <Button>默认权益</Button>
            <Button type="primary" onClick={handleAdd}>
              + 新增权益
            </Button>
          </Space>
        </div>
        <Text type="secondary">
          管理个人套餐、企业团购套餐及内部/试用权益；支持查看企业团购的成员、库存与离职释放详情。
        </Text>
      </div>

      <SearchForm
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />
      <QuotaTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDetail={handleDetail}
        onLog={handleLog}
        onDelete={handleDelete}
      />

      <EquityModal
        visible={modalVisible}
        record={selectedRecord}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        loading={modalLoading}
      />

      <LogModal
        visible={logVisible}
        record={selectedRecord}
        onCancel={handleLogCancel}
      />

      <DetailDrawer
        visible={detailVisible}
        record={detailRecord}
        onCancel={handleDetailCancel}
      />
    </div>
  );
}

function App() {
  const [activeKey, setActiveKey] = useState('equity');
  const [openKeys, setOpenKeys] = useState(['billing']);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        theme="dark"
        style={{
          background: '#0f172a',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src="/src/assets/logo.png"
            alt="logo"
            style={{ width: 28, height: 28, marginRight: 10, objectFit: 'contain' }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, lineHeight: '20px' }}>
              TeleAgent
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: '16px' }}>
              Ops Console
            </div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          onClick={({ key }) => setActiveKey(key)}
          items={menuItems}
          style={{ background: '#0f172a', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content style={{ background: '#f8fafc' }}>
          {activeKey === 'equity' && <EquityManagement />}
          {activeKey === 'package' && <PackageManagement />}
          {activeKey !== 'equity' && activeKey !== 'package' && (
            <div style={{ padding: 24, minHeight: '100%', background: '#fff' }}>
              <Empty description="页面开发中" />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;

import { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Breadcrumb,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PackageTable from './PackageTable';
import PackageModal from './PackageModal';
import PackageSearchForm from './PackageSearchForm';
import {
  getPackageList,
  addPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
} from '../api/package';
import { initPackageTemplates } from '../data/packageMock';

const { Title, Text } = Typography;

function PackageManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const res = await getPackageList(params);
      setData(res.data);
    } catch (error) {
      message.error(error.message || '查询失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    initPackageTemplates();
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleToggle = async (record) => {
    try {
      await togglePackageStatus(record.id);
      message.success(record.status === 'active' ? '已下架' : '已上架');
      fetchData();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      await deletePackage(record.id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const handleModalOk = async (values) => {
    setModalLoading(true);
    try {
      if (selectedRecord) {
        await updatePackage(selectedRecord.id, values);
      } else {
        await addPackage(values);
      }
      message.success(selectedRecord ? '编辑成功' : '新增成功');
      setModalVisible(false);
      setSelectedRecord(null);
      fetchData();
    } catch (error) {
      message.error(error.message || '提交失败');
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
          { title: '套餐管理' },
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
            套餐管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增套餐
          </Button>
        </div>
        <Text type="secondary">
          支持商业化套餐配置，根据市场变化与反馈，可随时调整套餐内容。
        </Text>
      </div>

      <PackageSearchForm
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      <PackageTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      <PackageModal
        visible={modalVisible}
        record={selectedRecord}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        loading={modalLoading}
      />
    </div>
  );
}

export default PackageManagement;

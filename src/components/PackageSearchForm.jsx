import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PACKAGE_TYPE_MAP, PACKAGE_STATUS_MAP } from '../data/packageMock';

function PackageSearchForm({ onSearch, onReset, loading }) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    if (onReset) onReset();
  };

  return (
    <Form form={form} layout="inline" onFinish={onSearch} style={{ marginBottom: 24 }}>
      <Form.Item name="keyword">
        <Input placeholder="套餐名称 / SKU" allowClear style={{ width: 260 }} />
      </Form.Item>

      <Form.Item name="type">
        <Select
          placeholder="套餐类型"
          allowClear
          style={{ width: 140 }}
          options={Object.keys(PACKAGE_TYPE_MAP).map((key) => ({
            value: key,
            label: PACKAGE_TYPE_MAP[key].label,
          }))}
        />
      </Form.Item>

      <Form.Item name="status">
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 120 }}
          options={Object.keys(PACKAGE_STATUS_MAP).map((key) => ({
            value: key,
            label: PACKAGE_STATUS_MAP[key].label,
          }))}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default PackageSearchForm;

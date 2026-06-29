import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PLAN_TYPE_MAP, STATUS_MAP } from '../data/mock';

function SearchForm({ onSearch, onReset, loading }) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    if (onReset) onReset();
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={onSearch}
      style={{ marginBottom: 24 }}
    >
      <Form.Item name="keyword">
        <Input
          placeholder="账号 ID / 手机号 / 昵称 / 申请人 / 项目"
          allowClear
          style={{ width: 260 }}
        />
      </Form.Item>

      <Form.Item name="type">
        <Select
          placeholder="套餐权益"
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 'internal_staff', label: PLAN_TYPE_MAP.internal_staff.label },
            { value: 'trial_official', label: PLAN_TYPE_MAP.trial_official.label },
            { value: 'personal', label: PLAN_TYPE_MAP.personal.label },
            { value: 'enterprise', label: PLAN_TYPE_MAP.enterprise.label },
          ]}
        />
      </Form.Item>

      <Form.Item name="status">
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 120 }}
          options={[
            { value: 'active', label: STATUS_MAP.active.label },
            { value: 'expired', label: STATUS_MAP.expired.label },
          ]}
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

export default SearchForm;

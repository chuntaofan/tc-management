import React, { useEffect } from 'react';
import { ConfigProvider, Drawer, Form, Input, Select, DatePicker, Space, message, Row, Col, Button, Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { PLAN_TYPE_MAP } from '../data/mock';
import { EXPANDABLE_TYPES } from '../api/quota';
import dayjs from 'dayjs';

const theme = {
  token: {
    colorPrimary: '#000000',
  },
};

function EquityModal({ visible, record, onCancel, onOk, loading }) {
  const [form] = Form.useForm();
  const isEdit = !!record;
  const isExpandable = !record || EXPANDABLE_TYPES.includes(record.type);

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          userId: record.userId,
          project: record.project,
          applicant: record.applicant,
          type: record.type,
          dateRange: [dayjs(record.startDate), dayjs(record.expireDate)],
          applyUrl: record.applyUrl,
          pointsValue: record.pointsValue,
          concurrencyValue: record.concurrencyValue,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'internal_staff',
          pointsValue: 10000,
          concurrencyValue: 3,
        });
      }
    }
  }, [visible, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        expireDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      delete payload.dateRange;
      await onOk(payload);
      message.success(isEdit ? '编辑成功' : '新增成功');
      onCancel();
    } catch (error) {
      if (error?.message) message.error(error.message);
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <Drawer
        title={isEdit ? '编辑权益' : '新增权益'}
        placement="right"
        size={640}
        onClose={onCancel}
        open={visible}
        closable={false}
        styles={{
          body: {
            padding: '24px 32px',
          },
        }}
        extra={
          <Space>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onCancel}
            />
            {isExpandable && (
              <Button
                type="primary"
                loading={loading}
                onClick={handleOk}
                style={{ backgroundColor: '#000', borderColor: '#000' }}
              >
                提交
              </Button>
            )}
          </Space>
        }
      >
        {isEdit && !isExpandable ? (
          <Alert
            message="该套餐不支持后台直接调整"
            description="个人版与企业版套餐不可在后台直接编辑，如需调整请引导用户通过其他入口操作。"
            type="warning"
            showIcon
          />
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="userId"
              label="用户账号"
              rules={[{ required: true, message: '请输入用户账号' }]}
            >
              <Input placeholder="请输入用户账号" disabled={isEdit} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="project"
                  label="所属项目"
                  rules={[{ required: true, message: '请输入所属项目' }]}
                >
                  <Input placeholder="请输入所属项目" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="applicant"
                  label="申请人"
                  rules={[{ required: true, message: '请输入申请人' }]}
                >
                  <Input placeholder="请输入申请人" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="type"
              label="套餐权益"
              rules={[{ required: true, message: '请选择套餐权益' }]}
            >
              <Select
                placeholder="请选择"
                options={[
                  { value: 'internal_staff', label: PLAN_TYPE_MAP.internal_staff.label },
                  { value: 'trial_official', label: PLAN_TYPE_MAP.trial_official.label },
                  { value: 'personal', label: PLAN_TYPE_MAP.personal.label },
                  { value: 'enterprise', label: PLAN_TYPE_MAP.enterprise.label },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="套餐有效期"
              rules={[{ required: true, message: '请选择套餐有效期' }]}
            >
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '到期日期']}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pointsValue"
                  label="积分额度"
                  rules={[{ required: true, message: '请输入积分额度' }]}
                >
                  <Input type="number" min={0} suffix="积分" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="concurrencyValue"
                  label="并发任务数"
                  rules={[
                    { required: true, message: '请输入并发任务数' },
                    {
                      validator: (_, value) => {
                        const val = Number(value);
                        if (!Number.isInteger(val) || val < 0 || val > 20) {
                          return Promise.reject(new Error('并发任务数必须是 0~20 的整数'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" min={0} max={20} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="applyUrl" label="申请凭证 URL">
              <Input.TextArea
                rows={2}
                placeholder="P0 mock 使用 URL 文本，真实后端接上传服务"
              />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </ConfigProvider>
  );
}

export default EquityModal;

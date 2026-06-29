import React, { useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  Row,
  Col,
  Select,
  Button,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PACKAGE_TYPE_MAP, CHANNEL_OPTIONS } from '../data/packageMock';

const TYPE_OPTIONS = Object.keys(PACKAGE_TYPE_MAP).map((key) => ({
  value: key,
  label: PACKAGE_TYPE_MAP[key].label,
}));

function formatDiscountTag(originalPrice, currentPrice) {
  if (currentPrice === 0) return '免费';
  if (!originalPrice || originalPrice <= 0) return '-';
  const zhe = Math.floor((currentPrice / originalPrice) * 100) / 10;
  return `约 ${zhe.toFixed(1)} 折`;
}

function PackageModal({ visible, record, onCancel, onOk, loading }) {
  const [form] = Form.useForm();
  const isEdit = !!record;

  const type = Form.useWatch('type', form);
  const originalPrice = Form.useWatch('originalPrice', form);
  const currentPrice = Form.useWatch('currentPrice', form);

  const isEnterprise = type === 'enterprise';
  const isTopup = type === 'topup';

  const discountTag = useMemo(
    () => (isEnterprise ? '-' : formatDiscountTag(Number(originalPrice), Number(currentPrice))),
    [isEnterprise, originalPrice, currentPrice]
  );

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          type: record.type,
          sku: record.sku,
          validityDays: record.validityDays,
          channels: record.channels || ['open_platform'],
          status: record.status,
          benefits: record.benefits || [],
          points: record.points,
          concurrency: record.concurrency,
          originalPrice: record.originalPrice,
          currentPrice: record.currentPrice,
          couponFirstOrder: record.couponFirstOrder,
          couponMonthly: record.couponMonthly,
          basePrice: record.basePrice,
          minSeats: record.minSeats,
          fullReductionRules: record.fullReductionRules || [{ threshold: 500, reduction: 100 }],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'personal',
          validityDays: 30,
          points: 1000,
          concurrency: 5,
          originalPrice: 49,
          currentPrice: 29,
          couponFirstOrder: 0,
          couponMonthly: 0,
          basePrice: 49,
          minSeats: 10,
          channels: ['open_platform'],
          status: 'active',
          benefits: [],
        });
      }
    }
  }, [visible, record, form]);

  useEffect(() => {
    if (isEnterprise && visible) {
      const rules = form.getFieldValue('fullReductionRules');
      if (!rules || rules.length === 0) {
        form.setFieldsValue({
          fullReductionRules: [{ threshold: 500, reduction: 210 }],
        });
      }
    }
  }, [isEnterprise, visible, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onOk(values);
  };

  return (
    <Modal
      title={isEdit ? '编辑套餐' : '新增套餐'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={720}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="套餐名称"
              rules={[{ required: true, message: '请输入套餐名称' }]}
            >
              <Input placeholder="例如：基础套餐" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sku"
              label="SKU"
              rules={[{ required: true, message: '请输入 SKU' }]}
            >
              <Input placeholder="例如：basic" disabled={isEdit} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="type"
          label="套餐类型"
          rules={[{ required: true, message: '请选择套餐类型' }]}
        >
          <Select placeholder="请选择" options={TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="validityDays"
          label="有效期（天）"
          rules={[{ required: true, message: '请输入有效期' }]}
          tooltip="-1 表示长期有效"
        >
          <InputNumber min={-1} style={{ width: '100%' }} placeholder="例如：30，-1 表示长期有效" />
        </Form.Item>

        {!isEnterprise && (
          <>
            <Row gutter={16}>
              <Col span={isTopup ? 12 : 8}>
                <Form.Item
                  name="points"
                  label="积分额度"
                  rules={[{ required: true, message: '请输入积分额度' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="积分" />
                </Form.Item>
              </Col>
              {!isTopup && (
                <Col span={8}>
                  <Form.Item
                    name="concurrency"
                    label="并发任务数"
                    rules={[{ required: true, message: '请输入并发任务数' }]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0~20" />
                  </Form.Item>
                </Col>
              )}
              <Col span={isTopup ? 12 : 8}>
                <Form.Item
                  name="originalPrice"
                  label="原价（元）"
                  rules={[{ required: true, message: '请输入原价' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={isTopup ? 12 : 8}>
                <Form.Item
                  name="currentPrice"
                  label="现价（元）"
                  rules={[{ required: true, message: '请输入现价' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                </Form.Item>
              </Col>
              <Col span={isTopup ? 12 : 8}>
                <Form.Item
                  name="couponFirstOrder"
                  label="首单优惠券（元）"
                  rules={[{ required: true, message: '请输入首单优惠券金额' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                </Form.Item>
              </Col>
              {!isTopup && (
                <Col span={8}>
                  <Form.Item
                    name="couponMonthly"
                    label="包月优惠券（元）"
                    rules={[{ required: true, message: '请输入包月优惠券金额' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Form.Item label="折扣标签" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#f5222d' }}>{discountTag}</div>
            </Form.Item>
          </>
        )}

        {isEnterprise && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="basePrice"
                  label="起价（元/人/月）"
                  rules={[{ required: true, message: '请输入起价' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：49" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="minSeats"
                  label="起订数量"
                  rules={[{ required: true, message: '请输入起订数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="例如：10" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="满减优惠政策">
              <Form.List
                name="fullReductionRules"
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value || value.length === 0) {
                        throw new Error('至少配置一条满减规则');
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'threshold']}
                            rules={[{ required: true, message: '请输入门槛' }]}
                            noStyle
                          >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="满多少元" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'reduction']}
                            rules={[{ required: true, message: '请输入减免金额' }]}
                            noStyle
                          >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="减多少元" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#999' }} />
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加满减规则
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </Form.Item>
          </>
        )}

        <Form.Item label="权益说明">
          <Form.List name="benefits">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={22}>
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[{ required: true, message: '请输入权益说明' }]}
                        noStyle
                      >
                        <Input placeholder="例如：每月 1,000 积分" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#999' }} />
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加权益说明
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name="channels" label="适用渠道">
          <Checkbox.Group options={CHANNEL_OPTIONS} />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Radio.Group>
            <Radio value="active">上架</Radio>
            <Radio value="inactive">下架</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default PackageModal;

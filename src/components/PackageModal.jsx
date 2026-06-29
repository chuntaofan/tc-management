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
  DatePicker,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  PACKAGE_TYPE_MAP,
  PACKAGE_STATUS_MAP,
  CHANNEL_OPTIONS,
  SKU_OPTIONS,
  VALIDITY_TYPE_MAP,
} from '../data/packageMock';

const TYPE_OPTIONS = Object.keys(PACKAGE_TYPE_MAP).map((key) => ({
  value: key,
  label: PACKAGE_TYPE_MAP[key].label,
}));

const VALIDITY_OPTIONS = Object.keys(VALIDITY_TYPE_MAP).map((key) => ({
  value: key,
  label: VALIDITY_TYPE_MAP[key].label,
}));

const SKU_SELECT_OPTIONS = SKU_OPTIONS.map((item) => ({
  value: item.skuCode,
  label: item.skuName,
}));

function formatDiscountTag(listPrice, actualPrice) {
  if (actualPrice === 0) return '免费';
  if (!listPrice || listPrice <= 0) return '-';
  const zhe = Math.floor((actualPrice / listPrice) * 100) / 10;
  return `约 ${zhe.toFixed(1)} 折`;
}

function PackageModal({ visible, record, mode = 'create', replaceOptions = [], onCancel, onOk, loading }) {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  const type = Form.useWatch('type', form);
  const listPrice = Form.useWatch('listPrice', form);
  const actualPrice = Form.useWatch('actualPrice', form);
  const statusValue = Form.useWatch('status', form);
  const shelfTimeValue = Form.useWatch('shelfTime', form);
  const replacesPackageId = Form.useWatch('replacesPackageId', form);

  const isEnterprise = type === 'enterprise';

  const computedStatus = useMemo(() => {
    if (statusValue === 'inactive') return 'inactive';
    if (shelfTimeValue && dayjs(shelfTimeValue).valueOf() > Date.now()) return 'pending';
    return 'active';
  }, [statusValue, shelfTimeValue]);

  const statusConfig = PACKAGE_STATUS_MAP[computedStatus];

  const replaceSelectOptions = useMemo(
    () =>
      replaceOptions
        .filter((item) => item.id !== record?.id)
        .filter((item) => !type || item.type === type)
        .map((item) => ({
          value: item.id,
          label: `${PACKAGE_TYPE_MAP[item.type]?.label || item.type} / ${item.name}`,
        })),
    [replaceOptions, record, type]
  );

  const discountTag = useMemo(
    () => (isEnterprise ? '-' : formatDiscountTag(Number(listPrice), Number(actualPrice))),
    [isEnterprise, listPrice, actualPrice]
  );

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          type: record.type,
          sku: record.sku,
          validity: record.validity || { type: 'days', value: 30 },
          channels: record.channels || ['own_channel'],
          shelfTime: record.shelfTime ? dayjs(record.shelfTime) : dayjs(),
          status: record.status,
          seriesKey: record.seriesKey,
          replacesPackageId: record.replacesPackageId,
          benefits: record.benefits || [],
          listPrice: record.listPrice,
          actualPrice: record.actualPrice,
          basePrice: record.basePrice,
          minSeats: record.minSeats,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'personal',
          validity: { type: 'natural_month' },
          listPrice: 99,
          actualPrice: 59,
          basePrice: 49,
          minSeats: 10,
          channels: ['own_channel'],
          shelfTime: dayjs(),
          status: 'active',
          seriesKey: '',
          replacesPackageId: '',
          benefits: [],
        });
      }
    }
  }, [visible, record, form]);

  useEffect(() => {
    if (!replacesPackageId || !type) return;
    const target = replaceOptions.find((item) => item.id === replacesPackageId);
    if (target && target.type !== type) {
      form.setFieldsValue({ replacesPackageId: '', seriesKey: '', sku: undefined });
    }
  }, [form, replaceOptions, replacesPackageId, type]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      shelfTime: values.shelfTime ? values.shelfTime.toISOString() : dayjs().toISOString(),
    };
    await onOk(payload);
  };

  const handleReplaceChange = (value) => {
    const target = replaceOptions.find((item) => item.id === value);
    if (!target) {
      form.setFieldsValue({ seriesKey: '' });
      return;
    }
    form.setFieldsValue({
      seriesKey: target.seriesKey,
      sku: target.sku,
    });
  };

  return (
    <Modal
      title={isEdit ? '编辑套餐' : '新增套餐'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确认"
      cancelText="取消"
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
              name="type"
              label="套餐类型"
              rules={[{ required: true, message: '请选择套餐类型' }]}
            >
              <Select placeholder="请选择" options={TYPE_OPTIONS} disabled={isEdit} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="replacesPackageId"
          label="替换对象"
          tooltip="待上架套餐到达上架时间后，会替换同一售卖位的当前套餐"
          rules={[
            {
              validator: (_, value) => {
                if (computedStatus === 'pending' && !value) {
                  return Promise.reject(new Error('待上架套餐必须选择替换对象'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            placeholder="请选择上架后要替换的套餐"
            allowClear
            options={replaceSelectOptions}
            onChange={handleReplaceChange}
            disabled={replaceSelectOptions.length === 0}
          />
        </Form.Item>

        <Form.Item name="seriesKey" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sku" label="关联 SKU">
              <Select
                placeholder="请选择业务支撑系统 SKU"
                allowClear
                options={SKU_SELECT_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shelfTime"
              label="上架时间"
              rules={[{ required: true, message: '请选择上架时间' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="validity"
          label="有效期"
          rules={[{ required: true, message: '请选择有效期' }]}
        >
          <ValidityInput />
        </Form.Item>

        {!isEnterprise && (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="listPrice"
                  label="刊例价（元）"
                  rules={[{ required: true, message: '请输入刊例价' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="actualPrice"
                  label="实际售价（元）"
                  rules={[{ required: true, message: '请输入实际售价' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="元" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="折扣标签" style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#f5222d' }}>{discountTag}</div>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {isEnterprise && (
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
                      <MinusCircleOutlined
                        aria-label="删除权益说明"
                        role="button"
                        tabIndex={0}
                        title="删除权益说明"
                        onClick={() => remove(name)}
                        style={{ color: '#999' }}
                      />
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
          <Checkbox.Group options={CHANNEL_OPTIONS} disabled />
        </Form.Item>

        <Form.Item label="当前状态">
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: statusConfig?.color === 'success' ? '#f6ffed' : statusConfig?.color === 'warning' ? '#fffbe6' : '#f5f5f5',
                color: statusConfig?.color === 'success' ? '#389e0d' : statusConfig?.color === 'warning' ? '#d48806' : '#666',
                border: `1px solid ${statusConfig?.color === 'success' ? '#b7eb8f' : statusConfig?.color === 'warning' ? '#ffe58f' : '#d9d9d9'}`,
                fontSize: 12,
              }}
            >
              {statusConfig?.label || computedStatus}
            </span>
          </div>
        </Form.Item>

        <Form.Item name="status" label="人工状态" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function ValidityInput({ value, onChange }) {
  const type = value?.type || 'days';
  const innerValue = value?.value;

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    onChange?.({
      type: nextType,
      ...(nextType === 'days' ? { value: innerValue || 30 } : {}),
    });
  };

  const handleValueChange = (v) => {
    onChange?.({ type, value: v });
  };

  return (
    <Row gutter={16} align="middle">
      <Col>
        <Radio.Group value={type} onChange={handleTypeChange}>
          {VALIDITY_OPTIONS.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
      </Col>
      {type === 'days' && (
        <Col>
          <InputNumber
            min={1}
            value={innerValue}
            onChange={handleValueChange}
            placeholder="天数"
            style={{ width: 120 }}
          />
        </Col>
      )}
    </Row>
  );
}

export default PackageModal;

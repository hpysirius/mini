import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  Select, DatePicker, Switch, Tag, message, Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

interface Coupon {
  id: number
  name: string
  type: number // 1满减 2折扣
  threshold: number
  discount: number
  total: number
  used: number
  startTime: string
  endTime: string
  status: number // 0禁用 1启用
}

/** 优惠券类型 */
const typeOptions = [
  { label: '满减券', value: 1 },
  { label: '折扣券', value: 2 },
]

export default function CouponPage() {
  const [list, setList] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchData() }, [])

  /** 获取优惠券列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/coupons')
      setList(res.list || res || [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  /** 新增/编辑提交 */
  const handleFinish = async (values: any) => {
    try {
      const data = {
        ...values,
        startTime: values.time?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.time?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
      }
      delete data.time
      if (editing) {
        await request.put(`/coupons/${editing.id}`, data)
        message.success('更新成功')
      } else {
        await request.post('/coupons', data)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchData()
    } catch { /* handled */ }
  }

  /** 删除 */
  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/coupons/${id}`)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: number) => v === 1 ? <Tag color="blue">满减券</Tag> : <Tag color="green">折扣券</Tag>,
    },
    { title: '门槛', dataIndex: 'threshold', key: 'threshold', render: (v: number) => `满¥${v}` },
    {
      title: '优惠值',
      dataIndex: 'discount',
      key: 'discount',
      render: (v: number, r: Coupon) => r.type === 1 ? `减¥${v}` : `${v}折`,
    },
    {
      title: '数量',
      key: 'count',
      render: (_: any, r: Coupon) => `${r.used || 0} / ${r.total}`,
    },
    {
      title: '有效期',
      key: 'time',
      render: (_: any, r: Coupon) =>
        `${dayjs(r.startTime).format('MM-DD')} ~ ${dayjs(r.endTime).format('MM-DD')}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => (
        <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Coupon) => (
        <Space size="small">
          <Button size="small" onClick={() => {
            setEditing(record)
            form.setFieldsValue({
              ...record,
              time: [dayjs(record.startTime), dayjs(record.endTime)],
            })
            setModalOpen(true)
          }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setEditing(null)
          form.resetFields()
          setModalOpen(true)
        }}
      >
        新增优惠券
      </Button>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editing ? '编辑优惠券' : '新增优惠券'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="优惠券名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入优惠券名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={typeOptions} placeholder="请选择类型" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="threshold" label="使用门槛(元)" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: 150 }} placeholder="0" />
            </Form.Item>
            <Form.Item name="discount" label="优惠值" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: 150 }} placeholder="满减金额/折扣" />
            </Form.Item>
            <Form.Item name="total" label="发行数量" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 150 }} placeholder="100" />
            </Form.Item>
          </Space>
          <Form.Item name="time" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Tag, Tabs, Input, message, Descriptions, Divider, Form,
} from 'antd'
import { EyeOutlined, TruckOutlined } from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_image: string
  price: number
  quantity: number
  specs?: string
}

interface Order {
  id: number
  order_no: string
  user_id: number
  nickname: string
  user_phone: string
  total_amount: number
  pay_amount: number
  status: number
  shipping_company?: string
  shipping_no?: string
  address_snapshot?: string
  items?: OrderItem[]
  created_at: string
}

/** 订单状态 */
const statusTabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待支付' },
  { key: '10', label: '待发货' },
  { key: '20', label: '已发货' },
  { key: '30', label: '已完成' },
  { key: '-1', label: '已取消' },
]

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待支付' },
  10: { color: 'blue', text: '待发货' },
  20: { color: 'cyan', text: '已发货' },
  30: { color: 'green', text: '已完成' },
  '-1': { color: 'red', text: '已取消' },
}

export default function Order() {
  const [list, setList] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<Order | null>(null)
  const [shipOpen, setShipOpen] = useState(false)
  const [shipOrder, setShipOrder] = useState<Order | null>(null)
  const [shipForm] = Form.useForm()

  useEffect(() => { fetchData() }, [page, status])

  /** 获取订单列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const params: any = { page, pageSize: 10 }
      if (status) params.status = status
      const res: any = await request.get('/orders', { params })
      setList(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (e) {
      console.error('获取订单列表失败:', e)
    } finally {
      setLoading(false)
    }
  }

  /** 查看订单详情 */
  const viewDetail = async (record: Order) => {
    try {
      const res: any = await request.get(`/orders/${record.id}`)
      setDetail(res.data || res)
      setDetailOpen(true)
    } catch (e) {
      setDetail(record)
      setDetailOpen(true)
    }
  }

  /** 打开发货弹窗 */
  const openShipModal = (record: Order) => {
    setShipOrder(record)
    setShipOpen(true)
    shipForm.resetFields()
  }

  /** 发货 */
  const handleShip = async () => {
    if (!shipOrder) return
    try {
      const values = await shipForm.validateFields()
      await request.put(`/orders/${shipOrder.id}/ship`, {
        shippingCompany: values.shippingCompany,
        shippingNo: values.shippingNo,
      })
      message.success('发货成功')
      setShipOpen(false)
      setShipOrder(null)
      fetchData()
    } catch (e: any) {
      console.error('发货失败:', e)
      if (e?.response?.data?.msg) {
        message.error(e.response.data.msg)
      }
    }
  }

  /** 解析地址快照 */
  const parseAddress = (snapshot?: string) => {
    if (!snapshot) return '-'
    try {
      const addr = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot
      return `${addr.province}${addr.city}${addr.district}${addr.detail}`
    } catch {
      return snapshot
    }
  }

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 180 },
    { title: '用户', dataIndex: 'nickname', key: 'nickname', width: 100 },
    {
      title: '金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      width: 100,
      render: (v: number) => `¥${v}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: number) => {
        const s = statusMap[v] || { color: 'default', text: '未知' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            详情
          </Button>
          {record.status === 10 && (
            <Button
              size="small"
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => openShipModal(record)}
            >
              发货
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 状态筛选 */}
      <Tabs
        activeKey={status}
        items={statusTabs}
        onChange={(key) => { setStatus(key); setPage(1) }}
        style={{ marginBottom: 16 }}
      />

      {/* 订单表格 */}
      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 1000 }}
      />

      {/* 订单详情 */}
      <Modal
        title="订单详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetail(null) }}
        footer={null}
        width={700}
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="订单号">{detail.order_no}</Descriptions.Item>
              <Descriptions.Item label="用户">{detail.nickname || `ID:${detail.user_id}`}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{detail.total_amount}</Descriptions.Item>
              <Descriptions.Item label="实付金额">¥{detail.pay_amount}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {statusMap[detail.status]?.text || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">{detail.user_phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {parseAddress(detail.address_snapshot)}
              </Descriptions.Item>
              {detail.shipping_company && (
                <Descriptions.Item label="快递公司">{detail.shipping_company}</Descriptions.Item>
              )}
              {detail.shipping_no && (
                <Descriptions.Item label="快递单号">{detail.shipping_no}</Descriptions.Item>
              )}
              <Descriptions.Item label="下单时间" span={2}>
                {detail.created_at ? dayjs(detail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
            {detail.items && detail.items.length > 0 && (
              <>
                <Divider>商品明细</Divider>
                <Table
                  dataSource={detail.items}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '商品', dataIndex: 'product_name', key: 'product_name', ellipsis: true },
                    {
                      title: '单价',
                      dataIndex: 'price',
                      key: 'price',
                      width: 100,
                      render: (v: number) => `¥${v}`,
                    },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                    {
                      title: '小计',
                      key: 'subtotal',
                      width: 100,
                      render: (_: any, r: any) => `¥${r.price * r.quantity}`,
                    },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* 发货弹窗 */}
      <Modal
        title="发货"
        open={shipOpen}
        onCancel={() => { setShipOpen(false); setShipOrder(null); shipForm.resetFields() }}
        onOk={handleShip}
      >
        <p style={{ marginBottom: 16 }}>订单号：{shipOrder?.order_no}</p>
        <Form form={shipForm} layout="vertical">
          <Form.Item
            name="shippingCompany"
            label="快递公司"
            rules={[{ required: true, message: '请输入快递公司' }]}
          >
            <Input placeholder="例如：顺丰快递" />
          </Form.Item>
          <Form.Item
            name="shippingNo"
            label="快递单号"
            rules={[{ required: true, message: '请输入快递单号' }]}
          >
            <Input placeholder="请输入快递单号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

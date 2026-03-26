import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Tag, Tabs, Input, message, Descriptions, Divider,
} from 'antd'
import { EyeOutlined, TruckOutlined } from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

interface Order {
  id: number
  orderNo: string
  userId: number
  userName: string
  totalAmount: number
  status: number
  expressNo?: string
  items?: any[]
  address?: string
  phone?: string
  createdAt: string
}

/** 订单状态 */
const statusTabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待支付' },
  { key: '1', label: '待发货' },
  { key: '2', label: '已发货' },
  { key: '3', label: '已完成' },
  { key: '4', label: '已取消' },
]

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待支付' },
  1: { color: 'blue', text: '待发货' },
  2: { color: 'cyan', text: '已发货' },
  3: { color: 'green', text: '已完成' },
  4: { color: 'red', text: '已取消' },
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
  const [expressNo, setExpressNo] = useState('')

  useEffect(() => { fetchData() }, [page, status])

  /** 获取订单列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/orders', {
        params: { page, pageSize: 10, status: status || undefined },
      })
      setList(res.list || [])
      setTotal(res.total || 0)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  /** 查看订单详情 */
  const viewDetail = async (record: Order) => {
    try {
      const res: any = await request.get(`/orders/${record.id}`)
      setDetail(res)
      setDetailOpen(true)
    } catch {
      setDetail(record)
      setDetailOpen(true)
    }
  }

  /** 发货 */
  const handleShip = async () => {
    if (!shipOrder) return
    if (!expressNo.trim()) {
      message.warning('请输入快递单号')
      return
    }
    try {
      await request.put(`/orders/${shipOrder.id}/ship`, { expressNo })
      message.success('发货成功')
      setShipOpen(false)
      setShipOrder(null)
      setExpressNo('')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户', dataIndex: 'userName', key: 'userName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => {
        const s = statusMap[v] || { color: 'default', text: '未知' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            详情
          </Button>
          {record.status === 1 && (
            <Button
              size="small"
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => { setShipOrder(record); setShipOpen(true) }}
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
              <Descriptions.Item label="订单号">{detail.orderNo}</Descriptions.Item>
              <Descriptions.Item label="用户">{detail.userName}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{detail.totalAmount}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {statusMap[detail.status]?.text || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>{detail.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detail.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="快递单号">{detail.expressNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="下单时间" span={2}>
                {detail.createdAt ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
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
                    { title: '商品', dataIndex: 'name', key: 'name' },
                    { title: '单价', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    { title: '小计', key: 'subtotal', render: (_: any, r: any) => `¥${r.price * r.quantity}` },
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
        onCancel={() => { setShipOpen(false); setShipOrder(null); setExpressNo('') }}
        onOk={handleShip}
      >
        <p>订单号：{shipOrder?.orderNo}</p>
        <Input
          placeholder="请输入快递单号"
          value={expressNo}
          onChange={(e) => setExpressNo(e.target.value)}
        />
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, List } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

interface DashboardData {
  todayOrders: number
  todaySales: number
  todayUsers: number
  weekTrend: { date: string; sales: number; orders: number }[]
  recentOrders: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    todayOrders: 0,
    todaySales: 0,
    todayUsers: 0,
    weekTrend: [],
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  /** 获取仪表盘数据 */
  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/dashboard')
      setData(res)
    } catch {
      // 使用默认空数据
    } finally {
      setLoading(false)
    }
  }

  /** 订单状态标签 */
  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'orange', text: '待支付' },
    1: { color: 'blue', text: '待发货' },
    2: { color: 'cyan', text: '已发货' },
    3: { color: 'green', text: '已完成' },
    4: { color: 'red', text: '已取消' },
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日订单数"
              value={data.todayOrders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日销售额"
              value={data.todaySales}
              prefix={<DollarOutlined />}
              suffix="元"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日新增用户"
              value={data.todayUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 近7天销售趋势 */}
        <Col span={8}>
          <Card title="近7天销售趋势" loading={loading}>
            <List
              dataSource={data.weekTrend}
              renderItem={(item) => (
                <List.Item>
                  <span>{item.date}</span>
                  <span>
                    订单 {item.orders} 笔 · 销售额 ¥{item.sales}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最新订单 */}
        <Col span={16}>
          <Card title="最新订单" loading={loading}>
            <Table
              dataSource={data.recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
                { title: '用户', dataIndex: 'userName', key: 'userName' },
                {
                  title: '金额',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  render: (v: number) => `¥${v}`,
                },
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
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

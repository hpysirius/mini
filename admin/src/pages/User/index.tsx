import { useEffect, useState } from 'react'
import { Table, Avatar, Switch, Tag, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

interface User {
  id: number
  nickname: string
  avatar: string
  phone: string
  status: number // 0禁用 1正常
  createdAt: string
}

export default function UserPage() {
  const [list, setList] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => { fetchData() }, [page])

  /** 获取用户列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/users', { params: { page, pageSize: 10 } })
      if (res.code === 0) {
        setList(res.data?.list || [])
        setTotal(res.data?.total || 0)
      } else {
        message.error(res.msg || '加载失败')
      }
    } catch (err: any) {
      console.error('获取用户列表失败:', err)
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  /** 启用/禁用 */
  const toggleStatus = async (record: User) => {
    try {
      await request.put(`/users/${record.id}/status`, { status: record.status === 1 ? 0 : 1 })
      message.success('操作成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (v: string) => v
        ? <Avatar src={v} />
        : <Avatar icon={<UserOutlined />} />,
    },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => (
        <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '正常' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <Switch
          checked={record.status === 1}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={() => toggleStatus(record)}
        />
      ),
    },
  ]

  return (
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
  )
}

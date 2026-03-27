import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Select,
  Tag, message, Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'
import { getUser } from '../../utils/auth'

interface Admin {
  id: number
  username: string
  nickname: string
  role: string
  status: number
  createdAt: string
}

/** 角色选项 */
const roleOptions = [
  { label: '超级管理员', value: 'super' },
  { label: '管理员', value: 'admin' },
  { label: '运营', value: 'operator' },
]

export default function AdminPage() {
  const [list, setList] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Admin | null>(null)
  const [form] = Form.useForm()
  const currentUser = getUser()

  useEffect(() => { fetchData() }, [])

  /** 权限检查：仅 super 角色可访问 */
  if (currentUser?.role !== 'super') {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <h2>无权限访问</h2>
        <p>仅超级管理员可访问此页面</p>
      </div>
    )
  }

  /** 获取管理员列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/admins')
      setList(res.data || [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  /** 新增/编辑提交 */
  const handleFinish = async (values: any) => {
    try {
      if (editing) {
        await request.put(`/admins/${editing.id}`, values)
        message.success('更新成功')
      } else {
        await request.post('/admins', values)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchData()
    } catch { /* handled */ }
  }

  /** 禁用/启用 */
  const toggleStatus = async (record: Admin) => {
    try {
      await request.put(`/admins/${record.id}`, { status: record.status === 1 ? 0 : 1 })
      message.success('操作成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v: string) => {
        const map: Record<string, string> = { super: 'red', admin: 'blue', operator: 'green' }
        const label: Record<string, string> = { super: '超级管理员', admin: '管理员', operator: '运营' }
        return <Tag color={map[v]}>{label[v] || v}</Tag>
      },
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
      width: 220,
      render: (_: any, record: Admin) => (
        <Space size="small">
          <Button size="small" onClick={() => {
            setEditing(record)
            form.setFieldsValue({ ...record, password: undefined })
            setModalOpen(true)
          }}>编辑</Button>
          <Popconfirm
            title={`确定${record.status === 1 ? '禁用' : '启用'}？`}
            onConfirm={() => toggleStatus(record)}
          >
            <Button size="small" danger={record.status === 1}>
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
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
        新增管理员
      </Button>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editing ? '编辑管理员' : '新增管理员'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" disabled={!!editing} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

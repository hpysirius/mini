import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  Switch, Image, message, Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'

interface Banner {
  id: number
  title: string
  image: string
  link: string
  sort: number
  status: number
}

export default function BannerPage() {
  const [list, setList] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchData() }, [])

  /** 获取轮播图列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/banners')
      setList(res.data || [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  /** 新增/编辑提交 */
  const handleFinish = async (values: any) => {
    try {
      if (editing) {
        await request.put(`/banners/${editing.id}`, values)
        message.success('更新成功')
      } else {
        await request.post('/banners', values)
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
      await request.delete(`/banners/${id}`)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (v: string) => v ? <Image src={v} width={100} height={50} style={{ objectFit: 'cover' }} /> : '-',
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '链接', dataIndex: 'link', key: 'link', ellipsis: true },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v: number) => v === 1 ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Banner) => (
        <Space size="small">
          <Button size="small" onClick={() => {
            setEditing(record)
            form.setFieldsValue(record)
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
        新增轮播图
      </Button>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editing ? '编辑轮播图' : '新增轮播图'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="image" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="请输入跳转链接" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

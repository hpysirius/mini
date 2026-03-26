import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'

interface Category {
  id: number
  name: string
  sort: number
  status: number
}

export default function Category() {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchData() }, [])

  /** 获取分类列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/categories')
      setList(res.list || res || [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  /** 新增/编辑提交 */
  const handleFinish = async (values: any) => {
    try {
      if (editing) {
        await request.put(`/categories/${editing.id}`, values)
        message.success('更新成功')
      } else {
        await request.post('/categories', values)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchData()
    } catch { /* handled */ }
  }

  /** 删除分类 */
  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/categories/${id}`)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: number) => v === 1 ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Category) => (
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
        新增分类
      </Button>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
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

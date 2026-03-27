import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  Select, Switch, Image, message, Popconfirm, Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../../utils/request'

interface Product {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  stock: number
  sales: number
  image: string
  images: string[]
  detail: string
  status: number // 0下架 1上架
}

export default function Product() {
  const [list, setList] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchData() }, [page, pageSize, keyword, categoryId])

  /** 获取商品列表 */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/products', {
        params: { page, pageSize, keyword, categoryId },
      })
      const rawData = res.data?.list || res.data?.data?.list || []
      // 将 snake_case 转为 camelCase
      const list = rawData.map((item: any) => ({
        ...item,
        categoryName: item.category_name,
      }))
      setList(list)
      setTotal(res.data?.total || res.data?.data?.total || 0)
    } catch (err) {
      console.error('获取商品列表失败:', err)
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  /** 获取分类列表 */
  const fetchCategories = async () => {
    try {
      const res: any = await request.get('/categories')
      setCategories(res.data || res || [])
    } catch { /* handled */ }
  }

  /** 新增/编辑提交 */
  const handleFinish = async (values: any) => {
    try {
      // 将前端驼峰命名转换为后端 snake_case
      const payload = {
        ...values,
        mainImage: values.image,
        images: values.images ? (typeof values.images === 'string' ? values.images.split(',').map((s: string) => s.trim()) : values.images) : [],
      }
      delete payload.image

      if (editing) {
        await request.put(`/products/${editing.id}`, payload)
        message.success('更新成功')
      } else {
        await request.post('/products', payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchData()
    } catch (err: any) {
      console.error('保存商品失败:', err)
      message.error(err.response?.data?.msg || '操作失败')
    }
  }

  /** 切换上下架 */
  const toggleStatus = async (record: Product) => {
    try {
      await request.put(`/products/${record.id}`, { status: record.status === 1 ? 0 : 1 })
      message.success('操作成功')
      fetchData()
    } catch { /* handled */ }
  }

  /** 打开编辑弹窗 */
  const openEdit = (record: Product) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId || record.category_id,
    })
    setModalOpen(true)
  }

  /** 删除商品 */
  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/products/${id}`)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns = [
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (v: string) => v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} /> : '-',
    },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '销量', dataIndex: 'sales', key: 'sales' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => (
        <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '上架' : '下架'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => toggleStatus(record)}>
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 搜索栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索商品名称"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          style={{ width: 200 }}
          onPressEnter={() => { setPage(1); fetchData() }}
        />
        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => { setCategoryId(v); setPage(1) }}
          options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setModalOpen(true)
          }}
        >
          新增商品
        </Button>
      </Space>

      {/* 商品表格 */}
      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps!) },
        }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        width={700}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="categoryId" label="所属分类" rules={[{ required: true }]}>
            <Select
              placeholder="请选择分类"
              options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="price" label="价格" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: 150 }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: 150 }} placeholder="0" />
            </Form.Item>
          </Space>
          <Form.Item name="image" label="主图URL">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="images" label="详情图URL列表（逗号分隔）">
            <Input.TextArea placeholder="多个URL用逗号分隔" rows={2} />
          </Form.Item>
          <Form.Item name="detail" label="商品详情">
            <Input.TextArea rows={4} placeholder="请输入商品详情" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

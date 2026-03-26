import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../../utils/request'
import { setToken, setUser } from '../../utils/auth'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  /** 登录提交 */
  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res: any = await request.post('/auth/login', values)
      setToken(res.token)
      setUser(res.user)
      message.success('登录成功')
      navigate('/dashboard')
    } catch {
      // 错误已由拦截器处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5',
    }}>
      <Card title="商城后台管理系统" style={{ width: 400 }}>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Typography } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UserOutlined,
  PictureOutlined,
  TagOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getUser, removeToken } from '@/utils/auth'
// import { removeToken, getUser } from '../../utils/auth'

const { Header, Sider, Content } = Layout

/** 菜单项配置 */
const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/product', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/category', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/order', icon: <OrderedListOutlined />, label: '订单管理' },
  { key: '/user', icon: <UserOutlined />, label: '用户管理' },
  { key: '/banner', icon: <PictureOutlined />, label: '轮播图管理' },
  { key: '/coupon', icon: <TagOutlined />, label: '优惠券管理' },
  { key: '/admin', icon: <TeamOutlined />, label: '管理员管理' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const [collapsed, setCollapsed] = useState(false)

  /** 退出登录 */
  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  /** 用户下拉菜单 */
  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') handleLogout()
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧菜单 */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          🛒 {!collapsed && '商城管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            商城后台管理系统
          </Typography.Title>
          <Dropdown menu={userMenu} placement="bottomRight">
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              {user?.username || '管理员'}
            </span>
          </Dropdown>
        </Header>

        {/* 内容区 */}
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

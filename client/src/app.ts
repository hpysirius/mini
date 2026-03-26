import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { checkLogin } from './utils/auth'
import './styles/global.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // 检查登录态
    checkLogin()
  }

  componentDidShow() {}

  componentDidHide() {}

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children
  }
}

export default App

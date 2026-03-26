import { useState, useEffect } from 'react'
import { View, Text, Input, Switch, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './edit.scss'

interface AddressForm {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const AddressEdit = () => {
  const [form, setForm] = useState<AddressForm>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  })
  const [isEdit, setIsEdit] = useState(false)
  const [addressId, setAddressId] = useState<number | null>(null)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setIsEdit(true)
      setAddressId(Number(params.id))
      // 模拟加载已有地址数据
      setForm({
        name: '张三',
        phone: '13888888888',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区xx大厦xx号',
        isDefault: true,
      })
    }
  }, [])

  // 更新表单字段
  const updateField = (field: keyof AddressForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 选择省市区
  const chooseRegion = () => {
    Taro.chooseLocation({
      success: (res) => {
        // 实际项目中使用省市区选择器
        console.log('选择地址:', res)
      },
    })
  }

  // 表单验证
  const validate = (): boolean => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return false
    }
    if (!form.phone.trim() || form.phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    if (!form.detail.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' })
      return false
    }
    return true
  }

  // 保存地址
  const handleSave = () => {
    if (!validate()) return

    Taro.showLoading({ title: '保存中...' })

    // 模拟保存请求
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({
        title: isEdit ? '修改成功' : '添加成功',
        icon: 'success',
        duration: 1500,
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }, 500)
  }

  return (
    <View className='address-edit'>
      <ScrollView scrollY className='address-edit__content'>
        {/* 收货人 */}
        <View className='form-item'>
          <Text className='form-item__label'>收货人</Text>
          <Input
            className='form-item__input'
            placeholder='请输入收货人姓名'
            placeholderClass='form-item__placeholder'
            value={form.name}
            onInput={(e) => updateField('name', e.detail.value)}
          />
        </View>

        {/* 手机号码 */}
        <View className='form-item'>
          <Text className='form-item__label'>手机号码</Text>
          <Input
            className='form-item__input'
            type='number'
            maxlength={11}
            placeholder='请输入手机号码'
            placeholderClass='form-item__placeholder'
            value={form.phone}
            onInput={(e) => updateField('phone', e.detail.value)}
          />
        </View>

        {/* 所在地区 */}
        <View className='form-item' onClick={chooseRegion}>
          <Text className='form-item__label'>所在地区</Text>
          <View className='form-item__value'>
            <Text className={form.province ? '' : 'form-item__placeholder'}>
              {form.province ? `${form.province} ${form.city} ${form.district}` : '请选择省/市/区'}
            </Text>
            <Text className='form-item__arrow'>›</Text>
          </View>
        </View>

        {/* 详细地址 */}
        <View className='form-item form-item--textarea'>
          <Text className='form-item__label'>详细地址</Text>
          <Input
            className='form-item__input'
            placeholder='请输入详细地址，如街道、门牌号等'
            placeholderClass='form-item__placeholder'
            value={form.detail}
            onInput={(e) => updateField('detail', e.detail.value)}
          />
        </View>

        {/* 设为默认 */}
        <View className='form-item'>
          <Text className='form-item__label'>设为默认地址</Text>
          <Switch
            checked={form.isDefault}
            color='#e4393c'
            onChange={(e) => updateField('isDefault', e.detail.value)}
          />
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View className='address-edit__footer safe-area-bottom'>
        <View className='address-edit__save-btn' onClick={handleSave}>
          <Text>保存</Text>
        </View>
      </View>
    </View>
  )
}

export default AddressEdit

import { useState, useEffect } from 'react'
import { View, Text, Input, Switch, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get, post, put } from '../../utils/request'
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setIsEdit(true)
      setAddressId(Number(params.id))
      loadAddress(Number(params.id))
    }
  }, [])

  // 加载地址详情
  const loadAddress = async (id: number) => {
    try {
      const res: any = await get(`/address/detail/${id}`)
      if (res.code === 0 && res.data) {
        const data = res.data
        setForm({
          name: data.name,
          phone: data.phone,
          province: data.province,
          city: data.city,
          district: data.district,
          detail: data.detail,
          isDefault: !!data.is_default,
        })
      }
    } catch (error) {
      console.error('加载地址失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

  // 更新表单字段
  const updateField = (field: keyof AddressForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 表单验证
  const validate = (): boolean => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return false
    }
    if (!form.phone.trim() || !/^1[3-9]\d{9}$/.test(form.phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    if (!form.province || !form.city || !form.district) {
      Taro.showToast({ title: '请选择省市区', icon: 'none' })
      return false
    }
    if (!form.detail.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' })
      return false
    }
    return true
  }

  // 保存地址
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (isEdit) {
        // 更新地址
        await put(`/address/update/${addressId}`, {
          name: form.name,
          phone: form.phone,
          province: form.province,
          city: form.city,
          district: form.district,
          detail: form.detail,
          isDefault: form.isDefault,
        })
        Taro.showToast({ title: '修改成功', icon: 'success', duration: 1500 })
      } else {
        // 新增地址
        await post('/address/add', {
          name: form.name,
          phone: form.phone,
          province: form.province,
          city: form.city,
          district: form.district,
          detail: form.detail,
          isDefault: form.isDefault,
        })
        Taro.showToast({ title: '添加成功', icon: 'success', duration: 1500 })
      }
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
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
        <View className='form-item'>
          <Text className='form-item__label'>所在地区</Text>
          <View className='form-item__inputs'>
            <Input
              className='form-item__input-small'
              placeholder='省'
              value={form.province}
              onInput={(e) => updateField('province', e.detail.value)}
            />
            <Input
              className='form-item__input-small'
              placeholder='市'
              value={form.city}
              onInput={(e) => updateField('city', e.detail.value)}
            />
            <Input
              className='form-item__input-small'
              placeholder='区'
              value={form.district}
              onInput={(e) => updateField('district', e.detail.value)}
            />
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
        <View
          className={`address-edit__save-btn ${saving ? 'address-edit__save-btn--disabled' : ''}`}
          onClick={saving ? undefined : handleSave}
        >
          <Text>{saving ? '保存中...' : '保存'}</Text>
        </View>
      </View>
    </View>
  )
}

export default AddressEdit

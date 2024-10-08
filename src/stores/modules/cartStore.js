import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import {
  insertCartAPI,
  findNewCartListAPI,
  delCartAPI,
  changeCartGoodsAPI,
  changeCartSelectedAPI
} from '@/apis/cart'

export const useCartStore = defineStore(
  'cart',
  () => {
    const userStore = useUserStore()
    const isLogin = computed(() => userStore.userInfo.token)
    //1.定义state - cartList

    const cartList = ref([])
    // 2. 定义action - addCart
    const addCart = async (goods) => {
      const { skuId, count } = goods
      if (isLogin.value) {
        // 登录之后的加入购车逻辑
        await insertCartAPI({ skuId, count })
        updateNewList()
      } else {
        // 添加购物车操作
        // 已添加过 - count + 1
        // 没有添加过 - 直接push
        // 思路：通过匹配传递过来的商品对象中的skuId能不能在cartList中找到，找到了就是添加过
        const item = cartList.value.find((item) => goods.skuId === item.skuId)
        if (item) {
          // 找到了
          item.count++
        } else {
          // 没找到
          cartList.value.push(goods)
        }
      }
    }
    //清除购物车
    const clearCart = () => {
      cartList.value = []
    }
    // 删除购物车
    const delCart = async (skuId) => {
      if (isLogin.value) {
        // 调用接口实现接口购物车中的删除功能
        await delCartAPI([skuId])
        // console.log('打印删除购物车');
        updateNewList()
      } else {
        return
      }
    }
    //获取最新购物车列表
    const updateNewList = async () => {
      const res = await findNewCartListAPI()
      cartList.value = res.result
    }
    //改变购物车商品数量
    const updateGoodsNum = async (goods) => {
      const { skuId, count, selected } = goods
      await changeCartGoodsAPI(skuId, count, selected)

      // await updateNewList()
    }
    // 单选功能
    const singleCheck = async (skuId, selected) => {
      // 通过skuId找到要修改的那一项 然后把它的selected修改为传过来的selected
      const item = cartList.value.find((item) => item.skuId === skuId)
      item.selected = selected
      await changeCartSelectedAPI(selected, [skuId])
      // await updateNewList()
    }
    // 全选功能action
    const allCheck = async (selected, arr) => {
      // 把cartList中的每一项的selected都设置为当前的全选框状态
      // console.log('打印全选res', selected)
      cartList.value.forEach((item) => (item.selected = selected))

      await changeCartSelectedAPI(selected, arr)
      // await updateNewList()
    }
    // 是否全选计算属性
    const isAll = computed(() => cartList.value.every((item) => item.selected))
    // 计算属性
    // 1. 总的数量 所有项的count之和
    const allCount = computed(() =>
      cartList.value.reduce((a, c) => a + c.count, 0)
    )
    // 2. 总价 所有项的count*price之和
    const allPrice = computed(() =>
      cartList.value.reduce((a, c) => a + c.count * c.price, 0)
    )
    // 3. 已选择数量
    const selectedCount = computed(() =>
      cartList.value
        .filter((item) => item.selected)
        .reduce((a, c) => a + c.count, 0)
    )
    // 4. 已选择商品价钱合计
    const selectedPrice = computed(() =>
      cartList.value
        .filter((item) => item.selected)
        .reduce((a, c) => a + c.count * c.price, 0)
    )
    // 5. 购物车的skuid组成的数组
    const skuIdArr = computed(() => cartList.value.map((item) => item.skuId))
    // 6. 判断勾选是否为空
    const isEmpty = computed(
      () => cartList.value.filter((item) => item.selected).length === 0
    )
    return {
      cartList,
      allCount,
      allPrice,
      isAll,
      selectedCount,
      selectedPrice,
      skuIdArr,
      isEmpty,
      addCart,
      delCart,
      singleCheck,
      allCheck,
      clearCart,
      updateNewList,
      updateGoodsNum
    }
  },
  {
    persist: 'true'
  }
)

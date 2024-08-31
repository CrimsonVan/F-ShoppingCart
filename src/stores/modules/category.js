import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCategoryAPI } from '@/apis/layout'

export const useCategoryStore = defineStore('category', () => {
  // 导航列表数据管理
  //state 导航列表数据
  const categoryList = ref([])

  // action 获取导航数据的方法
  const getCategory = async () => {
    const res = await getCategoryAPI()

    res.result.unshift({ name: '首页', id: '0' })
    categoryList.value = res.result
  }

  return {
    categoryList,
    getCategory
  }
})

// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
// import Api from '@/config/api'
import LocalData from './data.js'
import Tool from './tool.js'
// import { MessageBox } from 'element-ui'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  state: {
    leftTreeData: [], //  左侧列表树数据
    rightTableData: [] // 右侧表格数据
  },

  getters: {
    /**
     * [所有项目名称]
     */
    itenames(state) {
      const { projectList } = state
      const strArr = []
      projectList.forEach(function (item) {
        strArr.push(item.item_name)
      })
      return strArr.join(',')
    }
  },

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [创建新表格]
     */
    createdNewTable(state) {
      state.tableArr.push(new Date().getTime())
    }
  },

  actions: {
    /**
     * [请求：列表树]
     */
    A_treeAll({ state }) {
      const res = JSON.parse(LocalData['列表树'])
      state.leftTreeData = Tool.returnTreeData(res.data)

      // const name = '列表树'
      // const obj = { userid: '40674d3bf2b84bf48b2a73db0d5af2ee' }
      // const suc = function (res) {
      //   console.log(22222, res)
      //   localStorage.setItem('列表树', JSON.stringify(res))
      //   state.leftTreeData = Tool.returnTreeData(res.data)
      // }
      // Api({ name, obj, suc })
    },
    /**
     * [请求：详情列表]
     */
    A_dataList({ state }, { data = {} }) {
      let res = {}
      const { pid, label } = data
      if (label !== '待排产') {
        if (pid === 1) {
          res = JSON.parse(LocalData['详情列表_1'])
        } else if (pid === 2) {
          res = JSON.parse(LocalData['详情列表_2'])
        } else if (pid === 3) {
          res = JSON.parse(LocalData['详情列表_3'])
        }
      }
      console.log('请求：详情列表 ----- ', Tool.returnTableData(res.data))
      state.rightTableData = Tool.returnTableData(res.data)

      // let param = {}
      // const { pid, label, provider_id = '', plant_group_id = '', daily_production_entry_id = '' } = data
      // if (label !== '待排产') {
      //   if (pid === 1) {
      //     param = { plant_id: provider_id } //                                            { 工厂ID }
      //   } else if (pid === 2) {
      //     param = { plant_id: provider_id, plant_group_id } //                            { 工厂ID, 班组ID }
      //   } else if (pid === 3) {
      //     param = { plant_id: provider_id, plant_group_id, daily_production_entry_id } // { 工厂ID, 班组ID, 日产量项目工厂ID }
      //   }
      // }
      // /* 发起请求 */
      // const name = '详情列表'
      // const obj = Object.assign({}, { userid: '40674d3bf2b84bf48b2a73db0d5af2ee' }, param)
      // const suc = function (res) {
      //   console.log('请求：详情列表 ----- ', pid, res)
      //   localStorage.setItem('详情列表', JSON.stringify(res))
      // }
      // Api({ name, obj, suc })
    }
    //
  }
})

export default store

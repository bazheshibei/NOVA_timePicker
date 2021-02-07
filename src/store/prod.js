
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox } from 'element-ui'

/**
 * 生产环境代码
 */
const Prod = {}

/**
 * [请求：列表树]
 */
Prod.A_treeAll = function (state, { that = {} }) {
  const name = '列表树'
  // const obj = { userid: '40674d3bf2b84bf48b2a73db0d5af2ee' }
  const obj = { userid: '' }
  const suc = function (res) {
    // console.log('列表树 ----- ', res)
    // localStorage.setItem('列表树', JSON.stringify(res))
    state.leftTreeData = Tool.returnTreeData(res.data)
    /* 筛选 */
    setTimeout(function () {
      const { filterText = '' } = JSON.parse(localStorage.getItem('NOVA_dailyproductionentrypc') || '{}')
      if (filterText) {
        that.filterText = filterText
        localStorage.removeItem('NOVA_dailyproductionentrypc')
        /* 点击第一个选项 */
        const { tree = {} } = that.$refs
        const { $el = {} } = tree
        const { childNodes = [] } = $el
        let isBreak = false
        for (let i = 0; i < childNodes.length; i++) {
          /* 筛选：工厂 */
          const item = childNodes[i] || {}
          if (item.innerText.indexOf(filterText) !== -1) {
            item.click()
            isBreak = true
            break
          }
          /* 筛选：班组 */
          const list_1 = item.children || []
          for (let j = 0; j < list_1.length; j++) {
            const val = list_1[j] || {}
            if (val.innerText.indexOf(filterText) !== -1) {
              item.click()
              isBreak = true
              break
            }
            /* 筛选：项目 */
            const list_2 = val.children || []
            for (let m = 0; m < list_2.length; m++) {
              const div = list_2[m]
              if (div.innerText.indexOf(filterText) !== -1) {
                item.click()
                isBreak = true
                break
              }
            }
            if (isBreak) {
              break
            }
          }
          if (isBreak) {
            break
          }
        }
      }
    }, 0)
  }
  Api({ name, obj, suc, loading: '数据加载中...' })
}

/**
 * [请求：详情列表]
 */
Prod.A_dataList = function (state, { f5 = false }) {
  const { activeId, rightTableData, apiParams } = state
  if (!rightTableData[activeId] || f5) {
    /* 发起请求 */
    const name = '详情列表'
    // const obj = Object.assign({}, { userid: '40674d3bf2b84bf48b2a73db0d5af2ee' }, apiParams)
    const obj = Object.assign({}, { userid: '' }, apiParams)
    const suc = function (res) {
      // console.log('请求：详情列表 ----- ', res)
      // localStorage.setItem('详情列表', JSON.stringify(res))
      state.rightTableData = Object.assign({}, rightTableData, { [activeId]: Tool.returnTableData(res.data) })
    }
    Api({ name, obj, suc })
  }
}

/**
 * [请求：工厂上机状态]
 */
Prod.A_showTakeUp = function (state, params) {
  const { that, ...obj } = params
  const name = '工厂上机状态'
  const suc = function (res) {
    const { data = [] } = res
    if (data.length) {
      // console.log('工厂上机状态 ----- ', data)
      // localStorage.setItem('工厂上机状态', JSON.stringify(res))
      state.leftAlertData = Tool.returnShowTakeUp(data)
      that.showDialog = true
    } else {
      MessageBox({ title: '获取数据失败', message: '没有可用班组' })
    }
  }
  Api({ name, obj, suc })
}

/**
 * [请求：设置上机时间段]
 */
Prod.A_addTakeUp = function (dispatch, params) {
  const { arr, provider_id, that } = params
  /* 发起请求 */
  const name = '设置上机时间段'
  // const obj = Object.assign({}, { userid: '40674d3bf2b84bf48b2a73db0d5af2ee' }, { plant_id: provider_id, data: JSON.stringify(arr) })
  const obj = { plant_id: provider_id, data: JSON.stringify(arr) }
  const suc = function (res) {
    that.cancel()
    /* 更新数据：列表树 -> 详情列表 */
    dispatch('A_dataList', { f5: true })
  }
  Api({ name, obj, suc, loading: '保存中...' })
}

/**
 * [请求：甘特表帮助按钮]
 */
Prod.A_getHelpText = function (state) {
  const name = '甘特表帮助按钮'
  const obj = { help_page_url: 'RCLPC' }
  const method = 'get'
  const suc = function (res) {
    state.helpText = res.data.help_page_text
  }
  Api({ name, obj, method, suc })
}

export default Prod

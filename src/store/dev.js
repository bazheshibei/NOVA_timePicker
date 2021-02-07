
import Tool from './tool.js'
import LocalData from '@/LocalData/data.js'

/**
 * 本地开发代码
 * @ [调用本地数据]
 * @ [不请求接口]
 */
const Dev = {}

/**
 * [请求：列表树]
 */
Dev.A_treeAll = function (state, { that = {} }) {
  const res = LocalData['列表树']
  state.leftTreeData = Tool.returnTreeData(res.data)
  /* 筛选 */
  setTimeout(function () {
    const { filterText = '郑州' } = JSON.parse(localStorage.getItem('NOVA_dailyproductionentrypc') || '{}')
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

/**
 * [请求：详情列表]
 */
Dev.A_dataList = function (state, { f5 = false }) {
  const { rightTableData, activeId, apiParams } = state
  const res = LocalData['详情']
  console.log('请求：详情列表 ----- ', Tool.returnTableData(res.data), apiParams)
  state.rightTableData = Object.assign({}, rightTableData, { [activeId]: Tool.returnTableData(res.data) })
}

/**
 * [请求：工厂上机状态]
 */
Dev.A_showTakeUp = function (state, params) {
  const res = LocalData['工厂上机状态']
  console.log('工厂上机状态 ----- ', res.data)
  const { that } = params
  const { data = [] } = res
  /* 开发数据 */
  state.leftAlertData = Tool.returnShowTakeUp(data)
  console.log(Tool.returnShowTakeUp(data))
  that.showDialog = true
}

/**
 * [请求：设置上机时间段]
 */
Dev.A_addTakeUp = function (dispatch, params) {
  // const { arr, plant_id } = params
  const { arr } = params
  console.log('设置上级时间段 ----- ', arr)
  // that.cancel()
  dispatch('A_dataList', { f5: true })
}

/**
 * [请求：甘特表帮助按钮]
 */
Dev.A_getHelpText = function () {}

export default Dev

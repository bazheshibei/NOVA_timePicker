// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
const host = '/api/'
// const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '列表树': 'dailyProductionEntryListAction.ndo?action=treeAll',
  '详情列表': 'dailyProductionEntryListAction.ndo?action=dataList'
}

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request

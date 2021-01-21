// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
// const host = '/api/'
const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '列表树': 'dailyProductionEntryListAction.ndo?action=treeAll',
  '详情列表': 'dailyProductionEntryListAction.ndo?action=dataList',
  '工厂上机状态': 'dailyProductionEntryListAction.ndo?action=showTakeUp',
  '设置上机时间段': 'dailyProductionEntryListAction.ndo?action=addTakeUp',
  '甘特表帮助按钮': 'noticeAction.ndo?action=getHelpText'
}

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request

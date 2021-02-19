
// import { Message } from 'element-ui'

const Tool = {}

/**
 * [返回：整理后的左侧列表树数据]
 * @param {[Array]}  data  接口数据
 * @add   {[String]} label 显示的文字[供货商名称、班组名称、项目名称]
 * @add   {[String]} id    ID[请求之后接口用到]
 * @add   {[Int]}    pid   { 1: 工厂(显示下拉按钮组), 2: 班组， 3: 项目 }
 * @add   {[String]} index 绑定到组件的索引
 */
Tool.returnTreeData = function (data = []) {
  data.map(function (item = {}, index) {
    item.label = item.provider_name
    item.id = item.provider_id
    item.pid = 1
    item.index = index + ''
    item.data = item.data || []
    item.selectObj = { [item.provider_name]: true }
    item.data.map(function (val = {}, key) {
      val.label = `${val.group_name}【${val.size}】`
      val.id = val.plant_group_id
      val.pid = 2
      val.index = `${index}_${key}`
      val.provider_id = item.provider_id
      val.data = val.data || []
      val.selectObj = { [item.provider_name]: true, [`${val.group_name}【${val.size}】`]: true }
      item.selectObj[`${val.group_name}【${val.size}】`] = true
      val.data.map(function (child = {}, childKey) {
        child.label = child.item_name
        child.id = child.daily_production_overview_detail_id
        child.pid = 3
        child.cate = val.group_name === '待排产' ? 0 : 1
        child.index = `${index}_${key}_${childKey}`
        child.provider_id = item.provider_id
        child.plant_group_id = val.plant_group_id
        child.selectObj = { [item.provider_name]: true, [`${val.group_name}【${val.size}】`]: true, [child.item_name]: true }
        item.selectObj[child.item_name] = true
        val.selectObj[child.item_name] = true
      })
    })
  })
  // console.log('返回：整理后的左侧列表树数据', data)
  return data
}

/**
 * [筛选：符合关键字的 工厂、班组、项目]
 * @param {[Array]}  list_1     列表树数组
 * @param {[String]} filterText 搜索关键字
 * @return {[type]} [description]
 */
Tool.dressingByScreening = function (list_1 = [], filterText = '') {
  const dataArr = []
  list_1.forEach(obj_1 => {
    const { provider_id = '' } = this._labelIndexOfText(obj_1, filterText)
    if (provider_id) {
      /* 匹配到：工厂 */
      dataArr.push({ plant_id: provider_id }) // , obj_1: obj_1.label
    } else {
      /* 没匹配到：循环班组 */
      const list_2 = obj_1.data || []
      list_2.forEach(obj_2 => {
        const { provider_id = '', plant_group_id = '' } = this._labelIndexOfText(obj_2, filterText)
        if (plant_group_id) {
          dataArr.push({ plant_id: provider_id, plant_group_id }) // , obj_1: obj_1.label, obj_2: obj_2.label
        } else {
          /* 没匹配到：循环项目 */
          const list_3 = obj_2.data || []
          list_3.forEach(obj_3 => {
            const { provider_id = '', plant_group_id = '', daily_production_entry_id = '' } = this._labelIndexOfText(obj_3, filterText)
            if (daily_production_entry_id) {
              dataArr.push({ plant_id: provider_id, plant_group_id, daily_production_entry_id }) // , obj_1: obj_1.label, obj_2: obj_2.label, obj_3: obj_3.label
            }
          })
        }
      })
    }
  })
  return dataArr
}

/**
 * [匹配：此对象是否包含关键字]
 * @param  {[Object]} item       数据对象
 * @param  {[String]} filterText 关键字：空格表示 || 关系
 * @return {[Object]} { provider_id: '工厂ID', plant_group_id: '班组ID', daily_production_entry_id: '日产量项目工厂ID' }
 */
Tool._labelIndexOfText = function (item = {}, filterText = '') {
  const textArr = filterText.split(' ') // 拆分关键字：空格，||
  let provider_id = ''
  let plant_group_id = ''
  let daily_production_entry_id = ''
  for (let i = 0; i < textArr.length; i++) {
    const text = textArr[i]
    if (text && item.label.indexOf(text) !== -1) {
      provider_id = item.provider_id || ''
      plant_group_id = item.plant_group_id || ''
      daily_production_entry_id = item.daily_production_entry_id || ''
      break
    }
  }
  return { provider_id, plant_group_id, daily_production_entry_id }
}

/**
 * [返回：整理后的右侧表格数据]
 * @param  {[Array]} data 项目数组
 * @return {[Array]} data 整理后的数组
 */
Tool.returnTableData = function (data = []) {
  data.map(function (item) {
    const { data = [] } = item
    /* 创建时间对象：{ [日期]：{ 对象 } } */
    const obj = {}
    data.forEach(function (val) {
      obj[val.report_date] = val
    })
    item.timeObj = obj
  })
  return data
}

/**
 * [返回：整理后的工厂上机状态]
 * @param  {[Array]} data     工厂上机状态数组
 * @return {[Array]} dataList 整理后的数组
 */
Tool.returnShowTakeUp = function (data = []) {
  const dataList = {}
  const dataArr = []
  data.forEach(function (item) {
    if (item.group_name !== '待排产') {
      dataArr.push(item)
    }
  })
  dataArr.forEach(function (item, index) {
    item.name = item.group_name
    item.start = ''
    item.end = ''
    item.time = {}
    item.numObj = {}
    /* 解析日期 */
    const dayArr = item.dates && item.dates !== null ? item.dates.split(',') : []
    dayArr.forEach(function (str) {
      if (str.indexOf('_') > -1) {
        const [start, end] = str.split('_')
        item.numObj = Object.assign({}, item.numObj, Tool._dayToDayNums(start, end, false))
      } else {
        item.numObj[str] = true
      }
    })
    /* 赋值 */
    dataList[index] = Object.assign({}, item)
  })
  return dataList
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [返回：当月全部日期]
 * @param  {[String]} time 当前日期
 * @return {[Array]}  arr  日期数组 { day: 几号, week: 星期几 }
 */
Tool._allDay = function (time) {
  const { afterDate } = this._otherMonth(time)
  const oneDay = 1000 * 60 * 60 * 24
  const maxNum = new Date(afterDate).getTime() - oneDay // 下个月第一天的毫秒数 - 一天
  const maxDay = new Date(maxNum).getDate() //             本月最后一天
  const arr = []
  for (let i = 1; i <= maxDay; i++) {
    const dayText = `${time}-${i < 10 ? '0' + i : i}` // 本次循环日期
    const weekArr = ['日', '一', '二', '三', '四', '五', '六']
    const week = weekArr[new Date(dayText).getDay()] //  星期几
    const num = new Date(dayText).getTime() //           毫秒数
    arr.push({ day: i, dayText, week, num })
  }
  return arr
}

/**
 * [返回：前后两个月]
 * @param  {[String]} time 当前日期
 * @return {[String]} beforeDate 上个月：2020-08
 * @return {[String]} nowDate    本  月：2020-09
 * @return {[String]} afterDate  下个月：2020-10
 */
Tool._otherMonth = function (time = '') {
  /* 本地时间：年、月 */
  const d = new Date()
  const yearLocal = d.getFullYear()
  const monthLocal = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  /* 提取：当前时间：年、月 */
  const [year, month] = time ? time.split('-') : ['', '']
  const yearNow = isNaN(parseInt(year)) ? parseInt(yearLocal) : parseInt(year) //         年：当前
  const monthNow = isNaN(parseInt(month) - 1) ? parseInt(monthLocal) : parseInt(month) // 月：当前（没有-1）
  /* 上个月 */
  const yearBefore = monthNow === 1 ? yearNow - 1 : yearNow
  const monthBefore = monthNow === 1 ? 12 : monthNow - 1
  /* 下个月 */
  const yearAfter = monthNow === 12 ? yearNow + 1 : yearNow
  const monthAfter = monthNow === 12 ? 1 : monthNow + 1
  /* 返回 */
  return {
    beforeDate: `${yearBefore}-${monthBefore < 10 ? '0' + monthBefore : monthBefore}`,
    nowDate: `${yearNow}-${monthNow < 10 ? '0' + monthNow : monthNow}`,
    afterDate: `${yearAfter}-${monthAfter < 10 ? '0' + monthAfter : monthAfter}`
  }
}

/**
 * [返回：两个日期之间每天的毫秒数]
 * @param  {[String]}  day_1    开始时间
 * @param  {[String]}  day_2    结束时间
 * @param  {[Boolean]} isCancel 是否可以取消
 * @return {[Object]}  obj      毫秒数对象：{ 123498282: { isShow: true, isCancel: true }, 3947382882: { isShow: true, isCancel: false } }
 */
Tool._dayToDayNums = function (day_1, day_2, isCancel = true) {
  const obj = {}
  const oneDay = 1000 * 60 * 60 * 24
  let num_1 = new Date(day_1).getTime()
  const num_2 = new Date(day_2).getTime()
  for (let i = 0; ; i++) {
    if (num_1 <= num_2) {
      obj[num_1] = { isShow: true, isCancel }
      num_1 += oneDay
    } else {
      break
    }
  }
  return obj
}

/**
 * [毫秒数 转为 时间区间]
 * @param  {[Object]} numObj         毫秒数对象：{ 123498282: { isShow: true, isCancel: true }, 3947382882: { isShow: true, isCancel: true } }
 * @return {[Array]}  timeArr        单个时间数组：['2020-09-01']
 * @return {[Array]}  timeSectionArr 时间区间数组：['2020-09-01_2020-09-02', '2020-09-11']
 */
Tool._numToTimeSection = function (numObj) {
  // const numObj = JSON.parse('{"1598918400000":true,"1599004800000":true,"1599177600000":true,"1599264000000":true,"1599350400000":true,"1599436800000":true,"1599523200000":true,"1599609600000":true,"1599782400000":true,"1599955200000":true,"1600128000000":true,"1600300800000":true,"1600473600000":true,"1600560000000":true,"1600646400000":true,"1600732800000":true,"1600819200000":true,"1600905600000":true,"1600992000000":true,"1601078400000":true,"1601251200000":true,"1601337600000":true,"1601424000000":true,"1601510400000":true}')
  numObj['999999999999999999'] = true
  const timeArr = []
  const timeSectionArr = []
  const oneDay = 1000 * 60 * 60 * 24
  let str_1 = ''
  let str_2 = ''
  for (const x in numObj) {
    /* 记录单个日期 */
    if (x !== '999999999999999999') {
      timeArr.push(this._returnYearMonthDay(parseInt(x)))
    }
    /* 记录时间区间 */
    if (str_1 === '') {
      /* 开始时间为空：记录开始时间 */
      str_1 = x
    } else {
      if ((!str_2 && parseInt(x) === parseInt(str_1) + oneDay) || (str_2 && parseInt(x) === parseInt(str_2) + oneDay)) {
        /* 当前时间 === 开始时间 || 后一个时间 + 一天：更新后一个时间 */
        str_2 = x
      } else {
        /* 之前的时间区间：只有开始时间 */
        if (str_1 && !str_2) {
          timeSectionArr.push(this._returnYearMonthDay(parseInt(str_1)))
        }
        /* 之前的时间区间：有开始、结束时间 */
        if (str_1 && str_2) {
          timeSectionArr.push(`${this._returnYearMonthDay(parseInt(str_1))}_${this._returnYearMonthDay(parseInt(str_2))}`)
        }
        /* 开始新区间 */
        str_1 = x
        str_2 = ''
      }
    }
  }
  return { timeArr, timeSectionArr }
}

// /**
//  * [公式 转 时间]
//  * @param {[String]} str         公式
//  * @param {[Object]} nodeCodeObj 当前项目的节点值 { ${变量}: 自身时间 }
//  */
// Tool._returnTime = function (str = '', nodeCodeObj = {}) {
//   /* 替换：变量、常量 */
//   const numStr = str.replace(/[0-9]+/g, function (num) {
//     return parseInt(num) * 60 * 60 * 24 * 1000
//   }).replace(/\$\{[\w-_:/]+\}/g, function (name) {
//     return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 0
//   })
//   /* 毫秒数 转 时间 */
//   // eslint-disable-next-line
//   const timeStr = eval(numStr)
//   if (isNaN(timeStr)) {
//     return '/'
//   } else if (new Date(timeStr).getTime() < new Date('2000-01-01').getTime()) {
//     return '/'
//   } else {
//     const d = new Date(timeStr)
//     const year = d.getFullYear()
//     const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
//     const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
//     return `${year}-${month}-${day}`
//   }
// }

/**
 * [转换：处理时间格式]
 * @param {[String]} time 时间
 */
Tool._toggleTime = function (time) {
  const today = this._returnYearMonthDay() // 当天日期
  const [, today_m, today_d] = today.split('-')
  if (time) {
    const [three, two, one] = time.split(/[-//.]/g).reverse()
    /* 处理：年 */
    let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
    if (!isNaN(parseInt(one))) {
      const str = String(one).trim()
      year = parseInt(String(year).slice(0, -1 * str.length) + str)
    }
    /* 处理：月 */
    let addYear = 0 // 增加的年份 {[Int]}
    let month = (isNaN(parseInt(two)) || two === '0') ? parseInt(today_m) : parseInt(two) // 月 {[Int]}
    for (let i = 0; ; i++) {
      if (month > 12) {
        addYear++
        month -= 12
      } else {
        break
      }
    }
    year = year + addYear
    /* 处理：日 */
    let year_2 = month < 12 ? year : year + 1
    let month_2 = month < 12 ? month + 1 : month + 1 - 12
    let day = (isNaN(parseInt(three)) || three === '0') ? parseInt(today_d) : parseInt(three) // 日 {[Int]}
    for (let i = 0; ; i++) {
      const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
      if (day > maxDay) {
        day -= maxDay
        month++
        month_2++
        if (month > 12) {
          month -= 12
          year += 1
          year_2 += 1
        }
        if (month_2 > 12) {
          month_2 -= 12
        }
      } else {
        break
      }
    }
    /* 整合 */
    return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
  } else {
    return today
  }
}
// /**
//  * [验证：计划事件是否在区间内]
//  * @param {[String]} maxVal       最大值
//  * @param {[String]} minVal       最小值
//  * @param {[String]} plantVal     计划时间
//  * @param {[String]} order_time   下单日期
//  * @param {[String]} deliver_date 客人交期
//  */
// Tool._isError = function (maxVal = '', minVal = '', plantVal = '', order_time = '', deliver_date = '') {
//   const max = isNaN(new Date(maxVal).getTime()) ? 0 : new Date(maxVal).getTime() //       最大值
//   const min = isNaN(new Date(minVal).getTime()) ? 0 : new Date(minVal).getTime() //       最小值
//   const plant = isNaN(new Date(plantVal).getTime()) ? 0 : new Date(plantVal).getTime() // 计划时间
//   const order = new Date(order_time).getTime() //                                         下单日期
//   const deliver = new Date(deliver_date).getTime() //                                     客人交期
//   const countMax = max || deliver
//   const countMin = min || order
//   const time_1 = this._returnYearMonthDay(countMin)
//   const time_2 = this._returnYearMonthDay(countMax)
//   const maxMinText = `最早：${time_1 === '1970-01-01' ? '未知' : time_1}，最晚：${time_2 === '1970-01-01' ? '未知' : time_2}` // 提示文字
//   /* 返回 */
//   if (countMin && countMax && (countMin <= plant && plant <= countMax)) {
//     return { status: false, maxMinText }
//   } else {
//     return { status: true, maxMinText }
//   }
// }

/**
 * [提取：年月日]
 * @param  {[String || Int]} strOrNum 日期 || 毫秒数
 * @return {[String]}                 YYYY-mm-dd
 */
Tool._returnYearMonthDay = function (strOrNum) {
  const d = strOrNum ? new Date(strOrNum) : new Date()
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Tool


<!-- 右侧区域 -->

<template>
  <div class="pageRIghtBox" ref="comBox" :style="isPc ? {} : { width: '80%' }">

    <!-- 顶部注释 -->
    <div class="topBox" ref="topBox" :style="isPc ? {} : { paddingRight: '10px' }">
      <div class="topItemBox" :style="isPc ? {} : { marginRight: '0' }">
        <div class="topItem" v-for="(item, index) in topArr" :key="'color_' + index">
          <div v-if="item.type === 'color'" class="topItemColor" :style="{ background: colorObj[item.color] }"></div>
          <i v-if="item.type === 'flag'" class="el-icon-s-flag topItemColor" :style="{ color: colorObj[item.color] }"></i>
          <span>{{item.name}}</span>
        </div>
      </div>
      <!-- <el-button size="mini">调整项目上下机日期</el-button> -->
      <el-button v-if="isPc" size="mini" @click="dialogVisible_help = true">帮助</el-button>
    </div>

    <el-tag class="hover" size="mini" :style="[positionReturnBtn, isPc ? {} : { right: '10px !important' }]" @click="returnToCurrentMonth">返回当前月</el-tag>

    <!-- 固定的表头 -->
    <div class="timeBox topFixedDiv" ref="timeBox_0" :style="positionHeaderStyle" @scroll="scroll($event, 'timeBox')">
      <ul class="monthBox" v-for="(item, index) in timeArr" :key="'month_1_' + index" :ref="'month_' + item.name">
        <i class="el-icon-caret-left beforeIcon hover" v-if="!index" @click="addMonth('beforeDate')"></i>
        <i class="el-icon-caret-right afterIcon hover" v-if="index === timeArr.length - 1" @click="addMonth('afterDate')"></i>
        <li class="monthName">{{item.name}}</li>
        <li class="dayBox">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_num_' + key">{{val.day}}</span>
        </li>
        <li class="dayBox">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_week_' + key">{{val.week}}</span>
        </li>
      </ul>
    </div>
    <!-- 日期 -->
    <div class="timeBox timeBox_add" ref="timeBox" :style="timeStyle" @scroll="scroll($event, 'timeBox_0')">
      <ul class="monthBox" v-for="(item, index) in timeArr" :key="'month_2_' + index" :ref="'ul_' + index">
        <i class="el-icon-caret-left beforeIcon hover" v-if="!index" @click="addMonth('beforeDate')"></i>
        <i class="el-icon-caret-right afterIcon hover" v-if="index === timeArr.length - 1" @click="addMonth('afterDate')"></i>
        <!-- 年年年年-月月 -->
        <li class="monthName">{{item.name}}</li>
        <!-- 几号 -->
        <li class="dayBox">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_num_' + key">{{val.day}}</span>
        </li>
        <!-- 星期几 -->
        <li class="dayBox">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_week_' + key">{{val.week}}</span>
        </li>
        <!-- 顶部空白行 -->
        <li class="dayBox" v-for="asd in 2" :key="'asd_1_' + asd">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_4_' + key"></span>
        </li>
        <!-- 循环数据 -->
        <div v-for="(active, activeIndex) in rightTableData[activeId]" :key="'activeLine_' + activeIndex">
          <li class="dayBox">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_1_' + key"></span>
          </li>
          <!-- 悬浮框 -->
          <li class="dayBox" :class="'alert_' + activeIndex" :ref="'alert_' + activeIndex">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_2_' + key"></span>
          </li>
          <!-- 色块 -->
          <li class="dayBox">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_3_' + key"
              :style="{ background: active.timeObj && active.timeObj[val.dayText] ? colorObj[active.timeObj[val.dayText].status] : '' }"
              @click="active.timeObj && active.timeObj[val.dayText] ? showDetail(val.dayText, activeIndex) : ''"
            >
              <i v-if="active.contract_date === val.dayText" class="el-icon-s-flag topItemColor" :style="{ color: colorObj[topArr[8].color] }"></i>
              <i v-if="active.deliver_date === val.dayText" class="el-icon-s-flag topItemColor" :style="{ color: colorObj[topArr[9].color] }"></i>
              <i v-if="active.plan_finished_date === val.dayText" class="el-icon-s-flag topItemColor" :style="{ color: colorObj[topArr[10].color] }"></i>
            </span>
          </li>
        </div>
        <!-- 底部空白行 -->
        <li class="dayBox" v-for="asd in 80" :key="'asd_' + asd">
          <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_4_' + key"></span>
        </li>
      </ul>
    </div>

    <!-- 弹出层：当前日期详情 -->
    <el-dialog title="提示" :visible.sync="isShowDayDetail" width="550px" :modal="isPc ? true : false">
      <div slot="title">
        <p>
          <span>{{dialogData.day}}&nbsp;&nbsp;</span>
          <span>{{dialogData.group_name}}&nbsp;&nbsp;</span>
          <span>{{dialogData.item_name}}&nbsp;&nbsp;</span>
          <span v-if="String(dialogData.status) !== '4'">日产量：累计{{dialogData.daily_production_total || 0}}件</span>
        </p>
      </div>
      <div class="comDialogContentBox">
        <div v-if="String(dialogData.status) !== '4'">
          <p>
            机工：{{dialogData.machine_num || 0}}
            &nbsp;&nbsp;
            辅工：{{dialogData.auxiliary_num || 0}}
            &nbsp;&nbsp;
            日产量：{{dialogData.daily_production_num || 0}}
          </p>
          <p>
            领料数：{{dialogData.picking_num || 0}}
          </p>
        </div>
        <div v-else>
          <p>
            未提报
          </p>
        </div>
        <div>
          <span v-if="isPc" class="hover" @click="look">查看日产量列表</span>
        </div>
      </div>
    </el-dialog>

    <!-- 弹出层：帮助 -->
    <el-dialog class="helpComDialog" title="帮助" :visible.sync="dialogVisible_help" width="95%">
      <p v-html="helpText"></p>
    </el-dialog>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import Tool from '../../../store/tool.js'
export default {
  data() {
    return {
      isShowDayDetail: false, //    是否显示：当前日期详情
      dialogVisible_help: false, // 是否显示弹出层：帮助
      dialogData: {}, //            当前日期详情
      pageWidth: 0, //              页面宽度
      comWidth: 0, //               当前组件宽度
      topArr: [
        { name: '休班', color: 3, type: 'color' },
        { name: '超期', color: 6, type: 'color' },
        { name: '断产', color: 1, type: 'color' },
        { name: '延迟上机', color: 5, type: 'color' },
        { name: '正常上机', color: 0, type: 'color' },
        { name: '待完成', color: 4, type: 'color' },
        { name: '开裁', color: 7, type: 'color' },
        { name: '下机', color: 2, type: 'color' },
        { name: '工厂合同交期', color: 996, type: 'flag' },
        { name: '客户交期', color: 997, type: 'flag' },
        { name: '工厂预计交期', color: 998, type: 'flag' }
      ],
      // 0：正常上机，1：断产，2：下机，3：休班，4：待完成，5：延迟上机，6：超期，7：开裁，996：工厂合同交期，997：客户交期，998：工厂预计交期
      colorObj: { '0': '#a0faac', '1': '#e8e489', '2': '#e13d1f', '3': '#d2e0fc', '4': '#dad5d5', '5': '#e5bf71', '6': '#ed8978', '7': '#c4f2cb', '996': '#7393e1', '997': '#e13619', '998': '#59cc33' },
      positionReturnBtn: {}, //   固定返回本月按钮样式
      positionHeaderStyle: {}, // 固定表头样式
      timeStyle: {}, //           时间表格样式
      timeArr: [], //             时间数组
      isShowAlert: {}, //         是否显示：悬浮框
      nowDate: '' //              当前月
    }
  },
  created() {
    /* 默认：取最近三个月的日期 */
    const timeArr = []
    const { beforeDate, nowDate, afterDate } = Tool._otherMonth()
    timeArr.push({ name: beforeDate, list: Tool._allDay(beforeDate) })
    timeArr.push({ name: nowDate, list: Tool._allDay(nowDate) })
    timeArr.push({ name: afterDate, list: Tool._allDay(afterDate) })
    this.timeArr = timeArr
    this.nowDate = nowDate
    // console.log('timeArr ----- ', timeArr)
    /* 定位到日期中间 */
    const that = this
    let i = 0
    const timer = setInterval(function () {
      if (Object.keys(that.$refs).length) {
        const { timeBox, topBox } = that.$refs
        if (timeBox.clientWidth && topBox.clientHeight) {
          const { scrollWidth, clientWidth } = timeBox
          const { clientHeight } = topBox
          that.timeStyle = { height: `${window.document.documentElement.clientHeight - clientHeight}px` }
          that.positionReturnBtn = { position: 'absolute', top: `${clientHeight + 1}px`, right: '30px', zIndex: 1000 }
          that.positionHeaderStyle = { position: 'absolute', top: `${clientHeight}px`, zIndex: 999, background: '#ffffff', width: 'calc(100% - 1px)' }
          that.$refs.timeBox_0.scrollLeft = (scrollWidth - clientWidth) / 2
          that.$refs.timeBox.scrollLeft = (scrollWidth - clientWidth) / 2
          clearInterval(timer)
        }
      }
      if (i > 100) {
        clearInterval(timer)
      }
      i++
    }, 100)
  },
  computed: {
    ...mapState(['activeId', 'helpText', 'isPc']),
    ...mapState({
      rightTableData(state) {
        const that = this
        /* ----- 删除之前的悬浮层 ----- */
        const dayBoxArr = document.querySelectorAll('.dayBox')
        dayBoxArr.forEach(function (item) {
          try {
            item.removeChild(document.querySelector('.addSpan'))
          } catch (err) {
            //
          }
        })
        /* ----- 延时后：显示悬浮层 ----- */
        const { rightTableData, activeId, isPc } = state
        setTimeout(function () {
          if (rightTableData[activeId]) {
            rightTableData[activeId].forEach(function (item, index) {
              /* 提取数据 */
              const { color, group_name, item_name, dress_part_type, has_production_days, zc, xb, dc, diff } = item
              const timeBox_add = document.querySelector('.alert_' + index)
              const span = document.createElement('span')
              const style = `
                width: ${that.$refs.comBox.clientWidth - 60}px;
                color: #000000;
                font-size: 12px;
                line-height: 15px;
                margin: 0 20px 0 ${that.$refs.timeBox_0.scrollLeft + 20}px;
                padding: 0 8px;
                background: ${color && color !== 'null' ? color : '#d2e2e3'};
                border-radius: 5px;
                position: absolute;
                bottom: ${isPc ? '0' : '2px'};
                z-index: 998;
                opacity: .8;
                transition-duration: .3s;
              `
              let strArr = []
              if (dress_part_type.indexOf('外部订单') !== -1) {
                strArr = [`${group_name} ${item_name}（${dress_part_type}）`]
              } else {
                strArr = [`${group_name} ${item_name}（${dress_part_type}）`, `已投产${has_production_days || 0}天`, `正常生产${zc || 0}天`, `休班${xb || 0}天`, `断产${dc || 0}天`, `剩余${diff || 0}天`]
              }
              span.setAttribute('class', `alertBox_${index} addSpan`)
              span.setAttribute('style', style)
              span.innerHTML = strArr.join('，')
              timeBox_add.appendChild(span)
            })
          }
        }, 0)
        /* ----- 提取数据 ----- */
        return rightTableData
      }
    })
  },
  methods: {
    /**
     * [返回当前月份]
     */
    returnToCurrentMonth() {
      const { isPc = true } = this
      /* 提取月份宽度 */
      const numObj = {} // { 月份转换的毫秒数: 页面上的宽度 }
      for (const x in this.$refs) {
        if (x.indexOf('month_') !== -1) {
          const item = this.$refs[x]
          const monthNum = new Date(x.split('month_')[1]).getTime()
          numObj[monthNum] = item[0].clientWidth
        }
      }
      /* 当前月份距离容器左边的距离 */
      const nowNum = new Date(this.nowDate).getTime() // 当前月份转换成的毫秒数
      let fromLeft = isPc ? 0 : 237 //                   距离容器左边的距离
      for (const x in numObj) {
        if (parseInt(x) === parseInt(nowNum)) {
          fromLeft -= numObj[x] / 2
        } else if (parseInt(x) < parseInt(nowNum)) {
          fromLeft += numObj[x]
        }
      }
      /* 容器滚动 */
      this.$refs.timeBox_0.scrollLeft = fromLeft
      this.$refs.timeBox.scrollLeft = fromLeft
    },
    /**
     * [滚动事件]
     * @param {[Object]} event 事件对象
     * @param {[String]} name  需要跟着改变的组件名称
     */
    scroll(event, name) {
      /* ----- 另一部分(name)跟着滚动 ----- */
      this.$refs[name].scrollLeft = event.target.scrollLeft
      /* ----- 悬浮层跟着滚动 ----- */
      const addSpanArr = document.querySelectorAll('.addSpan')
      if (addSpanArr.length) {
        addSpanArr.forEach(function (item) {
          item.style.margin = `0 20px 0 ${20 + event.target.scrollLeft}px`
        })
      }
      /* ----- 滑动到边缘自动加载月份 ----- */
      const { timeBox_0 = {} } = this.$refs
      const { clientWidth, scrollLeft, scrollWidth } = timeBox_0
      if (scrollWidth - (clientWidth + scrollLeft) === 0) {
        this.addMonth('afterDate') // 加载：下个月
      }
      if (this.isPc) {
        if (scrollLeft === 0) {
          this.addMonth('beforeDate') // 加载：上个月
        }
      }
    },
    /**
     * [添加月份]
     * @param {[String]} name 'beforeDate' === 上个月, 'afterDate' === 下个月
     */
    addMonth(name) {
      const { timeArr } = this
      if (name === 'beforeDate') {
        /* ----- 上个月 ----- */
        const time = timeArr[0].name
        const beforeDate = Tool._otherMonth(time)[name]
        timeArr.unshift({ name: beforeDate, list: Tool._allDay(beforeDate) })
      } else if (name === 'afterDate') {
        /* ----- 下个月 ----- */
        const time = timeArr[timeArr.length - 1].name
        const afterDate = Tool._otherMonth(time)[name]
        timeArr.push({ name: afterDate, list: Tool._allDay(afterDate) })
      }
    },
    /**
     * [显示：当天详细信息]
     * @param {[String]} day         日期
     * @param {[Int]}    activeIndex 数据索引
     */
    showDetail(day, activeIndex) {
      const { rightTableData, activeId } = this
      const item = rightTableData[activeId][activeIndex]
      const dayObj = item.timeObj[day]
      const { status, group_name, item_name, daily_production_total = '？', machine_num = '？', auxiliary_num = '？', daily_production_num = '？', picking_num = '？' } = dayObj
      // 提报日期，班组名，项目名，累计产量，机工，辅工，日产量，领料数
      const dialogData = { status, day, group_name, item_name, daily_production_total, machine_num, auxiliary_num, daily_production_num, picking_num }
      this.dialogData = Object.assign({}, dialogData)
      this.isShowDayDetail = true
    },
    /**
     * [查看日产量列表]
     */
    look() {
      const host = window.location.origin + '/nova/'
      // eslint-disable-next-line
      ui("open", {
        title: '日产量列表',
        url: host + 'pages/dailyproductionentry/dailyProductionEntrylist.jsp',
        onClose: function () {}
      })
    }
    //
  }
}
</script>

<style scoped>
.pageRIghtBox {
  width: 85%;
  height: 100%;
  font-size: 12px;
  flex: 1;
  position: relative;
}
.topFixedDiv::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}

/*** 顶部容器 ***/
.topBox {
  height: auto;
  padding: 4px 30px 4px 10px;
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topItemBox {
  /* overflow-x: auto; */
  margin-right: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
}
.topItem {
  white-space: nowrap;
  margin: 2px 20px 2px 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.topItemColor {
  min-width: 12px;
  min-height: 12px;
  font-size: 12px;
  margin-right: 2px;
}

/*** 时间容器 ***/
.timeBox {
  border-top: 1px solid var(--disabledColor);
  border-right: 1px solid var(--disabledColor);
  overflow-x: auto;
  display: flex;
  /* position: relative; */
}

/*** 单月 ***/
.monthBox {
  position: relative;
}
.monthBox > li, .monthBox > div > li {
  border-top: 1px solid var(--disabledColor);
}
.monthName { /* 月份 */
  color: var(--thColor);
  font-size: 12px;
  /* font-weight: bold; */
  /* text-align: center; */
  padding: 4px 0;
  border-right: 1px solid var(--disabledColor);
  border-top: 0 !important;
  display: flex;
  justify-content: center;
}
.monthBox > .monthName:last-child {
  border-right: 0;
}
.beforeIcon { /* 上个月 */
  color: var(--thColor);
  font-size: 20px;
  padding: 0 10px;
  position: absolute;
  top: 0;
  left: 0;
}
.afterIcon { /* 下个月 */
  color: var(--thColor);
  font-size: 20px;
  padding: 0 10px;
  position: absolute;
  top: 0;
  right: 0;
}

/*** 日期容器 ***/
.dayBox {
  font-size: 12px;
  display: flex;
  flex: 1;
  position: relative;
}
.dayBlock { /* 单个日期 */
  width: 18px;
  height: 16px;
  border-right: 1px solid var(--disabledColor);
  display: flex;
  align-items: center;
  justify-content: center;
}
.monthBox > li:last-child > .dayBlock {
  border-bottom: 1px solid var(--disabledColor);
}
.timeBox > .monthBox:last-child > li, .timeBox > .monthBox:last-child > li > span:last-child {
  border-right: 0;
}

/*** 弹出层 ***/
.comDialogContentBox {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}
.comDialogContentBox > div {
  margin-top: 10px;
}
.comDialogContentBox > div > p { /* 机工、辅工、日产量、领料数 */
  margin: 0 0 10px;
}
.comDialogContentBox > div > span { /* 查看日产量列表 */
  color: var(--thColor);
  white-space: nowrap;
  text-decoration: underline;
  margin-left: 10px;
}
</style>

<style>
.helpComDialog > .el-dialog {
  border-radius: 15px !important;
  overflow: hidden;
}
.helpComDialog > .el-dialog > .el-dialog__header {
  padding: 10px 20px !important;
  background: #77a3d3 !important;
}
.helpComDialog > .el-dialog > .el-dialog__header > .el-dialog__title {
  color: #ffffff !important;
  font-size: 14px !important;
}
.helpComDialog > .el-dialog > .el-dialog__header > .el-dialog__headerbtn {
  top: 15px !important;
}
.helpComDialog > .el-dialog > .el-dialog__header > .el-dialog__headerbtn > .el-dialog__close {
  color: #000000 !important;
}
.helpComDialog > .el-dialog > .el-dialog__body {
  padding: 20px !important;
}
.helpComDialog > .el-dialog > .el-dialog__body > p {
  max-height: 500px !important;
  overflow-y: auto !important;
}
</style>

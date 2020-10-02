
<!-- 右侧区域 -->

<template>
  <div class="pageRIghtBox" ref="comBox">

    <!-- 顶部注释 -->
    <div class="topBox" ref="topBox">
      <div class="topItem">
        <div class="topItem" v-for="(item, index) in topArr" :key="'color_' + index">
          <div v-if="item.type === 'color'" class="topItemColor" :style="{ background: colorObj[item.color] }"></div>
          <i v-if="item.type === 'flag'" class="el-icon-s-flag topItemColor" :style="{ color: colorObj[item.color] }"></i>
          <span>{{item.name}}</span>
        </div>
      </div>
      <el-button size="mini">调整项目上下机日期</el-button>
    </div>

    <!-- 日期 -->
    <div class="timeBox" ref="timeBox" :style="timeStyle">
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
        <!-- 循环数据 -->
        <div v-for="(active, activeIndex) in rightTableData" :key="'activeLine_' + activeIndex">
          <li class="dayBox">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_1_' + key"></span>
          </li>
          <!-- 悬浮框 -->
          <li class="dayBox" :ref="'alert_' + activeIndex">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_2_' + key"></span>
          </li>
          <!-- 色块 -->
          <li class="dayBox">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_3_' + key"
              :style="{ background: active.timeObj && active.timeObj[val.dayText] ? colorObj[active.timeObj[val.dayText].status] : '' }"
              @click="active.timeObj && active.timeObj[val.dayText] ? showDetail(val.dayText, activeIndex) : ''"
            >
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
    <el-dialog title="提示" :visible.sync="isShowDayDetail" width="550px">
      <div slot="title">
        <span>
          {{dialogData.day}}
          &nbsp;&nbsp;
          {{dialogData.group_name}}
          &nbsp;&nbsp;
          {{dialogData.item_name}}
          &nbsp;&nbsp;
          日产量：累计{{dialogData.daily_production_total}}件
        </span>
      </div>
      <div class="comDialogContentBox">
        <div>
          <p>
            机工：{{dialogData.machine_num}}
            &nbsp;&nbsp;
            辅工：{{dialogData.auxiliary_num}}
            &nbsp;&nbsp;
            日产量：{{dialogData.daily_production_num}}
          </p>
          <p>
            领料数：{{dialogData.picking_num}}
          </p>
        </div>
        <div>
          <span class="hover">查看日产量列表</span>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import Tool from '../../../store/tool.js'
export default {
  data() {
    return {
      isShowDayDetail: false, // 是否显示：当前日期详情
      dialogData: {}, //         当前日期详情
      pageWidth: 0, //           页面宽度
      comWidth: 0, //            当前组件宽度
      topArr: [
        { name: '休班', color: 3, type: 'color' },
        { name: '超期', color: 6, type: 'color' },
        { name: '断产', color: 1, type: 'color' },
        { name: '延迟上机', color: 5, type: 'color' },
        { name: '正常上机', color: 0, type: 'color' },
        { name: '待完成', color: 4, type: 'color' },
        { name: '工厂合同交期', color: 996, type: 'flag' },
        { name: '客户交期', color: 997, type: 'flag' },
        { name: '工厂预计交期', color: 998, type: 'flag' }
      ],
      // 0：正常上机，1：断产，3：休班，4：待完成，5：延迟上机，6：超期，996：工厂合同交期，997：客户交期，998：工厂预计交期
      colorObj: { '0': '#a0faac', '1': '#e8e489', '3': '#d2e0fc', '4': '#dad5d5', '5': '#e5bf71', '6': '#ed8978', '996': '#7393e1', '997': '#e13619', '998': '#59cc33' },
      timeStyle: {}, //  时间表格样式
      timeArr: [], //    时间数组
      isShowAlert: {} // 是否显示：悬浮框
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
    console.log('timeArr ----- ', timeArr)
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
    ...mapState({
      rightTableData(state) {
        /* ----- 延时后：显示悬浮层 ----- */
        const that = this
        const { rightTableData } = state
        setTimeout(function () {
          rightTableData.forEach(function (item, index) {
            /* 提取数据 */
            const { group_name, item_name, dress_part_type, has_production_days = '？', zc = '？', xb = '？', dc = '？', diff = '？' } = item
            const strArr = [`${group_name} ${item_name}（${dress_part_type}）`, `已投产${has_production_days}天`, `正常生产${zc}天`, `休班${xb}天`, `断产${dc}天`, `剩余${diff}天`]
            /* 生成 */
            const ref = that.$refs[`alert_${index}`]
            let top = 0
            if (ref && ref[0]) {
              top = ref[0].offsetTop
            }
            const bottom = window.document.documentElement.clientHeight - top
            const timeBox = document.querySelector('.timeBox')
            const span = document.createElement('span')
            const style = `
              width: 90%;
              color: #000000;
              padding: 3px 8px;
              background: #d2e2e3;
              border-radius: 5px;
              position: absolute;
              left: 5%;
              bottom: ${bottom - 16 - that.$refs.topBox.clientHeight}px;
              z-index: 99;
              opacity: .75;
            `
            span.setAttribute('class', `alertBox_${index}`)
            span.setAttribute('style', style)
            span.innerHTML = strArr.join('，')
            timeBox.appendChild(span)
          })
        }, 0)
        /* ----- 提取数据 ----- */
        return rightTableData
      }
    })
  },
  methods: {
    /**
     * [显示：当天详细信息]
     * @param {[String]} day         日期
     * @param {[Int]}    activeIndex 数据索引
     */
    showDetail(day, activeIndex) {
      const { rightTableData } = this
      const item = rightTableData[activeIndex]
      const dayObj = item.timeObj[day]
      const { group_name, item_name, daily_production_total = '？', machine_num = '？', auxiliary_num = '？', daily_production_num = '？', picking_num = '？' } = dayObj
      // 提报日期，班组名，项目名，累计产量，机工，辅工，日产量，领料数
      const dialogData = { day, group_name, item_name, daily_production_total, machine_num, auxiliary_num, daily_production_num, picking_num }
      this.dialogData = Object.assign({}, dialogData)
      this.isShowDayDetail = true
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
        /* 页面滚动到最右面 */
        const that = this
        setTimeout(function () {
          const { scrollWidth, clientWidth } = that.$refs.timeBox
          that.$refs.timeBox.scrollLeft = scrollWidth - clientWidth
        }, 1)
      }
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
  /* background: #eee1b9; */
  flex: 1;
  position: relative;
}

/*** 顶部容器 ***/
.topBox {
  padding: 4px 10px;
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topItem {
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.topItemColor {
  width: 12px;
  height: 12px;
  font-size: 12px;
  margin-right: 2px;
}

/*** 时间容器 ***/
.timeBox {
  border-top: 1px solid var(--disabledColor);
  overflow-x: auto;
  display: flex;
  /* flex-direction: column; */
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
  font-weight: bold;
  text-align: center;
  padding: 4px 0;
  border-right: 1px solid var(--disabledColor);
  border-top: 0 !important;
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
  width: 16px;
  height: 16px;
  border-right: 1px solid var(--disabledColor);
  display: flex;
  align-items: center;
  justify-content: center;
}
.monthBox > li:last-child > .dayBlock {
  border-bottom: 1px solid var(--disabledColor);
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

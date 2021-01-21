
<!-- 设置工厂上机状态 -->

<template>
  <el-dialog title="设置工厂上机状态" width="70%" :visible.sync="showDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
    <p class="tips red">请双击日期单元格来标注班组产能已被占用的日期</p>
    <div class="allBox">

      <!-- 左侧班组 -->
      <div class="nameBox">
        <ul class="monthBox" v-for="(item, index) in [timeArr[0]]" :key="'month_0_' + index">
          <!-- 空白 -->
          <li class="monthName" style="border-right: 0;">
            <span class="op0">{{item.name[0]}}</span>
          </li>
          <!-- 空白 -->
          <li class="dayBox" style="border-top: 1px solid #ffffff;">
            <span class="dayBlock op0" v-for="(val, key) in [item.list[0]]" :key="'day_num_0_' + key">{{val.day}}</span>
          </li>
          <!-- 空白 -->
          <li class="dayBox" style="border-top: 1px solid #ffffff;">
            <span class="dayBlock op0" v-for="(val, key) in [item.list[0]]" :key="'day_week_' + key">{{val.week}}</span>
          </li>
          <!-- 班组 -->
          <li class="dayBox nameSpan hover" v-for="(active, activeIndex) in leftAlertData" :key="'activeLine_0_' + activeIndex">
            <el-popover placement="top-start" trigger="click" ref="popover" v-model="showPopover[activeIndex]">
              <div class="comPopoverContentBox">
                <span>【{{active.name}}】产能被占用时间段：</span>
                <el-input class="comTimeInput" size="mini" maxlength="10" placeholder="请输入开始时间"
                  v-model="active.start"
                ></el-input>
                <span>&nbsp;&nbsp;至&nbsp;&nbsp;</span>
                <el-input class="comTimeInput" size="mini" maxlength="10" placeholder="请输入结束时间"
                  v-model="active.end"
                ></el-input>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <el-button size="mini" @click="choiceTime(activeIndex)">确 定</el-button>
              </div>
              <p slot="reference" :class="String(nowLineIndex) === String(activeIndex) ? 'red' : ''"
                @click="clickName(activeIndex)"
              >
                {{active.name}}
              </p>
            </el-popover>
          </li>
        </ul>
      </div>

      <!-- 右侧日期 -->
      <div class="timeBox" ref="timeBox">
        <ul class="monthBox" v-for="(item, index) in timeArr" :key="'month_' + index">
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
          <li class="dayBox" v-for="(active, activeIndex) in leftAlertData" :key="'activeLine_' + activeIndex">
            <span class="dayBlock" v-for="(val, key) in item.list" :key="'day_3_' + key"
              :style="{ background: active.numObj && active.numObj[val.num] && active.numObj[val.num].isShow ? (active.numObj[val.num].isCancel ? '#a6c9e2' : '#C0C4CC') : '' }"
              @dblclick="(active.numObj && (!active.numObj[val.num] || (active.numObj[val.num] && active.numObj[val.num].isCancel !== false))) ? toggleDay(val.num, activeIndex) : ''"
            >
            </span>
          </li>
        </ul>
      </div>

    </div>

    <div slot="footer">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button size="mini" type="primary" @click="save">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import Tool from '../../../store/tool.js'
export default {
  props: ['showDialog', 'alertData'],
  data() {
    return {
      // showDialog: true, // 开发数据
      showPopover: {},
      nowLineIndex: -1, // 当前激活的行索引
      dataList: {},
      timeArr: [] // 时间数组
    }
  },
  computed: {
    ...mapState(['leftAlertData'])
  },
  created() {
    /* 默认：取最近两个月的日期 */
    const timeArr = []
    const { nowDate, afterDate } = Tool._otherMonth()
    timeArr.push({ name: nowDate, list: Tool._allDay(nowDate) })
    timeArr.push({ name: afterDate, list: Tool._allDay(afterDate) })
    this.timeArr = timeArr
  },
  methods: {
    /**
     * [点击：班组名称]
     * @param {[String]} activeIndex 班组索引
     */
    clickName(activeIndex) {
      console.log(222, activeIndex)
      /* 选中 */
      this.nowLineIndex = parseInt(activeIndex)
      this.showPopover[activeIndex] = true
      /* 第一个input聚焦 */
      const that = this
      setTimeout(function () {
        that.$refs.popover[activeIndex].$children[0].focus()
      }, 0)
    },
    /**
     * [设置时间]
     * @param {[String]} activeIndex 班组索引
     */
    choiceTime(activeIndex) {
      const obj = this.leftAlertData[activeIndex]
      const { start, end } = obj
      /* ----- 转换时间 ----- */
      if (start && end && new Date(Tool._toggleTime(start)).getTime() > new Date(Tool._toggleTime(end)).getTime()) {
        this.$message({ message: '开始时间不能晚于结束时间', type: 'warning' })
      } else {
        obj.start = Tool._toggleTime(start)
        obj.end = Tool._toggleTime(end)
        /* ----- 解析日期：占用时间区间（色块） ----- */
        const { numObj } = obj
        /* 删除之前添加的时间 */
        for (const x in numObj) {
          if (numObj[x].isCancel) {
            delete numObj[x]
          }
        }
        /* 添加时间 */
        if (start && !end) {
          /* 开始时间 */
          numObj[new Date(start).getTime()] = { isShow: true, isCancel: true }
        }
        if (!start && end) {
          /* 结束时间 */
          numObj[new Date(end).getTime()] = { isShow: true, isCancel: true }
        }
        if (start && end) {
          /* 时间区间 */
          const adyObj = Tool._dayToDayNums(obj.start, obj.end)
          for (const x in adyObj) {
            if (!numObj[x]) {
              numObj[x] = Object.assign({}, adyObj[x])
            }
          }
        }
        obj.numObj = Object.assign({}, numObj)
        this.leftAlertData[activeIndex] = Object.assign({}, obj)
      }
      this.showPopover[activeIndex] = false
    },
    /**
     * [切换日期]
     * @param {[Int]}    num         毫秒数
     * @param {[String]} activeIndex 班组索引
     */
    toggleDay(num, activeIndex) {
      const obj = this.leftAlertData[activeIndex]
      if (obj.numObj[num]) {
        delete obj.numObj[num]
      } else {
        obj.numObj[num] = { isShow: true, isCancel: true }
      }
      this.leftAlertData[activeIndex] = Object.assign({}, obj)
    },
    /**
     * [取消]
     */
    cancel() {
      this.$emit('toggleDialog', false)
    },
    /**
     * [保存]
     */
    save() {
      const { leftAlertData = {}, alertData = {} } = this
      const { provider_id } = alertData
      const arr = []
      for (const x in leftAlertData) {
        const item = leftAlertData[x]
        const obj = {}
        if (item.numObj && Object.keys(item.numObj).length) {
          const timeArr = Tool._numToTimeSection(item.numObj).timeSectionArr
          obj.plant_group_id = item.plant_group_id
          obj.dates = timeArr.join(',')
          arr.push(obj)
        }
      }
      /** 请求：设置上机时间段 **/
      this.$store.dispatch('A_addTakeUp', { arr, provider_id, that: this })
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
.tips {
  font-size: 12px;
  margin-bottom: 10px;
}
/*** 包裹容器 ***/
.allBox {
  display: flex;
}

/*** 左侧：班组 ***/
.nameBox {
  border-left: 1px solid var(--disabledColor);
}
.nameSpan {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  white-space: nowrap;
}
.nameSpan > span {
  flex: 1;
}
.comPopoverContentBox { /* 输入时间弹出层 */
  display: flex;
  align-items: center;
}

/*** 右侧：时间容器 ***/
.timeBox {
  overflow-x: auto;
  border-left: 1px solid var(--disabledColor);
  border-right: 1px solid var(--disabledColor);
  display: flex;
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
}
.timeBox > .monthBox:last-child > li {
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
  width: 16px;
  height: 16px;
  border-right: 1px solid var(--disabledColor);
  display: flex;
  align-items: center;
  justify-content: center;
}
.timeBox > .monthBox:last-child > li > .dayBlock:last-child {
  border-right: 0;
}
.monthBox > li:last-child > .dayBlock, .monthBox > .nameSpan:last-child {
  border-bottom: 1px solid var(--disabledColor);
}
</style>

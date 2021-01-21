
<!-- 左侧区域 -->

<template>
  <div class="pageLeftBox">

    <!-- 过滤input -->
    <div  class="filterInputBox" ref="filterInput">
      <el-input v-model="filterText" size="mini" clearable placeholder="请输入工厂|班组|项目名称"></el-input>
    </div>

    <!-- 树状组件 -->
    <el-tree class="comTree" ref="tree" :data="leftTreeData" :props="defaultProps" :style="treeStyle" node-key="index"
      :highlight-current="true" :default-expanded-keys="showArr" :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <div class="comTreeLineBox" slot-scope="{ node, data }">
        <!-- 标题：第一级 -->
        <p v-if="data.pid === 1" class="comTreeLineName">{{data.label}}</p>
        <!-- 标题：第三级 -->
        <el-popover v-else-if="data.pid === 3" placement="right" trigger="hover" ref="popover">
          <p>
            订单数{{data.dress_total || 0}}{{data.jjc ? `(${data.jjc})` : ''}}，当前工厂委外数{{data.dress_total_po || 0}}，{{data.dress_part_type}}计划生产数{{data.has_arranged_num || 0}}，共领料数{{data.picking_total || 0}}，累计产量{{data.production_total || 0}}
          </p>
          <p slot="reference" class="comTreeLineName">
            <span>{{data.label}}</span>
            <br>
            <!-- 待排产 -->
            <span v-if="data.cate === 0">({{data.group_name}}-{{data.dress_part_type}}-{{data.dress_total_po || 0}}件{{data.tobe_arranged_num ? `-待排${data.tobe_arranged_num}件` : ''}})</span>
            <!-- 项目 -->
            <span v-else>({{data.group_name}}-{{data.dress_part_type}}-{{data.distribution_production_num || 0}}件)</span>
          </p>
        </el-popover>
        <!-- 标题：第二级 -->
        <p v-else class="comTreeLineName">{{data.label}}</p>
        <!-- 下拉按钮组：第一级 -->
        <el-dropdown v-if="data.pid === 1" class="comTreeLineIcon" trigger="click" @command="handleCommand(data.index, $event)">
          <span class="el-dropdown-link">
            <i class="el-icon-edit-outline"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="toggleDialog" :disabled="!data.data.length">设置工厂上机状态</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-tree>

    <!-- 弹出层 -->
    <com-left-alert :showDialog="showDialog" :alertData="alertData" @toggleDialog="toggleDialog"></com-left-alert>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import ComLeftAlert from './leftAlert.vue'
export default {
  components: { ComLeftAlert },
  data() {
    return {
      showDialog: false, // 是否显示弹出层
      filterText: '', //    过滤文字
      treeStyle: {}, //     列表树样式
      showArr: [], //       展开项:node-key="index"绑定字段
      defaultProps: { //    列表树绑定值
        children: 'data',
        label: 'label'
      },
      alertData: {} //      弹出层用到的数据
    }
  },
  created() {
    /** 请求：列表树 **/
    this.$store.dispatch('A_treeAll')
    /* 列表树距顶部高度 */
    const that = this
    let i = 0
    const timer = setInterval(function () {
      if (Object.keys(that.$refs).length) {
        const { filterInput } = that.$refs
        if (filterInput.clientHeight) {
          const { clientHeight } = filterInput
          that.treeStyle = { marginTop: `${clientHeight + 8}px` }
          clearInterval(timer)
        }
      }
      if (i > 100) {
        clearInterval(timer)
      }
      i++
    }, 100)
  },
  watch: {
    /**
     * [列表树筛选]
     */
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  computed: {
    ...mapState(['leftTreeData'])
  },
  methods: {
    /**
     * [选中下拉按钮组]
     * @param {[Int]}    index   工厂索引
     * @param {[String]} command 当前选项的指令[事件名称]
     */
    handleCommand(index, command) {
      this[command](true, index)
    },
    /**
     * [切换弹出层状态]
     * @param {[Boolean]} status 是否显示弹出层
     * @param {[Int]}     index  工厂索引
     */
    toggleDialog(status = true, index) {
      if (status) {
        /* 显示：提取工厂数据 */
        const { leftTreeData } = this
        this.alertData = Object.assign({}, leftTreeData[index])
        /** 请求：工厂上机状态 **/
        const { provider_id } = leftTreeData[index]
        this.$store.dispatch('A_showTakeUp', { plant_id: provider_id, that: this, userid: '40674d3bf2b84bf48b2a73db0d5af2ee' })
      } else {
        /* 置空数据 && 隐藏弹出层 */
        this.alertData = Object.assign({})
        this.showDialog = false
      }
    },
    /**
     * [过滤]
     * @param {[String]} value 关键字
     * @param {[Object]} data  单独的大项
     */
    filterNode(value, data) {
      if (!value) return true
      const { selectObj = {} } = data
      for (const x in selectObj) {
        if (x.indexOf(value) !== -1) {
          return true
        }
      }
    },
    /**
     * [展开]
     * @param {[Object]} data 当前项的信息
     */
    handleNodeClick(data) {
      const that = this
      const treeArr = this.showArr // 展开项数组
      const arr = [] //               返回的数组
      const obj = {} //               去重后的节点
      if (data.pid === 1 && treeArr.length) {
        /* 点击的是工厂 && 有展开节点了：重置 */
      } else {
        /* 延用之前的展开节点 */
        treeArr.forEach(function (val) {
          obj[val] = val
        })
      }
      /* 提取节点 */
      const { data: children = [] } = data
      if (children.length) {
        children.forEach(function (item) {
          /* 递归：单个子项 */
          const returnArr = that._recursion(item)
          if (returnArr.length) {
            returnArr.forEach(function (val) {
              obj[val] = val
            })
          }
        })
      }
      for (const x in obj) {
        arr.push(obj[x])
      }
      this.showArr = arr
      /* 剔除：待排产 && 记录当前工厂ID */
      const { pid, label, provider_id = '', plant_group_id = '', daily_production_entry_id = '' } = data
      if (label !== '待排产') {
        let activeId = ''
        let params = {}
        if (pid === 1) {
          activeId = `${provider_id}`
          params = { plant_id: provider_id } //                                            { 工厂ID }
        } else if (pid === 2) {
          activeId = `${provider_id}_${plant_group_id}`
          params = { plant_id: provider_id, plant_group_id } //                            { 工厂ID, 班组ID }
        } else if (pid === 3) {
          activeId = `${provider_id}_${plant_group_id}_${daily_production_entry_id}`
          params = { plant_id: provider_id, plant_group_id, daily_production_entry_id } // { 工厂ID, 班组ID, 日产量项目工厂ID }
        }
        this.$store.commit('saveData', { name: 'activeId', obj: activeId })
        this.$store.commit('saveData', { name: 'apiParams', obj: params })
        /** 请求：详情列表 **/
        this.$store.dispatch('A_dataList')
      }
    },
    /**
     * [递归]
     * @param  {[Object]} data 当前项的信息
     * @return {[type]} [description]
     */
    _recursion(data) {
      const that = this
      let arr = []
      const { index, data: children = [] } = data
      if (children.length) {
        arr.push(index)
        children.forEach(function (item) {
          const returnArr = that._recursion(item)
          if (returnArr.length) {
            arr = arr.concat(returnArr)
          }
        })
      }
      return arr
    }
  }
}
</script>

<style scoped>
.pageLeftBox {
  width: 15%;
  max-width: 200px;
  height: 100%;
  border-right: 1px solid var(--disabledColor);
  overflow-x: auto;
  /* background: #cfa9f1; */
  position: relative;
}

.filterInputBox { /* 过滤input */
  width: calc(15% - 8px);
  max-width: 192px;
  margin: 4px;
  position: fixed;
  left: 0;
}

.comTreeLineBox {
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.comTreeLineName {
  white-space: pre-wrap;
}
.comTreeLineIcon {
  font-size: 14px;
  padding: 2px 4px 2px 10px;
}
</style>

<style>
/*** 树状组件 ***/
.filterInputBox { /* 搜索框 */
  margin: 0 !important;
  padding: 4px !important;
  background: #ffffff !important;
  z-index: 2 !important;
}
.el-tree-node__content {
  height: max-content !important;
  min-height: 22px !important;
  padding: 2px 0;
}
.el-tree-node__content > .el-tree-node__expand-icon { /* 下拉箭头 */
  padding: 0 !important;
}

/*** 下拉按钮 ***/
.el-popper > .el-dropdown-menu__item {
  font-size: 12px !important;
  line-height: 25px !important;
  padding: 0 10px !important;
}
</style>


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
        <p class="comTreeLineName">{{data.label}}</p>
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
        console.log('xxxxx ----- ', Object.assign({}, leftTreeData[index]), index)
        this.alertData = Object.assign({}, leftTreeData[index])
      } else {
        /* 隐藏：置空 */
        this.alertData = Object.assign({})
      }
      /* 显示 || 隐藏 */
      this.showDialog = status
    },
    /**
     * [过滤]
     * @param {[String]} value 关键字
     * @param {[Object]} data  单独的大项
     */
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
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
      /** 请求：详情列表 **/
      this.$store.dispatch('A_dataList', { data })
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
.comTree > .el-tree-node > .el-tree-node__content {
  height: auto !important;
  min-height: 22px !important;
  padding: 2px 0;
}

/*** 下拉按钮 ***/
.el-popper > .el-dropdown-menu__item {
  font-size: 12px !important;
  line-height: 25px !important;
  padding: 0 10px !important;
}
</style>

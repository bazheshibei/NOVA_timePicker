
<!-- 自定义统计 -->

<template>
  <div class="pageBox" v-on:scroll="pageScroll" ref="page">

    <!-- 左侧区域 -->
    <com-left-box></com-left-box>

    <!-- 右侧区域 -->
    <com-right-box></com-right-box>

  </div>
</template>

<script>
import ComLeftBox from './components/left.vue'
import ComRightBox from './components/right.vue'
export default {
  components: { ComLeftBox, ComRightBox },
  data() {
    return {
      comLeftBoxStyle: {},
      scrollTop: 0
    }
  },
  created() {
    /** 请求：帮助按钮 **/
    this.$store.dispatch('A_getHelpText')
    //
    try {
      /* 平台方法 */
      // eslint-disable-next-line
      dg.removeBtn('cancel')
      // eslint-disable-next-line
      dg.removeBtn('saveAndAdd')
      // eslint-disable-next-line
      dg.removeBtn('saveAndClose')
      // eslint-disable-next-line
      dg.removeBtn('saveNoClose')
    } catch (err) {
      //
    }
  },
  methods: {
    /**
     * [页面滚动事件]
     */
    pageScroll(event) {
      const newNum = event.target.scrollTop
      const oldNum = this.scrollTop
      if (Math.abs(newNum - oldNum) < 300) {
        this.scrollTop = event.target.scrollTop
        this.$refs.page.scrollTop = newNum
      } else {
        this.$refs.page.scrollTop = oldNum
      }
    }
  }
}
</script>

<style scoped>
.pageBox {
  width: 100%;
  height: 100%;
  font-size: 12px;
  background: #ffffff;
  overflow-y: hidden;
  display: flex;
}
</style>

<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {}
  },
  created() {
    try {
      if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        // console.log('手机端')
        this.$store.commit('saveData', { name: 'isPc', obj: false })
      } else {
        // console.log('PC端')
      }
    } catch (e) {
      //
    }
  }
}
</script>

<style>
@import './assets/css/base.css';

#app {
  -webkit-font-smoothing: antialiased; /* 抗锯齿 */
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>

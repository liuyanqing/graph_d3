<template>
  <ul>
    <li>
      <router-link to="/graph">关系图</router-link>
    </li>
    <li>
      <router-link to="/tree">树状图</router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: "NavBar",
  props: {}
};
</script>

<style lang="scss" scoped>
</style>

<template>
  <div>
    <h1>This is a Graph demo</h1>
    <div class="relative">
      <canvas id="canvas" class="canvas"/>
      <div id="tooltip" class="tooltip"/>
    </div>
  </div>
</template>

<script>
import drawGraph from "@/utils/graph";

export default {
  name: "graph",
  data() {
    return {
      data: {
        nodes: [{ id: "北京公司", group: 0 }, { id: "上海啥事公司", group: 1 }],
        links: [{ source: "上海啥事公司", target: "北京公司", ratio: "1%" }]
      }
    };
  },
  mounted() {
    this.draw();
  },
  methods: {
    draw() {
      const canvas = document.getElementById("canvas");
      const { data } = this;
      if (!data || !data.nodes || !canvas) {
        return;
      }
      const { nodes, links } = data;
      const option = {
        width: 1100,
        height: 600,
        data: { nodes, links }
      };
      drawGraph(canvas, option);
    }
  }
};
</script>

<style lang="scss" scoped>
.relative {
  position: relative;
}

.canvas {
  width: 1100px;
  height: 600px;
  margin: 0 auto;
  overflow: hidden;
  background: #fafafa;
}

.tooltip {
  position: absolute;
  z-index: 1;
  display: inline-block;
  max-width: 220px;
  padding: 10px;
  border: 1px solid #999;
  border-radius: 2px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8);
  opacity: 0;
  pointer-events: none;
}
</style>


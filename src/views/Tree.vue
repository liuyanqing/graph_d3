<template>
  <div>
    <h1>This is an Tree demo</h1>
    <div class="relative">
      <div id="canvas" class="canvas"/>
      <div id="tooltip" class="tooltip"/>
    </div>
  </div>
</template>

<script>
import drawGraph from "@/utils/tree";

export default {
  name: "tree",
  data() {
    return {
      data: {
        name: "北京市京东物资公司",
        parents: [
          {
            subConAmt: "12616.88万元",
            category: "2", // 1 是公司，2是个人
            count: 4,
            grade: "1",
            fundedRatio: "74.49%",
            name: "郄茂金",
            isAbsoluteController: "True", // yes - 'True', no - 'False'
            operName: "刘强东"
          }
        ],
        children: [
          {
            shouldCapi: "40万元",
            name: "中美恩特（北京）能源科技有限公司",
            capitalType: "货币",
            stockPercent: "66.67%",
            totalStockPercent: "66.67",
            source: 2,
            type: 2,
            children: [
              {
                shouldCapi: "-",
                brand: "北京农商银行手机银行",
                hasNode: true,
                name: "北京农村商业银行股份有限公司",
                stockPercent: "-",
                totalStockPercent: "0.0",
                source: 17,
                type: 2,
                children: []
              }
            ]
          }
        ]
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
      if (!data || !canvas) {
        return;
      }
      const option = {
        width: 1100,
        height: 600,
        data
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

  > canvas {
    width: 1100px;
    height: 600px;
    margin: 0;
  }
}

canvas {
  width: 1100px;
  height: 600px;
  margin: 0;
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


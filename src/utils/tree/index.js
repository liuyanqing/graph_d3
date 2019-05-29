import * as d3 from 'd3';
import {
  getPixelRatio,
  drawArrowhead,
  randomColor,
  getColorStrFromCanvas,
  wrapText,
} from '../draw';
import {
  clearCanvas,
  roundRect,
  drawLineText,
  drawAddIcon,
  drawTip,
} from './draw';

const initCanvas = (target, config) => {
  const { width, height } = config;
  const base = d3.select(target);
  base.selectAll('*').remove();
  const canvas = base.append('canvas');
  const hideCanvas = base.append('canvas').style('display', '');

  const ctx = canvas.node().getContext('2d');
  const hideCtx = hideCanvas.node().getContext('2d');

  const ratio = getPixelRatio(ctx);
  canvas.property('width', width * ratio);
  canvas.property('height', height * ratio);
  ctx.scale(ratio, ratio);
  const ratio2 = getPixelRatio(hideCtx);
  hideCanvas.property('width', width * ratio2);
  hideCanvas.property('height', height * ratio2);
  hideCtx.scale(ratio2, ratio2);
  return { base, canvas, hideCanvas, ctx, hideCtx };
};

const initVirtualNode = () => {
  const virtualContainer = document.createElement('root');
  const virtualContainerNode = d3.select(virtualContainer);
  const colorNodeMap = {};

  return { virtualContainerNode, colorNodeMap };
};

const drawDraph = (target, opt = {}) => {
  // setting config
  const config = {
    width: opt.width || target.width,
    height: opt.height || target.height,
    padding: [54, 20, 20, 20], // canvas padding
    data: opt.data,
    nodeSize: [160, 158], // [width, height]
    rootSize: [150, 42], // [width, height]
    unitSize: [108, 58], // [width, height]
    unitPadding: 8,
    unitRadius: 0,
    duration: 600,
    color: ['#e9b722', '#919191', '#fdf2e6', '#bbb', '#FBD990'], // [nodeBorderColor, lineColor, parentNodeColor, childrenBorderColor, lightThemeColor]
    addIconR: 8,
  };
  // record initial translate
  const translate = {
    x: config.width / 2 - config.rootSize[0] / 2,
    y: Math.floor(config.padding[0] + config.height / 3),
  };
  // record transform when zooming or dragging
  let d3Transform = {
    x: 0,
    y: 0,
    k: 1,
  };
  const treeGenerator = d3
    .tree()
    .nodeSize([config.nodeSize[0], config.nodeSize[1]]); // 设置节点大小

  let hoverNode = null;
  const nodeDatas = {
    ...config.data,
    children: config.data.children && config.data.children.map(collapse),
  };
  const parentsData = {
    ...config.data,
    children: config.data.parents && config.data.parents.map(collapse),
  };

  let { treeData, treeParent } = initData(nodeDatas, parentsData);
  const { base, canvas, ctx, hideCtx } = initCanvas(target, config);
  const { virtualContainerNode, colorNodeMap } = initVirtualNode();
  update();
  setCanvasListener();

  const timer = d3.timer(timerCallBack);

  function timerCallBack(elapsed) {
    drawCanvas();
    if (elapsed > config.duration + 10) {
      timer.stop();
    }
  }

  function setCanvasListener() {
    base
      .call(
        d3
          .zoom()
          .scaleExtent([0.1, 6])
          .on('zoom', zoom)
      )
      .on('dblclick.zoom', null);
    canvas.on('click', clicked);
    canvas.on('mousemove', mousemoved);
  }

  function initData(data1, data2) {
    const data = d3.hierarchy({
      ...data1,
    });
    const parentData = d3.hierarchy({
      ...data2,
    });

    return {
      treeData: treeGenerator(data),
      treeParent: treeGenerator(parentData),
    };
  }

  function update(targetTreeNode) {
    let animatedStartX = 0;
    let animatedStartY = 0;
    let animatedEndX = 0;
    let animatedEndY = 0;
    if (targetTreeNode) {
      animatedStartX = targetTreeNode.x0;
      animatedStartY = targetTreeNode.y0;
      animatedEndX = targetTreeNode.x;
      animatedEndY = targetTreeNode.y;

      if (targetTreeNode.data.category) {
        updateParentNodes(
          animatedStartX,
          animatedStartY,
          animatedEndX,
          animatedEndY
        );
        updateParentLinks(
          animatedStartX,
          animatedStartY,
          animatedEndX,
          animatedEndY
        );
      } else {
        updateNodes(animatedStartX, animatedStartY, animatedEndX, animatedEndY);
        updateLinks(animatedStartX, animatedStartY, animatedEndX, animatedEndY);
      }
    } else {
      updateParentNodes(
        animatedStartX,
        animatedStartY,
        animatedEndX,
        animatedEndY
      );
      updateParentLinks(
        animatedStartX,
        animatedStartY,
        animatedEndX,
        animatedEndY
      );

      updateNodes(animatedStartX, animatedStartY, animatedEndX, animatedEndY);
      updateLinks(animatedStartX, animatedStartY, animatedEndX, animatedEndY);
    }

    addColorKey();
    bindNodeToTreeData();
  }

  function updateNodes(
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    const treeNodes = treeData.descendants();
    let nodeSelection = virtualContainerNode
      .selectAll('.node')
      .data(treeNodes, d => d.colorKey);

    nodeSelection
      .attr('class', 'node')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .transition()
      .duration(config.duration)
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    // data don't bind to element
    nodeSelection
      .enter()
      .append('node')
      .attr('class', 'node')
      .attr('x', animatedStartX)
      .attr('y', animatedStartY)
      .transition()
      .duration(config.duration)
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    // element don't bind to data
    nodeSelection
      .exit()
      .transition()
      .duration(config.duration)
      .attr('x', animatedEndX)
      .attr('y', animatedEndY)
      .remove();

    // record origin index for animation
    treeNodes.forEach(treeNode => {
      treeNode.x0 = treeNode.x;
      treeNode.y0 = treeNode.y;
    });

    nodeSelection = null;
  }

  function updateLinks(
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    const treeLinks = treeData.links();
    let linkSelection = virtualContainerNode
      .selectAll('.link')
      .data(treeLinks, d => `${d.source.colorKey}:${d.target.colorKey}`);

    linkSelection
      .attr('class', 'link')
      .attr('sourceX', linkData => linkData.source.x00)
      .attr('sourceY', linkData => linkData.source.y00)
      .attr('targetX', linkData => linkData.target.x00)
      .attr('targetY', linkData => linkData.target.y00)
      .transition()
      .duration(config.duration)
      .attr('sourceX', linkData => linkData.source.x)
      .attr('sourceY', linkData => linkData.source.y)
      .attr('targetX', linkData => linkData.target.x)
      .attr('targetY', linkData => linkData.target.y);

    linkSelection
      .enter()
      .append('link')
      .attr('class', 'link')
      .attr('sourceX', animatedStartX)
      .attr('sourceY', animatedStartY)
      .attr('targetX', animatedStartX)
      .attr('targetY', animatedStartY)
      .transition()
      .duration(config.duration)
      .attr('sourceX', link => link.source.x)
      .attr('sourceY', link => link.source.y)
      .attr('targetX', link => link.target.x)
      .attr('targetY', link => link.target.y);

    linkSelection
      .exit()
      .transition()
      .duration(config.duration)
      .attr('sourceX', animatedEndX)
      .attr('sourceY', animatedEndY)
      .attr('targetX', animatedEndX)
      .attr('targetY', animatedEndY)
      .remove();

    // record origin data for animation
    treeLinks.forEach(treeNode => {
      treeNode.source.x00 = treeNode.source.x;
      treeNode.source.y00 = treeNode.source.y;
      treeNode.target.x00 = treeNode.target.x;
      treeNode.target.y00 = treeNode.target.y;
    });
    linkSelection = null;
  }

  function updateParentNodes(
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    const treeNodes = treeParent.descendants();
    let nodeSelection = virtualContainerNode
      .selectAll('.pNode')
      .data(treeNodes, d => d.colorKey);

    nodeSelection
      .attr('class', 'pNode')
      .attr('x', d => d.x0)
      .attr('y', d => -d.y0)
      .transition()
      .duration(config.duration)
      .attr('x', d => d.x)
      .attr('y', d => -d.y);

    // data don't bind to element
    nodeSelection
      .enter()
      .append('node')
      .attr('class', 'pNode')
      .attr('x', animatedStartX)
      .attr('y', -animatedStartY)
      .transition()
      .duration(config.duration)
      .attr('x', d => d.x)
      .attr('y', d => -d.y);

    nodeSelection
      .exit()
      .transition()
      .duration(config.duration)
      .attr('x', animatedEndX)
      .attr('y', -animatedEndY)
      .remove();

    // record origin index for animation
    treeNodes.forEach(treeNode => {
      treeNode.x0 = treeNode.x;
      treeNode.y0 = treeNode.y;
    });

    nodeSelection = null;
  }

  function updateParentLinks(
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    const treeLinks = treeParent.links();
    let linkSelection = virtualContainerNode
      .selectAll('.pLink')
      .data(treeLinks, d => `${d.source.colorKey}:${d.target.colorKey}`);

    linkSelection
      .attr('class', 'pLink')
      .attr('sourceX', linkData => linkData.source.x00)
      .attr('sourceY', linkData => -linkData.source.y00)
      .attr('targetX', linkData => linkData.target.x00)
      .attr('targetY', linkData => -linkData.target.y00)
      .transition()
      .duration(config.duration)
      .attr('sourceX', linkData => linkData.source.x)
      .attr('sourceY', linkData => -linkData.source.y)
      .attr('targetX', linkData => linkData.target.x)
      .attr('targetY', linkData => -linkData.target.y);

    linkSelection
      .enter()
      .append('link')
      .attr('class', 'pLink')
      .attr('sourceX', animatedStartX)
      .attr('sourceY', -animatedStartY)
      .attr('targetX', animatedStartX)
      .attr('targetY', -animatedStartY)
      .transition()
      .duration(config.duration)
      .attr('sourceX', link => link.source.x)
      .attr('sourceY', link => -link.source.y)
      .attr('targetX', link => link.target.x)
      .attr('targetY', link => -link.target.y);

    linkSelection
      .exit()
      .transition()
      .duration(config.duration)
      .attr('sourceX', animatedEndX)
      .attr('sourceY', -animatedEndY)
      .attr('targetX', animatedEndX)
      .attr('targetY', -animatedEndY)
      .remove();

    // record origin data for animation
    treeLinks.forEach(treeNode => {
      treeNode.source.x00 = treeNode.source.x;
      treeNode.source.y00 = treeNode.source.y;
      treeNode.target.x00 = treeNode.target.x;
      treeNode.target.y00 = treeNode.target.y;
    });
    linkSelection = null;
  }

  function addColorKey() {
    // give each node a unique color
    virtualContainerNode.selectAll('.node, .pNode').each(function() {
      const node = d3.select(this);
      let newColor = randomColor();
      while (colorNodeMap[newColor]) {
        newColor = randomColor();
      }
      node.attr('colorKey', newColor);
      node.data()[0].colorKey = newColor;
      colorNodeMap[newColor] = node;
    });
  }

  function bindNodeToTreeData() {
    // give each node a unique color
    virtualContainerNode.selectAll('.node, .pNode').each(function() {
      const node = d3.select(this);
      const d = node.data()[0] || {};
      d.node = node;
    });
  }

  function drawCanvas(targetTreeNode) {
    ctx.save();
    hideCtx.save();
    ctx.translate(d3Transform.x, d3Transform.y);
    hideCtx.translate(d3Transform.x, d3Transform.y);
    ctx.scale(d3Transform.k, d3Transform.k);
    hideCtx.scale(d3Transform.k, d3Transform.k);
    ctx.translate(translate.x, translate.y);
    hideCtx.translate(translate.x, translate.y);
    drawShowCanvas(targetTreeNode);
    drawHiddenCanvas();
    ctx.restore();
    hideCtx.restore();
  }

  function drawShowCanvas(targetTreeNode) {
    const {
      rootSize,
      unitSize,
      unitPadding,
      color,
      width,
      height,
      unitRadius,
      addIconR,
    } = config;
    const unitW = unitSize[0];
    const unitH = unitSize[1];
    clearCanvas(ctx, width, height);

    // draw links
    virtualContainerNode.selectAll('.link, .pLink').each(function() {
      const node = d3.select(this);
      const targetData = node.data()[0].target.data;
      const isparent = Boolean(targetData.category);
      const x1 = Number(node.attr('targetX'));
      const y1 = Number(node.attr('targetY'));
      const linkPath = d3
        .linkVertical()
        .x(d => d.x)
        .y(d => d.y)
        .source(() => ({ x: node.attr('sourceX'), y: node.attr('sourceY') }))
        .target(() => {
          if (isparent) {
            return { x: x1, y: y1 + unitSize[1] };
          }
          return { x: x1, y: y1 - unitSize[1] };
        });

      const path = new Path2D(linkPath());
      ctx.strokeStyle = color[1];
      path.lineTo(x1, y1);
      ctx.stroke(path);
      drawArrowhead(
        ctx,
        x1,
        y1,
        Math.PI,
        color[1],
        isparent ? -(unitSize[1] + 40) / 2 : (unitSize[1] + 20) / 2
      );
      drawLineText(
        ctx,
        isparent ? targetData.fundedRatio : targetData.totalStockPercent,
        x1 + 10,
        isparent ? y1 + unitSize[1] / 2 + 20 : y1 - 40,
        0,
        color[0]
      );
    });

    /* eslint-disable complexity */
    virtualContainerNode.selectAll('.node, .pNode').each(function() {
      const node = d3.select(this);
      const treeNode = node.data()[0];
      const d = treeNode.data;
      const isRoot = !treeNode.depth;
      const isparent = Boolean(d.category);
      ctx.save();
      // translate to the center of node
      ctx.translate(Number(node.attr('x')), Number(node.attr('y')));
      ctx.fillStyle = !isparent || d.category === '1' ? '#fff' : color[2];
      ctx.lineWidth = 2;
      let indexX = 0; // left top
      let indexY = 0;
      let rootW = 0;
      const name = d.name || '--';
      if (isRoot) {
        ctx.strokeStyle = color[0];
        rootW = 16 * (name.length + 1) || rootSize[0];
        indexX = -rootW / 2;
        indexY = -rootSize[1] / 2;
        roundRect(
          ctx,
          indexX,
          indexY,
          rootW,
          rootSize[1],
          unitRadius,
          true,
          true
        );
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.font = '14px Arial';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, node.attr('x'), node.attr('y'));
        ctx.restore();
        return;
      }
      if (
        targetTreeNode &&
        targetTreeNode.data()[0].colorKey === treeNode.colorKey
      ) {
        // the hovering node style
        ctx.shadowColor = '#8f8f8f';
        ctx.shadowBlur = 18;
      } else {
        // the normal node style
        ctx.shadowColor = color[3];
        ctx.shadowBlur = 10;
      }
      const maxWidth = unitW - 2 * unitPadding;
      ctx.strokeStyle = 'transparent';
      indexX = -unitW / 2;
      indexY = -unitH / 2;
      roundRect(ctx, indexX, indexY, unitW, unitH, unitRadius, true, true);
      if (isparent && d.isAbsoluteController === 'True') {
        drawTip(ctx, config, indexX, indexY - 26, unitW);
      }

      ctx.font = '12px Arial';
      ctx.fillStyle = '#202020';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      wrapText(
        ctx,
        name,
        indexX + unitPadding,
        indexY + unitPadding,
        maxWidth,
        2
      );
      const metrics = ctx.measureText(name);

      wrapText(
        ctx,
        `认缴金额：${d.shouldCapi || d.subConAmt}`,
        indexX + unitPadding,
        metrics.width > maxWidth ? indexY + 40 : indexY + 34,
        maxWidth
      );
      if (treeNode.data._children) {
        drawAddIcon(
          ctx,
          config,
          isparent ? indexY - addIconR : -indexY + addIconR
        );
      }
      ctx.restore();
    });
  }

  function drawHiddenCanvas() {
    const { unitSize, rootSize, width, height, addIconR } = config;
    const unitW = unitSize[0];
    const unitH = unitSize[1];
    clearCanvas(hideCtx, width, height);

    virtualContainerNode.selectAll('.node, .pNode').each(function() {
      const node = d3.select(this);
      const d = node.data()[0];
      const isRoot = !d.parent;
      const isparent = Boolean(d.data.category);
      const indexX = Number(node.attr('x'));
      const indexY = Number(node.attr('y'));
      let halfHeight = unitH / 2;
      let rootW = 0;
      const name = d.data.name || '--';
      hideCtx.save();
      hideCtx.translate(indexX, indexY);
      hideCtx.fillStyle = node.attr('colorKey');
      hideCtx.strokeStyle = node.attr('colorKey');
      if (isRoot) {
        halfHeight = rootSize[1] / 2;
        rootW = 16 * (name.length + 1) || rootSize[0];
        roundRect(
          hideCtx,
          -rootW / 2,
          -halfHeight,
          rootW,
          rootSize[1],
          0,
          true,
          true
        );
      } else {
        roundRect(
          hideCtx,
          -unitW / 2,
          -halfHeight,
          unitW,
          unitH,
          0,
          true,
          true
        );
      }
      if (d.data._children) {
        hideCtx.beginPath();
        hideCtx.arc(
          0,
          isparent ? -halfHeight - addIconR : halfHeight + addIconR,
          addIconR,
          0,
          Math.PI * 2,
          true
        );
        hideCtx.fill();
      }
      hideCtx.restore();
    });
  }

  function clicked() {
    const point = d3.mouse(this);
    // 画布增大了两倍
    const colorStr = getColorStrFromCanvas(hideCtx, point[0] * 2, point[1] * 2);
    const node = colorNodeMap[colorStr];
    if (node) {
      toggleTreeNode(node.data()[0]);
      const d = initData(nodeDatas, parentsData);
      treeData = d.treeData;
      treeParent = d.treeParent;
      update(node.data()[0]);
      timer.restart(timerCallBack);
    }
  }

  function mousemoved() {
    const { width, height } = config;
    const point = d3.mouse(this);
    const colorStr = getColorStrFromCanvas(hideCtx, point[0] * 2, point[1] * 2);
    const node = colorNodeMap[colorStr];
    if (node && node.data()[0].parent) {
      const nodeData = node.data()[0].data;
      const tipH = 90;
      const tipW = 220;
      const tipX =
        point[0] + tipW < width ? `${point[0] + 5}px` : `${width - tipW}px`;
      const tipY =
        point[1] + tipH < height ? `${point[1] + 5}px` : `${height - tipH}px`;
      d3.select('#tooltip')
        .style('opacity', 0.8)
        .style('left', tipX)
        .style('top', tipY)
        .html(
          `${nodeData.name}<br>认缴金额:${nodeData.shouldCapi ||
            nodeData.subConAmt}`
        );
    } else {
      d3.select('#tooltip').style('opacity', 0);
    }
    // mousemove in or out
    if ((node || hoverNode) && node !== hoverNode) {
      hoverNode = node;
      drawCanvas(node);
    }
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
    return d;
  }

  function toggleTreeNode(treeNode) {
    if (treeNode.depth < 1) {
      return;
    }
    if (treeNode.data.children) {
      treeNode.data._children = treeNode.data.children;
      treeNode.data.children = null;
    } else {
      treeNode.data.children = treeNode.data._children;
      treeNode.data._children = null;
    }
  }

  function zoom() {
    const { width, height } = config;
    // 放大倍数和位移是相对最初的画布
    const transform = d3.event.transform;
    timer.stop();
    clearCanvas(ctx, width, height);
    clearCanvas(hideCtx, width, height);
    d3Transform = transform;
    drawCanvas();
  }
};

export default drawDraph;

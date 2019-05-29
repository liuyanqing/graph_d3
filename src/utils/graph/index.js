import * as d3 from 'd3';
import { getPixelRatio, getRadian, drawArrowhead, wrapText } from '../draw';
import { drawLineText, drawLegends } from './draw';

const drawDraph = (target, opt = {}) => {
  let pointMouse; // record mouse coordinate,global variable
  const canvas = d3
    .select(target)
    .call(
      d3
        .drag()
        .container(target)
        .subject(dragsubject)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .call(
      d3
        .zoom()
        .scaleExtent([0.5, 8])
        .on('zoom', zoom)
    );
  // setting config
  const config = {
    width: opt.width || target.width,
    height: opt.height || target.height,
    symbolSize: 40, // node circle r
    distance: 200,
    data: opt.data,
    color: [
      ['#FF9357', '#FE2C63'],
      ['#34D6FF', '#1890FF'],
      ['#FFcd01', '#FF8B02'],
    ],
    legend: {
      x: 34,
      y: 35,
      data: ['承兑人', '收票人'],
    },
    line: {
      text: '参股',
    },
  };

  const attractForce = d3
    .forceManyBody()
    .strength(100)
    .distanceMax(200)
    .distanceMin(200);
  const repelForce = d3
    .forceManyBody()
    .strength(-800)
    .distanceMax(600)
    .distanceMin(200);

  // 创建一个力模拟
  const simulation = d3
    .forceSimulation()
    .force(
      'link',
      d3
        .forceLink()
        .id(d => d.id)
        .distance(config.distance)
    )
    .force(
      'collide',
      d3
        .forceCollide()
        .radius(r => config.symbolSize + 10)
        .iterations(2)
    )
    .force('attractForce', attractForce)
    .force('repelForce', repelForce)
    .force('center', d3.forceCenter())
    .alphaTarget(0)
    .alphaDecay(0.05);

  const ctx = canvas.node().getContext('2d');

  const ratio = getPixelRatio(ctx);
  canvas.property('width', config.width * ratio);
  canvas.property('height', config.height * ratio);
  ctx.scale(ratio, ratio);

  simulation.nodes(config.data.nodes).on('tick', draw);

  simulation.force('link').links(config.data.links);

  canvas.on('mousemove', mousemoved);

  function dragsubject() {
    const { width, height } = config;
    // 查找给定位置最近的节点
    return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
  }

  function draw() {
    ticked();
    drawLegends(ctx, config);
  }

  function ticked() {
    const { data } = config;
    ctx.clearRect(0, 0, config.width, config.height);
    ctx.save();
    ctx.translate(config.width / 2, config.height / 2);

    data.links.forEach(drawLink);

    data.nodes.forEach(drawNode);

    ctx.restore();
  }

  function drawLink(d) {
    const { distance, line } = config;
    const x0 = Math.floor(d.source.x);
    const y0 = Math.floor(d.source.y);
    const x1 = Math.floor(d.target.x);
    const y1 = Math.floor(d.target.y);
    const endRadian = getRadian(x0, y0, x1, y1);
    ctx.beginPath();
    if (d.group === 1) {
      // start node
      ctx.strokeStyle = '#FE2C63';
    } else {
      // others node
      ctx.strokeStyle = '#F5A623';
    }

    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    // draw arrowhead
    drawArrowhead(ctx, x1, y1, endRadian, ctx.strokeStyle, config.symbolSize);
    // text in the line
    drawLineText(
      ctx,
      `${line.text}${d.ratio}`,
      x1,
      y1,
      endRadian,
      ctx.strokeStyle,
      -distance / 2
    );
  }

  // draw circle node
  function drawNode(node) {
    const r = active ? config.symbolSize : config.symbolSize + 2;
    const color = config.color;
    const x = Math.floor(node.x);
    const y = Math.floor(node.y);
    const active = pointMouse === node;

    const gradient = ctx.createLinearGradient(x - r, y, x + r, y);
    gradient.addColorStop(0, color[node.group][0]); // start node
    gradient.addColorStop(1, color[node.group][1]);
    ctx.shadowColor = active ? '#aaa' : '#fff';
    ctx.shadowBlur = active ? 20 : 0;
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.font = '12px pingfang sc,microsoft yahei,arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    wrapText(ctx, node.id, x, y, 2 * r - 2);
  }

  function zoom() {
    const transform = d3.event.transform;
    ctx.save();
    ctx.clearRect(0, 0, config.width, config.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    ticked();
    ctx.restore();
    drawLegends(ctx, config);
  }

  function mousemoved() {
    // the origin of coordinate is the center of canvas
    const point = d3.mouse(this);
    let minDistance = Infinity;
    let prePointMouse = pointMouse;
    pointMouse = null;
    config.data.nodes.forEach(d => {
      const dx = d.x + config.width / 2 - point[0];
      const dy = d.y + config.height / 2 - point[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance && distance < config.symbolSize + 5) {
        minDistance = distance;
        pointMouse = d;
        if (pointMouse !== prePointMouse) {
          prePointMouse = null;
        }
      }
    });
    if (pointMouse && prePointMouse) {
      return;
    }
    // draw();
    if (pointMouse) {
      console.log(pointMouse);
      const tipH = 90;
      const tipW = 260;
      const tipX =
        point[0] + tipW < config.width
          ? `${point[0] + 5}px`
          : `${config.width - tipW}px`;
      const tipY =
        point[1] + tipH < config.height
          ? `${point[1] + 5}px`
          : `${config.height - tipH}px`;
      d3.select('#tooltip')
        .style('opacity', 0.8)
        .style('left', tipX)
        .style('top', tipY)
        .html(pointMouse.id);
    } else {
      d3.select('#tooltip').style('opacity', 0);
    }
  }

  function dragstarted() {
    if (!d3.event.active) {
      // 设置目标α
      simulation.alphaTarget(0.3).restart();
    }
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }
};

export default drawDraph;

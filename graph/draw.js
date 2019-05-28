import { getRadian, drawArrowhead } from 'utils/draw';

export const datas = {
  nodes: [{ id: '北京京东', group: 0 }],
  links: [{ source: '上海啥事公司', target: '北京京东', ratio: '1%' }],
};

export const drawLineText = (ctx, text, x, y, radians, color, offset) => {
  const strokeStyle = color || '#F5A623';
  ctx.save(); // 保存默认的状态
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.rotate(radians - Math.PI * 0.5); // clockwise
  ctx.font = 'lighter 14px pingfang sc,microsoft yahei,arial';
  ctx.fillStyle = strokeStyle;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, offset, 0);
  ctx.closePath();
  ctx.restore(); // 还原到上次保存的默认状态
  ctx.fillStyle = strokeStyle;
  ctx.fill();
};

export const drawLegends = (ctx, config) => {
  const { color, legend } = config;
  const drawLegend = (x, y, i) => {
    const r = 5;
    const gradient = ctx.createLinearGradient(x - r, y, x + r, y);
    gradient.addColorStop(0, color[i][0]);
    gradient.addColorStop(1, color[i][1]);
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillText(legend.data[i], x + 20, y);
  };
  ctx.font = '16px pingfang sc,microsoft yahei,arial';
  ctx.fillStyle = '#999';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  color.slice(0, 2).map((c, i) => drawLegend(legend.x, legend.y + i * 40, i));

  const endRadian = getRadian(44, legend.y + 80, 24, legend.y + 80);
  ctx.beginPath();
  ctx.strokeStyle = '#999';
  ctx.moveTo(44, legend.y + 80);
  ctx.lineTo(24, legend.y + 80);
  ctx.stroke();
  drawArrowhead(ctx, 24, legend.y + 80, endRadian, ctx.strokeStyle);
  ctx.fillText('关系路径', 52, legend.y + 80);
};

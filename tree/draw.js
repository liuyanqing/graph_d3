export const datas = {
  name: '北京市京东物资公司',
  parents: [
    {
      subConAmt: '12616.88万元',
      category: '2', // 1 是公司，2是个人
      count: 4,
      grade: '1',
      fundedRatio: '74.49%',
      name: '郄茂金',
      isAbsoluteController: 'True', // yes - 'True', no - 'False'
      operName: '刘强东',
    },
  ],
  children: [
    {
      shouldCapi: '40万元',
      name: '中美恩特（北京）能源科技有限公司',
      capitalType: '货币',
      stockPercent: '66.67%',
      totalStockPercent: '66.67',
      source: 2,
      type: 2,
      children: [
        {
          shouldCapi: '-',
          brand: '北京农商银行手机银行',
          hasNode: true,
          name: '北京农村商业银行股份有限公司',
          stockPercent: '-',
          totalStockPercent: '0.0',
          source: 17,
          type: 2,
          children: [],
        },
      ],
    },
  ],
};

export const clearCanvas = (ctx, width, height) => {
  ctx.clearRect(-width * 6, -height * 6, width * 20, height * 20);
};

export const roundRect = (ctx, x, y, width, height, radius, fill, stroke) => {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    Object.keys(defaultRadius).forEach(side => {
      radius[side] = radius[side] || defaultRadius[side];
    });
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
};

export const fillText = (ctx, text, x, y) => {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#202020';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, x, y);
};

export const drawLineText = (ctx, text, x, y, radians, color) => {
  const strokeStyle = color;
  ctx.save(); // 保存默认的状态
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.rotate(radians); // clockwise
  ctx.font = '12px pingfang sc,microsoft yahei,arial';
  ctx.fillStyle = strokeStyle;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, 0, 0);
  ctx.closePath();
  ctx.fillStyle = strokeStyle;
  ctx.fill();
  ctx.restore(); // 还原到上次保存的默认状态
};

export const drawAddIcon = (ctx, config, y) => {
  const { color, addIconR } = config;
  ctx.save();
  ctx.translate(0, y);
  ctx.fillStyle = color[4];
  ctx.beginPath();
  ctx.arc(0, 0, addIconR, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-5, -1.5, 10, 3);
  ctx.fillRect(-1.5, -5, 3, 10);
  ctx.restore();
};

export const drawTip = (ctx, config, x, y, unitW) => {
  const { color } = config;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color[0];
  ctx.shadowColor = color[3];
  ctx.shadowBlur = 10;
  roundRect(ctx, 0, 0, unitW, 20, 0, true, true);
  ctx.font = '11px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 0;
  ctx.fillText('实际控制人', unitW / 2, 10);
  ctx.fillStyle = color[0];
  ctx.beginPath();
  ctx.moveTo(16, 20);
  ctx.lineTo(19, 25);
  ctx.lineTo(22, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

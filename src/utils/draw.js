// 解决 canvas 在高清屏中绘制模糊的问题
export const getPixelRatio = () => {
  const backingStore = 1;
  return (window.devicePixelRatio || 1) / backingStore;
};

// start point,end point
export const getRadian = (x0, y0, x1, y1) => {
  let endRadian = Math.atan((y1 - y0) / (x1 - x0));
  endRadian += ((x1 >= x0 ? 90 : -90) * Math.PI) / 180;
  return endRadian;
};

export const appendFront0 = numStr => {
  if (numStr.length !== 2) {
    return `0${numStr}`;
  }
  return numStr;
};

export const randomColor = () => {
  const letters = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ];
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const drawArrowhead = (ctx, x, y, radians, color, offset = 0) => {
  const strokeStyle = color || '#F5A623';
  ctx.save(); // 保存默认的状态
  ctx.beginPath();
  ctx.strokeStyle = strokeStyle;
  ctx.translate(x, y);
  ctx.rotate(radians); // clockwise
  ctx.moveTo(0, offset);
  ctx.lineTo(5, offset + 10);
  ctx.lineTo(-5, offset + 10);
  ctx.closePath();
  ctx.restore(); // 还原到上次保存的默认状态
  ctx.fillStyle = strokeStyle;
  ctx.fill();
};

export const getColorStrFromCanvas = (ctx, xIndex, yIndex) => {
  const pixelData = ctx.getImageData(xIndex, yIndex, 1, 1).data;
  return `#${appendFront0(pixelData[0].toString(16))}${appendFront0(
    pixelData[1].toString(16)
  )}${appendFront0(pixelData[2].toString(16))}`;
};

// text-overflow: ellipsis
export const wrapText = (
  ctx,
  text,
  x,
  y,
  maxWidth = Infinity,
  rows = 1,
  lineHeight = 16
) => {
  const words = text.split('');
  let lineNum = 1;
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = `${line}${words[n]}`;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (lineNum === rows) {
        ctx.fillText(`${line}...`, x, y);
        return;
      }
      lineNum += 1;
      ctx.fillText(line, x, y);
      line = `${words[n]}`;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
};

export default {
  getPixelRatio,
  drawArrowhead,
  randomColor,
  getColorStrFromCanvas,
  getRadian,
  wrapText,
};

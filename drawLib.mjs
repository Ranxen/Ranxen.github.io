export function rect(ctx, x, y, w, h, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 1) {
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
}

export function line(ctx, x1, y1, x2, y2, strokeStyle = "#000", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


const startAngle = 0;
const endAngle = Math.PI * 2;

export function circle(ctx, x, y, radius, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 1) {
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, true);
    ctx.fill();
    ctx.stroke();
}


export function arc(ctx, x, y, radius, startAngle, endAngle, color, strokeStyle = "transparent", lineWidth = 0) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.arc(x, y, radius, startAngle, endAngle, false);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


export function path(ctx, p, M, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 1) {
    ctx.save();
    ctx.setTransform(M);
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore();
}


export function text(ctx, x, y, text, fillStyle = "#000", textAlign = "center", textBaseline = "middle", font = "20px sans-serif") {
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(text, x, y);
}
import { ARTBOARD_SIZE } from './state.js';
import { getTemplateById } from './templates.js';

export function drawPlaceholder(ctx, message, accent = 'rgba(148, 163, 184, 0.32)') {
  ctx.clearRect(0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);
  const bg = ctx.createLinearGradient(0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);
  bg.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  bg.addColorStop(1, 'rgba(20, 31, 53, 0.9)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 16]);
  ctx.strokeRect(80, 80, ARTBOARD_SIZE - 160, ARTBOARD_SIZE - 160);
  ctx.setLineDash([]);

  ctx.fillStyle = '#dfe7ff';
  ctx.font = '700 52px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText(message, ARTBOARD_SIZE / 2, ARTBOARD_SIZE / 2 - 10);
}

export function renderArtboardCanvas(canvas, artboard) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (!artboard) {
    drawPlaceholder(ctx, 'No artboard selected');
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!artboard.photo) {
    drawPlaceholder(ctx, 'Upload Photo');
    const template = getTemplateById(artboard.templateId);
    if (template) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.drawImage(template.image, 0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);
      ctx.restore();
    }
    return;
  }

  const photo = artboard.photo;
  const image = photo.image;

  if (!image) {
    drawPlaceholder(ctx, 'Image unavailable');
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);
  ctx.clip();

  const transform = artboard.photoTransform || { x: 0, y: 0, scale: 1, rotation: 0 };
  const photoX = ARTBOARD_SIZE / 2 + transform.x;
  const photoY = ARTBOARD_SIZE / 2 + transform.y;
  const scale = transform.scale;

  ctx.translate(photoX, photoY);
  ctx.scale(scale, scale);
  ctx.translate(-(image.width / 2), -(image.height / 2));
  ctx.drawImage(image, 0, 0, image.width, image.height);
  ctx.restore();

  const template = getTemplateById(artboard.templateId);
  if (template) {
    ctx.drawImage(template.image, 0, 0, ARTBOARD_SIZE, ARTBOARD_SIZE);
  } else {
    drawPlaceholder(ctx, 'Select a Template', 'rgba(45, 212, 191, 0.38)');
  }
}

export function renderExportCanvas(canvas, artboard) {
  renderArtboardCanvas(canvas, artboard);
}

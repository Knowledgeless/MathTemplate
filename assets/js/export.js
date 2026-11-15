import { ARTBOARD_SIZE } from './state.js';
import { renderExportCanvas } from './canvas-renderer.js';
import { sanitizeFileName, showStatus } from './utils.js';

export function exportArtboard(artboard) {
  if (!artboard) {
    showStatus('Select an artboard before downloading.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = ARTBOARD_SIZE;
  canvas.height = ARTBOARD_SIZE;

  renderExportCanvas(canvas, artboard);

  canvas.toBlob((blob) => {
    if (!blob) {
      showStatus('Could not export this artboard. Please try again.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(artboard.name)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 600);
    showStatus(`Exported ${artboard.name}.`);
  }, 'image/png');
}

import { ARTBOARD_SIZE, getActiveArtboard, state, updatePhotoTransform } from './state.js';
import { clamp, showStatus } from './utils.js';

export function bindPhotoEditorControls() {
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomInButton = document.getElementById('zoom-in-btn');
  const zoomOutButton = document.getElementById('zoom-out-btn');
  const fitButton = document.getElementById('fit-photo-btn');
  const centerButton = document.getElementById('center-photo-btn');
  const resetButton = document.getElementById('reset-photo-btn');

  zoomSlider?.addEventListener('input', (event) => {
    const artboard = getActiveArtboard();
    if (!artboard || !artboard.photo) return;
    const targetScale = Number(event.target.value) / 100;
    artboard.photoTransform.scale = clamp(targetScale, 0.1, 12);
    document.dispatchEvent(new CustomEvent('app:render'));
  });

  zoomInButton?.addEventListener('click', () => adjustPhotoScale(1.12));
  zoomOutButton?.addEventListener('click', () => adjustPhotoScale(1 / 1.12));
  fitButton?.addEventListener('click', () => fitActivePhoto());
  centerButton?.addEventListener('click', () => centerActivePhoto());
  resetButton?.addEventListener('click', () => resetActivePhoto());
}

export function syncZoomSlider() {

  const zoomSlider = document.getElementById('zoom-slider');
  const artboard = getActiveArtboard();
  const zoomLabel = document.getElementById('zoom-value-label');

  if (zoomLabel) {
    zoomLabel.textContent = `${slider.value}%`;
  }
  if (!zoomSlider) return;

  if (!artboard || !artboard.photo) {
    zoomSlider.value = 100;
    return;
  }

  zoomSlider.value = String(Math.round((artboard.photoTransform.scale || 1) * 100));
}

export function initializeEditorCanvas() {
  const canvas = document.getElementById('active-artboard-canvas');
  if (!canvas) return;

  canvas.addEventListener('pointerdown', (event) => {
    const artboard = getActiveArtboard();
    if (!artboard || !artboard.photo) return;

    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    state.browserDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPhotoX: artboard.photoTransform.x,
      startPhotoY: artboard.photoTransform.y,
    };
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!state.browserDrag || state.browserDrag.pointerId !== event.pointerId) return;

    const artboard = getActiveArtboard();
    if (!artboard || !artboard.photo) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = ARTBOARD_SIZE / rect.width;
    const scaleY = ARTBOARD_SIZE / rect.height;
    const deltaX = (event.clientX - state.browserDrag.startX) * scaleX;
    const deltaY = (event.clientY - state.browserDrag.startY) * scaleY;

    artboard.photoTransform.x = state.browserDrag.startPhotoX + deltaX;
    artboard.photoTransform.y = state.browserDrag.startPhotoY + deltaY;
    document.dispatchEvent(new CustomEvent('app:render'));
  });

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointerleave', endDrag);
  canvas.addEventListener('wheel', (event) => {
    const artboard = getActiveArtboard();
    if (!artboard || !artboard.photo) return;
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    artboard.photoTransform.scale = clamp((artboard.photoTransform.scale || 1) * factor, 0.1, 12);
    document.dispatchEvent(new CustomEvent('app:render'));
  }, { passive: false });
}

function endDrag(event) {
  if (!state.browserDrag || state.browserDrag.pointerId !== event.pointerId) return;
  const canvas = document.getElementById('active-artboard-canvas');
  canvas?.classList.remove('dragging');
  state.browserDrag = null;
}

function adjustPhotoScale(multiplier) {
  const artboard = getActiveArtboard();
  if (!artboard || !artboard.photo) return;

  artboard.photoTransform.scale = clamp((artboard.photoTransform.scale || 1) * multiplier, 0.1, 12);
  document.dispatchEvent(new CustomEvent('app:render'));
}

function fitActivePhoto() {
  const artboard = getActiveArtboard();
  if (!artboard || !artboard.photo || !artboard.photo.image) {
    showStatus('Upload a valid photo before fitting it.');
    return;
  }

  const image = artboard.photo.image;
  const scale = Math.max(ARTBOARD_SIZE / image.width, ARTBOARD_SIZE / image.height);
  artboard.photoTransform.scale = scale;
  artboard.photoTransform.x = 0;
  artboard.photoTransform.y = 0;
  document.dispatchEvent(new CustomEvent('app:render'));
}

function centerActivePhoto() {
  const artboard = getActiveArtboard();
  if (!artboard || !artboard.photo) return;
  artboard.photoTransform.x = 0;
  artboard.photoTransform.y = 0;
  document.dispatchEvent(new CustomEvent('app:render'));
}

function resetActivePhoto() {
  const artboard = getActiveArtboard();
  if (!artboard || !artboard.photo) return;
  artboard.photoTransform = { x: 0, y: 0, scale: 1, rotation: 0 };
  document.dispatchEvent(new CustomEvent('app:render'));
}

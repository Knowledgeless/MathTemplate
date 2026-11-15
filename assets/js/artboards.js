import { ARTBOARD_SIZE, getActiveArtboard, removeArtboard, state } from './state.js';
import { exportArtboard } from './export.js';
import { renderArtboardCanvas } from './canvas-renderer.js';
import { getTemplateById } from './templates.js';
import { showStatus } from './utils.js';

export function renderArtboardList() {
  const strip = document.getElementById('artboard-strip');
  if (!strip) return;

  strip.innerHTML = '';

  if (!state.artboards.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Add your first artboard to begin.';
    strip.appendChild(empty);
    return;
  }

  state.artboards.forEach((artboard) => {
    const card = document.createElement('div');
    card.className = `artboard-card${artboard.id === state.activeArtboardId ? ' active' : ''}`;
    card.dataset.artboardId = artboard.id;

    const header = document.createElement('div');
    header.className = 'artboard-header';

    const label = document.createElement('div');
    label.className = 'artboard-label';
    label.textContent = artboard.name;

    const meta = document.createElement('div');
    meta.className = 'artboard-meta';
    const template = getTemplateById(artboard.templateId);
    meta.textContent = template ? template.name : 'No template';

    header.append(label, meta);

    const canvas = document.createElement('canvas');
    canvas.width = ARTBOARD_SIZE;
    canvas.height = ARTBOARD_SIZE;
    canvas.className = 'artboard-canvas';
    renderArtboardCanvas(canvas, artboard);

    const actions = document.createElement('div');
    actions.className = 'download-row';

    const downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.className = 'download-btn';
    downloadButton.textContent = 'Download PNG';
    downloadButton.addEventListener('click', (event) => {
      event.stopPropagation();
      exportArtboard(artboard);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-artboard-btn';
    deleteButton.title = 'Delete artboard';
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      removeArtboard(artboard.id);
      showStatus(`${artboard.name} removed.`);
      renderArtboardList();
      const activeArtboard = getActiveArtboard();
      if (activeArtboard) {
        showStatus(`${activeArtboard.name} is now selected.`);
      }
      document.dispatchEvent(new CustomEvent('app:render'));
    });

    actions.append(downloadButton, deleteButton);
    card.append(header, canvas, actions);

    card.addEventListener('click', () => {
      state.activeArtboardId = artboard.id;
      document.dispatchEvent(new CustomEvent('app:render'));
    });

    strip.appendChild(card);
  });
}

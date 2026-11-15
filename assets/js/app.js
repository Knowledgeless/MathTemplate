import { state, createArtboard, getActiveArtboard, assignTemplateToArtboard } from './state.js';
import { addTemplates, getTemplateById, removeTemplate } from './templates.js';
import { renderArtboardList } from './artboards.js';
import { bindPhotoEditorControls, initializeEditorCanvas, syncZoomSlider } from './editor.js';
import { renderArtboardCanvas } from './canvas-renderer.js';
import { showStatus, loadImageFromUrl } from './utils.js';

const templateInput = document.getElementById('template-input');
const photoInput = document.getElementById('photo-input');
const uploadTemplateButton = document.getElementById('upload-template-btn');
const uploadPhotoButton = document.getElementById('upload-photo-btn');
const addArtboardButton = document.getElementById('add-artboard-btn');

function renderTemplateLibrary() {
  const templateList = document.getElementById('template-list');
  if (!templateList) return;

  templateList.innerHTML = '';

  if (!state.templates.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No templates yet. Upload a PNG to begin.';
    templateList.appendChild(empty);
    return;
  }

  const activeArtboard = getActiveArtboard();

  state.templates.forEach((template) => {
    const card = document.createElement('div');
    card.setAttribute('role', 'group');
    card.className = `template-card${activeArtboard && activeArtboard.templateId === template.id ? ' active' : ''}`;

    const thumb = document.createElement('img');
    thumb.className = 'template-thumb';
    thumb.src = template.objectUrl;
    thumb.alt = template.name;

    const meta = document.createElement('div');
    meta.className = 'template-meta';
    const name = document.createElement('span');
    name.className = 'template-name';
    name.textContent = template.name;
    const chip = document.createElement('span');
    chip.className = 'template-chip';
    chip.textContent = 'PNG';
    meta.append(name, chip);

    const actions = document.createElement('div');
    actions.className = 'template-actions';

    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.className = 'mini-button';
    applyButton.title = 'Assign template to current artboard';
    applyButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    applyButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!activeArtboard) {
        showStatus('Create an artboard before assigning a template.');
        return;
      }
      assignTemplateToArtboard(activeArtboard.id, template.id);
      showStatus(`${template.name} assigned to ${activeArtboard.name}.`);
      renderEverything();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-template-btn';
    deleteButton.title = 'Remove template';
    deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      removeTemplate(template.id);
      renderEverything();
    });

    actions.append(applyButton, deleteButton);
    card.append(thumb, meta, actions);
    card.addEventListener('click', () => {
      if (!activeArtboard) {
        showStatus('Create an artboard before assigning a template.');
        return;
      }
      assignTemplateToArtboard(activeArtboard.id, template.id);
      showStatus(`${template.name} assigned to ${activeArtboard.name}.`);
      renderEverything();
    });

    templateList.appendChild(card);
  });
}

function renderActiveArtboard() {
  const canvas = document.getElementById('active-artboard-canvas');
  if (!canvas) return;

  const artboard = getActiveArtboard();
  const activeCanvas = artboard ? canvas : canvas;
  if (artboard) {
    renderArtboardCanvas(activeCanvas, artboard);
  }
}

function renderEverything() {
  renderTemplateLibrary();
  renderArtboardList();
  renderActiveArtboard();
  syncZoomSlider();
}

async function handleTemplateInput(event) {
  const files = event.target.files;
  if (!files?.length) return;

  await addTemplates(files);
  event.target.value = '';
  renderEverything();
}

function handlePhotoInput(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const artboard = getActiveArtboard();
  if (!artboard) {
    showStatus('Create an artboard first.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    showStatus('Please upload a valid image file.');
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    if (artboard.photo?.objectUrl) {
      URL.revokeObjectURL(artboard.photo.objectUrl);
    }

    artboard.photo = {
      file,
      image,
      objectUrl,
      name: file.name,
    };

    artboard.photoTransform = {
      x: 0,
      y: 0,
      scale: Math.max(ARTBOARD_SIZE / image.width, ARTBOARD_SIZE / image.height),
      rotation: 0,
    };

    showStatus(`${file.name} loaded onto ${artboard.name}.`);
    renderEverything();
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    showStatus('This image could not be decoded. Please try a different file.');
  };

  image.src = objectUrl;
  event.target.value = '';
}

function createDefaultBoard() {
  const artboard = createArtboard();
  showStatus(`${artboard.name} added. Upload a photo to get started.`);
  renderEverything();
}

function bindDomEvents() {
  uploadTemplateButton?.addEventListener('click', () => templateInput?.click());
  templateInput?.addEventListener('change', handleTemplateInput);

  uploadPhotoButton?.addEventListener('click', () => photoInput?.click());
  photoInput?.addEventListener('change', handlePhotoInput);

  addArtboardButton?.addEventListener('click', createDefaultBoard);

  document.addEventListener('app:render', () => {
    renderEverything();
  });
}

function initialize() {
  bindDomEvents();
  bindPhotoEditorControls();
  initializeEditorCanvas();
  createDefaultBoard();
}

initialize();

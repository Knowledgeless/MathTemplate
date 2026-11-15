import { state } from './state.js';
import { loadImageFromUrl, revokeObjectUrl, showStatus } from './utils.js';

export async function addTemplates(files) {
  const incoming = Array.from(files || []);
  if (!incoming.length) return;

  for (const file of incoming) {
    if (!file || !file.name.toLowerCase().endsWith('.png')) {
      showStatus('Only PNG files are supported for templates.');
      continue;
    }

    const objectUrl = URL.createObjectURL(file);
    let image;

    try {
      image = await loadImageFromUrl(objectUrl);
    } catch (error) {
      revokeObjectUrl(objectUrl);
      showStatus(`Could not read “${file.name}”. Please use a valid PNG image.`);
      continue;
    }

    state.templates.push({
      id: `template-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      file,
      image,
      objectUrl,
    });
  }

  if (state.templates.length) {
    showStatus(`${state.templates.length} template${state.templates.length === 1 ? '' : 's'} ready to use.`);
  }
}

export function removeTemplate(templateId) {
  const templateIndex = state.templates.findIndex((template) => template.id === templateId);
  if (templateIndex === -1) return;

  const [removedTemplate] = state.templates.splice(templateIndex, 1);

  state.artboards.forEach((artboard) => {
    if (artboard.templateId === templateId) {
      artboard.templateId = null;
    }
  });

  if (removedTemplate?.objectUrl) {
    revokeObjectUrl(removedTemplate.objectUrl);
  }

  showStatus('Template removed. Any affected artboards were cleared safely.');
}

export function getTemplateById(templateId) {
  return state.templates.find((template) => template.id === templateId) || null;
}

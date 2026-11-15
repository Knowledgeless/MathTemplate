export const ARTBOARD_SIZE = 1080;

export const state = {
  templates: [],
  artboards: [],
  activeArtboardId: null,
  browserDrag: null,
};

export function createArtboard() {
  const artboard = {
    id: `artboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: `Artboard ${state.artboards.length + 1}`,
    templateId: null,
    photo: null,
    photoTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
  };

  state.artboards.push(artboard);
  state.activeArtboardId = artboard.id;
  return artboard;
}

export function getActiveArtboard() {
  return state.artboards.find((artboard) => artboard.id === state.activeArtboardId) || state.artboards[0] || null;
}

export function removeArtboard(artboardId) {
  const index = state.artboards.findIndex((artboard) => artboard.id === artboardId);
  if (index === -1) return;

  const [removedArtboard] = state.artboards.splice(index, 1);

  if (removedArtboard?.photo?.objectUrl) {
    URL.revokeObjectURL(removedArtboard.photo.objectUrl);
  }

  if (state.artboards.length === 0) {
    state.activeArtboardId = null;
    return;
  }

  const fallbackIndex = Math.min(index, state.artboards.length - 1);
  state.activeArtboardId = state.artboards[fallbackIndex].id;
}

export function assignTemplateToArtboard(artboardId, templateId) {
  const artboard = state.artboards.find((item) => item.id === artboardId);
  if (!artboard) return;
  artboard.templateId = templateId;
}

export function updatePhotoTransform(artboardId, changes) {
  const artboard = state.artboards.find((item) => item.id === artboardId);
  if (!artboard || !artboard.photo) return;

  artboard.photoTransform = {
    ...artboard.photoTransform,
    ...changes,
  };
}

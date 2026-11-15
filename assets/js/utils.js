export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createId(prefix = 'item') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function revokeObjectUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function sanitizeFileName(name = 'artboard') {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'artboard';
}

export function showStatus(message) {
  const statusMessage = document.getElementById('status-message');
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This file could not be decoded as an image.'));
    image.src = url;
  });
}

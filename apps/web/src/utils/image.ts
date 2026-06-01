const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.75;
export const MAX_IMAGE_BASE64_LENGTH = 1_800_000;

export class ImageTooLargeError extends Error {
  constructor() {
    super('图片太大了，请重新拍摄或换一张更清晰但体积更小的图片。');
    this.name = 'ImageTooLargeError';
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('read file failed'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image decode failed'));
    image.src = src;
  });
}

export function stripDataUrlPrefix(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
}

function ensureAcceptableImageSize(base64: string) {
  if (base64.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new ImageTooLargeError();
  }
}

export async function compressImageToBase64(file: File, maxEdge = DEFAULT_MAX_EDGE, quality = DEFAULT_QUALITY) {
  const originalDataUrl = await readFileAsDataUrl(file);

  try {
    const image = await loadImage(originalDataUrl);
    const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('canvas unavailable');
    }

    context.drawImage(image, 0, 0, width, height);
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = stripDataUrlPrefix(compressedDataUrl);
    ensureAcceptableImageSize(base64);

    return {
      base64,
      previewUrl: compressedDataUrl,
      compressed: true,
      warning: ''
    };
  } catch {
    const base64 = stripDataUrlPrefix(originalDataUrl);
    ensureAcceptableImageSize(base64);

    return {
      base64,
      previewUrl: originalDataUrl,
      compressed: false,
      warning: '图片压缩失败，已使用原图继续识别。'
    };
  }
}

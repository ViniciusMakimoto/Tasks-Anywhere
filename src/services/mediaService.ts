export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Valida se o arquivo é uma imagem suportada e não excede o tamanho limite.
 */
export function isValidImageFile(file: File): boolean {
  if (!file || !file.type) return false;
  if (!file.type.startsWith('image/')) return false;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
  return true;
}

/**
 * Converte um File ou Blob para uma string Data URL base64 assincronamente.
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao processar arquivo como DataURL'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Erro na leitura do arquivo'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extrai o primeiro item de imagem de um objeto DataTransfer (Clipboard ou Drag & Drop).
 */
export function extractImageFromClipboard(clipboardData: DataTransfer | null): File | null {
  if (!clipboardData || !clipboardData.items) return null;

  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file && isValidImageFile(file)) {
        return file;
      }
    }
  }

  return null;
}

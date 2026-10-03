import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import { isValidImageFile, fileToDataUrl, extractImageFromClipboard } from '../../services/mediaService';
import { UploadCloud, CheckCircle2, X, RefreshCw, Image as ImageIcon } from 'lucide-solid';

export interface ImageUploaderProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onCancel: () => void;
}

export const ImageUploader = (props: ImageUploaderProps) => {
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  let fileInputRef: HTMLInputElement | undefined;

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    if (!isValidImageFile(file)) {
      setErrorMessage('Formato não suportado ou arquivo maior que 10MB.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedFile(file);
      setPreviewUrl(dataUrl);
    } catch {
      setErrorMessage('Erro ao carregar a imagem. Tente novamente.');
    }
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      handleProcessFile(target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const image = extractImageFromClipboard(e.clipboardData);
    if (image) {
      e.preventDefault();
      handleProcessFile(image);
    }
  };

  onMount(() => {
    window.addEventListener('paste', handlePaste);
  });

  onCleanup(() => {
    window.removeEventListener('paste', handlePaste);
  });

  const handleConfirm = () => {
    const file = selectedFile();
    const url = previewUrl();
    if (file && url) {
      props.onImageSelected(file, url);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  return (
    <div
      role="region"
      aria-label="Área de captura de imagem"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      class={`p-4 rounded-2xl border-2 transition-all backdrop-blur-md ${
        isDragging()
          ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/40 scale-[1.01]'
          : 'border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Selecionar imagem do dispositivo"
        onChange={handleFileInputChange}
        class="hidden"
      />

      <Show
        when={previewUrl()}
        fallback={
          <div class="flex flex-col items-center justify-center text-center space-y-3 py-3">
            <div
              onClick={() => fileInputRef?.click()}
              class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-inner"
            >
              <UploadCloud class="w-6 h-6" />
            </div>

            <div>
              <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                Clique para selecionar ou arraste uma foto aqui
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                PNG, JPG, WebP até 10MB • Você também pode colar com <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded">Ctrl+V</kbd>
              </p>
            </div>

            <Show when={errorMessage()}>
              <span class="text-xs text-rose-500 font-medium">{errorMessage()}</span>
            </Show>

            <div class="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => props.onCancel()}
                aria-label="Cancelar"
                class="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => fileInputRef?.click()}
                class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
              >
                Escolher Arquivo
              </button>
            </div>
          </div>
        }
      >
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
            <img
              src={previewUrl()!}
              alt="Pré-visualização da imagem"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex-1 min-w-0 text-center sm:text-left space-y-1">
            <div class="flex items-center gap-1.5 justify-center sm:justify-start">
              <ImageIcon class="w-4 h-4 text-indigo-500" />
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {selectedFile()?.name || 'Imagem capturada'}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Pronto para anexar à tarefa ou extrair detalhes com IA.
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              title="Trocar imagem"
              aria-label="Trocar imagem"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <RefreshCw class="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => props.onCancel()}
              title="Cancelar"
              aria-label="Cancelar"
              class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              aria-label="Confirmar imagem"
              class="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

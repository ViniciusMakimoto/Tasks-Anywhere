import { createSignal, onMount, onCleanup } from 'solid-js';
import { AudioRecorderService } from '../../services/audioRecorderService';

export interface AudioRecorderProps {
  onAudioCaptured: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const AudioRecorder = (props: AudioRecorderProps) => {
  const [seconds, setSeconds] = createSignal(0);
  const [isPaused, setIsPaused] = createSignal(false);
  const [recorderError, setRecorderError] = createSignal<string | null>(null);

  const recorder = new AudioRecorderService();
  let timerInterval: number | undefined;
  let initPromise: Promise<boolean> | undefined;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    stopTimer();
    timerInterval = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = undefined;
    }
  };

  onMount(() => {
    initPromise = recorder.startRecording().then((success) => {
      if (!success) {
        setRecorderError('Não foi possível acessar o microfone.');
      } else {
        startTimer();
      }
      return success;
    });
  });

  onCleanup(() => {
    stopTimer();
    recorder.cancelRecording();
  });

  const handleTogglePause = () => {
    if (isPaused()) {
      recorder.resumeRecording();
      setIsPaused(false);
      startTimer();
    } else {
      recorder.pauseRecording();
      setIsPaused(true);
      stopTimer();
    }
  };

  const handleDiscard = () => {
    stopTimer();
    recorder.cancelRecording();
    props.onCancel();
  };

  const handleFinish = async () => {
    stopTimer();
    if (initPromise) {
      await initPromise;
    }
    const result = await recorder.stopRecording();
    if (result) {
      props.onAudioCaptured(result.blob, result.duration);
    } else {
      props.onCancel();
    }
  };

  return (
    <div
      role="region"
      aria-label="Gravador de Áudio"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-md animate-fade-in"
    >
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-500">
          <span
            class={`absolute w-3 h-3 rounded-full bg-red-500 ${
              isPaused() ? 'opacity-40' : 'animate-ping'
            }`}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>

        <div class="flex flex-col">
          <span class="text-sm font-semibold text-red-500 tracking-wider font-mono">
            {formatTime(seconds())}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {recorderError() ? recorderError() : isPaused() ? 'Em pausa' : 'Gravando áudio...'}
          </span>
        </div>

        {/* Visualizador de ondas sonoras animadas */}
        <div class="flex items-center gap-1 h-6 px-2">
          <div
            class={`w-1 bg-red-400 rounded-full transition-all duration-300 ${
              isPaused() ? 'h-1.5' : 'h-4 animate-pulse'
            }`}
          />
          <div
            class={`w-1 bg-red-500 rounded-full transition-all duration-300 ${
              isPaused() ? 'h-2' : 'h-6 animate-pulse delay-75'
            }`}
          />
          <div
            class={`w-1 bg-red-400 rounded-full transition-all duration-300 ${
              isPaused() ? 'h-1.5' : 'h-3 animate-pulse delay-150'
            }`}
          />
          <div
            class={`w-1 bg-red-500 rounded-full transition-all duration-300 ${
              isPaused() ? 'h-2' : 'h-5 animate-pulse delay-100'
            }`}
          />
        </div>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={handleTogglePause}
          title={isPaused() ? 'Retomar gravação' : 'Pausar gravação'}
          class="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          {isPaused() ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clip-rule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={handleDiscard}
          title="Descartar gravação"
          aria-label="Descartar gravação"
          class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleFinish}
          title="Concluir gravação"
          aria-label="Concluir gravação"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-red-500/30 transition-all cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Concluir</span>
        </button>
      </div>
    </div>
  );
};

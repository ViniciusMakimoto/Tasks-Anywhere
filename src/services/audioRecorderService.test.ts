import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioRecorderService } from './audioRecorderService';

describe('AudioRecorderService (TDD - Task 3.2)', () => {
  let recorderService: AudioRecorderService;
  let mockStream: MediaStream;
  let mockMediaRecorder: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    recorderService = new AudioRecorderService();

    const mockTrack = { stop: vi.fn() };
    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream;

    mockMediaRecorder = {
      state: 'inactive',
      start: vi.fn(function (this: any) {
        this.state = 'recording';
      }),
      pause: vi.fn(function (this: any) {
        this.state = 'paused';
      }),
      resume: vi.fn(function (this: any) {
        this.state = 'recording';
      }),
      stop: vi.fn(function (this: any) {
        this.state = 'inactive';
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['audio-content'], { type: 'audio/webm' }) });
        }
        if (this.onstop) {
          this.onstop();
        }
      }),
      ondataavailable: null,
      onstop: null,
    };

    // @ts-expect-error Mocking MediaRecorder
    globalThis.MediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorder);
    globalThis.MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
    });
  });

  it('deve iniciar gravação, solicitar microfone e mudar estado para recording', async () => {
    const started = await recorderService.startRecording();

    expect(started).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(recorderService.getState()).toBe('recording');
  });

  it('deve pausar e retomar gravação alterando estados', async () => {
    await recorderService.startRecording();

    recorderService.pauseRecording();
    expect(recorderService.getState()).toBe('paused');

    recorderService.resumeRecording();
    expect(recorderService.getState()).toBe('recording');
  });

  it('deve parar gravação, parar as tracks de áudio e retornar o Blob com duração', async () => {
    await recorderService.startRecording();

    const result = await recorderService.stopRecording();

    expect(result).toBeDefined();
    expect(result?.blob).toBeInstanceOf(Blob);
    expect(recorderService.getState()).toBe('idle');

    const tracks = mockStream.getTracks();
    expect(tracks[0].stop).toHaveBeenCalled();
  });

  it('deve descartar gravação com cancelRecording e liberar o microfone', async () => {
    await recorderService.startRecording();

    recorderService.cancelRecording();

    expect(recorderService.getState()).toBe('idle');
    const tracks = mockStream.getTracks();
    expect(tracks[0].stop).toHaveBeenCalled();
  });
});

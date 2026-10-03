import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioRecorder } from './AudioRecorder';

describe('AudioRecorder Component (TDD - Task 3.2)', () => {
  let mockTrack: any;
  let mockStream: any;
  let mockMediaRecorder: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockTrack = { stop: vi.fn() };
    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    };

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
          this.ondataavailable({ data: new Blob(['audio'], { type: 'audio/webm' }) });
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

  it('renderiza o gravador com timer e botões de controle de áudio', async () => {
    render(() => <AudioRecorder onAudioCaptured={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/00:00/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descartar gravação/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Concluir gravação/i })).toBeInTheDocument();
  });

  it('ao clicar em descartar, cancela a gravação e chama onCancel', async () => {
    const handleCancel = vi.fn();
    render(() => <AudioRecorder onAudioCaptured={vi.fn()} onCancel={handleCancel} />);

    const discardBtn = screen.getByRole('button', { name: /Descartar gravação/i });
    await fireEvent.click(discardBtn);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('ao concluir a gravação, para o gravador e chama onAudioCaptured com Blob e duração', async () => {
    const handleCaptured = vi.fn();
    render(() => <AudioRecorder onAudioCaptured={handleCaptured} onCancel={vi.fn()} />);

    // Dá um tick para o onMount iniciar a gravação
    await Promise.resolve();

    const sendBtn = screen.getByRole('button', { name: /Concluir gravação/i });
    await fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(handleCaptured).toHaveBeenCalledWith(expect.any(Blob), expect.any(Number));
    });
  });
});

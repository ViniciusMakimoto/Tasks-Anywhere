import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  const mockTrack = { stop: vi.fn() };
  const mockStream = {
    getTracks: () => [mockTrack],
  };

  const MockMediaRecorder = vi.fn().mockImplementation(() => ({
    state: 'inactive',
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
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
  }));

  (MockMediaRecorder as any).isTypeSupported = vi.fn().mockReturnValue(true);
  (globalThis as any).MediaRecorder = MockMediaRecorder;

  try {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
      writable: true,
    });
  } catch {
    // navigator might already be defined
  }
}

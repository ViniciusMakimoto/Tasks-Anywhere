import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadEphemeralMedia,
  deleteEphemeralMedia,
  cleanupEphemeralMediaAfterDelay,
  MEDIA_BUCKET_NAME,
} from './storageService';

// Mock do supabase client
vi.mock('../lib/supabase', () => {
  const mockUpload = vi.fn();
  const mockRemove = vi.fn();
  const mockGetPublicUrl = vi.fn();

  return {
    supabase: {
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload,
          remove: mockRemove,
          getPublicUrl: mockGetPublicUrl,
        })),
        _mocks: { mockUpload, mockRemove, mockGetPublicUrl },
      },
    },
  };
});

import { supabase } from '../lib/supabase';

describe('StorageService (TDD - Task 4.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Upload de Mídia Efêmera', () => {
    it('deve fazer upload particionado pelo userId na pasta correta', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user-123/audio/rec_123.webm' },
        error: null,
      });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/v1/object/public/task-media/user-123/audio/rec_123.webm' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const blob = new Blob(['fake audio content'], { type: 'audio/webm' });
      const result = await uploadEphemeralMedia(blob, 'user-123', 'audio');

      expect(supabase.storage.from).toHaveBeenCalledWith(MEDIA_BUCKET_NAME);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^user-123\/audio\/.+\.webm$/),
        blob,
        expect.objectContaining({
          contentType: 'audio/webm',
          upsert: true,
        })
      );
      expect(result.path).toBe('user-123/audio/rec_123.webm');
      expect(result.publicUrl).toContain('task-media/user-123/audio');
      expect(result.error).toBeNull();
    });

    it('deve capturar e retornar erro se o upload falhar', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Quota exceeded' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const file = new File(['image'], 'foto.png', { type: 'image/png' });
      const result = await uploadEphemeralMedia(file, 'user-123', 'image');

      expect(result.path).toBeNull();
      expect(result.error?.message).toBe('Quota exceeded');
    });
  });

  describe('2. Remoção e Descarte Automático de Mídia', () => {
    it('deve chamar storage.remove para deletar mídia efêmera', async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        data: [{ name: 'rec_123.webm' }],
        error: null,
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      const result = await deleteEphemeralMedia('user-123/audio/rec_123.webm');

      expect(supabase.storage.from).toHaveBeenCalledWith(MEDIA_BUCKET_NAME);
      expect(mockRemove).toHaveBeenCalledWith(['user-123/audio/rec_123.webm']);
      expect(result.error).toBeNull();
    });

    it('cleanupEphemeralMediaAfterDelay deve invocar deleteEphemeralMedia após o tempo especificado', async () => {
      vi.useFakeTimers();

      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      const cleanupPromise = cleanupEphemeralMediaAfterDelay('user-123/image/photo.png', 5000);

      // Antes do delay não deve ter sido chamado
      expect(mockRemove).not.toHaveBeenCalled();

      // Avança o timer em 5000ms
      vi.advanceTimersByTime(5000);
      await cleanupPromise;

      expect(mockRemove).toHaveBeenCalledWith(['user-123/image/photo.png']);

      vi.useRealTimers();
    });
  });
});

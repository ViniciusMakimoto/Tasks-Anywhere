import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageUploader } from './ImageUploader';

describe('ImageUploader Component (TDD - Task 3.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza área de upload com opções de seleção, drag & drop e instruções de clipboard', () => {
    render(() => <ImageUploader onImageSelected={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/Clique para selecionar ou arraste uma foto/i)).toBeInTheDocument();
    expect(screen.getByText(/Ctrl\+V/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('ao selecionar um arquivo de imagem pelo input, gera preview e permite confirmar', async () => {
    const handleSelected = vi.fn();
    render(() => <ImageUploader onImageSelected={handleSelected} onCancel={vi.fn()} />);

    const file = new File(['teste-conteudo-imagem'], 'minha-foto.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Selecionar imagem do dispositivo/i) as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    // Deve exibir o preview da imagem
    await waitFor(() => {
      expect(screen.getByAltText(/Pré-visualização da imagem/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar imagem/i })).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar imagem/i });
    await fireEvent.click(confirmBtn);

    expect(handleSelected).toHaveBeenCalledWith(file, expect.stringContaining('data:image/png;base64,'));
  });

  it('ao cancelar no estado inicial ou no preview, chama props.onCancel', async () => {
    const handleCancel = vi.fn();
    render(() => <ImageUploader onImageSelected={vi.fn()} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await fireEvent.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('ao arrastar e soltar arquivo válido (drag & drop), carrega a imagem', async () => {
    const handleSelected = vi.fn();
    render(() => <ImageUploader onImageSelected={handleSelected} onCancel={vi.fn()} />);

    const dropZone = screen.getByRole('region', { name: /Área de captura de imagem/i });
    const file = new File(['drag-image'], 'drop.jpg', { type: 'image/jpeg' });

    await fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        items: [{ type: 'image/jpeg', getAsFile: () => file }],
      },
    });

    await waitFor(() => {
      expect(screen.getByAltText(/Pré-visualização da imagem/i)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('debe renderizar el texto proporcionado', () => {
    render(<Loading text="Cargando datos..." />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('debe renderizar el spinner', () => {
    render(<Loading text="Cargando..." />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border');
  });

  it('debe tener las clases de estilo correctas', () => {
    const { container } = render(<Loading text="Test" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('d-flex');
    expect(wrapper).toHaveClass('flex-column');
    expect(wrapper).toHaveClass('align-items-center');
    expect(wrapper).toHaveClass('justify-content-center');
  });

  it('debe renderizar con texto vacío', () => {
    const { container } = render(<Loading text="" />);

    expect(container.querySelector('span')).toBeInTheDocument();
    expect(container.querySelector('span')?.textContent).toBe('');
  });

  it('debe renderizar con texto largo', () => {
    const textoLargo = 'Este es un texto muy largo que podría aparecer en el componente de carga';
    render(<Loading text={textoLargo} />);

    expect(screen.getByText(textoLargo)).toBeInTheDocument();
  });
});

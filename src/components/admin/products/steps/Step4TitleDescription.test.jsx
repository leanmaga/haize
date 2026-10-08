import { fireEvent, render, screen } from '@testing-library/react';
import Step4TitleDescription from './Step4TitleDescription';

test('leaves new fields blank and editable without automatic options', () => {
  const onNext = jest.fn();
  render(<Step4TitleDescription data={{ model: 'Modelo de ejemplo', category: 'remeras' }} updateData={jest.fn()} onNext={onNext} />);
  const [title, description] = screen.getAllByRole('textbox');
  expect(title).toHaveValue('');
  expect(title).toBeEnabled();
  expect(description).toHaveValue('');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByText(/Usar descripción sugerida/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(screen.getByText('El título es requerido')).toBeInTheDocument();
  expect(onNext).not.toHaveBeenCalled();
  fireEvent.change(title, { target: { value: 'Buzo gris estampado' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(onNext).toHaveBeenCalledWith({ title: 'Buzo gris estampado', description: '' });
});

test('preserves saved copy and submits manual edits', () => {
  const onNext = jest.fn();
  render(<Step4TitleDescription data={{ title: 'Título existente', description: 'Descripción existente del producto' }} updateData={jest.fn()} onNext={onNext} />);
  const [title, description] = screen.getAllByRole('textbox');
  expect(title).toHaveValue('Título existente');
  expect(description).toHaveValue('Descripción existente del producto');
  fireEvent.change(description, { target: { value: 'Nueva descripción escrita por el vendedor' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(onNext).toHaveBeenCalledWith({ title: 'Título existente', description: 'Nueva descripción escrita por el vendedor' });
});

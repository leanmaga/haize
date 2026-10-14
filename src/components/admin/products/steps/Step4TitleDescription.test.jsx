import { fireEvent, render, screen } from '@testing-library/react';
import Step4TitleDescription from './Step4TitleDescription';

test('leaves new fields blank and editable without automatic options', () => {
  const onNext = jest.fn();
  render(<Step4TitleDescription data={{ model: 'Modelo de ejemplo', category: 'remeras' }} updateData={jest.fn()} onNext={onNext} />);
  const [title, description] = screen.getAllByRole('textbox');
  expect(title).toHaveValue('');
  expect(title).toBeEnabled();
  expect(description).toHaveValue('');
  expect(screen.getByRole('checkbox', { name: 'Producto destacado' })).not.toBeChecked();
  expect(screen.queryByText(/Usar descripción sugerida/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(screen.getByText('El título es requerido')).toBeInTheDocument();
  expect(onNext).not.toHaveBeenCalled();
  fireEvent.change(title, { target: { value: 'Buzo gris estampado' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(onNext).toHaveBeenCalledWith({ title: 'Buzo gris estampado', description: '', featured: false });
});

test('preserves saved copy and submits manual edits', () => {
  const onNext = jest.fn();
  render(<Step4TitleDescription data={{ title: 'Título existente', description: 'Descripción existente del producto' }} updateData={jest.fn()} onNext={onNext} />);
  const [title, description] = screen.getAllByRole('textbox');
  expect(title).toHaveValue('Título existente');
  expect(description).toHaveValue('Descripción existente del producto');
  fireEvent.change(description, { target: { value: 'Nueva descripción escrita por el vendedor' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(onNext).toHaveBeenCalledWith({ title: 'Título existente', description: 'Nueva descripción escrita por el vendedor', featured: false });
});

test('allows marking a product as featured and preserves it while editing', () => {
  const updateData = jest.fn();
  const onNext = jest.fn();
  const { rerender } = render(<Step4TitleDescription data={{}} updateData={updateData} onNext={onNext} />);
  const checkbox = screen.getByRole('checkbox', { name: 'Producto destacado' });
  fireEvent.click(checkbox);
  expect(updateData).toHaveBeenLastCalledWith(expect.objectContaining({ featured: true }));

  rerender(<Step4TitleDescription data={{ title: 'Producto destacado', featured: true }} updateData={updateData} onNext={onNext} />);
  expect(screen.getByRole('checkbox', { name: 'Producto destacado' })).toBeChecked();
});

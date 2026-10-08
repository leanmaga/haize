import { fireEvent, render, screen } from '@testing-library/react';
import ProductColorPicker from './ProductColorPicker';

test('selects a named preset with its hex value', () => {
  const onChange = jest.fn();
  render(<ProductColorPicker value="" onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Color (requerido)' }));
  fireEvent.click(screen.getByRole('button', { name: 'Amarillo', exact: true }));
  expect(onChange).toHaveBeenCalledWith('Amarillo', '#FFFF00');
});
test('validates custom input and accepts both the picker and hex input', () => {
  const onChange = jest.fn();
  render(<ProductColorPicker value="" onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Color (requerido)' }));
  fireEvent.click(screen.getByText('+ Agregar tu color'));
  fireEvent.change(screen.getByLabelText('Nombre del color'), { target: { value: 'Azul petróleo' } });
  fireEvent.change(screen.getByLabelText('Seleccionar tono'), { target: { value: '#123456' } });
  expect(screen.getByLabelText('Código hexadecimal')).toHaveValue('#123456');
  fireEvent.change(screen.getByLabelText('Código hexadecimal'), { target: { value: 'invalid' } });
  fireEvent.click(screen.getByText('Usar color'));
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Código hexadecimal'), { target: { value: '#123456' } });
  fireEvent.click(screen.getByText('Usar color'));
  expect(onChange).toHaveBeenCalledWith('Azul petróleo', '#123456');
});

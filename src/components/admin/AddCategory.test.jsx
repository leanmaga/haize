import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Step1 from './products/steps/Step1MainCharacteristics';
import useCategories from '@/hooks/useCategories';
function OtherSelector() {
  const { categories } = useCategories();
  return <select aria-label="Otro selector">{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>;
}
test('creates, selects and propagates a new category without reloading', async () => {
  const updateData = jest.fn();
  global.fetch = jest.fn(async (url, options) => ({ ok: true, json: async () => options?.method === 'POST' ? { category: { name: 'Buzos', slug: 'buzos' } } : { categories: [{ name: 'Remeras', slug: 'remeras' }] } }));
  render(<><Step1 data={{}} updateData={updateData} /><OtherSelector /></>);
  fireEvent.click(screen.getByRole('button', { name: 'Agregar nueva categoría' }));
  fireEvent.change(screen.getByLabelText('Nueva categoría'), { target: { value: 'Buzos' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar', exact: true }));
  await waitFor(() => expect(updateData).toHaveBeenCalledWith(expect.objectContaining({ category: 'buzos' })));
  expect(screen.getByRole('option', { name: 'Buzos' })).toHaveValue('buzos');
  expect(screen.getByRole('button', { name: /Buzos/ })).toBeInTheDocument();
});

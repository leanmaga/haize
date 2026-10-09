import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ status: 'authenticated', data: { user: { email: 'buyer@example.com' } } }) }));
jest.mock('@/lib/store', () => ({ useCartStore: () => ({
  items: [{ id: 'abc', title: 'Remera', image: '/test.jpg', price: 100, quantity: 1 }],
  getTotal: () => 100, getTotalWithDiscount: () => 100, getDiscountInfo: () => null, clearCart: jest.fn(),
}) }));
jest.mock('next/image', () => function ProductImage() { return null; });
jest.mock('@/components/ui/WhatsAppButton', () => function WhatsAppButton() { return null; });
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { error: jest.fn(), success: jest.fn() }, Toaster: () => null }));

const saved = { name: 'Cliente', email: 'buyer@example.com', phone: '123', street: 'Calle original', streetNumber: '42', city: 'Morón', postalCode: '1708' };
test('restores saved fields with save checked by default and allows opting out', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ shippingInfo: saved, hasSavedShippingInfo: true }) });
  render(<CheckoutPage />);
  await waitFor(() => expect(screen.getByLabelText('Calle *')).toHaveValue('Calle original'));
  expect(screen.getByLabelText('Número de la casa *')).toHaveValue('42');
  expect(screen.getByRole('checkbox')).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  fireEvent.change(screen.getByLabelText('Calle *'), { target: { value: 'Destino temporal' } });
  expect(screen.getByLabelText('Calle *')).toHaveValue('Destino temporal');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  fireEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).toBeChecked();
});
test('late profile response does not overwrite fields already typed', async () => {
  let resolve;
  global.fetch = jest.fn(() => new Promise((done) => { resolve = done; }));
  render(<CheckoutPage />);
  fireEvent.change(await screen.findByLabelText('Calle *'), { target: { value: 'Calle escrita' } });
  resolve({ ok: true, json: async () => ({ shippingInfo: saved, hasSavedShippingInfo: true }) });
  await waitFor(() => expect(screen.getByLabelText('Número de la casa *')).toHaveValue('42'));
  expect(screen.getByLabelText('Calle *')).toHaveValue('Calle escrita');
});

test('suggests an official municipality and blocks an incorrectly spelled destination', async () => {
  global.fetch = jest.fn((url) => {
    if (url === '/api/municipalities') return Promise.resolve({ ok: true, json: async () => ({ municipalities: [{ id: '060427', name: 'La Matanza', province: 'Buenos Aires' }] }) });
    if (url.startsWith('/api/delivery-zones/quote')) return Promise.resolve({ ok: false, json: async () => ({ error: 'Seleccioná un municipio válido de la lista' }) });
    return Promise.resolve({ ok: true, json: async () => ({ shippingInfo: saved, hasSavedShippingInfo: true }) });
  });
  render(<CheckoutPage />);
  const city = await screen.findByLabelText('Municipio *');
  await waitFor(() => expect(screen.getByLabelText('Calle *')).toHaveValue('Calle original'));
  fireEvent.change(city, { target: { value: 'La mat' } });
  const suggestion = await screen.findByRole('option', { name: /La Matanza/ });
  fireEvent.click(suggestion);
  expect(city).toHaveValue('La Matanza');
  fireEvent.change(city, { target: { value: 'La mattanza' } });
  fireEvent.click(screen.getByRole('button', { name: /Pagar con MercadoPago/ }));
  await waitFor(() => expect(city).toHaveClass('border-red-500'));
  expect(global.fetch).not.toHaveBeenCalledWith('/api/orders', expect.anything());
});

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
test('restores saved fields and permits a temporary address without selecting save', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ shippingInfo: saved, hasSavedShippingInfo: true }) });
  render(<CheckoutPage />);
  await waitFor(() => expect(screen.getByLabelText('Calle *')).toHaveValue('Calle original'));
  expect(screen.getByLabelText('Número de la casa *')).toHaveValue('42');
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

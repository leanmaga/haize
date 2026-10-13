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

const saved = { name: 'Cliente', email: 'buyer@example.com', phone: '123', street: 'Calle original', streetNumber: '42', apartment: '2 B', city: 'Morón', postalCode: '1708' };

test('shows the selected locality when its options arrive after the address', async () => {
  let finishLocalities;
  global.fetch = jest.fn((url) => {
    if (url.startsWith('/api/localities')) return new Promise((resolve) => { finishLocalities = resolve; });
    const data = url === '/api/municipalities'
      ? { municipalities: [{ id: '060539', name: 'Merlo', province: 'Buenos Aires' }] }
      : url.startsWith('/api/delivery-zones/quote')
        ? { city: 'Merlo', municipalityId: '060539', localityId: '0653901000', locality: 'Libertad', quoted: true, shippingCost: 0 }
        : { shippingInfo: { ...saved, city: 'Merlo', municipalityId: '060539', localityId: '0653901000' } };
    return Promise.resolve({ ok: true, json: async () => data });
  });
  render(<CheckoutPage />);
  await waitFor(() => expect(finishLocalities).toBeDefined());
  finishLocalities({ ok: true, json: async () => ({ localities: [{ id: '0653901000', name: 'Libertad' }] }) });
  await screen.findByRole('option', { name: 'Libertad' });
  expect(screen.getByLabelText('Localidad *')).toHaveValue('0653901000');
  expect(await screen.findByText('Envío sin cargo · $0')).toBeInTheDocument();
});
test('restores saved fields with save checked by default and allows opting out', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ shippingInfo: saved, hasSavedShippingInfo: true }) });
  render(<CheckoutPage />);
  await waitFor(() => expect(screen.getByLabelText('Calle *')).toHaveValue('Calle original'));
  expect(screen.getByLabelText('Número de la casa *')).toHaveValue('42');
  expect(screen.getByLabelText('Departamento (opcional)')).toHaveValue('2 B');
  expect(screen.getByLabelText('Departamento (opcional)')).not.toBeRequired();
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

test('requires locality, displays the selected price, and clears it when municipality changes', async () => {
  global.fetch = jest.fn((url) => {
    let data;
    if (url === '/api/municipalities') data = { municipalities: [{ id: '060568', name: 'Morón' }, { id: '060539', name: 'Merlo' }] };
    else if (url.startsWith('/api/localities')) data = { localities: [{ id: '0656801003', name: 'Haedo' }, { id: '0656801002', name: 'El Palomar' }] };
    else if (url.startsWith('/api/delivery-zones/quote')) {
      const id = new URL(url, 'https://test.local').searchParams.get('localityId');
      data = { city: 'Morón', municipalityId: '060568', localityId: id, locality: id === '0656801003' ? 'Haedo' : 'El Palomar', quoted: true, shippingCost: id === '0656801003' ? 0 : 7500 };
    } else data = { shippingInfo: { ...saved, municipalityId: '060568' }, hasSavedShippingInfo: true };
    return Promise.resolve({ ok: true, json: async () => data });
  });
  render(<CheckoutPage />);
  const select = await screen.findByLabelText('Localidad *');
  await screen.findByRole('option', { name: 'Haedo' });
  fireEvent.click(screen.getByRole('button', { name: /Pagar con MercadoPago/ }));
  expect(await screen.findByText('Seleccioná una localidad')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalledWith('/api/orders', expect.anything());
  fireEvent.change(select, { target: { value: '0656801003' } });
  expect(await screen.findByText('El vendedor cubre el costo del envío.')).toBeInTheDocument();
  fireEvent.change(select, { target: { value: '0656801002' } });
  expect(await screen.findByText('Envío: $7.500')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Municipio *'), { target: { value: 'Merlo' } });
  await waitFor(() => expect(select).toHaveValue(''));
  expect(screen.queryByText('Envío: $7.500')).not.toBeInTheDocument();
});

test('unpriced locality explains that shipping is coordinated and excluded from the total', async () => {
  global.fetch = jest.fn((url) => Promise.resolve({ ok: true, json: async () => {
    if (url === '/api/municipalities') return { municipalities: [{ id: '060568', name: 'Morón' }] };
    if (url.startsWith('/api/localities')) return { localities: [{ id: '0656801003', name: 'Haedo' }] };
    if (url.startsWith('/api/delivery-zones/quote')) return { city: 'Morón', municipalityId: '060568', localityId: '0656801003', locality: 'Haedo', shippingCost: 0, quoted: false };
    return { shippingInfo: { ...saved, municipalityId: '060568', localityId: '0656801003' } };
  } }));
  render(<CheckoutPage />);
  expect(await screen.findByText('Envío por coordinar')).toBeInTheDocument();
  expect(screen.getByText('Coordinaremos el costo y la entrega con vos. El total no incluye envío.')).toBeInTheDocument();
});

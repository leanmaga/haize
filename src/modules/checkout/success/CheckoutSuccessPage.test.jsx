import { render, screen, waitFor } from '@testing-library/react';
import CheckoutSuccessPage from './CheckoutSuccessPage';
const mockClear = jest.fn();
jest.mock('@/lib/store', () => ({ useCartStore: selector => selector({ clearCart: mockClear }) }));
beforeEach(() => { jest.clearAllMocks(); window.history.replaceState({}, '', '/checkout/success'); });
test('does not claim success based solely on a return URL', () => {
  window.history.replaceState({}, '', '/checkout/success?payment_status=approved');
  render(<CheckoutSuccessPage />);
  expect(screen.getByText('Confirmación en proceso')).toBeInTheDocument();
  expect(mockClear).not.toHaveBeenCalled();
});
test('clears cart only after server verification', async () => {
  window.history.replaceState({}, '', '/checkout/success?external_reference=abc&payment_id=123');
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ paid: true }) });
  render(<CheckoutSuccessPage />);
  await waitFor(() => expect(screen.getByText('¡Pago confirmado!')).toBeInTheDocument());
  expect(mockClear).toHaveBeenCalledTimes(1);
});

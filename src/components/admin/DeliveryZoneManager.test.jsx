import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeliveryZoneManager from './DeliveryZoneManager';
jest.mock('./GoogleCoverageMap', () => function MapPreview({ features }) {
  return <div data-testid="map">{features.filter((f) => f.properties.isActive).map((f) => f.properties.name).join(',')}</div>;
});
const geometry = { type: 'Polygon', coordinates: [[[-58, -34], [-59, -34], [-59, -35], [-58, -34]]] };
const features = ['Morón', 'Merlo'].map((nombre, i) => ({ type: 'Feature', id: String(i), properties: { nombre }, geometry }));
beforeEach(() => {
  global.fetch = jest.fn((url, options) => Promise.resolve({ ok: true, json: async () => options?.method ? { _id: 'saved' } : url.endsWith('catalog') ? { features } : { zones: [] } }));
});
test('checks immediately update both polygons and unchecking removes only one', async () => {
  render(<DeliveryZoneManager />);
  fireEvent.click(await screen.findByLabelText('Morón'));
  fireEvent.click(screen.getByLabelText('Merlo'));
  expect(screen.getByTestId('map')).toHaveTextContent('Morón,Merlo');
  fireEvent.click(screen.getByLabelText('Morón'));
  expect(screen.getByTestId('map')).toHaveTextContent(/^Merlo$/);
});
test('saves numeric free and paid tariffs and reports completion', async () => {
  render(<DeliveryZoneManager />);
  fireEvent.click(await screen.findByLabelText('Morón'));
  fireEvent.click(screen.getByLabelText('Merlo'));
  fireEvent.change(screen.getByLabelText('Precio de envío Morón'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('Precio de envío Merlo'), { target: { value: '2500' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cobertura y precios' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('guardados'));
  const writes = global.fetch.mock.calls.filter(([, options]) => options?.method);
  expect(writes.map(([, options]) => JSON.parse(options.body).shippingPrice)).toEqual([0, 2500]);
});

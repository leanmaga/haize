import { fireEvent, render, screen } from '@testing-library/react';
import CoverageMap from './CoverageMap';
import GoogleCoverageMap from './GoogleCoverageMap';

const features = [{ type: 'Feature', id: '06568', properties: { name: 'Morón', isActive: true, shippingPrice: 0 }, geometry: { type: 'Polygon', coordinates: [[[-58.7, -34.6], [-58.6, -34.6], [-58.6, -34.7], [-58.7, -34.6]]] } }];

test('selects the same municipality by mouse or keyboard and reflects updated coverage', () => {
  const toggle = jest.fn();
  const { rerender } = render(<CoverageMap features={features} onToggle={toggle} />);
  const municipality = screen.getByRole('button', { name: 'Morón' });
  fireEvent.click(municipality);
  expect(toggle).toHaveBeenLastCalledWith('06568');
  expect(screen.getByText('Sin cargo · cubierto por el vendedor')).toBeInTheDocument();
  fireEvent.keyDown(municipality, { key: 'Enter' });
  expect(toggle).toHaveBeenCalledTimes(2);
  rerender(<CoverageMap features={[{ ...features[0], properties: { ...features[0].properties, isActive: false } }]} onToggle={toggle} />);
  expect(screen.getByRole('button', { name: 'Morón' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('Envío por coordinar')).toBeInTheDocument();
});

test('works without Google credentials and zooms without changing selection', () => {
  const previous = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;
  try {
    const toggle = jest.fn();
    render(<GoogleCoverageMap features={features} onToggle={toggle} />);
    const map = screen.getByRole('group', { name: 'Mapa de municipios y tarifas de envío' });
    const initial = map.getAttribute('viewBox');
    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(map.getAttribute('viewBox')).not.toBe(initial);
    expect(toggle).not.toHaveBeenCalled();
    expect(screen.queryByText('Falta configurar la clave de Google Maps.')).not.toBeInTheDocument();
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = previous;
  }
});

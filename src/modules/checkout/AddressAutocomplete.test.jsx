import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddressAutocomplete from './AddressAutocomplete';
import { loadMaps } from '@/lib/google-maps';
jest.mock('@/lib/google-maps', () => ({ loadMaps: jest.fn() }));
const component = (type, longText) => ({ types: [type], longText });
const search = jest.fn();
const prediction = { placeId: 'one', text: { toString: () => 'Manuel Soler, Libertad, Buenos Aires' }, toPlace: () => ({ fetchFields: async () => {}, addressComponents: [component('country', 'Argentina'), component('route', 'Manuel Soler'), component('locality', 'Libertad')], location: { lat: () => -34.7, lng: () => -58.7 } }) };
beforeEach(() => {
  search.mockReset().mockResolvedValue({ suggestions: [{ placePrediction: prediction }] });
  loadMaps.mockResolvedValue({ importLibrary: async () => ({ AutocompleteSessionToken: class {}, AutocompleteSuggestion: { fetchAutocompleteSuggestions: search } }) });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ city: 'Merlo', municipalityId: '060539', localityId: '0653901000' }) });
});
function setup() {
  const onSelect = jest.fn();
  render(<AddressAutocomplete registration={{ name: 'street', onChange: jest.fn(), onBlur: jest.fn() }} onEdit={jest.fn()} onSelect={onSelect} />);
  return onSelect;
}
test('keyboard selection resolves shipping IDs and leaves missing house number empty', async () => {
  const onSelect = setup();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Manuel Soler' } });
  await screen.findByRole('option');
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ street: 'Manuel Soler', streetNumber: '', municipalityId: '060539', localityId: '0653901000' })));
});
test('late details cannot overwrite a new address being typed', async () => {
  let finish;
  global.fetch.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  const onSelect = setup();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Manuel' } });
  fireEvent.click(await screen.findByRole('option'));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Nueva calle' } });
  finish({ ok: true, json: async () => ({ city: 'Merlo' }) });
  await screen.findByRole('option');
  expect(onSelect).not.toHaveBeenCalled();
});
test('Google unavailable leaves manual entry usable', async () => {
  loadMaps.mockRejectedValue(new Error('missing key'));
  setup();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Manuel' } });
  expect(await screen.findByText(/Sugerencias no disponibles/)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveValue('Manuel');
});

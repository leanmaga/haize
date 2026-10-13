export function parseGoogleAddress(place) {
  const components = place.addressComponents || [];
  const get = (type) => components.find((item) => item.types.includes(type))?.longText || '';
  if (get('country') !== 'Argentina') throw new Error('Seleccioná una dirección de Argentina.');
  const street = get('route');
  if (!street) throw new Error('Seleccioná una calle o dirección, no un comercio o una ciudad.');
  return {
    street, streetNumber: get('street_number'), postalCode: get('postal_code'),
    province: get('administrative_area_level_1'),
    localityNames: ['locality', 'sublocality_level_1', 'sublocality', 'administrative_area_level_3'].map(get).filter(Boolean),
    lat: place.location?.lat(), lng: place.location?.lng(),
  };
}

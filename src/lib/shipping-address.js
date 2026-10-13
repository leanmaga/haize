export function normalizeShippingAddress(info) {
  const street = typeof info?.street === 'string' ? info.street.trim() : '';
  const streetNumber = typeof info?.streetNumber === 'string' ? info.streetNumber.trim() : '';
  if (!street) throw new Error('La calle es obligatoria.');
  if (!streetNumber) throw new Error('El número de la casa es obligatorio.');
  if (!/^\d+[a-zA-Z]?$/.test(streetNumber)) throw new Error('Ingresá un número de casa válido, por ejemplo 123 o 123A.');
  const apartment = typeof info?.apartment === 'string' ? info.apartment.trim() : '';
  if (apartment.length > 100) throw new Error('El departamento no puede superar los 100 caracteres.');
  const province = typeof info?.province === 'string' ? info.province.trim() : '';
  return { ...info, street, streetNumber, apartment, province, address: `${street} ${streetNumber}` };
}

export function shippingAddressLines(info = {}) {
  return [
    info.address || [info.street, info.streetNumber].filter(Boolean).join(' '),
    info.apartment && `Departamento: ${info.apartment}`,
    info.locality && `Localidad: ${info.locality}`,
    info.city && `Municipio: ${info.city}`,
    (info.province || info.state) && `Provincia: ${info.province || info.state}`,
    (info.postalCode || info.zipCode) && `Código postal: ${info.postalCode || info.zipCode}`,
  ].filter(Boolean);
}

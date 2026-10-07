export function normalizeShippingAddress(info) {
  const street = typeof info?.street === 'string' ? info.street.trim() : '';
  const streetNumber = typeof info?.streetNumber === 'string' ? info.streetNumber.trim() : '';
  if (!street) throw new Error('La calle es obligatoria.');
  if (!streetNumber) throw new Error('El número de la casa es obligatorio.');
  if (!/^\d+[a-zA-Z]?$/.test(streetNumber)) throw new Error('Ingresá un número de casa válido, por ejemplo 123 o 123A.');
  return { ...info, street, streetNumber, address: `${street} ${streetNumber}` };
}

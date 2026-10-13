import { normalizeMunicipality } from './municipalities';

// Service tariff supplied by the seller (TARIFAS 2025 - ACTUALIZADAS +).
// Names are matched only inside Buenos Aires; other provinces remain coordinated.
const groups = [
  [7000, 'Castelar|Haedo|Morón'],
  [7500, 'Aldo Bonzi|Caseros|Ciudad Evita|Ciudad Jardín|Ciudad Jardín Lomas del Palomar|Ciudadela|El Palomar|Francisco Álvarez|González Catán|Hurlingham|Isidro Casanova|Ituzaingó|La Reja|La Tablada|Laferrere|Gregorio de Laferrere|Libertad|Loma Hermosa|Lomas del Mirador|Martín Coronado|Merlo|Moreno|Pablo Podestá|Padua|San Antonio de Padua|Parque San Martín|Paso del Rey|Pontevedra|Rafael Castillo|Ramos Mejía|San Justo|Tapiales|Villa Luzuriaga|Villa Madero|Villa Eduardo Madero|Villa Sarmiento|Villa Tesei|Villa Udaondo|William C. Morris|William Morris|Williams Morris'],
  [9000, 'Béccar|Bella Vista|Billinghurst|Boulogne|Boulogne Sur Mer|Don Torcuato|Don Torcuato Este|Don Torcuato Oeste|El Talar|Florida|Florida Este|Florida Oeste|Grand Bourg|José C. Paz|José Clemente Paz|Los Polvorines|Martínez|Munro|Muñiz|Olivos|Pablo Nogués|Pablo Nogues|San Andrés|San Fernando|San Isidro|San Martín|General San Martín|San Miguel|Tortuguitas|Vicente López|Victoria|Villa Adelina|Villa Ballester|Villa Lynch|Villa Martelli|Adrogué|Avellaneda|Banfield|Bernal|Bernal Este|Bernal Oeste|Burzaco|Ezpeleta|Ezpeleta Este|Ezpeleta Oeste|Lanús|Lanús Este|Lanús Oeste|Llavallol|Lomas de Zamora|Monte Chingolo|Monte Grande|Quilmes|Quilmes Oeste|Sarandí|Temperley|Villa Domínico|Wilde'],
  [9500, 'Tigre'],
];
const tariffs = new Map(groups.flatMap(([price, names]) => names.split('|').map((name) => [normalizeMunicipality(name), { price, note: '' }])));
for (const name of ['Del Viso', 'Garín', 'Manuel Alberti']) {
  tariffs.set(normalizeMunicipality(name), { price: 10000, note: 'Entrega programada. Coordinaremos el día con vos.' });
}
tariffs.set(normalizeMunicipality('Mariano Acosta'), { price: 8500, note: 'Entrega programada. Coordinaremos el día con vos.' });
tariffs.set(normalizeMunicipality('José León Suárez'), { price: 9000, note: 'Entrega en punto de encuentro. Coordinaremos el lugar con vos.' });

const restrictions = new Map([
  ['Canning', 'Confirmaremos cobertura y costo según la dirección.'],
  ['Nordelta', 'Entrega programada; cobertura y costo a confirmar.'],
  ['Berazategui', 'El servicio cubre centro y oeste. Confirmaremos tu dirección y el costo.'],
  ['Florencio Varela', 'El servicio cubre Varela centro. Confirmaremos tu dirección y el costo.'],
  ['Ezeiza', 'Entrega programada en Ezeiza centro. Confirmaremos tu dirección y el costo.'],
  ['Marcos Paz', 'Entrega programada, sujeta a confirmar la dirección.'],
  ['Virrey del Pino', 'El servicio llega hasta el km 40. Confirmaremos tu dirección y el costo.'],
  ['Dique Luján', 'Entrega por coordinar con el vendedor.'],
  ['Glew', 'Entrega por coordinar con el vendedor.'],
  ['Longchamps', 'Entrega por coordinar con el vendedor.'],
].map(([name, note]) => [normalizeMunicipality(name), note]));

export function localityTariff(municipality, locality) {
  if (municipality.id === 'caba') return { price: 7500, note: '' };
  if (!municipality.id.startsWith('06')) return { price: null, note: '' };
  const name = normalizeMunicipality(locality.name);
  if (restrictions.has(name)) return { price: null, note: restrictions.get(name) };
  return tariffs.get(name) || { price: null, note: '' };
}

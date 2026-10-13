'use client';

import { useEffect, useRef, useState } from 'react';
import { loadMaps } from '@/lib/google-maps';
import { parseGoogleAddress } from '@/lib/google-address';

export default function AddressAutocomplete({ registration, onSelect, onEdit, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState('Escribí la calle y elegí una sugerencia, o completá los datos manualmente.');
  const generation = useRef(0);
  const timer = useRef(null);
  const token = useRef(null);
  useEffect(() => () => { generation.current++; clearTimeout(timer.current); }, []);

  const close = () => { generation.current++; clearTimeout(timer.current); setSuggestions([]); setActive(-1); };
  const choose = async (prediction) => {
    close();
    const request = generation.current;
    setMessage('Identificando dirección…');
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['addressComponents', 'location'] });
      token.current = null;
      const address = parseGoogleAddress(place);
      const response = await fetch('/api/address/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: address.lat, lng: address.lng, localityNames: address.localityNames }) });
      const result = await response.json();
      if (request !== generation.current) return;
      onSelect({ ...address, ...(response.ok ? result : { city: '', municipalityId: '', localityId: '' }) });
      setMessage(!response.ok ? result.error : !result.localityId ? 'Confirmá la localidad para calcular el envío.' : !address.streetNumber ? 'Completá el número de la casa y revisá los datos.' : 'Dirección seleccionada. Revisá los datos de entrega.');
    } catch (failure) {
      token.current = null;
      if (request === generation.current) setMessage(failure.message || 'Completá la dirección manualmente.');
    }
  };

  return <div className="relative">
    <input id="street" type="text" required autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls="address-suggestions" aria-activedescendant={active >= 0 ? `address-option-${active}` : undefined} aria-describedby="address-help" aria-invalid={!!error}
      placeholder="Ej.: Manuel Soler 1855, Libertad"
      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${error ? 'border-red-500' : 'border-gray-300'}`}
      {...registration}
      onChange={(event) => {
        registration.onChange(event); onEdit(); close();
        const input = event.target.value.trim();
        if (input.length < 3) return;
        const request = generation.current;
        timer.current = setTimeout(async () => {
          try {
            const maps = await loadMaps();
            const places = await maps.importLibrary('places');
            if (request !== generation.current) return;
            token.current ||= new places.AutocompleteSessionToken();
            const result = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input, includedRegionCodes: ['ar'], language: 'es', region: 'ar', sessionToken: token.current });
            if (request !== generation.current) return;
            const items = result.suggestions.map((item) => item.placePrediction).filter(Boolean);
            setSuggestions(items);
            setMessage(items.length ? 'Elegí tu dirección de la lista.' : 'Sin sugerencias. Podés completar los datos manualmente.');
          } catch {
            if (request === generation.current) setMessage('Sugerencias no disponibles. Completá los datos manualmente.');
          }
        }, 300);
      }}
      onBlur={(event) => { registration.onBlur(event); close(); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
        if (!suggestions.length) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length); }
        if (event.key === 'Enter') { event.preventDefault(); if (active >= 0) choose(suggestions[active]); }
      }} />
    {!!suggestions.length && <div className="absolute z-30 w-full border border-gray-300 bg-white shadow-sm">
      <ul id="address-suggestions" role="listbox" aria-label="Direcciones sugeridas" className="max-h-72 overflow-y-auto">
        {suggestions.map((prediction, index) => <li key={`${prediction.placeId}-${index}`} id={`address-option-${index}`} role="option" aria-selected={index === active} className={`cursor-pointer border-b border-gray-100 px-4 py-4 text-sm hover:bg-gray-50 ${index === active ? 'bg-gray-100' : ''}`} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(prediction)}>{prediction.text.toString()}</li>)}
      </ul>
      <div translate="no" className="px-4 py-2 text-right font-sans text-xs font-normal text-[#5e5e5e]">Google Maps</div>
    </div>}
    <p id="address-help" role="status" className="mt-2 text-xs text-gray-500">{message}</p>
  </div>;
}

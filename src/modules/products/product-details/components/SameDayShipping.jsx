'use client';

import React, { useState, useEffect } from 'react';

const SameDayShipping = () => {
  const [shippingInfo, setShippingInfo] = useState({
    canShipToday: false,
    deliveryText: '',
    isWeekend: false,
  });

  useEffect(() => {
    const calculateShipping = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado

      // Verificar si es fin de semana
      const isWeekend = currentDay === 0 || currentDay === 6;

      // Verificar si es antes del mediodía
      const isBeforeNoon = currentHour < 12;

      let deliveryText = '';
      let canShipToday = false;

      if (isWeekend) {
        // Si es fin de semana, calcular próximo día hábil
        const daysUntilMonday = currentDay === 0 ? 1 : 2; // Domingo: 1 día, Sábado: 2 días
        deliveryText = 'el próximo día hábil';
      } else if (isBeforeNoon) {
        // Si es día hábil y antes del mediodía, puede llegar hoy
        canShipToday = true;
        deliveryText = 'hoy mismo';
      } else {
        // Si es día hábil pero después del mediodía, llega mañana
        // A menos que mañana sea sábado (viernes tarde)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();

        if (tomorrowDay === 6) {
          // Mañana es sábado, entrega el lunes
          deliveryText = 'el lunes';
        } else if (tomorrowDay === 0) {
          // Mañana es domingo (esto no debería pasar, pero por si acaso)
          deliveryText = 'el lunes';
        } else {
          deliveryText = 'mañana';
        }
      }

      setShippingInfo({
        canShipToday,
        deliveryText,
        isWeekend,
      });
    };

    calculateShipping();
    // Actualizar cada minuto
    const interval = setInterval(calculateShipping, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 flex gap-3 items-start rounded-lg">
      <svg
        className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
      <div className="text-sm">
        <p className="font-semibold text-gray-900 mb-1">
          {shippingInfo.canShipToday ? 'Envío Same day' : 'Envío rápido'}
        </p>
        <p className="text-gray-600">
          Si vivís en CABA recibilo{' '}
          <span className="text-green-600 font-semibold">
            {shippingInfo.deliveryText}*
          </span>
        </p>
        {!shippingInfo.isWeekend && !shippingInfo.canShipToday && (
          <p className="text-xs text-gray-500 mt-1">
            Comprá antes del mediodía para{' '}
            <span className="text-green-600 font-semibold">
              envío el mismo día
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SameDayShipping;

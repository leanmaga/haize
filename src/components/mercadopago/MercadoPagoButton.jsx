// src/components/mercadopago/MercadoPagoButton.js
"use client";

import { useState, useEffect, useRef } from "react";

const MercadoPagoButton = ({
  preferenceId,
  fallbackUrl,
  buttonText = "Pagar con MercadoPago",
  className = "",
  onError = null,
  onLoad = null,
}) => {
  const [publicKey, setPublicKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const walletInitialized = useRef(false);

  // 1. Obtener la public key desde la API
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch("/api/mercadopago/public-key");
        const data = await response.json();

        if (response.ok) {
          setPublicKey(data.publicKey);
          onLoad?.(data);
        } else {
          console.error(
            "❌ MercadoPago: Error al obtener public key:",
            data.error
          );
          setError(data.message || data.error);
          onError?.(data.error);
        }
      } catch (err) {
        console.error("❌ MercadoPago: Error de conexión:", err);
        const errorMsg = "Error de conexión al obtener configuración de pagos";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicKey();
  }, [onError, onLoad]);

  // 2. Cargar script de MercadoPago cuando tengamos la public key
  useEffect(() => {
    if (!publicKey) return;

    const loadMercadoPagoScript = () => {
      // Verificar si el script ya existe
      if (document.getElementById("mercadopago-sdk")) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "mercadopago-sdk";
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;

      script.onload = () => {
        setScriptLoaded(true);
      };

      script.onerror = () => {
        console.error("❌ MercadoPago: Error al cargar SDK");
        setError("Error al cargar el sistema de pagos");
      };

      document.head.appendChild(script);
    };

    loadMercadoPagoScript();
  }, [publicKey]);

  // 3. Inicializar wallet cuando todo esté listo
  useEffect(() => {
    if (
      !scriptLoaded ||
      !publicKey ||
      !preferenceId ||
      walletInitialized.current
    ) {
      return;
    }

    try {
      // Limpiar contenedor anterior
      const container = document.getElementById("wallet_container");
      if (container) {
        container.innerHTML = "";
      }

      // Verificar que MercadoPago esté disponible
      if (typeof window.MercadoPago === "undefined") {
        throw new Error("MercadoPago SDK no está disponible");
      }

      // Inicializar MercadoPago
      const mp = new window.MercadoPago(publicKey);

      // Crear wallet
      const wallet = mp.bricks().create("wallet", "wallet_container", {
        initialization: {
          preferenceId: preferenceId,
        },
        customization: {
          texts: {
            valueProp: "smart_option",
          },
        },
      });

      walletInitialized.current = true;
    } catch (error) {
      console.error("❌ MercadoPago: Error al inicializar wallet:", error);
      setError("Error al inicializar el sistema de pagos");
    }
  }, [scriptLoaded, publicKey, preferenceId]);

  // 4. Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      walletInitialized.current = false;
    };
  }, []);

  // Renderizar estados

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center p-6 bg-gray-50 rounded-lg ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600">Cargando opciones de pago...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="text-red-800 mb-4">
          <strong>Error de configuración:</strong>
          <p className="text-sm mt-1">{error}</p>
        </div>

        {fallbackUrl && (
          <div className="space-y-3">
            <p className="text-red-700 text-sm">
              Intenta usar el botón alternativo o recarga la página.
            </p>
            <a
              href={fallbackUrl}
              target="_self"
              className="inline-block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
            >
              💳 {buttonText} (Alternativo)
            </a>
          </div>
        )}
      </div>
    );
  }

  // Success state - Mostrar el wallet
  return (
    <div className={`w-full ${className}`}>
      <div id="wallet_container" className="w-full"></div>

      {/* Botón de fallback por si el wallet no carga */}
      {fallbackUrl && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm mb-3">
            ¿Problemas con el botón? Usa el enlace directo:
          </p>
          <a
            href={fallbackUrl}
            target="_self"
            className="inline-block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
          >
            💳 {buttonText} (Alternativo)
          </a>
        </div>
      )}
    </div>
  );
};

export default MercadoPagoButton;

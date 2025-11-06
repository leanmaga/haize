import React, { useState } from 'react';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState('leanybrenda2017@gmail.com');
  const [selectedTest, setSelectedTest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  // ✅ TODOS LOS TIPOS AHORA HABILITADOS
  const emailTypes = [
    {
      id: 'test',
      name: 'Email de Prueba Básico',
      description: 'Email básico para verificar que el sistema funciona',
      icon: '🧪',
      recipient: 'Usuario',
    },
    {
      id: 'verification',
      name: 'Verificación de Cuenta',
      description: 'Email que recibe el usuario al registrarse',
      icon: '📧',
      recipient: 'Usuario',
    },
    {
      id: 'password-reset',
      name: 'Restablecimiento de Contraseña',
      description: 'Email para restablecer contraseña',
      icon: '🔐',
      recipient: 'Usuario',
    },
    {
      id: 'order-confirmation',
      name: 'Confirmación de Orden',
      description: 'Email que recibe el cliente al crear una orden',
      icon: '📦',
      recipient: 'Cliente',
    },
    {
      id: 'admin-order-notification',
      name: 'Notificación de Nueva Orden',
      description: 'Email que recibe el admin cuando hay una nueva orden',
      icon: '🚨',
      recipient: 'Admin',
    },
    {
      id: 'payment-confirmation',
      name: 'Confirmación de Pago',
      description: 'Email que recibe el cliente cuando se confirma el pago',
      icon: '✅',
      recipient: 'Cliente',
    },
    {
      id: 'admin-payment-notification',
      name: 'Notificación de Pago',
      description: 'Email que recibe el admin cuando se confirma un pago',
      icon: '💰',
      recipient: 'Admin',
    },
  ];

  const testEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({
        success: false,
        error: 'Error de conexión al servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async (emailType = selectedTest) => {
    if (!emailType || !testEmail) {
      setResults({
        success: false,
        error: 'Selecciona un tipo de email y una dirección de destino',
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      console.log('🧪 Enviando test email:', {
        action: emailType,
        to: testEmail,
      });

      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: emailType,
          to: testEmail,
        }),
      });

      const data = await response.json();

      console.log('📧 Respuesta del servidor:', data);

      // ✅ Adaptar la respuesta de la API
      const adaptedResult = {
        success: data.success,
        message: data.message,
        messageId: data.messageId,
        error: data.error,
      };

      setResults(adaptedResult);

      if (adaptedResult.success) {
        console.log(
          `✅ Email enviado exitosamente: ${emailType} → ${testEmail}`
        );
      } else {
        console.error(`❌ Error enviando email:`, adaptedResult.error);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setResults({
        success: false,
        error: 'Error de conexión al servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendAllTestEmails = async () => {
    if (!testEmail) {
      setResults({
        success: false,
        error: 'Ingresa una dirección de email',
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const emailType of emailTypes) {
      try {
        console.log(`📧 Enviando ${emailType.name}...`);

        const response = await fetch('/api/test-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: emailType.id,
            to: testEmail,
          }),
        });

        const data = await response.json();

        const success = data.success;
        const error = data.error;

        results.push({
          type: emailType.name,
          success: success,
          error: error,
          messageId: data.messageId,
        });

        if (success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Pausa entre emails para no saturar
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 segundos entre emails
      } catch (error) {
        console.error(`❌ Error enviando ${emailType.name}:`, error);
        results.push({
          type: emailType.name,
          success: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    setResults({
      success: errorCount === 0,
      message: `Enviados ${successCount} emails exitosamente. ${errorCount} errores.`,
      allResults: results,
      summary: {
        total: emailTypes.length,
        success: successCount,
        errors: errorCount,
      },
    });

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Test de Emails Completo
            </h1>
            <p className="text-gray-600">
              Prueba todos los tipos de emails del sistema HAIZE
            </p>
          </div>
        </div>

        {/* Test Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Configuración de Email
              </h3>
              <p className="text-sm text-gray-600">
                Verifica que la configuración de email esté funcionando
              </p>
            </div>
            <button
              onClick={testEmailConfig}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Verificando...' : 'Verificar Config'}
            </button>
          </div>

          {configStatus && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                configStatus.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center">
                {configStatus.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span
                  className={`text-sm font-medium ${
                    configStatus.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {configStatus.success
                    ? 'Configuración válida'
                    : 'Error en configuración'}
                </span>
              </div>
              {configStatus.error && (
                <p className="text-sm text-red-700 mt-1">
                  {configStatus.error}
                </p>
              )}
              {configStatus.suggestions && (
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                  {configStatus.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Testing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Probar Envío de Emails
        </h2>

        {/* Email Input */}
        <div className="mb-6">
          <label
            htmlFor="testEmail"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email de Destino
          </label>
          <input
            type="email"
            id="testEmail"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ejemplo@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Los emails de admin se envían automáticamente al admin
            configurado
          </p>
        </div>

        {/* Email Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Email a Probar
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTypes.map((type) => (
              <div
                key={type.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTest === type.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedTest(type.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {type.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        type.recipient === 'Admin'
                          ? 'bg-red-100 text-red-800'
                          : type.recipient === 'Cliente'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Para: {type.recipient}
                    </span>
                  </div>
                </div>
                {selectedTest === type.id && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Send Buttons */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => sendTestEmail()}
            disabled={isLoading || !selectedTest || !testEmail}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Probar Email Seleccionado
              </>
            )}
          </button>

          <button
            onClick={sendAllTestEmails}
            disabled={isLoading || !testEmail}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            {isLoading
              ? 'Enviando Todos...'
              : `Probar TODOS (${emailTypes.length})`}
          </button>

          {selectedTest && testEmail && (
            <div className="text-sm text-gray-600">
              Enviando{' '}
              <strong>
                {emailTypes.find((t) => t.id === selectedTest)?.name}
              </strong>{' '}
              a <strong>{testEmail}</strong>
            </div>
          )}
        </div>

        {/* Progress for bulk send */}
        {isLoading && results?.allResults && (
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (results.allResults.length / emailTypes.length) * 100
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Enviando... {results.allResults.length} de {emailTypes.length}
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div
            className={`p-4 rounded-lg border ${
              results.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {results.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3
                  className={`text-sm font-medium ${
                    results.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {results.success
                    ? '✅ Email(s) enviado(s) exitosamente'
                    : '❌ Error al enviar email(s)'}
                </h3>

                {results.message && (
                  <p
                    className={`text-sm mt-1 ${
                      results.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {results.message}
                  </p>
                )}

                {results.messageId && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>ID del mensaje:</strong> {results.messageId}
                  </p>
                )}

                {results.error && (
                  <p className="text-sm text-red-700 mt-1">
                    <strong>Error:</strong> {results.error}
                  </p>
                )}

                {/* Resultados detallados para "enviar todos" */}
                {results.allResults && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">
                      Detalle por tipo:
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {results.allResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs p-2 bg-white rounded border"
                        >
                          {result.success ? (
                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-3 w-3 text-red-500 mr-2 flex-shrink-0" />
                          )}
                          <span className="font-medium mr-2 min-w-0 flex-1">
                            {result.type}:
                          </span>
                          <span
                            className={`text-right ${
                              result.success ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {result.success
                              ? '✅ Enviado'
                              : `❌ ${result.error}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.summary && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {results.summary.total}
                        </div>
                        <div className="text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">
                          {results.summary.success}
                        </div>
                        <div className="text-gray-600">Exitosos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-red-600">
                          {results.summary.errors}
                        </div>
                        <div className="text-gray-600">Errores</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Información del Sistema de Emails
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">
                  📧 Tipos Disponibles:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Email de prueba básico</li>
                  <li>✅ Verificación de cuenta</li>
                  <li>✅ Restablecimiento de contraseña</li>
                  <li>✅ Confirmación de orden</li>
                  <li>✅ Notificación de orden (admin)</li>
                  <li>✅ Confirmación de pago</li>
                  <li>✅ Notificación de pago (admin)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">
                  ⚙️ Configuración:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    <strong>Gmail:</strong> Usar contraseña de aplicación
                  </li>
                  <li>
                    <strong>Variables:</strong> EMAIL_USER, EMAIL_PASS
                  </li>
                  <li>
                    <strong>Admin:</strong> Configurado automáticamente
                  </li>
                  <li>
                    <strong>Templates:</strong> Diseño responsive
                  </li>
                  <li>
                    <strong>Reintentos:</strong> 3 intentos automáticos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPanel;

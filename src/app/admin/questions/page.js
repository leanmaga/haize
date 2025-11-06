"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const AdminQuestionsPage = () => {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Refs para evitar polling excesivo
  const lastFetchRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const isActiveRef = useRef(true);

  // Función auxiliar para verificar si el usuario es admin
  const isUserAdmin = () => {
    return session?.user?.role === "admin";
  };

  // Función auxiliar para obtener el estado de auto-refresh
  const getAutoRefreshStatus = () => {
    if (!isActiveRef.current) return "Auto-refresh OFF";
    return pollingIntervalRef.current ? "Auto-refresh ON" : "Auto-refresh OFF";
  };

  // Función auxiliar para verificar si debería mostrar loading
  const shouldShowLoading = () => {
    return loading;
  };

  // Función auxiliar para verificar si hay preguntas filtradas
  const hasFilteredQuestions = (filteredQuestions) => {
    return filteredQuestions.length > 0;
  };

  // Función auxiliar para formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función auxiliar para validar respuesta
  const isResponseValid = (text) => {
    return text.trim().length >= 10;
  };

  // Función auxiliar para verificar si puede enviar respuesta
  const canSubmitResponse = () => {
    return !submitting && isResponseValid(responseText);
  };

  // Función auxiliar para obtener clases del botón de envío
  const getSubmitButtonClasses = () => {
    const baseClasses =
      "inline-flex items-center px-3 py-2 text-white text-sm font-medium rounded-md transition-colors";
    const disabledClasses = "disabled:bg-gray-400 disabled:cursor-not-allowed";
    return `${baseClasses} ${disabledClasses}`;
  };

  // Función auxiliar para obtener el estilo del botón de envío
  const getSubmitButtonStyle = () => {
    return {
      backgroundColor: canSubmitResponse() ? "#F6C343" : "#9ca3af",
    };
  };

  // Función auxiliar para renderizar el contenido del botón de envío
  const renderSubmitButtonContent = () => {
    if (submitting) {
      return (
        <>
          <div
            className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"
            aria-label="Enviando"
          ></div>
          Enviando...
        </>
      );
    }

    return (
      <>
        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
        Enviar Respuesta
      </>
    );
  };

  // Función separada para manejar el filtrado de preguntas
  const getFilteredQuestions = useCallback(() => {
    return questions.filter(
      (question) =>
        searchTerm === "" ||
        question.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  const fetchQuestions = useCallback(
    async (showLoading = true) => {
      const now = Date.now();
      if (now - lastFetchRef.current < 2000) return;

      lastFetchRef.current = now;
      if (!isUserAdmin()) return;

      try {
        if (showLoading) setLoading(true);

        const params = new URLSearchParams({
          status: filter,
          page: currentPage.toString(),
          limit: "10",
        });

        const response = await fetch(`/api/admin/questions?${params}`);
        const data = await response.json();

        if (data.success) {
          setQuestions(data.questions);
          setStats(data.stats);
          setTotalPages(data.pagination.total);
        } else {
          console.error("❌ Error en respuesta:", data);
          toast.error("Error al cargar preguntas");
        }
      } catch (error) {
        console.error("❌ Error fetching questions:", error);
        toast.error("Error al cargar preguntas");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [session, filter, currentPage]
  );

  useEffect(() => {
    if (isUserAdmin()) {
      fetchQuestions(true);
    }
  }, [session, filter, currentPage, fetchQuestions]);

  // Effect para polling automático (MUY REDUCIDO)
  useEffect(() => {
    if (!isUserAdmin()) return;

    // Limpiar intervalo anterior
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Solo hacer polling si hay preguntas pendientes Y la página está activa
    const shouldStartPolling = stats.pending > 0 && isActiveRef.current;

    if (shouldStartPolling) {
      pollingIntervalRef.current = setInterval(() => {
        const isPageVisible = document.visibilityState === "visible";
        if (isActiveRef.current && isPageVisible) {
          fetchQuestions(false); // Sin loading spinner
        }
      }, 30000); // 30 segundos
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [stats.pending, fetchQuestions, session?.user?.role]);

  // Effect para detectar cuando la página está activa/inactiva
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isActiveRef.current = false;
    };
  }, []);

  // Función optimizada para responder
  const handleRespond = async (questionId) => {
    if (!isResponseValid(responseText)) {
      toast.error("La respuesta debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${questionId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Respuesta enviada correctamente");
        setRespondingTo(null);
        setResponseText("");

        // Refrescar datos después de responder
        setTimeout(() => {
          fetchQuestions(false);
        }, 500);
      } else {
        console.error("❌ Error en respuesta:", data);
        toast.error(data.error || "Error al enviar respuesta");
      }
    } catch (error) {
      console.error("❌ Error responding:", error);
      toast.error("Error al enviar respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para cancelar respuesta
  const handleCancelResponse = () => {
    setRespondingTo(null);
    setResponseText("");
  };

  // Función para manejar eventos del mouse en botones
  const handleButtonMouseEvents = (e, isEnter, bgColor, hoverColor) => {
    if (canSubmitResponse()) {
      e.target.style.backgroundColor = isEnter ? hoverColor : bgColor;
    }
  };

  // Renderizar indicador de estado del sistema
  const renderSystemStatus = () => {
    const statusColor = isActiveRef.current ? "bg-green-500" : "bg-gray-400";

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        <output>{getAutoRefreshStatus()}</output>
      </div>
    );
  };

  // Renderizar loading spinner
  const renderLoadingSpinner = () => (
    <div className="text-center py-8">
      <output
        className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
        style={{
          borderColor: "#F6C343",
          borderTopColor: "transparent",
        }}
        aria-label="Cargando preguntas"
      ></output>
      <p className="mt-2 text-gray-600">Cargando preguntas...</p>
    </div>
  );

  // Renderizar mensaje vacío
  const renderEmptyMessage = () => (
    <div className="text-center py-8 text-gray-500">
      <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
      <p>No se encontraron preguntas con los filtros aplicados</p>
    </div>
  );

  // Renderizar formulario de respuesta
  const renderResponseForm = (questionId) => (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={`response-${questionId}`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tu respuesta:
        </label>
        <textarea
          id={`response-${questionId}`}
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
          placeholder="Escribe tu respuesta aquí..."
          onFocus={(e) => {
            e.target.style.borderColor = "#F6C343";
            e.target.style.boxShadow = `0 0 0 3px rgba(246, 195, 67, 0.1)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
            e.target.style.boxShadow = "none";
          }}
          aria-describedby={`response-help-${questionId}`}
          aria-invalid={!isResponseValid(responseText)}
        />
        <div
          id={`response-help-${questionId}`}
          className="text-xs text-gray-500 mt-1"
        >
          Mínimo 10 caracteres ({responseText.length}/10)
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleRespond(questionId)}
          disabled={!canSubmitResponse()}
          className={getSubmitButtonClasses()}
          style={getSubmitButtonStyle()}
          onMouseEnter={(e) =>
            handleButtonMouseEvents(e, true, "#F6C343", "#E5B63C")
          }
          onMouseLeave={(e) =>
            handleButtonMouseEvents(e, false, "#F6C343", "#E5B63C")
          }
          aria-describedby={`submit-help-${questionId}`}
        >
          {renderSubmitButtonContent()}
        </button>
        <output id={`submit-help-${questionId}`} className="sr-only">
          {submitting
            ? "Enviando respuesta"
            : !isResponseValid(responseText)
            ? "Necesitas escribir al menos 10 caracteres para enviar"
            : "Presiona para enviar tu respuesta"}
        </output>
        <button
          onClick={handleCancelResponse}
          className="px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
          aria-label="Cancelar respuesta"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  if (!isUserAdmin()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Acceso denegado. Solo administradores pueden ver esta página.
        </p>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="space-y-6">
      {/* Header y Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Preguntas
          </h1>
          {renderSystemStatus()}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800">Total Preguntas</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-sm text-orange-800">Pendientes Respuesta</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.answered}
            </div>
            <div className="text-sm text-green-800">Respondidas</div>
          </div>
        </div>

        {/* Controles de Filtro */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="search-questions" className="sr-only">
              Buscar preguntas, usuarios o productos
            </label>
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              id="search-questions"
              type="text"
              placeholder="Buscar preguntas, usuarios o productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
              onFocus={(e) => {
                e.target.style.borderColor = "#F6C343";
                e.target.style.boxShadow = `0 0 0 3px rgba(246, 195, 67, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Busca por texto en preguntas, nombres de usuario o títulos de
              productos
            </div>
          </div>

          <div>
            <label htmlFor="filter-questions" className="sr-only">
              Filtrar preguntas por estado
            </label>
            <select
              id="filter-questions"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2"
              onFocus={(e) => {
                e.target.style.borderColor = "#F6C343";
                e.target.style.boxShadow = `0 0 0 3px rgba(246, 195, 67, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
              aria-describedby="filter-help"
            >
              <option value="all">Todas las preguntas</option>
              <option value="pending">Pendientes respuesta</option>
              <option value="answered">Respondidas</option>
            </select>
            <div id="filter-help" className="sr-only">
              Filtra las preguntas por su estado de respuesta
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Preguntas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preguntas ({filteredQuestions.length})
          </h2>

          {shouldShowLoading() ? (
            renderLoadingSpinner()
          ) : !hasFilteredQuestions(filteredQuestions) ? (
            renderEmptyMessage()
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {/* Header de la pregunta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {question.user?.name || "Usuario eliminado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {question.user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(question.createdAt)}
                      </span>

                      {question.response ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Respondida
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información del producto */}
                  {question.product && (
                    <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={question.product.imageUrl || "/placeholder.jpg"}
                          alt={question.product.title || "Producto"}
                          fill
                          sizes="48px"
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {question.product.title || "Producto eliminado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Pregunta sobre este producto
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pregunta */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Pregunta:
                    </h4>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                      {question.comment}
                    </p>
                  </div>

                  {/* Respuesta existente o formulario */}
                  {question.response ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3">
                      <div className="flex items-center mb-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Tu respuesta:
                        </span>
                      </div>
                      <p className="text-green-800">{question.response}</p>
                      {question.responseDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Respondido el {formatDate(question.responseDate)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {respondingTo === question._id ? (
                        renderResponseForm(question._id)
                      ) : (
                        <button
                          onClick={() => setRespondingTo(question._id)}
                          className="inline-flex items-center px-3 py-2 text-white text-sm font-medium rounded-md transition-colors"
                          style={{ backgroundColor: "#F6C343" }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#E5B63C";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#F6C343";
                          }}
                          aria-label={`Responder pregunta de ${
                            question.user?.name || "usuario"
                          }`}
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                          Responder
                        </button>
                      )}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    ID: {question._id.slice(-6)} |
                    {question.verified && " Cliente verificado |"}
                    {question.helpful > 0 &&
                      ` ${question.helpful} votos útiles`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center items-center space-x-2 mt-6"
              aria-label="Paginación de preguntas"
            >
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Ir a página anterior"
              >
                Anterior
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = currentPage === page;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      isCurrentPage
                        ? "text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    style={isCurrentPage ? { backgroundColor: "#F6C343" } : {}}
                    aria-label={`Ir a página ${page}`}
                    aria-current={isCurrentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Ir a página siguiente"
              >
                Siguiente
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;

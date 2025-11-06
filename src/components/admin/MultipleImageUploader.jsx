import { useEffect, useRef, useState } from "react";
import {
  XCircleIcon,
  PhotoIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default function MultipleImageUploader({
  mainImage,
  additionalImages = [],
  onMainImageChange,
  onAddImage,
  onRemoveImage,
  colors = [],
  descriptions = false, // Para permitir descripciones en imágenes adicionales
}) {
  const mainWidgetRef = useRef(null);
  const addWidgetRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);

  // Inicializar widgets de Cloudinary
  useEffect(() => {
    if (typeof window === "undefined" || !window.cloudinary) {
      return;
    }

    try {
      // Widget para imagen principal
      if (!mainWidgetRef.current) {
        const config = {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: "PolleriaPatagonia",
          sources: ["local", "camera"],
          multiple: false,
          maxFiles: 1,
          folder: "ecommerce_products",
          language: "es",
          text: {
            es: {
              menu: {
                files: "Mis archivos",
                camera: "Cámara",
              },
              local: {
                browse: "Examinar",
                dd_title_single: "Arrastra y suelta una imagen aquí",
                drop_title_single: "Suelta un archivo para subir",
              },
              or: "O",
              back: "Atrás",
              close: "Cerrar",
              crop: {
                title: "Cortar",
                crop_btn: "Recortar",
                skip_btn: "Salir",
              },
            },
          },
          cropping: true,
          croppingAspectRatio: 0,
          croppingDefaultSelectionRatio: 0.8,
          croppingShowDimensions: true,
          croppingCoordinatesMode: "custom",
          showSkipCropButton: true,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxImageFileSize: 10000000,
          showAdvancedOptions: false,
          theme: "minimal",
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#4F46E5",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#4F46E5",
              action: "#339933",
              inactiveTabIcon: "#B3B3B3",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        };

        mainWidgetRef.current = window.cloudinary.createUploadWidget(
          config,
          (error, result) => {
            if (error) {
              console.error("❌ Error en imagen principal:", error);

              if (error.status === "Upload preset not found") {
                alert(
                  "Error: El upload preset 'PolleriaPatagonia' no existe. Verifica en tu dashboard de Cloudinary."
                );
              } else if (error.status === "Invalid cloud name") {
                alert(
                  "Error: Cloud name inválido. Verifica NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
                );
              } else {
                alert(
                  `Error al subir imagen: ${
                    error.statusText || error.message || "Error desconocido"
                  }`
                );
              }

              setIsLoading(false);
              return;
            }

            if (result.event === "success") {
              let imageUrl = result.info.secure_url;

              // Aplicar recorte si existe
              if (
                result.info.coordinates &&
                result.info.coordinates.custom &&
                result.info.coordinates.custom.length > 0
              ) {
                const coords = result.info.coordinates.custom[0];
                const transformation = `/c_crop,x_${coords[0]},y_${coords[1]},w_${coords[2]},h_${coords[3]}/`;
                imageUrl = imageUrl.replace(
                  "/upload/",
                  `/upload${transformation}`
                );
              }

              setMainImageError(false);
              setMainImageLoading(true);
              onMainImageChange(result.info, imageUrl);
            }

            if (result.event === "queues-start") {
              setIsLoading(true);
            }

            if (result.event === "queues-end") {
              setIsLoading(false);
            }
          }
        );
      }

      // Widget para imágenes adicionales
      if (!addWidgetRef.current) {
        addWidgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: "PolleriaPatagonia",
            sources: ["local", "camera"],
            multiple: false,
            maxFiles: 1,
            folder: "ecommerce_products",
            language: "es",
            cropping: true,
            croppingAspectRatio: 0,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxImageFileSize: 10000000,
            theme: "minimal",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Error en imagen adicional:", error);
              alert(
                `Error al subir imagen adicional: ${
                  error.statusText || error.message
                }`
              );
              setIsLoading(false);
              return;
            }

            if (result.event === "success") {
              let imageUrl = result.info.secure_url;

              // Aplicar recorte si existe
              if (
                result.info.coordinates &&
                result.info.coordinates.custom &&
                result.info.coordinates.custom.length > 0
              ) {
                const coords = result.info.coordinates.custom[0];
                const transformation = `/c_crop,x_${coords[0]},y_${coords[1]},w_${coords[2]},h_${coords[3]}/`;
                imageUrl = imageUrl.replace(
                  "/upload/",
                  `/upload${transformation}`
                );
              }

              onAddImage(
                result.info,
                imageUrl,
                selectedColor,
                selectedDescription
              );
              setSelectedColor("");
              setSelectedDescription("");
            }

            if (result.event === "queues-start") {
              setIsLoading(true);
            }

            if (result.event === "queues-end") {
              setIsLoading(false);
            }
          }
        );
      }
    } catch (initError) {
      console.error("❌ Error al inicializar widgets:", initError);
    }
  }, [onMainImageChange, onAddImage, selectedColor, selectedDescription]);

  const handleMainImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoading && mainWidgetRef.current) {
      try {
        mainWidgetRef.current.open();
      } catch (error) {
        console.error("❌ Error opening main widget:", error);
        alert(`Error al abrir el widget: ${error.message}`);
      }
    }
  };

  const handleAddImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoading && addWidgetRef.current) {
      try {
        addWidgetRef.current.open();
      } catch (error) {
        console.error("❌ Error opening add widget:", error);
        alert(`Error al abrir el widget: ${error.message}`);
      }
    }
  };

  const handleMainImageLoad = () => {
    setMainImageLoading(false);
    setMainImageError(false);
  };

  const handleMainImageError = () => {
    setMainImageLoading(false);
    setMainImageError(true);
  };

  useEffect(() => {
    if (mainImage) {
      setMainImageLoading(true);
      setMainImageError(false);
    }
  }, [mainImage]);

  return (
    <div className="space-y-6">
      {/* Imagen principal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">
            Imagen principal *
          </h3>
        </div>

        <div
          onClick={handleMainImageClick}
          className={`border-2 border-dashed rounded-lg p-4 w-full text-center relative transition-colors cursor-pointer ${
            isLoading
              ? "bg-gray-100 cursor-not-allowed border-gray-300"
              : "hover:bg-gray-50 border-gray-300 hover:border-indigo-400"
          }`}
        >
          {isLoading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>
            </div>
          ) : mainImage ? (
            <div className="relative">
              {mainImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {mainImageError ? (
                <div className="py-8 bg-red-50 rounded">
                  <svg
                    className="mx-auto h-12 w-12 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-red-600">
                    Error al cargar imagen
                  </p>
                  <p className="mt-1 text-xs text-red-500">
                    Haz clic para intentar de nuevo
                  </p>
                </div>
              ) : (
                <img
                  src={mainImage}
                  alt="Principal"
                  className={`mx-auto max-h-40 object-contain transition-opacity duration-300 ${
                    mainImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={handleMainImageLoad}
                  onError={handleMainImageError}
                />
              )}

              {!mainImageLoading && !mainImageError && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <span className="text-gray-700 opacity-0 hover:opacity-100 text-sm bg-white bg-opacity-90 px-3 py-1 rounded shadow">
                    Hacer clic para cambiar
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">
                Haz clic para subir y recortar la imagen principal
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WEBP hasta 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Imágenes adicionales */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Imágenes adicionales
        </h3>

        {additionalImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {additionalImages.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.imageUrl}
                  alt={`Adicional ${i + 1}`}
                  className="w-full h-32 object-cover rounded border"
                />
                {img.color && (
                  <span className="absolute top-2 left-2 bg-white px-2 py-1 text-xs rounded shadow">
                    {img.color}
                  </span>
                )}
                {img.description && (
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                    {img.description}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveImage(i);
                  }}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-red-100 transition opacity-0 group-hover:opacity-100"
                >
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border rounded p-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            {colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asociar a color (opcional)
                </label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Sin color específico</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {descriptions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la imagen (opcional)
                </label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: producto marinado, corte específico..."
                  value={selectedDescription}
                  onChange={(e) => setSelectedDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div
            onClick={handleAddImageClick}
            className={`border-2 border-dashed rounded-lg p-4 w-full text-center relative transition-colors cursor-pointer ${
              isLoading
                ? "bg-gray-100 cursor-not-allowed border-gray-300"
                : "hover:bg-gray-50 border-gray-300 hover:border-indigo-400"
            }`}
          >
            {isLoading ? (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>
              </div>
            ) : (
              <>
                <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">
                  Haz clic para subir y recortar imagen adicional
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG, WEBP hasta 10MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

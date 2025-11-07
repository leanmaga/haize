'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Dirección',
      content: 'Av. Santa Fe 2845, Recoleta, Buenos Aires',
    },
    {
      icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Teléfono',
      content: '+54 9 11 5234-8967',
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Horarios',
      content: 'Lunes a Sábado: 10:00 - 21:00\nDomingos: 12:00 - 20:00',
    },
  ];

  return (
    <div className="bg-black py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
            Contacta con
            <span className="text-yellow-500"> Haize</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Estamos aquí para ayudarte a encontrar el estilo perfecto que buscas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20">
          {/* Información de Contacto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 xl:order-1"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8">
              Información de contacto
            </h2>

            <div className="space-y-6 sm:space-y-8">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-4 sm:p-6 rounded-xl hover:bg-gray-900 transition-colors duration-300"
                >
                  <div className="mt-1 flex-shrink-0 text-yellow-500">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mapa de Google */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-1 xl:order-2"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8">
                Nuestra ubicación
              </h2>

              <div className="w-full h-80 sm:h-96 lg:h-[400px] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.5168446845237!2d-58.39668282347227!3d-34.59394687295509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf8c4c8c4f%3A0x9c8b1b1b5f5c1f5c!2sAv.%20Santa%20Fe%202845%2C%20C1425%20CABA%2C%20Argentina!5e0!3m2!1ses!2sar!4v1692123456789!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Haize"
                  className="w-full h-full"
                />
              </div>

              <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">
                  Cómo llegar
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Ubicados en pleno Recoleta sobre Av. Santa Fe. Fácil acceso en
                  transporte público (Subte D - Estación Callao) y con
                  estacionamiento disponible en la zona.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 lg:mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              ¿Necesitas asesoramiento personalizado?
            </h3>
            <p className="text-sm sm:text-base mb-4 opacity-90">
              Contáctanos por WhatsApp y te ayudaremos a encontrar tu look ideal
            </p>
            <Link
              href="https://wa.me/5491152348967?text=Hola%20Haize,%20quisiera%20información%20sobre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex
            items-center bg-black text-yellow-500 px-6 py-3 rounded-lg
            font-semibold hover:bg-gray-900 transition-colors duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chatear por WhatsApp
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

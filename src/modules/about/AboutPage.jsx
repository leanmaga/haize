'use client';
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from 'framer-motion';
import { Clock, Heart, Truck, Shield } from 'lucide-react';
import Image from 'next/image';
import imagenAbout from '../../../public/images/2.jpg';

const AnimatedCounter = ({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest)
  );

  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    // Suscribirse a cambios en "rounded" para obtener el valor en un useState
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayValue(v);
    });

    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      animate(motionValue, to, { duration, ease: 'easeOut' });
    }
  }, [isInView, hasAnimated, motionValue, to, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
};

// PropTypes para validación de propiedades
AnimatedCounter.propTypes = {
  from: PropTypes.number,
  to: PropTypes.number.isRequired,
  duration: PropTypes.number,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  decimals: PropTypes.number,
};

const features = [
  {
    id: 'calidad-premium',
    icon: <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />,
    title: 'Calidad Premium',
    description:
      'Carne vacuna fresca y pollos sin agua que no se achican al cocinar',
  },
  {
    id: 'elaboracion-diaria',
    icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />,
    title: 'Elaboración Diaria',
    description: 'Milanesas preparadas todos los días para máxima frescura',
  },
  {
    id: 'entrega-rapida',
    icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />,
    title: 'Entrega Rápida',
    description: 'Pedís por WhatsApp, entregamos en 24hs en tu zona',
  },
  {
    id: 'listo-usar',
    icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />,
    title: 'Listo para Usar',
    description: 'Separado y empaquetado, directo al freezer o a la sartén',
  },
];

const statsData = [
  {
    id: 'clientes-satisfechos',
    number: 500,
    label: 'Clientes satisfechos',
    suffix: '+',
    duration: 2.5,
  },
  {
    id: 'productos-frescos',
    number: 100,
    label: 'Productos frescos',
    suffix: '%',
    duration: 2,
  },
  {
    id: 'delivery-tiempo',
    number: 24,
    label: 'Máximo delivery',
    suffix: 'h',
    duration: 1.5,
  },
  {
    id: 'calificacion-google',
    number: 4.2,
    label: 'Calificación promedio en google',
    suffix: '⭐',
    decimals: 1,
    duration: 3,
  },
];

const AboutPage = () => {
  return (
    <section
      id="nosotros"
      className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contenido principal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Texto e información */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              type: 'spring',
              stiffness: 100,
            }}
            viewport={{ once: true, margin: '-100px' }}
            className="order-2 xl:order-1"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight"
            >
              Más tiempo para lo que importa
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="block sm:inline"
                style={{ color: '#F6C343' }}
              >
                {' '}
                Tu solución de comidas prácticas
              </motion.span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed"
            >
              ¿Llegás cansado del trabajo y no sabés qué cocinar? Nosotros lo
              resolvemos. Milanesas premium elaboradas diariamente, carnes
              frescas seleccionadas y todo listo para tu freezer. Solo calentás
              y disfrutás. Porque tu tiempo vale, y la calidad no se negocia. En
              HAIZE combinamos la calidad y el cuidado de los productos rurales
              con la eficiencia y rapidez que necesita la vida urbana. Cada día
              preparamos milanesas frescas y seleccionamos los mejores pollos
              para que tengas productos premium listos para tu freezer.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.6,
                        ease: 'easeOut',
                      },
                    },
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.2 },
                    }}
                    className="mt-1 flex-shrink-0"
                    style={{ color: '#F6C343' }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Imagen */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 1,
              ease: 'easeOut',
              type: 'spring',
              stiffness: 80,
            }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative order-1 xl:order-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square sm:aspect-[4/3] xl:aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl"
            >
              <Image
                src={imagenAbout}
                alt="Milanesas premium y productos frescos HAIZE"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </motion.div>

            {/* Elementos decorativos */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              animate={{
                scale: [1, 1.1, 1],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="hidden sm:block absolute -top-3 -right-3 lg:-top-4 lg:-right-4 w-16 h-16 lg:w-24 lg:h-24 rounded-full opacity-20"
              style={{ backgroundColor: '#F6C343' }}
            ></motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ scale: 1, rotate: -360 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: true }}
              animate={{
                scale: [1, 1.2, 1],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                },
              }}
              className="hidden sm:block absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 w-12 h-12 lg:w-16 lg:h-16 rounded-full opacity-30"
              style={{ backgroundColor: '#F6C343' }}
            ></motion.div>
          </motion.div>
        </div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mt-12 sm:mt-16 lg:mt-20"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {statsData.map((stat) => (
              <motion.div
                key={stat.id}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: 'easeOut',
                    },
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl text-center hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <motion.div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2"
                  style={{ color: '#F6C343' }}
                >
                  <AnimatedCounter
                    from={0}
                    to={stat.number}
                    suffix={stat.suffix}
                    duration={stat.duration}
                    decimals={stat.decimals || 0}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium leading-tight"
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPage;

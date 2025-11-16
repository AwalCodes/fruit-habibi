'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  TruckIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { useI18n } from '@/contexts/I18nContext';

// Luxury Hero Section with Middle Eastern Aesthetics
function LuxuryHero() {
  const { t } = useI18n();
  const [currentFruit, setCurrentFruit] = useState(0);
  const fruits = ['🥭', '🌴', '🍊', '💎', '👑'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFruit((prev) => (prev + 1) % fruits.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black overflow-hidden">
      {/* Ornate Middle Eastern Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-27.6 22.4-50 50-50v50h-50z'/%3E%3Cpath d='M50 50c0 27.6-22.4 50-50 50v-50h50z'/%3E%3Cpath d='M50 50c27.6 0 50-22.4 50-50H50v50z'/%3E%3Cpath d='M50 50c-27.6 0-50 22.4-50 50h50v-50z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Gemstone Effects */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-60"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full opacity-50"
        />
        <motion.div 
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-20 w-3 h-3 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full opacity-70"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          {/* Luxury Logo with Gemstone Effects */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12"
          >
            {/* Ornate Frame */}
            <div className="relative inline-block p-8 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-3xl border-2 border-yellow-400/30 backdrop-blur-sm">
              {/* Gemstone Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg"></div>
              
              {/* Main Logo */}
              <div className="flex items-center justify-center space-x-6">
                {/* Woman Portrait Placeholder with Gemstone Effects */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl shadow-2xl">
                    👩‍🌾
                  </div>
                  {/* Sparkle Effects */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1 text-yellow-300 text-lg"
                  >
                    ✨
                  </motion.div>
                </div>

                {/* Palm Tree */}
                <div className="relative">
                  <div className="text-6xl">🌴</div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 text-yellow-400 text-sm"
                  >
                    💎
                  </motion.div>
                </div>
              </div>

              {/* New Logo Component */}
              <div className="mt-8">
                <Logo size="xl" showText={true} href="/" />
              </div>

              {/* Arabic Text */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-yellow-400 text-lg font-bold mt-4"
              >
                امصب
              </motion.div>
            </div>

            {/* Brand Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4 drop-shadow-2xl"
              style={{
                textShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)'
              }}
            >
              {t('home.brandName')}
            </motion.h1>

            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl md:text-3xl text-yellow-200 mb-2 font-light tracking-wide"
            >
              {t('home.tagline')}
            </motion.div>
          </motion.div>

          {/* Main Tagline */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            {t('home.mainTagline')}
          </motion.p>

          {/* Animated Luxury Fruit Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mb-12 h-24 flex items-center justify-center"
          >
            <motion.div
              key={currentFruit}
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: -180 }}
              transition={{ duration: 0.8 }}
              className="text-8xl relative"
            >
              {fruits[currentFruit]}
              {/* Gemstone sparkles around fruit */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-yellow-400 text-xl"
              >
                ✨
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Luxury CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link href="/listings">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(251, 191, 36, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-all duration-300 flex items-center gap-4 overflow-hidden"
                style={{
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
                }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <SparklesIcon className="w-6 h-6" />
                {t('home.exploreGlobalHarvest')}
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/register">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group border-2 border-emerald-400 text-emerald-300 px-10 py-5 rounded-full font-bold text-xl hover:bg-emerald-400 hover:text-black transition-all duration-300 flex items-center gap-4 backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
                }}
              >
                <UserGroupIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {t('home.joinOurNetwork')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Luxury Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-12 border-2 border-yellow-400 rounded-full flex justify-center relative"
          style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
        >
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-4 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Enhanced Why Choose Us with Luxury Cards
function WhyChooseUs() {
  const { t } = useI18n();
  const features = [
    {
      icon: TruckIcon,
      title: t('home.globalShipping'),
      description: t('home.globalShippingDesc'),
      animation: "🚛",
      gemColor: "yellow"
    },
    {
      icon: UserGroupIcon,
      title: t('home.directFarmerToBuyer'),
      description: t('home.directFarmerToBuyerDesc'),
      animation: "🤝",
      gemColor: "emerald"
    },
    {
      icon: GlobeAltIcon,
      title: t('home.trustedExporterNetwork'),
      description: t('home.trustedExporterNetworkDesc'),
      animation: "🌍",
      gemColor: "yellow"
    },
    {
      icon: HeartIcon,
      title: t('home.sustainability'),
      description: t('home.sustainabilityDesc'),
      animation: "🌱",
      gemColor: "emerald"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-800 relative overflow-hidden">
      {/* Ornate Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='80' cy='0' r='2'/%3E%3Ccircle cx='0' cy='80' r='2'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            {t('home.whyFruitHabibi')}
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            {t('home.whyFruitHabibiDesc')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: `0 20px 40px rgba(${feature.gemColor === 'yellow' ? '251, 191, 36' : '16, 185, 129'}, 0.3)`
              }}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
            >
              {/* Gemstone Corner Decorations */}
              <div className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-${feature.gemColor}-400 to-${feature.gemColor}-600 rounded-full shadow-lg`}></div>
              
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300"
                >
                  {feature.animation}
                </motion.div>
                
                <feature.icon className={`w-14 h-14 text-${feature.gemColor}-400 mx-auto mb-6 group-hover:text-${feature.gemColor}-300 transition-colors`} />
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-emerald-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Sparkle Effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                className="absolute top-2 left-2 text-yellow-400 text-lg"
              >
                ✨
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced Customer Reviews with Luxury Styling
function CustomerReviews() {
  const { t } = useI18n();
  const reviews = [
    {
      name: t('reviews.ahmedAlRashid'),
      role: t('reviews.ahmedRole'),
      rating: 5,
      text: t('reviews.ahmedReview'),
      gem: "💎"
    },
    {
      name: t('reviews.mariaSantos'),
      role: t('reviews.mariaRole'),
      rating: 5,
      text: t('reviews.mariaReview'),
      gem: "👑"
    },
    {
      name: t('reviews.omarHassan'),
      role: t('reviews.omarRole'),
      rating: 5,
      text: t('reviews.omarReview'),
      gem: "✨"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-black via-slate-900 to-emerald-900 relative overflow-hidden">
      {/* Floating Luxury Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 text-6xl opacity-10"
        >
          💎
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 text-5xl opacity-10"
        >
          👑
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            {t('home.voicesOfTrust')}
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            {t('home.voicesOfTrustDesc')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(251, 191, 36, 0.2)"
              }}
              className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
            >
              {/* Gemstone Badge */}
              <div className="absolute -top-3 -right-3 text-3xl">
                {review.gem}
              </div>

              <div className="flex items-center mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <StarIcon className="w-6 h-6 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>

              <p className="text-white text-lg mb-8 leading-relaxed font-light">
                "{review.text}"
              </p>

              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-black font-bold text-xl">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">{review.name}</h4>
                  <p className="text-yellow-300">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced Product Showcase with Luxury Styling
function ProductShowcase() {
  const { t } = useI18n();
  const products = [
    { name: t('products.royalDates'), emoji: "🌴", origin: t('productShowcase.saudiArabia'), price: "$12/kg", gem: "💎", special: true },
    { name: t('products.royalMangoes'), emoji: "🥭", origin: t('productShowcase.pakistan'), price: "$8/kg", gem: "👑", special: false },
    { name: t('products.goldenCitrus'), emoji: "🍊", origin: t('productShowcase.egypt'), price: "$6/kg", gem: "✨", special: false },
    { name: t('products.rubyPomegranates'), emoji: "🍎", origin: t('productShowcase.turkey'), price: "$15/kg", gem: "💎", special: true }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-emerald-900 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            {t('home.globalHarvest')}
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            {t('home.globalHarvestDesc')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)"
              }}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 overflow-hidden"
            >
              {/* Gemstone Badge */}
              <div className="absolute top-4 right-4 text-2xl">
                {product.gem}
              </div>

              {/* Special Deal Badge */}
              {product.special && (
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold"
                >
                  {t('products.specialDeal')}
                </motion.div>
              )}

              <div className="text-center">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-9xl mb-6 group-hover:scale-110 transition-transform duration-300"
                >
                  {product.emoji}
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-emerald-300 mb-3">{product.origin}</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {product.price}
                </p>
              </div>

              {/* Sparkle Effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                className="absolute bottom-2 right-2 text-yellow-400 text-lg"
              >
                ✨
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/listings">
            <motion.button 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-4 mx-auto"
            >
              <SparklesIcon className="w-6 h-6" />
              {t('home.exploreAllProducts')}
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Enhanced Solutions Section
function SolutionsSection() {
  const { t } = useI18n();
  const solutions = [
    {
      icon: TruckIcon,
      title: t('home.globalShipping'),
      description: t('home.globalShippingDesc'),
      animation: "🚢",
      gem: "💎"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('home.luxuryMarketplace'),
      description: t('home.luxuryMarketplaceDesc'),
      animation: "💬",
      gem: "👑"
    },
    {
      icon: UserGroupIcon,
      title: t('home.exclusiveExporterNetwork'),
      description: t('home.exclusiveExporterNetworkDesc'),
      animation: "🤝",
      gem: "✨"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 via-slate-900 to-black relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Cpath d='M60 60c0-33.1 26.9-60 60-60v60h-60z'/%3E%3Cpath d='M60 60c0 33.1-26.9 60-60 60v-60h60z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            {t('home.ourGlobalSolutions')}
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            {t('home.ourGlobalSolutionsDesc')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(251, 191, 36, 0.2)"
              }}
              className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
            >
              {/* Gemstone Badge */}
              <div className="absolute -top-3 -right-3 text-3xl">
                {solution.gem}
              </div>

              <div className="text-center">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  {solution.animation}
                </motion.div>

                <solution.icon className="w-14 h-14 text-yellow-400 mx-auto mb-6" />
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {solution.title}
                </h3>
                <p className="text-emerald-100 leading-relaxed">
                  {solution.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced Trust & Security Section
function TrustSecurity() {
  const { t } = useI18n();
  const trustFeatures = [
    { 
      icon: ShieldCheckIcon, 
      title: t('home.bankGradeSecurity'), 
      description: t('home.bankGradeSecurityDesc'),
      gem: "🛡️"
    },
    { 
      icon: UserGroupIcon, 
      title: t('home.verifiedGlobalExporters'), 
      description: t('home.verifiedGlobalExportersDesc'),
      gem: "👑"
    },
    { 
      icon: HeartIcon, 
      title: t('home.buyerProtection'), 
      description: t('home.buyerProtectionDesc'),
      gem: "💎"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-emerald-900 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            {t('home.trustSecurity')}
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            {t('home.trustSecurityDesc')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
              }}
              className="text-center relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300"
            >
              {/* Gemstone Badge */}
              <div className="absolute -top-3 -right-3 text-3xl">
                {feature.gem}
              </div>

              <feature.icon className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-emerald-100 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced Final CTA Section
function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="py-24 bg-gradient-to-br from-black via-slate-900 to-emerald-900 relative overflow-hidden">
      {/* Luxury Animated Background */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 text-8xl opacity-10"
        >
          💎
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 text-7xl opacity-10"
        >
          👑
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
            rotate: [0, -360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 text-6xl opacity-10"
        >
          ✨
        </motion.div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            {t('home.joinToday')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl">
              {t('home.tasteWorld')}
            </span>
          </h2>
          
          <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.experienceLuxury')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-12">
            <Link href="/register">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(251, 191, 36, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-14 py-7 rounded-full font-bold text-2xl shadow-2xl transition-all duration-300 flex items-center gap-4 overflow-hidden"
                style={{
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                  boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)'
                }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <SparklesIcon className="w-8 h-8" />
                {t('home.startGlobalJourney')}
                <ArrowRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/listings">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(16, 185, 129, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group border-2 border-emerald-400 text-emerald-300 px-14 py-7 rounded-full font-bold text-2xl hover:bg-emerald-400 hover:text-black transition-all duration-300 flex items-center gap-4 backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
                }}
              >
                <GlobeAltIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                {t('home.browseAllProducts')}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <LuxuryHero />
      <WhyChooseUs />
      <CustomerReviews />
      <ProductShowcase />
      <SolutionsSection />
      <TrustSecurity />
      <FinalCTA />
    </div>
  );
}
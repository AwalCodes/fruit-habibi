'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-40"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full opacity-50"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg">
            About Fruit Habibi
          </h1>
          <p className="text-2xl text-emerald-100 leading-relaxed max-w-4xl mx-auto">
            Connecting the world's finest growers with trusted buyers across borders, 
            building a sustainable future for global agricultural trade.
          </p>
        </motion.div>

        {/* Our Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-yellow-400/20 p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🌱</span>
                  <h2 className="text-4xl font-bold text-white">Our Story</h2>
                </div>
                <p className="text-emerald-100 text-lg leading-relaxed mb-6">
                  Founded with a vision to revolutionize the global fruits and vegetables trade, 
                  Fruit Habibi emerged from the understanding that quality produce deserves quality connections.
                </p>
                <p className="text-emerald-100 text-lg leading-relaxed mb-6">
                  We bridge the gap between passionate growers who cultivate the earth's finest harvest 
                  and discerning buyers who value excellence, sustainability, and authentic partnerships.
                </p>
                <p className="text-emerald-100 text-lg leading-relaxed">
                  Today, we're proud to facilitate thousands of successful trades, 
                  supporting agricultural communities while delivering exceptional produce worldwide.
                </p>
              </div>
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-emerald-800/30 to-yellow-600/30 rounded-2xl p-8 text-center"
                >
                  <div className="text-8xl mb-4">🌍</div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-2">Global Reach</h3>
                  <p className="text-emerald-200">Connecting continents through quality produce</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Our Mission & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-yellow-400/20 p-10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎯</span>
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-emerald-100 text-lg leading-relaxed mb-6">
              To create a transparent, efficient, and sustainable marketplace that empowers 
              agricultural producers and connects them with buyers who appreciate quality.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400">✨</span>
                <span className="text-emerald-200">Facilitate fair trade partnerships</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400">🌿</span>
                <span className="text-emerald-200">Promote sustainable agriculture</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400">🤝</span>
                <span className="text-emerald-200">Build lasting business relationships</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-yellow-400/20 p-10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💎</span>
              <h2 className="text-3xl font-bold text-white">Our Values</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-300 mb-2">Quality First</h3>
                <p className="text-emerald-100">We believe exceptional produce deserves exceptional service.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-300 mb-2">Trust & Transparency</h3>
                <p className="text-emerald-100">Building relationships through honest communication and reliable service.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-300 mb-2">Global Community</h3>
                <p className="text-emerald-100">Celebrating diversity while fostering international collaboration.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* What We Offer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Comprehensive solutions for the modern agricultural marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-8 text-center shadow-xl hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-6xl mb-4">🚚</div>
              <h3 className="text-2xl font-bold text-white mb-4">Logistics Excellence</h3>
              <p className="text-emerald-100 leading-relaxed">
                Seamless shipping solutions ensuring your produce reaches its destination fresh and on time.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-8 text-center shadow-xl hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-4">Direct Communication</h3>
              <p className="text-emerald-100 leading-relaxed">
                Connect directly with verified suppliers and buyers through our secure messaging platform.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-8 text-center shadow-xl hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Trusted Network</h3>
              <p className="text-emerald-100 leading-relaxed">
                Join a curated community of verified exporters and buyers committed to quality and reliability.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-yellow-400/20 p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Whether you're a grower looking to expand your reach or a buyer seeking quality produce, 
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-3 justify-center"
              >
                <span className="text-xl">🌟</span>
                Get Started Today
              </Link>
              <Link
                href="/listings"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full font-bold hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-3 justify-center"
              >
                <span className="text-xl">🍎</span>
                Browse Listings
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const navigation = [
    { name: 'Browse Listings', href: '/listings' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' },
    { name: 'Notifications', href: '/notifications' },
    { name: 'Profile', href: '/profile' },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Listings', href: '/admin/listings' },
    { name: 'Messages', href: '/admin/messages' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-emerald-900 to-black shadow-2xl border-b border-yellow-400/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300">
                Fruit Habibi
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-emerald-100 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Navigation */}
                {loading ? (
                  <div className="flex items-center space-x-1 border-r border-gray-200 pr-4 mr-2">
                    <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ) : user.user_metadata?.role === 'admin' && (
                  <div className="flex items-center space-x-1 border-r border-gray-200 pr-4 mr-2">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Admin</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Notifications */}
                <NotificationBell />
                
                {/* Regular User Navigation */}
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-emerald-100 hover:text-yellow-300 transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={signOut}
                  className="rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 text-sm font-medium text-black hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-emerald-100 hover:text-yellow-300 transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 text-sm font-medium text-black hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-emerald-100 hover:bg-emerald-800/50 hover:text-yellow-300 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gradient-to-b from-emerald-900 to-slate-900 border-t border-yellow-400/20">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-emerald-100 hover:border-yellow-400 hover:bg-emerald-800/30 hover:text-yellow-300 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-yellow-400/20 pb-3 pt-4">
            {user ? (
              <div className="space-y-1">
                {/* Admin Navigation */}
                {user.user_metadata?.role === 'admin' && (
                  <>
                    <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 mx-3 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Panel</span>
                      </div>
                    </div>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-6 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}
                
                {/* Regular User Navigation */}
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-emerald-100 hover:text-yellow-300 hover:bg-emerald-800/30 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={signOut}
                  className="block w-full px-3 py-2 text-left text-base font-medium text-emerald-100 hover:text-yellow-300 hover:bg-emerald-800/30 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-emerald-100 hover:text-yellow-300 hover:bg-emerald-800/30 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-base font-medium text-yellow-400 hover:text-yellow-300 hover:bg-emerald-800/30 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

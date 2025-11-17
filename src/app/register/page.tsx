'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

function RegisterForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'importer',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set role from URL parameter
  const roleParam = searchParams?.get('role');
  if (roleParam && (roleParam === 'farmer' || roleParam === 'importer')) {
    formData.role = roleParam;
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError(t('auth.fullNameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('auth.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('auth.validEmail'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return false;
    }
    if (!formData.country.trim()) {
      setError(t('auth.countryRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.role, formData.country);
      router.push('/dashboard');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('auth.registrationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            {t('auth.createAccountTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            {t('auth.joinAs')} {formData.role === 'farmer' ? t('auth.farmerExporter') : t('auth.importerDistributor')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-400/30 p-4">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-emerald-200">
                {t('auth.fullName')}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 placeholder-emerald-300 text-white rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
                placeholder={t('auth.enterFullName')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-200">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 placeholder-emerald-300 text-white rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-emerald-200">
                {t('auth.accountType')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              >
                <option value="farmer">{t('auth.farmerExporter')}</option>
                <option value="importer">{t('auth.importerDistributor')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-emerald-200">
                {t('auth.country')}
              </label>
              <input
                id="country"
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 placeholder-emerald-300 text-white rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
                placeholder={t('auth.enterCountry')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-200">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 placeholder-emerald-300 text-white rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
                placeholder={t('auth.createPassword')}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-200">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 placeholder-emerald-300 text-white rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-emerald-200">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/login" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                {t('auth.signInLink')}
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black flex items-center justify-center"><div className="text-emerald-200">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}

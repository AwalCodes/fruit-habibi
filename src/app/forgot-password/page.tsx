'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage(t('forgotPassword.passwordResetEmailSent'));
    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <EnvelopeIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t('forgotPassword.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              {t('forgotPassword.emailAddress')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              placeholder={t('forgotPassword.enterEmailAddress')}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="group relative flex w-full justify-center rounded-md bg-primary py-2 px-3 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('forgotPassword.sending') : t('forgotPassword.sendResetEmail')}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="flex items-center justify-center text-sm text-primary hover:text-primary-dark"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              {t('forgotPassword.backToSignIn')}
            </Link>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('auth.dontHaveAccount')}{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
              {t('forgotPassword.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

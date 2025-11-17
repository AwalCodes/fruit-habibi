'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import VerificationDashboard from '@/components/VerificationDashboard';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'farmer' | 'importer' | 'admin';
  country: string;
  created_at: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [editData, setEditData] = useState({
    full_name: '',
    country: '',
  });
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditData({
        full_name: data.full_name,
        country: data.country,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(t('profile.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      full_name: profile?.full_name || '',
      country: profile?.country || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editData.full_name,
          country: editData.country,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: editData.full_name,
        country: editData.country,
      } : null);

      setEditing(false);
      setSuccess(t('profile.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(t('profile.failedToUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'farmer': return t('profile.farmerExporter');
      case 'importer': return t('profile.importerDistributor');
      case 'admin': return t('profile.administrator');
      default: return role;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black flex items-center justify-center">
        <div className="text-lg text-emerald-200">{t('profile.loadingProfile')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{t('profile.title')}</h1>
          <p className="mt-2 text-emerald-200">{t('profile.subtitle')}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-10 w-10 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-medium text-white">{t('profile.personalInformation')}</h2>
                  <p className="text-sm text-emerald-200">{t('profile.accountDetails')}</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-yellow-400/30 shadow-sm text-sm leading-4 font-medium rounded-lg text-yellow-400 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {t('profile.editProfile')}
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-400/30 rounded-lg p-4">
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-emerald-900/30 border border-emerald-400/30 rounded-lg p-4">
                <div className="text-emerald-300 text-sm">{success}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-emerald-200">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={editData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-emerald-300 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="mt-1 text-sm text-white">{profile?.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-emerald-200">
                  {t('profile.emailAddress')}
                </label>
                <p className="mt-1 text-sm text-white">{profile?.email}</p>
                <p className="mt-1 text-xs text-emerald-300">{t('profile.emailCannotBeChanged')}</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-emerald-200">
                  {t('profile.accountType')}
                </label>
                <p className="mt-1 text-sm text-white">{profile ? getRoleDisplayName(profile.role) : ''}</p>
                <p className="mt-1 text-xs text-emerald-300">{t('profile.roleCannotBeChanged')}</p>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-emerald-200">
                  {t('profile.country')}
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={editData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-emerald-300 sm:text-sm"
                    placeholder={t('profile.enterCountry')}
                  />
                ) : (
                  <p className="mt-1 text-sm text-white">{profile?.country}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-emerald-200">
                  {t('profile.memberSince')}
                </label>
                <p className="mt-1 text-sm text-white">{profile ? formatDate(profile.created_at) : ''}</p>
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-slate-600 shadow-sm text-sm font-medium rounded-lg text-emerald-200 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-300"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {saving ? t('profile.saving') : t('profile.saveChanges')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Verification */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white">{t('profile.accountVerification')}</h2>
                <p className="text-sm text-emerald-200">{t('profile.buildTrust')}</p>
              </div>
              <button
                onClick={() => setShowVerification(true)}
                className="inline-flex items-center px-4 py-2 border border-emerald-400/30 shadow-sm text-sm leading-4 font-medium rounded-lg text-emerald-400 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-300"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                {t('profile.verifyAccount')}
              </button>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white">{t('profile.emailVerified')}</h3>
                </div>
                <p className="text-xs text-emerald-300">{t('profile.secureAccount')}</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white">{t('profile.phoneVerified')}</h3>
                </div>
                <p className="text-xs text-emerald-300">{t('profile.enhancedSecurity')}</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white">{t('profile.idVerified')}</h3>
                </div>
                <p className="text-xs text-emerald-300">{t('profile.fullVerification')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-medium text-white">{t('profile.accountActions')}</h2>
            <p className="text-sm text-emerald-200">{t('profile.manageAccountSecurity')}</p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{t('profile.changePassword')}</h3>
                  <p className="text-sm text-emerald-200">{t('profile.updateAccountPassword')}</p>
                </div>
                <button
                  onClick={() => router.push('/change-password')}
                  className="inline-flex items-center px-4 py-2 border border-yellow-400/30 shadow-sm text-sm leading-4 font-medium rounded-lg text-yellow-400 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300"
                >
                  {t('profile.changePassword')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Dashboard Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <VerificationDashboard onClose={() => setShowVerification(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

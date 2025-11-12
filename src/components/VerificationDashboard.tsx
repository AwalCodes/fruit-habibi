'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { verificationService, UserVerification, VerificationDocument } from '@/lib/verification';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface VerificationDashboardProps {
  onClose?: () => void;
}

export default function VerificationDashboard({ onClose }: VerificationDashboardProps) {
  const { user } = useAuth();
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [verificationResult, documentsResult] = await Promise.all([
        verificationService.getUserVerification(user.id),
        verificationService.getVerificationDocuments(user.id)
      ]);

      if (verificationResult.data) {
        setVerification(verificationResult.data);
      }
      if (documentsResult.data) {
        setDocuments(documentsResult.data);
      }
    } catch (error) {
      console.error('Error loading verification data:', error);
      setMessage({ type: 'error', text: 'Failed to load verification data' });
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    if (!user?.email) return;

    setSendingCode(true);
    setMessage(null);
    try {
      const result = await verificationService.sendEmailVerificationCode(user.email, user.id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Verification code sent to your email' });
        setShowEmailVerification(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification code' });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyEmailCode = async () => {
    if (!user?.email || !emailCode) return;

    setSendingCode(true);
    setMessage(null);
    try {
      const result = await verificationService.verifyEmailCode(user.email, emailCode, user.id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Email verified successfully!' });
        setShowEmailVerification(false);
        setEmailCode('');
        loadVerificationData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Invalid verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verification failed' });
    } finally {
      setSendingCode(false);
    }
  };

  const sendPhoneVerification = async () => {
    if (!user || !phoneNumber) return;

    setSendingCode(true);
    setMessage(null);
    try {
      const result = await verificationService.sendPhoneVerificationCode(phoneNumber, user.id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Verification code sent to your phone' });
        setShowPhoneVerification(true);
        setShowPhoneInput(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification code' });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyPhoneCode = async () => {
    if (!user || !phoneNumber || !phoneCode) return;

    setSendingCode(true);
    setMessage(null);
    try {
      const result = await verificationService.verifyPhoneCode(phoneNumber, phoneCode, user.id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Phone verified successfully!' });
        setShowPhoneVerification(false);
        setPhoneCode('');
        setPhoneNumber('');
        loadVerificationData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Invalid verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verification failed' });
    } finally {
      setSendingCode(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_verified':
      case 'email_verified':
      case 'phone_verified':
      case 'id_verified':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'unverified':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_verified':
        return 'text-green-400';
      case 'email_verified':
      case 'phone_verified':
      case 'id_verified':
        return 'text-blue-400';
      case 'unverified':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'text-purple-400';
      case 'premium':
        return 'text-yellow-400';
      case 'verified':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-emerald-200"
        >
          Loading verification status...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Account Verification
                </h1>
                <p className="text-emerald-200">Build trust and unlock premium features</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-emerald-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>

        {/* Verification Status Overview */}
        {verification && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Overall Status */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(verification.verification_status)}
                <h3 className="text-xl font-semibold text-white">Verification Status</h3>
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(verification.verification_status)} mb-2`}>
                {verification.verification_status.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-emerald-300 text-sm">
                {verification.verification_status === 'fully_verified' 
                  ? 'All verifications complete' 
                  : 'Complete verification steps to unlock features'}
              </p>
            </div>

            {/* Trust Score */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold text-white">Trust Score</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400 mb-2">
                {verification.trust_score.toFixed(0)}/100
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${verification.trust_score}%` }}
                ></div>
              </div>
              <p className="text-emerald-300 text-sm">
                Based on your activity and verification level
              </p>
            </div>

            {/* Seller Tier */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BuildingOfficeIcon className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-semibold text-white">Seller Tier</h3>
              </div>
              <p className={`text-2xl font-bold ${getTierColor(verification.seller_tier)} mb-2`}>
                {verification.seller_tier.toUpperCase()}
              </p>
              <p className="text-emerald-300 text-sm">
                {verification.seller_tier === 'enterprise' 
                  ? 'Highest tier with all benefits' 
                  : 'Upgrade with more verifications'}
              </p>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg flex items-center gap-3 border mb-6 ${
              message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Verification Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Verification */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <EnvelopeIcon className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Email Verification</h3>
              {verification?.email_verified_at && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {verification?.email_verified_at ? (
              <div className="text-emerald-300">
                <p className="text-sm">Verified on {new Date(verification.email_verified_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-emerald-200 text-sm">
                  Verify your email address to secure your account
                </p>
                
                {!showEmailVerification ? (
                  <button
                    onClick={sendEmailVerification}
                    disabled={sendingCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sendingCode ? 'Sending...' : 'Send Verification Code'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={verifyEmailCode}
                        disabled={sendingCode || emailCode.length !== 6}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sendingCode ? 'Verifying...' : 'Verify Code'}
                      </button>
                      <button
                        onClick={() => setShowEmailVerification(false)}
                        className="px-4 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phone Verification */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PhoneIcon className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">Phone Verification</h3>
              {verification?.phone_verified_at && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {verification?.phone_verified_at ? (
              <div className="text-emerald-300">
                <p className="text-sm">Verified on {new Date(verification.phone_verified_at).toLocaleDateString()}</p>
                <p className="text-sm">Phone: {verification.phone_number}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-emerald-200 text-sm">
                  Verify your phone number for enhanced security
                </p>
                
                {!showPhoneInput && !showPhoneVerification ? (
                  <button
                    onClick={() => setShowPhoneInput(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
                  >
                    Verify Phone Number
                  </button>
                ) : showPhoneInput ? (
                  <div className="space-y-4">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number (e.g., +1234567890)"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={sendPhoneVerification}
                        disabled={sendingCode || !phoneNumber}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sendingCode ? 'Sending...' : 'Send Code'}
                      </button>
                      <button
                        onClick={() => setShowPhoneInput(false)}
                        className="px-4 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={verifyPhoneCode}
                        disabled={sendingCode || phoneCode.length !== 6}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sendingCode ? 'Verifying...' : 'Verify Code'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPhoneVerification(false);
                          setShowPhoneInput(true);
                        }}
                        className="px-4 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Verification */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold text-white">Identity Verification</h3>
          </div>
          
          <p className="text-emerald-200 text-sm mb-6">
            Upload government-issued ID or business documents for full verification
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {doc.document_type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    doc.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-300">
                  Uploaded {new Date(doc.created_at).toLocaleDateString()}
                </p>
                {doc.rejection_reason && (
                  <p className="text-xs text-red-400 mt-1">
                    Reason: {doc.rejection_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <button className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">
            Upload Documents
          </button>
        </div>
      </motion.div>
    </div>
  );
}




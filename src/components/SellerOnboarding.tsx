'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { verificationService } from '@/lib/verification';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  PhotoIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface SellerOnboardingProps {
  onComplete?: () => void;
  onClose?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

export default function SellerOnboarding({ onComplete, onClose }: SellerOnboardingProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your business information and contact details',
      icon: BuildingOfficeIcon,
      completed: false,
      required: true
    },
    {
      id: 'verification',
      title: 'Verify Identity',
      description: 'Verify your email, phone, and upload business documents',
      icon: ShieldCheckIcon,
      completed: false,
      required: true
    },
    {
      id: 'payment',
      title: 'Setup Payments',
      description: 'Connect your bank account for receiving payments',
      icon: CreditCardIcon,
      completed: false,
      required: true
    },
    {
      id: 'first_listing',
      title: 'Create First Listing',
      description: 'Add your first product to start selling',
      icon: PhotoIcon,
      completed: false,
      required: true
    },
    {
      id: 'trust_building',
      title: 'Build Trust',
      description: 'Learn about trust factors and seller best practices',
      icon: StarIcon,
      completed: false,
      required: false
    }
  ]);

  const [businessInfo, setBusinessInfo] = useState({
    business_name: '',
    business_type: 'individual' as 'individual' | 'small_business' | 'corporation' | 'cooperative',
    tax_id: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    phone_number: ''
  });

  const [verificationStatus, setVerificationStatus] = useState({
    email_verified: false,
    phone_verified: false,
    documents_uploaded: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load verification status
      const verificationResult = await verificationService.getUserVerification(user.id);
      if (verificationResult.data) {
        setVerificationStatus({
          email_verified: !!verificationResult.data.email_verified_at,
          phone_verified: !!verificationResult.data.phone_verified_at,
          documents_uploaded: false // Will be updated based on documents
        });
      }

      // Load existing business info
      const { data: userData } = await supabase
        .from('users')
        .select('business_name, business_type, tax_id, address_line1, address_line2, city, state_province, postal_code, phone_number')
        .eq('id', user.id)
        .single();

      if (userData) {
        setBusinessInfo({
          business_name: userData.business_name || '',
          business_type: userData.business_type || 'individual',
          tax_id: userData.tax_id || '',
          address_line1: userData.address_line1 || '',
          address_line2: userData.address_line2 || '',
          city: userData.city || '',
          state_province: userData.state_province || '',
          postal_code: userData.postal_code || '',
          phone_number: userData.phone_number || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateStepCompletion = () => {
    setSteps(prev => prev.map(step => {
      let completed = false;
      
      switch (step.id) {
        case 'profile':
          completed = businessInfo.business_name.length > 0 && businessInfo.address_line1.length > 0;
          break;
        case 'verification':
          completed = verificationStatus.email_verified && verificationStatus.phone_verified;
          break;
        case 'payment':
          completed = false; // Will be updated when Stripe integration is complete
          break;
        case 'first_listing':
          completed = false; // Will be updated when user creates first listing
          break;
        case 'trust_building':
          completed = true; // Always completed as it's informational
          break;
      }
      
      return { ...step, completed };
    }));
  };

  useEffect(() => {
    updateStepCompletion();
  }, [businessInfo, verificationStatus]);

  const saveBusinessInfo = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update(businessInfo)
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save business information' });
      } else {
        setMessage({ type: 'success', text: 'Business information saved successfully!' });
        updateStepCompletion();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      if (onComplete) {
        onComplete();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessInfo.business_name}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Business Type *
                </label>
                <select
                  value={businessInfo.business_type}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, business_type: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="individual">Individual</option>
                  <option value="small_business">Small Business</option>
                  <option value="corporation">Corporation</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Tax ID / Business Number
                </label>
                <input
                  type="text"
                  value={businessInfo.tax_id}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, tax_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tax ID or business registration number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={businessInfo.phone_number}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={businessInfo.address_line1}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, address_line1: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={businessInfo.city}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={businessInfo.state_province}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, state_province: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="State/Province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={businessInfo.postal_code}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="12345"
                />
              </div>
            </div>

            <button
              onClick={saveBusinessInfo}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Saving...' : 'Save Business Information'}
            </button>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShieldCheckIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Identity Verification</h3>
              <p className="text-emerald-200">Complete verification to build trust with buyers</p>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${verificationStatus.email_verified ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {verificationStatus.email_verified ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-yellow-500" />
                    )}
                    <div>
                      <h4 className="text-white font-medium">Email Verification</h4>
                      <p className="text-sm text-emerald-200">Verify your email address</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verificationStatus.email_verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {verificationStatus.email_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${verificationStatus.phone_verified ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {verificationStatus.phone_verified ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-yellow-500" />
                    )}
                    <div>
                      <h4 className="text-white font-medium">Phone Verification</h4>
                      <p className="text-sm text-emerald-200">Verify your phone number</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verificationStatus.phone_verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {verificationStatus.phone_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-blue-500/20 border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                    <div>
                      <h4 className="text-white font-medium">Document Upload</h4>
                      <p className="text-sm text-emerald-200">Upload business documents</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Upload
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-emerald-300">
                Complete verification steps in your profile to continue
              </p>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCardIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Payment Setup</h3>
              <p className="text-emerald-200">Connect your bank account to receive payments</p>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircleIcon className="w-6 h-6 text-yellow-500" />
                <div>
                  <h4 className="text-white font-medium">Stripe Integration Required</h4>
                  <p className="text-sm text-emerald-200">
                    Payment setup will be available after Stripe Connect integration
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-emerald-300">
                This step will be completed automatically when Stripe Connect is integrated
              </p>
            </div>
          </div>
        );

      case 'first_listing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <PhotoIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Create Your First Listing</h3>
              <p className="text-emerald-200">Add a product to start selling on the marketplace</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 rounded-lg text-center">
              <h4 className="text-white font-medium mb-2">Ready to Start Selling?</h4>
              <p className="text-emerald-200 text-sm mb-4">
                Create your first product listing to begin your journey as a seller
              </p>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200">
                Create First Listing
              </button>
            </div>
          </div>
        );

      case 'trust_building':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StarIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Build Trust & Success</h3>
              <p className="text-emerald-200">Learn how to become a trusted seller</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <h4 className="text-white font-medium mb-2">Trust Factors</h4>
                <ul className="text-sm text-emerald-200 space-y-1">
                  <li>• Complete profile and verification</li>
                  <li>• High-quality product photos</li>
                  <li>• Accurate product descriptions</li>
                  <li>• Fast shipping and communication</li>
                  <li>• Positive customer reviews</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <h4 className="text-white font-medium mb-2">Seller Best Practices</h4>
                <ul className="text-sm text-emerald-200 space-y-1">
                  <li>• Respond to messages quickly</li>
                  <li>• Ship orders within 24-48 hours</li>
                  <li>• Provide tracking information</li>
                  <li>• Handle disputes professionally</li>
                  <li>• Maintain high product quality</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <h4 className="text-white font-medium mb-2">Trust Score Benefits</h4>
                <ul className="text-sm text-emerald-200 space-y-1">
                  <li>• Higher visibility in search results</li>
                  <li>• Access to premium features</li>
                  <li>• Lower commission rates</li>
                  <li>• Priority customer support</li>
                  <li>• Featured seller status</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <p className="text-emerald-200">Please sign in to access seller onboarding</p>
      </div>
    );
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Seller Onboarding
              </h1>
              <p className="text-emerald-200">Complete these steps to start selling</p>
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

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-emerald-200 mb-2">
              <span>Progress</span>
              <span>{completedSteps}/{steps.length} completed</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    index === currentStep
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : step.completed
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      step.completed ? 'bg-green-500' : index === currentStep ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <h3 className="text-xs font-medium text-white mb-1">{step.title}</h3>
                    <p className="text-xs text-emerald-300 leading-tight">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-8">
          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
          </AnimatePresence>

          {/* Current Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1 && !steps[currentStep].completed}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {currentStep === steps.length - 1 ? 'Complete Onboarding' : 'Next'}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

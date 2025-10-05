'use client';

import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const faqs = [
  {
    category: "Getting Started",
    icon: UserIcon,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Create Account' on our homepage, fill in your business details, and verify your email. Complete your profile to start listing or purchasing products."
      },
      {
        q: "What information do I need to verify my account?",
        a: "We require business registration documents, tax identification, and contact information. For sellers, we also need quality certifications and shipping capabilities."
      },
      {
        q: "How long does account verification take?",
        a: "Standard verification takes 1-3 business days. Premium verification with priority support takes 24 hours."
      }
    ]
  },
  {
    category: "Buying & Selling",
    icon: CreditCardIcon,
    questions: [
      {
        q: "How does the payment system work?",
        a: "We use secure escrow payments. Funds are held until delivery confirmation. Buyers pay upfront, and sellers receive payment after successful delivery."
      },
      {
        q: "What are the platform fees?",
        a: "We charge a 3% commission on successful transactions. Premium sellers (verified businesses) get reduced fees of 2.5%."
      },
      {
        q: "How do I list my products?",
        a: "Go to your dashboard, click 'Create Listing', upload high-quality images, add detailed descriptions, set pricing, and specify shipping options."
      },
      {
        q: "Can I negotiate prices?",
        a: "Yes! Use our messaging system to negotiate with buyers/sellers directly. Final prices are updated before payment processing."
      }
    ]
  },
  {
    category: "Shipping & Logistics",
    icon: TruckIcon,
    questions: [
      {
        q: "How does shipping work?",
        a: "Sellers specify shipping methods and costs. We partner with global logistics providers for international shipping with tracking."
      },
      {
        q: "What if my product arrives damaged?",
        a: "Report damage within 48 hours of delivery. We'll initiate a dispute resolution process and may provide refunds or replacements."
      },
      {
        q: "Do you handle international shipping?",
        a: "Yes! We facilitate global trade with customs documentation, international shipping partners, and compliance with local regulations."
      }
    ]
  },
  {
    category: "Safety & Security",
    icon: ShieldCheckIcon,
    questions: [
      {
        q: "How do you verify sellers?",
        a: "We verify business licenses, tax documents, quality certifications, and conduct background checks. Verified sellers get special badges."
      },
      {
        q: "What if a seller doesn't deliver?",
        a: "Our dispute resolution system handles non-delivery cases. You can get full refunds and we take action against problematic sellers."
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use bank-level encryption, PCI DSS compliance, and never store your full payment details on our servers."
      }
    ]
  },
  {
    category: "Technical Support",
    icon: GlobeAltIcon,
    questions: [
      {
        q: "I can't access my account",
        a: "Try resetting your password or contact support. We'll verify your identity and restore access within 24 hours."
      },
      {
        q: "The website is loading slowly",
        a: "Check your internet connection and clear browser cache. If issues persist, contact our technical support team."
      },
      {
        q: "How do I update my business information?",
        a: "Go to your profile settings, update your information, and submit for re-verification if you've changed business details."
      }
    ]
  }
];

const contactMethods = [
  {
    title: "Live Chat Support",
    description: "Get instant help from our support team",
    icon: ChatBubbleLeftRightIcon,
    availability: "24/7 Available",
    action: "Start Chat"
  },
  {
    title: "Email Support",
    description: "Detailed assistance via email",
    icon: InformationCircleIcon,
    availability: "Response within 2 hours",
    action: "Send Email"
  },
  {
    title: "Phone Support",
    description: "Speak directly with our experts",
    icon: UserIcon,
    availability: "Business hours only",
    action: "Call Now"
  }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800/50 to-slate-800/50 backdrop-blur-sm border-b border-emerald-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ShieldCheckIcon className="w-12 h-12 text-emerald-400" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">
                Help Center
              </h1>
            </div>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              Get the support you need to succeed on our premium B2B marketplace. 
              Find answers, get help, and connect with our expert team.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-400/40 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <method.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-100">{method.title}</h3>
                  <p className="text-sm text-emerald-300">{method.availability}</p>
                </div>
              </div>
              <p className="text-emerald-200 mb-4">{method.description}</p>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium">
                {method.action}
              </button>
            </div>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <section.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">
                  {section.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {section.questions.map((faq, faqIndex) => (
                  <div
                    key={faqIndex}
                    className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30 rounded-lg p-6 hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <QuestionMarkCircleIcon className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-100 mb-2">
                          {faq.q}
                        </h3>
                        <p className="text-emerald-200 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-br from-emerald-800/30 to-slate-800/50 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
        >
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
              Still Need Help?
            </h2>
            <p className="text-emerald-200 mb-6 max-w-2xl mx-auto">
              Our dedicated support team is here to help you succeed. Contact us through any of the methods above, 
              and we'll get back to you promptly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
              >
                Contact Support
              </Link>
              <Link
                href="/dashboard"
                className="border border-emerald-500/30 text-emerald-200 px-8 py-3 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


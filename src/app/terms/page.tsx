'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const sections = [
  {
    title: "1. Acceptance of Terms",
    icon: CheckCircleIcon,
    content: `
      By accessing and using Fruit Habibi ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
      If you do not agree to abide by the above, please do not use this service.
      
      These Terms of Service ("Terms") govern your use of our B2B marketplace platform that connects premium fruit and vegetable growers 
      with trusted buyers worldwide. By creating an account or using our services, you agree to these terms.
    `
  },
  {
    title: "2. Platform Services",
    icon: InformationCircleIcon,
    content: `
      Fruit Habibi provides a digital marketplace platform that enables:
      
      • Product listing and discovery services
      • Secure payment processing with escrow protection
      • Communication tools between buyers and sellers
      • Quality verification and dispute resolution
      • International shipping coordination
      • Business verification and trust scoring
      
      We act as an intermediary platform and do not directly sell or purchase products listed by users.
    `
  },
  {
    title: "3. User Accounts and Verification",
    icon: ShieldCheckIcon,
    content: `
      To use our platform, you must:
      
      • Provide accurate and complete business information
      • Maintain the security of your account credentials
      • Complete business verification process
      • Comply with all applicable laws and regulations
      
      We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities. 
      Business verification is required for all sellers and recommended for buyers.
      
      You are responsible for all activities that occur under your account and must notify us immediately of any unauthorized use.
    `
  },
  {
    title: "4. Prohibited Activities",
    icon: XMarkIcon,
    content: `
      Users are strictly prohibited from:
      
      • Listing counterfeit, illegal, or prohibited products
      • Providing false or misleading product information
      • Attempting to circumvent our payment system
      • Engaging in fraudulent transactions
      • Violating intellectual property rights
      • Harassment or abuse of other users
      • Manipulating reviews or ratings
      • Using automated systems to access the platform
      • Selling products outside of permitted categories
      
      Violations may result in immediate account suspension and legal action.
    `
  },
  {
    title: "5. Payment and Fees",
    icon: DocumentTextIcon,
    content: `
      Payment Terms:
      
      • All transactions are processed through our secure escrow system
      • Platform fee: 3% of transaction value (2.5% for verified premium sellers)
      • Payment processing fees may apply
      • Refunds are subject to our dispute resolution process
      
      Buyers pay upfront, and sellers receive payment after successful delivery confirmation. 
      We hold funds in escrow to protect both parties during the transaction.
      
      All fees are clearly displayed before transaction completion. Currency conversion rates apply for international transactions.
    `
  },
  {
    title: "6. Dispute Resolution",
    icon: ExclamationTriangleIcon,
    content: `
      Dispute Process:
      
      1. Direct Communication: Users must attempt to resolve issues directly first
      2. Platform Mediation: Our team will mediate if direct resolution fails
      3. Evidence Review: Both parties must provide relevant documentation
      4. Resolution Timeline: Standard disputes resolved within 7 business days
      5. Appeal Process: Users can appeal decisions within 48 hours
      
      We reserve the right to:
      • Issue full or partial refunds
      • Suspend accounts during investigation
      • Adjust trust scores based on dispute outcomes
      • Escalate to legal authorities for serious violations
      
      Our decision is binding unless overturned through the appeal process.
    `
  },
  {
    title: "7. Intellectual Property",
    icon: ShieldCheckIcon,
    content: `
      Intellectual Property Rights:
      
      • Users retain ownership of their product listings and content
      • Users grant us license to display and promote their content on the platform
      • We own all platform technology, design, and proprietary systems
      • Trademark infringement is strictly prohibited
      • Users must have rights to all images and content they upload
      
      We respect intellectual property rights and will remove infringing content upon notification. 
      Users who repeatedly infringe on IP rights may have their accounts terminated.
    `
  },
  {
    title: "8. Privacy and Data Protection",
    icon: InformationCircleIcon,
    content: `
      Data Protection:
      
      • We collect and process data as described in our Privacy Policy
      • User data is protected with industry-standard security measures
      • We may share data with trusted partners for service delivery
      • Users can request data deletion subject to legal requirements
      • International data transfers comply with applicable regulations
      
      By using our platform, you consent to our data collection and processing practices. 
      We are committed to protecting your privacy and maintaining data security.
    `
  },
  {
    title: "9. Limitation of Liability",
    icon: ExclamationTriangleIcon,
    content: `
      Liability Limitations:
      
      • Our platform is provided "as is" without warranties
      • We are not liable for indirect, incidental, or consequential damages
      • Our total liability is limited to fees paid to us in the preceding 12 months
      • We do not guarantee uninterrupted or error-free service
      • Users are responsible for their own business decisions
      
      We act as an intermediary platform and are not responsible for:
      • Product quality or condition
      • Delivery delays or issues
      • Business disputes between users
      • Third-party service failures
      
      Users participate at their own risk and should conduct due diligence.
    `
  },
  {
    title: "10. Termination and Suspension",
    icon: XMarkIcon,
    content: `
      Account Termination:
      
      We may suspend or terminate accounts for:
      • Violation of these Terms of Service
      • Fraudulent or illegal activities
      • Non-payment of fees
      • Misrepresentation of business information
      • Harassment of other users
      
      Users may terminate their accounts at any time by contacting support. 
      Upon termination:
      • Active transactions must be completed
      • Outstanding fees must be paid
      • Account data may be retained for legal compliance
      • User content may be removed from public view
    `
  },
  {
    title: "11. International Trade Compliance",
    icon: ShieldCheckIcon,
    content: `
      Global Trade Requirements:
      
      • Users must comply with all applicable international trade laws
      • Export/import regulations must be followed
      • Sanctions and embargo restrictions apply
      • Customs documentation is user responsibility
      • We may restrict transactions based on compliance requirements
      
      Users are responsible for:
      • Obtaining necessary permits and licenses
      • Complying with destination country regulations
      • Accurate customs declarations
      • Payment of applicable duties and taxes
      
      We reserve the right to block transactions that may violate trade laws.
    `
  },
  {
    title: "12. Changes to Terms",
    icon: DocumentTextIcon,
    content: `
      Modifications:
      
      • We may update these Terms of Service from time to time
      • Users will be notified of significant changes via email
      • Continued use constitutes acceptance of new terms
      • Users may terminate accounts if they disagree with changes
      • Previous versions are available upon request
      
      Changes may be made to:
      • Reflect new services or features
      • Comply with legal requirements
      • Improve user experience
      • Address security concerns
      
      We encourage users to review terms periodically.
    `
  }
];

export default function TermsOfServicePage() {
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
              <DocumentTextIcon className="w-12 h-12 text-emerald-400" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">
                Terms of Service
              </h1>
            </div>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              Please read these terms carefully before using our B2B marketplace platform. 
              By using our services, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-emerald-300 mt-4">
              Last updated: October 5, 2025
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm mb-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
              Welcome to Fruit Habibi
            </h2>
            <p className="text-emerald-200 leading-relaxed">
              These Terms of Service govern your use of our premium B2B marketplace platform that connects 
              fruit and vegetable growers with buyers worldwide. We're committed to providing a secure, 
              transparent, and efficient trading environment for all our users.
            </p>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-lg flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                  <section.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
                    {section.title}
                  </h3>
                  <div className="text-emerald-200 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-br from-emerald-800/30 to-slate-800/50 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
        >
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
              Questions About These Terms?
            </h2>
            <p className="text-emerald-200 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please contact our legal team. 
              We're here to help clarify any concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
              >
                Contact Legal Team
              </Link>
              <Link
                href="/help"
                className="border border-emerald-500/30 text-emerald-200 px-8 py-3 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 font-medium"
              >
                Help Center
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}




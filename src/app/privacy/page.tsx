'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const sections = [
  {
    title: "1. Information We Collect",
    icon: InformationCircleIcon,
    content: `
      Personal Information:
      
      • Business contact information (name, email, phone, address)
      • Business registration and tax identification details
      • Payment and banking information (processed securely)
      • Identity verification documents
      • Product listings and descriptions
      • Communication records with other users
      
      Technical Information:
      
      • IP addresses and device information
      • Browser type and version
      • Usage patterns and platform interactions
      • Cookies and similar tracking technologies
      • Location data (if provided or detected)
      
      We collect this information to provide our services, verify identities, process transactions, 
      and improve our platform functionality.
    `
  },
  {
    title: "2. How We Use Your Information",
    icon: EyeIcon,
    content: `
      Service Provision:
      
      • Creating and maintaining your account
      • Processing transactions and payments
      • Facilitating communication between users
      • Providing customer support
      • Verifying business credentials
      
      Platform Improvement:
      
      • Analyzing usage patterns to improve services
      • Developing new features and functionality
      • Conducting research and analytics
      • Personalizing user experience
      • Preventing fraud and abuse
      
      Legal Compliance:
      
      • Meeting regulatory requirements
      • Responding to legal requests
      • Protecting our rights and interests
      • Ensuring platform security
      • Maintaining transaction records
      
      We use your information only for legitimate business purposes and in compliance with applicable laws.
    `
  },
  {
    title: "3. Information Sharing",
    icon: GlobeAltIcon,
    content: `
      We may share your information in the following circumstances:
      
      With Other Users:
      • Business contact information for transaction purposes
      • Product listings and descriptions
      • Public profile information (if you choose to make it public)
      
      With Service Providers:
      • Payment processors for transaction handling
      • Shipping and logistics partners
      • Cloud storage and hosting providers
      • Customer support tools
      • Analytics and marketing services
      
      Legal Requirements:
      • When required by law or legal process
      • To protect our rights and property
      • In case of emergency to protect safety
      • To comply with government requests
      
      Business Transfers:
      • In case of merger, acquisition, or sale of assets
      • With your explicit consent for other purposes
      
      We never sell your personal information to third parties for marketing purposes.
    `
  },
  {
    title: "4. Data Security",
    icon: LockClosedIcon,
    content: `
      Security Measures:
      
      • Encryption of data in transit and at rest
      • Secure servers with regular security updates
      • Access controls and authentication systems
      • Regular security audits and assessments
      • Employee training on data protection
      
      Technical Safeguards:
      
      • SSL/TLS encryption for all communications
      • Multi-factor authentication for sensitive operations
      • Regular backup and disaster recovery procedures
      • Intrusion detection and prevention systems
      • Secure coding practices and vulnerability testing
      
      Data Breach Response:
      
      • Immediate investigation and containment
      • Notification to affected users within 72 hours
      • Cooperation with law enforcement if required
      • Implementation of additional security measures
      • Regular updates on resolution progress
      
      While we implement industry-standard security measures, no system is 100% secure. 
      We continuously work to improve our security practices.
    `
  },
  {
    title: "5. Data Retention",
    icon: DocumentTextIcon,
    content: `
      Retention Periods:
      
      Account Information:
      • Active accounts: Retained while account is active
      • Closed accounts: Retained for 7 years for legal compliance
      • Suspended accounts: Retained until resolution or permanent closure
      
      Transaction Data:
      • Payment records: 7 years for tax and legal compliance
      • Communication logs: 3 years for dispute resolution
      • Product listings: Until account closure or removal
      
      Technical Data:
      • Log files: 1 year for security and performance monitoring
      • Analytics data: 2 years for platform improvement
      • Cookies: As specified in our cookie policy
      
      Legal Requirements:
      
      • Financial records: 7 years minimum
      • Identity verification: 5 years after account closure
      • Legal proceedings: Until resolution plus applicable statute of limitations
      
      You may request deletion of certain personal information, subject to legal and operational requirements.
    `
  },
  {
    title: "6. Your Rights and Choices",
    icon: CheckCircleIcon,
    content: `
      Your Rights:
      
      Access and Portability:
      • Request copies of your personal information
      • Receive data in a portable format
      • Understand how we use your information
      
      Correction and Updates:
      • Correct inaccurate personal information
      • Update your account information
      • Modify your privacy preferences
      
      Deletion and Restriction:
      • Request deletion of personal information
      • Restrict processing of your data
      • Object to certain data processing activities
      
      Communication Preferences:
      • Opt out of marketing communications
      • Choose notification preferences
      • Manage cookie settings
      
      How to Exercise Your Rights:
      
      • Contact us through our support channels
      • Use account settings for basic preferences
      • Submit formal requests for complex changes
      • Provide identification for security verification
      
      We will respond to your requests within 30 days, subject to verification and legal requirements.
    `
  },
  {
    title: "7. International Data Transfers",
    icon: GlobeAltIcon,
    content: `
      Global Operations:
      
      • Our platform serves users worldwide
      • Data may be transferred across international borders
      • We ensure adequate protection for all transfers
      
      Transfer Mechanisms:
      
      • Standard Contractual Clauses (SCCs)
      • Adequacy decisions by relevant authorities
      • Binding Corporate Rules where applicable
      • User consent for specific transfers
      
      Regional Compliance:
      
      European Union (GDPR):
      • Full compliance with GDPR requirements
      • Data Protection Officer appointed
      • Privacy by design principles implemented
      
      United States:
      • Compliance with applicable state and federal laws
      • CCPA and other state privacy law compliance
      
      Other Jurisdictions:
      • Local privacy law compliance where applicable
      • Regular review of regulatory changes
      
      We ensure that international transfers meet the highest standards of data protection.
    `
  },
  {
    title: "8. Cookies and Tracking",
    icon: EyeIcon,
    content: `
      Types of Cookies:
      
      Essential Cookies:
      • Required for platform functionality
      • Authentication and security features
      • Shopping cart and session management
      
      Performance Cookies:
      • Analytics and usage statistics
      • Platform performance monitoring
      • Error tracking and debugging
      
      Functional Cookies:
      • User preferences and settings
      • Language and localization
      • Enhanced user experience features
      
      Marketing Cookies:
      • Advertising and promotional content
      • User behavior analysis
      • Targeted marketing communications
      
      Cookie Management:
      
      • Cookie consent banner on first visit
      • Granular control over cookie categories
      • Easy opt-out mechanisms
      • Regular review of cookie usage
      
      You can manage cookie preferences through your browser settings or our cookie management tools.
    `
  },
  {
    title: "9. Children's Privacy",
    icon: ExclamationTriangleIcon,
    content: `
      Age Restrictions:
      
      • Our platform is not intended for children under 16
      • We do not knowingly collect information from children
      • Business accounts require adult verification
      
      Parental Rights:
      
      • Parents can request information about their child's account
      • Right to review and delete child's information
      • Notification of data collection from children
      
      If we discover we have collected information from a child without parental consent, 
      we will delete that information immediately.
    `
  },
  {
    title: "10. Third-Party Services",
    icon: GlobeAltIcon,
    content: `
      Integrated Services:
      
      Payment Processing:
      • Secure payment gateways
      • PCI DSS compliant processors
      • Limited data sharing for transaction processing
      
      Shipping and Logistics:
      • International shipping partners
      • Tracking and delivery services
      • Customs and compliance data
      
      Analytics and Marketing:
      • Website analytics providers
      • Marketing automation tools
      • Customer relationship management systems
      
      Third-Party Policies:
      
      • Each service has its own privacy policy
      • We vet partners for privacy compliance
      • Limited data sharing for specific purposes
      • Regular review of third-party practices
      
      We are not responsible for the privacy practices of third-party services. 
      Users should review third-party privacy policies before using integrated services.
    `
  },
  {
    title: "11. Changes to Privacy Policy",
    icon: DocumentTextIcon,
    content: `
      Policy Updates:
      
      • We may update this privacy policy periodically
      • Significant changes will be communicated via email
      • Updated policies will be posted on our website
      • Previous versions are available upon request
      
      Notification Process:
      
      • Email notification for material changes
      • Website banner for important updates
      • Account notification for significant changes
      • 30-day notice for substantial modifications
      
      User Rights:
      
      • Right to review updated policies
      • Option to accept or reject changes
      • Ability to close account if disagreeing with changes
      • Continued use constitutes acceptance
      
      We encourage users to review our privacy policy regularly to stay informed about our practices.
    `
  },
  {
    title: "12. Contact Information",
    icon: UserIcon,
    content: `
      Data Protection Officer:
      
      Email: privacy@fruithabibi.com
      Phone: +1 (555) 123-4567
      Address: Data Protection Office, Fruit Habibi Inc., 
               123 Business Plaza, Suite 456, 
               San Francisco, CA 94105, USA
      
      General Privacy Inquiries:
      
      Email: support@fruithabibi.com
      Help Center: /help
      Contact Form: /contact
      
      Legal Requests:
      
      Email: legal@fruithabibi.com
      For law enforcement and legal process requests
      
      Response Times:
      
      • General inquiries: 48 hours
      • Privacy rights requests: 30 days
      • Legal requests: As required by law
      • Security incidents: 72 hours for notification
      
      We are committed to addressing all privacy concerns promptly and thoroughly.
    `
  }
];

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, 
              and protect your personal information on our B2B marketplace platform.
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
              Our Commitment to Privacy
            </h2>
            <p className="text-emerald-200 leading-relaxed">
              At Fruit Habibi, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains our practices regarding the collection, use, and protection of information when you use 
              our B2B marketplace platform. We believe in transparency and giving you control over your personal data.
            </p>
          </div>
        </motion.div>

        {/* Privacy Sections */}
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
              Privacy Questions or Concerns?
            </h2>
            <p className="text-emerald-200 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your personal information, 
              please don't hesitate to contact our privacy team. We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
              >
                Contact Privacy Team
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


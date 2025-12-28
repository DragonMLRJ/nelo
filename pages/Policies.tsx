import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Cookie } from 'lucide-react';

type PolicyType = 'privacy' | 'terms' | 'cookies';

interface PoliciesProps {
  type: PolicyType;
}

const Policies: React.FC<PoliciesProps> = ({ type }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      updated: 'October 24, 2024',
      text: (
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h3>
            <p>At Nelo, we collect information you provide directly to us, such as when you create an account, list an item for sale, or communicate with other users. This may include your name, email address, phone number, and payment information. We also automatically collect certain information when you use our platform, such as your IP address and device type.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h3>
            <p>We use your information to provide, maintain, and improve our services. This includes facilitating transactions between buyers and sellers, verifying user identities to ensure safety, and detecting fraud. We also use your data to personalize your experience, show you relevant products, and send you important updates.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Sharing Information</h3>
            <p>We do not sell your personal data to third parties. We may share information with service providers who help us operate our business (e.g., payment processors, shipping partners) or when required by law.</p>
          </section>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      icon: FileText,
      updated: 'September 1, 2024',
      text: (
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h3>
            <p>By accessing or using Nelo, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services. We may update these terms from time to time.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. User Accounts</h3>
            <p>You must create an account to use certain features of Nelo. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Selling and Buying</h3>
            <p><strong>Sellers:</strong> You must provide accurate descriptions and images of your items. You agree to ship items promptly upon sale.<br/>
            <strong>Buyers:</strong> You agree to pay for items you commit to purchase. Payment is held securely until the item is received.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Prohibited Items</h3>
            <p>The sale of illegal, counterfeit, dangerous, or offensive items is strictly prohibited on Nelo. We reserve the right to remove any listing that violates our policies and suspend users who violate these rules.</p>
          </section>
        </div>
      )
    },
    cookies: {
      title: 'Cookie Policy',
      icon: Cookie,
      updated: 'October 24, 2024',
      text: (
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. What Are Cookies?</h3>
            <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us remember your preferences, keep you logged in, and improve your browsing experience.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Categories of Cookies We Use</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800">Strictly Necessary Cookies</h4>
                <p className="text-sm">These cookies are essential for the website to function properly. They enable basic features like page navigation, accessing secure areas, and managing your shopping cart. The website cannot function properly without these cookies.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Performance & Analytics Cookies</h4>
                <p className="text-sm">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website structure and content.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Functionality Cookies</h4>
                <p className="text-sm">These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Targeting & Advertising Cookies</h4>
                <p className="text-sm">These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of the advertising campaign.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. List of Cookies Used on Nelo</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Cookie Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Purpose</th>
                    <th className="px-6 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">nelo_session</td>
                    <td className="px-6 py-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Necessary</span></td>
                    <td className="px-6 py-3">Maintains your session state across pages (login, cart).</td>
                    <td className="px-6 py-3">Session</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">nelo_auth_token</td>
                    <td className="px-6 py-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Necessary</span></td>
                    <td className="px-6 py-3">Securely identifies you when logged in.</td>
                    <td className="px-6 py-3">30 Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">nelo_cookie_consent</td>
                    <td className="px-6 py-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Necessary</span></td>
                    <td className="px-6 py-3">Stores your cookie consent preferences.</td>
                    <td className="px-6 py-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">nelo_wishlist</td>
                    <td className="px-6 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Functional</span></td>
                    <td className="px-6 py-3">Remembers your favorite items locally.</td>
                    <td className="px-6 py-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">_ga, _gid</td>
                    <td className="px-6 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">Analytics</span></td>
                    <td className="px-6 py-3">Google Analytics cookies to track user behavior anonymously.</td>
                    <td className="px-6 py-3">2 Years</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-xs">ads_preferences</td>
                    <td className="px-6 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">Advertising</span></td>
                    <td className="px-6 py-3">Used to show relevant ads based on your interests.</td>
                    <td className="px-6 py-3">90 Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Managing Cookies</h3>
            <p>You can control and manage cookies through your browser settings. You can choose to block or delete cookies, but please note that doing so may limit your ability to use some features of Nelo.</p>
            <p className="mt-2 text-sm">Most browsers allow you to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>View what cookies you have and delete them individually.</li>
                <li>Block third-party cookies.</li>
                <li>Block cookies from particular sites.</li>
                <li>Block all cookies from being set.</li>
                <li>Delete all cookies when you close your browser.</li>
            </ul>
          </section>
        </div>
      )
    }
  };

  const data = content[type];
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12 max-w-4xl"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-50 p-8 md:p-12 border-b border-teal-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-teal-600">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{data.title}</h1>
          </div>
          <p className="text-teal-800 font-medium opacity-80">Last updated: {data.updated}</p>
        </div>
        
        <div className="p-8 md:p-12">
          {data.text}
        </div>
      </div>
    </motion.div>
  );
};

export default Policies;
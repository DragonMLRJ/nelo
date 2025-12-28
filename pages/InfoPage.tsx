import React from 'react';
import { motion } from 'framer-motion';

type PageKey = 'about' | 'sustainability' | 'jobs' | 'how-it-works' | 'pro' | 'trust';

interface InfoPageProps {
  pageKey: PageKey;
}

const CONTENT: Record<PageKey, { title: string; content: React.ReactNode }> = {
  about: {
    title: 'About Nelo',
    content: (
      <>
        <p className="mb-4">Nelo is the premier marketplace for Congo-Brazzaville. Born from a vision to connect buyers and sellers across Brazzaville, Pointe-Noire, Dolisie, and beyond, we provide a safe and easy-to-use platform for commerce.</p>
        <p>Our mission is to empower local entrepreneurs and provide consumers with access to quality goods at fair prices.</p>
      </>
    )
  },
  sustainability: {
    title: 'Sustainability',
    content: (
      <>
        <p className="mb-4">At Nelo, we believe in the circular economy. By giving pre-loved items a second life, we reduce waste and minimize our environmental footprint.</p>
        <p>Buying second-hand is not just cheaper—it's greener.</p>
      </>
    )
  },
  jobs: {
    title: 'Careers at Nelo',
    content: (
      <>
        <p className="mb-4">We are always looking for talented individuals to join our team in Brazzaville.</p>
        <p>If you are passionate about technology and commerce, send your CV to our support email.</p>
      </>
    )
  },
  'how-it-works': {
    title: 'How Nelo Works',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2">1. Snap & Sell</h3>
          <p>Take a photo of your item, describe it, and set a price. It's free to list!</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">2. Chat & Negotiate</h3>
          <p>Buyers can contact you via our secure messaging system to ask questions or negotiate the price.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">3. Meet or Ship</h3>
          <p>Arrange a safe meeting place or use our delivery partners to send the item.</p>
        </div>
      </div>
    )
  },
  pro: {
    title: 'Nelo Pro',
    content: (
      <>
        <p className="mb-4">Nelo Pro is designed for businesses and high-volume sellers.</p>
        <p>Get access to advanced analytics, bulk listing tools, and priority support to grow your business.</p>
      </>
    )
  },
  trust: {
    title: 'Trust & Safety',
    content: (
      <>
        <p className="mb-4">Your safety is our top priority. We employ verification badges, user reviews, and fraud detection systems to keep Nelo safe.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Never share your password or financial details outside the app.</li>
          <li>Meet in public places for local transactions.</li>
          <li>Report suspicious behavior immediately using the "Report User" button.</li>
        </ul>
      </>
    )
  }
};

const InfoPage: React.FC<InfoPageProps> = ({ pageKey }) => {
  const data = CONTENT[pageKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-50 p-8 border-b border-teal-100">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{data.title}</h1>
        </div>
        <div className="p-8 md:p-12 text-gray-700 leading-relaxed text-lg">
          {data.content}
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPage;
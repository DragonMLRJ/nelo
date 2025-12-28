import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nelo_cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nelo_cookie_consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">We value your privacy</h4>
              <p className="text-sm text-gray-500">
                We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
                <Link to="/cookies" className="text-teal-600 underline ml-1">Read Policy</Link>
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShow(false)} 
                className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2 bg-teal-600 text-white rounded-md text-sm font-bold hover:bg-teal-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;

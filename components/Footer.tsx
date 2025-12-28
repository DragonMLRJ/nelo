import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Nelo</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-teal-600">About us</Link></li>
              <li><Link to="/sustainability" className="hover:text-teal-600">Sustainability</Link></li>
              <li><Link to="/jobs" className="hover:text-teal-600">Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/how-it-works" className="hover:text-teal-600">How it works</Link></li>
              <li><Link to="/pro" className="hover:text-teal-600">Nelo Pro</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="mailto:challengecodeur334334@gmail.com" className="hover:text-teal-600 flex items-center gap-1">
                  Help Center
                </a>
              </li>
              <li><Link to="/sell" className="hover:text-teal-600">Selling</Link></li>
              <li><Link to="/catalog" className="hover:text-teal-600">Buying</Link></li>
              <li><Link to="/trust" className="hover:text-teal-600">Trust & Safety</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/forum" className="hover:text-teal-600">Forum</Link></li>
              <li className="flex gap-4 mt-4">
                <Facebook className="w-5 h-5 hover:text-teal-600 cursor-pointer" />
                <Twitter className="w-5 h-5 hover:text-teal-600 cursor-pointer" />
                <Instagram className="w-5 h-5 hover:text-teal-600 cursor-pointer" />
                <Linkedin className="w-5 h-5 hover:text-teal-600 cursor-pointer" />
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
           <div className="flex gap-4">
             <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
             <Link to="/cookies" className="hover:underline">Cookie Policy</Link>
             <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
           </div>
           <p>© 2024 Nelo Congo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
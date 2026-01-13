import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-teal-700 mb-6">nelo.</h3>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link to="/about" className="hover:text-teal-600 transition-colors">À propos</Link></li>
              <li><Link to="/sustainability" className="hover:text-teal-600 transition-colors">Durabilité</Link></li>
              <li><Link to="/jobs" className="hover:text-teal-600 transition-colors">Emplois</Link></li>
              <li><Link to="/blog" className="hover:text-teal-600 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-6">Découvrir</h3>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link to="/how-it-works" className="hover:text-teal-600 transition-colors">Comment ça marche</Link></li>
              <li><Link to="/pro" className="hover:text-teal-600 transition-colors">Nelo Pro</Link></li>
              <li><Link to="/mobile" className="hover:text-teal-600 transition-colors">Application Mobile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-6">Aide & Support</h3>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li>
                <a href="mailto:challengecodeur334334@gmail.com" className="hover:text-teal-600 transition-colors flex items-center gap-1">
                  Centre d'aide
                </a>
              </li>
              <li><Link to="/sell" className="hover:text-teal-600 transition-colors">Vendre un article</Link></li>
              <li><Link to="/trust" className="hover:text-teal-600 transition-colors">Confiance & Sécurité</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-6">Suivez-nous</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-medium">
              Inscrivez-vous à notre newsletter pour les meilleures offres !
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="hover:text-teal-600 transition-colors">Politique de confidentialité</Link>
            <Link to="/cookies" className="hover:text-teal-600 transition-colors">Cookies</Link>
            <Link to="/terms" className="hover:text-teal-600 transition-colors">Conditions générales</Link>
          </div>
          <p>© 2026 Nelo Congo. Fait avec passion à Brazzaville.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
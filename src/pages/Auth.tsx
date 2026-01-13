import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../types';
import { CONGO_CITIES } from '../constants';
import SEO from '../components/SEO';

const Auth: React.FC<{ type: 'login' | 'register' }> = ({ type }) => {
  const { login, register, loginWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Brazzaville');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;

    if (type === 'login') {
      success = await login(email, password);
    } else {
      success = await register(email, password, name, location);
    }

    if (success) {
      navigate(redirect);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-teal-900 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2574&auto=format&fit=crop"
          alt="Shopping Lifestyle"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-900/40 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h1 className="text-5xl font-bold font-outfit mb-6">Achetez et Vendez au Congo.</h1>
          <p className="text-xl text-teal-100 font-light leading-relaxed">
            Rejoignez la communauté Nelo et découvrez une nouvelle façon de faire du shopping en ligne. Simple, Sécurisé, Premium.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 backdrop-blur-3xl">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-outfit text-gray-900 mb-2">
              {type === 'login' ? 'Bon retour !' : 'Créer un compte'}
            </h2>
            <p className="text-gray-500">
              {type === 'login' ? 'Connectez-vous pour accéder à votre espace.' : 'Commencez votre aventure Nelo maintenant.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={() => loginWithGoogle()}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              Continuer avec Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/0 backdrop-blur-xl text-gray-400 font-medium">Ou avec email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {type === 'register' && (
                <>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400 group-hover:bg-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Ville</label>
                    <div className="relative">
                      <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all group-hover:bg-white"
                      >
                        {CONGO_CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400 group-hover:bg-white"
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400 group-hover:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Traitement...
                  </span>
                ) : (
                  type === 'login' ? 'Se connecter' : "S'inscrire"
                )}
              </button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-gray-500 text-sm">
                {type === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <button
                  onClick={() => navigate(type === 'login' ? '/register' : '/login')}
                  className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-color"
                >
                  {type === 'login' ? "Créer un compte" : 'Se connecter'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
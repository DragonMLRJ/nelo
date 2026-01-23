import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

type PageKey = 'about' | 'sustainability' | 'jobs' | 'how-it-works' | 'pro' | 'trust';

interface InfoPageProps {
  pageKey: PageKey;
}

const CONTENT: Record<PageKey, { title: string; content: React.ReactNode }> = {
  about: {
    title: 'À propos de Nelo',
    content: (
      <>
        <p className="mb-4">Nelo est la première marketplace du Congo-Brazzaville. Née d'une vision de connecter acheteurs et vendeurs à travers Brazzaville, Pointe-Noire, Dolisie et au-delà, nous fournissons une plateforme sûre et facile à utiliser pour le commerce.</p>
        <p>Notre mission est de donner du pouvoir aux entrepreneurs locaux et de fournir aux consommateurs un accès à des produits de qualité à des prix équitables.</p>
      </>
    )
  },
  sustainability: {
    title: 'Durabilité',
    content: (
      <>
        <p className="mb-4">Chez Nelo, nous croyons en l'économie circulaire. En donnant une seconde vie aux articles d'occasion, nous réduisons les déchets et minimisons notre empreinte environnementale.</p>
        <p>Acheter d'occasion n'est pas seulement moins cher—c'est aussi plus écologique.</p>
      </>
    )
  },
  jobs: {
    title: 'Carrières chez Nelo',
    content: (
      <>
        <p className="mb-4">Nous sommes toujours à la recherche de personnes talentueuses pour rejoindre notre équipe à Brazzaville.</p>
        <p>Si vous êtes passionné par la technologie et le commerce, envoyez votre CV à notre email de support.</p>
      </>
    )
  },
  'how-it-works': {
    title: 'Comment ça marche',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2">1. Photographiez & Vendez</h3>
          <p>Prenez une photo de votre article, décrivez-le et fixez un prix. C'est gratuit de publier !</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">2. Discutez & Négociez</h3>
          <p>Les acheteurs peuvent vous contacter via notre système de messagerie sécurisé pour poser des questions ou négocier le prix.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">3. Rencontrez ou Expédiez</h3>
          <p>Organisez un lieu de rencontre sûr ou utilisez nos partenaires de livraison pour envoyer l'article.</p>
        </div>
      </div>
    )
  },
  pro: {
    title: 'Nelo Pro',
    content: (
      <>
        <p className="mb-4">Nelo Pro est conçu pour les entreprises et les vendeurs à gros volume.</p>
        <p>Accédez à des analyses avancées, des outils de publication en masse et un support prioritaire pour développer votre entreprise.</p>
      </>
    )
  },
  trust: {
    title: 'Confiance et Sécurité',
    content: (
      <>
        <p className="mb-4">Votre sécurité est notre priorité absolue. Nous utilisons des badges de vérification, des avis d'utilisateurs et des systèmes de détection de fraude pour garder Nelo sûr.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ne partagez jamais votre mot de passe ou vos informations financières en dehors de l'application.</li>
          <li>Rencontrez-vous dans des lieux publics pour les transactions locales.</li>
          <li>Signalez immédiatement tout comportement suspect en utilisant le bouton "Signaler l'utilisateur".</li>
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
      <SEO title={data.title} description={data.title + " - Nelo Marketplace"} />
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
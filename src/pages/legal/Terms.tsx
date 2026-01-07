import React from 'react';
import { Shield, FileText } from 'lucide-react';

const Terms: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
                </div>

                <div className="prose prose-teal max-w-none text-gray-600 space-y-6">
                    <p className="text-lg font-medium text-gray-800">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">1. Introduction</h2>
                        <p>
                            Bienvenue sur Nelo Marketplace ("nous", "notre" ou "nos"). En accédant à notre site web et en utilisant nos services,
                            vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces termes,
                            veuillez ne pas utiliser nos services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">2. Utilisation du Service</h2>
                        <p>
                            Vous vous engagez à utiliser notre plateforme uniquement à des fins légales. Il est interdit de :
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Publier du contenu faux, trompeur ou frauduleux.</li>
                            <li>Vendre des articles contrefaits ou interdits par la loi congolaise.</li>
                            <li>Harceler ou collecter des données sur d'autres utilisateurs sans leur consentement.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">3. Comptes Utilisateurs</h2>
                        <p>
                            Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la confidentialité
                            de vos identifiants. Toute activité effectuée depuis votre compte est réputée être de votre fait.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">4. Ventes et Paiements</h2>
                        <p>
                            Nelo Marketplace agit en tant qu'intermédiaire. Les contrats de vente sont conclus directement entre l'acheteur et le vendeur.
                            Nous ne garantissons pas la qualité, la sécurité ou la légalité des articles annoncés.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">5. Responsabilité</h2>
                        <p>
                            Dans toute la mesure permise par la loi, Nelo Marketplace ne saurait être tenu responsable des dommages indirects,
                            accessoires ou consécutifs résultant de l'utilisation de nos services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">6. Modifications</h2>
                        <p>
                            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur le site.
                        </p>
                    </section>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                        <p className="text-sm">
                            Pour toute question juridique, veuillez nous contacter à <a href="mailto:legal@nelo.cg" className="text-teal-600 hover:underline">legal@nelo.cg</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;

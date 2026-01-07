import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Returns: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
                        <RefreshCw className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Politique de Retour et Remboursement</h1>
                </div>

                <div className="prose prose-teal max-w-none text-gray-600 space-y-6">
                    <p className="text-lg font-medium text-gray-800">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">1. Délai de Retour</h2>
                        <p>
                            Vous disposez d'un délai de <strong>7 jours calendaires</strong> à compter de la date de réception pour retourner un article
                            si celui-ci ne vous convient pas ou s'il est défectueux.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">2. Conditions d'Éligibilité</h2>
                        <p>
                            Pour être éligible à un retour, l'article doit être :
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Inutilisé et dans le même état que vous l'avez reçu.</li>
                            <li>Dans son emballage d'origine.</li>
                            <li>Accompagné du reçu ou de la preuve d'achat.</li>
                        </ul>
                        <p className="mt-2 text-sm italic">
                            Note : Les articles périssables, les produits d'hygiène ouverts et les cartes cadeaux ne sont pas retournables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">3. Procédure de Retour</h2>
                        <p>
                            Pour initier un retour, veuillez :
                            <ol className="list-decimal pl-5 mt-2 space-y-1">
                                <li>Accéder à "Mes Commandes" et sélectionner l'article concerné.</li>
                                <li>Cliquer sur "Demander un retour" et remplir le formulaire.</li>
                                <li>Attendre l'approbation du vendeur ou de notre support.</li>
                            </ol>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">4. Remboursements</h2>
                        <p>
                            Une fois votre retour reçu et inspecté, nous vous enverrons un email pour vous notifier.
                            Si approuvé, votre remboursement sera traité et un crédit sera automatiquement appliqué à votre carte ou méthode de paiement originale
                            dans un délai de 5 à 10 jours ouvrés.
                        </p>
                    </section>

                    <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                        <p className="text-sm text-orange-800">
                            En cas de litige avec un vendeur officiel, la Garantie Nelo Marketplace protège votre achat jusqu'à résolution du problème.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Returns;

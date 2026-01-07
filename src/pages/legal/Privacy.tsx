import React from 'react';
import { Lock, Eye } from 'lucide-react';

const Privacy: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
                </div>

                <div className="prose prose-teal max-w-none text-gray-600 space-y-6">
                    <p className="text-lg font-medium text-gray-800">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">1. Collecte des Données</h2>
                        <p>
                            Nous collectons les informations que vous nous fournissez directement (nom, email, adresse, numéro de téléphone)
                            lorsque vous créez un compte ou effectuez un achat.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">2. Utilisation des Données</h2>
                        <p>
                            Vos données sont utilisées pour :
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Traiter vos commandes et gérer votre compte.</li>
                            <li>Améliorer nos services et personnaliser votre expérience.</li>
                            <li>Communiquer avec vous concernant vos transactions ou nos offres.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">3. Partage des Données</h2>
                        <p>
                            Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos données avec des tiers de confiance
                            (transporteurs, processeurs de paiement) uniquement dans le but de fournir nos services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">4. Sécurité</h2>
                        <p>
                            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre
                            l'accès non autorisé, la modification ou la perte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 block">5. Vos Droits</h2>
                        <p>
                            Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression
                            de vos données personnelles. Vous pouvez exercer ces droits en nous contactant.
                        </p>
                    </section>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                        <Eye className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                        <p className="text-sm">
                            Pour exercer vos droits relatifs à vos données, contactez notre DPO à <a href="mailto:privacy@nelo.cg" className="text-teal-600 hover:underline">privacy@nelo.cg</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;

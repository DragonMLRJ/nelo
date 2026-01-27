import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

const ShipmentPolicy: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Scale className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-outfit">Politique de Preuve d'Envoi et de Réception</h1>
                            <p className="text-teal-100 mt-1">Conditions Générales - Protection Acheteur & Vendeur</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Article 1 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 1 - Obligations du Vendeur</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-teal-500">
                                <p className="font-bold mb-2">1.1 Délai de Soumission</p>
                                <p>Le vendeur s'engage à fournir une preuve d'envoi valide dans les <strong>48 heures</strong> suivant la confirmation du paiement.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-teal-500">
                                <p className="font-bold mb-2">1.2 Preuves Acceptées</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Photo du colis avec étiquette d'expédition visible</li>
                                    <li>Numéro de suivi fourni par un transporteur reconnu (DHL, FedEx, UPS, Poste Congolaise, etc.)</li>
                                    <li>Reçu d'expédition daté et signé par le transporteur</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-teal-500">
                                <p className="font-bold mb-2">1.3 Responsabilités</p>
                                <p>Le vendeur est responsable de l'emballage sécurisé et de l'expédition dans les délais convenus. Tout retard doit être communiqué à l'acheteur.</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-yellow-900 mb-1">Avertissement</p>
                                    <p className="text-yellow-800 text-sm">Sans preuve d'envoi valide, le paiement ne sera pas libéré et la commande sera annulée avec remboursement intégral de l'acheteur.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Article 2 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 2 - Obligations de l'Acheteur</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
                                <p className="font-bold mb-2">2.1 Confirmation de Réception</p>
                                <p>L'acheteur doit confirmer la réception dans les <strong>7 jours</strong> suivant la livraison indiquée par le transporteur.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
                                <p className="font-bold mb-2">2.2 Preuves de Réception Acceptées</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Photo du produit reçu</li>
                                    <li>Signature de réception (si applicable)</li>
                                    <li>Confirmation de livraison du transporteur</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
                                <p className="font-bold mb-2">2.3 Signalement de Problèmes</p>
                                <p>En cas de non-réception, produit endommagé ou non-conforme, l'acheteur doit signaler le problème dans les <strong>48 heures</strong> suivant la livraison.</p>
                            </div>
                        </div>
                    </section>

                    {/* Article 3 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 3 - Protection Acheteur</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">3.1 Rétention du Paiement</p>
                                <p>Le paiement est retenu par NELO jusqu'à confirmation de réception par l'acheteur ou validation automatique après 14 jours.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">3.2 Médiation en Cas de Litige</p>
                                <p>En cas de litige, NELO agit comme médiateur neutre et peut demander des preuves supplémentaires aux deux parties.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">3.3 Remboursement</p>
                                <p>Si le vendeur ne fournit pas de preuve d'envoi valide dans les délais, l'acheteur est <strong>remboursé intégralement</strong> sous 48 heures.</p>
                            </div>
                        </div>
                    </section>

                    {/* Article 4 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 4 - Protection Vendeur</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-purple-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">4.1 Protection Contre la Fraude</p>
                                <p>Une fois la preuve d'envoi validée, le vendeur est protégé contre les réclamations frauduleuses de non-réception.</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">4.2 Validation Automatique</p>
                                <p>Si l'acheteur ne confirme pas la réception et ne signale aucun problème dans les <strong>14 jours</strong>, la commande est automatiquement validée.</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">4.3 Transfert du Paiement</p>
                                <p>Le vendeur reçoit son paiement dans les <strong>48 heures</strong> suivant la validation de la transaction (manuelle ou automatique).</p>
                            </div>
                        </div>
                    </section>

                    {/* Article 5 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 5 - Responsabilités et Limitations</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">5.1 Responsabilité de NELO</p>
                                <p>NELO n'est pas responsable des pertes, dommages ou retards pendant le transport. La plateforme agit uniquement comme intermédiaire de confiance.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">5.2 Assurance Recommandée</p>
                                <p>Les utilisateurs doivent souscrire une assurance auprès du transporteur pour les envois de valeur élevée (&gt;100,000 XAF).</p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                                <p className="font-bold text-red-900 mb-2">5.3 Sanctions pour Fraude</p>
                                <p className="text-red-800">Toute fraude détectée (fausse preuve, réclamation frauduleuse) entraîne la <strong>suspension immédiate et définitive</strong> du compte et des poursuites légales.</p>
                            </div>
                        </div>
                    </section>

                    {/* Article 6 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Scale className="w-5 h-5 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Article 6 - Résolution de Litiges</h2>
                        </div>

                        <div className="space-y-4 ml-13 text-gray-700">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">6.1 Résolution Amiable</p>
                                <p>En cas de désaccord, les parties doivent d'abord tenter une résolution amiable via la messagerie NELO.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">6.2 Preuves Supplémentaires</p>
                                <p>NELO se réserve le droit de demander des preuves supplémentaires (photos, documents, témoignages) pour résoudre un litige.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold mb-2">6.3 Décision Finale</p>
                                <p>La décision finale de NELO, basée sur les preuves fournies, est <strong>contraignante</strong> pour les deux parties.</p>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-100 mt-8">
                        <p className="text-sm text-gray-700">
                            <strong>Date d'entrée en vigueur:</strong> 26 Janvier 2026<br />
                            <strong>Dernière mise à jour:</strong> 26 Janvier 2026<br />
                            <strong>Contact:</strong> support@nelo.cg
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                            En utilisant la plateforme NELO, vous acceptez ces conditions générales. NELO se réserve le droit de modifier cette politique à tout moment. Les utilisateurs seront notifiés des changements importants.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentPolicy;

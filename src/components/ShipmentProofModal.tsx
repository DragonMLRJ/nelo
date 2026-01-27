import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Package, FileText, Check, AlertCircle } from 'lucide-react';
import { ShipmentProof } from '../types';

interface ShipmentProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    proofType: 'shipment' | 'delivery';
    onSubmit: (proof: Partial<ShipmentProof>) => Promise<void>;
}

const CARRIERS = [
    'DHL Express',
    'FedEx',
    'UPS',
    'Poste Congolaise',
    'Chronopost',
    'TNT',
    'Autre'
];

const ShipmentProofModal: React.FC<ShipmentProofModalProps> = ({
    isOpen,
    onClose,
    orderId,
    proofType,
    onSubmit
}) => {
    const [proofMethod, setProofMethod] = useState<'photo' | 'tracking_number' | 'signature' | 'receipt'>('photo');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Le fichier ne doit pas dépasser 5 MB');
                return;
            }

            // Validate file type
            if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
                setError('Seules les images et les PDF sont acceptés');
                return;
            }

            setFile(selectedFile);
            setError('');

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (proofMethod === 'tracking_number' && !trackingNumber.trim()) {
            setError('Veuillez entrer un numéro de suivi');
            return;
        }

        if ((proofMethod === 'photo' || proofMethod === 'receipt') && !file) {
            setError('Veuillez télécharger un fichier');
            return;
        }

        setSubmitting(true);

        try {
            // In a real implementation, upload file to storage first
            let fileUrl = '';
            if (file) {
                // TODO: Upload to Supabase Storage or similar
                // fileUrl = await uploadFile(file);
                fileUrl = URL.createObjectURL(file); // Temporary for demo
            }

            const proofData: Partial<ShipmentProof> = {
                order_id: orderId,
                proof_type: proofType,
                proof_method: proofMethod,
                proof_data: {
                    tracking_number: trackingNumber,
                    carrier: carrier,
                    description: notes
                },
                file_url: fileUrl,
                notes: notes
            };

            await onSubmit(proofData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la soumission');
        } finally {
            setSubmitting(false);
        }
    };

    const isShipment = proofType === 'shipment';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isShipment ? (
                                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                            <Package className="w-6 h-6 text-teal-600" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check className="w-6 h-6 text-green-600" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 font-outfit">
                                            {isShipment ? 'Preuve d\'Expédition / Disponibilité' : 'Confirmation de Réception'}
                                        </h3>
                                        <p className="text-sm text-gray-500">Commande #{orderId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Legal Notice */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">
                                        {isShipment ? 'Information Vendeur' : 'Information Acheteur'}
                                    </p>
                                    <p>
                                        {isShipment
                                            ? 'Veuillez fournir une photo du colis ou une preuve de disponibilité (ex: produit emballé).'
                                            : 'Confirmez la réception avec une photo du produit reçu pour débloquer le paiement.'}
                                    </p>
                                </div>
                            </div>

                            {/* Proof Method Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Type de Preuve *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setProofMethod('photo')}
                                        className={`p-4 border-2 rounded-xl transition-all ${proofMethod === 'photo'
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Camera className={`w-6 h-6 mx-auto mb-2 ${proofMethod === 'photo' ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <p className="text-sm font-medium">{isShipment ? 'Photo (Disponibilité)' : 'Photo (Réception)'}</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProofMethod('tracking_number')}
                                        className={`p-4 border-2 rounded-xl transition-all ${proofMethod === 'tracking_number'
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FileText className={`w-6 h-6 mx-auto mb-2 ${proofMethod === 'tracking_number' ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <p className="text-sm font-medium">Numéro de Suivi</p>
                                    </button>
                                </div>
                            </div>

                            {/* Tracking Number Input */}
                            {proofMethod === 'tracking_number' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Numéro de Suivi *
                                        </label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="Ex: 1234567890"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Transporteur
                                        </label>
                                        <select
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        >
                                            <option value="">Sélectionner un transporteur</option>
                                            {CARRIERS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            {(proofMethod === 'photo' || proofMethod === 'receipt') && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Télécharger une Photo/Document *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            {filePreview ? (
                                                <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-3" />
                                            ) : (
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            )}
                                            <p className="text-sm font-medium text-gray-700">
                                                {file ? file.name : 'Cliquez pour télécharger'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, PDF (max 5MB)
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Notes Additionnelles
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ajoutez des informations supplémentaires..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Envoi en cours...' : 'Soumettre la Preuve'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShipmentProofModal;

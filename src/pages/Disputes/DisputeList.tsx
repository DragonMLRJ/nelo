import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Dispute {
    id: string;
    order_id: string;
    product_name: string;
    reason: string;
    status: string;
    created_at: string;
}

const DisputeList: React.FC = () => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            // Assuming you have an API helper, using fetch for simplicity
            // Replace with your actual API Client logic (e.g. including Bearer Token)
            // For this example I assume cookies/auth is handled or global fetch wrapper
            const response = await fetch('/api/disputes/index.php'); // default action is list
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setDisputes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Dispute Resolution Center</h1>

            {loading ? (
                <div>Loading disputes...</div>
            ) : disputes.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-500">No active disputes.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {disputes.map((dispute) => (
                        <div key={dispute.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${dispute.status === 'open' ? 'bg-green-100 text-green-800' :
                                            dispute.status === 'resolved_refund' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {dispute.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <h3 className="font-semibold">{dispute.product_name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Order #{dispute.order_id.substring(0, 8)}... • Reason: {dispute.reason}</p>
                                <p className="text-xs text-gray-400 mt-1">Opened on {new Date(dispute.created_at).toLocaleDateString()}</p>
                            </div>

                            <Link to={`/disputes/${dispute.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DisputeList;

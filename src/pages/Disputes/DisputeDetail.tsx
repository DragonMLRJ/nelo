import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface DisputeDetailProps {
    // If needed
}

const DisputeDetail: React.FC<DisputeDetailProps> = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dispute, setDispute] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchDisputeDetails();
    }, [id]);

    const fetchDisputeDetails = async () => {
        try {
            const res = await fetch(`/api/disputes/index.php?action=detail&id=${id}`);
            if (!res.ok) throw new Error('Error fetching details');
            const data = await res.json();
            setDispute(data.dispute);
            setMessages(data.messages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(`/api/disputes/index.php?action=message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dispute_id: id, message: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                fetchDisputeDetails(); // Refresh
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!dispute) return <div>Dispute not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate('/disputes')} className="mb-4 text-indigo-600 hover:underline">
                &larr; Back to Disputes
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    {/* Chat Area */}
                    <div className="bg-white rounded-lg shadow p-4 h-[500px] flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 p-2">
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender_id === dispute.created_by ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender_id === dispute.created_by ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        <p className="text-sm font-bold mb-1">{msg.sender_name}</p>
                                        <p>{msg.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-4 border-t pt-4 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border rounded px-3 py-2"
                                placeholder="Type a message..."
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                Send
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Sidebar Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold mb-4">Case Details</h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Reason:</span> {dispute.reason}</p>
                            <p><span className="font-semibold">Status:</span> {dispute.status}</p>
                            <p><span className="font-semibold">Order ID:</span> {dispute.order_id}</p>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-bold mb-2">Actions</h3>
                            {/* Actions based on role would go here */}
                            <button className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded mb-2">Escalate to Admin</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeDetail;

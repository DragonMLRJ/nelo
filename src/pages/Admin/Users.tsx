import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, CheckCircle, XCircle, MoreHorizontal, UserCheck } from 'lucide-react';

interface Profile {
    id: string;
    email: string; // Likely missing from 'profiles' table if it only has public data, but we can try fetching or joining.
    // Actually, profiles usually don't have email in Supabase auth system unless copied.
    // We'll trust the 'full_name' or similar fields.
    full_name: string;
    avatar_url: string;
    created_at: string;
    is_seller: boolean; // Assuming we might want to flag this
    kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setUsers(data as Profile[]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (userId: string) => {
        if (!confirm('Voulez-vous vérifier cet utilisateur en tant que Vendeur ?')) return;

        try {
            // Update KYC status to verified
            const { error } = await supabase
                .from('profiles')
                .update({ kyc_status: 'verified' })
                .eq('id', userId);

            if (error) throw error;

            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, kyc_status: 'verified' } : u));
        } catch (error) {
            alert('Erreur lors de la vérification');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => import('../../utils/exportUtils').then(m => m.exportToCSV(users, 'nelo_users'))}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Search className="w-4 h-4 transform rotate-90" /> Export CSV
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut KYC</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date d'inscription</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Chargement...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.full_name?.[0]?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.full_name || 'Sans Nom'}</div>
                                                <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                                                user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {user.kyc_status === 'verified' ? <CheckCircle className="w-3 h-3" /> :
                                                user.kyc_status === 'pending' ? <UserCheck className="w-3 h-3" /> :
                                                    <XCircle className="w-3 h-3" />}
                                            {user.kyc_status === 'verified' ? 'Vérifié' :
                                                user.kyc_status === 'pending' ? 'En Attente' : 'Non Vérifié'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.kyc_status !== 'verified' && (
                                            <button
                                                onClick={() => handleVerifyUser(user.id)}
                                                className="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
                                            >
                                                Approuver Vendeur
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;

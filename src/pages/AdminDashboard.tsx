import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Activity, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Security check: Only allow admins
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Sales', value: '$45.2k', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Active Ads', value: '856', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
    { label: 'Reports', value: '12', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  ];

  const recentUsers = [
    { name: 'Sarah M.', email: 'sarah.m@example.com', date: '2 mins ago', status: 'Active' },
    { name: 'Jean K.', email: 'jeank@example.com', date: '15 mins ago', status: 'Pending' },
    { name: 'Paul B.', email: 'paul.b@example.com', date: '1 hour ago', status: 'Active' },
    { name: 'Marie L.', email: 'marie.l@example.com', date: '3 hours ago', status: 'Active' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Welcome back, {user.name}. Here is what's happening on Nelo today.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Recent Registrations</h3>
              <button className="text-teal-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{u.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / System Health */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4">System Health</h3>
                <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-600">Server Load</span>
                       <span className="text-green-600 font-bold">12%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-600">Database</span>
                       <span className="text-teal-600 font-bold">Good</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div className="bg-teal-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                     </div>
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-xl shadow-md text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 opacity-80" />
                  <h3 className="font-bold text-lg">Growth Insight</h3>
                </div>
                <p className="text-teal-100 text-sm mb-4">New user registrations are up by <span className="font-bold text-white">24%</span> compared to last week.</p>
                <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-sm font-bold transition-colors">
                  View Analytics Report
                </button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
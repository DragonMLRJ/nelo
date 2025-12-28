import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  Trash2,
  Pin,
  User as UserIcon,
  Search,
  PlusCircle,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

interface Topic {
  id: string;
  title: string;
  author: string;
  avatar: string;
  date: string;
  replies: number;
  likes: number;
  isPinned?: boolean;
  category: 'General' | 'Buying' | 'Selling' | 'Support';
}

const INITIAL_TOPICS: Topic[] = [
  {
    id: '1',
    title: 'Welcome to the Nelo Community! Read this first.',
    author: 'Challenge Codeur',
    avatar: 'https://ui-avatars.com/api/?name=Challenge+Codeur&background=0D9488&color=fff',
    date: '2 days ago',
    replies: 45,
    likes: 120,
    isPinned: true,
    category: 'General'
  },
  {
    id: '2',
    title: 'Tips for taking better photos of your clothes',
    author: 'Marie K.',
    avatar: 'https://picsum.photos/50/50?random=1',
    date: '4 hours ago',
    replies: 12,
    likes: 34,
    category: 'Selling'
  },
  {
    id: '3',
    title: 'How do I track my order?',
    author: 'Jean D.',
    avatar: 'https://picsum.photos/50/50?random=3',
    date: '1 day ago',
    replies: 3,
    likes: 5,
    category: 'Support'
  },
  {
    id: '4',
    title: 'Best places to meet for local pickup in Brazzaville',
    author: 'Sarah M.',
    avatar: 'https://picsum.photos/50/50?random=4',
    date: '3 days ago',
    replies: 28,
    likes: 56,
    category: 'Buying'
  }
];

const Forum: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [filter, setFilter] = useState('All');
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setTopicToDelete(id);
  };

  const confirmDelete = () => {
    if (topicToDelete) {
      setTopics(prev => prev.filter(t => t.id !== topicToDelete));
      setTopicToDelete(null);
    }
  };

  const handlePin = (id: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) return { ...t, isPinned: !t.isPinned };
      return t;
    }));
  };

  const filteredTopics = filter === 'All' ? topics : topics.filter(t => t.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      {/* Forum Header */}
      <div className="bg-teal-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Nelo Community Forum</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">Connect with other buyers and sellers, share tips, and get help from the community.</p>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-4 focus:ring-teal-500/30"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              {user ? (
                <button className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors mb-6 shadow-sm">
                  <PlusCircle className="w-5 h-5" /> New Topic
                </button>
              ) : (
                <Link to="/login?redirect=/forum" className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors mb-6 shadow-sm">
                  Login to Post
                </Link>
              )}

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
              <nav className="space-y-1">
                {['All', 'General', 'Buying', 'Selling', 'Support'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>

              {user?.isForumManager && (
                <div className="mt-6 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <h4 className="text-orange-800 font-bold text-sm mb-1">Manager Mode</h4>
                  <p className="text-orange-600 text-xs">You have privileges to manage content.</p>
                </div>
              )}
            </div>
          </div>

          {/* Feed */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {filteredTopics.map((topic, idx) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-xl p-6 border transition-shadow hover:shadow-md ${topic.isPinned ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img src={topic.avatar} alt={topic.author} className="w-10 h-10 rounded-full border border-gray-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {topic.isPinned && (
                              <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{topic.category}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-teal-600 cursor-pointer">{topic.title}</h3>
                        </div>

                        {/* Manager Actions */}
                        {user?.isForumManager && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handlePin(topic.id)}
                              className={`p-1.5 rounded hover:bg-gray-100 ${topic.isPinned ? 'text-teal-600' : 'text-gray-400'}`}
                              title={topic.isPinned ? "Unpin" : "Pin"}
                            >
                              <Pin className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(topic.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          By <span className="font-medium text-gray-700">{topic.author}</span>
                        </span>
                        <span>•</span>
                        <span>{topic.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100/50">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" /> {topic.likes}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
                      <MessageCircle className="w-4 h-4" /> {topic.replies} Replies
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTopics.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900">No topics found</h3>
                <p className="text-gray-500 text-sm">Be the first to post in this category!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Topic?"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </motion.div>
  );
};

export default Forum;
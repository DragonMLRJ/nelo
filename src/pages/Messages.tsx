import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MoreVertical, Image as ImageIcon, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Conversation } from '../types';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, sendMessage, markAsRead } = useChat();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cidParam = searchParams.get('cid');

  const [activeConversationId, setActiveConversationId] = useState<string | null>(cidParam);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Ref for File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with URL param
  useEffect(() => {
    setActiveConversationId(cidParam);
    if (cidParam) {
      markAsRead(cidParam);
    }
  }, [cidParam, conversations]); // Depend on conversations to refresh if new msgs come in

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Please log in to view messages</h2>
        <button onClick={() => navigate('/login?redirect=/messages')} className="text-teal-600 font-bold underline">Login</button>
      </div>
    );
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isMobileDetailView = !!activeConversationId;

  const handleConversationClick = (id: string) => {
    navigate(`/messages?cid=${id}`);
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, newMessage);
    setNewMessage('');
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // TODO: Replace with Supabase Storage upload
      console.warn('File upload not implemented yet on Vercel');
      // Mock success for now or fail gracefully
      const response = { json: async () => ({ success: false, message: 'Upload disabled in Vercel demo', url: '', type: '' }) };
      const data = await response.json();

      if (data.success) {
        sendMessage(activeConversationId, '', data.url, data.type);
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Implement Supabase search
      console.warn('Search not implemented yet on Vercel');
      const response = { json: async () => ({ success: true, results: [] }) };
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex">

        {/* Conversations List (Sidebar) */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-100 ${isMobileDetailView ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setIsSearching(false);
                }}
                className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No results found.</div>
              ) : (
                <ul>
                  {searchResults.map(result => (
                    <li key={result.id}>
                      <button
                        onClick={() => {
                          handleConversationClick(result.conversationId);
                          // Optional: Scroll to message logic would go here
                        }}
                        className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-50"
                      >
                        <div className="flex justify-between">
                          <span className="font-bold text-sm text-gray-900">{result.otherUserName}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(result.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">"{result.text}"</p>
                        {result.productTitle && <p className="text-[10px] text-teal-600 mt-1">{result.productTitle}</p>}
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No messages yet.</p>
                  <p className="text-sm mt-2">Start a conversation from a product page!</p>
                </div>
              ) : (
                <ul>
                  {conversations.map(conv => {
                    const otherUser = conv.participants.find(p => p.id !== user.id) || conv.participants[0];
                    const isActive = conv.id === activeConversationId;

                    return (
                      <li key={conv.id}>
                        <button
                          onClick={() => handleConversationClick(conv.id)}
                          className={`w-full text-left p-4 flex gap-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-teal-50 border-r-4 border-teal-600' : ''}`}
                        >
                          <div className="relative">
                            <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                            {conv.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{otherUser.name}</span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(conv.lastMessageAt)}</span>
                            </div>

                            {conv.productName && (
                              <p className="text-xs text-teal-600 font-medium mb-1 truncate">{conv.productName}</p>
                            )}

                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                              {conv.messages[conv.messages.length - 1]?.text || 'Started a conversation'}
                            </p>
                          </div>

                          {conv.productImage && (
                            <img src={conv.productImage} alt="" className="w-12 h-12 rounded object-cover ml-1 bg-gray-100 hidden sm:block" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        </div>

        {/* Chat Window (Main) */}
        <div className={`flex-1 flex flex-col bg-white ${!isMobileDetailView ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3 md:p-4 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={handleBack} className="md:hidden text-gray-500 p-1">
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  {(() => {
                    const otherUser = activeConversation.participants.find(p => p.id !== user.id) || activeConversation.participants[0];
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 leading-tight">{otherUser.name}</h2>
                          {activeConversation.productName && (
                            <p className="text-xs text-gray-500">Regarding: {activeConversation.productName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {activeConversation.messages.map((msg, index) => {
                  const isMe = msg.senderId === user.id;
                  const showTime = index === activeConversation.messages.length - 1 || activeConversation.messages[index + 1]?.senderId !== msg.senderId;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm relative ${isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                          {msg.attachmentUrl && (
                            <div className="mb-2">
                              {msg.attachmentType === 'image' ? (
                                <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full rounded-lg" />
                              ) : (
                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                                  📄 Document
                                </a>
                              )}
                            </div>
                          )}
                          {msg.text}
                        </div>
                        {showTime && (
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-teal-500 rounded-full px-4 py-3 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-full text-white transition-all ${newMessage.trim() ? 'bg-teal-600 hover:bg-teal-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8">
              <MessageCircle className="w-24 h-24 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-400">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
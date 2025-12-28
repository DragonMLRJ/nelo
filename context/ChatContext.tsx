import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Conversation, Message, User, Product } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string, attachmentUrl?: string, attachmentType?: string) => void;
  createConversation: (participant: User, product?: Product) => string;
  markAsRead: (conversationId: string) => void;
  getConversationById: (id: string) => Conversation | undefined;
  unreadTotal: number;
  loading: boolean;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_BASE = '/api';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate global unread count
  const unreadTotal = conversations.reduce((acc, conv) => {
    return acc + conv.unreadCount;
  }, 0);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/messages/index.php?action=conversations&userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success && data.conversations) {
        // Load messages for each conversation
        const conversationsWithMessages = await Promise.all(
          data.conversations.map(async (conv: any) => {
            const messagesResponse = await fetch(
              `${API_BASE}/messages/index.php?action=messages&conversation_id=${conv.id}&userId=${user.id}`
            );
            const messagesData = await messagesResponse.json();

            return {
              ...conv,
              messages: messagesData.success ? messagesData.messages : [],
              lastMessageAt: new Date(conv.lastMessageAt)
            };
          })
        );

        setConversations(conversationsWithMessages);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling for notifications
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/notifications/index.php?action=poll&userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          // If unread count differs from our local count, refresh
          // Note: This is an approximation. Ideally we check a 'last_updated' timestamp.
          // But for now, if server says X and we have Y, fetch.
          // Problem: sending a message updates local immediately, but server might be slightly behind or ahead?
          // Actually, if I send a message, unread count shouldn't change (my message is read).
          // If I receive one, unread count increases.

          // Simple check: Just reload every 15s to be safe? Or checking count.
          // Checking count is better.

          // Since we can't easily access the latest derived 'unreadTotal' inside the interval closure 
          // without adding it to dependency (which resets interval), we might need a ref or functional update.
          // For MVP, simply refreshing every 10s is safer logic than complex state comparison, 
          // though less efficient.
          // Let's call loadConversations() silently (without setLoading true everywhere?)

          // Actually, let's just do it.
          loadConversationsSilent();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [user]); // Removed other dependencies to avoid reset

  const loadConversationsSilent = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/messages/index.php?action=conversations&userId=${user.id}`);
      const data = await response.json();

      if (data.success && data.conversations) {
        // Same logic as loadConversations but doesn't set global loading state
        // to avoid UI flicker
        const conversationsWithMessages = await Promise.all(
          data.conversations.map(async (conv: any) => {
            const messagesResponse = await fetch(
              `${API_BASE}/messages/index.php?action=messages&conversation_id=${conv.id}&userId=${user.id}`
            );
            const messagesData = await messagesResponse.json();

            return {
              ...conv,
              messages: messagesData.success ? messagesData.messages : [],
              lastMessageAt: new Date(conv.lastMessageAt)
            };
          })
        );
        setConversations(conversationsWithMessages);
      }
    } catch (e) {
      // ignore silent errors
    }
  };

  const sendMessage = async (conversationId: string, text: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!user) return;

    // Parse conversation ID to get receiver
    const parts = conversationId.split('_');
    const user1 = parts[0];
    const user2 = parts[1];
    const productId = parts[2] || null;

    const receiverId = user1 === user.id ? user2 : user1;

    try {
      const response = await fetch(`${API_BASE}/messages/index.php?action=send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: receiverId,
          content: text,
          productId: productId,
          attachmentUrl: attachmentUrl,
          attachmentType: attachmentType
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        // Update local state
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, data.message],
              lastMessageAt: new Date()
            };
          }
          return conv;
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const createConversation = (participant: User, product?: Product): string => {
    if (!user) return '';

    // Check if conversation already exists
    const existing = conversations.find(c => {
      const hasParticipant = c.participants.some(p => p.id === participant.id);
      if (product) {
        return hasParticipant && c.productId === product.id;
      } else {
        return hasParticipant && !c.productId;
      }
    });

    if (existing) return existing.id;

    // Create conversation ID
    const convId = [user.id, participant.id].sort().join('_') + (product ? `_${product.id}` : '');

    // Create new conversation locally
    const newConv: Conversation = {
      id: convId,
      participants: [participant, user],
      productId: product?.id,
      productName: product?.title,
      productImage: product?.image,
      messages: [],
      lastMessageAt: new Date(),
      unreadCount: 0
    };

    setConversations(prev => [newConv, ...prev]);

    // Send to backend
    fetch(`${API_BASE}/messages/index.php?action=create_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        otherUserId: participant.id,
        productId: product?.id
      }),
    }).catch(error => {
      console.error('Failed to create conversation on server:', error);
    });

    return convId;
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await fetch(`${API_BASE}/messages/index.php?action=mark_read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationId,
          userId: user.id
        }),
      });

      // Update local state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map(m => ({ ...m, isRead: true }))
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getConversationById = (id: string) => {
    return conversations.find(c => c.id === id);
  };

  const refreshConversations = () => {
    loadConversations();
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      sendMessage,
      createConversation,
      markAsRead,
      getConversationById,
      unreadTotal,
      loading,
      refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};